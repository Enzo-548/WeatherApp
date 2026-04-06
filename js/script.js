import { fetchWeather, getWeatherURL } from "../api/weather.js";
import { fetchGeoCode, getGeoURL } from "../api/geocode.js";

const api = "c8921f0324e3c6dcaeba72c9ad2a6466";
let cidade, estado, pais, lat, lon;
const kelvin = 273.15;

//basicamente um enum --> dados.MAIN_TEMPERATURA = 30º
const dados = Object.freeze({
  GEO_CIDADE: 0,
  GEO_ESTADO: 1,
  GEO_PAIS: 2,
  COORD_LATITUDE: 3,
  COORD_LONGITUDE: 4,
  TEMPO_TIPO: 5,
  TEMPO_DESCRICAO: 6,
  TEMPO_ICONE: 7,
  MAIN_TEMPERATURA: 8,
  MAIN_SENSACAO: 9,
  MAIN_MINIMA: 10,
  MAIN_MAXIMA: 11,
  MAIN_PRESSAO: 12,
  MAIN_UMIDADE: 13,
  MAIN_NIVEL_MAR: 14,
  MAIN_NIVEL_SOLO: 15,
  VISIBILIDADE: 16,
  VENTO_VELOCIDADE: 17,
  VENTO_ANGULO: 18,
});

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

  //func ao selecionar uma cidade especifica------
  var geoURL = await getGeoURL(cidade, estado, pais, api);
  const geoData = await fetchGeoCode(geoURL);
  lat = geoData[0].lat;
  lon = geoData[0].lon;
  //---------------------------------------------

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
