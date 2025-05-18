import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import logo from './logo1.png';

function Dashboard({ user, onLogout }) {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState({});
  const [currentTab, setCurrentTab] = useState(null);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [fromAccountId, setFromAccountId] = useState(null);
  const [toAccountId, setToAccountId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferCurrency, setTransferCurrency] = useState('RON');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [transferType, setTransferType] = useState(null);
  const [toUserName, setToUserName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('RON');
  const [fromUserName, setFromUserName] = useState(user.userName);
  // Nou state pentru notificarea de confirmare a transferului
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  // Nou state pentru a controla afișarea istoricului de tranzacții
  const [showTransactionHistory, setShowTransactionHistory] = useState({});
  const [loadingTransactions, setLoadingTransactions] = useState({});

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`https://localhost:7157/api/Accounts/user/${user.userId}`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setAccounts(data);
        setCurrentTab(data[0].accountType);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user.userId]);

  // Funcție pentru afișarea notificării de confirmare
  const showConfirmationNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const transferFunds = async () => {
    const parsedAmount = parseFloat(transferAmount);
    if (!parsedAmount || parsedAmount <= 0) {
      setMessageType('error');
      setMessage("Suma introdusă nu este validă.");
      return;
    }

    if (fromAccountId === toAccountId) {
      setMessageType('error');
      setMessage("Nu poți transfera către același cont.");
      return;
    }

    try {
      const response = await fetch('https://localhost:7157/api/Transactions/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountId,
          toAccountId,
          amount: parsedAmount,
          currency: transferCurrency,
          transactionType: "Transfer",
          fromUserName,   
          toUserName
        }),
      });

      if (response.ok) {
        setMessageType('success');
        setMessage("Transfer realizat cu succes!");
        // Afișăm notificarea de confirmare
        showConfirmationNotification("Transfer realizat cu succes!");
        await fetchAccounts();
        setShowTransferForm(false);
        setTransferAmount('');
        setTransferCurrency('RON');
        
        // Actualizăm tranzacțiile pentru contul sursă după un transfer reușit
        if (showTransactionHistory[fromAccountId]) {
          fetchTransactions(fromAccountId);
        }
      } else {
        const errorData = await response.json();
        setMessageType('error');
        setMessage("Eroare la transfer: " + (errorData.message || "necunoscută"));
      }
    } catch (error) {
      setMessageType('error');
      setMessage("Eroare: " + error.message);
    }

    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const transferBetweenUsers = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setMessageType('error');
      setMessage("Suma introdusă nu este validă.");
      return;
    }

    if (fromUserName === toUserName) {
      setMessageType('error');
      setMessage("Nu poți transfera către același utilizator.");
      return;
    }

    try {
      const response = await fetch('https://localhost:7157/api/Transactions/transfer-between-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          FromUserName: fromUserName,
          ToUserName: toUserName,
          Amount: parsedAmount,
          Currency: currency,
          TransactionType: "Transfer"
        }),
      });

      if (response.ok) {
        setMessageType('success');
        setMessage("Transfer realizat cu succes!");
        // Afișăm notificarea de confirmare
        showConfirmationNotification("Transfer către utilizator realizat cu succes!");
        await fetchAccounts();
        setShowTransferForm(false);
        setAmount('');
        setCurrency('RON');
        setToUserName('');
        
        // Actualizăm tranzacțiile pentru toate conturile după un transfer între utilizatori
        accounts.forEach(acc => {
          if (showTransactionHistory[acc.accountId]) {
            fetchTransactions(acc.accountId);
          }
        });
      } else {
        const errorData = await response.json();
        setMessageType('error');
        setMessage("Eroare la transfer: " + (errorData.message || "necunoscută"));
      }
    } catch (error) {
      setMessageType('error');
      setMessage("Eroare: " + error.message);
    }

    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  // MODIFICARE: Schimbat URL-ul pentru a se potrivi cu backend-ul
  const fetchTransactions = async (accountId) => {
    try {
      setLoadingTransactions(prev => ({ ...prev, [accountId]: true }));
      
      // Modificat URL-ul API-ului pentru a corespunde cu backend-ul
      const response = await fetch(`https://localhost:7157/api/Transactions/history/${accountId}`);
      if (!response.ok) {
        throw new Error("Nu s-au putut prelua tranzacțiile.");
      }

      const data = await response.json();
      setTransactions(prev => ({ ...prev, [accountId]: data }));
    } catch (error) {
      console.error("Eroare la preluarea tranzacțiilor:", error);
      setMessageType("error");
      setMessage("Eroare la preluarea tranzacțiilor!");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 4000);
    } finally {
      setLoadingTransactions(prev => ({ ...prev, [accountId]: false }));
    }
  };

  const toggleTransactionHistory = async (accountId) => {
    const currentValue = showTransactionHistory[accountId] || false;
    setShowTransactionHistory(prev => ({ ...prev, [accountId]: !currentValue }));
    
    if (!currentValue && !transactions[accountId]) {
      await fetchTransactions(accountId);
    }
  };

  // Funcție utilitară pentru formatarea numerelor fără zecimale inutile
  const formatNumber = (number) => {
    return Number.isInteger(number) ? number : number.toFixed(2);
  };

  const handleDeleteAccount = async (account, userAccounts, fetchAccounts) => {
  const confirmDelete = window.confirm(`Sigur dorești să ștergi contul ${account.accountType} (${account.currency})?`);

  if (!confirmDelete) return;

  if (account.balance > 0) {
    alert(
      `Nu poți șterge acest cont deoarece are un sold de ${account.balance} ${account.currency}.\n` +
      `Te rugăm să selectezi contul în care vrei să transferi banii înainte de a șterge acest cont.`
    );
    // Aici poți extinde cu logica de selectare transfer, dacă vrei.
    return;
  }

  try {
    const response = await fetch(`https://localhost:7157/api/Accounts/${account.accountId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Contul a fost șters cu succes.");
      if (fetchAccounts) fetchAccounts(); // Reîncarcă lista conturilor
    } else {
      const errorText = await response.text();
      alert("Eroare la ștergerea contului: " + errorText);
    }
  } catch (error) {
    console.error("Eroare:", error);
    alert("Eroare tehnică: " + error.message);
  }
};


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const accountTypes = [...new Set(accounts.map((acc) => acc.accountType))];
  
  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left logo-container">
          <img src={logo} alt="TrustPay Logo" className="header-logo" />
          <span className="logo-text">Trust Pay - Siguranța banilor tăi!</span>
        </div>
        <div className="header-right">
          <span className="username">Salut, {user.userName}!</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="chrome-tabs-container">
        {accountTypes.map((type) => (
          <button
            key={type}
            onClick={() => setCurrentTab(type)}
            className={`chrome-tab ${currentTab === type ? 'chrome-tab-active' : ''}`}
          >
            {type}
          </button>
        ))}
      </div>

    <div className="tab-content">
  {accounts
    .filter((acc) => acc.accountType === currentTab)
    .map((acc) => (
      <div key={acc.accountId} className="account-tab">
        <div className="account-info">
          <h3 className="account-title">{acc.accountType}</h3>
          <div className="balance-label">Balanță:</div>
          <p className="account-balance">
            {Number.isInteger(acc.balance) ? acc.balance : acc.balance.toFixed(2)} {acc.currency}
          </p>
        </div>
        <div className="account-actions-container">
          <div className="account-actions-left">
            <button 
              className="action-button transfer-button"
              onClick={() => {
                setFromAccountId(acc.accountId);
                setShowTransferForm(true);
                setTransferType('funds');
              }}
            >
              Mutare fonduri
            </button>
            <button 
              className="action-button transfer-button"
              onClick={() => {
                setFromAccountId(acc.accountId);
                setShowTransferForm(true);
                setTransferType('user');
              }}
            >
              Transfer către alt utilizator
            </button>
          </div>
          <div className="account-actions-right">
            <button 
              className={`action-button history-button ${showTransactionHistory[acc.accountId] ? 'history-button-active' : ''}`}
              onClick={() => toggleTransactionHistory(acc.accountId)}
            >
              Istoric Tranzacții
            </button>
            {/* Butonul de ștergere doar dacă tipul contului nu e Personal */}
            {acc.accountType !== "Personal" && (
              <button
                className="action-button delete-button"
                style={{
                  backgroundColor: "crimson",
                  color: "white",
                  marginLeft: "10px",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  cursor: "pointer"
                }}
                onClick={() => handleDeleteAccount(acc, accounts, fetchAccounts)}
              >
                Șterge cont
              </button>
            )}
          </div>
        </div>
     


              
              {/* Secțiunea de istoric tranzacții */}
              {showTransactionHistory[acc.accountId] && (
                <div className="transaction-history-container">
                  <h4 className="transaction-history-title">Istoric Tranzacții</h4>
                  
                  {loadingTransactions[acc.accountId] ? (
                    <div className="loading-transactions">
                      Încărcare tranzacții...
                    </div>
                  ) : transactions[acc.accountId] && transactions[acc.accountId].length > 0 ? (
                    <ul className="transaction-list">
                      {/* MODIFICARE: Actualizat modul de afișare pentru a se potrivi cu răspunsul Backend-ului */}
                      {transactions[acc.accountId].map((transaction, index) => {
                        // Formatarea sumei din mesaj pentru a elimina zecimalele de 0
                        let message = transaction.message;
                        // Căutăm numere urmate de spațiu și valută
                        const regex = /(\d+(\.\d+)?)\s+(RON|EUR|USD)/g;
                        message = message.replace(regex, (match, number, decimal, currency) => {
                          const formattedNumber = formatNumber(parseFloat(number));
                          return `${formattedNumber} ${currency}`;
                        });
                        
                        return (
                          <li key={index} className="transaction-item">
                            {message}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="no-transactions">
                      Nu există tranzacții pentru acest cont.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>

      {showTransferForm && transferType === 'funds' && (
        <div className="transfer-modal">
          <h3 className="transfer-modal-title">Mutare fonduri</h3>
          
          <div className="form-group">
            <label className="form-label">
              Către cont:
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="form-control"
              >
                <option value="">Selectează</option>
                {accounts
                  .filter((acc) => acc.accountId !== fromAccountId)
                  .map((acc) => (
                    <option key={acc.accountId} value={acc.accountId}>
                      {acc.accountType} ({acc.currency})
                    </option>
                  ))}
              </select>
            </label>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Suma:
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Introdu suma"
                className="form-control"
              />
            </label>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Valuta:
              <select
                value={transferCurrency}
                onChange={(e) => setTransferCurrency(e.target.value)}
                className="form-control"
              >
                <option value="RON">RON</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </label>
          </div>
          
          <div className="modal-actions">
            <button 
              className="cancel-button"
              onClick={() => setShowTransferForm(false)}
            >
              Anulează
            </button>
            <button 
              className="submit-button"
              onClick={transferFunds}
            >
              Transferă
            </button>
          </div>

          {message && (
            <div className={`message-box ${messageType}-message`}>
              {message}
            </div>
          )}
        </div>
      )}

      {showTransferForm && transferType === 'user' && (
        <div className="transfer-modal">
          <h3 className="transfer-modal-title">Transfer către alt utilizator</h3>
          
          <div className="form-group">
            <label className="form-label">
              Către utilizator:
              <input
                type="text"
                value={toUserName}
                onChange={(e) => setToUserName(e.target.value)}
                placeholder="Introdu numele utilizatorului"
                className="form-control"
              />
            </label>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Suma:
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Introdu suma"
                className="form-control"
              />
            </label>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Valuta:
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="form-control"
              >
                <option value="RON">RON</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </label>
          </div>
          
          <div className="modal-actions">
            <button 
              className="cancel-button"
              onClick={() => setShowTransferForm(false)}
            >
              Anulează
            </button>
            <button 
              className="submit-button"
              onClick={transferBetweenUsers}
            >
              Transferă
            </button>
          </div>

          {message && (
            <div className={`message-box ${messageType}-message`}>
              {message}
            </div>
          )}
        </div>
      )}
      
      {/* Notificare de confirmare pentru transfer */}
      {showNotification && (
        <div className="notification success-notification">
          <div className="notification-content">
            <span className="notification-icon">✓</span>
            <span>{notificationMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;