import React from 'react';
import { NavLink } from 'react-router-dom';
import './styles.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <NavLink to="/dashboard">📊 Dashboard</NavLink>
      <NavLink to="/invoices">🧾 Invoices</NavLink>
      <NavLink to="/payments">💳 Payments</NavLink>
      <NavLink to="/bank-reconciliation">🏦 Bank Reconciliation</NavLink>
      <NavLink to="/budget">📈 Budget</NavLink>
      <NavLink to="/cost-centers">💰 Cost Centers</NavLink>
      <NavLink to="/profit-centers">📉 Profit Centers</NavLink>
      <NavLink to="/expenses">🧮 Expenses</NavLink>
      <NavLink to="/audit">🔍 Audit</NavLink>
    </aside>
  );
};

export default Sidebar;
