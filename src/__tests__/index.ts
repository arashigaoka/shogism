import { initializeBoard, flip, toPrettierString } from '../index';

describe('flip', () => {
  test('flip', () => {
    const flippedPorn = flip('p');
    expect(flippedPorn).toBe('P');
  });
});
describe('board', () => {
  test('initialize board', () => {
    const sfenInput =
      'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL';
    const board = initializeBoard(sfenInput);
    expect(board.length).toBe(81);
    const prettierString = `lnsgkgsnl
.r.....b.
ppppppppp
.........
.........
.........
PPPPPPPPP
.B.....R.
LNSGKGSNL
`;
    expect(toPrettierString(board)).toBe(prettierString);
  });
});
