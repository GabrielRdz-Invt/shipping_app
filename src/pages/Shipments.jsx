import { useEffect, useState } from "react";
import * as api from '../api/shipments';

export default function Shipments() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();
    const [queryId, setQueryId] = useState('');

    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1);  // página actual (1-based)
    const [pageSize, setPageSize] = useState(5);       // filas por página

    // Cargar todos al montar
    useEffect(() => { (async () => { await loadAll(); })(); }, []);

    async function loadAll() {
        setLoading(true); setError(undefined);
        try {
            const data = await api.getAll();
            setRows(data);
            setCurrentPage(1); // Reinicia a primera página
        } catch (e) {
            setError(e.message || 'Error inesperado');
        } finally {
            setLoading(false);
        }
    }

    // Buscar por ID
    async function searchById() {
        const id = queryId.trim();
        if (!id) { setError('Ingresa un ID'); return; }
        setLoading(true); setError(undefined);
        try {
            const data = await api.getById(id);
            setRows(data);
            setCurrentPage(1); // Reinicia a primera página
            if (!data.length) setError('No se encontró envío con ese ID.');
        } catch (e) {
            setError(e.message || 'Error inesperado');
        } finally {
            setLoading(false);
        }
    }

    const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '');

    // Variables de paginacion
    const totalRows = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex   = Math.min(startIndex + pageSize, totalRows);
    const pageRows   = rows.slice(startIndex, endIndex);

    // Helpers de paginación
    function goToPage(p) {
        const next = Math.min(Math.max(1, p), totalPages);
        setCurrentPage(next);
    }
    function prev() { goToPage(currentPage - 1); }
    function next() { goToPage(currentPage + 1); }

    // Render de números (Bootstrap pagination)
    function renderPagination() {
        // Genera hasta 5 números de página alrededor de la actual
        const maxButtons = 5;
        let start = Math.max(1, currentPage - Math.floor(maxButtons/2));
        let end   = Math.min(totalPages, start + maxButtons - 1);
        start     = Math.max(1, end - maxButtons + 1);

        const items = [];
        for (let p = start; p <= end; p++) {
        items.push(
            <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
            <button className="page-link" onClick={() => goToPage(p)} aria-current={p === currentPage ? 'page' : undefined}>
                {p}
            </button>
            </li>
        );
        }

        return (
            <nav aria-label="Paginación de shipments">
                <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={prev}>&laquo;</button>
                </li>
                {items}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={next}>&raquo;</button>
                </li>
                </ul>
            </nav>
        );
    }

  return (
    <>
    <div className="container my-4">
        <h2 className="mt-3">Shipments</h2>
        {/* Toolbar */}
        <div className="d-flex flex-wrap gap-2 my-3 align-items-center">
            <button className="btn btn-primary" onClick={loadAll}>Load all</button>

            <input className="form-control" style={{ maxWidth: 260 }} value={queryId} onChange={(e) => setQueryId(e.target.value)} placeholder="Search By ID" />
            <button className="btn btn-outline-primary" onClick={searchById}>Search</button>

            <div className="d-flex align-items-center ms-auto gap-2">
                <label className="text-muted">Page Rows:</label>
                <select className="form-select" style={{ width: 100 }} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                </div>
            </div>

            {loading && <div className="alert alert-info">Loading...</div>}
            {error   && <div className="alert alert-danger">{error}</div>}

            {/* Tabla */}
            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>HAWB</th>
                            <th>INV Ref PO</th>
                            <th>HP Part Num</th>
                            <th>IEC Part Num</th>
                            <th>Qty</th>
                            <th>Status</th>
                            <th>Carrier</th>
                            <th>Shipper</th>
                            <th>ShipOutStatus</th>
                            <th>RemainQty</th>
                            <th>ShipOutDate</th>
                            <th>RcvdDate</th>
                            <th>Truck#</th>
                            <th>Seal#</th>
                            <th>Container#</th>
                            <th>IMX_INV#</th>
                            <th>Operator</th>
                            <th>Cdt</th>
                            <th>Udt</th>
                            <th>Bulks</th>
                            <th>BoxPlt</th>
                            <th>Bin</th>
                            <th>Remark</th>
                            <th>Weight</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.map((s) => (
                        <tr key={s.id}>
                            <td>{s.id}</td>
                            <td>{s.hawb}</td>
                            <td>{s.invRefPo}</td>
                            <td>{s.hpPartNum}</td>
                            <td>{s.iecPartNum}</td>
                            <td>{s.qty ?? ''}</td>
                            <td>{s.status}</td>
                            <td>{s.carrier}</td>
                            <td>{s.shipper}</td>
                            <td>{s.shipOutStatus}</td>
                            <td>{s.remainQty ?? ''}</td>
                            <td>{fmtDate(s.shipOutDate)}</td>
                            <td>{fmtDate(s.rcvdDate)}</td>
                            <td>{s.truckNum}</td>
                            <td>{s.sealNum}</td>
                            <td>{s.containerNum}</td>
                            <td>{s.imxInvNum}</td>
                            <td>{s.operator}</td>
                            <td>{fmtDate(s.cdt)}</td>
                            <td>{fmtDate(s.udt)}</td>
                            <td>{s.bulks}</td>
                            <td>{s.boxPlt}</td>
                            <td>{s.bin}</td>
                            <td>{s.remark}</td>
                            <td>{s.weight}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 🔹 Footer de paginación */}
            <div className="d-flex align-items-center justify-content-between mt-2">
                <small className="text-muted">
                    Showing <strong>{startIndex + 1}</strong> – <strong>{endIndex}</strong> of <strong>{totalRows}</strong> rows
                </small>
                {renderPagination()}
            </div>

            {!loading && !error && rows.length === 0 && (
                <div className="alert alert-secondary mt-3">No records.</div>
            )}
        </div>
        </>
  );
}
