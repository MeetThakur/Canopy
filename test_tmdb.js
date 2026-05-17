async function run() {
  const q = 'batman';
  const apiKey = 'c138f6402bedf5bc8873c3e0a63b9bb0';
  const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${q}&api_key=${apiKey}&append_to_response=credits`);
  console.log(res.status);
  const data = await res.json();
  console.log(data);
}
run();
