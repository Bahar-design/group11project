// Validation for event fields
// Returns { error, value }
function validateEvent(data) {
  const errors = [];
  const value = {};

  // Required fields
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Event name is required and must be a non-empty string.');
  } else if (data.name.length > 100) {
    errors.push('Event name must be at most 100 characters.');
  } else {
    value.name = data.name.trim();
  }

  if (!data.description || typeof data.description !== 'string' || !data.description.trim()) {
    errors.push('Event description is required and must be a non-empty string.');
  } else {
    value.description = data.description.trim();
  }

  if (!data.location || typeof data.location !== 'string' || !data.location.trim()) {
    errors.push('Event location is required and must be a non-empty string.');
  } else {
    value.location = data.location.trim();
  }

  // Required skills: array of non-empty strings
  if (!Array.isArray(data.requiredSkills) || data.requiredSkills.length === 0) {
    errors.push('At least one required skill must be selected.');
  } else if (!data.requiredSkills.every(s => typeof s === 'string' && s.trim().length > 0)) {
    errors.push('All required skills must be non-empty strings.');
  } else {
    value.requiredSkills = data.requiredSkills;
  }

  // Urgency: must be one of allowed values
  const allowedUrgency = ['Low', 'Medium', 'High', 'Critical'];
  if (!data.urgency || !allowedUrgency.includes(data.urgency)) {
    errors.push('Urgency is required and must be one of: ' + allowedUrgency.join(', '));
  } else {
    value.urgency = data.urgency;
  }

  // Date: must be a non-empty string (YYYY-MM-DD)
  if (!data.date || typeof data.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.push('Event date is required and must be in YYYY-MM-DD format.');
  } else {
    value.date = data.date;
  }

  if (errors.length > 0) {
    return { error: new Error(errors.join(' ')), value: null };
  }
  return { error: null, value };
}

module.exports = { validateEvent };
