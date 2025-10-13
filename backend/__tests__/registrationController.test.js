const request = require('supertest');
const express = require('express');
let { registerUser } = require('../controllers/registrationController');


jest.resetModules();

const app = express();
app.use(express.json());
app.post('/api/register', (req, res) => {
  
  const { registerUser } = require('../controllers/registrationController');
  return registerUser(req, res);
});

describe('Registration Controller', () => {

  beforeEach(() => {
    // Reset the hardcoded users before each test
    jest.resetModules();
  });

  it('should register a new volunteer successfully', async () => {
    const newUser = { email: 'dave@example.com', password: 'xyz' };
    const res = await request(app).post('/api/register').send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Volunteer registered successfully');
    expect(res.body.user.email).toBe('dave@example.com');
    expect(res.body.user.password).toBe('xyz');
  });

  it('should register a new admin successfully when adminID is provided', async () => {
    const newAdmin = { email: 'admin@example.com', password: 'admin123', adminID: '#A1' };
    const res = await request(app).post('/api/register').send(newAdmin);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Admin User registered successfully');
    expect(res.body.user.adminID).toBe('#A1');
  });

  it('should fail if email is missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ password: '123' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Please type email and password');
  });

  it('should fail if password is missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ email: 'test@example.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Please type email and password');
  });

  it('should fail if user already exists', async () => {
    const existingUser = { email: 'amy@example.com', password: '1234' };
    const res = await request(app)
      .post('/api/register')
      .send(existingUser);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });
});
