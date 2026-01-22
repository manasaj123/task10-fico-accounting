import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const ProfitCenter = () => {
  const [form, setForm] = useState({ code: '', name: '', description: '' });
  const [rows, setRows] = useState([]);

  const load = async () => {
    const res = await api.get('/profit-centers');
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
    await api.post('/profit-centers', form);
    setForm({ code: '', name: '', description: '' });
    load();
  };

  return (
    <div>
      <h2>Profit Centers</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Create</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Code</label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
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
            <button className="btn-primary" type="submit">
              Save
            </button>
          </form>
        </div>
        <div className="card">
          <h3>List</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>{c.code}</td>
                  <td>{c.name}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="2">No profit centers yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfitCenter;
