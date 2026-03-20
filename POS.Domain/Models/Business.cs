using System.ComponentModel.DataAnnotations;

namespace POS.Domain.Models;

/// <summary>
/// Represents a business (tenant) in the multi-tenant POS system.
/// </summary>
public partial class Business
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    public string PlanType { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Branch>? Branches { get; set; }

    public virtual ICollection<User>? Users { get; set; }
}
