import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/img/logo.png";
import { useAuth, hasValidSession } from "../auth/AuthContext";

export default function Navbar(){
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isLogged = hasValidSession(user);
    
    const onLogout = () => {
        logout();
        navigate("/login", { replace: true });
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
                        <Link className="nav-link" to="/SecondScan">Second Scan</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/reports">Reports</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/printlabels">Print Labels</Link>
                    </li>
                    <li className="nav-item dropdown">
                        <span className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            {user?.badge ?? "Not Logged"}
                        </span>
                        <ul className="dropdown-menu dropdown-menu-end">
                        {isLogged ? (
                            <li>
                                <button className="dropdown-item" onClick={onLogout}>
                                    Logout
                                </button>
                            </li>
                        ) : (
                            <li>
                                <Link className="dropdown-item" to="/login">
                                    Login
                                </Link>
                            </li>
                        )}
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    );
}