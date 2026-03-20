using System.ComponentModel.DataAnnotations;

namespace POS.Domain.Models;

/// <summary>
/// An optional add-on for a product (e.g. extra cheese, extra sauce).
/// </summary>
public partial class ProductExtra
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Label { get; set; } = null!;

    /// <summary>
    /// Price of this extra in cents.
    /// </summary>
    public int PriceCents { get; set; }

    public virtual Product? Product { get; set; }
}
