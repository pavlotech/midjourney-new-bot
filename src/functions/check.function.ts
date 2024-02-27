import * as fs from 'fs';

export const checkList = (word: string) => {
  const bannedWords = fs.readFileSync('banList.txt', 'utf-8').split('\r\n');
  return bannedWords.includes(`${word.toLowerCase()}`);
}
export const checkAndCorrectHyphen = (text: string) => {
  if (text.includes('-v') && !text.includes('--')) {
    text = text.replace('-v', '--v');
  }
  return text;
}
