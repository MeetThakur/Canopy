async function run() {
  const url1 = `https://itunes.apple.com/search?term=batman&media=movie&limit=3`;
  const res1 = await fetch(url1);
  const data1 = await res1.json();
  console.log("ITUNES MOVIE", data1.results.map(r => r.trackName));

  const url2 = `http://www.omdbapi.com/?apikey=thewdb&s=batman&type=movie`;
  const res2 = await fetch(url2);
  const data2 = await res2.json();
  console.log("OMDB MOVIE", data2);
}
run();
