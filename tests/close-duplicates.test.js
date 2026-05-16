describe('closeDuplicateTabs', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.resetModules();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function loadModule(exceptionsRules = '') {
    chrome.storage.sync.get.mockImplementation((defaults, cb) => cb({ exceptionsRules }));
    chrome.tabs.remove.mockImplementation((ids, cb) => cb && cb());
    return () => {
      require('../extension/close_tabs.js');
      return global.__cdt_test;
    };
  }

  test('closes duplicate tabs keeping one per URL', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 1 }),
        createMockTab(2, 'https://a.com', 'A', { windowId: 1 }),
        createMockTab(3, 'https://a.com', 'A', { windowId: 1 }),
        createMockTab(4, 'https://b.com', 'B', { windowId: 1 })
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      const init = loadModule();
      const { closeDuplicateTabs } = init();

      closeDuplicateTabs();

      expect(chrome.tabs.remove).toHaveBeenCalledTimes(1);
      const removedIds = chrome.tabs.remove.mock.calls[0][0];
      expect(removedIds).toHaveLength(2); // close 2 of the 3 a.com tabs
      expect(removedIds).not.toContain(1); // keeps first (lowest id)
    });
  });

  test('keeps active tab when closing duplicates', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 1 }),
        createMockTab(2, 'https://a.com', 'A', { windowId: 1, active: true }),
        createMockTab(3, 'https://a.com', 'A', { windowId: 1 })
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      const init = loadModule();
      const { closeDuplicateTabs } = init();

      closeDuplicateTabs();

      const removedIds = chrome.tabs.remove.mock.calls[0][0];
      expect(removedIds).not.toContain(2); // active tab is kept
      expect(removedIds).toContain(1);
      expect(removedIds).toContain(3);
    });
  });

  test('keeps pinned tab when closing duplicates', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 1 }),
        createMockTab(2, 'https://a.com', 'A', { windowId: 1, pinned: true }),
        createMockTab(3, 'https://a.com', 'A', { windowId: 1 })
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      const init = loadModule();
      const { closeDuplicateTabs } = init();

      closeDuplicateTabs();

      const removedIds = chrome.tabs.remove.mock.calls[0][0];
      expect(removedIds).not.toContain(2); // pinned tab is kept
    });
  });

  test('does not close excepted duplicates', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://a.com', 'Excepted Page', { windowId: 1 }),
        createMockTab(2, 'https://a.com', 'Excepted Page', { windowId: 1 })
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      const init = loadModule('title/Excepted/');
      const { closeDuplicateTabs, compileExceptions } = init();
      compileExceptions('title/Excepted/');

      closeDuplicateTabs();

      expect(chrome.tabs.remove).not.toHaveBeenCalled();
    });
  });

  test('does not call remove when no duplicates', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 1 }),
        createMockTab(2, 'https://b.com', 'B', { windowId: 1 })
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      const init = loadModule();
      const { closeDuplicateTabs } = init();

      closeDuplicateTabs();

      expect(chrome.tabs.remove).not.toHaveBeenCalled();
    });
  });

  test('handles suspended tab duplicates', () => {
    jest.isolateModules(() => {
      const suspendedUrl =
        'chrome-extension://test/suspended.html#uri=https%3A%2F%2Fa.com';
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 1 }),
        createMockTab(2, suspendedUrl, 'A Suspended', { windowId: 1 })
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      const init = loadModule();
      const { closeDuplicateTabs } = init();

      closeDuplicateTabs();

      expect(chrome.tabs.remove).toHaveBeenCalled();
      const removedIds = chrome.tabs.remove.mock.calls[0][0];
      expect(removedIds).toHaveLength(1);
    });
  });

  test('active tab preferred over pinned when both exist', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 1, pinned: true }),
        createMockTab(2, 'https://a.com', 'A', { windowId: 1, active: true }),
        createMockTab(3, 'https://a.com', 'A', { windowId: 1 })
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      const init = loadModule();
      const { closeDuplicateTabs } = init();

      closeDuplicateTabs();

      const removedIds = chrome.tabs.remove.mock.calls[0][0];
      expect(removedIds).not.toContain(2); // active tab kept
    });
  });

  test('isAutoMode flag shows in logging', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 1 }),
        createMockTab(2, 'https://a.com', 'A', { windowId: 1 })
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      const init = loadModule();
      const { closeDuplicateTabs } = init();

      closeDuplicateTabs(true); // auto mode

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Auto-Closing')
      );
    });
  });
});
