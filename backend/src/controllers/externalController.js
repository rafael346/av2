const axios = require('axios');

// GET /api/external/cep/:cep
const getAddressByCep = async (req, res, next) => {
  try {
    const cep = req.params.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      return res.status(400).json({ message: 'CEP inválido. Deve ter 8 dígitos.' });
    }

    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`, { timeout: 5000 });

    if (response.data.erro) {
      return res.status(404).json({ message: 'CEP não encontrado.' });
    }

    const { logradouro, bairro, localidade, uf } = response.data;
    res.json({ cep, logradouro, bairro, cidade: localidade, estado: uf });
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ message: 'Timeout ao consultar ViaCEP.' });
    }
    next(err);
  }
};

// GET /api/external/weather?city=São Paulo&date=2024-12-25
const getWeather = async (req, res, next) => {
  try {
    const { city, date } = req.query;
    if (!city || !date) {
      return res.status(400).json({ message: 'Informe city e date.' });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ message: 'API de clima não configurada.' });
    }

    // OpenWeatherMap free tier: forecast up to 5 days (3-hour intervals)
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)},BR&appid=${apiKey}&units=metric&lang=pt_br`;
    const response = await axios.get(url, { timeout: 8000 });

    const targetDate = new Date(date);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const forecasts = response.data.list.filter((item) => item.dt_txt.startsWith(targetDateStr));

    const hasRain = forecasts.some(
      (item) =>
        item.weather.some((w) => w.main === 'Rain' || w.main === 'Thunderstorm' || w.main === 'Drizzle')
    );

    const descriptions = [...new Set(forecasts.map((f) => f.weather[0].description))].join(', ');

    res.json({
      city,
      date: targetDateStr,
      hasRain,
      description: descriptions || 'Sem previsão disponível para esta data',
      forecasts: forecasts.map((f) => ({
        time: f.dt_txt,
        temp: f.main.temp,
        description: f.weather[0].description,
        icon: f.weather[0].icon,
      })),
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ message: 'Cidade não encontrada.' });
    }
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ message: 'Timeout ao consultar clima.' });
    }
    next(err);
  }
};

module.exports = { getAddressByCep, getWeather };
