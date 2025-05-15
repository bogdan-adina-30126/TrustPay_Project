namespace TrustPay.Models
{
    public partial class Transaction
    {
        public int TransactionId { get; set; }

        public int? FromAccountId { get; set; }

        public int? ToAccountId { get; set; }

        public decimal Amount { get; set; }

        public string Currency { get; set; } = null!;

        public DateTime TransactionDate { get; set; }

        public string TransactionType { get; set; } = null!;

        public virtual Account? FromAccount { get; set; }

        public virtual Account? ToAccount { get; set; }
    }
}
