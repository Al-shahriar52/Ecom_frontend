import React, { useState } from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
    const [language, setLanguage] = useState('en');

    return (
        <div className="privacy-page">
            <div className="privacy-header">
                <h2>{language === 'en' ? 'Privacy Policy' : 'প্রাইভেসি পলিসি'}</h2>
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

            <div className="privacy-content">
                {/* Introduction */}
                <div className="policy-section intro-section">
                    <h3>{language === 'en' ? 'Privacy and Confidentiality' : 'গোপনীয়তা এবং বিশ্বস্ততা'}</h3>
                    <p>
                        {language === 'en'
                            ? 'Welcome to the beautyhaat.com website (the “Site”) operated by Beautyhaat LTD. We respect your privacy and want to protect your personal information. To learn more, please read this Privacy Policy.'
                            : 'বিউটিহাট লিমিটেড পরিচালিত beautyhaat.com ওয়েবসাইটে আপনাকে স্বাগতম। আমরা আপনার গোপনীয়তার প্রতি শ্রদ্ধাশীল এবং আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে বদ্ধপরিকর। বিস্তারিত জানতে অনুগ্রহ করে আমাদের প্রাইভেসি পলিসিটি পড়ুন।'}
                    </p>
                    <p>
                        {language === 'en'
                            ? 'This Privacy Policy explains how we collect, use and (under certain conditions) disclose your personal information. Data protection is a matter of trust and your privacy is important to us. We shall therefore only use your name and other information which relates to you in the manner set out in this Privacy Policy. You can visit the Site and browse without having to provide personal details. During your visit you remain anonymous unless you have an account on the Site and log on.'
                            : 'এই প্রাইভেসি পলিসি ব্যাখ্যা করে কীভাবে আমরা আপনার ব্যক্তিগত তথ্য সংগ্রহ করি, ব্যবহার করি এবং (বিশেষ ক্ষেত্রে) প্রকাশ করি। ডেটা সুরক্ষা বিশ্বাসের একটি বিষয় এবং আপনার গোপনীয়তা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ। তাই আমরা আপনার নাম এবং অন্যান্য তথ্য শুধুমাত্র এই নীতিমালায় উল্লেখিত উপায়ে ব্যবহার করব। আপনি ব্যক্তিগত বিবরণ প্রদান না করেও সাইটটি ভিজিট করতে পারেন। সাইটে লগ ইন না করা পর্যন্ত আপনি সম্পূর্ণ বেনামী থাকবেন।'}
                    </p>
                </div>

                {/* 1. Data that we collect */}
                <div className="policy-section">
                    <h3>{language === 'en' ? '1. Data that we collect' : '১. আমরা যে ডেটা সংগ্রহ করি'}</h3>
                    <p>
                        {language === 'en'
                            ? 'We may collect various pieces of information if you seek to place an order for a product with us on the Site or App. We also collect few information when you chat with us on Facebook through Chrome Extension. We collect, store and process your data for processing your purchase and to provide you with our services. We may collect personal information including, but not limited to, your title, name, gender, date of birth, email address, postal address, delivery address, telephone number, mobile number, and payment details.'
                            : 'আপনি যখন আমাদের সাইট বা অ্যাপে কোনো পণ্য অর্ডার করেন, তখন আমরা বিভিন্ন তথ্য সংগ্রহ করতে পারি। ক্রোম এক্সটেনশনের মাধ্যমে আমাদের সাথে ফেসবুকে চ্যাট করার সময়ও আমরা কিছু তথ্য সংগ্রহ করি। আপনার কেনাকাটা প্রক্রিয়া সম্পন্ন করতে এবং আপনাকে সেবা প্রদানের জন্য আমরা আপনার ডেটা সংগ্রহ ও সংরক্ষণ করি। আমরা আপনার নাম, লিঙ্গ, জন্ম তারিখ, ইমেইল, পোস্টাল ঠিকানা, ডেলিভারি ঠিকানা, মোবাইল নম্বর এবং পেমেন্টের বিবরণ সংগ্রহ করতে পারি।'}
                    </p>
                    <p>
                        {language === 'en'
                            ? 'We will use the information you provide to enable us to process your orders, administer your account, verify financial transactions, improve our website, and send you marketing information (which you can opt out of at any time). We may pass your name and address on to a third party in order to make delivery of the product to you (for example to our courier or supplier).'
                            : 'আপনার প্রদত্ত তথ্য ব্যবহার করে আমরা আপনার অর্ডার প্রসেস করি, অ্যাকাউন্ট পরিচালনা করি, আর্থিক লেনদেন যাচাই করি, ওয়েবসাইটের উন্নতি করি এবং মার্কেটিং তথ্য পাঠাই (আপনি চাইলে যেকোনো সময় এটি বন্ধ করতে পারেন)। পণ্য ডেলিভারি করার জন্য আমরা তৃতীয় পক্ষের (যেমন আমাদের কুরিয়ার বা সরবরাহকারী) কাছে আপনার নাম এবং ঠিকানা শেয়ার করতে পারি।'}
                    </p>
                </div>

                {/* Third Parties and Links */}
                <div className="policy-section">
                    <h3>{language === 'en' ? 'Third Parties and Links' : 'থার্ড পার্টি এবং লিংকসমূহ'}</h3>
                    <p>
                        {language === 'en'
                            ? 'We may pass your details to our agents and subcontractors to help us with any of our uses of your data set out in our Privacy Policy. For example, to assist us with delivering products, collecting payments, or analyzing data. We shall NOT sell or disclose your personal data to third parties without obtaining your prior consent unless required by law. The Site may contain advertising of third parties and links to other sites. We are not responsible for the privacy practices of those third parties.'
                            : 'আমাদের প্রাইভেসি পলিসিতে উল্লেখিত কাজে সহায়তার জন্য আমরা আমাদের এজেন্ট এবং সাবকন্ট্রাক্টরদের কাছে আপনার বিবরণ দিতে পারি। উদাহরণস্বরূপ, পণ্য ডেলিভারি, পেমেন্ট সংগ্রহ বা ডেটা বিশ্লেষণে সহায়তার জন্য। আইনের বাধ্যবাধকতা ছাড়া আপনার পূর্বানুমতি ব্যতিরেকে আমরা তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত ডেটা বিক্রি বা প্রকাশ করব না। আমাদের সাইটে তৃতীয় পক্ষের বিজ্ঞাপন বা লিংক থাকতে পারে, যার প্রাইভেসি পলিসির দায়ভার আমাদের নয়।'}
                    </p>
                </div>

                {/* 2. Cookies */}
                <div className="policy-section">
                    <h3>{language === 'en' ? '2. Cookies' : '২. কুকিজ (Cookies)'}</h3>
                    <p>
                        {language === 'en'
                            ? 'The acceptance of cookies is not a requirement for visiting the Site. However, the use of the ‘basket’ functionality and ordering is only possible with the activation of cookies. Cookies are tiny text files which identify your computer to our server as a unique user. We only use cookies for your convenience in using the Site and not for obtaining any other information about you. This website uses Google Analytics, a web analytics service provided by Google, Inc.'
                            : 'সাইটটি ভিজিট করার জন্য কুকিজ গ্রহণ করা বাধ্যতামূলক নয়। তবে ‘বাস্কেট’ বা কার্ট ব্যবহার এবং অর্ডার করার জন্য কুকিজ চালু রাখা প্রয়োজন। কুকিজ হলো ছোট টেক্সট ফাইল যা আমাদের সার্ভারে আপনার কম্পিউটারকে একটি স্বতন্ত্র ব্যবহারকারী হিসেবে চিহ্নিত করে। আমরা শুধুমাত্র সাইট ব্যবহারের সুবিধার জন্য কুকিজ ব্যবহার করি, অন্য কোনো ব্যক্তিগত তথ্য নেওয়ার জন্য নয়। এই ওয়েবসাইটটি গুগলের ওয়েব অ্যানালিটিক্স সার্ভিস (Google Analytics) ব্যবহার করে।'}
                    </p>
                    <p>
                        {language === 'en'
                            ? 'Beautyhaat also uses Facebook as a third party platform to track its e-commerce website events to measure the performance of its Facebook ad campaigns. When you login to our app with the "Login with Facebook" button, we collect your Facebook id number and email to create an account. We don’t collect any more data except these.'
                            : 'ফেসবুক অ্যাড ক্যাম্পেইনের পারফরম্যান্স পরিমাপের জন্য বিউটিহাট ই-কমার্স ইভেন্ট ট্র্যাক করতে ফেসবুককে থার্ড পার্টি প্ল্যাটফর্ম হিসেবে ব্যবহার করে। আপনি যখন "Login with Facebook" বাটনের মাধ্যমে আমাদের অ্যাপে লগইন করেন, তখন অ্যাকাউন্ট তৈরি করার জন্য আমরা আপনার ফেসবুক আইডি নম্বর এবং ইমেইল সংগ্রহ করি। এর বাইরে আমরা আর কোনো তথ্য সংগ্রহ করি না।'}
                    </p>
                </div>

                {/* 3. Security */}
                <div className="policy-section">
                    <h3>{language === 'en' ? '3. Security' : '৩. নিরাপত্তা'}</h3>
                    <p>
                        {language === 'en'
                            ? 'We have in place appropriate technical and security measures to prevent unauthorized or unlawful access to or accidental loss of or destruction or damage to your information. When we collect data through the Site, we collect your personal details on a secure server protected by firewalls. You are responsible for protecting against unauthorized access to your password and to your computer.'
                            : 'আপনার তথ্যের অননুমোদিত প্রবেশ, হারানো বা ধ্বংস রোধ করতে আমরা যথাযথ প্রযুক্তিগত এবং নিরাপত্তা ব্যবস্থা গ্রহণ করেছি। সাইটের মাধ্যমে সংগৃহীত আপনার ব্যক্তিগত বিবরণ আমরা ফায়ারওয়াল দ্বারা সুরক্ষিত সার্ভারে সংরক্ষণ করি। আপনার পাসওয়ার্ড এবং কম্পিউটারে অননুমোদিত প্রবেশ রোধ করার দায়িত্ব আপনার নিজের।'}
                    </p>
                </div>

                {/* 4. Your rights & 5. Data Deletion */}
                <div className="policy-section">
                    <h3>{language === 'en' ? '4. Your Rights & Data Deletion' : '৪. আপনার অধিকার এবং ডেটা মুছে ফেলা'}</h3>
                    <p>
                        {language === 'en'
                            ? 'If you are concerned about your data, you have the right to request access to the personal data which we may hold. You have the right to require us to correct any inaccuracies free of charge. You may review, update, correct or delete the personal information in your profile at any time.'
                            : 'আপনার ডেটা সম্পর্কে কোনো উদ্বেগ থাকলে আমাদের কাছে থাকা আপনার ব্যক্তিগত ডেটা দেখার অনুরোধ করার অধিকার আপনার আছে। যেকোনো ভুল তথ্য বিনামূল্যে সংশোধন করার অধিকারও আপনার রয়েছে। আপনি চাইলে যেকোনো সময় আপনার প্রোফাইলের তথ্য পর্যালোচনা, আপডেট, সংশোধন বা মুছে ফেলতে পারেন।'}
                    </p>
                    <div className="contact-highlight">
                        <p>
                            {language === 'en'
                                ? 'If you would like us to remove your information or “facebook login” from our records, or if you have any questions, please send us an email at:'
                                : 'আপনি যদি আমাদের রেকর্ড থেকে আপনার তথ্য বা “ফেসবুক লগইন” মুছে ফেলতে চান, বা আপনার কোনো প্রশ্ন থাকে, তবে অনুগ্রহ করে ইমেইল করুন:'}
                        </p>
                        <a href="mailto:notification@beautyhaat.com" className="email-link">notification@beautyhaat.com</a>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PrivacyPolicy;