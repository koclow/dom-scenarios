#!/usr/bin/env python3
"""Сборка прототипа «Сценарии — ДОМ» в один файл index.html.

Исходники — в src/: styles.css (стили из макетов), extra.css (стили
прототипа), logo.html (логотип ДОМа), data.js (данные корпуса РМГ),
app.js (роутер, представления, действия). Запуск: python3 build.py
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "src")

def read(name):
    with open(os.path.join(SRC, name), encoding="utf-8") as f:
        return f.read()

css, extra, logo = read("styles.css"), read("extra.css"), read("logo.html")
data, app = read("data.js"), read("app.js")

FAVICON = ("data:image/svg+xml,"
           "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E"
           "%3Ctext y='.9em' font-size='90'%3E%F0%9F%A7%AD%3C/text%3E%3C/svg%3E")

html = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1280">
<meta name="robots" content="noindex">
<title>Сценарии — ДОМ</title>
<link rel="icon" href="{FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;650;700;750;800&display=swap">
<style>
{css}
{extra}
</style>
</head>
<body>
<div id="app"></div>
<script>
const LOGO = {json.dumps(logo, ensure_ascii=False)};
{data}
{app}
</script>
</body>
</html>
"""
out = os.path.join(HERE, "index.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(html)
print("built index.html:", len(html.encode("utf-8")), "bytes")
