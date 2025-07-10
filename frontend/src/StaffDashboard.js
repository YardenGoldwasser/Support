import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function StaffDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/reports`)
      .then(res => res.json())
      .then(setReports)
      .catch(() => setError('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    window.open(`${API_URL}/export`, '_blank');
  };

  return (
    <div className="staff-dashboard">
      <h2>Staff Dashboard</h2>
      <button onClick={handleExport}>Export to Excel</button>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Category</th>
              <th>Description</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{r.category}</td>
                <td>{r.description}</td>
                <td>{new Date(r.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StaffDashboard;