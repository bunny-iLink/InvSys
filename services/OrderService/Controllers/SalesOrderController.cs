using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.Models;

namespace OrderService.Controllers
{
    [ApiController]
    [Route("order/[controller]")]

    public class SalesOrderController : ControllerBase
    {
        private readonly OrderDbContext _context;

        public SalesOrderController(OrderDbContext context)
        {
            _context = context;
        }

        [HttpGet("getAllOrders")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.SalesOrders.ToListAsync();
            return Ok(orders);
        }

        [HttpPost("neworder")]
        public async Task<IActionResult> NewOrder([FromBody] SalesOrder salesOrder)
        {
            if (salesOrder == null)
            {
                return BadRequest(new { message = "Please try again" });
            }

            salesOrder.SalesOrdersId = 0; // let DB auto-generate
            salesOrder.CreatedOn = DateTime.UtcNow;
            salesOrder.LastUpdatedOn = DateTime.UtcNow;

            _context.Add(salesOrder);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Sales order created successfully", data = salesOrder });
        }

        [HttpDelete("deleteorder/{id}")]
        public async Task<IActionResult> deleteOrder(int id)
        {
            var order = await _context.SalesOrders.FindAsync(id);

            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            _context.SalesOrders.Remove(order);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Order deleted successfully" });
        }

        [HttpPut("editorder/{id}")]
        public async Task<IActionResult> UpdateSalesOrder(int id, [FromBody] SalesOrder salesOrder)
        {
            // Find sales order by ID
            var order = await _context.SalesOrders.FindAsync(id);

            if (order == null)
            {
                return NotFound(new { message = "Sales Order not found" });
            }

            // Update fields
            order.OrderName = string.IsNullOrEmpty(salesOrder.OrderName) ? order.OrderName : salesOrder.OrderName;
            order.CustomerId = salesOrder.CustomerId;
            order.CustomerName = salesOrder.CustomerName;
            order.ProductId = salesOrder.ProductId;
            order.ProductName = salesOrder.ProductName;
            order.Quantity = salesOrder.Quantity;
            order.Status = salesOrder.Status;

            // Audit fields
            order.LastUpdatedOn = DateTime.UtcNow;
            order.LastUpdatedBy = salesOrder.LastUpdatedBy;

            // Save changes
            _context.SalesOrders.Update(order);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Sales order updated successfully",
                data = order
            });
        }
    }
}