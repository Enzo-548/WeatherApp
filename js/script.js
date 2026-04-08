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
const lblWind = document.querySelector("#wind");
const lblHumi = document.querySelector("#humidity");
const lblPress = document.querySelector("#pressure");
const lblFeels = document.querySelector("#feels");
const txtInput = document.querySelector("#input");

const weatherContainer = document.querySelector(".weather");
const weatherCards = document.querySelectorAll(".card--stat");
const forecastSlices = document.querySelectorAll(".card--forecast");
const currentWeather = document.querySelector(".weather__current");
const forecastContainer = document.querySelector(".weather__forecast");

// ENTER in input
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

    const atual = data.list[0];
    applyDynamicTheme(atual);
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

// LOCATION (input / GPS)
async function getUserLocation() {
  const value = txtInput.value.trim();

  if (value !== "") {
    const partes = value.split(",").map((p) => p.trim());

    const cidade = partes[0];
    const estado = partes[1] || "";
    const pais = partes[2] || "";

    const url = getGeoURL(cidade, estado, pais, API_KEY);
    const geoData = await fetchGeoCode(url);

    if (!geoData || geoData.length === 0) {
      alert("Location not found");
      return null;
    }

    return {
      lat: geoData[0].lat,
      lon: geoData[0].lon,
    };
  }

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
        const { latitude, longitude } = position.coords;

        resolve({
          lat: latitude,
          lon: longitude,
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
      options,
    );
  });
}

// UI
function renderWeather(data) {
  const atual = data.list[0];

  const temp = Math.round(atual.main.temp);
  const descricao = atual.weather[0].description;
  const feels = Math.round(atual.main.feels_like);
  const wind = atual.wind.speed;
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

    const hora = item.dt_txt.split(" ")[1].slice(0, 5);
    const temp = Math.round(item.main.temp);
    const icon = item.weather[0].icon;
    const iconURL = `https://openweathermap.org/img/wn/${icon}.png`;

    slices[index].innerHTML = `
      <span class="card__label">${hora}</span>
      <img src="${iconURL}" class="card__icon" alt="forecast icon" />
      <span class="card__value">${temp}°C</span>
    `;
  });
}

// ==========================
// Dynamic color system
// ==========================

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

function getWeatherGroup(description) {
  const weatherText = description.toLowerCase();

  if (weatherText.includes("thunderstorm")) {
    return "storm";
  } else if (
    weatherText.includes("rain") ||
    weatherText.includes("drizzle")
  ) {
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

function applyDynamicTheme(atual) {
  const currentHour = new Date().getHours();
  const timeGroup = getTimeGroup(currentHour);
  const weatherDescription = atual.weather[0].description;
  const weatherGroup = getWeatherGroup(weatherDescription);

  const timeTheme = getVisualTimeGroup(timeGroup);
  const weatherTheme = getWeatherVisualGroup(weatherGroup);
  const finalTheme = getFinalTheme(timeTheme, weatherTheme);

  console.log("Current hour:", currentHour);
  console.log("Time group:", timeGroup);
  console.log("Weather description:", weatherDescription);
  console.log("Weather group:", weatherGroup);
  console.log("Final theme:", finalTheme);

  document.body.style.background = `linear-gradient(135deg, ${finalTheme.background}, ${finalTheme.overlay})`;
  document.body.style.color = finalTheme.text;

  if (weatherContainer) {
    weatherContainer.style.backgroundColor = finalTheme.container;
    weatherContainer.style.color = finalTheme.text;
    weatherContainer.style.transition = "all 0.4s ease";
  }

  if (currentWeather) {
    currentWeather.style.backgroundColor = finalTheme.accent;
    currentWeather.style.color = finalTheme.text;
    currentWeather.style.transition = "all 0.4s ease";
  }

  if (forecastContainer) {
    forecastContainer.style.backgroundColor = "transparent";
    forecastContainer.style.transition = "all 0.4s ease";
  }

  forecastSlices.forEach((slice) => {
    slice.style.backgroundColor = finalTheme.card;
    slice.style.color = finalTheme.text;
    slice.style.transition = "all 0.4s ease";
  });

  weatherCards.forEach((card) => {
    card.style.backgroundColor = finalTheme.card;
    card.style.color = finalTheme.text;
    card.style.transition = "all 0.4s ease";
  });
}