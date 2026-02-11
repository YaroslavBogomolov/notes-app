const request = require('supertest');
const { app, db, initDB } = require('../src/server');

describe('Notes API', () => {
  beforeAll(async () => {
    await initDB();
    await db.query('DELETE FROM notes');
  });

  afterEach(async () => {
    await db.query('DELETE FROM notes');
  });

  test('GET /health - should return OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  test('GET /api/notes - empty array when no notes', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('GET /api/notes - returns notes after creation', async () => {
    await db.query('INSERT INTO notes (title) VALUES ($1)', ['Test']);
    const res = await request(app).get('/api/notes');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Test');
  });

  test('POST /api/notes - creates a new note', async () => {
    const newNote = { title: 'Shopping', content: 'Milk' };
    const res = await request(app).post('/api/notes').send(newNote);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Shopping');
    expect(res.body.content).toBe('Milk');
  });

  test('POST /api/notes - returns 400 if title is missing', async () => {
    const res = await request(app).post('/api/notes').send({ content: 'No title' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });

  test('DELETE /api/notes/:id - deletes existing note', async () => {
    const insert = await db.query('INSERT INTO notes (title) VALUES ($1) RETURNING id', ['DeleteMe']);
    const noteId = insert.rows[0].id;
    const res = await request(app).delete(`/api/notes/${noteId}`);
    expect(res.status).toBe(204);
  });

  test('DELETE /api/notes/:id - returns 404 for non-existent note', async () => {
    const res = await request(app).delete('/api/notes/999999');
    expect(res.status).toBe(404);
  });

  test('DELETE /api/notes/:id - returns 400 for invalid ID', async () => {
    const res = await request(app).delete('/api/notes/abc');
    expect(res.status).toBe(400);
  });
});