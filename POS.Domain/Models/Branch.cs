using System.ComponentModel.DataAnnotations;

namespace POS.Domain.Models;

/// <summary>
/// Represents a physical branch/location within a business.
/// </summary>
public partial class Branch
{
    public int Id { get; set; }

    public int BusinessId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string LocationName { get; set; } = null!;

    [MaxLength(256)]
    public string? PinHash { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Business? Business { get; set; }

    public virtual ICollection<Category>? Categories { get; set; }

    public virtual ICollection<Order>? Orders { get; set; }
}
