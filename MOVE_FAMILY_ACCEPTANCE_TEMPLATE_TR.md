# Hareket Ailesi Kabul Kalibi

Bu kalip, materialize edilen her yeni Twist veya Apex ailesinde sirasi degistirilmeden uygulanir.
Bir aile ancak butun kapilar gectikten sonra tamamlanmis sayilir.

## 0. Tasarim sozlesmesi

- Parent hareketin kimligi tek cumleyle yazilir.
- Cocuklarin parenttan koruyacagi hasar, Primary, Secondary, Delivery ve kaynak davranisi yazilir.
- Her kardesin oynanista lider oldugu tek bir alan belirlenir. Iki kardes yalniz sayi farkiyla ayni isi yapamaz.
- En az bir alternatif tasarim incelenir. Daha iyi degilse neden elendigi not edilir.
- Stable kart yeni bir ilgisiz mekanik acamaz; parent mekanigini derinlestirir.

## 1. Yapi kapisi

- Parent, depth, slot ve route kimlikleri dogrudur.
- Beklenen kardes sayisi tamdir; eksik veya gizli fazla route yoktur.
- Tree, katalog, tooltip, animasyon eslemesi ve synthesis route'u ayni kimligi kullanir.

## 2. Parent mirasi kapisi

- Tum onceki rarity gecmisleri ve sunulan tum ranklar denenir.
- Korunan hicbir stat parentin altina inmez.
- Cocuk gercek savas katkisi ve gorunur gelisim olarak parenttan ileridir.
- Guardrail'in kotu tarifi gizlemek icin buyuk onarim yapmadigi dogrulanir.

## 3. Rarity kapisi

- Common -> Uncommon -> Rare -> Legendary her gecmiste test edilir.
- Rank artarken sahip olunan mekanik, gercek hasar veya kaynak ciktisi gerilemez.
- Her rank gorunur bir ilerleme verir; bos rank adimi olamaz.
- Onceki Legendary temel, sonraki Common secim tarafindan silinmez.

## 4. Kardes rol ve guc kapisi

- Her ayni-gecmis grubunda kardes liderlikleri otomatik sayilir.
- Kardeslerin referans gucu ile tam tur/playthrough katkisi ayri olculur.
- Gucleri yakin, oynanis rolleri farkli olmalidir. Biri acikca ustun secimse aile reddedilir.
- Ailenin Primary/Secondary orani komsu ailelerin alanina tasamaz.

## 5. Senaryo kapisi

- Bos, dusuk, standart, yuksek ve jackpot kaynak durumlari denenir.
- Tek vurus, tam oyuncu turu ve kaynaklarin sonraki tura tasindigi senaryo ayri test edilir.
- Break, Crit, Chain, Mark, Posture ve Resolve sirasi hareketin kullandigi kadar gercek runtime ile denenir.

## 6. Runtime ve olay sirasi kapisi

- Kaynak okuma ani aciktir: action-start, hit-before, hit-after veya action-end.
- Uretim, okuma, tuketim, Break ve ertelenmis etkinin sirasi test edilir.
- Hareket kendisini yanlislikla prime edemez; Break sonrasi sizan gecici durum birakamaz.
- Bir olay yalniz bir kez calisir; multihit veya gecikmeli event yanlis tekrar uretmez.

## 7. Limitsiz olcek ve verim kapisi

- Tasarim limitlemiyorsa oyun da cap, soft cap veya diminishing return eklemez.
- Standart gozlem noktalarina ek olarak `1,000`, `1,000,000` ve safe-integer sinirina yakin deger denenir.
- Sonuc finite ve monoton olmalidir.
- Yeni mekanik frame basina allocation, filtreleme veya yeni update loop acamaz; hesap action aninda yapilir.

## 8. UI ve okunabilirlik kapisi

- Tree'de kart sayisi, parent cizgisi, cerceve ve metin tasmaz.
- Uzun-bas tooltip yalniz oyuncunun karar verecegi bilgiyi gosterir.
- Rank sekmeleri secilebilir ve farklar secili ranka gore dogru hesaplanir.
- Runtime animasyonu hareketin Delivery ve mekanik farkini okunur hizda gosterir.

## 9. Son regresyon kapisi

Calistirilmasi zorunlu komut:

`node tools/validate-skill-implementation.cjs KnightRush.html`

Ardindan:

`git diff --check`

Otomatik validator `Structure`, `Design`, `Bug`, `Rarity` ve `Power` kapilarinin tamamini gecmeden
aile commit veya push edilmez. Gorsel degisiklik varsa sessiz yerel tarayici testi de zorunludur.

## F1S3T2 referans uygulamasi

- Ortak `auditStableApexFamily` matrisi dort Apex'i `4^4 = 256` ayni-gecmis grubunda,
  toplam `1,024` sentezlenmis kartla denetler.
- A1 linear Mark-okuma, A2 Mark cikisi, A3 direkt hasar, A4 yuksek rezervde escalation lideridir.
- `0/4/8/16/32` Mark senaryolari ve alti fazli persistent-Mark turu ayri olculur.
- A4 icin `16 Mark` yalniz Quality fiyat referansidir. Runtime limiti degildir.
- Capped okuma, Mark tuketimi ve ekstra hit alternatifleri T2 kimligini bozdugu icin elenmistir;
  uncapped escalation ayni tek-ok ve Mark-koruma sozlesmesini derinlestirdigi icin secilmistir.

## F1S3T3 referans uygulamasi

- Ayni ortak matris dort Apex'i `1,024` kart ve `256` ayni-gecmis grubunda tarar.
- A1 flat Primer, A2 Mark, A3 direkt hasar, A4 buyuk kaynak amplifikasyonu lideridir.
- Amplifikasyon yalniz tetikleyen kaynagin kendi taban Posture'unu okur; flat Primer'i veya kendi
  sonucunu tekrar carpmaz. Ilk pozitif kaynak iki state'i birlikte tuketir ve Break ikisini temizler.
- `20 Posture` Quality fiyat referansidir; `1,000`, `1,000,000` ve safe-integer runtime problari
  cap veya diminishing return olmadigini kanitlar.
- Primer'i iki gelecekteki olaya bolmek T1 Double Fracture'a yaklastigi ve artifactsiz durumda
  Break'i geciktirdigi icin elenmistir. Mark'a gore Primer buyutmek T2 alanini tekrar ettigi icin
  elenmistir. Sonraki kaynagin gucunu okumak T3'un destek kimligini en temiz sekilde derinlestirir.

## F1S3T4 referans uygulamasi

- Dort Apex `1,024` kart ve `256` ayni-gecmis grubunda taranir.
- A1 esik acildigi anda sabit Finisher, A2 gorunur Mark, A3 direkt hasar, A4 yuksek bar lideridir.
- Crescendo action baslangicini okur; saldirinin kendi Posture'u ayni sonucu buyutemez.
- `0/49/50/60/75/90/99` durumlari ile `100/200/safe-integer` maksimum barlar denenir.
- Esigi dusurmek T1'e yaklastigi, Posture overflowunu Health damage'e cevirmek yeni bir ucuncu
  mekanik actigi ve AP/Resolve odulu ekonomi revampini erkenden kilitledigi icin elenmistir.
