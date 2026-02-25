import React, { useEffect, useMemo, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import JsBarcode from "jsbarcode";

import '../assets/css/label.css';

export default function PrintLabels()
{
    const [form, setForm] = useState({
        date    : "",
        part    : "",
        serial  : "",
        coo     : "",
        cp      : "",
        copies  : "1"
    });


    const onChange = (field) => (e) => {
        const value = e.target.value ?? "";
        setForm((f) => ({ ...f, [field]: value }));
    };

    const onRetrieve = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const iso = `${yyyy}-${mm}-${dd}`;

        setForm((f) => ({
            ...f,
            date: iso,
            coo: f.coo || "CN",
            copies: f.copies || "1",
        }));
    };


    const barcodeRef = useRef(null);
    const containerRef = useRef(null);

    
    useEffect(() => {
        const container = containerRef.current || document.getElementById("labelContainer");
        if (!container) return;

        const canvases = container.querySelectorAll("canvas[data-bc]");
        canvases.forEach((cv) => {
            const key = cv.getAttribute("data-bc");
            let value = "";
            let labelPrefix = "";

            switch (key) {
                case "part":
                    value = (form.part).trim();
                    labelPrefix = "PART NUMBER: ";
                break;

                case "serial":
                    value = (form.serial).trim();
                    labelPrefix = "SERIAL NUMBER: ";
                break;

                case "coo":
                    value = (form.coo).trim();
                break;

                case "cp":
                    value = (form.cp).trim();
                break;

                default:
                break;
            }

            const ctx = cv.getContext?.("2d");
            if (ctx && cv.width && cv.height) ctx.clearRect(0, 0, cv.width, cv.height);
            if (!value) return;

            try {
                JsBarcode(cv, value, {
                format: "code128",
                displayValue: true,
                text: labelPrefix ? `${labelPrefix}${value}` : undefined,
                fontSize: 12,
                height: 60,
                margin: 0,
                });
            } catch (err) {
                console.error("Error generando barcode:", err);
            }
        });
    }, [form.part, form.serial, form.coo, form.cp]);


    
    const labelPreview = useMemo(() => {
        const wrapStyle = {
        position: "relative",
        width: "100%",
        height: "100%",
        fontFamily: "Arial, sans-serif",
        };

        const cellBase = {
        position: "absolute",
        width: "0in",
        height: "0in",
        transformOrigin: "top left",
        };

        const barcodeWidth = "2.2in";
        const barcodeHeight = "0.65in";
        const rot90 = {
        display: "block",
        width: barcodeWidth,
        height: barcodeHeight,
        transformOrigin: "top left",
        transform: "rotate(90deg)",
        };

        return (
        <div
            id="labelContainer"
            ref={containerRef}
            className="label-size bg-white"
            style={wrapStyle}
            aria-label="Etiqueta 4x6 (layout 2x2 vertical)"
        >
            {/* Fila superior */}
            {/* PART NUMBER */}
            <div style={{ ...cellBase, left: "3.0in", top: "0.60in", transform: "translate(0in, 0in)", }} >
                <div style={rot90}>
                    <canvas data-bc="part" style={{ width: "100%", height: "100%" }} />
                </div>
            </div>

            {/* SERIAL NUMBER */}
            <div style={{ ...cellBase, left: "3.0in", top: "3.10in", transform: "translate(0in, 0in)", }} >
                <div style={rot90}>
                    <canvas data-bc="serial" style={{ width: "100%", height: "100%" }} />
                </div>
            </div>

            {/* Fila inferior */}
            {/* COO */}
            <div style={{ ...cellBase, left: "1.50in", top: "0.70in", transform: "translate(0in, 0in)",}} >
                <div style={{ ...rot90, width: "1.4in", height: "0.9in", }} >
                    <canvas data-bc="coo" style={{ width: "100%", height: "100%" }} />
                </div>
            </div>

            {/* CP */}
            <div style={{ ...cellBase, left: "1.40in", top: "2.80in", transform: "translate(0in, 0in)", }} >
                <div style={rot90}>
                    <canvas data-bc="cp" style={{ width: "100%", height: "100%" }} />
                    <br />
                    <small style={{ fontSize: "60%", fontFamily: "Arial, sans-serif" }}>{form.date}</small>
                </div>
            </div>
        </div>
        );
    }, [form]);

    /*const buildPdfOptions = () => ({
        margin: 0,
        filename: `label_${form.part || "sample"}.pdf`,
        image: { type: "jpeg", quality: 1.0 },
        html2canvas: { scale : 2 },
        jsPDF : {unit: "in", format : [4, 6], orientation: "portrait"}
    });
    
    const getCopiesSafe = () => {
        const n = parseInt(form.copies, 10);
        return Number.isFinite(n) && n > 0 ? n : 1;
    }; */

    const buildBarcodeDataUrl = (part) => {
        const v = (part || "").trim();
        if (!v) return "";
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        JsBarcode(svg, v, {
            format: "code128",
            displayValue: true,
            fontSize: 14,
            height: 60,
            margin: 0,
        });
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
    };

    const preloadImage = async (src) => {
        if (!src) return;
        const img = new Image();
        img.src = src;
        try {
            await img.decode();
        } catch {
            await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
            });
        }
    };



    const printLabelContainerInline = async () => {
        const container = document.getElementById("labelContainer");
        if (!container) return;

        const printArea = document.createElement("div");
        printArea.id = "printArea";

        const clone = container.cloneNode(true);

        const canvases = clone.querySelectorAll("canvas[data-bc]");
        for (const cv of canvases) {
        const key = cv.getAttribute("data-bc");
        let value = "";
        let labelPrefix = "";

        switch (key) {
            case "part":
                value = (form.part || "").trim();
                labelPrefix = "PART NUMBER: ";
            break;

            case "serial":
                value = (form.serial || "").trim();
                labelPrefix = "SERIAL NUMBER: ";
            break;

            case "coo":
                value = (form.coo || "").trim();
            break;

            case "cp":
                value = (form.cp || "").trim();
            break;

            default:
            break;
        }

        if (!value) {
            cv.remove();
            continue;
        }

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        try {
            JsBarcode(svg, value, {
                format: "code128",
                displayValue: true,
                text: labelPrefix ? `${labelPrefix}${value}` : undefined,
                fontSize: 12,
                height: 60,
                margin: 0,
            });

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svg);
            const src =
            "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);

            const img = document.createElement("img");
            img.src = src;
            img.alt = key || "barcode";
            // CHANGE: respetar el tamaño del canvas; el wrapper rotado lo posiciona
            img.style.width = cv.style.width || "100%";
            img.style.height = cv.style.height || "100%";

            try {
                await img.decode();
            } catch {
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            }

            cv.replaceWith(img);
        } catch (err) {
            console.error("Error generando barcode para impresión:", err);
        }
        }

        clone.classList.add("print-label");
        clone.style.border = "none";
        clone.style.boxShadow = "none";

        printArea.appendChild(clone);
        document.body.appendChild(printArea);

        await new Promise((r) => requestAnimationFrame(() => r()));

        const cleanup = () => {
            try {
                printArea.remove();
            } catch {}
            window.removeEventListener("afterprint", cleanup);
        };
        window.addEventListener("afterprint", cleanup);
        window.print();
    };
    

    return(
        <>
        <div className="container mt-2">
            <h3 className="mt-3 mb-3"><i className="bi bi-printer me-2" />FRU PVS Reprint Function</h3>

            <div className="row">
                <div className="col-md-8 card mt-4">
                    <div className="card-body">
                        <div className="form-group mb-3">
                            <label htmlFor="date">Date:</label>
                                <input id="date" type="text" className="form-control" value={form.date ?? ""} onChange={onChange("date")} disabled/>
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="serial">Part Number (HP): </label>
                            <input id="part" type="text" className="form-control" value={form.part ?? ""} onChange={onChange("part")} placeholder="Example: P52068-001"/>
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="">Serial Number:</label>
                            <input id="serial" type="text" className="form-control" value={form.serial ?? ""} onChange={onChange("serial")} placeholder="Example: PZXVTOARHSDBF" />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="">Country Of Origin:</label>
                            <input id="coo" type="text" className="form-control" value={form.coo ?? ""} onChange={onChange("coo")} placeholder="CN"/>
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="">CT:</label>
                            <input id="cp" type="text" className="form-control" value={form.cp ?? ""} onChange={onChange("cp")} placeholder="CT Code" />
                        </div>
                        <div className="form-group mb-3">
                            <div className="row">
                                <div className="col-sm-6 d-grid">
                                    <button className="btn btn-primary" onClick={onRetrieve}>Retrieve</button>
                                </div>
                                <div className="col-sm-6 d-grid">
                                    <button className="btn btn-success" onClick={printLabelContainerInline}>Print Label</button>
                                </div>
                            </div>
                            {/* <button className="btn btn-success mx-1" onClick={printPdfSinglePagePerCopy}>Print Labels (PDF) Separate Files</button> */}
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mt-4">
                    <h5>Preview</h5>
                    {labelPreview}
                </div>
            </div>
        </div>
        </>
        
    );
}