using POS.Repository.IRepository;

namespace POS.Repository;

/// <summary>
/// Unit of Work interface for transaction management.
/// Exposes all domain repositories and a single SaveChangesAsync entry point.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    IBusinessRepository Business { get; }
    IBranchRepository Branch { get; }
    IUserRepository User { get; }
    ICategoryRepository Category { get; }
    IProductRepository Product { get; }
    IOrderRepository Order { get; }

    Task<int> SaveChangesAsync();
}
