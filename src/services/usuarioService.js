import api from './api'; // importa tu instancia base

const BASE_URL = '/usuario';

export const usuarioService = {
    // Obtener todos los usuarios
    getAllUsuarios: () => api.get(`${BASE_URL}/all`),

    // Obtener un usuario por ID
    getUsuarioById: (id) => api.get(`${BASE_URL}/search-by-id/${id}`),

    // Crear nuevo usuario
    createUsuario: (payload) => api.post(`${BASE_URL}/save-new`, payload),

    // Actualizar usuario
    updateUsuario: (id, payload) => api.put(`${BASE_URL}/update/${id}`, payload),

    // Eliminar usuario
    deleteUsuario: (id) => api.delete(`${BASE_URL}/delete/${id}`),
};
