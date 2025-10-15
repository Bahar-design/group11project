// Validation for user profile fields
// Returns { error, value }
function validateUserProfile(data) {
  const errors = [];
  const value = {};


  // Required fields
  const requiredFields = [
    'name', 'email', 'phone', 'address1', 'city', 'state', 'zipCode'
  ];
  requiredFields.forEach(field => {
    if (!data[field] || typeof data[field] !== 'string' || !data[field].trim()) {
      errors.push(`${field} is required and must be a non-empty string.`);
    } else {
      value[field] = data[field].trim();
    }
  });

  // Skills (multi-select, required, must be non-empty array of strings)
  if (!Array.isArray(data.skills) || data.skills.length === 0) {
    errors.push('At least one skill must be selected.');
  } else if (!data.skills.every(s => typeof s === 'string' && s.trim().length > 0)) {
    errors.push('All skills must be non-empty strings.');
  } else {
    value.skills = data.skills;
  }

  // Availability (multi-date, required, must be non-empty array)
  if (!Array.isArray(data.availability) || data.availability.length === 0) {
    errors.push('At least one available date must be selected.');
  } else {
    value.availability = data.availability;
  }

  // Email format
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push('Invalid email format.');
  }

  // Phone format (simple US)
  if (data.phone && !/^\d{3}-\d{3}-\d{4}$/.test(data.phone)) {
    errors.push('Phone must be in format 999-999-9999.');
  }

  // State
  const allowedStates = ['TX', 'CA', 'NY', 'FL'];
  if (data.state && !allowedStates.includes(data.state)) {
    errors.push('State must be one of: ' + allowedStates.join(', '));
  }

  // Zip code
  if (data.zipCode && !/^\d{5,9}$/.test(data.zipCode)) {
    errors.push('Zip code must be 5-9 digits.');
  }

  // Optional fields
  value.address2 = typeof data.address2 === 'string' ? data.address2.trim() : '';
  value.adminLevel = data.adminLevel || '';
  value.department = data.department || '';
  value.startDate = data.startDate || '';
  value.emergencyContact = data.emergencyContact || '';
  value.regions = Array.isArray(data.regions) ? data.regions : [];
  value.skills = Array.isArray(data.skills) ? data.skills : [];
  value.preferences = typeof data.preferences === 'string' ? data.preferences : '';
  value.availability = Array.isArray(data.availability) ? data.availability : [];
  value.travelRadius = data.travelRadius || '';
  value.hasTransportation = typeof data.hasTransportation === 'boolean' ? data.hasTransportation : true;
  value.primaryLocation = data.primaryLocation || '';
  value.userType = data.userType || '';

  if (errors.length > 0) {
    return { error: new Error(errors.join(' ')), value: null };
  }
  return { error: null, value };
}

module.exports = { validateUserProfile };