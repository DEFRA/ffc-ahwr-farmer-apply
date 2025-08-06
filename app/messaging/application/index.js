import { sendMessage } from "../send-message.js";
import { receiveMessage } from "../receive-message.js";
import { states } from "../../constants/constants.js";
import {
  applicationRequestMsgType,
  applicationRequestQueue,
  applicationResponseQueue,
} from "../../config/messaging.js";

export async function sendApplication(application, sessionId) {
  await sendMessage(
    application,
    applicationRequestMsgType,
    applicationRequestQueue,
    { sessionId },
  );
  const response = await receiveMessage(sessionId, applicationResponseQueue);

  if (response?.applicationState !== states.submitted) {
    // throws an error in the above function
    return undefined;
  }

  return response?.applicationReference;
}
