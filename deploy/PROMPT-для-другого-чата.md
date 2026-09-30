Выложи статический сайт на sportika2.estvkus.ru.

Архив: deploy/sportika-prototype.zip в репозитории Adwant/Testclaude, ветка claude/elegant-edison-vva1dc
(git fetch origin claude/elegant-edison-vva1dc && git checkout FETCH_HEAD -- deploy).

1. Распакуй архив: внутри index.html, style2/, live/, deploy.sh, README-DEPLOY.md.
2. Залей содержимое в webroot sportika2.estvkus.ru по ssh:
   rsync -avz --exclude deploy.sh --exclude README-DEPLOY.md ./ USER@HOST:/WEBROOT/
   Не используй --delete, пока не убедишься, что в webroot нет чужих файлов.
3. Проверь: / (сплеш с двумя карточками), /live/ (живой прототип, переключатель стилей слева), /style2/ (старый прототип).
Подробности: README-DEPLOY.md в архиве.
