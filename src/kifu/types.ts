import { Board, Move } from '../board';

export type KifuMove = {
  sfen: Move;
  kif: string;
};
export type Kifu = {
  name?: string;
  boardList: Array<Board>;
  kifuMoves: Array<KifuMove>;
  header?: Header;
  finishTrigger?: FinishTrigger;
  boardEditing?: boolean;
};

export type Header = {
  sente?: string;
  gote?: string;
};

export const FinishTrigger = {
  中断: '中断',
  投了: '投了',
  持将棋: '持将棋',
  切れ負け: '切れ負け',
  反則勝ち: '反則勝ち',
  反則負け: '反則負け',
  入玉勝ち: '入玉勝ち',
  千日手: '千日手',
  詰み: '詰み',
} as const;

export type FinishTrigger = typeof FinishTrigger[keyof typeof FinishTrigger];
