# Medeon Website

The new medeon.ai — a fast, static website with a simple editing screen for the team.

**How it works, in one line:** Content lives in simple files → GitHub stores them → Cloudflare Pages turns them into the live site → Pages CMS gives the team a friendly editing screen.

---

## Launch checklist (do these in order, ~20 minutes total)

Each step is under 5 minutes. Do one, take a break if you need, come back.

### Step 1 — Put the code on GitHub (5 min)
1. Create a free account at https://github.com (if you don't have one)
2. Create a new **private** repository called `medeon-site`
3. Upload this folder. Easiest way without command line: on the empty repo page, click "uploading an existing file" and drag the whole folder contents in.
   - Command line alternative:
     ```
     cd medeon-site
     git init && git add -A && git commit -m "Initial site"
     git remote add origin https://github.com/YOUR-USERNAME/medeon-site.git
     git push -u origin main
     ```

### Step 2 — Host it free on Cloudflare Pages (5 min)
1. Create a free account at https://dash.cloudflare.com
2. Go to **Workers & Pages → Create → Pages → Connect to Git**
3. Pick your `medeon-site` repo
4. Settings: Framework preset = **Astro**. Build command = `npm run build`. Output directory = `dist`. Leave the rest alone.
5. Click **Save and Deploy**

You now have a live site at `medeon-site.pages.dev`. Done. It rebuilds itself automatically every time content changes.

### Step 3 — Turn on the editing screen (5 min)
1. Go to https://app.pagescms.org
2. Sign in with the same GitHub account
3. Select the `medeon-site` repo
4. You'll see: Home Page, Services Page, Team Members, Contact Page, Site Settings — all as simple forms with text boxes and image upload buttons

That's the whole CMS. No training needed.

### Step 4 — Invite the other 3 founders (5 min)
1. Each founder creates a free GitHub account (one-time, 3 minutes)
2. In your GitHub repo: **Settings → Collaborators → Add people** — add each founder
3. They sign into https://app.pagescms.org with their GitHub account and see the same editing screens

---

## How the team edits content (the daily routine)

1. Go to **app.pagescms.org**, sign in
2. Click the page you want to change (e.g. "Team Members")
3. Edit text in the boxes, or click an image field to upload a new picture
4. Click **Save**
5. Wait ~1 minute. The live site updates itself.

That's it. Every change is saved with history, so nothing can ever be permanently broken — any change can be rolled back in GitHub.

## For developers (or Claude Code)

```
npm install     # once
npm run dev     # local preview at localhost:4321
npm run build   # produces static site in dist/
```

- Page templates: `src/pages/*.astro`
- Design system: `src/styles/global.css`
- All editable content: `content/` (JSON + Markdown — never hardcode content in templates)
- CMS field definitions: `.pages.yml`

## Known temporary shortcuts (fix before going live on medeon.ai)

1. **Images still point to the old WordPress site** (medeon.ai URLs). They work now, but will break when WordPress is switched off. Fix: download each image, upload via the CMS image fields (or drop into `public/images/`). See PORTING.md.
2. **No contact form yet** — the contact page shows offices + an email link. If you want a real form, the free option is https://web3forms.com or https://formspree.io (5-minute add).
