import AppointmentFilter from "../../components/administrator/AppointmentManagement/AppointmentFilter/AppointmentFilter.jsx";
import ModifyAppointment from "../../components/administrator/AppointmentManagement/ModifyAppointment/ModifyAppointment.jsx";
import CancelAppointment from "../../components/administrator/AppointmentManagement/CancelAppointment/CancelAppointment.jsx";

function AppointmentManagementModule (){
    return (
        <div>
            <AppointmentFilter />
            <ModifyAppointment />
            <CancelAppointment />
        </div>
    );
}

export default AppointmentManagementModule