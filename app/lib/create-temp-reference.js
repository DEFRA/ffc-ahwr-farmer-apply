/**
 * Generate unique reference number, prefixed by TEMP
 * ex. TEMP-Z4F1-F2PC
 * @returns string
 */
function generateRandomID () {
  const charset = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'
  const id = Array.from({ length: 8 }, () =>
    charset.charAt(Math.floor(Math.random() * charset.length))
  ).join('')

  const firstFour = id.slice(0, 4)
  const secondFour = id.slice(4)

  return `TEMP-${firstFour}-${secondFour}`
}

module.exports = generateRandomID
