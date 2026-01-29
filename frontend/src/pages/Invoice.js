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

  // NEW: popup state
  const [partyInvoices, setPartyInvoices] = useState([]);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [partyLoading, setPartyLoading] = useState(false);
  const [partyError, setPartyError] = useState('');

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
        // invoiceNumber is not sent; backend generates it
        type: form.type,
        partyName: form.partyName,
        partyGSTIN: form.partyGSTIN,
        date: form.date,
        dueDate: form.dueDate,
        baseAmount: Number(form.baseAmount),
        gstRate: Number(form.gstRate),
        tdsRate: Number(form.tdsRate) || 0,
        narration: form.narration,
      };
      const res = await api.post('/invoices', payload);

      // Set generated invoiceNumber if you want to show it
      setForm((f) => ({
        ...f,
        invoiceNumber: res.data.invoiceNumber || '',
        partyName: '',
        partyGSTIN: '',
        baseAmount: '',
        narration: '',
      }));
      loadInvoices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    }
  };

  // NEW: fetch and open party transactions popup
  const openPartyTransactions = async () => {
    if (!form.partyName.trim()) return;
    setPartyLoading(true);
    setPartyError('');
    try {
      const res = await api.get(
        `/invoices/party/${encodeURIComponent(form.partyName.trim())}`
      );
      setPartyInvoices(res.data);
      setShowPartyModal(true);
    } catch (err) {
      setPartyError(
        err.response?.data?.message || 'Failed to load party invoices'
      );
      setShowPartyModal(true);
    } finally {
      setPartyLoading(false);
    }
  };

  const closePartyModal = () => {
    setShowPartyModal(false);
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
                readOnly
                placeholder="Will be generated (DB4-INV-001)"
              />
            </div>

            <div className="form-group">
              <label>
                Type<span className="required-star">*</span>
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                <option value="AR">Customer (AR)</option>
                <option value="AP">Vendor (AP)</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Party Name<span className="required-star">*</span>{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={openPartyTransactions}
                >
                  View transactions
                </button>
              </label>
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
              <label>
                Date<span className="required-star">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Deu Date<span className="required-star">*</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Base Amount<span className="required-star">*</span>
              </label>
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

      {/* Party transactions popup */}
      {showPartyModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h4>Invoices for {form.partyName}</h4>
              <button type="button" onClick={closePartyModal}>
                X
              </button>
            </div>
            <div className="modal-body">
              {partyLoading && <div>Loading...</div>}
              {partyError && <div className="error-text">{partyError}</div>}
              {!partyLoading && !partyError && partyInvoices.length === 0 && (
                <div>No invoices found for this party.</div>
              )}
              {!partyLoading && !partyError && partyInvoices.length > 0 && (
                <table className="table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Base</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partyInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>{inv.invoiceNumber}</td>
                        <td>{inv.date}</td>
                        <td>{inv.type}</td>
                        <td>{Number(inv.baseAmount).toFixed(2)}</td>
                        <td>{Number(inv.totalAmount).toFixed(2)}</td>
                        <td>{inv.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={closePartyModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;
