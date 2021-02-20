import produce from 'immer';
import {
  createHorizontalMove,
  createVerticalMove,
  initBoard,
  moveBoard,
} from '../board';
import { Board, Move, Y_AXIS } from '../board/types';
import { getReadableMove } from '../kifu';
import { FinishTrigger, Header, Kifu, KifuMove } from '../kifu/types';
import {
  UPPERCASE_KIND,
  PROMOTED_UPPER_KIND,
  UPPERCASE_KIND_VALUE,
  PROMOTED_UPPER_KIND_VALUE,
} from '../piece';
import { pipe } from '../util';
import { isKifu, ProcessingState } from './common';
export const KifToSfen = {
  歩: UPPERCASE_KIND.FU,
  香: UPPERCASE_KIND.KYOSHA,
  桂: UPPERCASE_KIND.KEIMA,
  銀: UPPERCASE_KIND.GIN,
  金: UPPERCASE_KIND.KIN,
  角: UPPERCASE_KIND.KAKU,
  飛: UPPERCASE_KIND.FI,
  玉: UPPERCASE_KIND.OU,
  王: UPPERCASE_KIND.OU,
  と: PROMOTED_UPPER_KIND.TO,
  杏: PROMOTED_UPPER_KIND.NARIKYO,
  成香: PROMOTED_UPPER_KIND.NARIKYO,
  圭: PROMOTED_UPPER_KIND.NARIKEI,
  成桂: PROMOTED_UPPER_KIND.NARIKEI,
  全: PROMOTED_UPPER_KIND.NARIGIN,
  成銀: PROMOTED_UPPER_KIND.NARIGIN,
  馬: PROMOTED_UPPER_KIND.UMA,
  龍: PROMOTED_UPPER_KIND.RYU,
  竜: PROMOTED_UPPER_KIND.RYU,
} as const;
export type KifToSfen = {
  [key: string]: UPPERCASE_KIND_VALUE | PROMOTED_UPPER_KIND_VALUE;
};
export const SfenToKif = {
  [UPPERCASE_KIND.FU]: '歩',
  [UPPERCASE_KIND.KYOSHA]: '香',
  [UPPERCASE_KIND.KEIMA]: '桂',
  [UPPERCASE_KIND.GIN]: '銀',
  [UPPERCASE_KIND.KIN]: '金',
  [UPPERCASE_KIND.KAKU]: '角',
  [UPPERCASE_KIND.FI]: '飛',
  [UPPERCASE_KIND.OU]: '玉',
  [PROMOTED_UPPER_KIND.TO]: 'と',
  [PROMOTED_UPPER_KIND.NARIKYO]: '成香',
  [PROMOTED_UPPER_KIND.NARIKEI]: '成桂',
  [PROMOTED_UPPER_KIND.NARIGIN]: '成銀',
  [PROMOTED_UPPER_KIND.UMA]: '馬',
  [PROMOTED_UPPER_KIND.RYU]: '龍',
} as const;
export const ChineseNumber = {
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
export function getChineseNumber(num: number): string | undefined {
  return Object.entries(ChineseNumber).find(([, value]) => value === num)?.[0];
}

type Comment = {
  comment: string;
};
function isComment(str: any): str is Comment {
  return !!str.comment;
}

export function parseKIF(kifStr: string): Kifu {
  const lines = kifStr
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((v) => v)
    .map((line) => line.trim());
  const enhancer = pipe(parseHeader, parseMoves, parseFinishTrigger);
  const { partialKifu: kifu } = enhancer({ partialKifu: {}, lines });

  if (!isKifu(kifu)) {
    throw Error('invalid kifu file');
  } else {
    return kifu;
  }
}

function parseHeader({ lines }: ProcessingState): ProcessingState {
  const endIndex = lines.findIndex(
    (line) => line.startsWith('*') || line.startsWith('1'),
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
    partialKifu: { ...partialKifu, ...parseKifMoves(targetLine) },
    lines: lines.slice(endIndex),
  };
}
export function parseKifMoves(
  lines: Array<string>,
): { boardList: Array<Board>; kifuMoves: Array<KifuMove> } {
  const board = initBoard();
  return lines.reduce(
    (acc, line) =>
      produce(acc, (draft) => {
        const lastBoard = draft.boardList[draft.boardList.length - 1];
        try {
          // comment
          if (line.startsWith('*')) {
            lastBoard.comment = [lastBoard.comment, line.slice(1).trim()]
              .filter((v) => v)
              .join('\n');
            return;
          }
          const reflectMove = (sfen: Move) => {
            const kif = getReadableMove({
              squareList:
                draft.boardList[draft.boardList.length - 1].squareList,
              currentMove: sfen,
              prevMove: draft.kifuMoves[draft.kifuMoves.length - 1]?.sfen,
            });
            draft.kifuMoves.push({ sfen, kif });
            const newBoard = moveBoard(lastBoard, sfen);
            draft.boardList.push(newBoard);
          };
          // horizontal move
          const horizontalMovePattern = /[１-９][一二三四五六七八九]([歩香桂銀金角飛玉王と杏圭全馬竜龍]|成香|成桂|成銀)成?\(\d{2}/;
          const horizontalMove = line.match(horizontalMovePattern);
          if (horizontalMove) {
            const target = horizontalMove[0];
            const secondChar = target.slice(1, 2) as keyof typeof ChineseNumber;
            const to = {
              x: Number(convertZenToHan(target.slice(0, 1))),
              y: ChineseNumber[secondChar],
            };
            const from = {
              x: Number(target.slice(-2, -1)),
              y: Number(target.slice(-1)),
            };
            const promote = target.slice(-4, -3) === '成';
            const move = createHorizontalMove({ from, to, promote });
            reflectMove(move);
            return;
          }
          // getback
          const horizontalMoveGetBackPattern = /同[ |　]*([歩香桂銀金角飛玉王と杏圭全馬竜龍]|成香|成桂|成銀)成?\(\d{2}/;
          const getBackValue = line.match(horizontalMoveGetBackPattern);
          if (getBackValue) {
            const prevMove = draft.kifuMoves[draft.kifuMoves.length - 1]?.sfen;
            if (!prevMove) {
              throw Error('cannot get back');
            } else {
              const target = getBackValue[0];
              const from = {
                x: Number(target.slice(-2, -1)),
                y: Number(target.slice(-1)),
              };
              const promote = target.includes('成');
              const y_axis_key = prevMove.slice(3, 4) as keyof typeof Y_AXIS;
              const to = {
                x: Number(prevMove.slice(2, 3)),
                y: Y_AXIS[y_axis_key],
              };
              const move = createHorizontalMove({ from, to, promote });
              reflectMove(move);
              return;
            }
          }
          //vertical move
          const verticalMovePattern = /[１-９][一二三四五六七八九][歩香桂銀金角飛]打/;
          const verticalMove = line.match(verticalMovePattern);
          if (verticalMove) {
            const target = verticalMove[0];
            const secondChar = target.slice(1, 2) as keyof typeof ChineseNumber;
            const to = {
              x: Number(convertZenToHan(target.slice(0, 1))),
              y: ChineseNumber[secondChar],
            };
            const thirdChar = target.slice(2, 3) as keyof typeof KifToSfen;
            const piece = KifToSfen[thirdChar] as UPPERCASE_KIND_VALUE;
            const move = createVerticalMove({ to, piece });
            reflectMove(move);
            return;
          }
          return;
        } catch (e) {
          throw Error(`Error occured during the parse of the ${line}
      ${e}`);
        }
      }),
    { boardList: [board], kifuMoves: [] as Array<KifuMove> },
  );
}

export function convertZenToHan(str: string): string {
  return str.replace(/[０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0),
  );
}

export function convertHanToZen(str: string): string {
  return str.replace(/[0-9]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
  });
}

function parseFinishTrigger({
  partialKifu,
  lines,
}: ProcessingState): ProcessingState {
  const line = lines[0];
  if (!line) {
    return { partialKifu, lines };
  }
  let finishTrigger = undefined;
  Object.values(FinishTrigger).forEach((trigger) => {
    if (line.includes(trigger)) {
      finishTrigger = trigger;
      return;
    }
  });
  return {
    partialKifu: { ...partialKifu, finishTrigger },
    lines: [],
  };
}

export function exportKIF(kifu: Kifu): string {
  const headerStr = exportHeader(kifu.header);
  const moveStr = exportMovesAndComments({
    readableMoves: kifu.kifuMoves.map((move) => move.kif),
    comments: kifu.boardList.map((board) => board.comment),
  });
  const finishStr = exportFinishTrigger(
    kifu.kifuMoves.length,
    kifu.finishTrigger,
  );
  return [headerStr, moveStr, finishStr].join('\n');
}

function exportHeader(header?: Header) {
  const teai = '手合割：平手';
  const sente = `先手：${header?.sente || '先手'}`;
  const gote = `後手：${header?.gote || '後手'}`;
  return [teai, sente, gote].join('\n');
}

function exportMovesAndComments({
  readableMoves,
  comments,
}: {
  readableMoves: Array<Move>;
  comments: Array<string | undefined>;
}) {
  const loopNum = comments.length;
  const movesAndComments = [...new Array(loopNum)]
    .map((_, index) => {
      if (index === 0) {
        // user can input comments for initial boards
        return exportComment(comments[0]);
      }
      const move = `${index} ${readableMoves[index - 1]} (0:00/00:00:00)`;
      const comment = exportComment(comments[index]);
      return [move, comment].filter((v) => v).join('\n');
    })
    .filter((v) => v)
    .join('\n');
  return ['手数----指手---------消費時間--', movesAndComments].join('\n');
}

function exportComment(comment: string | undefined): string | null {
  if (!comment) {
    return null;
  }
  return comment
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((str) => `*${str}`)
    .join('\n');
}

function exportFinishTrigger(
  index: number,
  finishTrigger?: FinishTrigger,
): string {
  if (!finishTrigger) {
    return '';
  }
  return `まで${index}手で${finishTrigger}`;
}
