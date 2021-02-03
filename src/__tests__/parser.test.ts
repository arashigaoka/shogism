import { toPrettierString } from '../board';
import { parseKIF, parseKifMove } from '../parser/kifuParser';

describe('parse move', () => {
  test('parse kif to horizontal move', () => {
    const data = parseKifMove('1 ７六歩(77) (0:01/00:00:01)', null);
    expect(data).toBe('7g7f');
  });
  test('parse kif to horizontal promote move', () => {
    const data = parseKifMove('3 ２二角成(88) (0:20/00:00:21)', null);
    expect(data).toBe('8h2b+');
  });
  test('parse kif for get back', () => {
    const data = parseKifMove('4 同銀(31) (0:20/00:00:21)', '8h2b+');
    expect(data).toBe('3a2b');
  });
  test('parse kif to vertical move', () => {
    const data = parseKifMove('5 ４五角打 (0:39/00:01:00)', null);
    expect(data).toBe('B*4e');
  });
  test('parse comment', () => {
    const data = parseKifMove('*コメント', null);
    expect(data).toStrictEqual({ comment: 'コメント' });
  });
  test('parse comment and trim', () => {
    const data = parseKifMove('*  abc   d ', null);
    expect(data).toStrictEqual({ comment: 'abc   d' });
  });
});

describe('parse kif input', () => {
  test('parse kif properly', () => {
    const data = parseKIF(
      '1 ７六歩(77) (0:01/00:00:01)\n2 ３四歩(33) (0:02/00:00:02)\n3 ２二角成(88) (0:20/00:00:21)\n 4 同　銀(31) (0:03/00:00:05)\n5 ４五角打 (0:39/00:01:00)\n',
    );
    expect(data.moves.length).toBe(5);
    expect(data.boardList.length).toBe(6);
    const lastBoard = data.boardList[data.boardList.length - 1];
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
    expect(toPrettierString(lastBoard.squareList)).toBe(prettierString);
  });
  test('parse kif with comments', () => {
    const data = parseKIF(`
*start
*start2
1 ７六歩(77)   ( 0:02/00:00:02)+
*初手のコメント
   2 ８四歩(83)   ( 0:01/00:00:01)+
*２手目のコメント
   3 ２六歩(27)   ( 0:01/00:00:03)+
   4 ８五歩(84)   ( 0:02/00:00:03)
   5 ７七角(88)   ( 0:01/00:00:04)
    `);
    expect(data.moves.length).toBe(5);
    expect(data.boardList.length).toBe(6);
    expect(data.boardList[0].comment).toBe('start\nstart2');
  });
});