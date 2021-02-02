import {
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
export type Move =
  | `${SfenPointSelector}${SfenPointSelector}${SHOW_PROMOTE}`
  | `${UPPERCASE_KIND_VALUE}*${SfenPointSelector}`;

export type Hands = {
  [key in LOWERCASE_KIND_VALUE | UPPERCASE_KIND_VALUE]: number;
};

export type Board = {
  readonly squareList: SquareList;
  readonly hands: Hands;
  readonly isSenteTurn: boolean;
};
