import {
  isUpperCaseKindValue,
  LOWERCASE_KIND_VALUE,
  Piece,
  SHOW_PROMOTE,
  UPPERCASE_KIND_VALUE,
} from '../piece';

export type SquareList = Array<Piece | ''>;

export type X_AXIS = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const Y_AXIS = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  i: 9,
};
export type SfenPointSelector = `${X_AXIS}${keyof typeof Y_AXIS}`;
export function isSfenPointSelector(str: string): str is SfenPointSelector {
  return (
    str.length === 2 &&
    ['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(str.slice(0, 1)) &&
    Object.keys(Y_AXIS).includes(str.slice(1, 2))
  );
}
export type HorizontalMove = `${SfenPointSelector}${SfenPointSelector}${SHOW_PROMOTE}`;
export function isHorizontalMove(str: string): str is HorizontalMove {
  if (str.length !== 4 && str.length !== 5) {
    return false;
  } else if (str.length === 4) {
    return (
      isSfenPointSelector(str.slice(0, 2)) &&
      isSfenPointSelector(str.slice(2, 4))
    );
  } else {
    return (
      isSfenPointSelector(str.slice(0, 2)) &&
      isSfenPointSelector(str.slice(2, 4)) &&
      str.slice(4, 5) === '+'
    );
  }
}
export type VerticalMove = `${UPPERCASE_KIND_VALUE}*${SfenPointSelector}`;
export function isVerticalMove(str: string): str is VerticalMove {
  if (str.length !== 4) {
    return false;
  }
  if (str.includes('*')) {
    return (
      isUpperCaseKindValue(str.slice(0, 1)) &&
      isSfenPointSelector(str.slice(2, 4))
    );
  }
  return false;
}
export type Move = HorizontalMove | VerticalMove;
export function isMove(str: string): str is Move {
  return isVerticalMove(str) || isHorizontalMove(str);
}

export type Hands = {
  [key in LOWERCASE_KIND_VALUE | UPPERCASE_KIND_VALUE]: number;
};

export type Board = {
  readonly squareList: SquareList;
  readonly hands: Hands;
  readonly isSenteTurn: boolean;
  comment?: string;
};
export const INITIAL_BOARD = {
  HIRATE: {
    squareStr: 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL',
    handsStr: '',
    turn: 'w',
  },
  NOPIECE: {
    squareStr: '9/9/9/9/9/9/9/9/9',
    handsStr: 'KRB2G2S2N2L9Pkrb2g2s2n2l9p',
    turn: 'w',
  },
};
