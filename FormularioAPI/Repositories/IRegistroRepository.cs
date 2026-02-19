using FormularioAPI.Models;

namespace FormularioAPI.Repositories
{
    public interface IRegistroRepository
    {
        Task<IEnumerable<Registro>> ObtenerTodosAsync();
        Task<Registro?> ObtenerPorIdAsync(int id);
        Task<Registro> CrearAsync(Registro registro);
        Task<Registro?> ActualizarAsync(int id, Registro registro);
        Task<bool> EliminarAsync(int id);
        Task<bool> ExisteAsync(int id);
    }
}