import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Invoice from './pages/Invoice';
import Payment from './pages/Payment';
import BankReconciliation from './pages/BankReconciliation';
import Budget from './pages/Budget';
import CostCenter from './pages/CostCenter';
import ProfitCenter from './pages/ProfitCenter';
import Expense from './pages/Expense';


import './styles/App.css';

import './styles/Common.css';

const AppLayout = ({ children }) => (
  <div className="app-layout  app-background">
    <Navbar />
    <div className="app-body">
      <Sidebar />
      <main className="app-content">{children}</main>
    </div>
  </div>
);

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
        />
        <Route
          path="/invoices"
          element={
            <AppLayout>
              <Invoice />
            </AppLayout>
          }
        />
        <Route
          path="/payments"
          element={
            <AppLayout>
              <Payment />
            </AppLayout>
          }
        />
        <Route
          path="/bank-reconciliation"
          element={
            <AppLayout>
              <BankReconciliation />
            </AppLayout>
          }
        />
        <Route
          path="/budget"
          element={
            <AppLayout>
              <Budget />
            </AppLayout>
          }
        />
        <Route
          path="/cost-centers"
          element={
            <AppLayout>
              <CostCenter />
            </AppLayout>
          }
        />
        <Route
          path="/profit-centers"
          element={
            <AppLayout>
              <ProfitCenter />
            </AppLayout>
          }
        />
        <Route
          path="/expenses"
          element={
            <AppLayout>
              <Expense />
            </AppLayout>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
