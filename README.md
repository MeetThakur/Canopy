<div align="center">

# 🌿 Canopy

**Your personal media tracker — books, movies, TV shows & games, all in one place.**

![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-black?style=flat-square)
![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-000020?style=flat-square&logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/license-Private-red?style=flat-square)

</div>

---

## ✨ Features

- 📚 **Books** — powered by [Hardcover](https://hardcover.app)
- 🎬 **Movies** — powered by [OMDB](https://www.omdbapi.com) & [TVMaze](https://www.tvmaze.com)
- 📺 **TV Shows** — powered by [TVMaze](https://www.tvmaze.com)
- 🎮 **Games** — powered by [IGDB](https://www.igdb.com)
- 🗂 **Library** — track status (Want / In Progress / Completed) with ratings & notes
- 🔍 **Explore** — unified search with per-category filtering & recent search history
- 📊 **Profile** — personal stats, streaks and activity overview
- 🌙 **Dark / Light mode** — follows system preference
- 💾 **Offline-first** — all data stored locally on-device via AsyncStorage
- 📤 **Backup & Restore** — export and import your library as JSON
- 🎨 **Custom covers** — pick any photo from your gallery as a cover image

---

## 📸 Screenshots

> _Coming soon_

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- An Android or iOS device / emulator

### 1. Clone the repo

```bash
git clone https://github.com/MeetThakur/Canopy.git
cd Canopy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your API keys (see [API Keys](#-api-keys) below).

### 4. Start the dev server

```bash
npm start
```

Scan the QR code with [Expo Go](https://expo.dev/client) on your phone, or press `a` to open on an Android emulator.

---

## 🔑 API Keys

Canopy uses free-tier APIs. Sign up once and paste your keys into `.env`.

| Service | Used For | Get Key |
|---|---|---|
| **TMDB** | Movie/TV metadata & posters | [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) |
| **OMDB** | Movie details & ratings | [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx) |
| **IGDB** | Game search & metadata | [dev.twitch.tv/console](https://dev.twitch.tv/console) (requires Twitch account) |
| **Hardcover** | Book search & metadata | [hardcover.app/account/api](https://hardcover.app/account/api) |

> **TVMaze** requires no API key — it's completely free and open.

> ⚠️ Never commit your `.env` file. It is gitignored by default.

---

## 🏗 Project Structure

```
canopy/
├── api/                  # API clients (books, games, movies, unified)
├── app/
│   ├── (tabs)/           # Tab screens (Home, Explore, Library, Profile)
│   ├── media/            # Media detail & preview screens
│   ├── onboarding.tsx    # First-launch onboarding
│   └── settings.tsx      # Settings, backup & restore
├── components/
│   ├── home/             # Home screen components
│   ├── media/            # Shared media UI components
│   ├── sheets/           # Bottom sheets (Add media, Edit, etc.)
│   └── ui/               # Generic UI primitives
├── constants/            # Colors, typography, spacing tokens
├── hooks/                # Custom React hooks (useTheme, etc.)
├── stores/               # Zustand state stores (library, search, stats)
├── types/                # TypeScript type definitions
└── utils/                # Helper utilities
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) SDK 54 + [Expo Router](https://expo.github.io/router) |
| UI | [React Native](https://reactnative.dev) 0.81 |
| Language | [TypeScript](https://www.typescriptlang.org) 5.9 |
| State | [Zustand](https://zustand-demo.pmnd.rs) with persistence |
| Storage | [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) |
| Images | [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) |
| Icons | [Lucide React Native](https://lucide.dev) |
| Fonts | DM Sans, DM Serif Display, Jost (Google Fonts) |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Lists | [@shopify/flash-list](https://shopify.github.io/flash-list/) |

---

## 📦 Building a Release APK

> Requires Android Studio and JDK 17+ installed.

```powershell
# Set JAVA_HOME to Android Studio's bundled JDK
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

# Run prebuild to sync native code
npx expo prebuild --platform android

# Build release APK (ARM64)
cd android
./gradlew.bat assembleRelease -Dabi=arm64-v8a
```

The output APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔒 Security

- All API keys are loaded via `process.env.EXPO_PUBLIC_*` — never hardcoded in source.
- `.env` is gitignored. Use `.env.example` as a template.
- All user data is stored **locally on-device only** — nothing is sent to any server.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📝 License

Private project by [Meet Thakur](https://github.com/MeetThakur). All rights reserved.
