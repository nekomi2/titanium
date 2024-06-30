import fs from 'fs/promises';
import {createWriteStream} from 'fs';
import path from 'path';
import { Readable } from 'stream';

const ffmpegFiles = [
  { name: 'ffmpeg-core.js', url: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm/ffmpeg-core.js' },
  { name: 'ffmpeg-core.wasm', url: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm/ffmpeg-core.wasm' },
];


async function downloadFile(url, destPath) {
  const response = await fetch(url);
  const ws = createWriteStream(destPath);
  const stream = response.body;
    if (!stream) {
      throw new Error('No stream found');
    }
    Readable.fromWeb(stream).pipe(ws);
    ws.on('finish', () => {
      console.log(`${destPath} downloaded successfully.`);
    });
}

async function checkAndDownloadFFmpeg() {
  const staticDir = path.join(process.cwd(), 'static', 'ffmpeg');

  try {
    await fs.access(staticDir);
  } catch {
    await fs.mkdir(staticDir, { recursive: true });
  }

  for (const file of ffmpegFiles) {
    const filePath = path.join(staticDir, file.name);
    try {
      await fs.access(filePath);
      console.log(`${file.name} already exists.`);
    } catch {
      console.log(`Downloading ${file.name}...`);
      await downloadFile(file.url, filePath);
      console.log(`${file.name} downloaded successfully.`);
    }
  }
}

checkAndDownloadFFmpeg().catch(console.error);