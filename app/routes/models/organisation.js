import { getYesNoRadios } from "./form-component/yes-no-radios.js";
import { config } from "../../config/index.js";
import { keys } from "../../session/keys.js";
import { getCustomer, getFarmerApplyData } from "../../session/index.js";
import { requestAuthorizationCodeUrl } from "../../auth/auth-code-grant/request-authorization-code-url.js";

const { confirmCheckDetails } = keys.farmerApplyData;

const labelText = () =>
  config.endemics.enabled
    ? "Are these details correct?"
    : "Are your details correct?";

const formatAddressForDisplay = (organisation) => {
  return organisation?.address?.replaceAll(",", "<br>");
};

export const getOrganisation = (request, organisation, errorText) => {
  const prevAnswer = getFarmerApplyData(request, confirmCheckDetails);
  const { crn } = getCustomer(request);
  const rows = [
    { key: { text: "Farmer name" }, value: { text: organisation.farmerName } },
    { key: { text: "Business name" }, value: { text: organisation.name } },
    { key: { text: "SBI" }, value: { text: organisation.sbi } },
    { key: { text: "CRN" }, value: { text: crn } },
    {
      key: { text: "Organisation email address" },
      value: { text: organisation.orgEmail },
    },
    {
      key: { text: "User email address" },
      value: { text: organisation.email },
    },
    {
      key: { text: "Address" },
      value: { html: formatAddressForDisplay(organisation) },
    },
  ];

  const filteredRows = rows.filter((row) => {
    if (config.endemics.enabled) {
      return true;
    }
    return row.key.text !== "CRN";
  });

  return {
    backLink: {
      href: requestAuthorizationCodeUrl(request),
    },
    organisation,
    listData: { rows: filteredRows },
    ...getYesNoRadios(labelText(), confirmCheckDetails, prevAnswer, errorText, {
      isPageHeading: false,
      legendClasses: "govuk-fieldset__legend--m",
      inline: true,
    }),
  };
};
