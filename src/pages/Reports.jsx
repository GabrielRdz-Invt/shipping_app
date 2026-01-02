import { useState } from 'react';
import * as api from '../api/shipments';

function toIsoBoundsOrThrow(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
        throw new Error('Fecha inválida');
    }
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const startIso = `${yyyy}-${mm}-${dd}T00:00:00`;
    const endIso   = `${yyyy}-${mm}-${dd}T23:59:59`;
    return { startIso, endIso };
}

export default function Reports() {
  const [fromDate, setFromDate] = useState('');      // yyyy-MM-dd
  const [toDate, setToDate] = useState('');          // yyyy-MM-dd
  const [dateField, setDateField] = useState('rcvd'); // 'rcvd' | 'shipout'
  const [rows, setRows] = useState([]);              // report results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

    async function handleGenerate() {
        // console.debug('[Reports] Generating report with:', { fromDate, toDate, dateField });
        setError(undefined);
        if (!fromDate || !toDate) {
            setError('Selecciona ambas fechas.');
            return;
        }
        let fromIso, toIso;
        try {
            const { startIso } = toIsoBoundsOrThrow(fromDate);
            const { endIso }   = toIsoBoundsOrThrow(toDate);
            fromIso = startIso;
            toIso   = endIso;
        } catch {
            setError('Fechas inválidas.');
            return;
        }

        setLoading(true);
        try {
            const data = await api.getReport({ fromIso, toIso, dateField });
            setRows(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message ?? 'Error inesperado');
        } finally {
            setLoading(false);
        }
    }

  // [UPDATED] Export CSV
    async function handleExportCsv() {
        setError(undefined);
        if (!fromDate || !toDate) { setError('Selecciona ambas fechas.'); return; }

        let fromIso, toIso;
        try {
            const { startIso } = toIsoBoundsOrThrow(fromDate);
            const { endIso }   = toIsoBoundsOrThrow(toDate);
            fromIso = startIso;
            toIso   = endIso;
        } catch {
            setError('Fechas inválidas.');
            return;
        }

        try {
            await api.downloadReportCsv({ fromIso, toIso, dateField });
        } catch (e) {
            setError(e.message ?? 'Error exportando CSV');
        }
    }

  // [CAMBIO] Export PDF (cliente con jsPDF/autotable): sin '!'
    async function handleExportPdf() {
        setError(undefined);
        if (!rows.length) { setError('Genera el reporte antes de exportar.'); return; }
        if (!fromDate || !toDate) { setError('Selecciona ambas fechas.'); return; }

        let fromIso, toIso;
        try {
            const { startIso } = toIsoBoundsOrThrow(fromDate);
            const { endIso }   = toIsoBoundsOrThrow(toDate);
            fromIso = startIso;
            toIso   = endIso;
        } catch {
            setError('Fechas inválidas.');
            return;
        }

        try {
            await api.exportReportPdfClient(rows, { fromIso, toIso, dateField });
        } catch (e) {
            setError(e.message ?? 'Error exportando PDF');
        }
    }

    return (
    <div className="container py-3">
    <h3 className="mb-3">Reports Page</h3>
        {/* Filtros */}
        <div className="card mb-3">
            <div className="card-body">
                <div className="row g-3 align-items-end">
                    <div className="col-sm-3">
                        <label className="form-label">Date From:</label>
                        <input type="datetime-local" className="form-control" value={fromDate} onChange={(e)=>setFromDate(e.target.value)}/>
                    </div>
                    <div className="col-sm-3">
                        <label className="form-label">Date To:</label>
                        <input type="datetime-local" className="form-control" value={toDate} onChange={(e)=>setToDate(e.target.value)} />
                    </div>
                    <div className="col-sm-3">
                        <label className="form-label">Search By:</label>
                        {/* [CAMBIO] Selección de campo de fecha: rcvd vs shipout */}
                        <select className="form-select" value={dateField} onChange={(e)=>setDateField(e.target.value)} >
                            <option value="rcvd">Scan In Date</option>
                            <option value="shipout">Scan Out Date</option>
                        </select>
                    </div>
                    <div className="col-sm-3">
                        <button className="btn btn-success w-100" onClick={handleGenerate}>
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Acciones de export */}
        <div className="d-flex justify-content-end mb-2">
            <button className="btn btn-outline-success btn-sm me-2" onClick={handleExportCsv}>
                <i className="bi bi-filetype-csv"/> Export to Excel
            </button>
            {/* <button className="btn btn-outline-danger btn-sm" onClick={handleExportPdf}>
                <i className="bi bi-filetype-pdf"/>  Export to PDF
            </button> */}
        </div>

        {/* Mensajes */}
        {loading && <div className="alert alert-info">Loading...</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Resultados */}
        <div className="card">
            <div className="card-header">Report Results</div>
                <div className="card-body">
                {!rows.length && !loading && (
                    <div className="text-muted">
                    Report data will be displayed here after generation.
                    </div>
                )}
                {!!rows.length && (
                    <div className="table-responsive">
                        <table className="table table-sm table-striped align-middle">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Status</th>
                                <th>HAWB</th>
                                <th>INV Ref PO</th>
                                <th>IEC Part Num</th>
                                <th>Qty</th>
                                <th>Bulks</th>
                                <th>Carrier</th>
                                <th>Bin</th>
                                <th>RcvdDate</th>
                                <th>ShipOutDate</th>
                                <th>Operator</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rows.map((r) => (
                                <tr key={r.id}>
                                <td>{r.id}</td>
                                <td>{r.status}</td>
                                <td>{r.hawb}</td>
                                <td>{r.invRefPo}</td>
                                <td>{r.iecPartNum}</td>
                                <td>{r.qty ?? ''}</td>
                                <td>{r.bulks}</td>
                                <td>{r.carrier}</td>
                                <td>{r.bin}</td>
                                <td>{r.rcvdDate ?? ''}</td>
                                <td>{r.shipOutDate ?? ''}</td>
                                <td>{r.operatorName ?? ''}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className="small text-muted">
                            Showing {rows.length} rows
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
    );
}
