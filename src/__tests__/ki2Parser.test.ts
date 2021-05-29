import { toPrettierString } from '..';
import { parseKi2, parseKi2Moves } from '../parser/ki2Parser';

import fs from 'fs';

describe('parse move', () => {
  test('parse kif to horizontal move', () => {
    const { kifuMoves, boardList } = parseKi2Moves([
      '▲ ７六歩 △ ８四歩 ▲ ６八銀 △ ３四歩 ▲ ６六歩 △ ６二銀 ▲ ５六歩 △ ６四歩',
    ]);
    expect(kifuMoves.length).toBe(8);
    expect(toPrettierString(boardList[7].squareList)).toBe(`ln.gkgsnl
.r.s...b.
p.pppp.pp
.p....p..
.........
..PPP....
PP...PPPP
.B.S...R.
LN.GKGSNL
`);
  });
  test('parse ki2 including x specifier', () => {
    const { kifuMoves } = parseKi2Moves([
      '▲ ７六歩 △ ８四歩 ▲ ６八銀 △ ３四歩 ▲ ６六歩 △ ６二銀 ▲ ５六歩 △ ６四歩',
      '▲７八金 △６三銀 ▲４八銀 △５四銀 ▲５七銀右 △３二金 ▲５八金 △４一玉',
      '▲６七金右 △５二金 ▲６九玉 △７四歩 ▲２六歩 △８五歩 ▲７七銀 △３三角',
    ]);
    expect(kifuMoves.length).toBe(24);
  });
  test('parse ki2 including x&y specifier', () => {
    const { kifuMoves, boardList } = parseKi2Moves([
      '▲２六歩 △８四歩 ▲２五歩 △８五歩 ▲２四歩 △８六歩',
      '▲２三歩成 △８七歩成 ▲１六歩 △９四歩 ▲１五歩 △３四歩',
      '▲１四歩 △４四角 ▲１三歩成 △３五歩 ▲１二歩 △３六歩',
      '▲１一歩成 △３七歩成 ▲３四歩 △４二銀 ▲３三歩成 △７七と',
      '▲１二と引 △４七と ▲２二と右上 △３二金 ▲同と寄 △３一銀▲２二と左寄',
    ]);
    expect(kifuMoves.length).toBe(31);
    const lastBoard = boardList[boardList.length - 1];
    expect(toPrettierString(lastBoard.squareList)).toBe(`lnsgk.sn.
.r.....+P+P
..pppp+P+P.
p....b...
.........
.........
P.+pPP+p...
.B.....R.
LNSGKGSNL
`);
  });
  test('parse ki2 including gote x&y specifier', () => {
    const { kifuMoves, boardList } = parseKi2Moves([
      '▲７六歩 △８四歩 ▲６八銀 △８五歩 ▲７七銀 △８六歩',
      '▲７八金 △８七歩成 ▲１六歩 △９四歩 ▲１五歩 △９五歩',
      '▲１四歩 △９六歩 ▲１三歩成 △９七歩成 ▲２二と △同銀',
      '▲１一香成 △７四歩 ▲６六歩 △７五歩 ▲６五歩 △７六歩',
      '▲６四歩 △７七歩成 ▲１八飛 △８八と直 ▲１七飛 △９八歩',
      '▲１六飛 △９九歩成 ▲１七飛 △７八と寄 ▲８八香 △同と左上',
    ]);
    expect(kifuMoves.length).toBe(36);
    const lastBoard = boardList[boardList.length - 1];
    expect(toPrettierString(lastBoard.squareList)).toBe(`lnsgkg.n+L
.r.....s.
...ppppp.
...P.....
.........
.........
+p...PPPPR
.+p+p......
+pN..KGSN.
`);
  });
  test('parse ki2 including vertical move', () => {
    const { kifuMoves, boardList } = parseKi2Moves([
      '▲７六歩 △３四歩 ▲２二角成 △同銀 ▲６八銀 △３三銀',
      '▲７七銀 △４四銀 ▲６六銀 △６二銀 ▲５五銀 △同銀',
      '▲４八銀 △５四歩 ▲３六歩 △５三銀 ▲３七銀 △４四銀上',
      '▲４六銀 △３五歩 ▲４五銀 △同銀 ▲３五歩 △４六銀打',
      '▲３四歩 △３六銀打 ▲３八飛 △５六銀左 ▲４八金 △４七銀右不成',
      '▲５八金上 △同銀不成 ▲６八玉 △５六銀 ▲３七飛 △同銀直不成',
      '▲２六歩 △３八銀不成 ▲４七金 △同銀右引不成',
    ]);
    expect(kifuMoves.length).toBe(40);
    const lastBoard = boardList[boardList.length - 1];
    expect(toPrettierString(lastBoard.squareList)).toBe(`ln.gkg.nl
.r.......
pppp.p.pp
....p.P..
.........
..P.ss.P.
PP.PPs..P
...K..s..
LN.....NL
`);
    expect(lastBoard.hands['g']).toBe(2);
  });
});

describe('parse ki2', () => {
  test('parse test ki2', () => {
    const kifu = parseKi2(`手合割：平手
先手：ほげ
後手：ふが
  
▲７六歩 △３四歩 ▲２二角成 △同銀 ▲６八銀 △３三銀
▲７七銀 △４四銀 ▲６六銀 △６二銀 ▲５五銀 △同銀
▲４八銀 △５四歩 ▲３六歩 △５三銀 ▲３七銀 △４四銀上
▲４六銀 △３五歩 ▲４五銀 △同銀 ▲３五歩 △４六銀打
▲３四歩 △３六銀打 ▲３八飛 △５六銀左 ▲４八金 △４七銀右不成
▲５八金上 △同銀不成 ▲６八玉 △５六銀 ▲３七飛 △同銀直不成
▲２六歩 △３八銀不成 ▲４七金 △同銀右引不成
まで40手で後手の勝ち
`);
    expect(kifu.kifuMoves.length).toBe(40);
    expect(kifu.header?.sente).toBe('ほげ');
    expect(kifu.header?.gote).toBe('ふが');
  });
  test('parse ginga ki2', () => {
    const text = fs.readFileSync('test/ki2/ginga.ki2', {
      encoding: 'utf-8',
    });
    const data = parseKi2(text);
    expect(data.kifuMoves.length).toBe(108);
  });
  test('parse fork ki2', () => {
    const text = fs.readFileSync('test/ki2/fork.ki2', {
      encoding: 'utf-8',
    });
    const data = parseKi2(text);
    expect(data.kifuMoves.length).toBe(3);
  });
  test('throw error in case of parsing kif', () => {
    const text = fs.readFileSync('test/kif/longTest.kif', {
      encoding: 'utf-8',
    });
    const parse = () => {
      parseKi2(text);
    };
    expect(parse).toThrow();
  });
  test('parse long ki2', () => {
    const text = fs.readFileSync('test/ki2/long.ki2', {
      encoding: 'utf-8',
    });
    const data = parseKi2(text);
    expect(data.kifuMoves.length).toBe(113);
  });
});
