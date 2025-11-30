import React, { useState } from 'react';
import './Tabs.css';

const Tabs = ({ children }) => {
    // Set the first tab as the default active tab
    const [activeTab, setActiveTab] = useState(children[0].props.label);

    const handleClick = (e, newActiveTab) => {
        e.preventDefault();
        setActiveTab(newActiveTab);
    };

    return (
        <div className="tabs-container">
            <ul className="tab-list">
                {children.map((child) => (
                    <li
                        key={child.props.label}
                        className={activeTab === child.props.label ? 'tab active' : 'tab'}
                        onClick={(e) => handleClick(e, child.props.label)}
                    >
                        {child.props.label}
                    </li>
                ))}
            </ul>
            <div className="tab-content">
                {children.map((child) => {
                    if (child.props.label === activeTab) {
                        return <div key={child.props.label}>{child.props.children}</div>;
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

// This is a helper component that just holds the content for a tab
const Tab = ({ label, children }) => {
    return (
        <div label={label} style={{ display: 'none' }}>
            {children}
        </div>
    );
};

export { Tabs, Tab };