export const formatValueEUI = (value: string) => {
  const hexOnly = value.replace(/[^0-9A-Fa-f]/g, '')

  const groups = []
  for (let i = 0; i < hexOnly.length; i += 2) {
    groups.push(hexOnly.substring(i, i + 2))
  }

  return groups.join(' ')
}

export function countTwoDigitNumbers(str?: string) {
  if (!str) return 0
  const numbers = str.split(' ')
  return numbers.filter((num) => num.length === 2).length
}
