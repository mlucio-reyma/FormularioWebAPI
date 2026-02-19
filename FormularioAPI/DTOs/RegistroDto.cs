using System.ComponentModel.DataAnnotations;

namespace FormularioAPI.DTOs
{
    public class RegistroCreateDto
    {
        [Required(ErrorMessage = "La fecha es obligatoria")]
        public string Fecha { get; set; } = string.Empty;

        [Required(ErrorMessage = "La persona es obligatoria")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 100 caracteres")]
        public string Persona { get; set; } = string.Empty;

        [Required(ErrorMessage = "La línea es obligatoria")]
        [StringLength(50, ErrorMessage = "La línea no puede exceder 50 caracteres")]
        public string Linea { get; set; } = string.Empty;

        [Required(ErrorMessage = "Los modelos son obligatorios")]
        [StringLength(200, ErrorMessage = "Los modelos no pueden exceder 200 caracteres")]
        public string Modelos { get; set; } = string.Empty;

        [Required(ErrorMessage = "La cantidad es obligatoria")]
        [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
        public int Cantidad { get; set; }

        [Required(ErrorMessage = "El valor es obligatorio")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El valor debe ser mayor a 0")]
        public decimal Valor { get; set; }

        public bool Visible { get; set; }
    }

    public class RegistroResponseDto
    {
        public int Id { get; set; }
        public DateTimeOffset Fecha { get; set; }
        public string Persona { get; set; } = string.Empty;
        public string Linea { get; set; } = string.Empty;
        public string Modelos { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public decimal Valor { get; set; }
        public bool Visible { get; set; }
    }
}