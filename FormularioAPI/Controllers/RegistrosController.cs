using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FormularioAPI.Data;
using FormularioAPI.Models;

namespace FormularioAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegistrosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RegistrosController(AppDbContext context)
        {
            _context = context;
        }

        // POST api/registros
        [HttpPost]
        public async Task<IActionResult> CrearRegistro([FromBody] Registro registro)
        {
            try
            {
                _context.Registros.Add(registro);
                await _context.SaveChangesAsync();
                return Ok(registro);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error al procesar la solicitud: {ex.Message}");
            }
        }

        // GET api/registros
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Registro>>> ObtenerRegistros()
        {
            var registros = await _context.Registros.ToListAsync();
            return Ok(registros);
        }
    }
}
