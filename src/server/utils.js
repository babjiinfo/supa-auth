import bcrypt from "bcryptjs";

const saltRounds = 10;

/**
 * Hashes the password using bcrypt.
 * @param {string} password - The plain text password.
 * @returns {Promise<string>} - The hashed password.
 */
export async function hashPassword(password) {
    return bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plain text password with a hashed password.
 * @param {string} password - The plain text password.
 * @param {string} hashedPassword - The hashed password from the database.
 * @returns {Promise<boolean>} - True if passwords match, false otherwise.
 */
export async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}
