
const findObjectByCondition = (arrayOfObjects, searchKey, searchValue) => {
  if (!Array.isArray(arrayOfObjects)) {
    throw new Error('Invalid array provided')
  }
  return arrayOfObjects.find(obj => obj[searchKey] === searchValue)
}

const getValueFromObject = (obj, targetKey) => {
  return obj ? obj[targetKey] : 'no value found'
}

const getValueWhereCondition = (arrayOfObjects, conditionKey, conditionValue, targetKey) => {
  const foundObject = findObjectByCondition(arrayOfObjects, conditionKey, conditionValue)
  return foundObject && getValueFromObject(foundObject.data, targetKey)
}

module.exports = {
  findObjectByCondition,
  getValueFromObject,
  getValueWhereCondition
}
