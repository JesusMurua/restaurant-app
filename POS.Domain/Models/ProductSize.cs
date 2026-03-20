using System.ComponentModel.DataAnnotations;

namespace POS.Domain.Models;

/// <summary>
/// A size variant for a product (e.g. Chica, Grande).
/// ExtraPriceCents is the surcharge relative to the base price (can be 0).
/// </summary>
public partial class ProductSize
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    [Required]
    [MaxLength(50)]
    public string Label { get; set; } = null!;

    /// <summary>
    /// Surcharge in cents relative to the product base price.
    /// </summary>
    public int ExtraPriceCents { get; set; }

    public virtual Product? Product { get; set; }
}
