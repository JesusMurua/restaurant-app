namespace POS.Domain.Enums;

/// <summary>
/// Lifecycle state of an order relative to backend sync.
/// </summary>
public enum OrderSyncStatus
{
    Pending,
    Synced,
    Failed
}
