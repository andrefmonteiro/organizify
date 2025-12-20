# Organizify

Turn your chaotic Spotify liked songs into organized genre playlists.

## What it does

Organizify analyzes your Spotify liked songs and automatically creates separate playlists for each music genre in your collection. Instead of scrolling through hundreds of mixed songs, you'll have clean playlists like "Hip-Hop - Organizify" and "Rock - Organizify."

## How it works

1. **Genre Detection**: Fetches artist data from Spotify API to determine genres
2. **Playlist Creation**: Generates private playlists with custom covers for each genre
3. **Incremental Sync**: Only processes new liked songs to avoid reprocessing your entire library
4. **Track Validation**: Filters invalid tracks and handles edge cases

## Tech Stack

- [Nuxt 3](https://nuxt.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Shadcn Vue](https://www.shadcn-vue.com/)

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- Supabase account and project
- Spotify Developer account with Premium subscription

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/andrefmonteiro/organizify.git
   cd organizify
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_KEY=your-supabase-service-key
   SUPABASE_DB_PASSWORD=your-database-password
   ```

   Get these values from your [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Public Access

Due to Spotify's API restrictions, Organizify is invite-only and limited to 25 users. Read about it and request access at [organizify.app/announcement](https://organizify.app/announcement).
