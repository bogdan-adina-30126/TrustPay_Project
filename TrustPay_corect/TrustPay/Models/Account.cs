using System.Transactions;

namespace TrustPay.Models
{
    public partial class Account
    {
        public int AccountId { get; set; }

        public int? UserId { get; set; }

        public decimal Balance { get; set; }

        public string Currency { get; set; } = null!;

        public string AccountType { get; set; } = null!;

        public DateTime CreatedAt { get; set; }

        public virtual ICollection<Transaction> TransactionFromAccounts { get; set; } = new List<Transaction>();

        public virtual ICollection<Transaction> TransactionToAccounts { get; set; } = new List<Transaction>();

        public virtual User? User { get; set; }
    }

}
