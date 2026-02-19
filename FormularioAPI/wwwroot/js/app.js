// Constantes
const API_BASE_URL = '/api/registros';
const MENSAJES = {
    EXITO: '✅ Guardado correctamente',
    ERROR: '❌ Error al guardar',
    CARGANDO: '⏳ Cargando...',
    ERROR_CARGA: '❌ Error al cargar los registros'
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
 * Crea una fila de la tabla con los datos del registro
 */
function crearFilaTabla(registro) {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50 transition-colors';
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
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-500">Cargando registros...</td></tr>';
        
        const response = await fetch(API_BASE_URL);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const registros = await response.json();
        
        // Limpiar tabla
        tbody.innerHTML = '';
        
        if (registros.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-500">No hay registros disponibles</td></tr>';
            return;
        }
        
        // Agregar cada registro a la tabla
        registros.forEach(registro => {
            tbody.appendChild(crearFilaTabla(registro));
        });
        
    } catch (error) {
        console.error('Error al cargar registros:', error);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-red-500">${MENSAJES.ERROR_CARGA}</td></tr>`;
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