
import React, { useEffect, useMemo, useState } from 'react';
import { fmt } from '../couponData';
import { couponService } from '../../../../services/couponService';
import toast from 'react-hot-toast';

const BUILDER_STEPS = [
    { n: 1, t: 'Basics', d: 'Code, name, visibility' },
    { n: 2, t: 'Discount', d: 'What the customer gets' },
    { n: 3, t: 'Who can use it', d: 'Eligibility & limits' },
    { n: 4, t: 'Where it applies', d: 'Products & cities' },
    { n: 5, t: 'When it runs', d: 'Validity & blackouts' },
];

const DISCOUNT_TYPES = [
    { key: 'PERCENT', glyph: '%', title: 'Percentage off', desc: 'Cut a share off the cart or selected items. Cap it to control cost.' },
    { key: 'FIXED', glyph: '৳', title: 'Fixed amount off', desc: 'A flat taka reduction, e.g. ৳300 off orders over ৳2,500.' },
    { key: 'DELIVERY', glyph: '⇢', title: 'Free delivery', desc: 'Waives the shipping fee. Works with a minimum cart or first-order rule.' },
    { key: 'PRICE', glyph: '=', title: 'Set price', desc: 'Customer pays a fixed price for one qualifying item, e.g. any product for ৳100.' },
];

// Helper to convert Java [yyyy, mm, dd, hh, mm] arrays to HTML datetime-local format
const toLocalISOString = (d) => {
    if (!d) return '';
    if (Array.isArray(d)) {
        const pad = (n) => String(n).padStart(2, '0');
        return `${d[0]}-${pad(d[1])}-${pad(d[2])}T${pad(d[3] || 0)}:${pad(d[4] || 0)}`;
    }
    return d.substring(0, 16); // Fallback for standard ISO strings
};

// Helper to pair up ID arrays with Name arrays from the backend
const buildList = (ids, names) => {
    if (!ids) return [];
    return ids.map((id, i) => ({ id, name: names && names[i] ? names[i] : `Item ${id}` }));
};


export default function CouponBuilder({ onDiscard, initialData }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Basics (Prefilled with initialData if it exists)
    const [code, setCode] = useState(initialData?.code || '');
    const [internalName, setInternalName] = useState(initialData?.internalName || '');
    const [checkoutMsg, setCheckoutMsg] = useState(initialData?.checkoutMsg || '');
    const [publicCoupon, setPublicCoupon] = useState(initialData ? initialData.publicCoupon : true);
    const [stackCoupons, setStackCoupons] = useState(initialData ? initialData.stackCoupons : false);

    // Step 2: Discount Map logic
    const isPct = initialData?.discountType === 'PERCENT';
    const isFix = initialData?.discountType === 'FIXED';
    const isDel = initialData?.discountType === 'DELIVERY';
    const isPri = initialData?.discountType === 'PRICE';

    const [discountType, setDiscountType] = useState(initialData?.discountType || 'PERCENT');
    const [discountVal, setDiscountVal] = useState(isPct ? initialData?.discountValue?.toString() : '10');
    const [cap, setCap] = useState(isPct ? initialData?.maxCap?.toString() : '100');
    const [minCart, setMinCart] = useState(isPct ? initialData?.minCartValue?.toString() : '5000');

    const [fixedAmount, setFixedAmount] = useState(isFix ? initialData?.discountValue?.toString() : '300');
    const [fixedMin, setFixedMin] = useState(isFix ? initialData?.minCartValue?.toString() : '2500');
    const [deliveryMin, setDeliveryMin] = useState(isDel ? initialData?.minCartValue?.toString() : '');
    const [pricePay, setPricePay] = useState(isPri ? initialData?.discountValue?.toString() : '100');
    const [priceCeiling, setPriceCeiling] = useState(isPri ? initialData?.maxCap?.toString() : '1500');

    // Step 3: Eligibility & Targeting
    const [eligibility, setEligibility] = useState(initialData?.eligibility || 'Anyone');
    const [autoIssue, setAutoIssue] = useState(initialData?.autoIssue ?? false);
    const [totalRedemptions, setTotalRedemptions] = useState(initialData?.totalRedemptions?.toString() || '');
    const [perCustomer, setPerCustomer] = useState(initialData?.perCustomerLimit?.toString() || '');
    const [perDay, setPerDay] = useState(initialData?.perDayLimit?.toString() || '');
    const [targetDomain, setTargetDomain] = useState(initialData?.targetDomain || '');
    const [targetUserId, setTargetUserId] = useState(initialData?.targetUserId?.toString() || '');
    const [targetEmail, setTargetEmail] = useState(initialData?.targetEmail || '');
    const [targetPhone, setTargetPhone] = useState(initialData?.targetPhone || '');
    const [targetRole, setTargetRole] = useState(initialData?.targetRole || 'ALL');

    // Step 4: Multi-selection Separate Forms & Targeting Lists
    const [pickedProducts, setPickedProducts] = useState(() => buildList(initialData?.targetProductIds, initialData?.targetProductNames));
    const [pickedCategories, setPickedCategories] = useState(() => buildList(initialData?.targetCategoryIds, initialData?.targetCategoryNames));
    const [pickedSubCategories, setPickedSubCategories] = useState(() => buildList(initialData?.targetSubCategoryIds, initialData?.targetSubCategoryNames));
    const [pickedBrands, setPickedBrands] = useState(() => buildList(initialData?.targetBrandIds, initialData?.targetBrandNames));
    const [pickedCities, setPickedCities] = useState(() => buildList(initialData?.targetCityIds, initialData?.targetCityNames));
    const [pickedAreas, setPickedAreas] = useState(() => buildList(initialData?.targetAreaIds, initialData?.targetAreaNames));
    const [channels, setChannels] = useState(initialData?.channels || ['Website', 'Mobile app']);

    // UI states for search/dropdowns
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [productSearchResults, setProductSearchResults] = useState([]);
    const [productsExpanded, setProductsExpanded] = useState(false);
    const [categoriesList, setCategoriesList] = useState([]);
    const [subCategoriesList, setSubCategoriesList] = useState([]);
    const [brandsList, setBrandsList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);
    const [areasList, setAreasList] = useState([]);
    const [newChannel, setNewChannel] = useState('');

    // Step 5: Schedule & Blackouts
    const [startDate, setStartDate] = useState(initialData?.startDate ? toLocalISOString(initialData.startDate) : '2026-08-20T00:00');
    const [endDate, setEndDate] = useState(initialData?.endDate ? toLocalISOString(initialData.endDate) : '2026-08-31T23:59');
    const [noEndDate, setNoEndDate] = useState(initialData?.noEndDate ?? false);

    const initialBlackouts = initialData?.blackouts ? initialData.blackouts.map(b => ({
        ...b,
        start: toLocalISOString(b.start),
        end: toLocalISOString(b.end)
    })) : [
        { name: 'Independence Day flash sale', start: '2026-08-26T00:00', end: '2026-08-27T23:59' },
    ];
    const [blackouts, setBlackouts] = useState(initialBlackouts);
    const [blackoutName, setBlackoutName] = useState('');
    const [blackoutStart, setBlackoutStart] = useState('');
    const [blackoutEnd, setBlackoutEnd] = useState('');
    const [editingBlackoutIndex, setEditingBlackoutIndex] = useState(null);


    // Lifecycle data fetching on mount
    useEffect(() => {
        couponService.getCategories().then(res => setCategoriesList(res || [])).catch(console.error);
        couponService.getBrands().then(res => setBrandsList(res || [])).catch(console.error);
        couponService.getCities().then(res => setCitiesList(res || [])).catch(console.error);
    }, []);

    // Fetch subcategories whenever picked categories change
    useEffect(() => {
        if (pickedCategories.length > 0) {
            Promise.all(pickedCategories.map(c => couponService.getSubCategories(c.id).catch(() => [])))
                .then(results => {
                    const combined = results.flat();
                    const uniqueSubs = Array.from(new Map(combined.map(item => [item.id, item])).values());
                    setSubCategoriesList(uniqueSubs);
                });
        } else {
            setSubCategoriesList([]);
            setPickedSubCategories([]);
        }
    }, [pickedCategories]);

    // Fetch areas whenever picked cities change
    useEffect(() => {
        if (pickedCities.length > 0) {
            Promise.all(pickedCities.map(city => couponService.getAreas(city.id).catch(() => [])))
                .then(results => {
                    const combined = results.flat();
                    const uniqueAreas = Array.from(new Map(combined.map(item => [item.id, item])).values());
                    setAreasList(uniqueAreas);
                });
        } else {
            setAreasList([]);
            setPickedAreas([]);
        }
    }, [pickedCities]);


    // Handlers
    function addToList(list, setList, value, setValue) {
        const v = value.trim();
        if (v) { setList([...list, v]); setValue(''); }
    }

    function removeFromList(list, setList, item) {
        setList(list.filter((i) => i !== item));
    }

    function removeBlackout(idx) {
        setBlackouts(blackouts.filter((_, i) => i !== idx));
        if (editingBlackoutIndex === idx) cancelEditBlackout();
    }

    function handleSaveBlackout() {
        if (!blackoutName.trim() || !blackoutStart || !blackoutEnd) {
            toast.error('Please provide blackout name, start date, and end date');
            return;
        }

        if (editingBlackoutIndex !== null) {
            const updated = [...blackouts];
            updated[editingBlackoutIndex] = { name: blackoutName.trim(), start: blackoutStart, end: blackoutEnd };
            setBlackouts(updated);
            setEditingBlackoutIndex(null);
            toast.success('Blackout updated successfully');
        } else {
            setBlackouts([...blackouts, { name: blackoutName.trim(), start: blackoutStart, end: blackoutEnd }]);
            toast.success('Blackout added');
        }
        setBlackoutName(''); setBlackoutStart(''); setBlackoutEnd('');
    }

    function startEditBlackout(index) {
        const b = blackouts[index];
        setBlackoutName(b.name); setBlackoutStart(b.start); setBlackoutEnd(b.end);
        setEditingBlackoutIndex(index);
    }

    function cancelEditBlackout() {
        setBlackoutName(''); setBlackoutStart(''); setBlackoutEnd('');
        setEditingBlackoutIndex(null);
    }


    const preview = useMemo(() => {
        let tag = 'Cart offer';
        let val;
        let name;
        if (discountType === 'PERCENT') {
            tag = 'Cart offer';
            val = <>{discountVal || '10'}% off <small>up to ৳{fmt(cap || '100')}</small></>;
            name = `On orders over ৳${fmt(minCart || '5000')}`;
        } else if (discountType === 'FIXED') {
            tag = 'Cart offer';
            val = <>৳{fmt(fixedAmount || '300')} off</>;
            name = `On orders over ৳${fmt(fixedMin || '2500')}`;
        } else if (discountType === 'DELIVERY') {
            tag = 'Delivery';
            val = <>Free<br />delivery</>;
            name = deliveryMin ? `On orders over ৳${fmt(deliveryMin)}` : 'On your first order';
        } else {
            tag = 'Reward';
            val = <>Any item<br />for ৳{fmt(pricePay || '100')}</>;
            name = 'Unlocked after spend limit';
        }

        const cityNames = pickedCities.length > 0 ? pickedCities.map(c => c.name || c.cityName).join(', ') : 'All cities';
        return { tag, val, name, cityNames };
    }, [discountType, discountVal, cap, minCart, fixedAmount, fixedMin, pricePay, pickedCities, deliveryMin]);

    const total = BUILDER_STEPS.length;
    const next = () => setStep(Math.min(total, step + 1));
    const prev = () => setStep(Math.max(1, step - 1));

    const handlePublish = async () => {
        if (!code.trim()) {
            toast.error('Coupon code is required');
            setStep(1);
            return;
        }

        setLoading(true);
        try {
            let val = discountVal;
            let minVal = minCart;
            let maxC = cap;

            if (discountType === 'FIXED') {
                val = fixedAmount; minVal = fixedMin; maxC = null;
            } else if (discountType === 'DELIVERY') {
                val = 0; minVal = deliveryMin || 0; maxC = null;
            } else if (discountType === 'PRICE') {
                val = pricePay; minVal = 0; maxC = priceCeiling;
            }

            const payload = {
                code: code.toUpperCase().trim(),
                internalName: internalName || code,
                checkoutMsg,
                publicCoupon,
                stackCoupons,
                discountType,
                discountValue: parseFloat(val) || 0,
                maxCap: maxC ? parseFloat(maxC) : null,
                minCartValue: minVal ? parseFloat(minVal) : null,
                eligibility,
                autoIssue,
                totalRedemptions: totalRedemptions ? parseInt(totalRedemptions, 10) : null,
                perCustomerLimit: perCustomer ? parseInt(perCustomer, 10) : null,
                perDayLimit: perDay ? parseInt(perDay, 10) : null,
                targetDomain: targetDomain.trim() || null,
                targetUserId: targetUserId ? parseInt(targetUserId, 10) : null,
                targetEmail: targetEmail.trim() || null,
                targetPhone: targetPhone.trim() || null,
                targetRole: targetRole === 'ALL' ? null : targetRole,
                targetProductIds: pickedProducts.map(p => p.id || p.productId),
                targetCategoryIds: pickedCategories.map(c => c.id),
                targetSubCategoryIds: pickedSubCategories.map(sc => sc.id),
                targetBrandIds: pickedBrands.map(b => b.id),
                targetCityIds: pickedCities.map(c => c.id),
                targetAreaIds: pickedAreas.map(a => a.id),
                channels,
                blackouts,
                startDate,
                endDate: noEndDate ? null : endDate,
                noEndDate
            };

            // DISTINGUISH BETWEEN CREATE AND UPDATE
            if (initialData && initialData.id) {
                await couponService.updateCoupon(initialData.id, payload);
                toast.success('Coupon updated successfully!');
            } else {
                await couponService.createCoupon(payload);
                toast.success('Coupon created successfully!');
            }
            onDiscard();
        } catch (error) {
            console.error('Failed to save coupon:', error);
            toast.error(error.response?.data?.message || 'Failed to save coupon');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wrap">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h1 className="h1">{initialData?.id ? `Edit ${initialData.code}` : 'New coupon'}</h1>
                        <span className={`pill ${initialData?.status === 'live' ? 'p-live' : 'p-draft'}`}>
                            {initialData ? (initialData.statusLabel || 'Running') : 'Draft'}
                        </span>
                    </div>
                    <p className="sub">Set the rule once. Checkout enforces it everywhere — web, app and call centre.</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button type="button" className="btn" onClick={onDiscard}>Discard</button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handlePublish}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (initialData?.id ? 'Save Changes' : 'Review & publish')}
                    </button>
                </div>
            </div>

            <div className="builder">
                {/* ---- steps rail ---- */}
                <div className="steps">
                    {BUILDER_STEPS.map((s) => (
                        <button
                            key={s.n}
                            type="button"
                            className={`step ${step === s.n ? 'on' : ''} ${step > s.n ? 'done' : ''}`}
                            onClick={() => setStep(s.n)}
                        >
                            <span className="idx">{step > s.n ? '✓' : s.n}</span>
                            <span><span className="t">{s.t}</span><span className="d">{s.d}</span></span>
                        </button>
                    ))}
                </div>

                {/* ---- panes ---- */}
                <div>
                    {step === 1 && (
                        <div className="card panel">
                            <h2 className="panel-h">Basics</h2>
                            <p className="panel-s">The code is what customers type. The name is what your team sees in reports.</p>
                            <div className="grid2">
                                <div className="field">
                                    <label htmlFor="f-code">Coupon code</label>
                                    <div className="affix">
                                        <input
                                            id="f-code" className="mono"
                                            style={{ textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}
                                            value={code} onChange={(e) => setCode(e.target.value)}
                                            placeholder="e.g. SAVE20"
                                        />
                                        <span className="post" style={{ cursor: 'pointer', fontSize: 11 }} onClick={() => setCode(Math.random().toString(36).slice(2, 8).toUpperCase())}>Generate</span>
                                    </div>
                                    <div className="hint">Letters and numbers only. Customers see this exactly as typed.</div>
                                </div>
                                <div className="field">
                                    <label htmlFor="f-name">Internal name</label>
                                    <input id="f-name" className="inp" value={internalName} onChange={(e) => setInternalName(e.target.value)} placeholder="e.g. Summer Flash Sale" />
                                    <div className="hint">Never shown to customers.</div>
                                </div>
                            </div>
                            <div className="field">
                                <label htmlFor="f-desc">Checkout message</label>
                                <textarea id="f-desc" className="inp" value={checkoutMsg} onChange={(e) => setCheckoutMsg(e.target.value)} />
                                <div className="hint">Appears under the code field once applied. Keep it under 120 characters.</div>
                            </div>
                            <SwitchRow
                                on={publicCoupon} onToggle={() => setPublicCoupon(!publicCoupon)}
                                title="Public coupon"
                                desc="Listed on the offers page and suggested at checkout. Turn off for codes you send privately to a segment."
                            />
                            <SwitchRow
                                on={stackCoupons} onToggle={() => setStackCoupons(!stackCoupons)}
                                title="Stack with other coupons"
                                desc="Off means this is the only coupon allowed on the order. Stacked coupons apply in priority order."
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="card panel">
                            <h2 className="panel-h">What the customer gets</h2>
                            <p className="panel-s">Pick one reward type. The fields below change to match.</p>
                            <div className="types">
                                {DISCOUNT_TYPES.map((t) => (
                                    <label key={t.key} className={`type ${discountType === t.key ? 'on' : ''}`} onClick={() => setDiscountType(t.key)}>
                                        <span className="glyph">{t.glyph}</span>
                                        <span><span className="tt">{t.title}</span><span className="td">{t.desc}</span></span>
                                    </label>
                                ))}
                            </div>

                            {discountType === 'PERCENT' && (
                                <div style={{ marginTop: 20 }}>
                                    <div className="grid3">
                                        <div className="field">
                                            <label htmlFor="f-val">Discount</label>
                                            <div className="affix"><input id="f-val" className="num" value={discountVal} onChange={(e) => setDiscountVal(e.target.value)} /><span className="post">%</span></div>
                                        </div>
                                        <div className="field">
                                            <label htmlFor="f-cap">Maximum discount</label>
                                            <div className="affix"><span>৳</span><input id="f-cap" className="num" value={cap} onChange={(e) => setCap(e.target.value)} /></div>
                                            <div className="hint">Your cost ceiling per order.</div>
                                        </div>
                                        <div className="field">
                                            <label htmlFor="f-min">Minimum cart value</label>
                                            <div className="affix"><span>৳</span><input id="f-min" className="num" value={minCart} onChange={(e) => setMinCart(e.target.value)} /></div>
                                            <div className="hint">Before delivery and tax.</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {discountType === 'PRICE' && (
                                <div style={{ marginTop: 20 }}>
                                    <div className="grid3">
                                        <div className="field">
                                            <label>Customer pays</label>
                                            <div className="affix"><span>৳</span><input className="num" value={pricePay} onChange={(e) => setPricePay(e.target.value)} /></div>
                                        </div>
                                        <div className="field">
                                            <label>Qualifying items</label>
                                            <select className="inp" defaultValue="1 item per order">
                                                <option>1 item per order</option>
                                                <option>Up to 2 items</option>
                                            </select>
                                        </div>
                                        <div className="field">
                                            <label>Item price ceiling</label>
                                            <div className="affix"><span>৳</span><input className="num" value={priceCeiling} onChange={(e) => setPriceCeiling(e.target.value)} /></div>
                                            <div className="hint">Blocks high-value abuse.</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {discountType === 'FIXED' && (
                                <div style={{ marginTop: 20 }}>
                                    <div className="grid2">
                                        <div className="field">
                                            <label>Amount off</label>
                                            <div className="affix"><span>৳</span><input className="num" value={fixedAmount} onChange={(e) => setFixedAmount(e.target.value)} /></div>
                                        </div>
                                        <div className="field">
                                            <label>Minimum cart value</label>
                                            <div className="affix"><span>৳</span><input className="num" value={fixedMin} onChange={(e) => setFixedMin(e.target.value)} /></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {discountType === 'DELIVERY' && (
                                <div style={{ marginTop: 20 }}>
                                    <div className="grid2">
                                        <div className="field">
                                            <label>Delivery fee covered</label>
                                            <select className="inp" defaultValue="Full delivery fee">
                                                <option>Full delivery fee</option>
                                            </select>
                                        </div>
                                        <div className="field">
                                            <label>Minimum cart value</label>
                                            <div className="affix"><span>৳</span><input className="num" value={deliveryMin} onChange={(e) => setDeliveryMin(e.target.value)} placeholder="No minimum" /></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="card panel">
                            <h2 className="panel-h">Who can use it</h2>
                            <p className="panel-s">Configure general limits and specific user/domain/role targeting rules.</p>

                            <div className="field">
                                <label>Customer eligibility tier</label>
                                <select className="inp" value={eligibility} onChange={(e) => setEligibility(e.target.value)}>
                                    <option>Anyone</option>
                                    <option>First-time customers only</option>
                                    <option>Returning customers only</option>
                                </select>
                            </div>

                            <div className="grid2" style={{ marginTop: '14px' }}>
                                <div className="field">
                                    <label>Target Email Domain</label>
                                    <input
                                        className="inp" placeholder="e.g. gmail.com or company.com"
                                        value={targetDomain} onChange={(e) => setTargetDomain(e.target.value)}
                                    />
                                    <div className="hint">Matches customer email suffix.</div>
                                </div>
                                <div className="field">
                                    <label>Target Specific Role</label>
                                    <select className="inp" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
                                        <option value="ALL">All Roles (Customer/Guest)</option>
                                        <option value="USER">USER</option>
                                        <option value="MANAGER">MANAGER</option>
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="STAFF">STAFF</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid3" style={{ marginTop: '14px' }}>
                                <div className="field">
                                    <label>Specific User ID</label>
                                    <input
                                        className="inp num" placeholder="e.g. 1024"
                                        value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)}
                                    />
                                </div>
                                <div className="field">
                                    <label>Specific Email Address</label>
                                    <input
                                        className="inp" placeholder="user@domain.com"
                                        value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)}
                                    />
                                </div>
                                <div className="field">
                                    <label>Specific Phone Number</label>
                                    <input
                                        className="inp num" placeholder="+8801..."
                                        value={targetPhone} onChange={(e) => setTargetPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ height: 1, background: 'var(--line)', margin: '20px 0' }} />

                            <div className="grid3">
                                <div className="field">
                                    <label>Total redemptions</label>
                                    <input className="inp num" value={totalRedemptions} onChange={(e) => setTotalRedemptions(e.target.value)} placeholder="Unlimited" />
                                </div>
                                <div className="field">
                                    <label>Per customer limit</label>
                                    <input className="inp num" value={perCustomer} onChange={(e) => setPerCustomer(e.target.value)} placeholder="Unlimited" />
                                </div>
                                <div className="field">
                                    <label>Per day limit</label>
                                    <input className="inp num" value={perDay} onChange={(e) => setPerDay(e.target.value)} placeholder="Unlimited" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="card panel">
                            <h2 className="panel-h">Where it applies</h2>
                            <p className="panel-s">Configure multiple criteria blocks below. Leave blank to apply globally for that filter type.</p>

                            {/* Target Products */}
                            <div className="field" style={{ marginBottom: '20px' }}>
                                <label><b>Target Specific Products</b> (Multiple Selection)</label>
                                <input
                                    className="inp"
                                    placeholder="Type product name or SKU to search and add..."
                                    value={productSearchTerm}
                                    onChange={async (e) => {
                                        const val = e.target.value;
                                        setProductSearchTerm(val);
                                        if (val.trim().length > 1) {
                                            try {
                                                const results = await couponService.searchProducts(val);
                                                setProductSearchResults(results || []);
                                            } catch (err) { console.error("Search failed", err); }
                                        } else { setProductSearchResults([]); }
                                    }}
                                />
                                {productSearchResults.length > 0 && (
                                    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '8px', marginTop: '4px', maxHeight: '140px', overflowY: 'auto', zIndex: 10, position: 'relative' }}>
                                        {productSearchResults.map((prod, index) => {
                                            const prodKey = prod.id || prod.sku || prod.name || index;
                                            return (
                                                <div
                                                    key={prodKey}
                                                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--line-soft)' }}
                                                    onClick={() => {
                                                        setPickedProducts(prev => {
                                                            const exists = prev.some(p => (p.id || p.sku || p.name) === prodKey);
                                                            if (!exists) return [...prev, { ...prod, uniqueKey: prodKey }];
                                                            return prev;
                                                        });
                                                        setProductSearchTerm('');
                                                        setProductSearchResults([]);
                                                    }}
                                                >
                                                    <b>{prod.name}</b> <span style={{ color: 'var(--muted)', fontSize: '12px' }}>(ID: {prod.id || prod.sku || 'N/A'})</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', alignItems: 'center' }}>
                                    {(productsExpanded ? pickedProducts : pickedProducts.slice(0, 3)).map((p, idx) => {
                                        const itemKey = p.uniqueKey || p.id || p.sku || idx;
                                        return (
                                            <span className="chip" key={itemKey}>
                                                {p.name} <button type="button" aria-label="Remove" onClick={() => setPickedProducts(prev => prev.filter(item => (item.uniqueKey || item.id || item.sku) !== itemKey))}>✕</button>
                                            </span>
                                        );
                                    })}
                                    {!productsExpanded && pickedProducts.length > 3 && (
                                        <button type="button" className="btn btn-sm" onClick={() => setProductsExpanded(true)} style={{ padding: '2px 8px', fontSize: '12px', height: 'auto', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px' }}>
                                            +{pickedProducts.length - 3} ...
                                        </button>
                                    )}
                                    {productsExpanded && pickedProducts.length > 3 && (
                                        <button type="button" className="btn btn-sm" onClick={() => setProductsExpanded(false)} style={{ padding: '2px 8px', fontSize: '12px', height: 'auto', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px' }}>
                                            Show less
                                        </button>
                                    )}
                                    {pickedProducts.length === 0 && <span className="hint">No specific products selected (applies to all products).</span>}
                                </div>
                            </div>
                            <div style={{ height: 1, background: 'var(--line)', margin: '16px 0' }} />

                            <AutoSelectDropdownWithChips label="Target Categories" items={categoriesList} selectedItems={pickedCategories} setSelectedItems={setPickedCategories} idKey="id" nameKey="name" placeholder="Select category to auto-add..." />
                            <AutoSelectDropdownWithChips label="Target Sub-Categories" items={subCategoriesList} selectedItems={pickedSubCategories} setSelectedItems={setPickedSubCategories} idKey="id" nameKey="name" placeholder={subCategoriesList.length === 0 ? "Select a category first..." : "Select sub-category to auto-add..."} disabled={subCategoriesList.length === 0} />
                            <AutoSelectDropdownWithChips label="Target Brands" items={brandsList} selectedItems={pickedBrands} setSelectedItems={setPickedBrands} idKey="id" nameKey="name" placeholder="Select brand to auto-add..." />
                            <div style={{ height: 1, background: 'var(--line)', margin: '16px 0' }} />
                            <AutoSelectDropdownWithChips label="Target Delivery Cities" items={citiesList} selectedItems={pickedCities} setSelectedItems={setPickedCities} idKey="id" nameKey="name" placeholder="Select city to auto-add..." />
                            <AutoSelectDropdownWithChips label="Target Delivery Areas / Zones" items={areasList} selectedItems={pickedAreas} setSelectedItems={setPickedAreas} idKey="id" nameKey="name" placeholder={areasList.length === 0 ? "Select cities first..." : "Select area to auto-add..."} disabled={areasList.length === 0} />

                            <div className="field" style={{ marginBottom: 0 }}>
                                <label><b>Sales Channels</b></label>
                                <div className="chips">
                                    {channels.map((c) => (
                                        <span className="chip" key={c}>{c} <button type="button" aria-label="Remove" onClick={() => removeFromList(channels, setChannels, c)}>✕</button></span>
                                    ))}
                                    <input
                                        placeholder="Add channel…" value={newChannel}
                                        onChange={(e) => setNewChannel(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToList(channels, setChannels, newChannel, setNewChannel); } }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <>
                            <div className="card panel">
                                <h2 className="panel-h">When it runs</h2>
                                <p className="panel-s">All times are Asia/Dhaka (GMT+6).</p>
                                <div className="grid2">
                                    <div className="field">
                                        <label htmlFor="f-start">Starts</label>
                                        <input id="f-start" className="inp" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="f-end">Ends</label>
                                        <input id="f-end" className="inp" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={noEndDate} />
                                    </div>
                                </div>
                                <SwitchRow
                                    on={noEndDate} onToggle={() => setNoEndDate(!noEndDate)}
                                    title="No end date"
                                    desc="The coupon keeps running until someone pauses it or the redemption limit is reached."
                                />
                            </div>

                            <div className="card panel">
                                <h2 className="panel-h">Blackout periods</h2>
                                <p className="panel-s">Windows inside the validity range where the code stops working — peak days, flash sales, stock freezes.</p>
                                {blackouts.map((b, i) => (
                                    <div className="blackout" key={b.name + i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0', borderBottom: '1px solid var(--line-soft)' }}>
                                        <span style={{ flex: 1 }}>
                                            <span className="bn">{b.name}</span>
                                            <div className="bd" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                                {b.start} → {b.end}
                                            </div>
                                        </span>
                                        <button type="button" className="btn btn-sm" onClick={() => startEditBlackout(i)}>Edit</button>
                                        <button type="button" className="btn btn-sm btn-danger" onClick={() => removeBlackout(i)}>Remove</button>
                                    </div>
                                ))}

                                <div style={{ marginTop: '16px', background: 'var(--surface-subtle, #f9fafb)', padding: '14px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                                        {editingBlackoutIndex !== null ? 'Edit Blackout Period' : 'Add Blackout Period'}
                                    </h4>
                                    <div className="field" style={{ marginBottom: '10px' }}>
                                        <label>Blackout Name</label>
                                        <input className="inp" placeholder="e.g. Flash Sale Freeze" value={blackoutName} onChange={(e) => setBlackoutName(e.target.value)} />
                                    </div>
                                    <div className="grid2" style={{ marginBottom: '10px' }}>
                                        <div className="field">
                                            <label>Blackout Start</label>
                                            <input className="inp" type="datetime-local" value={blackoutStart} onChange={(e) => setBlackoutStart(e.target.value)} />
                                        </div>
                                        <div className="field">
                                            <label>Blackout End</label>
                                            <input className="inp" type="datetime-local" value={blackoutEnd} onChange={(e) => setBlackoutEnd(e.target.value)} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button type="button" className="btn btn-sm btn-primary" onClick={handleSaveBlackout}>
                                            {editingBlackoutIndex !== null ? 'Update Blackout' : '＋ Add blackout period'}
                                        </button>
                                        {editingBlackoutIndex !== null && (
                                            <button type="button" className="btn btn-sm" onClick={cancelEditBlackout}>Cancel</button>
                                        )}
                                    </div>
                                </div>
                                <div className="note" style={{ marginTop: 16 }}>
                                    <span className="ic">!</span>
                                    <span>Blackouts pause the coupon during specified peak windows. Customers trying the code during a blackout see a custom restriction prompt.</span>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="builder-foot">
                        <span className="autosave">Draft state</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" className="btn" style={{ visibility: step === 1 ? 'hidden' : 'visible' }} onClick={prev}>Back</button>
                            <button type="button" className="btn btn-primary" onClick={next}>{step === total ? 'Review & publish' : 'Continue'}</button>
                        </div>
                    </div>
                </div>

                {/* ---- right rail: live preview ---- */}
                <div className="rail">
                    <div>
                        <div className="rail-h">Customer sees</div>
                        <div className="stub">
                            <div className="stub-top">
                                <div className="stub-eyebrow"><span>Coupon</span><span>{preview.tag}</span></div>
                                <div className="stub-val">{preview.val}</div>
                                <div className="stub-name">{preview.name}</div>
                            </div>
                            <div className="perf" />
                            <div className="stub-bot">
                                <div className="stub-code">{(code || 'CODE').toUpperCase()}</div>
                                <div className="stub-terms">
                                    <div><span>Valid</span><span>{toLocalISOString(startDate).split('T')[0]} → {noEndDate ? 'Forever' : toLocalISOString(endDate).split('T')[0]}</span></div>
                                    <div><span>Cities</span><span>{preview.cityNames}</span></div>
                                    <div><span>Per customer</span><span>{perCustomer || '∞'} use</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AutoSelectDropdownWithChips({ label, items, selectedItems, setSelectedItems, idKey = 'id', nameKey = 'name', placeholder, disabled = false }) {
    const [expanded, setExpanded] = useState(false);
    const MAX_VISIBLE = 3;
    const visibleItems = expanded ? selectedItems : selectedItems.slice(0, MAX_VISIBLE);
    const hiddenCount = selectedItems.length - MAX_VISIBLE;

    return (
        <div className="field" style={{ marginBottom: '20px' }}>
            <label><b>{label}</b> (Multiple Selection)</label>
            <select
                className="inp"
                value=""
                disabled={disabled}
                onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const found = items.find(item => String(item[idKey]) === String(val));
                    if (found && !selectedItems.some(item => String(item[idKey]) === String(found[idKey]))) {
                        setSelectedItems(prev => [...prev, found]);
                    }
                }}
            >
                <option value="">{placeholder}</option>
                {items
                    .filter(item => !selectedItems.some(selected => String(selected[idKey]) === String(item[idKey])))
                    .map(item => (
                        <option key={item[idKey]} value={item[idKey]}>{item[nameKey] || item.cityName || item.areaName}</option>
                    ))}
            </select>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', alignItems: 'center' }}>
                {visibleItems.map((item, idx) => (
                    <span className="chip" key={item[idKey] || idx}>
                        {item[nameKey] || item.cityName || item.areaName}
                        <button type="button" aria-label="Remove" onClick={() => setSelectedItems(prev => prev.filter(i => String(i[idKey]) !== String(item[idKey])))}>✕</button>
                    </span>
                ))}
                {!expanded && hiddenCount > 0 && (
                    <button type="button" className="btn btn-sm" onClick={() => setExpanded(true)} style={{ padding: '2px 8px', fontSize: '12px', height: 'auto', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px' }}>
                        +{hiddenCount} ...
                    </button>
                )}
                {expanded && selectedItems.length > MAX_VISIBLE && (
                    <button type="button" className="btn btn-sm" onClick={() => setExpanded(false)} style={{ padding: '2px 8px', fontSize: '12px', height: 'auto', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px' }}>
                        Show less
                    </button>
                )}
                {selectedItems.length === 0 && <span className="hint">None selected (applies to all).</span>}
            </div>
        </div>
    );
}

function SwitchRow({ on, onToggle, title, desc }) {
    return (
        <div className="switch-row">
            <button type="button" className={`switch ${on ? 'on' : ''}`} aria-pressed={on} onClick={onToggle} />
            <div><div className="st">{title}</div><div className="sd">{desc}</div></div>
        </div>
    );
}
