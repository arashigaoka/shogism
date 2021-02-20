import { Kifu } from '../kifu/types';

export type ProcessingState = {
  partialKifu: Partial<Kifu>;
  lines: Array<string>;
};
export const isKifu = (partialKifu: Partial<Kifu>): partialKifu is Kifu =>
  !!partialKifu.boardList && !!partialKifu.kifuMoves;
