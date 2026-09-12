import React, { useState } from 'react';
import { Search } from 'lucide-react';
import ListView from './components/CouponList';
import BuilderView from './components/CouponBuilder';
import DetailView from './components/CouponDetail';
import './Couponmanagement.css';

export default function CouponManagement() {
    const [view, setView] = useState('list');
    const [chartRange, setChartRange] = useState('daily');

    // State to hold the currently selected coupon data
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    // Centralized list states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedCity, setSelectedCity] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [endingSoonActive, setEndingSoonActive] = useState(false);

    function goList() {
        setSelectedCoupon(null);
        setView('list');
    }

    function goBuilder(couponToEdit = null) {
        if (couponToEdit && !couponToEdit.target) {
            setSelectedCoupon(couponToEdit);
        } else {
            setSelectedCoupon(null);
        }
        setView('builder');
    }

    function goDetail(couponData) {
        setSelectedCoupon(couponData);
        setView('detail');
    }

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
                            <b>{view === 'builder' ? (selectedCoupon ? `Edit ${selectedCoupon.code}` : 'New coupon') : selectedCoupon?.code}</b>
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
                    onNewCoupon={() => goBuilder(null)}
                    onEditCoupon={goBuilder}
                    onOpenRow={goDetail}
                />
            )}

            {view === 'builder' && (
                <BuilderView
                    onDiscard={goList}
                    initialData={selectedCoupon}
                />
            )}

            {view === 'detail' && (
                <DetailView
                    coupon={selectedCoupon}
                    couponId={selectedCoupon?.id}
                    chartRange={chartRange}
                    setChartRange={setChartRange}
                    onEdit={goBuilder}
                    onBack={goList}
                />
            )}
        </div>
    );
}