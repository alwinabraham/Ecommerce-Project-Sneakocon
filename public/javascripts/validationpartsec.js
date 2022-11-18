var errorName = document.getElementById('name')
var errorEmail = document.getElementById('email')
var errorPassword = document.getElementById('passwords')
var errorcPassword = document.getElementById('cpasswords')
var errorPhonenumber = document.getElementById('phonenumbers')
var errorPin = document.getElementById('pinError')
function validateName() {
    const name = document.getElementById('Name').value;
    if (name == "") {
        errorName.innerHTML = 'Enter your Name'
        return false
    }
    if (!name.match(/^[a-zA-Z ]*$/)) {
        errorName.innerHTML = 'Numbers are not allowed'
        return false
    }
    if (name.match(/^[ ]*$/)) {
        errorName.innerHTML = 'Enter a valid name'
        return false
    }
    errorName.innerHTML = null
    return true
}
function validEmail() {
    const email = document.getElementById('Email').value
    if (email == "") {
        errorEmail.innerHTML = "Email address can't be empty"
        return false
    }
    if (!email.match(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/)) {
        errorEmail.innerHTML = 'Invalid email'
        return false
    }
    errorEmail.innerHTML = null
    return true
}
function validPassowrd() {
    const psd = document.getElementById('password').value
    if (psd == "") {
        errorPassword.innerHTML = "Password can't be empty"
        return false
    }
    if (psd.length < 5) {
        errorPassword.innerHTML = "Password shouldn't be less than 5 charactors"
        return false
    }
    errorPassword.innerHTML = null
    return true
}

function cPassowrd() {
    const psd = document.getElementById('password').value
    const cpsd = document.getElementById('cpassword').value
    if (cpsd == "") {
        errorcPassword.innerHTML = "enter a password"
        return false
    }
    if (cpsd !== psd) {

        errorcPassword.innerHTML = "password is not matching"
        return false
    }
    errorcPassword.innerHTML = null
    return true
}

function validPhoneumber() {
    const mob = document.getElementById('phonenumber').value
    if (mob == "") {
        errorPhonenumber.innerHTML = "Phone number can't be empty"
        return false
    }
    if (mob.length < 10 || !mob.match(/^\d*$/)) {
        errorPhonenumber.innerHTML = "Phone number must contain 10 numbers"
        return false
    }
    if (mob.length > 10 || !mob.match(/^\d*$/)) {
        errorPhonenumber.innerHTML = "Phone number must contain only 10 numbers"
        return false
    }
    errorPhonenumber.innerHTML = null
    return true
}

function validZipcode() {
    const pin = document.getElementById('pin').value
    if (pin == "") {
        errorPin.innerHTML = "Zipcode can't be empty"
        return false
    }
    if (pin.length < 6 || !pin.match(/^\d*$/) || pin.length > 6) {
        errorPin.innerHTML = "Phone number must be 6 digits"
        return false
    }
    errorPin.innerHTML = null
    return true
}

function check() {
    let validatearray = [!validateName(), !validEmail(), !validPassowrd(), !validPhoneumber(), !cPassowrd()]

    return validatearray.every(validation)


}


function validation() {
    if (!validateName() || !validEmail() || !validPassowrd() || !validPhoneumber() || !cPassowrd()) {
        return false
    }
    return true
}

