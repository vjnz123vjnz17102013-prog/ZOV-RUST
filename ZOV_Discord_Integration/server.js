const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const PUBLIC_DIR = path.join(__dirname, "public");

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "X-Content-Type-Options": "nosniff" });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

function clean(value, max = 500) {
  return String(value ?? "").trim().slice(0, max).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/applications") {
    if (!WEBHOOK_URL || !/^https:\/\/discord\.com\/api\/webhooks\//.test(WEBHOOK_URL)) {
      return send(res, 503, { error: "Отправка заявок пока не настроена администратором." });
    }

    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > 12000) req.destroy();
    });
    req.on("end", async () => {
      try {
        const data = JSON.parse(raw || "{}");
        const age = Number(data.age);
        const hours = Number(data.hours);
        const player = clean(data.player, 40);
        const role = clean(data.role, 80);
        const discord = clean(data.discord, 50);
        const about = clean(data.about, 500) || "Не указано";

        if (!player || !role || !discord || !Number.isInteger(age) || age < 10 || age > 99 ||
            !Number.isInteger(hours) || hours < 0 || hours > 100000) {
          return send(res, 400, { error: "Проверь заполнение анкеты и попробуй ещё раз." });
        }

        const payload = {
          username: "ZOV | Заявки",
          allowed_mentions: { parse: [] },
          embeds: [{
            title: "🛡️ Новая заявка в клан ZOV",
            color: 14786874,
            fields: [
              { name: "Имя / ник", value: player, inline: true },
              { name: "Возраст", value: String(age), inline: true },
              { name: "Часы в Rust", value: String(hours), inline: true },
              { name: "Желаемая роль", value: role, inline: true },
              { name: "Discord игрока", value: discord, inline: true },
              { name: "О себе", value: about, inline: false }
            ],
            footer: { text: "ZOV Rust Clan • Новая анкета" },
            timestamp: new Date().toISOString()
          }]
        };

        const discordResponse = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!discordResponse.ok) {
          console.error("Discord webhook returned", discordResponse.status);
          return send(res, 502, { error: "Discord не принял заявку. Попробуй позже." });
        }
        return send(res, 200, { ok: true, message: "Заявка отправлена в Discord!" });
      } catch (err) {
        console.error("Application error:", err.message);
        return send(res, 400, { error: "Не удалось обработать заявку." });
      }
    });
    return;
  }

  if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });

  const requested = req.url === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]);
  const filePath = path.resolve(PUBLIC_DIR, "." + requested);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) return send(res, 403, { error: "Forbidden" });

  fs.readFile(filePath, (err, content) => {
    if (err) return send(res, 404, "Not found", "text/plain; charset=utf-8");
    res.writeHead(200, {
      "Content-Type": mime[path.extname(filePath)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff"
    });
    res.end(content);
  });
});

server.listen(PORT, () => console.log(`ZOV site running on port ${PORT}`));
