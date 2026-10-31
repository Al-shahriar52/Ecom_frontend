import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import toast from 'react-hot-toast';
import { X, Upload, Loader2, Smartphone, Monitor, Trash2 } from 'lucide-react';
import axiosInstance from '../../../api/AxiosInstance';

const API = '/api/v1/admin/home/banners';

const LINK_PRESETS = [
    { label: 'Shop (all products)', value: '/shop' },
    { label: 'Brands page', value: '/brands' },
    { label: 'Skin care', value: '/category/skin' },
    { label: 'Makeup', value: '/category/makeup' },
    { label: 'Hair', value: '/category/hair' },
];

const toLocalInput = (iso) => (iso ? iso.slice(0, 16) : '');

function ImagePicker({ label, hint, icon, url, file, onFile, onClear, required }) {
    const input = useRef(null);
    const [drag, setDrag] = useState(false);
    const preview = useMemo(() => (file ? URL.createObjectURL(file) : url), [file, url]);
    useEffect(() => () => { if (file && preview) URL.revokeObjectURL(preview); }, [file, preview]);

    const take = (f) => {
        if (!f) return;
        if (!f.type.startsWith('image/')) { toast.error('Please choose an image file'); return; }
        if (f.size > 8 * 1024 * 1024) { toast.error('Image is too large (8 MB max)'); return; }
        onFile(f);
    };

    return (
        <div className="bf-field">
            <span className="bf-label">{icon} {label}{required && <b> *</b>}</span>
            <div className={`bf-drop ${drag ? 'drag' : ''} ${preview ? 'has' : ''}`}
                 onClick={() => input.current && input.current.click()}
                 onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                 onDragLeave={() => setDrag(false)}
                 onDrop={(e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files?.[0]); }}>
                {preview ? <img src={preview} alt="" /> : <div className="bf-drop-t"><Upload size={22} /><b>Click or drop an image</b><small>{hint}</small></div>}
                <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { take(e.target.files?.[0]); e.target.value = ''; }} />
            </div>
            {preview && (
                <div className="bf-img-actions">
                    <button type="button" onClick={() => input.current && input.current.click()}>Replace</button>
                    {onClear && <button type="button" className="del" onClick={onClear}><Trash2 size={13} /> Remove</button>}
                </div>
            )}
        </div>
    );
}

export default function BannerFormModal({ placement, banner, onClose, onSaved }) {
    const editing = !!banner;
    const isHero = placement === 'HERO';
    const isAnn = placement === 'ANNOUNCEMENT';
    const isConcern = placement === 'CONCERN';

    const [f, setF] = useState({
        title: banner?.title || '', subtitle: banner?.subtitle || '', buttonText: banner?.buttonText || '',
        linkUrl: banner?.linkUrl || '', badgeText: banner?.badgeText || '',
        keywords: banner?.keywords || '',
        bgColor: banner?.bgColor || (isAnn ? '#1f2937' : isConcern ? '#f9e1e6' : '#111827'), textColor: banner?.textColor || (isConcern ? '#7a2e43' : '#ffffff'),
        textAlign: banner?.textAlign || 'left',
        startsAt: toLocalInput(banner?.startsAt), endsAt: toLocalInput(banner?.endsAt),
        showCountdown: !!banner?.showCountdown, active: banner ? !!banner.active : true,
    });
    const [image, setImage] = useState(null);
    const [mobile, setMobile] = useState(null);
    const [removeMobile, setRemoveMobile] = useState(false);
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

    useEffect(() => {
        const h = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
        document.addEventListener('keydown', h);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', h); document.body.style.overflow = prev; };
    }, [onClose, saving]);

    const hasImage = !!image || !!banner?.imageUrl;

    const submit = async (e) => {
        e.preventDefault();
        if (isAnn && !f.title.trim()) { toast.error('Write the announcement text'); return; }
        if (isConcern) {
            if (!f.title.trim()) { toast.error('Write the concern name, e.g. Acne'); return; }
            if (!f.keywords.trim()) { toast.error('Add at least one keyword, e.g. acne, pimple'); return; }
        }
        if (!isAnn && !isConcern && !hasImage) { toast.error('Upload a banner image'); return; }
        if (f.linkUrl.trim() && !/^(\/|https?:\/\/)/.test(f.linkUrl.trim())) { toast.error('Link must start with / or https://'); return; }
        if (f.startsAt && f.endsAt && f.endsAt <= f.startsAt) { toast.error('The end time must be after the start time'); return; }

        const fd = new FormData();
        if (!editing) fd.append('placement', placement);
        ['title', 'subtitle', 'buttonText', 'linkUrl', 'badgeText', 'keywords', 'bgColor', 'textColor', 'textAlign', 'startsAt', 'endsAt'].forEach((k) => fd.append(k, f[k] || ''));
        fd.append('showCountdown', String(f.showCountdown));
        fd.append('active', String(f.active));
        if (image) fd.append('image', image);
        if (mobile) fd.append('mobileImage', mobile);
        if (editing && removeMobile && !mobile) fd.append('removeMobileImage', 'true');

        setSaving(true);
        try {
            if (editing) await axiosInstance.put(`${API}/${banner.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            else await axiosInstance.post(API, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success(editing ? 'Saved' : 'Added');
            onSaved();
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.response?.data?.error || 'Could not save');
            setSaving(false);
        }
    };

    const previewImg = image ? URL.createObjectURL(image) : banner?.imageUrl;
    const titleText = isAnn ? 'announcement' : isConcern ? 'concern' : isHero ? 'slide' : 'banner';

    return ReactDOM.createPortal(
        <div className="bf-overlay" onClick={() => !saving && onClose()}>
            <form className="bf" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
                <header className="bf-h">
                    <h2>{editing ? 'Edit' : 'Add'} {titleText}</h2>
                    <button type="button" className="bf-x" onClick={onClose} disabled={saving} aria-label="Close"><X size={18} /></button>
                </header>

                <div className="bf-body">
                    {isConcern ? (
                        <>
                            <div className="bf-row">
                                <label className="bf-field"><span className="bf-label">Concern name <b>*</b></span>
                                    <input value={f.title} maxLength={40} onChange={(e) => set('title', e.target.value)} placeholder="Acne & breakouts" /></label>
                                <label className="bf-field"><span className="bf-label">Short line</span>
                                    <input value={f.subtitle} maxLength={80} onChange={(e) => set('subtitle', e.target.value)} placeholder="Clear, calm, blemish-free skin" /></label>
                            </div>
                            <label className="bf-field"><span className="bf-label">Keywords <b>*</b> <small>separate with commas, up to 5</small></span>
                                <input value={f.keywords} onChange={(e) => set('keywords', e.target.value)} placeholder="acne, pimple, salicylic, blemish" /></label>
                            <div className="bf-sep">Look <small>card colours and an optional picture (square, 600 × 600 px)</small></div>
                            <div className="bf-row">
                                <label className="bf-field"><span className="bf-label">Card colour</span>
                                    <div className="bf-color"><input type="color" value={f.bgColor} onChange={(e) => set('bgColor', e.target.value)} /><code>{f.bgColor}</code></div></label>
                                <label className="bf-field"><span className="bf-label">Text colour</span>
                                    <div className="bf-color"><input type="color" value={f.textColor} onChange={(e) => set('textColor', e.target.value)} /><code>{f.textColor}</code></div></label>
                            </div>
                            <div className="bf-row one">
                                <ImagePicker label="Picture (optional)" icon={<Monitor size={14} />} hint="Square image. Without it, an icon is shown"
                                             url={banner?.imageUrl} file={image} onFile={setImage} />
                            </div>
                            <div className="bf-strip-prev" style={{ background: f.bgColor, color: f.textColor }}><b>{f.title || 'Concern name'}</b> {f.subtitle && <> · {f.subtitle}</>}</div>
                        </>
                    ) : isAnn ? (
                        <>
                            <label className="bf-field"><span className="bf-label">Message <b>*</b></span>
                                <input value={f.title} maxLength={160} onChange={(e) => set('title', e.target.value)} placeholder="Free delivery on orders over ৳2,000" /></label>
                            <div className="bf-row">
                                <label className="bf-field"><span className="bf-label">Background colour</span>
                                    <div className="bf-color"><input type="color" value={f.bgColor} onChange={(e) => set('bgColor', e.target.value)} /><code>{f.bgColor}</code></div></label>
                                <label className="bf-field"><span className="bf-label">Text colour</span>
                                    <div className="bf-color"><input type="color" value={f.textColor} onChange={(e) => set('textColor', e.target.value)} /><code>{f.textColor}</code></div></label>
                            </div>
                            <div className="bf-strip-prev" style={{ background: f.bgColor, color: f.textColor }}>{f.title || 'Your message appears here'}</div>
                        </>
                    ) : (
                        <>
                            <div className={`bf-row ${isHero ? '' : 'one'}`}>
                                <ImagePicker label={isHero ? 'Desktop image' : 'Banner image'} icon={<Monitor size={14} />} required
                                             hint={isHero ? '1960 × 500 px, JPG / PNG / WebP' : '1000 × 600 px, JPG / PNG / WebP'}
                                             url={banner?.imageUrl} file={image} onFile={setImage} />
                                {isHero && (
                                    <ImagePicker label="Phone image (optional)" icon={<Smartphone size={14} />}
                                                 hint="1200 × 960 px. Without it, the desktop image is scaled down"
                                                 url={removeMobile ? null : banner?.mobileImageUrl} file={mobile}
                                                 onFile={(x) => { setMobile(x); setRemoveMobile(false); }}
                                                 onClear={() => { setMobile(null); setRemoveMobile(true); }} />
                                )}
                            </div>

                            <div className="bf-sep">Text on the banner <small>optional. Leave empty if the text is already inside your image</small></div>
                            <div className="bf-row">
                                <label className="bf-field"><span className="bf-label">Headline</span>
                                    <input value={f.title} maxLength={160} onChange={(e) => set('title', e.target.value)} placeholder="Glow season sale" /></label>
                                <label className="bf-field"><span className="bf-label">Small badge</span>
                                    <input value={f.badgeText} maxLength={30} onChange={(e) => set('badgeText', e.target.value)} placeholder="NEW or UP TO 40% OFF" /></label>
                            </div>
                            <label className="bf-field"><span className="bf-label">Sub-headline</span>
                                <input value={f.subtitle} maxLength={500} onChange={(e) => set('subtitle', e.target.value)} placeholder="Genuine K-beauty, delivered across Bangladesh" /></label>
                            <div className="bf-row">
                                <label className="bf-field"><span className="bf-label">Button text</span>
                                    <input value={f.buttonText} maxLength={60} onChange={(e) => set('buttonText', e.target.value)} placeholder="Shop now" /></label>
                                <label className="bf-field"><span className="bf-label">Text position</span>
                                    <div className="bf-seg">
                                        {['left', 'center', 'right'].map((a) => (
                                            <button type="button" key={a} className={f.textAlign === a ? 'on' : ''} onClick={() => set('textAlign', a)}>{a[0].toUpperCase() + a.slice(1)}</button>
                                        ))}
                                    </div></label>
                            </div>
                            <div className="bf-row">
                                <label className="bf-field"><span className="bf-label">Text colour</span>
                                    <div className="bf-color"><input type="color" value={f.textColor} onChange={(e) => set('textColor', e.target.value)} /><code>{f.textColor}</code></div></label>
                                {previewImg && (f.title || f.subtitle || f.buttonText || f.badgeText) && (
                                    <div className="bf-field"><span className="bf-label">Preview</span>
                                        <div className={`bf-prev a-${f.textAlign}`} style={{ backgroundImage: `url(${previewImg})`, color: f.textColor }}>
                                            <div>
                                                {f.badgeText && <em>{f.badgeText}</em>}
                                                {f.title && <b>{f.title}</b>}
                                                {f.subtitle && <span>{f.subtitle}</span>}
                                                {f.buttonText && <u>{f.buttonText}</u>}
                                            </div>
                                        </div></div>
                                )}
                            </div>
                        </>
                    )}

                    {!isConcern && (<>
                    <div className="bf-sep">Link</div>
                    <label className="bf-field"><span className="bf-label">{isAnn ? 'Link (optional)' : 'Where does it go?'}</span>
                        <input value={f.linkUrl} onChange={(e) => set('linkUrl', e.target.value)} placeholder="/category/skin or https://…" /></label>
                    <div className="bf-presets">
                        {LINK_PRESETS.map((p) => (<button type="button" key={p.value} onClick={() => set('linkUrl', p.value)}>{p.label}</button>))}
                    </div>
                    </>)}

                    {!isConcern && (<>
                    <div className="bf-sep">Schedule <small>optional. Leave empty to show it until you hide it</small></div>
                    <div className="bf-row">
                        <label className="bf-field"><span className="bf-label">Starts</span>
                            <input type="datetime-local" value={f.startsAt} onChange={(e) => set('startsAt', e.target.value)} /></label>
                        <label className="bf-field"><span className="bf-label">Ends</span>
                            <input type="datetime-local" value={f.endsAt} onChange={(e) => set('endsAt', e.target.value)} /></label>
                    </div>
                    {!isAnn && (
                        <label className="bf-check"><input type="checkbox" checked={f.showCountdown} disabled={!f.endsAt} onChange={(e) => set('showCountdown', e.target.checked)} />
                            <span>Show a countdown timer until the end time{!f.endsAt && ' (set an end time first)'}</span></label>
                    )}
                    </>)}
                    <label className="bf-check"><input type="checkbox" checked={f.active} onChange={(e) => set('active', e.target.checked)} />
                        <span>Show on the website</span></label>
                </div>

                <footer className="bf-f">
                    <button type="button" className="hm-btn ghost" onClick={onClose} disabled={saving}>Cancel</button>
                    <button type="submit" className="hm-btn primary" disabled={saving}>{saving ? <><Loader2 size={16} className="hm-spin" /> Saving…</> : (editing ? 'Save changes' : `Add ${titleText}`)}</button>
                </footer>
            </form>
        </div>,
        document.body
    );
}
