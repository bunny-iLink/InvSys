using Contracts;
using MassTransit;
using ProductService.Data;

namespace ProductService.Consumers
{
    /// <summary>
    /// Consumes <see cref="InventoryOrderReceived"/> events and updates the product quantity in the database.
    /// </summary>
    public class InventoryOrderReceivedConsumer : IConsumer<InventoryOrderReceived>
    {
        private readonly ProductDbContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="InventoryOrderReceivedConsumer"/> class.
        /// </summary>
        /// <param name="context">The <see cref="ProductDbContext"/> used to access the database.</param>
        public InventoryOrderReceivedConsumer(ProductDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Handles an <see cref="InventoryOrderReceived"/> message by incrementing the product quantity in the database.
        /// </summary>
        /// <param name="context">The <see cref="ConsumeContext{T}"/> containing the <see cref="InventoryOrderReceived"/> message.</param>
        /// <returns>A <see cref="Task"/> representing the asynchronous operation.</returns>
        public async Task Consume(ConsumeContext<InventoryOrderReceived> context)
        {
            var product = await _context.Products.FindAsync(context.Message.ProductId);

            if (product != null)
            {
                // Increment the product quantity based on the received inventory
                product.Quantity += context.Message.Quantity;
                await _context.SaveChangesAsync();
            }
        }
    }
}
