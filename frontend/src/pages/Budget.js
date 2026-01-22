import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const Budget = () => {
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    accountCode: '500001',
    budgetAmount: ''
  });
  const [rows, setRows] = useState([]);
  const [vsActual, setVsActual] = useState([]);

  const load = async () => {
    const res = await api.get('/budgets', {
      params: { year: form.year, month: form.month }
    });
    setRows(res.data);

    const vs = await api.get('/budgets/vs-actual', {
      params: { year: form.year, month: form.month }
    });
    setVsActual(vs.data);
  };

  useEffect(() => {
    load().catch(console.error);
    
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/budgets', {
      ...form,
      year: Number(form.year),
      month: Number(form.month),
      budgetAmount: Number(form.budgetAmount)
    });
    setForm((f) => ({ ...f, budgetAmount: '' }));
    load();
  };

  return (
    <div>
      <h2>Budgeting</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Set Budget</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group-inline">
              <div>
                <label>Year</label>
                <input
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Month</label>
                <input
                  type="number"
                  name="month"
                  min="1"
                  max="12"
                  value={form.month}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Account Code</label>
              <input
                name="accountCode"
                value={form.accountCode}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Budget Amount</label>
              <input
                type="number"
                name="budgetAmount"
                value={form.budgetAmount}
                onChange={handleChange}
                required
              />
            </div>
            <button className="btn-primary" type="submit">
              Save Budget
            </button>
          </form>
          <h4 style={{ marginTop: '1rem' }}>Budgets</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td>{b.accountCode}</td>
                  <td>{Number(b.budgetAmount).toFixed(2)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="2">No budgets yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Budget vs Actual</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Budget</th>
                <th>Actual</th>
                <th>Variance</th>
              </tr>
            </thead>
            <tbody>
              {vsActual.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.accountCode}</td>
                  <td>{r.budgetAmount.toFixed(2)}</td>
                  <td>{r.actualAmount.toFixed(2)}</td>
                  <td>{r.variance.toFixed(2)}</td>
                </tr>
              ))}
              {vsActual.length === 0 && (
                <tr>
                  <td colSpan="4">No data yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Budget;
