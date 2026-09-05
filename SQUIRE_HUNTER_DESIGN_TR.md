# Squire Avcı — tasarım notları

İlk dönüşüm (Hunter Squire / upgrade 1) uygulandı. Upgrade 2–4 aşağıda gelecek tasarım olarak tutuluyor; henüz oyunda değiller.

## Uygulanan ilk yükseltme

- Call Squire → Hunter Squire rotası mevcut class/Quality/rarity sistemi üzerinden seçilir. Base ve Guard rotaları korunur.
- MARKING SHOT: tek, düşük hasarlı ok. Common'da en az 1 Mark verir; ek kesirli katkı hedefin ortak rezervinde birikir. 1 Squire AP, 0 Resolve. Crit, Chain, Posture ve Bleed katkısı yoktur.
- READY SHOT: 1 Squire AP ve 1 ortak Resolve ile 1.65 saniyede yayı gerer; Knight'ın sonraki doğrudan saldırısının ilk isabetini bekler. Hazırlık tek kullanımlıktır.
- Knight'ın saldırı planı Mark patlatıyorsa ek Mark tüketmeden güçlü bonus verir. Knight Mark patlatmıyorsa mevcut Marklardan kapasitesi kadarını tüketip daha küçük patlama yapar. Mark yoksa küçük direct damage verir.
- Başka bir Squire hareketi hazırlığı bozar. Hazırlık tur değişimlerinde korunur, Knight vurana kadar bekler; ölüm/reset sırasında temizlenir. Bu formda savunma atışı veya Perfect Dodge yoktur.
- FIGHT aynı çift yakın dövüş vuruşu olarak kalır. Morale ve Veterancy mevcut sistemlerden gelir. HP için hard cap eklenmez.
- Knight'ın mevcut yay animasyonu Squire ölçeğinde (0.72) kullanılır. Şapka, sadak ve sade avcı kıyafeti bulunur; kalkan kaldırılır, gövde büyümez.
- Kıyafet, yay parçaları ve okun sap/uç/tüy renkleri uyumlu paletlerden seçilir; kareler arasında yeniden rastgeleleştirilmez. Sonraki fiziksel dönüşümler ertelenmiştir.

İlk formun Quality bütçesi: atış %45, hazırlık %35, Veterancy verimliliği %10, can %10. Bunlar stat yüzdesi değil, mevcut Quality defterindeki eksen paylarıdır.

Temel ayar formülleri (S: atış, R: hazırlık, H: can, V: Veterancy eksen kredisi):

- Atış hasarı `4 + 0.28*S`; Mark katkısı `1 + 0.025*S`.
- Hazırlık gücü `4 + 0.30*R`; tüketim kapasitesi `1 + floor(R/12)`.
- Knight patlatma bonusu `güç + Knight Mark hasarı*0.10`; kendi küçük patlaması `güç*0.50*tüketilen/kapasite`; Marksız bonus `güç*0.30`.
- Başlangıç canı `1 + floor(H/8)`; etkili Veterancy başına can katkısı `0.06 + 0.003*H`; Veterancy verimliliği `0.75 + 0.025*V`. Savaş profili mevcut Morale/Veterancy katkılarını ayrıca uygular.

## Kabul edilen temel

- Base Squire değişmez. Avcı rotası dört upgrade içerir; ilk dönüşüm upgrade 1'dir.
- Mevcut weapon/class Quality ve rarity sistemi kullanılır. Yeni rank/rarity sistemi kurulmaz.
- Hard cap kullanılmaz. Can, Mark, hazırlık bonusları ve Veterancy katkıları dinamik ölçeklenir.
- Normal ilerleyişte final Avcı yaklaşık 2 can; yüksek Quality/Legendary ağırlıklı ilerleyişte yaklaşık 4 can denge hedefidir. Bunlar üst sınır değildir. Guard'dan daha düşük can yatırımı olur.
- Mevcut FIGHT korunur. AP/Resolve rework sırasında kullanıcı yeniden değerlendirebilir.
- Avcı bow ve Mark odaklıdır; Bleed çok küçük yan katkıdır. Parry kazanmaz.
- Morale ve Veterancy mevcut sistemlerdir; her upgrade'in katkıları ayrıca ayarlanır.

## İkinci skill: hazırlanmış ortak atış

- Squire yayı gerer, oku bırakmadan bekler.
- Knight'ın sonraki isabetinde eşzamanlı ateş eder. Mark varsa ek Mark patlama katkısı; Mark yoksa küçük direct damage sağlar.
- Upgrade 1: Ready Shot, temel hazırlık ve koşullu atış.
- Upgrade 2: Patient Aim, Veterancy verimliliği artar; Marklı katkı daha güçlü gelişir.
- Upgrade 3: Explosive Arrow, Mark sayısından beslenen ek bonus açılır. Önceki üst sınır önerisi iptal edildi; sayısal formül henüz belirlenmedi.
- Upgrade 4: Covering Shot, saldırı katkıları gelişir. Knight'a darbe isabet edecekken hazırlık savunmaya harcanabilir: gelen saldırıya ateş eder, bir Perfect Dodge sağlar ve hazırlık biter.
- Bir hazırlık saldırı veya savunma olarak tüketilir. Kaçınma adedi stat hard cap'i değil, bu hazırlığın tek kullanımlık etkisidir.

İlk formda Knight'ın Mark patlatma planı korunarak okunur; bu sayede Knight Markları önceden tüketse de güçlü ortak atış dalı kaybolmaz. Yalnızca Knight'ın patlatmadığı dalda Avcı az sayıda Mark tüketir.

## Görünüm ve animasyon

- Robin Hood esintili pratik avcı. Bard'ın süslü/dantelli görünüşü ve eller belde sağ çapraza bakan smug heroic pozu kullanılmaz.
- Guard'ın büyüyen dev gövde şakası tekrarlanmaz. Vücut boyutu sabit; siluet duruş ve ekipmanla değişir.
- Dört aşama: Robin Hood başlangıcı, iz sürücü, pusucu, ormanın hayaleti.
- İlk upgrade'de şapka, sadak ve sırtta yay; kalkan kaldırılır.
- Parça parça, uyumlu rastgele kıyafet renkleri. Şapka tüyü upgrade/rütbeyle komik ölçüde büyüyebilir.
- Son formda yapraklı örtüye sinme, atışta açılma ve yeniden sinme karakteristiği.
- Organik omuz/dirsek/el zincirleri; çekiş eli yüz yanında dayanak noktasına gelir. Yay, kiriş ve ok eklemleri takip eder. Örtü bağlantıları gövdeye bağlı, serbest uçları hafif gecikmelidir.
- İlk form mevcut Knight yay iskeletini kullanır. Son form ve sonraki fiziksel değişimler gelecek çalışmadır.

## Quality dağılımı — ilk satır uygulandı, diğerleri öneri

Paylar stat yüzdesi değil Quality bütçesi payıdır.

| Upgrade | İlk skill | Hazırlanan atış | Veterancy verimliliği | Can |
|---|---:|---:|---:|---:|
| 1 | %45 | %35 | %10 | %10 |
| 2 | %25 | %25 | %35 | %15 |
| 3 | %40 | %35 | %15 | %10 |
| 4 | %30 | %40 | %15 | %15 |

İlk move MARKING SHOT olarak uygulandı. Tracker/Hunting/Ghost Shot ve sonraki formüller henüz kesinleşmiş değildir. Küçük Bleed yan katkısı bu ilk uygulamaya eklenmedi.
