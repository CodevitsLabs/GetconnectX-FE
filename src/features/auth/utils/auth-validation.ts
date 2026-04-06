export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function getEmailError(email: string) {
  if (!email.trim()) {
    return 'Email is required.';
  }

  if (!isValidEmail(email)) {
    return 'Enter a valid email address.';
  }

  return null;
}

export function getPasswordError(password: string) {
  if (!password) {
    return 'Password is required.';
  }

  if (password.length < 8) {
    return 'Use at least 8 characters.';
  }

  return null;
}
