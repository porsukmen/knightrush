# Knight Rush — Posture ve Break Sistemi Tasarım Raporu

## Raporun amacı

Bu rapor Dark Souls/Elden Ring ailesindeki stance-break yaklaşımı, Sekiro'daki
posture düellosu ve Clair Obscur: Expedition 33'teki Break akışını Knight Rush'ın
kısa, kesintisiz mobil yapısıyla karşılaştırır. Aynı zamanda ilk çalışan prototipte
verdiğimiz kararları ve sıradaki denge sorularını kayıt altına alır.

Knight Rush'ın Break sistemi üç işi aynı anda yapmalıdır:

1. Parry ve Perfect Dodge arasında gerçek bir oynanış farkı oluşturmak.
2. Bossun saldırı fazını build'lerin etkileyebildiği bir sisteme dönüştürmek.
3. Gelecekte artifact, shard, silah, status ve karakter special'larının bağlanacağı
   ortak bir combat kaynağı yaratmak.

Sadece ikinci bir HP barı eklemek bu amaçların hiçbirini yeterince karşılamaz.

## Mevcut Knight Rush savaşının durumu

Şu anda boss savaşı temelde şu sırayla ilerliyor:

1. Boss belirli sayıda saldırı yapıyor.
2. Oyuncu lane değiştiriyor, zıplıyor, eğiliyor, parry veya Perfect Dodge yapıyor.
3. Parry ve Perfect Dodge, Knight Rush barını dolduruyor.
4. Dolu bar harcanınca dört vuruşluk Knight Rush çalışıyor.
5. Boss saldırı bütçesi bittiğinde oklar, lance'ler, companion ve diğer hasarlar
   volley fazında çözülüyor.

Bu temel güçlüdür; fakat build'lerin çoğu bossun saldırı fazını değiştiremezse RPG
katmanı yalnızca final hasar sayısını büyütür. Posture/Break'in asıl değeri yeni bir
hasar çarpanı olmak değil, boss fazının akışını build'lere açmaktır.

Knight Rush'ın mevcut rolü:

- Oyuncunun kendi doldurduğu, zamanı kendisinin seçtiği karakter special'ıdır.
- Dört vuruşta hasar ve dört Chain verir.
- Finalde bossu kısa ve okunabilir bir reaction/recovery'ye sokar.
- Güvenilir ve görece sık kullanılabilir.

Bu nedenle Knight Rush doğrudan Posture Break olmamalıdır. Aksi halde yeni Break
sistemi aynı ödülün daha büyük barla tekrarı olur.

## Dark Souls / Elden Ring yaklaşımı

Souls oyunlarının kendi aralarında farkları vardır. Dark Souls'taki poise, her
bossun oyuncuya açıkça gösterilen ortak bir posture barı değildir. Elden Ring'deki
stance sistemi bu karşılaştırma için daha açıklayıcıdır: ağır, sıçrama veya stance
hasarı yüksek saldırılar görünmeyen bir denge değerini kırar; düşman kısa süre
kritik saldırıya açık hale gelir.

Bu modelin güçlü yönleri:

- Ana savaş sistemi hâlâ HP ve pozisyon üzerindedir.
- Break sürekli yaşanan bir olay değil, güçlü bir burst fırsatıdır.
- Farklı silah ve saldırılar farklı stance değerleri taşıyabildiği için build
  çeşitliliğine uygundur.
- Oyuncu tamamen parry yapmak zorunda değildir.
- Break öldürmek yerine hasar fırsatı yarattığı için boss HP'si anlamını korur.

Knight Rush açısından sorunları:

- Gizli bir bar mobil oyunda plansız ve rastgele hissedilebilir.
- Koşu sırasında toplanan artifact ve shard'ların posture etkisini oyuncu okuyamaz.
- Boss saldırıları arasında posture hızla geri kazanırsa, oyuncu oyunun zorunlu
  bekleme anları yüzünden cezalandırılmış olur.
- Sadece ağır silahların posture kırması, parry sisteminin yeni önemini azaltır.

Souls yaklaşımından alınması gereken ana fikir şudur:

> Break bir ölüm koşulu değil, oyuncunun build'iyle ürettiği değerli bir saldırı
> penceresidir.

Gizli bar ve uzun pasif yenilenme Knight Rush'a doğrudan alınmamalıdır.

## Sekiro yaklaşımı

Sekiro'da posture savaşın merkezidir. Saldırmak ve doğru deflect yapmak rakibin
posture'ını doldurur. Baskı kesilirse posture iyileşebilir; rakibin vitality'si
düştükçe posture toparlaması zorlaşır. Posture kırıldığında deathblow fırsatı doğar.

Bu modelin güçlü yönleri:

- Savunma ile saldırı aynı eylemde birleşir; iyi deflect pasif bekleme değildir.
- Oyuncu boss animasyonlarını öğrendikçe savaşı doğrudan hızlandırır.
- Bar görünür olduğu için baskıyı sürdürme kararı okunabilir.
- Kusursuz oyun bossun saldırı hakkını azaltır.
- Parry odaklı combat çok güçlü bir ritim ve ustalık hissi kazanır.

Knight Rush açısından sorunları:

- Birebir kopyalanırsa parry "en doğru", dodge ise ikinci sınıf cevap olur.
- Posture Break bossu öldürürse HP, silah stoku, volley ve build hasarı önemsizleşir.
- Knight Rush barı ile boss posture barı birbirinin aynası haline gelebilir:
  parry yap, iki bar doldur, iki stagger izle.
- Sekiro uzun ve sürekli yakın dövüş baskısı üzerine kuruludur. Knight Rush'ta boss
  saldırı dizileri, lane/posture cevapları ve kısa mobil seanslar vardır.
- Çok hızlı posture yenilenmesi oyuncuyu istemediği mekaniğe, özellikle parry'ye
  zorlayabilir.

Sekiro'dan alınması gereken ana fikir şudur:

> Başarılı savunma boss fazını değiştirebilmeli ve oyuncunun ustalığı savaşı
> kısaltabilmelidir.

Deathblow, zorunlu deflect ve agresyon kesilince hızla sıfırlanan posture sistemi
doğrudan alınmamalıdır.

## Clair Obscur: Expedition 33 yaklaşımı

Expedition 33 de gerçek zamanlı dodge/parry/counter ustalığını sıra tabanlı build
sistemiyle birleştirir. Düşmanların HP'sinin altında görünür bir Break barı vardır.
Hasar ve beceriler bu barı doldurur; bar dolduktan sonra `Can Break` özelliğine
sahip uygun bir beceri kullanmak düşmanı Broken durumuna geçirip bir tur sersemletir.

Buradaki en değerli fikir Break'in iki aşamalı olmasıdır:

1. Oyuncu ve build önce baskıyı biriktirir.
2. Oyuncu bir Break-capable hamle ile bu baskıyı istediği anda nakde çevirir.

Bu ayrım dolu barın önemsiz bir ara vuruşta kendiliğinden harcanmasını önler ve
oyuncuya zamanlama kararı verir. Knight Rush'ın uzun vadeli RPG yapısı için çok
değerlidir: belirli character special'ları, shard dönüşümleri veya artifact'ler
`Can Break` özelliği kazanabilir.

Ancak bunu ilk mobil prototipe birebir almak doğru değildir. Ayrı bir Break tuşu
veya zorunlu Break skill'i, mevcut kesintisiz boss ritmine ek kontrol yükler ve
oyuncuyu istemediği bir yeteneğe kilitleyebilir. İlk sürümde bar eşikte otomatik
kırılır. Daha sonra otomatik Break ile “bar dolu, doğru hamleyi bekle” modelleri
A/B olarak denenebilir. Expedition 33'ten alınacak ana fikir yeni bir tuş değil,
**pressure ile cash-out kararını gerektiğinde ayırabilme imkânıdır**.

## Önerilen hibrit: görünür Stability/Posture, saldırı penceresi olarak Break

Knight Rush için en uygun çözüm Souls'un "burst opening" sonucunu Sekiro'nun
"savunma ile baskı üretme" yöntemiyle birleştirmektir.

Önerilen temel sözleşme:

- Bossun görünür bir Posture barı olur.
- Posture dolunca boss ölmez; `BREAK` durumuna girer.
- Parry temel oyunda en yüksek Posture kaynağıdır.
- Perfect Dodge temel oyunda Posture vermek zorunda değildir; Knight Rush barını
  doldurur ve kendi build ailesini korur.
- Knight Rush bir miktar Posture hasarı verir ama tek başına otomatik Break
  üretmez.
- Artifact ve shard'lar Perfect Dodge, status, companion, ok veya lance gibi
  sistemleri alternatif Posture kaynaklarına dönüştürebilir.
- Break, Knight Rush reaction'ından belirgin şekilde uzun ve güçlüdür.
- Break bossu öldürmez; ileride hasar ekonomisi ve build motorları için fırsat
  açabilir. İlk prototip yalnızca zaman ve görsel okunabilirliği test eder.

Bu ayrım iki temel oynanış yolunu korur:

- Dodge oyuncusu daha güvenli oynar, Knight Rush'ı daha sık üretir.
- Parry oyuncusu daha fazla risk alır, gerçek Break'e daha hızlı ulaşır.

Sonradan gelen build'ler bu sınırları kırabilir. Örneğin Legendary bir artifact,
Perfect Dodge'u güçlü Posture hasarına çevirebilir. Bu, temel kontrol şemasında her
oyuncuyu parry'ye zorlamadan Sekiro benzeri bir build yaratır.

## Knight Rush ile Break arasındaki kesin rol farkı

### Knight Rush

- Oyuncu kaynağıdır.
- Parry ve Perfect Dodge ile dolar.
- Oyuncu hazır olduğunda kullanır.
- Dört vuruş, dört Chain ve doğrudan hasar verir.
- Kısa boss reaction'ı sağlar.
- Karakter kimliğinin parçasıdır.

### Posture Break

- Boss üzerinde biriken baskının sonucudur.
- Kullanım düğmesi yoktur; eşik aşılınca oluşur.
- Build ve oyuncu ustalığı tarafından farklı yollarla üretilebilir.
- Bossun saldırı akışını gerçekten keser.
- Daha uzun bir fırsat penceresi açar.
- Gelecekte erken silah harcama kararının ana sahnesi olabilir.

İki sistem aynı anda tetiklenirse animasyonlar üst üste binmemelidir. Önerilen
teknik/oynamsal sözleşme:

1. Posture eşiği aşıldığında `pendingBreak` işaretlenir.
2. O anda çalışan parry veya Knight Rush reaction'ı temiz şekilde tamamlanır.
3. Normal recovery yerine tür-özel Break animasyonuna geçilir.
4. Break penceresi bittiğinde boss yeni saldırı tell'ine döner.

Knight Rush'ın dördüncü vuruşu posture eşiğini aşarsa mevcut güçlü recoil, Break
animasyonunun başlangıcı olarak kullanılabilir. Böylece boss önce stagger olup sonra
ikinci kez anlamsız şekilde stagger olmaz.

## Posture barı dolmalı mı, azalmalı mı?

İki görsel dil mümkündür:

- Sekiro gibi `Posture` sıfırdan yüze dolar.
- Souls benzeri `Stability` yüzden sıfıra iner.

Knight Rush için dolan bar öneriyorum. Oyuncu zaten dolan Knight Rush barını
okuyor; boss barının da darbelerle yükselmesi mobil ekranda daha doğrudan geri
bildirim verir. İsim daha sonra `POSTURE`, `GUARD`, `STABILITY` veya boss türüne
göre değişebilir. Kod tarafında semantik `postureDamage` olmalıdır.

## Posture yenilenmesi

Sekiro'daki sürekli posture iyileşmesini ilk prototipe koymayı önermiyorum.

Nedenleri:

- Boss savaşları zaten kısa ve bölümlüdür.
- Oyuncu bazı animasyonları mecburen bekler.
- Derin loop'larda uzun combo ve kısa idle pencereleri vardır.
- Posture'un beklerken erimesi doğru oynamayı değil, boss takvimini cezalandırır.
- İlk testte sistemin değerini ve Break sıklığını okumayı zorlaştırır.

İlk prototipte posture boss savaşı boyunca kalıcı olmalıdır. Sonraki testlerde Break
çok garantili veya ritimsiz görünürse şu seçenekler sırayla denenebilir:

1. Birkaç boss saldırısı boyunca hiç baskı gelmezse küçük bir iyileşme.
2. Yalnızca belirli boss recovery animasyonlarında iyileşme.
3. HP düştükçe azalan iyileşme.
4. Posture'un bir bölümünü kalıcı "crack", kalanını geçici baskı yapmak.

Başlangıçta decay eklemek yerine gerekirse posture değerlerini yükseltmek daha
okunabilir ve daha kolay dengelenir.

## İlk prototip için sayı önerisi

Bu değerler karar değil, test edilebilir bir başlangıç paketidir:

- Boss Posture: `100`
- Normal başarılı parry: `18`
- Gelecekte ağır/parry-özel saldırı: `28`
- Perfect Dodge: `0` temel Posture
- Knight Rush: ilk üç vuruş `3 + 3 + 3`, final vuruş `15`; toplam `24`
- İlk Break süresi: `4.0 saniye` normal oyun zamanı
- Break sonunda Posture: `0`
- Aynı boss üzerindeki sonraki Break için gereken değer: ilk testte yine `100`

Bu sayıların ürettiği örnek:

- Dört normal parry `72 Posture` ve dolu Knight Rush verir.
- Knight Rush toplam `24` ekler ve değer `96` olur.
- Oyuncu bir küçük ek Posture kaynağı veya bir sonraki parry ile Break üretir.

Bu özellikle bilinçlidir: Knight Rush her kullanımda otomatik Break değildir ama
parry build'inin motoruyla güçlü sinerji kurar. Yalnızca Perfect Dodge ile Knight
Rush dolduran oyuncu special'ını kullanabilir; fakat gerçek Break için build
desteğine veya parry riskine ihtiyaç duyar.

Alternatif olarak Knight Rush'ın finali `19` yapılıp dört parry + Rush kesin Break
haline getirilebilir. Bence ilk testte otomatik eşleşme yerine `96` daha değerlidir;
artifact ve shard için küçük ama anlamlı bir boşluk bırakır.

## Parry'nin hem Knight Rush hem Posture doldurması fazla güçlü mü?

Bu gerçek bir risk, çünkü başarılı parry şu anda aynı anda hasar/counter, Chain,
interrupt, `30` Knight Rush ve `18` Posture üretir. Perfect Dodge ise temel
Posture üretmeden `20` Knight Rush sağlar. Kâğıt üzerinde parry iki motoru birlikte
çalıştırdığı için uzun vadede tek doğru cevap haline gelebilir.

Mevcut sayılardaki somut akış:

- Dört parry: `72 Posture`, dolu Knight Rush.
- Knight Rush: `24 Posture`; toplam `96`.
- Bir sonraki parry: ilk Break.

Yani oyuncu yaklaşık beş başarılı parry ve bir special ile güvenilir Break üretir.
Bu henüz otomatik “Rush bas, Break al” değildir. Fakat oyuncu dolu Rush'ı saklarsa
altıncı parry doğrudan Break üretebilir ve Rush Break sonrasına hazır kalabilir.
Bu, hem uzun Break hem hazır special verdiği için en kuvvetli döngüdür.

İlk prototipte dolum hissini daha önce beğendiğimiz için `30/20` değerlerini
değiştirmiyoruz. Önce çift barın gerçek oyunda ne kadar hızlı büyüdüğünü izlemeliyiz.
Gerekirse ilk ve en temiz denge hamlesi parry'nin Knight Rush katkısını `30`dan
`20`ye indirmektir. Böylece parry hâlâ tek başına en iyi Posture cevabıdır ama
Perfect Dodge ile aynı special temposuna gelir. Kaynağa göre gizli posture
çarpanları gibi karmaşık çözümler ilk tercih olmamalıdır.

## Break ne kadar güçlü olmalı?

İlk çalışan sürümde `4.0 saniye` özellikle uzun tutulmuştur. Bu süre animasyonları,
barı ve olası gelecek aksiyonlarını rahat gözlemlememizi sağlar; nihai denge değeri
olarak kabul edilmemelidir. Mobil combat temposunda dört saniye çok güçlü bir
ödüldür. Silah, artifact trigger veya ekstra hasar eklediğimizde `1.5–2.5 saniye`
bandına dönmek ya da süreyi build'lerle uzatmak gerekebilir.

Break uzun vadede en az iki sonuç üretmelidir:

1. Boss saldırı akışını kesmek.
2. Build'in saldırı ekonomisine değer katmak.

Fakat ilk prototipte aynı anda posture, manuel silah, erken/geç silah dengesi ve
artifact motoru kurmak hatanın kaynağını belirsizleştirir. Bu nedenle iki aşama
öneriyorum.

### Break prototip A — combat hissi

- Posture barı.
- Parry ve Knight Rush posture hasarı.
- `pendingBreak`.
- Tür-özel Break state/animasyon başlangıcı.
- 4.0 saniyelik açık pencere.
- Bossun mevcut saldırısı kesilir.
- Bir sonraki saldırı token'ı korunur; Break yalnızca zamanı öne alır.
- Break sırasında silah kullanımı ve posture kazanımı kapalıdır.
- Oyuncunun final volley sistemi henüz değişmez.
- Debug ekranı posture kaynağını ve Break sayısını gösterir.

Bu prototip yalnızca "Break kazanmak eğlenceli mi, ne sıklıkta olmalı, Knight Rush
ile karışıyor mu?" sorularını cevaplar.

### Break prototip B — silah kararı

Combat hissi kabul edilirse Break sırasında silah kullanımı eklenir. Burada ham tap
hızını ödüllendiren spam sistemi önermiyorum. Mobil erişilebilirlik ve FPS farkları
yüzünden Break'in sabit bir `action budget`ı olmalıdır.

Örnek:

- Break üç aksiyon yuvası açar.
- Her uygun input en fazla bir yuva tüketir.
- İki kullanım arasında kısa, sabit bir contact ritmi vardır.
- Oyuncu ne kadar hızlı dokunursa dokunsun üçten fazla silah fırlatamaz.
- Artifact'ler aksiyon sayısını, silah türünü veya Break sonucunu değiştirebilir.

Hangi silahın nasıl seçileceği ayrı karardır. Otomatik öncelik basit ama stratejiyi
azaltır; iki ayrı düğme mobil ekranı kalabalıklaştırır. Boss Break sırasında normal
parry tap'inin "quick weapon", swipe/hold'un "heavy lance" olması test edilebilir,
çünkü boss saldırmadığı için input çatışması oluşmaz.

## Erken silah kullanma ile sona saklama nasıl anlam kazanabilir?

Aynı silah her iki zamanda aynı hasarı verirse erken kullanmanın tek faydası bossu
erken öldürmektir. Mevcut savaş ölümü volley sonuna ertelediği için bu fayda bile
tam oluşmaz. Bu nedenle zamanlama farklı sonuç vermelidir.

Önerilen ayrım:

### Break sırasında erken kullanım

- Artifact/status motorlarını savaş bitmeden çalıştırır.
- Bossun kalan saldırı bütçisini azaltabilir.
- Posture sonrası `Exposed` bonusundan yararlanabilir.
- Companion veya status zincirini erken başlatabilir.
- Güvenlik ve tempo kazandırır.

### Final volley için saklama

- Birikmiş Chain'in tamamından yararlanır.
- Overkill ve score çarpanlarına daha uygundur.
- Execute/volley artifact'leriyle daha yüksek ham hasar üretebilir.
- Oyuncu Break üretemese bile güvenilir ana çıkış olmaya devam eder.

Bu sayede "erken her zaman doğru" veya "saklamak her zaman doğru" olmaz. Build ve
mevcut boss durumu kararı değiştirir.

Silahların Chain ekleyip eklememesi bu sistemden sonra kararlaştırılmalıdır. İlk
önerim, silahların doğrudan Chain üretmemesi; mevcut Chain'den faydalanmasıdır.
Chain'i savunma ustalığı ve special vuruşları üretir, silahlar harcanabilir saldırı
kaynağı olarak onu kullanır. Artifact'ler bu kuralı kırabilir.

## Build ailelerine etkisi

İyi bir Posture sistemi her build'i aynı bara farklı renkte hasar verir hale
getirmemelidir. Farklı build'ler Break ile farklı ilişki kurmalıdır:

- **Parry build:** doğrudan yüksek Posture, daha riskli pencere, daha sık Break.
- **Perfect Dodge build:** daha sık Knight Rush; artifact ile dodge'u Posture'a
  çevirebilir veya Break'i tamamen önemsemeyip special motoru kurabilir.
- **Volley build:** Break'i silah harcamak yerine final Execute bonusu için
  kullanabilir.
- **Status build:** poison/burn tick'leri Posture recovery'yi kilitleyebilir veya
  Break sırasında patlayabilir.
- **Companion build:** follower belirli aralıkla posture baskısı veya Break aksiyonu
  üretebilir.
- **Guard/tank build:** darbe almamak yerine guard harcayıp düşük Posture karşılığı
  saldırı ritmini koruyabilir.
- **Mobility build:** near-miss veya lane değişimi geçici posture fırsatı yaratabilir.

Legendary artifact'ler kural dönüştürmelidir. Örnek fikirler:

- Perfect Dodge artık `12 Posture` verir ama Knight Rush dolumu yarıya iner.
- Break silah penceresi açmaz; tüm kalan Posture dev bir final volley çarpanına
  dönüşür.
- Posture hiç sıfırlanmaz, fakat her Break sonrası boss daha hızlı saldırır.
- Lance Break sırasında harcanmaz; ancak sonraki Break eşiğini yükseltir.

Bu fikirlerin amacı içerik kararı vermek değil, Posture event mimarisinin gelecekte
hangi dönüşümleri taşıması gerektiğini göstermektir.

## Boss çeşitliliği ve direnç

Bosslar Posture'a bağışık olmamalıdır. Bağışıklık, bir build ailesini tamamen
geçersiz kılar. Bunun yerine boss tanımları yumuşak profiller taşıyabilir:

- `postureMax`
- `breakDuration`
- `postureTakenMultiplier`
- `breakReactionId`
- `breakActionBudget`
- `postureRecoveryProfile`

Örnek olarak ağır Turtle daha yüksek posture değerine ama daha uzun Break süresine,
çok başlı Hydra daha hızlı posture baskısına ama daha kısa Break süresine sahip
olabilir. Toplam değer farklı olsa bile oyuncunun yatırımı boşa gitmemelidir.

Endless scaling posture'u HP kadar hızlı büyütmemelidir. Aksi halde geç oyunda
Break build'leri sessizce yok olur. Zorluk daha çok boss kombinasyonları,
modifier'lar ve kaynak kararlarından gelmelidir.

## UI ve okunabilirlik

Mobil ekranda aynı anda boss HP, Posture, Chain ve Knight Rush gösterilecektir.
Hepsini eşit büyüklükte sunmak ekranı boğar.

Öneri:

- HP ana boss barı olarak kalır.
- Posture HP'nin hemen altında daha ince ikinci çizgi olur.
- Yalnızca posture değiştiğinde kısa süre parlaklaşır.
- Break'e yaklaştıkça ses ve boss üzerinde çatlak/denge efekti artar.
- Knight Rush oyuncu tarafında, ekranın altındaki mevcut yerde kalır.
- Sayısal yüzde normal oyuncuya gösterilmez; debug modunda görünür.

Posture değişimi yalnız bar animasyonu olmamalıdır. Her posture hit'inde bossun
anatomisi, ses tonu ve parçacık gücü kaynağın büyüklüğünü hissettirmelidir.

## Teknik mimari önerisi

İlk implementasyon mevcut hot loop'a dağılmış `if (artifact)` kontrolleri
eklememelidir. Ortak sonuç nesnesi kullanılmalıdır:

```text
applyPosture({
  source: 'parry' | 'knight_rush' | 'weapon' | 'status' | 'companion',
  amount,
  actor,
  tags,
  contact
})
```

Boss runtime durumu en az şunları taşımalıdır:

```text
posture
postureMax
pendingBreak
breakCount
breakState
```

Gelecekteki artifact event'leri kaynağı değiştirebilmeli, ancak boss state'ini
doğrudan farklı yerlerden yazmamalıdır. `applyPosture` tek eşik ve Break kuyruğu
sahibi olmalıdır.

Break bir animation override değil, EncounterActor içinde gerçek bir state
olmalıdır. Hazard'lar temizlenmeli, attack budget kararı tek yerde uygulanmalı ve
renderer tür-özel Break pose'unu definition üzerinden seçmelidir.

## Ölçülmesi gereken debug verileri

İlk testlerde oyuncu sayısı az olacağı için sistem kendi telemetrisini üretmelidir:

- Boss başına toplam posture kaynağı.
- Kaynağa göre posture: parry, Knight Rush, weapon, status, companion.
- İlk Break'e kadar geçen boss saldırısı.
- Boss başına Break sayısı.
- Break sırasında kullanılan aksiyon sayısı.
- Break'in azalttığı boss saldırıları.
- Erken ve final volley silah hasarı.
- Break'e çok yaklaşarak biten savaşlar.
- Oyuncunun ölüm anındaki posture yüzdesi.

Bu veriler gerçek oyuncu testi yerine geçmez; fakat "Break hiç oluşmuyor" ile
"oyuncu sürekli yüzde 95'te kalıyor" arasındaki farkı görünür yapar.

## Riskler

### İkinci HP barına dönüşme

Her hasar kaynağı aynı oranda posture verirse bar yalnızca yeniden doldurulan başka
bir HP olur. Çözüm, kaynakların posture ile farklı ilişki kurmasıdır.

### Parry'nin zorunlu hale gelmesi

Break çok güçlü ve yalnız parry ile mümkün olursa oyuncu istemediği mekaniğe
sıkışır. Çözüm, temel oyunda parry'yi en hızlı yol yapmak fakat build'lerle
alternatifler açmaktır.

### Knight Rush ile aynı ödül

İki sistem de yalnız bossu kısa süre durdurursa ayrım kaybolur. İlk prototipte
farkı uzun tür-özel Broken pozu yaratır. Sonraki aşamada Break, silah aksiyonları
veya build trigger'larıyla ekonomik değer kazanmalıdır; fakat bossun bir sonraki
saldırı token'ını kendiliğinden silmesi gerekmez.

### Sonsuz stun kilidi

Break sırasında posture yeniden kazanılırsa güçlü build bossu hiç oynatmayabilir.
İlk kural: Break sırasında posture kazanımı ya kapalı olmalı ya da sonraki bar için
ayrı bir bankaya çok düşük oranda gitmelidir. Legendary bir build daha sonra bu
kuralı bilinçli olarak kırabilir.

### Boss animasyonlarının ucuzlaması

Break her iki saldırıda bir olursa emek verilen boss combo'ları görülmez. İlk
Break'in genellikle boss saldırı dizisinin ortası veya son üçte birinde oluşması
hedeflenmelidir.

### Fazla sistem ve bar

Posture, Knight Rush, Chain, HP, ok, lance ve artifact trigger'ları aynı anda
oyuncuyu yorabilir. UI hiyerarşisi ve ilk loop öğretimi şarttır.

## Karara bağlanan ilk prototip sözleşmesi

- Break öldürmez.
- Posture görünür ve sıfırdan yüze dolar.
- Normal parry şimdilik `18` posture verir.
- Perfect Dodge temel posture vermez; Knight Rush doldurur.
- Knight Rush toplam `24` posture verir.
- Posture decay yoktur.
- Break'e yol açan mevcut reaction/atak kesilir; sonraki saldırı token'ı silinmez.
- Break `4.0 saniye` sürer.
- Break sırasında silah kullanılmaz ve yeni posture birikmez.
- Dört saniye sonunda Posture sıfırlanır, kısa recovery sonrası boss saldırı
  sırasına kaldığı yerden devam eder.
- Bossun ayrılmamış saldırı bütçesi `0` olduğunda Knight Rush kullanılamaz. Daha
  önce kuyruğa alınmış bir kullanım son saldırı bitiminde geçersiz kalır; oyuncu
  volley fazının önüne ücretsiz bir special/Break sıkıştıramaz.
- Parry eşiği aşarsa ağır stagger-parry reaction'ı; Knight Rush eşiği aşarsa son
  vuruş recoil'i tamamlanır ve oradan tür-özel Broken pozuna bağlanır.
- Bear başı aşağıda çöker/oturur; yavaş nefesle kafası hafif yükselip alçalırken
  gevşek çenesi görünür biçimde açılıp kapanır. Hydra kısılmış gözlerle orta
  başını öne, yan başlarını kendi ayaklarının önünde doğrudan zemine bırakır.
  Hydra kalkarken baş açıları aynı recovery eğrisiyle yeniden doğrulur. Turtle
  kısılmış gözlerle kafasını aşağı ve yana yuvarlar; uzayan boyun sert bir dirsek
  yerine gevşek ip eğrisiyle yerdeki kafayı takip eder.
- Hissiyat kabul edilince üç aksiyonluk silah penceresi eklenir.

Bu paket Sekiro kadar parry merkezli değildir, Souls kadar gizli değildir ve Knight
Rush'ın mevcut special/volley yapısını yok etmez. En önemlisi, artifact sistemi
kurulduğunda çok sayıda gerçek mekanik dönüşüme alan bırakır.

## Sonuç

Knight Rush'ın geleceği için en doğru Break sistemi doğrudan Dark Souls veya Sekiro
kopyası değildir.

- Souls'tan: Break'in ölüm değil değerli bir saldırı fırsatı olması.
- Sekiro'dan: doğru savunmanın boss fazını kısaltması ve görünür baskı üretmesi.
- Expedition 33'ten: baskı biriktirme ile Break'i nakde çevirme anının ileride
  ayrıştırılabilmesi.
- Knight Rush'tan: kesintisiz mobil tempo, karakter special'ı, Chain, biriktirilen
  silahlar ve her run farklı çalışan build motorları.

Posture sistemi bu üç kimliği birbirine bağlayabilirse RPG katmanının ilk gerçek
omurgası olur. Yanlış kurulursa yalnızca boss HP'sinin altında ikinci bir mor bar
olarak kalır.
