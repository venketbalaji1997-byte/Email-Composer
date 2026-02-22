# ✉️ Email Composer — AI-Powered Professional Emails

Turn rough thoughts into polished professional emails with Claude AI. Automatically embeds relevant ManageEngine documentation links for support teams.

---

## 🚀 Quick Start (Local Dev)

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 🌐 Deploy to the Internet

### Option A — Netlify (Recommended, free)

```bash
# 1. Install dependencies & build
npm install
npm run build

# 2. Install Netlify CLI
npm install -g netlify-cli

# 3. Deploy
netlify deploy --prod --dir=dist
```

Or drag-and-drop the `dist/` folder at https://app.netlify.com/drop

### Option B — Vercel (free)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy (one command!)
npx vercel --prod
```

Follow the prompts — it auto-detects Vite.

### Option C — GitHub Pages

```bash
# 1. Add base path to vite.config.js:
#    base: '/your-repo-name/'

# 2. Install gh-pages
npm install --save-dev gh-pages

# 3. Add to package.json scripts:
#    "deploy": "gh-pages -d dist"

# 4. Build & deploy
npm run build
npm run deploy
```

---

## 📁 Project Structure

```
email-composer/
├── index.html              # HTML entry point
├── vite.config.js          # Vite config
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx            # React entry
    ├── index.css           # Global reset
    ├── App.jsx             # Main component
    └── App.module.css      # All styles (CSS Modules)
```

---

## ✨ Features

- **AI email generation** via Claude API (claude-sonnet)
- **6 tone options**: Formal, Warm, Concise, Technical, Apologetic, Proactive
- **Reply context**: Paste the original email for contextual replies
- **Auto doc detection**: Embeds relevant ManageEngine docs based on keywords
- **Copy to clipboard** button on generated email
- **Animated canvas background** with floating orbs
- **Fully responsive** mobile layout

---

## 📚 ManageEngine Documentation Sources

| Product | Help Center | Logs Guide |
|---------|------------|------------|
| MDM | https://www.manageengine.com/mobile-device-management/help/ | https://www.manageengine.com/mobile-device-management/how-to/logs-how-to.html |
| Desktop Central | https://www.manageengine.com/products/desktop-central/help/ | https://www.manageengine.com/products/desktop-central/logs-how-to.html |

Keywords that trigger automatic doc embedding: `mdm`, `mobile device`, `enrollment`, `profile`, `policy`, `desktop central`, `patch`, `software deployment`, `remote control`, `endpoint`, and more.

---

## 🛠 Tech Stack

- **React 18** + **Vite 5**
- **CSS Modules** (no CSS-in-JS dependency)
- **Google Fonts**: Fraunces + DM Sans
- **Claude API**: `claude-sonnet-4-20250514`
- Zero UI library dependencies
