import * as fs from 'fs';

export const checkList = (word: string) => {
  const bannedWords = fs.readFileSync('banList.txt', 'utf-8').split('\r\n');
  const regex = new RegExp(`\\b${word}\\b`, 'i');
  for (const bannedWord of bannedWords) {
    if (regex.test(bannedWord)) return true
  }
  return false;
}
export const checkAndCorrectHyphen = (text: string) => {
  if (text.includes('-') && !text.includes('--')) {
    text = text.replace('-', '--');
  }
  return text;
}