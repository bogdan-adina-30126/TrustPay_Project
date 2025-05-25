import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TransactionHistoryPage.css";
import logo from "./logo1.png";

function TransactionHistoryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { account } = location.state || {};
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account || !account.accountId) {
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          `https://localhost:7157/api/Transactions/history/${account.accountId}`
        );
        if (!response.ok) throw new Error("Eroare la preluare");

        const data = await response.json();
        setTransactions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [account]);

  // Extracts and formats only the date part from a timestamp string
  const extractAndFormatDate = (dateString) => {
    if (!dateString) return "";

    try {
      // Extract date from format like "(20.05.2025, 14:48)"
      const match = dateString.match(/\((\d{2}\.\d{2}\.\d{4})/);
      if (match && match[1]) {
        return match[1]; // Return just the date part
      }

      // If no match in the expected format, try to parse as a date
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("ro-RO", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }

      return "";
    } catch (error) {
      console.error("Date parsing error:", error);
      return "";
    }
  };

  const formatNumber = (number) => {
    // Handle undefined, null, or non-numeric values
    if (number === undefined || number === null || isNaN(number)) {
      return "0";
    }

    // Convert to number if it's a string
    const num = typeof number === "string" ? parseFloat(number) : number;

    // Check if it's an integer
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  // Extract date and transaction description from message
  const parseTransactionMessage = (message) => {
    if (!message) return { description: "", date: "" };

    // Look for date pattern in format (DD.MM.YYYY, HH:MM)
    const dateMatch = message.match(
      /\((\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}(?::\d{2})?)\)$/
    );

    if (dateMatch) {
      // Extract the date from the match
      const dateStr = dateMatch[1].split(",")[0]; // Just get DD.MM.YYYY part

      // Remove the date part from the message
      const description = message.replace(
        /\s*\(\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}(?::\d{2})?\)$/,
        ""
      );

      return { description, date: dateStr };
    }

    return { description: message, date: "" };
  };

  if (!account) {
    return (
      <div className="page-container">
        <header className="header">
          <div className="header-left logo-container">
            <img src={logo} alt="TrustPay Logo" className="header-logo" />
            <span className="logo-text">
              Trust Pay - Siguranța banilor tăi!
            </span>
          </div>
        </header>
        <h2>Cont inexistent sau nespecificat</h2>
        <p>
          Vă rugăm să selectați un cont din dashboard pentru a vedea istoricul
          tranzacțiilor.
        </p>
        <button className="back-button" onClick={() => navigate("/")}>
          ⬅ Înapoi 
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="header">
        <div className="header-left logo-container">
          <img src={logo} alt="TrustPay Logo" className="header-logo" />
          <span className="logo-text">Trust Pay - Siguranța banilor tăi!</span>
        </div>
      </header>

      <h2>Istoric Tranzacții - {account.accountType}</h2>
      <p>
        Sold curent: {formatNumber(account.balance)} {account.currency}
      </p>
      <button className="back-button" onClick={() => navigate("/")}>
        ⬅ Înapoi
      </button>

      {loading ? (
        <p>Se încarcă...</p>
      ) : transactions.length > 0 ? (
        <ul className="transaction-list">
          {transactions.map((t, index) => {
            // Parse the message to extract date and clean description
            const { description, date } = parseTransactionMessage(t.message);

            // Use the extracted date or fall back to a parsable date from t.date
            const displayDate = date || extractAndFormatDate(t.date);

            return (
              <li key={index} className="transaction-item">
                <div className="transaction-header">
                  {displayDate && (
                    <strong className="transaction-date">{displayDate}</strong>
                  )}
                  <span className="transaction-description">{description}</span>
                </div>

                {t.amount > 0 && (
                  <div className="transaction-amount">
                    <span
                      className={
                        t.isIncoming
                          ? "incoming-transaction"
                          : "outgoing-transaction"
                      }
                    >
                      {t.isIncoming ? "+" : "-"}
                      {formatNumber(t.amount)} {t.currency}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>Nu există tranzacții pentru acest cont.</p>
      )}
    </div>
  );
}

export default TransactionHistoryPage;
