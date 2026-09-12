
import React, {useContext, useState, useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {CartContext} from '../context/CartContext';
import {AuthContext} from '../context/AuthContext';
import axiosInstance from '../api/AxiosInstance';
import {toast} from 'react-hot-toast';
import {X, Ticket} from 'lucide-react';
import './Checkout.css';

// REGEX
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(?:\+?88|0088)?01[3-9]\d{8}$/;

const getInitials = (name = '') => {
    const trimmed = name.trim();
    if (!trimmed) return '?';
    const parts = trimmed.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// --- ADDRESS TYPES ---
const ADDRESS_TYPES = [
    {value: 'HOME', label: 'Home'},
    {value: 'OFFICE', label: 'Office'},
    {value: 'BILLING', label: 'Billing'},
    {value: 'OTHER', label: 'Other'}
];

const getAddressTypeLabel = (type = '') => {
    const match = ADDRESS_TYPES.find(t => t.value === (type || '').toUpperCase());
    if (match) return match.label;
    return type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : 'Other';
};

const checkIsDefault = (addr) => {
    return addr.isDefault === true || addr.isDefault === 1 || addr.isDefault === '1' ||
        addr.is_default === true || addr.is_default === 1 || addr.is_default === '1';
};

const AddressTypeIcon = ({type}) => {
    switch ((type || '').toUpperCase()) {
        case 'HOME':
            return (
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2 7.5L8 2.5L14 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"
                          strokeLinejoin="round"/>
                    <path d="M3.5 6.5V13H12.5V6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"
                          strokeLinejoin="round"/>
                    <path d="M6.5 13V9.5H9.5V13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"
                          strokeLinejoin="round"/>
                </svg>
            );
        case 'OFFICE':
            return (
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="2" y="6" width="12" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M5.5 6V4.2C5.5 3.5 6.1 3 6.8 3H9.2C9.9 3 10.5 3.5 10.5 4.2V6" stroke="currentColor"
                          strokeWidth="1.4" strokeLinecap="round"/>
                    <path d="M2 9.5H14" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
            );
        case 'BILLING':
            return (
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="1.5" y="4" width="13" height="8.5" rx="1.3" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M1.5 6.8H14.5" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M3.5 10H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
            );
        default:
            return (
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                        d="M8 14.5C8 14.5 13 10.2 13 6.6C13 3.8 10.8 1.5 8 1.5C5.2 1.5 3 3.8 3 6.6C3 10.2 8 14.5 8 14.5Z"
                        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                    <circle cx="8" cy="6.6" r="1.8" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
            );
    }
};

const VISIBLE_ADDRESS_LIMIT = 3;

const Checkout = () => {
    const {cart, cartTotal, fetchCart} = useContext(CartContext);
    const {user, isGuest} = useContext(AuthContext);
    const navigate = useNavigate();

    // --- FORM & ERROR STATE ---
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        city: '',
        cityId: '',
        area: '',
        address: '',
        email: '',
        note: ''
    });

    const [errors, setErrors] = useState({});
    const [lockedFields, setLockedFields] = useState({email: false, phone: false});

    // Data States
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');

    // Coupon States
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [selectedCouponCode, setSelectedCouponCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState('');
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [manualCouponInput, setManualCouponInput] = useState('');
    const [applyingCode, setApplyingCode] = useState(null);

    // New-address form state
    const [addressType, setAddressType] = useState('HOME');
    const [setAsDefaultAddress, setSetAsDefaultAddress] = useState(true);
    const [savingAddress, setSavingAddress] = useState(false);
    const [showAllAddresses, setShowAllAddresses] = useState(false);
    const [brokenImages, setBrokenImages] = useState({});

    const hasAutoSelected = useRef(false);

    // Loading & Method States
    const [loadingCities, setLoadingCities] = useState(true);
    const [loadingAreas, setLoadingAreas] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [shippingMethod, setShippingMethod] = useState('inside');
    const [paymentMethod, setPaymentMethod] = useState('COD');

    const shippingCost = shippingMethod === 'inside' ? 60 : 120;
    const grandTotal = Math.max(0, cartTotal - appliedDiscount) + shippingCost;

    // --- META PIXEL: INITIATE CHECKOUT ---
    useEffect(() => {
        if (cartTotal > 0 && window.fbq) {
            window.fbq('track', 'InitiateCheckout', {
                value: cartTotal,
                currency: 'BDT',
                num_items: cart.reduce((total, item) => total + item.quantity, 0),
                content_ids: cart.map(item => item.productId || item.id),
                content_type: 'product'
            });
        }
    }, [cartTotal, cart]);

    // --- FETCH CITIES ---
    useEffect(() => {
        const fetchCities = async () => {
            setLoadingCities(true);
            try {
                const response = await axiosInstance.get('/api/v1/location/cities');
                setCities(response.data.data || []);
            } catch (error) {
                console.error("Error fetching cities:", error);
            } finally {
                setLoadingCities(false);
            }
        };
        fetchCities();
    }, []);

    // --- FETCH AVAILABLE COUPONS ---
    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await axiosInstance.get('/api/v1/checkout/coupons/available');
                setAvailableCoupons(res.data || []);
            } catch (err) {
                console.error("Failed to load coupons", err);
            }
        };
        fetchCoupons();
    }, [cartTotal]);

    // --- COUPON HANDLERS ---
    const handleApplyCoupon = async (codeToApply) => {
        const code = (codeToApply || manualCouponInput).trim();
        if (!code) {
            toast.error("Please enter a coupon code.");
            return;
        }
        setApplyingCode(code.toUpperCase());
        try {
            const res = await axiosInstance.post(`/api/v1/checkout/coupons/dry-run?code=${encodeURIComponent(code)}`);
            if (res.data && res.data.valid) {
                setSelectedCouponCode(code.toUpperCase());
                setAppliedDiscount(res.data.discountAmount || 0);
                setCouponMessage(res.data.message);
                toast.success(res.data.message || "Coupon applied successfully!");
                setShowCouponModal(false);
                setManualCouponInput('');
            } else {
                toast.error(res.data?.message || "Invalid coupon code.");
            }
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to apply coupon.");
        } finally {
            setApplyingCode(null);
        }
    };

    const handleRemoveCoupon = () => {
        setSelectedCouponCode('');
        setAppliedDiscount(0);
        setCouponMessage('');
        toast.success("Coupon removed.");
    };

    // --- INITIALIZE USER DATA & ADDRESSES ---
    useEffect(() => {
        const fetchUserProfileAndAddresses = async () => {
            hasAutoSelected.current = false;
            if (user && !isGuest) {
                try {
                    let tempEmail = '';
                    if (EMAIL_REGEX.test(user.name)) {
                        tempEmail = user.name;
                    }

                    setFormData(prev => ({
                        ...prev,
                        email: tempEmail || prev.email
                    }));

                    if (tempEmail) {
                        setLockedFields(prev => ({...prev, email: true}));
                    }

                    const [profileRes, addressesRes] = await Promise.all([
                        axiosInstance.get('/api/v1/user/get'),
                        axiosInstance.get('/api/v1/address/all')
                    ]);

                    const userProfile = profileRes.data?.data || profileRes.data;
                    const fetchedAddresses = addressesRes.data?.data || [];

                    setSavedAddresses(fetchedAddresses);

                    if (userProfile) {
                        const finalName = userProfile.name || '';
                        const finalEmail = userProfile.email || tempEmail;
                        const finalPhone = userProfile.phone ? userProfile.phone.replace(/[\s-]/g, '') : '';

                        setFormData(prev => ({
                            ...prev,
                            name: finalName || prev.name,
                            email: finalEmail || prev.email,
                            phone: finalPhone || prev.phone
                        }));

                        setLockedFields({
                            email: Boolean(finalEmail),
                            phone: Boolean(finalPhone)
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setFormData(prev => ({...prev, name: '', phone: '', email: ''}));
                setLockedFields({email: false, phone: false});
                setSavedAddresses([]);
            }
        };

        fetchUserProfileAndAddresses();
    }, [user, isGuest]);

    // --- AUTO-SELECT DEFAULT ADDRESS (runs once) ---
    useEffect(() => {
        if (!hasAutoSelected.current && cities.length > 0 && savedAddresses.length > 0) {
            hasAutoSelected.current = true;
            const defaultAddr = savedAddresses.find(checkIsDefault) || savedAddresses[0];
            handleAddressSelection(defaultAddr.id.toString());
        }
    }, [cities, savedAddresses]);

    // --- ADDRESS CARD SELECTION HANDLER ---
    const handleAddressSelection = async (addressId) => {
        setSelectedAddressId(addressId);

        if (!addressId) {
            setFormData(prev => ({...prev, city: '', cityId: '', area: '', address: ''}));
            setAreas([]);
            setShippingMethod('inside');
            setAddressType('HOME');
            setSetAsDefaultAddress(savedAddresses.length === 0);
            setErrors(prev => ({...prev, cityId: '', area: '', address: ''}));
            return;
        }

        const selectedAddr = savedAddresses.find(a => a.id === parseInt(addressId));
        if (!selectedAddr) return;

        const matchedCity = cities.find(c => c.name.toLowerCase() === selectedAddr.city.toLowerCase());
        const cityId = matchedCity ? matchedCity.id : '';

        setErrors(prev => ({...prev, cityId: '', area: '', address: ''}));

        setFormData(prev => ({
            ...prev,
            address: selectedAddr.address,
            city: selectedAddr.city,
            cityId: cityId,
            area: selectedAddr.area
        }));

        setShippingMethod(selectedAddr.city.toLowerCase() === 'dhaka' ? 'inside' : 'outside');

        if (cityId) {
            setLoadingAreas(true);
            try {
                const response = await axiosInstance.get(`/api/v1/location/areas?city_id=${cityId}`);
                setAreas(response.data.data || []);
            } catch (error) {
                console.error("Error fetching areas:", error);
            } finally {
                setLoadingAreas(false);
            }
        }
    };

    // --- SINGLE FIELD VALIDATOR ---
    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                if (!value.trim()) error = 'Full name is required.';
                break;
            case 'phone': {
                const cleanPhone = value.replace(/[\s-]/g, '');
                if (!cleanPhone) error = 'Phone number is required.';
                else if (!PHONE_REGEX.test(cleanPhone)) error = 'Invalid BD phone number (e.g., 017xxxxxxxx).';
                break;
            }
            case 'email': {
                const cleanEmail = value.trim();
                if (!cleanEmail) error = 'Email address is required.';
                else if (!EMAIL_REGEX.test(cleanEmail)) error = 'Invalid email address.';
                break;
            }
            case 'address':
                if (!value.trim()) error = 'Shipping address is required.';
                break;
            case 'cityId':
                if (!value) error = 'Please select a city.';
                break;
            case 'area':
                if (!value) error = 'Please select an area.';
                break;
            default:
                break;
        }
        return error;
    };

    // --- INPUT HANDLERS ---
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));

        if (errors[name]) {
            const fieldError = validateField(name, value);
            setErrors(prev => ({...prev, [name]: fieldError}));
        }

        if (['address', 'area'].includes(name) && selectedAddressId) {
            setSelectedAddressId('');
        }
    };

    const handleBlur = (e) => {
        const {name, value} = e.target;
        const fieldError = validateField(name, value);
        setErrors(prev => ({...prev, [name]: fieldError}));
    };

    const handleCityChange = async (e) => {
        const selectedCityId = e.target.value;
        const selectedCityObj = cities.find(c => c.id === parseInt(selectedCityId));

        setErrors(prev => ({...prev, cityId: '', area: ''}));
        setSelectedAddressId('');

        if (!selectedCityId) {
            setFormData(prev => ({...prev, city: '', cityId: '', area: ''}));
            setAreas([]);
            return;
        }

        const cityName = selectedCityObj.name;
        setFormData(prev => ({...prev, city: cityName, cityId: selectedCityId, area: ''}));
        setShippingMethod(cityName.toLowerCase() === 'dhaka' ? 'inside' : 'outside');

        setLoadingAreas(true);
        try {
            const response = await axiosInstance.get(`/api/v1/location/areas?city_id=${selectedCityId}`);
            setAreas(response.data.data || []);
        } catch (error) {
            console.error("Error fetching areas:", error);
        } finally {
            setLoadingAreas(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const fieldsToValidate = ['name', 'phone', 'email', 'address', 'cityId', 'area'];

        fieldsToValidate.forEach(field => {
            const err = validateField(field, formData[field]);
            if (err) newErrors[field] = err;
        });

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            toast.error("Please correct the highlighted fields.");
            return false;
        }
        return true;
    };

    // --- SAVE NEW ADDRESS TO ADDRESS BOOK ---
    const handleSaveNewAddress = async () => {
        if (isGuest || !user) {
            toast.error('Please log in to save an address to your account.');
            return;
        }

        const fieldsToValidate = ['cityId', 'area', 'address'];
        const newErrors = {};
        fieldsToValidate.forEach(field => {
            const err = validateField(field, formData[field]);
            if (err) newErrors[field] = err;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({...prev, ...newErrors}));
            toast.error('Please fill in city, area and address first.');
            return;
        }

        setSavingAddress(true);
        try {
            const isFirstAddress = savedAddresses.length === 0;
            const willBeDefault = isFirstAddress || setAsDefaultAddress;

            const response = await axiosInstance.post('/api/v1/address/add', {
                addressType,
                city: formData.city,
                area: formData.area,
                address: formData.address.trim(),
                isDefault: willBeDefault,
                is_default: willBeDefault
            });

            const newAddress = response.data?.data;

            if (newAddress && newAddress.id) {
                setSavedAddresses(prev => {
                    const next = willBeDefault
                        ? prev.map(a => ({...a, isDefault: false, is_default: false}))
                        : prev;
                    return [...next, newAddress];
                });
                setSelectedAddressId(newAddress.id.toString());

                if (!willBeDefault && savedAddresses.length + 1 > VISIBLE_ADDRESS_LIMIT) {
                    setShowAllAddresses(true);
                }
            } else {
                const addressesRes = await axiosInstance.get('/api/v1/address/all');
                const fetchedAddresses = addressesRes.data?.data || [];
                setSavedAddresses(fetchedAddresses);
                const match = fetchedAddresses.find(a =>
                    a.address === formData.address.trim() && a.area === formData.area
                );
                if (match) setSelectedAddressId(match.id.toString());
            }

            toast.success('Address saved.');
        } catch (error) {
            console.error('Save address failed:', error);
            toast.error(error.response?.data?.message || 'Could not save this address. Please try again.');
        } finally {
            setSavingAddress(false);
        }
    };

    // --- PLACE ORDER ---
    const handlePlaceOrder = async () => {
        if (!validateForm()) return;

        setIsProcessing(true);
        const cleanPhone = formData.phone.replace(/[\s-]/g, '');
        const cleanEmail = formData.email.trim();

        if (savedAddresses.length === 0 && !isGuest && user) {
            try {
                await axiosInstance.post('/api/v1/address/add', {
                    addressType: 'HOME',
                    city: formData.city,
                    area: formData.area,
                    address: formData.address.trim(),
                    isDefault: true,
                    is_default: true
                });
            } catch (e) {
                console.error("Background address save failed", e);
            }
        }

        const orderPayload = {
            shippingAddress: formData.address.trim(),
            city: formData.city,
            area: formData.area,
            phone: cleanPhone,
            email: cleanEmail,
            name: formData.name.trim(),
            orderNote: formData.note.trim(),
            paymentMethod: paymentMethod,
            couponCode: selectedCouponCode,
            discountAmount: appliedDiscount,
            items: cart.map(item => ({
                productId: item.productId || item.id,
                quantity: item.quantity
            }))
        };

        try {
            const response = await axiosInstance.post('/api/v1/order/placeOrder', orderPayload);

            if (response.status === 201 || response.status === 200 || response.data.status === 201) {
                const orderId = response.data.data;

                if (window.fbq) {
                    window.fbq('track', 'Purchase', {
                        value: grandTotal,
                        currency: 'BDT',
                        content_ids: cart.map(item => item.productId || item.id),
                        content_type: 'product',
                        num_items: cart.reduce((total, item) => total + item.quantity, 0),
                        order_id: orderId
                    });
                }

                toast.success("Order placed successfully!");
                fetchCart(true);
                navigate(`/order-success/${orderId}`);
            }
        } catch (error) {
            console.error("Order failed:", error);
            const errMsg = error.response?.data?.message || "Failed to place order.";
            toast.error(errMsg);
        } finally {
            setIsProcessing(false);
        }
    };

    const StepIndicator = () => (
        <div className="checkout-steps" aria-label="Checkout progress">
            <div className="checkout-step is-done">
                <span className="checkout-step-dot">
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1.5"
                                                                                    stroke="white" strokeWidth="1.6"
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"/></svg>
                </span>
                <span className="checkout-step-label">Bag</span>
            </div>
            <span className="checkout-step-line is-done"/>
            <div className="checkout-step is-active">
                <span className="checkout-step-dot">2</span>
                <span className="checkout-step-label">Checkout</span>
            </div>
            <span className="checkout-step-line"/>
            <div className="checkout-step">
                <span className="checkout-step-dot">3</span>
                <span className="checkout-step-label">Confirmation</span>
            </div>
        </div>
    );

    if (loadingCities) {
        return (
            <div className="checkout-container">
                <div className="checkout-wrapper">
                    <div className="checkout-left">
                        <div className="checkout-skeleton-box skeleton-title"></div>
                        <div className="checkout-skeleton-box skeleton-card" style={{height: 90}}></div>
                        <div className="checkout-skeleton-box skeleton-sub-title"></div>
                        <div className="skeleton-address-grid">
                            <div className="checkout-skeleton-box skeleton-address-card"></div>
                            <div className="checkout-skeleton-box skeleton-address-card"></div>
                        </div>
                        <div className="checkout-skeleton-box skeleton-textarea"></div>
                    </div>
                    <div className="checkout-right">
                        <div className="checkout-skeleton-box skeleton-sub-title"></div>
                        <div className="checkout-skeleton-box skeleton-card"></div>
                        <div className="checkout-skeleton-box skeleton-card"></div>
                        <div className="checkout-skeleton-box skeleton-price-block"></div>
                        <div className="checkout-skeleton-box skeleton-btn"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="checkout-empty">
                <p>Your bag is empty.</p>
                <button onClick={() => navigate('/')}>Shop now</button>
            </div>
        );
    }

    const isCitySelected = formData.city !== '';
    const isDhaka = formData.city.toLowerCase() === 'dhaka';
    const showAddressForm = savedAddresses.length === 0 || selectedAddressId === '';

    const sortedAddresses = [...savedAddresses].sort((a, b) => {
        const aIsDefault = checkIsDefault(a);
        const bIsDefault = checkIsDefault(b);
        if (aIsDefault === bIsDefault) return 0;
        return aIsDefault ? -1 : 1;
    });

    const visibleAddresses = showAllAddresses
        ? sortedAddresses
        : sortedAddresses.slice(0, VISIBLE_ADDRESS_LIMIT);

    const hiddenAddressCount = sortedAddresses.length - visibleAddresses.length;
    const addressGridNeedsScroll = showAllAddresses && sortedAddresses.length > 8;

    return (
        <div className="checkout-container">
            <div className="checkout-header">
                <StepIndicator/>
                <div className="checkout-secure-note">
                    <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
                        <path d="M6.5 1L1 3.2V6.8C1 10.1 3.3 13 6.5 14C9.7 13 12 10.1 12 6.8V3.2L6.5 1Z"
                              stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                    </svg>
                    Secure checkout
                </div>
            </div>

            <div className="checkout-wrapper">
                <div className="checkout-left">
                    <section className="checkout-panel">
                        <h2 className="panel-title">Contact information</h2>
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label className="form-label">Full name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Rahim Uddin"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`form-input ${errors.name ? 'input-error' : ''}`}
                                />
                                {errors.name && <span className="field-error-text">{errors.name}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Phone number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="01xxxxxxxxx"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`form-input ${errors.phone ? 'input-error' : ''} ${lockedFields.phone ? 'input-locked' : ''}`}
                                    readOnly={lockedFields.phone}
                                />
                                {errors.phone && <span className="field-error-text">{errors.phone}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className={`form-input ${errors.email ? 'input-error' : ''} ${lockedFields.email ? 'input-locked' : ''}`}
                                    readOnly={lockedFields.email}
                                />
                                {errors.email && <span className="field-error-text">{errors.email}</span>}
                            </div>
                        </div>
                    </section>

                    <section className="checkout-panel">
                        <h2 className="panel-title">Delivery address</h2>

                        {savedAddresses.length > 0 && (
                            <>
                                <div className={`address-card-grid ${addressGridNeedsScroll ? 'is-scrollable' : ''}`}>
                                    {visibleAddresses.map(addr => {
                                        const isSelected = selectedAddressId === addr.id.toString();
                                        const isDefaultAddress = checkIsDefault(addr);

                                        return (
                                            <button
                                                type="button"
                                                key={addr.id}
                                                className={`address-card ${isSelected ? 'is-selected' : ''}`}
                                                onClick={() => handleAddressSelection(addr.id.toString())}
                                            >
                                                <span className="address-card-top">
                                                    <span className="address-card-type">
                                                        <AddressTypeIcon type={addr.addressType}/>
                                                        {getAddressTypeLabel(addr.addressType)}
                                                    </span>
                                                    {isDefaultAddress &&
                                                        <span className="address-card-badge">Default</span>}
                                                </span>
                                                <span className="address-card-body">
                                                    {addr.address}, {addr.area}, {addr.city}
                                                </span>
                                                <span className="address-card-radio" aria-hidden="true"/>
                                            </button>
                                        );
                                    })}

                                    <button
                                        type="button"
                                        className={`address-card address-card-add ${selectedAddressId === '' ? 'is-selected' : ''}`}
                                        onClick={() => handleAddressSelection('')}
                                    >
                                        <span className="address-card-add-icon">+</span>
                                        Add a new address
                                    </button>
                                </div>

                                {sortedAddresses.length > VISIBLE_ADDRESS_LIMIT && (
                                    <button
                                        type="button"
                                        className="address-toggle-all"
                                        onClick={() => setShowAllAddresses(prev => !prev)}
                                    >
                                        {showAllAddresses
                                            ? 'Show fewer addresses'
                                            : `Show all ${sortedAddresses.length} addresses (${hiddenAddressCount} more)`}
                                    </button>
                                )}
                            </>
                        )}

                        {showAddressForm && (
                            <div className="address-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <div className="select-wrapper">
                                            <select
                                                name="cityId"
                                                value={formData.cityId}
                                                onChange={handleCityChange}
                                                onBlur={handleBlur}
                                                className={`form-input form-select ${errors.cityId ? 'input-error' : ''}`}
                                            >
                                                <option value="">Select city</option>
                                                {cities.map(city => (
                                                    <option key={city.id} value={city.id}>{city.name}</option>
                                                ))}
                                            </select>
                                            <span className="select-arrow">
                                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                                                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#666" strokeWidth="1.5"
                                                          strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </span>
                                        </div>
                                        {errors.cityId && <span className="field-error-text">{errors.cityId}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Area</label>
                                        <div className="select-wrapper">
                                            <select
                                                name="area"
                                                value={formData.area}
                                                onChange={handleInputChange}
                                                onBlur={handleBlur}
                                                className={`form-input form-select ${!formData.cityId ? 'select-disabled' : ''} ${errors.area ? 'input-error' : ''}`}
                                                disabled={!formData.cityId || loadingAreas}
                                            >
                                                <option value="">
                                                    {loadingAreas ? "Loading areas…" : "Select area"}
                                                </option>
                                                {areas.map(area => (
                                                    <option key={area.id} value={area.name}>{area.name}</option>
                                                ))}
                                            </select>
                                            <span className="select-arrow">
                                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                                                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#666" strokeWidth="1.5"
                                                          strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </span>
                                        </div>
                                        {errors.area && <span className="field-error-text">{errors.area}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group full-width">
                                        <label className="form-label">Street address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            placeholder="House no, road no, building"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={`form-input ${errors.address ? 'input-error' : ''}`}
                                        />
                                        {errors.address && <span className="field-error-text">{errors.address}</span>}
                                    </div>
                                </div>

                                {!isGuest && user && (
                                    <div className="address-save-row">
                                        <div className="address-type-field">
                                            <label className="form-label">Label as</label>
                                            <div className="select-wrapper address-type-select-wrapper">
                                                <select
                                                    value={addressType}
                                                    onChange={(e) => setAddressType(e.target.value)}
                                                    className="form-input form-select"
                                                >
                                                    {ADDRESS_TYPES.map(t => (
                                                        <option key={t.value} value={t.value}>{t.label}</option>
                                                    ))}
                                                </select>
                                                <span className="select-arrow">
                                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                                                        <path d="M1 1.5L6 6.5L11 1.5" stroke="#666" strokeWidth="1.5"
                                                              strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>

                                        <label className="address-default-check">
                                            <input
                                                type="checkbox"
                                                checked={savedAddresses.length === 0 || setAsDefaultAddress}
                                                disabled={savedAddresses.length === 0}
                                                onChange={(e) => setSetAsDefaultAddress(e.target.checked)}
                                            />
                                            Set as default address
                                        </label>

                                        <button
                                            type="button"
                                            className="save-address-btn"
                                            onClick={handleSaveNewAddress}
                                            disabled={savingAddress}
                                        >
                                            {savingAddress ? 'Saving…' : 'Save address'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group full-width">
                                <label className="form-label">Delivery note <span
                                    className="form-label-optional">(optional)</span></label>
                                <textarea
                                    name="note"
                                    placeholder="Add instructions for the courier"
                                    value={formData.note}
                                    onChange={handleInputChange}
                                    className="form-input textarea"
                                ></textarea>
                            </div>
                        </div>
                    </section>

                    <section className="checkout-panel">
                        <h2 className="panel-title">Delivery method</h2>
                        <div className="method-grid">
                            <label
                                className={`method-card ${shippingMethod === 'inside' ? 'is-selected' : ''} ${isCitySelected && !isDhaka ? 'is-disabled' : ''}`}>
                                <input
                                    type="radio"
                                    name="shipping"
                                    checked={shippingMethod === 'inside'}
                                    onChange={() => setShippingMethod('inside')}
                                    disabled={isCitySelected && !isDhaka}
                                />
                                <span className="method-card-text">
                                    <span className="method-card-title">Inside Dhaka</span>
                                    <span className="method-card-sub">2–3 business days</span>
                                </span>
                                <span className="method-card-price">৳60.00</span>
                            </label>

                            <label
                                className={`method-card ${shippingMethod === 'outside' ? 'is-selected' : ''} ${isCitySelected && isDhaka ? 'is-disabled' : ''}`}>
                                <input
                                    type="radio"
                                    name="shipping"
                                    checked={shippingMethod === 'outside'}
                                    onChange={() => setShippingMethod('outside')}
                                    disabled={isCitySelected && isDhaka}
                                />
                                <span className="method-card-text">
                                    <span className="method-card-title">Outside Dhaka</span>
                                    <span className="method-card-sub">3–5 business days</span>
                                </span>
                                <span className="method-card-price">৳120.00</span>
                            </label>
                        </div>
                    </section>

                    <section className="checkout-panel">
                        <h2 className="panel-title">Payment method</h2>
                        <div className="method-grid">
                            <label className={`method-card ${paymentMethod === 'COD' ? 'is-selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'COD'}
                                    onChange={() => setPaymentMethod('COD')}
                                />
                                <span className="method-card-text">
                                    <span className="method-card-title">Cash on delivery</span>
                                    <span className="method-card-sub">Pay when your order arrives</span>
                                </span>
                            </label>

                            <label className="method-card is-disabled">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'Bkash'}
                                    onChange={() => setPaymentMethod('Bkash')}
                                    disabled
                                />
                                <span className="method-card-text">
                                    <span className="method-card-title">bKash</span>
                                    <span className="method-card-sub">Coming soon</span>
                                </span>
                            </label>
                        </div>
                    </section>
                </div>

                <aside className="checkout-right">
                    <div className="summary-card">
                        <h2 className="panel-title">Order summary</h2>

                        <ul className="summary-items">
                            {cart.map(item => {
                                const key = item.productId || item.id;
                                const resolvedImage =
                                    item.image ||
                                    item.thumbnail ||
                                    item.img ||
                                    item.photo ||
                                    item.imageUrl ||
                                    item.productImage ||
                                    item.product?.image ||
                                    item.product?.thumbnail ||
                                    null;
                                const showImage = resolvedImage && !brokenImages[key];

                                return (
                                    <li className="summary-item" key={key}>
                                        <span className="summary-item-thumb">
                                            {showImage
                                                ? (
                                                    <img
                                                        src={resolvedImage}
                                                        alt={item.name || 'Product'}
                                                        onError={() => setBrokenImages(prev => ({
                                                            ...prev,
                                                            [key]: true
                                                        }))}
                                                    />
                                                )
                                                : getInitials(item.name)}
                                            <span className="summary-item-qty">{item.quantity}</span>
                                        </span>
                                        <span className="summary-item-name">{item.name || 'Product'}</span>
                                        {typeof item.price !== 'undefined' && (
                                            <span className="summary-item-price">
                                                ৳ {(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>

                        {/* ===================== COUPON SECTION ===================== */}
                        <div className="coupon-section">
                            {selectedCouponCode ? (
                                <div className="coupon-applied">
                                    <div className="coupon-applied-icon">
                                        <Ticket size={16} />
                                    </div>
                                    <div className="coupon-applied-info">
                                        <span className="coupon-applied-code">{selectedCouponCode}</span>
                                        <span className="coupon-applied-msg">{couponMessage || 'Coupon applied'}</span>
                                    </div>
                                    <span className="coupon-applied-savings">− ৳ {appliedDiscount.toFixed(2)}</span>
                                    <button type="button" className="coupon-remove-btn" onClick={handleRemoveCoupon} aria-label="Remove coupon">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button type="button" className="coupon-trigger"
                                        onClick={() => setShowCouponModal(true)}>
                                    <span className="coupon-trigger-icon"><Ticket size={16}/></span>
                                    <span className="coupon-trigger-text">Apply a coupon or voucher</span>
                                    <svg className="coupon-trigger-arrow" width="8" height="12" viewBox="0 0 8 12"
                                         fill="none">
                                        <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5"
                                              strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            )}

                            {showCouponModal && (
                                <div className="coupon-modal-overlay" onClick={() => setShowCouponModal(false)}>
                                    <div className="coupon-modal" onClick={e => e.stopPropagation()}>
                                        <div className="coupon-modal-header">
                                            <h3>Coupons &amp; Vouchers</h3>
                                            <button
                                                type="button"
                                                className="coupon-modal-close"
                                                onClick={() => setShowCouponModal(false)}
                                                aria-label="Close"
                                            >
                                                <X size={18} color="#333333" />
                                            </button>
                                        </div>

                                        <div className="coupon-manual-entry">
                                            <input
                                                type="text"
                                                placeholder="Enter coupon code"
                                                value={manualCouponInput}
                                                onChange={(e) => setManualCouponInput(e.target.value.toUpperCase())}
                                                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                                className="coupon-manual-input"
                                                disabled={!!applyingCode}
                                            />
                                            <button
                                                type="button"
                                                className="coupon-manual-apply"
                                                onClick={() => handleApplyCoupon()}
                                                disabled={!manualCouponInput.trim() || !!applyingCode}
                                            >
                                                {applyingCode === manualCouponInput.trim().toUpperCase() ? (
                                                    <span className="coupon-spinner"/>
                                                ) : 'Apply'}
                                            </button>
                                        </div>

                                        <div className="coupon-modal-divider">
                                            <span>Available offers</span>
                                        </div>

                                        <div className="coupon-list">
                                            {availableCoupons.length === 0 ? (
                                                <div className="coupon-empty-state">
                                                    <Ticket size={32} />
                                                    <p>No active offers right now</p>
                                                    <span>Check back later for new deals</span>
                                                </div>
                                            ) : (
                                                availableCoupons.map(c => {
                                                    const isSelected = selectedCouponCode === c.code.toUpperCase();
                                                    const isLoadingThis = applyingCode === c.code.toUpperCase();
                                                    return (
                                                        <div key={c.id} className={`coupon-item ${isSelected ? 'is-selected' : ''}`}>
                                                            <div className="coupon-item-icon">
                                                                <Ticket size={18} />
                                                            </div>
                                                            <div className="coupon-item-left">
                                                                <div className="coupon-item-code-row">
                                                                    <span className="coupon-item-code">{c.code}</span>
                                                                    {c.discountLabel && <span className="coupon-item-badge">{c.discountLabel}</span>}
                                                                </div>
                                                                {c.internalName && <p className="coupon-item-name">{c.internalName}</p>}
                                                                {c.checkoutMsg && <p className="coupon-item-desc">{c.checkoutMsg}</p>}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className={`coupon-item-btn ${isSelected ? 'is-applied' : ''}`}
                                                                onClick={() => handleApplyCoupon(c.code)}
                                                                disabled={isSelected || !!applyingCode}
                                                            >
                                                                {isLoadingThis ? (
                                                                    <span className="coupon-spinner" />
                                                                ) : isSelected ? (
                                                                    <>
                                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                                            <path d="M2 6.5L4.5 9L10 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                                                        </svg>
                                                                        Applied
                                                                    </>
                                                                ) : 'Apply'}
                                                            </button>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="price-breakdown">
                            <div className="price-row">
                                <span>Subtotal</span>
                                <span>৳ {cartTotal.toFixed(2)}</span>
                            </div>
                            {appliedDiscount > 0 && (
                                <div className="price-row" style={{color: '#28a745'}}>
                                    <span>Discount ({selectedCouponCode})</span>
                                    <span>- ৳ {appliedDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="price-row">
                                <span>Delivery</span>
                                <span>৳ {shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="price-row total-row">
                                <span>Total</span>
                                <span className="grand-total">৳ {grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button className="place-order-btn" onClick={handlePlaceOrder} disabled={isProcessing}>
                            {isProcessing ? 'Processing…' : 'Place order'}
                        </button>

                        <p className="summary-footnote">
                            <svg width="12" height="14" viewBox="0 0 13 15" fill="none">
                                <path d="M6.5 1L1 3.2V6.8C1 10.1 3.3 13 6.5 14C9.7 13 12 10.1 12 6.8V3.2L6.5 1Z"
                                      stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                            </svg>
                            Your payment and personal details are protected end to end.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Checkout;