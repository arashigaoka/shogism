import produce from 'immer';
import {
  flip,
  isKindValue,
  isPiece,
  isUpperCaseKindValue,
  KIND_VALUE,
  LOWERCASE_KIND,
  Piece,
  SHOW_PROMOTE,
  UPPERCASE_KIND,
  UPPERCASE_KIND_VALUE,
} from '../piece';
import {
  Board,
  Hands,
  HorizontalMove,
  INITIAL_SQUARE,
  isHorizontalMove,
  isVerticalMove,
  Move,
  SfenPointSelector,
  SquareList,
  VerticalMove,
  X_AXIS,
  Y_AXIS,
} from './types';

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

function getPoint(sfenPointSelector: SfenPointSelector) {
  const xAxis = Number(sfenPointSelector.slice(0, 1)) as X_AXIS;
  const yAxis = sfenPointSelector.slice(1, 2) as keyof typeof Y_AXIS;
  return { x: xAxis, y: Y_AXIS[yAxis] };
}

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

export function initBoard(
  {
    squareStr,
    handsStr,
    turn,
  }: {
    squareStr: string;
    handsStr: string;
    turn: string;
  } = {
    squareStr: INITIAL_SQUARE.HIRATE,
    handsStr: '',
    turn: 'w',
  },
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

export function createHorizontalMove({
  fromX,
  fromY,
  toX,
  toY,
  promote = false,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  promote?: boolean;
}): HorizontalMove {
  const from = `${fromX}${convertNumToAlphabet(fromY)}`;
  const to = `${toX}${convertNumToAlphabet(toY)}`;
  const suffix: SHOW_PROMOTE = promote ? '+' : '';
  const move = `${from}${to}${suffix}`;
  if (!isHorizontalMove(move)) {
    throw Error(`${move} is not horizontalmove`);
  } else {
    return move;
  }
}
export function convertNumToAlphabet(num: number): string | undefined {
  return Object.entries(Y_AXIS).find(([, value]) => value === num)?.[0];
}

export function createVerticalMove({
  piece,
  toX,
  toY,
}: {
  piece: UPPERCASE_KIND_VALUE;
  toX: number;
  toY: number;
}): VerticalMove {
  const to = `${toX}${convertNumToAlphabet(toY)}`;
  const move = `${piece}*${to}`;
  if (!isVerticalMove(move)) {
    throw Error(`${move} is not vertical move`);
  } else {
    return move;
  }
}
