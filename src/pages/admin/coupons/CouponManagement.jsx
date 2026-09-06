import React, { useState } from 'react';
import { Search } from 'lucide-react';
import ListView from './components/CouponList';
import BuilderView from './components/CouponBuilder';
import DetailView from './components/CouponDetail';
import { COUPON_ROWS } from './couponData';
import './Couponmanagement.css';

export default function CouponManagement() {
    const [view, setView] = useState('list');
    const [chartRange, setChartRange] = useState('daily');

    // Centralized list states for full interactivity
    const [rows, setRows] = useState(COUPON_ROWS);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedCity, setSelectedCity] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [endingSoonActive, setEndingSoonActive] = useState(false);

    function goList() { setView('list'); }
    function goBuilder() { setView('builder'); }
    function goDetail() { setView('detail'); }

    return (
        <div className="coupon-management">
            <header className="cm-topbar">
                <div className="crumb">
                    <span>Growth</span><span className="sep">/</span>
                    {view === 'list' ? (
                        <b>Coupons</b>
                    ) : (
                        <>
                            <span className="crumb-link" onClick={goList}>Coupons</span>
                            <span className="sep">/</span>
                            <b>{view === 'builder' ? 'New coupon' : 'SAVE10'}</b>
                        </>
                    )}
                </div>
                <div className="search">
                    <Search size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                    <input
                        placeholder="Search coupons, orders, customers"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="kbd">⌘K</span>
                </div>
            </header>

            {view === 'list' && (
                <ListView
                    rows={rows}
                    setRows={setRows}
                    searchQuery={searchQuery}
                    statusTab={statusTab}
                    setStatusTab={setStatusTab}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    selectedCity={selectedCity}
                    setSelectedCity={setSelectedCity}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    endingSoonActive={endingSoonActive}
                    setEndingSoonActive={setEndingSoonActive}
                    onNewCoupon={goBuilder}
                    onOpenRow={goDetail}
                />
            )}
            {view === 'builder' && <BuilderView onDiscard={goList} />}
            {view === 'detail' && <DetailView chartRange={chartRange} setChartRange={setChartRange} onEdit={goBuilder} />}
        </div>
    );
}