using POS.Repository.IRepository;
using POS.Repository.Repository;

namespace POS.Repository;

/// <summary>
/// Unit of Work implementation with lazy-initialized repositories.
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    private IBusinessRepository? _business;
    private IBranchRepository? _branch;
    private IUserRepository? _user;
    private ICategoryRepository? _category;
    private IProductRepository? _product;
    private IOrderRepository? _order;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    #region Repository Properties (Lazy Initialization)

    public IBusinessRepository Business =>
        _business ??= new BusinessRepository(_context);

    public IBranchRepository Branch =>
        _branch ??= new BranchRepository(_context);

    public IUserRepository User =>
        _user ??= new UserRepository(_context);

    public ICategoryRepository Category =>
        _category ??= new CategoryRepository(_context);

    public IProductRepository Product =>
        _product ??= new ProductRepository(_context);

    public IOrderRepository Order =>
        _order ??= new OrderRepository(_context);

    #endregion

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}
