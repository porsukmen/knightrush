# Hareket Ailesi Kabul Kalibi

Bu kalip, materialize edilen her yeni Twist veya Apex ailesinde sirasi degistirilmeden uygulanir.
Bir aile ancak butun kapilar gectikten sonra tamamlanmis sayilir.

## Genel checkpoint kontrolu — 2026-08-28

- --quick ve mevcut 20 hedefli F4/F5/F6/global audit tek bootta PASS. Runtime harness artik
  acik --quick ile hedefli bayraklari birlikte calistirir; tek-basina quick guardi degismedi.
- Global Chain: 853 kart / 23 action; destek-ok: 104 rota / 283 kart / 17 action.
- Eski sabit Detonation miktarlari yerine onayli dinamik kapasite/potency ve gercek HP;
  patlama sayisi Mark adedi degil pozitif-payload temaslari; cascade coklu fiziksel Chaini korunur.
- Uc onayli LONG Apexin Quality 15'teki ucretli 3=3 baslangici ayrica raporlanir.
  Quality 16 ve uzerinde iki Chain rolunden yavas buyume kontrolden gecti; oyun tasarimi degismedi.
- Shared packet tek Chain / prepared-Crit per-contact packet her okta Chain ayrimi dogrulandi.
- HTML/JS/audit syntax ve diff temiz. Yerelde --adjacent/exhaustive/browser yapilmadi.
  GitHub yayin workflow'unun mevcut --adjacent kapisi korunmustur; remote sonuc ayrica okunur.

## Son aile kontrolu: F6S6 Charge / Charge (2026-08-28)

- 4 Twist / 16 Apex; ortak factory, frozen chargeFocus, dort Bow recipe/cue.
- --charge-focus: 101 current-rank/high-parent kart / 81 gercek action / 75 faz PASS.
- Native direct/hazirlik/banka/Detonation parent-rank ilerlemesi; %10 Base / saf %100 kimlik;
  iliski+temas+guvence butcesi bagimsiz sayimla korunur. Genel Charge carpani/ucuncu attribute yok.
- Eski banka Prepare'da ayrilir; eski+yeni bir kez harcanir. 0/1/120/240 Charge ve aradaki
  Secondary saldirisinin rezervi calamamasi; bedelsiz manuel ve otomatik Release.
- T1 eski/yeni banka ve guvence; 1 Charge kazanmak sifir-banka guvencesinden daha zayif degil.
- T2 ilk-ok hazirlik / banka dagilimi, final dinamik Detonation; temas basina Chain ve 100
  Chain'de gercek HP. Ek Salim iki Chain rolunden yavas, tum-gecmis-Legendary sentinel dahil.
- T3 Parry/Dodge, ilk-basari, gercek hasardan sonra yeniden seri; invulnerability korunur;
  120 basarida katsayi dogrusal, banka veya seriyle ikinci carpan yok.
- T4 tek frozen devir; normal saldiri/basarisiz Prepare tuketmez; ayni-route / farkli-skill /
  ayni-skill-baska-route ayrimi, Sharpshoot alici, sifir-bankada kendini beslememe ve reset.
- Dort ayri core; komsu benzerligi .80. Common referans fark %0.84; Apex referans butceleri esit.
- --charge-specs 36 kart / 44 action / 43 faz; --charge-chain 100 kart / 121 action / 77 faz PASS.
- Combat sonrasi idle-bow gorsel eklemesi izole gercek-function testiyle dogrulandi: artan
  enerji/devir/reset/olum ve Parry/counter/sword onceligi. Combat kapi gereksiz tekrarlanmadi.
- HTML/audit/harness parse ve diff temiz. Browser/playtest/genis matris/commit/push yok;
  referans guc esitligi gercek DPS veya exhaustive-history sertifikasi degildir.

## Onceki aile kontrolu: F6S5 Charge / Affliction (2026-08-28)

- 4 Twist / 16 Apex; ortak factory, frozen chargeAffliction ve dort Bow recipe/cue.
- --charge-affliction: 100 current-rank/high-parent kart / 86 gercek action / 79 faz PASS.
- Parent/rank direct, garanti hazirlik, native Bleed, dinamik Base Detonation ve iliski gucu;
  Base %10 / kimlik 70-30; iki Chain rolunden yavas ucretli temas plani.
- T1 eski snapshot / gercek tick / son tick / onceki farkli skill / yeni savunma yarasi ayrimi;
  gercek Break tick hasari ve kaynak yara bittikten sonra korunan hazirlik kaydi.
- T2 on ok yarasi, agir finalin tek hazirligi; clean/early Apex kosullari; yarayla final katkisini
  birlikte fiyatlama; 100 Chain'de gercek HP ile native paketin ve bonusun kopyalanmamasi.
- T3 yalniz READY yeni yarasi, tek/iki gercek saldiri, onceki eski yara ve yara uretmeyen hamle,
  farkli skill, basarisiz/otomatik hamle izolasyonu ve dogrudan Release guvencesi.
- T4 iki native tick, hazirlik var/yok, ayni/farkli Charge skill, ilk tick bonusu, guvence;
  sifir banka/Mark/Chain uretimi ve bonus hasarinin T1'i yeniden beslememesi; reset temiz.
- --charge-specs 36 kart / 44 action / 43 faz ve --affliction-charge 80 kart / 57 action / 60 faz PASS.
- Dort ayri core; komsu benzerligi .7714. Common referans farki %1.67, Apex referans butceleri esit.
  Gercek DPS/playtest veya tum history kombinasyonlarinin sertifikasi degildir.
- HTML/audit/harness parse ve diff temiz; genis matris/browser/commit/push yok.

## Onceki aile kontrolu: F6S4 Charge / Critical (2026-08-28)

- 4 Twist / 16 Apex; ortak factory, frozen chargeCritical, dort Bow recipe/cue.
- --charge-critical son gecis: 100 current-rank/high-parent kart / 83 action / 78 faz PASS.
  Gercek HP/cift-hasar, saturasyon, savunma Breaki+artci+hazir Release birlesimi dahil.
- Parent/rank direct, garanti hazirlik, Crit sansi ve Base Detonation gerilemez; %10 Base / 70-30.
- T1 bagimsiz-Crit packet; ortak action-start Chain snapshoti; tek toplam hazirlik;
  ayri ucretli katkida ikinci Crit veya Chain carpani yok.
- T2 hazirliktan Crit sansina gercek yatirim; Prepare'da sonuc kaydi yok. %100 ve global-Crit
  tasmasi garanti hazirliga doner; genel Crit Damage statina veya Precisiona degil.
- T3 normal sonuc telafisi, eksik-can snapshoti ve ayni-route onceki normal sonuc. Baska gercek
  saldiri tekrar kosulunu bozar. Butun bonuslar birlikte Crit avantajini gecmez; fazla pay garantiye.
  Telafi ikinci Chain terimi almaz; 8/100 Chain gercek HP kontrolu Critin ustunlugunu korur.
- T4 kaynak Crit -> sonraki gercek savunma bitisi -> temiz ucretsiz destek. Global/Lab force
  Crit dahil destekte Crit yok; hazirlik/Detonation/recursive bilet yok. Her ok gercek bir Chain.
- Kaynak+destek ortak dusuk yogunluklu temas plani; otomatik destek ilk oyuncu hamlesini calmaz.
- Actor/route/faz gecmisi ve pending paketler resetlenir; preview, temas ve animasyon baglantisi.
- --charge-specs 36 kart / 44 action / 43 faz ve --critical-charge 87 kart / 50 action PASS.
- Dort ayri core; komsu benzerligi .8. Common referans butceleri esit, en yuksek Apex fark %0.35.
  Bunlar gercek DPS/playtest esitligi veya tum history kombinasyonlarinin sertifikasi degildir.
- HTML/audit/harness parse ve diff temiz; genis matris/browser/commit/push yok.

## Onceki aile kontrolu: F6S3 Charge / Posture (2026-08-28)

- 4 Twist / 16 Apex, ortak factory/compiler ve 4 ayri Bow recipe/cue.
- --charge-posture: 100 current-rank/high-parent kart / 76 gercek action / 63 faz senaryosu PASS.
- Parent/rank native hasar, hazirlik, Posture ve dinamik Base Detonation; %10 Base / 70-30;
  destek-ok buyumesi, sifir banka ve saf-stat acilmamasi, preview/temas/animasyon kontrolu.
- Gercek on-ok Breaki -> final; zaten Broken guvencesi; onceki farkli skillin gercek Postureu.
- Prepare sonrasi dis Break / self-Release Break ayrimi, Parry / baska skill ayrimi,
  Breakin ilk ve sonraki saldirilari; sifir Breakte Guvenli Pusu ek Postureu.
- Gercek uygulanmis Posture aktarimi, overflow haric; sonraki saldiri sonunda tek kullanim,
  ayni/farkli skill ve ayni/sonraki faz, basarisiz komut/Prepare bileti korur.
- Artci native Postureu eksiltmez; erken savunma acilisi / gec gercek boss move bitisi.
  Gec etki cozulmemis hazard/Parry-grace sonucunu bekler, ilk saldiriyi silemez.
  Artcinin actigi Break kalan diziyi keser; Mark/Chain ve recursive bilet uretimi yok; reset temiz.
- --charge-specs ve --charge-chain komsu regresyonlari PASS. Common referans fark %1.67,
  komsu benzerligi .6286; playtest veya tum history kombinasyonlarinin sertifikasi degildir.
- HTML/audit/harness parse ve diff temiz. Genis matris/browser/commit/push yok.

## Onceki aile kontrolu: F6S2 Charge / Chain (2026-08-28)

- Onayli 4 Twist / 16 Apex, 4 ayri core; ortak factory/compiler ve 4 Bow recipe/cue.
- --charge-chain: 100 current-rank/high-parent kart / 121 gercek action / 77 faz PASS.
- Tum kartlarda native parent/rank, tek hazirlik paketi, dinamik son-normal-ok Detonation,
  Base %10 / 70-30, Primary savunma-bankasi ayrimi ve preview kontrol edildi.
- Ana dizi + destek + esik oklari birlikte Primary Chain temas butcesini asmiyor.
- Eslik bir sonraki gercek saldiridan sonra tek kullanim; ayni/farkli skill, ayni/sonraki faz,
  bedelsiz destek, ek Mark/Detonation yok, Prepare bileti tuketmez, auto-Finish korunur.
- READY history 0/1/iki ayni/iki farkli skill; savunma ve kendi Release'i haric.
- 4/3 esik tum kalintilari gercek temasla; ek ok yeni ek ok tetiklemez ve hazirlik kopyalamaz.
  Yuksek-Quality'de imkansiz Kesintisiz Salvo kosulunun payi garanti finalde korunur.
- Komşu --charge-specs ve onceki --charge-detonation regresyonlari PASS.
- Common Twist referans farki %5.07, komsu benzerligi .7429; bunlar playtest/DPS onayi degil.
- HTML/audit/harness parse ve diff temiz. Genis matris/browser/commit/push yok.

## Onceki aile kontrolu: F6S1 Charge / Detonation (2026-08-28)

- Onayli 4 Twist / 16 Apex; ortak factory, dort engine, dort Bow recipe/cue ve Apex Design V2.
- --charge-detonation: 84 current-rank/high-parent kart, 74 gercek action, 61 savunma fazi.
- Prepare snapshoti, sifir/yuksek savunma basarisindan bagimsizlik, ucretsiz Release,
  ilk-temas Detonation / agir final, gercek Mark-source history ve support-vs-Chain buyumesi.
- Takip gercek saldirinin Mark/pulse uygulamalarindan sonra bir kez; sifir-Mark fallback,
  ayni/sonraki faz ayrimi, kendi kendini tetiklememe. Devir rezervasyonu ve sifir-Markta self-feed yok.
- Tum Apexler gercek actionda; parent/rank, Base %10 / 70-30, preview, pozitif temas ve reset.
- Komşu Charge specs regresyonu 36 kart / 44 action / 43 faz PASS. Genis matris/browser/push yok.
- Son takip-kaynak fiyatlamasi sonrasi aile PASS; Common Twist referans farki %1.90,
  en yuksek Common Apex farki %3.30. HTML/audit/harness parse, boot ve diff temiz; playtest degil.

## Son Spec kontrolu: Mark Burst F6 Charge Primary (2026-08-28)

- Alti onayli Spec, ortak factory/compiler; Twist/Apex bu kaydin kapsaminda degildir.
- Hedefli `--charge-specs`: 36 kart, 44 gercek action, 43 savunma fazi.
- Prepare maliyeti ve sifir hasar, sonraki tur bedelsiz Release, Finish Turn auto-release,
  eski bankanin prepare'da izole edilmesi, aradaki Secondary ile cift harcanmamasi, reset,
  sifir/yuksek Charge, local Crit, iki-tick Bleed, dinamik Detonation ve gercek Chain delivery.
- Mark Burst ve Sharpshoot karma/bare Primary: sifir ve 12 basarida ayni garanti hazirlik bonusu;
  banka acilmaz. Uc legacy hazirlik payload'i sifir savunma basarisinda da calisir.
- Pure Charge: garanti Primary bonusu + eski/yeni Charge icin ayni ucretli Secondary oran.
  Fiyat referansi 4, gameplay cap degil. Normal Secondary max-bankalama degismedi.
- Referans rarity spreadleri %4.43 / %8.02 / %2.86 / %6.12; playtest sonucu degildir.
- F5 specs ve F5S6 regresyonlari, HTML parse, boot ve diff PASS. Browser/genis matris/push yok.

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
- Her Attribute icin `URETIR / OKUR / HARCAR / COZUM SIRASI`, her Delivery icin temas-grubu
  topolojisi vardir. Ayni gruptaki temaslar ayni snapshoti okur; sonraki grup onceki grubun
  ciktisini gorur. Primary/Secondary motor kendi dogal ciktisini gercekten uretir, sifir kaynakta
  calisir ve Quality ile monoton buyur. Skill id veya agac adresine ozel kaynak istisnasi yasaktir.
- Chain icin `HARCAR = HICBIR ZAMAN`dir. Move Chaini okuyabilir, koruyabilir, uretebilir veya
  Chain katsayisini buyutebilir; Chaini azaltan, sifirlayan, maliyet yapan ya da baska ciktiga
  donustururken silen kart reddedilir. Yalniz faz reseti ve gercek yara ile combo kirilmasi ayridir.
- Ortak matris her motoru `SINGLE`, `SEQUENTIAL`, `SIMULTANEOUS_PACKET` ve `IMPACT_ECHO` ile
  materialize edebilmelidir. Delivery temas/grup sirasi kurar; silaha ozel animasyon recipe'si ayri
  adapterdan gelir ve motor kurallarini degistiremez.
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
- Chain motorunda Delivery turunden bagimsiz olarak her mekanik temas `+1 Chain` uretir. Chain
  ciktisi toplam Quality ile monoton buyur. Tek agir temas gorunmez bicimde birden fazla Chain
  yazamaz; gerekiyorsa Quality ile buyuyen gorunur kurulum temaslari kullanilir.
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
- Primary Chain her rarityde en az iki gercek temas tasir. Toplam Quality temas sayisini uncapped
  buyutur. Weight kimligi `SINGLE` degil; daha yavas buyuyen kurulum oklari ve agir final temasidir.
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

- [x] Tam sayım `4 Twist / 16 Apex`; her Twist tam dört Apex taşır.
- [x] T1 Taze Yara, T2 Kanlı Rezerv, T3 Yara Hafızası ve T4 Kan İzinde kimliğini korur.
- [x] Çoklu delivery'de bütün temaslar pozitif yara payı uygular; payların toplamı tam bir aksiyonluk Bleed paketine eşittir ve direct/Bleed temas sayısıyla çoğalmaz.
- [x] Her gerçek temas canlı Chaini okuyup tam `+1 Chain` üretir; final temas base Detonationı korur. Bleed tickleri Crit veya Chain üretmez.
- [x] T2 yalnız action-start Chaini, T3/T4 yalnız action-start Bleedi okur; bu aksiyonun yeni Chain/yara çıktısı aynı paketi recursive büyütmez.
- [x] Common kardeş güç oranı `1.20`yi aşmaz; bütün Apexler parent/rank ilerlemesi ve ayrı runtime kanıtı taşır.

## F2 komşu aile kabul listesi

- [x] Altı tamamlanmış F2 ailesi saf All-Common karşılaştırmasına eksiksiz eklenmiştir.
- [x] All-Common Spec farkı `%1.80`, Twist aile ortalaması `%6.74`, Apex aile ortalaması `%11.05`tir.
- [ ] Bütün rarity geçmişlerinde tekil maksimum fark `%20`, bütün geçmişlerin toplam aile ortalaması farkı `%10` veya altındadır.
- [x] Farklı attribute çıktıları aynı sayıya zorlanmamış; kendi gerçek kullanım senaryolarında fiyatlanmıştır.
- [ ] `node tools/validate-runtime.cjs KnightRush.html --adjacent` ve `--quick` geçmektedir.

## F2S4 Chain/Critical kabul listesi

- [x] Tam sayım `4 Twist / 12 Apex`; `apexTarget` dağılımı `3/4/3/2` ve gerçek çocuk sayılarıyla eşleşir.
- [x] T1 Yukselen Nisan, T2 Yuklu Final, T3 Kritik Geri Besleme ve T4 Ikili Ritim kimliğini korur.
- [x] Her gerçek temas canlı Chaini okuyup tam `+1 Chain` üretir; final temas base Detonationı korur.
- [x] Critical move-local kalır; global Crit/Precision sızdırmaz. Gerçek Crit bonus Chain üretmez,
  yalnız T3te sonraki temasın Chain katsayısını büyütür.
- [x] Crit yalnız direkt temas hasarını çarpar; Detonationı çarpmaz. İhtimal `%100`de doğal olarak
  sınırlandığında overflow gizli çarpana dönüşmez.
- [x] Common kardeş güç oranı `1.20`yi aşmaz; her Apex parent/rank ilerlemesi, karar ayrımı ve runtime kanıtı taşır.

## F2S6 Chain/Charge kabul listesi

- [x] Tam sayım `4 Twist / 16 Apex`; her Twist tam dört Apex taşır.
- [x] T1 Tam Boşaltım, T2 Zincir Ateşleme, T3 Rezonans ve T4 Ölçülü Atış kimliğini korur.
- [x] Bir Charge noktası bir kez harcanır; multihit bankayı çoğaltmaz ve temas fazlası Charge korunur.
- [x] Charge→Chain final temastan sonra çalışır; aynı saldırıyı geriye dönük prime etmez. Rezonans yalnız action-start Chain snapshotını okur.
- [x] Dört rota mekaniklerine uygun ayrı animasyon recipe'si kullanır ve Apexler parent recipe ailesini korur.
- [x] Common kardeş güç oranı `1.20`yi aşmaz; bütün Apexler parent/rank ilerlemesi ve ayrı runtime kanıtı taşır.

## F2 tam kapanış kabul listesi

- [x] Sayım `1 Form / 6 Specialization / 24 Twist / 92 Apex` ve materialize `apexTarget` toplamıdır; route/ranked-card
  toplamı gerçek Apex sayısından türetilir, eski `96 Apex / 127 route / 508 card` kotası zorlanmaz.
- [x] Her Specialization varsayılan dört ayrışan Twist taşır. Her Twist için ideal hedef dört Apextir;
  yalnız dördüncü/üçüncü kart dolgu olacaksa `apexTarget` üçe veya ikiye düşürülür. Her Twist gerçek runtime command üretir.
- [x] Altı F2 ailesi aynı saf All-Common güç kapısında test edilir; eksik aile sessizce matristen düşmez.
- [x] Chain/Crit guardrail hesabı action-start Chaini Crit ihtimali ve çarpanına aktarır.
- [ ] `--quick`, `--adjacent`, browser smoke ve console error kontrolü geçmeden aile tamamlanmış sayılmaz.

## Base Attribute kabul listesi

- [ ] Weapon skill için merkezi Base Attribute contract kayıtlıdır; başka silahın base outputu kopyalanmamıştır.
- [ ] Her Stable katman yalnız kendi yeni paketinin merkezi Base payını öder; geçmiş güç ikinci kez vergilenmez.
- [ ] Sharpshoot rotalarında normalize `MARK_GAIN` payı en az `%10`dur ve bu pay ücretsiz değildir.
- [ ] Otomatik göç Base payını eklerken mevcut Primary/Secondary mekanik profile değerlerini azaltmamıştır.
- [ ] Base reserve receipt üzerinde saklanır, kaybolmaz ve authored gameplay cap taşımaz.
- [ ] Base, Primary, direct parent ve rarity çıktıları gerilemez; bütün komşu aile testleri yeniden geçer.

## Mark Burst F3 Specialization kabul listesi

- [x] Altı route gerçek runtime command üretir: Posture/Detonation, Posture/Chain,
  Posture/Posture, Posture/Critical, Posture/Affliction ve Posture/Charge.
- [x] Bütün rotalar Posture Primary, temel `1 Mark x 10 Detonation` ve görünür temas başına tam
  `+1 Chain` taşır; hiçbir rota Mark üretmez.
- [x] Posture/Chain kısa `SEQUENTIAL` multihittir. Temas sayısı Chain Primary'den daha yavaş büyür,
  toplam direct/Posture bedava çoğalmaz. Her ok global canlı stack başına `%5` Chain hasarını
  kullanır; skill-specific `extraChainBonus = 0` kalır.
- [x] Diğer beş rota tek gerçek temastır. Detonation ek tüketim açmadan tek-Mark patlamasını
  güçlendirir; saf Posture kardeşlerinin en yüksek düz Posture çıktısına sahiptir.
- [x] Critical yalnız direct Health hasarını etkiler ve Precision üretmez. Affliction tek mütevazı
  iki-tick Bleed, Charge tek finite direct-damage banka tüketimidir; Twistten önce çapraz ilişki yoktur.
- [x] Ucuz All-Common kimlik kapısı parent mirasını, animasyonu ve kardeş spreadinin `%15` altında
  kalmasını doğrular. Tam rarity/Twist/Apex matrisleri aile kapanışına kadar çalıştırılmaz.

## Mark Burst F3S1 Posture/Detonation kabul listesi

- [x] Sayım `4 Twist / 16 Apex`; bütün yollar Base Detonation, Posture Primary ve Detonation
  Secondary receiptlerini ayrı ve ücretli taşır.
- [x] Gerilim Okuması action-start Postureu, Taşan Kırılma yalnız native overflowu, Kırık Hükmü
  action-start Break penceresini, Artçı Fitil ise başarısız Breakten sonraki gerçek Postureu okur.
- [x] Her hareket tek fiziksel ok ve `+1 Chain`dir. Overflow halkası ve fitil patlaması temassızdır;
  Health contact, Crit veya Chain olayı üretemez.
- [x] Ek Mark Apexleri yalnız gerçekten bulunan Markı tüketir. Fitil finite, tek-kullanımlık ve
  recursive değildir.
- [x] Dört ayrı Bow recipe mekanik zamanlamayı gösterir; sahte ok veya sahte temas çizmez.
- [x] Ucuz boot audit’i structure, Base receipt, parent/Apex mirası, kimlik ve All-Common kardeş
  balance sınırını doğrular.

## Mark Burst F3S2 Posture/Chain kabul listesi

- [x] Sayım `4 Twist / 16 Apex`; Kırılma Rallisi, Zırh Yankısı, Çifte Tempo ve Baskı Takibi
  Posture→Chain yönünde dört ayrı ilişki kurar ve komşu Chain/Posture ailesini kopyalamaz.
- [x] Her route en az iki gerçek temas, temas başına doğal `+1 Chain`, global canlı stack başına
  `%5` Chain read ve final temasta temel bir-Mark Detonation taşır. Parentta skill-specific
  `extraChainBonus` yoktur; Chain Primary daha güçlü scaling kimliğini korur.
- [x] Toplam direct/Posture temas sayısıyla çoğalmaz. Echo Postureu açılışa yükler; Tempo ağır ve
  hızlı vuruşları ayırır; Rally bonusu yalnız Breakten sonraki gerçek temaslara gider.
- [x] Pursuit hedef Postureunu yalnız action-startta okur: `%50` bir takip oku, Apex `%35` erken
  eşik ve `%80` ikinci ok sağlar. Hareketin kendi Postureu aynı actionda yeni temas açamaz.
- [x] On altı Apex parent temaslarını, Postureu, directi ve Detonationı geriletmez; her Twist dört
  gerçek karar taşır, kota dolduran sahte Apex yoktur.
- [x] Dört ayrı sabit maliyetli Bow recipe/cue mekanik zamanlamayı gösterir; fiziksel echo ve takip
  okları gerçek projectile/contact olarak çizilir.
- [x] Ucuz closure/boot auditi structure, kimlik, parent/Apex mirası, global `%5` Chain read,
  Pursuit snapshotı ve All-Common kardeş balance sınırını doğrular.

## Mark Burst F3S3 Posture/Posture kabul listesi

- [x] Sayım `4 Twist / 14 Apex`, dağılım `3 / 4 / 4 / 3`tür; Crusher ve Reserve'e kota için
  dördüncü Apex eklenmez.
- [x] Saf rota Common seviyede bütün Posture kardeşlerinden daha yüksek düz Posture taşır ve
  `Break Power` statını açar.
- [x] Break Power yalnız bu hareketin Postureu Break açarsa taban `x1.50` pencereye lineer eklenir;
  tetikleyen temas yararlanmaz, Break sonunda temizlenir, AP/Resolve/süre/kaynak üretmez.
- [x] Ezici Ok tek ağır temas; Kırma Serisi tek toplam Postureu sıralı gerçek temaslara böler;
  Artçı Kırık temassız Posture pulseları; Saklı Baskı başarısızlıkta tek-kullanımlık sonraki-source
  Posture ve Break Power rezervidir.
- [x] Fracture Health, Chain, Crit veya Mark olayı değildir. Reserve tüketilirken temizlenir ve
  kendisini tekrar kuramaz. Sequence okları doğal Chain üretir fakat özel Chain katsayısı açmaz.
- [x] On dört Apex parent direct/Posture/Detonation/Break Power çıktısını geriletmez ve parent
  delivery/timing kimliğini korur.
- [x] Dört ayrı sabit maliyetli Bow recipe/cue ile hedefli closure/boot auditi structure, causality,
  Posture liderliği, Break state temizliği, fracture/reserve sınırı ve Common balanceı doğrular.

## Mark Burst F3S4 Posture/Critical kabul listesi

- [x] Sayım `4 Twist / 15 Apex`, dağılım `4 / 4 / 3 / 4`tür; Kritik Artçıya kota için sahte
  dördüncü Apex eklenmez.
- [x] Bütün Critler move-local ve Precision-free kalır. Crit Damage statı açılmaz, şans `%100`
  doğal tavanda kesilir ve bir-Mark Detonation hiçbir rotada Crit atmaz.
- [x] Kritik Delici tek okta direct Health ve immediate Postureu aynı yerel Crit ile çarpar.
  Çatlak Merdiveni bağımsız Crit atan gerçek oklarla yalnız sonraki temaslara ücretli Posture ekler.
- [x] T2 ok yoğunluğu Chain/Critical ağacından daha yavaş ölçeklenir ve Common ile Legendaryde
  daha az ok taşır. Yine de authored cap yoktur; her gerçek ok doğal Chain ve global canlı `%5`
  Chain read kullanır, skill-specific katsayı açılmaz.
- [x] Kritik Artçı pulseu temassızdır; Health/Chain/Crit/Mark üretmeden Break açabilir. Gedikten
  Atış sabit iki oktur; yalnız ilk okun açtığı Break final Crit şansını büyütür ve Full Breach
  yalnız Break + final Crit birleşiminde finite direct paket verir.
- [x] Shotgun bilinçli olarak ertelenir; bağımsız pellet Critleri ile temas Chaini bu ailede aynı
  anda büyütülmez. Dört ayrı Bow recipe/cue gerçek temas ve temassız fracture ayrımını korur.
- [x] Ucuz closure/boot auditi structure, kimlik, parent/Apex mirası, Crit sınırları, T2 rarity
  yoğunluğu ve All-Common kardeş balanceını doğrular; geniş matris varsayılan değildir.

## Mark Burst F3S5 Posture/Affliction kabul listesi

- [x] Sayım `4 Twist / 16 Apex`, dağılım `4 / 4 / 4 / 4`tür. Bütün rotalar tek gerçek ok,
  doğal `+1 Chain`, tek logical iki-tick wound ve final bir-Mark Detonation taşır.
- [x] Posture yeni yaradan önce çözülür. Gedik Yarası yalnız bu okun açtığı Breakte yeni yarayı
  güçlendirir; action-start Broken hedef veya dış Break self-Break bonusu vermez.
- [x] İz Baskısı ve Yara Kopuşu yalnız action-start Bleedi snapshotlar. Yeni uygulanan yara aynı
  saldırının Posture veya rupture hesabına giremez; mevcut yara tüketilmez.
- [x] Sinsi Kırık yalnız başarısız self-Breakte tick-Posture kurar. İlk-tick ve iki-ticke bölme
  aynı toplam paketi korur; tickte Bleed hasarı Posturedan önce çözülür.
- [x] Yara Kopuşu için hem mevcut action-start yara hem bu okun açtığı Break gerekir. Rupture
  standart wound Break çarpanıyla fiyatlanır; Crit/Chain/Mark üretmez ve recursive değildir.
- [x] Mixed rota saf Posture Break Powerını açmaz. Multi-hit/shotgun, özel Chain katsayısı, ikinci
  logical yara veya tick-fed kaynak yoktur. Dört Bow recipe/cue durumları ayrı gösterir.
- [x] Ucuz closure/boot auditi 4/16 structure, kimlik, parent/Apex mirası, tek-temas/tek-wound
  sınırı, delayed paket eşliği ve All-Common kardeş balanceını doğrular.

## Mark Burst F4S3 Critical/Posture kabul listesi

- [x] Dört Twist, açık `4/4/4/3` Apex hedefi ve 15 Apex Design V2 kaydı bulunur.
- [x] Tek verdict, düşük yoğunluklu bağımsız salvo, Precision cashoutu ve ortak-roll shotgun
  ayrı motorlardır; Critical Primary ile dinamik Base Detonation korunur.
- [x] T2 Chain komşusundan yavaş büyür; packet tek Chain/roll/update taşır. Break Power açılmaz.
- [x] Cashout pre-reset Precisionı okur. Full Focus Precisionla garantilenen Criti, reserve yalnız
  başarısız cashoutu, ödül oku yalnız cashoutun kendisinin açtığı Breaki kabul eder.
- [x] Reserve finite ve non-stackingdir; ödül oku Crit/Precision/Detonation/recursion üretmez.
- [x] Dört ayrı Bow recipe, cashouta özel Precision cue ve ödül okunun gerçek projectile çizimi bağlıdır; görsel smoke henüz
  yapılmamıştır. Headless doğrulama görsel kalite onayı sayılmaz.
- [x] `--critical-posture` 76 rarity kartı ve 34 deterministik gerçek action ile parent/rank,
  saf Posture liderliği, sibling balance ve combat edge-case kontrollerini geçti. Common Twist
  spreadi son Crit Damage dağılımı düzeltmesinden sonra `%5.62`; geniş/brute-force matris çalıştırılmadı.

## Mark Burst F4S6 Critical/Charge kabul listesi

- [x] `4 Twist / 16 Apex`, Apex Design V2; her Twistte plan değiştiren Apex mevcut.
- [x] Critical/Precision, tek banka ödemesi, parent/rank ve uncapped final Base Detonation korunur.
  Genel Crit Damage, Posture/Break veya AP/Resolve kancası eklenmez.
- [x] Arayan Salvo ilk Critte biter; kalan direct/Charge/Detonation son gerçek oka gider.
  Sıfır Charge tek tam ok verir; gizli ok/RNG/Chain veya kayıp paket yoktur.
- [x] İade harcanan Chargeı aşmaz. Son Çare final oka kadar Crit gelmemesini okur;
  final Crit bonusu silmez. Natural Crit ve önceki farklı saldırı koşulları çalışır.
- [x] Odak Bataryası gerçek hasar paketi üzerinden Chance satın alır; yüksek Charge karesel
  çarpan açmaz. Son AP ödeme öncesi okunur. Precision taşması tek kullanımlık, nonstacking izdir.
- [x] Dinamo Quality ödülüdür; harcanan Chargela kendi kendini büyütmez. İlk Parry/Dodge
  başarısında bir kez çalışır; kullanılmayan paket savunma sonunda, bütün state resetlerde silinir.
- [x] Ek ok büyümesi normal/Uzun Arayış için hem Primary hem Secondary Chainin altındadır;
  current-rank, yedi eşit-Quality curve sentineli ve yüksek-geçmiş karşılaştırması geçti.
  F4S3/S4 shotgun üçlü başlangıç ve tek-paket hasarını koruyarak daha yavaş saçma büyümesi kullanır.
- [x] F4S6 `87 kart / 50 action`, Common Twist spread `%1.02`. Aynı bootta F4S3 `76/34`,
  F4S4 `104/34`, F4S5 `84/43` regresyonları geçti. Parse/boot/diff temiz.
- [x] Dört Bow recipe/cue ve Dinamo HUD başsız animasyon kontrolünden geçti.
- [ ] Gerçek görsel browser smoke / playtest; maliyet politikası gereği bu adımda yapılmadı.

## Mark Burst F4S5 Critical/Affliction kabul listesi

- [x] `4 Twist / 16 Apex`, Apex Design V2; her Twistte en az bir plan değiştiren Apex.
- [x] Genel Crit Damage/Bleed Power veya Break/Posture kancası yok; ortak final Detonation korunur.
- [x] Kritik Yara natural/ilk-kan koşulları ve daha küçük non-Crit yara davranışı doğrulandı.
- [x] Kanlı Salvo Common'da en az iki ok atar; Chain komşusundan daha az yoğun büyür.
  Temel Bleed bölünür, önceki Critler yalnız sonraki yaraları büyütür; final Crit kendi yarasını verir.
- [x] Saklı Sızı sonraki ilk gerçek temasta bir kez tüketilir; tick tüketmez, aynı action kendi
  izini açmaz, tekrar kullanım izi büyüterek beslemez. Farklı skill/Crit tüketici Apexleri çalışır.
- [x] Yara Avcısı başlangıç yarasını tüketmez ve kendi yeni yarasını okuyamaz. Son-tick ve
  önceki-farklı-saldırı snapshotları, boş hedef ve gerçek direct damage katkısı doğrulandı.
- [x] 80 current-rank kart + 4 yüksek-geçmiş sentinel, 43 action; parent/rank ve güç kontrolleri geçti.
  Common Twist referans spreadi `%0.30`; F4S4 104 kart / 34 action regresyonu geçti.
- [x] Dört Bow recipe/cue ve iz HUD işareti headless kontrol edildi. HTML parse, boot, diff temiz.
- [ ] Görsel browser smoke / gerçek playtest (maliyet politikası gereği bu adımda çalıştırılmadı).

## Mark Burst F4S4 Critical/Critical kabul listesi

- [x] Dört Twist ve her birinde dört Apex; genel Crit Damage statı yalnız saf rotada açıktır.
- [x] Karma/Form generic Crit Power payı Chance/Precisiona döner; Base ve 70/30 makbuzları,
  ücretli doğal taşma ve isimli koşullu çarpanlar korunur. Chance %100ü geçmez.
- [x] Bağımsız salvo, Precision hükmü, Crit-cascade ve ortak-roll saçma gerçek aksiyon üretir.
  Yeni Apexlerde Break/Posture koşulu yoktur.
- [x] Cascade ilk oku ve erken bitişte son gerçek temastaki Detonationı korur; görünmeyen
  oklar RNG/Chain üretmez. %100 Crit sonlu Quality-paid planı tamamlar.
- [x] Packet tek roll/Precision update ve toplam tek Chain taşır. Retention mevcut Precisionı
  aşmaz; rotation/repeat aynı aktörün gerçek önceki saldırısını okur; execution action-starttır.
- [x] F4S4 104 current-rank kart / 34 action, F4S3 76 kart / 34 action aynı bootta geçti.
  F4S4 Common Twist spreadi `%7.16`; parent/rank ve Chain komşusu yoğunluk kontrolleri geçti.
- [x] Dört Bow recipe bağlıdır; cascade için ayrı recipe eklendi.
- [ ] Görsel browser smoke: maliyet politikası gereği yapılmadı; headless sonuç görsel onay değildir.

## Legacy Sharpshoot F3 tam kapanış kabul listesi

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
- [x] Critical/Chain Keskin Akis mevcut Precisioni Chain katsayisina; Yuklu Hazne action-start
  Chaini ilk basarili Crit carpanina; Kritik Artci gercek Crit sayisini fiziksel Critsiz finishera;
  Zincir Kilidi action-start Chaini opener Crit sansina okur. Chain tuketilmez ve recursion acilmaz.
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

## F5S1 Affliction/Detonation Twist ve Apex kabul listesi

- [x] Tam sayim `4 Twist / 16 Apex`; hepsi tek fiziksel ok, tek dogal Chain, iki tam Bleed ticki
  ve ortak uncapped Base + Secondary Detonation kapasite/potency motorunu korur.
- [x] Taze Yirtik yalniz yeni yarayi anlik okur ve ticklerini eksiltmez; Damar Besleme yalniz
  action-start eski yaranin kalan ticklerini guclendirir, sure yenilemez.
- [x] Olgun Fitil bu hareketin ticklerinden sonlu tek-kullanimlik odul hazirlar. Yalniz gercek
  Mark patlamasi tuketir; fitil kendi hasarindan yeni fitil uretemez.
- [x] Sonmeyen Yara sifir-Mark ve ucretli eksik-kapasite telafisi verir; eldeki gercek Marki
  tutmaz, azaltmaz veya authored cap ile sinirlamaz.
- [x] Butun Apexler `Apex Design V2`; kosul calismadiginda direct, native yara ve Detonation
  ilerler. Crit/Precision/Posture/Break/ek temas veya generic Chain scaling sizmaz.
- [x] Dort ayri Bow cue combat gercegindeki tek oku korur; Bleed HUD pending/ready fitili gosterir.
- [x] Hedefli `--affliction-detonation`: 84 kart, 67 real action, 16 kosul, overlap/reset,
  miras, receipt, kimlik ve komsu-agac kapilari PASS; brute-force matris kosulmaz.

## F5S2 Affliction/Chain Twist ve Apex kabul listesi

- [x] Tam sayim `4 Twist / 16 Apex`; hepsi gercek sequential oklar, temas basina tam `+1 Chain`,
  pozitif direct/yara payi ve final temasta ortak dinamik Base Detonation tasir.
- [x] Tek toplam iki-tick yara temaslara bolunur, temas sayisiyla cogalmaz. Baslangic Chaini
  normal hasarda calisir; ayni-action iliskileri yalniz kendilerinden once uretilen Chaini okur.
- [x] Canli Dikis yalniz onceki gercek oklarin yeni Chainini yeni yaraya okur; Hazir Iplik
  baslangic Chainini acikca ve daha dusuk payla opt-in eder.
- [x] Ince Dizi density lideridir fakat destek-ok egrisi Primary Chain'den yavas buyur.
  Uzun Dizi ayni derinlikte yalniz bir ucretli ok ekler; toplam direct/yara kopyalanmaz.
- [x] Kanli Kapanis action-start eski yaradan final Chain alir ve yarayi tuketmez. Ilk Kesik
  butcesinin cogunu normal kosula, kucuk payini sifir-yara sigortasina verir.
- [x] Gec Kadans yalniz action-start Chainini yeni yaranin ikinci tickine okur; self-generated
  Chain geriye donuk okunmaz ve Bleed tickleri Chain uretmez.
- [x] Butun Apexler `Apex Design V2`; Crit/Precision/Posture/Break, yeni kalici kaynak veya
  generic Chain Damage stati sizmaz. Dort Bow recipe gercek combat temaslariyla eslesir.
- [x] Hedefli `--affliction-chain`: 84 kart, 42 real action, 16 Apex kosulu, miras/receipt,
  kimlik, balance, tick ve animasyon kontrolleri PASS; brute-force matris kosulmaz.

## F5S3 Affliction/Posture Twist ve Apex kabul listesi

- [x] Tam sayim `4 Twist / 16 Apex`; native iki-tick yara, light-bow Posture, gercek temas
  basina Chain ve final dinamik Base Detonation korunur. Break Power acilmaz.
- [x] Ilk Catlak yeni yarayi once uygular; yalniz temiz action-start hedefte ek Posture verir.
  Eski Iz guvencesi temiz-hedef odulunden kucuktur.
- [x] Basincli Yaranin tek ucretli paketi self-Breakte ilk, basarisiz Breakte ikinci ticke gider.
  Iki dal ayni paketi kopyalayamaz; delayed yara Chain/Mark/Posture uretmez.
- [x] Dikenli Dizi toplam direct/yara/Postureu pozitif gercek temaslara boler. Onceki yeni-yara
  payi yalniz sonraki Postureu besler; her ok tam `+1 Chain` uretir.
- [x] T3 destek-ok egrisi Primary ve Secondary Chain rollerinden yavas buyur; Long ayni
  derinlikte yalniz bir ucretli ok ekler, Agir Kapanis toplam Postureu cogaltmaz.
- [x] Acik Zirh yalniz action-start Broken durumunu okur ve Breaki tuketmez. Hazirlik Ucu
  Broken olmayan hedefte Posture vererek pencereyi hazirlar.
- [x] Butun Apexler `Apex Design V2`; Crit/Precision/genel Chain scaling, Break Power, yeni
  meter/banka veya gorunmez temas sizmaz. Dort Bow recipe combat temaslariyla eslesir.
- [x] Hedefli `--affliction-posture`: 84 kart, 46 real action, 16 Apex kosulu, miras/receipt,
  kimlik, balance, iki tick, Break ve animasyon kontrolleri PASS; brute-force matris kosulmaz.

## F5S4 Affliction/Critical Twist ve Apex kabul listesi

- [x] Tam sayim `4 Twist / 16 Apex`; native iki-tick yara, direct-only yerel Crit, gercek
  temas basina Chain ve final dinamik Base Detonation korunur.
- [x] Keskin Akis tek ucretli yara paketini Critte ilk, Non-Critte ikinci ticke yollar;
  toplam paket kopyalanmaz. Ani Yirtik yalniz direct Crit dalinda anlik yara verir.
- [x] Kor Zehir Non-Crit sonucunu iki ticke aktarir; temiz hedef ve son AP Apexleri yalniz
  kendi action-start kosullarini okur. Bleed veya Detonation Crit atmaz.
- [x] Sabirli Dizi tek toplam yarayi pozitif gercek oklara boler; onceki Non-Critler yalniz
  sonraki yara payini buyutur ve her ok tam `+1 Chain` uretir.
- [x] T3 destek-ok egrisi `2/2/2/3`, Long `3/3/3/4`; Primary Chain `4/5/6/7`, Secondary
  Chain `4/4/4/5`. Agir Kapanis toplam direct hasari cogaltmadan final payini buyutur.
- [x] Kan Ritmi onceki Crit sonucunu bir kez okur; Crit paketi yaraya, Non-Crit/ilk kullanim
  direct darbeye yonlendirir. Farkli-skill ve ayni-hareket Apexleri yeni token yaratmaz.
- [x] Hicbir rota Precision, genel Crit Damage stati, Critleyen Bleed/Detonation, ekstra Chain
  katsayisi, kalici meter veya gorunmez temas kazanmaz. Dort Bow recipe combatla eslesir.
- [x] Hedefli `--affliction-critical --affliction-specs`: F5S4 84 kart / 21 real action,
  F5 specs 36 kart / 16 action PASS; common spread `%2.24`, maksimum Apex spread `%6.72`,
  komsu benzerligi `.7429`. Brute-force matris kosulmaz.

## Mark Burst F5S5 Affliction/Affliction kabul listesi

- [x] `4 Twist / 16 Apex`, dort signature engine, her Twistte iki farkli plan-degistiren
  Apex sinifi vardir. Saf parentin iki ticki, native yara ve dinamik Base Detonation korunur.
- [x] Yogun Kanama yalniz kendi yeni yarasina Yara Gucu verir. Stat toplam Bleede dahildir;
  ayni Quality ikinci kez iliski gucu sayilmaz. Ilk Kan/ayni-hareket tekrari ve direct Apexleri calisir.
- [x] Yeniden Ac eski kalan iki tick toplamindan tek anlik sonuc uretir; eski tickleri tuketmez
  ve yeni yara ayni okumaya girmez. Son tick, farkli skill ve daha kucuk bos-hedef guvencesi vardir.
- [x] Gec Sizi native ilk ticki azaltmaz; bonus yalniz ikinci ticktedir. Ilk saldiri ve eski
  yaranin son ticki kosullari gercek runtime'da ayrilir; iki savunma tickinde yara sona erer.
- [x] Katmanli Yara tek toplam native paketi gercek oklara boler. Yalniz onceki native paylar
  sonraki bonusu besler; eski yara ve bonuslar kendilerini carpamaz. Fresh/Long/Repeat calisir.
- [x] Ek oklar `2/2/2/3`, Uzun `3/3/3/4`; Primary `4/5/6/7`, Secondary `4/4/4/5` altindadir.
  Sparse yuksek-Quality problari da iki Chain roluyle buyume sirasini korur.
- [x] Dort Bow recipe/cue ve tum 20 Common route gercek aksiyonla denetlendi. Temassiz
  yirtilma/tickler Crit, Mark veya Chain uretmez. Her gercek ok tam bir dogal Chain verir.
- [x] Hedefli test 84 kart / 43 action PASS; Common Twist farki `%2.24`, en yuksek Apex
  farki `%1.54`. Diger Form/Spec/Twist/Apex raritylerinin kartezyen carpimi calistirilmadi.
- [x] Son `--affliction-focus --affliction-critical --affliction-specs` PASS. Ayni bootta
  F5S4 84 kart / 21 action ve F5 specs 36 kart / 16 action regresyonlari gecti. Yuksek eski-yara,
  gercek ard arda saldiri ve faz/Lab attack-history resetleri dogrulandi. Parse/diff temiz.
- [ ] Gorsel browser smoke / playtest. Headless cue cizimi gorsel kalite onayi degildir.

Alternatif: tum saf Twistlere ayni global Bleed carpani eklemek elendi; kimlikleri tekrarlar
ve eski/yeni yarayi iki kez buyutme riski tasir. T1 native guc, T2 eski yara, T3 gecikme,
T4 ayni-action native pay okumasiyla ayrilir; yeni meter veya artifact bagimliligi gerekmez.

## Mark Burst F5S6 Affliction/Charge kabul listesi

- [x] `4 Twist / 15 Apex`, dagilim `4/4/3/4`; ucuncu Twiste dolgu dorduncu kart eklenmedi.
  Her Twist iki farkli plan-degistiren karar sinifi tasir. Son AP kosulu yoktur.
- [x] Parent Charge impact, tek banka odemesi, native iki tick, tek dogal Chain ve dinamik
  Base Detonation korunur. Her katmanda Base %10 ve karma 70/30 receiptleri dogrulandi.
- [x] Yuklu Yara linear Chargedan ek yara alir; Bos Hazne ve son tamamlanmis hasarsiz savunma
  kosullari calisir. Gercek hasar kusursuzlugu bozar, invulnerability ile yok sayilan temas bozmaz.
- [x] Guard iki fazda gercek defense gaini okur, bankayi tuketmez; Parry ve ilk saldiri
  Apexleri ayridir. Iade/bonus Charge kendiliginden defense eventi veya yeni yara tetigi degildir.
- [x] Devour `max(banka, faz kazanci)`ni tek kez harcar; finalize tuketileni geri getirmez.
  Overlapte ucretli oranlar toplanir, ayni Chargein firsat degeri tekrar odenmez. Iki tickte biter.
- [x] Return ilk tickten sonra ve normal bankalamadan sonra tek iade verir; toplam harcanani
  asmaz. Kullanilamayan ucretli pay yaraya gider; sifir Charge tekrar kendi iadesini kuramaz.
- [x] Dort Bow recipe/cue ve Charge HUD metinleri headless olarak cizildi. Delayed hasar
  projectile, Crit, Chain veya Mark uretmez. State reset/expiry ve yuksek kaynak problari gecti.
- [x] `--affliction-charge --affliction-focus --affliction-specs` PASS: F5S6 80 kart / 57 action /
  60 savunma fazi; F5S5 84 kart / 45 action; specs 36 kart / 16 action. Common net referans
  butceleri esit; gercek DPS/banka degeri senaryoya gore degisir. Parse/diff temiz.
- [x] F5S5 T1A3 Son Atis yerine Ust Uste Kesik guncellendi. Ayni onceki skill/route yeni yarayi
  guclendirir; son AP tek basina bonus vermez. Eski route ID ve parent/rank korunur.
- [ ] Gercek gorsel browser smoke / playtest; genis test matrisi kullanilmadi.

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
