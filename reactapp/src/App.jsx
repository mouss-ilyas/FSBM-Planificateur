import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login/login';
import Home from './Home/home';
import Consulter from './shared/consulter'
import ProfDashbord from './prof/ProfDashbord';
import AdminDashbord from './admin/adminDashbord';
function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Home  />} />
          <Route path="/login" element={<Login />} />
          <Route path="/adminDashbord/*" element={<AdminDashbord />} />
          <Route path="/prof" element={<ProfDashbord />} />
          <Route path="/consulter" element={<Consulter />} />
        </Routes>
    </Router>
  );
}

export default App;
