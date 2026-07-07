import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import '../assets/css/loader.css';

export default function ScanOutShipments() {
    //#region - region for functions
    const [scanned, setScanned] = useState([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(false);

    function loadScannedOutShipments(filter) {
        setLoading(true);
        let url = "";
        if (filter != null)
        {
            url = "https://iep-app-n.iec.inventec:443/Warehouse_Api/api/IepCrossingDockShipments/GetScannedOutShipments?filter="+filter;
        }
        else
        {
            url = "https://iep-app-n.iec.inventec:443/Warehouse_Api/api/IepCrossingDockShipments/GetScannedOutShipments";
        }
        fetch(url, {
            method: 'get',
            headers: { "Content-Type": "application/json" },
        })
        .then(res => res.json())
        .then(data => {
            // console.log(data);
            setScanned(data);
        })
        .catch(err => {
            console.log(`Fatal error: ${err.message}`);
        })
        .finally(() => {
            setLoading(false);
        });
    }

    function formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString();
    }
    
    useEffect(() => {
        loadScannedOutShipments();
    }, []);
    
    useEffect(() => {
        loadScannedOutShipments(filter);
    }, [filter]);
    //#endregion
    

    return (
        <>
        {loading && (
            <div className="loading-overlay">
                <div className="progress" role="progressbar" aria-label="Animated striped example" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
                    <div className="progress-bar bg-warning progress-bar-striped progress-bar-animated" style={{minWidth:450}}></div>
                </div>
            </div>
        )}
        <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
                <h3 className="mb-0"><i className="bi bi-clock-history"/> - Scan Out History</h3>
            </div>

            <div className="input-group mt-2 mb-3">
                <span className="input-group-text"><i className="bi bi-search"/></span>
                <input type="text" className="form-control" value={filter} onChange={(e) =>setFilter(e.target.value)} />
            </div>

            <table className="table table-bordered table-sm">
                <thead>
                    <tr>
                        <th>Delivery Number</th>
                        <th>Date In</th>
                        <th>Date Out</th>
                        <th>Truck Number</th>
                        <th>Receiving Person</th>
                        <th>Qty</th>
                        <th>Delivery Note</th>
                    </tr>
                </thead>
                <tbody>
                    {scanned.length === 0 && !loading ? (
                        <tr>
                            <td colSpan={7}>
                                <div className="alert alert-warning">
                                    <h5 className="alert-heading">No Shipments Found</h5>
                                    Be sure of the following:
                                    <hr />
                                    <ul>
                                        <li>Respect the uppercases or lowercases</li>
                                        <li>The DN must match exactly, no blank spaces</li>
                                        <li>Ensure that the DN or Truck exists</li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                    ) : (scanned.map((s) => (
                        <tr key={s.id_scan}>
                            <td>{s.delivery_number}</td>
                            <td><span className="text-primary"><i className="bi bi-calendar"/></span> {formatDate(s.date_in)}</td>
                            <td><span className="text-danger"><i className="bi bi-calendar"/></span> {formatDate(s.date_out)}</td>
                            <td>{s.truck_out_id}</td>
                            <td>{s.receiving_person}</td>
                            <td><small>
                                <b>Pallet Qty:</b> {s.pallet_qty}<br />
                                <b>Box Qty:</b> {s.box_qty}<br />
                                <b>Unit Qty:</b> {s.unit_qty}<br />
                            </small></td>
                            <td>
                                <span className="text-warning"><i className="bi bi-sticky"/></span> - {s.delivery_note}
                            </td>
                        </tr>
                    )))}

                    {/* More rows can be added here */}
                </tbody>
            </table>
        </div>
        </>
    );
}