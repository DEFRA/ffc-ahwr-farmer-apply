const createTempReference = require('../../../../app/lib/create-temp-reference')

test('should return a string temp reference', () => {
  const tempRef = createTempReference()

  expect(typeof tempRef).toBe('string')
  const regex = /^TEMP-[A-Z0-9]{4}-[A-Z0-9]{4}$/
  expect(tempRef).toMatch(regex)
})
