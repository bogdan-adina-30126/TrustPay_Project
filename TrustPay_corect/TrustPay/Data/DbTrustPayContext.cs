using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using TrustPay.Models;

namespace TrustPay.Data
{
    public partial class DbTrustPayContext : DbContext
    {
        private readonly IConfiguration _configuration;

        public DbTrustPayContext(DbContextOptions<DbTrustPayContext> options, IConfiguration configuration)
               : base(options)
        {
            _configuration = configuration;
        }
        public virtual DbSet<Account> Accounts { get; set; }

        public virtual DbSet<Transaction> Transactions { get; set; }

        public virtual DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Account>(entity =>
            {
                entity.HasKey(e => e.AccountId).HasName("PK__Accounts__349DA5862AFCF176");

                entity.Property(e => e.AccountId).HasColumnName("AccountID");
                entity.Property(e => e.AccountType)
                    .HasMaxLength(40)
                    .IsUnicode(false);
                entity.Property(e => e.Balance).HasColumnType("money");
                entity.Property(e => e.CreatedAt).HasColumnType("datetime");
                entity.Property(e => e.Currency)
                    .HasMaxLength(15)
                    .IsUnicode(false);
                entity.Property(e => e.UserId).HasColumnName("UserID");

                entity.HasOne(d => d.User).WithMany(p => p.Accounts)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__Accounts__UserID__3A81B327");
            });

            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.HasKey(e => e.TransactionId).HasName("PK__Transact__55433A4BAD92DC03");

                entity.Property(e => e.TransactionId).HasColumnName("TransactionID");
                entity.Property(e => e.Amount).HasColumnType("money");
                entity.Property(e => e.Currency)
                    .HasMaxLength(15)
                    .IsUnicode(false);
                entity.Property(e => e.FromAccountId).HasColumnName("FromAccountID");
                entity.Property(e => e.ToAccountId).HasColumnName("ToAccountID");
                entity.Property(e => e.TransactionDate).HasColumnType("datetime");
                entity.Property(e => e.TransactionType)
                    .HasMaxLength(30)
                    .IsUnicode(false);

                entity.HasOne(d => d.FromAccount).WithMany(p => p.TransactionFromAccounts)
                    .HasForeignKey(d => d.FromAccountId)
                    .HasConstraintName("FK__Transacti__FromA__3D5E1FD2");

                entity.HasOne(d => d.ToAccount).WithMany(p => p.TransactionToAccounts)
                    .HasForeignKey(d => d.ToAccountId)
                    .HasConstraintName("FK__Transacti__ToAcc__3E52440B");
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCAC2C6FA15E");

                entity.HasIndex(e => e.UserName, "UQ__Users__C9F28456A2ADCB3A").IsUnique();

                entity.Property(e => e.UserId).HasColumnName("UserID");
                entity.Property(e => e.CreatedAt).HasColumnType("datetime");
                entity.Property(e => e.Email)
                    .HasMaxLength(60)
                    .IsUnicode(false);
                entity.Property(e => e.Password)
                    .HasMaxLength(40)
                    .IsUnicode(false);
                entity.Property(e => e.UserName).HasMaxLength(40);
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
        public async Task InsertUser(string userName, string password, string email, DateTime createAt)
        {
            await Database.ExecuteSqlRawAsync(
                "EXEC InsertUser @UserName = {0}, @Password = {1},@Email={2},@CreatedAt={3}",

                userName,
                password,
                email,
                createAt);
        }

    }
}
