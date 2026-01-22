import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const Invoice = () => {
  const [form, setForm] = useState({
    invoiceNumber: '',
    type: 'AR',
    partyName: '',
    partyGSTIN: '',
    date: '',
    dueDate: '',
    baseAmount: '',
    gstRate: '18',
    tdsRate: '0',
    narration: ''
  });
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState('');

  const loadInvoices = async () => {
    const res = await api.get('/invoices');
    setInvoices(res.data);
  };

  useEffect(() => {
    loadInvoices().catch(console.error);
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        baseAmount: Number(form.baseAmount),
        gstRate: Number(form.gstRate),
        tdsRate: Number(form.tdsRate) || 0
      };
      await api.post('/invoices', payload);
      setForm((f) => ({ ...f, invoiceNumber: '', partyName: '', partyGSTIN: '', baseAmount: '', narration: '' }));
      loadInvoices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    }
  };

  return (
    <div>
      <h2>Invoices</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Create Invoice</h3>
          {error && <div className="error-text">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Invoice No.</label>
              <input
                name="invoiceNumber"
                value={form.invoiceNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="AR">Customer (AR)</option>
                <option value="AP">Vendor (AP)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Party Name</label>
              <input
                name="partyName"
                value={form.partyName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Party GSTIN</label>
              <input
                name="partyGSTIN"
                value={form.partyGSTIN}
                onChange={handleChange}
              />
            </div>
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
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Base Amount</label>
              <input
                type="number"
                name="baseAmount"
                value={form.baseAmount}
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
            <div className="form-group">
              <label>Narration</label>
              <textarea
                name="narration"
                value={form.narration}
                onChange={handleChange}
              />
            </div>
            <button className="btn-primary" type="submit">
              Save & Post
            </button>
          </form>
        </div>
        <div className="card">
          <h3>Recent Invoices</h3>
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Type</th>
                <th>Party</th>
                <th>Date</th>
                <th>Total</th>
                <th>Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.invoiceNumber}</td>
                  <td>{inv.type}</td>
                  <td>{inv.partyName}</td>
                  <td>{inv.date}</td>
                  <td>{Number(inv.totalAmount).toFixed(2)}</td>
                  <td>{Number(inv.balanceAmount).toFixed(2)}</td>
                  <td>{inv.status}</td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan="7">No invoices yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
