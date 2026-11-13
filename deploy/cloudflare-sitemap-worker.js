/*
 * OPTIONAL (recommended if beautyhaat.com is proxied by Cloudflare).
 *
 * Serves https://beautyhaat.com/sitemap.xml live from the backend, so it is always fresh
 * (no rebuild needed when products change).
 *
 * Setup:
 *   1. Cloudflare dashboard -> Workers & Pages -> Create -> Worker -> paste this file -> Deploy
 *   2. Worker -> Settings -> Domains & Routes -> Add -> Route
 *        Zone:  beautyhaat.com
 *        Route: beautyhaat.com/sitemap.xml
 *   3. Check: open https://beautyhaat.com/sitemap.xml  (must show XML, not the website)
 *
 * If this route is active it wins over the static public/sitemap.xml produced at build time.
 */
export default {
    async fetch() {
        const upstream = await fetch('https://api.beautyhaat.com/sitemap.xml', {
            cf: { cacheTtl: 3600, cacheEverything: true },
        });
        return new Response(upstream.body, {
            status: upstream.status,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    },
};
