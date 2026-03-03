# E-Ticaret Template - Convex + Next.js

Modern, tam özellikli bir e-ticaret template'i. Convex backend, Next.js 16 App Router ve Tailwind CSS ile geliştirilmiştir.

## Özellikler

### Kullanıcı Özellikleri
- ✅ Ürün listeleme, filtreleme ve arama
- ✅ Varyantlı ürün desteği (renk, beden vb.)
- ✅ Sepet yönetimi (ekleme, güncelleme, silme)
- ✅ Üye checkout sistemi
- ✅ Sipariş geçmişi
- ✅ Favori ürünler (wishlist)
- ✅ Ürün yorumları ve değerlendirme
- ✅ Adres yönetimi
- ✅ Responsive tasarım (mobile-first)

### Admin Özellikleri
- ✅ Ürün CRUD (oluşturma, okuma, güncelleme, silme)
- ✅ Varyant yönetimi
- ✅ Kategori yönetimi (hiyerarşik)
- ✅ Sipariş yönetimi
- ✅ Yorum moderasyonu
- ✅ Stok takibi
- ✅ Dashboard metrikleri

### Teknik Özellikler
- ✅ Server-side rendering (SSR)
- ✅ Convex preloading pattern
- ✅ Type-safe API
- ✅ Rol tabanlı yetkilendirme (customer/admin)
- ✅ Güvenli fiyat hesaplama (server-side)
- ✅ Image upload ve storage
- ✅ Dark mode desteği
- ✅ Semantic color tokens

## Teknoloji Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Backend:** Convex (database + server functions)
- **Styling:** Tailwind CSS 4, shadcn/ui
- **Auth:** Convex Auth
- **Icons:** Lucide React
- **Package Manager:** Bun

## Kurulum

```bash
# Bağımlılıkları yükle
bun install

# Geliştirme sunucusunu başlat
bun run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

## Proje Yapısı

```
├── app/                      # Next.js App Router
│   ├── (public)/            # Public routes
│   │   ├── page.tsx         # Ana sayfa
│   │   ├── urun/[id]/       # Ürün detay
│   │   ├── sepet/           # Sepet
│   │   ├── odeme/           # Checkout
│   │   └── hesabim/         # Kullanıcı hesabı
│   └── (admin)/             # Admin routes
│       └── yonetim/         # Admin paneli
├── components/              # React components
│   ├── routes/             # Route-specific components
│   ├── ui/                 # shadcn/ui components
│   └── admin/              # Admin components
├── convex/                  # Convex backend
│   ├── schema.ts           # Database schema
│   ├── products.ts         # Ürün fonksiyonları
│   ├── cart.ts             # Sepet fonksiyonları
│   ├── orders.ts           # Sipariş fonksiyonları
│   ├── wishlist.ts         # Favori fonksiyonları
│   ├── reviews.ts          # Yorum fonksiyonları
│   └── admin.ts            # Admin fonksiyonları
└── lib/                     # Utility functions
    ├── store-config.ts     # Mağaza konfigürasyonu
    └── auth-server.ts      # Auth helpers
```

## Konfigürasyon

Mağaza ayarlarını `lib/store-config.ts` dosyasından yapılandırabilirsiniz:

```typescript
export const storeConfig: StoreConfig = {
  storeName: "Magaza Adi",
  currency: "TRY",
  locale: "tr-TR",
  commerce: {
    shippingFee: 50,
    freeShippingThreshold: 5000,
  },
  featureFlags: {
    reviews: true,
    wishlist: true,
  },
  // ...
};
```

## Admin Kullanıcısı Oluşturma

İlk admin kullanıcısını oluşturmak için Convex dashboard'unu kullanın:

1. `https://dashboard.convex.dev` adresine gidin
2. Projenizi seçin
3. `userProfiles` tablosuna yeni kayıt ekleyin:
   - `userId`: Kullanıcı ID'si
   - `role`: "admin"

## Geliştirme

### Yeni Ürün Ekleme

Admin panelinden `/yonetim/urun-ekle` sayfasını kullanarak ürün ekleyebilirsiniz.

### Yeni Kategori Ekleme

Admin panelinden `/yonetim/kategoriler` sayfasını kullanarak kategori ekleyebilirsiniz.

### Veri Modeli

Convex schema `convex/schema.ts` dosyasında tanımlanmıştır. Temel tablolar:

- `products`: Ürünler
- `productVariants`: Ürün varyantları
- `categories`: Kategoriler
- `carts`: Sepetler
- `cartItems`: Sepet ürünleri
- `orders`: Siparişler
- `orderItems`: Sipariş ürünleri
- `addresses`: Adresler
- `wishlists`: Favori ürünler
- `reviews`: Ürün yorumları
- `userProfiles`: Kullanıcı profilleri

## Deployment

### Convex

```bash
bunx convex deploy
```

### Vercel

```bash
vercel deploy
```

## Lisans

MIT

## Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için lütfen önce bir issue açın.

## Destek

Sorularınız için issue açabilirsiniz.
