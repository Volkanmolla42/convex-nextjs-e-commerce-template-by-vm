export const validation = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Gecerli bir email adresi girin",
    validate: (value: string): boolean => {
      return validation.email.pattern.test(value);
    },
  },
  phone: {
    pattern: /^(\+90|0)?[0-9]{10}$/,
    message: "Gecerli bir telefon numarasi girin (05XXXXXXXXX)",
    validate: (value: string): boolean => {
      const cleaned = value.replace(/\s/g, "");
      return validation.phone.pattern.test(cleaned);
    },
  },
  name: {
    minLength: 2,
    maxLength: 100,
    message: "Isim en az 2, en fazla 100 karakter olmali",
    validate: (value: string): boolean => {
      const trimmed = value.trim();
      return (
        trimmed.length >= validation.name.minLength &&
        trimmed.length <= validation.name.maxLength
      );
    },
  },
  password: {
    minLength: 8,
    message: "Sifre en az 8 karakter olmali",
    validate: (value: string): boolean => {
      return value.length >= validation.password.minLength;
    },
  },
  address: {
    minLength: 10,
    maxLength: 500,
    message: "Adres en az 10, en fazla 500 karakter olmali",
    validate: (value: string): boolean => {
      const trimmed = value.trim();
      return (
        trimmed.length >= validation.address.minLength &&
        trimmed.length <= validation.address.maxLength
      );
    },
  },
  postalCode: {
    pattern: /^[0-9]{5}$/,
    message: "Posta kodu 5 haneli olmali",
    validate: (value: string): boolean => {
      return validation.postalCode.pattern.test(value);
    },
  },
  quantity: {
    min: 1,
    max: 99,
    message: "Miktar 1 ile 99 arasinda olmali",
    validate: (value: number): boolean => {
      return value >= validation.quantity.min && value <= validation.quantity.max;
    },
  },
  price: {
    min: 0,
    max: 1000000,
    message: "Fiyat 0 ile 1.000.000 arasinda olmali",
    validate: (value: number): boolean => {
      return value >= validation.price.min && value <= validation.price.max;
    },
  },
  rating: {
    min: 1,
    max: 5,
    message: "Puan 1 ile 5 arasinda olmali",
    validate: (value: number): boolean => {
      return value >= validation.rating.min && value <= validation.rating.max;
    },
  },
  comment: {
    minLength: 10,
    maxLength: 1000,
    message: "Yorum en az 10, en fazla 1000 karakter olmali",
    validate: (value: string): boolean => {
      const trimmed = value.trim();
      return (
        trimmed.length >= validation.comment.minLength &&
        trimmed.length <= validation.comment.maxLength
      );
    },
  },
};

export function validateField(
  field: keyof typeof validation,
  value: string | number
): { valid: boolean; message?: string } {
  const validator = validation[field];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isValid = (validator.validate as any)(value);
  return {
    valid: isValid,
    message: isValid ? undefined : validator.message,
  };
}
