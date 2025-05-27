import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';
import { useNavigate } from 'react-router-dom';

function Profile({ user }) {
  const [profileData, setProfileData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    userName: '',
    email: '',
    telefon: '',
    adresa: ''
  });
  const navigate = useNavigate();

  // Fetch profil
  useEffect(() => {
    if (user?.userName) {
      axios
        .get(`https://localhost:7157/api/Users/user/by-name/${user.userName}`)
        .then(res => {
          setProfileData(res.data);
          setEditForm({
            userName: res.data.userName,
            email: res.data.email || '',
            telefon: res.data.telefon || '',
            adresa: res.data.adresa || ''
          });
        })
        .catch(err => {
          console.error('Eroare profil:', err);
          setError('Nu s-au putut încărca datele profilului.');
        });
    }
  }, [user]);

  // Fetch conturi
  useEffect(() => {
    if (user?.userId) {
      axios
        .get(`https://localhost:7157/api/Accounts/user/${user.userId}`)
        .then(res => setAccounts(res.data))
        .catch(err => {
          console.error('Eroare conturi:', err);
        });
    }
  }, [user]);

  // Salvare modificări profil
  const handleSave = async () => {
    try {
      await axios.put(`https://localhost:7157/api/Users/${profileData.userId}`, {
        userName: editForm.userName,
        email: editForm.email,
        telefon: editForm.telefon,
        adresa: editForm.adresa
      });

      setProfileData(prev => ({
        ...prev,
        userName: editForm.userName,
        email: editForm.email,
        telefon: editForm.telefon,
        adresa: editForm.adresa
      }));

      setIsEditing(false);
    } catch (err) {
      alert('Eroare la salvarea profilului.');
      console.error('Eroare PUT:', err.response?.data || err.message);
    }
  };

  if (error) {
    return <div className="profile-container">{error}</div>;
  }

  if (!profileData) {
    return <div className="profile-container">Se încarcă profilul...</div>;
  }

  return (
    <div className="profile-container">
      <h2 className="profile-header">Profilul Utilizatorului</h2>

      {!isEditing ? (
        <>
          <div className="profile-info">
            <div className="profile-field"><strong>Utilizator:</strong> {profileData.userName}</div>
            <div className="profile-field"><strong>Email:</strong> {profileData.email}</div>
            <div className="profile-field"><strong>Telefon:</strong> {profileData.telefon}</div>
            <div className="profile-field"><strong>Adresă:</strong> {profileData.adresa}</div>
            <div className="profile-field"><strong>CNP:</strong> {profileData.cnp}</div>
            <div className="profile-field"><strong>IBAN:</strong> {profileData.iban}</div>
            <div className="profile-field"><strong>Moneda cont principal:</strong> {profileData.currency}</div>
          </div>

          <h3 className="profile-subtitle">Toate conturile utilizatorului:</h3>
          <div className="accounts-list">
            {accounts.map((acc) => (
              <div key={acc.accountId} className="account-item">
                <p><strong>Tip:</strong> {acc.accountType}</p>
                <p><strong>Monedă:</strong> {acc.currency}</p>
                <p><strong>Balanță:</strong> {acc.balance} {acc.currency}</p>
              </div>
            ))}
          </div>

          <div className="button-group-vertical">
            <button className="profile-button" onClick={() => navigate('/dashboard')}>
              Înapoi
            </button>
            <button className="profile-button" onClick={() => setIsEditing(true)}>
              Editare profil
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="profile-info">
            <div className="profile-field">
              <strong>Utilizator:</strong>
              <input
                type="text"
                className="profile-input"
                value={editForm.userName}
                onChange={e => setEditForm({ ...editForm, userName: e.target.value })}
              />
            </div>

            <div className="profile-field">
              <strong>Email:</strong>
              <input
                type="email"
                className="profile-input"
                value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>

            <div className="profile-field">
              <strong>Telefon:</strong>
              <input
                type="text"
                className="profile-input"
                value={editForm.telefon}
                onChange={e => setEditForm({ ...editForm, telefon: e.target.value })}
              />
            </div>

            <div className="profile-field">
              <strong>Adresă:</strong>
              <input
                type="text"
                className="profile-input"
                value={editForm.adresa}
                onChange={e => setEditForm({ ...editForm, adresa: e.target.value })}
              />
            </div>

            <div className="profile-field">
              <strong>CNP:</strong>
              <input
                type="text"
                className="profile-input"
                value={profileData.cnp}
                disabled
              />
            </div>

            <div className="profile-field">
              <strong>IBAN:</strong>
              <input
                type="text"
                className="profile-input"
                value={profileData.iban}
                disabled
              />
            </div>
          </div>

          <div className="button-group-vertical">
            <button className="profile-button" onClick={handleSave}>Salvează</button>
            <button className="profile-button" onClick={() => setIsEditing(false)}>Renunță</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;
