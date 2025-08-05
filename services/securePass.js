const bcrypt = require('bcrypt');

// Function to encrypt a password using bcrypt
// Returns a promise that resolves to the hashed password
const encryptPassword = async (password) => {
    let salt;

    try {
        salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
    } catch (error) {
        console.error('Error generating salt for password encryption:', error);
        throw new Error('Failed to generate salt');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the generated salt
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Failed to hash password');
    }
}

module.exports = {
    encryptPassword
};