# CTR & Cloudflare Edge Caching Setup Guide

Welcome to the **Offerzonline Ad Server Architecture Guide**. This document explains the concept of **CTR (Click-Through Rate)** and details the step-by-step configuration required to connect **Cloudflare's Edge Caching & Cache Purge system** to your dashboard.

---

## 1. What is CTR (Click-Through Rate)?

**Click-Through Rate (CTR)** is the core performance metric used in advertising to measure how effectively a campaign attracts engagement from users who view it.

### The Formula
$$
\text{CTR (\%)} = \left( \frac{\text{Total Clicks}}{\text{Total Impressions}} \right) \times 100
$$

### Example Scenario
- If your ad is displayed to users **1,000 times** (1,000 Impressions)
- And users click on the ad **40 times** (40 Clicks)
- Your CTR is:
  $$
  \left( \frac{40}{1,000} \right) \times 100 = 4.00\%
  </td>
  $$

### Why it Matters for Offerzonline
- **Relevance Indicator:** A high CTR means your local promotions (e.g. food discounts, event vouchers) are highly relevant to users within that geographical radius.
- **Priority Weights:** Advertisements with a high CTR can be configured to show more frequently by raising their targeting priority.

---

## 2. Cloudflare Edge Caching Integration

To ensure near-instantaneous load times for users across the globe, Offerzonline serves geo-targeted ads from **Cloudflare's Edge Cache network**.

### How Caching & Purging Works in Offerzonline
1. **Deliveries:** When users open the app, their browser requests nearby ads. Instead of querying the database directly every time, Cloudflare intercepts the request and serves the cached response from the nearest edge datacenter (under 10ms).
2. **Purging on Changes:** When you create, edit, or deactivate an ad in the **Admin Control Panel**, the server automatically makes a secure background API call to Cloudflare to **purge (invalidate) the cache** for that route immediately. This ensures that deactivated or deleted promotions disappear from user screens instantly.

---

## 3. Step-by-Step Cloudflare Setup

To connect Cloudflare caching to your dashboard, configure your account credentials inside your server configuration.

### Step 1: Obtain Cloudflare Credentials
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Select your domain zone (e.g. `offerzonline.com`).
3. On the right-side summary column of the Overview tab, locate and copy your **Zone ID** and **Account ID**.
4. Go to **My Profile > API Tokens > Create Token**.
5. Select the **Clear Cache** template (or create a custom token with `Zone.Cache Purge` edit permissions). Copy the generated token.

### Step 2: Configure Environment Variables
Open your codebase's local environment config file:
[**`.env.local`**](file:///c:/Users/DELL/Documents/Project/Offerzonline/.env.local)

Add the copied credentials:
```env
# Cloudflare Credentials for API Cache Purge
CLOUDFLARE_ZONE_ID="your_zone_id_here"
CLOUDFLARE_API_TOKEN="your_api_token_here"
```

### Step 3: Setup Cache Rules in Cloudflare Dashboard
To tell Cloudflare *what* to cache at the edge:
1. Go to **Caching > Cache Rules** in the Cloudflare sidebar.
2. Click **Create Rule**.
3. Define the matching criteria:
   - Field: `URI Path`
   - Operator: `starts with`
   - Value: `/api/ads` (the endpoint that users fetch ads from)
4. Under **Cache eligibility**, select **Eligible for cache**.
5. Click **Deploy**.

*Now, ad requests will be cached at the edge, and the Admin Panel will trigger a purge event on `/api/ads` endpoints automatically whenever you add or deactivate campaigns!*

---

## 4. Live API Health & Instant Campaign Verification (No Build Needed)

You can verify whether live campaigns from PostgreSQL are being served without needing to rebuild Docker:

### Base URL Configuration
In your `.env` or `.env.local`:
```env
# Production or Local Base URL
NEXT_PUBLIC_SITE_URL="https://offerzonline.com"
```

### Direct Browser / Postman / cURL Test Endpoints
Replace `https://offerzonline.com` with your current deployment URL:

1. **Verify Live Public Ads JSON:**
   ```
   https://offerzonline.com/api/ads/serve
   ```
   *Expected response:*
   ```json
   {
     "ads": [
       {
         "id": 1,
         "title": "Your Active Campaign Title",
         "is_active": true
       }
     ]
   }
   ```

2. **Verify Admin Analytics & Today (IST) Counts:**
   ```
   https://offerzonline.com/api/admin/analytics?timeframe=today
   ```

3. **Database Health Check & Auto-Table Sync:**
   ```
   https://offerzonline.com/api/admin/restore
   ```

---

## 5. Deployment Commands

### Standard Update (When Code Changes)
```bash
git pull
docker compose build app
docker compose up -d app


git pull
docker compose restart app
docker compose up -d app