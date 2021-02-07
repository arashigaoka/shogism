import {
  UPPERCASE_KIND_VALUE,
  UPPERCASE_PIECE,
  isUpperPiece,
  turnOver,
} from '../piece';
import { initBoard, moveBoard, getPointFromSfen, selectPiece } from '../board';
import {
  isMove,
  isVerticalMove,
  Move,
  SfenPointSelector,
  SquareList,
} from '../board/types';
import { Kifu } from './types';
import {
  convertHanToZen,
  getChineseNumber,
  SfenToKif,
} from '../parser/kifuParser';

export function initKifuFromSfen(
  initialInfo?: {
    squareStr: string;
    turn: string;
    handsStr: string;
  },
  moveStr?: string,
): Kifu {
  const board = initBoard(initialInfo);
  if (moveStr) {
    const moves: Array<Move> = [];
    const boardList = moveStr.split(' ').reduce(
      (acc, move) => {
        if (!isMove(move)) {
          throw new Error(`${move} is invalid move`);
        } else {
          moves.push(move);
          const board = acc[acc.length - 1];
          const newBoard = moveBoard(board, move);
          return [...acc, newBoard];
        }
      },
      [board],
    );
    return { boardList, moves };
  }
  return {
    boardList: [board],
    moves: [],
  };
}

export function getReadableMove(kifu: Kifu, index: number): string {
  const { moves, boardList } = kifu;
  const targetMove = moves[index];
  if (!targetMove) {
    return '';
  }
  const prevMove = moves[index - 1];
  if (isVerticalMove(targetMove)) {
    const piece = targetMove.slice(0, 1) as UPPERCASE_KIND_VALUE;
    const toSfen = targetMove.slice(2, 4) as SfenPointSelector;
    const toPoint = getPointFromSfen(toSfen);
    return `${convertHanToZen(toPoint.x.toString())}${getChineseNumber(
      toPoint.y,
    )}${SfenToKif[piece]}打`;
  } else {
    const fromSfen = targetMove.slice(0, 2) as SfenPointSelector;
    const fromPoint = getPointFromSfen(fromSfen);
    const toSfen = targetMove.slice(2, 4) as SfenPointSelector;
    const toPoint = getPointFromSfen(toSfen);
    const piece = selectPiece(boardList[index].squareList, fromPoint);
    if (!piece) {
      throw Error('invalid Kifu');
    }
    const UpperPiece = isUpperPiece(piece)
      ? piece
      : (turnOver(piece) as UPPERCASE_PIECE);
    const promote = targetMove.slice(4, 5) === '+';
    if (prevMove && isSameMove(prevMove, targetMove)) {
      return `同　${SfenToKif[UpperPiece]}(${fromPoint.x}${fromPoint.y})`;
    } else {
      return `${convertHanToZen(toPoint.x.toString())}${getChineseNumber(
        toPoint.y,
      )}${SfenToKif[UpperPiece]}${promote ? '成' : ''}(${fromPoint.x}${
        fromPoint.y
      })`;
    }
  }
}
function isSameMove(prevMove: Move, currentMove: Move) {
  if (isVerticalMove(currentMove)) {
    return false;
  }
  const prevSfen = prevMove.slice(2, 4) as SfenPointSelector;
  const prevPoint = getPointFromSfen(prevSfen);
  const currentSfen = currentMove.slice(2, 4) as SfenPointSelector;
  const currentPoint = getPointFromSfen(currentSfen);
  return prevPoint.x === currentPoint.x && prevPoint.y === currentPoint.y;
}

export function getFirstIndexOfMatchedBoard(
  kifu: Kifu,
  sfenStr: SquareList,
): number {
  return kifu.boardList.findIndex((board) => {
    return board.squareList.every(
      (square, i) => sfenStr[i] === '' || sfenStr[i] === square,
    );
  });
}
