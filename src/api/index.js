const express = require('express');

const jurisdictions = require('./jurisdictions');
const documents = require('./documents');
const countries = require('./countries');
const authentication = require('./authentication');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});

router.use('/jurisdictions', jurisdictions);
router.use('/documents', documents);
router.use('/countries', countries);
router.use('/authentication', authentication);

module.exports = router;
