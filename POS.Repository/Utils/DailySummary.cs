namespace POS.Repository.Utils;

/// <summary>
/// Aggregate sales summary for a single day at a branch.
/// </summary>
public record DailySummary(
    int TotalOrders,
    int TotalCents,
    int CashCents,
    int CardCents
);
