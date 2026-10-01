# Спортика · прототип · выкладка на sportika2.estvkus.ru

Статический сайт, сборка не нужна. Всё в папке `prototype/`:

| Путь | Что это |
|---|---|
| `index.html` | сплеш «Выберите концепцию», три карточки |
| `style2/index.html` | прототип из скриншотов Figma (78 экранов, светлая концепция) |
| `live/index.html` | живая вёрстка на токенах, 78 экранов + 12 шторок, переключатель стилей Спортика / ВК / Альфа |
| `style1/index.html` + `style1/img/` | «Стиль 1 · бенто»: 90 экранов из Figma (скриншоты @2x WebP, по набору на стиль), переключатель Спортика / ВК / Альфа |
| `deploy.sh` | rsync-выкладка |

В `index.html`, `live/` и `style2/` картинки встроены в HTML. `style1/` грузит экраны из `style1/img/{sp,vk,al}/*.webp` (≈14 МБ) — папку выкладывайте целиком. Внешнее — только шрифты Google Fonts.

## Быстро
```
# из корня распакованного архива:
./deploy.sh USER@sportika2.estvkus.ru /ПУТЬ/К/WEBROOT
```
Скрипт делает `rsync -avz --delete`. Если в webroot есть чужие файлы, укажите подпапку или уберите `--delete`.

## Без скрипта
```
rsync -avz --exclude deploy.sh --exclude README-DEPLOY.md ./ USER@sportika2.estvkus.ru:/ПУТЬ/К/WEBROOT/
```
или загрузите содержимое папки по SFTP с сохранением структуры.

## Требования к серверу
- отдаёт `index.html` для папок (`/live/`, `/style1/`, `/style2/`): стандартно для nginx (`index index.html;`) и Apache;
- отдаёт `.webp` с типом `image/webp` (в nginx и Apache есть по умолчанию);
- HTTPS.

## Проверка после выкладки
- `https://sportika2.estvkus.ru/` : сплеш с тремя карточками;
- `https://sportika2.estvkus.ru/live/` : слева три кнопки стилей, на экране онбординг, «Далее» ведёт дальше;
- `https://sportika2.estvkus.ru/live/#vk/prizes` : сразу ВК-стиль и экран «Призы» (`#alfa/c01`, `#sportika/h02`);
- `https://sportika2.estvkus.ru/style1/` : «Стиль 1 · бенто», слева три кнопки стилей, на экране «Выбор стиля»;
- `https://sportika2.estvkus.ru/style1/#vk/03_02` : сразу ВК-стиль и главная (`#alfa/09_01` — призы, `#sportika/07_01` — челленджи);
- `https://sportika2.estvkus.ru/style2/` : старый прототип.

Репозиторий: Adwant/Testclaude, ветки `claude/elegant-edison-vva1dc` (live, style2) и `claude/adoring-cray-h45g4b` (style1).
