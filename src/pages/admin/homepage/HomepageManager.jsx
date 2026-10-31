import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Plus, Pencil, Trash2, ArrowUp, ArrowDown, ExternalLink, Image as ImageIcon, Megaphone, LayoutTemplate, GalleryHorizontal,
    Clock, Link2, Loader2, Eye, Target,
} from 'lucide-react';
import axiosInstance from '../../../api/AxiosInstance';
import BannerFormModal from './BannerFormModal';
import './HomepageManager.css';

const API = '/api/v1/admin/home/banners';

export const TABS = [
    {
        key: 'HERO', label: 'Hero slider', icon: GalleryHorizontal,
        help: 'The big rotating banners at the top of the home page. Best size: 1960 × 500 px for desktop, and an optional 1200 × 960 px image for phones.',
        add: 'Add slide', empty: 'No slides yet. Until you add one, the original slides from the site code are shown.',
    },
    {
        key: 'PROMO', label: 'Promo banners', icon: LayoutTemplate,
        help: 'Banner tiles shown in the middle of the home page: sales, brand deals, new launches. 2 or 3 look best. Best size: 1000 × 600 px.',
        add: 'Add banner', empty: 'No promo banners yet. This section stays hidden on the home page until you add one.',
    },
    {
        key: 'CONCERN', label: 'Shop by concern', icon: Target,
        help: 'Cards for real customer problems: Acne, Hair fall, Skin barrier, Brightening... Each card has keywords; the customer sees every product that mentions one of them. Up to 8 cards. Until you add your own, 8 ready-made concerns are shown.',
        add: 'Add concern', empty: 'No concerns yet. The 8 ready-made concerns (Acne, Hair fall, Skin barrier, Brightening...) are shown on the home page until you add your own.',
    },
    {
        key: 'ANNOUNCEMENT', label: 'Announcement bar', icon: Megaphone,
        help: 'A thin strip at the very top of the home page for short messages such as "Free delivery over ৳2,000". Several messages rotate automatically.',
        add: 'Add message', empty: 'No announcements yet. The bar stays hidden until you add one.',
    },
];

const STATUS = {
    LIVE: { text: 'Live', cls: 'live' },
    SCHEDULED: { text: 'Scheduled', cls: 'sched' },
    EXPIRED: { text: 'Expired', cls: 'exp' },
    OFF: { text: 'Hidden', cls: 'off' },
};

const fmt = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
};

export default function HomepageManager() {
    const [tab, setTab] = useState('HERO');
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);   // null | {} (new) | row
    const [busyId, setBusyId] = useState(null);
    const [confirmId, setConfirmId] = useState(null);

    const meta = TABS.find((t) => t.key === tab);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(API, { params: { placement: tab } });
            setRows(res.data?.data || []);
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Could not load banners');
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => { load(); }, [load]);

    const toggle = async (r) => {
        setBusyId(r.id);
        try {
            await axiosInstance.patch(`${API}/${r.id}/active`, null, { params: { value: !r.active } });
            await load();
        } catch (e) { toast.error('Could not change visibility'); }
        finally { setBusyId(null); }
    };

    const move = async (index, dir) => {
        const j = index + dir;
        if (j < 0 || j >= rows.length) return;
        const next = [...rows];
        [next[index], next[j]] = [next[j], next[index]];
        setRows(next);
        try {
            await axiosInstance.post(`${API}/reorder`, { ids: next.map((r) => r.id) });
        } catch (e) { toast.error('Could not save the new order'); load(); }
    };

    const remove = async (r) => {
        setBusyId(r.id);
        try {
            await axiosInstance.delete(`${API}/${r.id}`);
            toast.success('Deleted');
            setConfirmId(null);
            await load();
        } catch (e) { toast.error(e?.response?.data?.message || 'Could not delete'); }
        finally { setBusyId(null); }
    };

    const liveCount = useMemo(() => rows.filter((r) => r.status === 'LIVE').length, [rows]);

    return (
        <div className="hm">
            <div className="hm-top">
                <div>
                    <h1>Homepage</h1>
                    <p>Control the banners and promotions customers see on your home page. Changes go live straight away.</p>
                </div>
                <Link to="/" target="_blank" className="hm-btn ghost"><Eye size={16} /> View home page <ExternalLink size={14} /></Link>
            </div>

            <div className="hm-tabs" role="tablist">
                {TABS.map((t) => {
                    const Icon = t.icon;
                    return (
                        <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>
                            <Icon size={16} /> {t.label}
                        </button>
                    );
                })}
            </div>

            <div className="hm-card">
                <div className="hm-card-h">
                    <div>
                        <h2>{meta.label}</h2>
                        <p>{meta.help}</p>
                    </div>
                    <button className="hm-btn primary" onClick={() => setEditing({})}><Plus size={16} /> {meta.add}</button>
                </div>

                {loading ? (
                    <div className="hm-center"><Loader2 size={22} className="hm-spin" /></div>
                ) : rows.length === 0 ? (
                    <div className="hm-empty"><ImageIcon size={30} /><b>Nothing here yet</b><span>{meta.empty}</span>
                        <button className="hm-btn primary" onClick={() => setEditing({})}><Plus size={16} /> {meta.add}</button></div>
                ) : (
                    <>
                        <div className="hm-summary">{rows.length} item{rows.length === 1 ? '' : 's'} · {liveCount} live now · order from top to bottom is the order on the site</div>
                        <ul className="hm-list">
                            {rows.map((r, i) => {
                                const st = STATUS[r.status] || STATUS.OFF;
                                const isText = r.placement === 'ANNOUNCEMENT';
                                return (
                                    <li key={r.id} className={`hm-item ${r.status !== 'LIVE' ? 'dim' : ''}`}>
                                        <div className="hm-order">
                                            <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><ArrowUp size={15} /></button>
                                            <span>{i + 1}</span>
                                            <button onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Move down"><ArrowDown size={15} /></button>
                                        </div>

                                        {isText ? (
                                            <div className="hm-strip" style={{ background: r.bgColor || '#1f2937', color: r.textColor || '#fff' }}>{r.title}</div>
                                        ) : (
                                            <div className={`hm-thumb ${r.placement === 'HERO' ? 'wide' : ''}`} style={r.placement === 'CONCERN' ? { background: r.bgColor || '#f9e1e6' } : undefined}>
                                                {r.imageUrl ? <img src={r.imageUrl} alt="" /> : <ImageIcon size={22} />}
                                                {r.mobileImageUrl && <span className="hm-chip-m">+ mobile</span>}
                                            </div>
                                        )}

                                        <div className="hm-info">
                                            <div className="hm-title">
                                                {!isText && (r.title || <i>Image only</i>)}
                                                {isText && <span>{r.linkUrl ? 'Links to ' + r.linkUrl : 'No link'}</span>}
                                                <span className={`hm-pill ${st.cls}`}>{st.text}</span>
                                            </div>
                                            {!isText && r.subtitle && <div className="hm-sub">{r.subtitle}</div>}
                                            <div className="hm-meta">
                                                {r.placement === 'CONCERN' && r.keywords && <span><Link2 size={13} /> Finds: {r.keywords}</span>}
                                                {!isText && r.placement !== 'CONCERN' && r.linkUrl && <span><Link2 size={13} /> {r.linkUrl}</span>}
                                                {(r.startsAt || r.endsAt) && (
                                                    <span><Clock size={13} /> {r.startsAt ? `From ${fmt(r.startsAt)}` : ''}{r.startsAt && r.endsAt ? ' · ' : ''}{r.endsAt ? `Until ${fmt(r.endsAt)}` : ''}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="hm-actions">
                                            <label className="hm-switch" title={r.active ? 'Hide from site' : 'Show on site'}>
                                                <input type="checkbox" checked={r.active} onChange={() => toggle(r)} disabled={busyId === r.id} />
                                                <i />
                                            </label>
                                            <button className="hm-icon" onClick={() => setEditing(r)} aria-label="Edit"><Pencil size={16} /></button>
                                            {confirmId === r.id ? (
                                                <span className="hm-confirm">
                                                    <button className="hm-btn danger sm" onClick={() => remove(r)} disabled={busyId === r.id}>Delete</button>
                                                    <button className="hm-btn ghost sm" onClick={() => setConfirmId(null)}>Cancel</button>
                                                </span>
                                            ) : (
                                                <button className="hm-icon del" onClick={() => setConfirmId(r.id)} aria-label="Delete"><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
            </div>

            {editing && (
                <BannerFormModal
                    placement={tab}
                    banner={editing.id ? editing : null}
                    onClose={() => setEditing(null)}
                    onSaved={() => { setEditing(null); load(); }}
                />
            )}
        </div>
    );
}
