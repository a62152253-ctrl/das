# 🎯 LOKALNIE PRO

**Platforma lokalna wyszukiwania usług i zarządzania wizytówkami biznesowych**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.4-purple)](https://vite.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4)](https://tailwindcss.com)

## 📋 O Projekcie

**LOKALNIE PRO** to zaawansowana platforma lokalna, która łączy:

- 👥 **Klientów** — szukają usług w swojej okolicy
- 🏢 **Firmy** — zarządzają wizytówkami i usługami
- 👮 **Admina** — moderuje i śledzi system

### ✨ Kluczowe Cechy

- 🔍 **Inteligentne Wyszukiwanie** — AI-powered rekomendacje z obsługą synonimów
- 💬 **Chat Realtime** — komunikacja klient ↔ firma
- 📅 **System Rezerwacji** — online booking z potwierdzeniami
- ⭐ **Opinie & Rating** — system ocen i recenzji
- 🎨 **Dark Mode** — pełne wsparcie dark theme
- 📱 **Responsive** — mobile-first design
- 🔐 **Bezpieczna Autentykacja** — Firebase Auth
- 💾 **Real-time Sync** — Firestore database

## 🚀 Szybki Start

### Wymagania

- Node.js 18+
- npm/yarn/pnpm
- Firebase project (z Firestore + Auth)

### Instalacja

```bash
# Clone repo
git clone https://github.com/a62152253-ctrl/das.git
cd das

# Zainstaluj zależności
npm install

# Skonfiguruj Firebase
# Utwórz .env.local i dodaj:
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id

# Uruchom dev server
npm run dev

# Build do produkcji
npm run build

# Preview
npm run preview
```

## 📁 Struktura Projektu

```
src/
├── components/
│   ├── admin/              # Panel admina
│   ├── auth/               # Login/Register
│   ├── client/             # Dashboard klienta
│   ├── common/             # Shared components (Navbar, Sidebar)
│   ├── company/            # Dashboard firmy
│   ├── search/             # Wyszukiwarka + bot
│   ├── chat/               # Chat system
│   ├── reviews/            # System opinii
│   └── ui/                 # Component library
├── lib/
│   ├── AuthContext.tsx     # Auth provider
│   ├── SearchEngine.ts     # Search logic
│   ├── BookingEngine.ts    # Rezerwacje
│   ├── ChatEngine.ts       # Real-time chat
│   ├── NotificationEngine.ts # Powiadomienia
│   └── firebase.ts         # Firebase config
├── types/
│   └── index.ts            # TypeScript types
├── App.tsx                 # Main app
└── main.tsx                # Entry point
```

## 🎯 Role Użytkowników

### 👤 Klient
- Wyszukiwanie usług
- Rezerwacja wizyt
- Chat z firmami
- Historia przeglądania
- Ulubione firmy
- Opiniowanie usług

### 🏢 Firma
- Zarządzanie wizytówką
- Publikowanie usług & promocji
- Zarządzanie rezerwacjami
- Real-time chat z klientami
- Statystyki & analytics
- Zarządzanie promocjami

### 👮 Admin
- Moderacja użytkowników
- Audyt systemu
- Weryfikacja GUS
- Anti-spam monitoring
- Raportowanie
- System auditowania

## 🛠️ Technologia

### Frontend
- **React 18.3** — UI framework
- **Vite 6.4** — Build tool
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **Framer Motion** — Animations
- **Lucide React** — Icons

### Backend/Database
- **Firebase** — Authentication & Database
- **Firestore** — Real-time database
- **Cloud Functions** — Serverless logic (opcjonalnie)

### DevOps
- **FTP Deploy** — Automatyczne wdrażanie
- **GitHub Actions** — CI/CD (możliwość dodania)

## 📦 NPM Scripts

```bash
npm run dev       # Dev server (port 43343)
npm run build     # Build do dist/
npm run preview   # Preview built app
npm run type-check # TypeScript check
```

## 🔐 Bezpieczeństwo

- ✅ Firebase Authentication (email/password)
- ✅ Firestore security rules
- ✅ Environment variables (.env.local)
- ✅ Input validation
- ✅ Error boundary protection
- ✅ CORS configured

## 🌐 Deployment

### Produkcja

```bash
npm run build
node deploy.js  # FTP deploy
```

Deploy script automatycznie:
1. Czyści stare pliki na serwerze
2. Przesyła nowe assets
3. Generuje raport

### Hosting
- **Obecnie:** Pure-FTP hosting
- **Alternatywy:** Vercel, Netlify, AWS S3

## 📊 Features Roadmap

- [ ] SMS notifications
- [ ] Payment integration (Stripe)
- [ ] Google Maps integration
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Email notifications

## 🐛 Known Issues

- Bundle size > 500KB (consider code-splitting)
- Firebase imports in admin panels increase chunk size

## 💡 Contributing

1. Fork projekt
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

Ten projekt jest licencjonowany na warunkach MIT — zobacz plik [LICENSE](LICENSE)

## 👨‍💻 Author

**Andrzej** — Full Stack Developer

- GitHub: [@a62152253-ctrl](https://github.com/a62152253-ctrl)
- Email: andrzej.dev@example.com

## 📞 Support

Masz pytania? Otwórz issue na GitHubie lub skontaktuj się bezpośrednio.

## 🙏 Acknowledgments

- React team za świetny framework
- Firebase za real-time database
- Tailwind CSS za utility classes
- Lucide React za ikony
- Framer Motion za animacje

---

**Zbudzone z ❤️ dla lokalnych biznesów**

[⬆ Back to top](#lokalnie-pro)
