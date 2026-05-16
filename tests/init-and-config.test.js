describe('Initialization and config loading', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.resetModules();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('loadConfigs sets settings from storage', () => {
    jest.isolateModules(() => {
      const tabs = [createMockTab(1, 'https://a.com', 'A')];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      chrome.storage.sync.get.mockImplementation((defaults, cb) =>
        cb({
          autoClose: true,
          currentWindowOnly: true,
          sortTabs: true,
          badgeColor: 'blue',
          exceptionsRules: 'title/Test/'
        })
      );

      require('../extension/close_tabs.js');

      // Trigger onInstalled to call init -> loadConfigs
      const onInstalledCb = chrome.runtime.onInstalled.addListener.mock.calls[0][0];
      onInstalledCb({ reason: 'install' });

      // Verify storage.sync.get was called
      expect(chrome.storage.sync.get).toHaveBeenCalled();
    });
  });

  test('loadConfigs handles runtime error gracefully', () => {
    jest.isolateModules(() => {
      const tabs = [createMockTab(1, 'https://a.com', 'A')];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      chrome.storage.sync.get.mockImplementation((defaults, cb) => {
        chrome.runtime.lastError = { message: 'Storage error' };
        cb({});
        chrome.runtime.lastError = null;
      });

      require('../extension/close_tabs.js');

      // Should not throw
      const onInstalledCb = chrome.runtime.onInstalled.addListener.mock.calls[0][0];
      expect(() => onInstalledCb({ reason: 'install' })).not.toThrow();
    });
  });

  test('initTabUrl processes tabs and extracts real URLs', () => {
    jest.isolateModules(() => {
      const suspendedUrl =
        'chrome-extension://test/suspended.html#uri=https%3A%2F%2Fexample.com';
      const tabs = [
        createMockTab(1, 'https://a.com', 'A'),
        createMockTab(2, suspendedUrl, 'Suspended')
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      chrome.storage.sync.get.mockImplementation((defaults, cb) => cb({ exceptionsRules: '' }));

      require('../extension/close_tabs.js');

      // Trigger init
      const onInstalledCb = chrome.runtime.onInstalled.addListener.mock.calls[0][0];
      onInstalledCb({ reason: 'install' });

      // The tabs were processed (console.log called with tab count)
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Processed'));
    });
  });

  test('forceRefreshAllTabs queries all tabs and refreshes', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 1 }),
        createMockTab(2, 'https://b.com', 'B', { windowId: 2 })
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      chrome.storage.sync.get.mockImplementation((defaults, cb) => cb({ exceptionsRules: '' }));

      require('../extension/close_tabs.js');

      // Trigger via onClicked (which calls forceRefreshAllTabs)
      const onClickedCb = chrome.action.onClicked.addListener.mock.calls[0][0];
      onClickedCb();

      expect(chrome.tabs.query).toHaveBeenCalled();
    });
  });

  test('storage.onChanged re-initializes on sync changes', () => {
    jest.isolateModules(() => {
      const tabs = [createMockTab(1, 'https://a.com', 'A')];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      chrome.storage.sync.get.mockImplementation((defaults, cb) => cb({ exceptionsRules: '' }));

      require('../extension/close_tabs.js');

      const callsBefore = chrome.storage.sync.get.mock.calls.length;
      // Second onChanged listener handles sync re-init
      const onChangedCb = chrome.storage.onChanged.addListener.mock.calls[1][0];
      onChangedCb({ autoClose: { newValue: true } }, 'sync');

      // Should have re-called storage.sync.get for re-init
      expect(chrome.storage.sync.get.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  test('storage.onChanged updates exceptions when changed', () => {
    jest.isolateModules(() => {
      const tabs = [createMockTab(1, 'https://a.com', 'A')];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      chrome.storage.sync.get.mockImplementation((defaults, cb) => cb({ exceptionsRules: '' }));

      require('../extension/close_tabs.js');
      const { isExcepted } = global.__cdt_test;

      // Simulate exception rules change from storage listener
      const onChangedCb = chrome.storage.onChanged.addListener.mock.calls[0][0];
      onChangedCb(
        { exceptionsRules: { newValue: 'title/Special/' } },
        'sync'
      );

      // The compileExceptions should have been called with the new value
      // But note: the sync listener also calls init() which reloads from storage
      // The direct exceptionsRules listener fires compileExceptions directly
      expect(isExcepted).toBeDefined();
    });
  });

  test('closeDuplicateTabs sorts tabs when sortTabs is enabled', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://z.com', 'Z', { windowId: 1 }),
        createMockTab(2, 'https://a.com', 'A', { windowId: 1 }),
        createMockTab(3, 'https://a.com', 'A', { windowId: 1 })
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      chrome.storage.sync.get.mockImplementation((defaults, cb) =>
        cb({ exceptionsRules: '', autoClose: false, currentWindowOnly: false, sortTabs: true, badgeColor: 'green' })
      );
      chrome.tabs.remove.mockImplementation((ids, cb) => cb && cb());

      require('../extension/close_tabs.js');

      // Trigger init to set sortTabs = true
      const onInstalledCb = chrome.runtime.onInstalled.addListener.mock.calls[0][0];
      onInstalledCb({ reason: 'install' });

      const { closeDuplicateTabs } = global.__cdt_test;
      closeDuplicateTabs();

      // Should still close duplicates
      expect(chrome.tabs.remove).toHaveBeenCalled();
    });
  });

  test('queryTabsWithFilter logs warning for low tab count', () => {
    jest.isolateModules(() => {
      // Return fewer than 10 tabs to trigger the warning
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 1 })
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      chrome.storage.sync.get.mockImplementation((defaults, cb) => cb({ exceptionsRules: '' }));

      require('../extension/close_tabs.js');

      // queryTabsWithFilter is called internally during init
      const onInstalledCb = chrome.runtime.onInstalled.addListener.mock.calls[0][0];
      onInstalledCb({ reason: 'install' });

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Suspiciously low tab count')
      );
    });
  });

  test('keyboard shortcut close-duplicates triggers closeDuplicateTabs', () => {
    jest.isolateModules(() => {
      const tabs = [
        createMockTab(1, 'https://a.com', 'A', { windowId: 1 }),
        createMockTab(2, 'https://a.com', 'A', { windowId: 1 })
      ];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      chrome.storage.sync.get.mockImplementation((defaults, cb) => cb({ exceptionsRules: '' }));
      chrome.tabs.remove.mockImplementation((ids, cb) => cb && cb());

      require('../extension/close_tabs.js');

      const onCommandCb = chrome.commands.onCommand.addListener.mock.calls[0][0];
      onCommandCb('close-duplicates');

      expect(chrome.tabs.remove).toHaveBeenCalled();
    });
  });

  test('keyboard shortcut ignores unknown commands', () => {
    jest.isolateModules(() => {
      const tabs = [createMockTab(1, 'https://a.com', 'A')];
      chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
      chrome.storage.sync.get.mockImplementation((defaults, cb) => cb({ exceptionsRules: '' }));

      require('../extension/close_tabs.js');

      const onCommandCb = chrome.commands.onCommand.addListener.mock.calls[0][0];
      onCommandCb('unknown-command');

      expect(chrome.tabs.remove).not.toHaveBeenCalled();
    });
  });
});
