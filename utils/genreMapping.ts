export const GENRE_TO_COLUMN_MAP: Record<string, string> = {
	'Pop': 'pop_playlist_id',
	'Rock': 'rock_playlist_id',
	'Metal': 'metal_playlist_id',
	'Hip-Hop': 'hip_hop_playlist_id',
	'Electronic': 'electronic_playlist_id',
	'R&B': 'r_and_b_playlist_id',
	'Country': 'country_playlist_id',
	'Jazz': 'jazz_playlist_id',
	'Classical': 'classical_playlist_id',
	'Folk/Acoustic': 'folk_acoustic_playlist_id',
	'Latin': 'latin_playlist_id',
	'Downtempo': 'downtempo_playlist_id',
	'Other': 'other_playlist_id',
}
/**
 * Gets the database column name for a given genre
 * @param genre - The formatted genre name (e.g. "Hip-Hop")
 * @returns Database column name (e.g. "hip_hop_playlist_id")
 */
export function getPlaylistColumnForGenre(genre: string): string {
	const columnName = GENRE_TO_COLUMN_MAP[genre]
	if (!columnName) {
		console.warn(`Unknown genre: ${genre}, defaulting to other_playlist_id`)
		return 'other_playlist_id'
	}
	return columnName
}

export interface UserGenrePlaylist {
	user_id: string
	pop_playlist_id?: string | null
	rock_playlist_id?: string | null
	metal_playlist_id?: string | null
	hip_hop_playlist_id?: string | null
	electronic_playlist_id?: string | null
	r_and_b_playlist_id?: string | null
	country_playlist_id?: string | null
	jazz_playlist_id?: string | null
	classical_playlist_id?: string | null
	folk_acoustic_playlist_id?: string | null
	latin_playlist_id?: string | null
	downtempo_playlist_id?: string | null
	other_playlist_id?: string | null
	created_at?: string
	updated_at?: string
}
