/** Up to 18 decimal places; comparisons never pass ETH through floating point. */
export function isEthDecimal(value: unknown): value is string {
  return typeof value === 'string' && /^\d{1,9}(\.\d{1,18})?$/.test(value)
}

export function ethToWei(value: string): bigint {
  if (!isEthDecimal(value)) throw new Error('Invalid ETH decimal')
  const [whole = '0', fraction = ''] = value.split('.')
  return BigInt(whole) * 10n ** 18n + BigInt(fraction.padEnd(18, '0'))
}

/** Converts an integer amount back to decimal text without losing precision. */
export function weiToEth(value: bigint): string {
  const sign = value < 0n ? '-' : ''
  const positive = value < 0n ? -value : value
  const fraction = (positive % 10n ** 18n).toString().padStart(18, '0').replace(/0+$/, '')
  return `${sign}${positive / 10n ** 18n}${fraction ? `.${fraction}` : ''}`
}
