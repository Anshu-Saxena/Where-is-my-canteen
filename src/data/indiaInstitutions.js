export const INSTITUTION_TYPES = [
  'All',
  'Central University',
  'State University',
  'Private University',
  'Deemed-to-be University',
  'Engineering College',
  'Management College',
  'Medical College',
  'Government College',
  'Private College'
];

export const INDIA_STATES_AND_UTS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

const DEFAULT_LOGO = 'https://images.unsplash.com/photo-1562774053-701939374585?w=120&auto=format&fit=crop&q=80';
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80';

function makeInstitution({
  id,
  name,
  shortName,
  city,
  state,
  type,
  verified = true,
  logo = DEFAULT_LOGO,
  banner = DEFAULT_BANNER,
  campuses
}) {
  return {
    id,
    name,
    shortName,
    city,
    state,
    type,
    verified,
    logo,
    banner,
    totalCampuses: campuses.length,
    campuses
  };
}

export const ALL_INDIA_UNIVERSITIES = [
  // Uttar Pradesh - including GLA University (Mathura & Noida campuses)
  makeInstitution({
    id: 'gla-university',
    name: 'GLA University',
    shortName: 'GLA Univ',
    city: 'Mathura',
    state: 'Uttar Pradesh',
    type: 'Private University',
    logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80',
    campuses: [
      {
        id: 'gla-mathura',
        name: 'GLA University, Mathura Campus',
        location: '17km Stone, NH-19, Mathura-Delhi Road, Chaumuhan, Mathura, Uttar Pradesh 281406',
        city: 'Mathura',
        state: 'Uttar Pradesh',
        canteensCount: 3,
        isPopular: true
      },
      {
        id: 'gla-noida',
        name: 'GLA University, Noida Campus',
        location: 'Plot No. 2, Sector 62 / Institutional Area, Greater Noida & Noida, Uttar Pradesh',
        city: 'Noida',
        state: 'Uttar Pradesh',
        canteensCount: 2,
        isPopular: true
      }
    ]
  }),
  // Delhi
  makeInstitution({
    id: 'dtu-delhi',
    name: 'Delhi Technological University (DTU)',
    shortName: 'DTU',
    city: 'New Delhi',
    state: 'Delhi',
    type: 'State University',
    logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80',
    campuses: [
      {
        id: 'dtu-main',
        name: 'Main Campus, Rohini',
        location: 'Shahbad Daulatpur, Bawana Road, Rohini, New Delhi, Delhi 110042',
        city: 'New Delhi',
        state: 'Delhi',
        canteensCount: 6,
        isPopular: true
      },
      {
        id: 'dtu-east',
        name: 'East Delhi Campus (USME)',
        location: 'Vivek Vihar, Phase II, East Delhi, Delhi 110095',
        city: 'New Delhi',
        state: 'Delhi',
        canteensCount: 2,
        isPopular: false
      }
    ]
  }),
  makeInstitution({
    id: 'du-delhi',
    name: 'University of Delhi',
    shortName: 'DU',
    city: 'New Delhi',
    state: 'Delhi',
    type: 'Central University',
    campuses: [
      {
        id: 'du-north',
        name: 'North Campus',
        location: 'University Enclave, Delhi 110007',
        city: 'New Delhi',
        state: 'Delhi',
        canteensCount: 4,
        isPopular: true
      },
      {
        id: 'du-south',
        name: 'South Campus',
        location: 'Benito Juarez Marg, South Moti Bagh, New Delhi 110021',
        city: 'New Delhi',
        state: 'Delhi',
        canteensCount: 2,
        isPopular: true
      }
    ]
  }),
  makeInstitution({
    id: 'iit-delhi',
    name: 'Indian Institute of Technology Delhi',
    shortName: 'IIT Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    type: 'Engineering College',
    campuses: [
      {
        id: 'iitd-hauz-khas',
        name: 'Hauz Khas Campus',
        location: 'Hauz Khas, New Delhi, Delhi 110016',
        city: 'New Delhi',
        state: 'Delhi',
        canteensCount: 5,
        isPopular: true
      }
    ]
  }),
  makeInstitution({
    id: 'aiims-delhi',
    name: 'All India Institute of Medical Sciences (AIIMS) Delhi',
    shortName: 'AIIMS Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    type: 'Medical College',
    campuses: [
      {
        id: 'aiims-ansari',
        name: 'Ansari Nagar Campus',
        location: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029',
        city: 'New Delhi',
        state: 'Delhi',
        canteensCount: 3,
        isPopular: true
      }
    ]
  }),
  makeInstitution({
    id: 'st-stephens-delhi',
    name: "St. Stephen's College",
    shortName: "St. Stephen's",
    city: 'New Delhi',
    state: 'Delhi',
    type: 'Government College',
    campuses: [
      {
        id: 'stephens-main',
        name: 'North Campus, Delhi',
        location: 'Sudhir Bose Marg, University Enclave, Delhi 110007',
        city: 'New Delhi',
        state: 'Delhi',
        canteensCount: 1,
        isPopular: true
      }
    ]
  }),
  // Maharashtra
  makeInstitution({
    id: 'iit-bombay',
    name: 'Indian Institute of Technology Bombay',
    shortName: 'IIT Bombay',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'Engineering College',
    campuses: [
      {
        id: 'iitb-powai',
        name: 'Powai Main Campus',
        location: 'Powai, Mumbai, Maharashtra 400076',
        city: 'Mumbai',
        state: 'Maharashtra',
        canteensCount: 8,
        isPopular: true
      }
    ]
  }),
  makeInstitution({
    id: 'sppu-pune',
    name: 'Savitribai Phule Pune University',
    shortName: 'SPPU Pune',
    city: 'Pune',
    state: 'Maharashtra',
    type: 'State University',
    campuses: [
      {
        id: 'sppu-ganeshkhind',
        name: 'Ganeshkhind Main Campus',
        location: 'Ganeshkhind Road, Pune, Maharashtra 411007',
        city: 'Pune',
        state: 'Maharashtra',
        canteensCount: 4,
        isPopular: true
      }
    ]
  }),
  makeInstitution({
    id: 'st-xaviers-mumbai',
    name: "St. Xavier's College, Mumbai",
    shortName: "St. Xavier's",
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'Private College',
    campuses: [
      {
        id: 'xaviers-fort',
        name: 'Fort Campus',
        location: '5, Mahapalika Marg, Mumbai, Maharashtra 400001',
        city: 'Mumbai',
        state: 'Maharashtra',
        canteensCount: 1,
        isPopular: true
      }
    ]
  }),
  // Rajasthan
  makeInstitution({
    id: 'bits-pilani',
    name: 'BITS Pilani',
    shortName: 'BITS Pilani',
    city: 'Pilani',
    state: 'Rajasthan',
    type: 'Private University',
    campuses: [
      {
        id: 'bits-pilani-main',
        name: 'Pilani Campus',
        location: 'Vidya Vihar, Pilani, Rajasthan 333031',
        city: 'Pilani',
        state: 'Rajasthan',
        canteensCount: 5,
        isPopular: true
      },
      {
        id: 'bits-goa',
        name: 'K.K. Birla Goa Campus',
        location: 'NH 17B, Zuarinagar, Sancoale, Goa 403726',
        city: 'Sancoale',
        state: 'Goa',
        canteensCount: 4,
        isPopular: true
      },
      {
        id: 'bits-hyderabad',
        name: 'Hyderabad Campus',
        location: 'Jawahar Nagar, Kapra Mandal, Hyderabad, Telangana 500078',
        city: 'Hyderabad',
        state: 'Telangana',
        canteensCount: 4,
        isPopular: false
      }
    ]
  }),
  makeInstitution({
    id: 'mnit-jaipur',
    name: 'Malaviya National Institute of Technology (MNIT) Jaipur',
    shortName: 'MNIT Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    type: 'Engineering College',
    campuses: [
      {
        id: 'mnit-jln',
        name: 'JLN Marg Campus',
        location: 'Jawahar Lal Nehru Marg, Jaipur, Rajasthan 302017',
        city: 'Jaipur',
        state: 'Rajasthan',
        canteensCount: 3,
        isPopular: true
      }
    ]
  }),
  // Tamil Nadu
  makeInstitution({
    id: 'anna-univ',
    name: 'Anna University',
    shortName: 'Anna Univ',
    city: 'Chennai',
    state: 'Tamil Nadu',
    type: 'State University',
    campuses: [
      {
        id: 'ceg-guindy',
        name: 'College of Engineering, Guindy (CEG)',
        location: 'Sardar Patel Road, Guindy, Chennai, Tamil Nadu 600025',
        city: 'Chennai',
        state: 'Tamil Nadu',
        canteensCount: 5,
        isPopular: true
      },
      {
        id: 'mit-chromepet',
        name: 'Madras Institute of Technology (MIT)',
        location: 'Chromepet, Chennai, Tamil Nadu 600044',
        city: 'Chennai',
        state: 'Tamil Nadu',
        canteensCount: 3,
        isPopular: false
      }
    ]
  }),
  makeInstitution({
    id: 'vit-vellore',
    name: 'Vellore Institute of Technology (VIT)',
    shortName: 'VIT',
    city: 'Vellore',
    state: 'Tamil Nadu',
    type: 'Private University',
    campuses: [
      {
        id: 'vit-vellore-main',
        name: 'Vellore Campus',
        location: 'Katpadi, Vellore, Tamil Nadu 632014',
        city: 'Vellore',
        state: 'Tamil Nadu',
        canteensCount: 6,
        isPopular: true
      },
      {
        id: 'vit-chennai',
        name: 'Chennai Campus',
        location: 'Vandalur-Kelambakkam Road, Chennai, Tamil Nadu 600127',
        city: 'Chennai',
        state: 'Tamil Nadu',
        canteensCount: 3,
        isPopular: false
      }
    ]
  }),
  // Karnataka
  makeInstitution({
    id: 'manipal-mahe',
    name: 'Manipal Academy of Higher Education (MAHE)',
    shortName: 'MAHE',
    city: 'Manipal',
    state: 'Karnataka',
    type: 'Deemed-to-be University',
    campuses: [
      {
        id: 'manipal-main',
        name: 'Manipal Campus (Food Court 1 & 2)',
        location: 'Tiger Circle, Madhav Nagar, Manipal, Karnataka 576104',
        city: 'Manipal',
        state: 'Karnataka',
        canteensCount: 7,
        isPopular: true
      },
      {
        id: 'manipal-bangalore',
        name: 'Bengaluru Campus',
        location: 'Yelahanka, Bengaluru, Karnataka 560064',
        city: 'Bengaluru',
        state: 'Karnataka',
        canteensCount: 3,
        isPopular: false
      }
    ]
  }),
  makeInstitution({
    id: 'iim-bangalore',
    name: 'Indian Institute of Management Bangalore (IIMB)',
    shortName: 'IIM Bangalore',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Management College',
    campuses: [
      {
        id: 'iimb-bannerghatta',
        name: 'Bannerghatta Road Campus',
        location: 'Bannerghatta Road, Bengaluru, Karnataka 560076',
        city: 'Bengaluru',
        state: 'Karnataka',
        canteensCount: 2,
        isPopular: true
      }
    ]
  }),
  // More Uttar Pradesh
  makeInstitution({
    id: 'bhu-varanasi',
    name: 'Banaras Hindu University (BHU)',
    shortName: 'BHU',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    type: 'Central University',
    campuses: [
      {
        id: 'bhu-main',
        name: 'Varanasi Main Campus',
        location: 'Ajagara, Varanasi, Uttar Pradesh 221005',
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        canteensCount: 6,
        isPopular: true
      }
    ]
  }),
  makeInstitution({
    id: 'amity-noida',
    name: 'Amity University Uttar Pradesh',
    shortName: 'Amity Noida',
    city: 'Noida',
    state: 'Uttar Pradesh',
    type: 'Private University',
    campuses: [
      {
        id: 'amity-sec125',
        name: 'Sector 125 Noida Campus',
        location: 'Sector 125, Noida, Uttar Pradesh 201313',
        city: 'Noida',
        state: 'Uttar Pradesh',
        canteensCount: 5,
        isPopular: true
      }
    ]
  }),
  makeInstitution({
    id: 'iit-kanpur',
    name: 'Indian Institute of Technology Kanpur',
    shortName: 'IIT Kanpur',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    type: 'Engineering College',
    campuses: [
      {
        id: 'iitk-kalyanpur',
        name: 'Kalyanpur Campus',
        location: 'Kalyanpur, Kanpur, Uttar Pradesh 208016',
        city: 'Kanpur',
        state: 'Uttar Pradesh',
        canteensCount: 5,
        isPopular: true
      }
    ]
  }),
  makeInstitution({
    id: 'iim-lucknow',
    name: 'Indian Institute of Management Lucknow',
    shortName: 'IIM Lucknow',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    type: 'Management College',
    campuses: [
      {
        id: 'iiml-prabandh',
        name: 'Prabandh Nagar Campus',
        location: 'Prabandh Nagar, IIM Road, Lucknow, Uttar Pradesh 226013',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        canteensCount: 2,
        isPopular: true
      }
    ]
  }),
  // Gujarat
  makeInstitution({
    id: 'iim-ahmedabad',
    name: 'Indian Institute of Management Ahmedabad (IIMA)',
    shortName: 'IIM Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    type: 'Management College',
    campuses: [
      {
        id: 'iima-vastrapur',
        name: 'Vastrapur Campus',
        location: 'Vastrapur, Ahmedabad, Gujarat 380015',
        city: 'Ahmedabad',
        state: 'Gujarat',
        canteensCount: 3,
        isPopular: true
      }
    ]
  }),
  // West Bengal
  makeInstitution({
    id: 'jadavpur-univ',
    name: 'Jadavpur University',
    shortName: 'JU Kolkata',
    city: 'Kolkata',
    state: 'West Bengal',
    type: 'State University',
    campuses: [
      {
        id: 'ju-jadavpur',
        name: 'Jadavpur Main Campus',
        location: '188, Raja S.C. Mallick Road, Kolkata, West Bengal 700032',
        city: 'Kolkata',
        state: 'West Bengal',
        canteensCount: 4,
        isPopular: true
      },
      {
        id: 'ju-saltlake',
        name: 'Salt Lake Campus',
        location: 'Plot No. 8, Salt Lake Bypass, Sector III, Kolkata 700098',
        city: 'Kolkata',
        state: 'West Bengal',
        canteensCount: 2,
        isPopular: false
      }
    ]
  }),
  // Telangana
  makeInstitution({
    id: 'uoh-hyderabad',
    name: 'University of Hyderabad',
    shortName: 'UoH',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Central University',
    campuses: [
      {
        id: 'uoh-gachibowli',
        name: 'Gachibowli Campus',
        location: 'Prof. C.R. Rao Road, Gachibowli, Hyderabad, Telangana 500046',
        city: 'Hyderabad',
        state: 'Telangana',
        canteensCount: 3,
        isPopular: true
      }
    ]
  }),
  // Andhra Pradesh
  makeInstitution({
    id: 'andhra-univ',
    name: 'Andhra University',
    shortName: 'Andhra Univ',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    type: 'State University',
    campuses: [
      {
        id: 'au-vizag',
        name: 'Waltair Campus',
        location: 'Waltair Junction, Visakhapatnam, Andhra Pradesh 530003',
        city: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        canteensCount: 3,
        isPopular: true
      }
    ]
  }),
  // Arunachal Pradesh
  makeInstitution({
    id: 'rgu-arunachal',
    name: 'Rajiv Gandhi University',
    shortName: 'RGU',
    city: 'Doimukh',
    state: 'Arunachal Pradesh',
    type: 'Central University',
    campuses: [
      {
        id: 'rgu-rono',
        name: 'Rono Hills Campus',
        location: 'Rono Hills, Doimukh, Arunachal Pradesh 791112',
        city: 'Doimukh',
        state: 'Arunachal Pradesh',
        canteensCount: 2,
        isPopular: false
      }
    ]
  }),
  // Assam
  makeInstitution({
    id: 'iit-guwahati',
    name: 'Indian Institute of Technology Guwahati',
    shortName: 'IIT Guwahati',
    city: 'Guwahati',
    state: 'Assam',
    type: 'Engineering College',
    campuses: [
      {
        id: 'iitg-amingaon',
        name: 'Amingaon Campus',
        location: 'Amingaon, North Guwahati, Assam 781039',
        city: 'Guwahati',
        state: 'Assam',
        canteensCount: 4,
        isPopular: true
      }
    ]
  }),
  // Bihar
  makeInstitution({
    id: 'patna-univ',
    name: 'Patna University',
    shortName: 'Patna Univ',
    city: 'Patna',
    state: 'Bihar',
    type: 'State University',
    campuses: [
      {
        id: 'pu-ashok-rajpath',
        name: 'Ashok Rajpath Campus',
        location: 'Ashok Rajpath, Patna, Bihar 800005',
        city: 'Patna',
        state: 'Bihar',
        canteensCount: 2,
        isPopular: false
      }
    ]
  }),
  // Chhattisgarh
  makeInstitution({
    id: 'nit-raipur',
    name: 'National Institute of Technology (NIT) Raipur',
    shortName: 'NIT Raipur',
    city: 'Raipur',
    state: 'Chhattisgarh',
    type: 'Engineering College',
    campuses: [
      {
        id: 'nitrr-ge-road',
        name: 'G.E. Road Campus',
        location: 'Great Eastern Road, Amanaka, Raipur, Chhattisgarh 492010',
        city: 'Raipur',
        state: 'Chhattisgarh',
        canteensCount: 2,
        isPopular: false
      }
    ]
  }),
  // Goa
  makeInstitution({
    id: 'goa-univ',
    name: 'Goa University',
    shortName: 'Goa Univ',
    city: 'Taleigao',
    state: 'Goa',
    type: 'State University',
    campuses: [
      {
        id: 'gu-taleigao',
        name: 'Taleigao Plateau Campus',
        location: 'Taleigao Plateau, Panaji, Goa 403206',
        city: 'Taleigao',
        state: 'Goa',
        canteensCount: 2,
        isPopular: false
      }
    ]
  }),
  // Haryana
  makeInstitution({
    id: 'ashoka-univ',
    name: 'Ashoka University',
    shortName: 'Ashoka Univ',
    city: 'Sonipat',
    state: 'Haryana',
    type: 'Private University',
    campuses: [
      {
        id: 'ashoka-rajiv-gandhi',
        name: 'Rajiv Gandhi Education City Campus',
        location: 'Plot No. 2, Rajiv Gandhi Education City, Sonipat, Haryana 131029',
        city: 'Sonipat',
        state: 'Haryana',
        canteensCount: 3,
        isPopular: true
      }
    ]
  }),
  // Himachal Pradesh
  makeInstitution({
    id: 'iit-mandi',
    name: 'Indian Institute of Technology Mandi',
    shortName: 'IIT Mandi',
    city: 'Mandi',
    state: 'Himachal Pradesh',
    type: 'Engineering College',
    campuses: [
      {
        id: 'iitm-kamand',
        name: 'Kamand Valley Campus',
        location: 'Kamand, Mandi, Himachal Pradesh 175075',
        city: 'Mandi',
        state: 'Himachal Pradesh',
        canteensCount: 2,
        isPopular: false
      }
    ]
  }),
  // Jharkhand
  makeInstitution({
    id: 'xlri-jamshedpur',
    name: 'XLRI - Xavier School of Management',
    shortName: 'XLRI',
    city: 'Jamshedpur',
    state: 'Jharkhand',
    type: 'Management College',
    campuses: [
      {
        id: 'xlri-ch-area',
        name: 'Circuit House Area Campus',
        location: 'C.H. Area (East), Jamshedpur, Jharkhand 831001',
        city: 'Jamshedpur',
        state: 'Jharkhand',
        canteensCount: 2,
        isPopular: true
      }
    ]
  }),
  // Kerala
  makeInstitution({
    id: 'cusat-kochi',
    name: 'Cochin University of Science and Technology (CUSAT)',
    shortName: 'CUSAT',
    city: 'Kochi',
    state: 'Kerala',
    type: 'State University',
    campuses: [
      {
        id: 'cusat-thrikkakara',
        name: 'Thrikkakara Campus',
        location: 'South Kalamassery, Kochi, Kerala 682022',
        city: 'Kochi',
        state: 'Kerala',
        canteensCount: 3,
        isPopular: true
      }
    ]
  }),
  // Madhya Pradesh
  makeInstitution({
    id: 'aiims-bhopal',
    name: 'All India Institute of Medical Sciences (AIIMS) Bhopal',
    shortName: 'AIIMS Bhopal',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    type: 'Medical College',
    campuses: [
      {
        id: 'aiims-saket',
        name: 'Saket Nagar Campus',
        location: 'Saket Nagar, Bhopal, Madhya Pradesh 462020',
        city: 'Bhopal',
        state: 'Madhya Pradesh',
        canteensCount: 2,
        isPopular: false
      }
    ]
  }),
  // Manipur
  makeInstitution({
    id: 'manipur-univ',
    name: 'Manipur University',
    shortName: 'Manipur Univ',
    city: 'Imphal',
    state: 'Manipur',
    type: 'Central University',
    campuses: [
      {
        id: 'mu-canchipur',
        name: 'Canchipur Campus',
        location: 'Canchipur, Imphal, Manipur 795003',
        city: 'Imphal',
        state: 'Manipur',
        canteensCount: 2,
        isPopular: false
      }
    ]
  }),
  // Meghalaya
  makeInstitution({
    id: 'nehu-shillong',
    name: 'North-Eastern Hill University (NEHU)',
    shortName: 'NEHU',
    city: 'Shillong',
    state: 'Meghalaya',
    type: 'Central University',
    campuses: [
      {
        id: 'nehu-umshing',
        name: 'Umshing Mawkynroh Campus',
        location: 'Shillong, Meghalaya 793022',
        city: 'Shillong',
        state: 'Meghalaya',
        canteensCount: 2,
        isPopular: false
      }
    ]
  }),
  // Mizoram
  makeInstitution({
    id: 'mizoram-univ',
    name: 'Mizoram University',
    shortName: 'MZU',
    city: 'Aizawl',
    state: 'Mizoram',
    type: 'Central University',
    campuses: [
      {
        id: 'mzu-tanhril',
        name: 'Tanhril Campus',
        location: 'Tanhril, Aizawl, Mizoram 796004',
        city: 'Aizawl',
        state: 'Mizoram',
        canteensCount: 1,
        isPopular: false
      }
    ]
  }),
  // Nagaland
  makeInstitution({
    id: 'nagaland-univ',
    name: 'Nagaland University',
    shortName: 'Nagaland Univ',
    city: 'Zunheboto',
    state: 'Nagaland',
    type: 'Central University',
    campuses: [
      {
        id: 'nu-lumami',
        name: 'Lumami Headquarters Campus',
        location: 'Lumami, Zunheboto, Nagaland 798627',
        city: 'Zunheboto',
        state: 'Nagaland',
        canteensCount: 1,
        isPopular: false
      }
    ]
  }),
  // Odisha
  makeInstitution({
    id: 'nit-rourkela',
    name: 'National Institute of Technology (NIT) Rourkela',
    shortName: 'NIT Rourkela',
    city: 'Rourkela',
    state: 'Odisha',
    type: 'Engineering College',
    campuses: [
      {
        id: 'nitr-sector1',
        name: 'Sector 1 Campus',
        location: 'Sector 1, Rourkela, Odisha 769008',
        city: 'Rourkela',
        state: 'Odisha',
        canteensCount: 3,
        isPopular: true
      }
    ]
  }),
  // Punjab
  makeInstitution({
    id: 'lpu-phagwara',
    name: 'Lovely Professional University (LPU)',
    shortName: 'LPU',
    city: 'Phagwara',
    state: 'Punjab',
    type: 'Private University',
    campuses: [
      {
        id: 'lpu-jalandhar',
        name: 'Jalandhar-Delhi GT Road Campus',
        location: 'Jalandhar-Delhi G.T. Road, Phagwara, Punjab 144411',
        city: 'Phagwara',
        state: 'Punjab',
        canteensCount: 6,
        isPopular: true
      }
    ]
  }),
  // Sikkim
  makeInstitution({
    id: 'sikkim-univ',
    name: 'Sikkim University',
    shortName: 'Sikkim Univ',
    city: 'Gangtok',
    state: 'Sikkim',
    type: 'Central University',
    campuses: [
      {
        id: 'su-tadong',
        name: 'Tadong Campus',
        location: '6th Mile, Samdur, Tadong, Gangtok, Sikkim 737102',
        city: 'Gangtok',
        state: 'Sikkim',
        canteensCount: 1,
        isPopular: false
      }
    ]
  }),
  // Tripura
  makeInstitution({
    id: 'tripura-univ',
    name: 'Tripura University',
    shortName: 'Tripura Univ',
    city: 'Agartala',
    state: 'Tripura',
    type: 'Central University',
    campuses: [
      {
        id: 'tu-suryamaninagar',
        name: 'Suryamaninagar Campus',
        location: 'Suryamaninagar, Agartala, Tripura 799022',
        city: 'Agartala',
        state: 'Tripura',
        canteensCount: 1,
        isPopular: false
      }
    ]
  }),
  // Uttarakhand
  makeInstitution({
    id: 'iit-roorkee',
    name: 'Indian Institute of Technology Roorkee',
    shortName: 'IIT Roorkee',
    city: 'Roorkee',
    state: 'Uttarakhand',
    type: 'Engineering College',
    campuses: [
      {
        id: 'iitr-main',
        name: 'Roorkee Main Campus',
        location: 'Roorkee, Haridwar District, Uttarakhand 247667',
        city: 'Roorkee',
        state: 'Uttarakhand',
        canteensCount: 4,
        isPopular: true
      }
    ]
  }),
  // Union Territories
  makeInstitution({
    id: 'panjab-univ-chandigarh',
    name: 'Panjab University',
    shortName: 'PU Chandigarh',
    city: 'Chandigarh',
    state: 'Chandigarh',
    type: 'State University',
    campuses: [
      {
        id: 'pu-sec14',
        name: 'Sector 14 Main Campus',
        location: 'Sector 14, Chandigarh 160014',
        city: 'Chandigarh',
        state: 'Chandigarh',
        canteensCount: 4,
        isPopular: true
      }
    ]
  }),
  makeInstitution({
    id: 'pondicherry-univ',
    name: 'Pondicherry University',
    shortName: 'Pondicherry Univ',
    city: 'Puducherry',
    state: 'Puducherry',
    type: 'Central University',
    campuses: [
      {
        id: 'pondi-kalapet',
        name: 'Kalapet Campus',
        location: 'R.V. Nagar, Kalapet, Puducherry 605014',
        city: 'Puducherry',
        state: 'Puducherry',
        canteensCount: 3,
        isPopular: true
      }
    ]
  }),
  makeInstitution({
    id: 'kashmir-univ',
    name: 'University of Kashmir',
    shortName: 'KU Srinagar',
    city: 'Srinagar',
    state: 'Jammu and Kashmir',
    type: 'State University',
    campuses: [
      {
        id: 'ku-hazratbal',
        name: 'Hazratbal Main Campus',
        location: 'Hazratbal, Srinagar, Jammu and Kashmir 190006',
        city: 'Srinagar',
        state: 'Jammu and Kashmir',
        canteensCount: 2,
        isPopular: false
      }
    ]
  }),
  makeInstitution({
    id: 'ladakh-univ',
    name: 'University of Ladakh',
    shortName: 'UoL',
    city: 'Leh',
    state: 'Ladakh',
    type: 'State University',
    campuses: [
      {
        id: 'uol-leh',
        name: 'Leh Campus (Taru)',
        location: 'Taru Thang, Leh, Ladakh 194101',
        city: 'Leh',
        state: 'Ladakh',
        canteensCount: 1,
        isPopular: false
      }
    ]
  }),
  makeInstitution({
    id: 'jnrm-port-blair',
    name: 'Jawaharlal Nehru Rajkeeya Mahavidyalaya (JNRM)',
    shortName: 'JNRM',
    city: 'Port Blair',
    state: 'Andaman and Nicobar Islands',
    type: 'Government College',
    campuses: [
      {
        id: 'jnrm-main',
        name: 'Port Blair Campus',
        location: 'Port Blair, South Andaman, Andaman and Nicobar Islands 744104',
        city: 'Port Blair',
        state: 'Andaman and Nicobar Islands',
        canteensCount: 1,
        isPopular: false
      }
    ]
  }),
  makeInstitution({
    id: 'govt-college-daman',
    name: 'Government College, Daman',
    shortName: 'GC Daman',
    city: 'Daman',
    state: 'Dadra and Nagar Haveli and Daman and Diu',
    type: 'Government College',
    campuses: [
      {
        id: 'gcd-nani-daman',
        name: 'Nani Daman Campus',
        location: 'Nani Daman, Dadra and Nagar Haveli and Daman and Diu 396210',
        city: 'Daman',
        state: 'Dadra and Nagar Haveli and Daman and Diu',
        canteensCount: 1,
        isPopular: false
      }
    ]
  }),
  makeInstitution({
    id: 'lakshadweep-pm-college',
    name: 'Calicut University Centre, Kadmat (Lakshadweep)',
    shortName: 'UOC Kadmat',
    city: 'Kadmat',
    state: 'Lakshadweep',
    type: 'Government College',
    campuses: [
      {
        id: 'uoc-kadmat',
        name: 'Kadmat Island Campus',
        location: 'Kadmat Island, Lakshadweep 682556',
        city: 'Kadmat',
        state: 'Lakshadweep',
        canteensCount: 1,
        isPopular: false
      }
    ]
  })
];
