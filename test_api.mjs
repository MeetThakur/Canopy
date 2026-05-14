import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const tmdbKey = env.match(/EXPO_PUBLIC_TMDB_API_KEY=(.*)/)?.[1]?.trim();
const igdbClient = env.match(/EXPO_PUBLIC_IGDB_CLIENT_ID=(.*)/)?.[1]?.trim();
const igdbToken = env.match(/EXPO_PUBLIC_IGDB_ACCESS_TOKEN=(.*)/)?.[1]?.trim();

async function testTMDB() {
  console.log('Testing TMDB...');
  try {
    const res = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${tmdbKey}`);
    const data = await res.json();
    console.log('TMDB:', data.results?.length > 0 ? `SUCCESS (Found ${data.results.length} movies)` : JSON.stringify(data));
  } catch(e) {
    console.error('TMDB Error:', e.message);
  }
}

async function testIGDB() {
  console.log('Testing IGDB...');
  try {
    const res = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': igdbClient,
        'Authorization': `Bearer ${igdbToken}`,
        'Accept': 'application/json',
        'Content-Type': 'text/plain',
      },
      body: `fields name; limit 5;`
    });
    const data = await res.json();
    console.log('IGDB:', Array.isArray(data) ? `SUCCESS (Found ${data.length} games)` : JSON.stringify(data));
  } catch(e) {
    console.error('IGDB Error:', e.message);
  }
}

async function testOpenLibrary() {
  console.log('Testing Open Library...');
  try {
    const res = await fetch('https://openlibrary.org/search.json?q=bestseller&limit=15');
    const data = await res.json();
    console.log('Open Library:', data.docs?.length > 0 ? `SUCCESS (Found ${data.docs.length} books)` : 'FAILED');
  } catch(e) {
    console.error('Open Library Error:', e.message);
  }
}

async function runAll() {
  await testTMDB();
  await testIGDB();
  await testOpenLibrary();
}

runAll();
