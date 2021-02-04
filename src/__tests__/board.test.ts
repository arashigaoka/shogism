import {
  INITIAL_BOARD,
  isHorizontalMove,
  isSfenPointSelector,
  isVerticalMove,
} from '../board/types';
import {
  createVerticalMove,
  promoteOrFlipPieceOnSquareList,
  initSquare,
  toPrettierString,
  selectPiece,
  moveBoard,
  toSquareStr,
  initHands,
  initBoard,
  createHorizontalMove,
} from '../index';
describe('squareList', () => {
  test('initialize squareList', () => {
    const sfenInput =
      'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL';
    const squareList = initSquare(sfenInput);
    expect(squareList.length).toBe(81);
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
    expect(toPrettierString(squareList)).toBe(prettierString);
  });
  test('select piece', () => {
    const sfenInput =
      'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL';
    const squareList = initSquare(sfenInput);
    expect(selectPiece(squareList, 0)).toBe('l');
    expect(selectPiece(squareList, 80)).toBe('L');
    expect(selectPiece(squareList, { x: 9, y: 1 })).toBe('l');
    expect(selectPiece(squareList, { x: 7, y: 7 })).toBe('P');
    expect(selectPiece(squareList, { x: 9, y: 8 })).toBe('');
    function selectPieceWithInvalidNum() {
      selectPiece(squareList, 81);
    }
    expect(selectPieceWithInvalidNum).toThrowError(
      'selected Position is out of bounds',
    );
    function selectPieceWithInvalidPoint() {
      selectPiece(squareList, { x: 0, y: 2 });
    }
    expect(selectPieceWithInvalidPoint).toThrowError(
      'selected Position is out of bounds',
    );
  });
});

describe('hands', () => {
  test('init hands properly', () => {
    const handsStr = 'KRB2G2S2N2L9Pkrb2g2s2n2l9p';
    const hands = initHands(handsStr);
    expect(hands['K']).toBe(1);
    expect(hands['p']).toBe(9);
  });
});

describe('init board', () => {
  test('init boards properly', () => {
    const board = initBoard();
    expect(board.hands['G']).toBe(0);
    expect(board.isSenteTurn).toBeTruthy();
    expect(board.squareList.length).toBe(81);
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
    expect(toPrettierString(board.squareList)).toBe(prettierString);
  });
});
describe('move board', () => {
  test('move board from square to square', () => {
    const squareStr =
      'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL';
    const board = initBoard({ squareStr, handsStr: '', turn: 'w' });
    const move = '7g7f';
    const newBoard = moveBoard(board, move);
    const prettierString = `lnsgkgsnl
.r.....b.
ppppppppp
.........
.........
..P......
PP.PPPPPP
.B.....R.
LNSGKGSNL
`;
    expect(toPrettierString(newBoard.squareList)).toBe(prettierString);
    expect(newBoard.isSenteTurn).toBeFalsy();
    expect(toPrettierString(board.squareList)).not.toBe(prettierString);
  });
  test('move board and promote', () => {
    const squareStr =
      'lnsgkgsnl/1r5b1/pppppp1pp/6p2/9/2P6/PP1PPPPPP/1B5R1/LNSGKGSNL';
    const board = initBoard({ squareStr, handsStr: '', turn: 'w' });
    const move = '8h2b+';
    const newBoard = moveBoard(board, move);
    const prettierString = `lnsgkgsnl
.r.....+B.
pppppp.pp
......p..
.........
..P......
PP.PPPPPP
.......R.
LNSGKGSNL
`;
    expect(toPrettierString(newBoard.squareList)).toBe(prettierString);
    expect(newBoard.hands['B']).toBe(1);
    expect(newBoard.isSenteTurn).toBeFalsy();
  });
  test('drop piece to board', () => {
    const squareStr =
      'lnsgkg1nl/1r5s1/pppppp1pp/6p2/9/2P6/PP1PPPPPP/7R1/LNSGKGSNL';
    const board = initBoard({ squareStr, handsStr: 'Bb', turn: 'w' });
    const newBoard = moveBoard(board, 'B*4e');
    const prettierString = `lnsgkg.nl
.r.....s.
pppppp.pp
......p..
.....B...
..P......
PP.PPPPPP
.......R.
LNSGKGSNL
`;
    expect(toPrettierString(newBoard.squareList)).toBe(prettierString);
    expect(newBoard.hands['B']).toBe(0);
    expect(newBoard.hands['b']).toBe(1);
  });
  test('drop piece to board in gote turn', () => {
    const squareStr =
      'lnsgkg1nl/1r5s1/pppppp1pp/6p2/5B3/2P6/PP1PPPPPP/7R1/LNSGKGSNL';
    const board = initBoard({ squareStr, handsStr: 'b', turn: 'b' });
    const newBoard = moveBoard(board, 'B*6e');
    const prettierString = `lnsgkg.nl
.r.....s.
pppppp.pp
......p..
...b.B...
..P......
PP.PPPPPP
.......R.
LNSGKGSNL
`;
    expect(toPrettierString(newBoard.squareList)).toBe(prettierString);
    expect(newBoard.hands['b']).toBe(0);
  });
  test('turn is immutable in edit mode', () => {
    const board = initBoard({ ...INITIAL_BOARD.NOPIECE, editMode: true });
    expect(board.isSenteTurn).toBeTruthy();
    const newBoard = moveBoard(board, 'B*1a');
    expect(newBoard.isSenteTurn).toBeTruthy();
  });
});

describe('toSquareStr', () => {
  test('toSquareStr', () => {
    const sfenInput =
      'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL';
    const board = initSquare(sfenInput);
    expect(toSquareStr(board)).toBe(sfenInput);
  });
});

describe('createHorizontalMove', () => {
  test('success', () => {
    const move = createHorizontalMove({
      from: { x: 7, y: 7 },
      to: { x: 7, y: 6 },
    });
    expect(move).toBe('7g7f');
  });
  test('can promote', () => {
    const move = createHorizontalMove({
      from: { x: 7, y: 7 },
      to: { x: 7, y: 6 },
      promote: true,
    });
    expect(move).toBe('7g7f+');
  });
  test('can call by index', () => {
    const move = createHorizontalMove({ from: 7, to: 16 });
    expect(move).toBe('2a2b');
  });
  test('error', () => {
    function error() {
      createHorizontalMove({
        from: { x: 10, y: 7 },
        to: { x: 7, y: 6 },
      });
    }
    expect(error).toThrowError();
  });
});

describe('createVerticalMove', () => {
  test('success', () => {
    const move = createVerticalMove({ toX: 4, toY: 5, piece: 'B' });
    expect(move).toBe('B*4e');
  });
});

describe('isSfenPointSelector', () => {
  test('success', () => {
    const str = '1a';
    expect(isSfenPointSelector(str)).toBeTruthy();
  });
  test('0 is out of bounds', () => {
    const str = '0a';
    expect(isSfenPointSelector(str)).toBeFalsy();
  });
  test('x is out of bounds', () => {
    const str = '2x';
    expect(isSfenPointSelector(str)).toBeFalsy();
  });
  test('length is over', () => {
    const str = '1a2b3c';
    expect(isSfenPointSelector(str)).toBeFalsy();
  });
});

describe('isHorizontalMove', () => {
  test('success', () => {
    const str = '1a2b';
    expect(isHorizontalMove(str)).toBeTruthy();
  });
  test('0 is out of bounds', () => {
    const str = '0a0b+';
    expect(isHorizontalMove(str)).toBeFalsy();
  });
  test('x is out of bounds', () => {
    const str = '1a2x';
    expect(isHorizontalMove(str)).toBeFalsy();
  });
  test('move can include promote', () => {
    const str = '1a2b+';
    expect(isHorizontalMove(str)).toBeTruthy();
  });
});
describe('isMove', () => {
  test('move can drop hands', () => {
    const str = 'B*5c';
    expect(isVerticalMove(str)).toBeTruthy();
  });
  test('empty', () => {
    const str = '';
    expect(isVerticalMove(str)).toBeFalsy();
  });
});
describe('promoteOrFlipPieceOnSquareList', () => {
  test('success', () => {
    const board = initBoard({ ...INITIAL_BOARD.HIRATE, editMode: true });
    const newBoard = promoteOrFlipPieceOnSquareList(board, '+L', 0);
    expect(newBoard.squareList[0]).toBe('+L');
  });
});
