export async function fetchStateJsonFromUrl(url) {
  const response = await fetch(url);
  return response.json();
}
