export const formatValueEUI = (value: string) => {
  const digitsOnly = value.replace(/\D/g, '')

  const groups = []
  for (let i = 0; i < digitsOnly.length; i += 2) {
    groups.push(digitsOnly.substring(i, i + 2))
  }

  return groups.join(' ')
}

export function countTwoDigitNumbers(str?: string) {
  if (!str) return 0
  const numbers = str.split(' ')
  return numbers.filter((num) => num.length === 2).length
}
