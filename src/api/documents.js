const express = require('express');
const { documentsRef } = require('../service/firebase');

const router = express.Router();

router.get('/', async (req, res) => {
  const documents = await documentsRef.get();
  res.json(documents.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = await documentsRef.doc(id).get();
    res.json(document.data());
  } catch (error) {
    res.sendStatus(500);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { list , name } = req.body;
    await documentsRef.doc(id).update({list , name});
    res.sendStatus(200);
  } catch (error) {
    console.log(error)
    res.sendStatus(500);
  }
});

router.post('/', async (req, res) => {
  try {
    const { list , name } = req.body;
    let newKeyRef = await documentsRef.add({list , name})
    res.json(newKeyRef.id);
  } catch (error) {
    console.log(error)
    res.sendStatus(500);
  }
});
module.exports = router;
