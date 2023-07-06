import TimeoutWarning from '../../../../views/timeout-warning/timeout-warning'

export function nodeListForEach (nodes, callback) {
  if (window.NodeList.prototype.forEach) {
    return nodes.forEach(callback)
  }
  for (let i = 0; i < nodes.length; i++) {
    callback.call(window, nodes[i], i, nodes)
  }
}

const $timeoutWarnings = document.querySelectorAll('[data-module="govuk-timeout-warning"]')

nodeListForEach($timeoutWarnings, function ($timeoutWarning) {
  new TimeoutWarning($timeoutWarning).init()
})
