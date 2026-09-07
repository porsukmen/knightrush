# Knight Rush — Run Revamp ve Görsel Overhaul Planı

Durum: Tasarım ve uygulama planı. Bu belge henüz gameplay implementasyonu değildir.

## 1. Ürün hedefi

Runner bölümü, boss savaşları arasındaki zorunlu bekleme alanı olmaktan çıkmalı ve oyuncunun
boss'a hangi şartlarla ulaşacağını belirlediği kısa, okunaklı bir yolculuğa dönüşmelidir.

Yeni run'ın tek cümlelik vaadi:

> Koş, yaklaşan fırsatları oku, bir rota seç ve boss savaşının şartlarını yolda oluştur.

Üç lane oyunun hareket dili olarak kalır. Yeni sistem lane sayısını veya temel kontrolleri
büyütmek yerine bu dili karar vermek için kullanır.

## 2. Bloat sınırı

İlk sürümde yalnız şu dört sistem oyuna girer:

1. **Route Choice** — oyuncu üç lane üzerinden yaklaşan rota/karşılaşmayı seçer.
2. **Random Event** — kısa, iki veya üç seçenekli olaylar.
3. **Threat** — risk ve ödülü birlikte büyüten tek run baskı değeri.
4. **Blacksmith Stop** — parayla skill upgrade/reroll yapılan kontrollü build noktası.

İlk sürümde yapılmayacaklar:

- Açlık, erzak, kamp, dayanıklılık veya ayrı crafting materyalleri.
- Açık dünya, geri dönüşlü harita ya da serbest dolaşım.
- Lane başına farklı combat sistemi.
- Çok sayıda geçici para birimi.
- Her event için ayrı ekran veya ayrı minigame altyapısı.
- Procedural biome üretimi.
- Diyalog ağacı, reputation ve faction sistemi.
- Aynı işi yapan merchant, shrine ve blacksmith çeşitleri.

Başlangıç ekonomisi yalnız **Gold + Threat** kullanır. Mevcut can, shield, skill ve artifact
durumları sonuç olarak kullanılabilir; yeni bir kaynak olmaları gerekmez.

## 3. Yeni run ritmi

Bir normal stage aşağıdaki tempoyu kullanır:

1. 15–25 saniye saf runner/readability bölümü.
2. Uzakta bir route-choice telegraph'ı görünür.
3. Oyuncu lane seçerek bir node'a bağlanır.
4. Seçilen node kısa event, minigame, ödül veya tehlike üretir.
5. Dünya tekrar akmaya başlar.
6. Stage içinde 2 normal choice ve 1 büyük choice hedeflenir.
7. Mevcut miniboss ve boss yaklaşımı korunur.

Her karar koşuyu durdurmamalıdır. Üç sunum tipi yeterlidir:

- **Drive-through:** Coin, Threat veya kısa modifier anında uygulanır; koşu durmaz.
- **Roadside stop:** Event/Blacksmith paneli açılır; dünya kontrollü biçimde yavaşlar veya donar.
- **Encounter gate:** Mevcut miniboss gibi fiziksel lane kapısıdır.

## 4. Route Choice

### Görsel dil

Karar en az 2.5–3 saniye önceden okunmalıdır. Her seçenek şunları taşır:

- Lane üzerinde büyük bir dünya işareti.
- Kategori ikonu: `?`, örs, kafatası, sandık veya minigame simgesi.
- Risk rengi: güvenli, belirsiz veya tehlikeli.
- Kısa etiket: `EVENT`, `FORGE`, `ELITE`, `CACHE`.

İşaret, HUD kartı gibi ekrana yapışmaz; yol üzerinde perspektifle büyüyen fiziksel bir prop olur.
Seçim kilidi oyuncu kapıya yaklaştığında alınır. Son anda lane değiştirerek iki sonucu birden alma
engellenir.

### İlk node türleri

| Tür | İşlev | Run başına hedef |
|---|---|---:|
| `EVENT` | İki/üç seçimli random event | 1–2 |
| `FORGE` | Blacksmith skill upgrade | 0–1 |
| `RISK_CACHE` | Threat karşılığında para/ödül | 0–1 |
| `MINIGAME` | Çağatay'ın minigame adapter'ı | 0–1 |
| `SAFE_ROAD` | Ödülsüz/düşük ödüllü nefes alanı | gerektiğinde |

Bir choice aynı anda en fazla üç seçenek sunar. Her lane için ayrı sistem yoktur; lane yalnız node
kimliğini seçer.

## 5. Event Director

Saf rastgele seçim yerine küçük, deterministik ve denetlenebilir bir director kullanılmalıdır.

Director'ın okuyacağı minimum context:

- Aktif stage/biome ve progression tier.
- Run içinde daha önce görülen event id'leri.
- Gold ve Threat.
- Oyuncunun can/shield durumu.
- Aktif weapon/class skill kimlikleri ve ana build etiketleri.
- Bir önceki node kategorisi.

Director'ın ilk kuralları:

- Aynı event aynı stage içinde tekrarlanmaz.
- Aynı node kategorisi üç kez üst üste gelmez.
- Düşük canlı oyuncuya ücretsiz iyileşme garanti edilmez; yalnız uygun event ağırlığı artar.
- Build uyumu ödül garantisi değildir; alakalı seçeneklerin görünme ihtimalini artırır.
- Stage sonundaki temiz boss runway korunur.
- Miniboss ve route choice aynı mesafe penceresine spawn olmaz.

Her event immutable bir tanım olmalıdır:

`id`, `biomeTags`, `weight`, `oncePerRun`, `condition(context)`, `title`, `body`, `choices`.

Her choice şunları taşımalıdır:

`label`, `preview`, `condition(context)`, `resolve(runState)`.

Event tanımı UI çizmez, ses çalmaz ve dünya entity'si spawn etmez. Yalnız sonuç üretir. Panel ve
efekt katmanları sonucu sunar. Böylece content ile runtime birbirine karışmaz.

## 6. İlk event paketi

İlk vertical slice için 8 event yeterlidir:

1. **Broken Cart:** Gold al; riskli sandığı aç; yoluna devam et.
2. **Wounded Knight:** Can harcayarak bilgi/ödül kazan veya yardım etmeden geç.
3. **Cursed Milestone:** Threat artırıp sonraki ödül rarity'sini yükselt.
4. **Forgotten Weapon Rack:** Bir weapon skill seçeneğini geçici olarak güçlendir.
5. **Tax Collector:** Gold öde veya Threat/engel yoğunluğu kabul et.
6. **Talking Crow:** Sonraki choice içeriğini açığa çıkar ya da küçük kumar oyna.
7. **Field Shrine:** Shield/can ile skill reroll hakkı arasında seçim yap.
8. **Hunter's Trail:** Mevcut Squire/Mark sistemine bağlanan küçük bir event.

Event sonuçları ilk etapta mevcut sistemlere dokunmalıdır. Yeni status/effect motoru açılmamalıdır.

## 7. Threat sistemi

Threat tek bir `0–100` run değeri olur. Oyuncu riskli choice seçtikçe yükselir.

İlk implementasyonda yalnız üç etkisi vardır:

- Obstacle pattern ağırlığında kontrollü artış.
- Event/Blacksmith rarity roll'una küçük pozitif etki.
- Boss ödülüne görünür bonus.

Threat boss'a yeni saldırı eklemez, hızı doğrudan çarpmaz ve ayrı debuff listesi üretmez. Önce
oyuncunun sistemi okuyabildiği kanıtlanmalıdır.

Önerilen üç bant:

- `0–29 CALM`
- `30–69 HUNTED`
- `70–100 DOOMED`

Kesin katsayılar playtest ile belirlenir. Plan aşamasında balance değeri kilitlenmez.

## 8. Blacksmith Knight

Blacksmith bir route node olarak görünür ve koşuyu kısa süre durdurur. İlk ekran yalnız üç hizmet
sunar:

1. Rastgele rarity'de bir skill upgrade satın al.
2. Sunulan upgrade'leri bir kez Gold ile reroll et.
3. Hiçbir şey almadan çık.

İlk sürümde reforge, fuse, curse temizleme, borç ve upgrade saklama yoktur.

Rarity tamamen kontrolsüz RNG olmamalıdır:

- Stage tier ve Threat bir rarity profile seçer.
- Teklifler mevcut skill lineage kurallarını kullanır.
- Geçersiz veya alınmış child seçenekleri teklif havuzuna girmez.
- En az bir karşılanabilir teklif üretme zorunluluğu yoktur; oyuncu Gold biriktirmeyi seçebilir.
- Reroll yalnız teklifleri değiştirir, rarity garantisi vermez.

Blacksmith yeni skill compiler yazmaz. Mevcut mutation/route compiler ve rarity receipt sistemi
tek kaynak olarak kullanılır.

## 9. Minigame entegrasyonu

Çağatay'ın eski implementasyonları doğrudan ana update/render döngüsüne taşınmamalıdır. Her biri
ortak bir adapter sözleşmesine bağlanır:

- `id`
- `canOffer(context)`
- `start(seed, difficulty)`
- `update(dt, input)`
- `draw()`
- `result(): FAIL | PASS | PERFECT`

Sonuç tablosu ortak olur:

- `FAIL`: küçük consolation veya küçük bedel.
- `PASS`: normal ödül.
- `PERFECT`: rarity/Gold bonusu.

İlk vertical slice'ta yalnız bir minigame taşınır. Adapter'ın doğru olduğu kanıtlandıktan sonra
diğerleri aynı sözleşmeyle eklenir.

## 10. Görsel overhaul hedefi

Görsel amaç daha fazla küçük detay çizmek değil; dünyayı katmanlı, yönlendirici ve biome'a özgü
hissettirmektir.

Öncelik sırası:

1. Yol ve lane okunabilirliği.
2. Orta mesafe siluetleri ve yaklaşan choice işaretleri.
3. Engel ile çevrenin aynı materyal ailesine ait görünmesi.
4. Ön plan parallax ve hız hissi.
5. Atmosfer, ışık ve hava varyantları.
6. Mikro dekor.

### Dünya katmanları

Her stage aynı render katmanlarını kullanır:

1. Sky gradient / uzak hava.
2. Horizon landmark ve uzak siluet.
3. Far scenery band.
4. Road surface ve road-edge materyali.
5. Mid scenery / route-choice props.
6. Obstacles, pickups ve actors — mevcut depth queue.
7. Near foreground silhouettes.
8. Atmosphere ve color grade.

Bu katmanlar yeni bir renderer değildir; mevcut `StageDefinition`, depth queue ve projection
sisteminin açık bir world-kit sözleşmesine dönüştürülmesidir.

## 11. World Kit mimarisi

Mevcut stage tanımları `bg`, `scenery`, `ground` ve obstacle palette fonksiyonlarını doğrudan
taşıyor. Overhaul sırasında aşağıdaki immutable registry'ler eklenmelidir:

- `ROAD_MATERIALS`: surface, edge, rut, lane cue ve geçiş çizimleri.
- `SCENERY_KITS`: far/mid/near prop aileleri ve yoğunluk profili.
- `OBSTACLE_SKINS`: obstacle type + biome için çizim adapter'ı.
- `ROUTE_GATE_SKINS`: event/forge/cache/minigame dünya işaretleri.
- `WEATHER_PROFILES`: palette grade, atmosphere ve sınırlı spawn varyasyonu.

`StageDefinition` bunların id'lerini seçer. Main update/render döngüsüne biome switch eklenmez.

Roadside entity'nin hafif kalması korunur: `z`, `off`, `variant`, `layer/propId`. Entity içine
canvas, closure, palette veya büyük geometry konmaz.

## 12. Obstacle overhaul

Mevcut `ObstacleDefinition` + `ObstacleSpawnPattern` ayrımı doğru ve korunmalıdır. Overhaul iki
eksikliği çözer:

### Mekanik aile

İlk sürümde yalnız mevcut üç gereksinim korunur:

- `JUMP`
- `DUCK`
- `LANE_BLOCK / MOVE`

Yeni input veya stamina sistemi eklenmez. Çeşitlilik aynı gereksinimin farklı zamanlama ve
siluetlerinden gelir.

### Görsel aile

Her biome aynı collision truth'u farklı fakat tutarlı materyalle çizer:

| Mekanik | Forest | Swamp | Volcano |
|---|---|---|---|
| Duck | Canlı kök kemeri | Mangrove/stilt kökü | Basalt boru/kemer |
| Jump | Kaya veya devrilmiş gövde | Çürük kütük/bataklık sırtı | Kırık lav levhası |
| Lane block | Dikenli çalı/kaya | Reed wall/çamur çıkıntısı | Obsidyen sütun |

Obstacle'ın safe/danger alanı uzaktan siluetle anlaşılmalıdır. Renk tek başına telegraph değildir.
Collision hâlâ `req[lane]` ve swept-z kontrolünden gelir; artwork collision truth olmaz.

İkinci aşamada en fazla iki yeni pattern önerilir:

- **Staggered pair:** iki yakın obstacle, iki ardışık karar.
- **Moving blocker:** yavaşça bir komşu lane'e kayan, uzun telegraph'lı tek engel.

Tam lane kapatan pattern art arda gelmez. Route-choice yaklaşım penceresinde obstacle yoğunluğu
azaltılır.

## 13. Ağaçlar ve çevre

Tek bir `drawTree` fonksiyonuna daha çok dal eklemek yerine prop aileleri oluşturulmalıdır:

- 3 hero silhouette (seyrek, büyük, karakteristik).
- 4–6 midground tree/rock silhouette.
- 3 far canopy/column cluster.
- 2 near foreground wipe silhouette.

Deterministik entity seed'i şekil varyasyonunu seçer; render sırasında `Math.random()` kullanılmaz.
Uzak objeler daha sade, yakın objeler daha detaylıdır. Aynı prop uzaklıkla yeni forma morph olmaz;
LOD yalnız detay katmanını açıp kapatır.

Performans sınırları:

- Per-frame canvas veya gradient cache üretimi yok.
- Sürekli değerlerle unbounded memoization yok.
- Büyük sabit prop'lar gerekiyorsa lazy atlas kullanılır.
- Draw queue'nun mevcut object pool'u korunur.
- Near foreground sınırlı sayıda ve cull edilmiş olur.

## 14. Uygulama aşamaları

### Faz 0 — Ölçüm ve kontratlar

- Mevcut 60 saniyelik stage ritmini ve spawn sayısını kaydet.
- Route-choice ile miniboss/boss runway mesafe rezervasyonlarını tanımla.
- Run state ile event content ownership sınırını kur.
- Seeded seçim ve tekrar önleme testini ekle.

Başarı ölçütü: mevcut runner davranışı değişmeden yeni registry'ler boot audit'ten geçer.

### Faz 1 — İlk oynanabilir vertical slice

- Forest'ta bir route-choice gate.
- Sol lane `? EVENT`, orta lane `SAFE ROAD`, sağ lane `RISK CACHE`.
- 3 event: Broken Cart, Cursed Milestone, Field Shrine.
- Threat state ve küçük HUD göstergesi.
- Event paneli ve seçim sonucu.
- Choice spawn/collision/render audit'i.
- Boss ödülünde Threat bonusunun görünmesi.

Bu ilk implementasyon önerisidir. Blacksmith veya minigame henüz eklenmez. Önce koşarken yaklaşan
kararın okunup okunmadığını ve seçim ritminin eğlenceli olup olmadığını test ederiz.

### Faz 2 — Blacksmith

- Blacksmith Knight route gate ve roadside stop.
- Üç teklif, Gold fiyatı ve tek reroll.
- Mevcut skill compiler ile upgrade uygulama.
- Rarity profile ve lineage validity audit'i.

### Faz 3 — Bir minigame

- Eski implementasyonlardan en temiz olanını adapter'a taşı.
- FAIL/PASS/PERFECT ortak sonuçları.
- Event director tekrar ve yakınlık kurallarına bağla.

### Faz 4 — Forest görsel overhaul

- `ROAD_MATERIALS` ve `SCENERY_KITS` vertical slice.
- Yeni forest road, edge/rut dili, far-mid-near ağaç aileleri.
- Event/Forge/Cache gate prop'ları.
- Root/pond/boulder yeni skinleri; collision değişmez.
- Sabit kamerada ve hareket halinde screenshot karşılaştırmaları.

### Faz 5 — Diğer biomelar

- Aynı world-kit kontratıyla Swamp ve Volcano.
- Her biome için yalnız özgün mekanik gerektiren 1 pattern hakkı.
- Weather ancak üç temel kit tamamlandıktan sonra.

### Faz 6 — İçerik genişletme

- Event sayısını 8'e çıkar.
- İkinci minigame.
- Gerekirse moving blocker.
- Veriye göre Threat katsayılarını balance et.

## 15. İlk implementasyon teknik taslağı

Yeni runtime sahipleri:

- `RunJourneyState`: threat, seenEventIds, pendingChoice, resolvedChoiceCount.
- `RUN_NODE_TYPES`: node davranış tanımları.
- `RUN_EVENTS`: immutable event content.
- `RunDirector`: eligible pool ve seeded weighted seçim.
- `RunChoiceEntity`: z, options ve selection lock state.

Ana run update yalnız şu dört çağrıyı öğrenmelidir:

1. `scheduleRunChoices()`
2. `updateRunChoiceSelection()`
3. `resolveRunChoice()`
4. `draw` tarafında mevcut queue'ya `RunChoiceEntity` eklemek

Event paneli ayrı mode açmak yerine tercihen bir overlay/substate olur; böylece stage ve renderer
yeniden başlatılmaz. Panel açıkken simulation bilinçli şekilde pause edilir. Pause ownership mevcut
global pause ile karıştırılmaz; `runInteraction` substate'i açıkça kontrol edilir.

## 16. Test kapıları

İlk vertical slice şu kontroller olmadan tamamlanmış sayılmaz:

- Aynı seed aynı üç option'ı üretir.
- Event aynı stage içinde tekrar etmez.
- Choice miniboss ve boss runway'ine giremez.
- Son seçim çizgisinde yalnız bir option resolve olur.
- Jump/duck halinde lane selection bozulmaz.
- Choice yaklaşırken unfair obstacle spawn olmaz.
- SAFE ROAD her zaman çalışır.
- Event panelinden çıkınca dist/spawn state'i sıçramaz.
- Threat `0–100` dışında kalmaz.
- Mevcut obstacle swept collision ve 757 combat route gate'i etkilenmez.
- Mobil ölçekte ikon ve seçenekler karar kilidinden önce okunur.
- Render sırasında yeni per-frame closure/canvas allocation oluşmaz.

## 17. Playtest soruları

İlk prototip yalnız şu sorulara cevap vermelidir:

1. Choice kaç saniye önceden anlaşılabiliyor?
2. Oyuncu seçtiği lane'in sonucunu biliyor mu?
3. Event koşunun temposunu tazeliyor mu, kesiyor mu?
4. SAFE ROAD gerçek bir tercih mi, yoksa her zaman yanlış seçim mi?
5. Threat oyuncuyu daha çok risk almaya teşvik ediyor mu?
6. Boss'a gelindiğinde oyuncu run kararlarının etkisini hatırlıyor mu?

Bu cevaplar olumlu değilse içerik sayısı artırılmaz. Önce seçim ritmi ve görsel okunabilirlik
düzeltilir.

## 18. Nihai öneri

İlk kodlama adımı Forest'ta tek bir üçlü route choice olmalıdır:

- Sol: `?` ve kısa event.
- Orta: güvenli yol.
- Sağ: `+Threat / +Gold` risk cache.

Bu küçük slice aynı anda yeni sistemin en kritik üç şeyini kanıtlar: perspektifte yol seçimi,
event akışı ve risk/ödül. Bunlar eğlenceli olmadan Blacksmith, minigameler veya büyük görsel paket
eklemek yalnız oyunu büyütür. Kanıtlandıktan sonra Blacksmith ve forest world-kit aynı omurgaya
güvenle eklenebilir.
