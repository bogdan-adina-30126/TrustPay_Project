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

        // GET: api/Accounts/user/5
        // Returnează conturile unui utilizator
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Account>>> GetUserAccounts(int userId)
        {
            var accounts = await _context.Accounts.Where(a => a.UserId == userId).ToListAsync();

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
                .Where(a => a.UserId == userId)
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
            // Verificăm dacă utilizatorul există
            if (account.UserId == null)
            {
                return BadRequest("UserId este obligatoriu.");
            }

            var user = await _context.Users.FindAsync(account.UserId);
            if (user == null)
            {
                return NotFound("Utilizatorul nu a fost găsit.");
            }

            // Setăm câmpurile suplimentare (dacă nu sunt deja setate)
            account.CreatedAt = DateTime.UtcNow;

            // Adăugăm contul în baza de date
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAccount", new { id = account.AccountId }, account);
        }

        // DELETE: api/Accounts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccount(int id)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account == null)
            {
                return NotFound();
            }

            _context.Accounts.Remove(account);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AccountExists(int id)
        {
            return _context.Accounts.Any(e => e.AccountId == id);
        }
    }
}