import {
  createHorizontalMove,
  createVerticalMove,
  initBoard,
  moveBoard,
} from '../board';
import { Move, Y_AXIS } from '../board/types';
import { FinishTrigger, Header, Kifu } from '../kifu/types';
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
  prevMove: Move | null,
): Move | Comment | null {
  if (move.startsWith('*')) {
    const comment = move.slice(1).trim();
    return { comment };
  }
  const horizontalMovePattern = /[１-９][一二三四五六七八九]([歩香桂銀金角飛玉王と杏圭全馬竜龍]|成香|成桂|成銀)成?\(\d{2}/;
  const horizontalMove = move.match(horizontalMovePattern);
  if (horizontalMove) {
    const target = horizontalMove[0];
    const toX = Number(convertZenToHan(target.slice(0, 1)));
    const secondChar = target.slice(1, 2) as keyof typeof ChineseNumber;
    const toY = ChineseNumber[secondChar];
    const fromX = Number(target.slice(-2, -1));
    const fromY = Number(target.slice(-1));
    const promote = target.slice(-4, -3) === '成';
    const move = createHorizontalMove({ fromX, fromY, toX, toY, promote });
    return move;
  }
  const horizontalMoveGetBackPattern = /同[ |　]*([歩香桂銀金角飛玉王と杏圭全馬竜龍]|成香|成桂|成銀)\(\d{2}/;
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
  return null;
}

function convertZenToHan(str: string): string {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0),
  );
}

function parseKifHeader(line: string): Header | undefined {
  if (line.startsWith('先手')) {
    const sente = line.slice(3);
    return { sente };
  } else if (line.startsWith('後手')) {
    const gote = line.slice(3);
    return { gote };
  }
  return undefined;
}

export function parseKIF(kifStr: string): Kifu {
  const lines = kifStr.replace(/\r\n?/g, '\n').split('\n');
  const moves = [] as Array<Move>;
  let prevMove = null as Move | null;
  const board = initBoard();
  let header = undefined as Header | undefined;
  let finishTrigger = undefined as FinishTrigger | undefined;
  const boardList = lines
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .reduce(
      (acc, line) => {
        if (isHeader(line)) {
          const newHeader = parseKifHeader(line);
          if (newHeader) {
            header = { ...header, ...newHeader };
          }
          return acc;
        }
        // finishTrigger is written once only
        if (!finishTrigger) {
          const triggerIfMatch = getFinishTriggerIfMatch(line);
          if (triggerIfMatch) {
            finishTrigger = triggerIfMatch;
            return acc;
          }
        }
        const moveOrComment = parseKifMove(line, prevMove);
        if (!moveOrComment) {
          return acc;
        }
        const lastBoard = acc[acc.length - 1];
        if (!isComment(moveOrComment)) {
          prevMove = moveOrComment;
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
  return { header, boardList, moves, finishTrigger };
}

function isHeader(line: string): boolean {
  return ['先手', '後手'].some((keyword) => line.startsWith(keyword));
}

function getFinishTriggerIfMatch(line: string): FinishTrigger | null {
  let finishTrigger = null;
  Object.values(FinishTrigger).forEach((trigger) => {
    if (line.includes(trigger)) {
      finishTrigger = trigger;
      return;
    }
  });
  return finishTrigger;
}
