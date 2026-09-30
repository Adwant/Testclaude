# Спортика · прототип · выкладка на sportika2.estvkus.ru

Статический сайт, сборка не нужна. Всё в папке `prototype/`:

| Путь | Что это |
|---|---|
| `index.html` | сплеш «Выберите концепцию», две карточки |
| `style2/index.html` | прототип из скриншотов Figma (78 экранов, светлая концепция) |
| `live/index.html` | живая вёрстка на токенах, 78 экранов + 12 шторок, переключатель стилей Спортика / ВК / Альфа |
| `deploy.sh` | rsync-выкладка |

Картинки встроены в HTML, внешних файлов нет (кроме шрифтов Google Fonts).

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
- отдаёт `index.html` для папок (`/live/`, `/style2/`): стандартно для nginx (`index index.html;`) и Apache;
- HTTPS.

## Проверка после выкладки
- `https://sportika2.estvkus.ru/` : сплеш с двумя карточками;
- `https://sportika2.estvkus.ru/live/` : слева три кнопки стилей, на экране онбординг, «Далее» ведёт дальше;
- `https://sportika2.estvkus.ru/live/#vk/prizes` : сразу ВК-стиль и экран «Призы» (`#alfa/c01`, `#sportika/h02`);
- `https://sportika2.estvkus.ru/style2/` : старый прототип.

Репозиторий: Adwant/Testclaude, ветка `claude/elegant-edison-vva1dc`.
