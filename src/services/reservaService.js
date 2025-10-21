import api from './api';

export const reservaService = {
    // Obtener todas las reservas
    getAllReservas: () => api.get('/reserva/all'),

    // Obtener reserva por ID
    getReservaById: (id) => api.get(`/reserva/search-by-id/${id}`),

    // Crear nueva reserva
    createReserva: (reservaData) => api.post('/reserva/save-new', reservaData),

    // Actualizar reserva
    updateReserva: (id, reservaData) => api.put(`/reserva/update/${id}`, reservaData),

    // Eliminar reserva
    deleteReserva: (id) => api.delete(`/reserva/delete/${id}`)
};