import { toPrettierString, INITIAL_BOARD } from '../board';
import { initKifuFromSfen, FinishTrigger } from '../kifu';
import { exportKIF, parseKIF, parseKifMoves } from '../parser/kifParser';
import fs from 'fs';

describe('parse move', () => {
  test('parse kif moves', () => {
    const data = parseKifMoves([
      '1 ７六歩(77)   ( 0:02/00:00:02)+',
      '2 ８四歩(83)   ( 0:01/00:00:01)+',
      '3 ２六歩(27)   ( 0:01/00:00:03)+',
      '4 ８五歩(84)   ( 0:02/00:00:03)',
      '5 ７七角(88)   ( 0:01/00:00:04)',
    ]);
    expect(data.kifuMoves.length).toBe(5);
  });

  test('parse kif moves with comments', () => {
    const data = parseKifMoves([
      '*start',
      '*start2',
      '1 ７六歩(77)   ( 0:02/00:00:02)+',
      '*初手のコメント',
      '2 ８四歩(83)   ( 0:01/00:00:01)+',
      '*２手目のコメント',
      '3 ２六歩(27)   ( 0:01/00:00:03)+',
      '4 ８五歩(84)   ( 0:02/00:00:03)',
      '5 ７七角(88)   ( 0:01/00:00:04)',
    ]);
    expect(data.kifuMoves.length).toBe(5);
    expect(data.boardList[0].comment).toBe('start\nstart2');
  });
});

describe('parse kif input', () => {
  test('parse kif properly', () => {
    const data = parseKIF(
      '手数----指手---------消費時間--\n1 ７六歩(77) (0:01/00:00:01)\n2 ３四歩(33) (0:02/00:00:02)\n3 ２二角成(88) (0:20/00:00:21)\n 4 同　銀(31) (0:03/00:00:05)\n5 ４五角打 (0:39/00:01:00)\n',
    );
    expect(data.kifuMoves.length).toBe(5);
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
    expect(lastBoard.isSenteTurn).toBeFalsy();
  });
  test('parse kif with comments', () => {
    const data = parseKIF(`
手数----指手---------消費時間--
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
    expect(data.kifuMoves.length).toBe(5);
    expect(data.boardList.length).toBe(6);
    expect(data.boardList[0].comment).toBe('start\nstart2');
  });
  test('parse kif with header', () => {
    const data = parseKIF(`#KIF version=2.0 encoding=Shift_JIS
# ---- Kifu for Windows V7 V7.08 棋譜ファイル ----
開始日時：2014/10/12 14:46:51
終了日時：2014/10/12 14:47:55
手合割：平手　　
先手：sente
後手：gote
手数----指手---------消費時間--
   1 ７六歩(77)   ( 0:02/00:00:02)
   2 ３四歩(33)   ( 0:05/00:00:05)
   3 ２二角成(88) ( 0:06/00:00:08)
   4 中断         ( 0:51/00:00:56)
まで3手で中断
`);
    expect(data.header?.sente).toBe('sente');
    expect(data.header?.gote).toBe('gote');
    expect(data.finishTrigger).toBe(FinishTrigger['中断']);
  });
  test('parse long kif', () => {
    const text = fs.readFileSync('test/kif/longTest.kif', {
      encoding: 'utf-8',
    });
    const data = parseKIF(text);
    expect(data.kifuMoves.length).toBe(131);
    expect(data.kifuMoves[130]).toStrictEqual({
      sfen: '3g2f',
      kif: '２六玉(37)',
    });
    expect(data.finishTrigger).toBe(FinishTrigger['投了']);
  });
  test('parse fork kif', () => {
    const text = fs.readFileSync('test/kif/fork.kif', {
      encoding: 'utf-8',
    });
    const data = parseKIF(text);
    expect(data.kifuMoves.length).toBe(3);
  });
  test('parse test kif including get back by promoted piece', () => {
    const text = fs.readFileSync('test/kif/test2.kif', {
      encoding: 'utf-8',
    });
    const data = parseKIF(text);
    expect(data.kifuMoves.length).toBe(147);
    expect(data.finishTrigger).toBe(FinishTrigger['投了']);
  });
  test('throw error when parsing ki2', () => {
    const text = fs.readFileSync('test/ki2/ginga.ki2', { encoding: 'utf-8' });
    const parse = () => parseKIF(text);
    expect(parse).toThrow('cannot find move start');
  });
});

describe('export kif', () => {
  test('success', () => {
    const kifu = initKifuFromSfen(
      'test',
      INITIAL_BOARD.HIRATE,
      '7g7f 3c3d 8h2b+ 3a2b B*4e',
    );
    const kif = exportKIF({
      ...kifu,
      header: { sente: 'sente', gote: 'gote' },
      finishTrigger: FinishTrigger['投了'],
    });
    expect(kif).toBe(`手合割：平手
先手：sente
後手：gote
手数----指手---------消費時間--
1 ７六歩(77) (0:00/00:00:00)
2 ３四歩(33) (0:00/00:00:00)
3 ２二角成(88) (0:00/00:00:00)
4 同　銀(31) (0:00/00:00:00)
5 ４五角打 (0:00/00:00:00)
まで5手で投了`);
  });
});
