import React, { useEffect, useState } from 'react';
import './App.css';
import logo from './logo1.png';

// Stiluri inline pentru noul design
const styles = {
  chromeTabsContainer: {
    backgroundColor: '#f0f3f5',
    padding: '0 20px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    marginBottom: '20px'
  },
  chromeTab: {
    background: 'transparent',
    border: 'none',
    borderRadius: '8px 8px 0 0',
    padding: '14px 28px',
    margin: '0 6px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#5f6368',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    marginBottom: '-1px'
  },
  chromeTabActive: {
    background: '#fff',
    color: '#1a73e8',
    borderTop: '2px solid #1a73e8',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
  },
  accountTab: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    padding: '30px',
    margin: '30px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  accountInfo: {
    borderBottom: '1px solid #eaeaea',
    paddingBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  balanceLabel: {
    fontSize: '18px',
    color: '#5f6368',
    margin: '0 0 5px 0'
  },
  accountTitle: {
    fontSize: '20px',
    margin: '0 0 8px 0',
    color: '#202124',
    display: 'none' // Ascundem titlul - va fi doar în tab
  },
  accountBalance: {
    fontSize: '32px',
    fontWeight: '500',
    color: '#202124',
    margin: '5px 0'
  },
  accountActions: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '30px'
  },
  actionButton: {
    padding: '16px 32px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '180px'
  },
  transferButton: {
    backgroundColor: '#1a73e8',
    color: 'white'
  },
  historyButton: {
    backgroundColor: '#f1f3f4',
    color: '#5f6368'
  },
  headerLogo: {
    width: '50px',  // Mărim logo-ul
    height: 'auto'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  logoText: {
    marginLeft: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fff'
  },
  // Stiluri pentru notificarea de confirmare
  notification: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1100,
    fontSize: '15px',
    fontWeight: '500',
    transition: 'opacity 0.3s, transform 0.3s',
    opacity: 1,
    transform: 'translateY(0)'
  },
  successNotification: {
    backgroundColor: '#e6f4ea',
    color: '#137333',
    border: '1px solid #ceead6'
  },
  // Stiluri pentru lista de tranzacții
  transactionHistoryContainer: {
    marginTop: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e0e0e0'
  },
  transactionHistoryTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#202124',
    marginBottom: '15px',
    padding: '0 0 10px 0',
    borderBottom: '1px solid #e0e0e0'
  },
  transactionList: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
    maxHeight: '300px',
    overflowY: 'auto'
  },
  transactionItem: {
    padding: '12px 10px',
    borderBottom: '1px solid #eaeaea',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  transactionDate: {
    color: '#5f6368',
    fontSize: '12px'
  },
  transactionAmount: {
    fontWeight: '500'
  },
  incomingTransaction: {
    color: '#137333'
  },
  outgoingTransaction: {
    color: '#c5221f'
  },
  noTransactions: {
    textAlign: 'center',
    padding: '20px',
    color: '#5f6368',
    fontStyle: 'italic'
  }
};

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

  const fetchTransactions = async (accountId) => {
    try {
      setLoadingTransactions(prev => ({ ...prev, [accountId]: true }));
      
      const response = await fetch(`https://localhost:7157/api/Transactions/account/${accountId}`);
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
        <div className="header-left" style={styles.logoContainer}>
          <img src={logo} alt="TrustPay Logo" style={styles.headerLogo} />
          <span style={styles.logoText}>Trust Pay - Siguranța banilor tăi!</span>
        </div>
        <div className="header-right">
          <span className="username">Salut, {user.userName}!</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div style={styles.chromeTabsContainer}>
        {accountTypes.map((type) => (
          <button
            key={type}
            onClick={() => setCurrentTab(type)}
            style={{
              ...styles.chromeTab,
              ...(currentTab === type ? styles.chromeTabActive : {})
            }}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {accounts
          .filter((acc) => acc.accountType === currentTab)
          .map((acc) => (
            <div key={acc.accountId} style={styles.accountTab}>
              <div style={styles.accountInfo}>
                <h3 style={styles.accountTitle}>{acc.accountType}</h3>
                <div style={styles.balanceLabel}>Balanță:</div>
                <p style={styles.accountBalance}>{acc.balance} {acc.currency}</p>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}>
                  <button 
                    style={{...styles.actionButton, ...styles.transferButton}}
                    onClick={() => {
                      setFromAccountId(acc.accountId);
                      setShowTransferForm(true);
                      setTransferType('funds');
                    }}
                  >
                    Mutare fonduri
                  </button>
                  <button 
                    style={{...styles.actionButton, ...styles.transferButton}}
                    onClick={() => {
                      setFromAccountId(acc.accountId);
                      setShowTransferForm(true);
                      setTransferType('user');
                    }}
                  >
                    Transfer către alt utilizator
                  </button>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button 
                    style={{
                      ...styles.actionButton, 
                      ...styles.historyButton,
                      height: '100%',
                      backgroundColor: showTransactionHistory[acc.accountId] ? '#e8f0fe' : '#f1f3f4',
                      color: showTransactionHistory[acc.accountId] ? '#1a73e8' : '#5f6368',
                      border: showTransactionHistory[acc.accountId] ? '1px solid #d2e3fc' : 'none'
                    }}
                    onClick={() => toggleTransactionHistory(acc.accountId)}
                  >
                    Istoric Tranzacții
                  </button>
                </div>
              </div>
              
              {/* Secțiunea de istoric tranzacții */}
              {showTransactionHistory[acc.accountId] && (
                <div style={styles.transactionHistoryContainer}>
                  <h4 style={styles.transactionHistoryTitle}>Istoric Tranzacții</h4>
                  
                  {loadingTransactions[acc.accountId] ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      Încărcare tranzacții...
                    </div>
                  ) : transactions[acc.accountId] && transactions[acc.accountId].length > 0 ? (
                    <ul style={styles.transactionList}>
                      {transactions[acc.accountId].map((transaction, index) => {
                        const isIncoming = transaction.toAccountId === acc.accountId;
                        return (
                          <li key={index} style={styles.transactionItem}>
                            <div>
                              <span>
                                {isIncoming 
                                  ? `→ De la contul ${transaction.fromAccountId}` 
                                  : `→ Către contul ${transaction.toAccountId}`}
                              </span>
                              <div style={styles.transactionDate}>
                                {formatDate(transaction.transactionDate)}
                              </div>
                            </div>
                            <span style={{
                              ...styles.transactionAmount,
                              ...(isIncoming ? styles.incomingTransaction : styles.outgoingTransaction)
                            }}>
                              {isIncoming ? '+' : '-'}{transaction.amount} {transaction.currency}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div style={styles.noTransactions}>
                      Nu există tranzacții pentru acest cont.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>

      {showTransferForm && transferType === 'funds' && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          width: '90%',
          maxWidth: '500px',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <h3 style={{
            fontSize: '20px',
            marginTop: 0,
            marginBottom: '24px',
            color: '#202124'
          }}>Mutare fonduri</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '15px', color: '#5f6368' }}>
              Către cont:
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  marginTop: '6px',
                  borderRadius: '8px',
                  border: '1px solid #dadce0',
                  fontSize: '16px'
                }}
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
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '15px', color: '#5f6368' }}>
              Suma:
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Introdu suma"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  marginTop: '6px',
                  borderRadius: '8px',
                  border: '1px solid #dadce0',
                  fontSize: '16px'
                }}
              />
            </label>
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '15px', color: '#5f6368' }}>
              Valuta:
              <select
                value={transferCurrency}
                onChange={(e) => setTransferCurrency(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  marginTop: '6px',
                  borderRadius: '8px',
                  border: '1px solid #dadce0',
                  fontSize: '16px'
                }}
              >
                <option value="RON">RON</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </label>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#f1f3f4',
                color: '#5f6368',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onClick={() => setShowTransferForm(false)}
            >
              Anulează
            </button>
            <button 
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#1a73e8',
                color: 'white',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onClick={transferFunds}
            >
              Transferă
            </button>
          </div>

          {message && (
            <div style={{
              marginTop: '20px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: messageType === 'success' ? '#e6f4ea' : messageType === 'error' ? '#fce8e6' : '#e8f0fe',
              color: messageType === 'success' ? '#137333' : messageType === 'error' ? '#c5221f' : '#1967d2',
              fontSize: '14px'
            }}>
              {message}
            </div>
          )}
        </div>
      )}

      {showTransferForm && transferType === 'user' && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          width: '90%',
          maxWidth: '500px',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <h3 style={{
            fontSize: '20px',
            marginTop: 0,
            marginBottom: '24px',
            color: '#202124'
          }}>Transfer către alt utilizator</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '15px', color: '#5f6368' }}>
              Către utilizator:
              <input
                type="text"
                value={toUserName}
                onChange={(e) => setToUserName(e.target.value)}
                placeholder="Introdu numele utilizatorului"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  marginTop: '6px',
                  borderRadius: '8px',
                  border: '1px solid #dadce0',
                  fontSize: '16px'
                }}
              />
            </label>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '15px', color: '#5f6368' }}>
              Suma:
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Introdu suma"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  marginTop: '6px',
                  borderRadius: '8px',
                  border: '1px solid #dadce0',
                  fontSize: '16px'
                }}
              />
            </label>
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '15px', color: '#5f6368' }}>
              Valuta:
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  marginTop: '6px',
                  borderRadius: '8px',
                  border: '1px solid #dadce0',
                  fontSize: '16px'
                }}
              >
                <option value="RON">RON</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </label>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#f1f3f4',
                color: '#5f6368',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onClick={() => setShowTransferForm(false)}
            >
              Anulează
            </button>
            <button 
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#1a73e8',
                color: 'white',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onClick={transferBetweenUsers}
            >
              Transferă
            </button>
          </div>

          {message && (
            <div style={{
              marginTop: '20px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: messageType === 'success' ? '#e6f4ea' : messageType === 'error' ? '#fce8e6' : '#e8f0fe',
              color: messageType === 'success' ? '#137333' : messageType === 'error' ? '#c5221f' : '#1967d2',
              fontSize: '14px'
            }}>
              {message}
            </div>
          )}
        </div>
      )}
      
      {/* Notificare de confirmare pentru transfer */}
      {showNotification && (
        <div style={{
          ...styles.notification,
          ...styles.successNotification
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>✓</span>
            <span>{notificationMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;