using System.ComponentModel.DataAnnotations;

namespace POS.Domain.Models;

/// <summary>
/// A completed order submitted from the POS or kiosk.
/// Orders are saved to IndexedDB first (client-side), then synced to the API.
/// The Id is a UUID generated client-side.
/// </summary>
public partial class Order
{
    /// <summary>
    /// UUID generated client-side via crypto.randomUUID().
    /// </summary>
    [Key]
    [MaxLength(36)]
    public string Id { get; set; } = null!;

    public int BranchId { get; set; }

    /// <summary>
    /// Nullable because kiosk orders have no authenticated user.
    /// </summary>
    public int? UserId { get; set; }

    /// <summary>
    /// Sequential display number shown to staff and customer (e.g. #47).
    /// </summary>
    public int OrderNumber { get; set; }

    /// <summary>
    /// Order total in cents.
    /// </summary>
    public int TotalCents { get; set; }

    /// <summary>
    /// Payment method stored as string: 'cash' or 'card'.
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string PaymentMethod { get; set; } = null!;

    /// <summary>
    /// Amount tendered in cents (for cash payments).
    /// </summary>
    public int? TenderedCents { get; set; }

    /// <summary>
    /// Change returned in cents (for cash payments).
    /// </summary>
    public int? ChangeCents { get; set; }

    /// <summary>
    /// Payment terminal provider (e.g. 'clip', 'stripe'). Null for direct cash/card.
    /// </summary>
    [MaxLength(30)]
    public string? PaymentProvider { get; set; }

    /// <summary>
    /// Reference ID returned by the external payment provider, if any.
    /// </summary>
    [MaxLength(256)]
    public string? ExternalReference { get; set; }

    /// <summary>
    /// Sync lifecycle: 'pending', 'synced', or 'failed'.
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string SyncStatus { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Set when the order is successfully persisted in the backend.
    /// </summary>
    public DateTime? SyncedAt { get; set; }

    public virtual Branch? Branch { get; set; }

    public virtual User? User { get; set; }

    public virtual ICollection<OrderItem>? Items { get; set; }
}
