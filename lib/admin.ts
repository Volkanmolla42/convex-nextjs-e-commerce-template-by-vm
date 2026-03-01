const ADMIN_EMAIL = "volkanmolla11@gmail.com";

export function isAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return email.toLowerCase() === ADMIN_EMAIL;
}

