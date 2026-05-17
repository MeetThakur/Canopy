async function run() {
  const q = 'batman';
  const apiKey = 'c138f6402bedf5bc8873c3e0a63b9bb0';
  const urls = [
    `https://api.tmdb.org/3/search/movie?query=${q}&api_key=${apiKey}`,
    `https://tmdb.tiao.su/3/search/movie?query=${q}&api_key=${apiKey}`
  ];

  for (const u of urls) {
    try {
      console.log('Testing', u);
      const res = await fetch(u, { signal: AbortSignal.timeout(5000) });
      console.log('Status', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Success!', data.results.length);
      }
    } catch (e) {
      console.error('Failed', e.message);
    }
  }
}
run();
