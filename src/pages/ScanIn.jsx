import { useState } from "react";
import Swal from "sweetalert2";

const data = {
  delivery_number: '',
  truck_id: '',
  receiving_person: '',
  bol_number: '',
//   date_in: '',
//   date_out: '',
  pallet_qty: 0,
  box_qty: 0,
  unit_qty: 0,
  pallets: [{
        boxes: []
    }], 
}

export default function ScanIn() {
    //#region - states
    const [cartonRows, setCartonRows] = useState([{id: 1, cartonID : ""}]);
    const [palletNumber, setPalletNumber] = useState("");
    const [shipmentPallets, setShipmentPallets] = useState([]);

    const [form, setForm] = useState(data);
    
    //#endregion -states

    //#region - region for functions
    function clearForm(){
        setForm(data);
        setCartonRows([{id: 1, cartonID : ""}]);
        setPalletNumber("");
        setShipmentPallets([]);
    }

    function inputChange(e){
        const name = e.target.name;
        const value = e.target.value;

        setForm({...form, [name]:value});
    }

    function AddCartonRow(){
        const newRow = {
            id : cartonRows.length + 1,
            cartonID: ""
        }

        setCartonRows([...cartonRows, newRow])
    }

    function removeCartonRow(rowID){
        const updatedCartons = cartonRows.filter(row => row.id !== rowID);
        setCartonRows(updatedCartons);
    }

    function removePallet(palletID){
        const updatedPallets = shipmentPallets.filter(pallet => pallet.id !== palletID);
        setShipmentPallets(updatedPallets);
    }

    function addPalletWithCartons(){
        if (palletNumber.trim() === ""){
            Swal.fire("Please enter a pallet number.");
            return;
        }

        if (cartonRows.length === 0 || cartonRows.some(row => row.cartonID.trim() === "")){
            Swal.fire("Please enter at least one valid carton ID.");
            return;
        }

        const newPallet = {
            id: shipmentPallets + 1,
            palletNumber: palletNumber,
            deliveryNumber : "",
            cartons: cartonRows,
        };

        setShipmentPallets([
            ...shipmentPallets,
            newPallet
        ]);

        setCartonRows([ {id: 1, cartonID : ""} ]);
        setPalletNumber("");
    }
    
    function updateCartonValue(rowID, newCartonID){
        const updatedCartons = cartonRows.map(row => {
            if (row.id === rowID){
                return {...row, cartonID: newCartonID};
            }
            return row;
        });
        setCartonRows(updatedCartons);
    }

    function scanIn() {

        const payload = {
            ...form,
            pallets: shipmentPallets.map(pallet => ({
                pallet_id: pallet.palletNumber,
                boxes: pallet.cartons.map(carton => ({ 
                    pallet_id: pallet.palletNumber,
                    box_id: carton.cartonID 
                }))
            }))
        };
        console.log("Payload to be sent:", payload);
        fetch("https://iep-app-n.iec.inventec:443/Warehouse_Api/api/IepCrossingDockShipments/ScanIn", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.success === true ) {
                Swal.fire("Scan in successful!");
                clearForm();
            }
            else {
                Swal.fire("Error:\n",data.message," - error");
            }
        })
        .catch(err => {
            console.log(`Network error: ${err.message}`);
            Swal.fire(`Network error: ${err.message}`);
        });

        console.log("Form Data to submit:", payload);
    }
    //#endregion - region for functions
    
    return (
        <div className="container">
            <h3 className="mb-4 mt-2"><i className="bi bi-truck" /> - Scan In Page</h3>

            <div className="row">
                <div className="col-md-8 mb-3">

                    <div className="card">
                        <div className="card-body">
                            {/* card content */}

                            <h5 className="card-title">Shipment Info</h5>
                            <p className="card-text">Please enter the shipment information below.</p>
                            <hr />
                            <div className="row">
                                {/* <div className="col-md-4 mb-3">
                                    <label htmlFor="date_in" className="form-label">Date In</label>
                                    <input type="date" className="form-control" name="date_in" id="date_in" value={form.date_in} onChange={inputChange} placeholder="Enter Date" />
                                </div> */}
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="delivery_number" className="form-label">Delivery Number</label>
                                        <input type="text" className="form-control" name="delivery_number" id="delivery_number" value={form.delivery_number} onChange={inputChange} placeholder="Enter delivery number" />
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="truck_id" className="form-label">Truck In ID</label>
                                        <input type="text" className="form-control" name="truck_id" id="truck_id" value={form.truck_id} onChange={inputChange} placeholder="Enter Truck In ID" />
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="receiving_person" className="form-label">Receiving Person</label>
                                        <input type="text" className="form-control" name="receiving_person" id="receiving_person" value={form.receiving_person} onChange={inputChange} placeholder="Enter Receiving Person" />
                                    </div>
                                </div>

                                <div className="col-md-2 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="pallet_qty" className="form-label">Pllt Qty</label>
                                        <input type="number" className="form-control" name="pallet_qty" id="pallet_qty" value={form.pallet_qty} onChange={inputChange} placeholder="0" min={1} />
                                    </div>
                                </div>

                                <div className="col-md-2 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="box_qty" className="form-label">Box Qty</label>
                                        <input type="number" className="form-control" name="box_qty" id="box_qty" value={form.box_qty} onChange={inputChange} placeholder="0" min={1} />
                                    </div>
                                </div>

                                <div className="col-md-2 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="unit_qty" className="form-label">Unit Qty</label>
                                        <input type="number" className="form-control" name="unit_qty" id="unit_qty" value={form.unit_qty} onChange={inputChange} placeholder="0" min={1} />
                                    </div>
                                </div>


                                {/* tabla de pallets y cartons */}
                                <hr />
                                <div className="table-responsive mt-2">
                                    {shipmentPallets.length === 0 ? (
                                        <div className="alert alert-secondary" role="alert">
                                            No pallets added yet. Please add pallets and cartons using the form on the right.
                                        </div>
                                    ) : (
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Pallet</th>
                                                    <th>Cartons</th>
                                                    <th><i className="bi bi-x"></i></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {shipmentPallets.map((pallet, index) => (
                                                <tr key={pallet.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{pallet.palletNumber}</td>
                                                    <td style={{fontSize: "80%"}}>
                                                        <ul>{pallet.cartons.map(carton => (
                                                            <li key={carton.cartonID}>
                                                                {carton.cartonID}
                                                            </li>
                                                        ))}</ul>
                                                    </td>
                                                    <td><button className="btn btn-danger btn-sm" onClick={() => removePallet(pallet.id)}><i className="bi bi-x"></i></button></td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                                <hr />
                                
                                {/* subir o limpiar */}
                                <div className="col-md-6">
                                    <div className="d-grid gap-2">
                                        <button className="btn btn-primary" onClick={scanIn}>Submit</button>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="d-grid gap-2">
                                        <button className="btn btn-secondary">Clear</button>
                                    </div>
                                </div>
                            </div>

                            {/* ./ card content */}
                        </div>
                    </div>

                    

                </div>

                <div className="col-md-4 mb-3">
                    <div className="card">
                        <div className="card-body">

                            {/* card content */}

                            <h5 className="card-title">Carton IDs</h5>
                            <hr />
                            <div className="table-responsive">
                                <div className="form-group mb-2">
                                    <label htmlFor="pallet_number" className="form-label">Pallet</label>
                                    <input type="text" className="form-control" id="pallet_number" placeholder="Enter Pallet Number" value={palletNumber} onChange={(e) => setPalletNumber(e.target.value)} autoComplete="off" />
                                </div>
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <td>#</td>
                                            <th>Carton ID</th>
                                            <th><i className="bi bi-x"></i></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cartonRows.map((row) => (
                                            <tr key={row.id}>
                                                <td>{row.id}</td>
                                                <td><input type="text" name="carton_id" value={row.cartonID} className="form-control form-control-sm" onChange={(e) => updateCartonValue(row.id, e.target.value)} /></td>
                                                <td><button className="btn btn-danger btn-sm" onClick={() => removeCartonRow(row.id)}><i className="bi bi-x"></i></button></td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td><button className="btn btn-success btn-sm" onClick={AddCartonRow}><i className="bi bi-plus"></i></button></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </table>
                                
                                <button className="btn btn-primary mt-1" onClick={addPalletWithCartons}>Add Pallet/Cartons</button>
                            </div>

                            {/* /. card content */}

                        </div>
                    </div>
                </div>
            </div>

            {/* ./ end of page */}
        </div>
    );

}