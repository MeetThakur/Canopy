const token = 'eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJIYXJkY292ZXIiLCJ2ZXJzaW9uIjoiOCIsImp0aSI6IjY1MmEzMGIwLTYxNTEtNDE5Mi1iZWEzLTA4OGIyY2FmNWFjMyIsImFwcGxpY2F0aW9uSWQiOjIsInN1YiI6Ijk5MTQwIiwiYXVkIjoiMSIsImlkIjoiOTkxNDAiLCJsb2dnZWRJbiI6dHJ1ZSwiaWF0IjoxNzc4ODMzMTQ3LCJleHAiOjE4MTAzNjkxNDcsImh0dHBzOi8vaGFzdXJhLmlvL2p3dC9jbGFpbXMiOnsieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIl0sIngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InVzZXIiLCJ4LWhhc3VyYS1yb2xlIjoidXNlciIsIlgtaGFzdXJhLXVzZXItaWQiOiI5OTE0MCJ9LCJ1c2VyIjp7ImlkIjo5OTE0MH19.KIHyF8_0E4i9mhxvVNkUwN93cqQQW42SyZSgWunqeTw';

async function test() {
  const q = `
    query {
      search(query: "Harry Potter") {
        results {
          __typename
        }
      }
    }
  `;
  const res = await fetch('https://api.hardcover.app/v1/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ query: q })
  });
  console.log(await res.text());
}
test();
