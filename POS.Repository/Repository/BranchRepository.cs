using Microsoft.EntityFrameworkCore;
using POS.Domain.Models;
using POS.Repository.IRepository;

namespace POS.Repository.Repository;

/// <summary>
/// Branch repository with config-loading queries.
/// </summary>
public class BranchRepository : GenericRepository<Branch>, IBranchRepository
{
    public BranchRepository(ApplicationDbContext context) : base(context)
    {
    }

    #region Public API Methods

    /// <inheritdoc />
    public async Task<Branch?> GetByIdWithConfigAsync(int branchId)
    {
        return await _context.Branches
            .Where(b => b.Id == branchId)
            .Include(b => b.Business)
            .Include(b => b.Categories)
            .FirstOrDefaultAsync();
    }

    #endregion
}
