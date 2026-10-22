"""Готовит публичную сборку: абсолютные URL, noindex, снятие комментариев.
Запускать после копирования свежих файлов из воркспейса."""
import re

BASE = 'https://jakewhite-ui.github.io/4stroke-tyres'
PAGES = ('index.html', 'ar/index.html')

for p in PAGES:
    s = open(p).read()
    s = s.replace('https://4stroke.ae', BASE)
    for a, b in (('content="img/og.webp"', 'content="%s/img/og.webp"' % BASE),
                 ('content="../img/og.webp"', 'content="%s/img/og.webp"' % BASE),
                 ('"image":"img/og.webp"', '"image":"%s/img/og.webp"' % BASE),
                 ('"image":"../img/og.webp"', '"image":"%s/img/og.webp"' % BASE)):
        s = s.replace(a, b)
    if 'name="robots"' not in s:
        s = s.replace('<meta charset="utf-8">\n',
                      '<meta charset="utf-8">\n<meta name="robots" content="noindex, nofollow">\n', 1)
    open(p, 'w').write(s)

# Страховка перед снятием комментариев: /* не должно стоять внутри строки
for p in PAGES + ('calc.js',):
    s = open(p).read()
    for m in re.finditer(r'/\*', s):
        line = s[s.rfind('\n', 0, m.start()) + 1:m.start()]
        if line.count("'") % 2 or line.count('"') % 2:
            raise SystemExit('ОПАСНО: /* внутри строки в %s: %r' % (p, s[m.start()-50:m.start()+50]))

for p in PAGES + ('calc.js',):
    s = open(p).read()
    before = len(s)
    s = re.sub(r'/\*[\s\S]*?\*/', '', s)
    s = re.sub(r'<!--[\s\S]*?-->', '', s)
    s = re.sub(r'\n[ \t]*\n+', '\n', s)
    open(p, 'w').write(s)
    print('%-16s %6d -> %6d' % (p, before, len(s)))

for p in PAGES + ('calc.js',):
    s = open(p).read()
    bad = re.findall(r'[а-яё]', s, re.I)
    assert not bad, '%s: осталась кириллица' % p
    assert '4stroke.ae' not in s, '%s: остался домен-заглушка' % p
    assert 'Milad' not in s, '%s: упоминание Milad' % p
print('проверки пройдены: кириллицы нет, заглушки нет, Milad нет')
