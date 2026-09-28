# CineSuggest 🎬

Android εφαρμογή προτάσεων ταινιών/σειρών, χτισμένη με **React Native (Expo)**.
Δεδομένα από το **TMDB API**. Ελληνικά/Αγγλικά, Dark/Light mode, offline
Watchlist (SQLite), Swipe mode, αναζήτηση με φίλτρα (κατηγορία/έτος/ηθοποιός).

---

> **Σημείωση εκδόσεων:** Το `package.json` είναι κλειδωμένο σε **Expo SDK 57**
> (React Native 0.86.3, React 19.2.3) — τις ακριβείς εκδόσεις που το ίδιο το
> Expo δηλώνει συμβατές μεταξύ τους. Το `npm install` + `npx expo prebuild -p android`
> + `npx expo export -p android` (πλήρες bundling του JS σε 1088 modules)
> έχουν δοκιμαστεί και περνάνε καθαρά. Το `package-lock.json` περιλαμβάνεται
> στο zip — μην το σβήνεις, εγγυάται ότι θα κατέβουν ακριβώς οι ίδιες,
> δοκιμασμένες εκδόσεις.

## 1. Προαπαιτούμενα (Prerequisites)

- **Node.js** 18 ή 20 LTS — https://nodejs.org
- **npm** (έρχεται με το Node)
- **Android Studio** (Giraffe ή νεότερο) με εγκατεστημένο Android SDK
  (API 34) — https://developer.android.com/studio
- Java 17 (έρχεται ενσωματωμένο με το Android Studio)
- (Προαιρετικά) λογαριασμός [Expo](https://expo.dev) αν θες cloud build (EAS)

Το TMDB API key είναι ήδη ενσωματωμένο στο `src/api/tmdb.js`.

---

## 2. Εγκατάσταση εξαρτήσεων

Αποσυμπίεσε το zip και μέσα στο φάκελο `CineSuggest/` τρέξε:

```bash
npm install
```

---

## 3. Γρήγορη δοκιμή (χωρίς Android Studio)

Για γρήγορο preview στο κινητό σου μέσω της εφαρμογής **Expo Go**:

```bash
npx expo start
```

Σκάναρε το QR code με το Expo Go app (Android/iOS). Ιδανικό για γρήγορο
έλεγχο, αλλά για τελικό .apk/.aab χρειάζεται η παρακάτω διαδικασία.

---

## 4. Export μέσω Android Studio (native build)

Το project είναι σε "managed" Expo workflow. Για να πάρεις τον native
Android φάκελο που ανοίγει σε Android Studio, τρέξε:

```bash
npx expo prebuild -p android
```

Αυτό δημιουργεί το φάκελο `android/` με πλήρες Gradle project.

### Άνοιγμα στο Android Studio

1. Άνοιξε το **Android Studio**
2. `File → Open...` → επίλεξε το φάκελο `CineSuggest/android`
3. Περίμενε το Gradle sync να ολοκληρωθεί
4. Σύνδεσε συσκευή (USB debugging ενεργό) ή ξεκίνα Emulator
5. Πάτα **Run ▶** για εγκατάσταση/εκτέλεση

### Δημιουργία τελικού APK / AAB από το Android Studio

- **APK (για δοκιμή/sideload):**
  `Build → Build Bundle(s) / APK(s) → Build APK(s)`
  Το αρχείο βγαίνει στο `android/app/build/outputs/apk/release/`

- **AAB (για Google Play):**
  `Build → Generate Signed Bundle / APK...` → επίλεξε **Android App Bundle**
  → δημιούργησε/χρησιμοποίησε keystore → **release**
  Το αρχείο βγαίνει στο `android/app/build/outputs/bundle/release/`

### Εναλλακτικά, από τερματικό (χωρίς UI του Android Studio)

```bash
cd android
./gradlew assembleRelease      # -> app/build/outputs/apk/release/app-release.apk
./gradlew bundleRelease        # -> app/build/outputs/bundle/release/app-release.aab
```

> Για **signed release build** πρέπει πρώτα να δημιουργήσεις keystore:
> ```bash
> keytool -genkeypair -v -keystore cinesuggest.keystore -alias cinesuggest \
>   -keyalg RSA -keysize 2048 -validity 10000
> ```
> και να ρυθμίσεις τα στοιχεία του στο `android/gradle.properties` και
> `android/app/build.gradle` (`signingConfigs`), όπως περιγράφεται στην
> επίσημη τεκμηρίωση React Native:
> https://reactnative.dev/docs/signed-apk-android

### Build μέσω EAS (cloud, χωρίς τοπικό Android SDK) — προαιρετικό

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

---

## 5. Git — ανέβασμα στο GitHub

Μέσα στο φάκελο `CineSuggest/`:

```bash
git init
git add .
git commit -m "Initial commit: CineSuggest app"
git branch -M main
git remote add origin https://github.com/<το-username-σου>/cinesuggest.git
git push -u origin main
```

> Σημείωση: το `.gitignore` εξαιρεί τα `node_modules/` και `android/`
> (ο φάκελος `android/` παράγεται ξανά όποτε χρειάζεται με
> `npx expo prebuild -p android`, οπότε δεν χρειάζεται να μπει στο git).
> Αν θες να κρατάς τον native android φάκελο μέσα στο repo (π.χ. επειδή
> τον επεξεργάζεσαι απευθείας στο Android Studio χωρίς να ξανατρέχεις
> prebuild), απλά σβήσε τη γραμμή `android/` από το `.gitignore` πριν
> κάνεις commit.

---

## 6. Δομή Project

```
CineSuggest/
├── App.js                     # Root component (splash, providers, gate)
├── app.json                   # Expo config (όνομα, icon, splash, package)
├── src/
│   ├── api/tmdb.js             # TMDB API client (search, discover, details)
│   ├── db/database.js          # SQLite (preferences, watchlist)
│   ├── context/AppContext.js   # Global state (preferences, watchlist actions)
│   ├── theme/                  # Dark/Light theming (χρώματα του logo)
│   ├── i18n/                   # el.json / en.json μεταφράσεις
│   ├── navigation/RootNavigator.js  # Tabs + stacks + Android back button
│   ├── components/             # MovieCard, Carousel, GenreChip
│   └── screens/
│       ├── SplashScreen.js
│       ├── OnboardingScreen.js
│       ├── HomeScreen.js
│       ├── QuickPickResultsScreen.js
│       ├── SwipeScreen.js
│       ├── DetailScreen.js
│       ├── LibraryScreen.js
│       ├── SearchScreen.js
│       └── SettingsScreen.js
└── assets/                     # logo, icon, splash images
```

## 7. Λειτουργίες που υλοποιήθηκαν

- ✅ Splash screen με το πλήρες logo (όχι σε κύκλο) για ≥1 δευτερόλεπτο
- ✅ Dark / Light / System mode με τα χρώματα του logo (navy + πορτοκαλί)
- ✅ Ελληνικά / Αγγλικά με εναλλαγή από τις Ρυθμίσεις
- ✅ Android hardware back button: pop στο stack, exit-confirmation dialog στη ρίζα
- ✅ Onboarding (genres + streaming providers) αποθηκευμένο σε SQLite
- ✅ Home dashboard: Mood Matcher (1 ώρα / κωμωδία / θρίλερ / τυχαίο), Trending, Top Series
- ✅ Swipe Suggest mode (σύρε δεξιά/αριστερά)
- ✅ Detail screen: σύνοψη, trailer (YouTube), streaming διαθεσιμότητα (GR region), cast
- ✅ My Library: Watchlist / Watched tabs, ταξινόμηση, personal rating
- ✅ Αναζήτηση με φίλτρα: κατηγορία, έτος, ηθοποιός, τύπος (ταινία/σειρά)

## 8. Επόμενα βήματα (προαιρετικά)

- Custom app signing για δημοσίευση στο Google Play
- Push notifications για νέες κυκλοφορίες αγαπημένων ειδών
- Caching εικόνων (π.χ. `expo-image`) για γρηγορότερη φόρτωση
