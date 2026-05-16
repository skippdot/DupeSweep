describe('Window stats in computeCountsFromTabs', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.resetModules();
  });

  function loadModule() {
    const tabs = [createMockTab(1, 'https://a.com', 'A')];
    chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
    chrome.storage.sync.get.mockImplementation((defaults, cb) => cb({ exceptionsRules: '' }));
    require('../extension/close_tabs.js');
    return global.__cdt_test;
  }

  test('returns windowStats grouped by windowId', () => {
    jest.isolateModules(() => {
      const { computeCountsFromTabs } = loadModule();
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 10 }),
        createMockTab(2, 'https://b.com', 'B', { windowId: 10 }),
        createMockTab(3, 'https://c.com', 'C', { windowId: 20 }),
        createMockTab(4, 'https://d.com', 'D', { windowId: 20 }),
        createMockTab(5, 'https://e.com', 'E', { windowId: 20 }),
        createMockTab(6, 'https://f.com', 'F', { windowId: 30 })
      ];

      const counts = computeCountsFromTabs(tabs);
      expect(counts.windowStats).toHaveLength(3);
      // sorted by count descending
      expect(counts.windowStats[0]).toEqual({ windowId: 20, count: 3 });
      expect(counts.windowStats[1]).toEqual({ windowId: 10, count: 2 });
      expect(counts.windowStats[2]).toEqual({ windowId: 30, count: 1 });
    });
  });

  test('single window returns one entry', () => {
    jest.isolateModules(() => {
      const { computeCountsFromTabs } = loadModule();
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 1 }),
        createMockTab(2, 'https://b.com', 'B', { windowId: 1 })
      ];

      const counts = computeCountsFromTabs(tabs);
      expect(counts.windowStats).toHaveLength(1);
      expect(counts.windowStats[0]).toEqual({ windowId: 1, count: 2 });
    });
  });

  test('empty tabs returns empty windowStats', () => {
    jest.isolateModules(() => {
      const { computeCountsFromTabs } = loadModule();
      const counts = computeCountsFromTabs([]);
      expect(counts.windowStats).toEqual([]);
    });
  });

  test('four windows with varying tab counts', () => {
    jest.isolateModules(() => {
      const { computeCountsFromTabs } = loadModule();
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 1 }),
        createMockTab(2, 'https://b.com', 'B', { windowId: 2 }),
        createMockTab(3, 'https://c.com', 'C', { windowId: 2 }),
        createMockTab(4, 'https://d.com', 'D', { windowId: 3 }),
        createMockTab(5, 'https://e.com', 'E', { windowId: 3 }),
        createMockTab(6, 'https://f.com', 'F', { windowId: 3 }),
        createMockTab(7, 'https://g.com', 'G', { windowId: 4 }),
        createMockTab(8, 'https://h.com', 'H', { windowId: 4 }),
        createMockTab(9, 'https://i.com', 'I', { windowId: 4 }),
        createMockTab(10, 'https://j.com', 'J', { windowId: 4 })
      ];

      const counts = computeCountsFromTabs(tabs);
      expect(counts.windowStats).toHaveLength(4);
      expect(counts.windowStats[0].windowId).toBe(4);
      expect(counts.windowStats[0].count).toBe(4);
      expect(counts.windowStats[1].count).toBe(3);
      expect(counts.windowStats[2].count).toBe(2);
      expect(counts.windowStats[3].count).toBe(1);
    });
  });

  test('windowStats sum equals totalTabs', () => {
    jest.isolateModules(() => {
      const { computeCountsFromTabs } = loadModule();
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 1 }),
        createMockTab(2, 'https://b.com', 'B', { windowId: 2 }),
        createMockTab(3, 'https://c.com', 'C', { windowId: 1 }),
        createMockTab(4, 'https://d.com', 'D', { windowId: 3 }),
        createMockTab(5, 'https://e.com', 'E', { windowId: 2 })
      ];

      const counts = computeCountsFromTabs(tabs);
      const windowTotal = counts.windowStats.reduce((s, w) => s + w.count, 0);
      expect(windowTotal).toBe(counts.totalTabs);
    });
  });
});
