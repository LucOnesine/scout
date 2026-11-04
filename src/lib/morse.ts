export const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..',
  J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
  '6': '-....', '7': '--...', '8': '---..', '9': '----.', ' ': '/',
};

const MORSE_REV: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE).map(([key, value]) => [value, key]),
);

type MorseCell = { l: string; c: string };

export const toMorse = (text: string, table?: MorseCell[]) => {
  const custom = table?.length
    ? Object.fromEntries(table.map(({ l, c }) => [l.toUpperCase(), c]))
    : null;
  return text
    .toUpperCase()
    .split('')
    .map((char) => custom?.[char] ?? MORSE[char] ?? '?')
    .join(' ');
};

export const fromMorse = (code: string, table?: MorseCell[]) => {
  const reverse = table?.length
    ? Object.fromEntries(table.map(({ l, c }) => [c, l.toUpperCase()]))
    : MORSE_REV;
  return code
    .trim()
    .split(' ')
    .map((char) => reverse[char] ?? char)
    .join('');
};
