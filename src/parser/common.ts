import {
  PROMOTED_UPPER_KIND,
  PROMOTED_UPPER_KIND_VALUE,
  UPPERCASE_KIND,
  UPPERCASE_KIND_VALUE,
} from '..';
import { Kifu } from '../kifu/types';
import { parseKi2 } from './ki2Parser';
import { parseKIF } from './kifParser';

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

export type ProcessingState = {
  partialKifu: Partial<Kifu>;
  lines: Array<string>;
};
export const isKifu = (partialKifu: Partial<Kifu>): partialKifu is Kifu =>
  !!partialKifu.boardList && !!partialKifu.kifuMoves;

export function parseAuto(str: string): Kifu {
  const msg = [];
  try {
    return parseKi2(str);
  } catch (e) {
    msg.push(e);
  }
  try {
    return parseKIF(str);
  } catch (e) {
    msg.push(e);
  }
  throw Error(`parse failed error is below
  ${msg.join('\n')}`);
}
