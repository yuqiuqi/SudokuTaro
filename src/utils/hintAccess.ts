export type RewardedHintResult = 'rewarded' | 'cancelled' | 'unavailable'
export interface RewardedHintProvider {
  isReady(): boolean
  watch(): Promise<RewardedHintResult>
}

// No provider means the existing free hint flow remains available.
let provider: RewardedHintProvider | null = null
export function setRewardedHintProvider(next: RewardedHintProvider | null): void {
  provider = next
}
export function getRewardedHintProvider(): RewardedHintProvider | null {
  return provider
}
export async function watchHintAd(provider: RewardedHintProvider): Promise<boolean> {
  try {
    return provider.isReady() && (await provider.watch()) === 'rewarded'
  } catch {
    return false
  }
}

/** A cancelled request cannot reward or clear a newer request's pending state. */
export function createHintAdRequest(): {
  readonly pending: boolean
  cancel(): void
  run(provider: RewardedHintProvider): Promise<boolean | null>
} {
  let epoch = 0, pending = false
  return {
    get pending() { return pending },
    cancel() { epoch++; pending = false },
    async run(provider) {
      if (pending) return null
      const request = ++epoch
      pending = true
      const rewarded = await watchHintAd(provider)
      if (request !== epoch) return null
      pending = false
      return rewarded
    },
  }
}
