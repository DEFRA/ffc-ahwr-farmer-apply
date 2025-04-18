import Wreck from "@hapi/wreck";
import FormData from "form-data";
import { authConfig } from "../../config/auth.js";
import { keys } from "../../session/keys.js";
import appInsights from "applicationinsights";
import { getPkcecodes } from "../../session/index.js";

export const redeemAuthorizationCodeForAccessToken = async (request) => {
  try {
    const data = new FormData();
    // The Application (client) ID
    data.append("client_id", authConfig.defraId.clientId);
    data.append("client_secret", authConfig.defraId.clientSecret);
    // Allow apps to declare the resource they want the token for during token redemption.
    data.append("scope", authConfig.defraId.scope);
    // The authorization_code that you acquired in the first leg of the flow.
    data.append("code", request.query.code);
    // Must be authorization_code for the authorization code flow.
    data.append("grant_type", "authorization_code");
    // The same redirect_uri value that was used to acquire the authorization_code.
    data.append("redirect_uri", authConfig.defraId.redirectUri);
    // The same code_verifier that was used to obtain the authorization_code.
    data.append(
      "code_verifier",
      getPkcecodes(request, keys.pkcecodes.verifier),
    );
    const response = await Wreck.post(
      `${authConfig.defraId.hostname}/${authConfig.defraId.policy}/oauth2/v2.0/token`,
      {
        headers: data.getHeaders(),
        payload: data,
        json: true,
      },
    );

    return response.payload;
  } catch (error) {
    appInsights.defaultClient.trackException({ exception: error });
    throw error;
  }
};
