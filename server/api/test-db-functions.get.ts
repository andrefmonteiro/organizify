// server/api/test-db-functions.get.ts
// TEMPORARY: Test each database function individually
// Delete this after confirming everything works!

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { useDatabaseOperations } from '~/composables/useDatabaseOperations'

interface TestResult {
	status: string
	[key: string]: unknown
}

interface TestResults {
	user_id: string
	tests: {
		get_playlist_ids?: TestResult
		get_jazz_playlist?: TestResult
		store_playlist_id?: TestResult
		retrieve_stored_playlist?: TestResult
		unprocessed_songs?: TestResult
		mark_processed?: TestResult
		unprocessed_after_marking?: TestResult
	}
	summary?: {
		total_tests: number
		successful: number
		failed: number
		overall: string
	}
}

export default defineEventHandler(async (event) => {
	try {
		const user = await serverSupabaseUser(event)
		const supabase = await serverSupabaseClient(event)
		if (!user) {
			return { error: 'Not authenticated' }
		}
		console.log('\n🧪 Testing database operations for user:', user.user_metadata)
		const {
			getUnprocessedSongs,
			getPlaylistIdForGenre,
			storePlaylistId,
			markSongsAsProcessed,
			getUserPlaylistIds,
		} = useDatabaseOperations(supabase)

		const results: TestResults = {
			user_id: user.id,
			tests: {},
		}

		// Test 1: Get current playlist IDs (should be empty/null for new user)
		console.log('\n📋 Test 1: Get user playlist IDs...')
		try {
			const currentPlaylists = await getUserPlaylistIds(user.id)
			results.tests.get_playlist_ids = {
				status: '✅ Success',
				data: currentPlaylists,
			}
			console.log('✅ Current playlists:', currentPlaylists)
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			results.tests.get_playlist_ids = {
				status: '❌ Failed',
				error: errorMessage,
			}
			console.error('❌ Get playlist IDs failed:', error)
		}

		// Test 2: Check for Jazz playlist (should return null for new user)
		console.log('\n🎷 Test 2: Check for Jazz playlist...')
		try {
			const { playlistId: jazzPlaylistId, columnName: jazzColumn } = await getPlaylistIdForGenre(user.id, 'Jazz')
			results.tests.get_jazz_playlist = {
				status: '✅ Success',
				playlist_id: jazzPlaylistId,
				column_name: jazzColumn,
				message: jazzPlaylistId ? 'Jazz playlist exists!' : 'No Jazz playlist found (expected for new user)',
			}
			console.log(`✅ Jazz playlist ID: ${jazzPlaylistId || 'null (expected)'}, Column: ${jazzColumn}`)
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			results.tests.get_jazz_playlist = {
				status: '❌ Failed',
				error: errorMessage,
			}
			console.error('❌ Get Jazz playlist failed:', error)
		}

		// Test 3: Store a fake playlist ID
		console.log('\n💾 Test 3: Store fake Rock playlist ID...')
		const fakePlaylistId = `fake_rock_${Date.now()}`
		try {
			// Get the column name for Rock first
			const { columnName } = await getPlaylistIdForGenre(user.id, 'Rock')

			await storePlaylistId(user.id, columnName, fakePlaylistId)
			results.tests.store_playlist_id = {
				status: '✅ Success',
				stored_id: fakePlaylistId,
				column_name: columnName,
				message: 'Fake Rock playlist ID stored successfully',
			}
			console.log('✅ Stored fake Rock playlist ID:', fakePlaylistId, 'in column:', columnName)
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			results.tests.store_playlist_id = {
				status: '❌ Failed',
				error: errorMessage,
			}
			console.error('❌ Store playlist ID failed:', error)
		}

		// Test 4: Verify the stored playlist ID can be retrieved
		console.log('\n🔍 Test 4: Retrieve stored Rock playlist...')
		try {
			const { playlistId: storedRockId } = await getPlaylistIdForGenre(user.id, 'Rock')
			const matches = storedRockId === fakePlaylistId
			results.tests.retrieve_stored_playlist = {
				status: matches ? '✅ Success' : '⚠️ Mismatch',
				expected: fakePlaylistId,
				actual: storedRockId,
				message: matches ? 'Stored and retrieved IDs match!' : 'Stored and retrieved IDs do not match',
			}
			console.log(`${matches ? '✅' : '⚠️'} Retrieved Rock playlist: ${storedRockId}`)
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			results.tests.retrieve_stored_playlist = {
				status: '❌ Failed',
				error: errorMessage,
			}
			console.error('❌ Retrieve stored playlist failed:', error)
		}

		// Test 5: Test unprocessed songs with fake data
		console.log('\n🎵 Test 5: Test unprocessed songs logic...')
		const fakeLikedSongs = [
			{ track: { id: 'song1', name: 'Test Song 1' } },
			{ track: { id: 'song2', name: 'Test Song 2' } },
			{ track: { id: 'song3', name: 'Test Song 3' } },
		]

		try {
			const unprocessedSongs = await getUnprocessedSongs(user.id, fakeLikedSongs)
			results.tests.unprocessed_songs = {
				status: '✅ Success',
				total_input: fakeLikedSongs.length,
				unprocessed_count: unprocessedSongs.length,
				message: `${unprocessedSongs.length} songs are unprocessed (expected: all ${fakeLikedSongs.length} for new user)`,
			}
			console.log(`✅ Unprocessed songs: ${unprocessedSongs.length}/${fakeLikedSongs.length}`)
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			results.tests.unprocessed_songs = {
				status: '❌ Failed',
				error: errorMessage,
			}
			console.error('❌ Get unprocessed songs failed:', error)
		}

		// Test 6: Mark some fake songs as processed
		console.log('\n✏️ Test 6: Mark songs as processed...')
		const fakeSongsToMark = [
			{ track: { id: 'song1', name: 'Test Song 1' } },
			{ track: { id: 'song2', name: 'Test Song 2' } },
		]

		try {
			await markSongsAsProcessed(user.id, fakeSongsToMark, 'Rock')
			results.tests.mark_processed = {
				status: '✅ Success',
				marked_count: fakeSongsToMark.length,
				genre: 'Rock',
				message: `Successfully marked ${fakeSongsToMark.length} songs as processed for Rock genre`,
			}
			console.log(`✅ Marked ${fakeSongsToMark.length} songs as processed for Rock`)
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			results.tests.mark_processed = {
				status: '❌ Failed',
				error: errorMessage,
			}
			console.error('❌ Mark songs as processed failed:', error)
		}

		// Test 7: Verify unprocessed songs count changed
		console.log('\n🔄 Test 7: Re-test unprocessed songs (should be fewer now)...')
		try {
			const unprocessedAfterMarking = await getUnprocessedSongs(user.id, fakeLikedSongs)
			const expectedCount = fakeLikedSongs.length - fakeSongsToMark.length
			const actualCount = unprocessedAfterMarking.length
			const matches = actualCount === expectedCount

			results.tests.unprocessed_after_marking = {
				status: matches ? '✅ Success' : '⚠️ Unexpected count',
				expected_count: expectedCount,
				actual_count: actualCount,
				message: matches
					? `Correctly shows ${actualCount} unprocessed songs after marking ${fakeSongsToMark.length}`
					: `Expected ${expectedCount} unprocessed songs, got ${actualCount}`,
			}
			console.log(`${matches ? '✅' : '⚠️'} Unprocessed after marking: ${actualCount} (expected: ${expectedCount})`)
		}
		catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			results.tests.unprocessed_after_marking = {
				status: '❌ Failed',
				error: errorMessage,
			}
			console.error('❌ Re-test unprocessed songs failed:', error)
		}

		// Final summary
		const testEntries = Object.entries(results.tests)
		const successCount = testEntries.filter(([_, testResult]) =>
			testResult.status.includes('✅'),
		).length
		const totalTests = testEntries.length

		results.summary = {
			total_tests: totalTests,
			successful: successCount,
			failed: totalTests - successCount,
			overall: successCount === totalTests ? '✅ All tests passed!' : `⚠️ ${successCount}/${totalTests} tests passed`,
		}

		console.log(`\n🎊 Test Summary: ${results.summary.overall}`)
		return results
	}

	catch (error) {
		console.error('💥 Database functions test crashed:', error)
		const errorMessage = error instanceof Error ? error.message : 'Unknown error'
		return {
			success: false,
			error: 'Test crashed',
			details: errorMessage,
		}
	}
})
