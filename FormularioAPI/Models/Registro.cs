using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace FormularioAPI.Models
{
    public class Registro
    {
        public int Id { get; set; }
        [Column(TypeName = "timestamp without time zone")]
        public DateTime Fecha { get; set; }
        public string Persona { get; set; }
        public string Linea { get; set; }
        public string Modelos { get; set; }
        public int Cantidad { get; set; }
        public decimal Valor { get; set; }
        public bool Visible { get; set; }
    }
}
