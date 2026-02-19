// Constantes
const API_BASE_URL = '/api/registros';
const MENSAJES = {
    EXITO: '✅ Guardado correctamente',
    EXITO_ELIMINAR: '✅ Registro eliminado correctamente',
    ERROR: '❌ Error al guardar',
    ERROR_ELIMINAR: '❌ Error al eliminar el registro',
    CARGANDO: '⏳ Cargando...',
    ERROR_CARGA: '❌ Error al cargar los registros',
    CONFIRMACION_ELIMINAR: '¿Está seguro de que desea eliminar este registro?'
};

// Estado de la aplicación
let isLoading = false;

/**
 * Convierte un datetime-local a formato ISO para la API
 */
function convertirFechaParaAPI(fechaLocal) {
    if (!fechaLocal) return null;
    const fecha = new Date(fechaLocal);
    return fecha.toISOString();
}

/**
 * Formatea una fecha para mostrar en la tabla
 */
function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Muestra un mensaje al usuario
 */
function mostrarMensaje(texto, tipo = 'info') {
    const elementoRespuesta = document.getElementById('respuesta');
    elementoRespuesta.textContent = texto;
    
    // Limpiar clases anteriores
    elementoRespuesta.className = 'text-center text-sm mt-2 px-4 py-2 rounded';
    
    // Agregar clases según el tipo
    switch (tipo) {
        case 'exito':
            elementoRespuesta.classList.add('bg-green-100', 'text-green-700', 'border', 'border-green-400');
            break;
        case 'error':
            elementoRespuesta.classList.add('bg-red-100', 'text-red-700', 'border', 'border-red-400');
            break;
        case 'info':
            elementoRespuesta.classList.add('bg-blue-100', 'text-blue-700', 'border', 'border-blue-400');
            break;
    }
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        elementoRespuesta.textContent = '';
        elementoRespuesta.className = 'text-center text-sm mt-2';
    }, 5000);
}

/**
 * Muestra u oculta el indicador de carga
 */
function toggleCarga(mostrar) {
    isLoading = mostrar;
    const botonSubmit = document.querySelector('button[type="submit"]');
    
    if (mostrar) {
        botonSubmit.disabled = true;
        botonSubmit.innerHTML = `
            <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Guardando...
        `;
    } else {
        botonSubmit.disabled = false;
        botonSubmit.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Guardar
        `;
    }
}

/**
 * Elimina un registro
 */
async function eliminarRegistro(id, fila) {
    // Confirmar eliminación
    if (!confirm(MENSAJES.CONFIRMACION_ELIMINAR)) {
        return;
    }
    
    // Deshabilitar el botón de eliminar mientras se procesa
    const botonEliminar = fila.querySelector('.btn-eliminar');
    const textoOriginal = botonEliminar.innerHTML;
    botonEliminar.disabled = true;
    botonEliminar.innerHTML = `
        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    `;
    
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const mensaje = errorData?.error || `Error ${response.status}`;
            throw new Error(mensaje);
        }
        
        // Animar la eliminación de la fila
        fila.classList.add('bg-red-50');
        setTimeout(() => {
            fila.style.transition = 'opacity 0.3s ease-out';
            fila.style.opacity = '0';
            setTimeout(() => {
                fila.remove();
                // Verificar si la tabla quedó vacía
                verificarTablaVacia();
            }, 300);
        }, 200);
        
        mostrarMensaje(MENSAJES.EXITO_ELIMINAR, 'exito');
        
    } catch (error) {
        console.error('Error al eliminar:', error);
        mostrarMensaje(`${MENSAJES.ERROR_ELIMINAR}: ${error.message}`, 'error');
        
        // Restaurar el botón
        botonEliminar.disabled = false;
        botonEliminar.innerHTML = textoOriginal;
    }
}

/**
 * Verifica si la tabla quedó vacía y muestra mensaje
 */
function verificarTablaVacia() {
    const tbody = document.querySelector('#tablaRegistros tbody');
    const filas = tbody.querySelectorAll('tr');
    
    if (filas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-gray-500">No hay registros disponibles</td></tr>';
    }
}

/**
 * Crea una fila de la tabla con los datos del registro
 */
function crearFilaTabla(registro) {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50 transition-colors';
    tr.dataset.id = registro.id; // Agregar ID como data attribute
    
    tr.innerHTML = `
        <td class="px-3 py-2">${formatearFecha(registro.fecha)}</td>
        <td class="px-3 py-2">${registro.persona ?? ''}</td>
        <td class="px-3 py-2">${registro.linea ?? ''}</td>
        <td class="px-3 py-2">${registro.modelos ?? ''}</td>
        <td class="px-3 py-2 text-right">${registro.cantidad ?? 0}</td>
        <td class="px-3 py-2 text-right">$${registro.valor?.toFixed(2) ?? '0.00'}</td>
        <td class="px-3 py-2 text-center">
            ${registro.visible ?
                '<svg class="w-5 h-5 mx-auto text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' :
                '<svg class="w-5 h-5 mx-auto text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>'
            }
        </td>
        <td class="px-3 py-2 text-center">
            <button 
                class="btn-eliminar inline-flex items-center justify-center px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onclick="eliminarRegistro(${registro.id}, this.closest('tr'))"
                title="Eliminar registro">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
            </button>
        </td>
    `;
    return tr;
}

/**
 * Carga todos los registros desde la API
 */
async function cargarRegistros() {
    const tbody = document.querySelector('#tablaRegistros tbody');
    
    try {
        // Mostrar indicador de carga en la tabla
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-gray-500">Cargando registros...</td></tr>';
        
        const response = await fetch(API_BASE_URL);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const registros = await response.json();
        
        // Limpiar tabla
        tbody.innerHTML = '';
        
        if (registros.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-gray-500">No hay registros disponibles</td></tr>';
            return;
        }
        
        // Agregar cada registro a la tabla
        registros.forEach(registro => {
            tbody.appendChild(crearFilaTabla(registro));
        });
        
    } catch (error) {
        console.error('Error al cargar registros:', error);
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-red-500">${MENSAJES.ERROR_CARGA}</td></tr>`;
        mostrarMensaje(MENSAJES.ERROR_CARGA, 'error');
    }
}

/**
 * Valida los datos del formulario antes de enviar
 */
function validarFormulario(data) {
    const errores = [];
    
    if (!data.Fecha) {
        errores.push('La fecha es obligatoria');
    }
    
    if (!data.Persona || data.Persona.trim().length < 2) {
        errores.push('El nombre de la persona debe tener al menos 2 caracteres');
    }
    
    if (!data.Linea || data.Linea.trim().length === 0) {
        errores.push('La línea es obligatoria');
    }
    
    if (!data.Modelos || data.Modelos.trim().length === 0) {
        errores.push('Los modelos son obligatorios');
    }
    
    if (!data.Cantidad || data.Cantidad < 1) {
        errores.push('La cantidad debe ser mayor a 0');
    }
    
    if (!data.Valor || data.Valor <= 0) {
        errores.push('El valor debe ser mayor a 0');
    }
    
    return errores;
}

/**
 * Maneja el envío del formulario
 */
async function manejarEnvioFormulario(event) {
    event.preventDefault();
    
    if (isLoading) return;
    
    const formData = new FormData(event.target);
    
    // Preparar datos
    const data = {
        Fecha: convertirFechaParaAPI(formData.get('Fecha')),
        Persona: formData.get('Persona')?.trim() || '',
        Linea: formData.get('Linea')?.trim() || '',
        Modelos: formData.get('Modelos')?.trim() || '',
        Cantidad: parseInt(formData.get('Cantidad')) || 0,
        Valor: parseFloat(formData.get('Valor')) || 0,
        Visible: formData.get('Visible') === 'on'
    };
    
    // Validar datos
    const errores = validarFormulario(data);
    if (errores.length > 0) {
        mostrarMensaje(`❌ ${errores.join(', ')}`, 'error');
        return;
    }
    
    toggleCarga(true);
    
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const mensaje = errorData?.error || `Error ${response.status}`;
            throw new Error(mensaje);
        }
        
        mostrarMensaje(MENSAJES.EXITO, 'exito');
        event.target.reset();
        await cargarRegistros();
        
    } catch (error) {
        console.error('Error al guardar:', error);
        mostrarMensaje(`${MENSAJES.ERROR}: ${error.message}`, 'error');
    } finally {
        toggleCarga(false);
    }
}

/**
 * Inicializa la aplicación
 */
function inicializarApp() {
    // Configurar el formulario
    const form = document.getElementById('registroForm');
    if (form) {
        form.addEventListener('submit', manejarEnvioFormulario);
    }
    
    // Cargar registros iniciales
    cargarRegistros();
    
    // Reemplazar iconos de feather si está disponible
    if (window.feather) {
        feather.replace();
    }
    
    console.log('✅ Aplicación inicializada correctamente');
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarApp);
} else {
    inicializarApp();
}