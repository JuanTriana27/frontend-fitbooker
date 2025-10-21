import api from './api';

export const claseService = {
    // Obtener todas las clases
    getAllClases: () => api.get('/clase/all'),

    // Obtener clase por ID
    getClaseById: (id) => api.get(`/clase/search-by-id/${id}`),

    // Crear nueva clase
    createClase: (claseData) => api.post('/clase/save-new', claseData),

    // Actualizar clase
    updateClase: (id, claseData) => api.put(`/clase/update/${id}`, claseData),

    // Eliminar clase
    deleteClase: (id) => api.delete(`/clase/delete/${id}`)
};