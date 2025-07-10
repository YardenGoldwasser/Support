import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function CustomerForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: 'Issue',
    description: '',
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_URL}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', category: 'Issue', description: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
    setLoading(false);
  };

  return (
    <form className="customer-form" onSubmit={handleSubmit}>
      <h2>Submit an Issue or Product Request</h2>
      <label>
        Name (optional):
        <input name="name" value={form.name} onChange={handleChange} />
      </label>
      <label>
        Email (optional):
        <input name="email" value={form.email} onChange={handleChange} type="email" />
      </label>
      <label>
        Category:
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="Issue">Issue</option>
          <option value="Product Request">Product Request</option>
        </select>
      </label>
      <label>
        Description:<span style={{color:'red'}}>*</span>
        <textarea name="description" value={form.description} onChange={handleChange} required />
      </label>
      <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
      {status === 'success' && <div className="success">Report submitted!</div>}
      {status === 'error' && <div className="error">Submission failed. Please try again.</div>}
    </form>
  );
}

export default CustomerForm;