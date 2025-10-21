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
import { reservaService } from '../services/reservaService';
import { claseService } from '../services/claseService';
import { usuarioService } from '../services/usuarioService';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/pages/ReservaList.css';

const ReservaList = () => {
    const [reservas, setReservas] = useState([]);
    const [clases, setClases] = useState([]);
    const [socios, setSocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal Crear/Editar
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        socio: '',
        clase: '',
        estado: 'pendiente'
    });
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    // Modal Eliminar
    const [showDelete, setShowDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toDelete, setToDelete] = useState(null);

    // Tabs
    const [activeTab, setActiveTab] = useState('tabla');

    useEffect(() => {
        loadReservas();
        loadClases();
        loadSocios();
    }, []);

    const loadReservas = async () => {
        setLoading(true);
        try {
            const response = await reservaService.getAllReservas();
            setReservas(response.data || []);
        } catch (err) {
            setError('Error al cargar reservas: ' + (err.message || err));
        } finally {
            setLoading(false);
        }
    };

    const loadClases = async () => {
        try {
            const response = await claseService.getAllClases();
            console.log('Clases cargadas:', response.data);
            // Filtrar solo clases futuras (no filtramos por cupo para mostrar todas)
            const clasesFiltradas = response.data.filter(clase => {
                if (!clase.fechaClase) return false;
                const fechaClase = new Date(clase.fechaClase);
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                return fechaClase >= hoy;
            });
            setClases(clasesFiltradas);
        } catch (err) {
            console.error('Error al cargar clases:', err);
            setClases([]);
        }
    };

    const loadSocios = async () => {
        try {
            const response = await usuarioService.getAllUsuarios();
            const sociosList = response.data.filter(usuario => usuario.rol === 'socio');
            setSocios(sociosList);
        } catch (err) {
            console.error('Error al cargar socios:', err);
            setSocios([]);
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setForm({
            socio: '',
            clase: '',
            estado: 'pendiente'
        });
        setFormErrors({});
        setShowModal(true);
    };

    const openEditModal = (reserva) => {
        setIsEditing(true);
        setSelectedReserva(reserva);

        // Obtener IDs correctos para socio y clase
        const socioId = typeof reserva.socio === 'object' ?
            (reserva.socio.idUsuario || reserva.socio.id) :
            reserva.socio;

        const claseId = typeof reserva.clase === 'object' ?
            (reserva.clase.idClase || reserva.clase.id) :
            reserva.clase;

        setForm({
            socio: socioId,
            clase: claseId,
            estado: reserva.estado || 'pendiente'
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const validateForm = () => {
        const errs = {};
        if (!form.socio) errs.socio = 'Socio requerido.';
        if (!form.clase) errs.clase = 'Clase requerida.';
        if (!form.estado) errs.estado = 'Estado requerido.';

        // Validar que el estado sea uno de los permitidos
        const estadosPermitidos = ['pendiente', 'confirmado', 'cancelado'];
        if (form.estado && !estadosPermitidos.includes(form.estado)) {
            errs.estado = 'Estado no válido. Debe ser: pendiente, confirmado o cancelado.';
        }

        // Validar cupo disponible para nuevas reservas o cambios a estados que ocupan cupo
        if (!isEditing && (form.estado === 'pendiente' || form.estado === 'confirmado')) {
            const claseSeleccionada = clases.find(c =>
                c.idClase === form.clase || c.id === form.clase
            );
            if (claseSeleccionada && claseSeleccionada.cupoDisponible <= 0) {
                errs.clase = 'No hay cupos disponibles para esta clase.';
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
            // Preparar el payload según lo que espera el backend
            const payload = {
                socio: parseInt(form.socio),
                clase: parseInt(form.clase),
                estado: form.estado,
                fechaReserva: isEditing && selectedReserva?.fechaReserva ?
                    selectedReserva.fechaReserva :
                    new Date().toISOString()
            };

            console.log('Enviando payload:', payload);

            if (isEditing && selectedReserva) {
                await reservaService.updateReserva(selectedReserva.idReserva || selectedReserva.id, payload);
                setSuccess('Reserva actualizada correctamente.');
            } else {
                await reservaService.createReserva(payload);
                setSuccess('Reserva creada correctamente.');
            }
            setShowModal(false);
            await loadReservas();
            await loadClases(); // Recargar clases para actualizar cupos
        } catch (err) {
            console.error('Error completo:', err);
            const errorMessage = err.response?.data?.message || err.message || err;
            setError('Error al guardar reserva: ' + errorMessage);
        } finally {
            setSaving(false);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const handleDeleteConfirm = (reserva) => {
        setToDelete(reserva);
        setShowDelete(true);
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await reservaService.deleteReserva(toDelete.idReserva || toDelete.id);
            setSuccess('Reserva eliminada correctamente.');
            setShowDelete(false);
            await loadReservas();
            await loadClases(); // Recargar clases para actualizar cupos
        } catch (err) {
            setError('Error al eliminar reserva: ' + (err.response?.data?.message || err.message || err));
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

    // Función para formatear fecha y hora
    const formatFechaHora = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleString('es-ES');
    };

    // Función para obtener información de la clase
    const getClaseInfo = (reserva) => {
        if (typeof reserva.clase === 'object') {
            return reserva.clase;
        }
        const claseId = reserva.clase;
        return clases.find(c =>
            c.idClase === claseId || c.id === claseId
        );

    };

    // Función para obtener información del socio
    const getSocioInfo = (reserva) => {
        if (typeof reserva.socio === 'object') {
            return reserva.socio;
        }
        const socioId = reserva.socio;
        return socios.find(s =>
            s.idUsuario === socioId || s.id === socioId
        );
    };

    // Función para agrupar reservas por fecha de clase
    const reservasPorFecha = reservas.reduce((acc, reserva) => {
        const claseInfo = getClaseInfo(reserva);
        if (!claseInfo || !claseInfo.fechaClase) return acc;

        const fecha = claseInfo.fechaClase.split('T')[0];
        if (!acc[fecha]) acc[fecha] = [];
        acc[fecha].push(reserva);
        return acc;
    }, {});

    // Ordenar fechas
    const fechasOrdenadas = Object.keys(reservasPorFecha).sort();

    // Función para obtener el badge según el estado
    const getEstadoBadge = (estado) => {
        const estados = {
            'pendiente': 'warning',
            'confirmado': 'success',
            'cancelado': 'danger'
        };
        return estados[estado] || 'secondary';
    };

    // Función para obtener el texto del estado en español
    const getEstadoTexto = (estado) => {
        const estados = {
            'pendiente': 'Pendiente',
            'confirmado': 'Confirmado',
            'cancelado': 'Cancelado'
        };
        return estados[estado] || estado;
    };

    if (loading) return (
        <Container className="text-center mt-5">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
            <p className="muted">Cargando reservas...</p>
        </Container>
    );

    return (
        <Container className="reserva-list-container">
            <Row className="align-items-center mb-3">
                <Col>
                    <h2 className="mb-0">Gestión de Reservas</h2>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={openAddModal}>
                        <i className="fas fa-plus me-2"></i> Nueva Reserva
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
                    <Table className="shadow-sm reserva-table" striped bordered hover responsive>
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Fecha Reserva</th>
                                <th>Estado</th>
                                <th>Socio</th>
                                <th>Clase</th>
                                <th>Fecha Clase</th>
                                <th>Cupos Clase</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservas.length > 0 ? (
                                reservas.map(reserva => {
                                    const claseInfo = getClaseInfo(reserva);
                                    const socioInfo = getSocioInfo(reserva);

                                    return (
                                        <tr key={reserva.idReserva || reserva.id}>
                                            <td>{reserva.idReserva || reserva.id}</td>
                                            <td>
                                                {reserva.fechaReserva ?
                                                    formatFechaHora(reserva.fechaReserva) :
                                                    'N/A'}
                                            </td>
                                            <td>
                                                <span className={`badge bg-${getEstadoBadge(reserva.estado)}`}>
                                                    {getEstadoTexto(reserva.estado)}
                                                </span>
                                            </td>
                                            <td>
                                                {socioInfo ?
                                                    `${socioInfo.nombre} (ID: ${socioInfo.idUsuario || socioInfo.id})` :
                                                    `Socio ID: ${reserva.socio}`}
                                            </td>
                                            <td>
                                                {claseInfo ?
                                                    claseInfo.nombre :
                                                    `Clase ID: ${reserva.clase}`}
                                            </td>
                                            <td>
                                                {claseInfo && claseInfo.fechaClase ?
                                                    formatFecha(claseInfo.fechaClase) :
                                                    'N/A'}
                                            </td>
                                            <td>
                                                {claseInfo && (
                                                    <span className={claseInfo.cupoDisponible <= 0 ? 'text-danger' : 'text-success'}>
                                                        {claseInfo.cupoDisponible}/{claseInfo.cupoMaximo}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="acciones-cell">
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => openEditModal(reserva)}
                                                >
                                                    <i className="fas fa-edit"></i> Editar
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteConfirm(reserva)}
                                                >
                                                    <i className="fas fa-trash-alt"></i> Eliminar
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">
                                        No hay reservas registradas
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
                                            {reservasPorFecha[fecha].map(reserva => {
                                                const claseInfo = getClaseInfo(reserva);
                                                const socioInfo = getSocioInfo(reserva);

                                                return (
                                                    <div key={reserva.idReserva || reserva.id}
                                                        className="border-bottom pb-2 mb-2">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div className="flex-grow-1">
                                                                <h6 className="mb-1 text-primary">
                                                                    {claseInfo?.nombre || `Clase ID: ${reserva.clase}`}
                                                                </h6>
                                                                <div className="d-flex align-items-center mb-1">
                                                                    <i className="fas fa-clock text-muted me-2 small"></i>
                                                                    {claseInfo ? (
                                                                        <>
                                                                            <span className="text-success fw-semibold">
                                                                                {claseInfo.horaInicio}
                                                                            </span>
                                                                            <span className="mx-1">-</span>
                                                                            <span className="text-danger fw-semibold">
                                                                                {claseInfo.horaFin}
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-muted">Horario no disponible</span>
                                                                    )}
                                                                </div>
                                                                <div className="d-flex align-items-center mb-1">
                                                                    <i className="fas fa-user text-muted me-2 small"></i>
                                                                    <small className="text-muted">
                                                                        Socio: {socioInfo?.nombre || `ID: ${reserva.socio}`}
                                                                    </small>
                                                                </div>
                                                                <div className="d-flex align-items-center mb-1">
                                                                    <i className="fas fa-users text-muted me-2 small"></i>
                                                                    <small className="text-muted">
                                                                        Cupos: {claseInfo?.cupoDisponible || 0}/{claseInfo?.cupoMaximo || 0}
                                                                    </small>
                                                                </div>
                                                                <div className="d-flex align-items-center">
                                                                    <span className={`badge bg-${getEstadoBadge(reserva.estado)} me-2`}>
                                                                        {getEstadoTexto(reserva.estado)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Button
                                                                    variant="outline-warning"
                                                                    size="sm"
                                                                    className="me-1 mb-1"
                                                                    onClick={() => openEditModal(reserva)}
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    className="mb-1"
                                                                    onClick={() => handleDeleteConfirm(reserva)}
                                                                >
                                                                    <i className="fas fa-trash-alt"></i>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col>
                                <div className="text-center text-muted py-5">
                                    <i className="fas fa-calendar-times fa-3x mb-3"></i>
                                    <p>No hay reservas programadas</p>
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
                            {isEditing ? 'Editar Reserva' : 'Nueva Reserva'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="socio">
                                    <Form.Label>Socio *</Form.Label>
                                    <Form.Select
                                        name="socio"
                                        value={form.socio}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.socio}
                                        disabled={isEditing} // No permitir cambiar socio en edición
                                    >
                                        <option value="">Seleccione un socio</option>
                                        {socios.map(socio => (
                                            <option key={socio.idUsuario || socio.id} value={socio.idUsuario || socio.id}>
                                                {socio.nombre} - {socio.email}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {formErrors.socio && <div className="form-error">{formErrors.socio}</div>}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="estado">
                                    <Form.Label>Estado *</Form.Label>
                                    <Form.Select
                                        name="estado"
                                        value={form.estado}
                                        onChange={handleChange}
                                        isInvalid={!!formErrors.estado}
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="confirmado">Confirmado</option>
                                        <option value="cancelado">Cancelado</option>
                                    </Form.Select>
                                    {formErrors.estado && <div className="form-error">{formErrors.estado}</div>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-0" controlId="clase">
                            <Form.Label>Clase *</Form.Label>
                            <Form.Select
                                name="clase"
                                value={form.clase}
                                onChange={handleChange}
                                isInvalid={!!formErrors.clase}
                                disabled={isEditing} // No permitir cambiar clase en edición
                            >
                                <option value="">Seleccione una clase</option>
                                {clases.length > 0 ? (
                                    clases.map(clase => (
                                        <option
                                            key={clase.idClase || clase.id}
                                            value={clase.idClase || clase.id}
                                            disabled={clase.cupoDisponible <= 0 && !isEditing}
                                        >
                                            {clase.nombre} - {formatFecha(clase.fechaClase)} {clase.horaInicio}
                                            {clase.cupoDisponible !== undefined &&
                                                ` (Cupos: ${clase.cupoDisponible}/${clase.cupoMaximo})`}
                                            {clase.cupoDisponible <= 0 && !isEditing && ' - SIN CUPOS'}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No hay clases disponibles</option>
                                )}
                            </Form.Select>
                            {formErrors.clase && <div className="form-error">{formErrors.clase}</div>}
                            {clases.length === 0 && (
                                <div className="text-warning mt-1">
                                    <small>No hay clases disponibles. Verifica que existan clases futuras.</small>
                                </div>
                            )}
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
                                isEditing ? 'Actualizar' : 'Crear Reserva'
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
                            ¿Seguro que quieres eliminar la reserva del socio <strong>{getSocioInfo(toDelete)?.nombre || `ID: ${toDelete.socio}`}</strong> para la clase <strong>{getClaseInfo(toDelete)?.nombre || `ID: ${toDelete.clase}`}</strong>?
                            <p className="text-muted mt-2">Esta acción no se puede deshacer.</p>
                        </>
                    ) : (
                        'Reserva no seleccionada.'
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

export default ReservaList;