"use client";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const lat = searchParams.get("lat") || "0";
  const lng = searchParams.get("lng") || "0";
  const format = searchParams.get("format") || "responsive";

  const host = req.nextUrl.origin;
  const serveUrl = `${host}/api/ads/serve?lat=${lat}&lng=${lng}&format=${format}&limit=1`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { margin: 0; padding: 0; background: #020617; font-family: system-ui, sans-serif; overflow: hidden; }
          .ad-container { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; }
          img, video { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
          .ad-link { text-decoration: none; width: 100%; height: 100%; display: block; }
          .fallback { color: #64748b; font-size: 12px; text-align: center; }
        </style>
      </head>
      <body>
        <div id="ad" class="ad-container">
          <div class="fallback">Loading offer...</div>
        </div>
        <script>
          fetch('${serveUrl}')
            .then(res => res.json())
            .then(data => {
              const ad = data.ads && data.ads[0];
              const container = document.getElementById('ad');
              if (ad) {
                const target = '${host}/api/track/click?ad_id=' + ad.id;
                const media = ad.media_type === 'video' 
                  ? '<video src="' + ad.media_url + '" autoplay loop muted playsinline></video>'
                  : '<img src="' + ad.media_url + '" alt="' + ad.title + '" />';
                container.innerHTML = '<a class="ad-link" href="' + target + '" target="_blank">' + media + '</a>';
                
                // Track impression
                fetch('${host}/api/track/impression', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ adId: ad.id, referrer: document.referrer, userLocation: 'Embedded' })
                });
              } else {
                container.innerHTML = '<div class="fallback">Offerzonline Sponsored Ad</div>';
              }
            })
            .catch(() => {
              document.getElementById('ad').innerHTML = '<div class="fallback">Offerzonline</div>';
            });
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
