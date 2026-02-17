describe('Badge and closing counts stay consistent', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.resetModules();
  });

  test('badge shows duplicatesCloseable and matches close target size (no exceptions)', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { active: true }),
        createMockTab(2, 'https://a.com', 'A'),
        createMockTab(3, 'https://a.com', 'A'),
        createMockTab(4, 'https://b.com', 'B'),
        createMockTab(5, 'https://b.com', 'B'),
        createMockTab(6, 'https://c.com', 'C')
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      chrome.storage.sync.get.mockImplementation((defaults, cb) => cb({ exceptionsRules: '' }));

      require('../extension/close_tabs.js');
      const { computeCountsFromTabs, refreshBadgeForTest } = global.__cdt_test;

      const counts = computeCountsFromTabs(tabs);
      expect(counts.duplicates).toBe(3); // 6 total, 3 unique => 3 dups
      expect(counts.duplicatesCloseable).toBe(3); // keep 1 per group

      refreshBadgeForTest();
      // badge text set to duplicatesCloseable
      expect(chrome.action.setBadgeText).toHaveBeenCalled();
      const setTextArgs = chrome.action.setBadgeText.mock.calls.pop()[0];
      expect(setTextArgs.text).toBe(String(counts.duplicatesCloseable));
    });
  });

  test('exceptions reduce duplicatesCloseable and badge reflects it', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://a.com', 'Example Domain', { active: true }),
        createMockTab(2, 'https://a.com', 'Example Domain'),
        createMockTab(3, 'https://b.com', 'B'),
        createMockTab(4, 'https://b.com', 'B')
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      chrome.storage.sync.get.mockImplementation((defaults, cb) =>
        cb({ exceptionsRules: 'title/Example Domain/' })
      );

      require('../extension/close_tabs.js');
      const { computeCountsFromTabs, compileExceptions, refreshBadgeForTest } = global.__cdt_test;
      compileExceptions('title/Example Domain/');

      const counts = computeCountsFromTabs(tabs);
      expect(counts.duplicates).toBe(2); // raw duplicate count
      expect(counts.duplicatesCloseable).toBe(1); // a.com group is excepted => only b.com closable

      refreshBadgeForTest();
      const setTextArgs = chrome.action.setBadgeText.mock.calls.pop()[0];
      expect(setTextArgs.text).toBe(String(counts.duplicatesCloseable));
    });
  });
});
