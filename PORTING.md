# PORTING.md — Moving the new site to medeon.ai

**Context for whoever does this** (a developer, Claude Code, or future Jim):
The new site is an Astro static site. Content is edited via Pages CMS (app.pagescms.org), stored in the GitHub repo `JimNadackal/medeon-site`, and auto-deployed by GitHub Actions to GitHub Pages at `https://jimnadackal.github.io/medeon-site/`. The old site is WordPress on an OVH VPS (IP 51.79.223.113). The goal is to make **https://medeon.ai** serve the new site.

There are two ways to do this. **Option A is strongly recommended.**

---

## Option A (recommended): Point the domain at GitHub Pages, retire the VPS

Keep the free hosting forever. The VPS becomes unnecessary. Zero servers to maintain, zero WordPress updates, zero security patching. This is the modern default for a static marketing site.

### Prerequisites
- Login for the **domain registrar** (wherever medeon.ai was purchased — check the OVH account first; it may be registered there)
- Admin access to the `JimNadackal/medeon-site` GitHub repo

### Steps (~30 min + DNS wait time)
1. **Get final content in.** Make sure images no longer reference `medeon.ai/wp-content/...` URLs (see "Image migration" below). This MUST happen before WordPress goes offline. *(Done 2026-07-06 — grep is clean.)*
2. **Add these DNS records at the current DNS provider** (leave all other records, especially **MX records for email**, exactly as they are — GitHub Pages only needs the records below, no nameserver change):
   - Four **A records** for the apex `medeon.ai` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - (Optional, for IPv6) four **AAAA records** → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - One **CNAME record** for `www` → `jimnadackal.github.io`
   - Delete/replace the old A record pointing at the VPS (`51.79.223.113`) — this is the actual switch moment
3. **Add the custom domain in the repo:** GitHub → repo **Settings → Pages → Custom domain** → enter `medeon.ai` → Save. Or via CLI:
   ```
   gh api -X PUT repos/JimNadackal/medeon-site/pages -f cname=medeon.ai
   ```
4. **Update `astro.config.mjs`:** set `site: 'https://medeon.ai'` and remove the `base: '/medeon-site'` line (the site will now live at the domain root). Commit — the site redeploys automatically.
5. Wait for DNS propagation (minutes to 24h), then in **Settings → Pages** tick **Enforce HTTPS** (GitHub issues the certificate automatically once DNS resolves; the checkbox may take up to a day to become available).
6. Verify: `https://medeon.ai` and `https://www.medeon.ai` show the new site with a valid HTTPS certificate.
7. **Keep the OVH VPS running for 2 weeks** as a fallback, then take a final backup of WordPress (files + database) and cancel the VPS.

### Rollback
Point the apex A record back to `51.79.223.113` and remove the custom domain from repo Settings → Pages. The WordPress site is untouched until the VPS is cancelled.

---

## Option B: Serve the static site from the OVH VPS itself

Only choose this if there's a hard requirement to self-host (there usually isn't for a static site). You keep paying for and patching a server.

### Prerequisites
- SSH access to the VPS (`ssh user@51.79.223.113`) — get credentials from whoever set up WordPress
- The VPS runs a web server (likely Apache or Nginx) currently serving WordPress

### Steps
1. Build the site: `npm install && npm run build` → produces `dist/`
2. Copy `dist/` to the server: `scp -r dist/* user@51.79.223.113:/var/www/medeon/`
3. Update the web server config to serve `/var/www/medeon` as the document root for medeon.ai instead of the WordPress directory. For Nginx:
   ```
   server {
     listen 443 ssl;
     server_name medeon.ai www.medeon.ai;
     root /var/www/medeon;
     index index.html;
     # keep existing ssl_certificate lines
     location / { try_files $uri $uri/index.html =404; }
   }
   ```
   For Apache: change `DocumentRoot` in the virtual host, keep the certbot SSL lines.
4. Reload the web server (`sudo systemctl reload nginx` or `apache2`)
5. **Downside to accept:** every CMS edit now requires a manual rebuild + re-upload, unless you add a GitHub Action that builds and rsyncs to the VPS on every commit. If choosing Option B, set up that action (ask Claude Code: "create a GitHub Action that builds this Astro site and deploys dist/ to my server via rsync over SSH").

---

## Image migration (required for BOTH options)

Current shortcut: all images reference the live WordPress URLs (e.g. `https://medeon.ai/wp-content/uploads/2025/09/avinash.png`). Once WordPress is off, those break.

1. Download every image referenced in `content/*.json` and `content/team/*.md` — search the repo for `medeon.ai/wp-content` to list them all
2. Two ways to bring them in:
   - **Non-technical way:** open each item in Pages CMS and re-upload the downloaded image via the image field. The CMS stores it in `public/images/` automatically.
   - **Technical way:** drop files into `public/images/` and update the paths in content files to `/images/filename.png`
3. Verify zero remaining references: `grep -r "wp-content" content/` should return nothing
4. Don't forget the two logos in Site Settings (`settings.json`)

---

## Pre-switch checklist

- [ ] All images migrated off wp-content URLs (grep returns nothing)
- [ ] All content reviewed by the team in Pages CMS
- [ ] Every existing DNS record (especially **MX / email records**) copied to the new DNS provider
- [ ] Contact form decision made (email link is fine; forms need Web3Forms/Formspree)
- [ ] Final WordPress backup taken (files + database) and stored somewhere safe
- [ ] Old site kept reachable for 2 weeks post-switch before cancelling anything

## Things that will NOT carry over from WordPress automatically

- The cookie-consent banner plugin (add a lightweight script like https://cookieconsent.orestbida.com if analytics/ads cookies are used; a static site with no tracking may not need one)
- Any WordPress contact-form submissions history
- SEO plugins' redirect rules (the new site keeps the same 4 URLs — `/`, `/services`, `/our-team`, `/contact-us` — so no redirects should be needed)
