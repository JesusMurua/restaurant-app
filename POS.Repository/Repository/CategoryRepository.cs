using Microsoft.EntityFrameworkCore;
using POS.Domain.Models;
using POS.Repository.IRepository;

namespace POS.Repository.Repository;

/// <summary>
/// Category repository with branch-scoped queries.
/// </summary>
public class CategoryRepository : GenericRepository<Category>, ICategoryRepository
{
    public CategoryRepository(ApplicationDbContext context) : base(context)
    {
    }

    #region Public API Methods

    /// <inheritdoc />
    public async Task<IEnumerable<Category>> GetActiveBranchCategoriesAsync(int branchId)
    {
        return await _context.Categories
            .Where(c => c.BranchId == branchId && c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();
    }

    #endregion
}
