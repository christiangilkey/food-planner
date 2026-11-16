/**
 * The Privacy Policy, Terms of Service and Storage Notice. The app shows them from here, and the
 * build writes the same text to privacy.html, terms.html and storage.html (see vite.config.ts),
 * so the published pages and the app can never disagree.
 *
 * Keep every sentence true to what the app does. When a feature sends data somewhere new, change
 * this file in the same release and bump LEGAL_VERSION, so people who agreed before are told.
 *
 * Not legal advice: have a lawyer review this before the app charges money.
 */

/** Change this when the Terms or Privacy Policy change in a way people should be told about. */
export const LEGAL_VERSION = '2026-11-09'
export const LEGAL_DATE = '9 November 2026'

/**
 * The business that provides the app, named in every document once it is chosen (a company keeps
 * the app's risks apart from personal assets; see Legal for Apps). Empty until then, and the
 * documents say "the developer of Health Tracker". Set it, and bump LEGAL_VERSION, before a public release.
 */
export const PROVIDER = ''
/** How the documents name whoever provides the app. */
export const PROVIDER_NAME = PROVIDER || 'the developer of Health Tracker'
export const PROVIDER_PLACE = 'Florida, USA'
export const APP_NAME = 'Health Tracker'
/** One address for help, privacy requests and complaints. Must be set before a public release. */
export const CONTACT_EMAIL = ''
export const SOURCE_URL = 'https://github.com/christiangilkey/food-planner'
export const WEB_URL = 'https://christiangilkey.github.io/food-planner/'

const contact = CONTACT_EMAIL
  ? `email ${CONTACT_EMAIL}`
  : `open an issue at ${SOURCE_URL}/issues (don’t include health details there; it’s public)`

/** A paragraph, a list, or a small heading. Web addresses and email addresses become links. */
export type Block = string | { list: string[] }
export interface LegalSection { heading: string; body: Block[] }
export interface LegalDoc { id: 'privacy' | 'terms' | 'storage'; title: string; summary: string; sections: LegalSection[] }

export const PRIVACY: LegalDoc = {
  id: 'privacy',
  title: 'Privacy Policy',
  summary: `${APP_NAME} keeps your information on your own device. The developer never receives it. A few optional features send specific things to other companies only when you use them, and this policy lists each one.`,
  sections: [
    {
      heading: 'Who we are',
      body: [
        `${APP_NAME} (the app, including its VENA name and logo) is provided by ${PROVIDER_NAME}, based in ${PROVIDER_PLACE} (“we”). It runs as a web app at ${WEB_URL} and as an Android app.`,
        `Questions, privacy requests and complaints: ${contact}. We answer within 30 days.`,
      ],
    },
    {
      heading: 'The short version',
      body: [{
        list: [
          'Everything you enter stays on your device. We have no accounts, no servers that store your data, no analytics, no ads, no tracking and no crash reports.',
          'We never sell or share your information, and we don’t build profiles of people or make automated decisions about them.',
          'Optional features send data straight from your device to another company only when you use them: AI suggestions (Anthropic), barcode lookups (Open Food Facts) and the Google Tasks export (Google). Each is described below.',
          'You can download a backup of everything or erase everything at any time in Profile → Your data.',
        ],
      }],
    },
    {
      heading: 'What stays on your device',
      body: [
        'The app stores what you enter in your browser’s or the app’s own storage on your device: your body measurements, goal, health conditions, diet, medications and pregnancy settings, foods you avoid, kitchen equipment, budget and daily rhythm, your pantry, scanned products, prices and stores, meal plans and shopping list, sleep log, body check-ins, training settings, logged sets and the workout timer.',
        'Some of this is health information. It is not sent to us, and we can’t see it. Anyone who can open the app on your unlocked device can see it, so use your device’s screen lock.',
        'Your Anthropic API key and Onyx token are stored only on your device, and are left out of backups.',
        'The Android app turns off Android’s automatic cloud backup for its data, so your health information isn’t copied to a Google backup. Use Profile → Your data to make your own backup instead.',
      ],
    },
    {
      heading: 'AI suggestions (Anthropic), only if you add your own key',
      body: [
        '“I’m craving…” on the Today tab works on your device. If you add your own Anthropic API key in Profile → AI suggestions, it can also ask Claude, an AI model made by Anthropic, PBC (USA).',
        'Only when you tap “Find ideas”, the app sends Anthropic: what you typed; a summary of your setup (sex, age, height, weight, activity, goal, health conditions, diet, medications and pregnancy settings, foods you won’t eat, kitchen, time and budget); your pantry; and the meals and foods your settings allow.',
        'It goes straight from your device to Anthropic, never through us. Your use of the key is between you and Anthropic: their terms, privacy policy, prices and age rules apply (Anthropic requires users to be 18 or older), and the cost is billed to your Anthropic account. See https://www.anthropic.com/legal/privacy.',
        'Ideas from Claude are labelled as AI, and the app checks them against your settings before showing them. AI can be wrong; it isn’t medical advice.',
      ],
    },
    {
      heading: 'Barcode lookups (Open Food Facts)',
      body: [
        'When you scan or type a barcode, the app asks Open Food Facts (a non-profit food database based in France) for that product. Only the barcode number is sent, along with the technical details every web request carries, such as your IP address and device type. See https://world.openfoodfacts.org/privacy.',
        'Product information from Open Food Facts is available under the Open Database License (ODbL) and may be incomplete or wrong.',
      ],
    },
    {
      heading: 'Camera',
      body: [
        'The camera is used only while the scanner is open. Barcodes and Nutrition Facts labels are read on your device. A label photo is kept in memory only while it is read, and is never saved, uploaded or synced by the app.',
      ],
    },
    {
      heading: 'Google Tasks export (web app only, optional)',
      body: [
        'If you choose Export to Google Tasks, the app loads Google’s sign-in from accounts.google.com, you sign in with Google, and the app creates task lists in your own Google Tasks: meal names, ingredients and steps, your shopping list, prep-day cooking and, from Sleep, your wind-down routine and times.',
        'It uses an OAuth client ID from your own Google Cloud project and asks only for access to Google Tasks. The access lasts about an hour, isn’t stored and is used only to create those lists. Data goes straight from your device to Google; Google’s terms and privacy policy apply (https://policies.google.com/privacy). The app’s use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.',
      ],
    },
    {
      heading: 'Onyx Calendar export (optional)',
      body: [
        'If you choose Onyx, the same kind of list goes to the Onyx Calendar app on your own computer, at the address you enter. It doesn’t pass through us or any other company.',
      ],
    },
    {
      heading: 'Hosting and links',
      body: [
        'The web app is hosted on GitHub Pages (GitHub, Inc., USA). Like any website host, GitHub receives technical details such as your IP address when your browser loads the app; see https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement. The Android app carries its own files and doesn’t load them from GitHub.',
        'The web app is published at a web address that the developer’s other websites share. Browsers keep storage separate per address, so those other pages could technically read what this app stores in your browser. They don’t, and the Android app doesn’t have this issue. We plan to move the web app to its own address.',
        'Links to research sources (such as PubMed and NIH) open those websites, which have their own privacy policies.',
      ],
    },
    {
      heading: 'Health data laws',
      body: [
        'We don’t collect, share or sell consumer health data as defined by laws such as Washington’s My Health My Data Act: it stays on your device. When you use AI suggestions, you are choosing to send health information to Anthropic, as described above. The app is not covered by HIPAA, because we are not a healthcare provider or health plan.',
      ],
    },
    {
      heading: 'Your rights',
      body: [
        'Because your data is on your device, you control it directly: see and correct it in the app, export it with Download backup, and delete it with Erase everything (or by deleting the app).',
        'Depending on where you live, you may have rights to access, correct, export or delete personal data, to object to or restrict its use, and (in the EU and UK) to complain to your data protection authority. We hold no personal data about you, but you can contact us about any privacy question.',
        'Legal basis (EU and UK): the app processes your information on your device to provide the features you ask for. Sending data to Anthropic, Open Food Facts or Google happens only when you choose that feature. Those companies may process data in the United States or elsewhere under their own safeguards.',
      ],
    },
    {
      heading: 'Children',
      body: [
        `${APP_NAME} is for people aged 16 and older. It isn’t meant for children, and we don’t knowingly collect information from anyone, of any age.`,
      ],
    },
    {
      heading: 'Do Not Track',
      body: ['The app doesn’t track you across websites or apps, so a browser’s Do Not Track signal doesn’t change anything.'],
    },
    {
      heading: 'Changes',
      body: [
        `We’ll update this policy when the app changes what it does with information, change the date at the top, and show a notice in the app the next time you open it. This version is effective ${LEGAL_DATE}.`,
      ],
    },
  ],
}

export const TERMS: LegalDoc = {
  id: 'terms',
  title: 'Terms of Service',
  summary: `The rules for using ${APP_NAME}. The most important: it gives general information, not medical advice, so check with your doctor before acting on it.`,
  sections: [
    {
      heading: '1. Agreement',
      body: [
        `These terms are an agreement between you and ${PROVIDER_NAME}, based in ${PROVIDER_PLACE} (“we”). By using the app you agree to them and to the Privacy Policy. If you don’t agree, don’t use the app.`,
      ],
    },
    {
      heading: '2. Who may use it',
      body: [
        'You must be 16 or older. If you are under 18, use the app with a parent or guardian’s involvement.',
        'Services you connect to set their own minimum ages: Anthropic requires its users to be 18 or older, and Google accounts have their own age rules. You must meet them before using those features.',
      ],
    },
    {
      heading: '3. Not medical advice',
      body: [
        'The app was made by an individual, not a doctor, dietitian, pharmacist or other licensed clinician. Meal plans, calorie and nutrient targets, condition and medication settings, supplement and peptide information, training plans and every other feature give general information drawn from published research. It is not medical advice, diagnosis or treatment, and the app is not a medical device.',
        'Check with your doctor before changing your diet, exercise or supplements, especially if you have a health condition, take medication, are pregnant or breastfeeding, or have, or have had, an eating disorder.',
        'Peptide information is educational. The app gives no doses for unapproved peptides and doesn’t recommend using them.',
        'Allergies: never rely on the app to avoid an allergen. Product and recipe data can be wrong or out of date. Always read the label on the actual package.',
        'In an emergency, call 911 (US) or your local emergency number. In the US you can call or text 988 for the Suicide & Crisis Lifeline.',
      ],
    },
    {
      heading: '4. Price',
      body: [
        'The app is free. If we ever offer paid features, we will show the price, what you get, how billing and renewal work and how to cancel before you pay, and ask for your clear agreement. Nothing that is free today will start costing money without your agreement.',
      ],
    },
    {
      heading: '5. Your data and backups',
      body: [
        'Your information stays on your device (see the Privacy Policy). You are responsible for keeping your device secure and for making backups. Backup files contain your health information: store and share them carefully. We can’t recover data you erase or lose.',
      ],
    },
    {
      heading: '6. Other services and your own keys',
      body: [
        'Some optional features connect you to other companies: Anthropic (AI suggestions, with your own API key), Google (Google Tasks, with your own Google Cloud project) and Open Food Facts (barcode lookups). Their terms apply to your use of them, and any costs are between you and them. Keep your keys private.',
        'We are not affiliated with, endorsed by or sponsored by Anthropic, Google, Open Food Facts, the USDA, the NIH or any other organisation the app names or links to.',
      ],
    },
    {
      heading: '7. Information can be wrong',
      body: [
        'Nutrition values, prices, product data from Open Food Facts, research summaries and AI suggestions can be incomplete, out of date or wrong. Use your own judgment, and don’t rely on the app for medical, legal or financial decisions.',
      ],
    },
    {
      heading: '8. Acceptable use',
      body: [
        'Don’t use the app to break the law, to harm anyone, or to overload or attack the services it connects to.',
      ],
    },
    {
      heading: '9. Our name, logo and code',
      body: [
        `The ${APP_NAME} and VENA names, logo, artwork, exercise diagrams and the app’s own text belong to ${PROVIDER_NAME}. Don’t use them to suggest that something is made or endorsed by us. The source code is published at ${SOURCE_URL} so it can be inspected; publishing it doesn’t license it for reuse unless a licence file there says so.`,
        'The app includes open-source software and open data under their own licences, listed in Profile → About & legal → Open-source licences and data. Nothing in these terms limits your rights under those licences.',
      ],
    },
    {
      heading: '10. No warranty',
      body: [
        'The app is provided “as is” and “as available”, without warranties of any kind, including fitness for a particular purpose, accuracy and non-infringement, to the extent the law allows.',
      ],
    },
    {
      heading: '11. Limit of liability',
      body: [
        'To the extent the law allows, we are not liable for indirect, incidental, special or consequential damages, or for loss of data, and our total liability for any claim about the app is limited to the greater of what you paid us in the 12 months before the claim or USD 50. Some places don’t allow these limits, so they may not apply to you.',
      ],
    },
    {
      heading: '12. Your responsibility for misuse',
      body: ['If your misuse of the app or breach of these terms causes a claim against us, you agree to cover the reasonable costs of it, to the extent the law allows.'],
    },
    {
      heading: '13. Stopping',
      body: ['You can stop at any time: erase your data in Profile → Your data and delete the app. We may change or stop offering the app.'],
    },
    {
      heading: '14. Law and disputes',
      body: [
        `Florida law applies, and disputes go to the courts of Florida, after first trying to settle them by contacting us (${contact}). If you live outside the United States, you keep the consumer protections of your own country, and you may use your local courts where those laws allow.`,
      ],
    },
    {
      heading: '15. Changes',
      body: [
        `We may update these terms. We’ll change the date and show a notice in the app; continuing to use the app after that means you accept the new terms. This version is effective ${LEGAL_DATE}.`,
      ],
    },
  ],
}

export const STORAGE: LegalDoc = {
  id: 'storage',
  title: 'Cookie and Storage Notice',
  summary: 'The app sets no cookies of its own and uses no analytics or advertising. It stores only what it needs to work, on your device.',
  sections: [
    {
      heading: 'What the app stores on your device',
      body: [{
        list: [
          'Your settings, health information, plans and logs (browser or app storage, “food-planner:v1”).',
          'Your Anthropic API key, if you add one (stored separately and left out of backups).',
          'The workout timer’s state, so a running timer survives closing the app.',
          'Web app only: an offline copy of the app’s files (a service worker cache), so it opens without a connection, and a note that stops an update from reloading twice.',
          'The scanner’s English text-reading data, saved after its first use so label scanning is quicker next time.',
        ],
      }],
      },
    {
      heading: 'Why no consent banner',
      body: [
        'All of this is strictly necessary for features you use, so the law doesn’t require a consent banner. Before adding anything that isn’t strictly necessary, such as analytics, we will update this notice and ask for your consent where the law requires it.',
      ],
    },
    {
      heading: 'Other companies',
      body: [
        'Google sets its own cookies when you sign in for the Google Tasks export, and the research websites the app links to set their own when you visit them. Their policies apply.',
      ],
    },
    {
      heading: 'Removing it',
      body: ['Profile → Your data → Erase everything removes what the app stores. Deleting the app, or clearing this website’s data in your browser, removes all of it.'],
    },
  ],
}

export const LEGAL_DOCS = [PRIVACY, TERMS, STORAGE] as const

/** Plain data credits shown with the open-source licences. */
export const DATA_CREDITS: { name: string; licence: string; note: string; url: string }[] = [
  { name: 'USDA FoodData Central', licence: 'Public domain (CC0 1.0)', note: 'Nutrient values for the built-in foods.', url: 'https://fdc.nal.usda.gov/' },
  { name: 'Open Food Facts', licence: 'Open Database License (ODbL) 1.0; contents under the Database Contents License', note: 'Product data for scanned barcodes, looked up when you scan.', url: 'https://world.openfoodfacts.org/data' },
  { name: 'Tesseract English trained data', licence: 'Apache License 2.0', note: 'Reads Nutrition Facts labels on your device.', url: 'https://github.com/tesseract-ocr/tessdata_best' },
  { name: 'ZXing-C++', licence: 'Apache License 2.0', note: 'The barcode reader inside zxing-wasm, used where the phone has no built-in one.', url: 'https://github.com/zxing-cpp/zxing-cpp' },
  { name: 'Tesseract OCR', licence: 'Apache License 2.0', note: 'The text-reading engine inside tesseract.js-core.', url: 'https://github.com/tesseract-ocr/tesseract' },
  { name: 'AndroidX libraries (Android app)', licence: 'Apache License 2.0', note: 'Google’s Android support libraries, built into the Android app.', url: 'https://developer.android.com/jetpack/androidx' },
  { name: 'Research sources', licence: 'Cited and linked, not copied', note: 'Every health claim links to its source (PubMed, NIH, FDA, USDA and others) in Health → Sources.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
]
