const express = require("express");
const { jurisdictionsRef } = require("../service/firebase");
const { route } = require("./authentication");
const { firebaseStore, firebase } = require("../service/firebase");
const client = require("../service/redisClient");

const router = express.Router();

router.get("/", async (req, res) => {
  client.get("jurisdictions", async (err, val) => {
    if (val) {
      res.json(JSON.parse(val));
    } else {
      const jurisdictions = await jurisdictionsRef.get();
      transformData = jurisdictions.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      client.setex("jurisdictions", 3600, JSON.stringify(transformData));
      res.json(transformData);
    }
  });
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let key = `jurisdiction-${id}`;
    client.get(key, async (err, val) => {
      if (val) {
        console.log('Somwting')
        res.json(JSON.parse(val));
      } else {
        const collections = await jurisdictionsRef.doc(id).listCollections()
        const transformData = collections.map(collection => collection.id);
        client.setex(key, 3600, JSON.stringify(transformData));
        res.json(transformData);
      }
    });
  } catch (error) {
    res.sendStatus(500);
  }
});

//get all sub collections like all documents inside Entities
router.get("/:jurisdiction/:entity", async (req, res) => {
  try {
    const { jurisdiction, entity, subEntity } = req.params;
    let key = `${jurisdiction}-${entity}`;
   
    client.get(key, async (err, val) => {
      if (val) {
        res.json(JSON.parse(val));
      } else {
        const result = await jurisdictionsRef
        .doc(jurisdiction)
        .collection(entity)
        .get();
        transformData = result.docs.map((doc) => ({ ...doc.data(), id: doc.id }))  
        client.setex(key, 3600, JSON.stringify(transformData));
        res.json(transformData);
      }
    });
  } catch (error) {
    res.sendStatus(500);
  }
});

// POSTS
router.post("/addJurisdictions", async (req, res) => {
  try {
    const { jurisdictions } = req.body;
    var batch = firebaseStore.batch();
    const res = jurisdictions.forEach(async (doc) => {
      const docRef = await jurisdictionsRef.doc(doc).set({});
      batch.set(docRef, doc);
    });
    await batch.commit().then((data) => {
      console.log(data);
    });
  } catch (error) {
    res.sendStatus(500);
  }
});

//add collection to jurisdiction
router.post('/jurisdictionCollection/:jurisdiction', async (req, res) => {
  try {
    const {jurisdiction} = req.params;
    const {collection} = req.body;
    const result = await jurisdictionsRef.doc(jurisdiction).collection(collection).doc().create({});
    return res.json(result.data());
  } catch (error) {
    res.sendStatus(500);
  }
});


// Create new sub entity document
router.post('/addSubEntity/:updateJurisdiction/:entity', async (req, res) => {
  try {
    const {updateJurisdiction, entity} = req.params;
    const {data} = req.body;
    const result = await jurisdictionsRef.doc(updateJurisdiction).collection(entity).doc(data).set({});
    return res.json(result.data());
  } catch (error) {
    res.sendStatus(500);
  }
});


// Delete new sub entity document
router.post('/removeSubEntity/:updateJurisdiction/:entity', async (req, res) => {
  try {
    const {updateJurisdiction, entity} = req.params;
    const {data} = req.body;
    const result = await jurisdictionsRef.doc(updateJurisdiction).collection(entity).doc(data).delete({});
    return res.json(result.data());
  } catch (error) {
    res.sendStatus(500);
  }
});

// add Sub entity document to array
router.post("/addData/:jurisdiction/:entity/:subEntity", async (req, res) => {
  try {
    const { jurisdiction, entity, subEntity } = req.params;
    const { doc } = req.body;
    const result = await jurisdictionsRef
      .doc(jurisdiction)
      .collection(entity)
      .doc(subEntity)
      .update({
        Documents: firebase.firestore.FieldValue.arrayUnion(doc),
      });
    return res.json(result);
  } catch (error) {
    res.sendStatus(500);
  }
});

// remove Sub entity document to array
router.post("/removeData/:jurisdiction/:entity/:subEntity", async (req, res) => {
    try {
      const { jurisdiction, entity, subEntity } = req.params;
      const { doc } = req.body;
      let key = `${jurisdiction}-${entity}`;
      const result = await jurisdictionsRef
        .doc(jurisdiction)
        .collection(entity)
        .doc(subEntity)
        .update({
          Documents: firebase.firestore.FieldValue.arrayRemove(doc),
        });
      client.del(key);  
      return res.json(result);
    } catch (error) {
      res.sendStatus(500);
    }
  }
);

module.exports = router;
