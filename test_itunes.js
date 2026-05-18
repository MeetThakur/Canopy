async function run() {
  const q = 'breaking bad';
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=tvShow&limit=5`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(data.results[0]);
}
run();
