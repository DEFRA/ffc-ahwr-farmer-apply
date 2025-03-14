export const getSessionEvent = (
  organisation,
  sessionId,
  entryKey,
  key,
  value,
  ip,
  reference
) => ({
  name: "send-session-event",
  properties: {
    id: sessionId,
    sbi: organisation.sbi,
    cph: "n/a",
    reference,
    checkpoint: process.env.APPINSIGHTS_CLOUDROLE,
    status: "success",
    action: {
      type: `${entryKey}-${key}`,
      message: `Session set for ${entryKey} and ${key}.`,
      data: {
        reference,
        [key]: value,
        ip,
      },
      raisedBy: organisation.email,
    },
  },
});
