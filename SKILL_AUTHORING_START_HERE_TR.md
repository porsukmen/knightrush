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
6. Her materialize move için mekanikle eşleşen animasyon recipe'si seç. Ağır Single; uzun çekiş,
   belirgin hold, yavaş projectile ve sert impact ile okunmalı. Texture ileride değişebilmesi için
   combat sonucundan ayrı kalmalı.
7. Her Twist için varsayılan dört Apex yönü kullanılabilir: imza mekaniği, delivery yoğunluğu, payoff ve temiz etki. Bunlar şablondur; daha iyi tasarım varsa zorunlu değildir.
8. Aileyi veri tabanlı factory ile tanımla. Rarity ve Apex kartlarını kopyala-yapıştır bloklarıyla çoğaltma.
9. Ortak sentez çekirdeğini kullan; yalnız silaha/mekaniğe özgü küçük bir adapter yaz.
10. Hızlı testi çalıştır: `node tools/validate-runtime.cjs KnightRush.html --quick`.
11. Aynı Formdaki ağır komşu aile kıyasını çalıştır: `node tools/validate-runtime.cjs KnightRush.html --adjacent`.
12. Skill Lab'de en az bir setup, bir payoff ve varsa kaynak tüketen route'u gerçek runtime ile dene.
    `--quick` ve `--adjacent` birlikte yayın kapısıdır; eski monolitik F1 exhaustive matrisi her mobil
    deployda yeniden çalıştırılmaz.

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
