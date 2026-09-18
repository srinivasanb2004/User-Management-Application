import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';

let mongo; let token; let adminId;
before(async () => {
  process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-characters';
  process.env.CLIENT_URL = 'http://localhost:5173';
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  const admin = await User.create({ fullName: 'Test Admin', email: 'admin@example.com', phone: '+12345678901', role: 'admin', passwordHash: await bcrypt.hash('password123456', 4) });
  adminId = String(admin._id);
  const login = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'password123456' });
  assert.equal(login.status, 200);
  token = login.body.token;
});
after(async () => { await mongoose.disconnect(); await mongo?.stop(); });

test('authentication and CRUD flow', async () => {
  assert.equal((await request(app).get('/api/users')).status, 401);
  const invalid = await request(app).post('/api/users').set('Authorization', `Bearer ${token}`).send({ fullName: 'A', email: 'bad', phone: 'x', role: 'user' });
  assert.equal(invalid.status, 400);
  const input = { fullName: 'Alex Rivera', email: 'alex@example.com', phone: '+12345678902', role: 'user' };
  const created = await request(app).post('/api/users').set('Authorization', `Bearer ${token}`).send(input);
  assert.equal(created.status, 201);
  const id = created.body.user.id;
  assert.ok(created.body.user.dateCreated);
  assert.equal((await request(app).post('/api/users').set('Authorization', `Bearer ${token}`).send(input)).status, 409);
  const list = await request(app).get('/api/users?search=alex&page=1&limit=10').set('Authorization', `Bearer ${token}`);
  assert.equal(list.status, 200); assert.equal(list.body.total, 1);
  assert.equal((await request(app).get(`/api/users/${id}`).set('Authorization', `Bearer ${token}`)).body.user.fullName, 'Alex Rivera');
  const updated = await request(app).put(`/api/users/${id}`).set('Authorization', `Bearer ${token}`).send({ ...input, fullName: 'Alex Morgan' });
  assert.equal(updated.status, 200); assert.equal(updated.body.user.fullName, 'Alex Morgan');
  assert.equal((await request(app).delete(`/api/users/${adminId}`).set('Authorization', `Bearer ${token}`)).status, 400);
  assert.equal((await request(app).delete(`/api/users/${id}`).set('Authorization', `Bearer ${token}`)).status, 204);
  assert.equal((await request(app).get(`/api/users/${id}`).set('Authorization', `Bearer ${token}`)).status, 404);
});
