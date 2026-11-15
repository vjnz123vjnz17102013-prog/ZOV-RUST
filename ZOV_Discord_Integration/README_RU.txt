# ZOV — сайт заявок с отправкой в Discord

## Что это
Готовый небольшой Node.js-сайт. Анкета отправляется на сервер, а сервер пересылает её в Discord через webhook. Секретный URL не находится в браузерном коде.

## Важно: сначала обнови webhook
Ссылка webhook была опубликована в переписке. Удали старый webhook в Discord и создай новый. Не вставляй новый URL в `index.html`, `server.js` или этот архив.

## Локальный запуск
Нужен Node.js 18 или новее.

Windows PowerShell:
```powershell
$env:DISCORD_WEBHOOK_URL="ВСТАВЬ_НОВЫЙ_WEBHOOK_URL"
npm start
```
Открой http://localhost:3000

macOS / Linux:
```bash
DISCORD_WEBHOOK_URL="ВСТАВЬ_НОВЫЙ_WEBHOOK_URL" npm start
```

## Публикация в интернете
Загрузи содержимое папки проекта на хостинг, который поддерживает Node.js (например, Render или Railway).
- Build command: можно оставить пустым
- Start command: `npm start`
- Добавь переменную окружения:
  - Name: `DISCORD_WEBHOOK_URL`
  - Value: новый URL вебхука из Discord

Не добавляй URL в публичные файлы и не отправляй его в чат. После публикации проверь анкету тестовой заявкой.

## Куда приходят заявки
В канал Discord, к которому привязан webhook. Webhook не отправляет личное сообщение пользователю Discord по нику. Для личных сообщений нужен отдельный Discord-бот и его настройка.
