## E-Ticaret Template V1 Planı (Convex + Next.js + Geniş Admin)

### Kısa Özet
Bu repo, mevcut başlangıç iskeletinden tam tekrar kullanılabilir bir e-ticaret template'ine dönüştürülecek. Hedef: tek mağaza mimarisi, varyantlı ürün modeli, üye checkout, favori+yorum modülleri ve geniş admin paneli. Tüm route'lar Türkçe ve lowercase olacak.

### Uygulama Öncesi Görev Deklarasyonu (Sıkı Sıra)
1: Çekirdek mimariyi yeniden düzenle (route yapısı, server/client ayrımı, ortak layout ve config katmanı).  
2: Convex veri modelini e-ticaret çekirdeğine göre genişlet (tablo, index, ilişki).  
3: Convex query/mutation/action katmanını modüler hale getir (katalog, sepet, sipariş, admin).  
4: Kimlik doğrulama ve yetkilendirme katmanını güvenli rol modeliyle tamamla (customer/admin).  
5: Storefront sayfalarını ve akışlarını kur (listeleme, detay, sepet, checkout, hesap).  
6: Geniş admin panelini kur (ürün, kategori, varyant, stok, sipariş).  
7: Template tekrar kullanılabilirlik katmanını ekle (merkezi mağaza konfigürasyonu, seed, bootstrap dokümantasyonu).  
8: UI sistemini şablon standardına oturt (shadcn tabanlı primitive'ler, semantik tokenlar, minimal DOM).  
9: Manuel kabul senaryolarını çalıştır ve kalite kapısından geçir (lint, tip, akış doğrulama, güvenlik kontrolü).  

### Hedef Route Haritası (Türkçe, lowercase)
1. `/` ana sayfa  
2. `/urunler` ürün listeleme + filtre + sıralama + arama  
3. `/urun/[slug]` ürün detay + varyant + yorumlar  
4. `/sepet` sepet yönetimi  
5. `/odeme` adres ve onay  
6. `/siparis/[siparisNo]` sipariş sonucu/detayı  
7. `/giris` giriş/kayıt  
8. `/hesabim` hesap özeti  
9. `/hesabim/siparisler` sipariş geçmişi  
10. `/hesabim/adresler` adres yönetimi  
11. `/hesabim/favoriler` favori ürünler  
12. `/yonetim` admin dashboard  
13. `/yonetim/urunler` ürün yönetimi  
14. `/yonetim/kategoriler` kategori yönetimi  
15. `/yonetim/siparisler` sipariş yönetimi  
16. `/yonetim/yorumlar` yorum moderasyonu  

### Mimari ve Dosya Organizasyonu
1. App Router server-first olacak, yalnız etkileşimli parçalar client component kalacak.  
2. Convex preloading deseni zorunlu olacak: server component içinde `preloadQuery`, client component içinde `usePreloadedQuery`.  
3. Route bazlı component ayrımı yapılacak: `app/...` sadece segment bileşenleri, paylaşılan parçalar `components/...`.  
4. Domain bazlı Convex dosyaları açılacak: `convex/catalog.ts`, `convex/cart.ts`, `convex/orders.ts`, `convex/admin.ts`, `convex/reviews.ts`, `convex/wishlist.ts`.  

### Veri Modeli (Convex Schema) Genişletmeleri
1. `products`: ad, slug, açıklama, aktiflik, marka, kategori, ana görsel, SEO alanları.  
2. `productVariants`: productId, sku, attributes (renk/beden), fiyat, karşılaştırma fiyatı, stok, aktiflik.  
3. `categories`: ad, slug, parentId, sıra, aktiflik.  
4. `carts`: userId, ara toplam, indirim, genel toplam.  
5. `cartItems`: cartId, variantId, adet, birim fiyat snapshot.  
6. `addresses`: userId, başlık, il/ilçe, detay, posta kodu, varsayılanlık.  
7. `orders`: siparisNo, userId, durum, toplamlar, adres snapshot.  
8. `orderItems`: orderId, productId, variantId, ad, sku, adet, birim fiyat snapshot.  
9. `wishlists`: userId, productId, createdAt.  
10. `reviews`: productId, userId, puan, yorum, moderasyon durumu.  
11. `userProfiles`: userId, adSoyad, telefon, rol (`customer` | `admin`).  
12. Kritik index'ler eklenecek: slug, productId, categoryId, userId, orderNo, status, createdAt kombinasyonları.  

### Public API/Interface/Type Değişiklikleri
1. `lib/store-config.ts` eklenecek ve `StoreConfig` tipi dışa açılacak.  
2. `StoreConfig` alanları: `storeName`, `storeSlogan`, `currency`, `locale`, `logo`, `support`, `social`, `seoDefaults`, `featureFlags`.  
3. `convex` API'sinde yeni fonksiyon referansları oluşacak: katalog, sepet, sipariş, admin modülleri.  
4. Checkout veri kontratı standartlaştırılacak: `CheckoutInput`, `CheckoutTotals`, `OrderCreationResult`.  
5. Admin guard helper dışa açılacak: sadece admin rolü ile panel mutation/query erişimi.  

### Auth ve Güvenlik Modeli
1. Güvenlik tercihi olarak rol bazlı model seçilecek ve admin erişimi server-side enforce edilecek.  
2. İlk admin ataması sadece internal CLI akışıyla yapılacak (public endpoint olmayacak).  
3. `proxy.ts` route koruması güncellenecek: `/yonetim/*` admin olmayan kullanıcılar için engellenecek, `/giris` girişli kullanıcıya uygun yönlendirme yapacak.  
4. Fiyat/toplam hesapları client'a güvenmeden Convex tarafında yeniden hesaplanacak.  
5. Hassas veriler loglanmayacak.  

### Storefront Akışları
1. Ana sayfa: öne çıkan kategori/ürün blokları.  
2. Ürün listeleme: arama + kategori + fiyat aralığı + sıralama.  
3. Ürün detay: varyant seçimi, stok durumu, sepete ekle, favori, yorum listesi/yazma.  
4. Sepet: adet güncelleme, ürün silme, canlı toplam.  
5. Checkout: adres seç/ekle, sipariş onayı.  
6. Sipariş sonucu: başarılı ekranı ve sipariş özeti.  
7. Hesabım: siparişler, adresler, favoriler.  

### Geniş Admin Akışları
1. Ürün CRUD + varyant CRUD + stok güncelleme.  
2. Kategori CRUD + hiyerarşi.  
3. Sipariş listeleme, durum güncelleme.  
4. Yorum moderasyon ekranı (onay/red).  
5. Dashboard özet metrikleri (sipariş adedi, ciro, düşük stok listesi).  

### Test Senaryoları ve Kabul Kriterleri
1. Kullanıcı ürün arayıp filtreleyebilmeli, varyant seçip sepete ekleyebilmeli.  
2. Üye checkout tamamlanabilmeli.  
3. Sepet toplamı doğru hesaplanmalı ve server tarafında doğrulanmalı.  
4. Admin olmayan kullanıcı `/yonetim/*` route'larına erişememeli.  
5. Admin panelinde ürün ve sipariş CRUD işlemleri çalışmalı.  
6. Favori ve yorum akışları çalışmalı, yorum moderasyonu admin panelinden yönetilebilmeli.  
7. Tüm iç route'lar Türkçe ve lowercase olmalı.  
8. Tip ve lint kontrolleri hatasız geçmeli.  
9. Otomasyon testi bu iterasyonda kurulmayacak; bu senaryolar manuel kabul checklist olarak çalıştırılacak.  

### Varsayımlar ve Seçilen Defaultlar
1. Mimari: tek mağaza.  
2. Ürün modeli: varyantlı.  
3. Admin kapsamı: geniş.  
4. Checkout: üye.  
5. Ek özellik: favori + yorum.  
6. Mağaza özelleştirme: merkezi config dosyası.  
7. Arama: Convex tabanlı temel arama/filtreleme.  
8. Test: şimdilik otomasyon yok, manuel kabul var.  
