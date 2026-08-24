# Skill üretimine buradan başla

Bu dosya, hafıza sıfırlansa veya projeyi başka bir AI devralsa bile yeni bir skill/weapon ailesini aynı kaliteyle üretmek için başlangıç noktasıdır.

## Zorunlu okuma sırası

1. Bu dosya.
2. `STABLE_SKILL_TREE_RULES.md`.
3. Twist yazılacaksa `TWIST_AUTHORING_CONTRACT_TR.md`.
4. Apex yazılacaksa `APEX_AUTHORING_CONTRACT_TR.md`.
5. `MOVE_FAMILY_ACCEPTANCE_TEMPLATE_TR.md`.
6. Tasarlanacak aileye en yakın, testleri geçen mevcut aile ve onun derleyicisi.

F5 ve sonraki Formlarda `Twist Identity V1` bulunmadan route materialize edilemez. Dört Twist ayrı
ayrı değil bir set olarak tasarlanır. Delivery tek başına mekanik kimlik sayılmaz.
Yeni Apex ailesi `Apex Design V2` taşır. Dört seçeneğin en az ikisi gerçek oyuncu planını ve en az
iki farklı karar eksenini değiştirmiyorsa aile, güç dengesi doğru olsa bile tamamlanmış sayılmaz.

## Sorumluluk ayrımı

Tasarım katmanı şunları belirler:

- Silahın ve base skillin değişmez kimliği.
- Formdaki Primary ve Specializationdaki Secondary attribute.
- Her Twist'in ayrı oynanış kararı, Primary/Secondary ilişkisi ve uygun delivery'si.
- Her Apex'in parent Twist'i bozmadan hangi tarafı zirveye taşıdığı.
- Gerçekten yeni bir mekanik gerekiyorsa bunun açık runtime sözleşmesi.

Sentez katmanı şunları hesaplar; rarity başına elle kart kopyalanmaz:

- Bütün geçmişten gelen toplam Quality ve depth leverage.
- Common/Uncommon/Rare/Legendary katkısı.
- Hasar, resource outputu, temas sayısı, Weight ve scaling dağılımı.
- Immediate parent mirası, rank monotonluğu ve eski güçlü temel avantajının korunması.
- Reserve, resonance ve ilerideki Legendary stamp etkileri.

## Bir move ailesi üretme rutini

1. Base identity ve Primary için kaybolamayacak çıktıları yaz.
2. Secondary'nin rolünü ve özellikle yapmaması gerekenleri yaz.
   Her Attribute motoru `URETIR / OKUR / HARCAR / COZUM SIRASI` bildirir; her Delivery yalnız
   mekanik temas gruplarını ve bu grupların zamanını bildirir. Aynı anda çözülen temaslar aynı
   grup-başı snapshotı okur, çıktılarını grup bitince aktarır; sıralı gruplar önceki grupların
   çıktısını okur. Primary/Secondary motor kendi doğal çıktısını gerçekten üretir, sıfır kaynakla
   çalışır ve toplam Quality büyürken bu çıktı gerilemez. Tek temas, sequential, shotgun, echo ve
   gelecekteki Deliveryler aynı matristen geçer; skill id/adresi için istisna yazılmaz.
   Chain motorunda her mekanik temas tam `+1 Chain` üretir. Tek temas görünmez biçimde çoklu Chain
   yazamaz; daha fazla Chain gerekiyorsa Delivery gerçek kurulum teması üretir.
   `Primary = Chain` için sözleşme daha serttir: materialized hareket en az iki gerçek temas üretir.
   Rarity geçmişinin toplam Quality'si temas sayısını sınırsız büyütür. Weight rotası daha düşük
   temas yoğunluğu kullanabilir fakat `SINGLE` olamaz; hafif kurulum temaslarını ağır final izler.
   **Chain kalıcı momentumdur ve hiçbir kart tarafından tüketilemez.** Hareket Chain üretebilir,
   mevcut Chaini okuyabilir veya katsayısını büyütebilir; Chaini maliyet olarak harcamak, azaltmak,
   sıfırlamak ya da başka kaynağa çevirmek yasaktır. Tur/faz sözleşmesindeki reset ve oyuncunun
   gerçek darbe almasıyla Chain kırılması bu kart kuralından ayrıdır.
   Ortak motor-delivery materializerı `SINGLE`, `SEQUENTIAL`, `SIMULTANEOUS_PACKET` ve
   `IMPACT_ECHO` topolojilerinin tamamını bütün Attribute motorları için kabul eder. Silah animasyonu
   bu katmana gömülmez; Bow/Sword gibi sunum adapterı aynı topolojiye kendi recipe'sini bağlar.
3. Varsayılan olarak dört, birbirinden oynanış olarak ayrılan Twist tasarla. Sadece sayıları değişen iki Twist kabul edilmez.
4. Önce mekanik kararı ver, sonra onu en iyi anlatan delivery'yi seç. Her aileye zorla bütün delivery türleri dağıtılmaz.
5. **Görünen temas sonuç üretir:** ekranda ayrı bir ok/vuruş hedefe değiyorsa o temasın hasar, Chain, Mark, Crit, Posture veya status katkısı açıkça tanımlanmalıdır. Birden fazla temas tek bir toplam payload taşıyorsa toplam güç temaslara bölünür; son temasa gizlenmez ve temas sayısıyla bedavaya çarpılmaz.
   Break kurabilen bir saldırıda çözüm sırası ayrıca yazılır. F3 referansında gerçek temasın Health
   hasarı ve Chaini önce, Posture sonra çözülür; tetikleyen temas kendi açtığı Break bonusunu alamaz.
6. Her materialize move için mekanikle eşleşen animasyon recipe'si seç. Ağır Single; uzun çekiş,
   belirgin hold, yavaş projectile ve sert impact ile okunmalı. Texture ileride değişebilmesi için
   combat sonucundan ayrı kalmalı.
7. Her Twist için varsayılan dört Apex yönü kullanılabilir: imza mekaniği, delivery yoğunluğu, payoff ve temiz etki. Bunlar şablondur; daha iyi tasarım varsa zorunlu değildir.
8. Aileyi veri tabanlı factory ile tanımla. Rarity ve Apex kartlarını kopyala-yapıştır bloklarıyla çoğaltma.
9. Ortak sentez çekirdeğini kullan; yalnız silaha/mekaniğe özgü küçük bir adapter yaz.
10. Hızlı testi çalıştır: `node tools/validate-runtime.cjs KnightRush.html --quick`.
11. Tam Form için temsili rarity/geçmiş matrisini çalıştır: `node tools/validate-runtime.cjs KnightRush.html --posture-balance`.
12. Aynı Formdaki ağır komşu aile kıyasını çalıştır: `node tools/validate-runtime.cjs KnightRush.html --adjacent`.
13. Skill Lab'de en az bir setup, bir payoff ve varsa kaynak tüketen route'u gerçek runtime ile dene.
    `--quick` ve `--adjacent` birlikte yayın kapısıdır; eski monolitik F1 exhaustive matrisi her mobil
    deployda yeniden çalıştırılmaz.

Yerel görsel smoke testi için Python gerekmez: `node tools/serve-local.cjs . 8765` çalıştırılır ve
`http://127.0.0.1:8765/KnightRush.html` açılır. Debug Run / Skill Lab açılmadan önce sesin
susturulduğu doğrulanır. Test modları kod seviyesinde zorunlu mute taşır; normal oyuncu ses tercihi
değiştirilmez. Başarılı açılışta Canvas üzerinde hem
`data-boot-ready="1"` hem `data-render-ready="1"` bulunmalı, `data-boot-error` ve konsol hatası
bulunmamalıdır. `boot-ready` yalnız derlemeyi; `render-ready` ilk gerçek frame'in tamamlandığını kanıtlar.

F3 Posture referansı artık tam kapanmıştır: `127 route / 508 rarity card`. Yeni aile yazarı;
Break/Mark/Chain ödüllerini temas sonucundan sonra, Posture'u Health temasından sonra, eşzamanlı
packet snapshotlarını ise action başında çözmelidir. Development kapısındaki F3 closure ve mechanic
auditlerini azaltmak veya yeni route'u bu matristen sessizce çıkarmak kabul edilmez.
F3 balance matrisi oyun bootundan ayrı tutulur; 18 temsili geçmişte 108 Twist ve 432 Apex
kardeş kıyası yapar. Maksimum kardeş farkı `%20`, ortalama fark `%10`; komşu aile maksimumu
`%20`, ortalaması `%12` sınırındadır. Eşik, kaybolan Quality çıktısını gizlemek için gevşetilmez.

F4 Critical referansi Form, Specialization, Twist ve Apex seviyesinde tam kapanmistir:
`127 route / 508 rarity card`. Critical Primary;
move-local Chance ile turler arasinda saklanan Precision kurar. Iskalayan Crit Precision biriktirir,
basarili Crit yalniz o moveun Precisionini sifirlar. Critical Secondary bu motoru acamaz. Twistten
once sadece saf Critical/Critical rotasi `CRIT_POWER` satin alabilir; diger rotalarda dogal Chance
ve Precision tasmasi kaybolmak yerine local Crit carpimina akar. Yeni Critical ailesi yazari;
Critical/Critical carpani liderligini, parent Crit oranini ve uzun vadeli beklenen Crit oranini ayri
denetlemelidir. `--quick` icindeki F4 Form, 96-kart Specialization ve 508-kart closure
matrisini azaltmak kabul edilmez. F4S1-S3 de dort Twist ve Twist basina dort Apex tasir:
Critical/Mark Marki tuketmeden Crit odagi kurar veya gercek Critten Mark uretir;
Critical/Chain baslangic/canli Chaini Crit sansi, Crit carpani ya da Crit sonrasi Chain olarak
yorumlar; Critical/Posture ayni Crit sonucunu light-bow Posture etkisine uygular. Sirali delivery
temas basina, eszamanli packet toplam bir Chain uretir. Hicbir authored gameplay cap veya
diminishing bu rotalara eklenemez.
F4S4 Critical/Critical dort Twist ile materializedir: bagimsiz rollu sirali volley, stored Precisioni
Crit carpanina ceviren tek agir ok, Crit geldikce uzayip ilk normal vurusla duran cascade ve tek ortak
roll kullanan eszamanli packet. Sirali gercek oklar temas basina Chain kurar; packet toplam bir Chain
kurar. Hicbiri Chain scaling sahibi degildir. T3 parent saldiriyi ilk okta garanti eder ve gerceklesmeyen
oklar icin RNG tuketmez. `--quick` icindeki 256-kart F4S4 matrisi korunmalidir.
F4S4 altindaki `16 Apex` de materializedir. A1 parent imzasini, A2 guvenilirligi, A3 Crit
carpanini, A4 temiz darbeyi buyutur. Verdict A2 istisnadir: Crit sansini tavana itip stored
Precision dongusunu oldurmek yerine garanti Mark kurulumunu buyutur. Apex parent delivery/roll/
Chain sozlesmesini degistiremez ve Chain scaling alamaz. Bootta `CCC/LCC/LLC/LLL` gecmisleri ile
butun Apex raritylerini kapsayan 256-kart matris kosar; daha buyuk kombinatoryal matris oyuncu
acilisina konmaz.

F4S5 Critical/Affliction Twist referansi dort farkli iliski kurar: bagimsiz Crit atan ve toplam
Bleedi temaslara bolen sirali volley; Crit gelince ek ucretli Bleed acan tek agir rupture; mevcut
Bleedi tuketmeden Crit carpanina okuyan Bloodsight; tek ortak Crit rollu ve tek toplam Chainli
eszamanli dikenli packet. Yeni Affliction ailesi yazari, gorunen her okun toplam wounddan gercek pay
tasidigini, temas sayisinin Bleedi cogaltmadigini ve yeni uygulanan Bleedin ayni vurus tarafindan
geriye donuk okunmadigini kanitlamalidir. `--quick` icindeki 256-kart F4S5 matrisi korunur.
F4S5 altindaki 16 Apex parent mekanigi degistirmez: A1 iliskinin, A2 Crit guvenilirliginin,
A3 toplam Bleedin, A4 temiz impactin lideridir. Apex delivery/roll/wound/Chain sozlesmesini miras
alir. `CCC/LCC/LLC/LLL` temsili gecmisleriyle 256-kart Apex matrisi yayin kapisinda gecmelidir.

F4S6 Critical/Charge referansi da dort iliski kurar: bankayi tek agir Crit darbesine sikistiran
Overload; bir toplam Charge salimini bagimsiz Crit atan gercek oklara bolen Volley; action-start
Chargei once local Crit sansina, sonra Crit carpanina ceviren Focus; ilk Critte duran ve yalniz
harcadigi bankadan ucretli iade yapan Hunt. Multihit Chargei kopyalayamaz. Hunt ilk oku bedava
hazirlar fakat sonraki ok sayisi mevcut banka ile sinirlidir. A1 iliski, A2 Crit guvenilirligi,
A3 Charge salimi, A4 temiz impact lideridir. Derin rarity matrisi oyun bootunda degil validator
icinde calisir.

F5 Affliction referansi Form, Specialization, Twist ve Apex seviyesinde materializedir. Form tek okla Base Mark,
tek gercek Chain ve iki tick Bleed kurar; direct damage F1-F4'ten bilincli olarak dusuktur. Stable
Bleed suresi rarity ile uzamaz, Crit atmaz ve Chain'den damage almaz. Alti Specialization yalniz yeni
paketini Mark, Chain, Posture, Critical, Affliction veya Charge ile boler. S2 disinda delivery tek
oktur; S2'nin her gorunen oku Chain ve tek toplam Bleed paketinden pozitif pay tasir. Temas sayisi
Bleedi cogaltamaz. Altı ailenin her birinde 4 Twist ve her Twist altında 4 Apex vardır: toplam
`1 Form + 6 Specialization + 24 Twist + 96 Apex = 127 route / 508 rarity card`. Saf
Affliction/Affliction içinde açık ekstra Bleed Power yalnız Virulence Twistinin imzasıdır; diğer
üç Twist aynı bütçeyi mevcut yarayı yeniden açma, tick zamanlaması veya ayrı yara uygulama olayına
harcar. Her Apex parent davranışını koruyarak sırasıyla ilişki, yara, dengeli ifade veya temiz impact
payını büyütür. `--quick` closure denetimi parent/rank gerilemesini, delivery gerçeğini, bütün mekanik
alanlarını ve Apex kardeş güç bandını birlikte kontrol eder.

Mark Burst F1S5 Detonation/Affliction referansı `4 Twist / 16 Apex` ile materializedir. T1 tüketilen
Markı iki ticklik yaraya, T2 action-start yarayı tüketmeden anlık rupture'a, T3 tüketilen payloadı
iki savunma fazına yayılan finite Detonation yarasına, T4 ise tek toplam yara ve tek Chain taşıyan
eşzamanlı pakete dönüştürür. T3A2 ilk yankıyı bossun ilk hareketinden önce çalıştırır; T3A3 arada
yeniden eklenen Markı ikinci tickte gerçekten tüketir; T3A4 aktif yara boyunca her ayrı boss move
başlangıcını bir ücretli pulse'a çevirir. Bu aile `Apex Design V2` yüzeysellik kapısının referansıdır.

Mark Burst F1S6 Detonation/Charge referansı da `4 Twist / 16 Apex` ile materializedir. T1 bütün
bankayı Detonation ile aynı ağır darbeye boşaltır; T2 yalnız patlatılan Markla eşleşen Chargeı
harcayıp finite yankı üretir; T3 harcanmış bankanın ücretli bölümünü Marklarla geri taşır; T4
bankayı sonraki savunmada Dodge/Parry başarılarının tükettiği finite pulse havuzuna çevirir.
Sıfır Charge parent Detonationı kilitleyemez. Temassız yankı ve savunma pulseları Chain/Crit/Mark
üretemez; hiçbir iade gerçekten harcanmış bankayı aşamaz.

Mark Burst F2 Chain Formunun altı Specialization rotası materializedir. Hepsi Quality ile büyüyen
aynı sıralı ok dizisini, temas başına gerçek `+1 Chain` üretimini, canlı Chain okumasını ve yalnız
son temasta patlayan temel `1 Mark`ı korur. Chain/Detonation bu tek patlamayı güçlendirir fakat
tüketim sayısını artırmaz; Chain/Chain en yüksek Chain ve temas bütçesini alır. Posture, Bleed ve
Charge rotaları aksiyon başına yalnız bir toplam ücretli paketi temaslara böler; temas sayısı bu
paketleri çoğaltmaz. Critical her gerçek temasta bağımsız yerel zar atar ve Specialization
katmanında Precision üretmez. Mark Burst hiçbir Stable rotada Mark üretmez.

Mark Burst F2S1 Chain/Detonation `4 Twist / 16 Apex` ile materializedir. T1 canlı Chaini
tüketmeden finaldeki tek-Mark patlamasına okur; T2 ücretli birden fazla tek-Mark olayını gerçek
oklara dağıtır; T3 yalnız başarılı patlamada başlangıç ve yeni üretilen Chaini koruyarak tek ağır
patlamaya okur; T4 başarılı
patlamadan sonra Mark patlatmayan gerçek dönüş okları açar. Her rota en az bir Detonation girişimi
taşır. Mark yokken T3 bonus okumayı ve T4 dönüş dalgasını üretemez; ana Chain saldırısı çalışır ve
Chain hiçbir rotada harcanmaz.

Mark Burst F2S2 Chain/Chain `4 Twist / 16 Apex` ile materializedir. Primary Chain rotalarında
`SINGLE` yoktur: canlı sekans, kurulum+agir final, machine-gun sekansi ve fiziksel echo kimlikleri
gercek multi-contact uretir. Her temas tam `+1 Chain` verir, Chain tuketilmez ve current rarity
yukseldikce temas sayisi kesinlikle artar. Weight yalniz agir final carpanidir; saf Chain rotasina
ilgisiz kaynak veya gizli Mark uretimi eklemez.

Mark Burst F2S3 Chain/Posture `4 Twist / 16 Apex` ile materializedir. T1 tek toplam light-bow
Posture paketini butun gercek oklara boler; T2 hafif Chain kurulumundan sonra tasinan ve yeni
uretilen Chaini ayri okuyabilen agir final kullanir; T3 Postureu acilis okuna yukleyip kendi actigi
Breaki kalan oklara kullandirir; T4 kalici Chainin `4/8/12/...` limitsiz esiklerinde Posture pulse
uretir. Pulse Chain harcamaz. Apexler dagilim, carried/generated Chain, Breach retry/conversion ve
esik davranisini parent Twist'i bozmadan farkli oyuncu kararlarina donusturur.

## Kabul edilmeyen sonuçlar

- Stable childın parent mekanik veya gücünü sebepsiz kaybetmesi.
- Rarity yükselirken sahip olunan bir statın ya da gerçek payoffun düşmesi.
- Sadece sayı farkıyla ayrılan Twistler.
- Mekaniğe hizmet etmeyen delivery değişimi.
- Mark, hit, Weight veya sentez büyümesine keyfî üst sınır koymak.
- Sistematik problemi tek karta özel yamayla saklamak.
- Aynı Quality bütçesini iki ayrı kanalda tam değerle harcamak.
- Tasarımda kararlaştırılmadan AP, Resolve veya üçüncü attribute eklemek.
- Birden çok görünür temas gösterip mekanik sonucu yalnız son temasta gizlice uygulamak. Tek mantıksal status olayı gerekiyorsa her temas onun gerçek payını uygular; artifact tetik sayısı ayrıca ve açıkça fiyatlanır.

## Hata düzeltme kuralı

Hata başka kartlarda da oluşabiliyorsa tek kartı düzeltme. Sırasıyla factory, compiler, runtime sözleşmesi ve validator katmanlarından doğru olanı düzelt; sonra bütün mevcut aileleri yeniden test et.

## Yeni silaha geçmeden önce

Mevcut sistem matematik, rarity, geçmiş ve denetim tarafında yeniden kullanılabilir. Yeni silah eklerken bu çekirdek tekrar yazılmamalı. Önce ortak family compiler korunur, sonra yalnız yeni silahın base identity, delivery adapterları, görsel timeline'ı ve özgün mekanikleri eklenir. Böylece birkaç silahı hızlı eklemek denge kurallarını atlamak anlamına gelmez.

## Base Attribute zorunluluğu

- Her yeni weapon skill önce `WEAPON_SKILL_BASE_ATTRIBUTE_CONTRACTS` içinde kendi değişmez Base Attribute sözleşmesini kaydeder.
- Stable Form, Specialization, Twist ve Apex katmanlarının her biri yalnız kendi yeni Quality paketinin merkezi `stableLayerShare` payını Base Attribute'a ayırır. Geçmiş güç tekrar vergilenmez.
- Sharpshoot referansı `MARK / MARK_GAIN / %10`dur. Primary veya Secondary ayrıca Mark ise bu ücretli tabanın üzerine rota payı eklenir.
- Base pay bedava değildir. Eksik pay önce katmanın doğrudan hasar ifadesinden karşılanır; mevcut Primary/Secondary mekanik eksenleri otomatik göç sırasında azaltılamaz.
- Tam resource üretmeyen güç reserve olarak taşınır, üst sınıra takılmaz. Base, Primary ve parent çıktıları Stable çocukta gerileyemez.
- Başka silah Sharpshoot'un Mark sözleşmesini kopyalamaz; kendi base identity'sini ve output axis'ini kaydeder.
