using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrustPay.Data; // Asigură-te că namespace-ul pentru context este corect
using TrustPay.Models;

namespace TrustPay.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly DbTrustPayContext _context; // Ai folosit DbTrustPayContext, păstrez denumirea

        public AccountsController(DbTrustPayContext context)
        {
            _context = context;
        }

        // ... (Metodele GET rămân neschimbate) ...

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
        // Returnează conturile unui utilizator (folosit de frontend probabil)
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

        [HttpGet("by-user/{userId}")] // Acest endpoint pare a fi duplicat cu GetUserAccounts. Poți alege unul singur.
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
        // Adaugă un cont nou pentru un utilizator
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

            // Aici definim tipurile de conturi pe care utilizatorul le poate crea manual prin API.
            // Contul "Personal" este exclus din această listă deoarece este implicit și nu poate fi creat manual.
            var creatableAccountTypes = new[] { "Economii", "Investitii", "Călătorii" }; // ADĂUGAT "Călătorii"

            if (!creatableAccountTypes.Contains(account.AccountType))
            {
                // Mesaj specific dacă încearcă să creeze "Personal" sau un tip invalid
                if (account.AccountType == "Personal")
                {
                    return BadRequest(new { message = "Contul Personal nu poate fi creat manual. Acesta este generat automat." });
                }
                return BadRequest(new { message = "Tipul de cont nu este valid sau nu poate fi creat manual." });
            }

            // Verifică dacă utilizatorul are deja un cont de ACELAȘI TIP.
            // Această verificare se aplică tuturor tipurilor de cont din 'creatableAccountTypes'.
            // Ex: Nu poți avea două conturi "Economii".
            bool hasDuplicateType = await _context.Accounts
     .AnyAsync(a => a.UserId == account.UserId && a.AccountType == account.AccountType && a.IsActive == true);

            if (hasDuplicateType)
            {
                return BadRequest(new { message = $"Ai deja un cont de tip {account.AccountType}. Nu poți crea conturi duplicate de același tip." });
            }

            // ATENȚIE: Aici am eliminat blocul de cod care verifica limita de "3 conturi active".
            // Acum, logica permite crearea de noi conturi atâta timp cât tipul este unic
            // și se află în lista 'creatableAccountTypes'.

            try
            {
                // Setări implicite pentru noul cont
                account.CreatedAt = DateTime.UtcNow;
                account.IsActive = true; // Contul este activ la creare
                account.Balance = 0; // Balanța inițială este 0
                account.Currency = "RON"; // Moneda este RON

                _context.Accounts.Add(account);
                await _context.SaveChangesAsync();

                // Returnează contul creat cu succes
                return CreatedAtAction("GetAccount", new { id = account.AccountId }, account);
            }
            catch (Exception ex)
            {
                // Logare detaliată pentru depanare în caz de eroare 500
                return StatusCode(500, new
                {
                    message = "Eroare la salvarea contului în baza de date: " + ex.Message,
                    innerException = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        // DELETE: api/Accounts/5
        // Metoda pentru ștergerea (dezactivarea) unui cont
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

            // Marcare ca inactiv
            account.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent(); // Răspuns de succes, fără conținut
        }

        private bool AccountExists(int id)
        {
            return _context.Accounts.Any(e => e.AccountId == id);
        }
    }
}