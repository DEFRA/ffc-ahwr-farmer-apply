window.onload = (function () {
    const submitDeclarationForm = document.querySelector("#submitDeclarationForm")
    const registrationOfInterest = document.querySelector("#registrationOfInterestForm")
    preventDuplicateFormSubmission(submitDeclarationForm)
    preventDuplicateFormSubmission(registrationOfInterest)
})

function preventDuplicateFormSubmission(form) {
    form.addEventListener("submit", function(e) {
        if (form.hasAttribute('form-submitted')) {
            e.preventDefault()
        } else {
            form.setAttribute('form-submitted', true)
        }
    })
}