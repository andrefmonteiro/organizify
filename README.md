# Organizify

**Declutter your Liked Songs**

Organizify automatically organizes your Spotify liked songs into neat, genre-based playlists. Say goodbye to endless scrolling through your liked songs collection and hello to perfectly organized music discovery.

![Organizify Interface](https://via.placeholder.com/800x400/EBF4EE/06180D?text=Organizify+Dashboard)

## ✨ What It Does

Organizify analyzes your entire Spotify liked songs collection and intelligently creates genre-based playlists like:

- **Hip-Hop** - All your rap and hip-hop tracks
- **Electronic** - EDM, house, techno, and electronic music
- **Rock** - Classic rock, indie rock, alternative, and more
- **Jazz** - Smooth jazz, bebop, and jazz fusion
- **Folk/Acoustic** - Acoustic tracks and folk music
- **R&B** - Soul, R&B, and contemporary R&B
- **Metal** - Heavy metal, metalcore, and all subgenres
- **Pop** - Pop hits and pop variations
- **Classical** - Orchestral and classical compositions
- **Latin** - Reggaeton, salsa, bossa nova, and Latin music

The system handles complex genre detection by analyzing artist data and uses intelligent mapping to group similar genres together, ensuring your music is organized in a way that makes sense for discovery and listening.

## 🚀 Features

### Core Organization
- **Intelligent Genre Detection**: Uses Spotify's artist data to accurately categorize your music
- **Batch Processing**: Efficiently handles large music collections (tested with 1000+ songs)
- **Smart Playlist Creation**: Creates playlists with descriptive names like "Organizify - Rock"
- **Comprehensive Coverage**: Organizes virtually all music genres with an "Other" category for edge cases

### User Experience
- **One-Click Organization**: Simply click "Organize by Genre" and let the system work
- **Progress Tracking**: See real-time updates as playlists are created and populated
- **Error Recovery**: Continues organizing even if individual playlists fail
- **Graceful Handling**: Skips empty genres and handles edge cases automatically

### Technical Features
- **Spotify API Integration**: Full OAuth authentication and API communication
- **Rate Limit Respect**: Intelligent request pacing to avoid API limits
- **Secure Authentication**: Supabase-powered auth with proper token management
- **Responsive Design**: Works perfectly on desktop and mobile devices

## 🛠 Tech Stack

- **Frontend**: Nuxt 4, Vue 3, TypeScript
- **Styling**: Tailwind CSS with custom brand colors
- **UI Components**: shadcn/ui components for polished interface
- **Authentication**: Supabase Auth with Spotify OAuth
- **Database**: Supabase PostgreSQL
- **API Integration**: Spotify Web API
- **Deployment Ready**: Built for Vercel, Netlify, or any Node.js host

## 🏗 How It Works

1. **Authentication**: Users log in with their Spotify account through secure OAuth
2. **Data Collection**: System fetches all liked songs using paginated API calls
3. **Artist Analysis**: Retrieves genre information for all unique artists in your collection
4. **Intelligent Mapping**: Maps specific Spotify genres to broader, user-friendly categories
5. **Playlist Creation**: Creates playlists for each genre represented in your music
6. **Track Population**: Efficiently adds songs to appropriate playlists in batches
7. **Result Summary**: Shows users exactly what was organized and where
---

**Made with ❤️ for music lovers who want their digital music organized**