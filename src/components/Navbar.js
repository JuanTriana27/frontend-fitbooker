import React, { useState } from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/components/Navbar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const NavigationBar = () => {
    const [showEndpoints, setShowEndpoints] = useState(false);

    const endpoints = [
        { name: 'Usuarios', url: 'https://gimnasio-app-8i5w.onrender.com/usuarios', method: 'GET' },
        { name: 'Horarios', url: 'https://gimnasio-app-8i5w.onrender.com/horarios', method: 'GET' },
        { name: 'Clases', url: 'https://gimnasio-app-8i5w.onrender.com/clases', method: 'GET' },
        { name: 'Reservas', url: 'https://gimnasio-app-8i5w.onrender.com/reservas', method: 'GET' },
        { name: 'Asistente AI', url: 'https://gimnasio-app-8i5w.onrender.com/ia', method: 'POST' }
    ];

    const openEndpoint = (url) => {
        window.open(url, '_blank');
    };

    return (
        <Navbar expand="lg" className="custom-navbar" variant="dark" sticky="top">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    <i className="fas fa-dumbbell"></i> Gimnasio App
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/usuarios">
                            <i className="fas fa-users"></i> Usuarios
                        </Nav.Link>
                        <Nav.Link as={Link} to="/horarios">
                            <i className="fas fa-clock"></i> Horarios
                        </Nav.Link>
                        <Nav.Link as={Link} to="/clases">
                            <i className="fas fa-dumbbell"></i> Clases
                        </Nav.Link>
                        <Nav.Link as={Link} to="/reservas">
                            <i className="fas fa-calendar-alt"></i> Reservas
                        </Nav.Link>
                        <Nav.Link as={Link} to="/ia">
                            <i className="fas fa-robot"></i> Asistente AI
                        </Nav.Link>

                        {/* Botón desplegable de Endpoints */}
                        <Dropdown
                            align="end"
                            onToggle={(isOpen) => setShowEndpoints(isOpen)}
                            show={showEndpoints}
                        >
                            <Dropdown.Toggle
                                as={Nav.Link}
                                className="endpoints-toggle"
                                style={{ cursor: 'pointer' }}
                            >
                                <i className="fas fa-external-link-alt"></i> Ver Endpoints
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="endpoints-dropdown">
                                <Dropdown.Header>
                                    <i className="fas fa-plug"></i> Endpoints Disponibles
                                </Dropdown.Header>
                                {endpoints.map((endpoint, index) => (
                                    <Dropdown.Item
                                        key={index}
                                        onClick={() => openEndpoint(endpoint.url)}
                                        className="endpoint-item"
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <span className="badge bg-primary me-2">{endpoint.method}</span>
                                                <strong>{endpoint.name}</strong>
                                            </div>
                                            <i className="fas fa-external-link-alt text-muted"></i>
                                        </div>
                                        <small className="text-muted d-block mt-1 endpoint-url">
                                            {endpoint.url}
                                        </small>
                                    </Dropdown.Item>
                                ))}
                                <Dropdown.Divider />
                                <Dropdown.Item
                                    onClick={() => openEndpoint('https://gimnasio-app-8i5w.onrender.com')}
                                    className="text-center"
                                >
                                    <i className="fas fa-server me-2"></i>
                                    Ver API Base
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;