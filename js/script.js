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
const txtInput = document.querySelector("#txtInput");

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
    console.log(data);

    if (txtInput.value === "Cidade, EF, BR") txtInput.value = data.city.name;

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

    // subtrai 3 horas
    data.setHours(data.getHours() - 3);

    const hora = data.toTimeString().slice(0, 5);
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
      background: "#fdf4e3",
      container: "rgba(255, 255, 255, 0.75)",
      card: "rgba(255, 236, 210, 0.6)",
      text: "#3d2c1e",
      textSoft: "rgba(61, 44, 30, 0.6)",
      border: "rgba(210, 170, 120, 0.3)",
    };
  } else if (timeGroup === "afternoon") {
    return {
      background: "#d4e9ff",
      container: "rgba(255, 255, 255, 0.7)",
      card: "rgba(200, 225, 255, 0.5)",
      text: "#1a3a5c",
      textSoft: "rgba(26, 58, 92, 0.6)",
      border: "rgba(100, 160, 230, 0.25)",
    };
  } else if (timeGroup === "night") {
    return {
      background: "#0f1b2d",
      container: "rgba(255, 255, 255, 0.06)",
      card: "rgba(255, 255, 255, 0.08)",
      text: "#c8d8ec",
      textSoft: "rgba(200, 216, 236, 0.5)",
      border: "rgba(255, 255, 255, 0.08)",
    };
  } else {
    return {
      background: "#0a0e1a",
      container: "rgba(255, 255, 255, 0.04)",
      card: "rgba(255, 255, 255, 0.06)",
      text: "#a0b0c8",
      textSoft: "rgba(160, 176, 200, 0.5)",
      border: "rgba(255, 255, 255, 0.06)",
    };
  }
}

function getWeatherVisualGroup(weatherGroup, timeGroup) {
  const isDark = timeGroup === "night" || timeGroup === "dawn";

  if (weatherGroup === "sunny") {
    return {
      gradient2: isDark ? "#1a1040" : "#fce4a8",
      accent: isDark ? "rgba(255, 200, 80, 0.15)" : "rgba(255, 183, 77, 0.2)",
      highlight: isDark ? "#f0c060" : "#e8a030",
    };
  } else if (weatherGroup === "cloudy") {
    return {
      gradient2: isDark ? "#1a2030" : "#c8d5e0",
      accent: isDark ? "rgba(150, 180, 210, 0.1)" : "rgba(120, 150, 180, 0.15)",
      highlight: isDark ? "#7090b0" : "#5a7a96",
    };
  } else if (weatherGroup === "rainy") {
    return {
      gradient2: isDark ? "#0d1520" : "#a8c0d8",
      accent: isDark ? "rgba(80, 120, 180, 0.12)" : "rgba(70, 110, 170, 0.18)",
      highlight: isDark ? "#5080c0" : "#3a6aa0",
    };
  } else {
    return {
      gradient2: isDark ? "#120818" : "#b0a0c8",
      accent: isDark ? "rgba(100, 60, 160, 0.12)" : "rgba(90, 60, 150, 0.18)",
      highlight: isDark ? "#8060c0" : "#5a3a90",
    };
  }
}

function getFinalTheme(timeTheme, weatherTheme) {
  return {
    background: timeTheme.background,
    gradient2: weatherTheme.gradient2,
    container: timeTheme.container,
    card: timeTheme.card,
    text: timeTheme.text,
    textSoft: timeTheme.textSoft,
    border: timeTheme.border,
    accent: weatherTheme.accent,
    highlight: weatherTheme.highlight,
  };
}

function applyDynamicTheme(atual) {
  const currentHour = new Date().getHours();
  const weatherDescription = atual.weather[0].description;

  const timeGroup = getTimeGroup(currentHour);
  const weatherGroup = getWeatherGroup(weatherDescription);

  const timeTheme = getVisualTimeGroup(timeGroup);
  const weatherTheme = getWeatherVisualGroup(weatherGroup, timeGroup);
  const finalTheme = getFinalTheme(timeTheme, weatherTheme);

  const isDark = timeGroup === "night" || timeGroup === "dawn";
  const innerLight = isDark
    ? "inset 0 1px 0 rgba(255,255,255,0.08)"
    : "inset 0 1px 0 rgba(255,255,255,0.35)";

  document.body.style.background = `linear-gradient(160deg, ${finalTheme.background}, ${finalTheme.gradient2})`;
  document.body.style.color = finalTheme.text;
  document.body.style.transition = "background 0.6s ease";

  if (weatherContainer) {
    weatherContainer.style.backgroundColor = finalTheme.container;
    weatherContainer.style.borderColor = finalTheme.border;
    weatherContainer.style.color = finalTheme.text;
    weatherContainer.style.backdropFilter = "blur(28px)";
    weatherContainer.style.webkitBackdropFilter = "blur(28px)";
    weatherContainer.style.boxShadow = `0 8px 32px rgba(0,0,0,${isDark ? "0.25" : "0.08"}), ${innerLight}`;
    weatherContainer.style.transition = "all 0.5s ease";
  }

  if (currentWeather) {
    currentWeather.style.backgroundColor = finalTheme.accent;
    currentWeather.style.borderColor = finalTheme.border;
    currentWeather.style.borderLeft = `3px solid ${finalTheme.highlight}`;
    currentWeather.style.color = finalTheme.text;
    currentWeather.style.backdropFilter = "blur(20px)";
    currentWeather.style.webkitBackdropFilter = "blur(20px)";
    currentWeather.style.boxShadow = `0 4px 16px rgba(0,0,0,${isDark ? "0.2" : "0.06"}), ${innerLight}`;
    currentWeather.style.transition = "all 0.5s ease";
  }

  forecastSlices.forEach((slice) => {
    slice.style.backgroundColor = finalTheme.card;
    slice.style.borderColor = finalTheme.border;
    slice.style.color = finalTheme.text;
    slice.style.backdropFilter = "blur(20px)";
    slice.style.webkitBackdropFilter = "blur(20px)";
    slice.style.boxShadow = `0 2px 8px rgba(0,0,0,${isDark ? "0.15" : "0.04"}), ${innerLight}`;
    slice.style.transition = "all 0.5s ease";
  });

  weatherCards.forEach((card) => {
    card.style.backgroundColor = finalTheme.card;
    card.style.borderColor = finalTheme.border;
    card.style.color = finalTheme.text;
    card.style.backdropFilter = "blur(20px)";
    card.style.webkitBackdropFilter = "blur(20px)";
    card.style.boxShadow = `0 2px 8px rgba(0,0,0,${isDark ? "0.15" : "0.04"}), ${innerLight}`;
    card.style.transition = "all 0.5s ease";
  });

  document.querySelectorAll(".card__label").forEach((label) => {
    label.style.color = finalTheme.textSoft;
  });

  document.querySelectorAll(".card__value").forEach((value) => {
    value.style.color = finalTheme.text;
  });

  document.querySelectorAll("img").forEach((img) => {
    img.style.filter = isDark
      ? "drop-shadow(0 0 4px rgba(255,255,255,0.3))"
      : "drop-shadow(0 1px 2px rgba(0,0,0,0.3)) contrast(1.2)";
  });

  const input = document.querySelector(".weather__location-input");
  if (input) input.style.color = finalTheme.text;

  const country = document.querySelector(".weather__country");
  if (country) country.style.color = finalTheme.textSoft;

  const description = document.querySelector(".weather__description");
  if (description) description.style.color = finalTheme.textSoft;

  document.body.classList.add("theme-ready");
}
