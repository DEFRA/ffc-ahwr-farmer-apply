export const getIneligibilityEvent = (
  sessionId,
  sbi,
  crn,
  email,
  exception,
  reference
) => ({
  name: "send-ineligibility-event",
  properties: {
    id: sessionId,
    sbi,
    cph: "n/a",
    reference,
    checkpoint: process.env.APPINSIGHTS_CLOUDROLE,
    status: "alert",
    action: {
      type: "ineligibility-event",
      message: `Apply: ${exception}`,
      data: {
        sbi,
        crn,
        exception,
        raisedAt: new Date(),
        journey: "apply",
      },
      raisedBy: email,
    },
  },
});
