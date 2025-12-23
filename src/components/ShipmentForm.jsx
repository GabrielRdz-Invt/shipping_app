import { useState } from 'react';

export default function ShipmentForm({ onSubmit, initialData = {} }) {
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
        // Opcional: hpPartNum si lo decides
        // hpPartNum: ''
    });

    function parseDateInput(value) {
        if (!value) return null;
        const dt = new Date(value);
        return isNaN(dt.getTime()) ? null : dt.toISOString();
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!form.id.trim()) { alert('ID es requerido'); return; }
        
        const dto = {
            id: form.id.trim(),
            carrier: form.carrier || null,
            hawb: form.hawb || null,
            invRefPo: form.invRefPo || null,
            iecPartNum: form.iecPartNum || null,
            qty: form.qty !== '' ? Number(form.qty) : null,
            bulks: form.bulks || null,
            boxPlt: form.boxPlt || null,
            rcvdDate: parseDateInput(form.rcvdDate),
            weight: form.weight || null,
            shipper: form.shipper || null,
            bin: form.bin || null,
            remark: form.remark || null,
            operator: form.operator || null,
            // hpPartNum: form.hpPartNum || null
        };
        onSubmit(dto);
    }

    return (
        
        <form onSubmit={handleSubmit} className="row g-2">
            <div className="col-md-3">
                <input className="form-control" name="id" placeholder="ID *" value={form.id} onChange={handleChange} required />
            </div>

            <div className="col-sm-3">
                <input className="form-control" name="carrier" placeholder="Carrier" value={form.carrier} onChange={handleChange} />
            </div>
            <div className="col-sm-3">
                <input className="form-control" name="hawb" placeholder="HAWB" value={form.hawb} onChange={handleChange} />
            </div>
            <div className="col-sm-3">
                <input className="form-control" name="invRefPo" placeholder="Inv/Ref/PO" value={form.invRefPo} onChange={handleChange} />
            </div>

            <div className="col-sm-3">
                <input className="form-control" name="iecPartNum" placeholder="IEC Part Num" value={form.iecPartNum} onChange={handleChange} />
            </div>
            <div className="col-sm-3">
                <input className="form-control" type="number" name="qty" placeholder="Qty" value={form.qty} onChange={handleChange} />
            </div>
            <div className="col-sm-3">
                <input className="form-control" name="bulks" placeholder="Bulks" value={form.bulks} onChange={handleChange} />
            </div>
            <div className="col-sm-3">
                <input className="form-control" name="boxPlt" placeholder="Box/Plt" value={form.boxPlt} onChange={handleChange} />
            </div>

            <div className="col-sm-4">
                <input className="form-control" type="datetime-local" name="rcvdDate" placeholder="Rcv Date" value={form.rcvdDate} onChange={handleChange} />
            </div>
            <div className="col-sm-4">
                <input className="form-control" name="weight" placeholder="Weight" value={form.weight} onChange={handleChange} />
            </div>
            <div className="col-sm-4">
                <input className="form-control" name="shipper" placeholder="Shipper" value={form.shipper} onChange={handleChange} />
            </div>

            <div className="col-sm-4">
                <input className="form-control" name="bin" placeholder="Bin" value={form.bin} onChange={handleChange} />
            </div>
            <div className="col-sm-4">
                <input className="form-control" name="remark" placeholder="Remark" value={form.remark} onChange={handleChange} />
            </div>
            <div className="col-sm-4">
                <input className="form-control" name="operator" placeholder="Operator" value={form.operator} onChange={handleChange} />
            </div>

            <div className="col-12 mt-2">
                <button className="btn btn-success" type="submit">Guardar</button>
            </div>
        </form>

    );
}