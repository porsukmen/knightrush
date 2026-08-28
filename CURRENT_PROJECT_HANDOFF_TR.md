# Knight Rush — Yeni Chat Handoff

Guncel durum: 2026-08-28. Bu dosya sohbet gecmisinin yerine gecen kisa durum belgesidir.
Yeni bir AI once bu dosyayi, sonra asagidaki zorunlu belgeleri okumadan skill tasarlamamali.

## Yayin oncesi genel kontrol — 2026-08-28

Kullanici genel kontrol sonrasi commit/push istedi. Birikmis Mark Burst aileleri, ortak
attribute duzeltmeleri, belgeler ve 20 hedefli audit ayni checkpoint kapsamindadir.

PASS: HTML/JS parse, tum audit/harness sozdizimi, git diff --check; mevcut --quick yayin
kapisi ile 20 hedefli grup TEK bootta birlikte gecti:
--global-chain --arrow-scaling; --critical-posture --critical-focus --critical-affliction
--critical-charge; --affliction-specs ve alti --affliction-* aile; --charge-specs ve alti
--charge-* aile. Hepsi current-rank/sinirlI lineage ornekleridir; yeni Cartesian tarama yok.
Global Chain 853 kart / 23 gercek action; supporting-arrow 104 rota / 283 kart / 17 action PASS.
F4/F5/F6 ailelerinin mevcut hedefli kart/action ve balance kapilari da PASS.
Quick hierarchy: Sharpshoot 757, Mark Burst 745 rota. Catalogue'un IN_PROGRESS etiketi bu
checkpointte degistirilmedi; tam history/playtest sertifikasi verilmedi.

Genel kontrol oyun mekaniğini degistirmedi. Eski CI beklentileri onayli motorlara uyarlandi:
Common Detonation Primary 2 Marktan baslar; Mark kapasitesi ok sayisindan bagimsizdir.
Gercek HP kapasite/potency ile, patlama olay sayisi pozitif-payload temaslariyla karsilastirilir.
Secondary Chain cascade gercek coklu temasini ve ek pulse Chainini ayri sayar.
--quick + hedefli bayraklar artik ayni bootta gercekten ikisini de calistirir; hedefli bayrak
quick'i sessizce atlatmaz. Tek basina CI --quick icin 180 saniye guardi korunur.

Onemli baslangic ayrimi: F5S3/S4/S5 Uzun Dizi Apexleri Common toplam Quality=15'te ucretli
+1 okla 3 oka ulasir; en seyrek Secondary Chain de o noktada 3 oktur. Onayli +1 ok korundu.
Bu bir buyume esitligi degildir: daha yuksek Quality'de iki Chain rolunden yavas kalir.
Audit bu uc baslangic esitligini initialContactTies olarak raporlar, ucret ve LONG kimligini
dogrular; Quality 16/32/64/256/1e6 buyume kontrollerinde kesin dusukluk aranir.
Paylasilan packet tek Chain, acikca per-contact authored prepared-Crit packet temas basina
Chain uretir; global test bu iki sozlesmeyi artik karistirmaz.

Yayin workflow'u degistirilmedi. GitHub'da mevcut --adjacent F2 history kapisi son basarili
runda yaklasik 18 dakika surmustu; yerelde yeniden calistirilmadi. Commit/push sonrasi Actions
sonucu GitHub'dan okunmalidir; yerel PASS otomatik olarak Pages yayini PASS demek degildir.
Baslangic kontrolunde onceki run 32780929476 basariliydi; onceki bes hata maili daha eski
24 Agustos commitlerinin basarisiz runlarina aitti.

## Son tamamlanan aile: F6S6 Charge / Charge (2026-08-28)

Onayli 4 Twist / 16 Apex implement edildi. Saf Charge garanti Primary hazirligini ve
Secondary bankasini birlikte tasir: Prepare eski bankayi ayirir; yeni savunma kazanci eklenir;
sonraki oyuncu fazinda ucretsiz Release eski+yeni bankayi bir kez harcar. Banka limitsizdir.
Yeni genel Charge Power carpani, Mark uretimi veya ucuncu attribute acilmadi.

1. Yogun Salim: tek agir ok; harcanan Charge basina ucretli toplamsal ek direct hasar.
   Apexler Derin Yuk / Sakli Yuk (eski rezerv) / Taze Yuk (yeni savunma) / Guvenli Hazirlik.
2. Bolunmus Salim: ilk gercek ok garanti hazirligi, sonraki oklar tek banka paketini tasir.
   Native direct bolunur, dinamik Base Detonation finalde bir kez; her gercek ok +1 Chain.
   Apexler Agir Banka / Ek Salim / Onden Yuk / Bos Hazne. Onden Yuk guclenen bankanin bir
   kismini ilk oka tasir; hazirlik veya banka kopyalanmaz. Ek oklar tek ucretli dusuk-yogunluk
   planindadir; iki Chain rolunden yavas buyur. Harcanmayan temas payi banka katkisini buyutur.
3. Kesintisiz Hazirlik: ardisik ikinci savunmadan itibaren Parry/Perfect Dodgeun yeni Charge
   kazanci sabit oranla ek Release hasari kurar. Gercek hasar seriyi sifirlar; kazanilmis bonus
   ve banka silinmez, seri yeniden kurulabilir. Invulnerability ile reddedilen darbe bozmaz.
   Apexler Derin Seri / Karsilayan Yuk / Siyrilan Yuk / Kolay Baslangic. Seri uzunlugu bankayi
   carpan bir katsayi degildir; Kolay Baslangic ilk basariya daha kucuk katkidir.
4. Devreden Hazirlik: gercek harcanan Charge sonraki manuel Primary Prepare icin tek paket
   kurar. Paket basarili Prepare'da rezerve edilip silinir; sonraki Release'te bir kez vurur.
   Apexler Derin Devir / Kisa Devir / Ayni Ritmi Surdur / Devir Teslim. Ayni hareket exact
   routeu, farkli skill farkli baseId'yi ister; ayni skillin baska routeu ikisi de degildir.
   Kisa Devir bir kismi simdi daha dusuk karsilikla verir; .90 gecikme fiyatidir, banka capi degil.
   Devir hasari yeni devir kaynagi DEGILDIR; yalniz yeni gercek Charge harcamasi yeni paket kurar.
   Normal saldiri veya basarisiz Prepare paketi tuketmez. Sharpshoot Primary alici da desteklenir.

Guvenli Hazirlik/Bos Hazne payinin %70'i banka katkisini, %30'u sifir-banka guvencesini besler.
Guvence ilk Charge'in katkisini gecemez; sigmayan ucret garanti hazirliga doner. Charge kazanmak
hasari azaltmaz. Kolay Baslangic'ta da ilk-basari bonusu normal seri katkisini asamaz.
Iliski bonuslari ayri flat direct payout'tur: ikinci Crit/Chain tabani veya ek temas olusturmaz.
Native direct/hazirlik/banka normal combat kurallarini korur. Base %10 / saf kimlik %100,
native parent/rank ilerlemesi korunur.

Ortak frozen chargeFocus / PREP_FOCUS axis-engine / dort Bow recipe-cue. Ilk hazirlik oku beyaz,
banka oklari altin renklidir; agir/yuk/seri/devir efektleri ayridir. Mevcut bow pose hazirlik
ve devir enerjisini gosterir; gercek Parry/counter/sword animasyonunu ezmez. Seri kazandikca
parilti artar. HUD seri ve devri gosterir. Tek carry paketi + pending sayilari; frame katalog
taramasi yok. Encounter/Lab/preset resetleri temizler.

PASS: `node tools/validate-runtime.cjs KnightRush.html --charge-focus --charge-specs --charge-chain`.
F6S6: 101 current-rank/high-parent kart / 81 gercek action / 75 faz; dort ayri core,
komsu benzerligi .80 < .86. Common referans fark %0.84; Apex referans butceleri esit.
Eski/yeni/0/1/120/240 Charge, 100 Chain'de gercek HP, yeniden seri, tum Apexler,
cross-skill devir, recursion, basarisiz komut, rezerv izolasyonu ve auto-Release PASS.
Specs 36 kart / 44 action / 43 faz; Charge/Chain 100 kart / 121 action / 77 faz PASS.
Son yalniz-gorsel idle-bow eklemesi izole gercek-function pose kontrolunden gecti:
bos/birikimli/devir/reset/olum/savunma-animasyonu onceligi. Combat motoru degismedigi icin
uzun runtime kapi tekrar kosulmadi. HTML/audit/harness parse ve diff temiz.
Bunlar gercek DPS/playtest esitligi veya tum history matrisinin sertifikasi degildir.
Genis matris/browser/commit/push yok.

**F6'nin alti Twist/Apex ailesi tamam.** Sonraki adimi kullaniciyla belirle; yeni skill veya
genis balance testi icin kendiliginden kapsam acma.

## Onceki aile: F6S5 Charge / Affliction (2026-08-28)

Onayli 4 Twist / 16 Apex implement edildi. Primary Prepare saldirmaz, sonraki oyuncu fazinda
bedelsiz garanti hazirlikli Release gelir. Normal iki Bleed ticki ve final dinamik Base Detonation
korunur. Savunma Charge bankasi, Crit/Precision/Posture veya saf Bleed Power stati acilmaz.

1. Kanla Beslenen Salim: tek agir ok. Prepare basindaki eski yaranin beklenen savunmada
   GERCEKTEN verdigi native tick hasari ek Release hasari kurar. Yeni savunma yarasi veya
   Sapli Diken'in ayri bonusu eski snapshoti beslemez. Son tick bitse de kayit korunur.
   Apexler Derin Beslenme / Son Sizi / Devir Hazirligi / Yarasiz Hazirlik.
2. Dikenli Dizi: hafif on oklar native yarayi kurar; agir final tek hazirlik paketini tasir.
   Final yalniz kendi gercek uyguladigi yaradan ayri ucretli hasar alir. Derin Diken / Ilk
   Kesik ek yarasi VE final katkisi birlikte fiyatlanir. Apexler Agir Final / Derin Diken /
   Ilk Kesik / Erken Salim. Temaslar ortak dusuk yogunluk + ayri temas butcesinden odenir;
   iki Chain rolunden yavas buyur, her gercek ok +1 Chain verir, Detonation yalniz finalde.
3. Yara Ustune Salim: tek agir ok. Yalniz READY sonrasinda araya konan ayni-actor gercek
   saldirilarin yeni Bleedi Releasein yeni yarasini buyutur. Eski yara / savunma ticki /
   otomatik destek / basarisiz komut kurulum degildir. Uygulama boss Bleed farkindan degil
   merkezi addBossBleed olayindan okunur. Apexler Derin Kurulum / Tek Hamle / Devir Kurulumu /
   Dogrudan Salim. Tek Hamle ikinci gercek saldiriyla kapanir; farkli skill kendi payini buyutur.
4. Sapli Diken: tek saplanan ok, kendi native iki tickine bagli iki sonlu bonus bileti.
   Tick aninda gercek DEFENDING Primary hazirligi varsa ek Bleed hasari gelir; savunma
   basarisi veya banka gerekmez. Apexler Derin Saplanis / Ilk Diken / Devir Hazirligi /
   Guvenli Diken. Ilk Diken yalniz ilk tick; Devir baska skillin Primary hazirligi ister.
   Guvenli payin cogu hazirlikli bonusu, kucuk payi hazirliksiz guvenceyi buyutur.

Ek direct iliski hasari ayri flat payout'tur; ikinci Crit/Chain tabani veya yeni temas degildir.
Sapli Diken ekstra hasari global Bleed'e geri yazilmaz, yeni tick/Mark/Chain/bilet uretmez.
Normal Bleed Break carpani korunur. now/later biletleri once kaydirilir; savunma seri numarasi
ayni fazda tekrar okumayi engeller. Yara sayaci veya katalog/frame taramasi eklenmedi.
Ortak chargeAffliction frozen payload / PREP_AFF axis-engine / dort Bow recipe-cue.
T2 agir finali on oklardan gorunurce ayirir. Mevcut HUD beslenen hazirligi, READY yeni yara
kurulumunu ve Sapli Dikeni gosterir. Encounter/Lab/preset yeni state'i temizler.
Base %10 / kimlik 70-30, native parent/rank ilerlemesi korunur.

PASS: `node tools/validate-runtime.cjs KnightRush.html --charge-affliction --charge-specs --affliction-charge`.
F6S5: 100 current-rank/high-parent kart / 86 gercek action / 79 faz. Dort ayri core;
komsu benzerligi .7714 < .86, Common Twist referans farki %1.67; Apex referans butceleri esit.
Specs 36 kart / 44 action / 43 faz; ters rol F5S6 80 kart / 57 action / 60 faz PASS.
Gercek HP, 100 Chain, eski/yeni yara ayrimi, Break ticki, iki-tick omru, reset ve preview denetlendi.
Bunlar gercek DPS/playtest esitligi veya tum history matrisinin sertifikasi degildir.
HTML/audit/harness parse ve diff temiz. Genis matris/browser/commit/push yok.

F6S6 daha sonra tamamlandi; guncel durum yukaridadir.

## Onceki aile: F6S4 Charge / Critical (2026-08-28)

Kullanici 4 Twist / 16 Apex implementini onayladi. Eski T2 Onden Nisan REDDEDILDI:
Crit sonucunu Prepare'da bilmek tek basina fayda vermiyordu. Yeni T2 Keskin Salim gercek
Crit sansi satin alir; sonuc yalniz Release'te normal roll ile belirlenir.

1. Sacmali Salim: tek eszamanli packet, bagimsiz Crit atan gercek sacmalar. Tek native
   direct/hazirlik paketi bolunur; her Crit ayri ucretli ek katkisini verir, bu katki tekrar
   Crit veya Chain carpani almaz. Sacmalar ortak action-start Chain snapshotini kullanir.
   Apexler Derin Sacma / Yogun Sacma / Kismi Isabet / Acilis Salvosu.
2. Keskin Salim: tek agir ok. Ek hazirlik yatiriminin bir kismi local Crit sansina gider.
   %100 uzerindeki Quality garanti hazirliga doner, Crit Damage statina degil. Global Crit
   sebebiyle olusan tasma da Release'te korunur. Apexler Keskin Hazirlik / Agir Hazirlik /
   Erken Salim / Devir Salimi. Son ikisi ilk saldiri / bu fazda onceki farkli skill kosuludur.
3. Kararli Salim: tek agir ok normal sonuc verirse ayri ucretli hasar telafisi. Apexler
   Derin Telafi / Agir Hazirlik / Bitirici Telafi / Inatci Salim. Eksik-can snapshoti ve
   onceki gercek ayni-route non-Crit sonucu kullanilir. Ust uste birikmez. Tum kosullar
   birlikteyken bile telafi ayni vurusun Crit avantajindan kucuktur; ifade edilmeyen ucret
   garanti hazirlik olur. Telafi ikinci Chain terimi kazanmadigindan yuksek Chainde de
   Crit gelmesini cezalandiran ters sonuc olusmaz; 8 ve 100 Chain gercek HP testi PASS.
4. Kritik Artci: tek agir Release Crit atarsa SONRAKI gercek savunma bitiminde otomatik
   destek oklar gelir. Apexler Guclu Artci / Yogun Artci / Acilis Kriti / Devir Kriti.
   Destek sifirdan temiz komuttur; hazirlik/Detonation kopyalamaz, global veya Lab force
   Crit ile bile Crit atamaz, yeni artci uretmez. Her gercek ok bir Chain verir.

Ortak frozen chargeCritical payload / PREP_CRIT axis ve engine kayitlari / dort Bow recipe-cue.
Base %10 / karma 70-30, dinamik final Detonation, bedelsiz garanti Primary hazirlik korunur.
Savunma Charge bankasi, Precision, genel Crit Damage veya Posture/Break acilmaz.
Kaynak+destek tek dusuk yogunluklu ucretli temas planidir; iki Chain rolunden yavas buyur.
Otomatik destek yeni fazin ilk oyuncu saldirisi sayilmaz; Prepare ve basarisiz hamle son gercek
saldiri kaydini degistirmez. State actor/route bazlidir, encounter/Lab/preset ile silinir.
Artci sonraki fazda inputtan once eszamanli dispatch edilir; setTimeout yarisi yoktur.

PASS: `node tools/validate-runtime.cjs KnightRush.html --charge-critical --charge-specs --critical-charge`.
Son packet-snapshot/flat-outcome duzeltmesinden sonra yalniz --charge-critical tekrar PASS:
F6S4 100 kart / 83 action / 78 faz; 4 ayri core; komsu benzerligi .8 < .86.
Common referans butceleri esit; en yuksek Common Apex farki %0.35. Gercek DPS/playtest esitligi degil.
Specs 36 kart / 44 action / 43 faz ve ters rol F4S6 87 kart / 50 action ilk kapida PASS;
son degisiklik yalniz yeni chargeCritical payloadini etkilediginden komsular tekrar calistirilmadi.
Gercek HP/cift-paket, savunma Breaki+artci+hazir Release, %100 saturasyon ve yuksek Chain
kontrolleri PASS. HTML/audit/harness parse ve diff temiz. Genis matris/browser/commit/push yok.

F6S5 daha sonra tamamlandi; guncel sira yukaridadir.

## Onceki aile: F6S3 Charge / Posture (2026-08-28)

Onayli 4 Twist / 16 Apex implement edildi. Garanti Primary hazirligi -> sonraki oyuncu fazinda
bedelsiz Release korunur; savunma Charge bankasi, Crit/Bleed veya saf Break Power acilmaz.
Native Posture eksilmez; Base Detonation son gercek temasta bir kez dinamik kapasiteyle cozulur.

1. Gedik Acan Salim: hafif on oklar native Postureu uygular; agir final tek hazirlik paketini
   tasir. On ok gercek Break acarsa finalde ayri ucretli bonus. Apexler Derin Gedik / Sert Uc /
   Hazir Gedik / Ortak Kurulum. Hazir Gedik payinin cogu self-Breaki guclendirir, kucuk payi zaten
   Broken hedefe guvencedir; guvence normal self-Break bonusunu gecmez. Ortak Kurulum onceki
   gercek, farkli skillin pozitif Postureunu ister. Destek oklar ortak dusuk yogunluk egrisinde,
   ayrica PREP_POSTURE_CONTACTS butcesinden odenir; kalan temas butcesi hazirlikta kalir.
2. Pusudaki Salim: Prepare ile Release arasindaki gercek Break olayi kaydedilir; kendi Releaseinin
   actigi Break bu kayda girmez. Apexler Derin Pusu / Ilk Firsat / Ortak Gedik / Guvenli Pusu.
   Parry Breaki bonusu acar ama baska skill sayilmaz. Ilk Firsat gercek Break action indexini okur.
3. Baski Aktarimi: Releasein kendi gercekte uygulanmis Postureu sonraki ayni actor saldirisinin
   BUTUN native olaylarindan sonra tek ek direct hasar verir. Overflow/uygulanmamis Posture
   kaynak degildir. Ek hasar Crit/Chain/Mark/Detonation veya yeni bilet uretmez; Prepare ve
   basarisiz komut bileti tuketmez. Apexler Guclu Aktarim / Devir Teslim / Hizli Aktarim / Sert Salim.
   Sert Salim'in ek Posture + aktarim katkisi birlikte fiyatlanir; ayni Quality iki kez harcanmaz.
4. Artci Baski: normal okun Postureu hemen kalir; AYRI ucretli Posture sonraki savunmanin ilk
   gercek boss saldirisi bittikten sonra gelir. Apexler Guclu Artci / Erken Artci / Kirik Hazirlik /
   Ardisik Baski. Erken varyant savunma acilisinda, ilk saldiridan once gelir. Ardisik Baski
   Release sonrasi farkli skille gercek pozitif Posture ister; etkisi bir kez aktarilir.

Artci zamanlama guvenligi: boss animasyonunun strike/recover bitisi yalniz hazir bayragi koyar.
Posture olayi `updateHazards` SONUNDA, ilk saldirinin cozulmemis carpisma/Parry-grace sonucu
kalmayinca calisir. Gec varyant ilk darbeyi bedavaya silemez. Break kalan diziyi keser.
Erken biten savunmanin kullanilmamis gec paketi sonraki faza sizmaz; bilet once temizlenir.
Bekleyen artci iki sayisal bucket + skill bazli finite takip payidir, frame basina catalog taramasi yok.

Ortak chargePosture frozen payload / PREP_POSTURE engine ve axisler / 4 BOW_PREP_POSTURE recipe-cue.
T1 hafif on ok ve buyuk finali ayirir; HUD Pusu hazirligini, aktarim ve artci miktarini gosterir.
Light-bow Posture ifadesi bir kez uygulanir, ifade edilmeyen ucret garanti hazirliga doner.
Base %10 / kimlik 70-30, parent/rank ve reset izolasyonu korunur.

PASS: `node tools/validate-runtime.cjs KnightRush.html --charge-posture --charge-specs --charge-chain`.
F6S3 100 kart / 76 action / 63 faz senaryosu; 4 ayri core, komsu benzerligi .6286 < .86.
Common Twist referans farki %1.67; Apex referans butceleri esit. Gercek oyun DPS/playtest onayi degil.
Charge specs 36 kart / 44 action / 43 faz; F6S2 100 kart / 121 action / 77 faz regresyonlari PASS.
HTML/audit/harness parse ve diff temiz. Genis matris/browser/playtest/commit/push yok.

F6S4 daha sonra uygulandi; guncel durum icin ustteki kaydi kullan.

## Onceki aile: F6S2 Charge / Chain (2026-08-28)

Onayli 4 Twist / 16 Apex implement edildi. Hepsi Prepare -> sonraki oyuncu fazinda ucretsiz
Release; Primary garanti hazirlik verir, savunmadan Charge bankasi acmaz. Base Detonation
son NORMAL oktadir. Gercek her ok +1 Chain; hazirlik/Detonation destek veya esik okuna kopyalanmaz.

1. Yukselen Salim: kendi normal oklarinin urettigi Chain sonraki oklara ucretli hasar ekler.
   Apexler Derin Seri / Uzun Seri / Hazir Momentum / Sifirdan Kurulum.
2. Zincirli Eslik: ana dizi tam native hasar/hazirlikla vurur; sonraki gercek saldiridan sonra
   bir kez destek dizisi gelir. Apexler Guclu Eslik / Uzun Eslik / Devir Teslim / Hizli Eslik.
3. Bekleyen Salim: READY olduktan sonra araya giren saldirilarin gercek Chain uretimi agir
   finale eklenir; savunma ve kendi Release'i sayilmaz. Otomatik destek gercek Chain katkisi
   verebilir ama ikinci oyuncu hamlesi/skill tercihi sayilmaz.
   Apexler Derin Bekleyis / Tek Hamle / Cesitli Kurulum / Erken Salim.
4. Esik Salvosu: normal ok 4'un katina ulastirinca ucretli plandan ek gercek ok cikar.
   Ek ok +1 Chain verir ama kendisi yeni ek ok tetiklemez. Apexler Sert Esik / Sik Esik (3) /
   Hazir Esik / Kesintisiz Salvo. Sonuncu esik cikmazsa final bonusudur; yuksek Quality'de
   esik cikmama olasiligi sifirsa bu pay garanti finale aktarilir, olu Apex olusmaz.

Tum ana/destek/esik oklari TEK toplam Quality temas planinda sayilir. Uzun Apex bir ucretli
temas ekler; ikinci bagimsiz karekok buyume egrisi yok. Eslik ana parent temaslarini korur.
Esiklerin acabilecegi ek ok sayisi bu sonlu odenmis plandan gelir; Chain stack cap'i degildir.
Karma 70/30, Base %10, native parent/rank ilerlemesi ve Primary-only Chain damage stat'i korunur.

Ortak chargeChain frozen payload, PREP_CHAIN engine/axis kayitlari, 4 BOW_PREP_CHAIN recipe/cue.
Bekleyen Salim'in agir final oku/darbesi ayridir; esik ek oku altin renklidir. HUD bekleyen
eslik sayisini ve READY kurulum Chainini gosterir. Actor ticket'lari encounter/Lab/preset ile silinir.

PASS: `node tools/validate-runtime.cjs KnightRush.html --charge-chain --charge-specs --charge-detonation`.
F6S2: 100 current-rank/high-parent kart, 121 gercek action, 77 faz. 4 ayri core;
komsu benzerligi .7429 < .86, Common Twist referans farki %5.07. Apex referans butceleri esit;
bu sonuc gercek rotasyon/DPS esitligi veya playtest onayi DEGILDIR.
F6S1 84 kart / 74 action / 61 faz ve Charge specs 36 kart / 44 action / 43 faz PASS.
HTML/audit/harness parse ve diff temiz. Genis matris/browser/playtest/commit/push yok.

F6S3 daha sonra tamamlandi; guncel sira icin yukaridaki son aile kaydini kullan.

## Onceki aile: F6S1 Charge / Detonation (2026-08-28)

Kullanici onayli dort Twist / 16 Apex ortak factory/compiler/runtime ile implement edildi.
Garanti Primary hazirligi ve dinamik Base + Secondary Detonation korunur; Charge bankasi,
Mark uretimi, Crit/Posture/Bleed veya yeni kaynak acilmaz.

1. Isaretli Hazirlik: Prepare Mark snapshoti, Mark daha sonra harcansa da bonus korunur.
   Apexler Derin Hazirlik / Buyuk Rezerv / Isaretli Gecis / Bos Baslangic.
2. Takip Atesi: agir Release normal Detonation yapar; ilk sonraki ayni aktorun gercek saldirisinin
   BUTUN Mark uygulamalari/pulselari bittikten sonra tek ek patlama. Hazirlik ve otomatik
   free-follow-up bileti tuketmez. Apexler Guclu Takip / Genis Takip / Hizli Takip / Bos Hedef.
3. Atesleme Oku: hafif ilk gercek temas Marklari patlatir; agir final gercek tuketimi okur.
   Garanti hazirlik yalniz finalde bir kez uygulanir. Ek temas ayri PREP_DET_CONTACTS butcesinden
   odenir, kalan pay hazirlik hasarina gider; final iliskisinin butcesini yiyemez.
   Apexler Agir Final / Genis Atesleme / Temiz Hedef / Erken Salim.
4. Devreden Ates: gercek native Mark tuketimi ayni Twist'in sonraki Prepare'ine tek paket tasir.
   Rezerve paket Prepare'da silinir, kendi hasari yeni rezerv uretmez. Yeni gercek Mark tuketimi
   yeni bir paket kurabilir. Apexler Guclu Devir / Tam Atesleme / Kesintisiz Hazirlik / Isaretli Dongu.

Ortak `chargeDetonation` frozen payload / dort PREP_DET engine / dort BOW_PREP_DET recipe-cue.
T3 buyuk final oku ve darbesi on atistan gorunur bicimde ayrilir. HUD hazirlik snapshot bonusunu,
bekleyen takip kapasitesini ve devir hasarini gosterir. Yeni liste/frame tarama motoru yok;
yalniz bekleyen tek takip ve actor/skill/Twist anahtarli sonlu devir paketleri vardir.

Takip patlamasi kendi Quality'siyle dinamik kapasite/potency alir, Base-10 hasari bedava kopyalamaz.
Harcanan Markin merkezi kaynak degeri hasara dahil edilir ve net guc hesabindan aynen dusulur.
Okuma referansi 8 Mark, gercek tuketim referansi 2 Mark; bunlar fiyatlama referansi, gameplay cap degil.
Genis Takip kapasiteye daha fazla agirlik verir; potency gerilemez. Base 10% / kimlik 70-30 korunur.

Hedefli kapi: `node tools/validate-runtime.cjs KnightRush.html --charge-detonation --charge-specs`.
F6S1: 84 kart / 74 gercek action / 61 savunma fazi; 4 ayri core, komsu benzerligi .80 < .86.
Charge specs: 36 kart / 44 action / 43 faz regresyonu PASS. Son takip-fiyatlama degisikliginden
sonra --charge-detonation tekrar PASS; HTML/audit/harness parse, boot ve diff temiz.
Common Twist referans spreadi %1.90, en yuksek Common Apex spreadi %3.30; bunlar gercek oyun
DPS esitligi veya playtest onayi degildir. Genis matris/browser/playtest/commit/push yok.

F6S2 daha sonra tamamlandi; guncel sira icin yukaridaki son aile kaydini kullan.

## Onceki duzeltme: Charge Primary / Secondary motor ayrimi (2026-08-28)

Kullanici duzeltmesi: **Primary savunmada Charge kazanmaz.** Simdi hazirlanir, sonraki oyuncu
fazinda ucretsiz ve garanti Quality bonuslu vurur. Secondary Parry/Perfect Dodge ile banka
acar ve normal saldirida harcar. Saf Charge/Charge iki mekanigi birlestirir.

Ortak runtime ve Mark Burst / Sharpshoot F6 compilerleri duzeltildi. Primary'nin bonusu
`preparedRelease.damage`; savunma sonucundan bagimsizdir. `commandCollectsDefenseCharge`
yalniz Secondary bankasini acar. Saf rota eski bankayi prepare'da rezerve eder; eski + yeni
Charge ayni `chargeBankDamagePerPoint` Secondary oranini bir kez kullanir. Garanti Primary
bonusu ayrica eklenir. Saf banka fiyat referansi eski 2 + yeni 2 = 4; gameplay cap DEGILDIR.
Karma Primary yaninda baska Secondary skill varsa onun bankasi bagimsiz korunur.

Eski Sharpshoot ucretli per-Charge iliskileri synthesis sirasinda hazirlik payloadina donustu;
runtime sahte Charge verilmez. Eski defense-read Twistlerin acikca ucretli olay okumalari kalir,
native Primary bankasi acmaz. Measured Posture fazlasi Charge iadesi yerine direct hasara;
eski yara ticki Charge uretmek yerine ucretli hazirlik hasarina doner.

Hedefli PASS: `--charge-specs --affliction-specs --affliction-charge`.
F6 36 kart / 44 action / 43 savunma fazi: sifir ve 12 savunma basarisinda karma Primary ayni
hasar, saf rotada banka artisi; Mark Burst ve Sharpshoot alti Spec, uc legacy payload sentinel,
rezerv izolasyonu, bedelsiz/otomatik Release, reset, Crit, Bleed ve gercek Chain denetlendi.
F5 36 kart / 16 action; F5S6 80 kart / 57 action / 60 faz. Genis matris/browser/push yok.

F6S1 Charge/Detonation Twist/Apex tasarimi onaylanip implement edildi; guncel kayit yukaridadir.
Onceki savunma-Charge uzerine kurulu F6S1 onerileri gecersizdir. Yeni tasarimlarda garanti
hazirlik ve dinamik Detonation iliskisi kullanilir; banka veya savunma basarisi eklenmez.

### F6S1 onaylanan tasarim kaydi

Ortak: garanti hazirlik, sonraki tur bedelsiz Release, parent dinamik Detonation korunur.
Yeni katkilar kendi Quality payindan odenir; Mark uretilmez, Charge bankasi acilmaz.
Kosullu Apex kosul disinda da kucuk garanti ilerleme verir. Ideal 4 Twist / her birinde 4 Apex.

1. Isaretli Hazirlik: Prepare anindaki Mark sayisini tuketmeden kaydeder; Release'e ucretli
   ek direct hasar verir. Mark sonradan harcansa da kayit kalir. Tek agir ok.
   Apex: daha guclu okuma; kayit mevcut Detonation kapasitesini asiyorsa ek fayda;
   Prepare oncesi son saldiri Mark ureten baska skill ise ek fayda; sifir-Mark hazirlik destegi.
2. Takip Atesi: agir Release parent patlamasini yapar; bir sonraki gercek saldirinin Mark
   uygulamalarindan SONRA ek dinamik Detonation calisir. Tek kullanim; Mark yoksa patlama yok;
   kendi takip olayi yeni takip kurmaz. Tek agir ok + takipte temassiz patlama, ek Chain yok.
   Apex: takip potency; takip kapasitesi; ayni tur takip bonusu; sifir-Mark takipte kucuk direct destek.
3. Atesleme Oku: hafif on atis parent dinamik Detonation'i yapar; ardindan agir final, GERCEKTEN
   tuketilen Mark sayisindan ucretli ek direct hasar alir. Ana hazirlik paketi bir kez uygulanir.
   Destek ok yogunlugu iki Chain rolunden de dusuk buyur.
   Apex: daha guclu final iliskisi; on atis Detonation kapasitesi; on atis hedefteki tum Marklari
   temizlerse final bonusu; Release yeni oyuncu fazinin ilk saldirisiysa final bonusu.
4. Devreden Ates: tek agir Release'in gercek Detonation'i, ayni hareketin bir sonraki Prepare'i
   icin bir kez kullanilan ucretli ek direct hasar hazirlar. Rezerv ust uste birikmez; kendi
   hasari rezervi beslemez. Yeni gercek Mark tuketimi yeni bir paket hazirlayabilir.
   Apex: guclu devir; Detonation kapasitesi tam kullanildiysa guclu devir; ayni oyuncu fazinda
   tekrar Prepare bonusu; araya Mark ureten baska saldiri koyup Prepare yapma bonusu.

## Alti Charge Primary Specialization (guncellenmis durum)

Kullanici alti Spec'i ve saf Charge'in iki native rolunun birlesmesini onayladi.
`MARK_BURST_CHARGE_SPEC_DEFINITIONS` / `buildMarkBurstChargeSpecializations` ortak Mark Burst
compilerine eklendi. F6S1-S5 Twist/Apex tamamlandi; S6 icin ayri tasarim onayi gerekir.

1. F6S1 Yuklu Patlama: gecikmeli tek agir ok, Base + Secondary ayni dinamik Detonation
   kapasite/potency motorunu besler. Charge patlamayi ayrica carpmaz.
2. F6S2 Yuklu Dizi: gercek sirali oklar; her temas canli Chain okur ve +1 Chain uretir.
   Direct/Charge tek toplam paket olarak bolunur; Detonation finaldedir. Ek Chain Damage stati yok.
3. F6S3 Sarsici Salim: gecikmeli agir ok + olculu light-bow Posture. Ifade edilemeyen Posture
   payi Primary Charge'a bir kez doner, Mark basina cogalmaz. Charge Postureu carpmaz.
4. F6S4 Keskin Salim: Charge dahil direct pakete yerel Crit. Beklenen Charge dahil fiyatlanir;
   Detonation Critlenmez, Precision/Crit Damage stati yoktur.
5. F6S5 Kanli Salim: agir Release + iki native Bleed ticki. Charge yarayi carpmaz.
6. F6S6 Birikimli Salim: prepare eski bankayi tuketip `pending.reservedBank` olarak ayirir;
   savunma kazanci `pending.charge` olarak ayrica tutulur. Ucretsiz Release ikisini bir kez harcar.
   Eski ve yeni banka ayni Secondary `chargeBankDamagePerPoint` oranini kullanir; Primary
   CHARGE_RELEASE ayri garanti hazirlik bonusudur. 3 eski + 4 yeni = 7 harcanan Charge.
   Ayri Charge Power stati acilmadi. Aradaki Secondary saldiri rezerve bankayi harcayamaz.

Tum Spec'ler simdi AP/Resolve odeyip saldirmadan savunmaya gecer, sonraki player fazinda
0 AP / 0 Resolve Release olur. Finish Turn once hazir Release'i yapar; sifir basarida da
garanti hazirlik bonuslu ok cikar. Normal Secondary max(eski,yeni) bankalama korunur;
Sharpshoot Primary de ayni duzeltilmis motoru kullanir.
Base %10 / karma 70-30 / saf ayni-attribute toplam butce korunur. Quality Detonation kapasitesini
buyutur; yalniz Base tasiyan Common kartin 1 Mark ile baslamasi sabit cap demek degildir.
Agir ok/volley icin mevcut uygun Bow recipe'leri kullanildi. Charge HUD, Lab ve rarity detaylari
hazirlik/Release, eski rezerv ve ayri banka katsayisini gosterir; yeni animation sistemi yoktur.

PASS: `node tools/validate-runtime.cjs KnightRush.html --charge-specs --affliction-specs --affliction-charge`.
F6: 36 kart / 44 action / 43 savunma fazi; F5 specs 36 kart / 16 action;
F5S6 80 kart / 57 action / 60 faz. Prepare maliyeti/sifir hasar, ucretsiz Release, rezerv izolasyonu,
otomatik salim, saf Secondary banka payinin 12->120 dogrusal buyumesi, Sharpshoot, iki-tick yara, Crit, miras/rank,
dinamik Detonation, preview ve reset gecti. Referans sibling spread Common %4.43, Uncommon %8.02,
Rare %2.86, Legendary %6.12; bu her senaryoda ayni DPS veya tamamlanmis playtest demek degildir.
Secondary Chain ok sayisi 2/3/3/4; ayni derinlik Primary 3/4/5/6.
HTML parse/boot/diff temiz. Genis matris, browser/playtest, commit/push yok.

Guncel sonraki aile dosyanin basindadir; bu alti Spec kaydinin sonraki sira bilgisi eskimistir.
Kullanici onaylamadan Twist/Apex implement edilmez. Saf Charge'in eski banka + yeni savunma
birlesimi S6'ya aittir; karma F6 Spec'lerine bedava eski banka tuketimi ekleme.

## Onceki tamamlanan is: F5S6 Affliction/Charge + F5S5 Apex degisikligi

Kullanici onayli F5S6 `4 Twist / 15 Apex` implement edildi; dagilim `4/4/3/4`.
Kullanici Son AP kosulunu bu tasarimlarda istemedi. F5S5 T1A3 Son Atis da
`Ust Uste Kesik` oldu: hemen once ayni skill/route tamamlandiysa yalniz yeni yara guclenir;
eski yara veya tekrar sayisi carpani okunmaz. Route ID korunur. Yeni F5S6 Son AP kullanmaz.

1. Yuklu Yara: harcanan Charge iki ticklik yeni yarayi toplamsal guclendirir. Apexler Derin
   Yuk, Bos Hazne, Kusursuz Yuk, Dikenli Uc. Kusursuz Yuk son gercek savunma fazinin hasarsiz
   tamamlanmasini ister; ilk kullanim veya invulnerability ile reddedilen temas yanlis sayilmaz.
2. Savunmayla Derinlesen Yara: iki savunma fazindaki gercek Parry/Perfect Dodge yaklasan ticki
   besler; kazanilan Charge korunur. Apexler Derin Savunma, Parry Kesikleri, Erken Kurulum,
   Kalin Diken. Erken Kurulum player fazinin ilk saldirisi kosuludur; Son AP degildir.
3. Yuk Yiyen Yara: iki tickin her biri o anki gercek bankayi otomatik harcar. Eski banka ve
   yeni savunma kazanci toplanmaz; `max` ile tek banka olur ve tuketilen kazanc yeniden bankalanmaz.
   Apexler Derin Tuketim, Olgun Yara, Bos Akis. Uc Apex bilincli: Son Komut cikarildi.
4. Kanli Geri Donus: ilk tickten sonra, normal bankalama bittikten sonra ucretli Charge iade
   edilir. Apexler Guclu Donus, Temiz Baslangic, Devir Yuku, Derin Iz. Iade harcanani asmaz;
   artan/fraksiyonel ucretli iade payi yeni yaraya gider. Iade yeni yara veya yeni iade kurmaz.

Butun rotalar tek gercek ok, tek dogal Chain, iki native yara ticki ve dinamik Base Detonation
tasir. Parentin Charge bankasini bir kez harcayan anlik hasari aynen korunur. Yeni iliski ayrica
Quality oder. Crit/Posture/Break/ek Chain katsayisi veya saf Yara Gucu stati acilmaz.
T3 bankanin merkezi firsat degerini yaraya cevirir; net guc hesabinda bu harcama dusulur.
Ust uste T3 yaralari ucretli katsayilarini toplar fakat ayni bankanin degerini ikinci kez alamaz.
T4 merkezi `retainedChargePower` fiyatini kullanir; Common seviyede gercek iade vardir.

Dort `BOW_AFF_CHARGE_*` recipe/cue ve Charge HUDunda besleme/otomatik harcama/iade bilgisi var.
Yeni state yalniz iki kucuk tick paketi + bir hazir-iade sayisidir; per-wound liste/frame taramasi yok.
Ikinci tickte biter; Skill Lab/encounter resetlerinde temizlenir. Iki gercek savunma ticki test edildi.

PASS: `node tools/validate-runtime.cjs KnightRush.html --affliction-charge --affliction-focus --affliction-specs`.
F5S6 80 kart / 57 action / 60 savunma fazi; F5S5 84 kart / 45 action; F5 specs 36 kart / 16 action.
F5S6 4 ayri core, kardes benzerligi `.46`, komsu benzerligi `.60`. Common Twist/Apex net referans
butceleri esit; bu sonuc her oyun durumunda ayni gercek hasar veya bitmis playtest anlamina gelmez.
Parent/rank, Quality 70/30 + Base %10, tum 15 Apex, sifir Charge/Mark, kusursuz savunma, bankanin
cift sayilmamasi, overlap, iade siniri/sirasi, yuksek kaynak ve reset kapilari PASS.
HTML parse, headless cue/HUD cizimi ve diff temiz. Browser/playtest, genis matris, commit/push yok.

Bu kayittan sonra F6 alti Spec onaylanip implement edildi; guncel kayit dosyanin basindadir.
F5 capraz-aile kapanis kontrolu ayrica yapilmadi; kullanici F6 tasarimina gecmeyi secti.

## Onceki tamamlanan is: F5S5 Affliction/Affliction Twist + Apex

Kullanici onayli `4 Twist / 16 Apex` implement edildi. Saf Affliction parentinin iki native
ticki ve Base Detonation kapasite/potency motoru korunur; yeni kaynak veya ucuncu attribute yoktur.

1. Yogun Kanama tek agir dikenli oktur. Yalniz bu Twist `Yara Gucu` acar: kendi yeni yarasina
   Quality-paid toplamsal guc verir, global carpan degildir ve Bleed toplaminda zaten sayilir.
2. Yeniden Ac tek okla action-start eski yaranin kalan iki tick toplamindan anlik hasar verir;
   eski tickler tuketilmez, yeni yara kendi saldirisinda okunmaz. Ilk Kesik daha kucuk bos-hedef
   guvencesidir; butcesinin `%70`i normal yeniden-acmaya, `%30`u guvenceye ayrilir.
3. Gec Sizi iki native ticki azaltmadan ek paketi ikinci ticke koyar. `.90` gecikme fiyati
   runtime cap degildir. Erken Kurulum gercek player-phase ilk saldiriyi; Olgun Hedef eski
   yaranin yalniz son tickini okur. Attack counter her player fazi ve Skill Lab resetinde temizlenir.
4. Katmanli Yara dusuk yogunluklu gercek ok serisidir. Onceki native yara paylari sonraki
   bonusu besler; eski yara ve kazanilmis bonuslar geri okunmaz. Tek toplam native yara bolunur.

Apexler: Derin Uc/Ilk Kan/Ust Uste Kesik/Sert Diken; Derin Acilim/Son Sizi/Devir Kesik/Ilk Kesik;
Derin Sizi/Erken Kurulum/Olgun Hedef/Sert Uc; Derin Dikis/Uzun Dizi/Taze Dikis/Kesintisiz Dikis.
Devir Kesik gercekten farkli skill ister; Kesintisiz Dikis onceki ayni routeu ister ve streak
biriktirmez. Yeni `BOW_AFF_FOCUS_*` recipe/cuelar agir yara, yirtilma, gecikme ve seri kimliklerini
gosterir. Yaralar bossun mevcut iki bucketinda kalir; per-wound nesne listesi veya frame taramasi yoktur.

PASS: `node tools/validate-runtime.cjs KnightRush.html --affliction-focus --affliction-critical --affliction-specs`.
F5S5 84 kart / 43 real action; F5S4 84 kart / 21 action; F5 specs 36 kart / 16 action.
Common F5S5 Twist farki `%2.24`, maksimum Apex farki `%1.54`;
4 ayri core, kardes benzerligi `.28`, komsu benzerligi `.6857`. Normal oklar `2/2/2/3`,
Uzun `3/3/3/4`; Primary Chain `4/5/6/7`, Secondary Chain `4/4/4/5`.
Yuksek eski-yara runtime, gercek ard arda saldiri, ortak attack-history reset, iki-tick
sona erme, sifir Mark, tek seferlik yirtilma ve butun Apex kosullari PASS.
HTML parse/diff temiz. Gorsel browser/playtest ve genis matris calistirilmadi; commit/push yok.

F5S6 da tamamlandi; guncel kayit dosyanin basindadir.

## Onceki tamamlanan is: F5S4 Affliction/Critical Twist + Apex

Onaylanan `4 Twist / 16 Apex` aile materialize edildi. Affliction ana kimliktir: native
iki-tick yara her durumda uygulanir; Crit yalniz direct Health temasina yerel calisir. Bleed
ve Detonation Critlenmez, Precision birikmez ve genel Crit Damage stati acilmaz.

1. Keskin Akis tek ucretli ek yara paketini Critte ilk ticke, Non-Critte ikinci ticke yollar;
   toplam paket kopyalanmaz. Ani Yirtik yalniz Crit dalina kucuk anlik yara payi ekler.
2. Kor Zehir Crit basarisizligini iki Bleed tickine ucretli guc olarak aktarir. Ilk Iska temiz
   action-start hedefi, Son Sans son AP penceresini odullendirir.
3. Sabirli Dizi bagimsiz yerel Crit atan gercek oklara tek toplam yarayi boler. Onceki Non-Crit
   oklar yalniz sonraki yara payini buyutur; her ok tam `+1 Chain` uretir. Destek-ok egrisi
   `2/2/2/3`, Long `3/3/3/4`; Primary Chain `4/5/6/7`, Secondary Chain `4/4/4/5`tir.
4. Kan Ritmi onceki saldirinin Crit sonucunu bir kez okur: Crit ucretli paketi yaraya,
   Non-Crit veya ilk kullanim direct darbeye yollar. Kanli Devir farkli skill Critini, Sert
   Tekrar ayni hareket Non-Critini odullendirir; yeni meter/token yaratmaz.

Apexler: Derin Akis/Ani Yirtik/Sabirli Kesik/Zehirli Uc; Derin Zehir/Ilk Iska/Son Sans/
Zehirli Uc; Derin Sabir/Uzun Dizi/Agir Kapanis/Zehirli Dizi; Derin Ritim/Kanli Devir/
Sert Tekrar/Zehirli Ritim. Dort ayri `BOW_AFF_CRIT_*` recipe/cue combat kimligini gosterir.

PASS: `node tools/validate-runtime.cjs KnightRush.html --affliction-critical --affliction-specs`.
F5S4: 84 kart, 21 deterministik real action, `4/4` ayri core, kardes maksimum benzerlik
`.46`, ters F4S5 benzerligi `.7429` (esik `.86`), Common Twist spread `%2.24`, en yuksek
Apex spread `%6.72`. F5 specialization regresyonu 36 kart / 16 action PASS. Receipt/miras,
70/30, no-Precision/no-Crit-Damage, final Base Detonation, iki tick, animasyon ve iki Chain
rolunun altinda destek-ok scalingi dogrulandi. Quick/exhaustive/browser, commit/push yapilmadi.

Bu kayittan sonra F5S5 de onaylanip implement edildi; guncel kayit dosyanin basindadir.

## Onceki tamamlanan is: F5S3 Affliction/Posture Twist + Apex

Kullanici `4 Twist / 16 Apex` tasarimini onayladi ve aile materialize edildi. Affliction ana
kimliktir: her rota native iki-tick yarayi, light-bow Postureu, tek gercek temas basina Chaini
ve final temas dinamik Base Detonation paketini korur. Break Power acilmaz; delayed veya
relationship sonucu Crit, Mark, Chain ya da yeni kalici kaynak uretmez.

1. Ilk Catlak yeni yarayi Posturedan once uygular. Action-start hedef temizse ucretli ek
   Posture verir; Eski Iz Apexi kanayan hedefe daha kucuk bir guvence ekler.
2. Basincli Yara tek ucretli yara paketini self-Break sonucuna gore yonlendirir: Break varsa
   ilk tick, yoksa ikinci tick. Toplam paket iki dala kopyalanmaz.
3. Dikenli Dizi tek toplam direct/yara/Posture paketini pozitif payli gercek oklara boler;
   onceki oklarin yeni yara payi sonraki Postureu guclendirir. Her ok `+1 Chain` uretir.
   Destek-ok egrisi `2/2/2/3`, Long `3/3/3/4`; ayni derinlik Primary Chain `4/5/6/7`,
   Secondary Chain `4/4/4/5`tir.
4. Acik Zirh action-start Broken durumunu okur; Breaki tuketmeden ucretli ek iki-tick yara
   verir. Hazirlik Ucu, hedef Broken degilse Posture vererek sonraki pencereyi hazirlar.

Apexler: Derin Catlak/Eski Iz/Agir Uc/Zehirli Uc; Derin Basinc/Hizli Sizinti/Sabirli Basinc/
Zehirli Basinc; Derin Dikis/Uzun Dizi/Agir Kapanis/Zehirli Dizi; Derin Acik Yara/Son Atis/
Kirilma Takibi/Hazirlik Ucu. Hepsi `Apex Design V2` ve runtime kaniti tasir. Dort ayri Bow
recipe/cue gercek temas, yara-Posture sirasi, basincli tick ve Broken finisheri gosterir.

PASS: `node tools/validate-runtime.cjs KnightRush.html --affliction-posture --affliction-specs`:
F5S3 icin 84 kart durumu, 46 deterministik gercek action, 16 Apex kosulu, iki tick, Break
dallari, Skill Lab preview, animasyon, receipt/miras ve komsu-agac kontrolleri. Common Twist
spreadi `%2.29`, en yuksek Apex spreadi `%1.29`; kimlik `4/4` ayri core, maksimum kardes
benzerligi `.28`, ters F3S5 davranis benzerligi `.6571` (esik `.86`). F5 specialization
regresyonu 36 kart / 16 action PASS. Inline JS/audit/harness parse, boot ve diff kontrolleri
PASS. Quick/exhaustive/browser, commit/push yapilmadi.

Bu aile tamamlandi; guncel sonraki adim dosyanin basindadir.

## Onceki tamamlanan is: F5S2 Affliction/Chain Twist + Apex

Kullanici `4 Twist / 16 Apex` tasarimini onayladi ve aile materialize edildi. Ortak parent
gercek sirali oklar kullanir: her gorunen ok pozitif direct/yara payi ve tam `+1 Chain` tasir,
tek toplam iki-tick yara bolunur fakat cogalmaz, dinamik Base Detonation final temasta kalir.
Baslangic Chaini normal combat scalinginde calisir; yalniz ayni actionda uretilen Chaini okuyan
iliskiler onu ikinci kez varsayilan olarak saymaz.

1. Canli Dikis: onceki gercek oklarin bu actionda urettigi Chain final okun yeni yara payini
   derinlestirir. Hazir Iplik baslangic Chaininin yalniz ucretli kucuk payini opt-in eder.
2. Ince Dizi: ayni toplam direct/yara paketini en yogun gercek ok Deliverysine boler. Uzun Dizi
   ayni derinlikte tam bir ucretli ok ekler. Destek-ok egrisi Primary Chain motorundan yavas
   buyur (`4/4/4/5`, Long `5/5/5/6`, ayni derinlik Primary `4/5/6/7`).
3. Kanli Kapanis: yalniz action-start eski yarayi tuketmeden finalde ek Chain uretir; yeni yara
   kendini okuyamaz. Ilk Kesik butcesi `%70` normal eski-yara motoruna, `%30` daha kucuk sifir-yara
   sigortasina gider; bu nedenle Quality ile buyurur fakat parent kosulunu gecmez.
4. Gec Kadans: action-start Chainini tuketmeden yeni yaranin ikinci tickine ekler. Bu actionin
   urettigi Chain geriye donuk okunmaz; Bleed tickleri Chain uretmez.

Apexler: Derin Dikis/Ilk Kan/Hazir Iplik/Zehirli Dikis; Uzun Dizi/Derin Uclar/Keskin Uclar/
Agir Kapanis; Derin Kapanis/Son Nabiz/Ardisik Takip/Ilk Kesik; Derin Kadans/Hizli Kan/
Ardisik Kadans/Dusuk Tempo. Hepsi `Apex Design V2` ve kosul/runtime kaniti tasir. Dort ayri
Bow recipe/cue gercek temas sayisi ve yara/Chain zamanlamasiyla eslesir.

PASS: `node tools/validate-runtime.cjs KnightRush.html --affliction-chain`: 84 kart durumu,
42 deterministik gercek action, 16 Apex kosulu, tick zamanlamasi, Skill Lab preview, animasyon,
receipt/miras ve komsu-agac kontrolleri. Common Twist spreadi `%0.94`, en yuksek Apex spreadi
`%6.51`; kimlik `4/4` ayri core, maksimum kardes benzerligi `.46`, ters F2S5 davranis
benzerligi `.6571` (esik `.86`). `--affliction-specs` ayni calisma sirasinda tekrar PASS oldu.
Inline JS/audit/harness parse ve boot PASS. Quick/exhaustive/browser, commit/push yapilmadi.

Bu aile tamamlandi; guncel sonraki adim dosyanin basindadir.

## Onceki tamamlanan is: F5S1 Affliction/Detonation Twist + Apex

Kullanici dort Twist ve her biri icin dort Apex tasarimini onayladi; `4 Twist / 16 Apex`
materializedir. Hepsi tek fiziksel ok, tek dogal Chain, iki tam Bleed ticki ve ortak uncapped
Base + Secondary Detonation kapasite/potency motorunu korur. Ek sonuclar Quality butcesinden
sonlu paketlerdir; Bleed, Mark veya kendi bonuslarindan recursive guc uretmez.

1. Taze Yirtik yeni yarayi once uygular; gercek Mark patlamasi yalniz o yeni yaranin ucretli
   payini anlik vurur. Eski yarayi okumaz ve iki gelecek ticki eksiltmez.
2. Damar Besleme gercek patlamada yalniz action-start yarasinin kalan tick kovalarina ek hasar
   koyar. Yeni yara kendi bonusuna girmez, bitmis tick yenilenmez.
3. Olgun Fitil bu okun birinci/ikinci tickine bagli sonlu odulleri saklar. Hazir odul bir sonraki
   gercek Mark patlamasinda bir kez harcanir; aradaki farkli saldiri yalniz ucretli Apex payini
   ekler. Zero-Mark temas ve Bleed ticki fitili tuketmez.
4. Sonmeyen Yara sifir Markta yeni yarayi buyutur; kismen dolu kapasitede eksik pay kadar daha
   kucuk telafi verir. Mevcut Mark asla tutulmaz veya caplenmez.

Apexler: Derin/Ilk Kan/Dolu Hazne/Devir Teslim; Derin Besleme/Son Nabiz/Ardisik Bakim/Ilk Kesik;
Guclu Fitil/Ilk Kivilcim/Ara Nisan/Son Mark; Derin Telafi/Eksik Atesleme/Son Atis/Patlama Sonrasi.
Her Apex `Apex Design V2`, benzersiz karar anahtari ve runtime kaniti tasir. Dort ayri Bow
recipe/cue tek okun yara-patlama zamanlamasini gosterir; hedef Bleed HUD'i bekleyen/hazir fitili
gosterir. Skill Lab reseti pending/ready fitili temizler.

PASS: `node tools/validate-runtime.cjs KnightRush.html --affliction-detonation`:
84 kart durumu (4 Twist + 16 Apex x 4 rank ve 4 high-parent sentinel), 67 deterministik gercek
action, tum 16 Apex kosulu, iki tick, overlap fitil, cross-move tuketim, Skill Lab preview,
animasyon ve receipt/miras kontrolleri. Dordu de ayni beklenen Quality gucunde (`%0` spread).
Kimlik kapisi `4/4` ayri core; maksimum kardes benzerligi `.54`, ters F1S5 komsu maksimumu
`.7429` (esik `.86`). Ayrica `--affliction-specs` regresyonu PASS; HTML/harness/audit parse,
boot ve `git diff --check` PASS. Quick/exhaustive/browser, commit/push yapilmadi.

Bu aile tamamlandi; guncel sonraki adim dosyanin basindadir.

## Onceki tamamlanan is: F5 Affliction Specializationlari

Kullanici alti Specialization tasarimini onayladi; hepsi implement edildi.
`MARK_BURST_AFFLICTION_SPEC_DEFINITIONS` ve `buildMarkBurstAfflictionSpecializations` ortak
Mark Burst compilerini kullanir; combat motoruna skill-id istisnasi eklenmedi.

1. F5S1 Patlayici Diken (`burst_affliction_detonation_spec`): tek ok, iki-tick yara;
   Base + Secondary ayni uncapped Detonation kapasite/potency motorunu besler.
2. F5S2 Kanli Dizi (`burst_affliction_chain_spec`): gercek sirali oklar, temas basina Chain;
   toplam yara bolunur, cogalmaz. Genel ek Chain katsayisi yok; Primaryden daha yavas buyur.
3. F5S3 Zirh Yarasi (`burst_affliction_posture_spec`): tek ok, guclu yara + olculu light-bow
   Posture. Bleed ticki Posture uretmez, Break Power acilmaz.
4. F5S4 Keskin Yara (`burst_affliction_critical_spec`): tek direct-only yerel Crit oku;
   Precision/Crit Damage stati yok, Bleed ve Detonation Critlenmez.
5. F5S5 Derin Kanama (`burst_affliction_focus_spec`): en yuksek kosulsuz iki-tick yara;
   ayri Bleed Power stati, uzayan sure veya yeni kaynak yok.
6. F5S6 Yuklu Diken (`burst_affliction_charge_spec`): best-phase Charge bankasi bir kez
   anlik direct hasara gider. Delayed Primary Charge veya Charge-to-Bleed iliskisi yok.

Base `%10`, ortak karma `70/30`, saf rota tam Affliction ve mevcut silah/rol expression
politikalari korunur. Tickler Mark/Chain/Precision uretmez. Yeni animasyon sistemi yerine
alti uygun mevcut Bow recipe kullanildi; agir yara, kisa seri, Posture, Crit ve Charge
sunumlari mekanik temaslarla eslesti. Gorsel browser smoke yapilmadi.

PASS: `node tools/validate-runtime.cjs KnightRush.html --affliction-specs`:
36 kart durumu (24 mevcut-rank + 12 yuksek-parent sentinel), 16 deterministik gercek action,
iki gercek savunma ticki, Skill Lab preview, miras, payload ve animasyon kontrolleri.
Kardes toplam guc farki: Common `%5.34`, Uncommon `%8.02`, Rare `%3.43`, Legendary `%6.12`.
Common Form gecmisinde S2 ok sayisi `2/3/3/4`, Primary Chain referansi `3/4/5/6`.
Critin sabit Secondary butcesi daha guclu Form hasari uzerinde daha dusuk yuzdeyle ifade
edilebilir: yuksek-parent karsilastirmasi mutlak beklenen Crit gucunu ve toplam gucu korur;
mevcut-rank ve immediate-parent Crit sansi ayrica gerilemezlik kontrolunden gecer.
Base/Secondary ayni Detonation ekseninde tutuldugundan receipt kontrolu Base payini ayirir.
Action Marki baslangicta tuketir; payload finalde cozulur, `consumedByHit` ACTION modunda bos kalir.
HTML parse, harness/audit syntax, boot ve diff kontrolleri PASS. Quick/exhaustive/browser,
commit/push yapilmadi.

## Onceki tamamlanan is: global Chain / Sharpshoot gocu

Kullanici global duzeltmeyi ve anlamini kaybeden iki Apexin yeni etkisini onayladi.
Uygulama ve hedefli regresyon tamamlandi; commit/push yapilmadi.
- `skillRoleDeliveryPattern`, `skillRoleContactMagnitude`, `materializeSkillSecondaryChain`
  ortak kontrati Sharpshoot ve Mark Burstte kullaniliyor. Iki Chain rolu de sifir kurulumla
  gercek coklu temas uretir. Eski Secondary Singlelar kurulum + agir final serisidir.
- Primary daha guclu temas buyumesini korur; Secondary daha yavas, Chain disi destek oklari
  daha da yavas buyur. Sabit ust cap yok. Density Apexi Secondary egrisine ucretli +1 temas
  ekler; Primaryyi asabilecek daha dik bir egri acmaz. Ilk uc-pellet silueti dusuk Qualityde
  Secondary ile esit olabilir; buyume hizlari ayni degildir.
- Generic ek stack-basina Chain hasar stati Primaryye aittir. Secondarynin eski genel
  katsayi butcesi temas/darbeye gider. Ucretli Weight, ramp, Mark/Chain ve diger relationship
  okumalarini silme. Ortak miras/rank onarimi Secondaryye genel katsayiyi geri ekleyemez.
- Her Chain temasi dogal Chain uretir. Eszamanli pelletler ortak grup-basi snapshoti okur;
  iki dalgali packetin ikinci dalgasi ilk dalganin BUTUN gercek Chain uretimini okur.
- `mark_chain_echo_generation_apex`: agir son yanki (`ECHO_FINAL_IMPACT`).
  `mark_chain_shotgun_chain_apex`: tek toplam shotgun hasar paketi (`PELLET_IMPACT`).
  Eski idler save uyumu icin korundu; ikisi de ekstra Chain vermiyor. Compiler F1 surumu 34.
- Mark Burstte Secondary Chain impact butcesi Crit/relationship fiyatlamasindan ONCE eklenir.
  Crescendo/Cascade ozel okumasi yalniz kendi Twist/Apex receiptlerinden odenir;
  parentin donusturulmus impact temeline el koyamaz.
- Tek toplam Mark/Posture/Bleed/Charge paketi ve dinamik Detonation kapasitesi korunur;
  artan temaslar bunlari bedavaya carpmaz. Bow timeline gercek temaslarla dogrulandi.
- PASS: `node tools/validate-runtime.cjs KnightRush.html --global-chain --arrow-scaling`.
  Global: 574 ilgili rota (328 Sharpshoot, 246 Mark Burst), 758 kart durumu,
  32 yuksek-lineage ornegi, 21 deterministik combat. Tarama gercek compile edilmis
  temas sayisini kullanir; tek temasli Chain-disi payload yankilarini sayiya katmaz.
  Mark Burst destek-ok regresyonu:
  64 rota / 203 durum / 17 combat. Boot, inline JS parse, harness/audit syntax ve
  `git diff --check` de PASS.
- F1S2 dort Twist mevcut standard playthrough %20 siniri icinde. 16 Apexin dort mevcut
  rankinda kardes farki en cok %23.30; mevcut %25 esigi gevsetilmedi.
- Yeni Cartesian tarama/`--quick`/`--exhaustive` kosulmadi. Eski F1 materialization Cartesian
  auditi artik acilista kosmaz; `runSharpshootMarkMaterializationAudit()` ve
  `--exhaustive-feature` ile istege bagli. Bu genis mod bu tur kosulmadi; tum gecmislerin
  sertifikasi verilmiyor. Diger mevcut boot auditleri yerinde duruyor.

Sonraki adim: yeni aile tasarimina kullaniciyla don; onceki global WIP onayini tekrar isteme.

## Zorunlu okuma

1. `SKILL_AUTHORING_START_HERE_TR.md`
2. `STABLE_SKILL_TREE_RULES.md`
3. `TWIST_AUTHORING_CONTRACT_TR.md`
4. `APEX_AUTHORING_CONTRACT_TR.md`
5. `MOVE_FAMILY_ACCEPTANCE_TEMPLATE_TR.md`
6. Tasarlanacak aileye en yakin tamamlanmis route/factory/runtime kodu

Ana oyun dosyasi `KnightRush.html`dir. GitHub Pages `index.html` uzerinden oyunu acar.
Ana branch `main`, remote `origin` ise `https://github.com/porsukmen/knightrush.git` adresidir.

## Vizyon ve calisma bicimi

- Kullanici ham fikrini soylediginde onu dogrudan kodlama. Once oyun tasarimi, komsu agaclar,
  gelecek sentez sistemi ve balance acisindan yorumla; tasarim onayi geldikten sonra implement et.
- Amac tek tek kart yazmak degil; baska AI'larin da ayni kalitede yeni weapon/skill agaclari
  uretebildigi veri tabanli, denetlenen bir sentez sistemi kurmaktir.
- Stable yol lineer evolutiondir: child parent kimligini tasir ve gelistirir. Distorted/Corrupted
  daha sonra bu kurallari kontrollu bicimde bozacak.
- Form Primary'yi, Specialization Secondary'yi, Twist gercek oynanis motorunu ve Delivery'yi,
  Apex ise parent Twist'i bozmadan son build kararini belirler.
- Bir ailede varsayilan hedef dort ayri Twisttir; gercekten ayrisan kimlik cikmiyorsa uc Twist kabul
  edilebilir. Her Twist icin ideal hedef dort Apextir. Dort mantikli, basit ve parenti bozmayan upgrade
  bulunamiyorsa kota doldurulmaz; `apexTarget` uce veya gerekirse ikiye dusurulur. Twistler ve Apexler
  yalniz sayisal varyant olamaz; farkli oyuncu karari ve sinerji kancasi tasimalidir.
- Kod verimli olmali. Skill verisi factory/registry ile uretilir; rarity veya kart basina kopya
  runtime bloklari yazilmaz. Sistematik hata skill-id istisnasi ile saklanmaz.

## Degismez combat ve sentez kurallari

- Her weapon skill bir Base Attribute, her route bir Primary ve Secondary Attribute tasir.
- Mark Burst skillinin Base Attribute'u `DETONATION`dir: Stable hareketler Mark uretmez ve gercek
  Mark patlatma davranisini korur. Her katman once Quality gucunun `%10`unu Base Detonationa oder;
  Detonation Primary ise kalan kimlik paketinin `%70`i, Secondary ise `%30`u ayni ortak motora eklenir.
  Detonation/Detonation saf rotada kalan paketin tamami Detonationa gider.
- Detonation kaynaklara gore ayri motorlara bolunmez. Base + Primary + Secondary Detonation kredileri
  tek `synthesisDetonationPower` degerinde toplanir; ayni uncapped Quality egrisi hem Mark basina
  hasari hem de gercek tuketim kapasitesini buyutur. Authored Mark cap yoktur; eldeki finite Mark
  rezervi dogal sinirdir.
- Cok temasli hareketlerde rota yalniz zamanlama/topoloji secer. Ortak toplam Detonation kapasitesi
  final temasta toplanabilir veya uygun gercek temaslara tam sayili dagitilabilir; temas sayisi
  Detonation gucunu bedava cogaltmaz ve hicbir ucretli kapasite kaybolmaz.
- Bu Base/Primary/Secondary kimlik dagitimi skill-agnostic ortak compiler kontratidir ve yeni weapon
  skilllerinde tekrar kullanilmalidir. Charge istisnadir: ayni Attribute gucunu kullansa da delayed
  commit ile savunma release/banka davranisi iki ayri zamanlama sistemi olarak acik kalir.
- Chain kalici momentumdur. Kartlar Chaini tuketemez, azaltamaz, sifirlayamaz veya baska kaynaga
  cevirirken silemez. Yalniz phase reseti ve gercek darbe alma combo kuralidir.
- Her gorunen mekanik temas tam `+1 Chain` uretir. Primary Chain hareketi her rarityde en az iki
  gercek temas tasir; daha yuksek mevcut rarity daha fazla temas verir. Toplam Quality ile temas,
  Weight ve diger uygun delivery parametreleri keyfi cap olmadan buyuyebilir.
- Primary ve Secondary Chain icin `SINGLE` yasaktir. Agir ok gerekiyorsa hafif kurulum oklari + agir final
  kullanilir; kontak yogunlugu daha yavas buyutulebilir.
- Gorunen sonuc gercektir: her ok/vurus pozitif ve acik bir mekanik katkida bulunur. Tek toplam
  Posture/Bleed/Charge paketi multihitte temaslara bolunur, temas sayisiyla bedava cogalmaz.
- Chain/hasar gibi canli okuma, ayni actiondaki sirali onceki temaslari gorebilir. Eszamanli packet
  ayni grup-basi snapshotini kullanir.
- Child parentin sahip oldugu damage, Base/Primary/Secondary output veya mekanigi sebepsiz
  dusuremez. Rank yukseldikce sahip olunan stat gerilemez. Kardes rotalar yakin toplam guc bandinda
  kalir; kimlikleri ise net farkli olur.
- Rarity yeni kimlik acmaz; ayni kartin Quality gucunu buyutur. Gecmisteki guclu rarity temeli
  sonraki zayif rarity tarafindan silinmez.
- Keyfi gameplay cap veya diminishing eklenmez. Dogal finite kaynak siniri ile authored cap ayni
  sey degildir.
- Animasyon/Delivery mekanigi okunur kilmali fakat combat gerceginden ayridir. Testlerde ses mute
  baslamalidir.

## Mark Burst F2 — mevcut durum

F2 `Chain Primary Form`dur. Butun alt yollar sirali gercek oklar, temas basina `+1 Chain`, canli
Chain scaling ve son gercek temasta korunan dinamik Base Detonation paketini tasir.

Tamamlanan aileler:

- `F2S1 Chain/Detonation`: 4 Twist / 16 Apex tamamlandi.
- `F2S2 Chain/Chain`: 4 Twist / 16 Apex tamamlandi. Canli sekans, setup+agir final,
  machine-gun sekansi ve fiziksel echo kimlikleri vardir.
- `F2S3 Chain/Posture`: 4 Twist / 16 Apex tamamlandi.
- `F2S4 Chain/Critical`: 4 Twist / 12 Apex tamamlandi.
- `F2S5 Chain/Affliction`: 4 Twist / 16 Apex tamamlandi.
- `F2S6 Chain/Charge`: 4 Twist / 16 Apex tamamlandi.

F2S3 kimlikleri:

1. Dagitilmis baski: tek ucretli light-bow Posture paketi butun gercek oklara bolunur.
2. Kurulum + agir final: hafif oklar Chain kurar; agir final tasinan ve ayni actionda uretilen
   Chaini Posture iliskisine ayri ayri okuyabilir.
3. Acilis Breach: Posture ilk oka yuklenir; o ok Break acarsa kalan gercek oklar ayni actiondaki
   Break penceresini kullanir. Apexte basarisiz acilisi finalde yeniden deneyen rota vardir.
4. Chain esikleri: kalici Chain 4/8/12/... esiklerini her gectiginde Posture pulse olusur. Chain
   tuketilmez ve esiklerin ust siniri yoktur.

Her F2S3 Twist tam dort Apex tasir; Apexler esit/yukselen/ritmik dagilim, carried-vs-generated
Chain, Break conversion/retry ve daha sik/daha guclu/yukselen/hazirlikli esik gibi gercek kararlar
acmistir.

F2S4 kimlikleri:

1. Yukselen Nisan: hareketin kendi kurdugu Chain, sonraki temaslarin yerel Crit sansini buyutur.
2. Yuklu Final: gercek kurulum oklari Chain kurar; agir final canli, tasinan ve yeni uretilen Chaini
   yerel Crit carpanina okuyabilir.
3. Kritik Geri Besleme: gercek Crit bonus Chain uretmez; sonraki temaslarin canli Chain katsayisini
   buyutur.
4. Ikili Ritim: canli Chain paritysi yerel Crit sansi ve yerel Crit carpanini donusumlu vuruslara boler.

Apex dagilimi `3 / 4 / 3 / 2 = 12`dir. Bu sayim bilincli olarak kota doldurmaz; her Twistteki
`apexTarget` gercek cocuk sayisiyla eslesir. Crit sansi dogal olarak `%100`de kalir; overflow baska
bir Crit carpanina cevrilmez. Critical yalniz move-localdir, Precision ve global Crit uretmez.

F2S5 kimlikleri:

1. Taze Yara: onceki oklarin biraktigi yara payi ayni serideki sonraki canli-Chain hasarini buyutur.
2. Kanli Rezerv: action-start Chain harcanmadan tek toplam yarayi derinlestirir; yeni Chain paketi
   geriye donuk buyutmez.
3. Yara Hafizasi: action-start Bleed dusuk-Chain hasarina move-local taban verir; gercek veya
   gecikmeli Chain uretmez.
4. Kan Izinde: action-start Bleed ucretli gercek takip oklari acar; direct ve Bleed toplam paketleri
   yeniden bolunur, yeni yara recursive temas acmaz.

Her Twist dort Apex tasir (`4 / 4 / 4 / 4 = 16`). Butun temaslar once canli Chaini okur, sonra
tam `+1 Chain` verir. Tek toplam iki-tick Bleed butun temaslara pozitif bolunur; tickler Crit veya
Chain uretmez. Final temas ortak Quality egrisinden gelen dinamik Base Detonation paketini korur.

F2S6 kimlikleri:

1. Tam Bosaltim: butun action-start Charge bir kez harcanir; tek toplam bonus ok dizisine bolunur.
2. Zincir Atesleme: harcanan Charge final temastan sonra bonus Chain verir; ayni actioni buyutmez.
3. Rezonans: action-start Chain ile harcanan Charge tek snapshotta bonus hasar verir; yeni Chain
   geriye donuk okunmaz.
4. Olculu Atis: her gercek ok en fazla 1 Charge harcar; temas sayisini asan Charge korunur.

Her Twist dort Apex tasir (`4 / 4 / 4 / 4 = 16`). Apexler Charge gucu, dusuk-kaynak guvencesi,
temas/zamanlama ve temiz direct hasar ifadelerini parent motorunu degistirmeden ayirir.

`synthesizeMarkBurstDetonationPath` ismi legacy kalmistir fakat artik form-agnostic calisir:
Specializationin gercek parent Formunu bulur. Bunu tekrar F1 Detonation Formuna sabitleme; aksi halde
F2+ route preview/runtime sessizce `null` olur.

## Siradaki dogru is

F3 `Posture Primary Form`, alti Specialization ve F3S1-S6 aileleri materializedir. F3S6
Posture/Charge `4 Twist / 16 Apex` tasir: Ezici Temper, Gedik Bosalimi, Sakli Gerilim ve
Kirilma Iletkeni. F4 `Critical Primary Form` icin Mark Burste ozgu alti Specialization da
kullanici onayiyla materializedir. Ortak uncapped Detonation motoru eski F1-F4 hareketlerine
retrofit edilmistir; eski F4S1 taslaklari bu yeni kapasite/potency gercegine gore yeniden
degerlendirilmistir. F4S1 ve F4S2 tamamlandi; F4S3 Critical/Posture kullanici onayiyla
`4 Twist / 15 Apex` olarak materialize edildi ve hedefli dogrulama gecti.
F4S4 Critical/Critical da kullanici onayiyla `4 Twist / 16 Apex` olarak implement edildi.
F4S5 Critical/Affliction da kullanici onayiyla `4 Twist / 16 Apex` olarak implement edildi.
F4S6 Critical/Charge `4 Twist / 16 Apex` kullanici onayiyla implement edildi; son hedefli
dogrulama kaydi asagidadir. F4 ailesi kapandi. Mark Burst F5 Affliction Primary ve alti
Specialization da kullanici onayiyla tamamlandi; guncel sonuc dosyanin basindadir.
F5S1-S6 Twist/Apex aileleri tamamlandi. Siradaki konu ucuz F5 capraz-aile balance/kapanis
kontrolu, ardindan Mark Burst F6 Charge Primary tasarimidir; onaydan once implement edilmez.
Kullanicinin son netlestirmesi: genel Crit Damage stati yalniz saf Criticalda acilir; saf
Critical Twist/Apexlerinde Break/Posture kosulu kullanilmaz. Dort Apex ideal hedeftir,
uc standart degildir; dorduncu ancak gercekten dolguysa dusurulur.
Maliyetli `--quick`, `--adjacent` veya browser matrisi kullanici onayi olmadan calistirilmayacak.
AP/Resolve ekonomisi dort skill tamamlanana kadar kapsamli revamp edilmeyecek.

F3 Specialization kimlikleri:

1. Posture/Detonation: tek agir ok; Base `%10` ile Secondary `%30` ayni uncapped Detonation
   motorunu besler, hem Mark basina hasar hem gercek tuketim kapasitesi Quality ile buyur.
2. Posture/Chain: Primary Chain'den daha yavas buyuyen kisa sirali volley; her gercek temas `+1
   Chain` uretir ve mevcut Chaini global canli stack basina `%5` ile okur. Specialization ek
   skill-specific `extraChainBonus` acmaz. Tek toplam direct/Posture paketleri oklara bolunur ve
   yalniz final temas dinamik Base Detonation paketini cozer.
3. Posture/Posture: tek ve guvenilir en yuksek duz Posture darbesi; yalniz bu hareketin actigi
   Break penceresini guclendiren saf `Break Power` statini acar.
4. Posture/Critical: yalniz direct Health hasarinda move-local Crit; Precision yoktur, Posture ve
   Detonation Crit olmaz.
5. Posture/Affliction: paralel tek, mutevazi iki-tick Bleed; henuz Break iliskisi yoktur.
6. Posture/Charge: limitsiz savunma Charge bankasi bir kez direct hasara gider; henuz
   Charge-to-Posture iliskisi yoktur.

F4 Specialization kimlikleri:

1. Critical/Detonation: tek hassas ok; tam Crit/Precision motoru korunur. Base `%10` ile Secondary
   `%30` ayni uncapped Detonation motorunu besler; paket Crit carpaninin disinda kalir.
2. Critical/Chain: Primary Chainden daha yavas buyuyen kisa sirali salvo. Her gercek ok ayri
   Crit atar, kacirma Precisioni sonraki oka tasir, canli Chain okur ve `+1 Chain` uretir.
   Toplam direct paket oklara bolunur; Detonation final temasta bir kez cozulur.
3. Critical/Posture: tek hassas ok ve olculu light-bow Posture. Yalniz direct Health Critlenir;
   Posture ile Detonation henuz Crit iliskisi kurmaz.
4. Critical/Critical: saf rota; Chance, kalici Precision ve move-local Crit Damage buyur.
   Chance/Precision dogal tavandan kalan ucretli guc boşa gitmez, uncapped Crit Damagea akar.
5. Critical/Affliction: tek hassas ok ve mutevazi iki-tick Bleed. Bleed Crit atmaz veya
   Precision uretmez.
6. Critical/Charge: limitsiz best-phase Charge bankasi tek okun direct paketine Critten once
   bir kez eklenir. Charge Primaryden dusuk Secondary donusumu ve `2 Charge` balance referansi
   kullanilir.

F4 karma Specializationlar yeni kartin Attribute paketini `70 Critical / 30 Secondary` dagitir;
saf Critical iki pay da ayni Attributea gittigi icin fiilen `%100 Critical`dir. Mark Burstun
Detonation Base Attribute payi bunun disinda ayrica korunur.

F3S1 kimlikleri:

1. Gerilim Okumasi: action-start hedef Posture orani dinamik ortak Detonation paketini buyutur.
2. Tasan Kirilma: bu ok Break acarsa yalniz kendi native Posture overflowu temassiz Detonation
   halkasina donusur; ilgili Apex gercek ek Mark varsa onu ayrica tuketir.
3. Kirik Hukmu: hedef action-startta Broken ise Detonation infaz bonusu kazanir; ilk Break komutu
   ve gercek ek Mark harcama ayri Apex kararlaridir.
4. Artci Fitil: basarili Mark patlamasi Break acamazsa sonraki gercek Posture kaynagi finite,
   non-contact ve Chainsiz Detonation fitilini tetikler; recursive fitil kuramaz.

Her Twist tek fiziksel agir ok ve tam `+1 Chain` tasir. Dort ayri Bow recipe; pressure reticle,
overflow halka, Broken infaz nisanı ve hedefte kalan fitil runesini mekanikten ayri okunur kilar.

F3S2 kimlikleri:

1. Kirilma Rallisi: bir ok Break acarsa yalniz sonraki gercek oklar bonus Chain alir; Apexler
   breaker temasini veya final-temas teselli odulunu ayri secer.
2. Zirh Yankisi: agir Posture acilisi ve gercek fiziksel echo oklari; Posture acilista toplanir,
   her temas Health hasari, dogal Chain ve global canli `%5` Chain okumasidir.
3. Cifte Tempo: agir Posture ve hizli bonus-Chain vuruslari sirayla gider; Apex finali agir Posture
   veya hizli Chain ritmine kilitleyebilir.
4. Baski Takibi: action-start Posture `%50`de bir gercek takip oku acar; Apex `%35` erken esik,
   `%80`de ikinci ok, final takip Chain katsayisi veya agir takip dagilimi secer. Hareketin kendi
   Postureu ayni actionda yeni ok acamaz.

Butun F3S2 temaslari gercektir, en az iki oktur, dogal `+1 Chain` uretir ve final temas temel bir
Mark patlatir. Toplam direct/Posture paketleri temas sayisiyla cogalmaz. Chain Primary ek ozel
Chain katsayisi satin alirken F3S2 parent yalniz global `%5` kuralini tasir.

F3S3 kimlikleri:

1. Ezici Ok: tek agir temas, en yuksek anlik Posture ve basarili Breakte guclu Break Power.
2. Kirma Serisi: tek toplam Posture paketi sirali gercek oklara bolunur; erken Breakten sonraki
   oklar kurulan Break Power penceresini kullanabilir.
3. Artci Kirik: tek fiziksel ok ve ardindan Health/Chain/Crit/Mark uretmeyen temassiz Posture
   fracture; fracture da Break acabilir.
4. Sakli Baski: ok Break acamazsa finite Posture ve Break Power sonraki gercek pozitif Posture
   kaynagina bir kez tasinir; recursive rezerv kuramaz.

Saf stat `Break Power`, taban Break hasar carpanina eklenir (`x1.50 + paid bonus`). Yalniz bu
hareketin Postureu Break acarsa kurulur; tetikleyen temas geriye donuk yararlanmaz, Break bitince
sifirlanir ve AP/Resolve/Break suresi degismez. Apex sayimi bilincli olarak `3 / 4 / 4 / 3 = 14`tur.

F3S4 kimlikleri:

1. Kritik Delici: tek agir okun yerel Criti direct Health ve immediate Postureu birlikte carpar;
   dinamik Base Detonation paketi Crit disinda kalir.
2. Catlak Merdiveni: dusuk yogunluklu sirali gercek oklar bagimsiz Crit atar; her Crit yalniz
   sonraki gercek oklara ucretli Posture ekler. T2 Quality ile Chain/Critical agacindan daha yavas
   buyur; her temas yine dogal Chain ve global canli `%5` read tasir.
3. Kritik Artci: tek okun direct Criti gecikmeli temassiz Posture fracture kurar. Pulse Break
   acabilir fakat Health/Chain/Crit/Mark uretmez.
4. Gedikten Atis: sabit iki ok; Posture-agir acilis Break acarsa direct-agir final okun yerel Crit
   sansi artar. Full Breach Apexi yalniz ayni actiondaki acilis Break + final Critte finite direct
   paket verir.

F3S4 Precision veya Crit Damage statini acmaz, Crit sanslari move-localdir ve `%100` dogal tavanda
kesilir. T3 bilincli olarak uc Apexte kalir; sayim `4 / 4 / 3 / 4 = 15`tir. Shotgun bu aileye
eklenmedi: cok sayida bagimsiz Crit ve dogal Chain T2yi Chain/Critical alanina tasiyordu.

F3S5 kimlikleri:

1. Gedik Yarasi: Posture once cozulur; yalniz bu ok Break acarsa ardindan uygulanan tek iki-tick
   yara guclenir. Action-start Broken hedef bedava self-Break bonusu vermez.
2. Iz Baskisi: action-start mevcut Bleed bir kez ek Posturea cevrilir; yeni yara ayni oku
   besleyemez ve mevcut yara tuketilmez.
3. Sinsi Kirik: hedef action-startta Broken degilken ok Break acamazsa yeni yaranin ilk tickine
   finite temassiz Posture kurulur. Apex ayni toplam paketi iki ticke bolebilir; Bleed hasari
   Posturedan once cozulur ve geriye donuk Break bonusu almaz.
4. Yara Kopusu: action-start mevcut yara snapshotlanir; bu ok Break acarsa eski yaranin ucretli
   bir kismi aninda yirtilir. Yeni yara rupture hesabina girmez ve eski yara tuketilmez.

Butun F3S5 rotalari tek gercek ok, dogal `+1 Chain`, tek logical wound ve final dinamik Base
Detonation paketi tasir. Bleed tickleri Crit/Chain/Mark uretmez; saf Posture Break Poweri acilmaz.
Sayim `4 / 4 / 4 / 4 = 16`dir ve dort ayri Bow recipe/cue kullanilir.

F3S6 kimlikleri:

1. Ezici Temper: butun banka parent direct hasarina gider; harcanan her Charge ayrica ucretli
   immediate Posture ekler. Charge direct paketi veya tek Mark Detonation azalmaz.
2. Gedik Bosalimi: okun Postureu once cozulur, tam Charge direct paketi sonra gelir. Ok kendi
   Breakini acarsa yalniz Charge paketi yeni pencereye girer; clean direct ve Detonation geriye
   donuk Break bonusu almaz.
3. Sakli Gerilim: banka normal harcanir; hedef action-startta Broken degilken ok Break acamazsa
   harcanan Chargein ucretli bolumu action sonunda geri doner. Iade harcanani asmaz ve ayni
   actionda tekrar kullanilmaz.
4. Kirilma Iletkeni: en az bir Charge harcayan ok kendi Breakini acarsa sonraki savunma fazinin
   ilk Perfect Dodge veya Parrysi bir defalik bonus Charge verir. Iletken stacklenmez, basarisiz
   sonraki savunma fazinin sonunda silinir; Parry odulunu ayiran bir Apex vardir.

Butun F3S6 rotalari tek gercek ok, dogal `+1 Chain`, tek banka harcamasi ve final dinamik Base
Detonation paketi tasir. Charge gameplay cap olmadan calisir: Perfect Dodge `+1`, Parry `+2`; fazlar
toplanmaz, en iyi tek savunma fazi saklanir. Balance referansi `2 Charge`dir. Quality Charge
sayisini degil Charge basina skill ciktisini buyutur. Sayim `4 / 4 / 4 / 4 = 16`dir ve dort ayri
Charge/Posture Bow recipe/cue kullanilir.

F4S1 Critical/Detonation kimlikleri:

1. Muhurlu Nisan: direct Crit, yalniz gercekten patlatilan Mark sayisina gore mevcut Precisionin
   ucretli bir kismini normal resetten sonra korur; yoktan Precision yaratmaz.
2. Kritik Sarapnel: direct Crit, ortak Detonation paketini tuketilen Mark basina sirali boss-side
   darbelere ayirir. Bu darbeler Crit/Chain uretmez; non-Critte paket normal temasta cozulur.
3. Olumcul Hazne: tuketilen Marklar Crit sansini degil, yalniz basarili direct Critin move-local
   carpanini buyutur. Full-cap ve action-start Broken hedef Apexi ayri odeme pencereleridir.
4. Birikmis Basinc: action-start Precision tuketilmeden Mark basi Detonation potencyyi buyutur.
   Crit cashout ve non-Crit sonraki-kullanim echo Apexleri finite ve kaynak-ozeldir.

F4S1 `4 Twist / 12 Apex` olarak kapandi. Dort motor da tek precision oku, parent Critical sansi,
kalici Precision, odenmis olasilik tasmasi ve ortak uncapped Detonation egrisini korur. Genel
Crit Damage stati acilmaz; isimli kosullu Crit bonuslari ayridir. Detonation tum rotalarda
Crit carpaninin disindadir; capacity veya Mark sayisina authored cap eklenmez. Her hesap actual
consumed Mark veya action-start Precision okur. Shrapnel disindaki rotalar tek temas; Shrapnel
yalniz temassiz payload eventleri ekler. Shotgun bilincli olarak ayrildi: Critical/Chain alanina
tasip coklu bagimsiz Critlerle bu ailenin tek-ok kimligini ve balanceini bozuyordu.

F4S2 Critical/Chain kimlikleri:

1. Keskin Akis: her ana ok mevcut Precisioni tuketmeden ucretli Chain katsayisina okur. Iska ile
   ayni salvo icinde kazanilan Precision sonraki oku hem daha guvenilir hem daha guclu yapar.
2. Yuklu Hazne: action-start Chain bir kere snapshotlanir ve yalniz ilk basarili ana Critin
   carpanini buyutur. Ayni actionda uretilen Chain geriye donmez; Chain tuketilmez.
3. Kritik Artci: ana salvo en az bir Crit urettiyse gercek Crit sayisinin besledigi tek fiziksel
   Critsiz ok salvo sonunda gelir. Recursion/Precision/Detonation uretmez; gercek temas olarak
   canli Chain okur ve dogal Chain birakir. Split Apexi ayni toplam paketi iki gercek oka boler.
4. Zincir Kilidi: action-start Chain yalniz acilis ana okunun Crit sansini buyutur. Rolling Apex
   kilidi ilk Crite kadar ilerletir. Patient Apex acilis iskasi ile ekstra Precision verir; dogal
   tavani asan ucretli kisim kaybolmaz, yalniz sonraki okun basarili Crit carpanina gider.

F4S2 `4 Twist / 12 Apex` olarak kapandi. Ana salvo ok sayisi Chain Primaryden daha yavas buyur;
her ana ok bagimsiz Crit, kalici Precision, canli Chain read ve `+1 Chain` tasir. Toplam direct
paket ana oklara bolunur ve ortak Base Detonation yalniz final ana temasta bir kere cozulur. Dort
Twist de Chaini tuketmez. Artci oklar parent Crit zarina girmez ve yeni artci dogurmaz. Dort ayri
Bow recipe/cue kullanilir; hedefli closure auditi parent/Apex mirasini, rarity monotonicligini,
motor alanlarini ve Common kardes guc bandini denetler.

F4S3 Critical/Posture kimlikleri:

1. Keskin Hukum: tek Crit sonucu direct Health ve anlik Postureu carpar. Apexler Derin Hukum,
   Temiz Hukum (Precision gerektirmeyen Crit), Gedik Muhru (kendi Breakinde mevcut Precisioni
   kismen koruma) ve Sabit Hukum (non-Crit Posture telafisi).
2. Kirilma Salvosu: dusuk yogunluklu gercek sirali oklar bagimsiz Crit atar; miss Precisioni
   sonraki oka tasir. Apexler Uzun Salvo, Agir Final, Ilk Gedik ve Telafi Salvosu (onceki
   non-Critler finalde ayri ucretli Posture verir). Temas buyumesi Critical/Chainden dusuktur.
3. Birikmis Darbe: base Posture Critlenmez; basarili Crit pre-reset Precisioni ayri Posture
   cashoutuna okur. Apexler Derin Darbe, Tam Odak, Sakli Basinc ve Gedik Oku.
   Tam Odak, birikmis Precision Crit sansini %100e tamamladiginda calisir; Precisionin tek basina
   1 olmasini beklemez. Sakli Basinc basarisiz cashouttan tek-kullanimlik non-stacking reserve
   kurar. Gedik Oku yalniz cashoutun kendisi Break actiginda tek gercek Critsiz ok verir; base
   Postureun actigi Break, onceden Broken hedef veya sifir-Precision Crit bunu tetiklemez.
4. Kirilma Sacmasi: ortak tek Crit ve tek Precision update; pelletlere bolunen tek toplam
   direct/Posture, tek Chain ve finalde tek Detonation. Apexler Yogun Sacma, Gedik Onceligi
   (Posture once, direct paket sonra) ve Inatci Sacma (non-Crit toplam Posture telafisi).

Apex dagilimi `4 / 4 / 4 / 3`tur. Ilk uc motorda dorduncu kart farkli risk/Break karari verdigi
icin eklendi; shotgun icin dolgu dorduncu kart eklenmedi. Break Power acilmaz, Base Detonation
Critlenmez. Normal packet kendi pelletlerinin actigi Breaki geriye donuk kullanamaz. Gedik
Onceligi yalniz direct pakete bu sirayi acar; Base Detonation action-start Break durumunu korur.
Gedik Oku mevcut Bow projectile altyapisiyla gorunur; +1 dogal Chain disinda Crit/Precision/
Detonation veya recursion uretmez. Dort parent ayri Bow recipe kullanir; cashout icin Precision
birikimini gosteren `BOW_CRIT_POSTURE_CASHOUT` cue/recipe eklendi, Mark nisanı tekrar kullanilmadi.

F4S3 hedefli gelistirme kapisi: `node tools/validate-runtime.cjs KnightRush.html --critical-posture`.
Bu komut boot + yalniz F4S3 current-rank/parent/balance kontrolleri ve deterministik gercek combat
aksiyonlarini bir kez calistirir; exhaustive history veya browser matrisi degildir.

## F4S4 Critical/Critical ve Crit Damage duzeltmesi

Sayim `4 Twist / 16 Apex`, dagilim `4 / 4 / 4 / 4`tur:

1. Keskin Salvo: bagimsiz Critler ve canli Precision. Apexler Agir Kritik, Uzun Salvo,
   Telafi Atisi (ilk normal vurus sonrasi ilk Crit), Donus Nisani (onceki farkli saldiri).
2. Birikmis Hukum: tek agir okun Criti action-start Precisiondan ek hasar kazanir. Apexler
   Derin Odak, Temiz Hukum (Precision gerektirmeyen Crit), Sakli Odak (mevcut Precisioni korur),
   Ara Nisan (farkli saldiridan donuste Precision hasari). Dogal Crit %100se ucretli Precision
   hasari Crit bonusu olarak ifade edilir; sifir-Precision yuzunden olen bir yatirim olmaz.
3. Kritik Seri: ilk ok parenti korur, Critler Quality-paid sonlu ok planini surdurur; ilk normal
   vurus bitirir. Apexler Uzun Seri, Yukselen Kritik, Sert Kapanis ve Kesintisiz Av. Sonuncusu
   tam Crit serisinden hemen sonra ayni rotayi tekrar kullanmayi odullendirir; bonus stacklenmez
   ve araya baska saldiri girerse kaybolur. Erken bitiste Detonation son gercek oka tasinir.
4. Kritik Sacma: tek ortak Crit, tek Precision update, toplam bir Chain ve tek Detonation.
   Apexler Yogun Sacma, Inatci Sacma, Temiz Sacma ve Son Soz (action-start kayip can orani).

Genel `CRIT_POWER` artik Form/karma rotalarda satin alinmaz. `criticalStatQualityProfile`
eski Mark Burst profil paylarini, makbuzlar ve 70/30 dagilimi oncesinde mevcut Chance/Precision
oranina aktarir. Isimli kosullu Crit carpanlari korunur. `critDamageStatUnlocked` saf erisimi,
`synthesisCritAuthoredPower` dogrudan yatirimi, `synthesisCritOverflowPower` odenmis dogal
tasmalari ayirir. Chance %100de durur; tasan guc kaybolmaz. Bu tavanda Precision kabiliyeti
rarity yukseldigi icin sifirlanmaz. Saf Criticalda Break/Posture Apex kosulu yoktur.

T1/T3 temas yogunlugu Critical/Chain komsusundan dusuktur; ozel Chain katsayisi acilmaz.
T1 `BOW_CRIT_VOLLEY`, T2 `BOW_CRIT_WEIGHT`, T3 yeni `BOW_CRIT_CASCADE`, T4 `BOW_CRIT_PACKET`
recipe kullanir. Frame basina yeni tarama veya animasyon dongusu eklenmedi. Gorsel browser
smoke yapilmadi; headless timeline/action kontrolu gorsel kalite onayi degildir.

Hedefli kapi: `node tools/validate-runtime.cjs KnightRush.html --critical-focus --critical-posture`.
Tek bootta F4S4 104 kart (24 Spec + 80 Twist/Apex) / 34 action, F4S3 76 kart / 34 action gecti.
F4S4 Common Twist spreadi `%7.16`, Crit dagilimi duzeltmesi sonrasi F4S3 spreadi `%5.62`dir.
Testler genis rarity-gecmis matrisi degildir; tum oyun balanceinin bitmis oldugunu iddia etmez.

## F4S5 Critical/Affliction

Sayim `4 Twist / 16 Apex`, dagilim `4 / 4 / 4 / 4`tur:

1. Kritik Yara: temel iki tick Bleed + Critte ek yara. Apexler Derin Yara, Temiz Kesik
   (natural Crit), Ilk Kan (baslangicta yara yok), Kalici Iz (daha kucuk non-Crit yarasi).
2. Kanli Salvo: onceki Critler sonraki oklarin yarasini buyutur. Apexler Keskin Ritim,
   Uzun Salvo, Son Kesik (son okun kendi Criti), Kanli Acilis (onceden kanayan hedef).
3. Sakli Sizi: Crit tek bekleyen iz kurar; sonraki saldirinin ilk gercek temasi tuketir.
   Apexler Derin Iz, Devir Teslim (farkli skill), Kritik Acilim (tuketen temas Crit), Garantili Iz.
4. Yara Avcisi: action-start Bleed yalniz direct Crit hasarina okunur, yara harcanmaz.
   Apexler Derin Av, Taze Av (kucuk bos-hedef bonusu), Son Nabiz (yalniz son tick kalmis),
   Takip Atisi (ayni aktorun onceki farkli saldirisi).

Genel Crit Damage/Bleed Power, Break/Posture kancasi veya AP/Resolve degisikligi yoktur.
Base Detonation ortak uncapped motorunu korur ve final gercek temasta bir kez cozulur.
T2 direct/temel Bleed toplamini boler; kontaklar ile onceki-Crit yarasi ayri ucretlidir.
Ok yogunlugu Chain komsusundan dusuktur, ozel Chain katsayisi acilmaz.

Iz `boss.criticalBleedTrace` icinde tek frozen pakettir. Eski iz once tuketilir, yeni iz sonra
kurulur; kendi kendini beslemez. Ayni skill ve Fight tuketebilir ama Devir Teslim bonusu
yalniz farkli skill icindir. Tickler izi tuketmez; yeni karsilasma/Skill Lab preseti temizler.
Avci tum kosullari saldiri basinda snapshotlar; kendi yeni yarasi mevcut bonusuna katilmaz.
`BOW_CRIT_BLEED_WOUND/VOLLEY/TRACE/HUNT` recipe/cuelari ve tek iz HUD isareti eklendi.
Gorsel browser smoke yapilmadi; headless cue kontrolu gorsel kalite onayi degildir.

Hedefli kapi: `node tools/validate-runtime.cjs KnightRush.html --critical-affliction --critical-focus`.
Yeni audit 80 current-rank kart + 4 yuksek-gecmis sentinel ve deterministik combat senaryolari
icerir. Genis rarity-gecmis matrisi, browser, commit veya push bu adimin parcasi degildir.
Sonuc: `--critical-affliction` 84 kart / 43 action ile gecti; `BOOT_RUNTIME_OK`, HTML parse ve
`git diff --check` gecti. Ayni oyun kodunda `--critical-focus` 104 kart / 34 action regresyonu da
gecti. Common Twist spreadi `%0.30`dur; bu referans guc hesabi playtest dengesi onayi degildir.
T2 Common ikinci ok icin toplam butce artmadan Chance payindan temas payina `.05` aktarildi.
Audit runtimein `.001` yuvarlama hassasiyetini dikkate alir; ham katsayi ile yuvarlanmis
Bleedi birebir karsilastirmaz. Tekrar tam matrix calistirma.

## F4S6 Critical/Charge

Sayim `4 Twist / 16 Apex`, her Twist dort Apex:

1. Yuklu Hukum: tek okta harcanan Charge basina toplamsal Crit hasari. Apexler Derin Desarj,
   Temiz Desarj (natural Crit), Donus Atisi (onceki farkli saldiri), Inatci Yuk (kucuk non-Crit bonusu).
2. Arayan Salvo: ilk Critte duran Quality-paid kisa seri. Kalan direct/Charge paketi ve Base
   Detonation son gercek oka tasinir. Apexler Uzun Arayis, Isinan Nisan, Ekonomik Kritik, Son Care.
3. Odak Bataryasi: Charge yerel Crit sansi satin alir; dogal tavana sigmayan ucret toplamsal
   Crit hasari olur. Apexler Derin Odak, Tasan Guc, Sabirli Batarya, Son Nisan (son AP).
4. Kritik Dinamo: Charge harcayan Crit sonraki savunmanin ilk Parry/Dodgeuna tek paket hazirlar.
   Apexler Guclu Dinamo, Parry Dinamosu, Cevik Dinamo, Temiz Akim (natural Crit).

Son Care, son oka KADAR Crit cikmamasini okur; final Crit bonusu iptal etmez. Mevcut Precision
kazanci finali garanti edebildiginden aksi tanim olu kalirdi; kullaniciya uygulama sirasinda bildirildi.
Sabirli Batarya ekstra Precisioni dogal tavana kadar ekler; sigmayan ucret ayni skillin sonraki
Critine tek kullanımlik hasar izi olarak saklanir. Iz stacklenmez, kendi kendini beslemez.
Genel Crit Damage stati acilmaz; Break/Posture veya AP/Resolve degisikligi yoktur.

Charge hasari Charge bazli Crit carpanina tekrar sokulmaz. Odak sansi gercek direct+Charge
paketinin Crit degeriyle fiyatlanir; kalan guc yalniz toplamsal hasardir. Dinamo odulu harcanan
Charge sayisindan degil Qualityden gelir: banka buyudukce kendi odulunu buyuten dongu acilmaz.
Hazirlik tetiklemeden once temizlenir, kullanilmazsa sonraki savunma sonunda silinir. Karsilasma
ve Skill Lab resetleri Dinamo/Precision izini temizler. Dört ozel Bow recipe/cue + Dinamo HUD var.

Kullanicinin ek sartı: ek ok atan Chain disi hareketlerin buyumesi hem Primary hem Secondary
Chainin altinda kalmali. Tamamlanmis Mark Burst Chain disi rotalari ortak `skillSupportArrowMagnitude` kullanir: normal
`.18`, uzun `.25` yogunluk; shotgun uc-sacma baslangicini korur ama ek sacmalari `.25` ile
buyur. F4S3/F4S4 shotgun eskiden Secondary Chainin tam kok egrisini kullaniyordu; bu duzeltildi.
Toplam packet hasari, tek Crit/Precision update ve tek Chain korunur. Uc-sacma baslangici
Commonda Secondary Chainle esit olabilir; ayni buyume egrisinde degildir.

Son kapsam genisletmesi: F1S1 Detonation packet, F1S4 shared-Crit packet, F1S5 Bleed packet,
F3S3 saf Posture sequence ve F3S4 Crit ladder da dusuk ok yogunluguna baglandi. Mark Burst
Chain disi CONTACT_COUNT delivery varsayilani ortak egriyi kullanir. Son global goc ile
Sharpshoot da ayni rol bazli buyume kuralina tasindi (guncel sonuc dosyanin basindadir).
Detonation packet ok sayisi artik Mark kapasitesinden uretilmez. Ayni ok birden fazla Mark
patlatabilir; toplam uncapped kapasite, Mark basina hasar, toplam direct/Posture/Bleed paketleri
korunur. F3S4 uzun merdiven `.48` yerine `.25` yogunluk kullanir. Temassiz shrapnel/fracture
olaylari ok sayilmaz ve yavaslatilmadi. Bu kural gelecekteki sentezde de gecerlidir.
F1S5 Empty Barbs/Full Barb artik toplam tuketilen Marki ok sayisiyla karistirmaz: gercek
`consumedByHit` dagiliminda bos/dolu temaslari sayar. Full Barb icin her okun en az bir Mark
patlatmasi gerekir; toplam kapasitenin tamaminin dolmasi ayrica zorunlu degildir.
Hedefli regresyon: `node tools/validate-runtime.cjs KnightRush.html --arrow-scaling`.
Iki lineage sentinel + degisen motorlarda current-rank kontrolu + az sayida gercek combat;
exhaustive gecmis matrisi veya browser testi degildir.
Sonuc PASS: 64 coklu-ok rota / 203 kart kontrolu / 17 deterministik gercek action; HTML/JS
parse, boot ve diff kontrolu gecti. Tam Legendary gecmisli degisen bes Twist 3 ok; esit Quality
referans Secondary Chain 7, Primary Chain 10 ok. Paketlerin Mark kapasitesi bu ok sayisindan
bagimsizdir (ornegin saf Detonation packet: 3 okta 8 Mark). Commit/push yapilmadi.

Hedefli kapi: `node tools/validate-runtime.cjs KnightRush.html --critical-charge
--critical-posture --critical-focus --critical-affliction` (tek satir olarak).
F4S6 auditi current-rank kartlar + az sayida yuksek-gecmis sentinel, deterministik combat ve
iki Chain rolune esit-Quality/planli-en-uzun-salvo karsilastirmasi yapar. Genis matris degildir.
Guc hesabi erken kapanisin kalan direct/Detonation paketini kayip saymaz; sonlu kapanis
olasiliklarini fiyatlar. Gercek saldiriya bu hesap duzeltmesi nedeniyle ekstra guc eklenmedi.

Son dogrulama: F4S6 `87 kart / 50 action` gecti; Common Twist referans spreadi `%1.02`.
Ayni bootta F4S3 `76/34`, F4S4 `104/34`, F4S5 `84/43` regresyonlari gecti.
HTML parse, `BOOT_RUNTIME_OK` ve `git diff --check` gecti. Browser, exhaustive, commit/push yok.
Esit gecmisle Common Twist ok sayisi `Arayan Salvo 2 < Secondary Chain 3 < Primary Chain 4`;
Common gecmis + Legendary Uzun Arayis Apexi `3 < 5 < 7`. Tum-gecmis-Legendary sentinel de
iki Chain rolunun altinda kaldi. Bu sonuc butun oyun rotalarinin playtest balance onayi degildir.

## Verimli dogrulama politikasi

Gelisim sirasinda en ucuz anlamli kapilar:

1. `node tools/validate-html.cjs KnightRush.html`
2. `node tools/validate-runtime.cjs KnightRush.html --boot-only`
3. Yeni ailenin kod icindeki hedefli closure/structure/design auditleri
4. F2 saf rota dengesi icin `node tools/validate-runtime.cjs KnightRush.html --f2-common-balance`

Her ufak editte tum kombinatoryal veya browser matrisi calistirilmaz. `--quick`, `--adjacent` ve
gercek browser smoke yalniz aile kapanisinda veya ilgili runtime katmani degistiginde kullanilir.
Test bir hata bulursa yalniz somut kirik bolge genisletilerek incelenir; brute force varsayilan
yontem degildir. GitHub push test degildir; yalniz onaylanmis checkpoint yayinidir.

Haftalik credit kullanimi kritik kisittir. Varsayilan implementasyon dongusu yalniz hedefli audit,
HTML parse ve boot kontroludur. `--quick`, `--adjacent`, exhaustive matris veya browser smoke otomatik
calistirilmaz; yalniz gercek yayin/checkpoint riski bunu gerektiriyorsa once kullaniciya maliyeti
soylenir. Uzun bir test yeni aileyi dogrudan kapsamiyorsa sirf eski prosedur yaziyor diye kosulmaz.

## Son dogrulanan checkpoint

- HTML/JS parse: gecti.
- Hedefli boot runtime: `BOOT_RUNTIME_OK`.
- F2S3: 4 Twist, 16 Apex, parent/rank mirasi, temas=Chain ve runtime kimlik auditleri gecti.
- F2S4: 4 Twist, 12 Apex, parent/rank mirasi, temas=Chain, move-local Crit ve runtime kimlik auditleri gecti.
- F2S5: 4 Twist, 16 Apex, tek-yara packet gercegi, parent/rank mirasi, temas=Chain, recursion
  korumalari ve runtime kimlik auditleri gecti.
- F2S5 icin verimli politika geregi yalniz parse ve boot calistirildi; ikisi de gecti.
- F2S6: 4 Twist, 16 Apex, finite Charge odemesi, parent/rank mirasi, temas=Chain, snapshot ve
  surplus-koruma runtime kimlik auditleri gecti.
- F2S6 icin verimli politika geregi yalniz parse ve boot calistirildi; ikisi de gecti.
- F2 saf All-Common balance: `6 Spec / 24 Twist / 92 Apex` gecti. Spec spread `%1.80`, Twist aile
  ortalamasi `%6.74`, Apex aile ortalamasi `%11.05`, tum Twistler `%16.82`, tum Apexler `%29.26`.
- Balance duzeltmesi: Critical feedback sonraki temas firsat sayisiyla fiyatlandi; Pursuit Apexteki
  budget disi bedava takip oku kaldirildi. Kimlikler degismedi.
- F3 Form ve alti Specialization materializedir. Posture/Chain kisa multi-hit ile temas basina Chain
  uretir, global canli stack basina `%5` Chain hasarini kullanir fakat ek skill-specific katsayi
  tasimaz ve Primary Chain'den daha yavas buyur. Diger bes rota tek temastir; saf Posture
  kardeslerinin en guclu duz Posture darbesidir.
- F3 mixed Specialization allocator'i zorunlu Base Detonation ve authored direct payindan sonra
  kalan relationship walletini `%70 Posture Primary / %30 Secondary` hedefine gore boler. Delivery
  Quality kendi `effectOwner`ina yazilir; Posture-owned Weight artik Secondary payini sulandiramaz.
  Receipt-level boot auditi gercek Primary/Secondary payini bagimsiz yeniden sayar.
- F3S1 Posture/Detonation `4 Twist / 16 Apex` tamamlandi. Base=`DETONATION`, Primary=`POSTURE`,
  Secondary=`DETONATION` receipt ayrimi; parent/Apex mirasi, tek fiziksel temas, animasyon cue ve
  All-Common kardes balance hedefli boot auditinde gecti.
- F3S2 Posture/Chain `4 Twist / 16 Apex` tamamlandi. Tum rotalar multi-contact, final dinamik Base Detonation,
  global canli `%5` Chain read ve tek toplam direct/Posture paketini korur. Break rally, fiziksel
  echo, ikili tempo ve action-start pursuit; parent/Apex mirasi, recursion korumasi, animasyon cue
  ve All-Common kardes balance hedefli boot auditinde gecti.
- F3S3 Posture/Posture `4 Twist / 14 Apex` tamamlandi. Saf rota Commonda tekrar en yuksek duz
  Posture kardesidir ve Break Power statini acar. Crusher/Sequence/Fracture/Reserve kimlikleri,
  parent/Apex mirasi, temassiz fracture, tek-kullanim reserve, aktif Break state temizligi,
  animasyon cue ve All-Common balance hedefli boot auditinde gecti.
- F3S4 Posture/Critical `4 Twist / 15 Apex` tamamlandi. Move-local ve Precision-free Crit,
  Posture/Crit/Detonation sinirlari, T2 dusuk yogunluklu Quality buyumesi, gecikmeli temassiz
  aftershock, iki-ok Break-to-Crit breach, parent/Apex mirasi ve dort ayri animasyon cue hedefli
  boot auditinde gecti. T2 Common ve Legendaryde Chain/Critical komsusundan daha az ok tasir.
- F3S5 Posture/Affliction `4 Twist / 16 Apex` tamamlandi. Posture-once-yara-sonra sirasi,
  action-start wound snapshotlari, self-Break yara bonusu, basarisiz Break tick-Postureu ve eski
  yara ruptureu; tek wound/tek temas/recursion sinirlari, parent/Apex mirasi, dort animasyon cue ve
  All-Common balance hedefli boot auditinde gecti.
- F3S6 Posture/Charge `4 Twist / 16 Apex` tamamlandi. Limitsiz best-phase Charge bankasi
  degistirilmedi; Charge-to-Posture temper, Posture-once Charge-sonra Break bosalimi, basarisiz
  Break iadesi ve tek-kullanim sonraki-savunma iletkeni materialize edildi. Dort rota tek temas,
  tek banka harcamasi, dogal `+1 Chain`, final dinamik Base Detonation paketi ve ayri Bow cue tasir.
- F4 Critical Primarynin alti Specializationi tamamlandi. Critical/Chain dusuk yogunluklu gercek
  salvo, saf Critical overflow-to-Crit-Damage, direct-only Critical/Posture, Critlenmeyen Bleed,
  ortak uncapped Detonation paketi ve pre-Crit limitsiz Charge kurallari materializedir. Her karma rota
  `70/30` kimlik dagitimini, parent Crit/Precision mirasini ve kendine uygun Bow recipeyi korur.
- F4S1 Critical/Detonation `4 Twist / 12 Apex` tamamlandi. Precision seal, Crit-triggered
  Critless/Chainsless shrapnel, consumed-Mark Crit-power magazine ve action-start Precision-to-
  Detonation pressure motorlari; parent/Apex mirasi, rarity monotonicligi, runtime state ve kardes
  balance hedefli boot auditinde gecti. Verimli politika geregi yalniz parse, boot-only ve
  `git diff --check` calistirildi.
- F4S2 Critical/Chain `4 Twist / 12 Apex` tamamlandi. Precision-to-Chain flow, ilk basarili Crit
  haznesi, Crit sayili fiziksel artci ve action-start opener lock motorlari; Crit/Precision sirasi,
  finite non-stacking reserve, Patient Lock overflowu, recursion sinirlari, parent/Apex mirasi,
  rarity monotonicligi, animasyon cue ve kardes balance hedefli boot auditinde gecti.
- F4S3 Critical/Posture `4 Twist / 15 Apex` tamamlandi (`4/4/4/3`). `--critical-posture`
  boot + 76 current-rank kart + 34 deterministik gercek combat senaryosunu gecirdi. Common Twist
  spreadi son Crit Damage duzeltmesinden sonra `%5.62`; parent/rarity mirasi, saf Posture liderligi, Chain komsusundan dusuk T2 temas
  yogunlugu, shared packet tek-update/tek-Chain, native cashout Breaki, non-stacking reserve ve
  Critsiz odul oku sinirlari dogrulandi. HTML/JS parse ve `git diff --check` gecti. Browser veya
  exhaustive history matrisi calistirilmadi. Son checkpoint commit/push yapilmadi.
- F4S6 Critical/Charge `4 Twist / 16 Apex` tamamlandi. 87 kart / 50 action; Common Twist
  spread `%1.02`. Erken salvo kapanisinda paket korunumu, iade, last-AP, Precision overflow,
  tek-kullanim Dinamo, sifir/yuksek Charge ve iki Chain rolunden dusuk ok buyumesi gecti.
  F4S3/S4/S5 regresyonlari ayni bootta gecti. F4 shotgun ek-sacma buyumesi yavaslatildi;
  uc-sacma baslangici ve toplam paket korundu. Hedefli kapilar disinda test veya push yapilmadi.
- F4S5 Critical/Affliction `4 Twist / 16 Apex` tamamlandi. Hedefli 84 kart / 43 action,
  iz tuketimi/recursion, saldiridan-once yara snapshoti, onceki-Crit sirasi, parent/rank ve
  Chain komsusu yogunlugu kontrolleri gecti. Common Twist spreadi `%0.30`; F4S4 regresyonu,
  parse, boot ve diff kontrolu gecti. Dort Bow recipe/cue eklendi; browser/commit/push yapilmadi.
- F4S4 Critical/Critical `4 Twist / 16 Apex` tamamlandi. Saf Crit Damage erisimi, karma
  profillerin ucretli dagilimi, 104 current-rank kart, 34 gercek action, erken cascade final
  Detonationi, shared packet tek-roll/update/Chain, rotation/repeat, natural Crit, finite
  retention ve kayip-can snapshoti hedefli kapida gecti. Common Twist spreadi `%7.16`.
  F4S3 regresyonu ayni bootta gecti. Commit/push veya genis matris yapilmadi.
- F2S4 icin parse, boot, quick ve hedefli gercek browser combat smoke gecti. Uzun `--adjacent`
  matrisi credit maliyeti nedeniyle kullanici talimatiyla durduruldu; yeni Mark Burst F2S4u dogrudan
  kapsamadigi icin varsayilan gelisim kapisi sayilmayacak.
- Genis exhaustive matris bu ara checkpointte bilerek kosulmadi.
