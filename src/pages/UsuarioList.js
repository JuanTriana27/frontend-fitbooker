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
    Col
} from 'react-bootstrap';
import { usuarioService } from '../services/usuarioService';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/pages/UsuarioList.css';

const UsuarioList = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal Crear/Editar
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        nombre: '',
        email: '',
        password: '',
        telefono: '',
        rol: ''
    });
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    // Modal Eliminar
    const [showDelete, setShowDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toDelete, setToDelete] = useState(null);

    useEffect(() => {
        loadUsuarios();
    }, []);

    const loadUsuarios = async () => {
        setLoading(true);
        try {
            const response = await usuarioService.getAllUsuarios();
            setUsuarios(response.data || []);
        } catch (err) {
            setError('Error al cargar usuarios: ' + (err.message || err));
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setForm({ nombre: '', email: '', password: '', telefono: '', rol: '' });
        setFormErrors({});
        setShowModal(true);
    };

    const openEditModal = (usuario) => {
        setIsEditing(true);
        setSelectedUsuario(usuario);
        setForm({
            nombre: usuario.nombre || '',
            email: usuario.email || '',
            password: '',
            telefono: usuario.telefono || '',
            rol: usuario.rol || ''
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const validateForm = () => {
        const errs = {};
        if (!form.nombre || form.nombre.trim().length < 2) errs.nombre = 'Nombre válido requerido.';
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email válido requerido.';

        // SOLO validar password en creación, en edición es opcional
        if (!isEditing && (!form.password || form.password.length < 6)) {
            errs.password = 'La contraseña debe tener al menos 6 caracteres.';
        }

        if (form.telefono && !/^[0-9+\s\-()]{6,20}$/.test(form.telefono)) errs.telefono = 'Teléfono inválido.';
        if (!form.rol) errs.rol = 'Rol requerido.';
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSaving(true);
        try {
            // Preparar payload
            const payload = { ...form };

            // En edición, si no se cambió el password, eliminarlo del payload
            if (isEditing && !payload.password) {
                delete payload.password;
            }

            console.log('Enviando datos:', payload); // Para debug

            if (isEditing && selectedUsuario) {
                await usuarioService.updateUsuario(selectedUsuario.idUsuario || selectedUsuario.id, payload);
                setSuccess('Usuario actualizado correctamente.');
            } else {
                await usuarioService.createUsuario(payload);
                setSuccess('Usuario agregado correctamente.');
            }
            setShowModal(false);
            await loadUsuarios();
        } catch (err) {
            console.error('Error completo:', err);
            setError('Error al guardar usuario: ' + (err.response?.data?.message || err.message || err));
        } finally {
            setSaving(false);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const handleDeleteConfirm = (usuario) => {
        setToDelete(usuario);
        setShowDelete(true);
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await usuarioService.deleteUsuario(toDelete.idUsuario || toDelete.id);
            setSuccess('Usuario eliminado correctamente.');
            setShowDelete(false);
            await loadUsuarios();
        } catch (err) {
            setError('Error al eliminar usuario: ' + (err.message || err));
        } finally {
            setDeleting(false);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    if (loading)
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
                <p className="muted">Cargando usuarios...</p>
            </Container>
        );

    return (
        <Container className="usuario-list-container">
            <Row className="align-items-center mb-3">
                <Col>
                    <h2 className="mb-0">Lista de Usuarios</h2>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={openAddModal}>
                        <i className="fas fa-plus me-2"></i> Añadir Usuario
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

            <Table className="shadow-sm usuario-table" striped bordered hover responsive>
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Rol</th>
                        <th>Fecha Registro</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.length > 0 ? (
                        usuarios.map((usuario) => (
                            <tr key={usuario.idUsuario || usuario.id}>
                                <td>{usuario.idUsuario || usuario.id}</td>
                                <td>{usuario.nombre}</td>
                                <td>{usuario.email}</td>
                                <td>{usuario.telefono || 'N/A'}</td>
                                <td>{usuario.rol}</td>
                                <td>
                                    {usuario.fechaRegistro
                                        ? new Date(usuario.fechaRegistro).toLocaleDateString()
                                        : 'N/A'}
                                </td>
                                <td className="acciones-cell">
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => openEditModal(usuario)}
                                    >
                                        <i className="fas fa-edit"></i> Editar
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDeleteConfirm(usuario)}
                                    >
                                        <i className="fas fa-trash-alt"></i> Eliminar
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center">
                                No hay usuarios registrados
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Modal Crear / Editar */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <i className={`fas ${isEditing ? 'fa-edit' : 'fa-user-plus'} me-2`}></i>
                            {isEditing ? 'Editar Usuario' : 'Añadir Usuario'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3" controlId="nombre">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                placeholder="Nombre completo"
                            />
                            {formErrors.nombre && <div className="form-error">{formErrors.nombre}</div>}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="usuario@correo.com"
                            />
                            {formErrors.email && <div className="form-error">{formErrors.email}</div>}
                        </Form.Group>

                        {/* AGREGAR CAMPO PASSWORD */}
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label>
                                Contraseña {isEditing && <small className="text-muted">(Dejar vacío para no cambiar)</small>}
                            </Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder={isEditing ? "Nueva contraseña" : "Contraseña"}
                            />
                            {formErrors.password && <div className="form-error">{formErrors.password}</div>}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="telefono">
                            <Form.Label>Teléfono</Form.Label>
                            <Form.Control
                                name="telefono"
                                value={form.telefono}
                                onChange={handleChange}
                                placeholder="+56 9 1234 5678"
                            />
                            {formErrors.telefono && <div className="form-error">{formErrors.telefono}</div>}
                        </Form.Group>

                        {/* CAMBIAR A COMBOBOX PARA ROL */}
                        <Form.Group className="mb-0" controlId="rol">
                            <Form.Label>Rol</Form.Label>
                            <Form.Select
                                name="rol"
                                value={form.rol}
                                onChange={handleChange}
                            >
                                <option value="">Seleccione un rol</option>
                                <option value="admin">Admin</option>
                                <option value="coach">Coach</option>
                                <option value="socio">Socio</option>
                            </Form.Select>
                            {formErrors.rol && <div className="form-error">{formErrors.rol}</div>}
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
                            ¿Seguro que quieres eliminar a <strong>{toDelete.nombre}</strong> (ID:{' '}
                            {toDelete.idUsuario || toDelete.id})?
                            <p className="text-muted mt-2">Esta acción no se puede deshacer.</p>
                        </>
                    ) : (
                        'Usuario no seleccionado.'
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

export default UsuarioList;
