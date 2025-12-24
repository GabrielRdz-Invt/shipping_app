
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
    // hpPartNum: ''
  });

  /** [UPDATE] Prefill: carga los datos seleccionados en el formulario (solo si initialData existe) */
  useEffect(() => {
    if (!initialData) return; // ← evita reset en cada render cuando estás en Scan In
    setForm({
      id: initialData.id ?? '',
      carrier: initialData.carrier ?? '',
      hawb: initialData.hawb ?? '',
      invRefPo: initialData.invRefPo ?? '',
      iecPartNum: initialData.iecPartNum ?? '',
      qty: initialData.qty ?? '',
      bulks: initialData.bulks ?? '',
      boxPlt: initialData.boxPlt ?? '',
      rcvdDate: toLocalInputFromISO(initialData.rcvdDate ?? initialData.RcvdDate),
      weight: initialData.weight ?? '',
      shipper: initialData.shipper ?? '',
      bin: initialData.bin ?? '',
      remark: initialData.remark ?? '',
      operator: initialData.operator ?? '',
      // hpPartNum: initialData.hpPartNum ?? ''
    });
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value ?? '' }));
  }

  /** [UPDATE] Construye el DTO y dispara onSubmit (PUT/POST en el padre) */
  function handleSubmit(e) {
    e.preventDefault();
    if (!form.id.trim()) {
      alert('ID es requerido');
      return;
    }
    const dto = {
      // En POST (Scan In) el backend requiere ID; en PUT se ignora por ruta.
      id: form.id.trim(),
      carrier: form.carrier || null,
      hawb: form.hawb || null,
      invRefPo: form.invRefPo || null,
      iecPartNum: form.iecPartNum || null,
      qty: form.qty !== '' ? Number(form.qty) : null,
      bulks: form.bulks || null,
      boxPlt: form.boxPlt || null,
      rcvdDate: toISOFromLocalInput(form.rcvdDate),
      weight: form.weight || null,
      shipper: form.shipper || null,
      bin: form.bin || null,
      remark: form.remark || null,
      operator: form.operator || null,
      // hpPartNum: form.hpPartNum || null
    };
    onSubmit(dto);
  }

  const isEdit = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="row g-2">
      <div className="col-md-3">
        <input
          className="form-control"
          name="id"
          placeholder="ID *"
          value={form.id}
          onChange={handleChange}
          required
          readOnly={isEdit}     // ← en edición no permitir cambiar el ID
          autoComplete="on"
        />
      </div>

      <div className="col-sm-3">
        <input className="form-control" name="carrier" placeholder="Carrier" value={form.carrier} onChange={handleChange} autoComplete="on" />
      </div>
      <div className="col-sm-3">
        <input className="form-control" name="hawb" placeholder="HAWB" value={form.hawb} onChange={handleChange} autoComplete="on" />
      </div>
      <div className="col-sm-3">
        <input className="form-control" name="invRefPo" placeholder="Inv/Ref/PO" value={form.invRefPo} onChange={handleChange} autoComplete="on" />
      </div>

      <div className="col-sm-3">
        <input className="form-control" name="iecPartNum" placeholder="IEC Part Num" value={form.iecPartNum} onChange={handleChange} autoComplete="on" />
      </div>
      <div className="col-sm-3">
        <input className="form-control" type="number" name="qty" placeholder="Qty" value={form.qty} onChange={handleChange} />
      </div>
      <div className="col-sm-3">
        <input className="form-control" name="bulks" placeholder="Bulks" value={form.bulks} onChange={handleChange} autoComplete="on" />
      </div>
      <div className="col-sm-3">
        <input className="form-control" name="boxPlt" placeholder="Box/Plt" value={form.boxPlt} onChange={handleChange} autoComplete="on" />
      </div>

      <div className="col-sm-4">
        <input className="form-control" type="datetime-local" name="rcvdDate" placeholder="Rcv Date" value={form.rcvdDate} onChange={handleChange} />
      </div>
      <div className="col-sm-4">
        <input className="form-control" name="weight" placeholder="Weight" value={form.weight} onChange={handleChange} autoComplete="on" />
      </div>
      <div className="col-sm-4">
        <input className="form-control" name="shipper" placeholder="Shipper" value={form.shipper} onChange={handleChange} autoComplete="on" />
      </div>

      <div className="col-sm-4">
        <input className="form-control" name="bin" placeholder="Bin" value={form.bin} onChange={handleChange} autoComplete="on" />
      </div>
      <div className="col-sm-4">
        <input className="form-control" name="remark" placeholder="Remark" value={form.remark} onChange={handleChange} autoComplete="on" />
      </div>
      <div className="col-sm-4">
        <input className="form-control" name="operator" placeholder="Operator" value={form.operator} onChange={handleChange} autoComplete="on" />
      </div>

      <div className="col-12 mt-2">
        <button className="btn btn-success" type="submit">Guardar</button>
      </div>
    </form>
  );
}
