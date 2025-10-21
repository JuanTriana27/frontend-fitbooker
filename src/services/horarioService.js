// services/horarioService.js
import api from './api';

const BASE_URL = '/horario';

export const horarioService = {
    // Obtener todos los horarios
    getAllHorarios: () => api.get(`${BASE_URL}/all`),

    // Obtener un horario por ID
    getHorarioById: (id) => api.get(`${BASE_URL}/search-by-id/${id}`),

    // Crear nuevo horario
    createHorario: (payload) => api.post(`${BASE_URL}/save-new`, payload),

    // Actualizar horario
    updateHorario: (id, payload) => api.put(`${BASE_URL}/update/${id}`, payload),

    // Eliminar horario
    deleteHorario: (id) => api.delete(`${BASE_URL}/delete/${id}`),
};