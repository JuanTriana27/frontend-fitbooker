import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/components/Navbar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const NavigationBar = () => {
    return (
        <Navbar expand="lg" className="custom-navbar" variant="dark" sticky="top">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    <i className="fas fa-dumbbell"></i> Gimnasio App
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto"> {/* <-- alineado a la derecha */}
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
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;
