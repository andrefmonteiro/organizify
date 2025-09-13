# Organizify

Turn your chaotic Spotify liked songs into organized genre playlists.

## What it does

Organizify analyzes your Spotify liked songs and automatically creates separate playlists for each music genre in your collection. Instead of scrolling through hundreds of mixed songs, you'll have clean playlists like "Hip-Hop - Organizify" and "Rock - Organizify."

## How it works

1. Genre Detection: Fetches artist data from Spotify API to determine genres
2. Playlist Creation: Generates private playlists with custom covers for each genre
3. Incremental Sync: Only processes new liked songs to avoid reprocessing your entire library
4. Track Validation: Filters invalid tracks and handles edge cases

**Stack:** Nuxt.js, Tailwind CSS, Supabase, Spotify Web API

Access
Due to Spotify's API restrictions, Organizify is invite-only and limited to 25 users. Read about it and request access on the [announcement page.](organizify.app/announcement.)
