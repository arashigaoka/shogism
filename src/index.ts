export const RAW_KIND = {
  FU: 'p',
  KYOSHA: 'l',
  KEIMA: 'n',
  GIN: 's',
  KIN: 'k',
  KAKU: 'b',
  FI: 'r',
  OU: 'g',
} as const;
export type RAW_KIND_VALUE = typeof RAW_KIND[keyof typeof RAW_KIND];
export const PROMOTE_KIND: {
  [key in keyof typeof RAW_KIND]: Uppercase<RAW_KIND_VALUE>;
} = {
  FU: 'P',
  KYOSHA: 'L',
  KEIMA: 'N',
  GIN: 'S',
  KIN: 'K',
  KAKU: 'B',
  FI: 'R',
  OU: 'G',
} as const;
export type PROMOTE_KIND_VALUE = typeof PROMOTE_KIND[keyof typeof PROMOTE_KIND];
export type KIND_VALUE = RAW_KIND_VALUE | PROMOTE_KIND_VALUE;

export type SHOW_PROMOTE = '+' | '';

export type Piece = `${SHOW_PROMOTE}${KIND_VALUE}` | '';
function isPiece(str: string): str is Piece {
  return (
    Object.values(RAW_KIND).some((kind) => kind === str) ||
    Object.values(PROMOTE_KIND).some((kind) => kind === str)
  );
}
export type Board = Array<Piece>;

export function flip(kind: RAW_KIND_VALUE): PROMOTE_KIND_VALUE {
  return kind.toUpperCase() as PROMOTE_KIND_VALUE;
}

export function initializeBoard(sfen: string): Board {
  const board = sfen
    .split('')
    .filter((str) => str !== '/')
    .reduce((acc: Piece[], str) => {
      const num = Number(str);
      if (!isNaN(num)) {
        const arr = [...Array(num)].map(() => {
          return '' as Piece;
        });
        return [...acc, ...arr];
      }
      if (isPiece(str)) {
        return [...acc, str];
      } else {
        throw new Error(`${str} is invalid sfen`);
      }
    }, [] as Piece[]);
  return board;
}

export function toPrettierString(board: Board): string {
  return board
    .map((piece) => (piece === '' ? '.' : piece))
    .reduce((acc, value, i) => {
      if (i % 9 === 8) {
        return acc + value + '\n';
      } else {
        return acc + value;
      }
    }, '');
}
