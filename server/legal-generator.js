class LegalGenerator {
  generateAll({ appName, appDescription, developerName, appType }) {
    return {
      terms_of_service: this.generateTerms({ appName, appDescription, developerName, appType }),
      privacy_policy: this.generatePrivacy({ appName, appDescription, developerName, appType }),
      user_agreement: this.generateUserAgreement({ appName, appDescription, developerName, appType }),
    };
  }

  generateTerms({ appName, developerName, appType }) {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const specificClauses = this._getSpecificClauses(appType);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service - ${appName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #e0e0e0; background: #0f0f1a; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { font-size: 28px; color: #6C63FF; margin-bottom: 8px; }
    h2 { font-size: 20px; color: #fff; margin: 24px 0 12px; }
    p { margin-bottom: 12px; color: #b0b0b0; }
    ul { margin: 0 0 16px 24px; color: #b0b0b0; }
    li { margin-bottom: 6px; }
    .updated { color: #888; font-size: 14px; margin-bottom: 24px; }
    .highlight { color: #6C63FF; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Terms of Service</h1>
    <p class="updated">Last updated: ${date}</p>

    <h2>1. Acceptance of Terms</h2>
    <p>By downloading, installing, or using ${appName} ("the App"), operated by ${developerName} ("we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.</p>

    <h2>2. Description of Service</h2>
    <p>${appName} is a ${appType} mobile application that provides ${appDescription || 'various features and services to enhance your mobile experience'}. The App is available on Android devices through the Google Play Store.</p>

    <h2>3. User Responsibilities</h2>
    <p>As a user of ${appName}, you agree to:</p>
    <ul>
      <li>Use the App only for lawful purposes</li>
      <li>Not attempt to reverse engineer, decompile, or disassemble the App</li>
      <li>Not use the App to transmit harmful or malicious content</li>
      <li>Not interfere with or disrupt the App's functionality</li>
      <li>Comply with all applicable local, state, national, and international laws</li>
      ${specificClauses.userResponsibilities}
    </ul>

    <h2>4. Intellectual Property</h2>
    <p>All content, features, and functionality of ${appName}, including but not limited to text, graphics, logos, icons, images, audio clips, and software, are the property of ${developerName} and are protected by international copyright, trademark, patent, and other intellectual property laws.</p>

    ${specificClauses.additionalSections}

    <h2>5. Advertising</h2>
    <p>${appName} may display advertisements from third-party advertising networks. These ads help us keep the App free. By using the App, you consent to the display of such advertisements. We are not responsible for the content of third-party advertisements.</p>

    <h2>6. In-App Purchases</h2>
    <p>The App may offer optional in-app purchases. All purchases are final and non-refundable except as required by applicable law. Prices may change without notice.</p>

    <h2>7. Limitation of Liability</h2>
    <p>To the maximum extent permitted by applicable law, ${developerName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the App.</p>

    <h2>8. Disclaimer of Warranties</h2>
    <p>The App is provided "as is" and "as available" without any warranties of any kind, either express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>

    <h2>9. Termination</h2>
    <p>We may terminate or suspend your access to the App immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.</p>

    <h2>10. Changes to Terms</h2>
    <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

    <h2>11. Governing Law</h2>
    <p>These Terms shall be governed and construed in accordance with the laws applicable in your jurisdiction, without regard to its conflict of law provisions.</p>

    <h2>12. Contact Us</h2>
    <p>If you have any questions about these Terms, please contact us at the support email provided in the app store listing.</p>

    <p style="margin-top: 32px; color: #666; font-size: 13px;">Generated automatically for ${appName} by AppForge.</p>
  </div>
</body>
</html>`;
  }

  generatePrivacy({ appName, developerName, appType }) {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const specificPrivacy = this._getSpecificPrivacy(appType);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - ${appName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #e0e0e0; background: #0f0f1a; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { font-size: 28px; color: #6C63FF; margin-bottom: 8px; }
    h2 { font-size: 20px; color: #fff; margin: 24px 0 12px; }
    p { margin-bottom: 12px; color: #b0b0b0; }
    ul { margin: 0 0 16px 24px; color: #b0b0b0; }
    li { margin-bottom: 6px; }
    .updated { color: #888; font-size: 14px; margin-bottom: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Privacy Policy</h1>
    <p class="updated">Last updated: ${date}</p>

    <h2>1. Introduction</h2>
    <p>${developerName} ("we," "us," or "our") operates the ${appName} mobile application. This Privacy Policy informs you of our policies regarding the collection, use, and disclosure of personal data when you use our App and the choices you have associated with that data.</p>

    <h2>2. Information We Collect</h2>
    <p>We may collect the following types of information:</p>
    <ul>
      <li><strong>Device Information:</strong> Device type, operating system version, unique device identifiers</li>
      <li><strong>Usage Data:</strong> How you interact with the App, features used, time spent</li>
      <li><strong>Log Data:</strong> IP address, access times, app crashes, and system activity</li>
      ${specificPrivacy.dataCollected}
    </ul>

    ${specificPrivacy.additionalSections}

    <h2>3. How We Use Your Information</h2>
    <p>We use the collected data for various purposes:</p>
    <ul>
      <li>To provide and maintain our App</li>
      <li>To notify you about changes to our App</li>
      <li>To provide customer support</li>
      <li>To gather analysis or valuable information to improve our App</li>
      <li>To monitor the usage of our App</li>
      <li>To detect, prevent, and address technical issues</li>
      <li>To serve personalized advertisements</li>
    </ul>

    <h2>4. Third-Party Services</h2>
    <p>The App may use third-party services that collect information used to identify you. These include:</p>
    <ul>
      <li>Google AdMob and other advertising networks</li>
      <li>Google Firebase (Analytics, Crashlytics)</li>
      <li>Google Play Services</li>
      <li>Other analytics providers</li>
    </ul>
    <p>Each third-party service has its own Privacy Policy. We encourage you to review their policies.</p>

    <h2>5. Data Security</h2>
    <p>The security of your data is important to us. We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>

    <h2>6. Children's Privacy</h2>
    <p>Our App does not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us. If we become aware that we have collected personal data from children without verification of parental consent, we take steps to remove that information from our servers.</p>

    <h2>7. Your Data Rights</h2>
    <p>Depending on your location, you may have the following rights:</p>
    <ul>
      <li>The right to access personal data we hold about you</li>
      <li>The right to request correction of inaccurate data</li>
      <li>The right to request deletion of your personal data</li>
      <li>The right to object to processing of your data</li>
      <li>The right to data portability</li>
      <li>The right to withdraw consent</li>
    </ul>

    <h2>8. Data Retention</h2>
    <p>We retain your personal data only for as long as necessary for the purposes set out in this Privacy Policy. We will retain and use your data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.</p>

    <h2>9. Changes to This Privacy Policy</h2>
    <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>

    <h2>10. Contact Us</h2>
    <p>If you have any questions about this Privacy Policy, please contact us through the support channels provided in the app store listing.</p>

    <p style="margin-top: 32px; color: #666; font-size: 13px;">Generated automatically for ${appName} by AppForge.</p>
  </div>
</body>
</html>`;
  }

  generateUserAgreement({ appName, developerName, appType }) {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Agreement - ${appName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #e0e0e0; background: #0f0f1a; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { font-size: 28px; color: #6C63FF; margin-bottom: 8px; }
    h2 { font-size: 20px; color: #fff; margin: 24px 0 12px; }
    p { margin-bottom: 12px; color: #b0b0b0; }
    ul { margin: 0 0 16px 24px; color: #b0b0b0; }
    li { margin-bottom: 6px; }
    .updated { color: #888; font-size: 14px; margin-bottom: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>User Agreement</h1>
    <p class="updated">Effective date: ${date}</p>

    <h2>1. Agreement Overview</h2>
    <p>This User Agreement ("Agreement") is a legal agreement between you ("User") and ${developerName} governing your use of ${appName}. By using the App, you acknowledge that you have read, understood, and agree to be bound by this Agreement.</p>

    <h2>2. License Grant</h2>
    <p>Subject to the terms of this Agreement, ${developerName} grants you a limited, non-exclusive, non-transferable, revocable license to download, install, and use ${appName} for your personal, non-commercial use on compatible devices.</p>

    <h2>3. User Conduct</h2>
    <p>You agree not to:</p>
    <ul>
      <li>Use the App for any unlawful purpose or in violation of any applicable laws</li>
      <li>Attempt to gain unauthorized access to any part of the App</li>
      <li>Interfere with or disrupt the App's servers or networks</li>
      <li>Use any automated means to access the App</li>
      <li>Transmit any viruses, malware, or harmful code</li>
      <li>Collect or harvest any information from other users</li>
      <li>Impersonate any person or entity</li>
    </ul>

    <h2>4. Account Responsibilities</h2>
    <p>If the App requires you to create an account, you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>

    <h2>5. Content and Intellectual Property</h2>
    <p>All content within ${appName} is owned by ${developerName} or its licensors. You may not copy, modify, distribute, sell, or lease any part of the App or its content without prior written consent from ${developerName}.</p>

    <h2>6. User-Generated Content</h2>
    <p>If the App allows you to submit content, you grant ${developerName} a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute such content in connection with operating the App. You represent that you have the right to grant this license.</p>

    <h2>7. Advertisements and Third-Party Content</h2>
    <p>The App may contain advertisements and links to third-party websites or services. ${developerName} is not responsible for the content, accuracy, or practices of any third-party websites or services. Your interactions with third parties are solely between you and the third party.</p>

    <h2>8. Updates and Modifications</h2>
    <p>${developerName} reserves the right to modify, suspend, or discontinue the App at any time without notice. We may also release updates to the App, which may be required for continued use.</p>

    <h2>9. Disclaimer of Warranties</h2>
    <p>The App is provided "as is" without warranty of any kind. ${developerName} disclaims all warranties, whether express, implied, or statutory, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>

    <h2>10. Limitation of Liability</h2>
    <p>In no event shall ${developerName} be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the App.</p>

    <h2>11. Indemnification</h2>
    <p>You agree to indemnify, defend, and hold harmless ${developerName} from and against any claims, liabilities, damages, losses, costs, or expenses arising out of your use of the App or violation of this Agreement.</p>

    <h2>12. Governing Law and Disputes</h2>
    <p>This Agreement shall be governed by applicable law. Any disputes arising under this Agreement shall be resolved through good faith negotiation. If unresolved, disputes shall be submitted to binding arbitration.</p>

    <h2>13. Severability</h2>
    <p>If any provision of this Agreement is found to be unenforceable, the remaining provisions will continue in full force and effect.</p>

    <h2>14. Entire Agreement</h2>
    <p>This Agreement, together with our Privacy Policy and Terms of Service, constitutes the entire agreement between you and ${developerName} regarding the use of ${appName}.</p>

    <h2>15. Contact Information</h2>
    <p>For questions about this User Agreement, please contact us through the support channels provided in the app store listing.</p>

    <p style="margin-top: 32px; color: #666; font-size: 13px;">Generated automatically for ${appName} by AppForge.</p>
  </div>
</body>
</html>`;
  }

  _getSpecificClauses(appType) {
    const clauses = {
      game: {
        userResponsibilities: `
      <li>Not use cheats, automation software, hacks, or mods</li>
      <li>Not exploit bugs or glitches for unfair advantage</li>
      <li>Not engage in real-money trading of virtual items</li>`,
        additionalSections: `
    <h2>Virtual Items and Currency</h2>
    <p>Virtual items and in-game currency have no real-world value and cannot be exchanged for real money. ${developerName} reserves the right to modify, manage, or remove virtual items at any time.</p>`
      },
      social: {
        userResponsibilities: `
      <li>Not post content that is hateful, threatening, or harassing</li>
      <li>Not impersonate others or create fake accounts</li>
      <li>Respect the privacy and rights of other users</li>`,
        additionalSections: `
    <h2>User Content</h2>
    <p>You are solely responsible for the content you share through the App. We reserve the right to remove any content that violates these Terms or is otherwise objectionable.</p>`
      },
      ecommerce: {
        userResponsibilities: `
      <li>Provide accurate payment and shipping information</li>
      <li>Not engage in fraudulent transactions</li>
      <li>Comply with return and refund policies</li>`,
        additionalSections: `
    <h2>Purchases and Payments</h2>
    <p>All purchases made through the App are subject to our payment terms. Prices are subject to change without notice. We reserve the right to refuse or cancel orders at our discretion.</p>`
      },
      education: {
        userResponsibilities: `
      <li>Use educational content for personal learning only</li>
      <li>Not share or distribute course materials</li>
      <li>Not claim course certificates without completing requirements</li>`,
        additionalSections: `
    <h2>Educational Content</h2>
    <p>The educational content provided through the App is for informational purposes only. ${developerName} does not guarantee any specific outcomes from using the educational features.</p>`
      }
    };

    return clauses[appType] || {
      userResponsibilities: '',
      additionalSections: ''
    };
  }

  _getSpecificPrivacy(appType) {
    const privacy = {
      social: {
        dataCollected: `
      <li><strong>Profile Information:</strong> Name, email, profile picture</li>
      <li><strong>Social Data:</strong> Friends, messages, posts, and interactions</li>`,
        additionalSections: `
    <h2>Social Features</h2>
    <p>When you use our social features, information about your interactions, messages, and shared content may be collected and stored to provide these services.</p>`
      },
      health: {
        dataCollected: `
      <li><strong>Health Data:</strong> Exercise data, health metrics, wellness information</li>
      <li><strong>Location Data:</strong> GPS data for fitness tracking features</li>`,
        additionalSections: `
    <h2>Health Data</h2>
    <p>We take the privacy of your health data seriously. Health-related data is encrypted and stored securely. We do not sell your health data to third parties. You can request deletion of your health data at any time.</p>`
      },
      finance: {
        dataCollected: `
      <li><strong>Financial Data:</strong> Transaction history, payment methods (stored securely)</li>
      <li><strong>Identity Verification:</strong> As required by financial regulations</li>`,
        additionalSections: `
    <h2>Financial Data Security</h2>
    <p>We implement bank-level security measures to protect your financial information. Payment processing is handled by certified third-party payment processors. We do not store complete credit card numbers on our servers.</p>`
      }
    };

    return privacy[appType] || {
      dataCollected: '',
      additionalSections: ''
    };
  }
}

module.exports = LegalGenerator;
