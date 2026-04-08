export function getGeoURL(cidade, estado, pais, api) {
  return `https://api.openweathermap.org/geo/1.0/direct?q=${cidade},${estado},${pais}&APPID=${api}`;
}
//return lat e long

export async function fetchGeoCode(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Parse the response body as JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}