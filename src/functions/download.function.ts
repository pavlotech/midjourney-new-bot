import axios from "axios";
import fs from 'fs';

export async function downloadAndSaveFile (url: string, fileName: string) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(fileName);
  response.data.pipe(writer);

  return new Promise<void>((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}
export async function downloadAndSavePhoto (photoUrl: string, fileId: string) {
  const fileName = `${fileId}.jpg`; // Имя файла будет соответствовать fileId
  await downloadAndSaveFile(photoUrl, `photos/${fileName}`);
  return fileName;
}