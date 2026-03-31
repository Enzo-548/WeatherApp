import { fetchWeather, getWeatherURL } from "../api/weather.js";
import { fetchGeoCode, getGeoURL } from "../api/geocode.js";

const api = "c8921f0324e3c6dcaeba72c9ad2a6466";
let cidade, estado, pais, lat, lon;
const kelvin = 273.15;

//A partir daqui reolver as funções

document.addEventListener("DOMContentLoaded", async () => {
  //pegar cid, est, pais de algum input
  //setLocal();
  cidade = "Erechim";
  estado = "RS";
  pais = "BR";

  const userLocation = await getUserLocation({
    enableHighAccuracy: true,
    timeout: 10000,
  });

  console.log(
    "Latitude\t\tLogitude\n" +
      userLocation.latitude +
      "\t\t" +
      userLocation.longitude,
  );

  var geoURL = await getGeoURL(cidade, estado, pais, api);
  const geoData = await fetchGeoCode(geoURL);
  lat = geoData[0].lat;
  lon = geoData[0].lon;

  var weatherURL = await getWeatherURL(lat, lon, api);
  const weatherData = await fetchWeather(weatherURL);

  //a partir daqui dá para fazer tudo
  console.log("Temperatura:\t" + (weatherData.main.temp - kelvin));
  console.log("Vento:\t\t" + weatherData.wind.speed);
  console.log("Umidade:\t" + weatherData.main.humidity);
  console.log("Sensação:\t" + (weatherData.main.feels_like - kelvin));
  console.log("Pressão:\t" + weatherData.main.pressure);
});

//caso base --> IP maquina
function setLocal() {
  cidade = document.getElementById("cidade").value;
  estado = document.getElementById("estado").value;
  pais = document.getElementById("pais").value;
}

// --- Função para pedir localização (retorna uma Promise) ---
function getUserLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation API não suportada no navegador."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
      },
      (error) => {
        let errorMessage = "Erro desconhecido ao acessar localização.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permissão negada para acessar a localização.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Localização indisponível.";
            break;
          case error.TIMEOUT:
            errorMessage = "Tempo de requisição de localização esgotado.";
            break;
        }
        reject(new Error(errorMessage));
      },
      options,
    );
  });
}
