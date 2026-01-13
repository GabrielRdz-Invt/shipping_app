import React, { useEffect, useMemo, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

import '../assets/css/label.css';

export default function PrintLabels()
{
    const [form, setForm] = useState({
        date    : "",
        part : "",
        coo     : "",
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

    useEffect(() => {  
        const part = form.part?.trim();
        if (barcodeRef.current) {
            const ctx = barcodeRef.current.getContext("2d");
            ctx?.clearRect(0, 0, barcodeRef.current.width, barcodeRef.current.height);

            if (part) {
                JsBarcode(barcodeRef.current, part, {
                format: "code128",
                displayValue: true,
                fontSize: 14,
                height: 60,
                margin: 0,
                });
            }
        }

    }, [form.part]);

    
    const labelPreview = useMemo(() => {
        const date = form.date ?? "";
        const part = form.part ?? "";
        const coo = form.coo ?? "";
        const copiesText = form.copies ?? "1";

        return (
        <div id="labelContainer" className="label-size border p-3 bg-white">
            <div className="d-flex justify-content-between align-items-start">
                <h5 className="mb-3">FRU PVS Reprint</h5>
                <div>
                    <strong>Copies:</strong> {copiesText}
                </div>
            </div>

            <div style={{ fontSize: 14 }}>
                <div className="mb-1">
                    <strong>Date:</strong> {date || "(auto en Retrieve)"}
                </div>
                <div className="mb-1">
                    <strong>Part Number (HP):</strong> {part || "(escanéalo/teclea)"}
                </div>
                <div className="mb-3">
                    <strong>Country Of Origin:</strong> {coo || "(manual)"}
                </div>
            </div>

            <hr />

            <div className="mt-2">
                <canvas ref={barcodeRef} />
            </div>

            <div className="mt-3">
                <small className="text-muted">Prototype label preview (PDF)</small>
            </div>
        </div>
        );
    }, [form]);

    const buildPdfOptions = () => ({
        margin: 0,
        filename: `label_${form.part || "sample"}.pdf`,
        image: { type: "jpeg", quality: 1.0 },
        html2canvas: { scale : 2 },
        jsPDF : {unit: "in", format : [4, 6], orientation: "portrait"}
    });
    
    const getCopiesSafe = () => {
        const n = parseInt(form.copies, 10);
        return Number.isFinite(n) && n > 0 ? n : 1;
    };

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
            await img.decode(); // rápido si está en cache
        } catch {
            await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // resolvemos también en error para no bloquear
            });
        }
    };

    /* const printPdfSinglePagePerCopy = async () => {
        const node = document.getElementById("labelContainer");
        if (!node) return;
        
        const options = buildPdfOptions();
        const copies = getCopiesSafe();

        for (let i = 1; i <= form.copies; i++){
            await html2pdf().set(options).from(node).save(`label_${form.part || "sample"}_${i}.pdf`);
        }
    };

    const printLabelsInSingleFile = async () => {
        const node = document.getElementById("labelContainer");
        if (!node) return;

        const options = {
            margin: 0,
            filename: `labels_${form.part || "sample"}_x${form.copies}.pdf`,
            image: { type: "jpeg", quality: 1.0 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: [4, 6], orientation: "portrait" }
        };

        const worker = html2pdf().set(options).from(node).toPdf();
        const pdf = await worker.get("pdf");
        const canvas = await html2pdf().set({ html2canvas: { scale: 2 } }).from(node).toCanvas();
        const img = canvas.toDataURL("image/jpeg", 1.0);

        const copies = (() => {
            const n = parseInt(form.copies ?? "1", 10);
            return Number.isFinite(n) && n > 0 ? n : 1;
        })();

        for (let i = 1; i < copies; i++) {
            pdf.addPage([4, 6], "portrait");
            pdf.addImage(img, "JPEG", 0, 0, 4, 6);
        }
        pdf.save(options.filename);
    }; */

    const printLabelContainerInline = async () => {
        const container = document.getElementById("labelContainer");

        if (!container) return;
        const copies = getCopiesSafe();
        const barcodeURL = buildBarcodeDataUrl(form.part);

        await preloadImage(barcodeURL);
        const printArea = document.createElement("div");
        printArea.id = "printArea";

        for (let i = 0; i < copies; i++) {
            const clone = container.cloneNode(true);
            const cloneCanvas = clone.querySelector("canvas");
            const img = document.createElement("img");
            img.src = barcodeURL || "";
            img.alt = "barcode";
            img.style.width = "100%";

            if (cloneCanvas) {
                cloneCanvas.replaceWith(img);
            } else {
                const hr = clone.querySelector("hr");
                (hr?.parentNode || clone).appendChild(img);
            }
            clone.classList.add("print-label");
            clone.style.border = "none";
            clone.style.boxShadow = "none";
            const note = clone.querySelector("small.text-muted");

            if (note) note.remove();
            printArea.appendChild(clone);
        }
        document.body.appendChild(printArea);
        await new Promise((r) => requestAnimationFrame(() => r()));
        const cleanup = () => {
            try { printArea.remove(); } catch {}
            window.removeEventListener("afterprint", cleanup);
        };
        window.addEventListener("afterprint", cleanup);
        window.print();
    };
    

    return(
        <>
        <div className="container mt-2">
            <h3>FRU PVS Reprint Function</h3>

            <div className="row">
                <div className="col-md-8 card mt-4">
                    <div className="card-body">
                        <div className="form-group mb-3">
                            <label htmlFor="date">Date:</label>
                                <input id="date" type="text" className="form-control" value={form.date ?? ""} onChange={onChange("date")} disabled/>
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="">Part Number (HP): </label>
                            <input id="part" type="text" className="form-control" value={form.part ?? ""} onChange={onChange("part")} placeholder="Ej. P52068-001"/>
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="">Country Of Origin:</label>
                            <input id="coo" type="text" className="form-control" value={form.coo ?? ""} onChange={onChange("coo")} placeholder="CN"/>
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="">Total Labels:</label>
                            <input id="copies" type="number" min={1} className="form-control" value={form.copies ?? "1"} onChange={onChange("copies")} placeholder="1"/>
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
                    {/* <div className="card-body"> */}
                        <h5>Preview</h5>
                        {labelPreview}
                    {/* </div> */}
                </div>
            </div>
        </div>
        </>
        
    );
}