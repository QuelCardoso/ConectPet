const express = require('express');
const router = express.Router();
const doacaoController = require('../controllers/doacaoController');
const { autenticarToken } = require('../middleware/auth');

router.post('/', autenticarToken, doacaoController.realizarDoacao);
router.get('/minhas', autenticarToken, doacaoController.minhasDoacoes);

module.exports = router;
