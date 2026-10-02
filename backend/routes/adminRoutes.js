const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { autenticarToken, autorizarTipos } = require('../middleware/auth');

router.use(autenticarToken, autorizarTipos('ADMIN'));
router.get('/ongs', adminController.listarTodasOngs);
router.put('/ongs/:id/status', adminController.atualizarStatusOng);
router.get('/indicadores', adminController.obterIndicadores);

module.exports = router;
