/**
 * Shared bcrypt cost factor.
 *
 * Every route that hashes a password (register, change-password, reset-password,
 * admin user creation) must use this value so stored hashes are consistent and
 * match the documented 10-round profile in the load-test report.
 */
export const BCRYPT_ROUNDS = 10;

/** Auth cookie lifetime (seconds) — keep the JWT `expiresIn` in sync. */
export const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;
