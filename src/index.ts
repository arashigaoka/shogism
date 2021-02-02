import produce from 'immer';

export const LOWERCASE_KIND = {
  FU: 'p',
  KYOSHA: 'l',
  KEIMA: 'n',
  GIN: 's',
  KIN: 'k',
  KAKU: 'b',
  FI: 'r',
  OU: 'g',
} as const;
export type LOWERCASE_KIND_VALUE = typeof LOWERCASE_KIND[keyof typeof LOWERCASE_KIND];
export function isLowerCaseKindValue(
  target: string,
): target is LOWERCASE_KIND_VALUE {
  return Object.values(LOWERCASE_KIND).some((kind) => kind === target);
}

export const UPPERCASE_KIND: {
  [key in keyof typeof LOWERCASE_KIND]: Uppercase<LOWERCASE_KIND_VALUE>;
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
export type UPPERCASE_KIND_VALUE = typeof UPPERCASE_KIND[keyof typeof UPPERCASE_KIND];
export function isUpperCaseKindValue(
  target: string,
): target is UPPERCASE_KIND_VALUE {
  return Object.values(UPPERCASE_KIND).some((kind) => kind === target);
}
export type KIND_VALUE = LOWERCASE_KIND_VALUE | UPPERCASE_KIND_VALUE;

export type SHOW_PROMOTE = '+' | '';

export type Piece = `${SHOW_PROMOTE}${KIND_VALUE}`;
function isPiece(str: string): str is Piece {
  const target = str && str.startsWith('+') ? str.slice(1) : str;
  return isLowerCaseKindValue(target) || isUpperCaseKindValue(target);
}
function isKindValue(piece: Piece): piece is KIND_VALUE {
  return !piece.startsWith('+');
}
export type SquareList = Array<Piece | ''>;

export function flip(kind: KIND_VALUE): KIND_VALUE {
  if (isUpperCaseKindValue(kind)) {
    return kind.toLowerCase() as LOWERCASE_KIND_VALUE;
  } else {
    return kind.toUpperCase() as UPPERCASE_KIND_VALUE;
  }
}

export function initSquare(sfen: string): SquareList {
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
    }, []);
  return board;
}

export function toPrettierString(squareList: SquareList): string {
  return squareList
    .map((piece) => (piece === '' ? '.' : piece))
    .reduce((acc, value, i) => {
      if (i % 9 === 8) {
        return acc + value + '\n';
      } else {
        return acc + value;
      }
    }, '');
}

export function toSquareStr(squareList: SquareList): string {
  return squareList.reduce((acc: string, value, i) => {
    const suffix = i % 9 === 8 && i !== 80 ? '/' : '';
    if (value === '') {
      const end = Number(acc[acc.length - 1]);
      if (isNaN(end)) {
        return acc + 1 + suffix;
      } else {
        return acc.slice(0, -1) + (Number(end) + 1) + suffix;
      }
    }
    return acc + value + suffix;
  }, '');
}

export function selectPiece(
  squareList: SquareList,
  position: number | { x: number; y: number },
): Piece | '' {
  if (typeof position === 'number') {
    if (position < 0 || position > 80) {
      throw new Error('selected Position is out of bounds');
    }
    return squareList[position];
  }
  const index = getIndex(position);
  return squareList[index];
}

function getIndex({ x, y }: { x: number; y: number }): number {
  if (x < 1 || x > 9 || y < 1 || y > 9) {
    throw new Error('selected Position is out of bounds');
  }
  return 9 - x + (y - 1) * 9;
}

type X_AXIS = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
const Y_AXIS = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  i: 9,
};
export type SfenPointSelector = `${X_AXIS}${keyof typeof Y_AXIS}`;
export type Move =
  | `${SfenPointSelector}${SfenPointSelector}${SHOW_PROMOTE}`
  | `${UPPERCASE_KIND_VALUE}*${SfenPointSelector}`;

function getPoint(sfenPointSelector: SfenPointSelector) {
  const xAxis = Number(sfenPointSelector.slice(0, 1)) as X_AXIS;
  const yAxis = sfenPointSelector.slice(1, 2) as keyof typeof Y_AXIS;
  return { x: xAxis, y: Y_AXIS[yAxis] };
}

type Hands = {
  // gote
  [key in LOWERCASE_KIND_VALUE | UPPERCASE_KIND_VALUE]: number;
};

export function initHands(handsStr: string): Hands {
  const lowKindValues = Object.values(LOWERCASE_KIND);
  const upperKindValues = Object.values(UPPERCASE_KIND);
  const hands = [...lowKindValues, ...upperKindValues].reduce(
    (acc: Hands, value) => {
      const index = handsStr.indexOf(value);
      if (index < 0) {
        return { ...acc, [value]: 0 };
      }
      if (index === 0) {
        return { ...acc, [value]: 1 };
      }
      const num = Number(handsStr[index - 1]);
      if (isNaN(num)) {
        return { ...acc, [value]: 1 };
      } else {
        return { ...acc, [value]: num };
      }
    },
    {} as Hands,
  );
  return hands;
}

type Board = {
  readonly squareList: SquareList;
  readonly hands: Hands;
  readonly isSenteTurn: boolean;
};

export function initBoard(
  squareStr = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL',
  handsStr = '',
  turn = 'w',
): Board {
  const squareList = initSquare(squareStr);
  const hands = initHands(handsStr);
  const isSenteTurn = turn === 'w';
  return { squareList, hands, isSenteTurn };
}
export function moveBoard(board: Board, move: Move): Board {
  return produce(board, (draftBoard) => {
    draftBoard.isSenteTurn = !board.isSenteTurn;
    if (move.slice(1, 2) === '*') {
      // always uppercase
      const piece = move.slice(0, 1);
      if (!isPiece(piece) || !isUpperCaseKindValue(piece)) {
        throw Error(`${piece} is incollect sfen`);
      } else {
        const to = move.slice(2, 4) as SfenPointSelector;
        const toIndex = getIndex(getPoint(to));
        if (board.isSenteTurn) {
          draftBoard.squareList[toIndex] = piece;
          draftBoard.hands[piece] -= 1;
        } else {
          draftBoard.squareList[toIndex] = flip(piece);
          draftBoard.hands[flip(piece)] -= 1;
        }
      }
      return draftBoard;
    }
    const from = move.slice(0, 2) as SfenPointSelector;
    const fromIndex = getIndex(getPoint(from));
    const piece = selectPiece(board.squareList, fromIndex);
    draftBoard.squareList[fromIndex] = '';

    const to = move.slice(2, 4) as SfenPointSelector;
    const toIndex = getIndex(getPoint(to));
    const toPiece = selectPiece(board.squareList, toIndex);
    if (toPiece !== '') {
      const pieceForHands = !isKindValue(toPiece)
        ? (toPiece.slice(1.2) as KIND_VALUE)
        : toPiece;
      // not check for piece is opposite
      draftBoard.hands[flip(pieceForHands)] += 1;
    }
    const showPromote = move.slice(4, 5);
    if (showPromote === '+') {
      const promotedPiece = showPromote + piece;
      if (!isPiece(promotedPiece)) {
        throw Error(promotedPiece);
      }
      draftBoard.squareList[toIndex] = promotedPiece;
    } else {
      draftBoard.squareList[toIndex] = piece;
    }
    return draftBoard;
  });
}
