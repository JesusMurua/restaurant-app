using Microsoft.EntityFrameworkCore;
using POS.Domain.Models;

namespace POS.Repository;

/// <summary>
/// EF Core database context for the POS application.
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    #region DbSets

    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductSize> ProductSizes => Set<ProductSize>();
    public DbSet<ProductExtra> ProductExtras => Set<ProductExtra>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    #endregion

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        #region Branch — PinHash excluded from normal queries

        modelBuilder.Entity<Branch>(entity =>
        {
            entity.Property(b => b.PinHash)
                  .HasColumnName("PinHash");
        });

        #endregion

        #region Order — String PK (client-generated UUID)

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(o => o.Id);

            entity.Property(o => o.Id)
                  .HasMaxLength(36)
                  .ValueGeneratedNever();

            entity.HasOne(o => o.Branch)
                  .WithMany(b => b.Orders)
                  .HasForeignKey(o => o.BranchId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(o => o.User)
                  .WithMany(u => u.Orders)
                  .HasForeignKey(o => o.UserId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        #endregion

        #region OrderItem — FK to Order (string)

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasOne(oi => oi.Order)
                  .WithMany(o => o.Items)
                  .HasForeignKey(oi => oi.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(oi => oi.Product)
                  .WithMany()
                  .HasForeignKey(oi => oi.ProductId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        #endregion

        #region Indexes

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasIndex(o => new { o.BranchId, o.CreatedAt })
                  .HasDatabaseName("IX_Order_BranchId_CreatedAt");

            entity.HasIndex(o => o.SyncStatus)
                  .HasDatabaseName("IX_Order_SyncStatus");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasIndex(p => p.CategoryId)
                  .HasDatabaseName("IX_Product_CategoryId");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasIndex(c => new { c.BranchId, c.SortOrder })
                  .HasDatabaseName("IX_Category_BranchId_SortOrder");
        });

        #endregion

        #region Seed Data

        modelBuilder.Entity<Business>().HasData(new Business
        {
            Id = 1,
            Name = "Mi Negocio",
            PlanType = "free",
            IsActive = true,
            CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        });

        modelBuilder.Entity<Branch>().HasData(new Branch
        {
            Id = 1,
            BusinessId = 1,
            Name = "Sucursal Principal",
            LocationName = "Sucursal Principal",
            PinHash = "$2a$11$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
            IsActive = true,
            CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        });

        #endregion
    }
}
