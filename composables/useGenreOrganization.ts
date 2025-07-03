/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Core composable for organizing liked songs by genre
 * Handles artist data fetching, caching, and intelligent genre classification
 */

export const useGenreOrganization = () => {
	// Cache to store artist genre data (artistId -> genres array)
	const artistCache = new Map<string, string[]>()

	/**
	 * Comprehensive genre mapping - maps Spotify's specific genres to broad categories
	 */
	const GENRE_MAPPING = {
		Pop: [
			'pop', 'dance pop', 'latin pop', 'new wave pop', 'indonesian pop', 'k-pop',
			'singer-songwriter pop', 'modern country pop', 'alt z', 'opm', 'indietronica',
			'turkish pop', 'italian pop', 'j-pop', 'mexican pop', 'indie pop', 'spanish pop',
			'sertanejo pop', 'latin arena pop', 'synthpop', 'sped up', 'hip pop', 'desi pop',
			'eurodance', 'italian adult pop', 'french pop', 'german pop', 'post-teen pop',
			'art pop', 'nigerian pop', 't-pop', 'europop', 'chamber pop', 'mandopop', 'uk pop',
			'punjabi pop', 'swedish pop', 'v-pop', 'neon pop punk', 'classic italian pop',
			'k-pop girl group', 'britpop', 'polish pop', 'chinese viral pop', 'danish pop',
			'dutch pop', 'arab pop', 'girl group', 'meme', 'gen z singer-songwriter',
			'afropop', 'k-pop boy group', 'folk-pop', 'russian pop', 'electropop',
			'classic country pop', 'cumbia pop', 'talent show', 'french indie pop',
			'latin viral pop', 'boy band', 'reggae fusion', '5th gen k-pop', 'colombian pop',
			'korean pop', 'acoustic pop', 'country pop', 'malaysian pop', 'neo-synthpop',
			'arabesk', 'bubblegum pop', 'cantopop', 'thai pop', 'finnish pop', 'canadian pop',
			'viral pop', 'classic swedish pop', 'funk rj',
		],
		Rock: [
			'rock', 'alternative rock', 'indie rock', 'classic rock', 'punk', 'punk rock',
			'garage rock', 'psychedelic rock', 'grunge', 'alternative', 'indie', 'emo',
			'post-punk', 'new wave', 'britrock', 'college rock', 'modern rock', 'art rock',
			'progressive rock', 'glam rock', 'southern rock', 'blues rock',
			'country rock', 'roots rock', 'heartland rock', 'arena rock', 'surf rock',
			'garage rock revival', 'post-punk revival', 'neo-psychedelic',
		],
		Metal: [
			'metal', 'alternative metal', 'post-grunge', 'nu metal', 'glam metal',
			'metalcore', 'rap metal', 'melodic metalcore', 'power metal', 'industrial metal',
			'screamo', 'symphonic metal', 'skate punk', 'speed metal', 'groove metal',
			'deathcore', 'thrash metal', 'death metal', 'funk metal', 'uptempo hardcore',
			'progressive metal', 'stoner metal', 'hardcore punk', 'gothic metal',
			'gothic symphonic metal', 'djent', 'melodic death metal', 'black metal',
			'german metal', 'slayer', 'metallic hardcore', 'progressive post-hardcore',
			'brutal death metal', 'comic metal', 'sludge metal', 'melodic metal',
			'heavy metal', 'old school thrash', 'technical death metal', 'deathgrind',
			'melodic hardcore', 'spanish metal', 'trancecore', 'post-metal',
		],
		Hip_Hop: [
			'hip hop', 'rap', 'drill', 'grime', 'conscious hip hop', 'east coast hip hop',
			'west coast rap', 'southern hip hop', 'gangsta rap', 'alternative hip hop',
			'experimental hip hop', 'old school hip hop', 'boom bap', 'cloud rap',
			'mumble rap', 'latin hip hop', 'uk hip hop', 'french hip hop', 'german hip hop',
			'trap', 'gym phonk', 'swedish trap pop', 'dutch rap pop', 'canadian hip hop',
		],
		Electronic: [
			'electronic', 'house', 'techno', 'dubstep', 'edm', 'ambient', 'trance',
			'drum and bass', 'breakbeat', 'garage', 'jungle', 'hardcore', 'hardstyle',
			'progressive house', 'deep house', 'tech house', 'minimal techno', 'acid house',
			'synthwave', 'vaporwave', 'chillwave', 'downtempo', 'idm', 'electronica',
			'electro', 'disco', 'nu-disco', 'future bass', 'glitch', 'drone', 'dark ambient',
			'new age',
		],
		R_and_B: [
			'r&b', 'soul', 'funk', 'neo soul', 'contemporary r&b', 'quiet storm',
			'new jack swing', 'hip hop soul', 'alternative r&b', 'urban contemporary',
		],
		Country: [
			'country', 'bluegrass', 'alt-country', 'outlaw country',
			'honky tonk', 'western', 'contemporary country',
		],
		Jazz: [
			'jazz', 'bebop', 'smooth jazz', 'fusion', 'cool jazz', 'hard bop', 'free jazz',
			'latin jazz', 'contemporary jazz', 'jazz funk', 'acid jazz', 'nu jazz',
			'swing', 'big band', 'ragtime', 'dixieland', 'modal jazz', 'post-bop',
		],
		Classical: [
			'classical', 'orchestral soundtrack', 'neo-classical', 'compositional ambient',
			'video game music', 'epicore', 'early modern classical', 'baroque',
			'post-romantic era', 'indian classical', 'early music', 'classical era',
			'late romantic era', 'impressionism', 'gregorian chant', 'renaissance',
			'cello', 'italian romanticism', 'orthodox chant', 'choral',
			'contemporary classical', 'neoclassicism', 'classical guitar', 'opera',
		],
		Folk_Acoustic: [
			'folk', 'acoustic', 'singer-songwriter', 'indie folk', 'alternative country',
			'americana', 'traditional folk', 'contemporary folk', 'acoustic rock',
			'fingerstyle', 'celtic', 'world music', 'protest song', 'roots', 'banjo',
			'mandolin', 'bluegrass', 'country folk', 'irish folk', 'scottish folk',
			'bedroom pop', 'indie poptimism', 'dream pop', 'folk rock',
		],
		Latin: [
			'latin', 'salsa', 'reggaeton', 'bachata', 'merengue', 'cumbia', 'bossa nova',
			'samba', 'tango', 'flamenco', 'mariachi', 'tejano', 'latin rock',
			'nueva cancion', 'bolero', 'mambo', 'cha cha cha', 'rumba',
		],
		Anime_Japanese: [
			'anime', 'otacore', 'pixel', 'vocaloid',
		],
		Gospel_Worship: [
			'christian music', 'worship', 'ccm', 'adoracao', 'gospel',
		],
		Downtempo: [
			'trip hop',
		],
	}

	/**
	 * Maps specific Spotify genres to broad user-friendly categories
	 */
	const mapGenresToBroadCategories = (spotifyGenres: string[]): string => {
		// Check each genre in priority order (first genre is most important)
		for (const genreToCheck of spotifyGenres) {
			// See if this specific genre matches any of our broad categories
			for (const [broadGenre, subgenres] of Object.entries(GENRE_MAPPING)) {
				const hasMatch = subgenres.some(mappedGenre =>
					genreToCheck.toLowerCase().includes(mappedGenre.toLowerCase()),
				)
				if (hasMatch) {
					return formatGenreName(broadGenre)
				}
			}
		}
		return 'Other'
	}
	const formatGenreName = (internalGenreName: string): string => {
		const genreNameMappings: Record<string, string> = {
			Hip_Hop: 'Hip-Hop',
			R_and_B: 'R&B',
			Folk_Acoustic: 'Folk/Acoustic',
			Anime_Japanese: 'Anime/Japanese',
			Gospel_Worship: 'Gospel/Worship',
			// For any genres that don't have special formatting needs,
			// we'll just replace underscores with spaces
		}

		// If we have an explicit mapping, use it
		if (genreNameMappings[internalGenreName]) {
			return genreNameMappings[internalGenreName]
		}

		// For genres not in our mapping, default to replacing underscores with spaces
		return internalGenreName.replace(/_/g, ' ')
	}

	/**
	 * Extract unique artist IDs from liked songs (first artist only)
	 */
	const getArtistsToFetch = (tracks: any[]): string[] => {
		const uniqueArtistIds = new Set<string>()

		tracks.forEach((item) => {
			// Handle different track formats: track on liked songs vs track on playlist

			const track = item.track || item
			const primaryArtist = track?.artists?.[0]
			if (primaryArtist?.id) {
				uniqueArtistIds.add(primaryArtist.id)
			}
		})

		const artistsToFetch = Array.from(uniqueArtistIds).filter(
			artistId => !artistCache.has(artistId),
		)

		console.log(`🎭 Found ${uniqueArtistIds.size} unique artists, fetching ${artistsToFetch.length} new ones`)
		return artistsToFetch
	}

	/**
	 * Fetch artist data in efficient batches and cache results
	 */
	const fetchAndCacheArtistData = async (artistIds: string[]) => {
		const { getMultipleArtistsInfo } = useSpotifyApi()

		const batchSize = 50
		let totalProcessed = 0

		for (let i = 0; i < artistIds.length; i += batchSize) {
			const batch = artistIds.slice(i, i + batchSize)

			try {
				const artistData = await getMultipleArtistsInfo(batch)

				if (artistData.artists) {
					artistData.artists.forEach((artist: any) => {
						if (artist?.id) {
							artistCache.set(artist.id, artist.genres || [])
						}
					})
				}

				totalProcessed += batch.length
				console.log(`✅ Fetched artist data: ${totalProcessed}/${artistIds.length}`)
			}
			catch (error) {
				console.error(`❌ Error fetching artist batch:`, error)
			}
		}
	}

	/**
	 * MAIN FUNCTION: Organize all liked songs by genre
	 */
	const organizeByGenre = async (tracks: any[]) => {
		console.log(`🎯 Organizing ${tracks.length} tracks by genre...`)

		const artistsToFetch = getArtistsToFetch(tracks)

		if (artistsToFetch.length > 0) {
			await fetchAndCacheArtistData(artistsToFetch)
		}

		const tracksByGenre: Record<string, any[]> = {}

		tracks.forEach((item) => {
			// Handle different track formats: track on liked songs vs track on playlist
			const track = item.track || item
			const primaryArtist = track?.artists?.[0]

			if (primaryArtist?.id) {
				const artistGenres = artistCache.get(primaryArtist.id) || []
				const broadGenre = mapGenresToBroadCategories(artistGenres)

				if (!tracksByGenre[broadGenre]) {
					tracksByGenre[broadGenre] = []
				}

				tracksByGenre[broadGenre].push(item)
			}
		})

		console.log(`✅ Organization complete: ${Object.keys(tracksByGenre).length} categories created`)
		return tracksByGenre
	}

	return {
		organizeByGenre,
	}
}
