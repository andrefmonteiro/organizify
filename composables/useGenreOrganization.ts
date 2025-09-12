/* eslint-disable @typescript-eslint/no-explicit-any */

import { useSpotifyApi } from './useSpotifyApi'

export const useGenreOrganization = (token: string) => {
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
		Downtempo: [
			'trip hop', 'trip-hop', 'downtempo',
		],
	}

	const mapGenresToBroadCategories = (spotifyGenres: string[]): string => {
		for (const genreToCheck of spotifyGenres) {
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
		}

		if (genreNameMappings[internalGenreName]) {
			return genreNameMappings[internalGenreName]
		}

		return internalGenreName.replace(/_/g, ' ')
	}

	const organizeByGenre = async (tracks: any[]) => {
		const artistCache = new Map<string, string[]>()

		const uniqueArtistIds = new Set<string>()
		tracks.forEach((item) => {
			const track = item.track || item
			const primaryArtist = track?.artists?.[0]
			if (primaryArtist) uniqueArtistIds.add(primaryArtist.id)
		})

		const { getMultipleArtistsInfo } = useSpotifyApi()
		const artistsIds = Array.from(uniqueArtistIds)
		const batchSize = 50

		for (let i = 0; i < artistsIds.length; i += batchSize) {
			const batch = artistsIds.slice(i, i + batchSize)

			try {
				const artistData = await getMultipleArtistsInfo(batch, token)

				if (artistData.artists) {
					artistData.artists.forEach((artist: any) => {
						if (artist?.id) {
							artistCache.set(artist.id, artist.genres || [])
						}
					})
				}
			}
			catch (error) {
				console.error(`Error fetching artist batch: ${error}`)
			}
		}

		const tracksByGenre: Record<string, any[]> = {}

		tracks.forEach((item) => {
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
			else {
				if (!tracksByGenre['Other']) {
					tracksByGenre['Other'] = []
				}
				tracksByGenre['Other'].push(item)
			}
		})

		return tracksByGenre
	}

	return {
		organizeByGenre,
	}
}
