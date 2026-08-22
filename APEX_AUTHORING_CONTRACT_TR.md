# Apex Tasarım Sözleşmesi

Bu sözleşme Stable skill ağacındaki bütün yeni Apex üretimlerinde uygulanır.

## Apex'in görevi

Apex yeni bir Twist yaratmaz. Parent Twist'in kaynak, tetik, sonuç, zamanlama ve Delivery kimliğini korur; o kimliği farklı bir oyun kararına götüren son biçime ulaştırır.

Her Twist için dört Apex şu rolleri doldurur:

1. **Sayısal ustalık:** Parent'ın ana çıktısını doğrudan ve güvenilir biçimde büyütür.
2. **Kaynak ifadesi:** Aynı motorun farklı rezerv, tüketim veya olay yoğunluğu kullanımını öne çıkarır.
3. **Davranışsal son biçim:** Oyuncunun hedef seçimini, zamanlamasını veya skill sırasını anlamlı biçimde değiştirir.
4. **Güvenilirlik ya da ikinci davranış:** Kötü başlangıç durumunda taban değer sağlar veya aynı motoru farklı bir kararla kullanır.

Bu sıra zorunlu değildir; dört kartın toplam rol dağılımı zorunludur. Bir ailede en az iki Apex yalnız sayı artırmaktan öte bir oyuncu kararı yaratmalıdır. Bu iki Apex de aynı karar türünü tekrarlayamaz.

## Yüzeysellik red kapısı

Aşağıdakiler tek başına yeni bir oyuncu kararı sayılmaz:

- Aynı toplam hasarı ilk/son vuruş veya ilk/ikinci tick arasında yeniden bölmek.
- Yalnız hasar, payload, temas sayısı ya da tüketim kapasitesi büyütmek.
- Aynı koşulu başka isimle tekrar etmek.
- Artifact ileride anlam kazandırabilir diye bugün karar üretmeyen bir event eklemek.

Dört Apex'in en az ikisi oyuncunun gerçek planını değiştirmelidir. Bu iki kart en az iki ayrı sınıftan gelmelidir: okunan savaş durumu, zamanlama penceresi, skill sırası/rotasyonu, risk-ödül, hedef seçimi veya kaynak penceresi. Bir zamanlama değişikliği ancak başka bir fazda sonuç doğuruyor ya da oyuncunun sonraki kararını değiştiriyorsa anlamlıdır.

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
- `version: 2`: Yeni ailelerde zorunlu Apex sözleşmesi sürümü.
- `decisionClass`: `OUTPUT_MASTERY`, `STATE_RESPONSE`, `TIMING_WINDOW`, `ROTATION_CHANGE`, `RISK_REWARD`, `TARGETING_CHANGE`, `RESOURCE_WINDOW` veya `RELIABILITY`.
- `decisionKey`: Aile içinde benzersiz karar imzası.
- `changesPlayerPlan`: Yalnız gerçek bir karar sınıfı kullanılıyorsa `true`.
- `gameplayDelta`: Oyuncunun saldırı sırası, zamanı, hedefi veya riskinin nasıl değiştiği.
- `runtimeEvidence`: Mekaniğin gerçekten çalıştığını kanıtlayacak command/state alanları ve eventler.

## Zorunlu otomatik kontroller

- Yapı: Her Twist altında tam dört Apex ve her Apex'te tasarım metadatası.
- Parent: Hasar, ana/secondary çıktı, tüketim kapasitesi ve toplam güç gerilemez.
- Rarity: Dört rank boyunca hiçbir sahip olunan değer düşmez.
- Kimlik: Motor, zamanlama ve animasyon/Delivery recipe parent ile aynıdır.
- Güç: Sibling'ler belirlenen güç bandını aşmaz.
- Runtime: Her Apex gerçek combat action içinde saldırı üretir ve kendi özel motorunu çalıştırır.
- Döngü güvenliği: Stored/delayed mekanikler yalnız gerçek dış kaynakları okur ve finite rezerv harcar.
- Karar derinliği: Dört sibling benzersiz `decisionKey` taşır; en az iki tanesi plan değiştirir, bu ikisi en az iki farklı karar sınıfına aittir.
- Kanıt çeşitliliği: Dört Apex en az üç farklı runtime kanıt imzası taşır. Aynı statın dört dağılımı aile olarak reddedilir.

Detonation/Posture F1S3 ailesi bu sözleşmenin ilk referans uygulamasıdır.

## F1S5T3 referans kararı

Detonation/Affliction gecikmeli yara Twistinin Apexleri şu ayrımı korur:

1. A1 aynı iki ticklik yankıyı doğrudan büyüten sayısal ustalıktır.
2. A2 ilk yankıyı bir sonraki savunma fazında bossun ilk hareketinden önce çalıştırır; oyuncu erken öldürme penceresini seçer.
3. A3 ikinci tickte, ilk saldırıdan sonra yeniden üretilmiş Markları ayrıca tüketip patlatabilir; Sharpshoot → Mark Burst rotasyonu değişir.
4. A4 yara sürerken her ayrı boss hareketini küçük ücretli bir Detonation pulse'una çevirir; oyuncu Break ile güvenlik almak veya komboyu sürdürüp daha çok pulse kazanmak arasında karar verir.

A2 yalnız “ilk tick daha güçlü”, A3 yalnız “ikinci tick daha güçlü”, A4 yalnız “daha çok event” olsaydı aile red kapısından geçmezdi.

## F1S6 Detonation/Charge referans kararı

Dört Twist farklı Charge kararları taşır: bütün bankayı şimdi boşaltmak, yalnız Mark ile eşleşen
Chargeı harcamak, harcanmış bankanın bir bölümünü Marklarla geri taşımak veya bankayı sonraki
savunmaya finite füze olarak kurmak. Apexler bu dört harcama kimliğini birbirine çeviremez.

- Full Discharge Apexleri iki-kaynak çarpanı, Break zamanı, Charge fazlası ve Mark fazlasını ayırır.
- Paired Echo Apexleri yankı gücü, eşleşme penceresi ve iki ayrı kaynak fazlası kararını ayırır.
- Capacitor Apexleri koruma, anlık hasar, Break koruması ve boş bankadan yeni rota başlatmayı ayırır.
- Defense Fuse Apexleri pulse gücü, Parry tercihi, hatasız seri ve erken Break iadesini ayırır.

Savunma pulseu fiziksel temas değildir; Chain, Crit, Mark veya kendini yeniden dolduran Charge
üretemez. Füze yalnız gerçekten harcanmış finite bankayı tüketir.
