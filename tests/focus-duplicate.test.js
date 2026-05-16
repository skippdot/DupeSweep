describe('focusDuplicateByUrl', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.resetModules();
  });

  function loadModule() {
    chrome.storage.sync.get.mockImplementation((defaults, cb) => cb({ exceptionsRules: '' }));
    chrome.tabs.update = jest.fn((id, opts, cb) => cb && cb({ id, windowId: 1 }));
    chrome.windows = { update: jest.fn((id, opts, cb) => cb && cb()) };
  }

  test('focuses the first matching tab when none is active', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 1, index: 0 }),
        createMockTab(2, 'https://a.com', 'A', { windowId: 1, index: 1 }),
        createMockTab(3, 'https://b.com', 'B', { windowId: 1, index: 2 })
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      loadModule();

      require('../extension/close_tabs.js');
      const { focusDuplicateByUrl } = global.__cdt_test;
      const callback = jest.fn();

      focusDuplicateByUrl('https://a.com', callback);

      expect(chrome.tabs.update).toHaveBeenCalledWith(1, { active: true }, expect.any(Function));
      expect(callback).toHaveBeenCalledWith(true);
    });
  });

  test('cycles to the next duplicate when active tab matches', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 1, index: 0 }),
        createMockTab(2, 'https://a.com', 'A', { windowId: 1, index: 1, active: true }),
        createMockTab(3, 'https://a.com', 'A', { windowId: 1, index: 2 })
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      loadModule();

      require('../extension/close_tabs.js');
      const { focusDuplicateByUrl } = global.__cdt_test;
      const callback = jest.fn();

      focusDuplicateByUrl('https://a.com', callback);

      // active is tab 2 (index 1 in sorted matches), so next is tab 3 (index 2)
      expect(chrome.tabs.update).toHaveBeenCalledWith(3, { active: true }, expect.any(Function));
    });
  });

  test('wraps around to first tab when active is last', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 1, index: 0 }),
        createMockTab(2, 'https://a.com', 'A', { windowId: 1, index: 1 }),
        createMockTab(3, 'https://a.com', 'A', { windowId: 1, index: 2, active: true })
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      loadModule();

      require('../extension/close_tabs.js');
      const { focusDuplicateByUrl } = global.__cdt_test;
      const callback = jest.fn();

      focusDuplicateByUrl('https://a.com', callback);

      // active is last in sorted list, wraps to first
      expect(chrome.tabs.update).toHaveBeenCalledWith(1, { active: true }, expect.any(Function));
    });
  });

  test('calls callback with false when no URL provided', () => {
    jest.isolateModules(() => {
      chrome.tabs.query.mockImplementation((opts, cb) => cb([]));
      loadModule();

      require('../extension/close_tabs.js');
      const { focusDuplicateByUrl } = global.__cdt_test;
      const callback = jest.fn();

      focusDuplicateByUrl('', callback);

      expect(callback).toHaveBeenCalledWith(false, 'No URL provided');
      expect(chrome.tabs.update).not.toHaveBeenCalled();
    });
  });

  test('calls callback with false when no tabs match', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://other.com', 'Other', { windowId: 1 })
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      loadModule();

      require('../extension/close_tabs.js');
      const { focusDuplicateByUrl } = global.__cdt_test;
      const callback = jest.fn();

      focusDuplicateByUrl('https://a.com', callback);

      expect(callback).toHaveBeenCalledWith(false, 'No matching tabs');
    });
  });

  test('handles chrome.tabs.update error', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 1, index: 0 })
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      loadModule();
      chrome.tabs.update = jest.fn((id, opts, cb) => {
        chrome.runtime.lastError = { message: 'Tab not found' };
        cb && cb(null);
        chrome.runtime.lastError = null;
      });

      require('../extension/close_tabs.js');
      const { focusDuplicateByUrl } = global.__cdt_test;
      const callback = jest.fn();

      focusDuplicateByUrl('https://a.com', callback);

      expect(callback).toHaveBeenCalledWith(false, 'Tab not found');
    });
  });
});
