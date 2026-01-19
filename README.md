# DishaSetu UI

Frontend application for DishaSetu built with Next.js, TypeScript, and React.

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **UI**: React 19
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Update `.env.local` with your API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
app/
├── (auth)/          # Auth route group
│   ├── login/
│   └── register/
├── (dashboard)/     # Dashboard route group
│   └── dashboard/
├── api/             # API routes (BFF)
├── layout.tsx       # Root layout
└── page.tsx         # Home page

components/
├── ui/              # Reusable UI components
├── shared/          # Shared components
└── forms/           # Form components

features/            # Feature-based modules
├── auth/
└── user/

hooks/               # Custom React hooks
lib/                 # Libraries and utilities
store/               # State management
types/               # TypeScript types
utils/               # Utility functions
```

## License

ISC
