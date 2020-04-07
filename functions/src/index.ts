import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendSlackWebhook } from './slack';
import { sendChatWorkApi } from './chatwork';

admin.initializeApp()
const firestore = admin.firestore();
const token: string = functions.config().raspi.token;
const sendMessageThresholdCo2Ppm: number = 1500;

interface co2Doc {
  co2: number,
  temperature: number,
  timestamp: admin.firestore.FieldValue,
}

function handleApiError (error: Error): void {
  console.log(error);
}

exports.add = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
  if (req.query.token !== token) {
    res.status(401).send('Invalid token.');
    return false;
  }
  const location = functions.config().raspi.location;
  if (!location || !req.query.co2 || !req.query.temperature) {
    res.status(400).send("bad request. location, co2, temperature are required.");
    return false;
  }
  const co2 = Number(req.query.co2)
  const doc: co2Doc = {
    co2: co2,
    temperature: Number(req.query.temperature),
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  };
  await firestore.collection(`/${location}/`).add(doc);

  // Co2が閾値を超えていて、かつRaspberry Pi側からneeds_alert=1が来たときだけ送る
  const needsAlert: number = Number(req.query.needs_alert ?? 0)
  if (needsAlert && co2 > sendMessageThresholdCo2Ppm) {
    await Promise.all(
      [
        sendSlackWebhook(co2),
        sendChatWorkApi(co2)
      ]
    ).catch(handleApiError)
  }

  res.status(200).send("OK");
  return true;
});
