const acceptButton = document.querySelector('.js-cookies-button-accept')
const rejectButton = document.querySelector('.js-cookies-button-reject')
const acceptedBanner = document.querySelector('.js-cookies-accepted')
const rejectedBanner = document.querySelector('.js-cookies-rejected')
const questionBanner = document.querySelector('.js-question-banner')
const cookieBanner = document.querySelector('.js-cookies-banner')
const cookieContainer = document.querySelector('.js-cookies-container')

if (cookieContainer) {
  cookieContainer.style.display = 'block'

  function showBanner (banner) {
    questionBanner.setAttribute('hidden', 'hidden')
    banner.removeAttribute('hidden')
    // Shift focus to the banner
    banner.setAttribute('tabindex', '-1')
    banner.focus()

    banner.addEventListener('blur', function () {
      banner.removeAttribute('tabindex')
    })
  }

  acceptButton?.addEventListener('click', function (event) {
    showBanner(acceptedBanner)
    event.preventDefault()
    submitPreference(true)
  })

  rejectButton?.addEventListener('click', function (event) {
    showBanner(rejectedBanner)
    event.preventDefault()
    submitPreference(false)
  })

  acceptedBanner?.querySelector('.js-hide').addEventListener('click', function () {
    cookieBanner.setAttribute('hidden', 'hidden')
  })

  rejectedBanner?.querySelector('.js-hide').addEventListener('click', function () {
    cookieBanner.setAttribute('hidden', 'hidden')
  })

  function submitPreference (accepted) {
    const xhr = new XMLHttpRequest() // eslint-disable-line
    xhr.open('POST', '/apply/cookies', true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify({
      analytics: accepted,
      async: true
    }))
    xhr.onload = async () => {
      if (xhr.status === 200) {
        const modifyCrumbValues = (crumbCookieValue) => {
          const crumbs = document.querySelectorAll('[name="crumb"]')
          crumbs.forEach(crumb => {
            crumb.value = crumbCookieValue
          })
        }
        const waitForCookie = async (cookieName, timeout = 5000) => {
          return new Promise((resolve, reject) => {
            const startTime = new Date().getTime()
            const checkCookie = () => {
              const cookies = document.cookie.split(';')
              for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim()
                if (cookie.startsWith(cookieName + '=')) {
                  resolve(cookie.split('=')[1])
                  return
                }
              }
              const currentTime = new Date().getTime()
              if (currentTime - startTime >= timeout) {
                reject(new Error('Timeout waiting for cookie'))
                return
              }
              setTimeout(checkCookie, 100)
            }
            checkCookie()
          })
        }
        try {
          const crumbCookieValue = await waitForCookie('crumb')
          modifyCrumbValues(crumbCookieValue)
        } catch (error) {
          modifyCrumbValues('Error waiting for crumb cookie')
        }
      }
    }
  }
}
