import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/img/logo.png";
import { useAuth } from "../auth/AuthContext";

export default function Navbar(){
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const onLogout = () => {
        logout();
        navigate("/login");
    };

    return(
        <nav className="navbar navbar-expand-lg bg-body-tertiary" data-bs-theme="dark">
        <div className="container">
            <a className="navbar-brand" href="#">
                <img src={logo} alt="Logo" height="30" className="d-inline-block align-text-top me-2"/>
                {/* Shipping App */}
            </a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                        <Link className="nav-link active" aria-current="page" to="/">Home</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/shipments">Shipments</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/reports">Reports</Link>
                    </li>
                    <li className="nav-item">
                        {user.badge}
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    );
}