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
    public class UsersController : ControllerBase
    {
        private readonly DbTrustPayContext _context;

        public UsersController(DbTrustPayContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult<User>> Login([FromBody] User loginData)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserName == loginData.UserName && u.Password == loginData.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            return Ok(new
            {
                user.UserId,
                user.UserName,
                user.Email,
                Message = "Login successful"
            });
        }
        [HttpGet("user/{userId}/accounts")]
        public async Task<IActionResult> GetUserAccounts(int userId)
        {
            var accounts = await _context.Accounts
                .Where(a => a.UserId == userId)
                .ToListAsync();

            return Ok(accounts);
        }


        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // PUT: api/Users/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, User user)
        {
            if (id != user.UserId)
            {
                return BadRequest();
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
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

        // POST: api/Users
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUser", new { id = user.UserId }, user);
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.UserId == id);
        }


        [HttpGet("user/by-name/{username}")]
        public async Task<IActionResult> GetUserByName(string username)
        {
            var user = await _context.Users
                .Include(u => u.Accounts)
                .FirstOrDefaultAsync(u => u.UserName == username);

            if (user == null)
                return NotFound(new { message = "Utilizatorul nu a fost găsit." });

            var personalAccount = user.Accounts.FirstOrDefault(a => a.AccountType == "Personal");

            if (personalAccount == null)
                return NotFound(new { message = "Utilizatorul nu are un cont principal." });

            return Ok(new
            {
                userId = user.UserId,
                userName = user.UserName,
                accountId = personalAccount.AccountId,
                accountType = personalAccount.AccountType,
                currency = personalAccount.Currency
            });
        }

    }

}