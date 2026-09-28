# CineSuggest 🎬

**EN** · [Ελληνικά](#ελληνικά)

I built CineSuggest because I kept losing 20 minutes every evening scrolling through streaming apps without picking anything. It's an Android app that suggests movies and series quickly, based on your taste and mood.

Built with React Native (Expo). Data comes from the [TMDB API](https://www.themoviedb.org/).

## Features

- Splash screen with the full logo
- Light / Dark / System theme, using the logo colors (navy and orange)
- Greek and English, switchable from Settings
- Android back button support, with an exit confirmation on the home screen
- Onboarding: pick favorite genres and streaming platforms (saved in SQLite)
- Home: Quick Pick (I have 1 hour / Make me laugh / Edge of my seat / Surprise me), Trending, Top Series
- Swipe mode: right to save, left to skip, tap for details
- Details: synopsis, trailer, where to stream in Greece, cast
- Library: Watchlist and Watched, sorting, personal 1–5 star rating
- Search by title, genre, year or actor, for movies and series

## Requirements

- Node.js 20 LTS
- **JDK 17** (not 24 or newer, see Troubleshooting)
- Android Studio with the Android SDK, plus **NDK (Side by side)** and **CMake** from SDK Manager

## Setup

```bash
npm install
npx expo prebuild -p android
```

The TMDB key is in `src/api/tmdb.js`. If you fork this, use your own key.

## Run

Quick preview on a phone with Expo Go:

```bash
npx expo start
```

Build the APK:

```bash
cd android
gradlew assembleRelease
```

The APK is at `android/app/build/outputs/apk/release/app-release.apk`.

A debug build (`assembleDebug`) doesn't include the JavaScript. It needs Metro running (`npx expo start`), otherwise you get "Unable to load script". For a standalone APK use `assembleRelease`.

For Google Play you need your own keystore and signing config.

## Troubleshooting

**`A restricted method in java.lang.System has been called`** (fails at `configureCMakeDebug`)
Gradle is running on JDK 24 or newer. Use JDK 17: set `JAVA_HOME` to it and add this to `android/gradle.properties`:

```properties
org.gradle.java.home=C:/Program Files/Eclipse Adoptium/jdk-17.0.19.10-hotspot
```

Also check `gradlew --version`. If "Daemon JVM" says Java 25, delete `android/gradle/gradle-daemon-jvm.properties` (Android Studio's "Update Daemon JVM" creates it), then run `gradlew --stop`.

**`[CXX5304] ... SDK XML versions up to 3`**
Delete the `ndk` and `cmake` folders inside your Android SDK folder, close Android Studio, and reinstall them from SDK Manager → SDK Tools.

**Version errors after `npm install`**
Keep `package-lock.json`. The versions are pinned to Expo SDK 57 and tested together.

## Project structure

```
CineSuggest/
├── App.js
├── app.json
├── src/
│   ├── api/tmdb.js
│   ├── db/database.js
│   ├── context/AppContext.js
│   ├── theme/
│   ├── i18n/
│   ├── navigation/RootNavigator.js
│   ├── components/
│   └── screens/
└── assets/
```

## Git

`android/` is in `.gitignore` because `npx expo prebuild -p android` generates it again. Remove that line if you want to keep the native folder in the repo.

---

# Ελληνικά

Έφτιαξα το CineSuggest γιατί κάθε βράδυ έχανα 20 λεπτά σκρολάροντας στις streaming εφαρμογές χωρίς να διαλέξω τίποτα. Είναι μια Android εφαρμογή που προτείνει γρήγορα ταινίες και σειρές, με βάση το γούστο και τη διάθεσή σου.

Φτιαγμένο με React Native (Expo). Τα δεδομένα έρχονται από το [TMDB API](https://www.themoviedb.org/).

## Λειτουργίες

- Splash screen με ολόκληρο το logo
- Φωτεινό / Σκούρο / Του συστήματος, με τα χρώματα του logo (navy και πορτοκαλί)
- Ελληνικά και Αγγλικά, με αλλαγή από τις Ρυθμίσεις
- Υποστήριξη του κουμπιού Πίσω του Android, με επιβεβαίωση εξόδου στην αρχική
- Onboarding: επιλογή αγαπημένων ειδών και πλατφορμών (αποθηκεύονται σε SQLite)
- Αρχική: Γρήγορη Επιλογή (Έχω 1 ώρα / Θέλω να γελάσω / Αγωνία στο κατακόρυφο / Ρίξε Ζάρι), Δημοφιλή, Κορυφαίες Σειρές
- Swipe mode: δεξιά για αποθήκευση, αριστερά για παράκαμψη, πάτημα για λεπτομέρειες
- Λεπτομέρειες: σύνοψη, trailer, πού παίζεται στην Ελλάδα, ηθοποιοί
- Βιβλιοθήκη: Watchlist και Είδα, ταξινόμηση, προσωπική βαθμολογία 1–5 αστέρια
- Αναζήτηση με τίτλο, είδος, έτος ή ηθοποιό, για ταινίες και σειρές

## Απαιτήσεις

- Node.js 20 LTS
- **JDK 17** (όχι 24 και πάνω, δες Αντιμετώπιση προβλημάτων)
- Android Studio με το Android SDK, και **NDK (Side by side)** και **CMake** από το SDK Manager

## Εγκατάσταση

```bash
npm install
npx expo prebuild -p android
```

Το TMDB key βρίσκεται στο `src/api/tmdb.js`. Αν κάνεις fork, βάλε το δικό σου.

## Εκτέλεση

Γρήγορη δοκιμή στο κινητό με Expo Go:

```bash
npx expo start
```

Δημιουργία APK:

```bash
cd android
gradlew assembleRelease
```

Το APK βγαίνει στο `android/app/build/outputs/apk/release/app-release.apk`.

Το debug build (`assembleDebug`) δεν περιέχει το JavaScript. Χρειάζεται το Metro να τρέχει (`npx expo start`), αλλιώς βγαίνει "Unable to load script". Για αυτόνομο APK χρησιμοποίησε `assembleRelease`.

Για το Google Play χρειάζεσαι δικό σου keystore και signing config.

## Αντιμετώπιση προβλημάτων

**`A restricted method in java.lang.System has been called`** (αποτυγχάνει στο `configureCMakeDebug`)
Ο Gradle τρέχει με JDK 24 ή νεότερο. Χρησιμοποίησε JDK 17: όρισε το `JAVA_HOME` σε αυτό και πρόσθεσε στο `android/gradle.properties`:

```properties
org.gradle.java.home=C:/Program Files/Eclipse Adoptium/jdk-17.0.19.10-hotspot
```

Έλεγξε και το `gradlew --version`. Αν το "Daemon JVM" γράφει Java 25, σβήσε το `android/gradle/gradle-daemon-jvm.properties` (το δημιουργεί το "Update Daemon JVM" του Android Studio) και τρέξε `gradlew --stop`.

**`[CXX5304] ... SDK XML versions up to 3`**
Σβήσε τους φακέλους `ndk` και `cmake` μέσα στον φάκελο του Android SDK, κλείσε το Android Studio και ξανακατέβασέ τα από SDK Manager → SDK Tools.

**Σφάλματα εκδόσεων μετά το `npm install`**
Κράτα το `package-lock.json`. Οι εκδόσεις είναι κλειδωμένες στο Expo SDK 57 και δοκιμασμένες μεταξύ τους.

## Δομή project

```
CineSuggest/
├── App.js
├── app.json
├── src/
│   ├── api/tmdb.js
│   ├── db/database.js
│   ├── context/AppContext.js
│   ├── theme/
│   ├── i18n/
│   ├── navigation/RootNavigator.js
│   ├── components/
│   └── screens/
└── assets/
```

## Git

Ο φάκελος `android/` είναι στο `.gitignore`, γιατί ξαναδημιουργείται με `npx expo prebuild -p android`. Σβήσε αυτή τη γραμμή αν θες να κρατάς τον native φάκελο στο repo.
