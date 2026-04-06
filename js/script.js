import { fetchWeather, getWeatherURL } from "../api/weather.js";
import { fetchGeoCode, getGeoURL } from "../api/geocode.js";

const api = "c8921f0324e3c6dcaeba72c9ad2a6466";
let cidade, estado, pais, lat, lon;
const kelvin = 273.15;

document.addEventListener("DOMContentLoaded", async () => {
  //pegar cid, est, pais de algum input
  //setLocal();
  cidade = "Erechim";
  estado = "RS";
  pais = "BR";

  const locUsuario = await getUserLocation({
    enableHighAccuracy: true,
    timeout: 10000,
  });

  console.log(
    "Latitude\t\tLogitude\n" +
      locUsuario.latitude +
      "\t\t" +
      locUsuario.longitude,
  );

  var geoURL = await getGeoURL(cidade, estado, pais, api);
  const geoData = await fetchGeoCode(geoURL);
  lat = geoData[0].lat;
  lon = geoData[0].lon;

  var weatherURL = await getWeatherURL(lat, lon, api);
  const weatherData = await fetchWeather(weatherURL);

  //descricao/main --> sol chuva etc ou ensolarado, chuva leve
  console.log("Descrição Tempo: " + weatherData.weather[0].description);

  //reconstrucao basica com logs do sistema!!!
  console.log("Cidade: " + geoData[0].name + ", " + geoData[0].state);
  console.log("Temperatura:\t" + (weatherData.main.temp - kelvin));
  console.log("Sensação:\t" + (weatherData.main.feels_like - kelvin));

  console.log("Vento:\t\t" + weatherData.wind.speed);
  console.log("Umidade:\t" + weatherData.main.humidity);
  console.log("Pressão:\t" + weatherData.main.pressure);

});

//caso base --> IP maquina
function setLocal() {
  cidade = document.getElementById("cidade").value;
  estado = document.getElementById("estado").value;
  pais = document.getElementById("pais").value;
}

//Função para pedir localização --> retorna Promise
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
        let msgErro = "Erro desconhecido ao acessar localização.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msgErro = "Permissão negada para acessar a localização.";
            break;
          case error.POSITION_UNAVAILABLE:
            msgErro = "Localização indisponível.";
            break;
          case error.TIMEOUT:
            msgErro = "Tempo de requisição de localização esgotado.";
            break;
        }
        reject(new Error(msgErro));
      },
      options,
    );
  });
}

/*
Localização ex: Erechim, RS
Temperatura atual
Sol/Chuva/Nublado/etc

Sensação
Horas e Clima da hr -> [atual, prox1, prox2, prox3, prox4]
Vento km/h
Umidade %
Sensação ºC
Pressão hPa



*/
