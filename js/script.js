import { fetchWeather, getWeatherURL } from "../api/weather.js";
import { fetchGeoCode, getGeoURL } from "../api/geocode.js";
import { applyDynamicTheme } from "./theme.js";

const API_KEY = "c8921f0324e3c6dcaeba72c9ad2a6466";

// DOM
const slices = [
  document.querySelector("#slice_1"),
  document.querySelector("#slice_2"),
  document.querySelector("#slice_3"),
  document.querySelector("#slice_4"),
];

const tempAtual = document.querySelector("#tempAtual");
const lblWind = document.querySelector("#wind");
const lblHumi = document.querySelector("#humidity");
const lblPress = document.querySelector("#pressure");
const lblFeels = document.querySelector("#feels");
const txtInput = document.querySelector("#txtInput");

// ENTER
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

    if (txtInput.value === "Cidade, EF, BR") {
      txtInput.value = data.city.name;
    }

    renderWeather(data);
    renderForecast(data.list);

    // tema agora vem de outro arquivo
    applyDynamicTheme(data.list[0]);

  } catch (error) {
    console.error("Error:", error.message);
    tempAtual.textContent = "Error loading weather";
  }
}

// WEATHER
async function getWeatherData({ lat, lon }) {
  const url = getWeatherURL(lat, lon, API_KEY);
  return await fetchWeather(url);
}

// LOCATION
async function getUserLocation() {
  const loc = txtInput.value.trim();

  if (loc !== "" && loc !== "Cidade, EF, BR") {
    const partes = loc.split(",").map((p) => p.trim());

    const cidade = partes[0];
    const estado = partes[1] || "";
    const pais = partes[2] || "";

    const url = getGeoURL(cidade, estado, pais, API_KEY);
    const geoData = await fetchGeoCode(url);

    if (!geoData || geoData.length === 0) {
      alert("Formatação: Cidade, EF, BR");
      return null;
    }

    return {
      lat: geoData[0].lat,
      lon: geoData[0].lon,
    };
  }

  txtInput.value = "Cidade, EF, BR";

  return await getCurrentLocation({
    enableHighAccuracy: true,
    timeout: 10000,
  });
}

// GEOLOCATION
function getCurrentLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        let msg = "Unknown error";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "Permission denied";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Location unavailable";
            break;
          case error.TIMEOUT:
            msg = "Request timeout";
            break;
        }

        reject(new Error(msg));
      },
      options
    );
  });
}

// UI
function renderWeather(data) {
  const atual = data.list[0];

  const temp = Math.round(atual.main.temp);
  const descricao = atual.weather[0].description;
  const feels = Math.round(atual.main.feels_like);
  const wind = Math.round(atual.wind.speed * 3.6);
  const humidity = atual.main.humidity;
  const pressure = atual.main.pressure;
  const icon = atual.weather[0].icon;

  const iconURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  tempAtual.innerHTML = `
    <img src="${iconURL}" alt="${descricao}" />
    <div class="weather__current-info">
      <div class="weather__temperature">${temp}°C</div>
      <p class="weather__description">${descricao}</p>
    </div>
  `;

  lblWind.textContent = `${wind} km/h`;
  lblHumi.textContent = `${humidity}%`;
  lblPress.textContent = `${pressure} hPa`;
  lblFeels.textContent = `${feels}°C`;
}

function renderForecast(list) {
  list.slice(0, 4).forEach((item, index) => {
    if (!slices[index]) return;

    const horaStr = item.dt_txt.split(" ")[1].slice(0, 5);
    const [h, m] = horaStr.split(":").map(Number);

    const data = new Date();
    data.setHours(h);
    data.setMinutes(m);

    // ajuste fuso
    data.setHours(data.getHours() - 3);

    const hora = data.toTimeString().slice(0, 5);
    const temp = Math.round(item.main.temp);
    const icon = item.weather[0].icon;

    const iconURL = `https://openweathermap.org/img/wn/${icon}.png`;

    slices[index].innerHTML = `
      <span class="card__label">${hora}</span>
      <img src="${iconURL}" class="card__icon" />
      <span class="card__value">${temp}°C</span>
    `;
  });
}