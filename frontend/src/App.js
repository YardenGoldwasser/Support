import React, { useState } from 'react';
import CustomerForm from './CustomerForm';
import StaffDashboard from './StaffDashboard';
import './App.css';

function App() {
  const [tab, setTab] = useState('customer');

  return (
    <div className="App">
      <header>
        <h1>Support Bot</h1>
        <nav>
          <button onClick={() => setTab('customer')} className={tab === 'customer' ? 'active' : ''}>Submit Report</button>
          <button onClick={() => setTab('staff')} className={tab === 'staff' ? 'active' : ''}>Staff Dashboard</button>
        </nav>
      </header>
      <main>
        {tab === 'customer' ? <CustomerForm /> : <StaffDashboard />}
      </main>
    </div>
  );
}

export default App;
