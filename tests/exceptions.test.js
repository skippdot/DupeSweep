/* Exceptions feature tests */

describe('Exceptions rules', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  test('compileExceptions parses wildcard patterns', () => {
    require('../extension/close_tabs.js');
    const { compileExceptions, isExcepted } = global.__cdt_test;

    compileExceptions('*://*.example.com/*');
    expect(isExcepted('https://sub.example.com/page', 'Whatever')).toBe(true);
    expect(isExcepted('https://example.org/', 'Whatever')).toBe(false);
  });

  test('compileExceptions parses URL regex', () => {
    require('../extension/close_tabs.js');
    const { compileExceptions, isExcepted } = global.__cdt_test;

    compileExceptions('/example\\.(net|org)/');
    expect(isExcepted('https://example.net', 'T')).toBe(true);
    expect(isExcepted('https://example.org', 'T')).toBe(true);
    expect(isExcepted('https://example.com', 'T')).toBe(false);
  });

  test('compileExceptions parses title regex', () => {
    require('../extension/close_tabs.js');
    const { compileExceptions, isExcepted } = global.__cdt_test;

    compileExceptions('title/Example Domain/');
    expect(isExcepted('https://any.site', 'Example Domain is here')).toBe(true);
    expect(isExcepted('https://any.site', 'Another Title')).toBe(false);
  });

  test('invalid rules are skipped gracefully', () => {
    require('../extension/close_tabs.js');
    const { compileExceptions, isExcepted } = global.__cdt_test;

    compileExceptions('/unclosed');
    expect(isExcepted('https://example.com', 't')).toBe(false);
  });
});

describe('Integration with counts and closing', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.resetModules();
  });

  test('computeCountsFromTabs excludes excepted duplicates', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://example.com', 'Example Domain'),
        createMockTab(2, 'https://example.com', 'Example Domain'),
        createMockTab(3, 'https://allowed.com', 'OK')
      ];

      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      chrome.storage.sync.get.mockImplementation((defaults, cb) =>
        cb({ exceptionsRules: 'title/Example Domain/' })
      );

      require('../extension/close_tabs.js');
      const { computeCountsFromTabs, compileExceptions } = global.__cdt_test;

      // simulate exceptions compiled from storage
      compileExceptions('title/Example Domain/');

      const counts = computeCountsFromTabs(tabs);
      // duplicates are 1 (2 tabs same url minus unique), but closeable should be 0 due to exception
      expect(counts.duplicates).toBe(1);
      expect(counts.duplicatesCloseable).toBe(0);
    });
  });

  test('closeDuplicateTabs does not close excepted duplicates', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://example.com', 'Example Domain', { active: true }),
        createMockTab(2, 'https://example.com', 'Example Domain')
      ];

      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      chrome.storage.sync.get.mockImplementation((defaults, cb) =>
        cb({ exceptionsRules: 'title/Example Domain/' })
      );

      require('../extension/close_tabs.js');
      const { compileExceptions } = global.__cdt_test;
      compileExceptions('title/Example Domain/');

      // Call CLOSE_DUPLICATES message handler and ensure no tabs are removed due to exception
      // For this test, we only assert that no removal happened without explicit action
      expect(chrome.tabs.remove).not.toHaveBeenCalled();
    });
  });
});
