using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrustPay.Data;
using TrustPay.DTO;
using TrustPay.Models;

namespace TrustPay.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly DbTrustPayContext _context;

        public TransactionsController(DbTrustPayContext context)
        {
            _context = context;
        }

        // GET: api/Transactions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
        {
            return await _context.Transactions.ToListAsync();
        }

        // GET: api/Transactions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Transaction>> GetTransaction(int id)
        {
            var transaction = await _context.Transactions.FindAsync(id);

            if (transaction == null)
            {
                return NotFound();
            }

            return transaction;
        }

        [HttpPost("addFunds", Name = "AddFundsToAccount")]
        public async Task<IActionResult> AddFunds([FromBody] Transaction transaction)
        {
            try
            {
                var fromAccount = await _context.Accounts.FindAsync(transaction.FromAccountId);
                var toAccount = await _context.Accounts.FindAsync(transaction.ToAccountId);

                if (fromAccount == null || toAccount == null)
                    return BadRequest("Account not found.");

                toAccount.Balance += transaction.Amount;

                transaction.TransactionDate = DateTime.UtcNow;
                transaction.TransactionType = "Deposit";

                _context.Transactions.Add(transaction);
                await _context.SaveChangesAsync();

                return Ok("Funds added successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error adding funds: {ex.Message}");
            }
        }

        [HttpPost("transfer", Name = "TransferFunds")]
        public async Task<IActionResult> TransferFunds([FromBody] TransferRequest request)
        {
            var fromAccount = await _context.Accounts.FindAsync(request.FromAccountId);
            var toAccount = await _context.Accounts.FindAsync(request.ToAccountId);

            if (fromAccount == null || toAccount == null)
                return NotFound("Unul sau ambele conturi nu au fost găsite.");

            if (request.Currency != fromAccount.Currency || request.Currency != toAccount.Currency)
                return BadRequest("Valuta trebuie să fie aceeași pentru ambele conturi.");

            if (fromAccount.Balance < request.Amount)
                return BadRequest("Fonduri insuficiente în contul sursă.");


            fromAccount.Balance -= request.Amount;
            toAccount.Balance += request.Amount;

            var transaction = new Transaction
            {
                FromAccountId = request.FromAccountId,
                ToAccountId = request.ToAccountId,
                Amount = request.Amount,
                Currency = request.Currency,
                TransactionDate = DateTime.UtcNow,
                TransactionType = "Transfer"
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Transfer realizat cu succes." });
        }





        // PUT: api/Transactions/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTransaction(int id, Transaction transaction)
        {
            if (id != transaction.TransactionId)
            {
                return BadRequest();
            }

            _context.Entry(transaction).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TransactionExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Transactions
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Transaction>> PostTransaction(Transaction transaction)
        {
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTransaction", new { id = transaction.TransactionId }, transaction);
        }

        // DELETE: api/Transactions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction == null)
            {
                return NotFound();
            }

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TransactionExists(int id)
        {
            return _context.Transactions.Any(e => e.TransactionId == id);
        }


        [HttpGet("history/{accountId}")]
        public async Task<IActionResult> GetTransactionHistoryByAccount(int accountId)
        {
            var transactions = await _context.Transactions
                .Include(t => t.FromAccount)
                    .ThenInclude(a => a.User)
                .Include(t => t.ToAccount)
                    .ThenInclude(a => a.User)
                .Where(t => t.FromAccountId == accountId || t.ToAccountId == accountId)
                .OrderByDescending(t => t.TransactionDate)
                .Select(t => new
                {
                    Message = t.FromAccountId == accountId
                       ? $"🡒 Către contul {t.ToAccount.User.UserName} ({t.ToAccount.AccountType}) din {t.FromAccount.AccountType} — {t.Amount:F2} {t.Currency} ({t.TransactionDate:dd.MM.yyyy, HH:mm})"
                       : $"🡐 De la contul {t.FromAccount.User.UserName} ({t.FromAccount.AccountType}) în {t.ToAccount.AccountType} — {t.Amount:F2} {t.Currency} ({t.TransactionDate:dd.MM.yyyy, HH:mm})"
                })
                .ToListAsync();

            return Ok(transactions);
        }


        [HttpPost("transfer-between-users")]
        public async Task<IActionResult> TransferBetweenUsers([FromBody] TransferRequest transferRequest)
        {
            var fromUser = await _context.Users
                .Include(u => u.Accounts) 
                .FirstOrDefaultAsync(u => u.UserName == transferRequest.FromUserName);

            if (fromUser == null)
            {
                return NotFound(new { message = "Utilizatorul sursă nu a fost găsit." });
            }

            var toUser = await _context.Users
                .Include(u => u.Accounts) 
                .FirstOrDefaultAsync(u => u.UserName == transferRequest.ToUserName);

            if (toUser == null)
            {
                return NotFound(new { message = "Utilizatorul destinație nu a fost găsit." });
            }

            var fromAccount = fromUser.Accounts.FirstOrDefault(a => a.AccountType == "Personal");
            if (fromAccount == null)
            {
                return NotFound(new { message = "Contul principal al utilizatorului sursă nu a fost găsit." });
            }

   
            var toAccount = toUser.Accounts.FirstOrDefault(a => a.AccountType == "Personal");
            if (toAccount == null)
            {
                return NotFound(new { message = "Contul principal al utilizatorului destinație nu a fost găsit." });
            }

            
            if (fromAccount.Balance < transferRequest.Amount)
            {
                return BadRequest(new { message = "Fonduri insuficiente." });
            }

            if (decimal.Round(transferRequest.Amount, 2) != transferRequest.Amount)
            {
                return BadRequest(new { message = "Suma trebuie să aibă maximum 2 zecimale." });
            }
          
            fromAccount.Balance -= transferRequest.Amount;
            toAccount.Balance += transferRequest.Amount;


            var transaction = new Transaction
            {
                FromAccountId = fromAccount.AccountId,
                ToAccountId = toAccount.AccountId,
                Amount = transferRequest.Amount,
                Currency = transferRequest.Currency,
                TransactionType = transferRequest.TransactionType, 
                TransactionDate = DateTime.UtcNow
            };

            _context.Transactions.Add(transaction);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Transfer realizat cu succes!" });
        }

    }
}