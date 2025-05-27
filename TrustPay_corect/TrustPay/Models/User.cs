namespace TrustPay.Models
{
    public partial class User
    {
        public int UserId { get; set; }

        public string UserName { get; set; } = null!;

        public string Password { get; set; } = null!;

        public string Email { get; set; } = null!;

        public DateTime CreatedAt { get; set; }

        public string CNP { get; set; }
        public string? Adresa { get; set; }
        public string? Telefon { get; set; }
        public string IBAN { get; set; }

        public virtual ICollection<Account> Accounts { get; set; } = new List<Account>();
    }

}
