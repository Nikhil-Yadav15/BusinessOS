import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(plaintextPassword) {
  return await bcrypt.hash(plaintextPassword, SALT_ROUNDS);
}

export async function verifyPassword(plaintextPassword, hash) {
  return await bcrypt.compare(plaintextPassword, hash);
}