const db = require('../config/db');
const { Ledger } = db;

exports.list = async (req, res, next) => {
  try {
    const { fromDate, toDate, accountCode } = req.query;

    const where = {};
    if (fromDate) where.date = { ...where.date, $gte: fromDate };
    if (toDate) where.date = { ...where.date, $lte: toDate };
    if (accountCode) where.accountCode = accountCode;

    const entries = await Ledger.findAll({
      where,
      order: [['date', 'ASC'], ['id', 'ASC']]
    });

    res.json(entries);
  } catch (err) {
    next(err);
  }
};

// Simple trial balance
exports.trialBalance = async (req, res, next) => {
  try {
    const { toDate } = req.query;
    const where = {};
    if (toDate) where.date = { $lte: toDate };

    const entries = await Ledger.findAll({ where });

    const summary = {};
    for (const e of entries) {
      if (!summary[e.accountCode]) {
        summary[e.accountCode] = { debit: 0, credit: 0 };
      }
      summary[e.accountCode].debit += Number(e.debit);
      summary[e.accountCode].credit += Number(e.credit);
    }

    const rows = Object.entries(summary).map(([code, v]) => ({
      accountCode: code,
      debit: v.debit,
      credit: v.credit,
      balanceType: v.debit >= v.credit ? 'DEBIT' : 'CREDIT',
      balance: Math.abs(v.debit - v.credit)
    }));

    res.json(rows);
  } catch (err) {
    next(err);
  }
};
