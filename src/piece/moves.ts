import { UPPERCASE_KIND, PROMOTED_UPPER_KIND, UPPERCASE_KIND_VALUE } from '.';

const MOVABLE_RELATIVE_POSITIONS_RAW: {
  [key in UPPERCASE_KIND_VALUE]: Array<Array<[number, number]>>;
} = {
  [UPPERCASE_KIND.FU]: [[[0, 1]]],
  [UPPERCASE_KIND.KYOSHA]: [
    [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
      [0, 7],
      [0, 8],
      [0, 9],
    ],
  ],
  [UPPERCASE_KIND.KEIMA]: [[[1, 2]], [[-1, 2]]],
  [UPPERCASE_KIND.GIN]: [[[1, 1]], [[0, 1]], [[-1, 1]], [[1, -1]], [[-1, -1]]],
  [UPPERCASE_KIND.KIN]: [
    [[1, 1]],
    [[0, 1]],
    [[-1, 1]],
    [[1, 0]],
    [[-1, 0]],
    [[0, -1]],
  ],
  [UPPERCASE_KIND.KAKU]: [
    [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
      [6, 6],
      [7, 7],
      [8, 8],
      [9, 9],
    ],
    [
      [1, -1],
      [2, -2],
      [3, -3],
      [4, -4],
      [5, -5],
      [6, -6],
      [7, -7],
      [8, -8],
      [9, -9],
    ],
    [
      [-1, 1],
      [-2, 2],
      [-3, 3],
      [-4, 4],
      [-5, 5],
      [-6, 6],
      [-7, 7],
      [-8, 8],
      [-9, 9],
    ],
    [
      [-1, -1],
      [-2, -2],
      [-3, -3],
      [-4, -4],
      [-5, -5],
      [-6, -6],
      [-7, -7],
      [-8, -8],
      [-9, -9],
    ],
  ],
  [UPPERCASE_KIND.FI]: [
    [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
      [0, 7],
      [0, 8],
      [0, 9],
    ],
    [
      [0, -1],
      [0, -2],
      [0, -3],
      [0, -4],
      [0, -5],
      [0, -6],
      [0, -7],
      [0, -8],
      [0, -9],
    ],
    [
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
      [5, 0],
      [6, 0],
      [7, 0],
      [8, 0],
      [9, 0],
    ],
    [
      [-1, 0],
      [-2, 0],
      [-3, 0],
      [-4, 0],
      [-5, 0],
      [-6, 0],
      [-7, 0],
      [-8, 0],
      [-9, 0],
    ],
  ],
  [UPPERCASE_KIND.OU]: [
    [[1, 1]],
    [[0, 1]],
    [[-1, 1]],
    [[1, 0]],
    [[-1, 0]],
    [[1, -1]],
    [[0, -1]],
    [[-1, -1]],
  ],
};

const MOVABLE_RELATIVE_POSITIONS_PROMOTED: {
  [key in typeof PROMOTED_UPPER_KIND[keyof typeof PROMOTED_UPPER_KIND]]: Array<
    Array<[number, number]>
  >;
} = {
  [PROMOTED_UPPER_KIND.TO]: MOVABLE_RELATIVE_POSITIONS_RAW[UPPERCASE_KIND.KIN],
  [PROMOTED_UPPER_KIND.NARIKYO]:
    MOVABLE_RELATIVE_POSITIONS_RAW[UPPERCASE_KIND.KIN],
  [PROMOTED_UPPER_KIND.NARIKEI]:
    MOVABLE_RELATIVE_POSITIONS_RAW[UPPERCASE_KIND.KIN],
  [PROMOTED_UPPER_KIND.NARIGIN]:
    MOVABLE_RELATIVE_POSITIONS_RAW[UPPERCASE_KIND.KIN],
  [PROMOTED_UPPER_KIND.UMA]: [
    ...MOVABLE_RELATIVE_POSITIONS_RAW[UPPERCASE_KIND.KAKU],
    [
      [1, 0],
      [0, 1],
      [0, -1],
      [-1, 0],
    ],
  ],
  [PROMOTED_UPPER_KIND.RYU]: [
    ...MOVABLE_RELATIVE_POSITIONS_RAW[UPPERCASE_KIND.FI],
    [[1, 1]],
    [[1, -1]],
    [[-1, 1]],
    [[-1, -1]],
  ],
};

export const MOVABLE_RELATIVE_POSITIONS = {
  ...MOVABLE_RELATIVE_POSITIONS_RAW,
  ...MOVABLE_RELATIVE_POSITIONS_PROMOTED,
};
