export function getAriaLabel(context: string, value?: string | number): string {
  if (value !== undefined) {
    return `${context}: ${value}`;
  }
  return context;
}

export function getAriaLive(type: "polite" | "assertive" | "off" = "polite"): "polite" | "assertive" | "off" {
  return type;
}

export function getAriaDescribedBy(id: string): string {
  return `${id}-description`;
}

export function getAriaLabelledBy(id: string): string {
  return `${id}-label`;
}

export function getAriaErrorMessage(id: string): string {
  return `${id}-error`;
}

export const ariaLabels = {
  navigation: {
    main: "Ana navigasyon",
    user: "Kullanici menusu",
    admin: "Yonetim menusu",
    breadcrumb: "Sayfa konumu",
  },
  actions: {
    addToCart: "Sepete ekle",
    removeFromCart: "Sepetten cikar",
    increaseQuantity: "Miktari artir",
    decreaseQuantity: "Miktari azalt",
    addToWishlist: "Favorilere ekle",
    removeFromWishlist: "Favorilerden cikar",
    submitForm: "Formu gonder",
    closeModal: "Kapat",
    openMenu: "Menuyu ac",
    closeMenu: "Menuyu kapat",
  },
  status: {
    loading: "Yukleniyor",
    success: "Basarili",
    error: "Hata",
    empty: "Bos",
  },
  forms: {
    required: "Zorunlu alan",
    optional: "Opsiyonel alan",
    invalid: "Gecersiz deger",
  },
} as const;

export function announceToScreenReader(message: string): void {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
