using FormularioAPI.Data;
using FormularioAPI.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Configurar DbContext con PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Registrar el Repository
builder.Services.AddScoped<IRegistroRepository, RegistroRepository>();

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5000", "https://localhost:5001")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configurar Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Formulario API",
        Version = "v1",
        Description = "API para gestión de registros de formulario",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Soporte",
            Email = "soporte@ejemplo.com"
        }
    });

    // Incluir comentarios XML si están disponibles
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

// Configurar logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Formulario API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

// Habilitar archivos estáticos (wwwroot)
app.UseStaticFiles();

// Habilitar CORS
app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

// Página por defecto
app.MapFallbackToFile("formulario.html");

app.Run();
