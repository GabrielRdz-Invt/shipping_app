import { useEffect, useState } from "react";
import * as api from '../api/shipments';
import ShipmentForm from "../components/ShipmentForm";
import { createPortal } from "react-dom";

export default function Shipments() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();
    const [queryId, setQueryId] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1);  // página actual (1-based)
    const [pageSize, setPageSize] = useState(10);       // filas por página

    /* function openModal() { setShowModal(true); }
    function closeModal() { setShowModal(false); } */
    
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    function openDeleteModal(id) { setDeleteId(id); }
    function closeDeleteModal() { setDeleteId(null); }

    const [scanOutId, setScanOutId] = useState(null);
    const [scanOutInput, setScanOutInput] = useState("");

    // Update shipments
    const [editId, setEditId] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [editInitial, setEditInitial] = useState(null);

    // Cargar todos al montar
    useEffect(() => { (async () => { await loadAll(); })(); }, []);

    useEffect(() => {
        if (showModal) {
            document.body.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
            const timer = setTimeout(() => {
                const input = document.querySelector('.modal input[name="id"]');
                input?.focus();
            }, 50);
            return () => {
                clearTimeout(timer);
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
            };
        }
        else
        {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
        }
    }, [showModal]);

    useEffect(() => {
        if (deleteId) {
            document.body.classList.add("modal-open");
            document.body.style.overflow = "hidden";
            return () => {
                document.body.classList.remove("modal-open");
                document.body.style.overflow = "";
        };
    }
    }, [deleteId]);

    // [UPDATE] Bloqueo de scroll para modal de edición
    useEffect(() => {
        if (showEdit) {
                document.body.classList.add("modal-open");
                document.body.style.overflow = "hidden";
            return () => {
                document.body.classList.remove("modal-open");
                document.body.style.overflow = "";
            };
        }
    }, [showEdit]);
  
    
    function openModal() {
        setShowModal(true);
        // [CAMBIO] Al abrir modal de Scan In, solicitar al backend el próximo ID y prefill del formulario
        (async () => {
        try {
            setError(undefined);
            const { id } = await api.getNextId(); // nuevo endpoint GET /IepCrossingDockShipments/next-id
            setEditInitial({ id });               // reutilizamos initialData para pasar el ID al ShipmentForm
        } catch (e) {
            setError(e.message ?? "No se pudo generar el ID");
        }
        })();
    }
    
    function closeModal() {
        setShowModal(false);
        setEditInitial(null); // [CAMBIO] limpiar initialData al cerrar
    }

    function openScanOutModal(id) {
        setScanOutId(id);
        // Prellenar con ahora (local) → formato "YYYY-MM-DDTHH:mm"
        const now = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const yyyy = now.getFullYear();
        const mm = pad(now.getMonth() + 1);
        const dd = pad(now.getDate());
        const hh = pad(now.getHours());
        const min = pad(now.getMinutes());
        setScanOutInput(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
    }

    function closeScanOutModal() {
        setScanOutId(null);
        setScanOutInput("");
    }
    
    
    async function handleCreateFromModal(dto) {
        try {
            setError(undefined);
            const created = await api.create(dto);
            setRows((prev) => [created, ...prev]);
            setCurrentPage(1);
            setShowModal(false);
            setEditInitial(null);
        } catch (err) {
            setError(err.message ?? "Error creando el registro");
        }
    }

    async function confirmDelete() {
        if (!deleteId) return;
        setDeleting(true);
        setError(undefined);
        try{
            await api.remove(deleteId);
            setRows(prev => prev.filter(r => r.id !== deleteId));
            closeDeleteModal();
        }
        catch(e){
            setError(e.message || "Error al eliminar");
        } finally {
            setDeleting(false);
        }
    }

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
    
    // [UPDATE] Abrir modal de edición con prefill
    function openEditModal(row) {
        setEditId(row.id);
        setEditInitial(row);
        setShowEdit(true);
    }

    // [UPDATE] Cerrar modal de edición
    function closeEditModal() {
        setShowEdit(false);
        setEditId(null);
        setEditInitial(null);
    }

    // [UPDATE] Guardar cambios (PUT) y actualizar la fila
    async function handleUpdateFromModal(dto) {
        if (!editId) return;
        setLoading(true); setError(undefined);
        try {
            const updated = await api.update(editId, dto);
            setRows((prev) => prev.map((r) => (r.id === editId ? { ...r, ...updated } : r)));
            setShowEdit(false);
        } catch (e) {
            setError(e.message || "Error al actualizar");
        } finally {
            setLoading(false);
        }
    }

    const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '');
    
    function toIsoFromLocalInput(value) {
        if (!value) return null;
        const dt = new Date(value);
        return isNaN(dt.getTime()) ? null : dt.toISOString();
    }

    async function confirmScanOut() {
        if (!scanOutId) return;
        const iso = toIsoFromLocalInput(scanOutInput);
        if (!iso) { setError("Fecha/hora inválida."); return; }

        setLoading(true); setError(undefined);
        try {
        const updated = await api.scanOut(scanOutId, iso, "2");
        setRows(prev => prev.map(r =>
            r.id === scanOutId
            ? {
                ...r,
                status: "2",
                shipOutDate: updated.shipOutDate ?? updated.ShipOutDate ?? iso
                }
            : r
        ));
        closeScanOutModal();
        } catch (e) {
            setError(e.message || "Error en Scan Out");
        } finally {
            setLoading(false);
        }
    }

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

    const modalPortal = showModal ? createPortal(
        <>
        <div className="modal fade show" style={{ display: 'block', zIndex: 1060 }} tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title"><i className="bi bi-plus-circle me-1" />  &nbsp;Scan In</h5>
                        <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <ShipmentForm onSubmit={handleCreateFromModal} initialData={editInitial} />
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
        <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={closeModal}></div>
        </>,
        document.body
    ) : null;

    const deletePortal = deleteId
    ? createPortal(
        <>
        <div className="modal fade show" style={{ display: "block", zIndex: 1060 }} tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Confirmar eliminación</h5>
                        <button className="btn-close" onClick={closeDeleteModal} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                    <p>
                        ¿Seguro que quieres eliminar el envío con ID{" "}
                        <strong>{deleteId}</strong>?
                    </p>
                    <p className="text-warning small mb-0">
                        (Función de desarrollo: no se usa en producción)
                    </p>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={closeDeleteModal} disabled={deleting}>
                            Cancelar
                        </button>
                        <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
                            {deleting ? "Eliminando..." : "Eliminar"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1050 }}
            onClick={closeDeleteModal}
        />
        </>,
        document.body
    ) : null;
    
    const scanOutPortal = scanOutId
    ? createPortal(
        <>
        <div className="modal fade show" style={{ display: "block", zIndex: 1060 }} tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Confirm Scan Out</h5>
                        <button className="btn-close" onClick={closeScanOutModal} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Scan Out DateTime:</label>
                            <input type="datetime-local" className="form-control" value={scanOutInput} onChange={(e) => setScanOutInput(e.target.value)}/>
                            {/* <div className="form-text">
                                Confirma la hora de salida; se actualizarán STATUS=2 y ShipOutDate.
                            </div> */}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={closeScanOutModal}>Cancel</button>
                        <button className="btn btn-success" onClick={confirmScanOut}>
                            <i className="bi bi-box-arrow-right me-2" />
                            Confirm Scan Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1050 }}
            onClick={closeScanOutModal}
        />
        </>,
        document.body
    )
    : null;
    
    // [UPDATE] Guardar cambios (PUT) y actualizar la fila
    async function handleUpdateFromModal(dto) {
        if (!editId) return;
        setLoading(true); setError(undefined);
        try {
            const updated = await api.update(editId, dto);
            setRows((prev) => prev.map((r) => (r.id === editId ? { ...r, ...updated } : r)));
            setShowEdit(false);
        } catch (e) {
            setError(e.message || "Error al actualizar");
        } finally {
            setLoading(false);
        }
    }

    // [UPDATE] Portal de modal de edición
    const editPortal = showEdit
    ? createPortal(
        <>
        <div className="modal fade show" style={{ display: "block", zIndex: 1060 }} tabIndex="-1" role="dialog" aria-modal="true" >
        <div className="modal-dialog modal-lg">
            <div className="modal-content">
            <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-truck" /> &nbsp;Edit Shipment</h5>
                <button type="button" className="btn-close" onClick={closeEditModal} aria-label="Close"></button>
            </div>
            <div className="modal-body">
                <ShipmentForm onSubmit={handleUpdateFromModal} initialData={editInitial} />
            </div>
            <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeEditModal}>Cancel</button>
            </div>
            </div>
        </div>
        </div>
        <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1050 }}
        onClick={closeEditModal}
        />
        </>,
        document.body
    )
    : null;

    return (
        <>
        <div className="container my-4">
            <h2 className="mt-3 mb-3"><i className="bi bi-truck me-2" /> Shipments</h2>
            {/* Toolbar */}
            <div className="d-flex flex-wrap gap-2 my-3 align-items-center">
                <button className="btn btn-primary" onClick={loadAll}><i className="bi bi-arrow-clockwise" /></button>
                
                <div className="d-flex gap-2">
                    <button className="btn btn-success" onClick={openModal}><i className="bi bi-box-arrow-in-right" /> Scan In</button>
                </div>

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
                    <table className="table table-striped table-hover" style={{fontSize:"85%"}}>
                        <thead className="table-dark">
                            <tr>
                                <th>Status</th>
                                <th style={{ minWidth: '150px' }}>ID</th>
                                <th>HAWB</th>
                                <th>INV Ref PO</th>
                                <th>HP Part Num</th>
                                <th>IEC Part Num</th>
                                <th>Qty</th>
                                <th>Bulks</th>
                                <th>Carrier</th>
                                <th>Bin</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageRows.map((s) => (
                            <tr key={s.id}>
                                <td>
                                    {s.status == '1' ? ( <span className="badge bg-success">In</span> ) 
                                    : s.status == '2' ? ( <span className="badge bg-primary">Out</span> ) 
                                    : ( s.status )}
                                </td>
                                <td>{s.id}</td>
                                <td>{s.hawb}</td>
                                <td>{s.invRefPo}</td>
                                <td>{s.hpPartNum}</td>
                                <td>{s.iecPartNum}</td>
                                <td>{s.qty ?? ''}</td>
                                <td>{s.bulks}</td>
                                <td>{s.carrier}</td>
                                <td>{s.bin}</td>
                                <td>
                                    {/* Unicamente para propositos de Dev */}
                                    {/* <button className="btn btn-sm btn-outline-danger me-1" onClick={() => openDeleteModal(s.id)}>
                                        <i className="bi bi-trash" />
                                    </button> */}
                                    {s.status == '1' || s.status != '2' ? ( <button className="btn btn-outline-dark btn-sm me-1" onClick={() => openScanOutModal(s.id)} title="Scan Out"><i className="bi bi-box-arrow-in-left" /> Scan Out</button> ) 
                                    : s.status == '2' ? (<span className="badge bg-primary align-self-center me-1"><i className="bi bi-check2-circle me-1"/> Out</span>) 
                                    : ( <span className="badge bg-warning me-1">Unknown</span> )}
                                    <button className="btn btn-outline-info btn-sm" title="Update" onClick={() => openEditModal(s)}>
                                        <i className="bi bi-pencil" /> Edit
                                    </button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer de paginación */}
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

            {/* Modal via Portal */}
            {modalPortal}
            {deletePortal}
            {scanOutPortal}
            {editPortal}
            </>
    );
}
