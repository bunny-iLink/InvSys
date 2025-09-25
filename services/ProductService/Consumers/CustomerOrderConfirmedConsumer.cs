using Contracts;
using MassTransit;
using ProductService.Data;

namespace ProductService.Consumers
{
    public class CustomerOrderConfirmedConsumer : IConsumer<CustomerOrderConfirmed>
    {
        private readonly ProductDbContext _context;

        public CustomerOrderConfirmedConsumer(ProductDbContext context)
        {
            _context = context;
        }

        public async Task Consume(ConsumeContext<CustomerOrderConfirmed> context)
        {
            var product = await _context.Products.FindAsync(context.Message.ProductId);

            if (product != null)
            {
                product.Quantity -= context.Message.Quantity;
                await _context.SaveChangesAsync();
            }
        }
    }
}