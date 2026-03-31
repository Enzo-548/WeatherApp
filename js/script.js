import { fetchWeather, getWeatherURL } from "../api/weather.js";
import { fetchGeoCode, getGeoURL } from "../api/geocode.js";

const api = "c8921f0324e3c6dcaeba72c9ad2a6466";
let cidade, estado, pais, lat, lon;

//A partir daqui reolver as funções

document.addEventListener("DOMContentLoaded", () => {
  //pegar cid, est, pais de algum input
  setLocal();

  var geoURL = getGeoURL(cidade, estado, pais, api);
  const geoData = fetchGeoCode(geoURL);
  lat = geoData.lat;
  lon = geoData.long;

  var weatherURL = getWeatherURL(lat, lon, api);
  const weatherData = fetchWeather(weatherURL);

  //a partir daqui dá para fazer tudo

});

//caso base --> IP maquina

function setLocal() {
  cidade = document.getElementById("cidade").value;
  estado = document.getElementById("estado").value;
  pais = document.getElementById("pais").value;
}
