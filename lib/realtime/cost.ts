export function estimateRealtimeCost(inputTokens: number, outputTokens: number) {
  // Rough placeholder rates for logging — refine when OpenAI publishes stable pricing.
  const inputRate = 0.000006;
  const outputRate = 0.000024;
  return Number((inputTokens * inputRate + outputTokens * outputRate).toFixed(6));
}
