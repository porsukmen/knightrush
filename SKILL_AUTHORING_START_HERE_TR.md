# Skill üretimine buradan başla

Bu dosya, hafıza sıfırlansa veya projeyi başka bir AI devralsa bile yeni bir skill/weapon ailesini aynı kaliteyle üretmek için başlangıç noktasıdır.

## Zorunlu okuma sırası

1. Bu dosya.
2. `STABLE_SKILL_TREE_RULES.md`.
3. `MOVE_FAMILY_ACCEPTANCE_TEMPLATE_TR.md`.
4. Tasarlanacak aileye en yakın, testleri geçen mevcut aile ve onun derleyicisi.

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
`http://127.0.0.1:8765/KnightRush.html` açılır. Başarılı açılışta Canvas üzerinde hem
`data-boot-ready="1"` hem `data-render-ready="1"` bulunmalı, `data-boot-error` ve konsol hatası
bulunmamalıdır. `boot-ready` yalnız derlemeyi; `render-ready` ilk gerçek frame'in tamamlandığını kanıtlar.

F3 Posture referansı artık tam kapanmıştır: `127 route / 508 rarity card`. Yeni aile yazarı;
Break/Mark/Chain ödüllerini temas sonucundan sonra, Posture'u Health temasından sonra, eşzamanlı
packet snapshotlarını ise action başında çözmelidir. Development kapısındaki F3 closure ve mechanic
auditlerini azaltmak veya yeni route'u bu matristen sessizce çıkarmak kabul edilmez.
F3 balance matrisi oyun bootundan ayrı tutulur; 18 temsili geçmişte 108 Twist ve 432 Apex
kardeş kıyası yapar. Maksimum kardeş farkı `%20`, ortalama fark `%10`; komşu aile maksimumu
`%20`, ortalaması `%12` sınırındadır. Eşik, kaybolan Quality çıktısını gizlemek için gevşetilmez.

F4 Critical referansi Form ve Specialization seviyesinde materializedir. Critical Primary;
move-local Chance ile turler arasinda saklanan Precision kurar. Iskalayan Crit Precision biriktirir,
basarili Crit yalniz o moveun Precisionini sifirlar. Critical Secondary bu motoru acamaz. Twistten
once sadece saf Critical/Critical rotasi `CRIT_POWER` satin alabilir; diger rotalarda dogal Chance
ve Precision tasmasi kaybolmak yerine local Crit carpimina akar. Yeni Critical ailesi yazari;
Critical/Critical carpani liderligini, parent Crit oranini ve uzun vadeli beklenen Crit oranini ayri
denetlemelidir. `--quick` icindeki F4 Form ve 96-kart Specialization matrisini azaltmak kabul edilmez.
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
