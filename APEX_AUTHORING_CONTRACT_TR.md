# Apex Tasarım Sözleşmesi

Bu sözleşme Stable skill ağacındaki bütün yeni Apex üretimlerinde uygulanır.

## Apex'in görevi

Apex yeni bir Twist yaratmaz. Parent Twist'in kaynak, tetik, sonuç, zamanlama ve Delivery kimliğini korur; o kimliği farklı bir oyun kararına götüren son biçime ulaştırır.

Her Twist için dört Apex şu rolleri doldurur:

1. **Sayısal ustalık:** Parent'ın ana çıktısını doğrudan ve güvenilir biçimde büyütür.
2. **Kaynak ifadesi:** Aynı motorun farklı rezerv, tüketim veya olay yoğunluğu kullanımını öne çıkarır.
3. **Davranışsal son biçim:** Oyuncunun hedef seçimini, zamanlamasını veya skill sırasını anlamlı biçimde değiştirir.
4. **Güvenilirlik ya da ikinci davranış:** Kötü başlangıç durumunda taban değer sağlar veya aynı motoru farklı bir kararla kullanır.

Bu sıra zorunlu değildir; dört kartın toplam rol dağılımı zorunludur. Bir ailede en az iki Apex yalnız sayı artırmaktan öte bir oyuncu kararı yaratmalıdır.

## Değişmez kurallar

- Apex, parent Twist'in temel motorunu ve Delivery gerekçesini değiştiremez.
- Apex'in hiçbir rarity'si parent'ın hasarını, ana attribute çıktısını, Mark tüketim kapasitesini veya toplam sentez gücünü azaltamaz.
- Common → Uncommon → Rare → Legendary sırasında sahip olunan hiçbir stat gerileyemez.
- Koşullu bir Apex, koşul gerçekleşmediğinde de küçük ama gerçek ve ölçülebilir bir ilerleme vermelidir.
- Esnek/adaptive Apex, uzman Apex'lerin kendi ideal koşullarındaki zirvesini geçmemelidir.
- Delayed event gerçek projectile/contact sayılmaz; görünür sonuç neyse event modeli onu temsil eder.
- Stored veya delayed güç finite olmalıdır. Kendi çıktısını okuyup kendini yeniden dolduramaz.
- Oynanış limitiyle sahte denge kurulmaz. Büyüyen değer Quality matematiğiyle dengelenir; keyfi maksimum konmaz.
- Dört sibling yaklaşık aynı toplam güç bandında kalır fakat aynı gameplay kararını tekrarlamaz.

## Her Apex kaydında zorunlu açıklama

- `kind`: Rolü.
- `playerDecision`: Oyuncunun neden bunu seçeceği.
- `guaranteedProgress`: Koşul oluşmasa bile rank'ın neyi büyüttüğü.
- `parentBoundary`: Parent'tan hangi kimliklerin kesinlikle korunduğu.
- `siblingBoundary`: Bu Apex'in kardeşlerinden net farkı.

## Zorunlu otomatik kontroller

- Yapı: Her Twist altında tam dört Apex ve her Apex'te tasarım metadatası.
- Parent: Hasar, ana/secondary çıktı, tüketim kapasitesi ve toplam güç gerilemez.
- Rarity: Dört rank boyunca hiçbir sahip olunan değer düşmez.
- Kimlik: Motor, zamanlama ve animasyon/Delivery recipe parent ile aynıdır.
- Güç: Sibling'ler belirlenen güç bandını aşmaz.
- Runtime: Her Apex gerçek combat action içinde saldırı üretir ve kendi özel motorunu çalıştırır.
- Döngü güvenliği: Stored/delayed mekanikler yalnız gerçek dış kaynakları okur ve finite rezerv harcar.

Detonation/Posture F1S3 ailesi bu sözleşmenin ilk referans uygulamasıdır.
