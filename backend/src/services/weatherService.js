const axios = require('axios');

/**
 * Fetches OpenWeatherMap 5-day forecast and checks for rain on the given date.
 * Returns a weatherAlert object { hasRain, description, checkedAt }.
 */
const getWeatherForDate = async (city, date) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error('OPENWEATHER_API_KEY not set');

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)},BR&appid=${apiKey}&units=metric&lang=pt_br`;
  const response = await axios.get(url, { timeout: 8000 });

  const targetStr = new Date(date).toISOString().split('T')[0];
  const forecasts = response.data.list.filter((item) => item.dt_txt.startsWith(targetStr));

  const hasRain = forecasts.some((item) =>
    item.weather.some((w) => ['Rain', 'Thunderstorm', 'Drizzle'].includes(w.main))
  );

  const descriptions = [...new Set(forecasts.map((f) => f.weather[0].description))].join(', ');

  return {
    hasRain,
    description: descriptions || 'Sem previsão disponível',
    checkedAt: new Date(),
  };
};

module.exports = { getWeatherForDate };
