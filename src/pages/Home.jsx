import React from "react";
import { Link } from "react-router-dom";


export default function Home(){
    return (
        <div className="container">
            <h2 className="mt-3">Home</h2>
            <p className="text-muted">Welcome To IEP Crossing Dock Shipping App.</p>

            <div className="btn-group btn-group-lg container-fluid">
                <Link style={{ padding: "2em" }} className="btn btn-outline-primary" to="/shipments"><i className="i i-pencil" /><i className="bi bi-truck" /> Shipments</Link>
                <Link to={"/secondscan"} style={{ padding: "2em" }} className="btn btn-outline-primary"><i className="bi bi-upc-scan" /> Second Scan</Link>
                <Link to={"/reports"} style={{ padding: "2em" }} className="btn btn-outline-primary"><i className="bi bi-file-earmark-bar-graph" /> Reports</Link>
                <Link to={"/printlabels"} style={{ padding: "2em" }} className="btn btn-outline-primary"><i className="i i-pencil" /><i className="bi bi-printer" /> Print Labels</Link>
            </div>
        </div>
    )
}