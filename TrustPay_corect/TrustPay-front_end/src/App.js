import React, { useState, useEffect } from "react"; // Adaugă useEffect aici
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./Dashboard";
import TransactionHistoryPage from "./TransactionHistoryPage";
import Profile from "./Profile";
import LoginForm from "./LoginForm";

function App() {
  const [user, setUser] = useState(null);

  // NOU: Încarcă user-ul din localStorage la inițializarea aplicației
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('user'); // Curăță localStorage dacă e corupt
      }
    }
  }, []); // Rulează o singură dată la montare

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Salvează user-ul în localStorage
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Șterge user-ul din localStorage
  };

  // NOU: Funcție pentru a actualiza starea utilizatorului după editarea profilului
  const handleUserUpdate = (updatedUserData) => {
    setUser(updatedUserData); // Actualizează starea în App.js
    localStorage.setItem('user', JSON.stringify(updatedUserData)); // Actualizează și în localStorage
    console.log("User updated globally:", updatedUserData);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" /> : <LoginForm onLogin={handleLogin} />
          }
        />
        <Route
          path="/"
          element={
            user ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/istoric-tranzactii"
          element={
            user ? (
              <TransactionHistoryPage user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            user ? (
              // NOU: Trimite funcția handleUserUpdate către componenta Profile
              <Profile user={user} onUserUpdate={handleUserUpdate} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;