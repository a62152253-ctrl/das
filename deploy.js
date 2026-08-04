import ftp from "basic-ftp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deploy() {
  const client = new ftp.Client();

  client.ftp.verbose = true;
  client.ftp.socketTimeout = 30000;

  const FTP_HOST = process.env.FTP_HOST;
  const FTP_USER = process.env.FTP_USER;
  const FTP_PASS = process.env.FTP_PASS;
  const FTP_PORT = Number(process.env.FTP_PORT) || 21;
  const FTP_SECURE = process.env.FTP_SECURE === "true";
  const REMOTE_DIR = process.env.REMOTE_DIR || "/";

  if (!FTP_HOST || !FTP_USER || !FTP_PASS) {
    console.error("❌ Missing FTP configuration");
    process.exit(1);
  }

  const localPath = path.resolve(__dirname, "dist");

  if (!fs.existsSync(localPath)) {
    console.error("❌ dist folder not found. Run: npm run build");
    process.exit(1);
  }

  try {
    console.log(`🔐 Connecting to ${FTP_HOST}:${FTP_PORT}`);

    await client.access({
      host: FTP_HOST,
      port: FTP_PORT,
      user: FTP_USER,
      password: FTP_PASS,
      secure: FTP_SECURE,
    });

    console.log("✅ FTP login successful");

    await client.ensureDir(REMOTE_DIR);
    await client.cd(REMOTE_DIR);

    console.log(`📂 Remote directory: ${await client.pwd()}`);

    console.log("🧹 Cleaning old files...");

    const oldFiles = await client.list();

    for (const file of oldFiles) {
      if (file.name === "." || file.name === "..") continue;

      try {
        if (file.isDirectory) {
          await client.removeDir(file.name);
          console.log(`🗑 Removed folder: ${file.name}`);
        } else {
          await client.remove(file.name);
          console.log(`🗑 Removed file: ${file.name}`);
        }
      } catch {
        console.log(`⚠️ Skipped: ${file.name}`);
      }
    }

    console.log(`📦 Uploading: ${localPath}`);

    await client.uploadFromDir(localPath);

    console.log("🔎 Checking uploaded files...");

    const uploaded = await client.list();

    console.table(
      uploaded.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      }))
    );

    const hasIndex = uploaded.some(
      (file) => file.name === "index.html"
    );

    if (!hasIndex) {
      throw new Error("index.html missing after upload!");
    }

    console.log("✅ index.html found");
    console.log("🚀 Deployment completed!");

  } catch (error) {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exitCode = 1;

  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

deploy();