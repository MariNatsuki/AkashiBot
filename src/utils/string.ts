import { trim } from 'lodash';

export function paginateByLength(input: string, length: number): string[] {
  const trimmedInput = trim(input);
  if (trimmedInput.length <= length) {
    return [input];
  }

  let count = 0;
  let lastBreakPosition = -1;
  for (let i = 0; i < trimmedInput.length; i++) {
    count++;
    if (trimmedInput[i] === '\n') {
      lastBreakPosition = i;
    }
    if (count > length) {
      if (lastBreakPosition > 0) {
        return [
          trim(trimmedInput.substring(0, lastBreakPosition)),
          ...paginateByLength(trim(trimmedInput.substring(lastBreakPosition)), length),
        ];
      } else {
        return [
          trim(trimmedInput.substring(0, length - 1)),
          ...paginateByLength(trim(trimmedInput.substring(length - 1)), length),
        ];
      }
    }
  }

  return [];
}
