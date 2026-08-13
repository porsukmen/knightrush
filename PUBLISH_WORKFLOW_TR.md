# Knight Rush Git ve yayın akışı

## Tek kaynak

- Oyunun tek kalıcı kaynağı `KnightRush.html` dosyasıdır.
- Repoda ikinci bir oyun kopyası veya takip edilen `index.html` yoktur.
- GitHub Actions her yayında `KnightRush.html` dosyasını geçici Pages artifact'i içinde
  `index.html` adıyla üretir. Bu dosya repoya geri yazılmaz.

## Yayın

PowerShell'de proje klasöründe:

```powershell
.\publish.ps1 -Message "kisa ve anlamli versiyon aciklamasi"
```

Script sırasıyla:

1. `KnightRush.html` içindeki inline JavaScript'i parse eder.
2. `origin/main` geçmişinin yerel `main` tarafından içerildiğini doğrular.
3. Git whitespace kontrolü yapar.
4. Projedeki güncel değişikliklerin tamamını stage ve commit eder.
5. Normal `git push origin main` çalıştırır.

Push sonrasında `.github/workflows/deploy-pages.yml` otomatik olarak:

1. `KnightRush.html` dosyasını yeniden parse eder.
2. Temiz bir `_site` artifact'i oluşturur.
3. Artifact içinde yalnız `KnightRush.html -> index.html` yayın kopyasını üretir.
4. Artifact'i GitHub Pages'e deploy eder.

Doğrudan `git push` kullanılsa bile aynı workflow çalışır; yayın kopyasını unutmak
artık mümkün değildir.

Script force push yapmaz. GitHub'da başka bir değişiklik varsa geçmişi ezmek yerine durur.

## Adresler

- Kaynak repo: `https://github.com/porsukmen/knightrush`
- Mobil test: `https://porsukmen.github.io/knightrush/`

Eski GitHub Pages commitleri ile yerel geliştirme geçmişi 2026-08-09 tarihinde
korunarak tek `main` geçmişinde birleştirilmiştir.
