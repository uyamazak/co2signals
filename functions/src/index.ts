import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp()
const firestore = admin.firestore();
const token = functions.config().raspi.token;

interface co2Doc {
  co2: number,
  temperature: number,
  timestamp: admin.firestore.FieldValue,
}

exports.add = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  if (req.query.token !== token) {
    res.status(401).send("invalid token");
    return false;
  }
  const location = functions.config().raspi.location;
  if (!location || !req.query.co2 || !req.query.temperature) {
    res.status(400).send("bad request. location, co2, temperature are required.");
    return false;
  }
  const doc: co2Doc = {
    co2: Number(req.query.co2),
    temperature: Number(req.query.temperature),
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  };

  await firestore.collection(`/${location}/`).add(doc);
  res.status(200).send("OK");
  return true;
});
