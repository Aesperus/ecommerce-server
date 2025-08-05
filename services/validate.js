// Validate email format
const emailValidation = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const passwordValidation = (password) => {
    // Example: Password must be at least 8 characters long
    if (password.length < 8) {
        return false;
    }

    // Example: Password must contain at least one uppercase letter, one lowercase letter, and one number
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasUpperCase && !hasLowerCase && !hasNumber) {
        return false;
    }

    // Example: Password must not contain spaces
    if (/\s/.test(password)) {
        return false;
    }

    return true; // Password is valid
}

const stringValidation = (str) => {
    // Example: String must not contain special characters
    const specialCharRegex = /[!@#$%^&*(),?":{}|<>]/;
    if (specialCharRegex.test(str)) {
        return false;
    }

    return true; // String is valid
}

module.exports = {
    emailValidation,
    passwordValidation,
    stringValidation
};