export function applyDynamicTheme(atual) {
  const currentHour = new Date().getHours();
  const weatherDescription = atual.weather[0].description;

  const timeGroup = getTimeGroup(currentHour);
  const weatherGroup = getWeatherGroup(weatherDescription);

  const timeTheme = getVisualTimeGroup(timeGroup);
  const weatherTheme = getWeatherVisualGroup(weatherGroup, timeGroup);
  const finalTheme = getFinalTheme(timeTheme, weatherTheme);

  document.body.style.background = `linear-gradient(160deg, ${finalTheme.background}, ${finalTheme.gradient2})`;
  document.body.style.color = finalTheme.text;

  document.body.classList.add("theme-ready");
}

// ===== helpers =====

function getTimeGroup(hour) {
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 24) return "night";
  return "dawn";
}

function getWeatherGroup(desc) {
  const t = desc.toLowerCase();

  if (t.includes("thunderstorm")) return "storm";
  if (t.includes("rain") || t.includes("drizzle")) return "rainy";
  if (t.includes("cloud")) return "cloudy";
  return "sunny";
}

function getVisualTimeGroup(t) {
  const map = {
    morning: {
      background: "#fdf4e3",
      text: "#3d2c1e",
    },
    afternoon: {
      background: "#d4e9ff",
      text: "#1a3a5c",
    },
    night: {
      background: "#0f1b2d",
      text: "#c8d8ec",
    },
    dawn: {
      background: "#0a0e1a",
      text: "#a0b0c8",
    },
  };

  return map[t];
}

function getWeatherVisualGroup(w, time) {
  const isDark = time === "night" || time === "dawn";

  if (w === "sunny") {
    return {
      gradient2: isDark ? "#1a1040" : "#fce4a8",
    };
  }

  if (w === "cloudy") {
    return {
      gradient2: isDark ? "#1a2030" : "#c8d5e0",
    };
  }

  if (w === "rainy") {
    return {
      gradient2: isDark ? "#0d1520" : "#a8c0d8",
    };
  }

  return {
    gradient2: isDark ? "#120818" : "#b0a0c8",
  };
}

function getFinalTheme(time, weather) {
  return {
    background: time.background,
    gradient2: weather.gradient2,
    text: time.text,
  };
}