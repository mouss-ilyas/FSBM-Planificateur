import UpdatePassword from "../shared/passwordhandle";
import Table from "../tableconstract/tableconstract";
import TeacherInfo from "./TeacherInfo";

const ProfDashbord = () => {
    const teacher_id=localStorage.getItem("teacher_id");
    console.log(teacher_id)
    return (
        <div>
            <h2>Hello to ProfDashbord</h2>
            <TeacherInfo teacherId={teacher_id} />
            <UpdatePassword />
            <h3>Your Emploi</h3>
            <Table type={1} id={teacher_id} />
        </div>
    );
};

export default ProfDashbord;
