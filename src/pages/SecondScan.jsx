import React, { useState } from "react";

export default function SecondScan() {
    // states hooks for inputs
    const [trackingNumber, setTrackingNumber] = useState("");
    const [hpPartNum, setHpPartNum] = useState("");
    const [disableTracking, setDisableTracking] = useState(false);

    // states for file upload
    const [file, setFile] = useState(null);
    const [loadingUpload, setLoadingUpload] = useState(false);
    const [loadingValidate, setLoadingValidate] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleHpFocus = () => {
        if (trackingNumber.trim().length > 0) setDisableTracking(true);
    };

    const handleClear = () => {
        setTrackingNumber("");
        setHpPartNum("");
        setDisableTracking(false);
        setFile(null);
        setResult(null);
        setError(null);
    };

    // upload excel file
    const handleUpload = async () => {
        if (!file){
            setError("Please select a file to upload.");
            return;
        }
        setLoadingUpload(true);
        setError(null);
        setResult(null);
        try{
            const form = new FormData();
            form.append("file", file);

            const res = await fetch(`/api/IepCrossingDockShipments/upload-file`, {
                method: "POST",
                body: form
            });
            if (!res.ok) throw Error(await res.text());
            const data = await res.json();
            setResult("Excel file uploaded successfully", "Success");
        }
        catch (e){
            setError(e.message || "Error uploading file");
            showToast(e.message || "Error uploading file", "Error");
        }
        finally{
            setLoadingUpload(false);
        }
    };

    const handleValidate = async () => {
        setLoadingValidate(true);
        setError(null);
        setResult(null);
        try{
            const res = await fetch(`/api/IepCrossingDockShipments/validate-bool`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackingNumber, hpPartNum })
            });
            if (!res.ok) throw Error(await res.text());
            const data = await res.json();
            setResult(data);
            showToast(data.result === "pass" ? "Validation successful" : "Validation failed", data.result === "pass" ? "Success" : "Error");
        }catch (error) {
            setError(error.message || "Error during validation");
        }finally{
            setLoadingValidate(false);
        }
    };

    // who needs a libary for toasts?
    
    const showToast = (text, type = "info") => {
        const toast = document.createElement("div");
        toast.innerText = text;
        toast.style.position = "fixed";
        toast.style.zIndex = "9999";
        toast.style.bottom = "20px";
        toast.style.right = "20px";
        toast.style.padding = "10px 14px";
        toast.style.borderRadius = "6px";
        toast.style.color = "#fff";
        toast.style.boxShadow = "0 2px 8px rgba(0,0,0,.2)";
        toast.style.fontSize = "14px";
        toast.style.background = type === "success" ? "#28a745"
                            : type === "error"   ? "#dc3545"
                            : "#0d6efd";
        document.body.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 2500);
    };

  const badge =
    result?.result === "pass" ? "alert-success"
    : result?.result === "failed" ? "alert-danger"
    : result?.result ? "alert-info"
    : "alert-secondary";

  const message =
    result?.result === "pass" ? "Pass"
    : result?.result === "failed" ? "Fail"
    : result?.result ? result.result
    : "The result of matching tracking numbers will be displayed here.";

    return (
    <div className="container">
        <h3 className="mb-4 mt-2"><i className="bi bi-truck" /> - Second Scan Page</h3>

        <div className="row">

            <div className="col-md-8 mb-3">
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Insert tracking number:</h5>
                        <hr />
                        <div className="form-group mb-3">
                            <label className="form-label">Tracking Number:</label>
                            <input
                                className="form-control"
                                name="trackingNumber"
                                placeholder="Tracking Number"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                disabled={disableTracking}
                                autoFocus
                            />
                        </div>
                        
                        <div className="form-group mb-3">
                            <label className="form-label">HP Part Num:</label>
                            <input
                                className="form-control"
                                name="hpPartNum"
                                placeholder="HP Part Num"
                                value={hpPartNum}
                                onChange={(e) => setHpPartNum(e.target.value)}
                                onFocus={handleHpFocus}
                            />
                        </div>

                        
                        <div className="form-group mb-3">
                            <label className="form-label">Excel file:</label>
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                className="form-control"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            />
                        </div>

                        
                        <div className="form-group mt-4 mb-3">
                            <button className="btn btn-secondary me-2" onClick={handleClear}>
                                <i className="bi bi-eraser" /> Clear Data
                            </button>
                            <button className="btn btn-primary me-2" onClick={handleUpload} disabled={loadingUpload}>
                                <i className="bi bi-upload" /> Submit File
                            </button>
                            <button className="btn btn-success" onClick={handleValidate} disabled={loadingValidate}>
                                <i className="bi bi-check2-circle" /> Validate Pair
                            </button>
                        </div>

                        
                        { loadingUpload && <div className="alert alert-info">Uploading & processing Excel...</div> }
                        { loadingValidate && <div className="alert alert-info">Validating...</div> }
                        { error && <div className="alert alert-danger">Error: {error}</div> }

                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="card">
                    <div className="card-header">
                        <small>Results</small>
                    </div>
                    <div className="card-body">
                        <div className={`alert ${badge}`} role="alert">
                            <strong>{message}</strong>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
    );
}