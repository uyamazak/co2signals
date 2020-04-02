import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { IncomingWebhook } from '@slack/webhook';
admin.initializeApp()
const firestore = admin.firestore();
const token: string = functions.config().raspi.token;
const slackWebHookURL: string = functions.config().slack.webhook_url;
const slackWebHookCo2ThresholdPpm: number = 1500;

interface co2Doc {
  co2: number,
  temperature: number,
  timestamp: admin.firestore.FieldValue,
}

async function sendSlackWebhook (co2: number) : Promise<void>{
  if (!slackWebHookURL) {
    return;
  }
  const webhook = new IncomingWebhook(slackWebHookURL);
  try {
    const message = `現在のCo2濃度： ${co2} ppm`;
    await webhook.send({
      text: message
    });
    console.log(`send slack ${message}`);
  } catch (error) {
    console.error(`Error occuered in sendSlack: ${error}`, error);
  }
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
  const co2 = Number(req.query.co2)
  const doc: co2Doc = {
    co2: co2,
    temperature: Number(req.query.temperature),
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  };
  await firestore.collection(`/${location}/`).add(doc);
  if (co2 > slackWebHookCo2ThresholdPpm) {
    await sendSlackWebhook(co2);
  }
  res.status(200).send("OK");
  return true;
});
