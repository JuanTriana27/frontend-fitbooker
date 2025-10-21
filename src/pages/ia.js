import React, { useState, useRef, useEffect } from 'react';
import {
    Card,
    Button,
    Form,
    InputGroup,
    Badge,
    Spinner,
    Alert
} from 'react-bootstrap';
import { chatService } from '../services/chatService';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/pages/ChatAI.css';

const ChatAI = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatType, setChatType] = useState('fitness');
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    // Ejemplos predefinidos
    const fitnessExamples = [
        {
            icon: 'fas fa-dumbbell',
            text: "Rutina para principiantes",
            query: "¿Cuál es una buena rutina de ejercicios para alguien que está empezando?"
        },
        {
            icon: 'fas fa-heartbeat',
            text: "Mejorar resistencia",
            query: "¿Cómo puedo mejorar mi resistencia cardiovascular?"
        },
        {
            icon: 'fas fa-utensils',
            text: "Alimentación saludable",
            query: "Recomiéndame un plan de alimentación para mantener un peso saludable"
        },
        {
            icon: 'fas fa-running',
            text: "Ejercicios en casa",
            query: "¿Qué ejercicios puedo hacer en casa sin equipo?"
        }
    ];

    const generalExamples = [
        {
            icon: 'fas fa-lightbulb',
            text: "Consejos productividad",
            query: "¿Cómo puedo mejorar mi productividad durante el día?"
        },
        {
            icon: 'fas fa-book',
            text: "Aprender nuevo skill",
            query: "¿Cuál es la mejor manera de aprender una nueva habilidad?"
        },
        {
            icon: 'fas fa-balance-scale',
            text: "Toma de decisiones",
            query: "¿Qué factores debo considerar al tomar una decisión importante?"
        },
        {
            icon: 'fas fa-users',
            text: "Trabajo en equipo",
            query: "¿Cómo puedo mejorar la comunicación en mi equipo de trabajo?"
        }
    ];

    const currentExamples = chatType === 'fitness' ? fitnessExamples : generalExamples;

    // Scroll al final de los mensajes
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Enviar mensaje
    const sendMessage = async (message = inputMessage) => {
        if (!message.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: message,
            isUser: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setLoading(true);
        setError('');

        try {
            let response;
            if (chatType === 'fitness') {
                response = await chatService.chatFitness(message);
            } else {
                response = await chatService.chatGeneral(message);
            }

            const aiMessage = {
                id: Date.now() + 1,
                text: response.data.response || response.data,
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error en chat:', error);
            setError("Error al conectar con el asistente. Verifica tu conexión.");

            const errorMessage = {
                id: Date.now() + 1,
                text: "Lo siento, hubo un error al procesar tu mensaje. Intenta nuevamente.",
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    // Generar rutina de ejercicios
    const generateWorkoutRoutine = async () => {
        const message = "Por favor genera una rutina de ejercicios personalizada para nivel intermedio";

        setMessages(prev => [...prev, {
            id: Date.now(),
            text: message,
            isUser: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        setLoading(true);
        setError('');

        try {
            const response = await chatService.generateWorkoutRoutine({
                goal: "mejorar condición física",
                level: "intermedio",
                duration: "45 minutos"
            });

            const routineMessage = {
                id: Date.now() + 1,
                text: response.data.response || response.data,
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, routineMessage]);
        } catch (error) {
            console.error('Error generando rutina:', error);
            setError("Error al generar la rutina. Intenta nuevamente.");

            const errorMessage = {
                id: Date.now() + 1,
                text: "Lo siento, hubo un error al generar tu rutina. Intenta con otros parámetros.",
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    // Manejar envío con Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Limpiar chat
    const clearChat = () => {
        setMessages([]);
        setError('');
    };

    return (
        
            <Card className="chat-card">
                {/* Header del Chat */}
                <Card.Header className="chat-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <div className="chat-icon">
                                <i className="fas fa-robot"></i>
                            </div>
                            <div className="ms-3">
                                <h4 className="mb-0">Asistente IA</h4>
                                <small className="text-muted">
                                    {chatType === 'fitness' ? 'Especialista en Fitness y Salud' : 'Asistente General'}
                                </small>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <Form.Select
                                value={chatType}
                                onChange={(e) => setChatType(e.target.value)}
                                className="chat-type-selector"
                                size="sm"
                            >
                                <option value="fitness">Fitness</option>
                                <option value="general">General</option>
                            </Form.Select>
                            <Badge bg={chatType === 'fitness' ? 'primary' : 'secondary'}>
                                {messages.length} mensajes
                            </Badge>
                            {messages.length > 0 && (
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={clearChat}
                                    title="Limpiar conversación"
                                >
                                    <i className="fas fa-trash"></i>
                                </Button>
                            )}
                        </div>
                    </div>
                </Card.Header>

                {/* Área de Mensajes */}
                <Card.Body className="chat-body p-0">
                    {error && (
                        <Alert variant="danger" className="m-3 mb-2" dismissible onClose={() => setError('')}>
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {error}
                        </Alert>
                    )}

                    <div className="messages-container">
                        {messages.length === 0 ? (
                            <div className="welcome-screen">
                                <div className="welcome-content text-center">
                                    <div className="welcome-icon">
                                        <i className="fas fa-robot"></i>
                                    </div>
                                    <h3 className="mt-4">
                                        {chatType === 'fitness' ? '¡Hola! Soy tu Asistente Fitness' : '¡Hola! Soy tu Asistente Personal'}
                                    </h3>
                                    <p className="text-muted mb-4">
                                        {chatType === 'fitness'
                                            ? 'Estoy aquí para ayudarte con rutinas, nutrición y consejos de ejercicio.'
                                            : 'Pregúntame lo que necesites y te ayudaré en lo que pueda.'
                                        }
                                    </p>

                                    {/* Ejemplos Rápidos */}
                                    <div className="examples-section">
                                        <h6 className="section-title">
                                            <i className="fas fa-bolt me-2"></i>
                                            Preguntas Rápidas
                                        </h6>
                                        <div className="examples-grid">
                                            {currentExamples.map((example, index) => (
                                                <div
                                                    key={index}
                                                    className="example-card"
                                                    onClick={() => sendMessage(example.query)}
                                                >
                                                    <div className="example-icon">
                                                        <i className={example.icon}></i>
                                                    </div>
                                                    <div className="example-text">
                                                        {example.text}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Botón de rutina solo para fitness */}
                                    {chatType === 'fitness' && (
                                        <div className="mt-4">
                                            <Button
                                                variant="primary"
                                                onClick={generateWorkoutRoutine}
                                                className="action-button"
                                            >
                                                <i className="fas fa-dumbbell me-2"></i>
                                                Generar Rutina de Ejercicios
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="messages-list">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`message-row ${message.isUser ? 'user-row' : 'ai-row'}`}
                                    >
                                        <div className="message-container">
                                            {!message.isUser && (
                                                <div className="message-avatar">
                                                    <i className="fas fa-robot"></i>
                                                </div>
                                            )}
                                            <div className={`message-bubble ${message.isUser ? 'user-message' : 'ai-message'} ${message.isError ? 'error-message' : ''}`}>
                                                <div className="message-text">
                                                    {message.text.split('\n').map((line, i) => (
                                                        <div key={i}>{line}</div>
                                                    ))}
                                                </div>
                                                <div className="message-time">
                                                    {message.timestamp}
                                                </div>
                                            </div>
                                            {message.isUser && (
                                                <div className="message-avatar user-avatar">
                                                    <i className="fas fa-user"></i>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="message-row ai-row">
                                        <div className="message-container">
                                            <div className="message-avatar">
                                                <i className="fas fa-robot"></i>
                                            </div>
                                            <div className="message-bubble ai-message typing-message">
                                                <div className="typing-indicator">
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Escribiendo...
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                </Card.Body>

                {/* Input del Chat */}
                <Card.Footer className="chat-footer">
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder={
                                chatType === 'fitness'
                                    ? "Escribe tu pregunta sobre fitness, nutrición, ejercicios..."
                                    : "Escribe tu pregunta..."
                            }
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                        <Button
                            variant="primary"
                            onClick={() => sendMessage()}
                            disabled={loading || !inputMessage.trim()}
                            className="send-button"
                        >
                            {loading ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                <i className="fas fa-paper-plane"></i>
                            )}
                        </Button>
                    </InputGroup>
                    <div className="chat-tips mt-2">
                        <small className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            Presiona Enter para enviar • Verifica la información importante
                        </small>
                    </div>
                </Card.Footer>
            </Card>
        
    );
};

export default ChatAI;