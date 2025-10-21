// Componente de Calendario Avanzado
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarioAvanzado = ({ horarios, coaches }) => {
    const events = horarios.map(horario => ({
        id: horario.idHorario || horario.id,
        title: `Clase - ${typeof horario.coach === 'object' ? horario.coach.nombre :
            coaches.find(c => c.idUsuario === horario.coach || c.id === horario.coach)?.nombre || 'Coach'}`,
        start: new Date(`2024-01-01T${horario.horaInicio}`),
        end: new Date(`2024-01-01T${horario.horaFin}`),
        allDay: false,
        resource: horario
    }));

    return (
        <div style={{ height: '600px' }}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                defaultView="week"
                views={['week', 'day']}
                min={new Date(2024, 0, 1, 6, 0)} // 6:00 AM
                max={new Date(2024, 0, 1, 22, 0)} // 10:00 PM
            />
        </div>
    );
};