import api from './api';

export const chatService = {
    // Chat general
    chatGeneral: (message) => api.post('/api/gemini/chat', { message }),

    // Chat fitness
    chatFitness: (message) => api.post('/api/gemini/chat/fitness', { message }),

    // Generar rutina de ejercicios
    generateWorkoutRoutine: (data) => api.post('/api/gemini/workout-routine', data),
};