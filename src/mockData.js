export const mockOrders = [
    {
        id: '6221301',
        customer: {
            name: 'Shahriar Haque',
            phone: '8801764070470',
            email: 'shahriar@example.com',
        },
        address: {
            details: 'Chowgacha, word no- 5, Model High School para, House no- 123, Jessore, Khulna.',
            area: 'Dhaka Sadar',
            city: 'Dhaka',
        },
        date: 'August 15, 2025',
        time: '10:35 pm',
        status: 'Pending',
        paymentMethod: 'Card',
        deliveryType: 'Inside Dhaka',
        subTotal: 1102.00,
        deliveryFee: 66.00,
        total: 1168.00,
        products: [
            {
                image: 'https://i.imgur.com/vptiD3s.jpeg',
                name: 'Himalaya Brightening Vitamin C Bluberry Face Wash-100ml',
                quantity: 5,
                price: 99.00
            },
            {
                image: 'https://i.imgur.com/gO0aYEr.jpeg',
                name: 'Himalaya Natural Glow Saffron Face Wash',
                quantity: 1,
                price: 112.00
            },
            {
                image: 'https://i.imgur.com/k2psCHT.jpeg',
                name: 'Himalaya Vitamin C Orange Face Wash-100ml',
                quantity: 5,
                price: 99.00
            }
        ]
    },
    // Add another mock order if you like
];