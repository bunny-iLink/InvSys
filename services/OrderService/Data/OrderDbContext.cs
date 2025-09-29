using Microsoft.EntityFrameworkCore;
using OrderService.Models;

namespace OrderService.Data
{
    /// <summary>
    /// Represents the Entity Framework Core database context for the Order Service.
    /// Manages access to SalesOrders and PurchaseOrders tables.
    /// </summary>
    public class OrderDbContext : DbContext
    {
        /// <summary>
        /// Initializes a new instance of <see cref="OrderDbContext"/> using the specified options.
        /// </summary>
        /// <param name="options">The options to configure the context, typically provided by dependency injection.</param>
        public OrderDbContext(DbContextOptions<OrderDbContext> options) : base(options)
        {
        }

        /// <summary>
        /// Gets or sets the DbSet of sales orders.
        /// Represents the SalesOrders table in the database.
        /// </summary>
        public DbSet<SalesOrder> SalesOrders { get; set; }

        /// <summary>
        /// Gets or sets the DbSet of purchase orders.
        /// Represents the PurchaseOrders table in the database.
        /// </summary>
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
    }
}
