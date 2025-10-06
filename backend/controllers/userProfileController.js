const { validateUserProfile } = require('../validators/userProfileValidator');


// Hardcoded volunteer and admin profiles (simulate DB)
let volunteerProfile = {
  name: 'Sarah Johnson',
  email: 'sarah.j@email.com',
  phone: '713-555-0123',
  address1: '123 Main St',
  address2: '',
  city: 'Sugar Land',
  state: 'TX',
  zipCode: '77479',
  emergencyContact: 'Mike Johnson - 713-555-0124',
  skills: ['Tailoring & Alterations', 'Customer Service'],
  preferences: '',
  availability: ['2025-10-10', '2025-10-15'],
  travelRadius: '20 miles',
  hasTransportation: true,
  primaryLocation: 'Sugar Land',
  userType: 'volunteer',
};

let adminProfile = {
  name: 'Maria Delgado',
  email: 'maria.d@houstonhearts.org',
  phone: '713-555-0100',
  address1: '456 Admin Ave',
  address2: '',
  city: 'Houston',
  state: 'TX',
  zipCode: '77001',
  adminLevel: 'Regional Administrator',
  department: 'Southwest Regional Operations',
  startDate: '2023-06-15',
  emergencyContact: 'Regional Director - (713) 555-0001',
  regions: ['Sugar Land', 'Katy', 'Southwest Houston'],
  userType: 'admin',
};


function getUserProfile(req, res) {
  const type = req.query.type === 'admin' ? 'admin' : 'volunteer';
  if (type === 'admin') {
    res.json(adminProfile);
  } else {
    res.json(volunteerProfile);
  }
}


function updateUserProfile(req, res, next) {
  const type = req.query.type === 'admin' ? 'admin' : 'volunteer';
  const { error, value } = validateUserProfile(req.body);
  if (error) {
    error.status = 400;
    return next(error);
  }
  if (type === 'admin') {
    adminProfile = { ...adminProfile, ...value };
    res.json(adminProfile);
  } else {
    volunteerProfile = { ...volunteerProfile, ...value };
    res.json(volunteerProfile);
  }
}

module.exports = { getUserProfile, updateUserProfile };