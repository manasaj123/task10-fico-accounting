import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const Expense = () => {
  const [form, setForm] = useState({
    date: '',
    vendorName: '',
    description: '',
    accountCode: '500001',
    amount: '',
    gstRate: '18',
    tdsRate: '0'
  });
  const [rows, setRows] = useState([]);

  const load = async () => {
    const res = await api.get('/expenses');
    setRows(res.data);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/expenses', {
      ...form,
      amount: Number(form.amount),
      gstRate: Number(form.gstRate),
      tdsRate: Number(form.tdsRate) || 0
    });
    setForm((f) => ({
      ...f,
      vendorName: '',
      description: '',
      amount: ''
    }));
    load();
  };

  return (
    <div>
      <h2>Expenses</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Record Expense</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Vendor</label>
              <input
                name="vendorName"
                value={form.vendorName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
              />
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
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group-inline">
              <div>
                <label>GST %</label>
                <input
                  type="number"
                  name="gstRate"
                  value={form.gstRate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>TDS %</label>
                <input
                  type="number"
                  name="tdsRate"
                  value={form.tdsRate}
                  onChange={handleChange}
                />
              </div>
            </div>
            <button className="btn-primary" type="submit">
              Save Expense
            </button>
          </form>
        </div>
        <div className="card">
          <h3>Recent Expenses</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th>Account</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{e.vendorName}</td>
                  <td>{e.accountCode}</td>
                  <td>{Number(e.totalAmount).toFixed(2)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="4">No expenses yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expense;
