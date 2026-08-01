# Spam Moderation System - Deployment Guide

## Co zostało wdrożone:

### 1. **Firestore Security Rules** (`firestore.rules`)
- Rate limiting: 5 wiadomości per 4 sekundy na użytkownika
- Blokada słów zakazanych (viagra, casino, itp.)
- Walidacja wiadomości

### 2. **Cloud Functions** (`functions/src/index.ts`)

#### `moderateMessage` (Firestore Trigger)
Uruchamia się automatycznie na każną nową wiadomość:
- **Spam flood**: Jeśli użytkownik wysle 5+ wiadomości w 4 sekundy → blokada na 30 sekund
- **Podejrzane linki**: URL-e spoza whitelist → +2 punkty spamu
- **Duplikaty**: Ta sama wiadomość w ciągu 60 sekund → +1 punkt
- **Excessive CAPS**: >60% wielkich liter → +1 punkt
- **Znaki specjalne**: >50% znaków specjalnych/emoji → +1 punkt
- **Auto-ban**: Po 10 punktów spamu → użytkownik permanentnie zbanowany

#### `autoCleanupOldSpam` (Scheduled - codziennie 2 AM)
- Usuwa flagowane wiadomości starsze niż 7 dni

#### `resetExpiredRateLimits` (Scheduled - co 5 minut)
- Usuwa wygasłe rate limit blokady

---

## Deployment:

### 1. Zainstaluj Firebase CLI:
```bash
npm install -g firebase-tools
```

### 2. Zaloguj się do Firebase:
```bash
firebase login
```

### 3. Inicjalizuj projekt (jeśli nie masz firebase.json):
```bash
firebase init functions
```

### 4. Zainstaluj dependencies w folder functions:
```bash
cd functions
npm install
cd ..
```

### 5. Deploy na Firebase:
```bash
# Deploy everything
firebase deploy

# Lub tylko funkcje
firebase deploy --only functions

# Lub tylko rules
firebase deploy --only firestore:rules
```

---

## Firestore Schema (wymagane collections):

```
messages/
  {messageId}
    - userId: string
    - text: string
    - timestamp: datetime
    - flagged: boolean
    - reason: string | null
    - flaggedAt: datetime | null

rateLimits/
  {userId}
    - userId: string
    - blockedUntil: number (milliseconds)
    - reason: string
    - timestamp: datetime

spamScores/
  {userId}
    - score: number (default 0)
    - banned: boolean (default false)
    - banReason: string | null
    - lastUpdated: datetime
    - bannedAt: datetime | null

users/
  {userId}
    - banned: boolean (default false)
    - banReason: string | null
    - bannedAt: datetime | null
```

---

## Testowanie lokalnie (emulator):

```bash
# Terminal 1: Start emulator
firebase emulators:start

# Terminal 2: Run tests
npm test
```

---

## Monitoring:

Logowanie w Firebase Console:
1. Otwórz projekt w Firebase Console
2. Functions → Logs
3. Filtruj po funkcji (moderateMessage, resetExpiredRateLimits, etc.)

---

## Whitelist domen:

Edytuj `functions/src/index.ts`, sekcja `isWhitelistedDomain()`:
```typescript
const whitelist = [
  'yoursite.com',
  'lokalnie.pl',  // Dodaj swoje domeny
  'github.com',
];
```

---

## Ustawienia rate limitingu:

Zmień w `functions/src/index.ts`:
```typescript
const RATE_LIMIT_MESSAGES = 5;      // Liczba wiadomości
const RATE_LIMIT_WINDOW_MS = 4000;  // Okno czasowe (4 sekundy)
```

Np. dla 3 wiadomości per 5 sekund:
```typescript
const RATE_LIMIT_MESSAGES = 3;
const RATE_LIMIT_WINDOW_MS = 5000;
```

---

## Troubleshooting:

**Błąd: "Permission denied"**
- Sprawdź czy firestore.rules są deployowane: `firebase deploy --only firestore:rules`

**Funkcje się nie uruchamiają**
- Check logs: `firebase functions:log`
- Sprawdź czy collections istnieją w Firestore

**Rate limit nie działa**
- Sprawdź czy collection `rateLimits` istnieje
- Weryfikuj timestamp w messages
