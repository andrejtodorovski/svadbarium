import { contrastRatio } from './color-contrast';

describe('contrastRatio', () => {
  it('black vs white is the maximum WCAG ratio of 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('identical colors have a ratio of 1:1', () => {
    expect(contrastRatio('#B8923F', '#B8923F')).toBeCloseTo(1, 5);
  });

  it('is symmetric regardless of argument order', () => {
    const a = contrastRatio('#14261F', '#F7F2E7');
    const b = contrastRatio('#F7F2E7', '#14261F');
    expect(a).toBeCloseTo(b, 10);
  });

  it('is case-insensitive on hex input', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(contrastRatio('#000000', '#ffffff'), 10);
  });
});
