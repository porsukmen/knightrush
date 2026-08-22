# Twist Üretim Sözleşmesi

Bu belge yeni bir Twist ailesinin oyuncu denetimi olmadan çeşitli, hesaplanabilir ve mevcut ağaca
uygun üretilmesi için zorunlu sırayı tanımlar. Sayısal balance kuralları
`STABLE_SKILL_TREE_RULES.md` içinde kalır; bu belge mekanik özgünlüğü korur.

## Temel ilke

Dört Twist tek tek üretilmez. Önce dördü birlikte tasarlanır, birbirleriyle ve mevcut bütün
materialized Twistlerle kıyaslanır, ardından kodlanır. Delivery bir mekanik kimlik değildir.
Yalnız single oku volley veya shotgun yapmak yeni Twist üretmez.

## 1. Family brief

Her Specialization aşağıdakileri önceden ilan eder:

- Primary ve Secondary ilişkisine ait tek cümlelik oynanış vaadi.
- Bu aileye özgü mechanic engine listesi.
- Karşılaştırılacağı ters veya komşu Specializationlar.
- Hedef Twist sayısı.
- En az kaç Twist'in signature engine kullanacağı.
- İzin verilen basit reader/converter sayısı.
- Maksimum kardeş benzerlik oranı.

F5 için bu kayıt `SHARPSHOOT_AFFLICTION_TWIST_AUTHORING_BRIEFS` içindedir. Altı aile toplam
24 Twist hedefler. Her aile diğerlerinden en az bir özel engine ile ayrılır.

## 2. Twist Identity V1

Her materialized F5+ Twist şu kimlik fişini taşımak zorundadır:

1. `input`: Okuduğu kaynak veya durum.
2. `trigger`: Mekaniğin çalıştığı gerçek combat olayı.
3. `operation`: Üretme, okuma, dönüştürme, güçlendirme, tekrar tetikleme, bölme, saklama,
   ölçülü harcama, zaman kaydırma, cascade veya layering fiili.
4. `output`: Oyuncunun aldığı mekanik sonuç.
5. `timing`: Sonucun hemen, aynı saldırının devamında, savunmada, sonraki saldırıda veya çok
   turlu gelmesi.
6. `engineIds`: Runtime ve Quality hesabını yapan kayıtlı mechanic engine veya engineler.

Ayrıca `deliveryPurpose` ve en az 16 karakterlik `deliveryReason` bulunur. Inherited delivery
kullanılıyorsa neden yeterli olduğunu daha açık anlatmalıdır.

## 3. Mechanic engine kaydı

Yeni bir mekanik önce `TWIST_MECHANIC_ENGINE_REGISTRY` içine eklenir. Her engine şunlara sahip
olmalıdır:

- Hangi attribute veya attribute çiftine ait olduğu.
- Generic mi signature mı olduğu.
- Quality gücünü hangi hesapla fiyatlandırdığı.
- Runtime sequence ve power-ledger test politikası.

Runtime davranışı veya beklenen güç hesabı bulunmayan fikir Stable karta eklenmez. Önce prototip
engine olarak tamamlanır.

Engine fiyatlandırması sentez gücünü keyfi bir üst sınıra sıkıştıramaz. Harcanan kaynak veya
Quality büyüyebiliyorsa sonuç da ücretli biçimde büyümeye devam eder; yalnızca hareketin açıkça
tanımlanmış çalışma sırası harcamayı zamana bölebilir.

## 4. Dört kartın birlikte üretimi

Sıra şöyledir:

1. Parent Form ve Specialization eksiksiz miras alınır.
2. Family brief içinden signature mechanic alanı okunur.
3. Dört farklı `input + trigger + operation + output + timing + engine` bileşimi tasarlanır.
4. En fazla family briefte belirtilen sayıda basit reader/converter kullanılabilir.
5. Delivery, mekanikten sonra seçilir ve sebebi yazılır.
6. Her yeni event/contact/tick/retrigger için Quality maliyeti tanımlanır.
7. Dört kimlik birlikte novelty auditine sokulur.
8. Başarılı set runtime compiler ve rarity/balance matrisine geçirilir.

Slotlara sabit görev verilmez. T1 her ailede continuation, T2 heavy, T3 reader, T4 shotgun olamaz.

## 5. Otomatik ret koşulları

Aşağıdakilerden biri varsa set materialize edilmez:

- İki kartın core fingerprinti aynıdır.
- Kartlar yalnız delivery veya sayılarla ayrılır.
- Signature engine kotası karşılanmaz.
- Generic reader/converter kotası aşılır.
- Kardeş benzerliği family brief sınırını aşar.
- Delivery'nin combat sebebi yoktur.
- Engine kayıtlı değildir veya güç modeli yoktur.
- Primary/Secondary ters rotanın mekanik silueti kopyalanmıştır.
- Yeni mechanic parent değerini geriletir ya da ücretsiz güç yaratır.

Validator her kart için mevcut catalogdaki en yakın hareketi de raporlar. Yüksek benzerlik exact
clone olmasa bile design review sebebidir.

## 6. Affliction özel engine alanları

F5 authoring briefleri şu özgün alanları ayırır:

- Affliction/Mark: `BLEED_TARGETING`, `WOUND_PRIORITY_TARGETING`; yaranın hedefe dönüşmesi
  veya eski-yeni yara farkının Mark üretmesi.
- Affliction/Chain: `WOUND_RHYTHM`, `WOUND_CHAIN_PRIMER`; yaranın temas ritmini değiştirmesi
  veya tickin sonraki gerçek temasa Chain hazırlaması.
- Affliction/Posture: `BLEED_POSTURE_WEAKENING`, yara üzerinden fiziksel zayıflama.
- Affliction/Critical: `BLEED_RUPTURE`, Crit olayının yarayı değiştirmesi.
- Affliction/Affliction: `BLEED_POWER`, `BLEED_RETRIGGER`, `BLEED_TICK_SHAPE`, `SEPARATE_WOUNDS`.
- Affliction/Charge: `DEFENSE_FEEDS_BLEED`, savunma performansının yarayı beslemesi.

Saf Affliction dört Twistinin dördü de signature engine kullanmalıdır. Generic conversion veya
reader tek başına saf rota Twist'i olamaz.

Saf rotada `BLEED_POWER` her karta düz bonus değildir. Yalnız Virulence bunu açık ve sınırsız
ölçeklenen yara gücü olarak kullanır. Reopen mevcut yarayı tüketmeden ücretli bölümünü yeniden
vurur; Backload aynı toplam paketin zamanlamasını ikinci ticke taşır; Layered Wounds tek toplam
paketi gerçek ve artifactlerin okuyabileceği ayrı uygulama olaylarına böler. Bu ayrım bozulursa dört
Twist aynı kartın sayı varyasyonuna dönüşmüş sayılır.

F5 Apexleri dört sabit refinement rolü taşır: parent ilişkisinin lideri, toplam yaranın lideri,
dengeli ifade ve temiz impact. Refinement parent triggerını, kaynak ödeme zamanını, delivery/Chain
gerçeğini veya iki-tick sözleşmesini değiştiremez.

## 7. Aynı-attribute ustalık kontrolü

Primary ve Secondary aynıysa sistem otomatik bedava güç eklemez. Önce o attribute için organik,
görünür ve ücretli bir ustalık fiili aranır. Varsa yalnız rota makbuzundaki Secondary payını kullanır;
yoksa temiz sayısal güçte kalmak yeni bir anlamsız engine uydurmaktan daha doğrudur.

Charge/Charge referans uygulamasında bu fiil `Charge Power`dır. Dört Twist aynı katsayının kopyası
değildir: anlık Release yoğunluğu, sonraki hand artçı oku, hatasız savunma streaki ve action-order
geciktirmesi. Üçü de aynı kaynakla çalışsa bile farklı trigger, timing ve oyuncu kararı taşır.

Detonation/Charge referansında dört farklı kaynak fiili kullanılır: bütün bankayı harca, yalnız
eşleşen kısmı harca, harcanmış kısmı geri taşı ve bankayı sonraki savunmaya finite füze olarak kur.
Bu ailede sıfır Charge parent Detonationı kilitleyemez. Temassız yankı/pulse görünür projectile
sayılmaz ve doğal Chain üretmez.

## 8. Zorunlu doğrulama

Her yeni Twist ailesinden sonra:

```text
node tools/validate-runtime.cjs KnightRush.html --quick
```

çalıştırılır. `TWIST_AUTHORING_INFRASTRUCTURE_AUDIT`, family-specific identity audit, runtime,
parent, rarity, delivery truth ve sibling balance kapıları birlikte geçmeden içerik tamamlanmış
sayılmaz.
