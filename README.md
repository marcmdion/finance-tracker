# Finance Strategist Dashboard

Personal finance dashboard built with Next.js, shadcn/ui, Firebase, and Recharts. Track income and expenses across custom billing cycles (20th–19th), visualize cash flow with a Sankey chart, and review multi-cycle summaries.

## Features

- Email/password authentication via Firebase Auth
- Real-time transaction sync with Firestore
- Custom monthly billing cycle navigation (20th to 19th)
- Dashboard with summary cards, Sankey chart, and transaction CRUD
- Summary table with category drill-down
- Auto-categorization from past merchant names
- shadcn/ui components with a clean, accessible interface

## Getting Started

### Prerequisites

- Node.js 20+
- A Firebase project with Authentication (Email/Password) and Firestore enabled

### Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and add your Firebase config:

```bash
cp .env.example .env.local
```

3. Update Firestore rules in the Firebase Console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/transactions/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to GitHub Pages

GitHub Pages serves static files only, so the app is built with Next.js static export (`output: "export"`). Firebase runs entirely in the browser, which fits this model well.

### One-time GitHub setup

1. Open your repo on GitHub → **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Go to **Settings** → **Secrets and variables** → **Actions**
4. Add these repository secrets (values from your Firebase project):

| Secret | Example |
|--------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-app.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `your-app` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your-app.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:123:web:abc` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-XXXX` |

5. In the [Firebase Console](https://console.firebase.google.com/) → **Authentication** → **Settings** → **Authorized domains**, add:
   - `marcmdion.github.io` (or your GitHub username)

### Deploy

Push to `main`. The workflow in `.github/workflows/deploy-github-pages.yml` will:

1. Build the static site with `basePath: /finance-tracker`
2. Upload the `out/` folder as a Pages artifact
3. Deploy to GitHub Pages

You can also trigger a deploy manually from the **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**.

**Live URL:** https://marcmdion.github.io/finance-tracker/

### Test the production build locally

```bash
GITHUB_PAGES=true npm run build
npx serve out
```

Then open the URL shown (append `/finance-tracker/` if testing with the GitHub Pages base path).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Static export build (outputs to `out/`) |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/                 # Next.js App Router pages and layout
├── components/
│   ├── auth/            # Authentication screen
│   ├── dashboard/       # Dashboard views and charts
│   ├── finance-app.tsx  # Main application shell
│   └── ui/              # shadcn/ui primitives
├── hooks/               # Auth and Firestore hooks
└── lib/                 # Firebase, utilities, and types
```

## Tech Stack

- [Next.js 16](https://nextjs.org/)
- [React 19](https://react.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [Recharts](https://recharts.org/)
