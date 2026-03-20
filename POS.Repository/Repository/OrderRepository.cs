using Microsoft.EntityFrameworkCore;
using POS.Domain.Models;
using POS.Repository.IRepository;
using POS.Repository.Utils;

namespace POS.Repository.Repository;

/// <summary>
/// Order repository with sync and reporting queries.
/// </summary>
public class OrderRepository : GenericRepository<Order>, IOrderRepository
{
    public OrderRepository(ApplicationDbContext context) : base(context)
    {
    }

    #region Public API Methods

    /// <inheritdoc />
    public async Task<IEnumerable<Order>> GetByBranchAndDateAsync(int branchId, DateTime date)
    {
        return await _context.Orders
            .Where(o => o.BranchId == branchId
                     && o.CreatedAt.Date == date.Date)
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Order>> GetPendingSyncAsync()
    {
        return await _context.Orders
            .Where(o => o.SyncStatus == "pending")
            .Include(o => o.Items)
            .OrderBy(o => o.CreatedAt)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<DailySummary> GetDailySummaryAsync(int branchId, DateTime date)
    {
        var orders = _context.Orders
            .Where(o => o.BranchId == branchId
                     && o.CreatedAt.Date == date.Date);

        var totalOrders = await orders.CountAsync();
        var totalCents = await orders.SumAsync(o => o.TotalCents);

        var cashCents = await orders
            .Where(o => o.PaymentMethod == "cash")
            .SumAsync(o => o.TotalCents);

        var cardCents = await orders
            .Where(o => o.PaymentMethod == "card")
            .SumAsync(o => o.TotalCents);

        return new DailySummary(totalOrders, totalCents, cashCents, cardCents);
    }

    #endregion
}
