import React, { useState } from 'react';
import './RefundPolicy.css';

const RefundPolicy = () => {
    const [language, setLanguage] = useState('en');

    return (
        <div className="refund-page">
            <div className="refund-header">
                <h2>{language === 'en' ? 'Return & Refund Policy' : 'রিটার্ন ও রিফান্ড পলিসি'}</h2>
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

            <div className="refund-content">
                {/* Introduction Section */}
                <div className="intro-section">
                    <p>
                        {language === 'en'
                            ? 'We guarantee your satisfaction with all the platforms of BeautyHaat Ltd. If you receive a damaged or defective item, or wrong product, we will promptly send you a replacement or issue you a full refund after you have returned the damaged or defective product. You will not be charged any additional shipping fees for replacement of such damaged or defective shipments. Please see our Cancellation & Return Policy for more information.'
                            : 'কাস্টমারদের সন্তুষ্টি ও ভরসাই বিউটিহাটের প্রথম প্রায়োরিটি। বিউটিহাট থেকে আপনি যদি ত্রুটিপূর্ণ বা ভুল পণ্য পেয়ে থাকেন, সেটা আমাদের কাছে পাঠানোর পর অবশ্যই আমরা রিপ্লেসমেন্ট বা ফুল রিফান্ডের ব্যবস্থা করে থাকি। আর এই ধরনের ত্রুটিযুক্ত পণ্যের রিপ্লেসমেন্টের জন্য আপনার অতিরিক্ত শিপিং চার্জ লাগবে না। বিস্তারিত জানতে রিটার্ন ও রিফান্ড পলিসি দেখে নিন।'}
                    </p>
                </div>

                {/* Policy Conditions Section */}
                <div className="policy-section">
                    <h3>{language === 'en' ? 'Refund & Return Policy Conditions' : 'রিফান্ড এবং রিটার্ন পলিসির শর্তাবলী'}</h3>
                    <p className="policy-subtext">
                        {language === 'en'
                            ? 'We maintain a ‘closed box delivery’ policy. Which is crucial to ensure the authenticity of the products, privacy of the customers and product adulteration or modification prevention. If you receive a damaged, defective or wrong product, please return it to Beautyhaat and we’ll arrange for a replacement provided that meets the following conditions:'
                            : 'আমরা ‘ক্লোজড বক্স ডেলিভারি’ পলিসি অনুসরণ করে থাকি। প্রোডাক্টের অথেন্টিসিটি, কাস্টমারের গোপনীয়তা বজায় রাখা এবং প্রোডাক্টের ভেজাল অথবা কোনো ধরণের পরিবর্তন রোধ নিশ্চিত করার জন্য যা অত্যন্ত গুরুত্বপূর্ণ। বিউটিহাট থেকে আপনি যদি ত্রুটিপূর্ণ অথবা ভুল কোনো প্রোডাক্ট পেয়ে থাকেন, অবশ্যই সেটা আপনি রিটার্ন করতে পারবেন। নিম্নলিখিত শর্তের ভিত্তিতে আমরা রিপ্লেসমেন্ট বা রিফান্ডের ব্যবস্থা করে থাকি:'}
                    </p>

                    {language === 'en' ? (
                        <ul>
                            <li>If any defect is found (damaged/ defective/ wrong product) after opening the box, inform the “Customer Relationship Management Department” (through inbox or hotline <strong>+8801805744174</strong>) as soon as possible along with a picture/video proof. This does not apply to products with pre-declared conditions.</li>
                            <li>The “Customer Relationship Management Department” upon consultation with the management will change/replace the product or adjust the payment. The complaint will be valid for <strong>3 days</strong> from the day the product has been received. For any electronics item, you will have <strong>15 days</strong> replacement guarantee from the product receiving date, for any defective/non-functional item. Otherwise, your complaint will not be accepted.</li>
                            <li>After the concerned product is received and inspected, if it is found to be free of defects, the same product will be sent back to you following the same delivery policy, and in that case, both the return and delivery charges must be borne by the customer.</li>
                            <li>Used/ Swatched or liquid/ Semi-liquid/ Clearance Sale product will not be considered for exchange or refund.</li>
                            <li>Products once purchased will not be exchanged or returned if buyer changes his/her purchase decision/mind, and/or does not like the smell, texture, color, design or/and the product.</li>
                            <li>The Return Policy will not be valid after the seal is broken or if the product does not suit you.</li>
                            <li>If you mistakenly order a wrong product, we may exchange it upon payment of returning and resending costs. However, arrangement of this special exchange depends on the product type and risk involved in the exchange process and also on Management discretion.</li>
                            <li>Original Invoice, Beautyhaat Box, Intact/Undamaged Product Packaging Box (where applicable) must be returned along with the product.</li>
                            <li>If the Customer Relationship Management team agrees to the exchange, the pre-steps of the product transfer process must be completed within 3 days from the agreed-upon time.</li>
                            <li>For Lingerie Items, please consult with our Female Consultants for sizes/measurements. However, if you purchase without consultation and face any sort of issue, please contact our hotline for support. Bottoms (panty) of the Lingerie line are absolutely non-exchangeable or non-returnable whether trialled or not.</li>
                        </ul>
                    ) : (
                        <ul>
                            <li>বক্সটি খোলার সাথে সাথে যদি আপনি প্রোডাক্টে কোনো ত্রুটি (ড্যামেজ, ডিফেক্টিভ বা ভুল পণ্য) দেখতে পান, প্রমাণসরূপ উপযুক্ত ছবি বা ভিডিও ধারন করে আমাদের কাস্টমার রিলেশনশীপ ম্যানেজমেন্ট ডিপার্টমেন্টে যোগাযোগ করুন। ফেইসবুক পেইজের ইনবক্স বা হটলাইন নম্বরে (<strong>+8801805744174</strong>) আপনি যোগাযোগ করতে পারেন। এটি পূর্বঘোষিত শর্তযুক্ত পণ্যের জন্য প্রযোজ্য নয়।</li>
                            <li>কাস্টমার রিলেশনশীপ ম্যানেজমেন্ট ডিপার্টমেন্ট আলোচনার ভিত্তিতে প্রোডাক্ট চেঞ্জ বা রিপ্লেসমেন্টের সিদ্ধান্ত নিবে অথবা পেমেন্ট অ্যাডজাস্ট করবে অথবা রিফান্ডের জন্য ব্যবস্থা নিবে। তবে অবশ্যই প্রোডাক্ট হাতে পাওয়ার <strong>৩ দিনের</strong> মধ্যেই আমাদের জানাতে হবে। ইলেক্ট্রনিক্স আইটেম হলে, পার্সেল পাওয়ার <strong>১৫ দিন</strong> পর্যন্ত রিপ্লেইসমেন্ট গ্যারান্টি থাকবে, শুধুমাত্র ত্রুটিপূর্ণ/অকার্যকর পণ্যের জন্য। অন্যথায় আপনার অভিযোগটি গ্রহণযোগ্য হবে না।</li>
                            <li>সংশ্লিষ্ট পণ্যটি ফেরত আনার পরে পরীক্ষা করে ত্রুটিমুক্ত পাওয়া গেলে সেই প্ৰডাক্টটি একই ডেলিভারি নীতিমালা অনুসরণ করে আবার আপনাকে ফেরত পাঠানো হবে এবং এক্ষেত্রে রিটার্ন ও ডেলিভারি চার্জ - উভয়ই কাস্টমারকে বহন করতে হবে।</li>
                            <li>সোয়াচ/ব্যবহার করা এবং লিকুইড/সেমি লিকুইড/ক্লিয়ারেন্স সেল এর প্রোডাক্টের ক্ষেত্রে এক্সচেঞ্জ বা রিফান্ডের সুযোগ নেই।</li>
                            <li>পণ্য ক্রয়ের পর মত পরিবর্তন অথবা স্মেল, টেক্সচার, কালার, ডীজাইন ও পণ্য পছন্দ হয়নি এক্ষেত্রে এক্সচেঞ্জ বা রিফান্ডের সুযোগ নেই।</li>
                            <li>আপনি যদি প্রোডাক্টের সিল খুলে ফেলেন বা প্রোডাক্টটি আপনাকে স্যুট না করার জন্য ফেরত দিতে চান, এক্ষেত্রে আপনার অভিযোগটি গ্রহণযোগ্য হবে না।</li>
                            <li>ভুলবশত কোনো পণ্য যদি অর্ডার দিয়ে থাকেন, তাহলে আপনি এক্সচেঞ্জের সুযোগ পাবেন। সেক্ষেত্রে আপনাকে ভুল পণ্যটি ফেরত পাঠানো এবং পুনরায় নতুন পণ্য পাঠানোর খরচটুকু বহন করতে হবে। তবে পণ্যটির ধরন, এক্সচেঞ্জ প্রসেসের জটিলতা ইত্যাদি বিষয়ে ম্যানেজমেন্ট বিবেচনা করে সিদ্ধান্ত জানাবে।</li>
                            <li>কোনো প্রোডাক্ট রিটার্ন করার সময় অরিজিনাল ইনভয়েস পেপার, বিউটিহাটের বক্স, ইন্ট্যাক্ট/অক্ষত প্রোডাক্ট প্যাকেজিংয়ের বক্স (যেখানে প্রযোজ্য) এগুলো সহ ফেরত দিতে হবে।</li>
                            <li>কাস্টমার রিলেশনশিপ ম্যানেজমেন্ট টিম এক্সচেঞ্জের বিষয়ে সম্মত হলে, পণ্যের হস্তান্তর-পূর্ব প্রক্রিয়া সম্মত সময় থেকে ৩ দিনের মধ্যে সম্পন্ন করতে হবে।</li>
                            <li>লঞ্জেরি কেনার আগে আমাদের হটলাইন নম্বরে কনসালটেন্টের সাথে সাইজ বা মেজারমেন্ট নিয়ে কথা বলতে পারেন। কেনার পর সাইজ রিলেটেড যেকোনো ইস্যুতে যোগাযোগ করুন। পেন্টির ক্ষেত্রে এক্সচেঞ্জ ও রিটার্নের কোনো সুযোগ নেই (ট্রায়াল দেয়া হোক বা না হোক)।</li>
                        </ul>
                    )}
                </div>

                {/* Return Process & Contact Section */}
                <div className="process-section">
                    <h3>{language === 'en' ? 'How to send your product back to us? How much will it cost you?' : 'কীভাবে প্রোডাক্ট পাঠাবেন? খরচ কেমন হবে?'}</h3>
                    <p>
                        {language === 'en'
                            ? 'Both in Dhaka and outside Dhaka, the product will be arranged for pickup through a third-party courier by our Customer Relationship Management department. You will not have to bear any cost in this case (Conditions applied).'
                            : 'ঢাকা এবং ঢাকার বাইরে উভয়ই আমাদের কাস্টমার রিলেশনশীপ ম্যানেজমেন্ট ডিপার্টমেন্ট থেকে থার্ড পার্টি কুরিয়ার এর মাধ্যমে প্রোডাক্টটি পিক-আপ করার ব্যবস্থা করা হবে, এক্ষেত্রে আপনার কোনো খরচ হবে না (শর্ত সাপেক্ষে)।'}
                    </p>
                    <p>
                        {language === 'en'
                            ? 'For pickup, a maximum of 7 working days may be required, and after the picked-up product reaches BeautyHaat, up to 7 working days may be needed for the exchange delivery.'
                            : 'পিকআপ এর জন্য সর্বোচ্চ ৭ কর্ম দিবসের সময় প্রয়োজন হতে পারে এবং পিকআপ করা পণ্য বিউটিহাটে পৌঁছানোর পর এক্সচেঞ্জ ডেলিভারি তে ৭ কর্ম দিবসের সময় প্রয়োজন হতে পারে।'}
                    </p>

                    <div className="contact-card">
                        <h4>{language === 'en' ? 'For Further Support:' : 'যেকোনো প্রয়োজনেঃ'}</h4>
                        <p><strong>Hotline:</strong> <a href="tel:+8801805744174">+8801805744174</a></p>
                        <p><strong>E-mail:</strong> <a href="mailto:notification@beautyhaat.com">notification@beautyhaat.com</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicy;