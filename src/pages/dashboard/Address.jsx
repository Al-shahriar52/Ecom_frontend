
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import './Dashboard.css';

// Renders a single saved address card
const AddressCard = ({ address, onEdit }) => {
    return (
        <article className="address-card">
            <header className="address-card-header">
                <h3>{address.addressType}</h3>
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
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');

    // State to hold data fetched from the API
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);

    // State to hold the ID of the selected city and name of the selected area
    const [selectedCityId, setSelectedCityId] = useState('');
    const [selectedArea, setSelectedArea] = useState('');

    // Pre-fills the form when in "edit" mode
    useEffect(() => {
        if (initialData) {
            setName(initialData.addressType || '');
            setAddress(initialData.address || '');
            // Note: For simplicity, we don't auto-select the dropdowns in edit mode.
            // A more advanced version would find the matching city/area IDs.
            setSelectedCityId('');
            setSelectedArea('');
        } else {
            // Clear form when switching from edit to add mode
            setName('');
            setAddress('');
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
            setAreas([]); // Clear previous areas
            setSelectedArea(''); // Reset selected area
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
            setAreas([]); // Clear areas if no city is selected
        }
    }, [selectedCityId]);

    const handleSave = (e) => {
        e.preventDefault();
        // Find the full name of the city from the selected ID
        const cityName = cities.find(c => c.id === parseInt(selectedCityId))?.name;

        const formData = {
            addressType: name,
            city: cityName,
            area: selectedArea,
            address
        };
        onSave(formData);
    };

    return (
        <form className="address-form" onSubmit={handleSave}>
            <div className="form-group">
                <input type="text" placeholder="Name: e.g., Home, Office" value={name} onChange={e => setName(e.target.value)} required />
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
            <div className="form-actions">
                <button type="button" className="btn-close" onClick={onCancel}>Close</button>
                <button type="submit" className="btn-save">{initialData ? 'Save Changes' : 'Save Address'}</button>
            </div>
        </form>
    );
};

// Main Address Page Component with full Add/Edit/Fetch logic
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
            setAddresses(prevAddresses => [...prevAddresses, response.data.data]);
            setIsFormVisible(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add address.");
        }
    };

    const handleUpdateAddress = async (updatedAddressData) => {
        try {
            const response = await axiosInstance.put('/api/v1/address/update', updatedAddressData);
            toast.success(response.data.message);

            const updatedAddressFromServer = { ...response.data.data, id: updatedAddressData.id };

            setAddresses(prevAddresses =>
                prevAddresses.map(addr =>
                    addr.id === updatedAddressData.id ? updatedAddressFromServer : addr
                )
            );

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