
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import './Dashboard.css';

// Renders a single saved address card
const AddressCard = ({ address, onEdit }) => {
    // Force the text to uppercase
    const displayType = address.addressType ? address.addressType.toUpperCase() : '';

    return (
        <article className="address-card">
            <header className="address-card-header">
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: '600' }}>
                    {displayType}
                    {address.isDefault && (
                        <span style={{ fontSize: '11px', marginLeft: '10px', color: '#4ade80', fontWeight: '600', textTransform: 'none' }}>
                            (Default)
                        </span>
                    )}
                </h3>
                <button className="edit-link" onClick={() => onEdit(address)}>Edit</button>
            </header>
            <div className="address-card-body">
                <p>{address.address}</p>
                <p>{address.area}</p>
                <p>{address.city}</p>
            </div>
        </article>
    );
};

// Renders the form for adding or editing an address
const AddressForm = ({ onSave, onCancel, initialData }) => {
    // State for user-typed form fields
    const [addressType, setAddressType] = useState('HOME');
    const [address, setAddress] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    // State to hold data fetched from the API
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);

    // State to hold the ID of the selected city and name of the selected area
    const [selectedCityId, setSelectedCityId] = useState('');
    const [selectedArea, setSelectedArea] = useState('');

    // Pre-fills the form when in "edit" mode
    useEffect(() => {
        if (initialData) {
            setAddressType(initialData.addressType || 'HOME');
            setAddress(initialData.address || '');
            setIsDefault(initialData.isDefault || false);
            // Note: For simplicity, we don't auto-select the dropdowns in edit mode here.
            setSelectedCityId('');
            setSelectedArea('');
        } else {
            setAddressType('HOME');
            setAddress('');
            setIsDefault(false);
            setSelectedCityId('');
            setSelectedArea('');
        }
    }, [initialData]);

    // Fetch all cities when the form first loads
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/location/cities');
                setCities(response.data?.data || []);
            } catch (error) {
                toast.error("Could not load cities.");
            }
        };
        fetchCities();
    }, []);

    // Fetch areas whenever the selected city changes
    useEffect(() => {
        if (selectedCityId) {
            setAreas([]);
            setSelectedArea('');
            const fetchAreas = async () => {
                try {
                    const response = await axiosInstance.get(`/api/v1/location/areas?city_id=${selectedCityId}`);
                    setAreas(response.data?.data || []);
                } catch (error) {
                    toast.error("Could not load areas for the selected city.");
                }
            };
            fetchAreas();
        } else {
            setAreas([]);
        }
    }, [selectedCityId]);

    const handleSave = (e) => {
        e.preventDefault();
        const cityName = cities.find(c => c.id === parseInt(selectedCityId))?.name;

        const formData = {
            addressType: addressType,
            city: cityName,
            area: selectedArea,
            address: address,
            isDefault: isDefault,
            is_default: isDefault
        };
        onSave(formData);
    };

    return (
        <form className="address-form" onSubmit={handleSave}>
            <div className="form-group">
                <select value={addressType} onChange={e => setAddressType(e.target.value)} required className="form-input">
                    <option value="HOME">Home</option>
                    <option value="WORK">Work</option>
                    <option value="BILLING">Billing</option>
                    <option value="OTHER">Other</option>
                </select>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <select value={selectedCityId} onChange={(e) => setSelectedCityId(e.target.value)} required>
                        <option value="" disabled>Select City</option>
                        {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <select value={selectedArea} onChange={e => setSelectedArea(e.target.value)} required disabled={!selectedCityId}>
                        <option value="" disabled>Select Area</option>
                        {areas.map(area => <option key={area.id} value={area.name}>{area.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="form-group">
                <textarea placeholder="Address" rows="3" value={address} onChange={e => setAddress(e.target.value)} required></textarea>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={e => setIsDefault(e.target.checked)}
                    style={{ width: 'auto' }}
                />
                <label htmlFor="isDefault" style={{ margin: 0, cursor: 'pointer' }}>Set as default address</label>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-close" onClick={onCancel}>Close</button>
                <button type="submit" className="btn-save">{initialData ? 'Save Changes' : 'Save Address'}</button>
            </div>
        </form>
    );
};

const Address = () => {
    const [addresses, setAddresses] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingAddress, setEditingAddress] = useState(null);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get('/api/v1/address/all');
            setAddresses(response.data?.data || []);
        } catch (error) {
            toast.error("Could not fetch addresses.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNewClick = () => {
        setEditingAddress(null);
        setIsFormVisible(true);
    };

    const handleEditClick = (address) => {
        setEditingAddress(address);
        setIsFormVisible(true);
    };

    const handleSaveAddress = (formData) => {
        if (editingAddress) {
            const updateData = { ...formData, id: editingAddress.id };
            handleUpdateAddress(updateData);
        } else {
            handleAddAddress(formData);
        }
    };

    const handleAddAddress = async (newAddressData) => {
        try {
            const response = await axiosInstance.post('/api/v1/address/add', newAddressData);
            toast.success(response.data.message);

            // If the user set this as default, we should probably refetch to sync backend rules
            // (e.g., if backend removed 'default' from other addresses).
            fetchAddresses();
            setIsFormVisible(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add address.");
        }
    };

    const handleUpdateAddress = async (updatedAddressData) => {
        try {
            const response = await axiosInstance.put('/api/v1/address/update', updatedAddressData);
            toast.success(response.data.message);
            fetchAddresses(); // Refetch to ensure default states are synced
            setIsFormVisible(false);
            setEditingAddress(null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update address.");
        }
    };

    const renderContent = () => {
        if (isLoading) return <div style={{textAlign: 'center', padding: '40px'}}>Loading addresses...</div>;
        if (isFormVisible) {
            return <AddressForm
                onSave={handleSaveAddress}
                onCancel={() => setIsFormVisible(false)}
                initialData={editingAddress}
            />;
        }
        if (addresses.length === 0) {
            return <div className="no-address-message"><p>No Address Set. Click Add Address button to set address.</p></div>;
        }
        return (
            <div className="address-list">
                {addresses.map(addr => <AddressCard key={addr.id} address={addr} onEdit={handleEditClick} />)}
            </div>
        );
    };

    return (
        <div className="address-page">
            <header className="address-page-header">
                <h2>Addresses</h2>
                {!isFormVisible && <button className="add-address-btn" onClick={handleAddNewClick}>+ Add Address</button>}
            </header>
            {renderContent()}
        </div>
    );
};

export default Address;
