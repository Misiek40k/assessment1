const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { calculateAveragePrice } = require('../utils/stats');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

let cachedStats = null;
let lastMtime = null;

// GET /api/stats
router.get('/', async (_, res, next) => {
  try {
    const stats = await fs.stat(DATA_PATH);
    const mtime = stats.mtimeMs;

    if (cachedStats && mtime === lastMtime) {
      return res.json(cachedStats);
    }

    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const items = JSON.parse(raw);

    if (!items.length) {
      return res.json({ total: 0, averagePrice: 0 });
    }

    cachedStats = {
      total: items.length,
      averagePrice: calculateAveragePrice(items)
    };
    lastMtime = mtime;

    res.json(cachedStats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;