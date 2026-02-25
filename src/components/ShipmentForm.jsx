import { useState, useEffect } from 'react';

/** [UPDATE] Convierte ISO → string para <input type="datetime-local"> */
function toLocalInputFromISO(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

/** [UPDATE] Convierte string de <input datetime-local> → ISO */
function toISOFromLocalInput(value) {
  if (!value) return null;
  const dt = new Date(value);
  return isNaN(dt.getTime()) ? null : dt.toISOString();
}

export default function ShipmentForm({ onSubmit, initialData }) {
    const [form, setForm] = useState({
        id: '',
        carrier: '',
        hawb: '',
        invRefPo: '',
        hpPartNum: '',
        iecPartNum: '',
        qty: '',
        bulks: '',
        boxPlt: '',
        rcvdDate: '',        // datetime-local
        weight: '',
        shipper: '',
        bin: '',
        remark: '',
        operator: '',
        status: '',
    });

    useEffect(() => {
        if (!initialData) return;
        setForm({
            id: initialData.id ?? "",
            carrier: initialData.carrier ?? "",
            hawb: initialData.hawb ?? "",
            invRefPo: initialData.invRefPo ?? "",
            hpPartNum: initialData.hpPartNum ?? "",
            iecPartNum: initialData.iecPartNum ?? "",
            qty: initialData.qty ?? "",
            bulks: initialData.bulks ?? "",
            boxPlt: initialData.boxPlt ?? "",
            rcvdDate: toLocalInputFromISO(initialData.rcvdDate ?? initialData.RcvdDate),
            weight: initialData.weight ?? "",
            shipper: initialData.shipper ?? "",
            bin: initialData.bin ?? "",
            remark: initialData.remark ?? "",
            operator: initialData.operator ?? "",
            status: initialData.status ?? "",
        });
    }, [initialData]);


  function handleChange(e) {
    const { name, value } = e.target;
    // console.log(`[handleChange] ${name}:`, value);
    setForm(prev => ({ ...prev, [name]: value ?? '' }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const dto = {
        id: form.id.trim(),
        carrier: form.carrier || null,
        hawb: form.hawb || null,
        invRefPo: form.invRefPo || null,
        hpPartNum: form.hpPartNum || null,
        iecPartNum: form.iecPartNum || null,
        qty: form.qty !== "" ? Number(form.qty) : null,
        bulks: form.bulks || null,
        boxPlt: form.boxPlt || null,
        rcvdDate: toISOFromLocalInput(form.rcvdDate),
        weight: form.weight || null,
        shipper: form.shipper || null,
        bin: form.bin || null,
        remark: form.remark || null,
        operator: form.operator || null,
        status : form.status || null,
    };
    onSubmit(dto);
  }

  const isEdit = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="row g-2">
        <div className="col-md-3">
            <label className="form-label">ID:</label>
            <input type="text" name="id" className="form-control" value={form.id} onChange={handleChange} readOnly={!isEdit} required={isEdit} disabled />
        </div>

        <div className="col-sm-3">
            <label className="form-label">Carrier:</label>
            <input className="form-control" name="carrier" placeholder="Carrier" value={form.carrier} onChange={handleChange} autoComplete="on" />
        </div>
        <div className="col-sm-3">
            <label className="form-label">HAWB:</label>
            <input className="form-control" name="hawb" placeholder="HAWB" value={form.hawb} onChange={handleChange} autoComplete="on" />
        </div>
        <div className="col-sm-3">
            <label className="form-label">Inv/Ref/PO:</label>
            <input className="form-control" name="invRefPo" placeholder="Inv/Ref/PO" value={form.invRefPo} onChange={handleChange} autoComplete="on" />
        </div>

        <div className="col-sm-3">
            <label className="form-label">HP Part Num:</label>
            <input className="form-control" name="hpPartNum" placeholder="HP Part Num" value={form.hpPartNum} onChange={handleChange} autoComplete="on" />
        </div>
        <div className="col-sm-3">
            <label className="form-label">IEC Part Num:</label>
            <input className="form-control" name="iecPartNum" placeholder="IEC Part Num" value={form.iecPartNum} onChange={handleChange} autoComplete="on" />
        </div>
        <div className="col-sm-2">
            <label className="form-label">Qty:</label>
            <input className="form-control" type="number" name="qty" placeholder="Qty" value={form.qty} onChange={handleChange} min={1} />
        </div>
        <div className="col-sm-2">
            <label className="form-label">Bulks:</label>
            <input className="form-control" name="bulks" placeholder="Bulks" value={form.bulks} onChange={handleChange} autoComplete="on" min={1} />
        </div>
        <div className="col-sm-2">
            <label className="form-label">Box/Plt:</label>
            <input className="form-control" name="boxPlt" placeholder="Box/Plt" value={form.boxPlt} onChange={handleChange} autoComplete="on" />
        </div>

        <div className="col-sm-4">
            <label className="form-label">Rcv Date:</label>
            <input className="form-control" type="datetime-local" name="rcvdDate" placeholder="Rcv Date" value={form.rcvdDate} onChange={handleChange} />
        </div>
        <div className="col-sm-4">
            <label className="form-label">Weight:</label>
            <input className="form-control" name="weight" placeholder="Weight" value={form.weight} onChange={handleChange} autoComplete="on" />
        </div>
        <div className="col-sm-4">
            <label className="form-label">Shipper:</label>
            <input className="form-control" name="shipper" placeholder="Shipper" value={form.shipper} onChange={handleChange} autoComplete="on" />
        </div>

        <div className="col-sm-4">
            <label className="form-label">Bin:</label>
            <input className="form-control" name="bin" placeholder="Bin" value={form.bin} onChange={handleChange} autoComplete="on" />
        </div>
        <div className="col-sm-4">
            <label className="form-label">Remark:</label>
            <input className="form-control" name="remark" placeholder="Remark" value={form.remark} onChange={handleChange} autoComplete="on" />
        </div>
        <div className="col-sm-4">
            <label className="form-label">Operator:</label>
            <input className="form-control" name="operator" placeholder="Operator" value={form.operator} onChange={handleChange} autoComplete="on" />
        </div>

        {form.status === "2" || form.status != "" ? (<>
            <div className="col-sm-4">
                <label className="form-label">Reverse Status: </label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                    <option value="1">Scanned In</option>
                    <option value="2">Scanned Out</option>
                </select>
            </div>
            <small className="text-muted mb-2" style={{fontSize:"80%"}}><i className="bi bi-info-circle me-1" />If you wish to set shipment as Out, please use the <b><i className="bi bi-box-arrow-in-left" /> Scan Out</b> button on the main table.</small>
            </>
        ) : null}

        <div className="col-12 mt-3">
            <button className="btn btn-success" type="submit"><i className="bi bi-save me-1" /> Save Shipment</button>
        </div>
    </form>
  );
}
