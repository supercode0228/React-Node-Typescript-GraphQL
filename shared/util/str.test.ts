import { maybeSplitLine } from './str'

describe('Util: strings', () => {
  it('Splits strings into lines when needed', () => {
    expect(maybeSplitLine('test', 10))
      .toStrictEqual(['test']);
    expect(maybeSplitLine('looooooooong test', 10))
      .toStrictEqual(['looooooooo-', 'ng test']);
  });
});
