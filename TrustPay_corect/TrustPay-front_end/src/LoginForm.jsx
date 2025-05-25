import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import logo from './logo1.png';

async function loginUser(userName, email, password) {
  try {
    const response = await fetch('https://localhost:7157/api/Users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, email, password }),
    });
        
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
        
    const data = await response.json();
    return data;
  } catch (err) {
    throw err;
  }
}

function LoginForm({ onLogin }) {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
    
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName || !email || !password) {
      setMessage("Toate câmpurile sunt obligatorii.");
      return;
    }
    try {
      const data = await loginUser(userName, email, password);
      if (data.message === "Autentificare") {
        setMessage(data.message);
        onLogin({ userId: data.userId, userName: data.userName });
        navigate('/dashboard');
      } else {
        setMessage("Autentificarea a eșuat. Vă rugăm să verificați datele de conectare.");
      }
    } catch (error) {
      setMessage("Autentificarea a eșuat. Vă rugăm să verificați datele de conectare.");
    }
  };

  // Handler pentru tasta Enter pe orice input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };
    
  return (
    <div className="login-container">
      <div className="login-white-box">
        <div className="logo-container">
          <img src={logo} alt="TrustPay Logo" className="login-logo" />
        </div>
        <h2>Intră în cont:</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button type="submit">Autentificare</button>
        </form>
        {message && <p className="login-message">{message}</p>}
      </div>
    </div>
  );
}

export default LoginForm;