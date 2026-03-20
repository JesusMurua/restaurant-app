using System.ComponentModel.DataAnnotations;

namespace POS.Domain.Models;

/// <summary>
/// A line item within an order. Stores a snapshot of the product data
/// at the time of purchase so the order remains accurate even if the
/// catalog changes later.
/// </summary>
public partial class OrderItem
{
    public int Id { get; set; }

    /// <summary>
    /// FK to Order (string UUID).
    /// </summary>
    [Required]
    [MaxLength(36)]
    public string OrderId { get; set; } = null!;

    public int ProductId { get; set; }

    /// <summary>
    /// Snapshot of the product name at the time of purchase.
    /// </summary>
    [Required]
    [MaxLength(150)]
    public string ProductName { get; set; } = null!;

    public int Quantity { get; set; }

    /// <summary>
    /// Unit price in cents (base + size delta + extras).
    /// </summary>
    public int UnitPriceCents { get; set; }

    /// <summary>
    /// Selected size label, if any (e.g. "Grande").
    /// </summary>
    [MaxLength(50)]
    public string? SizeName { get; set; }

    /// <summary>
    /// JSON-serialized array of selected extras (e.g. [{"label":"Queso","priceCents":500}]).
    /// </summary>
    public string? ExtrasJson { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public virtual Order? Order { get; set; }

    public virtual Product? Product { get; set; }
}
