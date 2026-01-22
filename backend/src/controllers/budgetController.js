

const db = require('../config/db');
const { Budget, Ledger } = db;
const { Op } = db.Sequelize;


exports.upsertBudget = async (req, res, next) => {
  try {
    let {
      year,
      month,
      accountCode,
      costCenterId,
      profitCenterId,
      budgetAmount
    } = req.body;

    
    year = Number(year);
    month = Number(month);
    budgetAmount = Number(budgetAmount);

    
    costCenterId = costCenterId ? Number(costCenterId) : null;
    profitCenterId = profitCenterId ? Number(profitCenterId) : null;

    const [budget, created] = await Budget.findOrCreate({
      where: {
        year,
        month,
        accountCode,
        costCenterId,
        profitCenterId
      },
      defaults: { budgetAmount }
    });

    if (!created) {
      budget.budgetAmount = budgetAmount;
      await budget.save();
    }

    res.json(budget);
  } catch (err) {
    next(err);
  }
};


exports.listBudgets = async (req, res, next) => {
  try {
    const { year, month, costCenterId, profitCenterId } = req.query;
    const where = {};

    if (year) where.year = Number(year);
    if (month) where.month = Number(month);
    if (costCenterId) where.costCenterId = Number(costCenterId);
    if (profitCenterId) where.profitCenterId = Number(profitCenterId);

    const budgets = await Budget.findAll({ where });
    res.json(budgets);
  } catch (err) {
    next(err);
  }
};


exports.budgetVsActual = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ message: 'year and month required' });
    }

    const y = Number(year);
    const m = Number(month);

    const budgets = await Budget.findAll({
      where: { year: y, month: m }
    });

    const fromDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const toDate = `${y}-${String(m).padStart(2, '0')}-31`;

    const ledgerRows = await Ledger.findAll({
      where: {
        date: {
          [Op.gte]: fromDate,
          [Op.lte]: toDate
        }
      }
    });

    const actualMap = {};
    for (const row of ledgerRows) {
      const key = `${row.accountCode}|${row.costCenterId || ''}|${row.profitCenterId || ''}`;
      if (!actualMap[key]) actualMap[key] = 0;
      actualMap[key] += Number(row.debit) - Number(row.credit);
    }

    const result = budgets.map((b) => {
      const key = `${b.accountCode}|${b.costCenterId || ''}|${b.profitCenterId || ''}`;
      const actual = actualMap[key] || 0;
      return {
        accountCode: b.accountCode,
        costCenterId: b.costCenterId,
        profitCenterId: b.profitCenterId,
        budgetAmount: Number(b.budgetAmount),
        actualAmount: actual,
        variance: actual - Number(b.budgetAmount)
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};
