using System.ComponentModel.DataAnnotations;

namespace POS.Domain.Models;

/// <summary>
/// Represents a user (owner or cashier) belonging to a business.
/// </summary>
public partial class User
{
    public int Id { get; set; }

    public int BusinessId { get; set; }

    [Required]
    [MaxLength(256)]
    public string Email { get; set; } = null!;

    [Required]
    [MaxLength(512)]
    public string PasswordHash { get; set; } = null!;

    /// <summary>
    /// User role stored as string: 'owner' or 'cashier'.
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string Role { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Business? Business { get; set; }

    public virtual ICollection<Order>? Orders { get; set; }
}
