import {
  createHorizontalMove,
  createVerticalMove,
  getMovablePoints,
  getPointFromIndex,
  initBoard,
  moveBoard,
} from '../board';
import { Board, Move, Point, Y_AXIS } from '../board/types';
import { getReadableMove } from '../kifu';
import { Kifu, KifuMove } from '../kifu/types';
import {
  isUpperCaseKindValue,
  LOWERCASE_KIND_VALUE,
  PROMOTED_UPPER_KIND_VALUE,
  UPPERCASE_KIND_VALUE,
} from '../piece';
import { pipe } from '../util';
import { isKifu, ProcessingState } from './common';
import {
  ChineseNumber,
  convertZenToHan,
  KifToSfen,
  SfenToKif,
} from './kifParser';

const X_SPECIFIER = ['右', '左', '直'] as const;
type X_SPECIFIER = typeof X_SPECIFIER[number];
const Y_SPECIFIER = ['引', '上', '寄'] as const;
type Y_SPECIFIER = typeof Y_SPECIFIER[number];

export function parseKi2(ki2Str: string): Kifu {
  const lines = ki2Str
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((v) => v)
    .map((line) => line.trim());
  const enhancer = pipe(parseHeader, parseMoves);
  const { partialKifu: kifu } = enhancer({ partialKifu: {}, lines });
  if (!isKifu(kifu)) {
    throw Error('invalid ki2 file');
  } else {
    return kifu;
  }
}

function parseHeader({ lines }: ProcessingState): ProcessingState {
  const endIndex = lines.findIndex(
    (line) => line.startsWith('▲') || line.startsWith('△'),
  );
  if (endIndex === -1) {
    throw Error('cannot find move start');
  }
  const targetLine = lines.slice(0, endIndex);
  const sente = targetLine.find((line) => line.startsWith('先手'))?.slice(3);
  const gote = targetLine.find((line) => line.startsWith('後手'))?.slice(3);
  const header = { sente, gote };
  return { partialKifu: { header }, lines: lines.slice(endIndex) };
}

function parseMoves({ partialKifu, lines }: ProcessingState): ProcessingState {
  const endIndex = lines.findIndex((line) => line.startsWith('まで'));
  const targetLine = endIndex > 0 ? lines.slice(0, endIndex) : lines;
  return {
    partialKifu: { ...partialKifu, ...parseKi2Moves(targetLine) },
    lines: [],
  };
}
export function parseKi2Moves(
  lines: Array<string>,
): { boardList: Array<Board>; kifuMoves: Array<KifuMove> } {
  const board = initBoard();
  const movePattern = /(同|([１-９])([一二三四五六七八九]))[ |　]?([歩香桂銀金角飛玉王と杏圭全馬竜龍]|成香|成桂|成銀)([右左直]?[上寄引]?(?![右左直上寄引]))(不成|成|打?)/g;
  return lines
    .map((line) => Array.from(line.matchAll(movePattern)))
    .flat()
    .reduce(
      (acc, matchArr, index) => {
        try {
          if (!matchArr) {
            return acc;
          }
          let to: Point | null = null;
          if (matchArr[1] === '同') {
            const lastMove = acc.kifuMoves[acc.kifuMoves.length - 1].sfen;
            const y_axis_key = lastMove.slice(3, 4) as keyof typeof Y_AXIS;
            to = { x: Number(lastMove.slice(2, 3)), y: Y_AXIS[y_axis_key] };
          } else {
            const x = Number(convertZenToHan(matchArr[2]));
            const secondChar = matchArr[3] as keyof typeof ChineseNumber;
            const y = ChineseNumber[secondChar];
            to = { x, y };
          }
          const thirdChar = matchArr[4] as keyof typeof KifToSfen;
          const piece = KifToSfen[thirdChar];
          const board = acc.boardList[acc.boardList.length - 1];
          const specifier = matchArr[5];
          const xSpecifier = X_SPECIFIER.find((value) =>
            specifier?.includes(value),
          );
          const ySpecifier = Y_SPECIFIER.find((value) =>
            specifier?.includes(value),
          );
          const promoteOrDrop = matchArr[6];
          const promote = promoteOrDrop === '成';
          const isDrop = promoteOrDrop === '打';
          const from = isDrop
            ? null
            : detectStartingPoint(board, to, piece, xSpecifier, ySpecifier);
          // in case of from is null, piece must uppercaseKindValue
          const sfen: Move =
            from !== null
              ? (createHorizontalMove({ from, to, promote }) as Move)
              : (createVerticalMove({
                  piece: piece as UPPERCASE_KIND_VALUE,
                  to,
                }) as Move);
          const kif = getReadableMove({
            squareList: acc.boardList[acc.boardList.length - 1].squareList,
            currentMove: sfen,
            prevMove: acc.kifuMoves[acc.kifuMoves.length - 1]?.sfen,
          });
          const kifuMove = { sfen, kif };
          const newBoard = moveBoard(board, sfen);
          return {
            boardList: [...acc.boardList, newBoard],
            kifuMoves: [...acc.kifuMoves, kifuMove],
          };
        } catch (e) {
          throw Error(`Error occured during the parse of the ${index}th move
          ${e}`);
        }
      },
      { boardList: [board], kifuMoves: [] as Array<KifuMove> },
    );
}
// in case of horizontal move return starting Point
// in case of vertical move return null
function detectStartingPoint(
  board: Board,
  destinationPoint: Point,
  piece: UPPERCASE_KIND_VALUE | PROMOTED_UPPER_KIND_VALUE,
  xSpecifier?: X_SPECIFIER,
  ySpecifier?: Y_SPECIFIER,
): Point | null {
  const isSenteTurn = board.isSenteTurn;
  const possiblePoints = board.squareList.reduce((acc, square, index) => {
    if (
      (isSenteTurn && piece !== square) ||
      (!isSenteTurn && piece.toLowerCase() !== square)
    ) {
      return acc;
    }
    const movablePoints = getMovablePoints(board, getPointFromIndex(index));
    if (
      movablePoints.some(
        (point) =>
          point.x === destinationPoint.x && point.y === destinationPoint.y,
      )
    ) {
      return [...acc, getPointFromIndex(index)];
    } else {
      return acc;
    }
  }, [] as Array<Point>);
  if (possiblePoints.length === 0) {
    if (!isUpperCaseKindValue(piece)) {
      throw Error('invalid ki2 file');
    }
    const pieceInHands = isSenteTurn
      ? piece
      : (piece.toLowerCase() as LOWERCASE_KIND_VALUE);
    if (!board.hands[pieceInHands]) {
      throw Error(
        `${SfenToKif[piece]} does not exist in ${
          isSenteTurn ? 'sente' : 'gote'
        }hands.`,
      );
    }
    return null;
  }
  if (possiblePoints.length === 1) {
    return possiblePoints[0];
  }
  return filterPossiblePoints(
    possiblePoints,
    destinationPoint,
    isSenteTurn,
    xSpecifier,
    ySpecifier,
  );
}

function filterPossiblePoints(
  possiblePoints: Array<Point>,
  destinationPoint: Point,
  isSenteTurn: boolean,
  xSpecifier?: X_SPECIFIER,
  ySpecifier?: Y_SPECIFIER,
): Point {
  if (!xSpecifier && !ySpecifier) {
    throw Error('cannot detect move');
  }
  const points = xSpecifier
    ? filterPointsByXSpecifier(
        possiblePoints,
        isSenteTurn,
        destinationPoint,
        xSpecifier,
      )
    : possiblePoints;
  const filteredPoints = ySpecifier
    ? filterPointnsByYSpecifier(
        points,
        isSenteTurn,
        destinationPoint,
        ySpecifier,
      )
    : points;
  if (filteredPoints.length !== 1) {
    throw Error('cannot detect move');
  }
  return filteredPoints[0];
}
function filterPointsByXSpecifier(
  possiblePoints: Array<Point>,
  isSenteTurn: boolean,
  destinationPoint: Point,
  xSpecifier: X_SPECIFIER,
): Array<Point> {
  switch (xSpecifier) {
    case '右':
      return possiblePoints.filter((point) =>
        isSenteTurn
          ? point.x < destinationPoint.x
          : point.x > destinationPoint.x,
      );
    case '左':
      return possiblePoints.filter((point) =>
        isSenteTurn
          ? point.x > destinationPoint.x
          : point.x < destinationPoint.x,
      );
    case '直':
      return possiblePoints.filter((point) => point.x === destinationPoint.x);
  }
}
function filterPointnsByYSpecifier(
  possiblePoints: Array<Point>,
  isSenteTurn: boolean,
  destinationPoint: Point,
  ySpecifier: Y_SPECIFIER,
): Array<Point> {
  switch (ySpecifier) {
    case '引':
      return possiblePoints.filter((point) =>
        isSenteTurn
          ? point.y < destinationPoint.y
          : point.y > destinationPoint.y,
      );
    case '上':
      return possiblePoints.filter((point) =>
        isSenteTurn
          ? point.y > destinationPoint.y
          : point.y < destinationPoint.y,
      );
    case '寄':
      return possiblePoints.filter((point) => point.y === destinationPoint.y);
  }
}
