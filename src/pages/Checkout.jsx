
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import './Checkout.css';

const Checkout = () => {
    const { cart, cartTotal, fetchCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // --- STATE ---
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

    const [lockedField, setLockedField] = useState(null); // 'email' or 'phone'
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loadingAreas, setLoadingAreas] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Shipping & Payment State
    const [shippingMethod, setShippingMethod] = useState('inside');
    const shippingCost = shippingMethod === 'inside' ? 60 : 120;
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const grandTotal = cartTotal + shippingCost;

    // --- 1. INITIALIZE USER DATA (Fixing Name/Email/Phone logic) ---
    useEffect(() => {
        if (user) {
            // The auth identifier comes in 'user.name' or 'user.username' based on your Auth response.
            // Let's assume user.name holds the login identifier (Email or Phone) as per your issue.
            const loginIdentifier = user.name || user.username || "";

            // Regex to check if it's an email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isEmail = emailRegex.test(loginIdentifier);

            setFormData(prev => ({
                ...prev,
                // If login ID is Email, set Email. If Phone, set Phone.
                email: isEmail ? loginIdentifier : '',
                phone: !isEmail ? loginIdentifier : '',
                // If the user object actually has a separate real name field, use it, otherwise keep empty
                name: ''
            }));

            // Lock the field they used to login
            setLockedField(isEmail ? 'email' : 'phone');
        }
    }, [user]);

    // --- 2. FETCH CITIES ---
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/location/cities');
                setCities(response.data.data || []);
            } catch (error) {
                console.error("Error fetching cities:", error);
            }
        };
        fetchCities();
    }, []);

    // --- HANDLERS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCityChange = async (e) => {
        const selectedCityId = e.target.value;
        const selectedCityObj = cities.find(c => c.id === parseInt(selectedCityId));

        if (!selectedCityId) {
            setFormData({ ...formData, city: '', cityId: '', area: '' });
            setAreas([]);
            return;
        }

        const cityName = selectedCityObj.name;
        setFormData(prev => ({ ...prev, city: cityName, cityId: selectedCityId, area: '' }));

        if (cityName.toLowerCase() === 'dhaka') {
            setShippingMethod('inside');
        } else {
            setShippingMethod('outside');
        }

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

    // --- 3. FRONTEND VALIDATION (Matching Backend) ---
    const validateForm = () => {
        // Backend Regex for Phone: (^([+]{1}[8]{2}|0088)?(01){1}[3-9]{1}\d{8})$
        // Matches: 017..., +88017..., 0088017...
        const phoneRegex = /(^([+]{1}[8]{2}|0088)?(01){1}[3-9]{1}\d{8})$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.name.trim()) {
            toast.error("Full Name is required.");
            return false;
        }

        if (!formData.phone.trim()) {
            toast.error("Phone number is required.");
            return false;
        }
        if (!phoneRegex.test(formData.phone)) {
            toast.error("Invalid Phone Number format (e.g., 017xxxxxxxx).");
            return false;
        }

        if (!formData.email.trim()) {
            toast.error("Email is required.");
            return false;
        }
        if (!emailRegex.test(formData.email)) {
            toast.error("Invalid Email format.");
            return false;
        }

        if (!formData.address.trim()) {
            toast.error("Shipping Address is required.");
            return false;
        }

        if (!formData.city || !formData.area) {
            toast.error("City and Area are required.");
            return false;
        }

        return true;
    };

    // --- PLACE ORDER ---
    const handlePlaceOrder = async () => {
        // Run Validation
        if (!validateForm()) return;

        setIsProcessing(true);

        const orderPayload = {
            shippingAddress: formData.address,
            city: formData.city,
            area: formData.area,
            phone: formData.phone,
            email: formData.email,
            name: formData.name,
            orderNote: formData.note,
            paymentMethod: paymentMethod,
            items: cart.map(item => ({
                productId: item.productId || item.id,
                quantity: item.quantity
            }))
        };

        try {
            const response = await axiosInstance.post('/api/v1/order/placeOrder', orderPayload);

            if(response.status === 201 || response.status === 200 || response.data.status === 201) {
                const orderId = response.data.data;
                toast.success("Order placed successfully!");
                fetchCart(true);
                navigate(`/order-success/${orderId}`);
            }
        } catch (error) {
            console.error("Order failed:", error);
            // Show exact backend error message if available
            const errMsg = error.response?.data?.message || "Failed to place order.";
            toast.error(errMsg);
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return <div className="checkout-empty">Your cart is empty. <button onClick={() => navigate('/')}>Shop Now</button></div>;
    }

    const isCitySelected = formData.city !== '';
    const isDhaka = formData.city.toLowerCase() === 'dhaka';

    return (
        <div className="checkout-container">
            <div className="checkout-wrapper">
                {/* LEFT SIDE */}
                <div className="checkout-left">
                    <h2 className="section-title">BILLING & SHIPPING</h2>

                    {/* Name Field - Always Editable */}
                    <div className="form-row">
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>

                    {/* 2. Phone & Email (Removed form-group wrappers) */}
                    <div className="form-row">
                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone (01xxxxxxxxx)"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`form-input ${lockedField === 'phone' ? 'input-locked' : ''}`}
                            readOnly={lockedField === 'phone'}
                            title={lockedField === 'phone' ? "Logged in with Phone (Cannot edit)" : ""}
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`form-input ${lockedField === 'email' ? 'input-locked' : ''}`}
                            readOnly={lockedField === 'email'}
                            title={lockedField === 'email' ? "Logged in with Email (Cannot edit)" : ""}
                        />
                    </div>

                    <div className="form-row">
                        <select name="cityId" value={formData.cityId} onChange={handleCityChange} className="form-input">
                            <option value="">Select City</option>
                            {cities.map(city => (<option key={city.id} value={city.id}>{city.name}</option>))}
                        </select>
                        <select name="area" value={formData.area} onChange={handleInputChange} className="form-input" disabled={!formData.cityId}>
                            <option value="">{loadingAreas ? "Loading..." : "Select Area"}</option>
                            {areas.map(area => (<option key={area.id} value={area.name}>{area.name}</option>))}
                        </select>
                    </div>
                    <div className="form-row">
                        <input type="text" name="address" placeholder="Address (House No, Road No...)" value={formData.address} onChange={handleInputChange} className="form-input full-width" />
                    </div>
                    <div className="form-row">
                        <textarea name="note" placeholder="Order Note (optional)" value={formData.note} onChange={handleInputChange} className="form-input textarea"></textarea>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="checkout-right">
                    <div className="coupon-link">Have Coupon / Voucher?</div>

                    <div className="summary-section">
                        <h3>Choose Shipping Method</h3>
                        <label className={`radio-option ${shippingMethod === 'outside' ? 'selected' : ''} ${isCitySelected && isDhaka ? 'disabled-option' : ''}`}>
                            <div className="radio-label">
                                <input type="radio" name="shipping" checked={shippingMethod === 'outside'} onChange={() => setShippingMethod('outside')} disabled={isCitySelected && isDhaka} />
                                <span>Delivery Outside Dhaka</span>
                            </div>
                            <span className="price">৳ 120.00</span>
                        </label>

                        <label className={`radio-option ${shippingMethod === 'inside' ? 'selected' : ''} ${isCitySelected && !isDhaka ? 'disabled-option' : ''}`}>
                            <div className="radio-label">
                                <input type="radio" name="shipping" checked={shippingMethod === 'inside'} onChange={() => setShippingMethod('inside')} disabled={isCitySelected && !isDhaka} />
                                <span>Delivery Inside Dhaka</span>
                            </div>
                            <span className="price">৳ 60.00</span>
                        </label>
                    </div>

                    <div className="price-breakdown">
                        <div className="price-row"><span>Total MRP</span><span>৳ {cartTotal.toFixed(2)}</span></div>
                        <div className="price-row total-row"><span>Total Amount</span><span className="grand-total">৳ {grandTotal.toFixed(2)}</span></div>
                    </div>

                    <div className="summary-section">
                        <h3>Choose Payment Method</h3>
                        <label className="radio-option simple">
                            <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                            <span>Cash on delivery</span>
                        </label>
                        <label className="radio-option simple">
                            <input type="radio" name="payment" checked={paymentMethod === 'Bkash'} onChange={() => setPaymentMethod('Bkash')} />
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