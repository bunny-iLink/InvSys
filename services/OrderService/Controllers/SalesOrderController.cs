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

        [HttpGet("get")]
        public IActionResult Test()
        {
            return Ok("API Works :)");
        }
    }
}