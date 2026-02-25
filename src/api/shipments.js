// const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7054/api'; // development environment
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://iep-app-n.iec.inventec:443/Warehouse_Api/api'; // production environment

export async function getAll(){
    const res = await fetch(`${BASE_URL}/IepCrossingDockShipments`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export async function getById(Id) {
    const res = await fetch(`${BASE_URL}/IepCrossingDockShipments/${Id}`);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    return res.json()
}

// Insert/Scan new shipment
export async function create(body) {
  const res = await fetch(`${BASE_URL}/IepCrossingDockShipments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (res.status === 201) {
    return res.json();
  }
  if (res.status === 409) {
    throw new Error('ID duplicado. Ya existe un envío con ese ID.');
  }
  if (res.status === 400) {
    const msg = await res.text();
    throw new Error(msg || 'Solicitud inválida');
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

// Delete shipment by ID
export async function remove(Id) {
    const res = await fetch(`${BASE_URL}/IepCrossingDockShipments/${encodeURIComponent(Id)}`, {
        method: 'DELETE'
    });
    if (res.status === 404) throw new Error('No existe el envío.');
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
    }
    return true;
}

// ScanOut shipment by ID
export async function scanOut(id, shipOutDateIso, statusText = "2") {
    const body = {
        status: String(statusText),
        shipOutDate: shipOutDateIso,
        setUdtFromShipOutDate: true
    };

    const url = `${BASE_URL}/IepCrossingDockShipments/${encodeURIComponent(id)}/scanout`;
    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (res.status === 404) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || 'No existe el envío.');
    }
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
}

/** [UPDATE] PUT: updates a shipment by id */
export async function update(id, body) {
    const res = await fetch(`${BASE_URL}/IepCrossingDockShipments/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (res.status === 404) throw new Error('No existe el envío');
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
}

export async function getNextId() {
    const res = await fetch(`${BASE_URL}/IepCrossingDockShipments/next-id`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json(); // { id: '2026-26-12-001' }
}

// Get report data as json array
export async function getReport({ fromIso, toIso, dateField = 'rcvd' }) {
    const params = new URLSearchParams();
    params.set('from', fromIso);
    params.set('to', toIso);
    params.set('dateField', dateField);

    const url = `${BASE_URL}/IepCrossingDockShipments/report?${params.toString()}`;
    console.debug('[getReport] url:', url);
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : (data.items ?? []);

}

// Download report as CSV
export async function downloadReportCsv({ fromIso, toIso, dateField = 'rcvd' }) {
  const params = new URLSearchParams();
  params.set('from', fromIso);
  params.set('to', toIso);
  params.set('dateField', dateField);

  const url = `${BASE_URL}/IepCrossingDockShipments/report.csv?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();

  const link = document.createElement('a');
  const fileName = `report_${fromIso.substring(0,10)}_to_${toIso.substring(0,10)}_${dateField}.csv`;
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Exportar to PDF. Not being used.
export async function exportReportPdfClient(rows, { fromIso, toIso, dateField = 'rcvd' }) {
  const { jsPDF } = await import('jspdf');
  // const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF();

  doc.setFontSize(12);
  doc.text(`Report ${dateField === 'shipout' ? 'Ship Out Date' : 'Scan In Date'}`, 14, 16);
  doc.text(`Range: ${fromIso.substring(0,10)} to ${toIso.substring(0,10)}`, 14, 24);

  const headers = [
    'ID','Status','HAWB','INV Ref PO','IEC Part Num','Qty','Bulks','Carrier','Bin','RcvdDate','ShipOutDate','Operator'
  ];
  const data = rows.map(r => ([
    r.id, r.status, r.hawb, r.invRefPo, r.iecPartNum, r.qty ?? '', r.bulks, r.carrier, r.bin, r.rcvdDate ?? '', r.shipOutDate ?? '', r.operatorName ?? ''
  ]));

  // autoTable(doc, { head: [headers], body: data, startY: 30, styles: { fontSize: 8 } });

  const fileName = `report_${fromIso.substring(0,10)}_to_${toIso.substring(0,10)}_${dateField}.pdf`;
  doc.save(fileName);
}
