using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FormularioAPI.Data;
using FormularioAPI.DTOs;
using FormularioAPI.Models;
using FormularioAPI.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FormularioAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegistrosController : ControllerBase
    {
        private readonly IRegistroRepository _repository;
        private readonly ILogger<RegistrosController> _logger;

        public RegistrosController(IRegistroRepository repository, ILogger<RegistrosController> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene todos los registros
        /// </summary>
        /// <returns>Lista de registros</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<RegistroResponseDto>>> ObtenerRegistros()
        {
            try
            {
                var registros = await _repository.ObtenerTodosAsync();
                var registrosDto = registros.Select(r => new RegistroResponseDto
                {
                    Id = r.Id,
                    Fecha = r.Fecha,
                    Persona = r.Persona,
                    Linea = r.Linea,
                    Modelos = r.Modelos,
                    Cantidad = r.Cantidad,
                    Valor = r.Valor,
                    Visible = r.Visible
                });

                return Ok(registrosDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los registros");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { error = "Ocurrió un error al obtener los registros" });
            }
        }

        /// <summary>
        /// Obtiene un registro por ID
        /// </summary>
        /// <param name="id">ID del registro</param>
        /// <returns>Registro encontrado</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<RegistroResponseDto>> ObtenerRegistroPorId(int id)
        {
            try
            {
                var registro = await _repository.ObtenerPorIdAsync(id);
                if (registro == null)
                {
                    _logger.LogWarning("Registro no encontrado con ID: {Id}", id);
                    return NotFound(new { error = $"No se encontró el registro con ID {id}" });
                }

                var registroDto = new RegistroResponseDto
                {
                    Id = registro.Id,
                    Fecha = registro.Fecha,
                    Persona = registro.Persona,
                    Linea = registro.Linea,
                    Modelos = registro.Modelos,
                    Cantidad = registro.Cantidad,
                    Valor = registro.Valor,
                    Visible = registro.Visible
                };

                return Ok(registroDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el registro con ID: {Id}", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { error = "Ocurrió un error al obtener el registro" });
            }
        }

        /// <summary>
        /// Crea un nuevo registro
        /// </summary>
        /// <param name="registroDto">Datos del registro</param>
        /// <returns>Registro creado</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<RegistroResponseDto>> CrearRegistro([FromBody] RegistroCreateDto registroDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Datos inválidos en la solicitud de creación");
                return BadRequest(ModelState);
            }

            try
            {
                // Convertir la fecha del frontend a DateTimeOffset en UTC
                if (!DateTimeOffset.TryParse(registroDto.Fecha, out var fechaParsed))
                {
                    return BadRequest(new { error = "Formato de fecha inválido" });
                }

                var registro = new Registro
                {
                    Fecha = fechaParsed.ToUniversalTime(),
                    Persona = registroDto.Persona,
                    Linea = registroDto.Linea,
                    Modelos = registroDto.Modelos,
                    Cantidad = registroDto.Cantidad,
                    Valor = registroDto.Valor,
                    Visible = registroDto.Visible
                };

                var registroCreado = await _repository.CrearAsync(registro);

                var responseDto = new RegistroResponseDto
                {
                    Id = registroCreado.Id,
                    Fecha = registroCreado.Fecha,
                    Persona = registroCreado.Persona,
                    Linea = registroCreado.Linea,
                    Modelos = registroCreado.Modelos,
                    Cantidad = registroCreado.Cantidad,
                    Valor = registroCreado.Valor,
                    Visible = registroCreado.Visible
                };

                return CreatedAtAction(nameof(ObtenerRegistroPorId), new { id = registroCreado.Id }, responseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el registro");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { error = "Ocurrió un error al crear el registro" });
            }
        }

        /// <summary>
        /// Actualiza un registro existente
        /// </summary>
        /// <param name="id">ID del registro</param>
        /// <param name="registroDto">Datos actualizados</param>
        /// <returns>Registro actualizado</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<RegistroResponseDto>> ActualizarRegistro(int id, [FromBody] RegistroCreateDto registroDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                if (!DateTimeOffset.TryParse(registroDto.Fecha, out var fechaParsed))
                {
                    return BadRequest(new { error = "Formato de fecha inválido" });
                }

                var registro = new Registro
                {
                    Fecha = fechaParsed.ToUniversalTime(),
                    Persona = registroDto.Persona,
                    Linea = registroDto.Linea,
                    Modelos = registroDto.Modelos,
                    Cantidad = registroDto.Cantidad,
                    Valor = registroDto.Valor,
                    Visible = registroDto.Visible
                };

                var registroActualizado = await _repository.ActualizarAsync(id, registro);
                if (registroActualizado == null)
                {
                    return NotFound(new { error = $"No se encontró el registro con ID {id}" });
                }

                var responseDto = new RegistroResponseDto
                {
                    Id = registroActualizado.Id,
                    Fecha = registroActualizado.Fecha,
                    Persona = registroActualizado.Persona,
                    Linea = registroActualizado.Linea,
                    Modelos = registroActualizado.Modelos,
                    Cantidad = registroActualizado.Cantidad,
                    Valor = registroActualizado.Valor,
                    Visible = registroActualizado.Visible
                };

                return Ok(responseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar el registro con ID: {Id}", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { error = "Ocurrió un error al actualizar el registro" });
            }
        }

        /// <summary>
        /// Elimina un registro
        /// </summary>
        /// <param name="id">ID del registro</param>
        /// <returns>Confirmación de eliminación</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> EliminarRegistro(int id)
        {
            try
            {
                var eliminado = await _repository.EliminarAsync(id);
                if (!eliminado)
                {
                    return NotFound(new { error = $"No se encontró el registro con ID {id}" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar el registro con ID: {Id}", id);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { error = "Ocurrió un error al eliminar el registro" });
            }
        }
    }
}
