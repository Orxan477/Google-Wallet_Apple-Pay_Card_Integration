const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

router.post('/create-class', (req, res) => walletController.createClass(req, res));
router.post('/create-jwt', (req, res) => walletController.createJwtNewObjects(req, res));
router.post('/batch-create-objects', (req, res) => walletController.batchCreateObjects(req, res));

module.exports = router;