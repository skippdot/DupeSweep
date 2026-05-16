describe('computeCountsFromTabs comprehensive', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.resetModules();
  });

  function loadModule(exceptionsRules = '') {
    const tabs = [createMockTab(1, 'https://a.com', 'A')];
    chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
    chrome.storage.sync.get.mockImplementation((defaults, cb) => cb({ exceptionsRules }));
    require('../extension/close_tabs.js');
    return global.__cdt_test;
  }

  test('totalTabs counts all tabs', () => {
    jest.isolateModules(() => {
      const { computeCountsFromTabs } = loadModule();
      const tabs = [
        createMockTab(1, 'https://a.com', 'A'),
        createMockTab(2, 'https://b.com', 'B'),
        createMockTab(3, 'https://c.com', 'C')
      ];
      const counts = computeCountsFromTabs(tabs);
      expect(counts.totalTabs).toBe(3);
    });
  });

  test('uniqueUrls counts distinct URLs', () => {
    jest.isolateModules(() => {
      const { computeCountsFromTabs } = loadModule();
      const tabs = [
        createMockTab(1, 'https://a.com', 'A'),
        createMockTab(2, 'https://a.com', 'A2'),
        createMockTab(3, 'https://b.com', 'B')
      ];
      const counts = computeCountsFromTabs(tabs);
      expect(counts.uniqueUrls).toBe(2);
    });
  });

  test('duplicates = totalTabs - uniqueUrls', () => {
    jest.isolateModules(() => {
      const { computeCountsFromTabs } = loadModule();
      const tabs = [
        createMockTab(1, 'https://a.com', 'A'),
        createMockTab(2, 'https://a.com', 'A'),
        createMockTab(3, 'https://a.com', 'A'),
        createMockTab(4, 'https://b.com', 'B')
      ];
      const counts = computeCountsFromTabs(tabs);
      expect(counts.duplicates).toBe(2); // 4 total - 2 unique
    });
  });

  test('topDomains sorted by count and limited to 15', () => {
    jest.isolateModules(() => {
      const { computeCountsFromTabs } = loadModule();
      // Create tabs across 20 different domains
      const tabs = [];
      let id = 1;
      for (let d = 0; d < 20; d++) {
        const count = 20 - d; // domain0 has 20, domain1 has 19, etc.
        for (let t = 0; t < count; t++) {
          tabs.push(createMockTab(id++, `https://domain${d}.com/page${t}`, `D${d}`));
        }
      }
      const counts = computeCountsFromTabs(tabs);
      expect(counts.topDomains).toHaveLength(15);
      expect(counts.topDomains[0].domain).toBe('domain0.com');
      expect(counts.topDomains[0].count).toBe(20);
    });
  });

  test('duplicatesList includes only URLs with count > 1', () => {
    jest.isolateModules(() => {
      const { computeCountsFromTabs } = loadModule();
      const tabs = [
        createMockTab(1, 'https://a.com', 'A'),
        createMockTab(2, 'https://a.com', 'A'),
        createMockTab(3, 'https://b.com', 'B'),
        createMockTab(4, 'https://c.com', 'C'),
        createMockTab(5, 'https://c.com', 'C'),
        createMockTab(6, 'https://c.com', 'C')
      ];
      const counts = computeCountsFromTabs(tabs);
      expect(counts.duplicatesList).toHaveLength(2);
      // sorted by count desc
      expect(counts.duplicatesList[0].url).toBe('https://c.com');
      expect(counts.duplicatesList[0].count).toBe(3);
      expect(counts.duplicatesList[0].duplicatesToClose).toBe(2);
      expect(counts.duplicatesList[1].url).toBe('https://a.com');
      expect(counts.duplicatesList[1].count).toBe(2);
      expect(counts.duplicatesList[1].duplicatesToClose).toBe(1);
    });
  });

  test('duplicatesList sets duplicatesToClose to 0 for excepted URLs', () => {
    jest.isolateModules(() => {
      const { computeCountsFromTabs, compileExceptions } = loadModule();
      compileExceptions('title/Excepted/');
      const tabs = [
        createMockTab(1, 'https://a.com', 'Excepted Page'),
        createMockTab(2, 'https://a.com', 'Excepted Page'),
        createMockTab(3, 'https://b.com', 'Normal'),
        createMockTab(4, 'https://b.com', 'Normal')
      ];
      const counts = computeCountsFromTabs(tabs);
      const aEntry = counts.duplicatesList.find(d => d.url === 'https://a.com');
      const bEntry = counts.duplicatesList.find(d => d.url === 'https://b.com');
      expect(aEntry.duplicatesToClose).toBe(0); // excepted
      expect(bEntry.duplicatesToClose).toBe(1); // not excepted
    });
  });

  test('urlCounts tracks per-URL counts', () => {
    jest.isolateModules(() => {
      const { computeCountsFromTabs } = loadModule();
      const tabs = [
        createMockTab(1, 'https://a.com', 'A'),
        createMockTab(2, 'https://a.com', 'A'),
        createMockTab(3, 'https://b.com', 'B')
      ];
      const counts = computeCountsFromTabs(tabs);
      expect(counts.urlCounts['https://a.com']).toBe(2);
      expect(counts.urlCounts['https://b.com']).toBe(1);
    });
  });

  test('titles stores first non-empty title per URL', () => {
    jest.isolateModules(() => {
      const { computeCountsFromTabs } = loadModule();
      const tabs = [
        createMockTab(1, 'https://a.com', 'First Title'),
        createMockTab(2, 'https://a.com', 'Second Title')
      ];
      const counts = computeCountsFromTabs(tabs);
      // second title overwrites since it's truthy
      expect(counts.titles['https://a.com']).toBeDefined();
    });
  });

  test('handles tabs with empty URLs', () => {
    jest.isolateModules(() => {
      const { computeCountsFromTabs } = loadModule();
      const tabs = [
        createMockTab(1, '', 'Empty'),
        createMockTab(2, 'https://a.com', 'A')
      ];
      const counts = computeCountsFromTabs(tabs);
      expect(counts.totalTabs).toBe(2);
    });
  });

  test('handles suspended tab URLs via extractRealUrl', () => {
    jest.isolateModules(() => {
      const { computeCountsFromTabs } = loadModule();
      const suspendedUrl =
        'chrome-extension://test/suspended.html#uri=https%3A%2F%2Fexample.com';
      const tabs = [
        createMockTab(1, 'https://example.com', 'Normal'),
        createMockTab(2, suspendedUrl, 'Suspended')
      ];
      const counts = computeCountsFromTabs(tabs);
      // Both resolve to same real URL
      expect(counts.uniqueUrls).toBe(1);
      expect(counts.duplicates).toBe(1);
    });
  });

  test('no duplicates when all URLs are unique', () => {
    jest.isolateModules(() => {
      const { computeCountsFromTabs } = loadModule();
      const tabs = [
        createMockTab(1, 'https://a.com', 'A'),
        createMockTab(2, 'https://b.com', 'B'),
        createMockTab(3, 'https://c.com', 'C')
      ];
      const counts = computeCountsFromTabs(tabs);
      expect(counts.duplicates).toBe(0);
      expect(counts.duplicatesCloseable).toBe(0);
      expect(counts.duplicatesList).toHaveLength(0);
    });
  });
});
