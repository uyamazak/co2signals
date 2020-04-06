import * as functions from 'firebase-functions';
import axios from 'axios';
const chatworkRoomId: string = functions.config()?.chatwork?.room_id ?? '';
const chatworkApiToken: string = functions.config()?.chatwork?.api_token ?? '';

// https://developer.chatwork.com/ja/endpoint_rooms.html#POST-rooms-room_id-messages
export async function sendChatWorkApi (co2: number) : Promise<void>{
  if (!chatworkRoomId || !chatworkApiToken) {
    return;
  }
  return axios.post(
    `https://api.chatwork.com/v2/rooms/${chatworkRoomId}/messages`,
    {
      method: 'POST',
      headers: {'X-ChatWorkToken': chatworkApiToken},
      data: {
        body: `現在のCo2濃度： ${co2} ppm`,
        self_unread: 1
      },
      timeout: 1000
    }
  );
}
