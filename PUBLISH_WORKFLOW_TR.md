# Knight Rush Git ve yayın akışı

## Tek kaynak

- Oyunun düzenlenen ana dosyası `KnightRush.html` dosyasıdır.
- GitHub Pages'in açtığı `index.html`, bunun birebir yayın kopyasıdır.
- `index.html` elle düzenlenmez; aksi hâlde sonraki yayın değişikliği ezer.

## Yayın

PowerShell'de proje klasöründe:

```powershell
.\publish.ps1 -Message "kisa ve anlamli versiyon aciklamasi"
```

Script sırasıyla:

1. `KnightRush.html` içindeki inline JavaScript'i parse eder.
2. `origin/main` geçmişinin yerel `main` tarafından içerildiğini doğrular.
3. `KnightRush.html` dosyasını birebir `index.html` ile eşitler.
4. Hash ve Git whitespace kontrolü yapar.
5. Projedeki güncel değişikliklerin tamamını stage ve commit eder.
6. Normal `git push origin main` çalıştırır.

Script force push yapmaz. GitHub'da başka bir değişiklik varsa geçmişi ezmek yerine durur.

## Adresler

- Kaynak repo: `https://github.com/porsukmen/knightrush`
- Mobil test: `https://porsukmen.github.io/knightrush/`

Eski GitHub Pages commitleri ile yerel geliştirme geçmişi 2026-08-09 tarihinde
korunarak tek `main` geçmişinde birleştirilmiştir.
