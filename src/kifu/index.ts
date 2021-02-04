import { initBoard, moveBoard } from '../board';
import { isMove, Move, SquareList } from '../board/types';
import { Kifu } from './types';

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
