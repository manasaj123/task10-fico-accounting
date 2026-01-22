import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const Payment = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({
    paymentNumber: '',
    type: 'RECEIPT',
    invoiceId: '',
    date: '',
    mode: 'BANK_TRANSFER',
    bankAccountCode: '100001',
    amount: '',
    tdsAmount: '',
    referenceNumber: '',
    remarks: ''
  });
  const [error, setError] = useState('');

  const loadData = async () => {
    const [invRes, payRes] = await Promise.all([
      api.get('/invoices'),
      api.get('/payments')
    ]);
    setInvoices(invRes.data);
    setPayments(payRes.data);
  };

  useEffect(() => {
    loadData().catch(console.error);
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
        invoiceId: Number(form.invoiceId),
        amount: Number(form.amount),
        tdsAmount: Number(form.tdsAmount) || 0
      };
      await api.post('/payments', payload);
      setForm((f) => ({ ...f, paymentNumber: '', amount: '', tdsAmount: '', referenceNumber: '', remarks: '' }));
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create payment');
    }
  };

  return (
    <div>
      <h2>Payments / Receipts</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Record Payment/Receipt</h3>
          {error && <div className="error-text">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Payment No.</label>
              <input
                name="paymentNumber"
                value={form.paymentNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="RECEIPT">Receipt (Customer)</option>
                <option value="PAYMENT">Payment (Vendor)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Invoice</label>
              <select
                name="invoiceId"
                value={form.invoiceId}
                onChange={handleChange}
                required
              >
                <option value="">Select invoice</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - {inv.partyName} (Bal: {Number(inv.balanceAmount).toFixed(2)})
                  </option>
                ))}
              </select>
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
              <label>Mode</label>
              <select name="mode" value={form.mode} onChange={handleChange}>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
              </select>
            </div>
            <div className="form-group">
              <label>Bank/ Cash Account Code</label>
              <input
                name="bankAccountCode"
                value={form.bankAccountCode}
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
            <div className="form-group">
              <label>TDS Amount</label>
              <input
                type="number"
                name="tdsAmount"
                value={form.tdsAmount}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Reference No.</label>
              <input
                name="referenceNumber"
                value={form.referenceNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Remarks</label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
              />
            </div>
            <button className="btn-primary" type="submit">
              Save Payment
            </button>
          </form>
        </div>
        <div className="card">
          <h3>Recent Payments</h3>
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Type</th>
                <th>Invoice</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Reconciled</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{p.paymentNumber}</td>
                  <td>{p.type}</td>
                  <td>{p.invoiceId}</td>
                  <td>{p.date}</td>
                  <td>{Number(p.amount).toFixed(2)}</td>
                  <td>{p.reconciled ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="6">No payments yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payment;
