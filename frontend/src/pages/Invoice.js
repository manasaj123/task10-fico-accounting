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
    narration: '',
    gstAmount: 0,
    totalAmount: 0,
  });

  const [partySummary, setPartySummary] = useState([]);
  const [error, setError] = useState('');

  // popup state
  const [partyInvoices, setPartyInvoices] = useState([]);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [partyLoading, setPartyLoading] = useState(false);
  const [partyError, setPartyError] = useState('');
  const [selectedParty, setSelectedParty] = useState('');

  const loadPartySummary = async () => {
    const res = await api.get('/invoices/summary/by-party');
    setPartySummary(res.data);
  };

  useEffect(() => {
    loadPartySummary().catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      const base = Number(updated.baseAmount) || 0;
      const gstR = Number(updated.gstRate) || 0;
      const tdsR = Number(updated.tdsRate) || 0;

      const gstAmount = (base * gstR) / 100;
      const tdsAmount = (base * tdsR) / 100;
      const totalAmount = base + gstAmount - tdsAmount;

      return {
        ...updated,
        gstAmount,
        totalAmount,
      };
    });
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

      setForm((f) => ({
        ...f,
        invoiceNumber: res.data.invoiceNumber || '',
        partyName: '',
        partyGSTIN: '',
        baseAmount: '',
        narration: '',
        gstAmount: 0,
        totalAmount: 0,
      }));
      loadPartySummary();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    }
  };

  // fetch and open party transactions popup (from summary row)
  const openPartyTransactionsFor = async (partyName) => {
    if (!partyName) return;
    setSelectedParty(partyName);
    setPartyLoading(true);
    setPartyError('');
    try {
      const res = await api.get(
        `/invoices/party/${encodeURIComponent(partyName)}`
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

  // totals for popup
  const totalBase = partyInvoices.reduce(
    (sum, inv) => sum + Number(inv.baseAmount || 0),
    0
  );
  const totalTotal = partyInvoices.reduce(
    (sum, inv) => sum + Number(inv.totalAmount || 0),
    0
  );

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
                Party Name<span className="required-star">*</span>
              </label>
              <input
                name="partyName"
                value={form.partyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Party GSTIN <span className="required-star">*</span>
              </label>
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
    <select
      name="gstRate"
      value={form.gstRate}
      onChange={handleChange}
      required
    >
      <option value="5">5%</option>
      <option value="18">18%</option>
      <option value="40">40%</option>
    </select>
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


            <div className="form-group-inline">
              <div>
                <label>GST Amount</label>
                <input
                  type="number"
                  value={form.gstAmount.toFixed(2)}
                  readOnly
                />
              </div>
              <div>
                <label>Total Amount</label>
                <input
                  type="number"
                  value={form.totalAmount.toFixed(2)}
                  readOnly
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
          <h3>Party Summary</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Party</th>
                <th>Total Amount</th>
                <th>Balance</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {partySummary.map((row) => (
                <tr key={row.partyName}>
                  <td>{row.partyName}</td>
                  <td>{Number(row.totalAmount).toFixed(2)}</td>
                  <td>{Number(row.balanceAmount).toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => openPartyTransactionsFor(row.partyName)}
                    >
                      View transactions
                    </button>
                  </td>
                </tr>
              ))}
              {partySummary.length === 0 && (
                <tr>
                  <td colSpan="4">No invoices yet.</td>
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
              <h4>Invoices for {selectedParty}</h4>
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
                <div className="modal-table-wrapper">
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
                      <tr>
                        <td colSpan="3">
                          <strong>Totals</strong>
                        </td>
                        <td>{totalBase.toFixed(2)}</td>
                        <td>{totalTotal.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
