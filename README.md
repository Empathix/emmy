# Emmy - AI Job Search Platform

Every job worth seeing—found by talking, not typing.

## About

Emmy is an AI-powered job search platform that lets you find your dream role through a simple 5-minute conversation. Instead of spending hours scrolling through job boards, Emmy searches across multiple platforms and matches you with opportunities at fast-growing companies.

## Features

- **Voice-First Interface**: Talk to Emmy instead of typing endless search queries
- **Multi-Platform Search**: Searches across all major job boards and our network of hiring companies
- **Smart Matching**: AI-powered matching ensures you only see roles worth your time
- **Privacy First**: Your search is private, and you approve every introduction
- **5-Minute Setup**: Get matched to opportunities in just one short conversation

## Tech Stack

- **Next.js** - React framework for production
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first styling
- **ElevenLabs** - Voice AI integration
- **RapidAPI** - Job board aggregation

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/OliviaDyet/emmy.git
cd emmy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
ELEVENLABS_API_KEY=your_elevenlabs_key
PEOPLE_DATA_LABS_API_KEY=your_pdl_key
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=active-jobs-db.p.rapidapi.com
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
emmy/
├── src/
│   ├── components/
│   │   └── emmy/          # Emmy-specific components
│   ├── pages/
│   │   ├── emmy/          # Emmy pages (landing, voice, chat)
│   │   └── api/           # API routes
│   ├── types/             # TypeScript types
│   └── styles/            # Global styles
├── public/                # Static assets
└── package.json
```

## Deployment

Deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/OliviaDyet/emmy)

Remember to add your environment variables in the Vercel dashboard.

## License

MIT

## Contact

Created by Olivia Dyet
