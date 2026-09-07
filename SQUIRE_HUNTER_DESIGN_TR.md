# Squire Avcı — tasarım notları

Avcı rotasının dört yükseltmesi uygulandı: Hunter → Tracker → Ambusher → Forest Phantom.

## Uygulanan final: Forest Phantom

- Son görsel ayar: pelerinin tamamı 10 yeşil/yosun veya kuru yaprak/turuncumsu/toprak paletinden birini seçer. Yapraklar tek rengin açık/koyusu değil, o ana renge yakın altı farklı renktir: yeşilde yosun/zeytin/sarı-yeşil, kuru yaprakta hardal/bakır/kiremit. Ana kumaşla %68 komşu renk karışımı kullanılır. Sırt yaprakları 25 sıranın tamamına şaşırtmalı kümelerle yayılır; merkezde yaklaşık %80 hücre doludur, kıvrımlar için aralıklar kalır. Renkler kareler arasında değişmez.
- Ortak gerçek oyun yay timeline'ında kaldırma, çekme, bekletme, bırakma ve toparlanma 1.15 hız katsayısıyla oynar. Knight ve Hunter aynı derleyiciyi kullanır. Ok uçuş hızı, çoklu atış aralıkları ve hasar değerleri değişmez; temas zamanı yeni bırakma anından hesaplanır.

- Ghost Shot: full Common/Uncommon/Rare/Legendary geçmişlerinde 3/4/6/8 tam Mark. Karma rarity geçmişi aynı tam sayı interpolasyonunu kullanır.
- Covering Shot: 1 Squire AP + 1 Resolve. Knight önce vurursa önceki patlama desteği; önce engellenmemiş bir boss darbesi gelirse hazırlık bir Perfect Dodge için tüketilir. Boss parry tepki animasyonunu oynatır; mevcut saldırı dizisi ve o boss'a ait aktif tehlikeler kesilir. Knight/Squire canı ve shield tüketilmez; sonraki saldırılar için koruma kalmaz. İnfaz saldırıları bu korumayı aşar. Yalnızca mevcut Perfect Dodge ödül sistemi kullanılır; ek parry ödülü verilmez.
- Final Quality payları atış %30, hazırlık %40, Veterancy %15, can %15. Patlama katsayısı üçüncü ve dördüncü yükseltmenin hazırlık kredilerinden gelişir.
- Final başın arkasından dizlere inen, omuzdan dökülen çalı pelerinidir. Kumaşın örtü olduğu geniş aydınlık/gölgeli kıvrımlar, omuz katlaması ve belirgin etek kenarıyla okunur. Küçük ince yapraklar ağırlıklı olarak kenarlardadır; ortada kumaş görünür kalır. Soldan bir dal çıkar; Recruit/Guard/Veteran/Bastion sırasıyla 1/2/3/4 dal taşır. Ek dallar farklı yüksekliklerde ve asimetriktir; yay tarafındakiler atışta içeri çekilir. Toprak/haki tonları, yukarıda hafif salınan tüy ve görünür alt bacaklar korunur. Arkadan görünümde yüz çizilmez.
- Tüy kulak üstüne bağlıdır; kameraya ve yukarı doğru uzanır. Tüm formlarda önceki boylar %18 küçültüldü: 1.35/1.70/2.15/3.15 × 0.82. İlk formda rank büyümesi yok; diğerlerinde rank başına %13. Serbest uçta hafif salınım vardır. Yapraklar eklem ve gövde projeksiyonlarını takip eder; pelerin en üst giysi katmanıdır.
- Animation Lab ve iki taraflı compare ağacında tüm formlar seçilebilir.

## Uygulanan üçüncü yükseltme: Ambusher Squire

- Tracker → Ambusher. Quality payları: atış %40, hazırlık %35, Veterancy %15, can %10. Diğer statlar mevcut Quality sistemiyle gelişir.
- Hunting Shot: tek ok; full Common/Uncommon/Rare/Legendary geçmişlerinde 2/3/4/6 tam Mark. FIGHT değişmez, Mark eklemez.
- Explosive Arrow: Patient Aim'in bekleme, eşzamanlı isabet, tek kullanım ve 1 AP/1 Resolve kurallarını korur. Patlatılan Mark başına ek hasar katsayısı `1 + üçüncü upgrade'in HUNTER_READY Quality kredisi*0.08`.
- Knight Mark patlatırsa onun tükettiği adet kullanılır, fazladan Mark tüketilmez. Avcı kendi patlatırsa kendi tükettiği adet kullanılır. Marksız durumda ek patlama hasarı sıfırdır. Bonus Crit/Chain ile tekrar çarpılmaz veya başka patlama tetiklemez.
- Şapka yerini kısa kapüşona bırakır; gövdeden kontrast renkli pelerin iki omuza genişler. Recruit sade kapüşon/pelerin; Guard kapüşon yaprakları ve dikiş; Veteran asimetrik uzun uç; Bastion parçalı uçlar, yaprak demeti ve uzun tüy. Gövde büyümez. Pelerin en üst katmandadır.
- Animation Lab form döngüsüne ve uzun basılan skill/compare ağacına Ambusher eklendi; Hunting Shot ve Explosive Arrow klipleri seçilebilir.

## Uygulanan ikinci yükseltme: Tracker Squire

Animation Lab → SQUIRE TEST: Base/Guard/Hunter/Tracker form seçimi, dört rütbe, Idle/Fight/skill/duck klipleri, sabit palet ve COLORS düğmesi, duraklatma/kare ilerletme bulunur. COMPARE, Hunter ve Tracker'ı aynı palet/poz/rütbeyle yan yana gerçek oyun renderer'ında gösterir. Bu önizleme savaş durumunu değiştirmez.

- Rota: Hunter Squire → Tracker Squire. Mevcut rarity/Quality geçmişine ikinci kayıt eklenir.
- İkinci yükseltmenin Quality payları: atış %25, hazırlık %25, Veterancy verimliliği %35, can %15.
- Ready Shot adı Patient Aim olur. Etkili Veterancy başına hazırlık gücü katkısı 0.20 yerine 0.35'tir. Bekleme, eşzamanlı isabet ve tek kullanım kuralları korunur; savunma gücü eklenmez.
- Tek omuza bağlı kısa asimetrik pelerin, kıyafetin mevcut rastgele rengini korur; uçta hafif salınım vardır. Kılıç/kalkan yoktur, gövde rank ile büyümez.
- Recruit (0 Veterancy): sade kısa pelerin ve toka.
- Guard (2): biraz uzun pelerin, kenar dikişi, tek yaprak; tüy %10 uzar.
- Veteran (5): daha uzun pelerin, üç yaprak; tüy %20 uzar.
- Bastion (9): parçalı pelerin ucu, beş kenar yaprağı ve omuzda yaprak demeti; tüy %30 uzar.
- Rütbe isimleri/eşikleri mevcut ortak sistemden gelir; ayrı bir Avcı rank sistemi açılmaz. Ölüm çiziminde form/rank korunur.

## Uygulanan ilk yükseltme

- Call Squire → Hunter Squire rotası mevcut class/Quality/rarity sistemi üzerinden seçilir. Base ve Guard rotaları korunur.
- MARKING SHOT: tek, düşük hasarlı ok. Mark çıktısı artık tam sayıdır; Avcı küsurat üretmez. 1 Squire AP, 0 Resolve. Crit, Chain, Posture ve Bleed katkısı yoktur.
- READY SHOT: 1 Squire AP ve 1 ortak Resolve ile 1.65 saniyede yayı gerer; Knight'ın sonraki doğrudan saldırısının ilk isabetini bekler. Hazırlık tek kullanımlıktır.
- Knight'ın saldırı planı Mark patlatıyorsa ek Mark tüketmeden güçlü bonus verir. Knight Mark patlatmıyorsa mevcut Marklardan kapasitesi kadarını tüketip daha küçük patlama yapar. Mark yoksa küçük direct damage verir.
- Başka bir Squire hareketi hazırlığı bozar. Hazırlık tur değişimlerinde korunur, Knight vurana kadar bekler; ölüm/reset sırasında temizlenir. Bu formda savunma atışı veya Perfect Dodge yoktur.
- Avcı FIGHT tek yay atışıdır; önceki çift vuruşun toplam hasarını korur, Mark eklemez. Avcı'nın kılıcı/kını çizilmez; sırtında yay ve sadak kalır. Base/Guard FIGHT değişmez. Morale ve Veterancy mevcut sistemlerden gelir. HP için hard cap eklenmez.
- Knight'ın mevcut yay animasyonu Squire ölçeğinde (0.72) kullanılır. Şapka, sadak ve sade avcı kıyafeti bulunur; kalkan kaldırılır, gövde büyümez.
- Kıyafet, yay parçaları ve okun sap/uç/tüy renkleri uyumlu paletlerden seçilir; kareler arasında yeniden rastgeleleştirilmez. Sonraki fiziksel dönüşümler ertelenmiştir.

İlk formun Quality bütçesi: atış %45, hazırlık %35, Veterancy verimliliği %10, can %10. Bunlar stat yüzdesi değil, mevcut Quality defterindeki eksen paylarıdır.

Temel ayar formülleri (S: atış, R: hazırlık, H: can, V: Veterancy eksen kredisi):

- Atış hasarı `4 + 0.28*S`. Mark miktarı upgrade 1–4 için full Common `[1,2,2,3]`, full Legendary `[2,4,6,8]` basamaklarını kullanır. Karma rarity geçmişinde mevcut Quality değerleri (1/4/8/14) 0–1 aralığına normalize edilip ortalanır; iki basamak arasında interpolasyon sonucu en yakın tam sayıya yuvarlanır. Veterancy Mark miktarını değiştirmez. Upgrade 3–4'ün miktar kuralı hazırdır; bu formların kendileri henüz uygulanmadı.
- Hazırlık gücü `4 + 0.30*R`; kendi Mark patlatma dalında tüketim kapasitesi yukarıdaki tam sayı Mark miktarıdır. Knight'ın patlamasına destek dalı fazladan Mark tüketmez. Hasar/can/Veterancy gibi diğer statlar mevcut Quality formüllerini korur.
- Knight patlatma bonusu `güç + Knight Mark hasarı*0.10`; kendi küçük patlaması `güç*0.50*tüketilen/kapasite`; Marksız bonus `güç*0.30`.
- Başlangıç canı `1 + floor(H/8)`; etkili Veterancy başına can katkısı `0.06 + 0.003*H`; Veterancy verimliliği `0.75 + 0.025*V`. Savaş profili mevcut Morale/Veterancy katkılarını ayrıca uygular.

## Kabul edilen temel

- Base Squire değişmez. Avcı rotası dört upgrade içerir; ilk dönüşüm upgrade 1'dir.
- Mevcut weapon/class Quality ve rarity sistemi kullanılır. Yeni rank/rarity sistemi kurulmaz.
- Hard cap kullanılmaz. Can, Mark, hazırlık bonusları ve Veterancy katkıları dinamik ölçeklenir.
- Normal ilerleyişte final Avcı yaklaşık 2 can; yüksek Quality/Legendary ağırlıklı ilerleyişte yaklaşık 4 can denge hedefidir. Bunlar üst sınır değildir. Guard'dan daha düşük can yatırımı olur.
- Avcı FIGHT yay atışına dönüştürülmüştür; AP/Resolve rework sırasında yeniden değerlendirilebilir.
- Avcı bow ve Mark odaklıdır; Bleed çok küçük yan katkıdır. Parry kazanmaz.
- Morale ve Veterancy mevcut sistemlerdir; her upgrade'in katkıları ayrıca ayarlanır.

## İkinci skill: hazırlanmış ortak atış

- Squire yayı gerer, oku bırakmadan bekler.
- Knight'ın sonraki isabetinde eşzamanlı ateş eder. Mark varsa ek Mark patlama katkısı; Mark yoksa küçük direct damage sağlar.
- Upgrade 1: Ready Shot, temel hazırlık ve koşullu atış.
- Upgrade 2: Patient Aim, Veterancy verimliliği artar; Marklı katkı daha güçlü gelişir.
- Upgrade 3: Explosive Arrow, Mark sayısından beslenen ek bonus açılır. Önceki üst sınır önerisi iptal edildi; sayısal formül henüz belirlenmedi.
- Upgrade 4: Covering Shot, saldırı katkıları gelişir. Knight'a darbe isabet edecekken hazırlık savunmaya harcanabilir: gelen saldırıya ateş eder, bir Perfect Dodge sağlar ve hazırlık biter.
- Bir hazırlık saldırı veya savunma olarak tüketilir. Kaçınma adedi stat hard cap'i değil, bu hazırlığın tek kullanımlık etkisidir.

İlk formda Knight'ın Mark patlatma planı korunarak okunur; bu sayede Knight Markları önceden tüketse de güçlü ortak atış dalı kaybolmaz. Yalnızca Knight'ın patlatmadığı dalda Avcı az sayıda Mark tüketir.

## Görünüm ve animasyon

- Robin Hood esintili pratik avcı. Bard'ın süslü/dantelli görünüşü ve eller belde sağ çapraza bakan smug heroic pozu kullanılmaz.
- Guard'ın büyüyen dev gövde şakası tekrarlanmaz. Vücut boyutu sabit; siluet duruş ve ekipmanla değişir.
- Dört aşama: Robin Hood başlangıcı, iz sürücü, pusucu, ormanın hayaleti.
- İlk upgrade'de şapka, sadak ve sırtta yay; kalkan kaldırılır.
- Parça parça, uyumlu rastgele kıyafet renkleri. Şapka tüyü upgrade/rütbeyle komik ölçüde büyüyebilir.
- Son formda yapraklı örtüye sinme, atışta açılma ve yeniden sinme karakteristiği.
- Organik omuz/dirsek/el zincirleri; çekiş eli yüz yanında dayanak noktasına gelir. Yay, kiriş ve ok eklemleri takip eder. Örtü bağlantıları gövdeye bağlı, serbest uçları hafif gecikmelidir.
- İlk form mevcut Knight yay iskeletini kullanır. Son form ve sonraki fiziksel değişimler gelecek çalışmadır.

## Quality dağılımı — ilk iki satır uygulandı, diğerleri öneri

Paylar stat yüzdesi değil Quality bütçesi payıdır.

| Upgrade | İlk skill | Hazırlanan atış | Veterancy verimliliği | Can |
|---|---:|---:|---:|---:|
| 1 | %45 | %35 | %10 | %10 |
| 2 | %25 | %25 | %35 | %15 |
| 3 | %40 | %35 | %15 | %10 |
| 4 | %30 | %40 | %15 | %15 |

İlk move MARKING SHOT olarak uygulandı. Tracker/Hunting/Ghost Shot ve sonraki formüller henüz kesinleşmiş değildir. Küçük Bleed yan katkısı bu ilk uygulamaya eklenmedi.
