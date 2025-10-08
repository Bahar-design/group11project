const request = require('supertest');
const express = require('express');
const { registerUser } = require('../controllers/registrationController');

const app = express();
app.use(express.json());
app.post('/api/register', registerUser);

describe('Registration Controller', () => {

  beforeEach(() => {
    
    const module = require('../controllers/registrationController');
    module.users = [
      { email: "amy@example.com", password: "1234" },
      { email: "bob@example.com", password: "abcd" },
      { email: "carol@example.com", password: "pass" },
    ];
  });

  it('should register a new user successfully', async () => {
    const newUser = { email: 'dave@example.com', password: 'xyz' };
    const res = await request(app).post('/api/register').send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
    expect(res.body.user).toEqual(newUser);
  });

  it('should fail if email is missing', async () => {
    const res = await request(app).post('/api/register').send({ password: '123' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Please type email and password');
  });

  it('should fail if password is missing', async () => {
    const res = await request(app).post('/api/register').send({ email: 'test@example.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Please type email and password');
  });

  it('should fail if user already exists', async () => {
    const existingUser = { email: 'amy@example.com', password: '1234' };
    const res = await request(app).post('/api/register').send(existingUser);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });
});
