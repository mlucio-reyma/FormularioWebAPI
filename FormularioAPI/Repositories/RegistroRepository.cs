using FormularioAPI.Data;
using FormularioAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FormularioAPI.Repositories
{
    public class RegistroRepository : IRegistroRepository
    {
        private readonly AppDbContext _context;
        private readonly ILogger<RegistroRepository> _logger;

        public RegistroRepository(AppDbContext context, ILogger<RegistroRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<Registro>> ObtenerTodosAsync()
        {
            try
            {
                return await _context.Registros
                    .OrderByDescending(r => r.Fecha)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los registros");
                throw;
            }
        }

        public async Task<Registro?> ObtenerPorIdAsync(int id)
        {
            try
            {
                return await _context.Registros.FindAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el registro con ID: {Id}", id);
                throw;
            }
        }

        public async Task<Registro> CrearAsync(Registro registro)
        {
            try
            {
                _context.Registros.Add(registro);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Registro creado exitosamente con ID: {Id}", registro.Id);
                return registro;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el registro");
                throw;
            }
        }

        public async Task<Registro?> ActualizarAsync(int id, Registro registro)
        {
            try
            {
                var registroExistente = await _context.Registros.FindAsync(id);
                if (registroExistente == null)
                    return null;

                registroExistente.Fecha = registro.Fecha;
                registroExistente.Persona = registro.Persona;
                registroExistente.Linea = registro.Linea;
                registroExistente.Modelos = registro.Modelos;
                registroExistente.Cantidad = registro.Cantidad;
                registroExistente.Valor = registro.Valor;
                registroExistente.Visible = registro.Visible;

                await _context.SaveChangesAsync();
                _logger.LogInformation("Registro actualizado exitosamente con ID: {Id}", id);
                return registroExistente;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar el registro con ID: {Id}", id);
                throw;
            }
        }

        public async Task<bool> EliminarAsync(int id)
        {
            try
            {
                var registro = await _context.Registros.FindAsync(id);
                if (registro == null)
                    return false;

                _context.Registros.Remove(registro);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Registro eliminado exitosamente con ID: {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar el registro con ID: {Id}", id);
                throw;
            }
        }

        public async Task<bool> ExisteAsync(int id)
        {
            return await _context.Registros.AnyAsync(r => r.Id == id);
        }
    }
}