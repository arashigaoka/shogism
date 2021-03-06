import {
  UPPERCASE_KIND_VALUE,
  UPPERCASE_PIECE,
  isUpperPiece,
  turnOver,
} from '../piece';
import {
  initBoard,
  moveBoard,
  getPointFromSfen,
  selectPiece,
  toPrettierString,
  isMove,
  isVerticalMove,
  Move,
  SfenPointSelector,
  SquareList,
} from '../board';
import { Kifu, KifuMove } from './types';
import { convertHanToZen, getChineseNumber, SfenToKif } from '../parser/common';
import produce from 'immer';

export * from './types';

export function initKifuFromSfen(
  name?: string,
  initialInfo?: {
    squareStr: string;
    turn: string;
    handsStr: string;
  },
  moveStr?: string,
  boardEditing = false,
): Kifu {
  const board = initBoard(initialInfo);
  if (moveStr) {
    const moves: Array<KifuMove> = [];
    const boardList = moveStr.split(' ').reduce(
      (acc, sfenMove) => {
        if (!isMove(sfenMove)) {
          throw new Error(`${sfenMove} is invalid move`);
        } else {
          const lastBoard = acc[acc.length - 1];
          const lastMove = moves[moves.length - 1]?.sfen;
          const kif = getReadableMove({
            squareList: lastBoard.squareList,
            currentMove: sfenMove,
            prevMove: lastMove,
          });
          moves.push({ kif, sfen: sfenMove });
          const newBoard = moveBoard(lastBoard, sfenMove);
          return [...acc, newBoard];
        }
      },
      [board],
    );
    return { name, boardList, kifuMoves: moves, boardEditing };
  }
  return {
    name,
    boardList: [board],
    kifuMoves: [],
    boardEditing,
  };
}

export function getReadableMove({
  squareList,
  currentMove,
  prevMove,
}: {
  squareList: SquareList;
  currentMove: Move;
  prevMove?: Move;
}): string {
  if (isVerticalMove(currentMove)) {
    const piece = currentMove.slice(0, 1) as UPPERCASE_KIND_VALUE;
    const toSfen = currentMove.slice(2, 4) as SfenPointSelector;
    const toPoint = getPointFromSfen(toSfen);
    return `${convertHanToZen(toPoint.x.toString())}${getChineseNumber(
      toPoint.y,
    )}${SfenToKif[piece]}打`;
  } else {
    const fromSfen = currentMove.slice(0, 2) as SfenPointSelector;
    const fromPoint = getPointFromSfen(fromSfen);
    const toSfen = currentMove.slice(2, 4) as SfenPointSelector;
    const toPoint = getPointFromSfen(toSfen);
    const piece = selectPiece(squareList, fromPoint);
    if (!piece) {
      throw Error(`from_point is 'x: ${fromPoint.x} y: ${
        fromPoint.y
      } ', but there is  no piece
${toPrettierString(squareList)}`);
    }
    const UpperPiece = isUpperPiece(piece)
      ? piece
      : (turnOver(piece) as UPPERCASE_PIECE);
    const promote = currentMove.slice(4, 5) === '+';
    if (prevMove && isSameMove(prevMove, currentMove)) {
      return `同　${SfenToKif[UpperPiece]}${promote ? '成' : ''}(${
        fromPoint.x
      }${fromPoint.y})`;
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

export function produceKifu(kifu: Kifu, move: Move, moveNum?: number): Kifu {
  if (moveNum && moveNum > kifu.boardList.length - 1) {
    throw Error('out of bounds');
  }
  return produce(kifu, (draftKifu) => {
    // If moveNum is not specified newMove is inserted at last position
    const index = moveNum != null ? moveNum : kifu.boardList.length - 1;
    const prevBoard = kifu.boardList[index];
    const prevMove = kifu.kifuMoves[index - 1];
    const readableMove = getReadableMove({
      squareList: prevBoard.squareList,
      prevMove: prevMove?.sfen,
      currentMove: move,
    });
    draftKifu.kifuMoves = [
      ...kifu.kifuMoves.slice(0, index),
      { kif: readableMove, sfen: move },
    ];
    const newBoard = moveBoard(prevBoard, move, kifu.boardEditing);
    draftKifu.boardList = [...kifu.boardList.slice(0, index + 1), newBoard];
  });
}
