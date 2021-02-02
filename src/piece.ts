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

export type SHOW_PROMOTE = '+' | '';

export type Piece = `${SHOW_PROMOTE}${KIND_VALUE}`;
export function isPiece(str: string): str is Piece {
  const target = str && str.startsWith('+') ? str.slice(1) : str;
  return isLowerCaseKindValue(target) || isUpperCaseKindValue(target);
}
export function isKindValue(piece: Piece): piece is KIND_VALUE {
  return !piece.startsWith('+');
}

export function flip(kind: KIND_VALUE): KIND_VALUE {
  if (isUpperCaseKindValue(kind)) {
    return kind.toLowerCase() as LOWERCASE_KIND_VALUE;
  } else {
    return kind.toUpperCase() as UPPERCASE_KIND_VALUE;
  }
}