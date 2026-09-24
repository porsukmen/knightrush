# Knight Rush — Keskin Düzlem

Kısa ad: **KR-KD**. İngilizce karşılığı: **Sharp Plane**.

## Güncel yön — 24 Eylül 2026

Tek bir oyunun iki detay ölçeği: knight, boss ve minibossların keskin, karemsi,
kompakt ana kütleleri; onaylı merchant ve yenilenen Disco King'in anlamlı yüz,
kıyafet ve eşya detayları. Hedef bu ikisinin ortasıdır. NPC yakın planı daha
detaylı olabilir, fakat uzaktan bakınca aynı oyunun sade ve güçlü silüetine döner.
Detay eklemek ana kütleyi küçük üçgenlerle parçalamak değildir. Stil adını veya
onaylı karakterleri bu dengeyi kurmak bahanesiyle değiştirme.

Yeni çalışma giriş noktası: [Art skill](tools/skills/knight-rush-art/SKILL.md).
Karşılaştırma: `ArtTest.html` veya `KnightRush.html?artlab=1`.
Kontrol ve kabul: [Art üretim sözleşmesi](art-source/knight-rush-sharp-plane/ART_WORKFLOW.md).
Lab teknik kontrol yapar; estetik onay vermez.

## Cutscene ve event arka planları

**Knight Rush Cutscene** için `tools/skills/knight-rush-cutscene/SKILL.md`
kullanılır. 24 Eylül 2026'da onaylanan net mantar dayı arka planı ve sahne
ışığıyla karakterli görünüm, `art-source/knight-rush-backgrounds/cutscene-references.js`
içinde ayrı referanstır. Bu onay eski soru işareti arka planlarını kapsamaz.
Her sahne orman olmak zorunda değildir; kalite, tutarlı perspektif ve ışık ilişkisi
taşınır, aynı ev/renk/dekorlar kopyalanmaz. Blender gerektiğinde kullanılır.
Sabit bitmap arka planlar ortak event görsel yöneticisinden alınır; her NPC'nin
kendi resim önbelleğini veya ikinci ekran boyutlu kopyayı tutması gerekmez.

Bu dosya oyuna yeni karakter, eşya veya çevre çizmeden önce okunacak görsel
üretim rehberidir. Kullanıcının onayladığı merchant ve item çizimlerini temel
alır. Karakterin mesleği, kıyafeti ve sahnesi değişebilir; aşağıdaki biçim dili
değişmemelidir. Menü yerleşimi, yazılar ve ekonomi ayrı konulardır.

## Sabit karakter standardı — net karar

**Oyunun karakter ve eşya çizim dili Knight Rush — Keskin Düzlem'dir.** Bu bir
geçici filtre veya yeni bir pixel-art denemesi değildir. Kullanıcının özellikle
onayladığı arabalı wandering merchant, yeni blacksmith ve sabit dükkân esnafının
çizim kalitesi sonraki karakterler için tabandır. Yeni bir karakter çizerken bu
dosya ve aşağıdaki görseller birlikte okunur; yalnızca “köşeli çiz” denilerek
stil yeniden yorumlanmaz.

- Yüz: küçük kare gözler, belirgin kaş/burun düzlemi, anlamlı çene ve saç silüeti.
  Detaylar birkaç net parçayla ifadeyi kurar; çizgi kalabalığı yaratmaz.
- Gövde: mesleğe uygun oran, ayrı omuz–dirsek–el parçaları ve okunaklı eller.
  Merchant'ın dolgun gövdesi ile smith'in iri üçgen gövdesi aynı stilde farklı tiplerdir.
  Blacksmith'in üst kolları da gövdesi ve ön kolları gibi çelik zırhtır;
  eski referans görselindeki kırmızı üst kol kumaşını yeni çizimlerde kullanma.
- Kıyafet: kumaş, deri, kürk, metal ve ten ayrı renk/değer gruplarıyla okunur.
  Yüzeyler hacimlidir; düz Paint şekilleri, yuvarlak pastel maskot veya küçük raster
  büyütülmüş sprite görünümü değildir.
- Canlılık: nefes, küçük baş hareketi, göz kırpma ve nesneye bağlı el hareketi.
  Aynı karakteri sabit bir resim yapıştırarak sahneye koyma.
- Onaylı artı iyileştirme adına başka bir stile çevirme. Yeni kıyafet ve tip tasarlanabilir;
  şekil, gölge, malzeme ve netlik standardı korunur.

**Karakter stili onaylıdır; town'un son yerleşimi, menüler ve metinler ayrı tasarım
konularıdır.** Deneme sahnesinin bütün düzenini karakter stiliyle birlikte zorunlu
referans sayma. `*-before-*` klasörleri yalnızca geri dönüş arşividir.

## Ana referanslar ve öncelik

1. Oyundaki orijinal Jonathan/knight, squire, ayı ve miniboss çizimleri:
   keskin/karemsi kütle, silüet, parça kalınlığı ve uzaktan okunurluk standardı.
2. Onaylanmış merchant ve item örnekleri:
   - [Merchant biçim referansı](art-source/knight-rush-sharp-plane/approved-merchant-style.png)
   - [22 item, tonic ve paket referansı](art-source/knight-rush-sharp-plane/approved-item-style.png)
   - [Onaylı arabalı zengin tüccar ve orman sahnesi](art-source/knight-rush-sharp-plane/approved-wagon-merchant.png)
   - [Yeni blacksmith karakteri](art-source/knight-rush-sharp-plane/blacksmith-character-reference.png)
   - [Sabit dükkân esnafı](art-source/knight-rush-sharp-plane/resident-shopkeeper-reference.png)
   - [Onaylı mantar dayı](art-source/knight-rush-sharp-plane/approved-mushroom-gatherer.png):
     24 Eylül 2026 kullanıcı onayı; karemsi sivil gövde, yüz ve iş kıyafeti referansı.
     İsteyen eli boş, mantarlar sepette. Bu onay karakter içindir; görseldeki eski
     konuşma arka planını yeni çevre standardı yapmaz.
3. Yenilenen Disco King: NPC ifadesi, gösterişli kıyafet ve eklemli hareket için
   onaylı referans. Orijinal orman: çevre standardı. Mekân derinliği için
   onaylanmış orijinal town.

Eski minigame çizimleri placeholder'dır; kalite veya stil referansı değildir.
Yukarıda açıkça onaylanan yenilenmiş Disco King bu kuralın istisnasıdır.
Reddedilen yuvarlak/pastel merchant, kapüşonlu vitrin ve town deneyleri referans
alınmaz. South Park ve Adventure Time yalnızca sade biçim, okunaklı silüet ve
katmanlarla derinlik kurma fikri için yardımcı olabilir. Onların yüz, göz, eğri
kontur veya renk dilini Knight Rush'a taşımak **stil değişikliğidir**.

## Bir cümlelik tanım

**Köşeli ve karemsi, net geometrik şekillerden kurulan; az sayıda geniş ışık/gölge
yüzeyiyle hacim kazanan, doğal çözünürlükte çizilmiş stilize 2D/2.5D ortaçağ
fantazisi.** Sade olmak detaysız olmak değildir; detaylar yapıyı ve malzemeyi açıklar.

## Şekil dili

- Silüeti önce dikdörtgenler, dörtgenler ve az köşeli özel poligonlarla kur.
- Kare eklemler, kesik köşeler, sert kıvrımlar, ince dikdörtgen vurgular kullan.
- Diyagonal yüzeyler yön, kalınlık ve eklem hareketini anlatsın. Her yüzeyi rastgele
  üçgenlere ayırma; kristal/low-poly parçaları gibi görünmesin.
- Baş, omuz, dirsek, el ve gövde ayrı, okunaklı kütlelerdir. Küçük kare gözler ve
  basit burun/yanak yüzeyi yeterlidir. Büyük yuvarlak göz, lastiksi uzuv, yumuşak
  çizgi-film yüzü ve sürekli eğri kontur kullanma.
- Karakterin tipi değişebilir: şişmanlık geniş gövde ve kısa yan düzlemlerle;
  zayıflık ince uzuv ve dar omuzlarla anlatılır. Bir karakteri bütün olarak
  yatay esnetmek tasarım değildir.
- Her silüet köşeli diye her şekil tam bir kare olmak zorunda değildir. Ayı,
  at, kumaş, kalkan ve cam kendi tanınabilir dış hattını korur.

## Işık, renk ve malzeme

- Temel olarak üç değer kullan: ana renk, belirgin gölge, dar aydınlık yüzey.
  Büyük parçalar bir bakışta okunmalı; gerekmedikçe dördüncü ton ekleme.
- Sahne içindeki ışık yönü tutarlı olsun. Gölgeler geniş ve keskin sınırlı;
  kenar ışıkları ince olsun. Hacim için bulanık gradyan veya parlama gerekmez.
- Koyu orman önünde karakter/eşyalar daha aydınlık ve renkli kalır. Bütün
  sahneyi aynı değerde soldurmak da neon renklere boğmak da yanlış.
- Metal: soğuk ana yüzey, koyu yan yüz, dar açık üst kenar. Kumaş: daha mat,
  bir iki anlamlı kıvrım. Ahşap: uzun yapısal parçalar ve az çizgi. Cam:
  köşeli şişe silüeti, koyu yan yüz, açık dar yansıma, ayrı sıvı seviyesi.
- Dikiş, toka, perçin ve yıpranma birkaç doğru yere konur; rastgele nokta
  serpme, her yüzeye doku veya anlamsız süs ekleme.

Başlangıç paletleri; birebir zorunlu değil, aynı değer ilişkisini koru:

| Malzeme | Gölge | Ana yüzey | Işık |
| --- | --- | --- | --- |
| Knight çeliği | `#4b5966` | `#919da7` | `#c4ced5` / `#edf4f7` |
| Turkuaz kumaş | `#1e404e` | `#2d616d` | `#579399` |
| Kırmızı kumaş | `#632b37` | `#8c3b47` | `#c15d60` |
| Pirinç / altın | `#775b3d` | `#b49156` | `#e3c37e` |
| Ahşap / deri | `#372c20` | `#795436` | `#c2965e` |
| Ten | `#966e54` | `#c79f73` | `#e0bb8a` |

## Derinlik ve sahne mantığı

- Gerçek 3D şart değildir. Örtüşme, perspektif, ölçek, temas gölgesi ve yan
  yüzeyler 2D çizime yeterli derinliği verir. Her şeyi tam karşıdan çizme.
- Nesneler bir yere basar, asılır veya bağlanır. Tekerlek aksa; at koşuma;
  sürücü oturağa; fener askıya; tezgâh ayaklara bağlı olmalıdır.
- Önce işlevsel yerleşim çiz: hareket için boşluk, masanın arkasında tüccar,
  arka planda arabası. Sonra az sayıda anlamlı detay ekle.
- Önemli parçaları büyük UI panellerinin veya başka karakterlerin arkasında
  kaybetme. Mobil kadrajda at, araba, NPC ve satış eşyaları ayırt edilebilmeli.
- Arka plan bulunduğumuz biyoma uyabilir. İçerik/yerleşim ile ortam çizimini
  ayrı tut; farklı biyom için tüm sahneyi kopyalayıp bağımsızlaştırma.

## Kod ve animasyon

- `KnightRush.html` içindeki `drawSerJonathanRider`, `drawSquireHelmet25D`,
  `drawSerJonathanShield` ve `drawTreeArt` birincil teknik referanslardır.
- `rigPolygon`, `rigSegment`, `rigJoint`, `px` ve düz canvas poligonlarını
  kullan. Merchant'taki `drawMerchantDisplayItem` onaylı eşya dilini gösterir.
- Küçük raster çizip büyütme, pixelation filtresi, ekranı bulanıklaştırma veya
  sahte düşük çözünürlük kullanma. Karemsilik silüette ve geometride olmalı.
- Kontur gerekiyorsa kontrollü kullan; her parçaya kalın siyah stroke çekme.
- Baş, kol, el ve tutulan nesne aynı eklem zincirine bağlı hareket eder.
  Idle nefesi küçük, baş hareketi yavaş; el alışverişte gerçekten nesneye uzanır.
- Statik çevreyi ekran çözünürlüğünde cache'le; canlı karakterleri ayrı çiz.
  Render sırasında oyun durumu, RNG, stok, fiyat veya ödül değişmez.

## Üretim ve kabul kontrolü

1. Yukarıdaki onaylı karakter/eşya görsellerini ve ilgili oyun renderer'ını aç.
2. Büyük silüeti, nesnelerin işlevini ve ön/arka sırasını çöz.
3. Ana renk/gölge/ışık yüzeylerini kur. Sonra gerekli az detayı ekle.
4. Gerçek oyun ekranında hem mobil hem büyük boyutta render al; yakınlaştırılmış
   tek bir asset görüntüsüne güvenme.
5. Knight ve onaylı itemlarla yan yana bak: yeni parça başka oyundan mı geliyor?
   Yumuşamış mı, fazla üçgenlenmiş mi, soluklaşmış mı, okunurluğu azalmış mı?
6. Animasyonu ve etkileşimi kontrol et. Tip değişikliği stok/ekonomi veya başka
   dükkânların resimlerini değiştirmemeli.
7. Kullanıcının onayladığı kalite tabandır. Stil değiştirmek veya eşya kimliğini
   yeniden yorumlamak için ayrı onay gerekir; istenen içerik değişikliği stili
   değiştirme yetkisi değildir.

## Yeni bir çizim için kısa görev metni

> Knight Rush — Keskin Düzlem (KR-KD) stilinde çiz. Önce bu rehberi, onaylı
> merchant/item görsellerini ve orijinal knight renderer'ını incele. Köşeli,
> karemsi silüetler; geniş düz renk yüzeyleri; iki-üç değerle sert gölgeleme;
> küçük yapısal detaylar kullan. 2D/2.5D derinliği perspektif ve örtüşmeyle kur.
> Yuvarlak pastel çizgi-film, pixelation filtresi, düşük çözünürlüklü büyütme,
> rastgele low-poly üçgenler ve minigame placeholder estetiği kullanma.
> Sahnenin işlevsel mantığını koru, mobilde render alıp orijinal knight ile karşılaştır.
