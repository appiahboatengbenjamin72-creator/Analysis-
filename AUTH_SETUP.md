# Trade Analyzer — Firebase Authentication Setup

The app now includes email/password sign-in, account registration, password-reset email, signed-in account display, and sign-out. Firebase Authentication is the identity provider. **Authentication will remain disabled until the project configuration below is completed.** Do not treat the placeholder screen as a working login.

## 1. Create a Firebase project
1. Open https://console.firebase.google.com/ and create a project.
2. In Project settings, add a Web app and copy its Firebase web configuration.
3. In **Build → Authentication → Sign-in method**, enable **Email/Password**.
4. In **Authentication → Settings → Authorized domains**, add `appiahboatengbenjamin72-creator.github.io` if it is not already present.
5. Optionally configure the email template and sender details for password reset.

## 2. Add the web config
In this repository, open `index.html` and find `const firebaseConfig = {`. Replace these placeholder values with the matching values from your Firebase Web app:
- `apiKey`
- `authDomain`
- `projectId`
- `appId`

The Firebase **web** config is designed to be public. Never place service-account credentials, private keys, or broker passwords in this file. Authentication security depends on Firebase Auth and properly configured backend security rules, not on hiding the web config.

## 3. Verify after deployment
Wait for the GitHub Pages workflow to succeed, then open https://appiahboatengbenjamin72-creator.github.io/Analysis-/ in Chrome. Register using an email you control, check for any Firebase verification or reset emails, sign out, and sign back in.

## Scope and privacy
- Firebase manages account credentials; this app does not handle or store the password itself.
- The trading journal and settings remain in browser local storage on that device. They are not cloud-synced or separated into per-user cloud records. Anyone with access to the same browser profile may be able to access local device data.
- Sign-in does not connect Pocket Option, validate a broker account, or place trades.
- Firebase project configuration and enabling Email/Password sign-in are manual setup steps; no Firebase project credentials were provided in the repository connection.
- Review Firebase Authentication limits, abuse protection, and account deletion policies before public launch.
