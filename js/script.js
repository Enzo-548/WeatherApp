import { fetchWeather, getWeatherURL } from "../api/weather.js";
import { fetchGeoCode, getGeoURL } from "../api/geocode.js";

const API_KEY = "c8921f0324e3c6dcaeba72c9ad2a6466";

// DOM
const slices = [
  document.querySelector("#slice_1"),
  document.querySelector("#slice_2"),
  document.querySelector("#slice_3"),
  document.querySelector("#slice_4"),
];

const tempAtual = document.querySelector("#tempAtual");

const lblTemp = document.querySelector("#temperature");
const lblWind = document.querySelector("#wind");
const lblHumi = document.querySelector("#humidity");
const lblPress = document.querySelector("#pressure");

const txtInput = document.querySelector("#input");

// ENTER no input
txtInput.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    await init();
  }
});

// INIT
document.addEventListener("DOMContentLoaded", init);

async function init() {
  try {
    const location = await getUserLocation();
    if (!location) return;

    const data = await getWeatherData(location);

    renderWeather(data);
    renderForecast(data.list);
  } catch (error) {
    console.error("Erro:", error.message);
    tempAtual.textContent = "Erro ao carregar clima";
  }
}

// WEATHER
async function getWeatherData({ lat, lon }) {
  const url = getWeatherURL(lat, lon, API_KEY);
  return await fetchWeather(url);
}

// LOCATION (input/GPS)
async function getUserLocation() {
  const value = txtInput.value.trim();

  if (value !== "") {
    const partes = value.split(",").map((p) => p.trim());
    //mapeia separando nas virgulas

    const cidade = partes[0];
    const estado = partes[1] || "";
    const pais = partes[2] || "";

    const url = getGeoURL(cidade, estado, pais, API_KEY);
    const geoData = await fetchGeoCode(url);

    if (!geoData || geoData.length === 0) {
      alert("Local não encontrado");
      return null;
    }

    return {
      lat: geoData[0].lat,
      lon: geoData[0].lon,
    };
  }

  // fallback: GPS
  return await getCurrentLocation({
    enableHighAccuracy: true,
    timeout: 10000,
  });
<<<<<<< HEAD
=======
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

  const currentHour = new Date().getHours();
  const timeGroup = getTimeGroup(currentHour);
  const timeTheme = getVisualTimeGroup(timeGroup);

  const weatherDescription = atual.weather[0].description;
  const weatherGroup = getWeatherGroup(weatherDescription);
  const weatherTheme = getWeatherVisualGroup(weatherGroup);

  const finalTheme = getFinalTheme(timeTheme, weatherTheme);

  console.log("Current hour:", currentHour);
  console.log("Time group:", timeGroup);
  console.log("Time theme:", timeTheme);

  console.log("Weather description:", weatherDescription);
  console.log("Weather group:", weatherGroup);
  console.log("Weather theme:", weatherTheme);

  console.log("Final theme:", finalTheme);

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
>>>>>>> e8ec106 (Update)
}

// GEOLOCATION
function getCurrentLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation não suportada."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        resolve({
          lat: latitude,
          lon: longitude,
        });
      },
      (error) => {
        let msg = "Erro desconhecido";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "Permissão negada";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Localização indisponível";
            break;
          case error.TIMEOUT:
            msg = "Tempo esgotado";
            break;
        }

        reject(new Error(msg));
      },
      options,
    );
  });
}

// UI

function renderWeather(data) {
  const atual = data.list[0];

  const temp = atual.main.temp;
  const descricao = atual.weather[0].description;
  const icon = atual.weather[0].icon;
  const iconURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  tempAtual.innerHTML = `
    <div style="text-align:center;">
      <p>${Math.round(temp)}°C || ${descricao}</p>
      <!--<img src="${iconURL}" alt="clima">-->
    </div>
  `;

  lblTemp.textContent = `${temp}°C`;
  lblWind.textContent = `${atual.wind.speed} km/h`;
  lblHumi.textContent = `${atual.main.humidity}%`;
  lblPress.textContent = `${atual.main.pressure} hPa`;
}

function renderForecast(list) {
  list.slice(0, 4).forEach((item, index) => {
    if (!slices[index]) return;

    const hora = item.dt_txt.split(" ")[1].slice(0, 5);
    const temp = Math.round(item.main.temp);
    const icon = item.weather[0].icon;
    const iconURL = `https://openweathermap.org/img/wn/${icon}.png`;

    slices[index].innerHTML = `
      <div style="text-align:center; font-size:12px;">
        <p>${hora}</p>
        <p>${temp}°C</p>
        <img src="${iconURL}" />
      </div>
    `;
  });
}
//Sistema de cor dinâmica

function getTimeGroup(hour) {
  if (hour >= 6 && hour < 12) {
    return "morning";
  } else if (hour >= 12 && hour < 18) {
    return "afternoon";
  } else if (hour >= 18 && hour < 24) {
    return "night";
  } else {
    return "dawn";
  }
}
const currentHour = new Date().getHours();
const timeGroup = getTimeGroup(currentHour);
console.log("Current hour:", currentHour);
console.log("Time group:", timeGroup);

function getWeatherGroup(description) {
  const weatherText = description.toLowerCase();

  if (weatherText.includes("thunderstorm")) {
    return "storm";
  } else if (weatherText.includes("rain") || weatherText.includes("drizzle")) {
    return "rainy";
  } else if (weatherText.includes("cloud")) {
    return "cloudy";
  } else {
    return "sunny";
  }
}


function getVisualTimeGroup(timeGroup) {
  if (timeGroup === "morning") {
    return {
      background: "#F8E8C8",
      container: "#FFF4E3",
      card: "#FFE0B2",
      text: "#4E342E",
    };
  } else if (timeGroup === "afternoon") {
    return {
      background: "#4A90E2",
      container: "#6BA8F5",
      card: "#90CAF9",
      text: "#FFFFFF",
    };
  } else if (timeGroup === "night") {
    return {
      background: "#1E3A5F",
      container: "#2B4C7E",
      card: "#3A5F99",
      text: "#E3F2FD",
    };
  } else {
    return {
      background: "#0F172A",
      container: "#1E293B",
      card: "#334155",
      text: "#E2E8F0",
    };
  }
}


function getWeatherVisualGroup(weatherGroup) {
  if (weatherGroup === "sunny") {
    return {
      overlay: "#FFD54F",
      accent: "#FFB300",
      effect: "bright",
    };
  } else if (weatherGroup === "cloudy") {
    return {
      overlay: "#B0BEC5",
      accent: "#90A4AE",
      effect: "soft",
    };
  } else if (weatherGroup === "rainy") {
    return {
      overlay: "#5C6BC0",
      accent: "#3949AB",
      effect: "cool",
    };
  } else {
    return {
      overlay: "#7E57C2",
      accent: "#4527A0",
      effect: "strong",
    };
  }
}


console.log("Morning theme", getVisualTimeGroup("morning"));
console.log("Sunny visual", getWeatherVisualGroup("sunny"));

function getFinalTheme(timeTheme, weatherTheme) {
  return {
    background: timeTheme.background,
    container: timeTheme.container,
    card: timeTheme.card,
    text: timeTheme.text,
    overlay: weatherTheme.overlay,
    accent: weatherTheme.accent,
    effect: weatherTheme.effect,
  };
}





