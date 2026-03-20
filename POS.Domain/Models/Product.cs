using System.ComponentModel.DataAnnotations;

namespace POS.Domain.Models;

/// <summary>
/// Represents a product shown in the catalog grid.
/// All monetary values are stored in cents to avoid floating-point errors.
/// </summary>
public partial class Product
{
    public int Id { get; set; }

    public int CategoryId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = null!;

    /// <summary>
    /// Base price in cents (e.g. 8500 = $85.00 MXN).
    /// </summary>
    public int PriceCents { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsAvailable { get; set; }

    public bool IsPopular { get; set; }

    public virtual Category? Category { get; set; }

    public virtual ICollection<ProductSize>? Sizes { get; set; }

    public virtual ICollection<ProductExtra>? Extras { get; set; }
}
