--
-- PostgreSQL database dump
--


-- Dumped from database version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.analytics_logs DROP CONSTRAINT IF EXISTS analytics_logs_ad_id_fkey;
ALTER TABLE IF EXISTS ONLY public.analytics_logs DROP CONSTRAINT IF EXISTS analytics_logs_ad_id_ads_id_fk;
ALTER TABLE IF EXISTS ONLY public.ads DROP CONSTRAINT IF EXISTS ads_category_id_categories_id_fk;
ALTER TABLE IF EXISTS ONLY public.site_settings DROP CONSTRAINT IF EXISTS site_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.site_settings DROP CONSTRAINT IF EXISTS site_settings_key_key;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_slug_unique;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.analytics_logs DROP CONSTRAINT IF EXISTS analytics_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.ads DROP CONSTRAINT IF EXISTS ads_pkey;
ALTER TABLE IF EXISTS public.site_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.analytics_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.ads ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.site_settings_id_seq;
DROP TABLE IF EXISTS public.site_settings;
DROP SEQUENCE IF EXISTS public.categories_id_seq;
DROP TABLE IF EXISTS public.categories;
DROP SEQUENCE IF EXISTS public.analytics_logs_id_seq;
DROP TABLE IF EXISTS public.analytics_logs;
DROP SEQUENCE IF EXISTS public.ads_id_seq;
DROP TABLE IF EXISTS public.ads;
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ads (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    category_id integer,
    media_url text NOT NULL,
    media_type character varying(50) NOT NULL,
    ad_format character varying(50) NOT NULL,
    target_url text NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    radius_km integer DEFAULT 5 NOT NULL,
    weight_priority integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    description text,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    store_name text,
    store_logo text,
    store_phone character varying(50),
    store_address text,
    original_price character varying(50),
    promo_price character varying(50),
    discount_value character varying(100),
    terms text,
    is_onload_popup boolean DEFAULT false,
    is_recommended boolean DEFAULT false,
    uuid character varying(36) DEFAULT (gen_random_uuid())::text NOT NULL
);


ALTER TABLE public.ads OWNER TO postgres;

--
-- Name: ads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ads_id_seq OWNER TO postgres;

--
-- Name: ads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ads_id_seq OWNED BY public.ads.id;


--
-- Name: analytics_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analytics_logs (
    id integer NOT NULL,
    ad_id integer,
    event_type character varying(20) NOT NULL,
    referrer_domain character varying(255),
    user_ip character varying(100),
    user_location_name character varying(255),
    "timestamp" timestamp without time zone DEFAULT now(),
    page_path character varying(255),
    visitor_id character varying(100),
    user_agent text
);


ALTER TABLE public.analytics_logs OWNER TO postgres;

--
-- Name: analytics_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analytics_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analytics_logs_id_seq OWNER TO postgres;

--
-- Name: analytics_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.analytics_logs_id_seq OWNED BY public.analytics_logs.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    icon text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.site_settings OWNER TO postgres;

--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.site_settings_id_seq OWNER TO postgres;

--
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- Name: ads id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ads ALTER COLUMN id SET DEFAULT nextval('public.ads_id_seq'::regclass);


--
-- Name: analytics_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_logs ALTER COLUMN id SET DEFAULT nextval('public.analytics_logs_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- Data for Name: ads; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.ads VALUES (12, 'Sumam Clothing For Her: Celebrate Onam in Style & Tradition', 2, '/api/uploads/ads/1786898527900-29dfkt.webp', 'image', 'responsive', 'mailto:info.sumam@gmail.com', NULL, NULL, 5000, 10, true, 'Celebrate Onam in Style & Tradition with Sumam - Clothing For Her. Grace. Tradition. New Beginnings. Explore our premium Office Wear and Casual Wear women''s ethnic kurtis. Premium Quality, Comfort Meets Style, Versatile Everyday Fashion & Pan-India Shipping!', '2026-09-30 00:00:00', '2026-08-16 16:38:18.726874', '2026-08-19 08:09:10.642507', 'Sumam - Clothing For Her', NULL, 'info.sumam@gmail.com', 'Kazhakkottam, Kerala / Pan-India Delivery', NULL, 'Onam Festive Special', 'Pan-India Shipping', '1. Premium Quality & Comfort Meets Style.
2. Collections include Smart Office Wear & Everyday Casual Wear.
3. Pan-India Shipping available.
4. Contact info.sumam@gmail.com for orders & inquiries.', true, false, '111fc739-6af2-43cd-a5a1-e3a921a43cdd');
INSERT INTO public.ads VALUES (10, 'Onam Special: Up to ₹250 OFF Deep Cleaning & 20% OFF Restoration', 5, '/api/uploads/ads/1786894895645-aeff0d.webp', 'image', 'responsive', 'https://instagram.com/theshoeclinic2024', 8.5680160, 76.8737370, 5000, 10, true, 'Special Onam Offer at The Shoe Clinic Kazhakkottam! Get up to ₹250 OFF on deep shoe cleaning (3 pairs - ₹100 off, 4 pairs - ₹150 off, 5+ pairs - ₹250 off) and flat 20% OFF on all restoration and recoloring services. Free pickup & delivery within 10 km radius!', '2026-08-22 00:00:00', '2026-08-16 13:41:20.223806', '2026-08-19 08:09:22.549364', 'The Shoe Clinic', NULL, '73569 29855', 'Kazhakkottam, Kerala', NULL, 'Flat 20% OFF', 'Up to ₹250 OFF', '1. 3 Pairs - Get ₹100 OFF
2. 4 Pairs - Get ₹150 OFF
3. 5 Pairs or More - Get ₹250 OFF
4. Flat 20% OFF on all Restoration & Recoloring Services.
5. Limited Period Offer valid from Aug 3rd to 22nd.
6. Free pickup and delivery within 10 KM radius.', false, false, 'f73964d7-58d2-42fe-a4b7-008e96c6ef75');
INSERT INTO public.ads VALUES (11, 'Vastra Boutique Onam Special: Ladies Wear, Jewells, Gifts & Photostat', 2, '/uploads/ads/vasthra.jpeg', 'image', 'responsive', 'tel:+919495528933', 8.5680160, 76.8737370, 5000, 9, true, 'ഈ ഓണം വസ്ത്രയോടൊപ്പം! Celebrate Onam in Style with Vastra Boutique Kazhakuttom near Jyothis Kindergarten. Explore our exclusive festive collections in Ladies Wear, beautiful Jewelry, and curated Gifts. We also provide photostat and copying services on-site.', '2026-09-15 00:00:00', '2026-08-16 15:19:50.194733', '2026-08-19 08:09:32.560087', 'Vastra Boutique', NULL, '+91 94955 28933', 'Near Jyothis Kindergarten, Kazhakuttom, Kerala', NULL, 'Onam Special', 'Exclusive Collections', '1. Offers valid on ladies wear, jewells, and gift items.
2. Store located near Jyothis Kindergarten, Kazhakuttom.
3. Photostat copying services available in-store.
4. Call +91 94955 28933 for custom sizes and booking.', false, false, '3c320852-206a-441d-bfe9-ce259b0ef40a');


--
-- Data for Name: analytics_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.analytics_logs VALUES (844, NULL, 'page_view', 'Direct', '223.188.104.106', NULL, '2026-08-18 07:08:59.398539', '/', 'vid_rru4kkiou0fmsybnivi', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (859, NULL, 'page_view', 'Direct', '157.51.241.62', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-18 11:19:33.538226', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (904, NULL, 'page_view', 'Direct', '37.59.187.20', 'Letterkenny, Ulster, IE', '2026-08-18 22:29:00.704251', '/', 'vid_msz8ioq3_08aae7e7a18f4707', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0');
INSERT INTO public.analytics_logs VALUES (916, NULL, 'page_view', 'Direct', '223.181.10.54', 'Thiruvananthapuram', '2026-08-19 05:49:16.705605', '/', 'vid_mszll4tl_6a6845fc0d234bb3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (931, NULL, 'page_view', 'Direct', '54.85.128.210', 'Ashburn, Virginia, US', '2026-08-19 09:54:26.365296', '/', 'vid_mszx05eu_668ffd5ae2b848f9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.7632.6 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (932, NULL, 'page_view', 'Direct', '54.227.206.150', 'Ashburn, Virginia, US', '2026-08-19 09:54:27.91616', '/', 'vid_mszx06oa_f4e7ff7b0ac34fe2', 'Mozilla/5.0 (Linux; Android 16; SM-S921U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.7632.6 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (945, NULL, 'page_view', 'Direct', '106.76.176.203', 'Thrissur, Kerala, IN', '2026-08-19 17:35:39.646721', '/', 'vid_mt0dhaf7_90b77c875b884b40', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (960, NULL, 'page_view', 'Direct', '188.212.136.253', 'Newark, New York, US', '2026-08-20 12:50:34.500591', '/', 'vid_mt1iqiiq_eb9d63cbdb4f4cd3', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_3_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (975, NULL, 'page_view', 'Bing', '205.169.39.19', 'Santa Clara, California, US', '2026-08-21 00:22:43.028087', '/', 'vid_mt27gm5m_854d6acac1db4e52', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.5938.132 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (986, NULL, 'page_view', 'Direct', '157.46.3.27', 'Kochi, Kerala, IN', '2026-08-22 08:21:31.590393', '/', 'vid_mt4406k6_ebf6c18782884424', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1002, NULL, 'page_view', 'Direct', '157.51.241.48', 'Thiruvananthapuram, Kerala, IN', '2026-08-23 14:32:55.50815', '/', 'vid_mt5wpoqv_5ed19bf8057f4e12', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/30.0 Chrome/143.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1013, NULL, 'page_view', 'Direct', '157.46.8.8', 'Muvattupula', '2026-08-27 10:50:27.406408', '/', 'vid_mt4406k6_ebf6c18782884424', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1025, NULL, 'page_view', 'Direct', '71.6.239.67', 'Boise, Idaho, US', '2026-09-03 04:27:49.421453', '/', 'vid_mtl0xsbh_4e76fc5ae47749f7', 'RootEvidence/1.0');
INSERT INTO public.analytics_logs VALUES (1035, NULL, 'page_view', 'Direct', '157.51.230.230', 'Thiruvananthapuram', '2026-09-10 12:02:28.992919', '/', 'vid_msz54qac_e265b41de2134659', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1036, NULL, 'page_view', 'Direct', '157.51.230.230', 'Thiruvananthapuram', '2026-09-10 12:02:33.356303', '/', 'vid_msz54qac_e265b41de2134659', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1046, NULL, 'page_view', 'Direct', '49.37.224.61', 'Thiruvananthapuram', '2026-09-13 23:05:05.169413', '/', 'vid_msz54qac_e265b41de2134659', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1056, NULL, 'page_view', 'Direct', '157.51.237.120', 'Thiruvananthapuram', '2026-09-17 13:43:30.054069', '/', 'vid_msz54qac_e265b41de2134659', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (845, NULL, 'page_view', 'Direct', '157.51.240.235', NULL, '2026-08-18 07:20:36.625733', '/', 'vid_0r2v48lexpbmsyc2h2y', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (858, NULL, 'page_view', 'Direct', '157.51.240.208', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-18 11:11:17.372675', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (905, NULL, 'page_view', 'Direct', '35.164.147.148', 'Portland, Oregon, US', '2026-08-18 22:37:25.866198', '/', 'vid_msz8tifg_e9c8c55ec0eb4e2d', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.137 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (906, NULL, 'page_view', 'Direct', '35.164.147.148', 'Portland, Oregon, US', '2026-08-18 22:37:44.604812', '/', 'vid_msz8tx2d_bfb6eccaca0944c0', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (917, NULL, 'page_view', 'ig', '223.181.10.54', 'Kochi, Kerala, IN', '2026-08-19 07:25:24.702981', '/', 'vid_mszrohzj_32630da8a83c484d', 'Mozilla/5.0 (Linux; Android 16; SM-E346B Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/151.0.7922.107 Mobile Safari/537.36 Instagram 442.0.0.46.79 Android (36/16; 450dpi; 1080x2340; samsung; SM-E346B; m34x; s5e8825; en_IN; 1037527436; IABMV/1)');
INSERT INTO public.analytics_logs VALUES (918, NULL, 'page_view', 'ig', '223.181.10.54', 'Kochi, Kerala, IN', '2026-08-19 07:25:32.673014', '/', 'vid_mszroo6c_37e8a1eeffd748b4', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (933, NULL, 'page_view', 'ig', '223.181.10.54', 'Thiruvananthapuram', '2026-08-19 09:56:48.700559', '/', 'vid_mszroo6c_37e8a1eeffd748b4', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (961, NULL, 'page_view', 'Direct', '188.119.117.179', 'Los Angeles, California, US', '2026-08-20 13:00:14.439625', '/', 'vid_mt1j2xyr_acf35a0a73634d79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_3_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/144.0.7559.95 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (976, NULL, 'page_view', 'Direct', '49.37.225.116', 'Thiruvananthapuram, Kerala, IN', '2026-08-21 11:32:51.021225', '/', 'vid_mt2vee83_6015672001d14242', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (987, NULL, 'page_view', 'Direct', '54.224.58.3', 'Ashburn, Virginia, US', '2026-08-22 08:28:16.216003', '/', 'vid_mt448w36_ec50b53989094d8b', 'Mozilla/5.0 (Linux; Android 16; SM-S921U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.7632.6 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (988, NULL, 'page_view', 'Direct', '3.87.189.239', 'Ashburn, Virginia, US', '2026-08-22 08:28:17.642268', '/', 'vid_mt448x9j_5a14b1fb55204568', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.7632.6 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1003, NULL, 'page_view', 'Direct', '27.60.134.53', 'Kozhikode, Kerala, IN', '2026-08-24 11:17:32.113699', '/', 'vid_mt7568e2_1913386ba08c406d', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1004, 12, 'click', 'Direct', '27.60.134.53', 'Kozhikode, Kerala, IN', '2026-08-24 11:17:49.67049', NULL, 'vid_mt7568e2_1913386ba08c406d', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1014, NULL, 'page_view', 'Direct', '223.188.164.20', 'Kochi, Kerala, IN', '2026-08-27 10:53:14.408038', '/', 'vid_mtbemkvm_46abcafcfce04ba0', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1015, NULL, 'page_view', 'Direct', '223.188.164.20', 'Delhi', '2026-08-27 10:53:26.479826', '/', 'vid_mtbemkvm_46abcafcfce04ba0', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1026, NULL, 'page_view', 'Direct', '71.6.239.187', 'Boise, Idaho, US', '2026-09-03 11:48:51.481284', '/', 'vid_mtlgp1hs_c91419ae95e84148', 'RootEvidence/1.0');
INSERT INTO public.analytics_logs VALUES (1037, NULL, 'page_view', 'Direct', '157.51.239.195', 'Thiruvananthapuram, Kerala, IN', '2026-09-11 04:53:37.196506', '/', 'vid_mtwhdvqe_48811aadb360466b', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1047, NULL, 'page_view', 'Direct', '3.94.197.242', 'Ashburn, Virginia, US', '2026-09-14 03:23:37.130898', '/', 'vid_mu0ohp7o_4a83f610b6a84fa0', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (1057, NULL, 'page_view', 'Direct', '1.39.115.106', 'Unknown Location', '2026-09-17 17:09:08.141281', '/', 'vid_mu5sauvq_91d5aae6a1aa4628', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (140, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.225.57', NULL, '2026-08-15 16:55:33.077928', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (150, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.228.126', NULL, '2026-08-15 16:58:50.069011', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (796, 10, 'impression', 'Google App (Android)', '157.46.190.193', 'Detecting location...', '2026-08-17 19:43:55.902693', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (797, 12, 'impression', 'Google App (Android)', '157.46.190.193', 'Detecting location...', '2026-08-17 19:43:55.902693', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (907, NULL, 'page_view', 'Facebook', '31.13.115.6', 'Luleå, Norrbotten County, SE', '2026-08-18 22:57:07.468434', '/', 'vid_msz9itpl_a393b997bd244681', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (919, NULL, 'page_view', 'ig', '223.181.10.54', 'Thiruvananthapuram', '2026-08-19 07:30:37.722111', '/', 'vid_mszroo6c_37e8a1eeffd748b4', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (934, NULL, 'page_view', 'Direct', '138.201.135.169', 'Falkenstein, Saxony, DE', '2026-08-19 10:01:58.314619', '/', 'vid_mszx9u5g_c90935572cee433e', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (935, NULL, 'page_view', 'Direct', '5.9.50.77', 'Falkenstein, Saxony, DE', '2026-08-19 10:01:59.369672', '/', 'vid_mszx9v25_66ec3783c26d4709', 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (160, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.228.126', NULL, '2026-08-15 16:59:07.112124', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (161, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.228.126', NULL, '2026-08-15 16:59:16.219268', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (162, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.228.126', NULL, '2026-08-15 16:59:26.052285', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (163, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.228.126', NULL, '2026-08-15 16:59:29.350128', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (164, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.228.126', NULL, '2026-08-15 16:59:35.631919', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (165, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.228.126', NULL, '2026-08-15 17:00:11.752975', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (166, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.225.57', NULL, '2026-08-15 17:03:44.026484', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (167, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.225.57', NULL, '2026-08-15 17:10:47.052868', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (947, NULL, 'page_view', 'ig', '157.51.231.93', 'Thiruvananthapuram, Kerala, IN', '2026-08-19 18:39:17.239302', '/', 'vid_mt0fr3pp_714ea77966f6463d', 'Mozilla/5.0 (Linux; Android 15; 23076RN4BI Build/AQ3A.240912.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/151.0.7922.136 Mobile Safari/537.36 Instagram 443.0.0.0.57 Android (35/15; 440dpi; 1080x2460; Xiaomi/Redmi; 23076RN4BI; sky; qcom; en_IN; 1038063104; IABMV/1)');
INSERT INTO public.analytics_logs VALUES (948, NULL, 'page_view', 'Facebook', '173.252.87.35', 'Fort Worth, Texas, US', '2026-08-19 18:40:23.3188', '/', 'vid_mt0fsihk_99c4164bca6d44c4', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (962, NULL, 'page_view', 'Direct', '157.51.242.178', 'Thiruvananthapuram, Kerala, IN', '2026-08-20 13:59:38.234207', '/', 'vid_mt1l7bem_7451cbd1785d4e6d', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (977, NULL, 'page_view', 'Direct', '49.15.133.1', 'Thrissur, Kerala, IN', '2026-08-21 12:17:34.98463', '/', 'vid_mt2wzyc0_bd0d582076a345af', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (989, NULL, 'page_view', 'Direct', '223.188.97.210', 'Kochi, Kerala, IN', '2026-08-22 11:01:31.488163', '/', 'vid_mt49py8x_6d75730655704207', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1005, NULL, 'page_view', 'Direct', '157.51.230.224', 'Thiruvananthapuram, Kerala, IN', '2026-08-24 12:54:15.329124', '/', 'vid_mt78mnlh_7b33a0ced2e74aff', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (1016, NULL, 'page_view', 'Direct', '100.28.223.215', 'Ashburn, Virginia, US', '2026-08-28 20:56:12.92595', '/', 'vid_mtdflv81_7991c18372c848ed', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (1027, NULL, 'page_view', 'Direct', '71.6.239.187', 'El Segundo', '2026-09-03 11:59:27.679657', '/', 'vid_mtlgp1hs_c91419ae95e84148', 'RootEvidence/1.0');
INSERT INTO public.analytics_logs VALUES (1038, NULL, 'page_view', 'Direct', '157.51.237.129', 'Thiruvananthapuram', '2026-09-11 06:17:45.984395', '/', 'vid_mtwhdvqe_48811aadb360466b', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (177, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.225.57', NULL, '2026-08-15 17:11:15.5071', '/', 'vid_pe8eocppyrmsumuiao', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (178, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.225.57', NULL, '2026-08-15 17:17:16.221087', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1048, NULL, 'page_view', 'Direct', '117.231.196.75', 'Thiruvananthapuram', '2026-09-15 11:56:31.345928', '/', 'vid_msz54qac_e265b41de2134659', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1058, NULL, 'page_view', 'Direct', '157.51.242.150', 'Unknown Location', '2026-09-17 17:52:45.06286', '/', 'vid_mu5tuybh_6066844886184e9b', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (185, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.243.243', NULL, '2026-08-15 17:46:59.847365', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (846, NULL, 'page_view', 'Direct', '157.46.0.148', 'Kochi, Kerala, IN', '2026-08-18 07:40:09.764866', '/', 'vid_msycrm6g_1ad4d8d2bd52400d', 'Mozilla/5.0 (Linux; Android 12; vivo 1938) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/123.0.6312.118 Mobile Safari/537.36 VivoBrowser/15.1.0.3');
INSERT INTO public.analytics_logs VALUES (188, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.228.116', NULL, '2026-08-15 18:19:41.506133', '/', 'vid_t2cb2q0t3kmsupai2s', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (189, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.231.67', NULL, '2026-08-15 20:21:30.731065', '/', 'vid_t2cb2q0t3kmsupai2s', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (190, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '103.176.185.21', NULL, '2026-08-16 01:34:05.327786', '/', 'vid_woo3vl151wrmsv4t55u', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (191, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '149.57.180.124', NULL, '2026-08-16 03:02:37.006955', '/', 'vid_bqbl3as9lkjmsv7yzm9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (192, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.140.81', NULL, '2026-08-16 07:17:57.923107', '/', 'vid_9j4cb6kjk2smsvh3dcy', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (195, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.140.81', NULL, '2026-08-16 07:18:09.35408', '/', 'vid_9j4cb6kjk2smsvh3dcy', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (908, NULL, 'page_view', 'Direct', '35.164.147.148', 'Portland, Oregon, US', '2026-08-18 23:13:05.341211', '/', 'vid_msza3dfl_efe86bf9f8914040', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.137 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (920, NULL, 'page_view', 'ig', '223.181.10.54', 'Thiruvananthapuram', '2026-08-19 07:32:36.852637', '/', 'vid_mszroo6c_37e8a1eeffd748b4', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (921, 12, 'click', 'ig', '223.181.10.54', 'Kochi, Kerala, IN', '2026-08-19 07:32:54.961246', NULL, 'vid_mszroo6c_37e8a1eeffd748b4', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (936, NULL, 'page_view', 'Direct', '157.51.241.141', 'Thiruvananthapuram, Kerala, IN', '2026-08-19 10:13:27.280356', '/', 'vid_mszxolrs_df5e37ef80024503', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (949, NULL, 'page_view', 'Direct', '45.92.216.19', 'Frankfurt am Main, Hesse, DE', '2026-08-19 23:33:16.532707', '/', 'vid_mt0q96lu_924644012e7a44eb', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (963, NULL, 'page_view', 'Direct', '223.239.3.200', 'Kochi, Kerala, IN', '2026-08-20 15:37:02.553753', '/', 'vid_mt1ooleu_ea3f849187cd45e0', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (964, 12, 'click', 'Direct', '223.239.3.200', 'Kochi, Kerala, IN', '2026-08-20 15:37:13.678083', NULL, 'vid_mt1ooleu_ea3f849187cd45e0', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (978, NULL, 'page_view', 'Direct', '49.37.235.229', 'Shoranur', '2026-08-21 16:46:22.296162', '/', 'vid_mt2wzyc0_bd0d582076a345af', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (990, NULL, 'page_view', 'Direct', '157.46.151.129', 'Payyanadam, Kerala, IN', '2026-08-22 12:28:04.789285', '/', 'vid_mt4ctap1_41061788034c4f2d', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (991, 12, 'click', 'Direct', '157.46.151.129', 'Payyanadam, Kerala, IN', '2026-08-22 12:28:22.541673', NULL, 'vid_mt4ctap1_41061788034c4f2d', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (207, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.46.3.64', NULL, '2026-08-16 10:48:41.861172', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (208, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.46.3.64', NULL, '2026-08-16 10:49:44.683063', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1006, NULL, 'page_view', 'Direct', '157.51.239.15', 'Thiruvananthapuram, Kerala, IN', '2026-08-24 23:10:52.573042', '/', 'vid_mt7unmkj_8758165844ad4e55', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1017, NULL, 'page_view', 'Direct', '223.188.114.238', 'Kochi, Kerala, IN', '2026-08-28 23:29:47.0208', '/', 'vid_mtdl3cnz_67d22bcbc7904733', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/30.0 Chrome/143.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1018, 12, 'click', 'Direct', '223.188.114.238', 'Kochi, Kerala, IN', '2026-08-28 23:30:01.544034', NULL, 'vid_mtdl3cnz_67d22bcbc7904733', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/30.0 Chrome/143.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1028, NULL, 'page_view', 'Direct', '223.188.96.61', 'Kochi, Kerala, IN', '2026-09-04 02:11:35.832211', '/', 'vid_mtmbik0e_b9eea9b94b7f4b05', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1039, NULL, 'page_view', 'Direct', '157.51.234.58', 'Thiruvananthapuram, Kerala, IN', '2026-09-11 17:43:57.373997', '/', 'vid_mtx8wjje_5fd8dc18dae44a7a', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (214, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.239.66', NULL, '2026-08-16 10:50:39.537811', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (215, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.239.66', NULL, '2026-08-16 10:50:44.896503', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1049, NULL, 'page_view', 'Direct', '223.188.96.246', 'Unknown Location', '2026-09-15 16:41:59.031356', '/', 'vid_mu2wg8iq_8642756897a04aa9', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/436.4.969249353 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (217, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.46.3.64', NULL, '2026-08-16 11:03:15.498069', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1059, NULL, 'page_view', 'Direct', '100.24.115.199', 'Unknown Location', '2026-09-17 20:45:38.269741', '/', 'vid_mu601a2n_44a9d235e8814840', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (847, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.46.3.82', 'Kochi, Kerala, IN', '2026-08-18 07:54:06.985979', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (909, NULL, 'page_view', 'Direct', '35.164.147.148', 'Portland, Oregon, US', '2026-08-18 23:13:19.679376', '/', 'vid_msza3ohj_2562eb4c0d54488c', 'Mozilla/5.0 (Linux; Android 16; SM-S931B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.137 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (922, NULL, 'page_view', 'Direct', '223.181.10.54', 'Kochi, Kerala, IN', '2026-08-19 07:33:51.664469', '/', 'vid_mszrzdci_6f789cc6a1314e6b', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (937, 12, 'click', 'Direct', '157.51.241.141', 'Thiruvananthapuram, Kerala, IN', '2026-08-19 10:16:04.175653', NULL, 'vid_mszxolrs_df5e37ef80024503', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (950, NULL, 'page_view', 'Direct', '157.51.239.188', 'Thiruvananthapuram, Kerala, IN', '2026-08-20 04:15:18.01072', '/', 'vid_mt10bulc_4aa9d7729a084843', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (951, 12, 'click', 'Direct', '157.51.239.188', 'Thiruvananthapuram, Kerala, IN', '2026-08-20 04:15:26.516695', NULL, 'vid_mt10bulc_4aa9d7729a084843', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (965, NULL, 'page_view', 'ig', '49.37.227.25', 'Thiruvananthapuram', '2026-08-20 15:47:01.03612', '/', 'vid_mszroo6c_37e8a1eeffd748b4', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (979, NULL, 'page_view', 'Direct', '38.49.218.212', 'Montreal, Quebec, CA', '2026-08-21 17:01:40.561174', '/', 'vid_mt375ac6_2b05e274f581412e', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (992, NULL, 'page_view', 'Google App (Android)', '157.51.243.143', 'Thiruvananthapuram, Kerala, IN', '2026-08-22 13:25:21.791418', '/', 'vid_mt4euycz_03ec2f527ba944cd', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (234, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.238.50', NULL, '2026-08-16 11:45:55.350784', '/', 'vid_bnljaikhgz8msvqnytr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1007, NULL, 'page_view', 'Direct', '172.236.122.62', 'Chicago, Illinois, US', '2026-08-25 20:35:36.618972', '/', 'vid_mt94jt92_2adcc3d7e79241d4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (236, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 12:05:43.113351', '/', 'vid_gglzv5n0u1vmsvrdfg0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1019, NULL, 'page_view', 'Google App (Android)', '223.188.105.83', 'Kochi, Kerala, IN', '2026-08-29 02:51:53.981366', '/', 'vid_mtdsba4z_83b306b3545c486a', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1020, 12, 'click', 'Google App (Android)', '223.188.105.83', 'Kochi, Kerala, IN', '2026-08-29 02:52:12.042065', NULL, 'vid_mtdsba4z_83b306b3545c486a', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1029, NULL, 'page_view', 'Direct', '223.188.98.75', 'Kanayannur', '2026-09-04 08:20:56.029072', '/', 'vid_mtmbik0e_b9eea9b94b7f4b05', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1040, NULL, 'page_view', 'Direct', '157.51.234.58', 'Thiruvananthapuram', '2026-09-11 18:02:54.658576', '/', 'vid_mtx8wjje_5fd8dc18dae44a7a', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1050, NULL, 'page_view', 'Direct', '49.37.226.155', 'Thiruvananthapuram', '2026-09-15 17:19:58.067458', '/', 'vid_msz54qac_e265b41de2134659', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1060, NULL, 'page_view', 'Direct', '34.72.176.129', 'Unknown Location', '2026-09-20 09:19:11.945625', '/', 'vid_mu9lu2h7_6d4206965668491f', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.60 Safari/537.36 Edge/12.246');
INSERT INTO public.analytics_logs VALUES (246, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 12:20:28.29068', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (247, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 12:20:32.426355', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (248, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 12:37:31.681549', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (251, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 12:38:00.047909', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (848, NULL, 'page_view', 'Direct', '223.181.12.202', '{"name":"Kanayannur","lat":9.979917,"lng":76.280193}', '2026-08-18 08:08:10.160659', '/', 'vid_dic27m90q5imswzayhe', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (864, NULL, 'page_view', 'Direct', '157.46.3.136', 'Thiruvananthapuram', '2026-08-18 14:15:19.618653', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (910, NULL, 'page_view', 'Direct', '149.57.180.147', 'New York, New York, US', '2026-08-19 00:03:55.418433', '/', 'vid_mszbwqnl_63f2374f773c4ae3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (923, NULL, 'page_view', 'Direct', '223.181.10.54', 'Kochi, Kerala, IN', '2026-08-19 07:35:23.979107', '/', 'vid_mszs1df3_dd39c0be491543c0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (938, NULL, 'page_view', 'Direct', '216.247.87.231', 'Batangas, Calabarzon, PH', '2026-08-19 10:39:44.89242', '/', 'vid_mszvj2wd_a3dc05bc2f5e444d', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0');
INSERT INTO public.analytics_logs VALUES (952, NULL, 'page_view', 'ig', '157.51.228.127', 'Thiruvananthapuram, Kerala, IN', '2026-08-20 05:31:02.561152', '/', 'vid_mt1319sw_2ff73d86bc3045cd', 'Mozilla/5.0 (Linux; Android 16; 2311DRK48I Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/151.0.7922.107 Mobile Safari/537.36 Instagram 442.0.0.46.79 Android (36/16; 480dpi; 1220x2712; Xiaomi/POCO; 2311DRK48I; duchamp; mt6897; en_IN; 1037527497; IABMV/1)');
INSERT INTO public.analytics_logs VALUES (264, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 12:42:18.216896', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (265, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 12:59:08.898129', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (966, NULL, 'page_view', 'Direct', '157.51.239.182', 'Thiruvananthapuram', '2026-08-20 21:13:49.934669', '/', 'vid_msz54qac_e265b41de2134659', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (980, NULL, 'page_view', 'Direct', '157.51.236.43', 'Thiruvananthapuram, Kerala, IN', '2026-08-21 19:35:26.484699', '/', 'vid_mt3cn0zg_3fb3b02292504499', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (993, NULL, 'page_view', 'Direct', '223.188.114.252', 'Kochi, Kerala, IN', '2026-08-22 13:47:39.600813', '/', 'vid_mt4fnm87_8a4df51a1c674659', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1008, NULL, 'page_view', 'Direct', '34.123.170.104', 'Council Bluffs, Iowa, US', '2026-08-26 03:44:49.43949', '/', 'vid_mt9jvsch_bbfb5c7c65964ad9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.60 Safari/537.36 Edge/12.246');
INSERT INTO public.analytics_logs VALUES (1021, NULL, 'page_view', 'Direct', '157.51.232.199', 'Thiruvananthapuram', '2026-08-29 14:44:35.612412', '/', 'vid_msz54qac_e265b41de2134659', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1030, NULL, 'page_view', 'Direct', '223.188.98.87', 'Kanayannur', '2026-09-04 10:34:20.132978', '/', 'vid_mtmbik0e_b9eea9b94b7f4b05', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1041, NULL, 'page_view', 'Direct', '157.51.235.172', 'Thiruvananthapuram', '2026-09-11 18:37:00.478115', '/', 'vid_mtx8wjje_5fd8dc18dae44a7a', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (273, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 13:26:07.089083', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1051, NULL, 'page_view', 'Direct', '116.68.78.63', 'Unknown Location', '2026-09-15 18:16:30.688936', '/', 'vid_mu2ztst5_a464cb4b4e8f45f7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148');
INSERT INTO public.analytics_logs VALUES (1061, NULL, 'page_view', 'Direct', '52.21.44.142', 'Unknown Location', '2026-09-20 09:36:35.669595', '/', 'vid_mu9mgfu6_046191467cb54df7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (277, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 13:35:19.412084', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (849, NULL, 'page_view', 'Direct', '223.188.102.52', 'Kochi, Kerala, IN', '2026-08-18 10:09:55.048042', '/', 'vid_msyi47dw_37924f1192ba4b9c', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (865, NULL, 'page_view', 'Direct', '157.51.243.176', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-18 14:24:12.160738', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (897, NULL, 'page_view', 'Direct', '157.51.234.174', 'Gudalur', '2026-08-18 21:26:58.708729', '/', 'vid_msz699hl_89a785e930b84ddd', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (911, NULL, 'page_view', 'Direct', '37.59.187.20', 'Letterkenny, Ulster, IE', '2026-08-19 00:09:30.153661', '/', 'vid_mszc3x65_4857c63d18354da7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0');
INSERT INTO public.analytics_logs VALUES (924, NULL, 'page_view', 'Direct', '157.51.228.86', 'Unknown Location', '2026-08-19 08:13:01.024151', '/', 'vid_msztdp1h_0eec2bc5ea6a4bd7', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (925, NULL, 'page_view', 'Instagram', '103.88.223.6', 'Mumbai, Maharashtra, IN', '2026-08-19 08:13:23.639068', '/', 'vid_mszte6i0_92e37f55516341f4', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (299, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 13:41:26.561552', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (300, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.237.246', NULL, '2026-08-16 13:42:48.135975', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (301, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 13:42:50.83206', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (939, NULL, 'page_view', 'Direct', '111.92.38.43', 'Thiruvananthapuram, Kerala, IN', '2026-08-19 12:47:46.29243', '/', 'vid_mt03723k_8a3ee30bb94f4834', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (953, NULL, 'page_view', 'ig', '157.51.228.127', 'Cherthala', '2026-08-20 05:32:27.092988', '/', 'vid_mt1319sw_2ff73d86bc3045cd', 'Mozilla/5.0 (Linux; Android 16; 2311DRK48I Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/151.0.7922.107 Mobile Safari/537.36 Instagram 442.0.0.46.79 Android (36/16; 480dpi; 1220x2712; Xiaomi/POCO; 2311DRK48I; duchamp; mt6897; en_IN; 1037527497; IABMV/1)');
INSERT INTO public.analytics_logs VALUES (954, NULL, 'page_view', 'ig', '157.51.228.127', 'Thiruvananthapuram, Kerala, IN', '2026-08-20 05:32:35.623609', '/', 'vid_mt1339t9_451c2af87421484b', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (967, NULL, 'page_view', 'Direct', '89.184.209.67', 'Melbourne, Victoria, AU', '2026-08-20 22:02:07.198994', '/', 'vid_mt22fsvq_331d254095f4477d', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (981, NULL, 'page_view', 'Direct', '130.12.168.252', 'Durham, North Carolina, US', '2026-08-21 20:17:32.277361', '/', 'vid_mt3e55r2_98169ea7e5374482', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (994, NULL, 'page_view', 'Direct', '52.87.182.135', 'Ashburn, Virginia, US', '2026-08-23 03:24:24.086277', '/', 'vid_mt58tyrj_23d3e73c32fd4383', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1009, NULL, 'page_view', 'Direct', '205.169.39.58', 'Santa Clara, California, US', '2026-08-26 05:01:14.430933', '/', 'vid_mt9mm212_8234039277804a65', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/150.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (309, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 13:42:56.542502', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (310, 10, 'impression', 'direct', '157.51.237.246', 'Perumbavoor', '2026-08-16 13:42:56.550613', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (311, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 13:43:46.738475', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (312, 10, 'impression', 'https://offerzonline.hoztels.in/', '157.51.237.246', 'Thiruvananthapuram', '2026-08-16 13:44:00.770791', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (313, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 13:44:01.57813', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (314, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.243.219', NULL, '2026-08-16 13:44:04.014254', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (315, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.237.246', NULL, '2026-08-16 13:44:10.177684', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (316, 10, 'impression', 'https://offerzonline.hoztels.in/', '157.51.237.246', 'Thiruvananthapuram', '2026-08-16 13:44:30.758631', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (317, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.237.246', NULL, '2026-08-16 13:44:37.236844', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (319, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 13:44:39.98114', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (320, 10, 'impression', 'https://offerzonline.hoztels.in/', '157.51.237.246', 'Thiruvananthapuram', '2026-08-16 13:44:53.710535', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (321, 10, 'impression', 'https://offerzonline.hoztels.in/', '157.51.237.246', 'Thiruvananthapuram', '2026-08-16 13:44:57.175194', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (322, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.237.246', NULL, '2026-08-16 13:44:57.994173', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (323, 10, 'impression', 'https://offerzonline.hoztels.in/', '157.51.237.246', 'Thiruvananthapuram', '2026-08-16 13:45:03.182894', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (324, 10, 'impression', 'https://offerzonline.hoztels.in/', '157.51.237.246', 'Thiruvananthapuram', '2026-08-16 13:45:29.558644', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (325, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.237.246', NULL, '2026-08-16 13:45:30.810988', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (850, NULL, 'page_view', 'Direct', '49.37.235.179', 'Kochi, Kerala, IN', '2026-08-18 10:26:20.173171', '/', 'vid_msyipav0_07442e446e76461b', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (866, NULL, 'page_view', 'Direct', '157.51.233.117', 'Thiruvananthapuram, Kerala, IN', '2026-08-18 16:12:42.605787', '/', 'vid_msyv2rbv_ecdb1457a27f4f0a', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (898, NULL, 'page_view', 'Direct', '157.51.234.174', 'Gudalur', '2026-08-18 21:35:16.408688', '/', 'vid_msz699hl_89a785e930b84ddd', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (912, NULL, 'page_view', 'Direct', '136.158.79.240', 'Calamba, Calabarzon, PH', '2026-08-19 02:10:20.539283', '/', 'vid_mszgfcdm_bcf66bf1b4e544cc', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (926, 12, 'click', 'Direct', '223.181.10.54', 'Kochi, Kerala, IN', '2026-08-19 09:02:10.686232', NULL, 'vid_mszs1df3_dd39c0be491543c0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (940, NULL, 'page_view', 'Direct', '157.51.239.172', 'Gudalur', '2026-08-19 12:56:52.226302', '/', 'vid_msz699hl_89a785e930b84ddd', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (955, NULL, 'page_view', 'Direct', '157.51.228.127', 'Thiruvananthapuram', '2026-08-20 05:33:10.405623', '/', 'vid_mt1339t9_451c2af87421484b', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (956, NULL, 'page_view', 'Direct', '157.51.228.127', 'Thiruvananthapuram', '2026-08-20 05:33:18.355041', '/', 'vid_mt1339t9_451c2af87421484b', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (335, 10, 'impression', 'https://offerzonline.hoztels.in/', '157.51.237.246', 'Thiruvananthapuram', '2026-08-16 13:45:36.79278', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (336, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.237.246', NULL, '2026-08-16 13:45:44.330785', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (337, 10, 'click', 'direct', '157.51.237.246', NULL, '2026-08-16 13:46:00.374621', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (338, 10, 'click', 'direct', '157.51.237.246', NULL, '2026-08-16 13:46:00.90241', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (339, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.237.246', NULL, '2026-08-16 13:46:12.896812', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (340, 10, 'impression', 'direct', '157.51.237.246', 'Thiruvananthapuram', '2026-08-16 13:46:15.690348', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (341, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 13:47:17.500329', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (342, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 13:47:36.370984', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (343, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 13:47:38.614293', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (968, NULL, 'page_view', 'Direct', '54.247.57.72', 'Dublin, Leinster, IE', '2026-08-20 23:53:56.628789', '/', 'vid_mt26fm1n_0b501d6b56324798', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (345, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 13:47:44.770554', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (969, NULL, 'page_view', 'Direct', '54.247.57.72', 'Dublin, Leinster, IE', '2026-08-20 23:54:15.411276', '/', 'vid_mt26g0p5_3dfc82cfbcca4b84', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (982, NULL, 'page_view', 'Direct', '34.123.170.104', 'Council Bluffs, Iowa, US', '2026-08-22 03:01:19.12924', '/', 'vid_mt3skflh_4c551f07b2644f8c', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.60 Safari/537.36 Edge/12.246');
INSERT INTO public.analytics_logs VALUES (983, NULL, 'page_view', 'Direct', '34.72.176.129', 'Council Bluffs, Iowa, US', '2026-08-22 03:01:20.893335', '/', 'vid_mt3skgy2_fbf51feedd41420c', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.60 Safari/537.36 Edge/12.246');
INSERT INTO public.analytics_logs VALUES (995, NULL, 'page_view', 'Google App (Android)', '106.76.191.165', 'Thrissur, Kerala, IN', '2026-08-23 05:40:06.765857', '/', 'vid_mt5doi5h_c44282ed93194070', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (996, NULL, 'page_view', 'Direct', '27.63.211.185', 'Kochi, Kerala, IN', '2026-08-23 05:41:05.173962', '/', 'vid_mt5dpqg3_44d407b86cb54991', 'Mozilla/5.0 (Linux; Android 15; I2301) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/123.0.6312.118 Mobile Safari/537.36 VivoBrowser/15.1.0.3');
INSERT INTO public.analytics_logs VALUES (997, NULL, 'page_view', 'Google App (Android)', '106.76.191.165', 'Thiruvananthapuram', '2026-08-23 05:41:24.684219', '/', 'vid_mt5doi5h_c44282ed93194070', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1010, NULL, 'page_view', 'Direct', '157.51.235.52', 'Thiruvananthapuram', '2026-08-26 05:02:16.483837', '/', 'vid_msz54qac_e265b41de2134659', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1022, NULL, 'page_view', 'Direct', '157.51.228.150', 'Gudalur', '2026-09-01 15:14:52.768508', '/', 'vid_msz699hl_89a785e930b84ddd', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1031, NULL, 'page_view', 'Direct', '223.188.119.157', 'Kochi, Kerala, IN', '2026-09-04 17:56:40.361338', '/', 'vid_mtn99x0y_d098b43688c64fe5', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1042, NULL, 'page_view', 'Direct', '47.88.18.245', 'Minkler, California, US', '2026-09-12 04:19:51.287639', '/', 'vid_mtxvmb2q_ehipdh2yv3penuxh', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1043, NULL, 'page_view', 'Direct', '47.251.186.126', 'Minkler, California, US', '2026-09-12 04:19:58.503929', '/', 'vid_mtxvmehx_0z5clgiciiajne7z', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1052, NULL, 'page_view', 'Direct', '172.236.122.62', 'Unknown Location', '2026-09-15 20:35:34.786083', '/', 'vid_mu34sn2j_f1ee8f6b186e42fd', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1062, NULL, 'page_view', 'Direct', '205.169.39.17', 'Unknown Location', '2026-09-20 09:51:18.160922', '/', 'vid_mu9mzcr0_d1f1a1d7414a45c2', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/150.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (362, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 13:48:15.720777', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (851, NULL, 'page_view', 'Direct', '42.104.157.50', 'Kochi, Kerala, IN', '2026-08-18 11:02:54.882914', '/', 'vid_msyk0bkg_27129e5d033f4f29', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (364, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 13:48:20.767869', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (365, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 13:48:23.186945', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (867, NULL, 'page_view', 'Direct', '157.51.229.38', 'Thiruvananthapuram, Kerala, IN', '2026-08-18 17:22:00.117558', '/', 'vid_msyxjv85_224e3059ce93463a', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/151.0.7922.112 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (899, NULL, 'page_view', 'Direct', '157.51.234.174', 'Gudalur', '2026-08-18 21:37:44.613876', '/', 'vid_msz699hl_89a785e930b84ddd', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (369, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 13:48:31.32073', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (913, NULL, 'page_view', 'Direct', '146.112.163.42', 'Reston, Virginia, US', '2026-08-19 03:45:39.289977', '/', 'vid_mszjtw3m_e2f1c8f7ceea434d', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (927, NULL, 'page_view', 'Direct', '216.247.87.231', 'Batangas, Calabarzon, PH', '2026-08-19 09:13:10.725069', '/', 'vid_mszvj2wd_a3dc05bc2f5e444d', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0');
INSERT INTO public.analytics_logs VALUES (941, NULL, 'page_view', 'Direct', '157.51.238.177', 'Thiruvananthapuram, Kerala, IN', '2026-08-19 13:42:38.735032', '/', 'vid_mt055luf_1efbaa236cc14daa', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (942, NULL, 'page_view', 'Direct', '183.82.15.106', 'Hyderabad, Telangana, IN', '2026-08-19 13:42:47.264778', '/', 'vid_mt055t0n_99642034d61747c6', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (374, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 13:48:37.335089', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (375, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 13:57:21.793741', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (957, NULL, 'page_view', 'Direct', '157.51.228.127', 'Thiruvananthapuram', '2026-08-20 05:33:28.94166', '/', 'vid_mt1339t9_451c2af87421484b', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (970, NULL, 'page_view', 'Direct', '34.123.170.104', 'Council Bluffs, Iowa, US', '2026-08-21 00:16:25.254118', '/', 'vid_mt278ihp_e2f4066c02cf429a', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.60 Safari/537.36 Edge/12.246');
INSERT INTO public.analytics_logs VALUES (971, NULL, 'page_view', 'Direct', '34.72.176.129', 'Council Bluffs, Iowa, US', '2026-08-21 00:16:26.460303', '/', 'vid_mt278jks_8a461d6cce9541a6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.60 Safari/537.36 Edge/12.246');
INSERT INTO public.analytics_logs VALUES (984, NULL, 'page_view', 'Direct', '205.169.39.3', 'Santa Clara, California, US', '2026-08-22 03:07:49.465762', '/', 'vid_mt3sssnl_236e2d03b5444cef', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/150.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (998, NULL, 'page_view', 'Direct', '49.37.232.95', 'Kochi, Kerala, IN', '2026-08-23 05:44:48.416109', '/', 'vid_mt5duj5p_c1d5e2c62bac4f29', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/30.0 Chrome/143.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (999, NULL, 'page_view', 'Direct', '49.37.232.95', 'Thiruvananthapuram', '2026-08-23 05:45:38.847097', '/', 'vid_mt5duj5p_c1d5e2c62bac4f29', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/30.0 Chrome/143.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1011, NULL, 'page_view', 'Direct', '152.39.233.46', 'New York, New York, US', '2026-08-26 05:41:19.080394', '/', 'vid_mt9o1lds_a2f550fcefe04abc', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (383, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 13:57:28.885885', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (384, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 13:58:36.02859', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (385, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 13:58:45.986728', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1023, NULL, 'page_view', 'Direct', '157.51.237.174', 'Gudalur', '2026-09-01 16:05:38.443882', '/', 'vid_msz699hl_89a785e930b84ddd', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1032, NULL, 'page_view', 'Direct', '223.188.103.70', 'Kozhikode, Kerala, IN', '2026-09-05 00:53:11.595138', '/', 'vid_mtno5l4s_48280d8ba1b44c39', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (1033, NULL, 'page_view', 'Direct', '23.81.33.206', 'City of London, England, GB', '2026-09-05 19:17:26.547585', '/', 'vid_mtorln3o_899f6ffbdc1d43e1', 'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.166 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1044, NULL, 'page_view', 'Direct', '223.188.162.55', 'Kochi, Kerala, IN', '2026-09-13 03:09:39.319896', '/', 'vid_mtz8jw3l_57382fa646a345b5', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1053, NULL, 'page_view', 'Direct', '144.217.135.239', 'Unknown Location', '2026-09-16 12:16:47.976122', '/', 'vid_mu42f1zo_d21d60555f584b0b', 'Mozilla/5.0 (compatible; Dataprovider.com)');
INSERT INTO public.analytics_logs VALUES (392, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 14:00:45.679328', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (395, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 14:00:54.07696', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (396, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 14:01:41.108658', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (852, NULL, 'page_view', 'Direct', '42.104.157.50', 'All Locations (Show All Deals)', '2026-08-18 11:03:46.356614', '/', 'vid_msyk0bkg_27129e5d033f4f29', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (868, NULL, 'page_view', 'Direct', '49.37.234.226', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-18 18:16:28.900928', '/', 'vid_msyk0bkg_27129e5d033f4f29', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (869, 12, 'click', 'Direct', '49.37.234.226', 'Kochi, Kerala, IN', '2026-08-18 18:16:53.788313', NULL, 'vid_msyk0bkg_27129e5d033f4f29', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (870, NULL, 'page_view', 'Direct', '49.37.234.226', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-18 18:17:12.229121', '/', 'vid_msyk0bkg_27129e5d033f4f29', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (402, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 14:01:48.094375', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (403, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 14:05:10.382789', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (405, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 14:05:16.915127', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (406, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 14:08:54.520082', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (407, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 14:10:25.359645', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (408, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 14:11:49.996811', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (409, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 14:14:34.31619', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (900, NULL, 'page_view', 'Facebook', '173.252.82.58', 'Springfield, Nebraska, US', '2026-08-18 21:42:12.070822', '/', 'vid_msz6ugxm_8965aa81aa074f1f', 'Mozilla/5.0 (Linux; Android 12; SM-G975F Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/150.0.7871.178 Mobile Safari/537.36 [FBAN/FB4A;FBAV/571.0.0.44.73;FBBV/1023572653;FBDM/{density=2.8125,width=1080,height=2038};FBLC/en_GB;FBRV/1028335445;FB_FW/2;FBCR/Digicel;FBMF/samsung;FBBD/samsung;FBPN/com.facebook.katana;FBDV/SM-G975F;FBSV/12;FBOP/19;FBCA/arm64-v8a:;]');
INSERT INTO public.analytics_logs VALUES (411, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 14:14:39.19234', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (412, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.237.105', NULL, '2026-08-16 14:16:11.895091', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (414, 10, 'impression', 'direct', '157.51.237.105', 'Thiruvananthapuram', '2026-08-16 14:16:18.277983', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (442, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:06:14.961724', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (443, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:06:15.41695', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (444, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:06:17.946457', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (928, NULL, 'page_view', 'Direct', '216.247.87.231', 'Batangas, Calabarzon, PH', '2026-08-19 09:16:41.229546', '/', 'vid_mszvj2wd_a3dc05bc2f5e444d', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0');
INSERT INTO public.analytics_logs VALUES (446, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:06:20.73919', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (447, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:06:57.180546', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (943, NULL, 'page_view', 'Direct', '223.239.4.221', 'Kochi, Kerala, IN', '2026-08-19 14:22:40.3996', '/', 'vid_mt06l3og_98d78f735cce462d', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (449, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:07:01.208554', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (450, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:20:52.192711', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (958, NULL, 'page_view', 'ig', '157.51.228.127', 'Thiruvananthapuram', '2026-08-20 05:34:34.15782', '/', 'vid_mt1339t9_451c2af87421484b', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (452, 11, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:20:54.99109', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (453, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:20:54.99109', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (454, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:21:09.958225', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (972, NULL, 'page_view', 'Direct', '34.122.147.229', 'Council Bluffs, Iowa, US', '2026-08-21 00:16:51.925938', '/', 'vid_mt279398_cb1ccb9e5646445c', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.60 Safari/537.36 Edge/12.246');
INSERT INTO public.analytics_logs VALUES (456, 11, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:21:12.737061', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (457, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:21:12.737061', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (973, NULL, 'page_view', 'Direct', '34.118.19.4', 'Warsaw, Masovian, PL', '2026-08-21 00:16:57.145725', '/', 'vid_mt27979s_0e1f54b50307434a', 'Mozilla/5.0 (iPhone13,2; U; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/15E148 Safari/602.1');
INSERT INTO public.analytics_logs VALUES (458, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:21:14.3798', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (853, NULL, 'page_view', 'Direct', '42.104.157.50', 'All Locations (Show All Deals)', '2026-08-18 11:04:30.369146', '/', 'vid_msyk0bkg_27129e5d033f4f29', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (460, 11, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:33:08.009836', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (461, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:33:08.009836', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (462, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:39:35.006494', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (463, 11, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 15:39:37.790975', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (464, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 15:39:37.790975', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (465, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:40:28.88581', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (466, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:41:17.149558', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (871, NULL, 'page_view', 'Direct', '27.63.205.166', 'Kondotty, Kerala, IN', '2026-08-18 18:18:02.989889', '/', 'vid_msyzjy77_3ea1228592894858', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (468, 11, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:41:22.974942', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (469, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:41:22.974942', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (470, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:41:43.17339', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (471, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:41:47.983889', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (473, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:41:50.79194', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (474, 11, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:41:51.997948', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (475, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:43:00.931978', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (476, 11, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 15:43:03.837448', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (477, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 15:43:03.837448', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (478, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:43:10.100458', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (479, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:44:52.457727', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (480, 11, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 15:44:57.619778', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (481, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 15:44:57.619778', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (482, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 15:45:03.629854', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (483, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:45:05.692978', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (484, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 15:46:45.847614', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (485, 11, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 15:46:46.831564', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (486, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:48:03.341911', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (487, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:49:46.10502', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (488, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:49:51.584463', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (489, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:50:41.703501', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (490, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:52:08.014008', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (491, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:52:36.439728', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (901, NULL, 'page_view', 'Direct', '216.251.143.109', 'Vancouver, British Columbia, CA', '2026-08-18 22:10:29.974988', '/', 'vid_msz7uvko_86600789e822405e', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (492, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:52:40.753466', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (494, 11, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:57:06.31979', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (495, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:57:06.31979', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (496, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:57:29.598139', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (497, 11, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:57:34.805681', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (498, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:57:34.805681', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (499, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 15:58:17.296407', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (500, 11, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:58:22.271196', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (501, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 15:58:22.271196', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (502, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 16:04:22.52394', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (503, 11, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:04:25.295352', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (504, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:04:25.295352', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (505, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 16:04:33.454289', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (506, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 16:04:41.193287', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (507, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:04:53.570865', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (508, 11, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:04:57.168384', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (509, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 16:06:07.589371', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (510, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 16:06:11.549332', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (511, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 16:06:13.86996', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (512, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 16:06:15.628618', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (513, 11, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 16:06:20.816757', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (514, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 16:06:20.816757', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (515, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 16:14:48.624981', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (516, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 16:14:59.53766', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (517, 11, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 16:15:10.365893', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (518, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 16:15:10.365893', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (519, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 16:30:26.198476', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (520, 11, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 16:30:36.458605', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (521, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 16:30:36.458605', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (522, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 16:33:57.136048', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (523, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 16:34:58.721964', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (524, 11, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:35:01.597681', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (525, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:35:01.597681', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (872, NULL, 'page_view', 'Direct', '49.37.234.226', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-18 18:19:26.523058', '/', 'vid_msyk0bkg_27129e5d033f4f29', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (526, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 16:41:05.454598', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (527, 12, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:41:08.298203', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (528, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:41:14.295471', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (529, 11, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:41:15.495911', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (530, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:42:07.080919', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (531, 12, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:42:07.080919', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (532, 11, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:42:08.299815', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (533, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 16:42:25.282376', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (534, 12, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:42:27.496546', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (535, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 16:42:30.305365', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (536, 11, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 16:42:34.389904', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (537, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 16:42:34.389904', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (538, 12, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 16:42:34.389904', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (539, 11, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:43:39.515961', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (540, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:43:39.515961', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (541, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.233.114', NULL, '2026-08-16 16:44:43.681835', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (542, 12, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:44:46.482444', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (543, 10, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:44:52.63882', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (544, 11, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:44:53.704852', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (545, 10, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:44:56.098684', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (546, 12, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:44:56.098684', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (547, 11, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:44:57.280208', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (548, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.233.114', NULL, '2026-08-16 16:44:57.687029', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (549, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 16:45:01.733028', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (550, 12, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:45:11.701713', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (551, 12, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:45:12.947221', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (552, 11, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:45:14.157022', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (553, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:45:14.157022', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (554, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.233.114', NULL, '2026-08-16 16:45:36.892957', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (555, 12, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:45:45.63968', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (556, 10, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:45:48.042798', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (557, 11, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:45:49.238919', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (558, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.233.114', NULL, '2026-08-16 16:45:55.089925', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (559, 12, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:45:59.04514', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (560, 10, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:46:01.44355', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (561, 11, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:46:03.84722', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (562, 12, 'click', 'direct', '49.37.226.149', NULL, '2026-08-16 16:46:31.046436', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (563, 12, 'click', 'direct', '49.37.226.149', NULL, '2026-08-16 16:46:31.913214', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (564, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.233.114', NULL, '2026-08-16 16:46:37.119928', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (565, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 16:46:37.368864', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (566, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.233.114', NULL, '2026-08-16 16:46:53.800029', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (567, 11, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:46:56.621759', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (568, 10, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:46:56.621759', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (569, 12, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:46:56.621759', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (570, 12, 'click', 'direct', '157.51.233.114', NULL, '2026-08-16 16:47:03.141338', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (571, 12, 'click', 'direct', '157.51.233.114', NULL, '2026-08-16 16:47:03.701499', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (572, 10, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:47:31.88062', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (573, 12, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:47:31.88062', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (574, 11, 'impression', 'direct', '49.37.226.149', 'Thiruvananthapuram', '2026-08-16 16:47:49.869537', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (575, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.233.114', NULL, '2026-08-16 16:48:22.092457', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (576, 11, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:48:24.91055', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (577, 10, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:48:24.91055', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (578, 12, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:48:24.91055', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (579, 10, 'click', 'direct', '157.51.233.114', NULL, '2026-08-16 16:48:56.572982', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (580, 10, 'click', 'direct', '157.51.233.114', NULL, '2026-08-16 16:48:56.971138', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (581, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.233.114', NULL, '2026-08-16 16:49:03.12138', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (582, 11, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:49:05.880306', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (583, 10, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:49:05.880306', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (584, 12, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:49:05.880306', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (585, 12, 'click', 'direct', '157.51.233.114', NULL, '2026-08-16 16:49:19.837682', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (586, 12, 'click', 'direct', '157.51.233.114', NULL, '2026-08-16 16:49:20.217759', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (587, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.233.114', NULL, '2026-08-16 16:49:25.020569', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (588, 11, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:49:27.797986', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (589, 10, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:49:27.797986', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (590, 12, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:49:27.797986', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (591, 10, 'click', 'direct', '157.51.233.114', NULL, '2026-08-16 16:49:34.914191', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (592, 10, 'click', 'direct', '157.51.233.114', NULL, '2026-08-16 16:49:35.334982', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (593, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.233.114', NULL, '2026-08-16 16:49:54.537063', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (594, 11, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:49:57.331869', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (595, 10, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:49:57.331869', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (596, 12, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:49:57.331869', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (597, 12, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:50:22.516435', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (598, 12, 'impression', 'direct', '157.51.233.114', 'Thiruvananthapuram', '2026-08-16 16:50:26.12179', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (599, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.233.114', NULL, '2026-08-16 16:51:03.25122', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (600, 11, 'impression', 'direct', '157.51.233.114', 'Kochi, Kerala', '2026-08-16 16:51:06.080924', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (601, 10, 'impression', 'direct', '157.51.233.114', 'Kochi, Kerala', '2026-08-16 16:51:06.080924', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (602, 12, 'impression', 'direct', '157.51.233.114', 'Kochi, Kerala', '2026-08-16 16:51:06.080924', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (603, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.233.114', NULL, '2026-08-16 16:51:19.637472', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (604, 11, 'impression', 'direct', '157.51.233.114', 'Kochi, Kerala', '2026-08-16 16:51:22.459764', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (605, 10, 'impression', 'direct', '157.51.233.114', 'Kochi, Kerala', '2026-08-16 16:51:22.459764', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (606, 12, 'impression', 'direct', '157.51.233.114', 'Kochi, Kerala', '2026-08-16 16:51:22.459764', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (607, 12, 'impression', 'direct', '157.51.233.114', 'Kochi, Kerala', '2026-08-16 16:51:57.395321', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (608, 10, 'impression', 'direct', '157.51.233.114', 'Kochi, Kerala', '2026-08-16 16:51:58.424605', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (609, 11, 'impression', 'direct', '157.51.233.114', 'Kochi, Kerala', '2026-08-16 16:51:59.639776', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (610, 12, 'impression', 'direct', '157.51.233.114', 'Kochi, Kerala', '2026-08-16 16:52:08.020111', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (611, 10, 'impression', 'direct', '157.51.233.114', 'Kochi, Kerala', '2026-08-16 16:52:11.646285', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (612, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.233.114', NULL, '2026-08-16 16:52:21.229605', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (613, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 17:04:56.638346', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (614, 11, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 17:05:24.843466', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (615, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 17:05:24.843466', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (616, 12, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 17:05:24.843466', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (617, 11, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 17:05:35.628972', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (618, 10, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 17:05:35.628972', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (619, 12, 'impression', 'direct', '49.37.226.149', 'All Locations (Show All Deals)', '2026-08-16 17:05:35.628972', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (620, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.235.246', NULL, '2026-08-16 17:13:13.950914', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (621, 12, 'impression', 'direct', '157.51.235.246', 'Thiruvananthapuram', '2026-08-16 17:13:17.880622', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (622, 11, 'impression', 'direct', '157.51.235.246', 'Thiruvananthapuram', '2026-08-16 17:13:19.105095', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (623, 10, 'impression', 'direct', '157.51.235.246', 'Thiruvananthapuram', '2026-08-16 17:13:19.105095', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (624, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.235.79', NULL, '2026-08-16 17:17:06.092089', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (625, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.235.79', NULL, '2026-08-16 17:17:17.724714', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (626, 12, 'impression', 'direct', '157.51.235.79', 'Thiruvananthapuram', '2026-08-16 17:17:22.903502', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (627, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 17:19:02.26095', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (628, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 17:31:21.727057', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (629, 11, 'impression', 'direct', '49.37.226.149', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 17:31:34.419887', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (630, 10, 'impression', 'direct', '49.37.226.149', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 17:31:34.419887', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (631, 12, 'impression', 'direct', '49.37.226.149', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 17:31:34.419887', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (632, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 17:31:39.737081', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (633, 10, 'impression', 'direct', '49.37.226.149', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 17:31:43.734629', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (634, 11, 'impression', 'direct', '49.37.226.149', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 17:31:44.933939', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (635, 12, 'impression', 'direct', '49.37.226.149', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 17:31:44.933939', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (636, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.226.149', NULL, '2026-08-16 17:33:45.353954', '/', 'vid_e31tdmz9b2pmsumae39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (637, 11, 'impression', 'direct', '49.37.226.149', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 17:34:15.12374', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (638, 10, 'impression', 'direct', '49.37.226.149', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 17:34:15.12374', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (639, 12, 'impression', 'direct', '49.37.226.149', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 17:34:15.12374', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (640, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.230.133', NULL, '2026-08-16 18:02:48.032937', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (641, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.230.133', NULL, '2026-08-16 18:02:56.008101', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (642, 10, 'impression', 'direct', '157.51.230.133', 'Neyyattinkara', '2026-08-16 18:02:58.899496', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (643, 12, 'impression', 'direct', '157.51.230.133', 'Neyyattinkara', '2026-08-16 18:02:58.899496', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (644, 11, 'impression', 'direct', '157.51.230.133', 'Neyyattinkara', '2026-08-16 18:03:55.308372', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (645, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.234.42', NULL, '2026-08-16 18:27:29.890423', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (646, 12, 'impression', 'direct', '157.51.234.42', 'Thiruvananthapuram', '2026-08-16 18:27:38.982043', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (647, 10, 'impression', 'direct', '157.51.234.42', 'Thiruvananthapuram', '2026-08-16 18:27:42.262996', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (648, 11, 'impression', 'direct', '157.51.234.42', 'Thiruvananthapuram', '2026-08-16 18:27:45.942993', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (649, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.234.42', NULL, '2026-08-16 18:28:04.86545', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (650, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.234.42', NULL, '2026-08-16 18:28:12.669736', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (651, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.234.42', NULL, '2026-08-16 18:28:21.90578', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (652, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.234.42', NULL, '2026-08-16 18:28:39.480658', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (653, 11, 'impression', 'direct', '157.51.234.42', 'Thiruvananthapuram', '2026-08-16 18:28:42.265763', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (654, 10, 'impression', 'direct', '157.51.234.42', 'Thiruvananthapuram', '2026-08-16 18:28:42.265763', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (655, 12, 'impression', 'direct', '157.51.234.42', 'Thiruvananthapuram', '2026-08-16 18:28:42.265763', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (656, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.234.42', NULL, '2026-08-16 18:28:46.569424', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (657, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.224.52', NULL, '2026-08-16 20:07:45.550819', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (658, 11, 'impression', 'direct', '49.37.224.52', 'Neyyattinkara', '2026-08-16 20:07:48.252673', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (659, 10, 'impression', 'direct', '49.37.224.52', 'Neyyattinkara', '2026-08-16 20:07:48.252673', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (660, 12, 'impression', 'direct', '49.37.224.52', 'Neyyattinkara', '2026-08-16 20:07:48.252673', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (661, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.224.52', NULL, '2026-08-16 20:40:37.416198', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (662, 12, 'impression', 'direct', '49.37.224.52', 'Neyyattinkara', '2026-08-16 20:40:42.519433', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (663, 11, 'impression', 'direct', '49.37.224.52', 'Neyyattinkara', '2026-08-16 20:40:43.719946', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (664, 10, 'impression', 'direct', '49.37.224.52', 'Neyyattinkara', '2026-08-16 20:40:43.719946', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (665, 10, 'impression', 'direct', '49.37.224.52', 'Neyyattinkara', '2026-08-16 20:40:56.915688', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (666, 12, 'impression', 'direct', '49.37.224.52', 'Neyyattinkara', '2026-08-16 20:40:56.915688', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (667, 12, 'impression', 'direct', '49.37.224.52', 'Neyyattinkara', '2026-08-16 20:41:07.709911', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (668, 11, 'impression', 'direct', '49.37.224.52', 'Neyyattinkara', '2026-08-16 20:41:12.508889', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (669, 10, 'impression', 'direct', '49.37.224.52', 'Neyyattinkara', '2026-08-16 20:41:12.508889', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (670, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.224.52', NULL, '2026-08-16 20:41:42.203872', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (671, 10, 'impression', 'direct', '49.37.224.52', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 20:41:45.052163', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (672, 12, 'impression', 'direct', '49.37.224.52', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 20:41:45.052163', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (673, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.224.52', NULL, '2026-08-16 20:44:04.055066', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (674, 12, 'impression', 'direct', '49.37.224.52', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 20:44:24.927657', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (675, 10, 'impression', 'direct', '49.37.224.52', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 20:44:26.120888', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (676, 11, 'impression', 'direct', '49.37.224.52', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 20:46:28.463525', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (677, 12, 'impression', 'direct', '49.37.224.52', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 20:46:34.19176', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (678, 11, 'impression', 'direct', '49.37.224.52', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 20:46:35.396025', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (679, 10, 'impression', 'direct', '49.37.224.52', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 20:46:35.396025', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (680, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.224.52', NULL, '2026-08-16 21:24:36.587952', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (681, 10, 'impression', 'direct', '49.37.224.52', 'Thiruvananthapuram', '2026-08-16 21:24:50.339355', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (682, 12, 'impression', 'direct', '49.37.224.52', 'Thiruvananthapuram', '2026-08-16 21:24:50.339355', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (683, 11, 'impression', 'direct', '49.37.224.52', 'Thiruvananthapuram', '2026-08-16 21:24:51.25437', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (684, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.224.52', NULL, '2026-08-16 21:24:52.89888', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (685, 12, 'impression', 'direct', '49.37.224.52', 'Thiruvananthapuram', '2026-08-16 21:25:11.215284', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (686, 11, 'impression', 'direct', '49.37.224.52', 'Thiruvananthapuram', '2026-08-16 21:25:12.408013', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (687, 10, 'impression', 'direct', '49.37.224.52', 'Thiruvananthapuram', '2026-08-16 21:25:12.408013', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (688, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '52.16.245.145', NULL, '2026-08-16 21:46:15.343937', '/', 'vid_2xk9of2bdb8mswc403b', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (689, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.224.52', NULL, '2026-08-16 21:55:57.088987', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (690, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.224.52', NULL, '2026-08-16 21:56:08.597945', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (691, 12, 'impression', 'direct', '49.37.224.52', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 21:57:20.341134', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (692, 12, 'impression', 'direct', '49.37.224.52', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 21:57:22.307887', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (693, 12, 'impression', 'direct', '49.37.224.52', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-16 21:57:25.653326', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (694, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.224.52', NULL, '2026-08-16 21:57:25.900856', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (695, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.224.52', NULL, '2026-08-16 21:57:30.094653', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (696, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '223.188.163.16', NULL, '2026-08-17 05:39:02.589006', '/', 'vid_a16o2jlouvjmswt00by', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (697, 10, 'impression', 'direct', '223.188.163.16', 'Detecting location...', '2026-08-17 05:39:05.687914', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (698, 12, 'impression', 'direct', '223.188.163.16', 'Detecting location...', '2026-08-17 05:39:05.687914', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (699, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '223.188.163.16', NULL, '2026-08-17 05:39:19.98386', '/', 'vid_a16o2jlouvjmswt00by', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (700, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '223.188.163.16', NULL, '2026-08-17 05:40:44.576332', '/', 'vid_a16o2jlouvjmswt00by', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (701, 11, 'impression', 'direct', '223.188.163.16', 'Thiruvananthapuram', '2026-08-17 05:40:48.297848', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (702, 10, 'impression', 'direct', '223.188.163.16', 'Thiruvananthapuram', '2026-08-17 05:40:48.297848', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (703, 12, 'impression', 'direct', '223.188.163.16', 'Thiruvananthapuram', '2026-08-17 05:40:48.297848', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (704, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '223.188.163.16', NULL, '2026-08-17 05:40:51.507588', '/', 'vid_a16o2jlouvjmswt00by', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (708, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '223.188.163.16', NULL, '2026-08-17 05:41:07.882019', '/', 'vid_a16o2jlouvjmswt00by', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (709, 12, 'impression', 'direct', '223.188.163.16', 'Thiruvananthapuram', '2026-08-17 05:41:13.065733', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (873, NULL, 'page_view', 'Direct', '49.37.234.226', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-18 18:19:55.118667', '/', 'vid_msyk0bkg_27129e5d033f4f29', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (902, NULL, 'page_view', 'Direct', '34.216.245.226', 'Portland, Oregon, US', '2026-08-18 22:17:31.300668', '/', 'vid_msz83wn3_4ef8424ac16e48f9', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.137 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (903, NULL, 'page_view', 'Direct', '34.216.245.226', 'Portland, Oregon, US', '2026-08-18 22:17:45.824033', '/', 'vid_msz84836_4698534f2fad4db8', 'Mozilla/5.0 (Linux; Android 16; SM-S931B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.137 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (929, NULL, 'page_view', 'Direct', '223.188.165.37', 'Kochi, Kerala, IN', '2026-08-19 09:29:48.613946', '/', 'vid_mszw4h75_99096c5d1d0b4b3e', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (930, 12, 'click', 'Direct', '223.188.164.2', 'Kochi, Kerala, IN', '2026-08-19 09:30:08.236377', NULL, 'vid_mszw4h75_99096c5d1d0b4b3e', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (944, NULL, 'page_view', 'Direct', '223.181.13.40', 'Kochi, Kerala, IN', '2026-08-19 15:15:00.993025', '/', 'vid_mt08gekl_fb69222b6a8e4d05', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (959, NULL, 'page_view', 'Direct', '157.51.237.156', 'Thiruvananthapuram, Kerala, IN', '2026-08-20 11:16:41.829619', '/', 'vid_mt1fdt7n_56844870b8f84a51', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (974, NULL, 'page_view', 'Direct', '34.56.103.239', 'Council Bluffs, Iowa, US', '2026-08-21 00:18:01.223473', '/', 'vid_mt27akq8_3196deb00451404b', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (985, NULL, 'page_view', 'Direct', '42.104.153.226', 'Kochi, Kerala, IN', '2026-08-22 05:40:58.624364', '/', 'vid_mt3y9r2t_706e740c866c43b7', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1000, NULL, 'page_view', 'Direct', '49.37.232.95', 'Thiruvananthapuram', '2026-08-23 05:46:29.860885', '/', 'vid_mt5duj5p_c1d5e2c62bac4f29', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/30.0 Chrome/143.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1001, NULL, 'page_view', 'Direct', '49.37.232.95', 'Thiruvananthapuram', '2026-08-23 05:47:15.568346', '/', 'vid_mt5duj5p_c1d5e2c62bac4f29', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/30.0 Chrome/143.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1012, NULL, 'page_view', 'Direct', '16.147.82.144', 'Portland, Oregon, US', '2026-08-26 19:51:52.652983', '/', 'vid_mtaiff9h_d5c445c660d64f07', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0');
INSERT INTO public.analytics_logs VALUES (1024, NULL, 'page_view', 'Direct', '172.236.122.62', 'Chicago, Illinois, US', '2026-09-01 20:35:03.48127', '/', 'vid_mtj4m2hh_6e748ace14f746ac', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1034, NULL, 'page_view', 'Direct', '42.104.156.83', 'Kochi, Kerala, IN', '2026-09-09 22:54:07.507193', '/', 'vid_mtup3q1v_5e280e3c0f1246e5', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1045, NULL, 'page_view', 'Direct', '157.51.229.30', 'Thiruvananthapuram, Kerala, IN', '2026-09-13 08:28:43.174457', '/', 'vid_mtzjy6jg_81bf1ae5027044a2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1054, NULL, 'page_view', 'Direct', '157.51.235.54', 'Unknown Location', '2026-09-16 19:35:34.761901', '/', 'vid_mu4i3byb_4093fdc93d1e470b', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (1055, 12, 'click', 'Direct', '157.51.235.54', 'Unknown Location', '2026-09-16 19:35:47.701362', NULL, 'vid_mu4i3byb_4093fdc93d1e470b', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (705, 11, 'impression', 'direct', '223.188.163.16', 'Thiruvananthapuram', '2026-08-17 05:40:54.280751', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (706, 10, 'impression', 'direct', '223.188.163.16', 'Thiruvananthapuram', '2026-08-17 05:40:54.280751', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (707, 12, 'impression', 'direct', '223.188.163.16', 'Thiruvananthapuram', '2026-08-17 05:40:54.280751', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (710, 11, 'impression', 'direct', '223.188.163.16', 'Thiruvananthapuram', '2026-08-17 05:41:50.284582', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (711, 10, 'impression', 'direct', '223.188.163.16', 'Thiruvananthapuram', '2026-08-17 05:41:50.284582', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (712, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.237.202', NULL, '2026-08-17 06:23:54.735953', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (713, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.224.58', NULL, '2026-08-17 06:54:02.693129', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (714, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.224.58', NULL, '2026-08-17 06:59:18.80893', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (715, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.239.0', NULL, '2026-08-17 07:41:03.838572', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (716, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '223.181.15.243', NULL, '2026-08-17 08:09:30.128954', '/', 'vid_9toyjos8e5kmswydin4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (717, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '223.181.15.243', NULL, '2026-08-17 08:29:35.610502', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (718, 12, 'impression', 'direct', '223.181.15.243', 'Thiruvananthapuram', '2026-08-17 08:29:45.822891', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (719, 10, 'impression', 'direct', '223.181.15.243', 'Thiruvananthapuram', '2026-08-17 08:29:47.030127', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (720, 11, 'impression', 'direct', '223.181.15.243', 'Thiruvananthapuram', '2026-08-17 08:29:51.827195', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (721, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.239.42', NULL, '2026-08-17 08:33:07.063845', '/', 'vid_qkl7ilrs8lcmswz7unn', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (722, 11, 'impression', 'direct', '157.51.239.42', 'Detecting location...', '2026-08-17 08:33:09.846026', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (723, 10, 'impression', 'direct', '157.51.239.42', 'Detecting location...', '2026-08-17 08:33:09.846026', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (724, 12, 'impression', 'direct', '157.51.239.42', 'Detecting location...', '2026-08-17 08:33:09.846026', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (725, 12, 'impression', 'direct', '157.51.239.42', 'Detecting location...', '2026-08-17 08:33:14.666289', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (726, 11, 'impression', 'direct', '157.51.239.42', 'Detecting location...', '2026-08-17 08:33:15.864903', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (727, 10, 'impression', 'direct', '157.51.239.42', 'Detecting location...', '2026-08-17 08:33:15.864903', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (728, 12, 'impression', 'direct', '157.51.239.42', 'Detecting location...', '2026-08-17 08:34:30.268103', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (729, 11, 'impression', 'direct', '157.51.239.42', 'Detecting location...', '2026-08-17 08:34:31.469259', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (730, 12, 'impression', 'direct', '157.51.239.42', 'Detecting location...', '2026-08-17 08:34:59.081575', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (731, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '223.181.15.243', NULL, '2026-08-17 08:35:31.005972', '/', 'vid_dic27m90q5imswzayhe', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (732, 11, 'impression', 'direct', '223.181.15.243', 'Detecting location...', '2026-08-17 08:35:45.782507', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (733, 10, 'impression', 'direct', '223.181.15.243', 'Detecting location...', '2026-08-17 08:35:45.782507', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (734, 12, 'impression', 'direct', '223.181.15.243', 'Detecting location...', '2026-08-17 08:35:45.782507', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (735, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.239.177', NULL, '2026-08-17 08:40:23.368766', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (736, 10, 'impression', 'direct', '157.51.239.177', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 08:40:26.233779', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (737, 12, 'impression', 'direct', '157.51.239.177', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 08:40:26.233779', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (738, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.239.177', NULL, '2026-08-17 08:40:58.694675', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (739, 11, 'impression', 'direct', '157.51.239.177', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 08:41:01.402644', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (740, 10, 'impression', 'direct', '157.51.239.177', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 08:41:01.402644', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (741, 12, 'impression', 'direct', '157.51.239.177', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 08:41:01.402644', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (742, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '34.122.147.229', NULL, '2026-08-17 09:29:48.481456', '/', 'vid_uc8s8lte8ymsx18rw7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.60 Safari/537.36 Edge/12.246');
INSERT INTO public.analytics_logs VALUES (743, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.237.17', NULL, '2026-08-17 09:44:42.97974', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (744, 10, 'impression', 'direct', '157.51.237.17', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 09:44:45.538572', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (745, 12, 'impression', 'direct', '157.51.237.17', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 09:44:45.538572', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (746, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.229.133', NULL, '2026-08-17 09:46:00.971358', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (747, 12, 'impression', 'direct', '157.51.229.133', 'Thiruvananthapuram', '2026-08-17 09:46:10.877316', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (748, 10, 'impression', 'direct', '157.51.229.133', 'Thiruvananthapuram', '2026-08-17 09:46:12.092064', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (749, 11, 'impression', 'direct', '157.51.229.133', 'Thiruvananthapuram', '2026-08-17 09:46:13.292234', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (750, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '223.188.163.16', NULL, '2026-08-17 10:23:56.783323', '/', 'vid_a16o2jlouvjmswt00by', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (751, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.238.163', NULL, '2026-08-17 10:36:14.941198', '/', 'vid_qkl7ilrs8lcmswz7unn', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (752, 11, 'impression', 'direct', '157.51.238.163', 'Thiruvananthapuram', '2026-08-17 10:36:17.493386', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (753, 10, 'impression', 'direct', '157.51.238.163', 'Thiruvananthapuram', '2026-08-17 10:36:17.493386', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (754, 12, 'impression', 'direct', '157.51.238.163', 'Thiruvananthapuram', '2026-08-17 10:36:17.493386', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (755, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.231.54', NULL, '2026-08-17 11:00:14.454376', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (756, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.231.54', NULL, '2026-08-17 11:00:26.746167', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (757, 12, 'impression', 'direct', '157.51.231.54', 'Thiruvananthapuram', '2026-08-17 11:00:30.706459', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (758, 10, 'impression', 'direct', '157.51.231.54', 'Thiruvananthapuram', '2026-08-17 11:00:31.918948', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (759, 11, 'impression', 'direct', '157.51.231.54', 'Thiruvananthapuram', '2026-08-17 11:00:35.496331', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (760, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '205.169.39.139', NULL, '2026-08-17 11:54:20.351194', '/', 'vid_48mpvjpmuxumsx6en4l', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (761, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.237.127', NULL, '2026-08-17 12:41:24.120796', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (762, 10, 'impression', 'direct', '157.51.237.127', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 12:41:26.878402', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (763, 12, 'impression', 'direct', '157.51.237.127', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 12:41:26.878402', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (764, 11, 'impression', 'direct', '157.51.237.127', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 12:41:30.438488', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (765, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.239.204', NULL, '2026-08-17 13:02:46.475585', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (766, 11, 'impression', 'direct', '157.51.239.204', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 13:03:20.360386', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (767, 12, 'impression', 'direct', '157.51.239.204', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 13:03:20.360386', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (768, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '172.253.254.48', NULL, '2026-08-17 13:03:25.071299', '/', 'vid_hacz9bamwhjmsx8vh8d', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (769, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.239.204', NULL, '2026-08-17 13:04:17.223809', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (770, 11, 'impression', 'direct', '157.51.239.204', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 13:04:19.986041', NULL, NULL, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (771, 10, 'impression', 'direct', '157.51.239.204', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 13:04:19.986041', NULL, NULL, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (772, 12, 'impression', 'direct', '157.51.239.204', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 13:04:19.986041', NULL, NULL, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (773, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.239.204', NULL, '2026-08-17 13:04:30.608536', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (774, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.239.204', NULL, '2026-08-17 13:04:31.485478', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (775, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.239.204', NULL, '2026-08-17 13:04:34.182636', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (776, 11, 'impression', 'direct', '157.51.239.204', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 13:04:38.147134', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (777, 10, 'impression', 'direct', '157.51.239.204', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 13:04:38.147134', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (778, 12, 'impression', 'direct', '157.51.239.204', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 13:04:38.147134', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (779, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.239.51', NULL, '2026-08-17 13:27:46.736656', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (780, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.236.126', NULL, '2026-08-17 13:52:16.76567', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (781, 11, 'impression', 'direct', '157.51.236.126', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 13:52:19.60739', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (782, 10, 'impression', 'direct', '157.51.236.126', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 13:52:19.60739', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (783, 12, 'impression', 'direct', '157.51.236.126', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 13:52:19.60739', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (784, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.241.207', NULL, '2026-08-17 14:29:24.508974', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (785, 10, 'impression', 'direct', '157.51.241.207', 'Thiruvananthapuram', '2026-08-17 14:29:38.308832', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (786, 12, 'impression', 'direct', '157.51.241.207', 'Thiruvananthapuram', '2026-08-17 14:29:38.308832', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (787, 11, 'impression', 'direct', '157.51.241.207', 'Thiruvananthapuram', '2026-08-17 14:29:40.438887', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (788, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '49.37.224.194', NULL, '2026-08-17 15:46:51.826103', '/', 'vid_lvbxic6fklrmsulqflr', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (789, 12, 'impression', 'direct', '49.37.224.194', 'Thiruvananthapuram', '2026-08-17 15:46:56.217379', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (790, 10, 'impression', 'direct', '49.37.224.194', 'Thiruvananthapuram', '2026-08-17 15:47:23.368037', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (791, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.239.92', NULL, '2026-08-17 19:37:10.319403', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (792, 11, 'impression', 'direct', '157.51.239.92', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 19:37:12.916579', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (793, 10, 'impression', 'direct', '157.51.239.92', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 19:37:12.916579', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (794, 12, 'impression', 'direct', '157.51.239.92', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 19:37:12.916579', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (795, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.46.190.193', NULL, '2026-08-17 19:43:52.755125', '/', 'vid_sfb3z6ajm6msxn6gb1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (798, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.46.190.193', NULL, '2026-08-17 19:44:07.376488', '/', 'vid_sfb3z6ajm6msxn6gb1', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (799, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.237.91', NULL, '2026-08-17 20:17:22.48843', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (800, 11, 'impression', 'direct', '157.51.237.91', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 20:17:24.863995', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (801, 10, 'impression', 'direct', '157.51.237.91', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 20:17:24.863995', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (802, 12, 'impression', 'direct', '157.51.237.91', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-17 20:17:24.863995', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (803, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '223.188.165.51', NULL, '2026-08-17 20:32:21.27016', '/', 'vid_6bg4hnjji4msxowst8', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (804, 11, 'impression', 'direct', '223.188.165.51', 'Delhi', '2026-08-17 20:32:25.027322', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (805, 10, 'impression', 'direct', '223.188.165.51', 'Delhi', '2026-08-17 20:32:25.027322', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (806, 12, 'impression', 'direct', '223.188.165.51', 'Delhi', '2026-08-17 20:32:25.027322', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (807, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '223.188.165.55', NULL, '2026-08-17 21:16:36.562228', '/', 'vid_6bg4hnjji4msxowst8', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (808, 11, 'impression', 'direct', '223.188.165.55', 'Delhi', '2026-08-17 21:16:39.264818', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (809, 10, 'impression', 'direct', '223.188.165.55', 'Delhi', '2026-08-17 21:16:39.264818', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (810, 12, 'impression', 'direct', '223.188.165.55', 'Delhi', '2026-08-17 21:16:39.264818', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (811, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.241.199', NULL, '2026-08-18 03:24:03.322978', '/', 'vid_tyef3xshickmsumeie2', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (812, 10, 'impression', 'direct', '157.51.241.199', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-18 03:24:05.98599', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (813, 12, 'impression', 'direct', '157.51.241.199', 'Kazhakkoottam, Thiruvananthapuram', '2026-08-18 03:24:05.98599', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (814, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.243.26', NULL, '2026-08-18 04:13:32.538186', '/', 'vid_jkeqsx1ahnmsy5dwn7', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (815, 10, 'impression', 'direct', '157.51.243.26', 'Detecting location...', '2026-08-18 04:13:35.524648', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (816, 12, 'impression', 'direct', '157.51.243.26', 'Detecting location...', '2026-08-18 04:13:35.524648', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (817, 12, 'impression', 'direct', '157.51.243.26', 'Detecting location...', '2026-08-18 04:14:13.906844', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (818, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.46.3.181', NULL, '2026-08-18 04:47:40.860812', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (819, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.46.3.181', NULL, '2026-08-18 04:47:45.060305', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (820, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '223.181.12.202', NULL, '2026-08-18 04:48:25.290524', '/', 'vid_3uhdbesuwdhmsy6mp3z', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
INSERT INTO public.analytics_logs VALUES (821, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.46.3.181', NULL, '2026-08-18 04:50:00.63688', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (822, 11, 'impression', 'direct', '157.46.3.181', 'Thiruvananthapuram', '2026-08-18 04:50:03.487011', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (823, 10, 'impression', 'direct', '157.46.3.181', 'Thiruvananthapuram', '2026-08-18 04:50:03.487011', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (824, 12, 'impression', 'direct', '157.46.3.181', 'Thiruvananthapuram', '2026-08-18 04:50:03.487011', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (825, 12, 'impression', 'direct', '157.46.3.181', 'Thiruvananthapuram', '2026-08-18 04:50:34.660827', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (826, 11, 'impression', 'direct', '157.46.3.181', 'Thiruvananthapuram', '2026-08-18 04:50:39.4805', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (827, 10, 'impression', 'direct', '157.46.3.181', 'Thiruvananthapuram', '2026-08-18 04:50:39.4805', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (828, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.46.3.181', NULL, '2026-08-18 04:50:43.004724', '/', 'vid_1oecm875dkxmsvomdi3', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (829, 11, 'impression', 'direct', '157.46.3.181', 'Thiruvananthapuram', '2026-08-18 04:50:49.091886', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (830, 10, 'impression', 'direct', '157.46.3.181', 'Thiruvananthapuram', '2026-08-18 04:50:49.091886', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (831, 12, 'impression', 'direct', '157.46.3.181', 'Thiruvananthapuram', '2026-08-18 04:50:49.091886', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (832, 12, 'impression', 'direct', '157.46.3.181', 'Thiruvananthapuram', '2026-08-18 04:51:46.661154', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (834, 10, 'impression', 'direct', '157.46.3.181', 'Thiruvananthapuram', '2026-08-18 04:51:47.816856', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (835, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.229.169', NULL, '2026-08-18 05:25:03.418018', '/', 'vid_fynk5bv1j4wmsy7xve4', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_6_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/151.0.7922.112 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (836, 10, 'impression', 'direct', '157.51.229.169', 'Detecting location...', '2026-08-18 05:25:06.009258', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_6_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/151.0.7922.112 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (837, 12, 'impression', 'direct', '157.51.229.169', 'Detecting location...', '2026-08-18 05:25:06.009258', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_6_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/151.0.7922.112 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (838, 12, 'impression', 'direct', '157.51.229.169', 'Detecting location...', '2026-08-18 05:25:26.666462', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_6_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/151.0.7922.112 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (839, 10, 'impression', 'direct', '157.51.229.169', 'Detecting location...', '2026-08-18 05:25:29.060258', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_6_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/151.0.7922.112 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (840, 11, 'impression', 'direct', '157.51.229.169', 'Detecting location...', '2026-08-18 05:25:31.455314', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_6_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/151.0.7922.112 Mobile/15E148 Safari/604.1');
INSERT INTO public.analytics_logs VALUES (841, NULL, 'page_view', 'https://offerzonline.hoztels.in/', '157.51.240.205', NULL, '2026-08-18 06:04:56.527915', '/', 'vid_jkeqsx1ahnmsy5dwn7', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (842, 10, 'impression', 'direct', '157.51.240.205', 'Thiruvananthapuram', '2026-08-18 06:04:59.084693', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');
INSERT INTO public.analytics_logs VALUES (843, 12, 'impression', 'direct', '157.51.240.205', 'Thiruvananthapuram', '2026-08-18 06:04:59.084693', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36');


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.categories VALUES (1, 'Food & Dining', 'food-dining', 'Utensils', '2026-08-15 06:53:17.124634');
INSERT INTO public.categories VALUES (2, 'Retail & Shopping', 'retail-shopping', 'ShoppingBag', '2026-08-15 06:53:17.129043');
INSERT INTO public.categories VALUES (3, 'Electronics & Tech', 'electronics-tech', 'Smartphone', '2026-08-15 06:53:17.131097');
INSERT INTO public.categories VALUES (4, 'Health & Fitness', 'health-fitness', 'Dumbbell', '2026-08-15 06:53:17.133039');
INSERT INTO public.categories VALUES (5, 'Services & Repair', 'services-repair', 'Store', '2026-08-15 06:53:17.135043');
INSERT INTO public.categories VALUES (6, 'Entertainment & Events', 'entertainment-events', 'Sparkles', '2026-08-15 06:53:17.137156');


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.site_settings VALUES (1, 'logo', '/api/uploads/ads/1786894864578-1574da.webp', '2026-08-16 15:41:06.040471');


--
-- Name: ads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ads_id_seq', 12, true);


--
-- Name: analytics_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.analytics_logs_id_seq', 1062, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 6, true);


--
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 1, true);


--
-- Name: ads ads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_pkey PRIMARY KEY (id);


--
-- Name: analytics_logs analytics_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_logs
    ADD CONSTRAINT analytics_logs_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_unique UNIQUE (slug);


--
-- Name: site_settings site_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_key_key UNIQUE (key);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: ads ads_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: analytics_logs analytics_logs_ad_id_ads_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_logs
    ADD CONSTRAINT analytics_logs_ad_id_ads_id_fk FOREIGN KEY (ad_id) REFERENCES public.ads(id) ON DELETE CASCADE;


--
-- Name: analytics_logs analytics_logs_ad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_logs
    ADD CONSTRAINT analytics_logs_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.ads(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


