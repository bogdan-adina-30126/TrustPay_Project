// TrustPay.DTO/UserUpdateDto.cs
using System.ComponentModel.DataAnnotations;

namespace TrustPay.DTO
{
    public class UserUpdateDto
    {
        [Required(ErrorMessage = "Numele de utilizator este obligatoriu.")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Numele de utilizator trebuie să aibă între 3 și 50 de caractere.")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Adresa de email este obligatorie.")]
        [EmailAddress(ErrorMessage = "Adresa de email nu este validă.")]
        [StringLength(100, ErrorMessage = "Emailul este prea lung.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Numărul de telefon este obligatoriu.")]
        [RegularExpression(@"^\+?[0-9]{7,15}$", ErrorMessage = "Numărul de telefon nu este valid. Ex: +407xxxxxxxx")]
        [StringLength(15, ErrorMessage = "Numărul de telefon este prea lung.")]
        public string Telefon { get; set; }

        [Required(ErrorMessage = "Adresa este obligatorie.")]
        [StringLength(200, ErrorMessage = "Adresa este prea lungă.")]
        public string Adresa { get; set; }

        // Nu includem CNP, IBAN, UserId în DTO-ul de update dacă nu sunt editabile
        // UserId este preluat din ruta PUT
    }
}