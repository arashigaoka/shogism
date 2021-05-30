import produce from 'immer';
import {
  createHorizontalMove,
  createVerticalMove,
  initBoard,
  moveBoard,
  Board,
  Move,
  Y_AXIS,
} from '../board';
import {
  getReadableMove,
  FinishTrigger,
  Header,
  Kifu,
  KifuMove,
} from '../kifu';
import { UPPERCASE_KIND_VALUE } from '../piece';
import { pipe } from '../util';
import {
  ChineseNumber,
  convertZenToHan,
  isKifu,
  KifToSfen,
  ProcessingState,
} from './common';

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
  const endIndex = lines.findIndex((line) => line.startsWith('手数----指手--'));
  if (endIndex === -1) {
    throw Error('cannot find move start');
  }
  const targetLine = lines.slice(0, endIndex);
  const sente = targetLine.find((line) => line.startsWith('先手：'))?.slice(3);
  const gote = targetLine.find((line) => line.startsWith('後手：'))?.slice(3);
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
          const movePattern = /(同|([１-９])([一二三四五六七八九]))[ |　]?([歩香桂銀金角飛玉王と杏圭全馬竜龍]|成香|成桂|成銀)(成?)\((\d{2})/;
          const horizontalMove = line.match(movePattern);
          if (horizontalMove) {
            const isGetBack = horizontalMove[1] === '同';
            const prevMove = draft.kifuMoves[draft.kifuMoves.length - 1]?.sfen;
            if (isGetBack && !prevMove) {
              throw Error('cannot get back');
            }
            const from = {
              x: Number(horizontalMove[6].slice(0, 1)),
              y: Number(horizontalMove[6].slice(1, 2)),
            };
            const toX = isGetBack
              ? Number(prevMove.slice(2, 3))
              : Number(convertZenToHan(horizontalMove[2]));
            const toY = isGetBack
              ? Y_AXIS[prevMove.slice(3, 4) as keyof typeof Y_AXIS]
              : ChineseNumber[horizontalMove[3] as keyof typeof ChineseNumber];
            const to = { x: toX, y: toY };
            const promote = horizontalMove[5] === '成';
            const move = createHorizontalMove({ from, to, promote });
            reflectMove(move);
            return;
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
        } catch (e) {
          throw Error(`Error occured during the parse of the ${line}
      ${e}`);
        }
      }),
    { boardList: [board], kifuMoves: [] as Array<KifuMove> },
  );
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
