using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrustPay.Data;
using TrustPay.Models;

namespace TrustPay.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly DbTrustPayContext _context;

        public AccountsController(DbTrustPayContext context)
        {
            _context = context;
        }

        // GET: api/Accounts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Account>>> GetAccounts()
        {
            return await _context.Accounts.ToListAsync();
        }

        // GET: api/Accounts/5 - ADĂUGAT pentru CreatedAtAction
        [HttpGet("{id}")]
        public async Task<ActionResult<Account>> GetAccount(int id)
        {
            var account = await _context.Accounts.FindAsync(id);

            if (account == null)
            {
                return NotFound();
            }

            return account;
        }

        // GET: api/Accounts/user/5
        // Returnează conturile unui utilizator
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Account>>> GetUserAccounts(int userId)
        {
            var accounts = await _context.Accounts.Where(a => a.UserId == userId && a.IsActive).ToListAsync();

            if (accounts == null || !accounts.Any())
            {
                return NotFound("Nu există conturi pentru acest utilizator.");
            }

            return accounts;
        }

        [HttpGet("by-user/{userId}")]
        public async Task<ActionResult<IEnumerable<Account>>> GetAccountsByUser(int userId)
        {
            var accounts = await _context.Accounts
               .Where(a => a.UserId == userId && a.IsActive)
                .ToListAsync();

            if (!accounts.Any())
                return NotFound("No accounts found for this user.");

            return Ok(accounts);
        }

        // POST: api/Accounts
        // Adaugă un cont pentru un utilizator
        [HttpPost]
        public async Task<ActionResult<Account>> PostAccount([FromBody] Account account)
        {
            if (account.UserId == null)
            {
                return BadRequest(new { message = "UserId este obligatoriu." });
            }

            var user = await _context.Users.FindAsync(account.UserId);
            if (user == null)
            {
                return NotFound(new { message = "Utilizatorul nu a fost găsit." });
            }

            // 1. Verifică dacă utilizatorul are deja 3 conturi active
            var activeAccounts = await _context.Accounts
                .Where(a => a.UserId == account.UserId && a.IsActive)
                .ToListAsync();

            if (activeAccounts.Count >= 3)
            {
                return BadRequest(new { message = "Ai deja numărul maxim de conturi permis (3 conturi active)." });
            }

            // 2. Verifică dacă un cont de același tip a fost creat deja (indiferent dacă e activ sau nu)
            var existingSameType = await _context.Accounts
                .FirstOrDefaultAsync(a => a.UserId == account.UserId && a.AccountType == account.AccountType);

            if (existingSameType != null && existingSameType.IsActive)
            {
                return BadRequest(new { message = $"Ai deja un cont activ de tip {account.AccountType}." });
            }

            if (existingSameType != null && !existingSameType.IsActive)
            {
                // Resuscităm contul dezactivat
                existingSameType.IsActive = true;
                existingSameType.Balance = 0; // resetăm balanța dacă vrei
                existingSameType.CreatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Contul de tip {account.AccountType} a fost reactivat." });
            }

            // 3. Validăm tipul contului
            var validAccountTypes = new[] { "Personal", "Cont Curent", "Economii", "Investitii" };
            if (!validAccountTypes.Contains(account.AccountType))
            {
                return BadRequest(new { message = "Tipul de cont nu este valid." });
            }

            // 4. Opțional: restricționăm crearea anumitor tipuri
            if (account.AccountType == "Personal" || account.AccountType == "Cont Curent")
            {
                return BadRequest(new { message = $"Contul {account.AccountType} ar trebui să existe deja implicit." });
            }

            try
            {
                account.CreatedAt = DateTime.UtcNow;
                account.IsActive = true;
                account.Balance = 0;
                account.Currency = "RON";

                _context.Accounts.Add(account);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetAccount", new { id = account.AccountId }, account);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Eroare la salvarea contului: " + ex.Message });
            }
        }

        // DELETE: api/Accounts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccount(int id)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account == null)
            {
                return NotFound(new { message = "Contul nu a fost găsit." });
            }

            // PREVINE ȘTERGEREA CONTULUI "PERSONAL"
            if (account.AccountType == "Personal")
            {
                return BadRequest(new { message = "Contul Personal nu poate fi șters." });
            }

            account.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AccountExists(int id)
        {
            return _context.Accounts.Any(e => e.AccountId == id);
        }
    }
}