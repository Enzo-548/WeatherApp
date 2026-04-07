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
