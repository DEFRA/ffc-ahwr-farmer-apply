const createMessage = (body, type, options) => {
  return {
    body,
    type,
    source: 'ffc-ahwr-farmer-apply',
    ...options
  }
}

module.exports = createMessage
