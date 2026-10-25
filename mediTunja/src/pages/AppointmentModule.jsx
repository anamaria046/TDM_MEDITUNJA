import CatalogServices from "../components/user/Catalog/CatologServices.jsx"
import ScheduleAppointment from "../components/user/Appointments/ScheduleAppointments/ScheduleAppointments.jsx"
import MyAppointments from "../components/user/Appointments/MyAppointments/MyAppointments.jsx"

function AppointmentModule() {
    return (
        <div>
            <CatalogServices />
            <ScheduleAppointment />
            <MyAppointments />
        </div>
    );
}

export default AppointmentModule