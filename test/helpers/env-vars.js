const originalValues = []

const setEnvVar = (key, value) => {
  originalValues.push([key, process.env[key]])
  process.env[key] = value
}

const restoreEnvVars = () => originalValues
  .forEach(([key, value]) => { process.env[key] = value })

export { setEnvVar, restoreEnvVars }
