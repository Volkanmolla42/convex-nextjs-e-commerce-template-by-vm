export type StoreConfig = {
  storeName: string;
  legalName: string;
  storeSlogan: string;
  currency: "TRY" | "USD" | "EUR";
  locale: "tr-TR" | "en-US";
  logo: {
    text: string;
  };
  support: {
    address: string;
    email: string;
    phone: string;
  };
  social: {
    instagram: string;
    x: string;
  };
  seoDefaults: {
    title: string;
    description: string;
  };
  commerce: {
    shippingFee: number;
    freeShippingThreshold: number;
  };
  featureFlags: {
    reviews: boolean;
    wishlist: boolean;
  };
};

export const storeConfig: StoreConfig = {
  storeName: "Magaza Adi",
  legalName: "Magaza Unvani",
  storeSlogan: "",
  currency: "TRY",
  locale: "tr-TR",
  logo: {
    text: "Magaza Adi",
  },
  support: {
    address: "Adres Bilgisi",
    email: "iletisim@magaza.com",
    phone: "+90 500 000 00 00",
  },
  social: {
    instagram: "https://www.instagram.com",
    x: "https://x.com",
  },
  seoDefaults: {
    title: "Magaza Adi",
    description: "Magaza aciklamasi",
  },
  commerce: {
    shippingFee: 50,
    freeShippingThreshold: 5000,
  },
  featureFlags: {
    reviews: true,
    wishlist: true,
  },
};
