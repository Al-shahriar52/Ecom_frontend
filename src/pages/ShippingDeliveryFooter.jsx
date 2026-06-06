import React, { useState } from 'react';
import './ShippingDeliveryFooter.css';

const Shipping = () => {
    const [language, setLanguage] = useState('en'); // 'en' for English, 'bn' for Bengali

    return (
        <div className="shipping-page">
            <div className="shipping-header">
                <h2>{language === 'en' ? 'Shipping & Delivery' : 'শিপিং এবং ডেলিভারি'}</h2>
                <div className="language-toggle">
                    <button
                        className={language === 'en' ? 'active' : ''}
                        onClick={() => setLanguage('en')}
                    >
                        English
                    </button>
                    <button
                        className={language === 'bn' ? 'active' : ''}
                        onClick={() => setLanguage('bn')}
                    >
                        বাংলা
                    </button>
                </div>
            </div>

            <div className="shipping-content">
                {/* Section 1: Delivery Process */}
                <div className="policy-section">
                    <h3>{language === 'en' ? 'How does the delivery process work?' : 'ডেলিভারি প্রসেসটি কীভাবে সম্পন্ন হয়ে থাকে?'}</h3>
                    {language === 'en' ? (
                        <ul>
                            <li>Once our system processes your order, your products are inspected thoroughly to ensure they are in a perfect condition.</li>
                            <li>After they pass through the final round of quality check, they are packed and handed over to our trusted delivery partner.</li>
                            <li>Our delivery partners then bring the package to you at the earliest possibility. In case they are unable to reach your provided address or at a suitable time, they will contact you to resolve the issue.</li>
                            <li>We maintain a <strong>‘closed box delivery’</strong> policy. This is crucial to ensure the authenticity of the products, privacy of the customers, and to prevent product adulteration or modification.</li>
                        </ul>
                    ) : (
                        <ul>
                            <li>আপনাদের অর্ডারটি প্রসেস করার সময় প্রতিটি প্রোডাক্ট অত্যন্ত নিখুঁতভাবে পর্যবেক্ষণ করা হয়।</li>
                            <li>শেষ ধাপের কোয়ালিটি চেকের পর প্রোডাক্টগুলো প্যাক করে আমাদের ডেলিভারি পার্টনারের কাছে হস্তান্তর করা হয়।</li>
                            <li>এরপর ডেলিভারি টিম যত দ্রুত সম্ভব প্রোডাক্টগুলো আপনাদের কাছে পৌঁছে দেয়। যদি তারা আপনাদের সাথে যোগাযোগ করতে না পারে কিংবা আপনার দেয়া ঠিকানায় পৌঁছাতে না পারে, এক্ষেত্রে যত দ্রুত সম্ভব ইস্যুটি সমাধানে ডেলিভারি টিম আপনাদের সাথে যোগাযোগ করবে।</li>
                            <li>আমরা <strong>‘ক্লোজড বক্স ডেলিভারি’</strong> পলিসি অনুসরণ করে থাকি। প্রোডাক্টের অথেন্টিসিটি, কাস্টমারের গোপনীয়তা বজায় রাখা এবং প্রোডাক্টের ভেজাল অথবা কোনো ধরণের পরিবর্তন রোধ নিশ্চিত করার জন্য এটি অত্যন্ত গুরুত্বপূর্ণ।</li>
                        </ul>
                    )}
                </div>

                {/* Section 2: Packaging */}
                <div className="policy-section">
                    <h3>{language === 'en' ? 'How are items packaged?' : 'প্রোডাক্টগুলো কীভাবে প্যাকেজিং করা হয়?'}</h3>
                    <p>
                        {language === 'en'
                            ? 'We package our products in cardboard boxes with your invoice wrapped along with it. Each individual product is carefully packaged while fragile items like bottles are safely secured with bubble wrap.'
                            : 'আমরা আপনাদের ইনভয়েস সহ প্রোডাক্টগুলো কার্ডবোর্ডের বক্সে র‍্যাপিং করে থাকি। প্রতিটি প্রোডাক্ট পৃথক পৃথক ভাবে সাবধানতার সাথে প্যাকেজিং করা হয়ে থাকে। বোতল কিংবা ভেঙে যাবার আশংকা যুক্ত প্রোডাক্টগুলোকে বাবল র‍্যাপ দিয়ে প্যাকেজিং করা হয়ে থাকে।'}
                    </p>
                </div>

                {/* Section 3: Delivery Rates & Times */}
                <div className="rates-container">
                    <div className="rate-box">
                        <h3>{language === 'en' ? 'Delivery Charges' : 'ডেলিভারি চার্জ কত?'}</h3>
                        <p><strong>{language === 'en' ? 'Inside Dhaka:' : 'ঢাকার ভেতরে:'}</strong> {language === 'en' ? '79 BDT' : '৭৯ টাকা'}</p>
                        <p><strong>{language === 'en' ? 'Outside Dhaka:' : 'ঢাকার বাইরে:'}</strong> {language === 'en' ? '119 BDT' : '১১৯ টাকা'}</p>
                    </div>

                    <div className="rate-box">
                        <h3>{language === 'en' ? 'Estimated Delivery Time' : 'কত দিনের মধ্যে ডেলিভারি দেয়া হয়?'}</h3>
                        <p><strong>{language === 'en' ? 'Inside Dhaka:' : 'ঢাকার মধ্যে:'}</strong> {language === 'en' ? '1 - 2 days' : '১ – ২ দিন'}</p>
                        <p><strong>{language === 'en' ? 'Outside Dhaka:' : 'ঢাকার বাইরে:'}</strong> {language === 'en' ? '3 - 5 days' : '৩ – ৫ দিন'}</p>
                    </div>
                </div>

                {/* Section 4: Disclaimer */}
                <div className="disclaimer-section">
                    <p>
                        {language === 'en'
                            ? '* However, the delivery might be delayed based on political, environmental, transportation or any other unavoidable issues which will be notified by our customer relationship team.'
                            : '* প্রাকৃতিক কোনো দুর্যোগ, রাজনৈতিক পরিস্থিতি, যানবাহন জনিত কিংবা কোনো গোলযোগের কারণে ডেলিভারি দিতে দেরী হলে, সেক্ষেত্রে কাস্টমার রিলেশন টিম আপনাদের সে সম্পর্কে অবহিত করবে।'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Shipping;