import { fetchWeather, getWeatherURL } from "../api/weather.js";
import { fetchGeoCode, getGeoURL } from "../api/geocode.js";

const api = "c8921f0324e3c6dcaeba72c9ad2a6466";
let cidade, estado, pais, lat, lon;
let dados = [];

//basicamente um enum --> id.MAIN_TEMPERATURA = 30ºC
const id = Object.freeze({
  GEO_CIDADE: 0,
  GEO_ESTADO: 1,
  GEO_PAIS: 2,
  TEMPO_DESCRICAO: 3,
  MAIN_TEMPERATURA: 4,
  MAIN_SENSACAO: 5,
  MAIN_PRESSAO: 6,
  MAIN_UMIDADE: 7,
  VENTO_VELOCIDADE: 8,
});

document.addEventListener("DOMContentLoaded", async () => {
  //pegar cid, est, pais de algum input
  //setLocal();

  //caso base --> loc atual
  const locUsuario = await getUserLocation({
    enableHighAccuracy: true,
    timeout: 10000,
  });
  lat = locUsuario.latitude;
  lon = locUsuario.longitude;

  //Caso usuario selecione cidade, pais e estado
  //document.getElementById(input).setLoc(cidade, estado, pais, api);

  var weatherURL = await getWeatherURL(lat, lon, api);
  const weatherData = await fetchWeather(weatherURL);
  const lista = weatherData.list;

  // pega o primeiro forecast (agora + 3h)
  const proximos = lista.slice(0, 5);

  proximos.forEach((item, index) => {
    console.log(`id:${index} - ${item.dt_txt} | ${item.main.temp}°C`);
  });

  const atual = lista[0];

  console.log("Descrição Tempo:\t" + atual.weather[0].description);

  dados[id.TEMPO_DESCRICAO] = atual.weather[0].description;
  dados[id.MAIN_TEMPERATURA] = atual.main.temp;
  dados[id.MAIN_SENSACAO] = atual.main.feels_like;

  console.log("Temperatura:\t\t" + atual.main.temp);
  console.log("Sensação:\t\t" + atual.main.feels_like);
  console.log("Vento:\t\t\t" + atual.wind.speed);
  console.log("Umidade:\t\t" + atual.main.humidity);
  console.log("Pressão:\t\t" + atual.main.pressure);
  //dados[]
});

function setLoc(cidade, estado, pais, api) {
  const geoData = fetchGeoCode(cidade, estado, pais, api);
  lat = geoData[0].lat;
  lon = geoData[0].lon;
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
