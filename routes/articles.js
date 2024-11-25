const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const pool = require('../db/pool');


router.get('/', async (req, res) => {
  const { title, tags, limit = 10, offset = 0 } = req.query;

  let query = `SELECT * FROM articles WHERE 1=1`;
  const values = [];

  if (title) {
    query += ` AND title ILIKE $${values.length + 1}`;
    values.push(`%${title}%`);
  }

  if (tags) {
    query += ` AND tags ILIKE $${values.length + 1}`;
    values.push(`%${tags}%`);
  }

  query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(Number(limit), Number(offset));

  try {
    const result = await pool.query(query, values);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});


router.get('/:id', param('id').isInt().withMessage('ID must be an integer'), async (req, res) => {
    const { id } = req.params;
  
    try {
      const query = 'SELECT * FROM articles WHERE id = $1;';
      const values = [id];
  
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }
  
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({ error: 'Failed to fetch article' });
    }
  });

  

router.post(
  '/',
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 255 }).withMessage('Title cannot be longer than 255 characters'),
  body('content').notEmpty().withMessage('Content is required'),
  body('tags').optional().isLength({ max: 255 }).withMessage('Tags cannot be longer than 255 characters'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, tags } = req.body;

    try {
      const query = `
        INSERT INTO articles (title, content, tags)
        VALUES ($1, $2, $3) RETURNING *;
      `;
      const values = [title, content, tags];

      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'Failed to insert data' });
    }
  }
);


router.delete('/:id', param('id').isInt().withMessage('ID must be an integer'), async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM articles WHERE id = $1 RETURNING *;';
    const values = [id];

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.status(200).json({ message: 'Article deleted successfully', article: result.rows[0] });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

module.exports = router;
