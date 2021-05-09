import { parseAuto } from '../parser/common';
import fs from 'fs';
import { FinishTrigger } from '../kifu/types';

describe('parse automatically', () => {
  test('parse kif', () => {
    const text = fs.readFileSync('test/kif/longTest.kif', {
      encoding: 'utf-8',
    });
    const data = parseAuto(text);
    expect(data.kifuMoves.length).toBe(131);
    expect(data.kifuMoves[130]).toStrictEqual({
      sfen: '3g2f',
      kif: '２六玉(37)',
    });
    expect(data.finishTrigger).toBe(FinishTrigger['投了']);
  });
  test('parse ginga ki2', () => {
    const text = fs.readFileSync('test/ki2/ginga.ki2', {
      encoding: 'utf-8',
    });
    const data = parseAuto(text);
    expect(data.kifuMoves.length).toBe(108);
  });
  test('throw error', () => {
    const text = `'指し手と消費時間
+2726FU
T12
-3334FU
T6
`;
    const parse = () => {
      parseAuto(text);
    };
    expect(parse).toThrow();
  });
  test('shogi extend', () => {
    const text = fs.readFileSync('test/kif/shogi-extend.kif', {
      encoding: 'utf-8',
    });
    const data = parseAuto(text);
    expect(data.header?.sente).toBe('arashigaoka 六段');
  });
});
