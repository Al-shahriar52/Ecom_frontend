import React, { useEffect, useMemo, useState } from 'react';
import { X, MapPin, Star, Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchPoliceStations, savePickupLocation, deletePickupLocation } from './courierApi';

const EMPTY = { label: '', steadfastAddressId: '', policeStationId: '', policeStationName: '', address: '', contactNumber: '', primaryLocation: false };

const PickupLocationsModal = ({ locations, onClose, onChanged }) => {
    const [editing, setEditing] = useState(null); // null = list view, object = form
    const [stations, setStations] = useState([]);
    const [stationQuery, setStationQuery] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPoliceStations()
            .then((d) => setStations(Array.isArray(d) ? d : []))
            .catch(() => toast.error('Could not load police stations'));
    }, []);

    const stationName = (s) => s.name || s.police_station_name || s.title || `#${s.id}`;
    const filtered = useMemo(() => {
        const q = stationQuery.trim().toLowerCase();
        return stations.filter((s) => !q || stationName(s).toLowerCase().includes(q)).slice(0, 60);
    }, [stations, stationQuery]);

    const set = (k, v) => setEditing((e) => ({ ...e, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        if (!/^01[3-9]\d{8}$/.test(editing.contactNumber.trim())) {
            toast.error('Contact number must be 11 digits starting 013-019');
            return;
        }
        if (!editing.policeStationId) { toast.error('Choose a police station'); return; }
        setSaving(true);
        try {
            await savePickupLocation({
                label: editing.label,
                steadfastAddressId: Number(editing.steadfastAddressId),
                policeStationId: Number(editing.policeStationId),
                policeStationName: editing.policeStationName,
                address: editing.address,
                contactNumber: editing.contactNumber.trim(),
                primaryLocation: editing.primaryLocation,
            }, editing.id);
            toast.success('Location saved');
            setEditing(null);
            onChanged();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not save location');
        } finally { setSaving(false); }
    };

    const remove = async (loc) => {
        if (!window.confirm(`Remove "${loc.label}"? Past requests keep their history.`)) return;
        try { await deletePickupLocation(loc.id); toast.success('Location removed'); onChanged(); }
        catch (err) { toast.error(err.response?.data?.message || 'Could not remove'); }
    };

    return (
        <div className="cp-overlay" onClick={onClose}>
            <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
                <div className="cp-modal-h">
                    <h3>{editing ? (editing.id ? 'Edit location' : 'New pickup location') : 'Pickup locations'}</h3>
                    <button className="cp-x" onClick={onClose} aria-label="Close"><X size={18} /></button>
                </div>

                {!editing && (
                    <div className="cp-modal-b">
                        {locations.length === 0 && <div className="cp-empty">No locations yet. Add the warehouse your rider should visit.</div>}
                        {locations.map((l) => (
                            <div className="cp-loc" key={l.id}>
                                <MapPin size={16} className="cp-loc-ic" />
                                <div className="cp-loc-body">
                                    <div className="cp-loc-t">{l.label} {l.primaryLocation && <span className="cp-chip"><Star size={11} /> Default</span>}</div>
                                    <div className="cp-loc-s">{l.address}</div>
                                    <div className="cp-loc-s">{l.contactNumber}{l.policeStationName ? ` · ${l.policeStationName}` : ''}</div>
                                </div>
                                <button className="cp-ibtn" onClick={() => { setEditing({ ...l }); setStationQuery(''); }} aria-label="Edit"><Pencil size={14} /></button>
                                <button className="cp-ibtn danger" onClick={() => remove(l)} aria-label="Delete"><Trash2 size={14} /></button>
                            </div>
                        ))}
                        <button className="cp-btn pri" onClick={() => { setEditing({ ...EMPTY }); setStationQuery(''); }}><Plus size={14} /> Add location</button>
                    </div>
                )}

                {editing && (
                    <form className="cp-modal-b cp-form" onSubmit={submit}>
                        <label>Label
                            <input required maxLength={80} value={editing.label} onChange={(e) => set('label', e.target.value)} placeholder="Main warehouse" />
                        </label>
                        <label>Steadfast address ID
                            <input required type="number" min="1" value={editing.steadfastAddressId} onChange={(e) => set('steadfastAddressId', e.target.value)} placeholder="From your Steadfast merchant panel" />
                        </label>
                        <label>Police station
                            <input value={stationQuery} onChange={(e) => setStationQuery(e.target.value)} placeholder="Search…" />
                            <select
                                required
                                size={5}
                                value={editing.policeStationId}
                                onChange={(e) => {
                                    const s = stations.find((x) => String(x.id) === e.target.value);
                                    setEditing((cur) => ({ ...cur, policeStationId: e.target.value, policeStationName: s ? stationName(s) : '' }));
                                }}
                            >
                                {filtered.map((s) => <option key={s.id} value={s.id}>{stationName(s)}</option>)}
                            </select>
                            {editing.policeStationName && <span className="cp-hint">Selected: {editing.policeStationName}</span>}
                        </label>
                        <label>Address
                            <textarea required maxLength={255} rows={2} value={editing.address} onChange={(e) => set('address', e.target.value)} />
                        </label>
                        <label>Contact number
                            <input required value={editing.contactNumber} onChange={(e) => set('contactNumber', e.target.value)} placeholder="01XXXXXXXXX" inputMode="numeric" />
                        </label>
                        <label className="cp-check">
                            <input type="checkbox" checked={!!editing.primaryLocation} onChange={(e) => set('primaryLocation', e.target.checked)} />
                            Use as default location
                        </label>
                        <div className="cp-actions">
                            <button type="button" className="cp-btn" onClick={() => setEditing(null)}>Back</button>
                            <button type="submit" className="cp-btn pri" disabled={saving}>{saving ? 'Saving…' : 'Save location'}</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PickupLocationsModal;
