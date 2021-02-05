export const LOWERCASE_KIND = {
  FU: 'p',
  KYOSHA: 'l',
  KEIMA: 'n',
  GIN: 's',
  KIN: 'k',
  KAKU: 'b',
  FI: 'r',
  OU: 'g',
} as const;
export type LOWERCASE_KIND_VALUE = typeof LOWERCASE_KIND[keyof typeof LOWERCASE_KIND];
export function isLowerCaseKindValue(
  target: string,
): target is LOWERCASE_KIND_VALUE {
  return Object.values(LOWERCASE_KIND).some((kind) => kind === target);
}

export const UPPERCASE_KIND: {
  [key in keyof typeof LOWERCASE_KIND]: Uppercase<LOWERCASE_KIND_VALUE>;
} = {
  FU: 'P',
  KYOSHA: 'L',
  KEIMA: 'N',
  GIN: 'S',
  KIN: 'K',
  KAKU: 'B',
  FI: 'R',
  OU: 'G',
} as const;
export type UPPERCASE_KIND_VALUE = typeof UPPERCASE_KIND[keyof typeof UPPERCASE_KIND];
export function isUpperCaseKindValue(
  target: string,
): target is UPPERCASE_KIND_VALUE {
  return Object.values(UPPERCASE_KIND).some((kind) => kind === target);
}
export type KIND_VALUE = LOWERCASE_KIND_VALUE | UPPERCASE_KIND_VALUE;

type PROMOTABLE_KIND_VALUE = Exclude<KIND_VALUE, 'k' | 'g' | 'K' | 'G'>;
function isPromotableKindValue(
  value: KIND_VALUE,
): value is PROMOTABLE_KIND_VALUE {
  const ngKind: Array<KIND_VALUE> = [
    LOWERCASE_KIND.KIN,
    LOWERCASE_KIND.OU,
    UPPERCASE_KIND.KIN,
    UPPERCASE_KIND.OU,
  ];
  return !ngKind.includes(value);
}
export type SHOW_PROMOTE = '+' | '';

export type Piece = `${SHOW_PROMOTE}${KIND_VALUE}`;
export function isPiece(str: string): str is Piece {
  const target = str && str.startsWith('+') ? str.slice(1) : str;
  return isLowerCaseKindValue(target) || isUpperCaseKindValue(target);
}
export function isKindValue(piece: Piece): piece is KIND_VALUE {
  return !piece.startsWith('+');
}

export function turnOver(piece: Piece): Piece {
  const target = piece.startsWith('+') ? piece.slice(1) : piece;
  if (isUpperCaseKindValue(target)) {
    return piece.toLowerCase() as Piece;
  } else {
    return piece.toUpperCase() as Piece;
  }
}

function promote(kind: KIND_VALUE): Piece {
  return ('+' + kind) as Piece;
}

export function getChangeablePiece(piece: Piece): Array<Piece> {
  const kindValue = piece.startsWith('+')
    ? (piece.slice(1, 2) as KIND_VALUE)
    : (piece as KIND_VALUE);
  const lowerKindValue = isUpperCaseKindValue(kindValue)
    ? (turnOver(kindValue) as KIND_VALUE)
    : kindValue;
  if (isPromotableKindValue(lowerKindValue)) {
    return [
      lowerKindValue,
      turnOver(lowerKindValue),
      promote(lowerKindValue),
      promote(turnOver(lowerKindValue) as KIND_VALUE),
    ];
  } else {
    return [lowerKindValue, turnOver(lowerKindValue)];
  }
}
