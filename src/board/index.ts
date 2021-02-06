import produce from 'immer';
import {
  turnOver,
  isKindValue,
  isPiece,
  isUpperCaseKindValue,
  KIND_VALUE,
  LOWERCASE_KIND,
  Piece,
  SHOW_PROMOTE,
  UPPERCASE_KIND,
  UPPERCASE_KIND_VALUE,
  isUpperPiece,
  UPPERCASE_PIECE,
} from '../piece';
import { MOVABLE_RELATIVE_POSITIONS } from '../piece/moves';
import {
  Board,
  Hands,
  HorizontalMove,
  INITIAL_BOARD,
  isHorizontalMove,
  isPoint,
  isVerticalMove,
  Move,
  Point,
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

export function getIndex({ x, y }: { x: number; y: number }): number {
  if (x < 1 || x > 9 || y < 1 || y > 9) {
    throw new Error('selected Position is out of bounds');
  }
  return 9 - x + (y - 1) * 9;
}

function getPointFromSfen(sfenPointSelector: SfenPointSelector) {
  const xAxis = Number(sfenPointSelector.slice(0, 1)) as X_AXIS;
  const yAxis = sfenPointSelector.slice(1, 2) as keyof typeof Y_AXIS;
  return { x: xAxis, y: Y_AXIS[yAxis] };
}
export function getPointFromIndex(index: number): Point {
  const x = 9 - (index % 9);
  const y = (index - (index % 9)) / 9 + 1;
  return { x, y };
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
    editMode = false,
  }: {
    squareStr: string;
    handsStr: string;
    turn: string;
    editMode?: boolean;
  } = INITIAL_BOARD.HIRATE,
): Board {
  const squareList = initSquare(squareStr);
  const hands = initHands(handsStr);
  const isSenteTurn = turn === 'w';
  return { squareList, hands, isSenteTurn, editMode };
}
export function moveBoard(board: Board, move: Move): Board {
  return produce(board, (draftBoard) => {
    if (!board.editMode) {
      draftBoard.isSenteTurn = !board.isSenteTurn;
    }
    if (move.slice(1, 2) === '*') {
      // always uppercase
      const piece = move.slice(0, 1);
      if (!isPiece(piece) || !isUpperCaseKindValue(piece)) {
        throw Error(`${piece} is incollect sfen`);
      } else {
        const to = move.slice(2, 4) as SfenPointSelector;
        const toIndex = getIndex(getPointFromSfen(to));
        if (board.isSenteTurn) {
          draftBoard.squareList[toIndex] = piece;
          draftBoard.hands[piece] -= 1;
        } else {
          const turnOveredPiece = turnOver(piece) as KIND_VALUE;
          draftBoard.squareList[toIndex] = turnOveredPiece;
          draftBoard.hands[turnOveredPiece] -= 1;
        }
      }
      return draftBoard;
    }
    const from = move.slice(0, 2) as SfenPointSelector;
    const fromIndex = getIndex(getPointFromSfen(from));
    const piece = selectPiece(board.squareList, fromIndex);
    draftBoard.squareList[fromIndex] = '';

    const to = move.slice(2, 4) as SfenPointSelector;
    const toIndex = getIndex(getPointFromSfen(to));
    const toPiece = selectPiece(board.squareList, toIndex);
    if (toPiece !== '') {
      const pieceForHands = !isKindValue(toPiece)
        ? (toPiece.slice(1.2) as KIND_VALUE)
        : toPiece;
      // not check for piece is opposite
      draftBoard.hands[turnOver(pieceForHands) as KIND_VALUE] += 1;
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
  from,
  to,
  promote = false,
}: {
  from: number | Point;
  to: number | Point;
  promote?: boolean;
}): HorizontalMove {
  let [fromX, fromY, toX, toY] = [0, 0, 0, 0];
  if (isPoint(from)) {
    if (!isPoint(to)) {
      throw Error('when "from" is Point, "to" must be Point');
    }
    fromX = from.x;
    fromY = from.y;
    toX = to.x;
    toY = to.y;
  } else {
    if (isPoint(to)) {
      throw Error('when "from" is Point, "to" must be Point');
    }
    const fromPoint = getPointFromIndex(from);
    fromX = fromPoint.x;
    fromY = fromPoint.y;
    const toPoint = getPointFromIndex(to);
    toX = toPoint.x;
    toY = toPoint.y;
  }
  const fromSfen = `${fromX}${convertNumToAlphabet(fromY)}`;
  const toSfen = `${toX}${convertNumToAlphabet(toY)}`;
  const suffix: SHOW_PROMOTE = promote ? '+' : '';
  const move = `${fromSfen}${toSfen}${suffix}`;
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
  to,
}: {
  piece: UPPERCASE_KIND_VALUE;
  to: number | Point;
}): VerticalMove {
  let [toX, toY] = [0, 0];
  if (isPoint(to)) {
    toX = to.x;
    toY = to.y;
  } else {
    const toPoint = getPointFromIndex(to);
    toX = toPoint.x;
    toY = toPoint.y;
  }
  const toSfen = `${toX}${convertNumToAlphabet(toY)}`;
  const move = `${piece}*${toSfen}`;
  if (!isVerticalMove(move)) {
    throw Error(`${move} is not vertical move`);
  } else {
    return move;
  }
}

export function promoteOrFlipPieceOnSquareList(
  board: Board,
  newState: Piece,
  position: number,
): Board {
  return produce(board, (draftBoard) => {
    draftBoard.squareList[position] = newState;
  });
}

export function getExistPieceFromHands(
  hands: Hands,
): { senteExistHands: Partial<Hands>; goteExistHands: Partial<Hands> } {
  const senteExistHands = Object.values(UPPERCASE_KIND)
    .filter((kind) => hands[kind])
    .reduce(
      (acc, kind) => ({ ...acc, [kind]: hands[kind] }),
      {} as Partial<Hands>,
    );
  const goteExistHands = Object.values(LOWERCASE_KIND)
    .filter((kind) => hands[kind])
    .reduce(
      (acc, kind) => ({ ...acc, [kind]: hands[kind] }),
      {} as Partial<Hands>,
    );
  return { senteExistHands, goteExistHands };
}

export function getMovablePoints(board: Board, point: Point): Array<Point> {
  const piece = selectPiece(board.squareList, point);
  if (piece === '') {
    return [];
  }
  const isUpper = isUpperPiece(piece);
  const isOppositePiece = (p: Piece) =>
    isUpper ? !isUpperPiece(p) : isUpperPiece(p);
  const key = isUpper
    ? (piece as UPPERCASE_PIECE)
    : (turnOver(piece) as UPPERCASE_PIECE);
  const movableRelativePositions = MOVABLE_RELATIVE_POSITIONS[key];
  return movableRelativePositions.reduce((acc, positionCandidates) => {
    const results = [] as Array<Point>;
    for (const relativePoints of positionCandidates) {
      // shogi board is (x,y) starts upper right
      const x = isUpper
        ? point.x - relativePoints[0]
        : point.x + relativePoints[0];
      const y = isUpper
        ? point.y - relativePoints[1]
        : point.y + relativePoints[1];
      if (x > 9 || x < 1 || y > 9 || y < 1) {
        continue;
      }
      const piece = selectPiece(board.squareList, { x, y });
      if (piece === '') {
        results.push({ x, y });
      } else if (isOppositePiece(piece)) {
        results.push({ x, y });
        break;
      } else {
        break;
      }
    }
    return [...acc, ...results];
  }, [] as Array<Point>);
}

export function getDropablePoints(board: Board, piece: Piece): Array<Point> {
  return board.squareList.reduce((acc, square, index) => {
    const point = getPointFromIndex(index);
    if (
      square ||
      isNifu(board.squareList, point, piece) ||
      cannotMoreMove(point, piece)
    ) {
      return acc;
    } else {
      return [...acc, point];
    }
  }, [] as Array<Point>);
}

function isNifu(squareList: SquareList, point: Point, piece: Piece): boolean {
  if (piece !== LOWERCASE_KIND.FU && piece !== UPPERCASE_KIND.FU) {
    return false;
  }
  return squareList
    .filter((_, index) => getPointFromIndex(index).x === point.x)
    .some((square) => square === piece);
}

function cannotMoreMove(point: Point, piece: Piece): boolean {
  switch (piece) {
    case UPPERCASE_KIND.FU:
    case UPPERCASE_KIND.KYOSHA:
      return point.y === 1;
    case UPPERCASE_KIND.KEIMA:
      return point.y <= 2;
    case LOWERCASE_KIND.FU:
    case LOWERCASE_KIND.KYOSHA:
      return point.y === 9;
    case LOWERCASE_KIND.KEIMA:
      return point.y >= 8;
    default:
      return false;
  }
}
