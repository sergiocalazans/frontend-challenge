/** Up to 18 decimal places; comparisons never pass ETH through floating point. */
export function isEthDecimal(value: unknown): value is string {
  return typeof value === 'string' && /^\d{1,9}(\.\d{1,18})?$/.test(value)
}

export function ethToWei(value: string): bigint {
  if (!isEthDecimal(value)) throw new Error('Invalid ETH decimal')
  const [whole = '0', fraction = ''] = value.split('.')
  return BigInt(whole) * 10n ** 18n + BigInt(fraction.padEnd(18, '0'))
}
