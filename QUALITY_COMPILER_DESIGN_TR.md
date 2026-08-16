# Knight Rush Quality Compiler ve Legendary Stamp Sözleşmesi

Bu belge, sınırsıza yakın rarity/rota kombinasyonundan dengelenebilir hareket üretmek
için kalıcı kaynak metindir. Executable ilk wallet vertical slice
`KnightRush.html` içindeki F1 Mark Form, F1S1 Mark/Mark ve F1S2 Mark/Chain
Specialization'larıdır.

## 1. Temel karar

Bir çocuk kart parent'ın sayısal statlarını mutate etmez. Nihai hareket her seçimde ve
save rebuild sırasında full history'den sıfırdan derlenir:

`mekanik blueprint + Quality receipt'leri + depth leverage + allocation profilleri + shape kuralları + cost + stamp'ler`

Aynı history her zaman bit düzeyinde aynı combat skill objesini üretmelidir. Combat
frame loop Quality veya history taramaz; yalnız önceden derlenmiş düz skill objesini okur.

## 2. Rarity neden 1 / 4 / 8 / 14 Quality verir?

Base draft dağılımı:

| Rarity | Olasılık | `-log2(p)` | Quality |
|---|---:|---:|---:|
| Common | %65 | 0.62 | 1 |
| Uncommon | %27 | 1.89 | 4 |
| Rare | %7 | 3.84 | 8 |
| Legendary | %1 | 6.64 | 14 |

Quality artık yuvarlanmış bilgi değerine eşit değildir; olasılığı referans alan authored
ödül eğrisidir. Üç kartlı bir draftta oyuncu en yüksek rarity'yi tercih ederse yaklaşık
seçim dağılımı `%27.46 Common / %50.41 Uncommon / %19.16 Rare / %2.97 Legendary` olur.
Bu yüzden ham `%1 Legendary` tek başına güç hesabı değildir. `1/4/8/14`, Uncommon'ı
görünür bir adım, Rare'i build olayı, Legendary'yi güçlü fakat Stamp'e de alan bırakan
jackpot yapar. Ters olasılık gibi yıkıcı `65x` güç üretmez.
Rarity şansını değiştiren bir artifact gelecekteki rolları etkileyebilir ama önceden
seçilmiş kartın Quality'sini yeniden yazamaz.

## 3. Rarity, Structural ve Effective Quality

Her gerçek evolution, Common gelse bile hareketi ilerletir. Bu garanti gelişimi Structural
Quality, RNG primini Rarity Quality öder:

| Katman | Structural Quality | Leverage |
|---|---:|---:|
| Form | 2 | 1.20 |
| Specialization | 2 | 1.12 |
| Twist | 3 | 1.05 |
| Apex | 4 | 1.00 |
| Post-Apex / Mastery | authored | 1.00 |

UI ve receipt'ler iki kaynağı ayrı tutar:

- `rarityQuality`: seçilmiş rarity'lerin saf toplamı;
- `structuralQuality`: tamamlanan evolution katmanlarının toplamı;
- `totalQuality = rarityQuality + structuralQuality`.

`effectiveQ_i = (rarityQ_i + structuralQ_i) * depthLeverage_i`

`effectiveQuality = sum(effectiveQ_i)`

Erken altyapı genel olarak daha değerlidir fakat sonraki Quality'yi çarpmaz. Katsayı
yalnız geldiği pakete bir kez uygulanır; descendant sayısıyla büyümez. Bu, early RNG'yi
anlamlı yaparken runaway compounding'i engeller.

Örnek, aynı rarity toplamı 15 ve aynı iki katman:

- Legendary Form -> Common Specialization: `(14+2)*1.20 + (1+2)*1.12 = 22.56 effective Q`
- Common Form -> Legendary Specialization: `(1+2)*1.20 + (14+2)*1.12 = 21.52 effective Q`

İlk rota daha güçlü genel foundation yaratır. İkinci rota daha düşük genel bütçeyi
Specialization'ın dar mekaniğine yoğunlaştırarak kendi uzmanlık senaryosunda daha iyi
olabilir. Biri bütün senaryolarda diğerine strict dominance kurmamalıdır.

## 4. Power target

İlk kalibrasyon sabiti:

`packetPower_i = effectiveQ_i * 2.75`

`axisWallet_i = packetPower_i * routeAxisWeight_i`

`2.75` kalıcı kutsal sayı değildir; Combat Lab verisiyle global olarak ayarlanır.
Rotalar bu sayıyı değiştiremez. Böylece aynı parent history ve aynı rarity'deki sibling
rotalar aynı hedef gücü alır; yalnız gücü nasıl kullandıkları değişir.

Resolve Pressure ayrı kalır ve nihai cost solve edilmeden önce uygulanır:

`cost = baseCost + floor(totalPressure / 3)`

Quality Compiler v6 parent statını geriye doğru çözmez. Current layer damage receipt'i
parent'ın gerçekleşmiş damage sonucuna eklenir; Mark/Hit/Chain wallet'ları sabit fiyatlı
ayrık eşikleri satın alır. Bir eşiğe
yetmeyen miktar aynı axis'in Reserve'ünde full history boyunca kalır ve damage'e çevrilmez.
Bu nedenle Stable kartta stat düşüşü yalnız açık authored trade ile mümkündür. Yüksek cost
net güç muhasebesinde telafi edilir fakat tur içindeki combo kapasitesini azaltır. Rarity
Resonance ve Legendary Stamp wallet bütçesi dışındaki jackpot katmanlarıdır.

Yeni ilişki mekaniği yalnız current layer'ın `DIRECT_DAMAGE` receipt'ini harcayabilir ve bu
receipt'in en az `%25`i görünür damage olarak kalır. Weight de yalnız current layer'ın kalan
payını sıkıştırır; parent'ın önceden gerçekleşmiş damage'ini bölmez. Resource conversion'ın
harcadığı Mark scenario muhasebesinde zaten eksi option value'dur; compiler bunu geçsin diye
gizli conversion damage'i eklemez.

Saf Attribute rotalarında rarity farkının görünmez Reserve'de tamamen kaybolmaması için
yalnız current layer'a ait küçük bir ifade payı vardır. Form etkilenmez. Specialization ve
sonrasında hedef pay, Common üstündeki rarity premiumunun `%1.5`idir; gerçek aktarım ise
yalnız tamamlanmış bir ayrık eşiğin altında kalan Primary Reserve kadar olabilir. Bu güç
Reserve'den `DIRECT_DAMAGE`e bire bir taşınır: Quality yaratılmaz, tamamlanmış Mark/Posture
azalmaz ve Common bedava bonus almaz. Şu an materyalize edilmiş Mark/Mark soyu bu sözleşmeyi
uygular; Posture/Posture kendi runtime çıktısı geldiğinde aynı rezerv modeliyle açılır.

AP Quality wallet'ının dışında ve varsayılan olarak `1`dir; rarity/Quality onu otomatik
ölçekleyemez. Mevcut Resolve Pressure cost projeksiyonu geçicidir ve ekonomi revampına
kadar rota bazında genişletilmez. Hedef sistemde Resolve cost rarity vergisi değil, açıkça
authored ve hissedilir bir mekanik kırılma noktasının bedelidir; maliyet artışı rarity
ödülünü silemez. Nihai AP/Resolve eğrileri dört başlangıç skilli, Fight, normal saldırı ve
companion aksiyonları aynı tam-tur simülatöründe ölçüldükten sonra kalibre edilir.

Parent gücü de sonuçla birlikte taşınır. Aynı child route ve aynı offered rank sabitlenip
geçmişteki tek bir rarity yükseltildiğinde dört-senaryo veya altı-faz sonucu geri gidemez.
Threshold'a yeni ulaşan zayıf history arayı kapatabilir fakat parent farkının en az `%10`unu
ve en az `1` görünür power birimini korumak zorundadır. Runtime validator bütün materialized
rotalarda `10.056` adjacent-parent karşılaştırması yapar; reversal veya fazla sıkışma deploy'u
durdurur.

`power`, combat sırasında verilen gizli damage değildir. Farklı kaynakları aynı terazide
karşılaştıran yalnızca compiler/validator puanıdır. Quality Compiler v5 değerleri merkezi
`SKILL_GUARDRAIL_POWER_VALUES` sözleşmesinde tutar:

Health combat compiler ile aynı küçük ondalıklı birimi kullanır. Örneğin compiler'ın
`6.25` damage sonucu runtime'da gerçekten `6.25` Health düşürür; normal floater bunu
temiz sunum için `6`, uzun basma breakdown ise `6.3` gösterebilir. `targetPower`, Quality
ve route dengesi bir sunum ölçeğine bağlı değildir.

| Kaynak | Guardrail power | Anlamı |
|---|---:|---|
| Üretilen 1 Chain | 2 | Sonraki ve aynı action içindeki Chain seçeneği |
| Üretilen 1 Mark | 6 | Gelecekteki Mark payoff seçeneği |
| Net 1 Resolve | 4 | Bir Resolve maliyetini/refundını ortak puana çevirir |
| Posture damage | 0.35 / puan | Break'e ilerleme değeri |

Örneğin 2 Resolve harcayan kart guardrail'de `-8`, saldırı sonunda 1 Resolve refund eden
kart `+4` alır; net ekonomi `-4` olur. Bu, refundın 4 damage vurduğu anlamına gelmez.
Katsayılar gerçek combat verisi geldikçe tek merkezden ayarlanır.

Resource değerleri action sonunda **net değişim** olarak ölçülür. Örneğin başlangıçtaki
`8 Mark`ın `4`ünü harcayıp `4 Chain` üreten bir hareket guardrail hesabında yalnız
`+4 Chain` yazamaz; aynı anda `-4 Mark` opportunity cost taşır. Mark okumak fakat
tüketmemek bu bedeli ödemez. Bu net-state muhasebesi builder ve consumer'ın iki ayrı
kez bedava güç yazmasını engeller; hareketin gerçek damage/Weight payoff'u yaptığı
takasın değerini karşılamak zorundadır.

Weight gibi bir Delivery yoğunlaştırıcısı da ikinci bir bedava Quality cüzdanı değildir.
F1S2T2 ödeme hesabında yalnız sabit bir Chain örneği kullanmaz: beklenen savunma Chain'ine,
hareketin sürdürülebilir Mark üretiminin sonraki kullanımlarda çevireceği Chain de eklenir.
Bu exposure'ın merkezî bir payı temiz darbeden ödenir; kalan pay başarılı hazırlık motorunun
kimlik ödülüdür. Böylece Common rota ezilmez, yüksek Quality Mark + Weight birleşimi de cap
olmadan fakat bedeli artarak büyür.

Tek-action senaryosu tek başına final denge ölçüsü değildir. Sharpshoot Twistleri ayrıca
sıfır Mark ile başlayan altı player phase boyunca ölçülür. Mark phase'ler arasında taşınır,
Chain yalnız savunmadan saldırıya gelir ve player phase sonunda sıfırlanır. Toplam damage ile
net Mark/Chain option value birlikte değerlendirilir. Common Form + Common Specialization
geçmişlerinde bütün Twist rarity'leri için `%20` bant zorunludur. Çok nadir üst üste güçlü
rarity geçmişleri ayrıca raporlanır ve bu bandı kırabilir; cap veya azalan verimle ezilmez.
Twist/Apex ailesi ve ikinci Mark-consumer skill henüz tamamlanmadığı sürece jackpot sonucu
oyunun açılışını durdurmak yerine raporlanır.
İkinci skill materialize edildiğinde ölçüye gerçek iki-skill rotasyonu da eklenecektir.

## 5. Allocation profile

Her handcrafted route recipe şunları taşır:

- self-sufficient mekanik blueprint;
- izin verilen Quality axis'leri;
- toplamı tam 1.00 olan allocation profile;
- damage/Chain shape;
- minimum impact floor;
- scenario safety/focus contract;
- output kilitleri;
- ileride compatible Legendary Stamp pool.

Axis isimleri merkezi `SKILL_SYNTHESIS_QUALITY_AXES` sözlüğünden gelmek zorundadır.
Recipe hem listesinde hem profilinde aynı yazım hatasını yapsa bile boot validator artık
bilinmeyen veya negatif axis'i reddeder; kullanılmayan bütçe sessizce damage'a gömülemez.

`FRONT` ve `BACK` Chain dağılımları Quality axis'i değildir. Bunlar authored `chainShape`
kurallarıdır. Quality `CHAIN_TOTAL` satın alır; açılan her yeni Chain seçilmiş shape kuralına
göre öne veya arkaya yerleştirilir. Böylece şekil kimliği ile güç bütçesi birbirine karışmaz.

Bir history paketinin axis katkısı:

`axisCredit = rawQuality * depthLeverage * routeAxisWeight`

Nihai Build Vector, bütün history receipt'lerinin toplamıdır. Aynı 8Q'nun farklı
katmanlarda gelmesi bu nedenle farklı hit/Mark/Chain yapısı üretir.

## 6. Mekanik minimumlar ve stat sentezi

Quality bir kartın temel fiilini açıp kapatamaz. Recipe blueprint her rarity'de çalışan
minimumu sağlar. Split Sight her zaman multihit, Chain Output ve Mark Output taşır.

Compiler:

1. Final blueprint'i kurar.
2. Full-history axis credit'lerini toplar.
3. Discrete hit/Chain/Mark eşiklerini uygular.
4. Chain ve damage shape'i uygular.
5. Resolve costu uygular.
6. Dört guardrail senaryosunda targetPower'ı çözecek total damage'i binary search ile bulur.
7. Büyük bir identity değişimi yapmadan yalnız declared damage sink'i ayarlar.
8. Düz combat objesini ve debug receipt'lerini cache'ler.

Test senaryoları temiz, prepared Mark, prepared Chain ve combined setup'tır. Solver
hatası ilk F1 sözleşmesinde `0.51` effective-power puanını aşamaz.

Her compiled kart bu dört sonucun tamamını ayrı cache'ler. Recipe `minCleanRatio`,
`maxScenarioRatio` ve gerekirse `favoredScenario` bildirir. Ortalama güç normal görünürken
temiz savaşta kullanılamayan veya tek hazırlıklı durumda kontrolsüz patlayan kart boot'ta
reddedilir. `Crown's Refraction` gibi açık Chain reader rotaları `CHAIN_READY` senaryosunu
gerçekten ödüllendirmek zorundadır.

Her recipe ayrıca `minTotalDamage` ve `minPerHitDamage` taşır. Binary solver bu tabanın
altına inemez. Fazla mekanik taşıdığı için okunamayacak kadar küçük/boş vuruşlara düşen
bir route target'ı çözemeyip authoring sırasında hata verir.

## 7. Discrete reserve

Hit, Chain ve Mark küsuratlı olamaz. Eşiğe ulaşmayan credit yok edilmez. Her discrete
axis şunları saklar:

- o axis'e gelmiş toplam credit;
- tamamlanan rank;
- son eşikte harcanan credit;
- reserve credit;
- mevcut tier'in toplam maliyeti;
- sonraki rank için gereken eksik credit.

Sonraki rarity packet full history rebuild sırasında aynı reserve'in üstüne eklenir.
Bu, küçük Common/Uncommon yatırımlarının ileride gerçek bir stat eşiği açmasını sağlar.

Eşikler global değildir. Her skill family registered bir `thresholdPolicyId` taşır ve
descendant aynı policy'yi miras alır. F1 Sharpshoot değerleri başka bir silahın Hit/Chain/
Mark ekonomisine yanlışlıkla uygulanamaz.

Reserve o anda başka bir stata dönüşmez. Axis kimliği korunur: eksik Mark power damage'a,
eksik Hit power Chain'e çevrilemez. Validator aktif guardrail gücü ile Reserve'ü birlikte
packet bütçesine eşitler. Structural Quality'nin continuous wallet payı Common seçimin
hemen görünür ilerleme vermesini sağlar; discrete pay ise sonraki history ile kristalleşir.

Örnek, üretilen her Mark `6 power`:

- `6.44` Mark power: +1 Mark, reserve `0.44`, sonraki Mark için `5.56` eksik.
- Sonraki history packet `+5.80` Mark power getirirse total `12.24` olur, +2 Mark açılır
  ve yeni reserve `0.24` kalır.
- Bu geçişte inherited damage azalmaz; yalnız Mark output ve Reserve muhasebesi değişir.

## 7.1. Azalma kuralı: no silent regression

Eski "hiçbir sayı asla azalmaz" kuralı iki ayrı sözleşmeye bölünür:

1. **Earned identity korunur.** Form Primary'si, seçilmiş Specialization Secondary'si,
   history Quality receipt'leri ve stamp'ler sessizce silinemez. Aynı route'un daha yüksek
   rarity'si Hit/Chain/Mark/interaction gibi kimlik outputlarını azaltamaz.
2. **Expression yeniden dağıtılabilir.** Reserve crystallization yeni bir mekanik rank
   açtığında base damage düşebilir; aynı route daha güçlü toplam target üretmeye devam eder.
3. **Route değişiminde takas açık olmalıdır.** Form ve Specialization kimliği kurar ve
   takas yapmaz. Gelecekte bir Stable Twist ancak declarative bir `tradeContract` ile,
   Primary ile Secondary arasındaki ilişkiyi gerçekten değiştiriyorsa bir outputu azaltabilir.
   UI tam olarak `GIVE` ve `GET` değerlerini göstermelidir. İlgisiz generic damage uğruna
   kimlik outputu azaltılamaz ve hiçbir mekanik tamamen silinemez.
4. **Apex yeni fedakârlık icat etmez.** Parent Twist'in takasını güçlendirebilir fakat
   ek bir gizli bedel ekleyemez. Distorted/Corrupted daha sert takasları kendi ayrı
   sözleşmeleriyle yapabilir.
5. Her durumda child'ın combined guardrail değeri parent'tan büyük olmalı; targetPower,
   receipt ve reserve muhasebesi korunmalıdır.

Quality Compiler v5 F1/F1S1 wallet diliminde aktif bir `tradeContract` yoktur.
Mevcut bütün geçişler no-silent-regression audit'inden geçer. İlk gerçek takas, ancak
Twist katmanı authored edilirken ayrı olarak onaylanacaktır.

## 8. Legendary stack gücü

İki Legendary ham olarak 28 Rarity Quality verir; tamamlanan katmanların Structural
Quality'si ayrıca eklenir. Buna ek olarak:

- her paket kendi depth leverage'ını alır;
- iki ayrı carried Legendary Stamp slotu bırakır;
- mevcut Resonance kuralıyla full Resolve refund açar.

Bu üç katman birlikte zaten lineerden daha büyük bir jackpot yaratır. Ölçüm yapılmadan
ayrıca `iki Legendary = damage multiplier` eklenmez. Gerekirse ileride bounded bir
Constellation sistemi ayrı tasarlanır; Quality ledger geriye dönük değiştirilmez.

## 9. Legendary Stamp kararı: carried passive inheritance

Stamp, bulunduğu dalın geçici rarity bonusu değildir. Legendary seçilen exact kartın
küçük, handcrafted pasif mirasıdır. Kart daha sonra evolve olsa bile history'de kalır
ve nihai hareket tarafından taşınır.

Her Legendary history node şimdiden bir `legendaryStampSlot` ve gelecekte bir
`legendaryStampId` taşır. İlk compiler sürümünde slotlar aktiftir fakat efekt havuzu
henüz authored değildir.

Önerilen stamp sözleşmesi:

- Exact kart family/theme ile ilişkili ve ismen hatırlanabilir olmalıdır.
- Küçük fakat build yönlendiren pasif olmalıdır; raw stat yaması olmamalıdır.
- Full-history rebuild sırasında deterministik uygulanmalıdır.
- Stable descendant'ın koruduğu semantic event hook'larını kullanmalıdır:
  `ON_HIT`, `ON_CHAIN_GAIN`, `ON_MARK_GAIN`, `ON_ACTION_END`, `ON_BREAK` gibi.
- Bir stamp başka stampı tekrar tetikleyemez.
- AP/Resolve infinite veya automatic event recursion üretemez.
- Additive, capped veya once-per-action olmalıdır; kontrolsüz multiplicative stack yasaktır.
- Birden fazla Legendary seçim birden fazla stamp taşır. Duplicate davranışı her stamp
  için `STACK`, `RANK_UP` veya `UNIQUE` olarak açıkça authored edilir.
- Stamp gücü core Quality equalizer'ın dışında bounded jackpot olarak ayrı ölçülür.

Form stamp'leri geniş chassis olaylarına, Specialization stamp'leri seçilmiş Secondary'ye,
Twist stamp'leri ilişkiye, Apex stamp'leri payoff'a bağlanabilir. Bunun nedeni dal bonusu
vermeleri değil, o Legendary kartın kendi temasını geleceğe taşımasıdır.

## 10. Zorunlu validatorlar

1. Base rarity yüzdeleri `%65/%27/%7/%1`, authored Quality eğrisi `1/4/8/14` kalmalı;
   ikisi üç kartlı draftın gerçek seçilme dağılımıyla birlikte değerlendirilmelidir.
2. Allocation profile yalnız izinli axis'leri kullanmalı ve tam 1.00 toplamalıdır.
3. Aynı history iki rebuild'de aynı stat, receipt, reserve ve target'ı üretmelidir.
4. Aynı parent/rarity sibling rotaları eşit güç bandında kalmalıdır. F1 audit'i bunu
   yalnız Common foundation'da değil, 4 Form rarity × 4 child rarity geçmişinin tamamında
   ölçmelidir.
5. Rarity ladder net upgrade olmalı; kimlik outputları gerilememelidir. Base damage ancak
   reserve crystallization veya açık bir relationship trade'i karşılığında azalabilir.
6. Legendary Form foundation, aynı Raw Quality'deki Legendary Specialization'dan biraz
   yüksek average güç üretirken geç Specialization kendi axis'inde daha yoğun olmalıdır.
7. Child seçim parent receipt'ini değiştiremez veya silemez.
8. Solver hata limiti aşılırsa recipe boot sırasında reddedilmelidir.
9. Post-Apex seçimler leverage büyütmemelidir.
10. Stamp sayısı Legendary history node sayısına eşit olmalıdır.
11. Her Form -> Specialization rarity kombinasyonu parent'tan güçlü olmalı ve Form'un
    Hit/Chain/Mark chassis değerlerini sessizce düşürmemelidir.
12. Her reserve kaydı `spent + reserve = total credit` muhasebesini ve doğru `needed`
    değerini korumalıdır.
13. Her Quality axis'in gerçek bir compiler handler'ı olmalıdır; yalnız isim olarak kalan
    dead axis yasaktır.
14. Her rarity/history sonucu authored impact floor ve scenario envelope içinde kalmalıdır.
15. Attribute outputları rarity tablosu veya geçici eğriyle yazılamaz. Compiler önce
    `Quality wallet × rol katsayısı × Handling katsayısı` ile ifade edilebilir gücü bulur,
    ardından evrensel output değerine böler. Aynı history aynı sonucu üretir; ifade
    edilemeyen güç kaybolmaz ve route sözleşmesindeki Primary eksene geri dağıtılır.
16. Resource guardrail action başı ve action sonu Mark/Chain farkını fiyatlamalıdır;
    tüketilen Mark veya Chain maliyeti sessizce sıfır sayılamaz.
17. Mark üretimi için gameplay/authoring maksimumu konulamaz. Discrete progress tekrarlanan
    sabit fiyatlı eşiklerle sınırsız ilerler; yalnız safe-integer veri doğrulaması yapılır.
18. Aynı Stable route rarity yükselttiğinde owned identity profile gerileyemez. Kontrol,
    yalnız çıplak yüzdeye değil o katsayının gerçek hit/damage üstündeki payoff'una bakar.

## 11. Şu anki migration durumu

- F1 Mark Form; F1S1 Mark/Mark, F1S2 Mark/Chain, F1S3 Mark/Posture, F1S4 Mark/Critical,
  F1S5 Mark/Affliction ve F1S6 Mark/Charge Specialization Quality Compiler v5 wallet +
  Mark semantic compiler v20
  ile preview edilir; Structural ve Rarity Quality
  ayrı receipt olarak görünür. F1S2 Chain'i tüketmeden prepared Chain başına bounded ek
  hasar üretir. F1S3 önce Secondary rol (`0.80`) ile Light Ranged Posture Handling (`0.40`)
  katsayılarını çarpar; Posture wallet'ının `0.32`si lineer olarak ifade edilir ve
  `0.35 power/Posture` üzerinden gerçek çıktıya dönüşür. Hard cap, soft cap ve rarity
  lookup tablosu yoktur. Kalan wallet Primary Mark'a geri dağıtılır; iki-layer mevcut
  matriste Common/Common yaklaşık `3.4`, Legendary/Legendary yaklaşık `18.1` Posture üretir.
- F1S3 altında dört materialized Twist vardır. T1 düz ve güvenilir Posture darbesidir. T2
  action-start Mark'ı harcamadan her stack için lineer Posture okur. T3 kendi darbesinden
  sonra bir sonraki pozitif Posture kaynağı için genel bir primer saklar; skill, parry veya
  Knight Rush ayrımı yapmaz. T4 action başında bar en az `%50` doluysa ek Posture verir.
  Dört route da Mark'ı ve tek temaslı hafif-yay chassis'ini korur; Quality ile tavansız ilerler.
  Mekanik Delivery dördünde de `SINGLE` kalır fakat koreografileri ayrıdır: T1 yay yanında mavi
  darbe sıkıştırması, T2 hedefte Mark yakınsaması, T3 primer mührü, T4 ise eşik altında sade ve
  eşik hazırken altın finisher vurgusu kullanır. Bu ayrım yeni combat contact üretmez.
  Ortak Bow hareket ölçeği timeline kurulurken bir kez uygulanır (`1.35x`); okun uçuş hızı aynı
  kalır. Tarif seçimi action başında dondurulur ve cue çizimleri sabit maliyetli Canvas
  primitive'leridir; frame içinde allocation, particle nesnesi veya skill-id taraması yapılmaz.
  Secondary Handling ifadesi sonraki Twist receipt'lerinin Posture eksenlerine de uygulanır;
  ifade edilemeyen wallet Primary Mark'a geri döner. `256` Form/Spec/Twist rarity kartı kimlik,
  parent mirası, rarity, primer lifecycle ve tavansız Mark→Posture okuması için test edilir.
- F1S4 Crit wallet'ı Secondary rol `0.80 × Stable Support 0.50 = 0.40` ile ifade edilir.
  Local Crit yüzdesi `ifade edilen Crit power / (base damage × (Crit multiplier - 1))`
  formülünden çıkar; dolayısıyla güçlü okun aynı Crit yüzdesini satın alması daha pahalıdır.
  Rarity lookup, Precision, global Crit ve runtime clipping yoktur. Mevcut iki-layer
  matriste Common/Common `%13.2`, en güçlü history `%26.7` local Crit üretir.
- F1S5 Affliction wallet'ı iki tam phase-end tick süren Bleed değerine çevrilir. Her
  application `NEXT` ve `LATER` bucketlarına aynı değeri ekler; dolayısıyla compiler
  dönüşümü `Bleed = Affliction Power / 2` olur. Common/Common `1.8`, mevcut en güçlü
  iki-layer history `9.9` Bleed uygular. Savunma fazını bitiren Break yalnızca çözdüğü
  `NEXT` tick'ine `×1.25` verir; `LATER` büyümez. Bleed Crit, Chain veya doğrudan
  saldırıların standart `×1.5` Break çarpanını almaz. Bu Specialization yalnızca
  application açar; potency/duration motoru ileride Affliction Primary/Twist/Apex alanıdır.
- F1S6 Charge wallet'ı `DEFENSE_TEMPER` üzerinden bir Charge başına base damage'e çevrilir.
  Savunma fazını tamamlamak `1`, her Perfect Dodge/Parry `+1`, defense Break en az `2`
  Charge bankalar; state `3`te durur ve kullanılmazsa kaybolmaz. F1S6 bankayı tek seferde
  tüketir. Compiler beklenen kullanımını `×2 Charge` üzerinden fiyatlar: Common/Common
  Charge başına `1.8`, mevcut en güçlü iki-layer history `9.9` base damage üretir; başarılı
  maksimum savunmada bunlar `5.4` ve `29.7` bonus olur. Bonus base damage olduğu için
  Chain/Crit/Break ile etkileşir. AP/Resolve üretmez ve başka saldırılar bankayı tüketmez.
- Mixed Specialization'larda Form receipt'i immutable foundation'dır. Yeni katmanın
  Attribute wallet'ı full-history toplamını okuyarak bütün kartı `70/30` kimlik hedefine
  yaklaştırır; eski Quality yeniden harcanmaz. Böylece güçlü Form geçmişi Common
  Secondary outputunu büyütürken parent Mark/Damage tabanı gerilemez.
- F1S1 altında dört çalışan Mark/Mark Twist tamamlandı. Dördü de tek gerçek temas ve
  tek doğal Chain üretir; ekstra Chain scaling/read/conversion alamaz. T1 bütün Mark'ı
  tek pakette, T2 ayrı hasarsız Mark pulse eventleriyle verir. T3 T1'den değer okumayan
  bağımsız bir harekettir: Common geçmişte `5` düz Mark verir ve action-start Mark'ının
  `floor(%20)`sini tüketmeden Bloom olarak ekler; aynı action içindeki yeni Mark kendi
  kendini tetikleyemez. T4 kendi vuruşundan sonra player phase Mark Trail kurar; sonraki
  hasar temasları Mark ekler ve Trail faz sınırında silinir.
- F1S1/F1S2 kimlik ayrımı executable'dır: 64 eşdeğer rarity geçmişinde dört F1S1 Twist'in
  en düşük garanti Mark'ı dört F1S2 Twist'in en yüksek garanti Mark'ından büyüktür. Damage
  karşılaştırması tooltip clean sayısı yerine clean/Mark-ready/Chain-ready/combined gerçek
  senaryolarının ortalamasını kullanır; böylece Weight'in temiz hasar ödemesi yanlışlıkla
  güçsüzlük sayılmaz. Güncel `256` F1S1 sentezinde en dar Mark farkı `+1`, en dar beklenen
  hasar farkı Mark/Chain lehine `12.5`tir.
- T1/T2/T4 Mark/Mark rota ölçeği her `7` toplam Quality için tavansız `+1 Mark` verir.
  T3 bu ortak bonusu birebir almaz. Sabit `%20` Bloom yanında geçmiş gücünü lineer
  `max(0, ceil(total Quality / 7) - 2)` düz-Mark temeline çevirir; standart eş-rarity
  geçmişlerinde düz paket `5/6/9/13` olur. Böylece iyi Form/Spec/Twist geçmişi Apex'te
  önemini korur ama Bloom oranı geçmişten katlanarak büyümez.
  Bütün rotalar aynı görünür `0/5/10/15/20` Mark durumlarında ölçülür; Mark/Mark/Mark-Chain
  ortalama güç oranı bütün `64` geçmişte `0.8792–1.1431`, provisional rotasyon oranı
  `0.9604–1.2470` bandındadır.
  `192` ayrı rarity merdiveni total power ve sahip olunan mekanik gerilemesine karşı boot'ta
  doğrulanır. Bloom `floor(start Mark × 0.20)` kullanır: oran T3'e aittir, T1 scalingine
  bağlı değildir ve sonuç için gameplay cap yoktur.
- Eski Split Sight calibration preview'leri compatibility adapter olarak tutulur; yeni
  içerik parent-stat geriye çözümünü kullanamaz.
- Guardrail değerleri merkezileştirildi; scenario vector ve impact floor auditleri aktiftir.
- Chain frontload/backload artık dead Quality axis değil, total Chain'i dağıtan shape kuralıdır.
- Skill Lab Move Tree Form ve Specialization rarity'sini ayrı seçebilir.
- Live reward draft hâlâ legacy authored mutationları kullanır; yarım migration yoktur.
- Twist/Apex recipe'leri compiler'a taşınmadan canlı sistemi değiştirilmez.
- Legendary passive stamp effectleri tartışılıp authored edilene kadar yalnız güvenli
  slot/history altyapısı bulunur.

## 12. Sonraki sıra

1. **Tamamlandı:** Marked Rhythm altında dört pilot Twist recipe'si Quality Compiler'a taşındı.
2. **Tamamlandı:** Dört Twist altında dörder rarity-neutral Apex recipe'si taşındı; aynı
   parent ve rarity için eşit güç bandı, Twist kimliği ve Delivery mirası boot-time denetimdedir.
3. **Tamamlandı:** T4'ün dört Apex'i contact, Mark, Chain ve iki-dalga rolleriyle ayrıştırıldı.
   Dört route × `4^4` rarity geçmişi = `1024` sentez boot sırasında Quality hatası, rarity
   gerilemesi, minimum pellet okunabilirliği ve rol bulanıklığı için taranır.
4. **Tamamlandı:** F1S1'in dört Mark/Mark Twist'i ve F1S1↔F1S2 kimlik duvarı runtime
   materialization + full-history denetimine taşındı.
5. **Tamamlandı:** F1S3 Mark/Posture Specialization hafif-yay expression modeliyle yenilendi ve
   dört Twist (impact, Mark read, next-source primer, half-bar finisher) materialize edildi.
6. **Devam ediyor:** F1S1T1 iki dürüst Apex ile tamamlandı: saf Mark ve dengeli darbe.
   F1S1T2 üç Apex ile tamamlandı: pulse event yoğunluğu, toplam Mark payload ve gerçek ok darbesi.
   İlave pulse eventleri `2 power` ödeyen ayrı bir Mark alt-ekseni olarak fiyatlanır; Reserve ve
   parent mirası korunur. Apex sayısı sabit kota değil, parent Twist'in bağımsız eksen sayısıdır.
   F1S1T3 de üç Apex ile tamamlandı: Bloom oranı, düz Mark ve darbe. Oran Apex'i `70/15/15`
   dağılım kullanır; her `1.5 power` yalnız bu receipt üzerinde `+5` puan Bloom satın alır.
   Düz Mark Apex'i `5/95`, darbe Apex'i `80/20` kullanır. F1S1T4 de üç Apex ile tamamlandı:
   Trail gücü, ilk Mark paketi ve darbe. Trail Apex'i `30/25/45` dağılım kullanır; ayrı
   `MARK_TRAIL_STRENGTH` ekseninde her `6 power`, sonraki her hasarlı temas için tavansız `+1 Mark`
   satın alır. Diğer iki Apex parent Trail'i aynen korur ve sırasıyla `5/95` ile `80/20` kullanır.
6. **Tamamlandı:** Full-history validator `7,520` parent-child, `5,643` rank ve `16,392`
   stronger-parent karşılaştırmasını ortak runtime gate içinde tarar. Kalıcı giriş komutu
   `node tools/validate-skill-implementation.cjs KnightRush.html` olup Structure, Design,
   Bug, Rarity ve Power sonuçlarını ayrı ayrı yayınlar.
7. Legendary Stamp semantic hook ve power cap sözleşmesini tam vertical slice üstünde aç.
8. Yeterli route coverage sonrası live route-first draftı aç.
