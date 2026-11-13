/*
 * Downloads the live sitemap from the backend into public/sitemap.xml before every
 * `npm run build` (wired through the "prebuild" script in package.json), so the file is
 * served from https://beautyhaat.com/sitemap.xml - the same host as the pages.
 *
 * Google only accepts a sitemap hosted on the same host as the URLs listed in it, which is
 * why https://api.beautyhaat.com/sitemap.xml was never picked up.
 *
 * This script NEVER fails the build: if the API is unreachable it keeps any existing
 * public/sitemap.xml and prints a warning.
 *
 * Override the source with:  SITEMAP_SOURCE=https://... npm run build
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const SOURCE = process.env.SITEMAP_SOURCE || 'https://api.beautyhaat.com/sitemap.xml';
const TARGET = path.join(__dirname, '..', 'public', 'sitemap.xml');
const TIMEOUT_MS = 30000;

function warn(message) {
    console.warn(`[fetch-sitemap] WARNING: ${message}`);
    if (fs.existsSync(TARGET)) {
        console.warn('[fetch-sitemap] Keeping the existing public/sitemap.xml');
    } else {
        console.warn('[fetch-sitemap] No public/sitemap.xml was written. Serve /sitemap.xml another way (see deploy/cloudflare-sitemap-worker.js).');
    }
}

const request = https.get(SOURCE, { headers: { Accept: 'application/xml', 'User-Agent': 'beautyhaat-build' } }, (res) => {
    if (res.statusCode !== 200) {
        res.resume();
        warn(`${SOURCE} returned HTTP ${res.statusCode}`);
        return;
    }
    const chunks = [];
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        if (!body.includes('<urlset') || !body.includes('</urlset>')) {
            warn('response is not a valid sitemap (<urlset> not found)');
            return;
        }
        fs.writeFileSync(TARGET, body, 'utf8');
        const count = (body.match(/<url>/g) || []).length;
        console.log(`[fetch-sitemap] Wrote public/sitemap.xml with ${count} URLs`);
    });
});

request.setTimeout(TIMEOUT_MS, () => {
    request.destroy(new Error(`timed out after ${TIMEOUT_MS / 1000}s`));
});
request.on('error', (err) => warn(err.message));
