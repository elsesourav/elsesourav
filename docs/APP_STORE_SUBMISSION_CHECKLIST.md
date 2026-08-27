# Google Play & Apple App Store Submission Checklist

> **Application**: ElseSourav  
> **Package ID (Android)**: `com.elsesourav.app`  
> **Bundle Identifier (iOS)**: `com.elsesourav.app`  
> **Version**: `0.1.0` (Build `1`)  
> **Primary URL**: `https://elsesourav.com`

---

## 1. App Identity & Store Metadata

| Field | Configuration / Value | Store Limits / Notes |
| :--- | :--- | :--- |
| **App Title** | `ElseSourav` | Max 30 chars (Android & iOS) |
| **iOS Subtitle** | `Developer & Software Platform` | 29 chars (Max 30 chars) |
| **Android Short Description** | `Discover apps, tools, and devlogs created by independent developer Sourav.` | 74 chars (Max 80 chars) |
| **Primary Category (Play Store)** | `Tools` (Secondary: `Productivity`) | Google Play Console category taxonomy |
| **Primary Category (App Store)** | `Developer Tools` (Secondary: `Utilities`) | Apple App Store Connect taxonomy |
| **Keywords (iOS)** | `developer tools,software showcase,apps catalog,devlogs,utility applications,indie developer,open source` | Max 100 characters comma-separated |
| **Age Rating** | `Everyone (4+)` | No objectionable content, gambling, or user-to-user chat |

---

## 2. Store URLs Checklist

All URLs point strictly to production endpoints:

- **Marketing Website**: `https://elsesourav.com`
- **Privacy Policy URL**: `https://elsesourav.com/privacy`
- **Terms of Service URL**: `https://elsesourav.com/terms`
- **Support & Feedback URL**: `https://elsesourav.com/support`
- **In-App Account Deletion URL**: `https://elsesourav.com/settings`

---

## 3. Account Deletion Compliance (Apple Guideline 5.1.1(v) & Google Play)

- **In-App Flow**: Accessible directly in the app under **Settings $\to$ Security $\to$ Danger Zone: Delete Account**.
- **Action**: Confirms password / re-authentication, deletes user documents in Cloud Firestore (`/users/{uid}` and personal collections), and deletes the Firebase Authentication credential.
- **Web Deletion Option**: Users can also delete their account via standard web login at `https://elsesourav.com/settings`.

---

## 4. Data Safety Disclosures (Google Play & Apple Privacy Labels)

### Data Types Collected:
1. **User Account Info**:
   - Data: Email Address, Display Name, User ID.
   - Purpose: App Functionality & Authentication.
   - Linked to User: Yes.
   - Tracking: No.
2. **User Generated Content**:
   - Data: Saved Library Bookmarks, Support Ticket Messages.
   - Purpose: App Functionality & Customer Support.
   - Linked to User: Yes.
   - Tracking: No.
3. **Diagnostics & Telemetry**:
   - Data: Sanitized Crash Logs, Performance Latencies.
   - Purpose: Analytics, App Diagnostics, Performance Optimization.
   - Linked to User: No (Sanitized & Anonymized).
   - Tracking: No.
4. **Third-Party Data Sharing**:
   - **Zero** user data is sold, rented, or shared with third-party advertising brokers.

---

## 5. Visual Asset Specifications

### A. App Icon
- **Master Icon**: SVG & 1024x1024 PNG (No transparency, square corners, branding compliant).
- **Android Adaptive Icons**: Foreground + Background assets in `public/icons/`.
- **iOS App Icon**: 1024x1024 PNG in Xcode `AppIcon` asset catalog.

### B. Splash Screen
- Minimal dark background (`#090d16`) with centered ElseSourav logo mark.
- Launch duration: ~1200ms (Auto-dismisses immediately upon React DOM initialization).

### C. Screenshot Capture Matrix
Demonstrating real UI features without simulated mockups:

| Platform | Required Screen Dimensions | Required Views to Capture |
| :--- | :--- | :--- |
| **iPhone (6.7" Display)** | 1290 x 2796 px (iPhone 15 Pro Max) | 1. Showcase Homepage<br>2. App Catalog Directory<br>3. App Detail & Screenshots<br>4. Engineering Devlog<br>5. Support Ticketing Center |
| **iPhone (6.1" Display)** | 1179 x 2556 px (iPhone 15) | Same as above |
| **iPad Pro (12.9" Display)** | 2048 x 2732 px | Desktop/Tablet Responsive Grid Layout |
| **Android Phone** | 1080 x 2400 px | Same 5 Core Workflows |
| **Android Tablet (10")** | 1600 x 2560 px | Wide-screen App Gallery & Knowledge Base |

---

## 6. Permissions & Native Boundaries

- **Permissions Requested**: `android.permission.INTERNET` only.
- **Hardware Access**: Camera, Microphone, Location, Contacts, Bluetooth, Photos are strictly disabled (`false`).

---

## 7. Manual Store Console Steps

### Google Play Console:
1. Create new application: **ElseSourav** (Default language: English).
2. Complete **Data safety questionnaire** using Section 4 above.
3. Complete **App Content declarations** (Privacy policy URL, Target audience: 13+, Financial features: None, News app: No).
4. Upload production Android App Bundle (`.aab`) signed with release keystore.
5. Provide demo reviewer login credentials:
   - Email: `demo@elsesourav.com` / Password: `<TestPass123!>`

### Apple App Store Connect:
1. Register Bundle ID `com.elsesourav.app` in Apple Developer Portal with Associated Domains capability.
2. Create new App record in App Store Connect: **ElseSourav** (SKU: `elsesourav-app`).
3. Fill in **App Privacy** nutrition labels using Section 4 above.
4. Set **Rating** to 4+.
5. Upload `.ipa` archive via Xcode Organizer / Transporter.
6. Provide demo test account credentials for App Review.
