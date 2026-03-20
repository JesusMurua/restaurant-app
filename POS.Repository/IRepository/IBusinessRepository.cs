using POS.Domain.Models;

namespace POS.Repository.IRepository;

/// <summary>
/// Repository interface for business entities.
/// Inherits all generic CRUD operations.
/// </summary>
public interface IBusinessRepository : IGenericRepository<Business>
{
}
