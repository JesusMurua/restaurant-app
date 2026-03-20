using POS.Domain.Models;

namespace POS.Repository.IRepository;

/// <summary>
/// Repository interface for branch-specific queries.
/// </summary>
public interface IBranchRepository : IGenericRepository<Branch>
{
    /// <summary>
    /// Returns a branch by ID with its categories and parent business included.
    /// </summary>
    Task<Branch?> GetByIdWithConfigAsync(int branchId);
}
