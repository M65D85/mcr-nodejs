const firebase = require('firebase-admin');
const firebaseAccountCredentials = require('../../serviceAccountKey.json');

const serviceAccount = firebaseAccountCredentials;

const db = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://mycob-79efa-default-rtdb.firebaseio.com'
});

const firebaseStore = db.firestore();

const jurisdictionsRef = firebaseStore
  .collection('jurisdictions');

const documentsRef = firebaseStore
  .collection('documents');

const countriesRef = firebaseStore
  .collection('countries');

module.exports = {
  jurisdictionsRef,
  documentsRef,
  countriesRef,
  db,
  firebase,
  firebaseStore,
};