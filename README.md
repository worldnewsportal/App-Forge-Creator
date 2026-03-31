# ⚡ AppForge — HTML to Native APK Converter

Convert HTML/CSS/JavaScript into **real native Flutter APK** apps with AI-powered code generation, 10 ad networks, auto-generated legal pages, and GitHub Actions CI/CD.

## 🚀 Quick Start

```bash
npm install
npm start
# Open http://localhost:3000
```

## ✨ Features

| Feature | Details |
|---------|---------|
| 📱 **HTML → Flutter** | Upload HTML/CSS/JS files or write code → Complete Flutter project |
| 🤖 **AI Code Gen** | Gemini AI + Groq fallback for generate, debug, enhance, convert |
| 💰 **10 Ad Networks** | AdMob, Meta, Unity, AppLovin, StartApp, InMobi, Vungle, ironSource, Chartboost, Pangle |
| 📜 **Legal Pages** | Auto Terms of Service, Privacy Policy, User Agreement (customized per app type) |
| 🔄 **GitHub Actions** | Ready-to-use workflow → Push repo → Get APK/AAB from artifacts |
| 📐 **Responsive** | Works on all screen sizes, Material Design 3 dark theme |
| ⚡ **Permissions** | Camera, Location, Storage, Notification, Microphone, etc. |
| 🎨 **Beautiful UI** | Professional web interface with drag & drop, code editor, AI chat |

## 📋 How It Works

1. **Upload or Write** — Drag & drop files or use the built-in code editor
2. **Configure** — Set app name, package, version, permissions, app type
3. **Add Ads** — Click ad networks, enter IDs, choose ad types
4. **AI Enhance** (optional) — Enter your API key for AI code improvement
5. **Build** — Click "Generate Flutter Project" → Download ZIP
6. **Deploy** — Push to GitHub → Actions builds APK/AAB automatically

## 🏗️ Architecture

```
appforge/
├── server/
│   ├── index.js              # Express server (API routes)
│   ├── flutter-generator.js  # Generates complete Flutter project
│   ├── ai-engine.js          # Gemini + Groq AI integration
│   ├── ad-networks.js        # 10 ad network configurations
│   └── legal-generator.js    # Terms, Privacy, Agreement pages
├── public/
│   ├── index.html            # Main web UI
│   ├── css/style.css         # Styles
│   └── js/app.js             # Frontend logic
├── github-actions/
│   └── build-apk.yml         # GitHub Actions workflow template
├── package.json
└── .env.example
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload files |
| POST | `/api/code` | Write code directly |
| POST | `/api/ai/generate` | AI code generation/debug/enhance |
| GET | `/api/ads/networks` | List all 10 ad networks |
| POST | `/api/ads/configure` | Configure ads for a build |
| POST | `/api/legal/generate` | Generate legal pages |
| POST | `/api/build` | Generate Flutter project ZIP |
| POST | `/api/pipeline` | Full pipeline (upload → legal → ads → build) |
| GET | `/api/download/:id` | Download Flutter project ZIP |
| GET | `/api/github-action/:id` | Get GitHub Actions workflow |

## 📱 Generated Flutter Project Includes

- **WebView** — `flutter_inappwebview` with JS bridge, file access, media playback
- **Splash Screen** — Animated with custom branding
- **Home Screen** — Beautiful grid layout with feature cards
- **Settings** — Notifications, legal links, app info
- **About** — Professional about page
- **Ad Integration** — Google Mobile Ads SDK ready
- **Auto Legal** — Terms, Privacy, Agreement (generated per app type)
- **All Permissions** — Configured in AndroidManifest.xml
- **GitHub Actions** — Complete CI/CD workflow
- **ProGuard** — Minification and resource shrinking enabled

## 🤖 AI Providers

### Google Gemini (Free)
- Get key: https://aistudio.google.com/apikey
- Model: `gemini-2.0-flash`
- Free tier: 15 RPM, 1M tokens/min

### Groq (Fallback)
- Get key: https://console.groq.com/keys
- Model: `llama-3.3-70b-versatile`
- Auto-fallback when Gemini quota exhausted

## 📦 Build Requirements

For local Flutter builds:
- Flutter SDK 3.24+
- Java 17
- Android SDK

For GitHub Actions builds:
- Just push the repo — everything is automated!

## 📄 License

MIT
