using POS.Domain.Models;

namespace POS.Repository.IRepository;

/// <summary>
/// Repository interface for category-specific queries.
/// </summary>
public interface ICategoryRepository : IGenericRepository<Category>
{
    /// <summary>
    /// Returns all active categories for a branch, ordered by SortOrder.
    /// </summary>
    Task<IEnumerable<Category>> GetActiveBranchCategoriesAsync(int branchId);
}
