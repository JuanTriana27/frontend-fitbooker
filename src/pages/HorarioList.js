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
import { horarioService } from '../services/horarioService';
import { usuarioService } from '../services/usuarioService';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/pages/HorarioList.css';

const HorarioList = () => {
    const [horarios, setHorarios] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal Crear/Editar
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        diaSemana: '',
        horaInicio: '',
        horaFin: '',
        coach: ''
    });
    const [selectedHorario, setSelectedHorario] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    // Modal Eliminar
    const [showDelete, setShowDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toDelete, setToDelete] = useState(null);

    // Tabs
    const [activeTab, setActiveTab] = useState('tabla');

    useEffect(() => {
        loadHorarios();
        loadCoaches();
    }, []);

    const loadHorarios = async () => {
        setLoading(true);
        try {
            const response = await horarioService.getAllHorarios();
            setHorarios(response.data || []);
        } catch (err) {
            setError('Error al cargar horarios: ' + (err.message || err));
        } finally {
            setLoading(false);
        }
    };

    const loadCoaches = async () => {
        try {
            const response = await usuarioService.getAllUsuarios();
            const coachesList = response.data.filter(usuario => usuario.rol === 'coach');
            setCoaches(coachesList);
        } catch (err) {
            console.error('Error al cargar coaches:', err);
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setForm({
            diaSemana: '',
            horaInicio: '',
            horaFin: '',
            coach: ''
        });
        setFormErrors({});
        setShowModal(true);
    };

    const openEditModal = (horario) => {
        setIsEditing(true);
        setSelectedHorario(horario);
        setForm({
            diaSemana: horario.diaSemana || '',
            horaInicio: horario.horaInicio || '',
            horaFin: horario.horaFin || '',
            coach: typeof horario.coach === 'object' ?
                (horario.coach.idUsuario || horario.coach.id) :
                horario.coach
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const validateForm = () => {
        const errs = {};
        if (!form.diaSemana) errs.diaSemana = 'Día de la semana requerido.';
        if (!form.horaInicio) errs.horaInicio = 'Hora de inicio requerida.';
        if (!form.horaFin) errs.horaFin = 'Hora de fin requerida.';
        if (!form.coach) errs.coach = 'Coach requerido.';

        if (form.horaInicio && form.horaFin && form.horaInicio >= form.horaFin) {
            errs.horaFin = 'La hora de fin debe ser posterior a la hora de inicio.';
        }

        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSaving(true);
        try {
            if (isEditing && selectedHorario) {
                await horarioService.updateHorario(selectedHorario.idHorario || selectedHorario.id, form);
                setSuccess('Horario actualizado correctamente.');
            } else {
                await horarioService.createHorario(form);
                setSuccess('Horario agregado correctamente.');
            }
            setShowModal(false);
            await loadHorarios();
        } catch (err) {
            setError('Error al guardar horario: ' + (err.response?.data?.message || err.message || err));
        } finally {
            setSaving(false);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const handleDeleteConfirm = (horario) => {
        setToDelete(horario);
        setShowDelete(true);
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await horarioService.deleteHorario(toDelete.idHorario || toDelete.id);
            setSuccess('Horario eliminado correctamente.');
            setShowDelete(false);
            await loadHorarios();
        } catch (err) {
            setError('Error al eliminar horario: ' + (err.response?.data?.message || err.message || err));
        } finally {
            setDeleting(false);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    // Función para formatear el nombre del día
    const getDiaSemanaNombre = (dia) => {
        const dias = {
            'LUNES': 'Lunes',
            'MARTES': 'Martes',
            'MIERCOLES': 'Miércoles',
            'JUEVES': 'Jueves',
            'VIERNES': 'Viernes',
            'SABADO': 'Sábado',
            'DOMINGO': 'Domingo'
        };
        return dias[dia] || dia;
    };

    // Función para agrupar horarios por día
    const horariosPorDia = horarios.reduce((acc, horario) => {
        const dia = horario.diaSemana;
        if (!acc[dia]) acc[dia] = [];
        acc[dia].push(horario);
        return acc;
    }, {});

    // Orden de los días de la semana
    const ordenDias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

    if (loading) return (
        <Container className="text-center mt-5">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
            <p className="muted">Cargando horarios...</p>
        </Container>
    );

    return (
        <Container className="horario-list-container">
            <Row className="align-items-center mb-3">
                <Col>
                    <h2 className="mb-0">Gestión de Horarios</h2>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={openAddModal}>
                        <i className="fas fa-plus me-2"></i> Añadir Horario
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
                    <Table className="shadow-sm horario-table" striped bordered hover responsive>
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Día Semana</th>
                                <th>Hora Inicio</th>
                                <th>Hora Fin</th>
                                <th>Coach</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {horarios.length > 0 ? (
                                horarios.map(horario => (
                                    <tr key={horario.idHorario || horario.id}>
                                        <td>{horario.idHorario || horario.id}</td>
                                        <td>
                                            <span className="badge bg-primary">
                                                {getDiaSemanaNombre(horario.diaSemana)}
                                            </span>
                                        </td>
                                        <td className="fw-semibold text-success">{horario.horaInicio}</td>
                                        <td className="fw-semibold text-danger">{horario.horaFin}</td>
                                        <td>
                                            {typeof horario.coach === 'object' ?
                                                horario.coach.nombre :
                                                coaches.find(c =>
                                                    c.idUsuario === horario.coach || c.id === horario.coach
                                                )?.nombre || 'Coach no encontrado'}
                                        </td>
                                        <td className="acciones-cell">
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => openEditModal(horario)}
                                            >
                                                <i className="fas fa-edit"></i> Editar
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDeleteConfirm(horario)}
                                            >
                                                <i className="fas fa-trash-alt"></i> Eliminar
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center">
                                        No hay horarios registrados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Tab>

                <Tab eventKey="semana" title="Vista Semana">
                    <Row>
                        {ordenDias.map(dia => (
                            <Col key={dia} md={6} lg={4} className="mb-3">
                                <Card className="h-100 shadow-sm">
                                    <Card.Header className="table-dark">
                                        <strong>{getDiaSemanaNombre(dia)}</strong>
                                    </Card.Header>
                                    <Card.Body>
                                        {horariosPorDia[dia] ? (
                                            horariosPorDia[dia]
                                                .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                                                .map(horario => (
                                                    <div key={horario.idHorario || horario.id}
                                                        className="border-bottom pb-2 mb-2">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                <strong className="text-success">
                                                                    {horario.horaInicio}
                                                                </strong>
                                                                <span className="mx-1">-</span>
                                                                <strong className="text-danger">
                                                                    {horario.horaFin}
                                                                </strong>
                                                                <br />
                                                                <small className="text-muted">
                                                                    Coach: {typeof horario.coach === 'object' ?
                                                                        horario.coach.nombre :
                                                                        coaches.find(c =>
                                                                            c.idUsuario === horario.coach ||
                                                                            c.id === horario.coach
                                                                        )?.nombre || 'N/A'}
                                                                </small>
                                                            </div>
                                                            <div>
                                                                <Button
                                                                    variant="outline-warning"
                                                                    size="sm"
                                                                    className="me-1"
                                                                    onClick={() => openEditModal(horario)}
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteConfirm(horario)}
                                                                >
                                                                    <i className="fas fa-trash-alt"></i>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <p className="text-muted text-center mb-0">No hay horarios este día</p>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Tab>
            </Tabs>

            {/* Modal Crear / Editar */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus'} me-2`}></i>
                            {isEditing ? 'Editar Horario' : 'Añadir Horario'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3" controlId="diaSemana">
                            <Form.Label>Día de la Semana</Form.Label>
                            <Form.Select
                                name="diaSemana"
                                value={form.diaSemana}
                                onChange={handleChange}
                            >
                                <option value="">Seleccione un día</option>
                                <option value="LUNES">Lunes</option>
                                <option value="MARTES">Martes</option>
                                <option value="MIERCOLES">Miércoles</option>
                                <option value="JUEVES">Jueves</option>
                                <option value="VIERNES">Viernes</option>
                                <option value="SABADO">Sábado</option>
                                <option value="DOMINGO">Domingo</option>
                            </Form.Select>
                            {formErrors.diaSemana && <div className="form-error">{formErrors.diaSemana}</div>}
                        </Form.Group>

                        <Row>
                            <Col>
                                <Form.Group className="mb-3" controlId="horaInicio">
                                    <Form.Label>Hora Inicio</Form.Label>
                                    <Form.Control
                                        type="time"
                                        name="horaInicio"
                                        value={form.horaInicio}
                                        onChange={handleChange}
                                    />
                                    {formErrors.horaInicio && <div className="form-error">{formErrors.horaInicio}</div>}
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3" controlId="horaFin">
                                    <Form.Label>Hora Fin</Form.Label>
                                    <Form.Control
                                        type="time"
                                        name="horaFin"
                                        value={form.horaFin}
                                        onChange={handleChange}
                                    />
                                    {formErrors.horaFin && <div className="form-error">{formErrors.horaFin}</div>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-0" controlId="coach">
                            <Form.Label>Coach</Form.Label>
                            <Form.Select
                                name="coach"
                                value={form.coach}
                                onChange={handleChange}
                            >
                                <option value="">Seleccione un coach</option>
                                {coaches.map(coach => (
                                    <option key={coach.idUsuario || coach.id} value={coach.idUsuario || coach.id}>
                                        {coach.nombre} - {coach.email}
                                    </option>
                                ))}
                            </Form.Select>
                            {formErrors.coach && <div className="form-error">{formErrors.coach}</div>}
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
                            ¿Seguro que quieres eliminar el horario del día <strong>{getDiaSemanaNombre(toDelete.diaSemana)}</strong> ({toDelete.horaInicio} - {toDelete.horaFin})?
                            <p className="text-muted mt-2">Esta acción no se puede deshacer.</p>
                        </>
                    ) : (
                        'Horario no seleccionado.'
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

export default HorarioList;