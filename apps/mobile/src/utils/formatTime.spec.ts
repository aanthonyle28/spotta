import { formatTime } from './formatTime';

describe('formatTime', () => {
  it('formats seconds correctly', () => {
    expect(formatTime(30)).toBe('00:30');
  });

  it('formats minutes and seconds correctly', () => {
    expect(formatTime(90)).toBe('01:30');
  });

  it('formats zero correctly', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('handles large durations', () => {
    expect(formatTime(3661)).toBe('61:01'); // 1 hour 1 minute 1 second
  });

  it('pads single digit minutes and seconds', () => {
    expect(formatTime(65)).toBe('01:05');
  });
});
