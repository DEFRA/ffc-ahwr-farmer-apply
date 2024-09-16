const getValueByKey = (obj, key) => {
  if (obj === null || typeof obj !== 'object') {
    throw new Error('Invalid object provided')
  }
  if (key in obj) {
    return obj[key]
  }
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop) && typeof obj[prop] === 'object') {
      const result = getValueByKey(obj[prop], key)
      if (result !== undefined) {
        return result
      }
    }
  }
  return undefined
}

const hasSearchValue = (arrayOfData, key, searchValue) => {
  if (!Array.isArray(arrayOfData)) {
    throw new Error('Invalid application Data object')
  }
  return arrayOfData.some((obj) => getValueByKey(obj, key) === searchValue)
}

module.exports = {
  getValueByKey,
  hasSearchValue
}
