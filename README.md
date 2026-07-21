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

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
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
