export const uppercaseFirstLetter = (originalString: string) => {
  const fistLetterUppercase = originalString.substring(0, 1).toUpperCase()
  const resString = originalString.substring(1, originalString.length)

  return fistLetterUppercase + resString
}
