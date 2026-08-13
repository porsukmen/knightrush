# Knight Rush Kart Sentez Yol Haritası

## Hedef

Tek bir hareket, run boyunca seçilen rota, rarity ve aspect geçmişinden yeniden üretilir. Hiçbir çocuk kart parent'ı sıfırlamaz. Form ve Specialization rotaları eşit erişilebilir kalır; nadir olan rota değil, rotanın gelen rarity/aspect ifadesidir.

## Temel formül

`Sonuç = base skill + sıralı rota tarifleri + rarity ledger + aspect ledger`

Quality Compiler'ın tam ve kalıcı sözleşmesi `QUALITY_COMPILER_DESIGN_TR.md` içindedir.
F1 preview artık eski statları sırayla mutate etmez; full history receipt'lerinden nihai
statları sıfırdan derler.

Her seçim history içinde en az şunları saklar:

- route/family kimliği;
- depth;
- rolled rarity;
- rolled aspect;
- Quality katkısı;
- Resolve Pressure katkısı;
- parent kimliği ve sentez origin'i.

## Güncel yön kararı — Attribute ve Delivery ayrımı

Mevcut F1 Form/Specialization içeriği Quality Compiler için çalışan bir kalibrasyon
dilimidir; nihai içerik taksonomisi değildir. Yeni Stable hiyerarşi şu sözleşmeye
taşınacaktır:

- Form yalnız `Primary Attribute` seçer.
- Specialization aynı skill paletinden `Secondary Attribute` seçer.
- Twist iki attribute arasındaki ilişkiyi ve izinli Delivery dönüşümünü seçer.
- Apex seçilmiş ilişkiyi ve Delivery'yi yeniden icat etmeden tamamlar.
- Rarity rota veya mekanik seçmez; mevcut Quality/Pressure/Resonance sistemiyle nihai
  güç bütçesini belirlemeye devam eder.

Attribute, Delivery ve Payload birbirinden bağımsızdır:

- Attribute hareketin ne ürettiğini, okuduğunu veya yönettiğini belirler.
- Delivery etkinin hedefe hangi animasyon ve temas düzeniyle ulaştığını belirler.
- Payload vuruşun Physical, Bleed, Burn veya Poison gibi ne taşıdığını belirler.

Sharpshoot için geçici olarak setlenen attribute paleti `Mark`, `Chain`, `Posture`,
`Critical`, `Affliction` ve `Charge`'dır. Charge burada aynı aksiyon içindeki wind-up
animasyonu değil, boss phase boyunca taşınan ve savunma performansını okuyabilen phase
state'idir. Bu içerikler ayrı vertical slice'larla doğrulanmadan eski F1 ağacı nihai
kart içeriği kabul edilmez.

### Attribute rol sözleşmesi

- Primary hareketin self-sufficient ana motorudur; Stable sonuçta Secondary tarafından
  kimlik olarak geçilemez.
- Secondary görünür ve anlamlı destek verir fakat hareketi başka bir Form'a çevirmez.
- Rarity toplam Quality'yi büyütür; Legendary Secondary bile Primary/Secondary rol
  sırasını tersine çevirmez.
- Nihai compiler, node rarity contribution'larını korurken Primary için mekanik floor,
  Secondary için bounded share uygular. Fazla Secondary credit sessizce kimlik devralmaz.

Setlenen ilk davranışlar:

- **Mark Primary:** ana amaç ve en yüksek scaling Mark üretimidir. **Mark Secondary:**
  ana hareketin yanında daha küçük ekstra Mark üretimidir.
- **Posture Primary:** ilgili silah içindeki ana Break rotasıdır. Weapon Handling mutlak
  posture tavanını etkiler; bow bir heavy weapon kadar posture vurmaz ama rota toplam
  güçte tuzak hâline getirilemez. **Posture Secondary** yalnız ölçülü destek verir.
- **Affliction Primary:** bow için native Bleed'i açar ve beklenen hasarın önemli kısmını
  boss phase sonundaki DoT'a taşır. **Affliction Secondary:** direct damage ana kalırken
  bonus Bleed uygular. Enchantment payload'u değiştirebilir fakat Form'un çalışması için
  zorunlu değildir.
- **Charge Primary:** maliyetini hazırlarken öder, Knight activation'ını kapatır ve
  sonraki player phase'de 0 AP/0 ek Resolve Release'e dönüşür. **Charge Secondary:** ana
  hareketi geciktirmez; boss phase savunma performansıyla aynı skill'in sonraki kullanımını
  temper eder. Fazı bitirmek `1`, her Perfect Dodge/Parry `+1`, defense Break en az `2`
  bankalar; maksimum `3`tür. Banka kullanılmazsa kaybolmaz, yalnız Charge Secondary move'u
  kullandığında tek seferde tüketilir. Parti geldiğinde Charge bütün party phase'ini silemez.

### Doğrudan temas ve Chain görünürlük kuralı

Attribute ile Delivery ayrı veri eksenleridir fakat Delivery'nin gerçek temas semantiği
combat çıktısını etkileyebilir:

- Ayrı zamanlarda görülen ve damage veren her `SEQUENTIAL` direct contact temel olarak
  1 Chain event'idir.
- Aynı anda ulaşan Shotgun/Volley pelletleri tek `SIMULTANEOUS_PACKET` sayılır ve toplam
  1 temel Chain event'i üretir.
- DoT tick, yalnız VFX olan temas ve damage vermeyen görüntü varsayılan olarak Chain
  üretmez.
- Knight Rush gibi özel hareketler açık override ile her gerçek contact için Chain
  üretebilir.
- Görünen Sequential temasın doğal Chain'i, mevcut prototipte bilinçli bir Delivery
  avantajıdır ve Quality cüzdanından damage çalmaz. Ancak ayrı bir karşılaştırma sayacına
  ve kardeş-Twist senaryo testine girer; böylece güç görünmez sayılmaz. Packet yalnız bir
  Chain verdiği için kaybettiği doğal temas değerini sınırlı bir Mark-parity ödemesiyle alır.
- Chain dışındaki buildler de uyumlu Sequential Delivery alıp doğal Chain kazanabilir.
  Chain Primary/Secondary ise Delivery havuzunun ağırlığını ve Chain üzerindeki ek
  scaling/interaction hakkını sahiplenir.
- Primary/Secondary çifti bütün Delivery'leri açmaz; weapon vocabulary ile kesişen küçük
  bir uyumlu havuz üretir. Twist bu havuzdan görünür bir seçim/roll ile pattern'i
  değiştirebilir.

Bu kural yeni Delivery şeması gelene kadar legacy `hits/chainGainPerHit` koduna parça
parça uygulanmaz. Migration adapter'ı mevcut saldırıları önce `SEQUENTIAL` olarak korur;
Shotgun/Volley ancak packet semantiği hazır olduğunda eklenir.

### Bow Animation Recipe sözleşmesi

Bow animasyonu kart adına göre dallanmaz. Çalışan sunum şu bileşimden çözülür:

`Weapon rig + Delivery pattern + phase timing + Bow recipe + payload/impact FX`

- Recipe; yayı kaldırma, çekme, bekletme, bırakma ve recovery sürelerini; ok hızı,
  yay çizgisi, ok ölçeği, recoil, trail, impact, hit-stop ve gelecekteki çoklu atış
  aralığını bounded parametreler olarak taşır.
- Mekanik hasar sabit bir saniyeye yazılmaz. Timeline `RELEASE`, `CONTACT` ve
  `RECOVERY` anlarını recipe'den üretir; projectile ve gerçek hasar aynı `CONTACT`
  anını kullanır.
- Specialization Form Delivery'sini değiştirmez. Yalnız ortak Bow hareketinin sunum
  profilini seçer: Mark Focus, Chain, Posture, Critical, Affliction ve Charge.
- Twist uyumlu Delivery'yi seçebilir ve recipe üzerinde güvenli override uygulayabilir.
  Attribute tek başına hit sayısını veya animasyon şablonunu belirleyemez.
- Yaygın kartlar bounded profilleri kullanır. Legendary/Distorted/Corrupted içerik
  sınır dışı davranış istiyorsa bunu ayrı, açıkça doğrulanan özel recipe ile yapar.
- Recipe yalnız action başlangıcında çözülür. Frame loop Quality sentezi veya kart
  geçmişi taramaz; hazır timeline ve küçük sabit dizileri oynatır.

### Bleed başlangıç kontratı

- Bleed gerçek damage'i boss'un saldırı sayısından bağımsız olarak boss phase sonunda
  bir kez verir; Break phase'i erken bitirirse yine tek kez tick eder.
- Hareketler sırasında görsel kanama feedback'i olabilir fakat bu ekstra mekanik tick
  değildir.
- Bleed standart `×1.5` doğrudan Break bonusunu veya Critical multiplier'ı almaz. Savunma
  fazını erken bitiren Break, Bleed'in o tek tick'ine daha küçük `×1.25` bonus verir.
- Bleed integer stack veya retention kuyruğu değildir. Her application sonraki iki boss
  savunma fazı sonunda tam değeriyle vurur ve sonra biter. Runtime bunu allocation
  üretmeyen iki toplamla (`NEXT/LATER`) taşır.
- Secondary Affliction yalnızca Bleed application açar. Primary Affliction ileride daha
  güçlü potency/duration ilişkisine sahip olabilir. `%75` retention davranışı Bleed'e
  değil, gelecekteki Poison kimliğine ayrılmıştır.

### Critical için değerlendirme sınırı

Critical hibrit model kullanır. Character/equipment küçük bir global Crit tabanı
sağlayabilir; evolution kartı ise varsayılan olarak yalnız kendi hareketinin local Crit
chance/power değerini geliştirir. Bir skill Form'unun bütün diğer saldırılara bedava
global Crit dağıtması yasaktır; böyle bir takım/karakter buff'ı ancak açıkça authored
Twist, Legendary Stamp veya Artifact olabilir.

- Sistem tabanı `×1.5` Critical damage'dir. `×1.75` ve `×2` gibi sonuçlar varsayılan
  değildir; authored Twist/Apex/Legendary Stamp/Artifact yatırımı ister.
- Sequential direct contactlar ayrı Crit roll alır; simultaneous packet varsayılan
  olarak tek roll alır.
- Crit olan doğrudan temas aynı sonuçla hem Health damage'ini hem de o temasın Posture
  damage'ini güçlendirir; Health ve Posture için ayrı Crit roll atılmaz.
- Critical Primary'nin move-local Precision değeri her başarısız gerçek contacttan
  sonra yükselir ve Crit olduğunda sıfırlanır. Critical Secondary küçük düz local chance
  verir; varsayılan olarak Precision motoru açmaz.
- Secondary local chance rarity tablosundan gelmez. Crit wallet önce rol/context
  katsayılarıyla ifade edilir; ardından actual base damage ve `×1.5` multiplier'ın
  beklenen değer maliyetine bölünür. Böylece yüksek damage üzerindeki aynı yüzde daha
  pahalıdır ve Quality bütçesi korunur.
- Crit ve Break çarpımsal stacklenir: taban `×1.5 Crit ×1.5 Break = ×2.25` olur.
- Bleed/diğer DoT tickleri varsayılan olarak Crit atmaz.

### Tek ondalıklı Health damage dili

Compiler, authored recipe, canlı Health damage ve boss HP aynı küçük damage birimini
kullanır. Ayrı `×10` fixed-point dönüşümü yoktur. Yüzdelik sonuçlar gerçek savaşta üç
ondalığa kadar korunur; yalnız oyuncuya çizilen metin formatlanır.

- Normal combat floater ve kısa butonlar temiz bir tam sayıya yuvarlanır.
- Uzun basma, Skill Lab ve damage breakdown en fazla bir ondalık gösterir.
- Boss HP gerçek ondalıklı sonucu kaybedermeden düşer; bar bu gerçek oranı kullanır.
- Posture da Crit gibi çarpanlardan gelen ondalığı koruyabilir.
- Mark/Chain stackleri, AP ve Resolve doğal olarak integer kalır.
- Damage uygulamasında değer üç ondalığa stabilize edilir; JavaScript kayan nokta artığı
  ölüm, overkill veya deterministik test sınırlarını kirletemez.

## Aşama 0 — Ekonomi çekirdeği (tamamlandı)

- Rarity Quality: Common 1, Uncommon 4, Rare 8, Legendary 14.
- Structural Quality: Form 2, Specialization 2, Twist 3, Apex 4; Common dahil her
  evolution katmanının görünür ilerlemesini garanti eder.
- Resolve Pressure: Common 0, Uncommon 1, Rare 2, Legendary 3.
- Projected Resolve cost: `Form base + floor(total Pressure / 3)`.
- İki/üç/dört Resonance puanı sırasıyla +1/half/full refund verir.
- Rare 1, Legendary 2 Resonance puanıdır; Common/Uncommon geçmişi silmez.
- Bir Legendary tek başına Resonance başlatmaz.
- Ledger yalnız seçim/rebuild sırasında hesaplanır ve cache'lenir.
- Legacy absolute kartların canlı costu migration bitene kadar değişmez.

## Aşama 1 — Rarity-neutral F1 rota iskeleti (tamamlandı)

Bir Form ve altı Specialization recipe olarak kayıtlıdır:

1. Split Sight — multihit Chain Formu.
2. Ranger's Rhythm — cadence.
3. Opening Signal — önden Chain dağılımı.
4. Marked Rhythm — Mark Secondary.
5. Forked Cadence — damage timing.
6. Driving Pair — sonraki aksiyona Chain yatırımı.
7. Crown's Refraction — canlı Chain reader.

Recipe yalnız kimlik, izinli Quality eksenleri, output kilitleri ve interaction izinlerini taşır. Sabit rarity taşımaz.

## Aşama 2 — Mekanik blueprint ağacı (F1 tamamlandı)

Her rota bütün rarity'lerde çalışan self-sufficient bir mekanik minimum taşır. Stat
sayıları blueprint içine kalıcı kart değeri olarak yazılmaz; full-history Quality
Compiler tarafından çözülür.

Her rota için:

1. Form ve seçilmiş descendant mekanikleri sırayla okunur.
2. Her history node kendi Quality receipt'ini ve allocation profile'ını verir.
3. Bütün axis credit'leri ve discrete reserve değerleri toplanır.
4. Nihai hareket sıfırdan derlenir ve targetPower'a çözülür.
5. Aynı katmandaki altı rota aynı hedef bütçe fakat farklı karar üretmelidir.

Önce Split Sight Formu, sonra altı Specialization tamamlanır. Twist/Apex bu aşamada üretilmez.

F1 Common Specialization blueprint'leri aynı parent üstünde ayrı kararlar üretir:

| Rota | Vuruş | Damage | Chain | Mark | Oyun kararı |
|---|---:|---|---|---:|---|
| Ranger's Rhythm | 3 | compiler çözer | 1 / 1 / 1 | 1 | daha çok bağımsız temas |
| Opening Signal | 2 | compiler çözer | 2 / 1 | 1 | Chain'i ilk vuruşa yükleme |
| Marked Rhythm | 2 | compiler çözer | 1 / 1 | 2 | Mark Secondary |
| Forked Cadence | 2 | back-loaded | 1 / 1 | 1 | hasarı son vuruşa saklama |
| Driving Pair | 2 | compiler çözer | 1 / 3 | 1 | Chain'i son vuruşa yatırma |
| Crown's Refraction | 3 | compiler çözer | 1 / 1 / 1 | 1 | mevcut Chain'i her temasta okuma |

Bu tablo mekanik floor'dur. Common dahil bütün nihai damage değerleri Quality bütçesinden
yeniden üretilir.

## Aşama 3 — Quality Compiler v3 wallet migration (F1–F1S3 tamamlandı)

Form receipt'i kilitli foundation olarak kendi izinli eksenlerinde kalır. Mixed
Specialization yalnız kendi yeni Attribute packet'ını full-history `70/30` hedefine göre
Primary/Secondary arasında dağıtır. Build Vector çözülmüş receipt'lerin toplamından oluşur.

- Common: küçük, temiz ilerleme.
- Uncommon: görünür güç veya vurgu artışı.
- Rare: kuvvetli expression; izinli incidental Mark 2 eşiği açılabilir.
- Legendary: rotanın açıkça avantajlı yüksek ifadesi.

Compiler yeni bir Primary/Secondary icat edemez. Legendary daha yüksek Quality ve sabit
depth leverage alır fakat rota kimliğini değiştirmez. Pressure basamakları Resolve costunu
deterministik hesaplar.

V3 sertleştirmesi:

- Her katman Structural Quality + Rarity Quality packet'ı üretir.
- Stable parent statları düşmez; açık authored trade yalnız Twist ve aspect sözleşmeleriyle
  gelebilir.
- Discrete axis Reserve'ü başka bir stata çevrilmez ve full history boyunca taşınır.

- Chain frontload/backload Quality tüketmez; total Chain'i dağıtan authored shape kuralıdır.
- Guardrail değerleri tek balance tablosundadır: Chain 2, Mark 6, net Resolve 4,
  Posture 0.35.
- Her recipe minimum total/per-hit impact floor taşır.
- Clean, prepared Mark, prepared Chain ve combined sonuçlar ayrı cache'lenir; her route
  scenario safety/focus sözleşmesiyle denetlenir.
- Handler'ı olmayan Quality axis boot sırasında reddedilir.

Gerekli fixturelar:

- Legendary Form → Common Specialization;
- Common Form → Legendary Specialization;
- Rare → Common → Rare Resonance;
- dört Rare full refund;
- iki Legendary full refund;
- bir Legendary için sıfır refund.

F1 için 4 Form ve 24 Specialization rarity materialization'ı üretilir. Aynı Common
Form geçmişi sabit tutulduğunda altı Specialization'ın scenario-score farkı zorunlu
olarak ortalamanın `%10`undan küçük kalır. Compiler aynı target'ı çözdüğü için mevcut
F1 matematik fixture'larında dört rarity satırı da rounding öncesinde aynı güçtedir;
solver hatası `0.51` puanı aşamaz. Her route'un rarity merdiveni strict olarak yükselir.

Her history node şunları ayrı saklar:

- Raw Quality ve Resolve Pressure;
- depth leverage ve Effective Quality katkısı;
- axis allocation receipt'i;
- Legendary passive stamp slotu.

Compiled command ayrıca bütün receipt'lerden türetilen aggregate axis credit ve discrete
reserve durumunu cache'ler.

Discrete reserve kaybolan veya bedava bekleyen güç değildir. Eksik Hit/Chain/Mark power'ı
kendi axis Reserve'ünde full history boyunca kalır; geçici damage bridge'e çevrilmez.
Eşik tamamlanınca gerçek mekanik ranka dönüşür. Stable inheritance floor nedeniyle
parent damage ve kimlik outputları sessizce gerileyemez. Form ve Specialization'da takas
yoktur; gelecekte yalnız açıkça authored bir Twist `tradeContract`
ile Primary–Secondary ilişkisi içinde bounded takas yapabilir.

Bu ayrım yalnız debug/denge açıklamasıdır; canlı saldırı önceden sentezlenmiş düz skill
objesini kullanır. Yeni çocuk kart parent'ın eski katkılarını yeniden hesaplayıp silemez.

### Skill Lab sentez görünümü (tamamlandı)

Move Tree, migrate edilmiş F1 Form ve Specialization düğümlerinde dört rarity düğmesi
gösterir. Form ve Specialization rarity seçimleri ayrı tutulur. Uzun basma tooltip'i
seçili iki rarity'nin tam sentezlenmiş hasar, hit, Chain, Mark, Resolve cost, Quality,
Pressure ve Resonance sonucunu gösterir. Bu yalnız inceleme katmanıdır; eski canlı draft
henüz değiştirilmez.

Skill Lab Combat artık sahte bir tur yenilemesi kullanmaz. `Finish Turn`, normal oyunun
gerçek boss savunma fazını başlatır; telegraph, saldırı, Perfect Dodge, Parry, Break,
Bleed ve Charge aynı runtime yolunda çözülür. Lab'da alınan darbe koşuyu bitirmez fakat
Chain'i sıfırlar ve savunma sayacına yazılır. `ABORT/RESET` yalnız laboratuvar durumunu
güvenle temizler; sahte Charge, Bleed tick'i veya Break ödülü üretmez.

## Aşama 4 — Canlı draft materialization

1. Uygun route familyleri parent'tan bulunur.
2. Üç farklı family eşit ihtimalle, tekrarsız seçilir.
3. Her family için rarity bağımsız roll edilir.
4. Rarity'ye bağlı Stable/Distorted/Corrupted roll edilir.
5. Her aday mevcut history üzerinden sentezlenir ve immutable preview olarak cache'lenir.
6. Seçilen preview'nun history tokenı kaydedilir; canlı skill aynı tokenlardan rebuild edilir.

Aynı draftta aynı family iki rarity ile gösterilmez. Büyük kataloglu bir skill diğer skillleri drafttan boğamaz.

## Aşama 5 — Aspect sentezi

Stable sonuçlar tamamen çalışmadan Distorted/Corrupted aktif edilmez.

- Stable: parent kimliğini lineer geliştirir.
- Distorted: mevcut output/interaction dengesini tuhaflaştırır; değişikliği recipe modülüyle sınırlıdır.
- Corrupted: güçlü avantaj + açık drawback; geçmişte kalır ve sonraki Stable seçimle temizlenmez.

Aspect de absolute kart seçmez; mevcut synthesized parent'a relative modifier uygular.

## Aşama 6 — Twist ve Apex

- Mevcut pilotta Twist, seçilmiş Primary–Secondary ilişkisinin dört farklı yorumudur.
- Mevcut pilotta Apex, seçilmiş Twist'in dört maksimum ifadesidir.
- `6 Form / Form başına 6 Specialization / Specialization başına 4 Twist / Twist başına 4 Apex`
  şimdiki içerik hedefidir; compiler bu sayıları sabit varsaymaz ve ileride büyütülebilir.
- Her katman rarity-neutral recipe olarak yazılır.
- Rarity/aspect aynı materialization motorundan gelir.
- Mastery dört katman dışındaki uzun-run gelişimi olarak ayrı kalır.

Twist rarity sözleşmesi:

- Önce sibling Twist blueprint'i seçilir, rarity bundan bağımsız roll edilir.
- Aynı Twist Common–Legendary arasında aynı ilişkiyi, Delivery pattern'ini ve
  temas sayısını korur; yalnız izinli Quality eksenleri güçlenir.
- Aynı rarity ve aynı parent geçmişinde sibling kartlar yaklaşık eşit güç bandında,
  fakat farklı taktik profillerinde kalır.
- F1S2 pilotu `F1S2T1`: önceki Mark/Chain sıralı saldırısının doğrudan devamıdır.
  Ok sayısı sabit yazılmaz; bütün geçmişin toplam Quality değerinden üretilir. Her
  temas 1 Chain üretir. İlk ok başlangıç Chain'ini, sonraki her ok ise önceki okların
  aynı saldırı içinde ürettiği Chain dahil güncel değeri kullanır.

## Aşama 7 — Eski sistemi kapatma

Bir rota tam migrate olduğunda:

1. Absolute `patch` yalnız legacy preview olmaktan çıkarılır.
2. Projected Resolve cost canlı `cost` olur.
3. Sabit node rarityleri kaldırılır.
4. Eski 2 Common / 2 Uncommon / 1 Rare / 1 Legendary pool validatorı kaldırılır.
5. Route equality, synthesis reproducibility ve lineage economy validatorları zorunlu yapılır.

## Aşama 8 — Weapon Chassis ve silah kimliği

Bu aşama hemen uygulanmayacaktır. Önce yeni Attribute/Delivery sözleşmesiyle en az bir
tam Stable vertical slice, canlı draft materialization ve animation dispatch ayrımı
doğrulanmalıdır. Silah çeşitliliği bundan sonra, run içi weapon swap ve geniş silah
içeriği üretilmeden önce eklenir.

Her silahın kimliği beş veri katmanından oluşur:

1. **Family:** `MELEE`, `PROJECTILE`, `SPELL` veya `ABILITY` animasyon dili.
2. **Handling:** Light/Medium/Heavy güç dağılımı; toplam gücü değil temas, Resolve,
   posture ve payload uygulama profilini değiştirir.
3. **Delivery vocabulary:** Silahın kullanabildiği Single, Sequence, Volley,
   Crescendo, Echo ve benzeri pattern havuzu.
4. **Weapon signature:** Bütün weapon skill'leri etkileyen, tek cümleyle açıklanabilen
   ve oyuncu kararını değiştiren küçük silah kuralı.
5. **Native payload ve attribute palette:** Silahın doğal status dili ve skill'lerinin
   kullanabildiği attribute paletleri.

Silah verisi en az şu ayrımları taşımalıdır:

- `actor`: hareketi owner mı companion mı gerçekleştiriyor;
- `deliveryFamily`: animasyon/etki dili;
- `deliveryPattern`: temasların zaman düzeni;
- `targeting`: enemy, self, ally veya party hedefi;
- `animationProfile`: tekrar kullanılabilir animasyon şablonu;
- `handlingProfile`, `signatureRule`, `nativePayload` ve izinli Delivery havuzu.

`SELF` Delivery Family değildir; targeting değeridir. `COMPANION` da Delivery Family
değil, actor kaynağıdır. Böylece Wolf Bite ile Knight Slash aynı `MELEE` combat dilini
kullanırken farklı actor ve animation profile üzerinden oynatılabilir.

### Handling sözleşmesi

- Light daha çok temas ve düşük temas başı etki eğilimi taşır.
- Medium daha geniş Delivery esnekliği ve dengeli dağılım taşır.
- Heavy az temas, yoğun etki, posture/charge eğilimi ve daha yüksek Resolve baskısı taşır.
- Handling hiçbir silaha bedava toplam güç vermez; compiler yalnız aynı hedef bütçenin
  dağılımını değiştirir.
- Görsel hit sayısı Resolve, Mark veya Affliction'ı otomatik olarak çarpmaz. Her output
  `PER_ACTION`, `SPLIT_ACROSS_CONTACTS`, `PER_CONTACT_CAPPED` veya `FINISHER_ONLY` gibi
  açık bir uygulama kuralı taşır.

### Weapon signature sözleşmesi

Signature düz yüzde bonusu değildir. Artifact olmadan çalışmalı, iki weapon skill'ini
de etkilemeli, tek bir attribute rotasını zorunlu kılmamalı ve en az birkaç turda bir
oyuncunun kararını değiştirmelidir. Varsayılan olarak yeni bir bar açmaz; mevcut Mark,
Chain, Posture, Critical, Affliction, Charge veya Delivery state'leri üzerinden çalışır.

### Sentez ilişkisi

Nihai weapon move şu sırayla derlenir:

`base skill + attribute history + relationship recipe + rarity/aspect ledger + weapon chassis + delivery + payload`

Aynı `Primary -> Secondary` geçmişi silah kimliğini silmez. Örneğin Chain -> Critical;
bow üzerinde sıralı projectile, dagger üzerinde melee flurry, heavy weapon üzerinde
az temaslı finisher olarak ifade edilebilir. Silah yalnız animasyonu değiştirmez;
attribute ilişkisini kendi Delivery ve signature diliyle yeniden ifade eder.

### Kabul kriterleri

- Kart adı ve damage sayıları gizlendiğinde iki silahın karar ritmi ayırt edilebilmelidir.
- Normal `Fight` saldırısı silah farkını ilk kullanımdan göstermelidir.
- Aynı rarity/history için silahlar hedef güç bandında kalmalıdır.
- Light multihit, Resolve veya status ekonomisini otomatik ele geçirmemelidir.
- Heavy, AP başına avantajını sınırsız Resolve verimliliğine çevirmemelidir.
- Yeni silah için kart başına özel runtime kod veya yüzlerce özel animasyon gerekmemelidir;
  reusable animation profile ve declarative recipe kullanılmalıdır.
- Run içi weapon swap tasarlanırken mevcut build history'nin silinmesi, yeni chassis'e
  recompile edilmesi veya weapon-bound tutulması ayrıca kararlaştırılmalıdır; bu karar
  bu aşamadan önce varsayılmaz.

## 2026-08-03 kapanış checkpoint'i

Bugünkü genel sistem ve efficiency audit'i şu sonucu verdi:

- Ana HTML tek inline script olarak syntax kontrolünden geçti.
- Bütün boot-time skill self-testleri tamamlandı: 40 validator fixture'ı, 96 F1
  hiyerarşi geçişi, altı synthesis route ve mevcut rarity/guardrail denetimleri geçti.
- Gerçek headless Chrome 480x800 açılışı ana menüyü doğru render etti.
- Base skill definition aramaları tek immutable O(1) indexe taşındı; duplicate id boot
  sırasında reddediliyor.
- Content audit ve Move Tree child traversal, büyüyen global kart kataloğunu tekrar
  taramak yerine mevcut parent->children indexini kullanıyor.
- World depth sort comparator'ları frame başına yeniden closure üretmiyor.
- Tekrarlanan event-listener, açık kalan interval veya sınırsız runtime cache bulunmadı.
  Hold timer'ları temizleniyor; ağır canvas/model cache'leri bounded ve lazy kalıyor.
- Quality synthesis combat frame-loop içinde çalışmıyor; yalnız boot audit, Skill Lab,
  draft/rebuild sınırlarında çalışıyor.
- Altı kimlik artık tek immutable `COMBAT_ATTRIBUTES` registry'sinde tutuluyor. Her
  attribute Primary/Secondary promise, capability, scaling axis, identity band ve
  uyumlu Delivery Pattern metadata'sına sahip.
- Bütün 36 Primary/Secondary çifti registry'den türetiliyor. Aynı attribute çifti
  gelecekte silah paleti isterse kullanabilsin diye `FOCUS`, farklı çiftler
  `DUAL_ATTRIBUTE` ilişkisi olarak temsil ediliyor.
- Eski F1 kimlikleri geçici adapter ile Mark/Chain/Posture'a bağlandı; cadence ve damage
  timing bilinçli olarak attribute sayılmadı. Boot audit altı kimliği, rol sahipliğini,
  capability/axis referanslarını ve 36 çiftin Delivery kesişimini doğruluyor.
- Delivery artık tekrar kullanılabilir profil registry'sine sahip. `OWNER_BOW`,
  `OWNER_SWORD`, `OWNER_SHIELD` ve `COMPANION_STRIKE`; actor, family, targeting,
  animation profile, izinli contact pattern ve phase timing vocabulary'sini tanımlar.
- Contact pattern (`Single/Sequential/Simultaneous Packet`) ile phase timing
  (`Immediate/Delayed Release`) ayrı eksenlerdir. Böylece Charge saldırının zamanını,
  silah ise temas biçimini belirleyebilir.
- Base skill'ler açık Delivery profile id taşır. Eski/dinamik command'lar tek legacy
  adapter üzerinden çözülür; canlı Chain matematiği bilinçli migration yapılana kadar
  değişmez. Her action başlangıcında resolved Delivery contract kayda alınır.
- Generic synthesis recipe sınırı `ATTRIBUTE_V1` kimliğini kabul ediyor: Form açık
  Primary; sonraki derinlikler Primary + Secondary; her biri açık Delivery profile,
  pattern ve timing taşımak zorunda. Eski F1 recipe'leri `LEGACY_CALIBRATION` olarak
  işaretlendi ve yeni içerik gibi görünemez.
- Recipe factory'nin her hareketi zorla pozitif Mark ve Chain üretmeye mecbur bırakan
  F1 varsayımı kaldırıldı. Posture/Critical/Affliction/Charge rotaları sıfır Mark veya
  sıfır Chain ile geçerli blueprint kurabilir.
- İlk final Attribute-v1 content contract'ı `Sharpshoot Mark Primary` için kuruldu.
  Altı Specialization sırasıyla Mark Focus, Chain, Posture, Critical, Affliction ve
  Charge Secondary'dir. Hepsi aynı katman güç bütçesine sahiptir.
- Direct damage kimlik oranının dışındadır. Farklı-attribute Specialization'larda kalan
  attribute bütçesinin `%69.2`si Mark Primary'ye, `%30.8`i Secondary'ye ayrılır. Mark
  Focus aynı kimliğe iki taraftan yatırım yaptığı için bütün attribute bütçesini Mark'ta
  birleştirir.
- Katman sorumluluğu kesinleşti: Form Primary'yi ve başlangıç Delivery'sini kurar;
  Specialization Secondary'yi seçer, yaklaşık `70/30` attribute bütçesini gerçek
  çalışan temel çıktılara dönüştürür ve Form Delivery'sini miras alır. Specialization
  özel Primary/Secondary ilişki kuralı veya Delivery dönüşümü yazamaz. Bunları Twist
  seçer; Apex seçilen Twist'i tamamlar. Rarity yalnız güç/history katmanıdır.
- Yeni rota düğümleri canlı draft'a sokulmadan Move Tree'de incelenebilir. `F1 · MARK`
  ile altı `F1S1–F1S6` Specialization artık kontrat önizlemesi değil, gerçek Quality
  sentezli saldırılardır. Move Tree'deki `EQUIP TEST` bunları Skill Lab savaşına takar.
  Beş rota Form'un Single Delivery'sini korur; Mark/Chain rotası Specialization anında
  Quality tabanlı Sequential Delivery'ye geçer. Altısının ayrı Bow sunum recipe'si vardır.
- Sharpshoot'un skill-seviyesi kaynak rolü kilitlendi: bütün Stable soylar Mark'ı
  tüketmeden okuyabilir, koruyabilir ve ona göre hasar/çıktı üretebilir; fakat net en az
  `+1 Mark` üretimini korur. Stable tüketim yalnız açık bir istisnada, en fazla `1 Mark`
  ve yine pozitif net üretimle mümkündür. Büyük/çoklu/tam Mark tüketimi gelecekteki
  ikinci weapon skill'in payoff kimliğidir. Bu nedenle Sharpshoot Quality ekseninin adı
  `MARK_MANAGEMENT` yerine tüketim çağrıştırmayan `MARK_CONTROL` olarak kilitlendi.
- F1S1 pilotunda Twist öncesi hareket tek ok ve doğal tek Chain teması olarak kalır;
  Mark tüketmez veya okumaz. Common Form + Common Specialization sonucu
  `22.237 damage`, `+3 Mark`, `1 Resolve` olur. Form Common sabitken Specialization
  rarity merdiveni sırasıyla `22.237/+3/1`, `25.009/+4/1`, `28.705/+5/1`,
  `38.249/+7/2` (`damage/Mark/Resolve`) üretir. Bunlar elle yazılmış rarity tabloları
  değil; full-history Quality, depth leverage, discrete Mark reserve ve Resolve
  Pressure tarafından yeniden sentezlenir.
- F1S2 seçildiği anda Quality büyüklüğünde sıralı delivery'ye geçer; her görünen ok
  doğal `+1 Chain` verir ve Chain tüketmez. Secondary wallet, prepared Chain
  senaryolarına göre fiyatlanan ek damage-per-Chain oranı satın
  alır. Eski tek-ok rarity rakamları artık sözleşme değildir; gerçek temas sayısı
  `floor(sqrt(totalQuality))` ile sentezlenir ve Skill Lab'de rank geçmişiyle birlikte
  gösterilir. Fazladan Chain gücü ayrı sayaçta izlenen ücretsiz delivery payoff'ıdır.
- F1S3 aynı Form Delivery'sini korur ve Posture'u final hit sonrasında uygular. Posture
  rarity başına yazılmış bir tablo veya geçici curve kullanmaz. Compiler Secondary rol
  katsayısı `0.80` ile Light Ranged Posture Handling katsayısı `0.40`ı çarpar; uygun
  Posture wallet'ının `0.32`si her Quality seviyesinde aynı lineer kuralla ifade edilir.
  `0.35 power/Posture` dönüşümü sonrasında Common Form sabitken Specialization rarity
  merdiveni yaklaşık `3.4/5.0/7.2/10.5` Posture; Legendary/Legendary geçmiş ise yaklaşık
  `18.1` Posture üretir. Hard veya soft cap yoktur. İfade edilmeyen wallet gücü kaybolmaz;
  Specialization paketinin Primary Mark kısmına geri akar.
  Specialization tek-ok Pattern'ını değiştirmez fakat ortak Bow Recipe sistemindeki
  `BOW_POSTURE` profili daha uzun draw/hold, yavaş ve büyük projectile, güçlü recoil,
  impact shake ve hit-stop ile teması görünür ve ağır hâle getirir.
- F1S4 tek-ok Form Delivery'sini, doğal `+1 Chain` temasını ve net Mark üretimini korur.
  Yalnız bu harekete ait local Crit chance ekler; global Crit, Crit multiplier ve
  Precision vermez. Secondary rol `0.80 × Stable Support 0.50 = 0.40` wallet ifadesiyle,
  Crit yüzdesi actual base damage üzerindeki beklenen `×1.5` değerinden hesaplanır.
  Common/Common `%13.2`, mevcut en güçlü iki-layer history `%26.7` local Crit üretir;
  `%35` yalnız boot-time tasarım guardrail'idir, runtime cap değildir.
- F1S5 aynı tek-ok Delivery'yi ve net Mark üretimini koruyup hareketin final temasından
  sonra iki tick Bleed uygular. Common/Common `1.8`, Legendary/Legendary `9.9` Bleed
  üretir. Compiler bunu `Affliction Power / 2` ile hesaplar. Savunma Break'i yalnızca
  çözdüğü tick'i `×1.25` yapar; sonraki tick normal kalır. Crit/Chain/standart Break
  Bleed'i çarpmaz.
- F1S6 aynı tek-ok Delivery'yi ve net Mark üretimini korur. Charge Secondary savunma
  performansından `0–3` arasında banka oluşturur ve F1S6 bu bankayı Charge başına Quality
  kaynaklı base damage'e çevirir. Common/Common oran `1.8`, Legendary/Legendary `9.9`
  damage/Charge'dır. Compiler expected power'ı `×2` üzerinden fiyatlar; `×3` başarılı
  savunmanın bounded upside'ıdır. Banka AP/Resolve değildir, başka saldırılar tüketmez.
- Mixed-attribute Specialization compiler'ı cumulative allocation kullanır. Form'un
  gerçekleşmiş Primary gücü kilitlidir ve tekrar harcanmaz. Yalnız yeni Specialization
  Attribute paketi, kartın tamamındaki yaklaşık `70/30 Primary/Secondary` hedefine
  yaklaşacak şekilde bölünür. Weapon/role ifade katsayısı Secondary'nin ne kadarının
  gerçek outputa dönüşebileceğini belirler; kalan güç Primary'ye geri döner. Bu nedenle
  parent Mark temeli azalmaz, threshold platosu oluşmaz ve aynı history daima aynı
  lineer sonucu üretir.
- Knight'ın eski `Arrow Rain`, `Shield Kick` ve `Royal Slash` girişleri yalnız placeholder
  olduğu için aktif skill roster'ından ve bunlara özel combat/UI dallarından kaldırıldı.
  Sharpshoot dışındaki üç slot ileride sıfırdan tasarlanacak; hiçbir Quality veya Posture
  kararı eski placeholder sayılarını referans alamaz.

Bugün bilinçli olarak yapılmayanlar:

- Eski F1 card content'i yeni Attribute sistemine çevrilmedi; matematik fixture'ı olarak
  korunuyor ve artık çoğaltılmamalı.
- Arrow/Lance, eski shop ve filler artifact kalıntıları run revamp'tan önce parça parça
  silinmedi; bağlı akışları birlikte değişmeden kaldırmak riskli.
- `proj()` halen render sırasında küçük projection objeleri üretir. Gerçek düşük cihaz
  profili bu allocation'ı hotspot olarak göstermeden geniş görsel refactor yapılmaz.
- Tek HTML build-time modüllere bölünmedi. Güvenilir bundling/version-control akışı
  olmadan dosya bölmek frame performansını iyileştirmez.

Güvenli devam sırası:

1. **Tamamlandı:** Attribute registry: `Mark`, `Chain`, `Posture`, `Critical`,
   `Affliction`, `Charge`; Primary/Secondary rolleri ayrı metadata.
2. **Tamamlandı:** Delivery veri sözleşmesi: actor, family, pattern, timing, targeting,
   animation profile ve payload application. Mevcut `source`, `tags`, `slash`, `hits`
   alanları legacy adapter üzerinden çalışmaya devam ediyor.
3. **Tamamlandı:** Rarity/Quality compiler matematiğine dokunmadan yeni recipe
   kimliğini kabul eden generic sınır kuruldu.
4. **Tamamlandı:** F1 ve altı Stable Specialization gerçek saldırı olarak sentezlendi. Her çalışan
   Specialization için 4 Form rarity × 4 Specialization rarity kombinasyonu otomatik
   guardrail denetimindedir.
5. **Devam ediyor:** F1S2 Mark/Chain Specialization Quality tabanlı delivery sistemine
   geçirildi. T1 doğrudan sıralı devam, T2 Single/Weight Mark→Chain dönüştürücü,
   T3 tek ok + hedef yankısı ve T4 gerçek shotgun paketi olarak materialize edildi.
   Dört pilot Twist tamamlandı. T1 altında dört Apex: temaslara dağıtılan Mark, sonraki
   oklarda yükselen canlı Chain katsayısı, son oka taşınan hasar ve uncapped yoğun tempo
   olarak materialize edildi. T3 altında dört Apex de tamamlandı: daha yoğun yankı,
   Mark başına daha güçlü geçici Chain, yalnız gerçek Chain'i güçlendiren okuma ve her
   yankıda gerçek Chain üreten canlı büyüme. T4 altında dört Apex de tamamlandı: daha yoğun
   pellet paketi, pellet başına büyüyen Mark, pellet başına gerçek Chain ve aynı toplam
   pellet bütçesini iki dalgaya bölen staged saldırı.
   A2'nin son-ok Chain katsayısı kendi Apex packet Quality'sinin kareköküyle büyür; bu
   bonus global `%5 / Chain` tabanının üstüne eklenir ve rarity boyunca artmak zorundadır.
   T2 altında dört Apex de tamamlandı: bütün başlangıç Mark'ını çeviren burst, yarım
   dönüşümü koruyup uncapped Weight'i daha hızlı büyüten sıkıştırma, doğrudan ağır darbe
   ve vuruş sonrası daha fazla Mark kuran sürdürülebilir döngü. Dördü de tek ağır ok,
   saldırı öncesi dönüşüm ve Weight tabanlı Chain scaling kimliğini korur.
6. Bu slice doğrulanmadan canlı draftı, diğer skillleri, weapon swapı veya animation
   rewrite'ını topluca migrate etme.

## Performans sözleşmesi

- Sentez yalnız draft açılışında, seçimde ve rebuild'de çalışır.
- Frame loop lineage taramaz.
- Combat normal düz skill objesini okur.
- History dört evolution katmanında küçüktür; Mastery ayrı cache kullanır.
- Aynı seed + aynı history aynı üç aday ve aynı sonuçları üretir.

## Quality tabanlı Delivery büyüklüğü

- Delivery tipi ile temas sayısı birbirinden ayrıdır. `SEQUENTIAL` ve
  `SIMULTANEOUS_PACKET` bir temasla başlayabilir; onları `SINGLE`dan ayıran şey
  büyütülebilir delivery parametresidir.
- Parametre tüm geçmişin ham toplam Quality değeriyle belirlenir:
  `floor(sqrt(totalQuality))`. Sonuç en az `1`dir ve gameplay maksimumu yoktur.
- `SEQUENTIAL` için sonuç ok/vuruş sayısı, `SIMULTANEOUS_PACKET` için pellet sayısı,
  `SINGLE` için kartın açıkça seçtiği mekanik bonusu yoğunlaştıran `Weight` değeridir.
- Mark/Chain Specialization seçildiği anda saldırı Quality büyüklüğündeki sıralı
  delivery'ye geçer. Common Form + Common Specialization toplam Quality `6` olduğu
  için iki ok; Common F1S2T1 toplam Quality `10` olduğu için üç ok üretir.
- Sıralı saldırıda her görünen temas `+1 Chain` verir. Sonraki oklar daha önceki
  okların aynı saldırı içinde ürettiği Chain'den de yararlanır. Fazladan Chain delivery'nin
  Quality cüzdanından hasar çalmayan ücretsiz avantajıdır. Bu güç sentez hatasına
  dahil edilmez fakat denge testi için ayrı sayaçta tutulur; fazla güçlü bulunursa
  daha sonra cüzdandan fiyatlandırılabilir.
- Çok yüksek Quality sayıları bilinçli olarak build'i kırabilir. İleride yalnız
  sunum/performance batching yapılabilir; oyun matematiğine hard cap eklenmez.
- Aynı uncapped kural Mark output için de geçerlidir. Shotgun pellet veya başka bir
  Delivery yüksek Quality ile `12+ Mark` üretebilir; denge per-action limit ile değil,
  Quality allocation ve net resource opportunity-cost senaryolarıyla kurulur.
- Boss savunmasında kazanılan Chain bir sonraki player phase'e taşınır; player phase
  bittiğinde sıfırlanır. Attack içinde kurulan Chain sonraki boss cycle'a sızmaz.
- Converter değerlendirmesi action sonu eksi action başı kaynak durumunu kullanır:
  üretilen Chain artı, tüketilen Mark eksi yazılır. Mark'ı yalnız okuyan hareketlerde
  tüketim bedeli yoktur.
- F1S2T2 Single delivery'ye geçer. Başlangıç Marklarının yarısını yukarı yuvarlayıp
  `1 Mark → 1 Chain` olarak vuruştan önce dönüştürür. Oluşan Chain ağır okun hesabına
  girer; normal Mark üretimi finalde gerçekleşir. Weight base damage'i değil, toplam
  global temel Chain bonusunu çarpar; Quality kaynaklı ek Chain oranı sonradan bir kere
  eklenir. Weight uncapped olsa da ikinci bir bedava güç cüzdanı değildir. Compiler beklenen
  defense Chain'ine, hareketin kendi sürdürülebilir Mark üretiminden sonraki kullanımlarda
  çevireceği Chain'i ekler; bu exposure'ın merkezî payını temiz darbeden öder. Kalan bölüm
  başarılı Mark hazırlığının ilişki ödülüdür. Common/Common/Common geçmişte Quality `10`,
  Weight `3` olur.
  T2A1 yarım dönüşümü tam dönüşüme çıkarır. T2A2 yarım dönüşümü korur fakat
  `totalQuality × 1.5` üzerinden uncapped Weight üretir. T2A3 Apex packet'ini doğrudan
  darbeye, T2A4 ise vuruş sonrası Mark yeniden kurulumuna yönlendirir.
- F1S2T3 shotgun değildir. Tek fiziksel ok atılır; ok hedefe değdikten sonra Quality
  büyüklüğü kadar hasar yankısı oluşur. Bu nedenle bütün hareket yalnız `+1` kalıcı
  Chain üretir. Başlangıç Markı tüketilmez; her Mark doğrusal olarak bu saldırı için
  `+0.3` geçici Chain sayılır. Örneğin `5 Mark → 1.5 geçici Chain`; cap veya azalan
  verim yoktur. Geçici Chain yalnız
  bu hareketin hasarına girer, boss Chain sayacına yazılmaz. Normal Mark üretimi finalde gelir.
  T3A1 toplam Quality ile yankı sayısını daha hızlı büyütür. T3A2 kendi Apex Quality'siyle
  Mark başına geçici Chain oranını artırır. T3A3 yalnız gerçek başlangıç Chain'ini çarpar;
  Mark'tan gelen geçici Chain aynı kalır. T3A4 ana temas ve her yankıda `+1` gerçek Chain
  üretir; sonraki yankılar aynı saldırıda daha önce üretilen Chain'i okur. T3A4 bu kalıcı
  kaynak değerini temiz darbe bütçesinden öder, fakat Chain veya yankı sayısına tavan koymaz.
- F1S2T4 gerçek `SIMULTANEOUS_PACKET` shotgun'dır. Quality büyüklüğü kadar ayrı pellet
  aynı anda çıkar. Bütün paket toplam `+1 Chain` üretir. Bir pellet başına `1 Mark` tabanı
  kendi damage bütçesinden ödenir. Packet'in Sequential'a kıyasla kaybettiği doğal Chain
  contact gücü `ceil(lost Chain power / Mark power)` kadar ek Mark'a çevrilir; Quality'nin
  normal Mark wallet'ı bunların üstüne sınırsız büyüyebilir. Packet ayrıca Sequential'ın
  aynı saldırıda önceki okların Chain'ini okuma avantajını kaybeder; bu kaybın `%95`i packet
  impact hasarına geri döner. Mevcut Markı okumaz veya tüketmez. Böylece T3 hazır
  Markı koruyan payoff, T4 ise sonraki hareketler için hızlı Mark kuran builder olur.
- T4A1 toplam Quality'yi `×1.5` okuyarak uncapped pellet lideri olur. T4A2 normal pellet
  eğrisini korur; kendi Apex Quality'sinde her `6` puan için ek Mark üretir, güncel
  okunabilirlik tabanı için en az `+2` Apex Mark taşır ve bunun yarısını temiz hasardan öder.
  T4A3 her eşzamanlı pellet sonrası `+1` gerçek Chain üretir fakat aynı packet içindeki
  pelletler birbirini güçlendirmez. T4A4 toplam pellet sayısını değiştirmeden iki dengeli
  dalgaya böler; her dalga `+1 Chain` üretir ve yalnız ikinci dalga birincinin Chain'ini okur.
  Quality wave sayısını değil toplam pelleti büyütür.
- T4 için dört route × dört depth'teki bütün rarity kombinasyonları (`1024` sentez)
  boot-time full-history kontrolden geçer. Quality çözüm hatası `≤0.01`, her pellet temiz
  hasarı `≥6`, rarity kimlik çıktıları gerilemesiz ve dört Apex rolü birbirinden ayrıdır.

## Bir sonraki somut iş

Skill Lab'de F1S2 Common geçmişinin iki oka, F1S2T1 Common geçmişinin üç oka çıktığını;
her temasın `+1 Chain` verdiğini ve sonraki okların önceki okların ürettiği Chain'den
yararlandığını doğrula. T2'de `5 Mark → 3 Chain`, Single Weight `3`, dönüşüm sonrası Chain hasarı ve
final Mark üretimini kontrol et. T3'te tek okun üç yankı temasına dönüştüğünü, `5 Mark`ın
tüketilmeden `1.5` geçici Chain verdiğini ve kalıcı Chain'in yalnız `+1` arttığını kontrol
et. T4'te üç okun aynı anda çıktığını, Common örnekte `+4 Mark` verdiğini ve bütün paketin yine
yalnız `+1 Chain` ürettiğini doğrula. T4 Apexlerinde A1'in dört pelletlik tek paketini,
A2'nin en yüksek Mark çıktısını, A3'ün üç pellet üzerinden `+3 Chain` üretirken pelletleri
birbirine scale ettirmediğini ve A4'ün `2+1` iki dalgasında ikinci dalganın ilk `+1 Chain`i
okuduğunu kontrol et. Sonra T5 ilişki tasarımına geç. Legacy canlı draft
ancak yeni hiyerarşide yeterli route coverage oluşunca değiştirilir.
