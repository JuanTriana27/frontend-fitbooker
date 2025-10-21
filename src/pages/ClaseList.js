import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Container,
    Alert,
    Spinner,
    Modal,
    Form,
    Row,
    Col,
    Card,
    Tab,
    Tabs
} from 'react-bootstrap';
import { claseService } from '../services/claseService';
import { usuarioService } from '../services/usuarioService';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/pages/ClaseList.css';

const ClaseList = () => {
    const [clases, setClases] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal Crear/Editar
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        fechaClase: '',
        horaInicio: '',
        horaFin: '',
        cupoMaximo: '',
        idCoach: ''
    });
    const [selectedClase, setSelectedClase] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    // Modal Eliminar
    const [showDelete, setShowDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toDelete, setToDelete] = useState(null);

    // Tabs
    const [activeTab, setActiveTab] = useState('tabla');

    useEffect(() => {
        loadClases();
        loadCoaches();
    }, []);

    const loadClases = async () => {
        setLoading(true);
        try {
            const response = await claseService.getAllClases();
            console.log('Clases cargadas:', response.data);
            setClases(response.data || []);
        } catch (err) {
            setError('Error al cargar clases: ' + (err.message || err));
        } finally {
            setLoading(false);
        }
    };

    const loadCoaches = async () => {
        try {
            const response = await usuarioService.getAllUsuarios();
            const coachesList = response.data.filter(usuario => usuario.rol === 'coach');
            console.log('Coaches cargados:', coachesList);
            setCoaches(coachesList);
        } catch (err) {
            console.error('Error al cargar coaches:', err);
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setForm({
            nombre: '',
            descripcion: '',
            fechaClase: '',
            horaInicio: '',
            horaFin: '',
            cupoMaximo: '',
            idCoach: ''
        });
        setFormErrors({});
        setShowModal(true);
    };

    const openEditModal = (clase) => {
        setIsEditing(true);
        setSelectedClase(clase);
        setForm({
            nombre: clase.nombre || '',
            descripcion: clase.descripcion || '',
            fechaClase: clase.fechaClase ? clase.fechaClase.split('T')[0] : '',
            horaInicio: clase.horaInicio || '',
            horaFin: clase.horaFin || '',
            cupoMaximo: clase.cupoMaximo || '',
            idCoach: typeof clase.coach === 'object' ?
                (clase.coach.idUsuario || clase.coach.id) :
                clase.coach
        });
        // IMPORTANTE: Guardar cupoDisponible de la clase seleccionada
        setSelectedClase(prev => ({ ...prev, cupoDisponible: clase.cupoDisponible }));
        setFormErrors({});
        setShowModal(true);
    };

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const validateForm = () => {
        const errs = {};
        if (!form.nombre || form.nombre.trim().length < 2) errs.nombre = 'Nombre válido requerido.';
        if (!form.descripcion || form.descripcion.trim().length < 5) errs.descripcion = 'Descripción válida requerida.';
        if (!form.fechaClase) errs.fechaClase = 'Fecha de clase requerida.';
        if (!form.horaInicio) errs.horaInicio = 'Hora de inicio requerida.';
        if (!form.horaFin) errs.horaFin = 'Hora de fin requerida.';
        if (!form.cupoMaximo || form.cupoMaximo < 1) errs.cupoMaximo = 'Cupo máximo válido requerido.';
        if (!form.idCoach) errs.idCoach = 'Coach requerido.';

        if (form.horaInicio && form.horaFin && form.horaInicio >= form.horaFin) {
            errs.horaFin = 'La hora de fin debe ser posterior a la hora de inicio.';
        }

        // Validar que la fecha no sea en el pasado
        if (form.fechaClase) {
            const today = new Date().toISOString().split('T')[0];
            if (form.fechaClase < today) {
                errs.fechaClase = 'La fecha no puede ser en el pasado.';
            }
        }

        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSaving(true);
        try {
            // Preparar el payload CORREGIDO - INCLUYENDO cupoDisponible
            const payload = {
                nombre: form.nombre,
                descripcion: form.descripcion,
                fechaClase: form.fechaClase,
                horaInicio: form.horaInicio + ':00',
                horaFin: form.horaFin + ':00',
                cupoMaximo: parseInt(form.cupoMaximo),
                cupoDisponible: isEditing ?
                    (selectedClase.cupoDisponible || parseInt(form.cupoMaximo)) : // En edición, mantener el actual
                    parseInt(form.cupoMaximo), // En creación, igual al máximo
                idCoach: parseInt(form.idCoach)
            };

            console.log('Enviando payload:', payload);

            if (isEditing && selectedClase) {
                await claseService.updateClase(selectedClase.idClase || selectedClase.id, payload);
                setSuccess('Clase actualizada correctamente.');
            } else {
                await claseService.createClase(payload);
                setSuccess('Clase agregada correctamente.');
            }
            setShowModal(false);
            await loadClases();
        } catch (err) {
            console.error('Error completo:', err);
            const errorMessage = err.response?.data?.message || err.message || err;
            setError('Error al guardar clase: ' + errorMessage);

            // Debug detallado
            if (err.response) {
                console.error('Respuesta del error:', err.response.data);
                console.error('Status del error:', err.response.status);
            }
        } finally {
            setSaving(false);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const handleDeleteConfirm = (clase) => {
        setToDelete(clase);
        setShowDelete(true);
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await claseService.deleteClase(toDelete.idClase || toDelete.id);
            setSuccess('Clase eliminada correctamente.');
            setShowDelete(false);
            await loadClases();
        } catch (err) {
            setError('Error al eliminar clase: ' + (err.response?.data?.message || err.message || err));
        } finally {
            setDeleting(false);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    // Función para formatear la fecha
    const formatFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Función para agrupar clases por fecha
    const clasesPorFecha = clases.reduce((acc, clase) => {
        const fecha = clase.fechaClase ? clase.fechaClase.split('T')[0] : 'Sin fecha';
        if (!acc[fecha]) acc[fecha] = [];
        acc[fecha].push(clase);
        return acc;
    }, {});

    // Ordenar fechas
    const fechasOrdenadas = Object.keys(clasesPorFecha).sort();

    if (loading) return (
        <Container className="text-center mt-5">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
            <p className="muted">Cargando clases...</p>
        </Container>
    );

    return (
        <Container className="clase-list-container">
            <Row className="align-items-center mb-3">
                <Col>
                    <h2 className="mb-0">Gestión de Clases</h2>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={openAddModal}>
                        <i className="fas fa-plus me-2"></i> Añadir Clase
                    </Button>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert variant="success" onClose={() => setSuccess('')} dismissible>
                    {success}
                </Alert>
            )}

            <Tabs
                activeKey={activeTab}
                onSelect={(tab) => setActiveTab(tab)}
                className="mb-3"
            >
                <Tab eventKey="tabla" title="Vista Tabla">
                    <Table className="shadow-sm clase-table" striped bordered hover responsive>
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Fecha</th>
                                <th>Horario</th>
                                <th>Cupos</th>
                                <th>Coach</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clases.length > 0 ? (
                                clases.map(clase => (
                                    <tr key={clase.idClase || clase.id}>
                                        <td>{clase.idClase || clase.id}</td>
                                        <td className="fw-bold">{clase.nombre}</td>
                                        <td>
                                            <small className="text-muted">
                                                {clase.descripcion?.length > 50
                                                    ? `${clase.descripcion.substring(0, 50)}...`
                                                    : clase.descripcion}
                                            </small>
                                        </td>
                                        <td>
                                            <span className="badge bg-info">
                                                {formatFecha(clase.fechaClase)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-success fw-semibold">{clase.horaInicio}</span>
                                            <span className="mx-1">-</span>
                                            <span className="text-danger fw-semibold">{clase.horaFin}</span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <span className="fw-semibold">{clase.cupoDisponible || 0}</span>
                                                <span className="mx-1">/</span>
                                                <span className="text-muted">{clase.cupoMaximo}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {typeof clase.coach === 'object' ?
                                                clase.coach.nombre :
                                                coaches.find(c =>
                                                    c.idUsuario === clase.coach || c.id === clase.coach
                                                )?.nombre || 'Coach no encontrado'}
                                        </td>
                                        <td className="acciones-cell">
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => openEditModal(clase)}
                                            >
                                                <i className="fas fa-edit"></i> Editar
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDeleteConfirm(clase)}
                                            >
                                                <i className="fas fa-trash-alt"></i> Eliminar
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">
                                        No hay clases registradas
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Tab>

                <Tab eventKey="calendario" title="Vista Calendario">
                    <Row>
                        {fechasOrdenadas.length > 0 ? (
                            fechasOrdenadas.map(fecha => (
                                <Col key={fecha} md={6} lg={4} className="mb-3">
                                    <Card className="h-100 shadow-sm">
                                        <Card.Header className="table-dark">
                                            <strong>{formatFecha(fecha)}</strong>
                                        </Card.Header>
                                        <Card.Body>
                                            {clasesPorFecha[fecha].map(clase => (
                                                <div key={clase.idClase || clase.id}
                                                    className="border-bottom pb-2 mb-2">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div className="flex-grow-1">
                                                            <h6 className="mb-1 text-primary">{clase.nombre}</h6>
                                                            <div className="d-flex align-items-center mb-1">
                                                                <i className="fas fa-clock text-muted me-2 small"></i>
                                                                <strong className="text-success">{clase.horaInicio}</strong>
                                                                <span className="mx-1">-</span>
                                                                <strong className="text-danger">{clase.horaFin}</strong>
                                                            </div>
                                                            <div className="d-flex align-items-center mb-1">
                                                                <i className="fas fa-user text-muted me-2 small"></i>
                                                                <small className="text-muted">
                                                                    Coach: {typeof clase.coach === 'object' ?
                                                                        clase.coach.nombre :
                                                                        coaches.find(c =>
                                                                            c.idUsuario === clase.coach ||
                                                                            c.id === clase.coach
                                                                        )?.nombre || 'N/A'}
                                                                </small>
                                                            </div>
                                                            <div className="d-flex align-items-center">
                                                                <i className="fas fa-users text-muted me-2 small"></i>
                                                                <small className="text-muted">
                                                                    Cupos: {clase.cupoDisponible || 0}/{clase.cupoMaximo}
                                                                </small>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Button
                                                                variant="outline-warning"
                                                                size="sm"
                                                                className="me-1 mb-1"
                                                                onClick={() => openEditModal(clase)}
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                className="mb-1"
                                                                onClick={() => handleDeleteConfirm(clase)}
                                                            >
                                                                <i className="fas fa-trash-alt"></i>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {clase.descripcion && (
                                                        <small className="text-muted d-block mt-1">
                                                            {clase.descripcion.length > 80
                                                                ? `${clase.descripcion.substring(0, 80)}...`
                                                                : clase.descripcion}
                                                        </small>
                                                    )}
                                                </div>
                                            ))}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col>
                                <div className="text-center text-muted py-5">
                                    <i className="fas fa-calendar-times fa-3x mb-3"></i>
                                    <p>No hay clases programadas</p>
                                </div>
                            </Col>
                        )}
                    </Row>
                </Tab>
            </Tabs>

            {/* Modal Crear / Editar */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus'} me-2`}></i>
                            {isEditing ? 'Editar Clase' : 'Añadir Clase'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3" controlId="nombre">
                            <Form.Label>Nombre de la Clase *</Form.Label>
                            <Form.Control
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Yoga Matutino, CrossFit Avanzado"
                                isInvalid={!!formErrors.nombre}
                            />
                            {formErrors.nombre && <div className="form-error">{formErrors.nombre}</div>}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="descripcion">
                            <Form.Label>Descripción *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="descripcion"
                                value={form.descripcion}
                                onChange={handleChange}
                                placeholder="Describe la clase, ejercicios, nivel de dificultad..."
                                isInvalid={!!formErrors.descripcion}
                            />
                            {formErrors.descripcion && <div className="form-error">{formErrors.descripcion}</div>}
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="fechaClase">
                                    <Form.Label>Fecha de la Clase *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="fechaClase"
                                        value={form.fechaClase}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        isInvalid={!!formErrors.fechaClase}
                                    />
                                    {formErrors.fechaClase && <div className="form-error">{formErrors.fechaClase}</div>}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="cupoMaximo">
                                    <Form.Label>Cupo Máximo *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="cupoMaximo"
                                        value={form.cupoMaximo}
                                        onChange={handleChange}
                                        placeholder="Ej: 20"
                                        min="1"
                                        isInvalid={!!formErrors.cupoMaximo}
                                    />
                                    {formErrors.cupoMaximo && <div className="form-error">{formErrors.cupoMaximo}</div>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="horaInicio">
                                    <Form.Label>Hora Inicio *</Form.Label>
                                    <Form.Control
                                        type="time"
                                        name="horaInicio"
                                        value={form.horaInicio}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.horaInicio}
                                    />
                                    {formErrors.horaInicio && <div className="form-error">{formErrors.horaInicio}</div>}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="horaFin">
                                    <Form.Label>Hora Fin *</Form.Label>
                                    <Form.Control
                                        type="time"
                                        name="horaFin"
                                        value={form.horaFin}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.horaFin}
                                    />
                                    {formErrors.horaFin && <div className="form-error">{formErrors.horaFin}</div>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-0" controlId="idCoach">
                            <Form.Label>Coach *</Form.Label>
                            <Form.Select
                                name="idCoach"
                                value={form.idCoach}
                                onChange={handleChange}
                                isInvalid={!!formErrors.idCoach}
                            >
                                <option value="">Seleccione un coach</option>
                                {coaches.map(coach => (
                                    <option key={coach.idUsuario || coach.id} value={coach.idUsuario || coach.id}>
                                        {coach.nombre} - {coach.email}
                                    </option>
                                ))}
                            </Form.Select>
                            {formErrors.idCoach && <div className="form-error">{formErrors.idCoach}</div>}
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={saving}>
                            {saving ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" /> Guardando...
                                </>
                            ) : (
                                isEditing ? 'Actualizar' : 'Guardar'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Eliminar */}
            <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="fas fa-exclamation-triangle me-2 text-danger"></i> Confirmar eliminación
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {toDelete ? (
                        <>
                            ¿Seguro que quieres eliminar la clase <strong>"{toDelete.nombre}"</strong> programada para el día {formatFecha(toDelete.fechaClase)}?
                            <p className="text-muted mt-2">Esta acción no se puede deshacer.</p>
                        </>
                    ) : (
                        'Clase no seleccionada.'
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDelete(false)} disabled={deleting}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                        {deleting ? <Spinner animation="border" size="sm" /> : 'Eliminar'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ClaseList;