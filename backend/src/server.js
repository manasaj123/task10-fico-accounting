require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const db = require('./config/db');


const authRoutes = require('./routes/authRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const bankRoutes = require('./routes/bankRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const costCenterRoutes = require('./routes/costCenterRoutes');
const profitCenterRoutes = require('./routes/profitCenterRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();


app.use(morgan('dev'));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use((req, res, next) => {
  req.db = db;
  next();
});


app.use('/api/auth', authRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/cost-centers', costCenterRoutes);
app.use('/api/profit-centers', profitCenterRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/audit', auditRoutes);


app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});


app.use((err, req, res, next) => {
  
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});


const PORT = process.env.PORT || 5000;

db.sequelize
  .sync()
  .then(() => {
    console.log('Database connected and models synced');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
    process.exit(1);
  });
