import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ScanOutShipments() {
    //#region - region for functions
    const [scanned, setScanned] = useState([]);
    const [filter, setFilter] = useState("");

    function loadScannedShipments(filter)
    {
        let url = "";
        if (filter != null)
        {
            url = "https://iep-app-n.iec.inventec:443/Warehouse_Api/api/IepCrossingDockShipments/GetScanInShipments?filter="+filter;
        }
        else
        {
            url = "https://iep-app-n.iec.inventec:443/Warehouse_Api/api/IepCrossingDockShipments/GetScanInShipments";
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
        });
    }

    function formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString();
    }

    useEffect(() => {
        loadScannedShipments();
    }, []);

    useEffect(() => {
        loadScannedShipments(filter);
    }, [filter]);
    //#endregion - region for functions

    return (
        <div className="container">
            <h3 className="mb-4 mt-2"><i className="bi bi-upc"/> - Scan Out Page</h3>

            <div className="input-group mt-2 mb-3">
                <span className="input-group-text"><i className="bi bi-search"/></span>
                <input type="text" className="form-control" value={filter} onChange={(e) =>setFilter(e.target.value)} />
            </div>
            
            <table className="table table-bordered table-sm">
                <thead>
                    <tr>
                        <th>Delivery Number</th>
                        <th>Date In</th>
                        <th>Truck Number</th>
                        <th>Receiving Person</th>
                        <th>Qty</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {scanned.length === 0 ? (
                        <tr>
                            <td colSpan={6}>
                                <div className="alert alert-warning">
                                    <h5 class="alert-heading">No Shipments Found</h5>
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
                            <td>{s.truck_id}</td>
                            <td>{s.receiving_person}</td>
                            <td><small>
                                <b>Pallet Qty:</b> {s.pallet_qty}<br />
                                <b>Box Qty:</b> {s.box_qty}<br />
                                <b>Unit Qty:</b> {s.unit_qty}<br />
                            </small></td>
                            <td>
                                <Link to={`/scanoutdetails/${s.id_scan}`} className="btn btn-sm btn-outline-info"><i className="bi bi-box-arrow-right" /> Scan Out</Link>
                            </td>
                        </tr>
                    )))}

                    {/* More rows can be added here */}
                </tbody>
            </table>
        </div>
    );
}