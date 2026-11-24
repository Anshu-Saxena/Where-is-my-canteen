export const UNIVERSITIES = [
  {
    id: 'dtu-delhi',
    name: 'Delhi Technological University (DTU)',
    shortName: 'DTU',
    city: 'New Delhi',
    state: 'Delhi',
    verified: true,
    logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
    totalCampuses: 2,
    campuses: [
      {
        id: 'dtu-main',
        name: 'Main Campus, Rohini',
        location: 'Shahbad Daulatpur, Bawana Road, Rohini, Delhi',
        canteensCount: 6,
        isPopular: true
      },
      {
        id: 'dtu-east',
        name: 'East Delhi Campus (USME)',
        location: 'Vivek Vihar, Phase II, Delhi',
        canteensCount: 2,
        isPopular: false
      }
    ]
  },
  {
    id: 'iit-bombay',
    name: 'Indian Institute of Technology Bombay',
    shortName: 'IIT Bombay',
    city: 'Mumbai',
    state: 'Maharashtra',
    verified: true,
    logo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=120&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
    totalCampuses: 1,
    campuses: [
      {
        id: 'iitb-powai',
        name: 'Powai Main Campus',
        location: 'Powai, Mumbai, Maharashtra 400076',
        canteensCount: 8,
        isPopular: true
      }
    ]
  },
  {
    id: 'bits-pilani',
    name: 'BITS Pilani',
    shortName: 'BITS Pilani',
    city: 'Pilani',
    state: 'Rajasthan',
    verified: true,
    logo: 'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=120&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1200&auto=format&fit=crop&q=80',
    totalCampuses: 3,
    campuses: [
      {
        id: 'bits-pilani-main',
        name: 'Pilani Campus',
        location: 'Vidya Vihar, Pilani, Rajasthan',
        canteensCount: 5,
        isPopular: true
      },
      {
        id: 'bits-goa',
        name: 'K.K. Birla Goa Campus',
        location: 'NH 17B, Zuarinagar, Sancoale, Goa',
        canteensCount: 4,
        isPopular: true
      },
      {
        id: 'bits-hyderabad',
        name: 'Hyderabad Campus',
        location: 'Jawahar Nagar, Kapra Mandal, Hyderabad, Telangana',
        canteensCount: 4,
        isPopular: false
      }
    ]
  },
  {
    id: 'anna-univ',
    name: 'Anna University',
    shortName: 'Anna Univ',
    city: 'Chennai',
    state: 'Tamil Nadu',
    verified: true,
    logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=120&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=1200&auto=format&fit=crop&q=80',
    totalCampuses: 2,
    campuses: [
      {
        id: 'ceg-guindy',
        name: 'College of Engineering, Guindy (CEG)',
        location: 'Sardar Patel Road, Guindy, Chennai',
        canteensCount: 5,
        isPopular: true
      },
      {
        id: 'mit-chromepet',
        name: 'Madras Institute of Technology (MIT)',
        location: 'Chromepet, Chennai',
        canteensCount: 3,
        isPopular: false
      }
    ]
  },
  {
    id: 'manipal-mahe',
    name: 'Manipal Academy of Higher Education (MAHE)',
    shortName: 'MAHE',
    city: 'Manipal',
    state: 'Karnataka',
    verified: true,
    logo: 'https://images.unsplash.com/photo-1532649538693-f3a2ec1bf8bd?w=120&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&auto=format&fit=crop&q=80',
    totalCampuses: 2,
    campuses: [
      {
        id: 'manipal-main',
        name: 'Manipal Campus (Food Court 1 & 2)',
        location: 'Tiger Circle, Madhav Nagar, Manipal',
        canteensCount: 7,
        isPopular: true
      },
      {
        id: 'manipal-bangalore',
        name: 'Bengaluru Campus',
        location: 'Yelahanka, Bengaluru, Karnataka',
        canteensCount: 3,
        isPopular: false
      }
    ]
  }
];

export const CANTEENS = [
  {
    id: 'canteen-1',
    universityId: 'dtu-delhi',
    campusId: 'dtu-main',
    name: 'Nescafe & Central Cafeteria',
    tagline: 'Best cold coffee, grilled sandwiches and shakes',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=120&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviewsCount: 382,
    priceRange: '₹',
    priceCategory: 'Budget Friendly',
    location: 'Opposite Mech Block, Central Lawn',
    openingHours: '8:30 AM - 9:00 PM',
    isOpen: true,
    estimatedPrepTime: '10-15 mins',
    categories: ['Beverages', 'Snacks', 'Fast Food', 'Breakfast', 'Lunch', 'Stationery', 'Daily Essentials'],
    pureVeg: false,
    hasVegOnly: true,
    acceptsPayAtCounter: true,
    featured: true,
    ownerName: 'Ramesh Sharma',
    ownerEmail: 'ramesh.nescafe@campus.in',
    contactNumber: '+91 98712 34567',
    description: 'The heartbeat of DTU campus life. Serving freshly brewed artisanal coffees, Maggi variations, grilled clubhouse sandwiches, and cold frappes since 2012.'
  },
  {
    id: 'canteen-2',
    universityId: 'dtu-delhi',
    campusId: 'dtu-main',
    name: 'Annapurna South Indian Corner',
    tagline: 'Crispy dosas, fluffy idlis & authentic filter coffee',
    coverImage: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=120&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 521,
    priceRange: '₹',
    priceCategory: 'Budget Friendly',
    location: 'Ground Floor, Student Activity Centre (SAC)',
    openingHours: '8:00 AM - 8:30 PM',
    isOpen: true,
    estimatedPrepTime: '8-12 mins',
    categories: ['Breakfast', 'Lunch', 'Beverages', 'Snacks'],
    pureVeg: true,
    hasVegOnly: true,
    acceptsPayAtCounter: true,
    featured: true,
    ownerName: 'V. Sundaram',
    ownerEmail: 'sundaram@annapurna.in',
    contactNumber: '+91 98101 23456',
    description: 'Authentic South Indian culinary experience on campus. Freshly ground batters, homemade coconut and tomato chutneys, and piping hot aromatic sambar.'
  },
  {
    id: 'canteen-3',
    universityId: 'dtu-delhi',
    campusId: 'dtu-main',
    name: 'Desi Tadka Mess & Dhaba',
    tagline: 'Wholesome North Indian Thalis, Parathas & Biryani',
    coverImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=120&auto=format&fit=crop&q=80',
    rating: 4.3,
    reviewsCount: 290,
    priceRange: '₹₹',
    priceCategory: 'Pocket Friendly',
    location: 'Near Hostel Block 4, Sports Complex',
    openingHours: '11:00 AM - 10:30 PM',
    isOpen: true,
    estimatedPrepTime: '15-20 mins',
    categories: ['Lunch', 'Fast Food', 'Snacks'],
    pureVeg: false,
    hasVegOnly: true,
    acceptsPayAtCounter: false,
    featured: false,
    ownerName: 'Gurpreet Singh',
    ownerEmail: 'gurpreet@desitadka.in',
    contactNumber: '+91 99112 88442',
    description: 'Generous student-sized thalis, paneer butter masala, freshly baked tandoori rotis and flavorful dum biryani packed with aromatic spices.'
  },
  {
    id: 'canteen-4',
    universityId: 'dtu-delhi',
    campusId: 'dtu-main',
    name: 'Chai Point & Samosa Hub',
    tagline: 'Masala chai, bun maska, samosas & kachoris',
    coverImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=120&auto=format&fit=crop&q=80',
    rating: 4.5,
    reviewsCount: 410,
    priceRange: '₹',
    priceCategory: 'Budget Friendly',
    location: 'Behind Computer Centre, Fountain Plaza',
    openingHours: '7:30 AM - 7:00 PM',
    isOpen: false,
    estimatedPrepTime: '5-10 mins',
    categories: ['Breakfast', 'Snacks', 'Beverages'],
    pureVeg: true,
    hasVegOnly: true,
    acceptsPayAtCounter: true,
    featured: false,
    ownerName: 'Kailash Chawla',
    ownerEmail: 'kailash@chaihub.in',
    contactNumber: '+91 98450 12389',
    description: 'The quick breather between heavy lectures. Hot kulhad adrak elaichi chai paired with steaming samosas, mint chutney and sweet jalebis.'
  },
  {
    id: 'canteen-5',
    universityId: 'dtu-delhi',
    campusId: 'dtu-main',
    name: 'The Burger & Wrap Junction',
    tagline: 'Crispy patties, loaded rolls, fries and mocktails',
    coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=120&auto=format&fit=crop&q=80',
    rating: 4.4,
    reviewsCount: 198,
    priceRange: '₹₹',
    priceCategory: 'Moderate',
    location: 'Open Air Theatre (OAT) Walkway',
    openingHours: '11:30 AM - 9:30 PM',
    isOpen: true,
    estimatedPrepTime: '12-18 mins',
    categories: ['Fast Food', 'Snacks', 'Beverages'],
    pureVeg: false,
    hasVegOnly: false,
    acceptsPayAtCounter: true,
    featured: false,
    ownerName: 'Tanmay Mehta',
    ownerEmail: 'tanmay@wrapjunction.com',
    contactNumber: '+91 97234 56789',
    description: 'Modern youth hangout featuring double-decker paneer tikka burgers, chicken seekh kathi rolls, peri-peri wedges and sparkling virgin mojitos.'
  },
  {
    id: 'canteen-6',
    universityId: 'dtu-delhi',
    campusId: 'dtu-main',
    name: 'Juice Corner & Healthy Bites',
    tagline: 'Cold-pressed juices, protein bowls & fresh fruits',
    coverImage: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=120&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 164,
    priceRange: '₹₹',
    priceCategory: 'Healthy & Fresh',
    location: 'Gymnasium Complex, Sports Arena',
    openingHours: '7:00 AM - 8:00 PM',
    isOpen: true,
    estimatedPrepTime: '5-10 mins',
    categories: ['Beverages', 'Breakfast', 'Other'],
    pureVeg: true,
    hasVegOnly: true,
    acceptsPayAtCounter: true,
    featured: false,
    ownerName: 'Deepak Verma',
    ownerEmail: 'deepak@freshjuice.in',
    contactNumber: '+91 91234 56780',
    description: 'Refuel after workouts or intense classes with cold-pressed sugarcane juice, fruit chaat, sprouted salads and whey protein shakes.'
  }
];

export const MENU_ITEMS = [
  // Nescafe (canteen-1)
  {
    id: 'item-101',
    canteenId: 'canteen-1',
    name: 'Classic Iced Frappe with Chocolate Drizzle',
    category: 'Beverages',
    price: 60,
    isVeg: true,
    isSpecial: true,
    isRecommended: true,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
    description: 'Thick, creamy blend of signature espresso, rich milk, crushed ice topped with Hershey cocoa swirl.',
    rating: 4.8,
    preparationTime: 5,
    available: true,
    customizations: [
      {
        id: 'sweetness',
        name: 'Sweetness Level',
        options: ['Normal Sugar', 'Less Sugar', 'No Sugar']
      },
      {
        id: 'extras',
        name: 'Add-ons',
        options: [
          { name: 'Extra Whipped Cream', price: 15 },
          { name: 'Vanilla Ice Cream Scoop', price: 20 },
          { name: 'Choco Chips', price: 10 }
        ]
      }
    ]
  },
  {
    id: 'item-102',
    canteenId: 'canteen-1',
    name: 'Grilled Cheese & Corn Sandwich',
    category: 'Snacks',
    price: 75,
    isVeg: true,
    isRecommended: true,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
    description: 'Golden toasted bread stuffed with sweet corn kernels, melted mozzarella, chopped capsicum and oregano.',
    rating: 4.7,
    preparationTime: 10,
    available: true,
    customizations: [
      {
        id: 'bread',
        name: 'Bread Choice',
        options: ['White Bread', 'Brown Bread (+₹10)']
      },
      {
        id: 'cheese',
        name: 'Extra Cheese',
        options: [
          { name: 'Standard Cheese', price: 0 },
          { name: 'Double Cheese Burst', price: 25 }
        ]
      }
    ]
  },
  {
    id: 'item-103',
    canteenId: 'canteen-1',
    name: 'Peri-Peri Tadka Maggi (Double)',
    category: 'Fast Food',
    price: 55,
    isVeg: true,
    isSpecial: true,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80',
    description: 'Two bricks of 2-minute noodles tossed in butter, crunchy onions, green chillies and spicy African peri-peri.',
    rating: 4.9,
    preparationTime: 8,
    available: true,
    customizations: [
      {
        id: 'spice',
        name: 'Spice Level',
        options: ['Medium Spiced', 'Extra Hot', 'Mild']
      },
      {
        id: 'cheese_addon',
        name: 'Cheese Topping',
        options: [
          { name: 'No Cheese', price: 0 },
          { name: 'Grated Amul Cheese', price: 20 }
        ]
      }
    ]
  },
  {
    id: 'item-104',
    canteenId: 'canteen-1',
    name: 'Paneer Tikka Sub Roll',
    category: 'Snacks',
    price: 90,
    isVeg: true,
    isRecommended: true,
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&auto=format&fit=crop&q=80',
    description: 'Smoky tandoori cottage cheese cubes layered with crunchy mint slaw inside a warm sesame roll.',
    rating: 4.6,
    preparationTime: 12,
    available: true,
    customizations: [
      {
        id: 'sauce',
        name: 'Sauce Choice',
        options: ['Mint Mayo', 'Chipotle Barbeque', 'Tandoori Garlic']
      }
    ]
  },
  {
    id: 'item-105',
    canteenId: 'canteen-1',
    name: 'Hot Caramel Cappuccino',
    category: 'Beverages',
    price: 50,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80',
    description: 'Steaming dark roast espresso topped with silky micro-foam and velvety salted caramel drizzle.',
    rating: 4.5,
    preparationTime: 5,
    available: true,
    customizations: []
  },
  {
    id: 'item-106',
    canteenId: 'canteen-1',
    name: 'Belgian Chocolate Waffle with Vanilla Dip',
    category: 'Other',
    price: 95,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=500&auto=format&fit=crop&q=80',
    description: 'Crisp hot waffle squares smothered with molten Belgian dark chocolate and powdered sugar.',
    rating: 4.9,
    preparationTime: 12,
    available: false,
    customizations: []
  },
  {
    id: 'item-107',
    canteenId: 'canteen-1',
    name: 'Spiral Ruled Academic Notebook (200 Pgs)',
    category: 'Stationery',
    price: 65,
    isVeg: true,
    isRecommended: true,
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&auto=format&fit=crop&q=80',
    description: 'Sturdy polypropylene cover, 70 GSM bleed-resistant natural shade paper with micro-perforated sheets.',
    rating: 4.8,
    preparationTime: 1,
    available: true,
    customizations: []
  },
  {
    id: 'item-108',
    canteenId: 'canteen-1',
    name: 'Smooth Fine Gel Pens (Set of 3)',
    category: 'Stationery',
    price: 35,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&auto=format&fit=crop&q=80',
    description: '0.5mm precision needle tip, quick-drying waterproof blue ink ideal for lecture notes and exams.',
    rating: 4.9,
    preparationTime: 1,
    available: true,
    customizations: []
  },
  {
    id: 'item-109',
    canteenId: 'canteen-1',
    name: 'Aloe Vera Pocket Hand Sanitizer (50ml)',
    category: 'Daily Essentials',
    price: 30,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=500&auto=format&fit=crop&q=80',
    description: '70% alcohol-based instant germ protection enriched with moisturising aloe vera extract and vitamin E.',
    rating: 4.7,
    preparationTime: 1,
    available: true,
    customizations: []
  },
  {
    id: 'item-110',
    canteenId: 'canteen-1',
    name: 'Almond & Cranberry High Energy Bar',
    category: 'Daily Essentials',
    price: 40,
    isVeg: true,
    isSpecial: true,
    image: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=500&auto=format&fit=crop&q=80',
    description: 'Wholesome rolled oats, Californian almonds, pumpkin seeds and dried berries. Zero added preservatives.',
    rating: 4.9,
    preparationTime: 1,
    available: true,
    customizations: []
  },

  // Annapurna South Indian Corner (canteen-2)
  {
    id: 'item-201',
    canteenId: 'canteen-2',
    name: 'Mysore Masala Dosa (Ghee Roast)',
    category: 'Breakfast',
    price: 75,
    isVeg: true,
    isSpecial: true,
    isRecommended: true,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80',
    description: 'Crispy fermented crepe smeared with spicy fiery red garlic chutney, filled with potato masala and pure desi ghee.',
    rating: 4.9,
    preparationTime: 8,
    available: true,
    customizations: [
      {
        id: 'chutney',
        name: 'Extra Chutney / Sambar',
        options: ['Regular Portion', 'Extra Coconut Chutney (Free)', 'Double Sambar Bowl (Free)']
      }
    ]
  },
  {
    id: 'item-202',
    canteenId: 'canteen-2',
    name: 'Steamed Idli Sambar (2 Pcs) with Vada',
    category: 'Breakfast',
    price: 55,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
    description: 'Pillow-soft rice cakes and one crunchy medu vada dipped in hot aromatic lentil vegetable sambar.',
    rating: 4.7,
    preparationTime: 4,
    available: true,
    customizations: [
      {
        id: 'serving',
        name: 'Serving Style',
        options: ['Dip (Dunked in Sambar)', 'Separate Bowls']
      }
    ]
  },
  {
    id: 'item-203',
    canteenId: 'canteen-2',
    name: 'Special South Indian Meals (Thali)',
    category: 'Lunch',
    price: 95,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=500&auto=format&fit=crop&q=80',
    description: 'Steamed ponni rice, drumstick sambar, rasam, kootu poriyal, curd, appalam, pickle and sweet payasam.',
    rating: 4.8,
    preparationTime: 10,
    available: true,
    customizations: [
      {
        id: 'curd_addon',
        name: 'Curd Bowl',
        options: ['Regular', 'Sweet Curd (+₹15)']
      }
    ]
  },
  {
    id: 'item-204',
    canteenId: 'canteen-2',
    name: 'Filter Degree Kaapi',
    category: 'Beverages',
    price: 25,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    description: 'Traditional South Indian chicory blend decoction frothed with boiled whole milk in a stainless steel dabarah.',
    rating: 4.9,
    preparationTime: 3,
    available: true,
    customizations: [
      {
        id: 'kaapi_sugar',
        name: 'Sugar',
        options: ['Standard Sugar', 'Jaggery (Naatu Sakkarai)', 'Sugar-free']
      }
    ]
  },
  {
    id: 'item-205',
    canteenId: 'canteen-2',
    name: 'Curd Rice with Pomegranate & Tadka',
    category: 'Lunch',
    price: 60,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
    description: 'Tempered probiotic curd rice with mustard seeds, curry leaves, ginger, green chillies and ruby pomegranate seeds.',
    rating: 4.6,
    preparationTime: 5,
    available: true,
    customizations: []
  },

  // Desi Tadka (canteen-3)
  {
    id: 'item-301',
    canteenId: 'canteen-3',
    name: 'Deluxe Special Veg Thali',
    category: 'Lunch',
    price: 110,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=80',
    description: 'Shahi Paneer, Dal Makhani, Seasonal Dry Subzi, Jeera Rice, 3 Butter Rotis, Salad, Raita & Gulab Jamun.',
    rating: 4.6,
    preparationTime: 12,
    available: true,
    customizations: [
      {
        id: 'bread_type',
        name: 'Bread Type',
        options: ['3 Butter Tawa Rotis', '2 Tandoori Naan (+₹20)', '2 Lachha Paratha (+₹25)']
      }
    ]
  },
  {
    id: 'item-302',
    canteenId: 'canteen-3',
    name: 'Amritsari Kulcha with Chole',
    category: 'Lunch',
    price: 85,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80',
    description: 'Crispy flaky clay oven baked stuffed potato kulcha with butter blob and tangy Amritsari pindi chole.',
    rating: 4.7,
    preparationTime: 15,
    available: true,
    customizations: []
  },
  {
    id: 'item-303',
    canteenId: 'canteen-3',
    name: 'Hyderabadi Chicken Dum Biryani',
    category: 'Lunch',
    price: 140,
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
    description: 'Long grain basmati rice slow cooked in sealed handi with tender chicken pieces, saffron, fried onions and mirchi ka salan.',
    rating: 4.5,
    preparationTime: 15,
    available: true,
    customizations: [
      {
        id: 'egg_addon',
        name: 'Boiled Egg Add-on',
        options: [
          { name: 'No Egg', price: 0 },
          { name: '1 Boiled Egg', price: 15 },
          { name: '2 Boiled Eggs', price: 25 }
        ]
      }
    ]
  },

  // Chai Point & Samosa Hub (canteen-4)
  {
    id: 'item-401',
    canteenId: 'canteen-4',
    name: 'Special Kulhad Masala Chai (2 Cups)',
    category: 'Beverages',
    price: 35,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    description: 'Slow simmered Assam CTC tea brewed with crushed ginger, green cardamom, cloves and creamy buffalo milk.',
    rating: 4.9,
    preparationTime: 5,
    available: true,
    customizations: [
      {
        id: 'tea_sugar',
        name: 'Sweetness',
        options: ['Sweet', 'Medium Sugar', 'Sugar-Free']
      }
    ]
  },
  {
    id: 'item-402',
    canteenId: 'canteen-4',
    name: 'Crispy Punjabi Aloo Samosa (2 Pcs)',
    category: 'Snacks',
    price: 30,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
    description: 'Deep fried crispy pastry triangles stuffed with spiced cumin potatoes, green peas and served with sweet saunth and mint chutney.',
    rating: 4.8,
    preparationTime: 3,
    available: true,
    customizations: []
  },
  {
    id: 'item-403',
    canteenId: 'canteen-4',
    name: 'Bombay Bun Maska & Chai Combo',
    category: 'Breakfast',
    price: 50,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    description: 'Pillowy soft pav loaded with chilled Amul salted butter and a warm cutting cup of chai.',
    rating: 4.7,
    preparationTime: 4,
    available: true,
    customizations: []
  }
];

export const PICKUP_SLOTS = [
  { id: 'slot-1', time: '11:30 AM - 11:45 AM', capacity: 25, currentBookings: 18, isAvailable: true },
  { id: 'slot-2', time: '11:45 AM - 12:00 PM', capacity: 30, currentBookings: 27, isAvailable: true },
  { id: 'slot-3', time: '12:00 PM - 12:15 PM', capacity: 35, currentBookings: 35, isAvailable: false },
  { id: 'slot-4', time: '12:15 PM - 12:30 PM', capacity: 35, currentBookings: 22, isAvailable: true },
  { id: 'slot-5', time: '12:30 PM - 12:45 PM', capacity: 40, currentBookings: 31, isAvailable: true },
  { id: 'slot-6', time: '12:45 PM - 01:00 PM', capacity: 40, currentBookings: 19, isAvailable: true },
  { id: 'slot-7', time: '01:00 PM - 01:15 PM', capacity: 30, currentBookings: 14, isAvailable: true },
  { id: 'slot-8', time: '01:15 PM - 01:30 PM', capacity: 25, currentBookings: 8, isAvailable: true },
  { id: 'slot-9', time: '01:30 PM - 01:45 PM', capacity: 25, currentBookings: 5, isAvailable: true },
  { id: 'slot-10', time: '02:00 PM - 02:15 PM', capacity: 20, currentBookings: 2, isAvailable: true }
];

export const SAMPLE_ORDERS = [
  {
    id: 'WMC-8942',
    tokenNumber: 'T-48',
    canteenId: 'canteen-1',
    canteenName: 'Nescafe & Central Cafeteria',
    universityName: 'Delhi Technological University',
    campusName: 'Main Campus, Rohini',
    createdAt: '2026-11-23T12:20:00Z',
    pickupSlot: '12:45 PM - 01:00 PM',
    status: 'Preparing', // 'Pending' | 'Accepted' | 'Preparing' | 'Ready for Pickup' | 'Completed' | 'Cancelled'
    statusStep: 3,
    items: [
      { id: 'item-101', name: 'Classic Iced Frappe with Chocolate Drizzle', price: 60, quantity: 2, customization: 'Less Sugar, Extra Whipped Cream (+₹15)' },
      { id: 'item-102', name: 'Grilled Cheese & Corn Sandwich', price: 75, quantity: 1, customization: 'Brown Bread (+₹10)' }
    ],
    itemSubtotal: 210,
    taxes: 10.50,
    convenienceFee: 5.00,
    totalAmount: 225.50,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID_ONLINE',
    customerName: 'Aarav Sharma',
    customerRoll: '2023/CS/104',
    customerPhone: '+91 98765 43210'
  },
  {
    id: 'WMC-8819',
    tokenNumber: 'T-21',
    canteenId: 'canteen-2',
    canteenName: 'Annapurna South Indian Corner',
    universityName: 'Delhi Technological University',
    campusName: 'Main Campus, Rohini',
    createdAt: '2026-11-23T10:15:00Z',
    pickupSlot: '10:45 AM - 11:00 AM',
    status: 'Ready for Pickup',
    statusStep: 4,
    pickupShelf: 'A2',
    readyAt: '2026-11-23T10:52:00Z',
    items: [
      { id: 'item-201', name: 'Mysore Masala Dosa (Ghee Roast)', price: 75, quantity: 1, customization: 'Extra Coconut Chutney' },
      { id: 'item-204', name: 'Filter Degree Kaapi', price: 25, quantity: 2, customization: 'Standard Sugar' }
    ],
    itemSubtotal: 125,
    taxes: 6.25,
    convenienceFee: 5.00,
    totalAmount: 136.25,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID_ONLINE',
    customerName: 'Aarav Sharma',
    customerRoll: '2023/CS/104',
    customerPhone: '+91 98765 43210'
  },
  {
    id: 'WMC-7921',
    tokenNumber: 'T-10',
    canteenId: 'canteen-1',
    canteenName: 'Nescafe & Central Cafeteria',
    universityName: 'Delhi Technological University',
    campusName: 'Main Campus, Rohini',
    createdAt: '2026-11-21T13:10:00Z',
    pickupSlot: '01:30 PM - 01:45 PM',
    status: 'Completed',
    statusStep: 5,
    items: [
      { id: 'item-103', name: 'Peri-Peri Tadka Maggi (Double)', price: 55, quantity: 2, customization: 'Extra Hot' }
    ],
    itemSubtotal: 110,
    taxes: 5.50,
    convenienceFee: 5.00,
    totalAmount: 120.50,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID_ONLINE',
    customerName: 'Aarav Sharma',
    customerRoll: '2023/CS/104',
    customerPhone: '+91 98765 43210'
  },
  {
    id: 'WMC-7710',
    tokenNumber: 'T-04',
    canteenId: 'canteen-3',
    canteenName: 'Desi Tadka Mess & Dhaba',
    universityName: 'Delhi Technological University',
    campusName: 'Main Campus, Rohini',
    createdAt: '2026-11-19T12:00:00Z',
    pickupSlot: '12:30 PM - 12:45 PM',
    status: 'Cancelled',
    statusStep: 1,
    items: [
      { id: 'item-301', name: 'Deluxe Special Veg Thali', price: 110, quantity: 1, customization: '3 Butter Tawa Rotis' }
    ],
    itemSubtotal: 110,
    taxes: 5.50,
    convenienceFee: 5.00,
    totalAmount: 120.50,
    paymentMethod: 'Pay at Counter',
    paymentStatus: 'CANCELLED_UNPAID',
    customerName: 'Aarav Sharma',
    customerRoll: '2023/CS/104',
    customerPhone: '+91 98765 43210'
  }
];

export const REVIEWS = [
  {
    id: 'rev-1',
    canteenId: 'canteen-1',
    userName: 'Priya Iyer',
    userRole: 'Student (ECE 3rd Yr)',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    date: 'Yesterday, 2:15 PM',
    comment: 'The cold frappe here is legendary! Pre-ordering through the app saved me 25 minutes of standing in the hot afternoon queue. Token was ready exactly at my slot.',
    verifiedOrder: true,
    canteenResponse: 'Thank you Priya! Glad you enjoyed the frappe. See you again tomorrow!'
  },
  {
    id: 'rev-2',
    canteenId: 'canteen-1',
    userName: 'Rohan Deshmukh',
    userRole: 'Student (Mechanical 4th Yr)',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    rating: 4,
    date: '3 days ago',
    comment: 'Peri-peri Maggi has nice heat and crunch. Sandwich bread was crisp. Packaging is neat and spill-proof.',
    verifiedOrder: true
  },
  {
    id: 'rev-3',
    canteenId: 'canteen-2',
    userName: 'Ananya Roy',
    userRole: 'Faculty (Dept of Physics)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    date: '1 week ago',
    comment: 'Authentic South Indian taste. The sambar is not overly sweet like other places in Delhi. Degree coffee is a must try!',
    verifiedOrder: true
  }
];

export const OWNER_ANALYTICS = {
  todayStats: {
    totalRevenue: 14850,
    revenueGrowth: '+18.4%',
    totalOrders: 142,
    ordersGrowth: '+12.5%',
    pendingOrders: 6,
    preparingOrders: 9,
    readyOrders: 4,
    completedOrders: 123
  },
  peakHours: [
    { time: '9 AM - 10 AM', count: 18 },
    { time: '10 AM - 11 AM', count: 12 },
    { time: '11 AM - 12 PM', count: 24 },
    { time: '12 PM - 1 PM', count: 48 },
    { time: '1 PM - 2 PM', count: 42 },
    { time: '2 PM - 3 PM', count: 16 },
    { time: '3 PM - 4 PM', count: 14 },
    { time: '4 PM - 5 PM', count: 28 },
    { time: '5 PM - 6 PM', count: 22 }
  ],
  popularItems: [
    { name: 'Classic Iced Frappe', count: 68, revenue: 4080 },
    { name: 'Grilled Cheese Sandwich', count: 54, revenue: 4050 },
    { name: 'Peri-Peri Tadka Maggi', count: 46, revenue: 2530 },
    { name: 'Paneer Tikka Sub Roll', count: 28, revenue: 2520 }
  ]
};

export const UNIVERSITY_ADMIN_DATA = {
  university: 'Delhi Technological University',
  stats: {
    totalCampuses: 2,
    activeCanteens: 8,
    registeredStudents: 12450,
    dailyOrders: 890,
    totalMonthlyGMV: 1824000
  },
  canteensList: [
    { id: 'c1', name: 'Nescafe & Central Cafeteria', manager: 'Ramesh Sharma', campus: 'Main Campus', status: 'Active', rating: 4.6, complianceScore: '98%' },
    { id: 'c2', name: 'Annapurna South Indian', manager: 'V. Sundaram', campus: 'Main Campus', status: 'Active', rating: 4.8, complianceScore: '99%' },
    { id: 'c3', name: 'Desi Tadka Mess', manager: 'Gurpreet Singh', campus: 'Main Campus', status: 'Active', rating: 4.3, complianceScore: '92%' },
    { id: 'c4', name: 'Chai Point & Samosa Hub', manager: 'Kailash Chawla', campus: 'Main Campus', status: 'Maintenance', rating: 4.5, complianceScore: '95%' }
  ],
  pendingApprovals: [
    { id: 'app-1', canteenName: 'Oat Corner Juice Bar', owner: 'Vikram Joshi', submittedOn: '2026-11-20', type: 'New Canteen Onboarding' },
    { id: 'app-2', canteenName: 'Wrap & Wok Asian Counter', owner: 'Sneha Patel', submittedOn: '2026-11-22', type: 'Menu Price Revision' }
  ],
  recentFeedback: [
    { id: 'fb-1', student: 'Sahil K.', canteen: 'Desi Tadka', type: 'Hygiene & Cleanliness', status: 'Resolved' },
    { id: 'fb-2', student: 'Pooja M.', canteen: 'Nescafe', type: 'Pickup Slot Delay', status: 'In Review' }
  ]
};

export const PLATFORM_ADMIN_DATA = {
  platformStats: {
    totalUniversities: 24,
    totalCampuses: 68,
    totalCanteens: 312,
    totalUsers: 84920,
    totalOrdersToday: 4180,
    totalGmvToday: 428000
  },
  universityRequests: [
    { id: 'req-1', name: 'Jadavpur University', state: 'West Bengal', campuses: 2, contactPerson: 'Dean of Student Affairs', date: '2026-11-21', status: 'Under Verification' },
    { id: 'req-2', name: 'Vellore Institute of Technology', state: 'Tamil Nadu', campuses: 4, contactPerson: 'Campus Registrar', date: '2026-11-22', status: 'Pending Review' }
  ],
  systemHealth: {
    apiStatus: 'Operational',
    uptime: '99.98%',
    averageResponseTime: '42ms',
    paymentGatewayStatus: 'Healthy'
  }
};
