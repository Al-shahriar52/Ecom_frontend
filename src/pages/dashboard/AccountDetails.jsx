
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import './Dashboard.css';

const AccountDetails = () => {
    const [formData, setFormData] = useState({});
    const [initialData, setInitialData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/user/get');
                if (response.data && response.data.data) {
                    setFormData(response.data.data);
                    setInitialData(response.data.data);
                }
            } catch (error) {
                toast.error("Could not fetch user details.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserDetails();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.put('/api/v1/user/update', formData);
            toast.success(response.data.message || "Details updated successfully!");
            setInitialData(formData);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update details.");
        }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    if (isLoading) {
        return <div>Loading account details...</div>;
    }

    return (
        <div className="account-details-page">
            <h2>Account Details</h2>
            <form className="account-details-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        disabled={!!initialData?.email} // Disable if email exists
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="gender">Gender</label>
                        <select id="gender" name="gender" value={formData.gender || ''} onChange={handleInputChange}>
                            <option value="" disabled>Select Gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHERS">Others</option>
                            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="dob">Year of Birth</label>
                        <select id="dob" name="dob" value={formData.dob || ''} onChange={handleInputChange}>
                            <option value="" disabled>Select Year</option>
                            {years.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-actions-details">
                    <button type="submit" className="btn-save">Save Changes</button>
                </div>
            </form>
        </div>
    );
};

export default AccountDetails;
