# Guard: geçmişten sentezlenen hazırlıklı parry

Guard Bash fiziksel kalkan vuruşunu, animasyonunu, chip damage ve posture etkisini korur.
Finalde Knight'a shield yerine sonraki tek savunma fazında geçerli parry hakları hazırlar.
Slash/Covering Cross hazırlık vermez. Hazırlıksız darbe almak parry üretmez.
Yeni hazırlık eski hak sayısını değiştirir; toplamaz. Ölüm ve savunma sonu hakları siler.

## Quality muhasebesi

Silahlarla aynı `compileSkillQualityLedger` kullanılır. Her katmanın
`(rarity Quality + structural Quality) × depth leverage` paketi bir kez dağıtılır;
erken paketler sonraki rarity ile yeniden boyanmaz veya tekrar çarpılmaz.

| Katman | Paket dağılımı |
|---|---|
| Form | %45 dayanıklılık, %25 Bash, %20 posture, %10 hazırlık |
| Training | %55 Veterancy verimi, %25 dayanıklılık, %10 shield gelişimi, %10 hazırlık |
| Oath | %45 parry posture, %25 Veterancy verimi, %15 dayanıklılık, %15 hazırlık |
| Final | %20 dayanıklılık, %35 hazırlık, %25 parry posture, %20 Cross hasarı |

Hazırlık katkıları ayrı, kalıcı receipt ekseninde taşınır; finalden önce parry açmaz.
Final temel 1 hak verir. Birikmiş hazırlık power'ının her 11 puanı 1 ek hak satın alır.
Ortak `skillLinearOutputProgress` tam hak/spent/reserve hesabını yapar. Küsurat sonraki
upgrade için saklanır; aynı power ayrıca parry posture'a harcanmaz. Parry posture kendi
ayrı ekseninden büyür. Sabit rarity tablosu ve 2-hak runtime cap'i yoktur.
Veterancy Bastion (9) rankı, rarity geçmişinden bağımsız olarak yalnız +1 hak verir.

## Kalibrasyon örnekleri

Aşağıdakiler tabloyla atanmaz; dört receipt'in hesabından çıkan örneklerdir.

| Dört katmanın geçmişi | Hazırlık Quality | Temel hak | Bastion rankında |
|---|---:|---:|---:|
| C/C/C/C | 3.076 | 1 | 2 |
| U/U/U/U | 5.2945 | 2 | 3 |
| R/R/R/R | 8.2525 | 3 | 4 |
| L/L/L/L | 12.6895 | 4 | 5 |

Erken Legendary dayanıklılık/Bash temelinde daha büyük fark bırakır; geç Legendary daha
çok hazırlık ve parry posture satın alır. Üst üste Legendary mevcut katkıları silmez.
Bedelsiz jackpot çarpanı eklenmez. Denge frenleri ücretli kapasite, bir Squire AP ve
bir Resolve ile hazırlık, tek savunma ömrü ve birikmeme davranışıdır. Hazırlık bir parry
tepkisiyle boss'un mevcut saldırısını keser; sonraki ayrı saldırı ayrıca hak tüketir.

## Doğrulama

Hedefli `--squire`: 256 rarity geçmişi; her katmanda rarity yükseltmesinin bütün sahip
olunan statlarda monotonluğu; receipt/spent/reserve eşitliği; erken/geç Legendary ayrımı;
Legendary yığılması; gerçek Bash timeline'ı; beş hakkın tek tek hasarsız tüketimi;
faz sonunda silinme; birikmeme; hazırlıksız parry ve Knight shield üretmeme testleri.
Bu matematik/runtime doğrulamasıdır, oynanışta kusursuz denge garantisi değildir.
