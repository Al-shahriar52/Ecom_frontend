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
        name: user?.name || '',
        phone: '',
        city: '',
        cityId: '',
        area: '',
        address: '',
        email: user?.email || '',
        note: ''
    });

    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loadingAreas, setLoadingAreas] = useState(false);

    // Shipping State
    const [shippingMethod, setShippingMethod] = useState('inside');

    // Updated Costs: 60 for Inside, 120 for Outside
    const shippingCost = shippingMethod === 'inside' ? 60 : 120;

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const grandTotal = cartTotal + shippingCost;

    // --- FETCH CITIES ---
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

        setFormData(prev => ({
            ...prev,
            city: cityName,
            cityId: selectedCityId,
            area: ''
        }));

        // --- AUTO SELECT SHIPPING LOGIC ---
        if (cityName.toLowerCase() === 'dhaka') {
            setShippingMethod('inside');
        } else {
            setShippingMethod('outside');
        }

        // Fetch Areas
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

    const handlePlaceOrder = async () => {
        if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.area) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const orderPayload = {
            shippingAddress: formData.address,
            city: formData.city,
            area: formData.area,
            phone: formData.phone,
            email: formData.email,
            orderNote: formData.note,
            shippingMethod: shippingMethod === 'inside' ? "Inside Dhaka" : "Outside Dhaka",
            shippingCost: shippingCost,
            paymentMethod: paymentMethod,
            items: cart.map(item => ({
                productId: item.productId || item.id,
                quantity: item.quantity
            }))
        };

        try {
            const response = await axiosInstance.post('/api/v1/orders/place', orderPayload);
            if(response.status === 200 || response.data.status === 200) {
                toast.success("Order placed successfully!");
                fetchCart(true);
                navigate('/dashboard/orders');
            }
        } catch (error) {
            console.error("Order failed:", error);
            toast.error(error.response?.data?.message || "Failed to place order.");
        }
    };

    if (cart.length === 0) {
        return <div className="checkout-empty">Your cart is empty. <button onClick={() => navigate('/')}>Shop Now</button></div>;
    }

    // --- HELPER TO CHECK CITY ---
    const isCitySelected = formData.city !== '';
    const isDhaka = formData.city.toLowerCase() === 'dhaka';

    return (
        <div className="checkout-container">
            <div className="checkout-wrapper">
                {/* LEFT SIDE */}
                <div className="checkout-left">
                    <h2 className="section-title">BILLING & SHIPPING</h2>
                    <div className="form-row">
                        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} className="form-input" />
                        <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleInputChange} className="form-input" />
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
                        <input type="email" name="email" placeholder="Email (optional)" value={formData.email} onChange={handleInputChange} className="form-input full-width" />
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

                        {/* OUTSIDE DHAKA OPTION */}
                        <label
                            className={`radio-option 
                                ${shippingMethod === 'outside' ? 'selected' : ''} 
                                ${isCitySelected && isDhaka ? 'disabled-option' : ''}` // Disable if Dhaka is selected
                            }
                        >
                            <div className="radio-label">
                                <input
                                    type="radio" name="shipping"
                                    checked={shippingMethod === 'outside'}
                                    onChange={() => setShippingMethod('outside')}
                                    disabled={isCitySelected && isDhaka} // Lock it
                                />
                                <span>Delivery Outside Dhaka</span>
                            </div>
                            <span className="price">৳ 120.00</span>
                        </label>

                        {/* INSIDE DHAKA OPTION */}
                        <label
                            className={`radio-option 
                                ${shippingMethod === 'inside' ? 'selected' : ''} 
                                ${isCitySelected && !isDhaka ? 'disabled-option' : ''}` // Disable if Non-Dhaka is selected
                            }
                        >
                            <div className="radio-label">
                                <input
                                    type="radio" name="shipping"
                                    checked={shippingMethod === 'inside'}
                                    onChange={() => setShippingMethod('inside')}
                                    disabled={isCitySelected && !isDhaka} // Lock it
                                />
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

                    <button className="place-order-btn" onClick={handlePlaceOrder}>PLACE ORDER</button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;