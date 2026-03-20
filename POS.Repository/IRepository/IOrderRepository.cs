using POS.Domain.Models;
using POS.Repository.Utils;

namespace POS.Repository.IRepository;

/// <summary>
/// Repository interface for order-specific queries.
/// </summary>
public interface IOrderRepository : IGenericRepository<Order>
{
    /// <summary>
    /// Returns all orders for a branch on a specific date, including items.
    /// </summary>
    Task<IEnumerable<Order>> GetByBranchAndDateAsync(int branchId, DateTime date);

    /// <summary>
    /// Returns all orders with SyncStatus = 'pending'.
    /// </summary>
    Task<IEnumerable<Order>> GetPendingSyncAsync();

    /// <summary>
    /// Returns an aggregate sales summary for a branch on a specific date.
    /// </summary>
    Task<DailySummary> GetDailySummaryAsync(int branchId, DateTime date);
}
