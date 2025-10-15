const { validateEvent } = require('../validators/eventValidator');

describe('validateEvent', () => {
  it('should pass with valid data', () => {
    const data = {
      name: 'Test Event',
      description: 'A test event',
      location: 'Houston',
      requiredSkills: ['Sewing'],
      urgency: 'High',
      date: '2025-12-01'
    };
    const { error, value } = validateEvent(data);
    expect(error).toBeNull();
    expect(value.name).toBe('Test Event');
    expect(value.requiredSkills).toContain('Sewing');
  });

  it('should fail if required fields are missing', () => {
    const data = { description: '', location: '', requiredSkills: [], urgency: '', date: '' };
    const { error } = validateEvent(data);
    expect(error).not.toBeNull();
    expect(error.message).toMatch(/Event name is required/);
  });

  it('should fail if name is too long', () => {
    const data = {
      name: 'A'.repeat(101),
      description: 'desc',
      location: 'loc',
      requiredSkills: ['Sewing'],
      urgency: 'Low',
      date: '2025-12-01'
    };
    const { error } = validateEvent(data);
    expect(error).not.toBeNull();
    expect(error.message).toMatch(/at most 100 characters/);
  });

  it('should fail if requiredSkills is missing or empty', () => {
    const base = {
      name: 'Event',
      description: 'desc',
      location: 'loc',
      urgency: 'Low',
      date: '2025-12-01'
    };
    let { error } = validateEvent({ ...base, requiredSkills: undefined });
    expect(error).not.toBeNull();
    expect(error.message).toMatch(/required skill/);
    error = validateEvent({ ...base, requiredSkills: [] }).error;
    expect(error).not.toBeNull();
    expect(error.message).toMatch(/required skill/);
  });

  it('should fail if urgency is invalid', () => {
    const data = {
      name: 'Event',
      description: 'desc',
      location: 'loc',
      requiredSkills: ['Sewing'],
      urgency: 'Invalid',
      date: '2025-12-01'
    };
    const { error } = validateEvent(data);
    expect(error).not.toBeNull();
    expect(error.message).toMatch(/Urgency is required/);
  });

  it('should fail if date is invalid', () => {
    const data = {
      name: 'Event',
      description: 'desc',
      location: 'loc',
      requiredSkills: ['Sewing'],
      urgency: 'Low',
      date: '12-01-2025'
    };
    const { error } = validateEvent(data);
    expect(error).not.toBeNull();
    expect(error.message).toMatch(/YYYY-MM-DD/);
  });
});
