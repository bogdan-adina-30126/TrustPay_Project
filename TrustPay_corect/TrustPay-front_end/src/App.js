import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import Dashboard from './Dashboard';

function App() {
  const [user, setUser] = useState(null); // user conține userId și userName

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" /> : <LoginForm onLogin={setUser} />
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? <Dashboard user={user} onLogout={() => setUser(null)} /> : <Navigate to="/" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;