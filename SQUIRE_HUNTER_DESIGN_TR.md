# Squire Avcı — tasarım notları

Henüz implement edilmedi. Kabul edilen kararlar ile açık öneriler ayrılmıştır.

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

Önceki çalışma önerileri (uygulama öncesinde kesinleştirilecek): yardımcı atış Markları tüketmez; tetikleme Knight'ın ilk doğrudan isabetidir; Mark tüketiminden önce hedef durumu okunur; hazırlık sonraki düşman fazının sonunda biter; başka Squire hareketi hazırlığı bozar.

## Görünüm ve animasyon

- Robin Hood esintili pratik avcı. Bard'ın süslü/dantelli görünüşü ve eller belde sağ çapraza bakan smug heroic pozu kullanılmaz.
- Guard'ın büyüyen dev gövde şakası tekrarlanmaz. Vücut boyutu sabit; siluet duruş ve ekipmanla değişir.
- Dört aşama: Robin Hood başlangıcı, iz sürücü, pusucu, ormanın hayaleti.
- İlk upgrade'de şapka, sadak ve sırtta yay; kalkan kaldırılır.
- Parça parça, uyumlu rastgele kıyafet renkleri. Şapka tüyü upgrade/rütbeyle komik ölçüde büyüyebilir.
- Son formda yapraklı örtüye sinme, atışta açılma ve yeniden sinme karakteristiği.
- Organik omuz/dirsek/el zincirleri; çekiş eli yüz yanında dayanak noktasına gelir. Yay, kiriş ve ok eklemleri takip eder. Örtü bağlantıları gövdeye bağlı, serbest uçları hafif gecikmelidir.
- Hareketler netleşince ilk ve son form üzerinde iskelet denemesi yapılacak; sonra tüm rota uygulanacak.

## Henüz onaylanmamış Quality dağılımı önerisi

Paylar stat yüzdesi değil Quality bütçesi payıdır.

| Upgrade | İlk skill | Hazırlanan atış | Veterancy verimliliği | Can |
|---|---:|---:|---:|---:|
| 1 | %45 | %35 | %10 | %10 |
| 2 | %25 | %25 | %35 | %15 |
| 3 | %40 | %35 | %15 | %10 |
| 4 | %30 | %40 | %15 | %15 |

İlk move henüz tasarım aşamasında. Önceki Marking/Tracker/Hunting/Ghost Shot önerileri kesinleşmiş kabul edilmez. Sayısal değerler ve dönüşüm formülleri, ilk move netleşince birlikte belirlenecek.
