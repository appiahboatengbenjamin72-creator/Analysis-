# Trade Analyzer — Firebase email/password login setup

The app now includes a mobile-friendly sign-in/register screen, Firebase email/password authentication, password-reset emails, and sign-out. **The login will not work until you complete the one-time Firebase setup below.** No credentials are hardcoded.

## One-time owner setup

1. Open https://console.firebase.google.com/ and create a Firebase project.
2. In **Build → Authentication → Get started → Sign-in method**, enable **Email/Password**. Email/password sign-in must be enabled for registration and login to work.
3. In **Project settings → General → Your apps**, add a **Web app** if needed. Copy its web configuration values: `apiKey`, `authDomain`, `projectId`, and `appId`.
4. In this repository, edit `index.html` and find the `firebaseConfig` object near the bottom. Replace the four `REPLACE_WITH_...` placeholder strings with the values from your Firebase Web app config. Keep the quotes and commas. Firebase web config is designed to be public; never put a service-account private key or admin credential in this file.
5. In Firebase Authentication settings, add the deployed domain to **Authorized domains** if it is not already there:
   `appiahboatengbenjamin72-creator.github.io`
6. Commit the change and wait for the GitHub Pages deployment to finish. Open the app in Chrome, register with an email and strong unique password, then sign in. If Firebase email confirmation is enabled, confirm your email first. The “Forgot password?” button sends a reset email.
7. Open the deployed app and test sign-in, sign-out, registration, and password reset.

## Security and current limits

- Authentication uses Firebase's official browser SDK over HTTPS. The placeholder configuration deliberately leaves login disabled until you supply your own project values.
- The current trade journal and feed settings are stored in browser local storage. They are **not** synced to Firebase or isolated per user; do not treat the app as a private vault on a shared phone. Account login currently gates the dashboard but does not encrypt local data or protect market-feed endpoints.
- If you later add cloud-saved journals or other private data, configure Firebase Security Rules so each user can access only records whose owner UID matches their authenticated UID. Do not create public read/write rules.
- Login does not connect to Pocket Option, read account balances, place orders, or guarantee trading outcomes.
