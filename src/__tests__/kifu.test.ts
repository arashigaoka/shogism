import { initBoard, initSquare, toPrettierString } from '../board';
import { INITIAL_BOARD } from '../board/types';
import {
  getFirstIndexOfMatchedBoard,
  getReadableMove,
  initKifuFromSfen,
  produceKifu,
} from '../kifu';

describe('initKifu', () => {
  test('init by startpos', () => {
    const kifu = initKifuFromSfen('test');
    expect(kifu.boardList.length).toBe(1);
    expect(kifu.kifuMoves.length).toBe(0);
    expect(kifu.name).toBe('test');
  });
  test('init by whiteboard', () => {
    const kifu = initKifuFromSfen('test2', INITIAL_BOARD.NOPIECE);
    const board = kifu.boardList[0];
    expect(board.hands['P']).toBe(18);
    expect(board.squareList.join('').length).toBe(0);
    expect(board.isSenteTurn).toBeTruthy();
    expect(kifu.name).toBe('test2');
  });
  test('init by startops and moves', () => {
    const moveStr = '7g7f 3c3d 8h2b+';
    const kifu = initKifuFromSfen('test3', undefined, moveStr);
    expect(kifu.kifuMoves.length).toBe(3);
    expect(kifu.kifuMoves[2].sfen).toBe('8h2b+');
    expect(kifu.kifuMoves[2].kif).toBe('２二角成(88)');
    const lastBoard = kifu.boardList[3];
    expect(lastBoard.hands['B']).toBe(1);
    expect(kifu.name).toBe('test3');

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
    expect(toPrettierString(lastBoard.squareList)).toBe(prettierString);
    const firstBoard = kifu.boardList[0];
    expect(firstBoard.hands['B']).toBe(0);
    expect(toPrettierString(firstBoard.squareList)).not.toBe(prettierString);
  });
  test('long sfen', () => {
    const moveStr =
      '7g7f 3c3d 2g2f 4c4d 3i4h 3a4b 5i6h 5c5d 2f2e 2b3c 4i5h 8b5b 5g5f 5a6b 6h7h 6b7b 9g9f 9c9d 4g4f 7b8b 4h5g 7a7b 8h7g 4b5c 5h4g 5c6d 6g6f 7c7d 7i6h 8c8d 6h6g 7b8c 3g3f 8a7c 2h3h 5b3b 7g8f 6a7b 7h8h 4a5b 6i7h 3c4b 9i9h 7d7e 8h9i 5b6b 7h8h 8c7d 8f5i 4b5c 3h2h 3b2b 5g6h 7e7f 6g7f P*7e 7f6g 7d8e 4g5g 1c1d 6h7g 1d1e 8g8f 8e7d 6g7h 5c3a 7h8g 5d5e 5i2f 5e5f 5g5f 2b5b 2h5h 3a2b 4f4e 2b1c P*5c 5b5c 2f4d 5c5d P*5e 5d4d 4e4d B*6i 5h4h 8d8e 9f9e 9d9e P*7h 1c7i+ 4d4c+ 8e8f 7g8f P*4g 4h4i 7i6h 4i6i 6h6i R*5a P*8a 4c5b 6b5b 5a5b+ 6i7i P*9d 7d8c G*6b R*8d 6b7b 8c7b B*6a G*7a 6a7b+ 7a7b S*9c 9a9c 9d9c+ 8b9c 5b7b S*6h 9h9e 8d9d G*8c';
    const kifu = initKifuFromSfen('test4', undefined, moveStr);
    const lastBoard = kifu.boardList[kifu.boardList.length - 1];
    expect(lastBoard.hands['p']).toBe(4);
  });
});
describe('get Readable Move', () => {
  const moveStr = '7g7f 3c3d 8h2b+ B*3c 2b3a 4a3a B*5e 3c2b 5e2b+';
  const kifu = initKifuFromSfen('test5', undefined, moveStr);
  expect(
    getReadableMove({
      squareList: kifu.boardList[0].squareList,
      currentMove: '7g7f',
    }),
  ).toBe('７六歩(77)');
  expect(
    getReadableMove({
      squareList: kifu.boardList[1].squareList,
      currentMove: '3c3d',
      prevMove: '7g7f',
    }),
  ).toBe('３四歩(33)');
  expect(
    getReadableMove({
      squareList: kifu.boardList[2].squareList,
      currentMove: '8h2b+',
      prevMove: '3c3d',
    }),
  ).toBe('２二角成(88)');
  expect(
    getReadableMove({
      squareList: kifu.boardList[3].squareList,
      currentMove: 'B*3c',
      prevMove: '8h2b+',
    }),
  ).toBe('３三角打');
  expect(
    getReadableMove({
      squareList: kifu.boardList[4].squareList,
      currentMove: '2b3a',
      prevMove: 'B*3c',
    }),
  ).toBe('３一馬(22)');
  expect(
    getReadableMove({
      squareList: kifu.boardList[5].squareList,
      currentMove: '4a3a',
      prevMove: '2b3a',
    }),
  ).toBe('同　金(41)');
  expect(
    getReadableMove({
      squareList: kifu.boardList[8].squareList,
      currentMove: '5e2b+',
      prevMove: '3c2b',
    }),
  ).toBe('同　角成(55)');
});
describe('search kifu', () => {
  test('success', () => {
    const kifu = initKifuFromSfen('test');
    const board = initBoard();
    const squareList = board.squareList;
    const index = getFirstIndexOfMatchedBoard(kifu, squareList);
    expect(index).toBe(0);
  });
});

describe('produceKifu', () => {
  test('success', () => {
    const kifu = initKifuFromSfen('test');
    const newKifu = produceKifu(kifu, '7g7f');
    expect(newKifu.kifuMoves[0]?.sfen).toBe('7g7f');
    expect(newKifu.kifuMoves[0]?.kif).toBe('７六歩(77)');
    const newKifu2 = produceKifu(newKifu, '2g2f', 0);
    expect(newKifu2.boardList[0].squareList).toStrictEqual(
      initSquare(INITIAL_BOARD.HIRATE.squareStr),
    );
    expect(newKifu2.kifuMoves[0]?.sfen).toBe('2g2f');
    expect(newKifu2.kifuMoves[0]?.kif).toBe('２六歩(27)');
    const prettierString = `lnsgkgsnl
.r.....b.
ppppppppp
.........
.........
.......P.
PPPPPPP.P
.B.....R.
LNSGKGSNL
`;
    expect(toPrettierString(newKifu2.boardList[1].squareList)).toBe(
      prettierString,
    );
  });
  test('update', () => {
    const moveStr = '7g7f 3c3d 8h2b+ B*3c 2b3a 4a3a B*5e 3c2b 5e2b+';
    const kifu = initKifuFromSfen('test', undefined, moveStr);
    const newKifu = produceKifu(kifu, '3a2b', 3);
    expect(newKifu.kifuMoves[3]?.sfen).toBe('3a2b');
  });
  test('boardEditing', () => {
    const kifu = initKifuFromSfen(
      'test',
      INITIAL_BOARD.NOPIECE,
      undefined,
      true,
    );
    const newKifu = produceKifu(kifu, 'P*5e');
    const newKifu2 = produceKifu(newKifu, 'P*5a');
    const prettierString = `....P....
.........
.........
.........
....P....
.........
.........
.........
.........
`;
    expect(toPrettierString(newKifu2.boardList[2].squareList)).toBe(
      prettierString,
    );
  });
});
