using POS.Domain.Models;

namespace POS.Repository.IRepository;

/// <summary>
/// Repository interface for user-specific queries.
/// </summary>
public interface IUserRepository : IGenericRepository<User>
{
    /// <summary>
    /// Returns a user by their email address, or null if not found.
    /// </summary>
    Task<User?> GetByEmailAsync(string email);
}
