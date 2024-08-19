const hasSearchValue = (arrayOfData, key, searchValue) => {
  if (!Array.isArray(arrayOfData)) {
    throw new Error('Invalid array provided')
  }
  return arrayOfData.some(obj => getValueByKey(obj, key) === searchValue)
}

module.exports = {
  hasSearchValue
}
