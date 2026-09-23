// 本機預覽：node scripts/serve.mjs [port]，預設 http://127.0.0.1:5050
// 一律不快取，重新建置後重新整理就能看到最新結果。

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {ROOT} from "./util.mjs";

const DIST = path.join(ROOT, "dist");
const PORT = Number(process.argv[2] || 5050);
const TYPES = {
	".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
	".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
	".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".mp3": "audio/mpeg", ".webmanifest": "application/manifest+json",
	".xml": "application/xml",
};

http.createServer((req, res) => {
	let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
	if (p.endsWith("/")) p += "index.html";
	const file = path.join(DIST, path.normalize(p));
	if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
	fs.stat(file, (err, st) => {
		if (err || !st.isFile()) { res.writeHead(404).end("Not found"); return; }
		res.writeHead(200, {
			"Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
			"Content-Length": st.size,
			"Cache-Control": "no-store",
		});
		fs.createReadStream(file).pipe(res);
	});
}).listen(PORT, "127.0.0.1", () => console.log(`http://127.0.0.1:${PORT}/`));
