// 把 dist/ 發佈到 Cloudflare（https://5etools-zh.graphia.workers.dev/）
//   node scripts/deploy.mjs               用 wrangler 上傳到 Cloudflare
//   node scripts/deploy.mjs --gh-pages    改發佈到 gh-pages 分支（GitHub Pages）
//   node scripts/deploy.mjs --gh-pages --no-push  只 commit，不 push
import {execFileSync} from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {ROOT} from "./util.mjs";

const BRANCH = "gh-pages";
const DIST = path.join(ROOT, "dist");
const WT = path.join(ROOT, ".deploy");
const isPush = !process.argv.includes("--no-push");

const sh = (args, cwd = ROOT) => execFileSync("git", args, {cwd, stdio: "inherit"});
const out = (args, cwd = ROOT) => execFileSync("git", args, {cwd, encoding: "utf8"}).trim();

if (!fs.existsSync(path.join(DIST, "index.html"))) throw new Error("找不到 dist/，請先執行 node scripts/build.mjs");

if (!process.argv.includes("--gh-pages")) {
	// 設定在 wrangler.jsonc（assets.directory 指向 dist/）
	execFileSync("npx", ["-y", "wrangler@4.153.0", "deploy"], {cwd: ROOT, stdio: "inherit"});
	console.log("已部署到 https://5etools-zh.graphia.workers.dev/");
	process.exit(0);
}

// gh-pages 放在獨立的 worktree（.deploy/），不影響主分支
if (!fs.existsSync(WT)) {
	const hasLocal = !!out(["branch", "--list", BRANCH]);
	let hasRemote = false;
	try { hasRemote = !!out(["ls-remote", "--heads", "origin", BRANCH]); } catch { /* 還沒設 remote */ }

	if (hasLocal) sh(["worktree", "add", WT, BRANCH]);
	else if (hasRemote) {
		sh(["fetch", "origin", BRANCH]);
		sh(["worktree", "add", "-b", BRANCH, WT, `origin/${BRANCH}`]);
	} else {
		sh(["worktree", "add", "--detach", WT]);
		sh(["checkout", "--orphan", BRANCH], WT);
		sh(["rm", "-rfq", "."], WT);
	}
}

execFileSync("rsync", ["-a", "--delete", "--exclude", ".git", `${DIST}/`, `${WT}/`], {stdio: "inherit"});
// 不讓 GitHub Pages 跑 Jekyll（會略過底線開頭的檔案，也比較慢）
fs.writeFileSync(path.join(WT, ".nojekyll"), "");

sh(["add", "-A"], WT);
if (!out(["status", "--porcelain"], WT)) {
	console.log("dist/ 沒有變更，不需要部署");
} else {
	const rev = out(["rev-parse", "--short", "HEAD"]);
	sh(["commit", "-qm", `部署 ${rev}`], WT);
	console.log(`已 commit 到 ${BRANCH}`);
}

// 大量檔案第一次推送偶爾會被 GitHub 中斷，重試幾次
if (isPush) {
	for (let i = 1; ; ++i) {
		try { sh(["push", "-u", "origin", BRANCH], WT); break; } catch (e) {
			if (i >= 3) throw e;
			console.log(`推送失敗，重試（${i}/3）…`);
		}
	}
	console.log("已部署，GitHub Pages 約一兩分鐘後更新");
}
