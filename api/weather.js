export function getWeatherURL(lat, lon, api) {
  return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}1&lon=${lon}&appid=${api}`;
}
//com base na lat e lon pega
//fazer isso:
export async function fetchWeather(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    //Parse the response body as JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
