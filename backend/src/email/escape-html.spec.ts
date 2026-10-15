import { escapeHtml, escapeStrings } from './escape-html';

describe('escapeHtml', () => {
  it('neutralises markup in a guest-supplied value', () => {
    expect(escapeHtml('<a href="https://evil.example">Click</a>')).toBe(
      '&lt;a href=&quot;https://evil.example&quot;&gt;Click&lt;/a&gt;',
    );
  });

  it('escapes ampersands and single quotes', () => {
    expect(escapeHtml("Tom & Jerry's")).toBe('Tom &amp; Jerry&#39;s');
  });

  it('leaves ordinary text alone', () => {
    expect(escapeHtml('Ada Obi')).toBe('Ada Obi');
  });
});

describe('escapeStrings', () => {
  it('escapes every string field and passes other values through', () => {
    const start = new Date('2026-10-20T00:00:00Z');
    const escaped = escapeStrings({
      memberName: '<b>Tolu</b>',
      durationDays: 30,
      startDate: start,
    });

    expect(escaped).toEqual({
      memberName: '&lt;b&gt;Tolu&lt;/b&gt;',
      durationDays: 30,
      startDate: start,
    });
    expect(escaped.startDate).toBe(start);
  });
});
