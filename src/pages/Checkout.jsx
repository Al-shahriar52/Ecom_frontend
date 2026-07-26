import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import './Checkout.css';

// REGEX
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(?:\+?88|0088)?01[3-9]\d{8}$/;

const Checkout = () => {
    const { cart, cartTotal, fetchCart } = useContext(CartContext);
    const { user, isGuest } = useContext(AuthContext);
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
    const [lockedField, setLockedField] = useState(null);
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loadingCities, setLoadingCities] = useState(true);
    const [loadingAreas, setLoadingAreas] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [shippingMethod, setShippingMethod] = useState('inside');
    const shippingCost = shippingMethod === 'inside' ? 60 : 120;
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const grandTotal = cartTotal + shippingCost;

    // --- INITIALIZE USER DATA ---
    useEffect(() => {
        if (user && !isGuest) {
            const loginIdentifier = String(user.username || user.name || '').trim();
            const extractedEmail = user.email || (EMAIL_REGEX.test(loginIdentifier) ? loginIdentifier : '');
            const rawPhone = user.phone || user.phoneNumber || (!EMAIL_REGEX.test(loginIdentifier) ? loginIdentifier : '');
            const extractedPhone = rawPhone ? rawPhone.replace(/[\s-]/g, '') : '';

            setFormData(prev => ({
                ...prev,
                email: extractedEmail,
                phone: extractedPhone,
                name: user.realName || user.name || prev.name
            }));

            if (EMAIL_REGEX.test(loginIdentifier)) {
                setLockedField('email');
            } else if (PHONE_REGEX.test(loginIdentifier.replace(/[\s-]/g, ''))) {
                setLockedField('phone');
            }
        } else {
            setFormData(prev => ({ ...prev, name: '', phone: '', email: '' }));
            setLockedField(null);
        }
    }, [user, isGuest]);

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

    // --- SINGLE FIELD VALIDATOR ---
    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'name':
                if (!value.trim()) error = 'Full Name is required.';
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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Real-time error clearing as user types
        if (errors[name]) {
            const fieldError = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: fieldError }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const fieldError = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: fieldError }));
    };

    const handleCityChange = async (e) => {
        const selectedCityId = e.target.value;
        const selectedCityObj = cities.find(c => c.id === parseInt(selectedCityId));

        // Clear city & area errors
        setErrors(prev => ({ ...prev, cityId: '', area: '' }));

        if (!selectedCityId) {
            setFormData(prev => ({ ...prev, city: '', cityId: '', area: '' }));
            setAreas([]);
            return;
        }

        const cityName = selectedCityObj.name;
        setFormData(prev => ({ ...prev, city: cityName, cityId: selectedCityId, area: '' }));
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

    // --- FORM-WIDE VALIDATION BEFORE SUBMIT ---
    const validateForm = () => {
        const newErrors = {};
        const fieldsToValidate = ['name', 'phone', 'email', 'address', 'cityId', 'area'];

        fieldsToValidate.forEach(field => {
            const err = validateField(field, formData[field]);
            if (err) newErrors[field] = err;
        });

        setErrors(newErrors);

        // If errors exist, return false
        if (Object.keys(newErrors).length > 0) {
            toast.error("Please correct the highlighted errors.");
            return false;
        }
        return true;
    };

    // --- PLACE ORDER ---
    const handlePlaceOrder = async () => {
        if (!validateForm()) return;

        setIsProcessing(true);
        const cleanPhone = formData.phone.replace(/[\s-]/g, '');
        const cleanEmail = formData.email.trim();

        const orderPayload = {
            shippingAddress: formData.address.trim(),
            city: formData.city,
            area: formData.area,
            phone: cleanPhone,
            email: cleanEmail,
            name: formData.name.trim(),
            orderNote: formData.note.trim(),
            paymentMethod: paymentMethod,
            items: cart.map(item => ({
                productId: item.productId || item.id,
                quantity: item.quantity
            }))
        };

        try {
            const response = await axiosInstance.post('/api/v1/order/placeOrder', orderPayload);

            if (response.status === 201 || response.status === 200 || response.data.status === 201) {
                const orderId = response.data.data;
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

    if (loadingCities) {
        return (
            <div className="checkout-container">
                <div className="checkout-wrapper">
                    <div className="checkout-left">
                        <div className="checkout-skeleton-box skeleton-title"></div>
                        <div className="form-row"><div className="checkout-skeleton-box skeleton-input skeleton-full"></div></div>
                        <div className="form-row"><div className="checkout-skeleton-box skeleton-input"></div><div className="checkout-skeleton-box skeleton-input"></div></div>
                        <div className="form-row"><div className="checkout-skeleton-box skeleton-input"></div><div className="checkout-skeleton-box skeleton-input"></div></div>
                        <div className="form-row"><div className="checkout-skeleton-box skeleton-input skeleton-full"></div></div>
                        <div className="form-row"><div className="checkout-skeleton-box skeleton-textarea"></div></div>
                    </div>
                    <div className="checkout-right">
                        <div className="checkout-skeleton-box skeleton-sub-title"></div>
                        <div className="checkout-skeleton-box skeleton-card"></div>
                        <div className="checkout-skeleton-box skeleton-card"></div>
                        <div className="checkout-skeleton-box skeleton-price-block"></div>
                        <div className="checkout-skeleton-box skeleton-sub-title"></div>
                        <div className="checkout-skeleton-box skeleton-card"></div>
                        <div className="checkout-skeleton-box skeleton-btn"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="checkout-empty">
                Your cart is empty. <button onClick={() => navigate('/')}>Shop Now</button>
            </div>
        );
    }

    const isCitySelected = formData.city !== '';
    const isDhaka = formData.city.toLowerCase() === 'dhaka';

    return (
        <div className="checkout-container">
            <div className="checkout-wrapper">
                {/* LEFT SIDE FORM */}
                <div className="checkout-left">
                    <h2 className="section-title">BILLING & SHIPPING</h2>

                    {/* Name */}
                    <div className="form-row">
                        <div className="form-group full-width">
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name *"
                                value={formData.name}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={`form-input ${errors.name ? 'input-error' : ''}`}
                            />
                            {errors.name && <span className="field-error-text">{errors.name}</span>}
                        </div>
                    </div>

                    {/* Phone & Email */}
                    <div className="form-row">
                        <div className="form-group">
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone (01xxxxxxxxx) *"
                                value={formData.phone}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={`form-input ${errors.phone ? 'input-error' : ''} ${lockedField === 'phone' ? 'input-locked' : ''}`}
                                readOnly={lockedField === 'phone'}
                            />
                            {errors.phone && <span className="field-error-text">{errors.phone}</span>}
                        </div>

                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address *"
                                value={formData.email}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={`form-input ${errors.email ? 'input-error' : ''} ${lockedField === 'email' ? 'input-locked' : ''}`}
                                readOnly={lockedField === 'email'}
                            />
                            {errors.email && <span className="field-error-text">{errors.email}</span>}
                        </div>
                    </div>

                    {/* City & Area */}
                    <div className="form-row">
                        <div className="form-group">
                            <div className="select-wrapper">
                                <select
                                    name="cityId"
                                    value={formData.cityId}
                                    onChange={handleCityChange}
                                    onBlur={handleBlur}
                                    className={`form-input form-select ${errors.cityId ? 'input-error' : ''}`}
                                >
                                    <option value="">Select City *</option>
                                    {cities.map(city => (
                                        <option key={city.id} value={city.id}>{city.name}</option>
                                    ))}
                                </select>
                                <span className="select-arrow">
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                                        <path d="M1 1.5L6 6.5L11 1.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                            </div>
                            {errors.cityId && <span className="field-error-text">{errors.cityId}</span>}
                        </div>

                        <div className="form-group">
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
                                        {loadingAreas ? "Loading Areas..." : "Select Area *"}
                                    </option>
                                    {areas.map(area => (
                                        <option key={area.id} value={area.name}>{area.name}</option>
                                    ))}
                                </select>
                                <span className="select-arrow">
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                                        <path d="M1 1.5L6 6.5L11 1.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                            </div>
                            {errors.area && <span className="field-error-text">{errors.area}</span>}
                        </div>
                    </div>

                    {/* Address */}
                    <div className="form-row">
                        <div className="form-group full-width">
                            <input
                                type="text"
                                name="address"
                                placeholder="Address (House No, Road No...) *"
                                value={formData.address}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className={`form-input ${errors.address ? 'input-error' : ''}`}
                            />
                            {errors.address && <span className="field-error-text">{errors.address}</span>}
                        </div>
                    </div>

                    {/* Order Note */}
                    <div className="form-row">
                        <div className="form-group full-width">
                            <textarea
                                name="note"
                                placeholder="Order Note (optional)"
                                value={formData.note}
                                onChange={handleInputChange}
                                className="form-input textarea"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE SUMMARY */}
                <div className="checkout-right">
                    <div className="coupon-link">Have Coupon / Voucher?</div>

                    <div className="summary-section">
                        <h3>Choose Shipping Method</h3>
                        <label className={`radio-option ${shippingMethod === 'outside' ? 'selected' : ''} ${isCitySelected && isDhaka ? 'disabled-option' : ''}`}>
                            <div className="radio-label">
                                <input
                                    type="radio"
                                    name="shipping"
                                    checked={shippingMethod === 'outside'}
                                    onChange={() => setShippingMethod('outside')}
                                    disabled={isCitySelected && isDhaka}
                                />
                                <span>Delivery Outside Dhaka</span>
                            </div>
                            <span className="price">৳ 120.00</span>
                        </label>

                        <label className={`radio-option ${shippingMethod === 'inside' ? 'selected' : ''} ${isCitySelected && !isDhaka ? 'disabled-option' : ''}`}>
                            <div className="radio-label">
                                <input
                                    type="radio"
                                    name="shipping"
                                    checked={shippingMethod === 'inside'}
                                    onChange={() => setShippingMethod('inside')}
                                    disabled={isCitySelected && !isDhaka}
                                />
                                <span>Delivery Inside Dhaka</span>
                            </div>
                            <span className="price">৳ 60.00</span>
                        </label>
                    </div>

                    <div className="price-breakdown">
                        <div className="price-row">
                            <span>Total MRP</span>
                            <span>৳ {cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="price-row total-row">
                            <span>Total Amount</span>
                            <span className="grand-total">৳ {grandTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="summary-section">
                        <h3>Choose Payment Method</h3>
                        <label className="radio-option simple">
                            <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'COD'}
                                onChange={() => setPaymentMethod('COD')}
                            />
                            <span>Cash on delivery</span>
                        </label>
                        <label className="radio-option simple">
                            <input
                                type="radio"
                                name="payment"
                                checked={paymentMethod === 'Bkash'}
                                onChange={() => setPaymentMethod('Bkash')}
                            />
                            <span>Bkash (Coming Soon)</span>
                        </label>
                    </div>

                    <button className="place-order-btn" onClick={handlePlaceOrder} disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'PLACE ORDER'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;