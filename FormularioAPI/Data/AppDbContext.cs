using Microsoft.EntityFrameworkCore;
using FormularioAPI.Models;

namespace FormularioAPI.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Registro> Registros { get; set; }

    }
}
