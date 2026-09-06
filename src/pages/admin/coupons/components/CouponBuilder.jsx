import React, { useMemo, useState } from 'react';
import { fmt } from '../couponData';

const BUILDER_STEPS = [
    { n: 1, t: 'Basics', d: 'Code, name, visibility' },
    { n: 2, t: 'Discount', d: 'What the customer gets' },
    { n: 3, t: 'Who can use it', d: 'Eligibility & limits' },
    { n: 4, t: 'Where it applies', d: 'Products & cities' },
    { n: 5, t: 'When it runs', d: 'Validity & blackouts' },
];

const DISCOUNT_TYPES = [
    { key: 'percent', glyph: '%', title: 'Percentage off', desc: 'Cut a share off the cart or selected items. Cap it to control cost.' },
    { key: 'fixed', glyph: '৳', title: 'Fixed amount off', desc: 'A flat taka reduction, e.g. ৳300 off orders over ৳2,500.' },
    { key: 'delivery', glyph: '⇢', title: 'Free delivery', desc: 'Waives the shipping fee. Works with a minimum cart or first-order rule.' },
    { key: 'price', glyph: '=', title: 'Set price', desc: 'Customer pays a fixed price for one qualifying item, e.g. any product for ৳100.' },
];

export default function CouponBuilder({ onDiscard }) {
    const [step, setStep] = useState(1);

    // Step 1: Basics
    const [code, setCode] = useState('SAVE10');
    const [internalName, setInternalName] = useState('Cart value booster — August');
    const [checkoutMsg, setCheckoutMsg] = useState('Get 10% off orders over ৳5,000. Maximum discount ৳100.');
    const [publicCoupon, setPublicCoupon] = useState(true);
    const [stackCoupons, setStackCoupons] = useState(false);

    // Step 2: Discount
    const [discountType, setDiscountType] = useState('percent');
    const [discountVal, setDiscountVal] = useState('10');
    const [cap, setCap] = useState('100');
    const [minCart, setMinCart] = useState('5000');
    const [fixedAmount, setFixedAmount] = useState('300');
    const [fixedMin, setFixedMin] = useState('2500');
    const [deliveryMin, setDeliveryMin] = useState('');
    const [pricePay, setPricePay] = useState('100');
    const [priceCeiling, setPriceCeiling] = useState('1500');

    // Step 3: Eligibility
    const [eligibility, setEligibility] = useState('Anyone');
    const [autoIssue, setAutoIssue] = useState(false);
    const [totalRedemptions, setTotalRedemptions] = useState('5000');
    const [perCustomer, setPerCustomer] = useState('1');
    const [perDay, setPerDay] = useState('');
    const [paymentMethods, setPaymentMethods] = useState(['bKash', 'Nagad', 'Card']);
    const [newMethod, setNewMethod] = useState('');

    // Step 4: Scope
    const [productScope, setProductScope] = useState('Specific products');
    const [pickedProducts, setPickedProducts] = useState([
        { name: 'Sony WH-1000XM5 Wireless Headphones', sku: 'AUD-8841', price: '৳34,900' },
        { name: 'Xiaomi Redmi Buds 5 Pro', sku: 'AUD-2210', price: '৳6,499' },
    ]);
    const [cityScope, setCityScope] = useState('Only these cities');
    const [cities, setCities] = useState(['Dhaka', 'Gazipur', 'Narayanganj']);
    const [newCity, setNewCity] = useState('');
    const [channels, setChannels] = useState(['Website', 'Mobile app']);
    const [newChannel, setNewChannel] = useState('');

    // Step 5: Schedule
    const [startDate, setStartDate] = useState('2026-08-20T00:00');
    const [endDate, setEndDate] = useState('2026-08-31T23:59');
    const [noEndDate, setNoEndDate] = useState(false);
    const [blackouts, setBlackouts] = useState([
        { name: 'Independence Day flash sale', range: '26 Aug 00:00 → 27 Aug 23:59' },
        { name: 'Weekend peak hours', range: 'Every Fri & Sat · 18:00 → 22:00' },
    ]);

    function removeFromList(list, setList, item) {
        setList(list.filter((i) => i !== item));
    }
    function addToList(list, setList, value, setValue) {
        const v = value.trim();
        if (v) { setList([...list, v]); setValue(''); }
    }
    function removeBlackout(idx) {
        setBlackouts(blackouts.filter((_, i) => i !== idx));
    }
    function removeProduct(idx) {
        setPickedProducts(pickedProducts.filter((_, i) => i !== idx));
    }

    const preview = useMemo(() => {
        let tag = 'Cart offer';
        let val;
        let name;
        if (discountType === 'percent') {
            tag = 'Cart offer';
            val = <>{discountVal || '10'}% off <small>up to ৳{fmt(cap || '100')}</small></>;
            name = `On orders over ৳${fmt(minCart || '5000')}`;
        } else if (discountType === 'fixed') {
            tag = 'Cart offer';
            val = <>৳{fmt(fixedAmount || '300')} off</>;
            name = `On orders over ৳${fmt(fixedMin || '2500')}`;
        } else if (discountType === 'delivery') {
            tag = 'Delivery';
            val = <>Free<br />delivery</>;
            name = 'On your first order';
        } else {
            tag = 'Reward';
            val = <>Any item<br />for ৳{fmt(pricePay || '100')}</>;
            name = 'Unlocked after ৳5,000 spent';
        }

        let summaryLead;
        if (discountType === 'percent') {
            summaryLead = <>Give <b>{discountVal || '10'}% off, capped at ৳{fmt(cap || '100')}</b>, when the cart is <b>৳{fmt(minCart || '5000')} or more</b>.</>;
        } else if (discountType === 'fixed') {
            summaryLead = <>Take <b>৳{fmt(fixedAmount || '300')} off</b> when the cart is <b>৳{fmt(fixedMin || '2500')} or more</b>.</>;
        } else if (discountType === 'delivery') {
            summaryLead = <>Waive the <b>full delivery fee</b> on a customer&rsquo;s <b>first order</b>, with no minimum cart.</>;
        } else {
            summaryLead = <>Let the customer buy <b>any one qualifying item for ৳{fmt(pricePay || '100')}</b>, unlocked automatically once <b>lifetime spend passes ৳5,000</b>. Valid 30 days from issue.</>;
        }

        return { tag, val, name, summaryLead };
    }, [discountType, discountVal, cap, minCart, fixedAmount, fixedMin, pricePay]);

    const total = BUILDER_STEPS.length;
    const next = () => setStep(Math.min(total, step + 1));
    const prev = () => setStep(Math.max(1, step - 1));

    return (
        <div className="wrap">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h1 className="h1">New coupon</h1>
                        <span className="pill p-draft">Draft</span>
                    </div>
                    <p className="sub">Set the rule once. Checkout enforces it everywhere — web, app and call centre.</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button type="button" className="btn" onClick={onDiscard}>Discard</button>
                    <button type="button" className="btn">Save as draft</button>
                    <button type="button" className="btn btn-primary">Review &amp; publish</button>
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
                                        />
                                        <span className="post" style={{ cursor: 'pointer', fontSize: 11 }} onClick={() => setCode(Math.random().toString(36).slice(2, 10).toUpperCase())}>Generate</span>
                                    </div>
                                    <div className="hint">Letters and numbers only. Customers see this exactly as typed.</div>
                                </div>
                                <div className="field">
                                    <label htmlFor="f-name">Internal name</label>
                                    <input id="f-name" className="inp" value={internalName} onChange={(e) => setInternalName(e.target.value)} />
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

                            {discountType === 'percent' && (
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
                                    <div className="note info">
                                        <span className="ic">i</span>
                                        <span>
                                            At a ৳{fmt(minCart || '5000')} cart the discount is ৳{fmt(Math.round((parseFloat(minCart || '5000') * parseFloat(discountVal || '10')) / 100) || 0)},
                                            so the ৳{fmt(cap || '100')} cap applies to every qualifying order. Customers spending over <b>৳{fmt(Math.round((parseFloat(cap || '100') * 100) / parseFloat(discountVal || '10')) || 0)}</b> already hit the cap — consider a fixed ৳{fmt(cap || '100')} off instead for a clearer message.
                                        </span>
                                    </div>
                                </div>
                            )}

                            {discountType === 'price' && (
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
                                                <option>Up to 3 items</option>
                                            </select>
                                        </div>
                                        <div className="field">
                                            <label>Item price ceiling</label>
                                            <div className="affix"><span>৳</span><input className="num" value={priceCeiling} onChange={(e) => setPriceCeiling(e.target.value)} /></div>
                                            <div className="hint">Blocks high-value abuse.</div>
                                        </div>
                                    </div>
                                    <div className="note">
                                        <span className="ic">!</span>
                                        <span>Set-price coupons carry unlimited downside without a ceiling. With a ৳{fmt(priceCeiling || '1500')} ceiling your worst case is <b>৳{fmt((parseFloat(priceCeiling || '1500') - parseFloat(pricePay || '100')) || 0)} per redemption</b>. Restrict the product list in step 4 to tighten this further.</span>
                                    </div>
                                </div>
                            )}

                            {discountType === 'fixed' && (
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

                            {discountType === 'delivery' && (
                                <div style={{ marginTop: 20 }}>
                                    <div className="grid2">
                                        <div className="field">
                                            <label>Delivery fee covered</label>
                                            <select className="inp" defaultValue="Full delivery fee">
                                                <option>Full delivery fee</option>
                                                <option>Up to a maximum</option>
                                            </select>
                                        </div>
                                        <div className="field">
                                            <label>Minimum cart value</label>
                                            <div className="affix"><span>৳</span><input className="num" value={deliveryMin} onChange={(e) => setDeliveryMin(e.target.value)} placeholder="No minimum" /></div>
                                            <div className="hint">Leave at 0 for no minimum.</div>
                                        </div>
                                    </div>
                                    <div className="note info"><span className="ic">i</span><span>Express and same-day delivery are excluded by default. Change this in <b>Delivery zones → Fee rules</b>.</span></div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="card panel">
                            <h2 className="panel-h">Who can use it</h2>
                            <p className="panel-s">Every condition below must be true for the code to apply.</p>
                            <div className="field">
                                <label>Customer eligibility</label>
                                <select className="inp" value={eligibility} onChange={(e) => setEligibility(e.target.value)}>
                                    <option>Anyone</option>
                                    <option>First-time customers only — no completed order</option>
                                    <option>Returning customers only</option>
                                    <option>Customers who spent over a threshold</option>
                                    <option>Specific segment</option>
                                </select>
                            </div>
                            <SwitchRow
                                on={autoIssue} onToggle={() => setAutoIssue(!autoIssue)}
                                title="Issue automatically as a reward"
                                desc="Instead of a public code, generate a unique coupon for a customer when they hit a milestone — for example, once lifetime spend passes ৳5,000. Each issued code is single-use and traceable to that customer."
                            />
                            {autoIssue && (
                                <div style={{ paddingLeft: 48, margin: '-4px 0 14px' }}>
                                    <div className="grid3">
                                        <div className="field" style={{ marginBottom: 0 }}>
                                            <label>Trigger</label>
                                            <select className="inp"><option>Lifetime spend reaches</option><option>Single order value reaches</option><option>Order count reaches</option></select>
                                        </div>
                                        <div className="field" style={{ marginBottom: 0 }}>
                                            <label>Threshold</label>
                                            <div className="affix"><span>৳</span><input className="num" defaultValue="5000" /></div>
                                        </div>
                                        <div className="field" style={{ marginBottom: 0 }}>
                                            <label>Expires after issue</label>
                                            <div className="affix"><input className="num" defaultValue="30" /><span className="post">days</span></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="grid3">
                                <div className="field">
                                    <label>Total redemptions</label>
                                    <input className="inp num" value={totalRedemptions} onChange={(e) => setTotalRedemptions(e.target.value)} placeholder="Unlimited" />
                                </div>
                                <div className="field">
                                    <label>Per customer</label>
                                    <input className="inp num" value={perCustomer} onChange={(e) => setPerCustomer(e.target.value)} placeholder="Unlimited" />
                                </div>
                                <div className="field">
                                    <label>Per day (all customers)</label>
                                    <input className="inp num" value={perDay} onChange={(e) => setPerDay(e.target.value)} placeholder="Unlimited" />
                                </div>
                            </div>
                            <div className="field">
                                <label>Payment methods</label>
                                <div className="chips">
                                    {paymentMethods.map((m) => (
                                        <span className="chip" key={m}>{m} <button type="button" aria-label="Remove" onClick={() => removeFromList(paymentMethods, setPaymentMethods, m)}>✕</button></span>
                                    ))}
                                    <input
                                        placeholder="Add method…" value={newMethod}
                                        onChange={(e) => setNewMethod(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToList(paymentMethods, setPaymentMethods, newMethod, setNewMethod); } }}
                                    />
                                </div>
                                <div className="hint">Cash on delivery is excluded — remove a method to allow it everywhere.</div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="card panel">
                            <h2 className="panel-h">Where it applies</h2>
                            <p className="panel-s">Narrow the coupon to a catalogue slice, a delivery area, or both.</p>
                            <div className="field">
                                <label>Products</label>
                                <select className="inp" value={productScope} onChange={(e) => setProductScope(e.target.value)}>
                                    <option>All products</option>
                                    <option>Specific products</option>
                                    <option>Specific categories</option>
                                    <option>Specific brands</option>
                                    <option>All products except a list</option>
                                </select>
                            </div>
                            {productScope === 'Specific products' && (
                                <>
                                    {pickedProducts.map((p, i) => (
                                        <div className="picked" key={p.sku}>
                                            <span className="thumb" />
                                            <span style={{ flex: 1 }}><span className="pn">{p.name}</span><div className="ps">SKU {p.sku} · {p.price}</div></span>
                                            <button type="button" className="btn btn-sm btn-ghost" onClick={() => removeProduct(i)}>Remove</button>
                                        </div>
                                    ))}
                                    <button type="button" className="btn btn-sm" style={{ marginTop: 4 }}>＋ Add products</button>
                                </>
                            )}

                            <div style={{ height: 1, background: 'var(--line)', margin: '22px 0' }} />

                            <div className="field">
                                <label>Delivery cities</label>
                                <select className="inp" style={{ marginBottom: 9 }} value={cityScope} onChange={(e) => setCityScope(e.target.value)}>
                                    <option>All cities</option>
                                    <option>Only these cities</option>
                                    <option>All cities except these</option>
                                </select>
                                <div className="chips">
                                    {cities.map((c) => (
                                        <span className="chip" key={c}>{c} <button type="button" aria-label="Remove" onClick={() => removeFromList(cities, setCities, c)}>✕</button></span>
                                    ))}
                                    <input
                                        placeholder="Search cities or zones…" value={newCity}
                                        onChange={(e) => setNewCity(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToList(cities, setCities, newCity, setNewCity); } }}
                                    />
                                </div>
                                <div className="hint">Matched against the delivery address, not the billing address.</div>
                            </div>

                            <div className="field" style={{ marginBottom: 0 }}>
                                <label>Sales channels</label>
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
                                    <div className="blackout" key={b.name}>
                                        <span style={{ flex: 1 }}><span className="bn">{b.name}</span><div className="bd">{b.range}</div></span>
                                        <button type="button" className="btn btn-sm btn-ghost">Edit</button>
                                        <button type="button" className="btn btn-sm btn-danger" onClick={() => removeBlackout(i)}>Remove</button>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-sm" style={{ marginTop: 4 }}>＋ Add blackout period</button>
                                <div className="note" style={{ marginTop: 16 }}>
                                    <span className="ic">!</span>
                                    <span>Blackouts remove <b>6 of 12</b> days from this coupon&rsquo;s run. Customers who try the code during a blackout see: <em>&ldquo;This offer is paused right now. Try again after 27 Aug.&rdquo;</em></span>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="builder-foot">
                        <span className="autosave">Saved as draft · 2 minutes ago</span>
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
                                    <div><span>Valid</span><span>20–31 Aug 2026</span></div>
                                    <div><span>Cities</span><span>Dhaka +{Math.max(cities.length - 1, 0)}</span></div>
                                    <div><span>Per customer</span><span>{perCustomer || '∞'} use</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card receipt">
                        <div className="rail-h">Rule summary</div>
                        <p className="summary">
                            {preview.summaryLead} Limited to <b>selected products</b> in <em>{cities.join(', ') || 'all cities'}</em>. One use per customer, {fmt(totalRedemptions || '0')} total. Runs <b>20–31 Aug</b> with <em>{blackouts.length} blackout window{blackouts.length === 1 ? '' : 's'}</em>.
                        </p>
                    </div>

                    <div className="card receipt">
                        <div className="rail-h">Cost forecast</div>
                        <div className="receipt-line"><span className="k">Worst case</span><span className="v"><b className="num">৳5,00,000</b> if all 5,000 uses redeem at the ৳{fmt(cap || '100')} cap</span></div>
                        <div className="receipt-line"><span className="k">Likely</span><span className="v"><b className="num">৳1,84,000</b> based on SAVE10&rsquo;s July performance</span></div>
                        <div className="receipt-line"><span className="k">Conflicts</span><span className="v">Overlaps <span className="mono" style={{ fontSize: 11.5 }}>DHAKA300</span> on 22–31 Aug. Stacking is off, so the larger discount wins.</span></div>
                    </div>

                    <button type="button" className="btn" style={{ width: '100%' }}>Test on a sample cart</button>
                </div>
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