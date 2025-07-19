# Utiliza la imagen oficial de PostgreSQL de Docker Hub
FROM postgres:16

# Variables de entorno para el usuario, contraseña y base de datos por defecto
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgresadmin
ENV POSTGRES_DB=PruebasDB

# Define un volumen para persistir los datos de PostgreSQL
VOLUME ["/var/lib/postgresql/data"]

# Exponer el puerto por defecto de PostgreSQL
EXPOSE 5432