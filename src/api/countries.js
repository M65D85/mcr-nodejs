const express = require('express');
const { countriesRef, firebaseStore } = require('../service/firebase');

const router = express.Router();

// POSTS
router.post('/addCountries', async (req, res) => {
    try {
      const {countries} = req.body; 
      const res = countries.forEach(async (doc) => {
        const docRef = await countriesRef.doc(doc).set({});
      });
    } catch (error) {
      res.sendStatus(500);
    }
  });

router.get('/getCountries', async (req, res) => {
  try {
    const result = await countriesRef.get();
    result.docs.map(doc => {
      console.log(doc.id);
    })
    return res.json(result.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  } catch (error) {
    console.log(error.toString());
    res.sendStatus(500);
  }
}) 

module.exports = router;