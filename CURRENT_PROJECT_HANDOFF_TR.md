# Knight Rush — Yeni Chat Handoff

Guncel durum: 2026-08-25. Bu dosya sohbet gecmisinin yerine gecen kisa durum belgesidir.
Yeni bir AI once bu dosyayi, sonra asagidaki zorunlu belgeleri okumadan skill tasarlamamali.

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
- Bir ailede varsayilan hedef `4 Twist x 4 Apex`tir. Twistler ve Apexler yalniz sayisal varyant
  olamaz; farkli oyuncu karari ve sinerji kancasi tasimalidir.
- Kod verimli olmali. Skill verisi factory/registry ile uretilir; rarity veya kart basina kopya
  runtime bloklari yazilmaz. Sistematik hata skill-id istisnasi ile saklanmaz.

## Degismez combat ve sentez kurallari

- Her weapon skill bir Base Attribute, her route bir Primary ve Secondary Attribute tasir.
- Mark Burst skillinin Base Attribute'u `DETONATION`dir: Stable hareketler Mark uretmez ve en az
  bir gercek Mark patlatma davranisini korur. Su an temel patlatma `1 Mark x 10 damage`dir.
- Chain kalici momentumdur. Kartlar Chaini tuketemez, azaltamaz, sifirlayamaz veya baska kaynaga
  cevirirken silemez. Yalniz phase reseti ve gercek darbe alma combo kuralidir.
- Her gorunen mekanik temas tam `+1 Chain` uretir. Primary Chain hareketi her rarityde en az iki
  gercek temas tasir; daha yuksek mevcut rarity daha fazla temas verir. Toplam Quality ile temas,
  Weight ve diger uygun delivery parametreleri keyfi cap olmadan buyuyebilir.
- Primary Chain icin `SINGLE` yasaktir. Agir ok gerekiyorsa hafif kurulum oklari + agir final
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
Chain scaling ve son gercek temasta korunan temel tek-Mark Detonation tasir.

Tamamlanan aileler:

- `F2S1 Chain/Detonation`: 4 Twist / 16 Apex tamamlandi.
- `F2S2 Chain/Chain`: 4 Twist / 16 Apex tamamlandi. Canli sekans, setup+agir final,
  machine-gun sekansi ve fiziksel echo kimlikleri vardir.
- `F2S3 Chain/Posture`: 4 Twist / 16 Apex tamamlandi.

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

`synthesizeMarkBurstDetonationPath` ismi legacy kalmistir fakat artik form-agnostic calisir:
Specializationin gercek parent Formunu bulur. Bunu tekrar F1 Detonation Formuna sabitleme; aksi halde
F2+ route preview/runtime sessizce `null` olur.

## Siradaki dogru is

Sonraki aile `F2S4 Chain/Critical`dir. Once yalniz genel Specialization kimligi ve 4 Twist tasarimi
konusulmali; kullanici onayi olmadan implementationa gecilmemeli. Tasarimda su sinirlar korunmali:

- Primary Chain her rotada gercek multi-contact Chain motoru olarak kalir.
- Critical Secondary, Chain/Critical kimligini Critical/Chain rotasinin kopyasina cevirmemeli.
- Delivery mekanige gore secilir; her Twist'e zorla farkli delivery veya tek agir ok konmaz.
- Mark Burst Base Detonation final temasta kaybolmaz.
- Twistler onaylaninca 4 Apexleri yuzeysel olmayan Apex Design V2 ile tasarlanir.

F2 sonrasinda sirayla `F2S5 Chain/Affliction`, `F2S6 Chain/Charge` ve F2 genel closure/balance
kapisi gelir. AP/Resolve ekonomisi dort skill tamamlanana kadar kapsamli revamp edilmeyecek.

## Verimli dogrulama politikasi

Gelisim sirasinda en ucuz anlamli kapilar:

1. `node tools/validate-html.cjs KnightRush.html`
2. `node tools/validate-runtime.cjs KnightRush.html --boot-only`
3. Yeni ailenin kod icindeki hedefli closure/structure/design auditleri

Her ufak editte tum kombinatoryal veya browser matrisi calistirilmaz. `--quick`, `--adjacent` ve
gercek browser smoke yalniz aile kapanisinda veya ilgili runtime katmani degistiginde kullanilir.
Test bir hata bulursa yalniz somut kirik bolge genisletilerek incelenir; brute force varsayilan
yontem degildir. GitHub push test degildir; yalniz onaylanmis checkpoint yayinidir.

## Son dogrulanan checkpoint

- HTML/JS parse: gecti.
- Hedefli boot runtime: `BOOT_RUNTIME_OK`.
- F2S3: 4 Twist, 16 Apex, parent/rank mirasi, temas=Chain ve runtime kimlik auditleri gecti.
- Genis exhaustive matris bu ara checkpointte bilerek kosulmadi.

