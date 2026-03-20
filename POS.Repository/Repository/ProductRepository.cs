using Microsoft.EntityFrameworkCore;
using POS.Domain.Models;
using POS.Repository.IRepository;

namespace POS.Repository.Repository;

/// <summary>
/// Product repository with catalog-specific queries.
/// </summary>
public class ProductRepository : GenericRepository<Product>, IProductRepository
{
    public ProductRepository(ApplicationDbContext context) : base(context)
    {
    }

    #region Public API Methods

    /// <inheritdoc />
    public async Task<IEnumerable<Product>> GetActiveWithExtrasAsync()
    {
        return await _context.Products
            .Where(p => p.IsAvailable)
            .Include(p => p.Sizes)
            .Include(p => p.Extras)
            .ToListAsync();
    }

    #endregion
}
