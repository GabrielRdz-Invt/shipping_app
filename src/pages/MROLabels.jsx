import { useState, useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";

import '../assets/css/labelmro.css';

export default function MROLabels() {
    const [form, setForm] = useState({
        carrier: "",
        tracking: "",
        po: "",
        qty_cases: "",
        total_pieces: "",
        boxplt: "",
        receiving_date: ""
    });
    const [shipments, setShipments] = useState([]);
    const [manualEntry, setManualEntry] = useState(false);

    const labelRef = useRef(null);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const changeSelectId = (e) => {
        const selectedShipment = shipments.find(shipment => shipment.id === e.target.value);
        console.log("Selected shipment:", selectedShipment);
        if (selectedShipment) {
            setForm({
                id: selectedShipment.id,
                carrier: selectedShipment.carrier,
                tracking: selectedShipment.hawb,
                po: selectedShipment.invRefPo,
                qty_cases: selectedShipment.bulks,
                total_pieces: selectedShipment.qty,
                boxplt: selectedShipment.boxPlt,
                receiving_date: formatDate(selectedShipment.rcvdDate)
            });
        }
    };  

    const generateLabel = () => {
        const label = document.getElementById("label");
        if (!label) return;

        const printArea = document.createElement("div");
        printArea.id = "printArea";
        const clone = label.cloneNode(true);

        // agregar barcode al clon
        const canvasTracking = clone.querySelector("#barcode_tracking");
        const canvasId = clone.querySelector("#barcode_id");
        if (canvasTracking) {
            JsBarcode(canvasTracking, form.tracking, {
                format: "code128",
                displayValue: true,
                height: 50,
                width: 2,
            });
        }
        if (canvasId) {
            JsBarcode(canvasId, form.id, {
                format: "code128",
                displayValue: true,
                height: 50,
                width: 1,
            });
        }

        clone.classList.add("print-label", "label-size");
        printArea.appendChild(clone);
        document.body.appendChild(printArea);

        setTimeout(() => {
            window.print();
            document.body.removeChild(printArea); 
        }, 200);
        
    };/* */

    useEffect(() => {
        if (!labelRef.current) return;
        const canvas = labelRef.current.querySelector("#barcode_tracking");
        if (!canvas || !form.tracking) return;

        JsBarcode(canvas, form.tracking, {
            format: "code128",
            displayValue: true,
            height: 50,
            width: 2,
        });
    }, [form.tracking]);

    useEffect(() => {
        if (!labelRef.current) return;
        const canvas = labelRef.current.querySelector("#barcode_id");
        if (!canvas || !form.id) return;

        JsBarcode(canvas, form.id, {
            format: "code128",
            displayValue: true,
            height: 50,
            width: 1,
        });
    }, [form.id]);

    useEffect(() => {
        getShipments();
    }, []);

    function getShipments() {
        fetch("https://iep-app-n.iec.inventec:443/Warehouse_Api/api/IepCrossingDockShipments")
            .then(res => res.json())
            .then(data => {
                // console.log("Fetched shipments:", data);
                setShipments(data);
                /*setForm(
                    carrier = data.carrier,
                    tracking = data.hawb,
                    po = data.purchase_order,
                    qty_cases = data.qty_cases,
                    total_pieces = data.total_pieces,
                    boxplt = data.boxplt,
                    receiving_date = data.receiving_date
                ); */
            })
            .catch(err => {
                console.error("Error fetching shipments:", err);
            });
        return [];
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    };


    return (
        <div className="container mt-2">
            <h3 className="mt-3 mb-3"><i className="bi bi-printer me-2" />MRO Labels</h3>
            {/* <p>This is the MRO Labels page. Content coming soon...</p> */}

            <div className="row">
                <div className="col-md-8 card mt-4">
                    <div className="card-body">
                        <div className="form-check form-switch mb-2">
                            <input className="form-check-input" type="checkbox" role="switch" id="manualEntry" name="manualEntry" checked={manualEntry} onChange={(e) => setManualEntry(e.target.checked)} />
                            <label className="form-check-label" htmlFor="manualEntry">Manual Entry</label>
                        </div>
                        <div className="row">
                            <div className="form-group mb-3 col-md-6">
                                <label htmlFor="id" className="form-label">Enter ID</label> 
                                {manualEntry ? (
                                <input type="text" className="form-control" id="id" placeholder="Example: 0000-00-00-0000" value={form.id} onChange={handleChange} />
                                ) :(
                                <select className="form-control" id="id" value={form.id} onChange={changeSelectId}>
                                    <option value="">Select a shipment</option>
                                    {shipments.map(s => (
                                        <option key={s.id} value={s.id}>{s.id}</option>
                                    ))}
                                </select>
                                )}
                            </div>
                            <div className="form-group mb-3 col-md-6">
                                <label htmlFor="carrier" className="form-label">Enter Carrier</label>
                                <input type="text" className="form-control" id="carrier" placeholder="Example: Experditors/UPS/DHL" value={form.carrier} onChange={handleChange} disabled={!manualEntry} />
                            </div>
                            <div className="form-group mb-3 col-md-6">
                                <label htmlFor="tracking" className="form-label">Enter Tracking Number</label>
                                <input type="text" className="form-control" id="tracking" placeholder="Example: 1Z999AA10123456784" value={form.tracking} onChange={handleChange} disabled={!manualEntry} />
                            </div>
                            <div className="form-group mb-3 col-md-6">
                                <label htmlFor="po" className="form-label">Purchase Order</label>
                                <input type="text" className="form-control" id="po" placeholder="Example: PO123456" value={form.po} onChange={handleChange} disabled={!manualEntry} />
                            </div>
                            <div className="form-group mb-3 col-md-6">
                                <label htmlFor="qty_cases" className="form-label">Qty Plt/Box</label>
                                <input type="number" className="form-control" id="qty_cases" placeholder="0" min={1} value={form.qty_cases} onChange={handleChange}  disabled={!manualEntry} />
                            </div>
                            <div className="form-group mb-3 col-md-6">
                                <label htmlFor="total_pieces" className="form-label">Total Pieces</label>
                                <input type="number" className="form-control" id="total_pieces" placeholder="0" min={1} value={form.total_pieces} onChange={handleChange}  disabled={!manualEntry} />
                            </div>
                            <div className="form-group mb-3 col-md-6">
                                <label htmlFor="boxplt" className="form-label">Box/Plt</label>
                                { manualEntry ? (
                                <select className="form-control" id="boxplt" value={form.boxplt} onChange={handleChange}>
                                    <option value="">Select an option</option>
                                    <option value="Box">Box</option>
                                    <option value="Pallet">Pallet</option>
                                </select>
                                ) : (
                                <input type="text" className="form-control" id="boxplt" placeholder="Box/Plt" value={form.boxplt} onChange={handleChange}  disabled={!manualEntry} />
                                )
                                }
                            </div>
                            <div className="form-group mb-3 col-md-6">
                                <label htmlFor="receiving_date" className="form-label">Receiving Date</label>
                                { manualEntry ? (
                                <input type="date" className="form-control" id="receiving_date" value={form.receiving_date} onChange={handleChange} />
                                ) : (
                                <input type="text" className="form-control" id="receiving_date" value={form.receiving_date} placeholder="00/00/0000" onChange={handleChange} disabled={!manualEntry} />
                                )}
                            </div>
                        </div>

                        <button className="btn btn-primary" onClick={generateLabel}>Generate Label</button>
                    </div>
                </div>

                <div className="col-md-4 mt-4">
                    <div ref={labelRef} id="label" style={{border:"1px solid black", padding:"10px", fontSize:"12px"}} className="printArea">
                        <b>Carrier:</b> {form.carrier}<br />
                        <b>Tracking:</b> {form.tracking}<br />
                        <b>PO:</b> {form.po}<br />
                        <b>Qty Plt/Box:</b> {form.qty_cases}<br />
                        <b>Total Pieces:</b> {form.total_pieces}<br />
                        <b>Box/Plt:</b> {form.boxplt}<br />
                        <b>Receiving Date:</b> {form.receiving_date}<br />
                        
                        <hr />

                        <canvas id="barcode_tracking" className="form-control"></canvas>
                        <canvas id="barcode_id" className="form-control"></canvas>
                    </div>
                </div>
            </div>
        </div>
    );
}