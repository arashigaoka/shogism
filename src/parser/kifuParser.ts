import {
  createHorizontalMove,
  createVerticalMove,
  initBoard,
  moveBoard,
} from '../board';
import { HorizontalMove, isHorizontalMove, Move, Y_AXIS } from '../board/types';
import { Kifu } from '../kifu/types';
import { Piece, UPPERCASE_KIND } from '../piece';
const KifToSfen = {
  歩: UPPERCASE_KIND.FU,
  香: UPPERCASE_KIND.KYOSHA,
  桂: UPPERCASE_KIND.KEIMA,
  銀: UPPERCASE_KIND.GIN,
  金: UPPERCASE_KIND.KIN,
  角: UPPERCASE_KIND.KAKU,
  飛: UPPERCASE_KIND.FI,
};
type KifToSfen = { [key: string]: Piece };
const ChineseNumber = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};

type Comment = {
  comment: string;
};
function isComment(str: any): str is Comment {
  return !!str.comment;
}

export function parseKifMove(
  move: string,
  prevMove: HorizontalMove | null,
): Move | Comment | null {
  const horizontalMovePattern = /[１-９][一二三四五六七八九][歩香桂銀金角飛玉王と杏圭全馬竜龍]成?\(\d{2}/;
  const horizontalMove = move.match(horizontalMovePattern);
  if (horizontalMove) {
    const target = horizontalMove[0];
    const toX = Number(convertZenToHan(target.slice(0, 1)));
    const secondChar = target.slice(1, 2) as keyof typeof ChineseNumber;
    const toY = ChineseNumber[secondChar];
    const fromX = Number(target.slice(-2, -1));
    const fromY = Number(target.slice(-1));
    const promote = target.includes('成');
    const move = createHorizontalMove({ fromX, fromY, toX, toY, promote });
    return move;
  }
  const horizontalMoveGetBackPattern = /同[ |　]*[歩香桂銀金角飛玉王と杏圭全馬竜龍]\(\d{2}/;
  const getBackValue = move.match(horizontalMoveGetBackPattern);
  if (getBackValue) {
    if (!prevMove) {
      throw Error('cannot get back');
    } else {
      const target = getBackValue[0];
      const fromX = Number(target.slice(-2, -1));
      const fromY = Number(target.slice(-1));
      const promote = target.includes('成');
      const toX = Number(prevMove.slice(2, 3));
      const y_axis_key = prevMove.slice(3, 4) as keyof typeof Y_AXIS;
      const toY = Y_AXIS[y_axis_key];
      const move = createHorizontalMove({ fromX, fromY, toX, toY, promote });
      return move;
    }
  }
  const verticalMovePattern = /[１-９][一二三四五六七八九][歩香桂銀金角飛]打/;
  const verticalMove = move.match(verticalMovePattern);
  if (verticalMove) {
    const target = verticalMove[0];
    const toX = Number(convertZenToHan(target.slice(0, 1)));
    const secondChar = target.slice(1, 2) as keyof typeof ChineseNumber;
    const toY = ChineseNumber[secondChar];
    const thirdChar = target.slice(2, 3) as keyof typeof KifToSfen;
    const piece = KifToSfen[thirdChar];
    const move = createVerticalMove({ toX, toY, piece });
    return move;
  }
  if (move.startsWith('*')) {
    const comment = move.slice(1).trim();
    return { comment };
  }
  return null;
}

function convertZenToHan(str: string): string {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0),
  );
}

export function parseKIF(kifStr: string): Kifu {
  const lines = kifStr.replace(/\r\n?/g, '\n').split('\n');
  const moves = [] as Array<Move>;
  let prevMove = null as HorizontalMove | null;
  const board = initBoard();
  const boardList = lines.reduce(
    (acc, line) => {
      const moveOrComment = parseKifMove(line, prevMove);
      if (!moveOrComment) {
        return acc;
      }
      const lastBoard = acc[acc.length - 1];
      if (!isComment(moveOrComment)) {
        if (isHorizontalMove(moveOrComment)) {
          prevMove = moveOrComment;
        } else {
          prevMove = null;
        }
        moves.push(moveOrComment);
        const newBoard = moveBoard(lastBoard, moveOrComment);
        return [...acc, newBoard];
      } else {
        const newComment = lastBoard.comment
          ? [lastBoard.comment, moveOrComment.comment].join('\n')
          : moveOrComment.comment;
        const newBoard = { ...lastBoard, comment: newComment };
        return [...acc.slice(0, acc.length - 1), newBoard];
      }
    },
    [board],
  );
  return { boardList, moves };
}
