const request = require('supertest');
const express = require('express');
const { login } = require('../controllers/loginController');

const app = express();
app.use(express.json());

//Mock route for login
app.post('/api/login', login);

describe('Login API', () => {

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'amy@email.com', password: '1234' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.name).toBe('Amy');
    expect(res.body.user.email).toBe('amy@email.com');
  });

  it('should fail login with wrong email', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'wrong@email.com', password: '1234' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'amy@email.com', password: 'wrongpass' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  //for missing password scenario
  it('should fail login if email or password is missing', async () => {
    let res = await request(app)
      .post('/api/login')
      .send({ email: 'amy@email.com' }); 

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');

    //for missing email scenario
    res = await request(app)
      .post('/api/login')
      .send({ password: '1234' }); 

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

});
