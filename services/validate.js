const options = {
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, //Standard email format: user@example.com
    specialCharRegex: /[!@#$%^&*(),?":{}|<>]/, //Banned special characters
    passwordMinLength: 8, // Minimum password length
    passwordUpperCase: true, // Require at least one uppercase letter
    passwordLowerCase: true, // Require at least one lowercase letter
    passwordNumber: true, // Require at least one number
    passwordNoSpaces: true, // Disallow spaces
}


// Validate email format
const emailValidation = (email) => {
    return options.emailRegex.test(email);
}

const passwordValidation = (password) => {
    if (password.length < options.passwordMinLength) {
        return false;
    }

    // Check for uppercase, lowercase, and number requirements
    const hasUpperCase = options.passwordUpperCase ? /[A-Z]/.test(password) : true;
    const hasLowerCase = options.passwordLowerCase ? /[a-z]/.test(password) : true;
    const hasNumber = options.passwordNumber ? /\d/.test(password) : true;

    if (!hasUpperCase || !hasLowerCase || !hasNumber) { // Check if all conditions are met
        return false;
    }

    // Check for spaces requirement
    if (options.passwordNoSpaces && /\s/.test(password)) {
        return false;
    }

    return true; // Password is valid
}

const stringValidation = (str) => {
    // Example: String must not contain special characters
    if (options.specialCharRegex.test(str)) {
        return false;
    }

    return true; // String is valid
}

module.exports = {
    emailValidation,
    passwordValidation,
    stringValidation
};