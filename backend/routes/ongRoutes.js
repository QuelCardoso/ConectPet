const express = require('express');
const router = express.Router();
const ongController = require('../controllers/ongController');
const { autenticarToken, autorizarTipos } = require('../middleware/auth');

router.get('/', ongController.listarOngs);
router.get('/campanhas', ongController.listarCampanhas);
router.get('/:id', ongController.obterOngPorId);
router.post('/necessidades', autenticarToken, autorizarTipos('ONG'), ongController.cadastrarNecessidade);
router.post('/campanhas', autenticarToken, autorizarTipos('ONG'), ongController.cadastrarCampanha);

module.exports = router;
