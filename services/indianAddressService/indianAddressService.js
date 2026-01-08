const axios = require('axios');

// Complete list of Indian states with their districts
const INDIAN_STATES_DISTRICTS = {
  "Andhra Pradesh": [
    "Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", 
    "Kurnool", "Prakasam", "Nellore", "Srikakulam", "Visakhapatnam", 
    "Vizianagaram", "West Godavari", "YSR Kadapa"
  ],
  "Arunachal Pradesh": [
    "Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey",
    "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", 
    "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley",
    "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"
  ],
  "Assam": [
    "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo",
    "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao",
    "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan",
    "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli",
    "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar",
    "Tinsukia", "Udalguri", "West Karbi Anglong"
  ],
  "Bihar": [
    "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur",
    "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj",
    "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj",
    "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda",
    "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran",
    "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"
  ],
  "Chhattisgarh": [
    "Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur",
    "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa",
    "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund",
    "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma",
    "Surajpur", "Surguja"
  ],
  "Goa": [
    "North Goa", "South Goa"
  ],
  "Gujarat": [
    "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch",
    "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka",
    "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch",
    "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal",
    "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar",
    "Tapi", "Vadodara", "Valsad"
  ],
  "Haryana": [
    "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram",
    "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh",
    "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa",
    "Sonipat", "Yamunanagar"
  ],
  "Himachal Pradesh": [
    "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti",
    "Mandi", "Shimla", "Sirmaur", "Solan", "Una"
  ],
  "Jharkhand": [
    "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum",
    "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti",
    "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi",
    "Sahebganj", "Seraikela-Kharsawan", "Simdega", "West Singhbhum"
  ],
  "Karnataka": [
    "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
    "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
    "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri",
    "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur",
    "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"
  ],
  "Kerala": [
    "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam",
    "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta",
    "Thiruvananthapuram", "Thrissur", "Wayanad"
  ],
  "Madhya Pradesh": [
    "Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani",
    "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh",
    "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad",
    "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla",
    "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Niwari", "Panna", "Raisen",
    "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol",
    "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain",
    "Umaria", "Vidisha"
  ],
  "Maharashtra": [
    "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana",
    "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna",
    "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded",
    "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad",
    "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha",
    "Washim", "Yavatmal"
  ],
  "Manipur": [
    "Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West",
    "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl",
    "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"
  ],
  "Meghalaya": [
    "East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills",
    "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills",
    "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"
  ],
  "Mizoram": [
    "Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha",
    "Serchhip", "Hnahthial", "Khawzawl", "Saitual"
  ],
  "Nagaland": [
    "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren",
    "Phek", "Tuensang", "Wokha", "Zunheboto"
  ],
  "Odisha": [
    "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack",
    "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur",
    "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha",
    "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada",
    "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
  ],
  "Punjab": [
    "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka",
    "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana",
    "Mansa", "Moga", "Mohali", "Muktsar", "Pathankot", "Patiala", "Rupnagar",
    "Sangrur", "Shaheed Bhagat Singh Nagar", "Tarn Taran"
  ],
  "Rajasthan": [
    "Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara",
    "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur",
    "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu",
    "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand",
    "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"
  ],
  "Sikkim": [
    "East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"
  ],
  "Tamil Nadu": [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
    "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
    "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal",
    "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem",
    "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli",
    "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai",
    "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
  ],
  "Telangana": [
    "Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon",
    "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar",
    "Khammam", "Komaram Bheem", "Mahabubabad", "Mahbubnagar", "Mancherial",
    "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda",
    "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla",
    "Ranga Reddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy",
    "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"
  ],
  "Tripura": [
    "Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura",
    "Unakoti", "West Tripura"
  ],
  "Uttar Pradesh": [
    "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Azamgarh",
    "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly",
    "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot",
    "Deoria", "Etah", "Etawah", "Ayodhya", "Farrukhabad", "Fatehpur", "Firozabad",
    "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur",
    "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj",
    "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kushinagar", "Lakhimpur Kheri",
    "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau",
    "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh",
    "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar",
    "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra",
    "Sultanpur", "Unnao", "Varanasi"
  ],
  "Uttarakhand": [
    "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar",
    "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal",
    "Udham Singh Nagar", "Uttarkashi"
  ],
  "West Bengal": [
    "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur",
    "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong",
    "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman",
    "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia",
    "South 24 Parganas", "Uttar Dinajpur"
  ],
  "Andaman and Nicobar Islands": [
    "Nicobar", "North and Middle Andaman", "South Andaman"
  ],
  "Chandigarh": [
    "Chandigarh"
  ],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Dadra and Nagar Haveli", "Daman", "Diu"
  ],
  "Delhi": [
    "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi",
    "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"
  ],
  "Jammu and Kashmir": [
    "Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu",
    "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri",
    "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"
  ],
  "Ladakh": [
    "Kargil", "Leh"
  ],
  "Lakshadweep": [
    "Lakshadweep"
  ],
  "Puducherry": [
    "Karaikal", "Mahe", "Puducherry", "Yanam"
  ]
};

// Indian pincode regex - 6 digits, first digit cannot be 0
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

/**
 * Validate Indian pincode format using regex
 * @param {string} pincode - The pincode to validate
 * @returns {boolean} - Whether the pincode is valid
 */
const validatePincodeFormat = (pincode) => {
  if (!pincode) return false;
  return PINCODE_REGEX.test(pincode.toString().trim());
};

/**
 * Validate pincode using India Post API
 * @param {string} pincode - The pincode to validate
 * @returns {Promise<Object>} - Validation result with details
 */
const validatePincodeWithAPI = async (pincode) => {
  try {
    console.log(`[Pincode API] Validating pincode: ${pincode}`);
    
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`, {
      timeout: 5000 // 5 second timeout
    });
    
    console.log(`[Pincode API] Response status: ${response.data[0]?.Status}`);
    
    if (response.data && response.data[0] && response.data[0].Status === 'Success') {
      const postOffices = response.data[0].PostOffice;
      if (postOffices && postOffices.length > 0) {
        const postOffice = postOffices[0];
        console.log(`[Pincode API] Verified: ${postOffice.District}, ${postOffice.State}`);
        return {
          isValid: true,
          state: postOffice.State,
          district: postOffice.District,
          city: postOffice.Division || postOffice.Region,
          postOfficeName: postOffice.Name,
          message: 'Pincode verified successfully'
        };
      }
    }
    
    console.log(`[Pincode API] Pincode not found in database`);
    return {
      isValid: false,
      message: 'Invalid pincode'
    };
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error(`[Pincode API] Timeout: Request took longer than 5 seconds`);
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error(`[Pincode API] Network error: Cannot reach api.postalpincode.in`);
    } else {
      console.error(`[Pincode API] Error: ${error.message}`);
    }
    // If API fails, return null to fallback to regex validation
    return null;
  }
};

/**
 * Comprehensive pincode validation - tries API first, falls back to regex
 * @param {string} pincode - The pincode to validate
 * @returns {Promise<Object>} - Validation result
 */
const validatePincode = async (pincode) => {
  // First check format with regex
  const formatValid = validatePincodeFormat(pincode);
  
  if (!formatValid) {
    return {
      isValid: false,
      message: 'Invalid pincode format. Must be 6 digits and cannot start with 0.'
    };
  }
  
  // Try API validation
  const apiResult = await validatePincodeWithAPI(pincode);
  
  // If API validation succeeded (pincode found in database)
  if (apiResult && apiResult.isValid) {
    return apiResult;
  }
  
  // If API explicitly says invalid (pincode not found in database), reject it
  if (apiResult && !apiResult.isValid) {
    return {
      isValid: false,
      message: 'Invalid pincode - not found in India Post database'
    };
  }
  
  // If API failed to respond (null = network error/timeout), accept with regex only
  if (apiResult === null) {
    return {
      isValid: true,
      message: 'Pincode format is valid (API verification unavailable)',
      verifiedBy: 'regex'
    };
  }
  
  return {
    isValid: false,
    message: 'Invalid pincode'
  };
};

/**
 * Get list of all Indian states
 * @returns {Array<string>} - Array of state names
 */
const getStates = () => {
  return Object.keys(INDIAN_STATES_DISTRICTS).sort();
};

/**
 * Get districts for a specific state
 * @param {string} state - The state name
 * @returns {Array<string>} - Array of district names
 */
const getDistrictsByState = (state) => {
  if (!state) return [];
  
  const districts = INDIAN_STATES_DISTRICTS[state];
  return districts ? districts.sort() : [];
};

/**
 * Validate if a state exists
 * @param {string} state - The state name
 * @returns {boolean} - Whether the state is valid
 */
const validateState = (state) => {
  if (!state) return false;
  return INDIAN_STATES_DISTRICTS.hasOwnProperty(state);
};

/**
 * Validate if a district belongs to a state
 * @param {string} state - The state name
 * @param {string} district - The district name
 * @returns {boolean} - Whether the district belongs to the state
 */
const validateDistrict = (state, district) => {
  if (!state || !district) return false;
  
  const districts = INDIAN_STATES_DISTRICTS[state];
  if (!districts) return false;
  
  return districts.includes(district);
};

/**
 * Validate complete Indian address
 * @param {Object} addressData - Address data to validate
 * @returns {Promise<Object>} - Validation result
 */
const validateIndianAddress = async (addressData) => {
  const { state, district, postalCode, country } = addressData;
  
  const errors = [];
  
  // Validate country - must be India
  if (country && country.toLowerCase() !== 'india') {
    errors.push('Only Indian addresses are supported. Country must be India.');
  }
  
  // Validate state
  if (!state) {
    errors.push('State is required');
  } else if (!validateState(state)) {
    errors.push(`Invalid state: ${state}`);
  }
  
  // Validate district
  if (!district) {
    errors.push('District is required');
  } else if (state && !validateDistrict(state, district)) {
    errors.push(`District ${district} does not belong to ${state}`);
  }
  
  // Validate pincode
  let pincodeValidation = null;
  if (!postalCode) {
    errors.push('Postal code is required');
  } else {
    pincodeValidation = await validatePincode(postalCode);
    if (!pincodeValidation.isValid) {
      errors.push(pincodeValidation.message);
    }
  }
  
  if (errors.length > 0) {
    return {
      isValid: false,
      errors
    };
  }
  
  return {
    isValid: true,
    message: 'Address validated successfully',
    pincodeDetails: pincodeValidation
  };
};

/**
 * Validates if the pincode belongs to the specified state and district
 * @param {string} pincode - The pincode to validate
 * @param {string} state - The state to match against
 * @param {string} district - The district to match against
 * @returns {Object} - {isValid: boolean, message: string}
 */
async function validatePincodeMatchesAddress(pincode, state, district) {
  try {
    // First validate the pincode itself
    const pincodeValidation = await validatePincode(pincode);
    
    if (!pincodeValidation.isValid) {
      return {
        isValid: false,
        message: pincodeValidation.message || 'Invalid pincode'
      };
    }
    
    // If we have state and district from API, check if they match
    if (pincodeValidation.state && pincodeValidation.district) {
      const stateMatches = pincodeValidation.state.toLowerCase() === state.toLowerCase();
      const districtMatches = pincodeValidation.district.toLowerCase() === district.toLowerCase();
      
      if (!stateMatches || !districtMatches) {
        let mismatchDetails = [];
        if (!stateMatches) {
          mismatchDetails.push(`State mismatch: Pincode belongs to ${pincodeValidation.state}, but you selected ${state}`);
        }
        if (!districtMatches) {
          mismatchDetails.push(`District mismatch: Pincode belongs to ${pincodeValidation.district}, but you selected ${district}`);
        }
        
        return {
          isValid: false,
          message: mismatchDetails.join('. '),
          correctState: pincodeValidation.state,
          correctDistrict: pincodeValidation.district
        };
      }
      
      return {
        isValid: true,
        message: 'Address details match pincode',
        state: pincodeValidation.state,
        district: pincodeValidation.district
      };
    }
    
    // If API didn't return location (regex fallback), just check if district is valid for state
    const districtExists = checkDistrictInState(state, district);
    if (!districtExists) {
      return {
        isValid: false,
        message: `${district} is not a valid district in ${state}`
      };
    }
    
    return {
      isValid: true,
      message: 'Address format is valid (API verification unavailable)'
    };
    
  } catch (error) {
    console.error('[Address Validation] Error validating address match:', error.message);
    return {
      isValid: false,
      message: 'Error validating address: ' + error.message
    };
  }
}

/**
 * Checks if a district exists in a state
 * @param {string} state - The state name
 * @param {string} district - The district name
 * @returns {boolean} - true if district exists in state
 */
function checkDistrictInState(state, district) {
  const stateData = INDIAN_STATES_DISTRICTS[state];
  if (!stateData || !stateData.districts) {
    return false;
  }
  
  return stateData.districts.some(
    d => d.toLowerCase() === district.toLowerCase()
  );
}

module.exports = {
  validatePincode,
  validatePincodeFormat,
  validatePincodeWithAPI,
  getStates,
  getDistrictsByState,
  validateState,
  validateDistrict,
  validateIndianAddress,
  validatePincodeMatchesAddress,
  checkDistrictInState,
  INDIAN_STATES_DISTRICTS
};
