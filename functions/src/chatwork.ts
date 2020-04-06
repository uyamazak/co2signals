import axios from 'axios';
import * as functions from 'firebase-functions';
import * as qs from 'qs';

const chatworkRoomId: string = functions.config()?.chatwork?.room_id ?? '';
const chatworkApiToken: string = functions.config()?.chatwork?.api_token ?? '';

// https://developer.chatwork.com/ja/endpoint_rooms.html#POST-rooms-room_id-messages
export async function sendChatWorkApi (co2: number): Promise<any>{
  if (!chatworkRoomId || !chatworkApiToken) {
    return Promise.resolve();
  }
  return axios.post(
    `https://api.chatwork.com/v2/rooms/${chatworkRoomId}/messages`,
    qs.stringify({
      body: `現在のCo2濃度： ${co2} ppm`,
      self_unread: 1
    }),
    {
      headers: {'X-ChatWorkToken': chatworkApiToken},
      timeout: 1000
    }
  ).catch(e => console.log(e));
}
