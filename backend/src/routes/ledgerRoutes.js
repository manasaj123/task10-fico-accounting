const express = require('express');
const router = express.Router();

const ledgerController = require('../controllers/ledgerController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR'),
  ledgerController.list
);

router.get(
  '/trial-balance',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR'),
  ledgerController.trialBalance
);

module.exports = router;
