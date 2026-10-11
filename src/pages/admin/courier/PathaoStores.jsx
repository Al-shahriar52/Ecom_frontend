import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Plus, Star, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    fetchPathaoStores, syncPathaoStores, createPathaoStore, setDefaultPathaoStore,
    fetchPathaoCities, fetchPathaoZones, fetchPathaoAreas,
} from './courierApi';
import './CourierPickups.css';

const EMPTY = { name: '', contactName: '', contactNumber: '', secondaryContact: '', otpNumber: '', address: '', cityId: '', zoneId: '', areaId: '' };

const AddStoreModal = ({ onClose, onCreated }) => {
    const [form, setForm] = useState(EMPTY);
    const [cities, setCities] = useState([]);
    const [zones, setZones] = useState([]);
    const [areas, setAreas] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPathaoCities().then((d) => setCities(d || [])).catch(() => toast.error('Could not load cities'));
    }, []);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const pickCity = async (id) => {
        setForm((f) => ({ ...f, cityId: id, zoneId: '', areaId: '' }));
        setZones([]); setAreas([]);
        if (!id) return;
        try { setZones((await fetchPathaoZones(id)) || []); } catch { toast.error('Could not load zones'); }
    };
    const pickZone = async (id) => {
        setForm((f) => ({ ...f, zoneId: id, areaId: '' }));
        setAreas([]);
        if (!id) return;
        try { setAreas(((await fetchPathaoAreas(id)) || []).filter((a) => a.pickup_available !== false)); } catch { toast.error('Could not load areas'); }
    };

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, cityId: Number(form.cityId), zoneId: Number(form.zoneId), areaId: Number(form.areaId) };
            await createPathaoStore(payload);
            toast.success('Store submitted. Pathao approves new stores in about an hour.');
            onCreated();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not create the store');
        } finally { setSaving(false); }
    };

    return (
        <div className="cp-overlay" onClick={onClose}>
            <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
                <div className="cp-modal-h"><h3>New Pathao store</h3><button className="cp-x" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
                <form className="cp-modal-b cp-form" onSubmit={submit}>
                    <label>Store name <input required minLength={3} maxLength={50} value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
                    <label>Contact person <input required minLength={3} maxLength={50} value={form.contactName} onChange={(e) => set('contactName', e.target.value)} /></label>
                    <label>Contact number <input required inputMode="numeric" placeholder="01XXXXXXXXX" pattern="01[0-9]{9}" value={form.contactNumber} onChange={(e) => set('contactNumber', e.target.value)} /></label>
                    <label>Secondary contact <span className="cp-opt">optional</span> <input inputMode="numeric" pattern="(01[0-9]{9})?" value={form.secondaryContact} onChange={(e) => set('secondaryContact', e.target.value)} /></label>
                    <label>OTP number <span className="cp-opt">optional, receives delivery OTPs</span> <input inputMode="numeric" pattern="(01[0-9]{9})?" value={form.otpNumber} onChange={(e) => set('otpNumber', e.target.value)} /></label>
                    <label>Address <span className="cp-opt">15-120 characters</span>
                        <textarea required rows={2} minLength={15} maxLength={120} value={form.address} onChange={(e) => set('address', e.target.value)} /></label>
                    <label>City
                        <select required value={form.cityId} onChange={(e) => pickCity(e.target.value)}>
                            <option value="">Select city</option>
                            {cities.map((c) => <option key={c.city_id} value={c.city_id}>{c.city_name}</option>)}
                        </select></label>
                    <label>Zone
                        <select required value={form.zoneId} disabled={!zones.length} onChange={(e) => pickZone(e.target.value)}>
                            <option value="">Select zone</option>
                            {zones.map((z) => <option key={z.zone_id} value={z.zone_id}>{z.zone_name}</option>)}
                        </select></label>
                    <label>Area
                        <select required value={form.areaId} disabled={!areas.length} onChange={(e) => set('areaId', e.target.value)}>
                            <option value="">Select area</option>
                            {areas.map((a) => <option key={a.area_id} value={a.area_id}>{(a.area_name || '').trim()}</option>)}
                        </select></label>
                    <div className="cp-actions">
                        <button type="button" className="cp-btn" onClick={onClose}>Cancel</button>
                        <button className="cp-btn pri" disabled={saving}>{saving ? 'Submitting…' : 'Create store'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PathaoStores = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [showAdd, setShowAdd] = useState(false);

    const load = useCallback(async () => {
        try { setStores((await fetchPathaoStores()) || []); }
        catch { toast.error('Could not load stores'); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { load(); }, [load]);

    const sync = async () => {
        setSyncing(true);
        try { setStores((await syncPathaoStores()) || []); toast.success('Stores synced from Pathao'); }
        catch (e) { toast.error(e.response?.data?.message || 'Sync failed'); }
        finally { setSyncing(false); }
    };

    const makeDefault = async (s) => {
        try { setStores((await setDefaultPathaoStore(s.id)) || []); toast.success(`${s.name} is now the default store`); }
        catch (e) { toast.error(e.response?.data?.message || 'Could not set default'); }
    };

    return (
        <div className="cp-page">
            <div className="cp-pbar">
                <div>
                    <div className="cp-h1">Pathao stores</div>
                    <div className="cp-sub">Pathao picks parcels up from the store set on each booking</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="cp-btn" onClick={sync} disabled={syncing}><RefreshCw size={14} className={syncing ? 'cp-spin' : ''} /> Sync from Pathao</button>
                    <button className="cp-btn pri" onClick={() => setShowAdd(true)}><Plus size={14} /> Add store</button>
                </div>
            </div>
            <div className="cp-wrap">
                <section className="cp-card">
                    <div className="cp-tw">
                        <table className="cp-table">
                            <thead><tr><th>Store</th><th>Address</th><th>Status</th><th>Default</th></tr></thead>
                            <tbody>
                            {loading && <tr><td colSpan={4} className="cp-empty">Loading…</td></tr>}
                            {!loading && stores.length === 0 && (
                                <tr><td colSpan={4} className="cp-empty">No stores yet. Press "Sync from Pathao" if you already have one, or add a new store.</td></tr>
                            )}
                            {stores.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.name}<div className="cp-s">Pathao ID {s.externalStoreId}</div></td>
                                    <td>{s.address}</td>
                                    <td><span className={`cp-pill ${s.active ? 'ok' : 'warn'}`}>{s.active ? 'Active' : 'Pending approval'}</span></td>
                                    <td>
                                        {s.defaultStore
                                            ? <span className="cp-chip"><Star size={11} /> Default</span>
                                            : <button className="cp-btn" style={{ height: 28 }} disabled={!s.active} onClick={() => makeDefault(s)}>Make default</button>}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
            {showAdd && <AddStoreModal onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); load(); }} />}
        </div>
    );
};

export default PathaoStores;
