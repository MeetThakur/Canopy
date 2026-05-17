async function run() {
  const q = 'batman';
  const apiKey = 'c138f6402bedf5bc8873c3e0a63b9bb0';
  const tmdbUrl = `https://api.themoviedb.org/3/search/movie?query=${q}&api_key=${apiKey}`;
  const urls = [
    `https://corsproxy.io/?${encodeURIComponent(tmdbUrl)}`
  ];

  for (const u of urls) {
    try {
      console.log('Testing', u);
      const res = await fetch(u, { signal: AbortSignal.timeout(10000) });
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
