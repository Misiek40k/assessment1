const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let cachedData = null;

const loadDataIntoCache = async () => {
  try {
    const rawData = await fs.readFile(DATA_PATH, 'utf8');
    cachedData = JSON.parse(rawData);
    console.log("Cache updated.");
  } catch (err) {
    console.error("Error refreshing cache:", err);
  }
}

loadDataIntoCache();

fs.watch(DATA_PATH, (eventType) => {
  if (eventType === 'change') {
    console.log("Change detected in file, refreshing cache...");
    loadDataIntoCache();
  }
});

const readData = async () => {
  if (!cachedData) {
    await loadDataIntoCache();
  }
  return cachedData;
};

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { q, limit = 20, page = 1 } = req.query;
    
    const pageSize = parseInt(limit);
    const currentPage = parseInt(page);
    let results = data;

    if (q) {
      const searchTerm = q.toLowerCase();

      results = results.filter(item => 
        item.name.toLowerCase().includes(searchTerm)
      );
    }

    const totalItems = results.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const offset = (currentPage - 1) * pageSize;

    const paginatedResults = results.slice(offset, offset + pageSize);

    res.json({
      metadata: {
        totalItems,
        totalPages,
        currentPage,
        pageSize,
        isLast: currentPage >= totalPages
      },
      data: paginatedResults
    });

  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    const item = req.body;
    const data = await readData();
    item.id = Date.now();
    data.push(item);
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;