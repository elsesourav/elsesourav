/**
 * Default legal markdown content used when no admin-customized version
 * exists in the database. These serve as comprehensive templates that
 * the admin can override via the Admin Settings → Legal tab.
 */
export const DEFAULT_PRIVACY_POLICY_MD = `# Privacy Policy
**Last Updated:** November 2026
**Effective for:** All ElseSourav applications, services, and web tools.
---
## 1. Introduction
ElseSourav ("we," "our," or "platform") is the personal software studio of **Sourav Barui**. We develop web applications, developer tools, and technical content. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our services at [elsesourav.com](https://elsesourav.com).
We are committed to **minimal data collection**, transparency, and strict protection of your information. We never sell, rent, or trade your personal data to third parties for advertising or marketing purposes.
---
## 2. Information We Collect
### 2.1 Account Information
When you create an account via our authentication system (powered by **Supabase Auth**), we collect and store:
- **Email address** — used for login, notifications, and account recovery
- **Display name** and optional **username** — used for profile identification
- **Authentication identifiers** — OAuth tokens from Google or GitHub if you choose social login
- **Profile photo URL** — if provided or imported from your OAuth provider
### 2.2 User-Generated Content
When you interact with our platform, we may store:
- **Support tickets** — subject, message content, and attachments submitted via our support desk
- **Feedback and ratings** — app ratings, reviews, and comments you submit
- **Library items** — saved content, bookmarks, or collections you create
- **User preferences** — theme, notification settings, and display preferences stored as JSON
### 2.3 Automatically Collected Information
- **Audit logs** — we log security-relevant actions (login, password changes, account deletion requests) to protect your account
- **Notification records** — delivery status of notifications sent to your account
- **Anonymous telemetry** — if analytics are enabled (\`NEXT_PUBLIC_ENABLE_ANALYTICS\`), aggregated, non-identifiable usage statistics to improve performance and diagnose errors. This can be disabled.
### 2.4 Cookies
We use **essential cookies only** for:
- **Session management** — Supabase authentication cookies to maintain your login session
- **Security** — CSRF protection and session integrity
We do **not** use advertising cookies, tracking pixels, or third-party analytics cookies.
---
## 3. How We Use Your Information
We use collected information exclusively for:
- **Account management** — creating, maintaining, and securing your account
- **Service delivery** — providing the features and tools you use
- **Communication** — sending transactional emails (password resets, OTP codes, support replies)
- **Security** — detecting unauthorized access, preventing abuse, and maintaining audit trails
- **Improvement** — understanding aggregated usage patterns to improve our applications (only with anonymized data)
We do **not** use your data for:
- Targeted advertising
- Data brokerage or resale
- AI/ML model training on your personal content
- Behavioral profiling or tracking across third-party sites
---
## 4. Third-Party Services
We use the following third-party services to operate our platform. Each processes only the minimum data necessary:
| Service | Purpose | Data Shared |
|---------|---------|-------------|
| **Supabase** | Authentication, database hosting (PostgreSQL) | Email, auth tokens, all user data stored in DB |
| **Cloudinary** | Image and media file storage/optimization | Uploaded images and media files |
| **Resend** | Transactional email delivery (primary) | Recipient email address, email content |
| **Gmail SMTP** | Fallback email delivery | Recipient email address, email content |
| **Vercel** | Application hosting and deployment | Server logs, request metadata |
We do not share your personal information with any other third parties. Each service above is governed by its own privacy policy.
---
## 5. Data Storage & Security
Your data is stored in **PostgreSQL databases** hosted on Supabase infrastructure with:
- **Row-Level Security (RLS)** — database-level access controls ensuring users can only access their own data
- **Encrypted connections** — all data transmitted over TLS/SSL
- **Hashed passwords** — passwords are never stored in plain text (handled by Supabase Auth)
- **Role-based access controls** — admin, staff, and user roles with enforced permission boundaries
Media files (images, avatars) are stored on **Cloudinary** with secure upload credentials.
---
## 6. Data Retention
- **Active accounts** — your data is retained as long as your account is active
- **Account deletion** — when you request account deletion, there is a **30-day grace period** during which you can cancel the deletion. After 30 days, your account and associated data are permanently removed
- **Support tickets** — retained for service quality and legal compliance, even after account deletion
- **Audit logs** — security-relevant logs are retained for a reasonable period for security investigations
---
## 7. Your Rights & Controls
You have the following rights regarding your personal data:
- **Access & Update** — view and edit your profile, email, display name, and preferences via your [Account Settings](/settings)
- **Data Export** — contact us to request a copy of your personal data
- **Account Deletion** — initiate account deletion from your [Account Settings](/settings) (30-day grace period applies)
- **Communication Preferences** — manage notification and email preferences via your settings
- **Withdraw Consent** — you may stop using our services and delete your account at any time
To exercise any of these rights, visit your [Account Settings](/settings) or contact us at **contact@elsesourav.com**.
---
## 8. Children's Privacy
ElseSourav is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately and we will take steps to remove that information.
---
## 9. International Users
Our services are hosted and operated primarily for a global audience. By using our services, you acknowledge that your data may be transferred to and processed in the country where our hosting infrastructure is located. We ensure appropriate safeguards are in place for international data transfers.
---
## 10. Changes to This Policy
We may update this Privacy Policy from time to time. When we make significant changes:
- We will update the "Last Updated" date at the top of this page
- For material changes, we may notify registered users via email or in-app notification
- Continued use of our services after changes constitutes acceptance of the updated policy
---
## 11. Contact Us
If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data:
- **Email:** [contact@elsesourav.com](mailto:contact@elsesourav.com)
- **Support:** [elsesourav.com/support](https://elsesourav.com/support)
- **Website:** [elsesourav.com](https://elsesourav.com)
`;

export const DEFAULT_TERMS_OF_SERVICE_MD = `# Terms of Service
**Last Updated:** November 2026
**Effective for:** All ElseSourav applications, services, and web tools.
---
## 1. Acceptance of Terms
By accessing or using ElseSourav applications, tools, software, technical documentation, or any services available at [elsesourav.com](https://elsesourav.com) (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these Terms, you must not access or use our Services.
These Terms constitute a legally binding agreement between you ("User," "you") and **ElseSourav** (operated by Sourav Barui, "we," "our," "us").
---
## 2. Description of Services
ElseSourav provides:
- **Web applications** — software tools and utilities accessible through our website
- **Developer tools** — productivity and development-related applications
- **App Library** — a curated collection of applications and resources
- **Technical content** — blog posts, devlogs, engineering updates, and documentation
- **Support desk** — a system for submitting and tracking support requests
- **User accounts** — personal profiles with preferences, saved items, and history
Our Services are provided as-is for personal and professional use. Features may be added, modified, or removed at our discretion.
---
## 3. User Accounts
### 3.1 Registration
To access certain features, you must create an account using a valid email address or through OAuth providers (Google, GitHub). You agree to:
- Provide accurate and complete registration information
- Maintain the security of your account credentials
- Promptly notify us of any unauthorized access to your account
- Accept responsibility for all activities under your account
### 3.2 Account Roles
- **User** — standard access to public features and personal account management
- **Staff** — elevated access granted at our discretion for content moderation
- **Admin** — full administrative access, restricted to authorized personnel only
### 3.3 Account Termination
- **By you:** You may delete your account at any time via your Account Settings. A 30-day grace period applies, during which you can cancel the deletion.
- **By us:** We reserve the right to suspend or terminate accounts that violate these Terms, without prior notice in cases of severe violations.
---
## 4. Acceptable Use
You agree **not** to:
- Use the Services for any illegal or unauthorized purpose
- Attempt to gain unauthorized access to any part of the Services, other accounts, or systems
- Exploit security vulnerabilities, attempt privilege escalation, or conduct penetration testing without written permission
- Reverse engineer, decompile, or disassemble any proprietary components of the Services
- Interfere with or disrupt servers, networks, or infrastructure
- Upload malicious code, viruses, or harmful content
- Scrape, crawl, or systematically extract data from the Services without permission
- Impersonate any person or entity, or misrepresent your affiliation
- Use automated tools (bots, scripts) to access the Services in a manner that exceeds reasonable use
- Harass, abuse, or threaten other users
- Submit false or misleading support tickets or feedback
---
## 5. Intellectual Property
### 5.1 Our Content
All content created by ElseSourav — including but not limited to software code, design, UI components, graphics, logos, documentation, blog posts, and branding — is the intellectual property of ElseSourav / Sourav Barui, unless explicitly released under an open-source license.
### 5.2 Open-Source Components
Certain components of our Services may be released under open-source licenses (e.g., MIT, Apache 2.0). Such components are governed by their respective license terms, which take precedence over these Terms for those specific components.
### 5.3 Trademarks
"ElseSourav," our logo, and associated branding are trademarks of Sourav Barui. You may not use these marks without prior written permission.
---
## 6. User Content & Feedback
### 6.1 Your Content
You retain ownership of content you submit to the Services (support tickets, feedback, comments, library items). By submitting content, you grant us a non-exclusive, royalty-free license to store, display, and process it as necessary to provide the Services.
### 6.2 Feedback & Ratings
Feedback, ratings, and suggestions you provide may be used by us to improve the Services without any obligation to compensate you. You should not include sensitive personal information in public feedback.
### 6.3 Content Standards
You are responsible for ensuring your submitted content:
- Does not infringe on any third-party intellectual property rights
- Does not contain unlawful, defamatory, or harmful material
- Does not contain personal information of others without their consent
We reserve the right to remove content that violates these standards.
---
## 7. Privacy
Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our [Privacy Policy](/privacy), which is incorporated into these Terms by reference. By using our Services, you consent to the data practices described in the Privacy Policy.
---
## 8. Third-Party Services
Our Services integrate with third-party providers (Supabase, Cloudinary, Resend, Vercel) to deliver functionality. We are not responsible for the practices, policies, or availability of these third-party services. Your use of third-party integrations (e.g., Google or GitHub OAuth) is subject to those providers' terms of service.
---
## 9. Disclaimer of Warranties
THE SERVICES ARE PROVIDED ON AN **"AS IS"** AND **"AS AVAILABLE"** BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
- IMPLIED WARRANTIES OF MERCHANTABILITY
- FITNESS FOR A PARTICULAR PURPOSE
- NON-INFRINGEMENT
- ACCURACY OR RELIABILITY OF CONTENT
We do not warrant that:
- The Services will be uninterrupted, error-free, or secure
- Defects will be corrected in any specific timeframe
- The Services will meet your specific requirements
- Any data stored will be preserved indefinitely
---
## 10. Limitation of Liability
TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
- ElseSourav (Sourav Barui) shall not be liable for any indirect, incidental, special, consequential, or punitive damages
- Our total liability for any claims arising from your use of the Services shall not exceed the amount you have paid us in the 12 months preceding the claim (if any)
- We are not liable for any loss of data, profits, or business opportunities
This limitation applies regardless of the legal theory (contract, tort, negligence, strict liability, or otherwise).
---
## 11. Indemnification
You agree to indemnify, defend, and hold harmless ElseSourav (Sourav Barui) from any claims, damages, losses, liabilities, and expenses (including reasonable legal fees) arising from:
- Your use or misuse of the Services
- Your violation of these Terms
- Your violation of any third-party rights
- Content you submit to the Services
---
## 12. Service Modifications
We reserve the right to:
- Modify, suspend, or discontinue any part of the Services at any time
- Update features, interfaces, or functionality without prior notice
- Impose usage limits or restrictions as necessary
We will make reasonable efforts to notify users of significant changes that affect their accounts or data.
---
## 13. Governing Law & Dispute Resolution
These Terms shall be governed by and construed in accordance with the laws of **India**, without regard to conflict of law principles.
Any disputes arising from these Terms or the Services shall be resolved through:
1. **Good-faith negotiation** — direct communication to resolve the issue
2. **Mediation** — if negotiation fails, through a mutually agreed mediator
3. **Arbitration** — binding arbitration as a last resort, conducted in India
---
## 14. Severability
If any provision of these Terms is found to be unenforceable or invalid by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The unenforceable provision shall be modified to the minimum extent necessary to make it enforceable.
---
## 15. Entire Agreement
These Terms, together with our Privacy Policy, constitute the entire agreement between you and ElseSourav regarding your use of the Services. They supersede all prior agreements, communications, and understandings, whether written or oral.
---
## 16. Changes to These Terms
We may update these Terms from time to time. When we make significant changes:
- We will update the "Last Updated" date at the top of this page
- For material changes, we may notify registered users via email or in-app notification
- Continued use of the Services after changes constitutes acceptance of the updated Terms
We encourage you to review these Terms periodically.
---
## 17. Contact Us
If you have any questions about these Terms of Service:
- **Email:** [contact@elsesourav.com](mailto:contact@elsesourav.com)
- **Support:** [elsesourav.com/support](https://elsesourav.com/support)
- **Website:** [elsesourav.com](https://elsesourav.com)
`;
