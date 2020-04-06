import * as functions from 'firebase-functions';
import { IncomingWebhook } from '@slack/webhook';
const slackWebHookURL: string = functions.config()?.slack?.webhook_url ?? '';

export async function sendSlackWebhook (co2: number) : Promise<any> {
  if (!slackWebHookURL) {
    return Promise.resolve();
  }
  const webhook = new IncomingWebhook(slackWebHookURL);
  try {
    const message = `現在のCo2濃度： ${co2} ppm`;
    return webhook.send({
      text: message
    });
  } catch (error) {
    console.error(`Error occuered in sendSlack: ${error}`, error);
    return Promise.reject();
  }
}
