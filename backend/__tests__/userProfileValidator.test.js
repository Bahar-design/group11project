const { validateUserProfile } = require('../validators/userProfileValidator');

describe('validateUserProfile', () => {
  it('should pass with valid data', () => {
    const data = {
      name: 'Test User',
      email: 'test@email.com',
      phone: '123-456-7890',
      address1: '123 Main',
      city: 'Sugar Land',
      state: 'TX',
      zipCode: '77479',
      skills: ['Sewing'],
      availability: ['2025-10-10'],
      hasTransportation: true
    };
    const { error, value } = validateUserProfile(data);
    expect(error).toBeNull();
    expect(value.name).toBe('Test User');
    expect(value.skills).toContain('Sewing');
  });


  it('should fail if skills is missing or empty', () => {
    const base = {
      name: 'Test',
      email: 'test@email.com',
      phone: '123-456-7890',
      address1: '123',
      city: 'City',
      state: 'TX',
      zipCode: '12345',
      availability: ['2025-10-10']
    };
    let { error } = validateUserProfile({ ...base, skills: undefined });
    expect(error).not.toBeNull();
    expect(error.message).toMatch(/skill/);
    error = validateUserProfile({ ...base, skills: [] }).error;
    expect(error).not.toBeNull();
    expect(error.message).toMatch(/skill/);
  });

  it('should fail if availability is missing or empty', () => {
    const base = {
      name: 'Test',
      email: 'test@email.com',
      phone: '123-456-7890',
      address1: '123',
      city: 'City',
      state: 'TX',
      zipCode: '12345',
      skills: ['Sewing']
    };
    let { error } = validateUserProfile({ ...base, availability: undefined });
    expect(error).not.toBeNull();
    expect(error.message).toMatch(/available date/);
    error = validateUserProfile({ ...base, availability: [] }).error;
    expect(error).not.toBeNull();
    expect(error.message).toMatch(/available date/);
  });

  it('should fail on invalid email', () => {
    const data = {
      name: 'Test',
      email: 'bademail',
      phone: '123-456-7890',
      address1: '123',
      city: 'City',
      state: 'TX',
      zipCode: '12345'
    };
    const { error } = validateUserProfile(data);
    expect(error).not.toBeNull();
    expect(error.message).toMatch(/Invalid email format/);
  });

  it('should fail on invalid phone', () => {
    const data = {
      name: 'Test',
      email: 'test@email.com',
      phone: '1234567890',
      address1: '123',
      city: 'City',
      state: 'TX',
      zipCode: '12345'
    };
    const { error } = validateUserProfile(data);
    expect(error).not.toBeNull();
    expect(error.message).toMatch(/Phone must be in format/);
  });

  it('should fail on invalid state', () => {
    const data = {
      name: 'Test',
      email: 'test@email.com',
      phone: '123-456-7890',
      address1: '123',
      city: 'City',
      state: 'ZZ',
      zipCode: '12345'
    };
    const { error } = validateUserProfile(data);
    expect(error).not.toBeNull();
    expect(error.message).toMatch(/State must be one of/);
  });

  it('should fail on invalid zip code', () => {
    const data = {
      name: 'Test',
      email: 'test@email.com',
      phone: '123-456-7890',
      address1: '123',
      city: 'City',
      state: 'TX',
      zipCode: 'abcde'
    };
    const { error } = validateUserProfile(data);
    expect(error).not.toBeNull();
    expect(error.message).toMatch(/Zip code must be/);
  });
});
