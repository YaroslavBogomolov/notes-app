const request = require('supertest');
const { app, db, initDB, closePool } = require('../src/server');

describe('Notes API', () => {
  beforeAll(async () => {
    await initDB();
    await db.query('DELETE FROM notes');
  });

  afterEach(async () => {
    await db.query('DELETE FROM notes');
  });

  afterAll(async () => {
    await closePool();
  });

  describe('GET /health', () => {
    it('should return OK', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.service).toBe('Notes API');
    });
  });

  describe('GET /api/notes', () => {
    it('should return empty array when no notes', async () => {
      const res = await request(app).get('/api/notes');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return notes after creation', async () => {
      await db.query('INSERT INTO notes (title, content) VALUES ($1, $2)', ['Test', 'Content']);
      const res = await request(app).get('/api/notes');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Test');
      expect(res.body[0].content).toBe('Content');
    });
  });

  describe('POST /api/notes', () => {
    it('should create a new note', async () => {
      const newNote = { title: 'Shopping', content: 'Milk' };
      const res = await request(app).post('/api/notes').send(newNote);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Shopping');
      expect(res.body.content).toBe('Milk');
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app).post('/api/notes').send({ content: 'No title' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title is required');
    });

    it('should return 400 if title is empty', async () => {
      const res = await request(app).post('/api/notes').send({ title: '   ', content: 'Empty' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title is required');
    });
  });

  describe('DELETE /api/notes/:id', () => {
    let noteId;

    beforeEach(async () => {
      const insert = await db.query(
        'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING id',
        ['ToDelete', 'Something']
      );
      noteId = insert.rows[0].id;
    });

    it('should delete existing note', async () => {
      const res = await request(app).delete(`/api/notes/${noteId}`);
      expect(res.status).toBe(204);
    });

    it('should return 404 for non-existent note', async () => {
      const res = await request(app).delete('/api/notes/999999');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Note not found');
    });

    it('should return 400 for invalid ID (abc)', async () => {
      const res = await request(app).delete('/api/notes/abc');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid note ID');
    });

    it('should return 400 for zero ID', async () => {
      const res = await request(app).delete('/api/notes/0');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid note ID');
    });

    it('should return 400 for negative ID', async () => {
      const res = await request(app).delete('/api/notes/-5');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid note ID');
    });

    it('should return 400 for ID with leading zeros', async () => {
      const res = await request(app).delete('/api/notes/01');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid note ID');
    });
  });
});