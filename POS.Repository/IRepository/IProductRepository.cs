using POS.Domain.Models;

namespace POS.Repository.IRepository;

/// <summary>
/// Repository interface for product-specific queries.
/// </summary>
public interface IProductRepository : IGenericRepository<Product>
{
    /// <summary>
    /// Returns all available products with their sizes and extras included.
    /// </summary>
    Task<IEnumerable<Product>> GetActiveWithExtrasAsync();
}
