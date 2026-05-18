import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function ScanOutDetails() {
    //#region - region for functions
    const {id_scan} = useParams();
    const [details, setDetails] = useState([]);
    const [pallets, setPallets] = useState([]);
    const [boxes, setBoxes] = useState([]);
    const [boxMessages, setBoxMessages] = useState([]);
    const [selectedPallet, setSelectedPallet] = useState(null);

    // states para validar formulario de pallets
    const [deliveryInput, setDeliveryInput] = useState("");
    const [deliveryValid, setDeliveryValid] = useState(null);

    const [palletInput, setPalletInput] = useState("");
    const [palletValid, setPalletValid] = useState(null);

    const [scannedBoxes, setScannedBoxes] = useState([]);
    const [boxesValid, setBoxesValid] = useState([]);

    const dnRef = useRef(null);
    const palletRef = useRef(null);
    const boxesRef = useRef([]);

    // states de inputs restantes
    const [form, setForm] = useState({
        date_out: "",
        bol_number: "",
        truck_out_id: "",
        delivery_note: "",
        id_scan : id_scan,
    });

    const navigate = useNavigate();

    // const [deliveryNumber, setDeliveryNumber] = useState("");
    function formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString();
    }

    function loadShipmentDetails() {
        fetch(`https://iep-app-n.iec.inventec:443/Warehouse_Api/api/IepCrossingDockShipments/GetScanedShipmentsById?id_scan=`+ id_scan, {
            method: 'get',
            headers: { "Content-Type": "application/json" },
        })
        .then(res => res.json())
        .then(data => {
            // console.log(data[0]);
            setDetails(data[0]);
        })
        .catch(err => {
            console.log('Fatal error: '+ err.message);
        });
    }

    function loadPallets() {
        fetch(`https://iep-app-n.iec.inventec:443/Warehouse_Api/api/IepCrossingDockShipments/GetPalletsByScan?id_scan=`+ id_scan, {
            method: 'get',
            headers: { "Content-Type": "application/json" },
        })
        .then(res => res.json())
        .then(data => {
            // console.log(data);
            const pallets = data.map(p => ({
                ... p,
                status : 'Pending'
            }))
            setPallets(pallets);
        })
        .catch(err => {
            console.log('Fatal error: '+ err.message);
        });
    }

    function loadBoxes(pallet_id) {
        fetch(`https://iep-app-n.iec.inventec:443/Warehouse_Api/api/IepCrossingDockShipments/GetBoxes?id_scan=${id_scan}&pallet_id=${pallet_id}`, {
            method: 'get',
            headers: { "Content-Type": "application/json" },
        })
        .then(res => res.json())
        .then(data => {
            // console.log(data);
            setBoxes(data);
        })
        .catch(err => {
            console.log('Fatal error: '+ err.message);
        });
    }

    function openScanModal(pallet) {
        setSelectedPallet(pallet);
        loadBoxes(pallet.pallet_id);

        setDeliveryInput("");
        setPalletInput("");

        setDeliveryValid(null);
        setPalletValid(null);

        setScannedBoxes([]);
        setBoxesValid([]);

        setTimeout(() => {
            dnRef.current?.focus();
        }, 900);
    }

    function deliveryChange(value) {
        setDeliveryInput(value);

        if(value === details.delivery_number) {
            setDeliveryValid(true);

            setTimeout(() => {
                palletRef.current?.focus();
            }, 100);
        }
        else {
            setDeliveryValid(false);
        }
    }

    function palletChange(value) {
        setPalletInput(value);

        if(selectedPallet && value === selectedPallet.pallet_id) {
            setPalletValid(true);
            setTimeout(() => {
                boxesRef.current[0]?.focus();
            }, 100);
        }
        else {
            setPalletValid(false);
        }
    }

    function boxScan(index, value) {
        const updatedBoxes = [...scannedBoxes];
        const updatedValid = [...boxesValid];
        const updatedMessages = [...boxMessages];
        updatedBoxes[index] = value;

        const exists = boxes.some(b => b.box_id === value);
        const duplicate = updatedBoxes.filter(b => b === value).length > 1;

        
        if (!value) {
            updatedValid[index] = null;
            updatedMessages[index] = "";
        }
        else if (!exists) {
            updatedValid[index] = false;
            updatedMessages[index] = value + " doesn't exist";
        }
        else if (duplicate) {
            updatedValid[index] = false;
            updatedMessages[index] = value + " duplicated";
        }
        else {
            updatedValid[index] = true;
            updatedMessages[index] = "Pass";
            setTimeout(() => {
                boxesRef.current[index + 1]?.focus();
            }, 100);
        }

        setScannedBoxes(updatedBoxes);
        setBoxesValid(updatedValid);
        setBoxMessages(updatedMessages);
    }

    // marcar pallet como pass
    function passPallet() {
        const valid = boxesValid.length === boxes.length && boxesValid.every(v => v === true);
        if (!valid) { return; }

        const updatedPallets = pallets.map(p => {
            if (p.pallet_id === selectedPallet.pallet_id) {
                return {
                    ...p,
                    status : "Pass"
                };
            }
            return p;
        });
        setPallets(updatedPallets);        
    }

    function scanOut(e) {
        e.preventDefault();
        console.log(form)
        fetch("https://iep-app-n.iec.inventec:443/Warehouse_Api/api/IepCrossingDockShipments/ScanOut", {
            method: 'put',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        })
        .then(res => res.json())
        .then(data => {
            Swal.fire({
                icon: "success",
                title: "Scan Out Complete",
                text: "Shipment scanned out successfully"
            })
            .then((result) => {
                if (result.isConfirmed) {
                    navigate("/ScanOutShipments");
                }
            });
        })
        .catch(err => {
            console.log(`Network error: ${err.message}`);
            Swal.fire(`Network error: ${err.message}`);
        });
    }

    function handleChange(e) {
        const {name, value} = e.target;
        setForm(prev => ({
            ...prev,
            [name] : value
        }));
    }

    useEffect(() => {
        loadShipmentDetails();
        loadPallets();
    }, []);

    const readyToScanOut = pallets.length > 0 && pallets.every(p => p.status === "Pass");
    //#endregion - region for functions

    return (
    <div className="container">
        <h3 className="mb-4 mt-2"><i className="bi bi-box-seam"/> - Scan Out Details</h3>
        <div className="row">

            <div className="col-md-7">
                <div className="card">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Pallet Number</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        {pallets.map((plt) => (
                            <tr key={plt.pallet_id} className={plt.status === "Pass" ? "table-success" : ""}>
                                <td>{plt.pallet_id}</td>
                                <td>
                                    <span className={plt.status === "Pass" ? "badge text-bg-success" : "badge text-bg-warning"}>
                                        {plt.status}
                                    </span>
                                </td>
                                <td>
                                    {plt.status === "Pass" ? <i className="bi bi-check-circle"/>: 
                                    <button className="btn btn-light btn-sm" data-bs-toggle="modal" data-bs-target="#scanModal" onClick={() => openScanModal(plt)}>
                                        <i className="bi bi-upc-scan" /> Mark Scan
                                    </button>
                                    }
                                    
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <div className="card-body">
                        
                    </div>
                </div>
            </div>

            <div className="col-md-5">
                <div className="card">
                    <div className="card-body">
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item">
                                <b>Delivery Number:</b> {details.delivery_number}&nbsp;
                                {/* <button className="btn btn-primary btn-sm">Scan</button> */}
                            </li>
                            <li className="list-group-item"><b>Date In:</b> {formatDate(details.date_in)}</li>
                            <li className="list-group-item"><b>Receiving Person:</b> {details.receiving_person}</li>
                            <li className="list-group-item"><b>Status:</b> <span className={details.status === "In" ? "badge text-bg-success" : "badge text-bg-primary"}>{details.status}</span></li>
                        </ul>
                        <div className="container">
                            <hr />
                            <div className="form-group mb-1">
                                <label htmlFor="#" className="form-label">Date Out: <span className="text-danger">*</span></label>
                                <input type="date" name="date_out" className="form-control form-control-sm" value={form.date_out} onChange={handleChange} placeholder="Enter Date" />
                            </div>

                            <div className="form-group mb-1">
                                <label htmlFor="#" className="form-label">BOL Number: <span className="text-danger">*</span></label>
                                <input type="text" name="bol_number" className="form-control form-control-sm" value={form.bol_number} onChange={handleChange} placeholder="Enter BOL Number" />
                            </div>

                            <div className="form-group mb-1">
                                <label htmlFor="#" className="form-label">Truck Out ID: <span className="text-danger">*</span></label>
                                <input type="text" name="truck_out_id" className="form-control form-control-sm" value={form.truck_out_id} onChange={handleChange} placeholder="Enter Truck Out ID" />
                            </div>

                            <div className="form-group mb-1">
                                <label htmlFor="delivery_note" className="form-label">Delivery Note</label>
                                <textarea name="delivery_note" value={form.delivery_note} onChange={handleChange} className="form-control form-control-sm" placeholder="Enter Delivery Note"></textarea>
                            </div>
                            <hr />
                            <div className="d-grid gap-2">
                                <button className="btn btn-primary" disabled={!readyToScanOut || form.date_out === "" || form.truck_out_id === "" || form.bol_number === ""} onClick={scanOut}>Scan Out Shipment</button>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
            {/* /. row */}
        </div>

        {/* modal */}
        <div className="modal fade" id="scanModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="scanModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="scanModalLabel">Scan Pallet #{selectedPallet?.pallet_id}</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <small className="text-muted" id="hint">Please scan the Delivery Number</small>
                        <hr />
                        <div className="form-group mb-1">
                            <label htmlFor="#" className="form-label">Delivery Number</label>
                            <input type="text" className={deliveryValid === null ? "form-control form-control-sm" : deliveryValid ? "form-control form-control-sm is-valid" : "form-control form-control-sm is-invalid"} placeholder="Enter Delivery Number" value={deliveryInput} onChange={(e) => deliveryChange(e.target.value)} ref={dnRef} />
                        </div>
                        <hr />
                        <div className="form-group mb-1">
                            <label htmlFor="#" className="form-label">Pallet Number</label>
                            <input type="text" className={palletValid === null ? "form-control form-control-sm" : palletValid ? "form-control form-control-sm is-valid" : "form-control form-control-sm is-invalid"} placeholder="Enter Pallet Number" value={palletInput} onChange={(e) => palletChange(e.target.value)} disabled={!deliveryValid} ref={palletRef} />
                        </div>
                        <hr />
                        <div className="form-group mb-1">
                            <label htmlFor="#" className="form-label">Cartons Number</label>
                            {boxes.map((box, index) => (
                                <div key={box.box_id} className="mb-2">
                                    <input type="text" className={boxesValid[index] === true ? "form-control form-control-sm is-valid" : boxesValid[index] === false ? "form-control form-control-sm is-invalid" : "form-control form-control-sm"} placeholder={"Scan Box " + (index + 1)} onChange={(e) => boxScan(index, e.target.value)} disabled={!palletValid} ref={(el) => boxesRef.current[index] = el} />
                                    {boxesValid[index] === false && (
                                        <div className="invalid-feedback">
                                            {boxMessages[index]}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button className="btn btn-primary" data-bs-dismiss="modal" onClick={passPallet}>Finish Scan</button>
                    </div>
                </div>
            </div>
        </div>

    </div>
    );
}