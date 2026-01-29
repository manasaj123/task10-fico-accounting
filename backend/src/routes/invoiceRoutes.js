const express = require('express');
const router = express.Router();

const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const auditMiddleware = require('../middleware/auditMiddleware');

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT'),
  auditMiddleware('CREATE_INVOICE'),
  invoiceController.createInvoice
);

router.get(
  '/',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR', 'VIEWER'),
  invoiceController.listInvoices
);

// NEW: all invoices for a given party name
router.get(
  '/party/:partyName',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR', 'VIEWER'),
  invoiceController.listInvoicesByParty
);

router.get(
  '/:id',
  roleMiddleware('ADMIN', 'ACCOUNTANT', 'AUDITOR', 'VIEWER'),
  invoiceController.getInvoice
);

module.exports = router;
