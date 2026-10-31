import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import toast from 'react-hot-toast';
import {
    Award, LayoutGrid, Layers, MapPin, Map as MapIcon, Plus, Pencil, Trash2, Search, X, Star, Upload, Loader2, Image as ImageIcon, Package,
} from 'lucide-react';
import axiosInstance from '../../../api/AxiosInstance';
import SearchableSelect from '../../../components/admin/SearchableSelect';
import './CatalogManager.css';

const API = '/api/v1/admin/catalog';

const TABS = [
    { key: 'brands', label: 'Brands', one: 'brand', icon: Award, hint: 'Brands shown in the Brands menu and on products.' },
    { key: 'categories', label: 'Categories', one: 'category', icon: LayoutGrid, hint: 'Main departments, like Makeup or Skin. They appear in the top menu.' },
    { key: 'sub-categories', label: 'Sub-categories', one: 'sub-category', icon: Layers, hint: 'Groups inside a category, like Lipstick inside Makeup.' },
    { key: 'cities', label: 'Cities', one: 'city', icon: MapPin, hint: 'Cities customers can choose at checkout.' },
    { key: 'areas', label: 'Areas', one: 'area', icon: MapIcon, hint: 'Areas inside a city. Used for delivery address and coupons.' },
];

const errText = (e, fallback) => e?.response?.data?.message || e?.response?.data?.error || fallback;

/* ---------------------------------------------------------------- image picker */
function LogoPicker({ label, url, file, onFile, onClear }) {
    const ref = useRef(null);
    const preview = useMemo(() => (file ? URL.createObjectURL(file) : url), [file, url]);
    return (
        <div className="cm-field">
            <span className="cm-label">{label}</span>
            <div className="cm-pick">
                <div className="cm-pick-box" onClick={() => ref.current && ref.current.click()}>
                    {preview ? <img src={preview} alt="" /> : <Upload size={20} />}
                </div>
                <div className="cm-pick-side">
                    <button type="button" className="cm-btn ghost sm" onClick={() => ref.current && ref.current.click()}>{preview ? 'Replace' : 'Choose image'}</button>
                    {preview && onClear && <button type="button" className="cm-btn ghost sm del" onClick={onClear}>Remove</button>}
                    <small>Square PNG / JPG / WebP, up to 5 MB</small>
                </div>
                <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => { onFile(e.target.files?.[0] || null); e.target.value = ''; }} />
            </div>
        </div>
    );
}

/* ---------------------------------------------------------------- modal */
function EditModal({ tab, item, data, presetCity, onClose, onSaved }) {
    const editing = !!item;
    const [name, setName] = useState(item?.name || '');
    const [top, setTop] = useState(!!item?.top);
    const [parent, setParent] = useState(item?.categoryId || item?.cityId || presetCity || '');
    const [file, setFile] = useState(null);
    const [removeImg, setRemoveImg] = useState(false);
    const [many, setMany] = useState(false);
    const [names, setNames] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const h = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
        document.addEventListener('keydown', h);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', h); document.body.style.overflow = prev; };
    }, [onClose, saving]);

    const key = tab.key;
    const parentOptions = key === 'sub-categories' ? data.categories : data.cities;

    const submit = async (e) => {
        e.preventDefault();
        if (key === 'areas' && many) {
            if (!parent) { toast.error('Choose a city'); return; }
            if (!names.trim()) { toast.error('Type at least one area name'); return; }
        } else if (!name.trim()) { toast.error(`Enter the ${tab.one} name`); return; }
        if ((key === 'sub-categories' || key === 'areas') && !parent) { toast.error(key === 'areas' ? 'Choose a city' : 'Choose the parent category'); return; }

        setSaving(true);
        try {
            const url = `${API}/${key}${editing ? `/${item.id}` : ''}`;
            const verb = editing ? 'put' : 'post';
            let res;
            if (key === 'brands' || key === 'categories') {
                const fd = new FormData();
                fd.append('name', name.trim());
                if (key === 'brands') fd.append('top', String(top));
                const field = key === 'brands' ? 'logo' : 'icon';
                if (file) fd.append(field, file);
                if (editing && removeImg && !file) fd.append(key === 'brands' ? 'removeLogo' : 'removeIcon', 'true');
                res = await axiosInstance[verb](url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else if (key === 'sub-categories') {
                res = await axiosInstance[verb](url, { name: name.trim(), categoryId: Number(parent) });
            } else if (key === 'cities') {
                res = await axiosInstance[verb](url, { name: name.trim() });
            } else if (many && !editing) {
                res = await axiosInstance.post(`${API}/areas/bulk`, { cityId: Number(parent), names });
                const r = res.data?.data || {};
                toast.success(`${r.added || 0} area${r.added === 1 ? '' : 's'} added${r.skipped ? `, ${r.skipped} skipped (already exist)` : ''}`);
                onSaved();
                return;
            } else {
                res = await axiosInstance[verb](url, { name: name.trim(), cityId: Number(parent) });
            }
            toast.success(editing ? 'Saved' : `${tab.one[0].toUpperCase() + tab.one.slice(1)} added`);
            onSaved(res.data?.data);
        } catch (err) {
            toast.error(errText(err, 'Could not save'));
            setSaving(false);
        }
    };

    const title = `${editing ? 'Edit' : 'Add'} ${tab.one}`;
    const currentImg = removeImg ? null : (item?.logoUrl || item?.iconUrl);

    return ReactDOM.createPortal(
        <div className="cm-overlay" onClick={() => !saving && onClose()}>
            <form className="cm-modal" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
                <header><h2>{title}</h2><button type="button" className="cm-x" onClick={onClose} disabled={saving} aria-label="Close"><X size={18} /></button></header>
                <div className={`cm-mbody ${(key === 'sub-categories' || key === 'areas') ? 'has-select' : ''}`}>
                    {(key === 'sub-categories' || key === 'areas') && (
                        <div className="cm-field">
                            <span className="cm-label">{key === 'areas' ? 'City' : 'Parent category'} <b>*</b></span>
                            <SearchableSelect name="parent" value={parent} options={parentOptions.map((o) => ({ id: o.id, name: o.name }))}
                                              onChange={(e) => setParent(e.target.value)} placeholder={key === 'areas' ? 'Choose a city' : 'Choose a category'}
                                              searchPlaceholder="Search..." emptyText="Nothing found" />
                        </div>
                    )}

                    {key === 'areas' && !editing && (
                        <div className="cm-seg">
                            <button type="button" className={!many ? 'on' : ''} onClick={() => setMany(false)}>One area</button>
                            <button type="button" className={many ? 'on' : ''} onClick={() => setMany(true)}>Many at once</button>
                        </div>
                    )}

                    {key === 'areas' && many && !editing ? (
                        <label className="cm-field"><span className="cm-label">Area names <b>*</b></span>
                            <textarea rows={8} value={names} onChange={(e) => setNames(e.target.value)} placeholder={'Gulshan 1\nGulshan 2\nBanani\nDhanmondi'} />
                            <small>One name per line (or separated by commas). Names that already exist are skipped.</small></label>
                    ) : (
                        <label className="cm-field"><span className="cm-label">{tab.one[0].toUpperCase() + tab.one.slice(1)} name <b>*</b></span>
                            <input autoFocus value={name} maxLength={100} onChange={(e) => setName(e.target.value)}
                                   placeholder={key === 'brands' ? 'e.g. COSRX' : key === 'categories' ? 'e.g. Skin' : key === 'sub-categories' ? 'e.g. Face wash' : key === 'cities' ? 'e.g. Dhaka' : 'e.g. Gulshan 1'} /></label>
                    )}

                    {key === 'brands' && (
                        <>
                            <LogoPicker label="Logo (optional)" url={currentImg} file={file} onFile={(f) => { setFile(f); setRemoveImg(false); }} onClear={() => { setFile(null); setRemoveImg(true); }} />
                            <label className="cm-check"><input type="checkbox" checked={top} onChange={(e) => setTop(e.target.checked)} />
                                <span><b>Top brand</b> Shown first in the Brands menu and on the home page.</span></label>
                        </>
                    )}
                    {key === 'categories' && (
                        <LogoPicker label="Icon (optional)" url={currentImg} file={file} onFile={(f) => { setFile(f); setRemoveImg(false); }} onClear={() => { setFile(null); setRemoveImg(true); }} />
                    )}
                    {editing && (key === 'brands' || key === 'categories') && <p className="cm-note">Changing the name also changes the web address of its page.</p>}
                </div>
                <footer>
                    <button type="button" className="cm-btn ghost" onClick={onClose} disabled={saving}>Cancel</button>
                    <button type="submit" className="cm-btn primary" disabled={saving}>{saving ? <><Loader2 size={16} className="cm-spin" /> Saving...</> : (editing ? 'Save changes' : (many && key === 'areas' ? 'Add areas' : `Add ${tab.one}`))}</button>
                </footer>
            </form>
        </div>,
        document.body
    );
}

/* ---------------------------------------------------------------- page */
export default function CatalogManager() {
    const [tabKey, setTabKey] = useState('brands');
    const [data, setData] = useState({ brands: [], categories: [], 'sub-categories': [], cities: [], areas: [] });
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState('');
    const [filter, setFilter] = useState('');            // category (sub-categories tab) or city (areas tab)
    const [modal, setModal] = useState(null);            // null | {item?}
    const [confirmId, setConfirmId] = useState(null);
    const [busyId, setBusyId] = useState(null);

    const tab = TABS.find((t) => t.key === tabKey);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await Promise.all(TABS.map((t) => axiosInstance.get(`${API}/${t.key}`)));
            const next = {};
            TABS.forEach((t, i) => { next[t.key] = res[i].data?.data || []; });
            setData(next);
        } catch (e) {
            toast.error(errText(e, 'Could not load the list'));
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { setQ(''); setFilter(''); setConfirmId(null); }, [tabKey]);

    const rows = useMemo(() => {
        const needle = q.trim().toLowerCase();
        return (data[tabKey] || []).filter((r) => {
            if (filter && String(tabKey === 'areas' ? r.cityId : r.categoryId) !== String(filter)) return false;
            if (!needle) return true;
            return [r.name, r.categoryName, r.cityName].some((x) => x && String(x).toLowerCase().includes(needle));
        });
    }, [data, tabKey, q, filter]);

    const remove = async (r) => {
        setBusyId(r.id);
        try {
            await axiosInstance.delete(`${API}/${tabKey}/${r.id}`);
            toast.success('Deleted');
            setConfirmId(null);
            await load();
        } catch (e) {
            toast.error(errText(e, 'Could not delete'), { duration: 6000 });
            setConfirmId(null);
        } finally { setBusyId(null); }
    };

    const toggleTop = async (r) => {
        setBusyId(r.id);
        try {
            const fd = new FormData();
            fd.append('name', r.name);
            fd.append('top', String(!r.top));
            await axiosInstance.put(`${API}/brands/${r.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            await load();
        } catch (e) { toast.error(errText(e, 'Could not update')); } finally { setBusyId(null); }
    };

    const filterOptions = tabKey === 'sub-categories' ? data.categories : tabKey === 'areas' ? data.cities : null;

    const meta = (r) => {
        if (tabKey === 'brands') return <span className="cm-pill"><Package size={12} /> {r.productCount} product{r.productCount === 1 ? '' : 's'}</span>;
        if (tabKey === 'categories') return (<><span className="cm-pill"><Package size={12} /> {r.productCount} product{r.productCount === 1 ? '' : 's'}</span><span className="cm-pill soft">{r.subCategoryCount} sub-categor{r.subCategoryCount === 1 ? 'y' : 'ies'}</span></>);
        if (tabKey === 'sub-categories') return (<><span className="cm-pill soft">{r.categoryName || 'No category'}</span><span className="cm-pill"><Package size={12} /> {r.productCount}</span></>);
        if (tabKey === 'cities') return <button className="cm-link" onClick={() => { setTabKey('areas'); setTimeout(() => setFilter(String(r.id)), 0); }}>{r.areaCount} area{r.areaCount === 1 ? '' : 's'} →</button>;
        return <span className="cm-pill soft"><MapPin size={12} /> {r.cityName || '-'}</span>;
    };

    const lead = (r) => {
        if (tabKey === 'brands' || tabKey === 'categories') {
            const img = r.logoUrl || r.iconUrl;
            return <span className="cm-avatar">{img ? <img src={img} alt="" /> : <b>{(r.name || '?')[0].toUpperCase()}</b>}</span>;
        }
        const Icon = tab.icon;
        return <span className="cm-avatar soft"><Icon size={16} /></span>;
    };

    return (
        <div className="cm">
            <div className="cm-head">
                <div>
                    <h1>Catalog &amp; Locations</h1>
                    <p>Manage the brands, categories, cities and areas used across your store.</p>
                </div>
            </div>

            <div className="cm-tabs" role="tablist">
                {TABS.map((t) => {
                    const Icon = t.icon;
                    return (
                        <button key={t.key} role="tab" aria-selected={t.key === tabKey} className={t.key === tabKey ? 'on' : ''} onClick={() => setTabKey(t.key)}>
                            <Icon size={16} /> {t.label} <em>{(data[t.key] || []).length}</em>
                        </button>
                    );
                })}
            </div>

            <div className="cm-card">
                <p className="cm-hint">{tab.hint}</p>
                <div className="cm-bar">
                    <div className="cm-search"><Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${tab.label.toLowerCase()}...`} />
                        {q && <button type="button" className="cm-clear" onClick={() => setQ('')} aria-label="Clear search"><X size={14} /></button>}</div>
                    {filterOptions && (
                        <select className="cm-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="">{tabKey === 'areas' ? 'All cities' : 'All categories'}</option>
                            {filterOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                    )}
                    <button className="cm-btn primary" onClick={() => setModal({})}><Plus size={16} /> Add {tab.one}</button>
                </div>

                {loading ? (
                    <div className="cm-skel">{[...Array(6)].map((_, i) => <div key={i} />)}</div>
                ) : rows.length === 0 ? (
                    <div className="cm-empty"><ImageIcon size={28} />
                        <b>{q || filter ? 'Nothing matches your search' : `No ${tab.label.toLowerCase()} yet`}</b>
                        {!q && !filter && <button className="cm-btn primary" onClick={() => setModal({})}><Plus size={16} /> Add {tab.one}</button>}</div>
                ) : (
                    <ul className="cm-list">
                        {rows.map((r) => (
                            <li key={r.id} className="cm-row">
                                {lead(r)}
                                <div className="cm-main">
                                    <b>{r.name}</b>
                                    <div className="cm-meta">{meta(r)}</div>
                                </div>
                                <div className="cm-actions">
                                    {tabKey === 'brands' && (
                                        <button className={`cm-icon star ${r.top ? 'on' : ''}`} onClick={() => toggleTop(r)} disabled={busyId === r.id}
                                                title={r.top ? 'Top brand (click to remove)' : 'Make top brand'} aria-label="Toggle top brand"><Star size={16} /></button>
                                    )}
                                    <button className="cm-icon" onClick={() => setModal({ item: r })} aria-label="Edit"><Pencil size={16} /></button>
                                    {confirmId === r.id ? (
                                        <span className="cm-confirm">
                                            <button className="cm-btn danger sm" onClick={() => remove(r)} disabled={busyId === r.id}>{busyId === r.id ? '...' : 'Delete'}</button>
                                            <button className="cm-btn ghost sm" onClick={() => setConfirmId(null)}>Cancel</button>
                                        </span>
                                    ) : (
                                        <button className="cm-icon del" onClick={() => setConfirmId(r.id)} aria-label="Delete"><Trash2 size={16} /></button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {!loading && rows.length > 0 && <div className="cm-foot">{rows.length} of {(data[tabKey] || []).length} {tab.label.toLowerCase()}</div>}
            </div>

            {modal && (
                <EditModal tab={tab} item={modal.item} data={data} presetCity={tabKey === 'areas' ? filter : (tabKey === 'sub-categories' ? filter : '')}
                           onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />
            )}
        </div>
    );
}
