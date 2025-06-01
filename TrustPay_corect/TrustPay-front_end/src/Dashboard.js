import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import logo from './logo1.png';
import { useNavigate } from 'react-router-dom';
import Profile from './Profile'; // Asigură-te că Profile este corect importat și utilizat dacă este cazul

function Dashboard({ user, onLogout }) {
  const [accounts, setAccounts] = useState([]);
  const [currentTab, setCurrentTab] = useState(null);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [fromAccountId, setFromAccountId] = useState(null);
  const [toAccountId, setToAccountId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferCurrency, setTransferCurrency] = useState("RON");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [transferType, setTransferType] = useState(null);
  const [toUserName, setToUserName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("RON");
  const [fromUserName] = useState(user.userName);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteMessageType, setDeleteMessageType] = useState("");
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [createAccountMessage, setCreateAccountMessage] = useState("");
  const [createAccountMessageType, setCreateAccountMessageType] = useState("");
  const [userAccounts, setUserAccounts] = useState([]);
  const navigate = useNavigate();

  const goToProfile = () => {
    navigate('/profile');
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch(
        `https://localhost:7157/api/Accounts/user/${user.userId}`
      );
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setAccounts(data);
        // Set current tab to the first account's type if no tab is currently selected
        if (currentTab === null) {
          setCurrentTab(data[0].accountType);
        } else {
            // If the current tab (selectedAccountType after creation) is no longer valid,
            // or if the account was deleted, switch to the first available account.
            // This ensures a valid tab is always selected.
            const currentTabExists = data.some(acc => acc.accountType === currentTab);
            if (!currentTabExists && data.length > 0) {
                setCurrentTab(data[0].accountType);
            } else if (data.length === 0) {
                setCurrentTab(null); // No accounts left
            }
        }
      } else {
        setAccounts([]);
        setCurrentTab(null); // No accounts, no active tab
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      // Handle cases where user has no accounts (e.g., first login, or all deleted)
      setAccounts([]);
      setCurrentTab(null);
    }
  };

  // Re-fetch accounts when user.userId changes
  useEffect(() => {
    if (user && user.userId) {
        fetchAccounts();
    }
  }, [user.userId]);

  const showConfirmationNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const transferFunds = async () => {
    const parsedAmount = parseFloat(transferAmount);
    if (!parsedAmount || parsedAmount <= 0) {
      setMessageType("error");
      setMessage("Suma introdusă nu este validă.");
      return;
    }

    if (!toAccountId || toAccountId === "") {
      setMessageType("error");
      setMessage("Te rugăm să selectezi un cont destinație.");
      return;
    }

    if (fromAccountId === toAccountId) {
      setMessageType("error");
      setMessage("Nu poți transfera către același cont.");
      return;
    }

    const fromAccount = accounts.find(acc => acc.accountId === fromAccountId);
    if (fromAccount && parsedAmount > fromAccount.balance) {
      setMessageType("error");
      setMessage("Fonduri insuficiente pentru această tranzacție.");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
      return;
    }

    try {
      const response = await fetch(
        "https://localhost:7157/api/Transactions/transfer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromAccountId,
            toAccountId,
            amount: parsedAmount,
            currency: "RON",
            transactionType: "Transfer",
            fromUserName,
            toUserName,
          }),
        }
      );

      if (response.ok) {
        setMessageType("success");
        setMessage("Transfer realizat cu succes!");
        showConfirmationNotification("Transfer realizat cu succes!");
        await fetchAccounts(); // Reîmprospătează conturile
        setShowTransferForm(false);
        setTransferAmount("");
        setTransferCurrency("RON");
        setToAccountId(""); // Reset toAccountId
      } else {
        const errorData = await response.json();
        setMessageType("error");
        setMessage(
          "Eroare la transfer: " + (errorData.message || "necunoscută")
        );
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Eroare: " + error.message);
    }

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const transferBetweenUsers = async () => {
    const parsedAmount = parseFloat(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      setMessageType("error");
      setMessage("Suma introdusă nu este validă.");
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
      setMessageType("error");
      setMessage("Suma trebuie să aibă maximum 2 zecimale.");
      return;
    }

    if (!toUserName || toUserName.trim() === "") {
      setMessageType("error");
      setMessage("Te rugăm să introduci numele utilizatorului destinație.");
      return;
    }

    if (fromUserName === toUserName) {
      setMessageType("error");
      setMessage("Nu poți transfera către același utilizator.");
      return;
    }

    const fromAccount = accounts.find(acc => acc.accountId === fromAccountId);
    if (fromAccount && parsedAmount > fromAccount.balance) {
      setMessageType("error");
      setMessage("Fonduri insuficiente pentru această tranzacție.");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
      return;
    }

    try {
      const response = await fetch(
        "https://localhost:7157/api/Transactions/transfer-between-users",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            FromUserName: fromUserName,
            ToUserName: toUserName,
            Amount: parsedAmount,
            Currency: "RON",
            TransactionType: "Transfer",
          }),
        }
      );

      if (response.ok) {
        setMessageType("success");
        setMessage("Transfer realizat cu succes!");
        showConfirmationNotification("Transfer către utilizator realizat cu succes!");
        await fetchAccounts(); // Reîmprospătează conturile
        setShowTransferForm(false);
        setAmount("");
        setCurrency("RON");
        setToUserName("");
      } else {
        const errorData = await response.json();
        setMessageType("error");
        setMessage("Eroare la transfer: " + (errorData.message || "necunoscută"));
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Eroare: " + error.message);
    }

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  // Functia de creare a contului - actualizată
  const createAccount = async () => {
    if (!selectedAccountType) {
      setCreateAccountMessageType("error");
      setCreateAccountMessage("Te rugăm să selectezi tipul de cont.");
      return;
    }

    try {
      const response = await fetch("https://localhost:7157/api/Accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          accountType: selectedAccountType,
          balance: 0,
          currency: "RON",
        }),
      });

      if (response.ok) {
        const newAccount = await response.json();
        setCreateAccountMessageType("success");
        setCreateAccountMessage(`Contul ${selectedAccountType} a fost creat cu succes!`);
        showConfirmationNotification(`Contul ${selectedAccountType} a fost creat cu succes!`);

        await fetchAccounts(); // Reîmprospătăm conturile imediat

        // Setăm tab-ul activ pe noul cont creat
        setCurrentTab(selectedAccountType);

        // Închidem modalul după un delay scurt pentru a vedea mesajul de succes
        setTimeout(() => {
          setShowCreateAccountModal(false);
          setSelectedAccountType("");
          setCreateAccountMessage("");
          setCreateAccountMessageType("");
        }, 1500);

      } else {
        let errorMessage = "Eroare necunoscută";

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.title || JSON.stringify(errorData); // Am adăugat JSON.stringify pentru obiecte
        } catch {
          try {
            const errorText = await response.text();
            errorMessage = errorText || `Eroare HTTP ${response.status}`;
          } catch {
            errorMessage = `Eroare HTTP ${response.status}`;
          }
        }

        setCreateAccountMessageType("error");
        setCreateAccountMessage(errorMessage);

        setTimeout(() => {
          setCreateAccountMessage("");
          setCreateAccountMessageType("");
        }, 6000);
      }
    } catch (error) {
      setCreateAccountMessageType("error");
      setCreateAccountMessage("Eroare de conectare: " + error.message);

      setTimeout(() => {
        setCreateAccountMessage("");
        setCreateAccountMessageType("");
      }, 6000);
    }
  };


  const formatNumber = (number) => {
    if (number === undefined || number === null || isNaN(number)) {
      return "0";
    }
    const num = typeof number === "string" ? parseFloat(number) : number;
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  const handleDeleteAccount = (account) => {
    // Adaugă verificarea pentru tipurile de cont care nu pot fi șterse
    if (account.accountType === "Personal" || account.accountType === "Cont Curent") {
        setDeleteMessageType("error");
        setDeleteMessage(`Contul ${account.accountType} nu poate fi șters.`);
        // Poți alege să nu deschizi deloc modalul de confirmare, sau să-l deschizi doar cu mesajul de eroare
        // Pentru simplitate, îl deschidem cu mesajul de eroare și nu permitem confirmarea.
        setAccountToDelete(null); // Nu setezi accountToDelete dacă nu se poate șterge
        setShowDeleteConfirm(true);
        setTimeout(() => {
          setDeleteMessage("");
          setDeleteMessageType("");
          setShowDeleteConfirm(false);
        }, 5000); // Mesajul dispare după 5 secunde
        return;
    }

    setAccountToDelete(account);
    setShowDeleteConfirm(true);
    setDeleteMessage("");
    setDeleteMessageType("");
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) {
      console.error("No account selected for deletion");
      return;
    }

    // Verifică din nou dacă nu cumva contul este "Personal" sau "Cont Curent"
    if (accountToDelete.accountType === "Personal" || accountToDelete.accountType === "Cont Curent") {
      setDeleteMessageType("error");
      setDeleteMessage(`Contul ${accountToDelete.accountType} nu poate fi șters.`);
      return; // Nu continua cu ștergerea
    }

    if (accountToDelete.balance > 0) {
      setDeleteMessageType("error");
      setDeleteMessage(
        `Nu poți șterge acest cont deoarece are un sold de ${formatNumber(accountToDelete.balance)} ${accountToDelete.currency}.\n` +
          `Te rugăm să transferi banii în alt cont înainte de a șterge acest cont.`
      );
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7157/api/Accounts/${accountToDelete.accountId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setDeleteMessageType("success");
        setDeleteMessage("Contul a fost șters cu succes.");
        showConfirmationNotification("Contul a fost șters cu succes!");

        setShowDeleteConfirm(false);
        setAccountToDelete(null);
        await fetchAccounts(); // Reîmprospătează conturile după ștergere

      } else {
        const errorText = await response.text();
        setDeleteMessageType("error");
        setDeleteMessage("Eroare la ștergerea contului: " + errorText);
      }
    } catch (error) {
      setDeleteMessageType("error");
      setDeleteMessage("Eroare tehnică: " + error.message);
    }
  };

  // Lista tipurilor de conturi pe care utilizatorul le poate adăuga manual
  const creatableAccountTypes = [
    { name: "Economii", description: "Pentru economisirea banilor și obiective financiare" },
    { name: "Investitii", description: "Pentru investiții și tranzacții pe termen lung" },
    { name: "Călătorii", description: "Pentru fondurile alocate călătoriilor" },
    // Adaugă aici și alte tipuri de conturi pe care vrei să le permiti utilizatorului să le creeze
    // ex: { name: "Mașină", description: "Pentru fondul de mașină" }
  ];

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
          <button onClick={goToProfile}>Vezi Profilul</button>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      {/* Elimină complet create-account-section */}

      <div className="chrome-tabs-container">
        <div className="chrome-tabs-left">
          {accountTypes.map((type) => (
            <button
              key={type}
              onClick={() => setCurrentTab(type)}
              className={`chrome-tab ${
                currentTab === type ? "chrome-tab-active" : ""
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Butonul Creează cont în dreapta */}
        <button
          className="create-account-button"
          onClick={() => setShowCreateAccountModal(true)}
        >
          Creează cont
        </button>
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
                  {formatNumber(acc.balance)} {acc.currency}
                </p>
              </div>

              <div className="account-actions-container">
                <div className="account-actions-left">
                  <button
                    className="action-button transfer-button"
                    onClick={() => {
                      setFromAccountId(acc.accountId);
                      setShowTransferForm(true);
                      setTransferType("funds");
                    }}
                  >
                    Mutare fonduri
                  </button>

                  {/* Transfer către alt utilizator - doar pentru contul Personal */}
                  {acc.accountType === "Personal" && (
                    <button
                      className="action-button transfer-button"
                      onClick={() => {
                        setFromAccountId(acc.accountId);
                        setShowTransferForm(true);
                        setTransferType("user");
                      }}
                    >
                      Transfer către alt utilizator
                    </button>
                  )}

                  {/* Butonul Șterge cont - NU este afișat pentru "Personal" sau "Cont Curent" */}
                  {acc.accountType !== "Cont Curent" && acc.accountType !== "Personal" && (
                    <button
                      className="action-button delete-button delete-button-red"
                      onClick={() => handleDeleteAccount(acc)}
                    >
                      Șterge cont
                    </button>
                  )}
                </div>

                <div className="account-actions-right">
                  <button
                    className="action-button history-button"
                    onClick={() => {
                      navigate("/istoric-tranzactii", {
                        state: { account: acc },
                        replace: false,
                      });
                    }}
                  >
                    Istoric Tranzacții
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Mesaj dacă nu există conturi pentru tab-ul selectat sau deloc */}
          {accounts.length === 0 && currentTab === null && (
            <div className="no-accounts-message">
                Nu ai încă niciun cont. Apasă "Creează cont" pentru a adăuga unul!
            </div>
          )}
          {accounts.length > 0 && currentTab !== null && !accounts.some(acc => acc.accountType === currentTab) && (
            <div className="no-accounts-message">
                Contul curent nu mai există. Te rugăm să selectezi un alt cont.
            </div>
          )}
      </div>

{showCreateAccountModal && (
  <div className="create-account-modal">
    <h3 className="create-account-modal-title">Creează cont nou</h3>

    {(() => {
      const allAccountTypes = [
        {
          type: "Personal",
          title: "Cont Personal",
          description: "Cont principal pentru cheltuieli personale",
        },
        {
          type: "Economii",
          title: "Economii",
          description: "Pentru economisirea banilor și obiective financiare",
        },
        {
          type: "Investitii",
          title: "Investiții",
          description: "Pentru investiții și tranzacții pe termen lung",
        },
        {
          type: "Calatorii",
          title: "Călătorii",
          description: "Economisește pentru vacanțe, escapade de weekend și aventuri în jurul lumii"
        },
      ];

      const createdAccountTypes = (userAccounts || []).map(acc => acc.accountType);

      const availableToCreate = allAccountTypes.filter(
        acc => !createdAccountTypes.includes(acc.type)
      );

      return (
        <>
          {availableToCreate.map(acc => (
            <button
              key={acc.type}
              className={`account-type-option ${selectedAccountType === acc.type ? "selected" : ""}`}
              onClick={() => setSelectedAccountType(acc.type)}
            >
              <div className="account-type-text">
                <strong>{acc.title}</strong>
                <p>{acc.description}</p>
              </div>
            </button>
          ))}

          {availableToCreate.length === 0 && (
            <p className="no-more-accounts">
              Ai deja toate tipurile de conturi permise.
            </p>
          )}
        </>
      );
    })()}

    {createAccountMessage && (
      <div className={`message-box ${createAccountMessageType}-message`}>
        {createAccountMessage}
      </div>
    )}

    <div className="modal-actions">
      <button
        className="cancel-button"
        onClick={() => {
          setShowCreateAccountModal(false);
          setSelectedAccountType("");
          setCreateAccountMessage("");
          setCreateAccountMessageType("");
        }}
      >
        Anulează
      </button>
      <button
        className="submit-button"
        onClick={createAccount}
        disabled={!selectedAccountType}
      >
        Creează cont
      </button>
    </div>
  </div>
)}



      {/* Transfer Forms (remains unchanged) */}
      {showTransferForm && (
        <div className="transfer-modal">
          <h3 className="transfer-modal-title">
            {transferType === "funds"
              ? "Transfer între conturi"
              : "Transfer către alt utilizator"}
          </h3>

          {transferType === "funds" ? (
            <>
              <div className="form-group">
                <label className="form-label">Din cont:</label>
                <select
                  className="form-control"
                  value={fromAccountId}
                  disabled={true}
                >
                  {accounts
                    .filter((acc) => acc.accountId === fromAccountId)
                    .map((acc) => (
                      <option key={acc.accountId} value={acc.accountId}>
                        {acc.accountType} ({acc.balance} {acc.currency})
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">În cont:</label>
                <select
                  className="form-control"
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                >
                  <option value="" disabled>Selectează contul destinație</option>
                  {accounts
                    .filter((acc) => acc.accountId !== fromAccountId)
                    .map((acc) => (
                      <option key={acc.accountId} value={acc.accountId}>
                        {acc.accountType} ({acc.balance} {acc.currency})
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Sumă:</label>
                <input
                  type="number"
                  className="form-control"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Monedă:</label>
                <input
                  type="text"
                  className="form-control"
                  value="RON"
                  readOnly
                />
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowTransferForm(false)}
                >
                  Anulare
                </button>
                <button className="submit-button" onClick={transferFunds}>
                  Transfer
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">De la utilizator:</label>
                <input
                  type="text"
                  className="form-control"
                  value={fromUserName}
                  disabled={true}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Către utilizator:</label>
                <input
                  type="text"
                  className="form-control"
                  value={toUserName}
                  onChange={(e) => setToUserName(e.target.value)}
                  placeholder="Nume utilizator destinație"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sumă:</label>
                <input
                  type="number"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Monedă:</label>
                <input
                  type="text"
                  className="form-control"
                  value="RON"
                  readOnly
                />
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowTransferForm(false)}
                >
                  Anulare
                </button>
                <button
                  className="submit-button"
                  onClick={transferBetweenUsers}
                >
                  Transfer
                </button>
              </div>
            </>
          )}

          {message && (
            <div
              className={`message-box ${
                messageType === "success"
                  ? "success-message"
                  : messageType === "error"
                  ? "error-message"
                  : "info-message"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmare pentru ștergerea contului */}
      {showDeleteConfirm && (
        <div className="delete-modal">
          <h3 className="delete-modal-title">Confirmare ștergere cont</h3>

          <div className="delete-modal-content">
            {accountToDelete ? ( // Afișează detaliile contului doar dacă accountToDelete este setat
                <p>
                    Sigur dorești să ștergi contul {accountToDelete.accountType} (
                    {accountToDelete.currency})?
                </p>
            ) : (
                <p>Acest cont nu poate fi șters.</p> // Mesaj general dacă accountToDelete e null (e.g., pentru "Personal")
            )}

            {deleteMessage && (
              <div className={`message-box ${deleteMessageType}-message`}>
                {deleteMessage}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button
              className="cancel-button"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteMessage(""); // Resetează mesajul la închidere
                setDeleteMessageType("");
              }}
            >
              Anulează
            </button>
            {/* Butonul de ștergere este afișat doar dacă accountToDelete este setat și nu este un cont non-ștergibil */}
            {accountToDelete && accountToDelete.accountType !== "Personal" && accountToDelete.accountType !== "Cont Curent" && (
                <button
                    className="delete-confirm-button"
                    onClick={confirmDeleteAccount}
                >
                    Șterge
                </button>
            )}
          </div>
        </div>
      )}

      {showNotification && (
        <div className="notification success-notification">
          <div className="notification-content">
            <span className="notification-icon">✓</span>
            {notificationMessage}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;