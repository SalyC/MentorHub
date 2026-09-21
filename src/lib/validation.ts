const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Введите email";
  if (!EMAIL_REGEX.test(email)) return "Введите корректный email";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Введите пароль";
  if (password.length < 8) return "Пароль должен содержать не менее 8 символов";
  return null;
}