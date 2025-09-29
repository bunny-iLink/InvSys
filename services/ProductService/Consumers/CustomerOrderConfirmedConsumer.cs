using Contracts;
using MassTransit;
using ProductService.Data;

namespace ProductService.Consumers
{
    /// <summary>
    /// Consumes <see cref="CustomerOrderConfirmed"/> events and updates the product quantity in the database.
    /// </summary>
    public class CustomerOrderConfirmedConsumer : IConsumer<CustomerOrderConfirmed>
    {
        private readonly ProductDbContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="CustomerOrderConfirmedConsumer"/> class.
        /// </summary>
        /// <param name="context">The <see cref="ProductDbContext"/> used to access the database.</param>
        public CustomerOrderConfirmedConsumer(ProductDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Handles a <see cref="CustomerOrderConfirmed"/> message by decrementing the product quantity in the database.
        /// </summary>
        /// <param name="context">The <see cref="ConsumeContext{T}"/> containing the <see cref="CustomerOrderConfirmed"/> message.</param>
        /// <returns>A <see cref="Task"/> representing the asynchronous operation.</returns>
        public async Task Consume(ConsumeContext<CustomerOrderConfirmed> context)
        {
            var product = await _context.Products.FindAsync(context.Message.ProductId);

            if (product != null)
            {
                // Decrement the product quantity based on the confirmed order
                product.Quantity -= context.Message.Quantity;
                await _context.SaveChangesAsync();
            }
        }
    }
}
