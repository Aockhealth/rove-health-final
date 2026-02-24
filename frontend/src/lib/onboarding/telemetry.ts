type TelemetryPayload = Record<string, unknown>;

export async function trackOnboardingEvent(
  eventName: string,
  payload: TelemetryPayload = {}
): Promise<void> {
  try {
    await fetch("/api/onboarding-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, payload }),
      keepalive: true,
    });
  } catch {
    // Ignore telemetry errors to avoid affecting user flow.
  }
}
