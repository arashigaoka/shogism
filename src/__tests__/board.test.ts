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
  getExistPieceFromHands,
  getMovablePoints,
  getDropablePoints,
  canPromote,
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
    const move = createVerticalMove({ to: { x: 4, y: 5 }, piece: 'B' });
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

describe('getHands', () => {
  test('success', () => {
    const board = initBoard(INITIAL_BOARD.NOPIECE);
    const { senteExistHands, goteExistHands } = getExistPieceFromHands(
      board.hands,
    );
    expect(senteExistHands['P']).toBe(9);
    expect(senteExistHands['p']).toBe(undefined);
    expect(goteExistHands['p']).toBe(9);
    expect(goteExistHands['P']).toBe(undefined);
  });
});

describe('getMovablePositions', () => {
  test('fu of sente', () => {
    const board = initBoard();
    const positions = getMovablePoints(board, { x: 7, y: 7 });
    expect(positions[0]).toStrictEqual({ x: 7, y: 6 });
  });
  test('fu of gote', () => {
    const board = initBoard();
    const positions = getMovablePoints(board, { x: 3, y: 3 });
    expect(positions[0]).toStrictEqual({ x: 3, y: 4 });
  });
  test('cannot move fu because my piece exists', () => {
    const board = initBoard({ ...INITIAL_BOARD.NOPIECE, editMode: true });
    const newBoard = moveBoard(board, 'P*5e');
    const testBoard = moveBoard(newBoard, 'B*5d');
    const positions = getMovablePoints(testBoard, { x: 5, y: 5 });
    expect(positions.length).toBe(0);
  });
  test('kyosha of sente', () => {
    const board = initBoard({ ...INITIAL_BOARD.NOPIECE, editMode: true });
    const newBoard = moveBoard(board, 'L*5h');
    const testBoard = moveBoard({ ...newBoard, isSenteTurn: false }, 'P*5c');
    const positions = getMovablePoints(testBoard, { x: 5, y: 8 });
    expect(positions).toStrictEqual([
      { x: 5, y: 7 },
      { x: 5, y: 6 },
      { x: 5, y: 5 },
      { x: 5, y: 4 },
      { x: 5, y: 3 },
    ]);
  });
  test('keima of gote', () => {
    const board = initBoard({ ...INITIAL_BOARD.NOPIECE, editMode: true });
    const newBoard = moveBoard(board, 'P*9f');
    const newBoard2 = moveBoard(newBoard, 'P*7f');
    const testBoard = moveBoard({ ...newBoard2, isSenteTurn: false }, 'N*8d');
    const positions = getMovablePoints(testBoard, { x: 8, y: 4 });
    expect(positions).toStrictEqual([
      { x: 9, y: 6 },
      { x: 7, y: 6 },
    ]);
  });
  test('gin of sente', () => {
    const board = initBoard();
    const positions = getMovablePoints(board, { x: 7, y: 9 });
    expect(positions).toStrictEqual([
      { x: 6, y: 8 },
      { x: 7, y: 8 },
    ]);
    const newBoard = moveBoard(board, '7i6h');
    const newPositions = getMovablePoints(newBoard, { x: 6, y: 8 });
    expect(newPositions).toStrictEqual([{ x: 7, y: 9 }]);
    const noPieceBoard = initBoard({
      ...INITIAL_BOARD.NOPIECE,
      editMode: true,
    });
    const newBoard2 = moveBoard(noPieceBoard, 'S*1c');
    const newPositions2 = getMovablePoints(newBoard2, { x: 1, y: 3 });
    expect(newPositions2).toStrictEqual([
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: 4 },
    ]);
  });
  test('kin of sente', () => {
    const board = initBoard({
      ...INITIAL_BOARD.NOPIECE,
      editMode: true,
    });
    const newBoard = moveBoard(board, 'G*9a');
    const positions = getMovablePoints(newBoard, { x: 9, y: 1 });
    expect(positions).toStrictEqual([
      { x: 8, y: 1 },
      { x: 9, y: 2 },
    ]);
  });
  test('kaku of sente', () => {
    const board = initBoard({
      ...INITIAL_BOARD.NOPIECE,
      editMode: true,
    });
    const newBoard = moveBoard(board, 'B*4d');
    const positions = getMovablePoints(newBoard, { x: 4, y: 4 });
    expect(positions.length).toBe(14);
    const newBoard2 = moveBoard(newBoard, 'K*3c');
    const positions2 = getMovablePoints(newBoard2, { x: 4, y: 4 });
    expect(positions2.length).toBe(11);
    const newBoard3 = moveBoard({ ...newBoard2, isSenteTurn: false }, 'K*5c');
    const positions3 = getMovablePoints(newBoard3, { x: 4, y: 4 });
    expect(positions3.length).toBe(9);
  });
  test('hisya of gote', () => {
    const board = initBoard({
      ...INITIAL_BOARD.NOPIECE,
      editMode: true,
      turn: 'b',
    });
    const newBoard = moveBoard(board, 'R*4d');
    const positions = getMovablePoints(newBoard, { x: 4, y: 4 });
    expect(positions.length).toBe(16);
    const newBoard2 = moveBoard(newBoard, 'K*4c');
    const positions2 = getMovablePoints(newBoard2, { x: 4, y: 4 });
    expect(positions2.length).toBe(13);
  });
  test('gyoku of sente', () => {
    const board = initBoard({
      ...INITIAL_BOARD.NOPIECE,
      editMode: true,
    });
    const newBoard = moveBoard(board, 'K*4d');
    const positions = getMovablePoints(newBoard, { x: 4, y: 4 });
    expect(positions.length).toBe(8);
  });
});

describe('getDropablePositions', () => {
  test('kaku', () => {
    const board = initBoard(INITIAL_BOARD.NOPIECE);
    const positions = getDropablePoints(board, 'B');
    expect(positions.length).toBe(81);
  });
  test('fu', () => {
    const board = initBoard({
      ...INITIAL_BOARD.NOPIECE,
      editMode: true,
    });
    const positions = getDropablePoints(board, 'P');
    expect(positions.length).toBe(72);
    const newBoard = moveBoard(board, 'P*4d');
    const newPositions = getDropablePoints(newBoard, 'P');
    expect(newPositions.length).toBe(64);
  });
  test('fu of gote', () => {
    const board = initBoard({
      ...INITIAL_BOARD.NOPIECE,
      editMode: true,
    });
    const positions = getDropablePoints(board, 'p');
    expect(positions.length).toBe(72);
    const newBoard = moveBoard(board, 'P*4d');
    const newPositions = getDropablePoints(newBoard, 'p');
    expect(newPositions.length).toBe(71);
  });
  test('kyosha of gote', () => {
    const board = initBoard({
      ...INITIAL_BOARD.NOPIECE,
      editMode: true,
    });
    const positions = getDropablePoints(board, 'l');
    expect(positions.length).toBe(72);
  });
  test('keima', () => {
    const board = initBoard({
      ...INITIAL_BOARD.NOPIECE,
      editMode: true,
    });
    const positions = getDropablePoints(board, 'n');
    expect(positions.length).toBe(63);
  });
});

describe('can promote', () => {
  test('success', () => {
    expect(canPromote('B', 12)).toBeTruthy();
    expect(canPromote('b', 64)).toBeTruthy();
  });
  test('failure', () => {
    expect(canPromote('B', 28)).toBeFalsy();
    expect(canPromote('+L', 12)).toBeFalsy();
    expect(canPromote('K', 12)).toBeFalsy();
  });
});
