using Contracts;
using MassTransit;
using ProductService.Data;

namespace ProductService.Consumers
{
    public class InventoryOrderReceivedConsumer : IConsumer<InventoryOrderReceived>
    {
        private readonly ProductDbContext _context;

        public InventoryOrderReceivedConsumer(ProductDbContext context)
        {
            _context = context;
        }

        public async Task Consume(ConsumeContext<InventoryOrderReceived> context)
        {
            var product = await _context.Products.FindAsync(context.Message.ProductId);

            if (product != null)
            {
                product.Quantity += context.Message.Quantity;
                await _context.SaveChangesAsync();
            }
        }
    }
}