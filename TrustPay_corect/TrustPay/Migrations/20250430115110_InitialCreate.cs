using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TrustPay.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserName = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Password = table.Column<string>(type: "varchar(40)", unicode: false, maxLength: 40, nullable: false),
                    Email = table.Column<string>(type: "varchar(60)", unicode: false, maxLength: 60, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Users__1788CCAC2C6FA15E", x => x.UserID);
                });

            migrationBuilder.CreateTable(
                name: "Accounts",
                columns: table => new
                {
                    AccountID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: true),
                    Balance = table.Column<decimal>(type: "money", nullable: false),
                    Currency = table.Column<string>(type: "varchar(15)", unicode: false, maxLength: 15, nullable: false),
                    AccountType = table.Column<string>(type: "varchar(40)", unicode: false, maxLength: 40, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Accounts__349DA5862AFCF176", x => x.AccountID);
                    table.ForeignKey(
                        name: "FK__Accounts__UserID__3A81B327",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    TransactionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FromAccountID = table.Column<int>(type: "int", nullable: true),
                    ToAccountID = table.Column<int>(type: "int", nullable: true),
                    Amount = table.Column<decimal>(type: "money", nullable: false),
                    Currency = table.Column<string>(type: "varchar(15)", unicode: false, maxLength: 15, nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    TransactionType = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Transact__55433A4BAD92DC03", x => x.TransactionID);
                    table.ForeignKey(
                        name: "FK__Transacti__FromA__3D5E1FD2",
                        column: x => x.FromAccountID,
                        principalTable: "Accounts",
                        principalColumn: "AccountID");
                    table.ForeignKey(
                        name: "FK__Transacti__ToAcc__3E52440B",
                        column: x => x.ToAccountID,
                        principalTable: "Accounts",
                        principalColumn: "AccountID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_UserID",
                table: "Accounts",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_FromAccountID",
                table: "Transactions",
                column: "FromAccountID");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_ToAccountID",
                table: "Transactions",
                column: "ToAccountID");

            migrationBuilder.CreateIndex(
                name: "UQ__Users__C9F28456A2ADCB3A",
                table: "Users",
                column: "UserName",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "Accounts");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
