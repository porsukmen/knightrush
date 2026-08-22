# Hareket Ailesi Kabul Kalibi

Bu kalip, materialize edilen her yeni Twist veya Apex ailesinde sirasi degistirilmeden uygulanir.
Bir aile ancak butun kapilar gectikten sonra tamamlanmis sayilir.

## 0. Tasarim sozlesmesi

- F5 ve sonrasi icin dort Twist birlikte tasarlanir; her biri complete Twist Identity V1 tasir.
- Core fingerprintler farklidir; delivery-only veya number-only kardes bulunmaz.
- Family brief signature-engine ve generic reader/converter kotalari gecer.
- Her delivery'nin mekanik sebebi yazilidir; delivery kimlik yerine kullanilmaz.
- En yakin catalog hareketleri kontrol edilir; ters Primary/Secondary agaci kopyalanmaz.
- Her yeni mechanic engine ownership, power model ve runtime test kaydina sahiptir.

- Parent hareketin kimligi tek cumleyle yazilir.
- Cocuklarin parenttan koruyacagi hasar, Primary, Secondary, Delivery ve kaynak davranisi yazilir.
- Her kardesin oynanista lider oldugu tek bir alan belirlenir. Iki kardes yalniz sayi farkiyla ayni isi yapamaz.
- En az bir alternatif tasarim incelenir. Daha iyi degilse neden elendigi not edilir.
- Stable kart yeni bir ilgisiz mekanik acamaz; parent mekanigini derinlestirir.
- Her Twist icin Delivery karari yazilir: neden Single/Sequential/Packet secildi, temaslarin
  hangileri dogal Chain uretir, mekanigin hangi anini okunur kilar ve hangi komsu agacin
  Delivery kimligini taklit etmemelidir. `SINGLE` da bilincli bir karardir; varsayilan cevap degildir.
- Tum ailelere zorunlu ayni T1/T2/T3/T4 sablonu uygulanmaz. Her Twist kendi kaynak akis yonunu,
  oyuncu kararini, Primary sonucunu, Secondary sonucunu ve sinerji kancasini aciklar.
- Materialize edilen her Stable Twist bu bilgileri acik `twistDesign` metadata olarak tasir;
  tamamlanmis bir Formda legacy tahmin veya bos alan kabul edilmez.
- Dortlu bir ailede en az iki Twist iki attribute ciftine ozel olmalidir. Kardesler ayni oyuncu
  karari + Delivery + sinerji imzasini tekrarlayamaz.
- Primary her zaman ana kimliktir. Primary/Secondary yer degistirdiginde ayni agac isimleri
  degistirilerek kopyalanamaz; kaynak yonu ve oyuncu karari yeniden tasarlanir.
- Apex, parent Twist'in Delivery topology ve timing sozlesmesini aynen korur. Sadece o sozlesmenin
  parametresini veya sunumunu guclendirebilir.
- Yeni Apex ailesi `Apex Design V2` kullanir. Dort kart benzersiz `decisionKey` ve runtime kaniti
  tasir; en az ikisi oyuncu planini degistirir ve bu ikisi en az iki ayri karar sinifindadir.
- Ayni toplami ilk/son temas veya ilk/ikinci tick arasinda bolmek tek basina karar degisikligi
  sayilmaz. Yalniz sayisal varyantlardan olusan aile tasarim kapisinda reddedilir.

## 1. Yapi kapisi

- Parent, depth, slot ve route kimlikleri dogrudur.
- Beklenen kardes sayisi tamdir; eksik veya gizli fazla route yoktur.
- Tree, katalog, tooltip, animasyon eslemesi ve synthesis route'u ayni kimligi kullanir.

## 2. Parent mirasi kapisi

- Tum onceki rarity gecmisleri ve sunulan tum ranklar denenir.
- Korunan hicbir stat parentin altina inmez.
- Cocuk gercek savas katkisi ve gorunur gelisim olarak parenttan ileridir.
- Guardrail'in kotu tarifi gizlemek icin buyuk onarim yapmadigi dogrulanir.

## 3. Rarity kapisi

- Common -> Uncommon -> Rare -> Legendary her gecmiste test edilir.
- Rank artarken sahip olunan mekanik, gercek hasar veya kaynak ciktisi gerilemez.
- Her rank gorunur bir ilerleme verir; bos rank adimi olamaz.
- Onceki Legendary temel, sonraki Common secim tarafindan silinmez.

## 4. Kardes rol ve guc kapisi

- Her ayni-gecmis grubunda kardes liderlikleri otomatik sayilir.
- Kardeslerin referans gucu ile tam tur/playthrough katkisi ayri olculur.
- Gucleri yakin, oynanis rolleri farkli olmalidir. Biri acikca ustun secimse aile reddedilir.
- Ailenin Primary/Secondary orani komsu ailelerin alanina tasamaz.

## 5. Senaryo kapisi

- Bos, dusuk, standart, yuksek ve jackpot kaynak durumlari denenir.
- Tek vurus, tam oyuncu turu ve kaynaklarin sonraki tura tasindigi senaryo ayri test edilir.
- Break, Crit, Chain, Mark, Posture ve Resolve sirasi hareketin kullandigi kadar gercek runtime ile denenir.

## 6. Runtime ve olay sirasi kapisi

- Kaynak okuma ani aciktir: action-start, hit-before, hit-after veya action-end.
- Uretim, okuma, tuketim, Break ve ertelenmis etkinin sirasi test edilir.
- Hareket kendisini yanlislikla prime edemez; Break sonrasi sizan gecici durum birakamaz.
- Bir olay yalniz bir kez calisir; multihit veya gecikmeli event yanlis tekrar uretmez.

## 7. Limitsiz olcek ve verim kapisi

- Tasarim limitlemiyorsa oyun da cap, soft cap veya diminishing return eklemez.
- Standart gozlem noktalarina ek olarak `1,000`, `1,000,000` ve safe-integer sinirina yakin deger denenir.
- Sonuc finite ve monoton olmalidir.
- Yeni mekanik frame basina allocation, filtreleme veya yeni update loop acamaz; hesap action aninda yapilir.

## 8. UI ve okunabilirlik kapisi

- Tree'de kart sayisi, parent cizgisi, cerceve ve metin tasmaz.
- Uzun-bas tooltip yalniz oyuncunun karar verecegi bilgiyi gosterir.
- Rank sekmeleri secilebilir ve farklar secili ranka gore dogru hesaplanir.
- Runtime animasyonu hareketin Delivery ve mekanik farkini okunur hizda gosterir.
- Materialize edilen her move, kendi mekanigine uygun bir sunum recipe'si secer. Agir tek ok normal
  oktan daha uzun cekis/bekleme, daha yavas ucus, daha buyuk siluet ve daha sert impact gostermelidir.
- Projectile texture kimligi combat matematiginden ayridir; ileride ok gorseli degistirilirken temas
  sayisi, zamanlama veya payload degismez.

## 8A. Delivery niyet kapisi

- Combat contact sayisi ile gorsel projectile sayisi birbirine karistirilmaz.
- Sequential temaslarin her biri dogal Chain uretir; Packet ancak acikca yazilan wave/contact
  sozlesmesi kadar Chain uretir; hasarsiz event hic Chain uretmez.
- Delivery Quality ile buyuyorsa buyuyen parametre (contact, pellet veya Weight) tek kaynaktan
  hesaplanir ve gameplay limiti eklenmez.
- Delivery'nin verdigi ek guc ya attribute wallet'indan odenir ya da adiyla kayitli, test edilen
  sinirli bir relationship reward olur. Gizli ikinci Quality cuzdanina izin verilmez.
- Ayni Delivery kullanan kardesler mekanik timing veya choreography ile okunur ayrim tasir;
  farkli Delivery kullanan kardesler ise baska bir Primary/Secondary agacinin rolunu calmaz.

## 9. Son regresyon kapisi

Calistirilmasi zorunlu komut:

`node tools/validate-skill-implementation.cjs KnightRush.html`

Ardindan:

`git diff --check`

Otomatik validator `Structure`, `Design`, `Bug`, `Rarity` ve `Power` kapilarinin tamamini gecmeden
aile commit veya push edilmez. Gorsel degisiklik varsa sessiz yerel tarayici testi de zorunludur.

Form-only hizli kontrol icin:

`node tools/validate-runtime.cjs KnightRush.html --quick`

Form tamamlandiktan sonra temsili tam-gecmis balance matrisi de zorunludur:

`node tools/validate-runtime.cjs KnightRush.html --posture-balance`

Bu agir kapi oyun bootunda calismaz. Common/Uncommon/Rare/Legendary ve karisik gecmislerde
Twist kardeslerini, Apex kardeslerini, komsu aile ortalamalarini ve dort Apex rolunu birlikte denetler.

Yeni bir Form eklendiginde hizli kapida address/Form slotu, Base kimlik, Primary cikti, gercek
Delivery kaynak olaylari, canli onceki-temas okumasi, Quality odemesi ve capsiz scaling kanitlanir.

## F1S3T2 referans uygulamasi

- Ortak `auditStableApexFamily` matrisi dort Apex'i `4^4 = 256` ayni-gecmis grubunda,
  toplam `1,024` sentezlenmis kartla denetler.
- A1 linear Mark-okuma, A2 Mark cikisi, A3 direkt hasar, A4 yuksek rezervde escalation lideridir.
- `0/4/8/16/32` Mark senaryolari ve alti fazli persistent-Mark turu ayri olculur.
- A4 icin `16 Mark` yalniz Quality fiyat referansidir. Runtime limiti degildir.
- Capped okuma, Mark tuketimi ve ekstra hit alternatifleri T2 kimligini bozdugu icin elenmistir;
  uncapped escalation ayni tek-ok ve Mark-koruma sozlesmesini derinlestirdigi icin secilmistir.

## F1S3T3 referans uygulamasi

- Ayni ortak matris dort Apex'i `1,024` kart ve `256` ayni-gecmis grubunda tarar.
- A1 flat Primer, A2 Mark, A3 direkt hasar, A4 buyuk kaynak amplifikasyonu lideridir.
- Amplifikasyon yalniz tetikleyen kaynagin kendi taban Posture'unu okur; flat Primer'i veya kendi
  sonucunu tekrar carpmaz. Ilk pozitif kaynak iki state'i birlikte tuketir ve Break ikisini temizler.
- `20 Posture` Quality fiyat referansidir; `1,000`, `1,000,000` ve safe-integer runtime problari
  cap veya diminishing return olmadigini kanitlar.
- Primer'i iki gelecekteki olaya bolmek T1 Double Fracture'a yaklastigi ve artifactsiz durumda
  Break'i geciktirdigi icin elenmistir. Mark'a gore Primer buyutmek T2 alanini tekrar ettigi icin
  elenmistir. Sonraki kaynagin gucunu okumak T3'un destek kimligini en temiz sekilde derinlestirir.

## F1S3T4 referans uygulamasi

- Dort Apex `1,024` kart ve `256` ayni-gecmis grubunda taranir.
- A1 esik acildigi anda sabit Finisher, A2 gorunur Mark, A3 direkt hasar, A4 yuksek bar lideridir.
- Crescendo action baslangicini okur; saldirinin kendi Posture'u ayni sonucu buyutemez.
- `0/49/50/60/75/90/99` durumlari ile `100/200/safe-integer` maksimum barlar denenir.
- Esigi dusurmek T1'e yaklastigi, Posture overflowunu Health damage'e cevirmek yeni bir ucuncu
  mekanik actigi ve AP/Resolve odulu ekonomi revampini erkenden kilitledigi icin elenmistir.

## F1S4 referans uygulamasi

- T1 Sequential ve bagimsiz Crit roll; T2 Single Weight ve action-start Mark read; T3 Single
  Crit-sonrasi hasarsiz Mark event; T4 Simultaneous Packet ve tek ortak Crit roll kullanir.
- T1'in her gercek oku dogal Chain verir fakat Chain scaling almaz. T4 butun packet icin yalniz
  bir Chain verir. T2 ve T3 birer temas oldugu icin birer dogal Chain verir.
- Her dort Apex ailesi `1,024`, toplam aile `4,096` kartla taranir. Relationship, Crit chance,
  Mark ve damage liderleri ayni rarity gecmisinde karsilastirilir.
- Mark/Mark siniri her esdeger Twist history'sinde zorunludur: F1S4'un en yuksek garanti Mark'i,
  F1S1'in en dusuk garanti Mark'inin en az bir altinda kalir.
- T2'nin Mark-read sansi base Sharpshoot impactina baglidir; rarity damage artisi orani dusuremez.
  T3'un garanti cekirdegi beklenen Crit olasiligi uzerinden kendi layer butcesinden odenir.
- RNG testi T1 icin temas sayisi kadar, T4 icin action basina tam bir roll ister. Weight/Mark
  jackpot problari finite kalir; authored scaling cap veya diminishing return almaz.

## F1S6 referans uygulamasi

- Savunma fazi `0` Charge ile baslar; Perfect Dodge `+1`, Parry `+2` verir. Break ekstra Charge
  vermez. Banka fazlari toplamaz, eski banka ile yeni fazin buyugunu saklar ve gameplay cap kullanmaz.
- T1 bankayi tek hasar salimina, T2 kosullu Mark packetine, T3 korunmus Mark x Charge okumasina,
  T4 ise faz boyunca aksiyon basina bir Charge harcayan motora cevirir.
- Dort Twist ayni global slot kalibindan uretilmez. Her birinin kaynak yonu, oyuncu karari,
  Primary/Secondary sonucu ve sinerji kancasi metadata ile test edilir.
- Common T2 referans `2 Charge` ile en az bir gorunur kosullu Mark vermeli; Common T4 iki aksiyonda
  en az bir gorunur Mark biriktirmelidir. Bunlar cap degil, sifir-cikti tarifini yakalayan alt testlerdir.
- `2` ve `20` Charge problari sonucun finite ve dogrusal buyudugunu; `7` Charge savunma fazi ise
  bankanin authored bir `3` sinirina kirpilmadigini kanitlar.

## F1 kapanis kapisi

- Tam F1 sayimi `6 Specialization / 24 Twist / 91 Apex` olmalidir. Her Twist'in `apexTarget`
  degeri gercek materialize edilmis cocuk sayisiyla ayni olmalidir.
- Her route Sharpshootun Base Mark ciktisini korur. Mark/Mark, Specializationda esitlenebilir;
  Twist ve Apex aile ortalamasinda digerlerinden en az bir Mark onde kalir.
- All-Common capraz aile farki Spec icin `%15`, Twist/Apex icin `%30 score / %40 play` bandini
  asamaz. Tum rarity jackpotlarinda score `%35`, play `%50` ust siniridir.
- Play bandi ikinci Mark-tuketen skill materialize edilince tekrar kalibre edilir; bu gecici not
  normal raritylerde otomatik kazanan bir aileye izin vermez.
- F2 ilk olarak CHAIN Primary / MARK Secondary ile baslar. F1S2 Mark/Chain kopyalanamaz:
  F2de Chain hareketin ana amaci, Mark ise destekleyen cikti veya etkilesimdir.

## F2 Chain Form referans uygulamasi

- F2 `CHAIN Primary`dir; Sharpshootun degismeyen Base kimligi nedeniyle son gercek temasta en az
  bir Mark birakir. Form Mark tuketmez ve henuz Secondary secmez.
- Delivery `SEQUENTIAL / LIVE`dir. Her gorunen ok once mevcut gercek Chain ile hasar verir, sonra
  tam `+1 Chain` ekler. Savunma fazindan tasinan Chain ilk oktan, bu saldirinin uretecegi Chain ise
  sonraki oklardan itibaren okunur.
- Form Quality profili `%25 DIRECT_DAMAGE / %55 CHAIN_SCALING / %20 MARK_GAIN`dir. Toplam Quality
  `floor(sqrt(Quality))` ile temas sayisini belirler; bu formulu kesen gameplay cap yoktur.
- Chain wallet ek temaslarin uretecegi gercek Chaini, saldiri icindeki canli Chain okumalarini ve
  kalan Chain katsayisini birlikte oder. Ek ok yalniz animasyon degildir ve Quality disi bedava guc
  olarak yazilamaz.
- Standart Form rarityleri `3/6/10/16` toplam Quality ile `1/2/3/4` oka gider. Rarity temiz hasari,
  gercek Chain ciktisini ve bir Chain stackinin saldiri boyunca verdigi toplam hasari azaltamaz.
- Form `1 AP / 1 Resolve` kalir; Crit, Posture, Affliction, Charge, Mark/Chain tuketimi veya ekonomi
  motoru ekleyemez. Bu maliyet, dort skill tamamlandiktan sonraki AP/Resolve revampinda yeniden ele
  alinacak ve Form kimligiyle karistirilmayacaktir.

## F2 Chain Specialization kabul listesi

- Tam sayim `6 Specialization / 96 rarity history` olmalidir: Chain/Mark, Chain/Chain,
  Chain/Posture, Chain/Critical, Chain/Affliction ve Chain/Charge.
- Her cocuk F2 Formun hasarini, toplam Qualitysini, final-temas Base Markini ve canli Chain
  davranisini miras alir. Specialization sadece kendi yeni Quality paketini bolusturur.
- Her gercek temas once mevcut Chaini okur, sonra tam `+1 Chain` verir. Karttaki temas sayisi ile
  runtime Chain ciktisi ayni olmalidir.
- Chain/Mark gorunur Secondary Markini kendi `%30` paketinden oder. Gerekirse yalniz o paketin Chain
  payindan esige kadar borclanabilir; Formdan veya bedava guc kaynagindan borclanamaz.
- Chain/Chain esit gecmiste en yuksek Chain katsayisina sahip olur. Chain/Posture tek toplam Postureu
  temaslara boler. Chain/Critical temas basina bagimsiz local Crit atar. Chain/Affliction aksiyon
  basina tek Bleed paketi, Chain/Charge aksiyon basina tek Charge paketi uretir.
- Rarity artarken temiz hasar, Mark, temas/Chain sayisi, Chain katkisi ve routea ait Secondary
  payoff azalmaz. Parent gucu bir sonraki karta tasinir; Common child, Legendary parenti sifirlamaz.
- All-Common referansta altinin toplam gucu yakin kalir ama davranislari ayirt edilebilir olur.
  Chain/Mark, F1 Mark/Chaini isim degistirerek kopyalayamaz: F2 daha guclu Chain payoffu; F1 ise
  gelisen soyunda daha guclu Mark sahipligi tasir.
- Bu asamada hicbir route Mark tuketmez, AP/Resolve refund etmez veya ucuncu bir attribute eklemez.

## F3 Posture Form referans uygulamasi

- F3 `POSTURE Primary`dir; Sharpshootun degismeyen Base kimligi nedeniyle en az bir Mark birakir.
  Tek gercek temas once hasar verir, sonra tam `+1 Chain` uretir ve ancak bundan sonra Posture
  paketini uygular.
- Delivery `SINGLE / IMMEDIATE` ve animasyon `BOW_POSTURE`dur: uzun cekis, belirgin bekleme, yavas
  zırh-delici ok ve sert impact. Sahte ek temas veya volley kullanilmaz.
- Form Quality profili `%25 DIRECT_DAMAGE / %20 MARK_GAIN / %55 POSTURE_DAMAGE`dir. Posture sayisi
  Qualityden matematiksel olarak uretilir; gameplay cap veya elle yazilmis rarity tablosu yoktur.
- Temiz hasar Base Sharpshootun altina inemez. Rarity yukselirken temiz hasar, Mark ve Posture
  azalmaz; hareket her rankta `1 AP / 1 Resolve` kalir.
- Bu ok Posture'u kirarsa okun Health hasari daha once cozulmus oldugu icin kendi kendine Break
  bonusu alamaz. Breakin `+1 AP`, Resolve ve `+%50` hasar odulu sonraki komutlara aittir.
- F3 bir Health burst Formu degil, Break zamanlamasi kuran setup Formudur. Crit, Affliction,
  Charge, Mark tuketimi, ekstra Chain scaling veya ekonomi motoru Form katmaninda eklenmez.
- Hizli kapida dort rarity karti, tek temas, tek Chain, en az bir Mark, artan Posture, parent hasar
  korunumu, agir animasyon ve `AFTER_FINAL_CONTACT` sirasi birlikte test edilir.

## F2S1 Chain/Mark kabul listesi

- Tam sayim `4 Twist / 16 Apex`tir; her Twist tam dort materialize Apex cocuguna sahiptir.
- T1 canli Chain rampi, T2 temaslara dagitilan Mark olaylari, T3 action-start Chain snapshotindan
  gercek ok, T4 iki sirali dalga uretir. Dort rota birbirinin yalniz sayisal varyanti olmamalidir.
- Her gorunen ok once mevcut Chaini okur, sonra tam `+1 Chain` verir. T3 yeni uretilen Chain ile ayni
  aksiyonda yeniden ok uretemez; T4te yalniz ikinci dalga ozel payoff alir.
- Common Twistler arasi guc orani `1.20`yi asamaz. Damage, Mark, temas/Chain, gercek Chain katkisi ve
  routea ait relationship parametresi rarity artarken azalmaz.
- Her rank onceki gercek ranktan en az `1.1` temiz hasar yukarida kurulur. Form, Spec veya Twist
  gecmisindeki tek bir rarity artisi ayni childi zayiflatamaz; parent avantajinin en az `%10`u ve en
  az `1` gorunur puani child farkinda korunur.
- Runtime, tree preview ve rarity ladder ayni F2 derleyicisini kullanir. F2 cocuklari F1 Mark
  derleyicisine dusmemeli; bu dispatch kuralinin testi yeni Chain ailelerinde otomatik tekrarlar.
- Mark/Chain ile Chain/Mark karismamalidir: bu ailede asil motor Chain uretimi ve canli Chain hasari,
  Mark ise hic tuketilmeyen destekleyici output veya uygulama zamanlamasidir.

## F2S2 Chain/Chain kabul listesi

- Tam sayım `4 Twist / 16 Apex`tir; her Twist tam dört materialize Apex çocuğuna sahiptir.
- Aile yalnız Sharpshoot base Markını taşır. Ekstra Mark, Mark tüketimi, üçüncü attribute, AP/Resolve ekonomisi veya authored büyüme sınırı yoktur.
- T1 canlı Chain kullanan hızlanan seri, T2 bir temaslı Weight oku, T3 action-start Chain snapshotlı eşzamanlı paket, T4 tek projectile bırakışlı gecikmeli yankıdır.
- Görünen her temas tam `+1 Chain` verir. T2 her zaman tek temas/tek Chain'dir; T3 kendi ürettiği Chain'i aynı pakette okuyamaz; T4ün bütün yankıları canlı Chain'i okur.
- Common Twistler arası güç oranı `1.20`yi aşamaz; dört route yalnız sayısal varyant değildir.
- Rarity yükselirken gerçek hasar, Chain outputu, temas/Weight yoğunluğu ve routea ait payoff gerilemez.
- Common child Legendary parenti sıfırlamaz. Parent avantajının en az `%10`u ve en az `1` görünür güç puanı sonraki kartta korunur.
- Delivery yoğunluğu bütün geçmişin Quality'sinden türetilir ve maksimumla kesilmez.
- Quality bütçesi doğrudan hasar ile derived Chain payoffuna iki kez tam değerle yazılamaz.

## Görünen sonuç kabul listesi

- [ ] Ayrı görünen her temas gerçek hasar ve tasarlanmış resource/status katkısı üretir.
- [ ] Çoklu temasa taşınan tek toplam payload bütün temaslara pozitif payla bölünür.
- [ ] Temas sayısı tek toplam Bleed/Posture payloadunu bedavaya çarpmaz.
- [ ] Payload katkısı ile artifact/status uygulama olayı sayısı ayrı tanımlanır ve ayrı fiyatlanır.
- [ ] Simultaneous packet yalnız action-start snapshotını okur; kendi ürettiği kaynakla aynı packetı recursive büyütmez.

## F2S3 Chain/Posture kabul listesi

- [ ] Tam sayım `4 Twist / 16 Apex`; her Twist tam dört Apex taşır.
- [ ] T1 dağıtılmış Posture, T2 Chain→Posture Weight, T3 `%70` ilk-temas breach, T4 Posture→Chain echo kimliğini korur.
- [ ] Her görünür temas `+1 Chain` üretir; çoklu delivery'deki her temas pozitif Posture payı taşır.
- [ ] Bow Posture çıktısı destekleyici kalır; Common kardeş güç oranı `1.20`yi aşmaz.
- [ ] Her Apex parentı büyütür; relationship, Chain, Posture ve temiz hasar Apexleri kendi ölçülerinde kardeş lideridir.

## F2S5 Chain/Affliction kabul listesi

- [ ] Tam sayım `4 Twist / 16 Apex`; her Twist tam dört Apex taşır.
- [ ] T1 görünür wound volley, T2 Chain→Bleed Weight, T3 Bleed tick→Chain, T4 mevcut Bleed→Chain packet kimliğini korur.
- [ ] Çoklu Bleed delivery'de bütün temaslar pozitif pay uygular; payların toplamı tam bir aksiyonluk Bleed paketine eşittir.
- [ ] T3'ün gecikmeli Chain'i iki Bleed tickinde ayrı ayrı ödenir; T4 yalnız action-start Bleed ve Chain snapshotını okur.
- [ ] Common kardeş güç oranı `1.20`yi aşmaz; relationship, Chain, Bleed ve temiz hasar Apexleri ayrı liderlik testini geçer.

## F2 komşu aile kabul listesi

- [ ] Yeni aile, tamamlanmış bütün F2 komşularıyla aynı rarity geçmişleri altında karşılaştırma matrisine eklenmiştir.
- [ ] All-Common Twist ve Apex aile ortalaması score/play farkı `%12`yi aşmaz.
- [ ] Bütün rarity geçmişlerinde tekil maksimum fark `%20`, bütün geçmişlerin toplam aile ortalaması farkı `%10` veya altındadır.
- [ ] Farklı attribute çıktıları aynı sayıya zorlanmamış; kendi gerçek kullanım senaryolarında fiyatlanmıştır.
- [ ] `node tools/validate-runtime.cjs KnightRush.html --adjacent` ve `--quick` geçmektedir.

## F2S4 Chain/Critical kabul listesi

- [ ] Tam sayım `4 Twist / 16 Apex`; her Twist tam dört Apex taşır.
- [ ] T1 artan Crit volley, T2 Chain→Crit çarpanı Weight, T3 Crit→canlı Chain feedback, T4 bağımsız Crit echo kimliğini korur.
- [ ] Critical move-local kalır; global Crit/Precision sızdırmaz. Crit bonus Chain yalnız gerçek Critten sonra eklenir.
- [ ] Ağır ok, volley, feedback ve echo animasyonları gerçek delivery ile eşleşir.
- [ ] Common kardeş güç oranı `1.20`yi aşmaz; relationship, Chain, Crit ve temiz hasar Apexleri ayrı liderlik testini geçer.

## F2S6 Chain/Charge kabul listesi

- [ ] Tam sayım `4 Twist / 16 Apex`; her Twist tam dört Apex taşır.
- [ ] T1 full-bank volley, T2 Charge→Chain burst, T3 Chain×Charge echo, T4 temas başına ölçülü harcama kimliğini korur.
- [ ] Bir Charge noktası bir kez harcanır; multihit bankayı çoğaltmaz ve temas fazlası Charge korunur.
- [ ] Charge→Chain final temastan sonra çalışır; aynı saldırıyı geriye dönük prime etmez.
- [ ] Dört rota mekaniklerine uygun ayrı animasyon recipe'si kullanır ve Apexler parent recipe ailesini korur.
- [ ] Common kardeş güç oranı `1.20`yi aşmaz; relationship, Chain, Charge ve temiz hasar Apexleri ayrı liderlik testini geçer.

## F2 tam kapanış kabul listesi

- [ ] Sayım `1 Form / 6 Specialization / 24 Twist / 96 Apex / 127 route / 508 rarity card`tır.
- [ ] Her Specialization dört Twist, her Twist dört Apex taşır; her Twist gerçek runtime command üretir.
- [ ] Altı F2 ailesi aynı komşu güç matrisinde test edilir; eksik aile sessizce matristen düşmez.
- [ ] Chain/Crit guardrail hesabı action-start Chaini Crit ihtimali ve çarpanına aktarır.
- [ ] `--quick`, `--adjacent`, browser smoke ve console error kontrolü geçmeden aile tamamlanmış sayılmaz.

## Base Attribute kabul listesi

- [ ] Weapon skill için merkezi Base Attribute contract kayıtlıdır; başka silahın base outputu kopyalanmamıştır.
- [ ] Her Stable katman yalnız kendi yeni paketinin merkezi Base payını öder; geçmiş güç ikinci kez vergilenmez.
- [ ] Sharpshoot rotalarında normalize `MARK_GAIN` payı en az `%10`dur ve bu pay ücretsiz değildir.
- [ ] Otomatik göç Base payını eklerken mevcut Primary/Secondary mekanik profile değerlerini azaltmamıştır.
- [ ] Base reserve receipt üzerinde saklanır, kaybolmaz ve authored gameplay cap taşımaz.
- [ ] Base, Primary, direct parent ve rarity çıktıları gerilemez; bütün komşu aile testleri yeniden geçer.

## F3 Specialization kabul listesi

- [ ] Altı route ve dört rarity ile `96` sentez kombinasyonu gerçek runtime command üretir.
- [ ] Bütün rotalar `SINGLE`, bir gerçek temas, `+1 Chain`, pozitif Base Mark ve `AFTER_FINAL_CONTACT` Posture taşır.
- [ ] Mark rotası parenttan görünür biçimde fazla Mark üretir ve Mark tüketmez; Chain rotası pozitif Chain scaling taşır.
- [ ] Saf Posture kardeşlerinin en yüksek düz Posture çıktısına sahiptir.
- [ ] Crit hem Health hem Posture'u etkiler; Bleed iki tick ve Break uygulama bonusu `%25`; Charge tek banka tüketimidir.
- [ ] Rarity yükselirken damage, Mark, Posture ve birleşik güç gerilemez; kardeş spread `%12`yi aşmaz.

## F3 tam kapanış kabul listesi

- [ ] Sayım `1 Form / 6 Specialization / 24 Twist / 96 Apex / 127 route / 508 rarity card`tır.
- [ ] Her Specialization dört Twist, her Twist dört Apex taşır; bütün rotalar gerçek runtime command üretir.
- [ ] Görünen her temas gerçek payload payı ve tam `+1 Chain` taşır; temassız reward/echo ayrıca gösterilir.
- [ ] Break→Mark/Chain, sonraki Posture→Mark, Crit→Posture, Bleed→Posture ve Charge→Posture ilişkileri Quality ile ölçeklenir ve guardrail hesabında fiyatlanır.
- [ ] Shared packet Crit tek roll, sequential Crit temas başına roll yapar; Crit Health ve direct Posture'u birlikte çarpar.
- [ ] Simultaneous Bleed packet kendi içinde açtığı Break'i sömürmez; sequential Bleed sonraki gerçek temaslarda kullanabilir.
- [ ] Measured Charge yalnız Break için gereken bankayı harcar; full release ve delayed echo rotaları bütün bankayı bir kez tüketir.
- [ ] Apex parent delivery/mekaniğini korur; rank ve parent çıktıları gerilemez, gameplay cap veya diminishing eklenmez.
- [ ] `node tools/validate-runtime.cjs KnightRush.html --quick` içindeki F3 closure ve mechanic kapıları geçer.
- [ ] `node tools/validate-runtime.cjs KnightRush.html --posture-balance` 18 temsili rarity geçmişinde Twist/Apex kardeşlerini, komşu aileleri ve Apex rollerini geçirir.

## F4 Critical Form ve Specialization kabul listesi

- [ ] F4 tek gorunur temas, tek gercek Chain, pozitif Base Mark ve `1 AP / 1 Resolve` ile materializedir.
- [ ] Form move-local Chance ve movea ait kalici Precision uretir; non-Crit Precision ekler, Crit sifirlar ve state turler arasinda korunur.
- [ ] Alti route `Critical/Mark`, `Critical/Chain`, `Critical/Posture`, `Critical/Critical`, `Critical/Affliction`, `Critical/Charge` olarak esit erisimlidir.
- [ ] Bütün `96` rarity kombinasyonu parent damage, Mark, Crit chance, uzun vadeli Crit orani, Precision ve Crit carpanini geriletmez.
- [ ] Yalniz Critical/Critical pre-Twist `CRIT_POWER` ekseni satin alir ve Common/Common kardeslerinde en yuksek local Crit carpanina sahiptir.
- [ ] Mark parenttan gorunur fazla Mark; Chain action-start scaling; Posture Critlenen direct Posture; Affliction iki tick Bleed; Charge pre-Crit banka release uretir.
- [ ] Chance/Precision dogal tavana ulasinca odenmis Quality kaybolmaz; local Crit carpanina Reserve/overflow olarak akar ve runtime stat clip uygulanmaz.
- [ ] Skill Lab rarity kartlari Chance, Precision, uzun-vadeli Crit orani ve carpani ayri gosterir.
- [ ] F4 tam sayimi `1 Form + 6 Specialization + 24 Twist + 96 Apex = 127 route / 508 rarity card`tir.
- [ ] F4S1-S3 ailelerinin her biri 4 Twist ve Twist basina 4 Apex tasir; F4S4-S6 ile ayni closure'a dahildir.
- [ ] Sequential gercek temas basina Chain, simultaneous packet toplam bir Chain uretir; yeni rota authored gameplay cap veya diminishing eklemez.
- [ ] `node tools/validate-runtime.cjs KnightRush.html --quick` F4 Form, Specialization, tam closure, parent, rarity, kimlik ve guc bantlarini gecirir.

## F4S1-F4S3 Critical foundation kabul listesi

- [ ] Critical/Mark Aim Marki tuketmeden okur; Bounty yalniz gercek Critten Mark uretir; Tracking
  bagimsiz temas Critleri sonrasi tek toplam Mark birakir; Packet tek ortak Crit ve tek toplam Chain kullanir.
- [ ] Critical/Chain Crescendo canli Chain okur; Weight baslangic Chainini Crit carpanina; Feedback
  gercek Criti ek Chain odulune; Lock baslangic Chainini Crit sansina cevirir. Mark veya Chain tuketilmez.
- [ ] Critical/Posture Verdict Health/Posture'u ayni Critle carpar; Volley toplam Posture'u gercek
  temaslara boler; Fracture Critten hasarsiz/Chainsiz Posture echo; Packet ortak Crit sonucu uretir.
- [ ] Her foundation Twist tam dort Apex cocuguna sahiptir. A1 iliski, A2 Crit guvenilirligi,
  A3 Secondary, A4 temiz impact lideridir ve parent mekanigi korunur.
- [ ] Rank artarken damage, Mark, delivery, Chain, Posture, Crit, Precision, Crit carpani veya diger
  sahip olunan output gerilemez; all-Common child kendi parentindan zayif olamaz.

## F5 Affliction Form ve Specialization kabul listesi

- [ ] Form tek `SINGLE` ok, Base Mark, tek doğal Chain, `1 AP / 1 Resolve` ve iki tick Bleed taşır.
- [ ] Formun direct damage'i F1-F4 Common karşılıklarının altındadır; iki tick toplamıyla anlamlı payoff üretir.
- [ ] Altı rota Affliction/Mark, /Chain, /Posture, /Critical, /Affliction ve /Charge olarak materializedir.
- [ ] Her çocuk parent damage, Mark ve Bleed paketini korur; yalnız kendi yeni paketini dağıtır.
- [ ] Yalnız Chain Secondary sıralı delivery'ye geçer. Her gerçek ok `+1 Chain` ve tek toplam Bleed'den pozitif pay taşır; temas Bleedi çoğaltmaz.
- [ ] Critical yalnız direct Health/Posture'u etkileyen local Chance'tır; Precision açmaz ve Bleed Crit atmaz.
- [ ] Affliction/Affliction kardeşler arasında en yüksek Bleed'i taşır; Charge bankayı bir actionda bir kez kullanır.
- [ ] Stable Bleed süresi bütün raritylerde iki tick kalır; potency, damage, Mark ve delivery rank yükselirken gerilemez.
- [ ] `node tools/validate-runtime.cjs KnightRush.html --quick` 4 Form kartı, 96 Spec historysi ve `%13` sibling bandını geçirir.

## F4S4 Critical/Critical Twist kabul listesi

- [ ] Dort Twist sirali bagimsiz roll, tek agir Precision odemesi, Crit-cascade ve ortak-roll packet olarak mekanik bakimdan ayridir.
- [ ] T1 gerceklesen her sirali okta 1 Chain kurar fakat Chain scaling satin almaz.
- [ ] T2 stored Precisioni action basinda bir kez okur; bonus yalniz Crit carpanina gider.
- [ ] T3 ilk okta parent saldiriyi garanti eder, her Critte devam eder, ilk normal vurusla durur ve gorunmeyen oklar icin RNG harcamaz.
- [ ] T4 packet boyunca tek Crit sonucu ve tek Precision update kullanir; toplam 1 Chain kurar.
- [ ] 256 rarity kombinasyonunda parent damage/Mark/Chance/Precision/Crit rate/carpan gerilemez; rank yukselirken stat dusmez.
- [ ] Common kardes power spread `%20`yi asmaz ve hicbir rota `extraChainBonus` kazanmaz.

## F4S4 Critical/Critical Apex kabul listesi

- [ ] Tam sayim `4 Twist / 16 Apex`tir; her Twist tam dort materialize Apex cocuguna sahiptir.
- [ ] Her Apex parent roll modelini, delivery timingini, dogal Chain kuralini ve Precision davranisini aynen korur.
- [ ] A1 parent imzasinin lideridir; Sequence/Cascade/Packet bir ucretli gorunur temas ekler, Verdict stored-Precision okumasini buyutur.
- [ ] A2 Sequence/Cascade/Packette Crit sansi lideridir. Verdict A2 stored Precision dongusunu oldurmez; bunun yerine garanti Base Mark kurulumunun lideridir.
- [ ] A3 move-local Crit carpani, A4 temiz direct damage lideridir; hicbir Apex Chain scaling kazanmaz.
- [ ] Parent damage, Mark, Chance, Precision, stored-Precision read ve Crit carpani gerilemez; rarity ranki sahip olunan stati dusurmez.
- [ ] `CCC/LCC/LLC/LLL` gecmisleri x 4 Apex rarity x 16 Apex = `256` boot-safe kart matrisi gecer.

## F4S5 Critical/Affliction Twist kabul listesi

- [ ] Tam sayım `4 Twist / 256 rarity kombinasyonu`dur; bütün route'lar gerçek runtime command üretir.
- [ ] T1 bağımsız temas Critleri, canlı Precision ve temaslara bölünmüş tek toplam Bleed taşır; her gerçek ok `+1 Chain` üretir.
- [ ] T2 normalde Base Bleed uygular ve yalnız doğrudan Crit gerçekleşirse ücretli ek Bleed ekler; Bleed ticki Critlenmez.
- [ ] T3 mevcut Bleedi tüketmeden action başında okur; yeni Bleed kendi Crit bonusunu geriye dönük büyütemez.
- [ ] T4 tek ortak Crit rollu packet, tek Precision update, temaslara bölünmüş toplam Bleed ve toplam `+1 Chain` kullanır.
- [ ] Parent damage/Mark/Chance/Precision/Crit multiplier/Bleed ve rarity statları gerilemez; rota Chain scaling çalmaz.
- [ ] Common kardeş power spread `%20`yi aşmaz; authored gameplay cap veya diminishing yoktur.

## F4S5 Critical/Affliction Apex kabul listesi

- [ ] Tam sayım `4 Twist / 16 Apex`tir; her Twist tam dört materialized Apex çocuğu taşır.
- [ ] A1 parent ilişkisinin, A2 Crit güvenilirliğinin, A3 toplam Bleed paketinin, A4 temiz direct impactın lideridir.
- [ ] Apex parent delivery, Crit roll, Precision update, yara sırası ve doğal Chain kuralını değiştirmez.
- [ ] Volley her temas için Chain; packet toplam bir Chain üretmeye devam eder. Rupture yalnız direct Critte ek Bleed, Bloodsight yalnız action-start Bleed okuması kullanır.
- [ ] Parent/rank damage, Mark, Chance, Precision, Crit multiplier, Bleed ve ilişki katsayıları gerilemez; Chain scaling eklenmez.
- [ ] `CCC/LCC/LLC/LLL × 4 Apex rarity × 16 Apex = 256` kart matrisi ve `%20` sibling spread kapısı geçer.

## F4S6 Critical/Charge Twist ve Apex kabul listesi

- [ ] Tam sayım `4 Twist / 16 Apex`tir; her Twist tam dört materialized Apex taşır.
- [ ] T1 tek full-bank ağır darbe; T2 tek toplam Charge salımını bölen bağımsız-Crit volley; T3
  Charge→local Crit focus; T4 ilk Critte duran ücretli arama kimliğini korur.
- [ ] Charge hasarı bir actionda yalnız bir kez ödenir. Volley bunu temaslara böler, kopyalamaz.
- [ ] Hunt ilk oku garanti eder; ek ok sayısı başlangıç bankasını aşmaz, ilk Critte durur ve iadesi
  harcanmış Chargeı aşamaz.
- [ ] Her görünen sequential ok gerçek `+1 Chain` üretir; single rota toplam bir Chain üretir.
- [ ] A1 ilişki, A2 Crit güvenilirliği, A3 Charge salımı, A4 temiz impact lideridir.
- [ ] Parent/rank damage, Mark, Crit, Precision ve Charge payı gerilemez; kardeş spread `%20`yi aşmaz.
- [ ] `node tools/validate-runtime.cjs KnightRush.html --quick` F4S6 closure, rarity, rol ve runtime
  denetimlerini geçirir; ağır matris oyun bootuna eklenmez.

## Mark Burst F1S5 Detonation/Affliction kabul listesi

- [ ] Tam sayım `4 Twist / 16 Apex`; her Apex `Apex Design V2` taşır.
- [ ] Mark Burst hiçbir rotada Mark üretmez. Detonation Primary, iki tick Bleed Secondary kalır.
- [ ] T1 tüketilen Markla yarayı büyütür; T2 yalnız action-start yarayı rupture eder; T3 finite iki
  faz yankısı taşır; T4 tek toplam yarayı packet temaslarına pozitif böler ve toplam 1 Chain üretir.
- [ ] T3A2 ilk yankıyı ilk boss moveundan önce çözer. T3A3 yalnız sonradan eklenmiş gerçek Markı
  ikinci tickte tüketir. T3A4 her ayrı boss move başlangıcında bir pulse üretir; damage hitleri pulse
  sayılmaz ve Break erken kullanılırsa kalan move pulseları doğal olarak kaybolur.
- [ ] Stored/delayed alanlar kendi çıktılarını okuyamaz, kendilerini dolduramaz ve projectile/Chain
  uyduramaz. Quality büyümesi için authored gameplay cap veya diminishing yoktur.
- [ ] Dört Apex ailesinin her birinde en az iki farklı gerçek karar sınıfı ve en az üç ayrı runtime
  kanıt imzası bulunur; yalnız tick/vuruş sırası değiştiren yüzeysel aile reddedilir.

## Mark Burst F1S6 Detonation/Charge kabul listesi

- [ ] Tam sayım `4 Twist / 16 Apex`; her Apex `Apex Design V2` taşır.
- [ ] Mark Burst hiçbir rotada Mark üretmez ve sıfır Charge ile parent Detonation çalışmaya devam eder.
- [ ] T1 bütün bankayı harcar; T2 yalnız eşleşen Chargeı harcar; T3 yalnız gerçekten harcanmış
  bankadan iade yapar; T4 bankayı finite bir sonraki-savunma füzesine çevirir.
- [ ] T2 yankıları, T4 savunma pulseları fiziksel temas değildir; Chain/Crit/Mark üretmez ve recursion açmaz.
- [ ] T4 Perfect Dodge başına 1, Parry başına en fazla 2 fuse Charge harcar. Başarısız savunma
  yalnız streaki sıfırlar; Break iadesi kalan fuse Chargeı aşamaz.
- [ ] Quality büyümesi Mark, Charge, eşleşme veya retention üzerine authored gameplay cap ve
  diminishing koymaz; yalnız mevcut finite kaynaklar doğal sınırdır.
- [ ] Dört Apex ailesi benzersiz karar anahtarları, en az iki gerçek karar sınıfı ve en az üç runtime
  kanıt imzası taşır; aynı hasarın dört dağılımı reddedilir.
