const router = require('express').Router();
const { getAddressByCep, getWeather } = require('../controllers/externalController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/cep/:cep', getAddressByCep);
router.get('/weather', getWeather);

module.exports = router;
