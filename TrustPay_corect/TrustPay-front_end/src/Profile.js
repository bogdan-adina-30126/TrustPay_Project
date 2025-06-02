import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';
import { useNavigate } from 'react-router-dom';

function Profile({ user, onUserUpdate }) {
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
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // Funcție pentru a prelua datele profilului de la backend
  const fetchProfileData = async (userName) => {
    if (!userName) {
      console.warn("Attempted to fetch profile with empty username.");
      setError('Numele de utilizator nu este disponibil. Te rugăm să te reloghezi.');
      return;
    }
    try {
      console.log(`Fetching profile for user: ${userName}`);
      const res = await axios.get(`https://localhost:7157/api/Users/user/by-name/${userName}`);
      console.log("Profile data received:", res.data);
      setProfileData(res.data);
      setEditForm({
        userName: res.data.userName,
        email: res.data.email || '',
        telefon: res.data.telefon || '',
        adresa: res.data.adresa || ''
      });
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching profile:', err.response?.status, err.response?.data, err.message);
      setError('Nu s-au putut încărca datele profilului. Asigură-te că ești logat sau că numele de utilizator este corect.');
      setProfileData(null); // Clear profile data on error
    }
  };

  // NOU: Utilizează un useEffect pentru a prelua profilul când user-ul se modifică
  useEffect(() => {
    console.log("Profile component - useEffect for user change. Current user:", user);
    if (user?.userName) {
      fetchProfileData(user.userName);
    } else {
      setProfileData(null); // Clear profile data if user is null or missing username
      setAccounts([]); // Clear accounts as well
      setError('Niciun utilizator autentificat. Te rugăm să te loghezi.');
    }
  }, [user]); // Rulează ori de câte ori obiectul 'user' se modifică

  // Fetch conturi - rămâne neschimbat, dar asigură-te că depinde de user.userId
  useEffect(() => {
    if (user?.userId) {
      console.log(`Fetching accounts for userId: ${user.userId}`);
      axios
        .get(`https://localhost:7157/api/Accounts/user/${user.userId}`)
        .then(res => {
          console.log("Accounts data received:", res.data);
          setAccounts(res.data);
        })
        .catch(err => {
          console.error('Error fetching accounts:', err.response?.status, err.response?.data, err.message);
          // Nu setăm eroare globală, deoarece e legată doar de conturi
        });
    } else {
      setAccounts([]); // Clear accounts if no userId
    }
  }, [user]);

  const validateForm = () => {
    const errors = {};
    if (!editForm.email.trim()) {
      errors.email = 'Emailul este obligatoriu.';
    } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      errors.email = 'Emailul nu este valid.';
    }
    if (!editForm.telefon.trim()) {
      errors.telefon = 'Numărul de telefon este obligatoriu.';
    } else if (!/^\+?[0-9]{7,15}$/.test(editForm.telefon)) {
      errors.telefon = 'Numărul de telefon nu este valid. Exemplu: +407xxxxxxxx';
    }
    if (!editForm.adresa.trim()) {
      errors.adresa = 'Adresa este obligatorie.';
    }
    if (!editForm.userName.trim()) {
      errors.userName = 'Numele de utilizator este obligatoriu.';
    } else if (editForm.userName.length < 3) { // Exemplu de validare lungime
        errors.userName = 'Numele de utilizator trebuie să aibă minim 3 caractere.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log(`Attempting to save user with ID: ${user.userId} and data:`, editForm);
      await axios.put(`https://localhost:7157/api/Users/${user.userId}`, {
        userName: editForm.userName,
        email: editForm.email,
        telefon: editForm.telefon,
        adresa: editForm.adresa
      });

      console.log("User update successful on backend.");

      const updatedUser = {
        ...user,
        userName: editForm.userName,
        email: editForm.email,
        telefon: editForm.telefon,
        adresa: editForm.adresa
      };

      if (onUserUpdate) {
        console.log("Calling onUserUpdate with:", updatedUser);
        onUserUpdate(updatedUser); // Actualizează starea globală în App.js și localStorage
      }

      // Reîncărcă datele profilului folosind noul nume de utilizator
      // Acest apel este crucial pentru a asigura că profileData este sincronizat
      // în cazul în care user.userName s-a schimbat
      await fetchProfileData(updatedUser.userName);

      setIsEditing(false);
      alert('Profilul a fost salvat cu succes!');
    } catch (err) {
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        setValidationErrors(err.response.data.errors || {});
        alert('Eroare la salvarea profilului. Verifică câmpurile.');
      } else if (err.response && err.response.data) {
        alert('Eroare la salvarea profilului: ' + (err.response.data.message || JSON.stringify(err.response.data)));
      } else {
        alert('Eroare la salvarea profilului.');
      }
      console.error('PUT Error details:', err.response?.data || err.message);
    }
  };

  // Renderizarea condiționată
  if (error) {
    return <div className="profile-container error-message">{error}</div>; // Adaugă o clasă pentru stilizare
  }

  if (!profileData) {
    return <div className="profile-container loading-message">Se încarcă profilul...</div>; // Adaugă o clasă pentru stilizare
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
            <button className="profile-button" onClick={() => navigate('/')}>
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
                required
              />
              {validationErrors.userName && <span className="validation-error">{validationErrors.userName}</span>}
            </div>

            <div className="profile-field">
              <strong>Email:</strong>
              <input
                type="email"
                className="profile-input"
                value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
              {validationErrors.email && <span className="validation-error">{validationErrors.email}</span>}
            </div>

            <div className="profile-field">
              <strong>Telefon:</strong>
              <input
                type="text"
                className="profile-input"
                value={editForm.telefon}
                onChange={e => setEditForm({ ...editForm, telefon: e.target.value })}
                required
              />
              {validationErrors.telefon && <span className="validation-error">{validationErrors.telefon}</span>}
            </div>

            <div className="profile-field">
              <strong>Adresă:</strong>
              <input
                type="text"
                className="profile-input"
                value={editForm.adresa}
                onChange={e => setEditForm({ ...editForm, adresa: e.target.value })}
                required
              />
              {validationErrors.adresa && <span className="validation-error">{validationErrors.adresa}</span>}
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
            <button className="profile-button" onClick={() => {
                setIsEditing(false);
                setValidationErrors({});
                // La renunțare, reîncarcă datele inițiale ale profilului din 'user' prop
                if (user?.userName) {
                    fetchProfileData(user.userName);
                }
            }}>Renunță</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;