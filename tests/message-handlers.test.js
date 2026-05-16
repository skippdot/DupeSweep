describe('Message handlers', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.resetModules();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function loadModuleAndGetMessageHandler(tabs = [], exceptionsRules = '') {
    chrome.tabs.query.mockImplementation((opts, cb) => cb(tabs));
    chrome.storage.sync.get.mockImplementation((defaults, cb) => cb({ exceptionsRules }));
    chrome.tabs.remove.mockImplementation((ids, cb) => cb && cb());
    chrome.tabs.update = jest.fn((id, opts, cb) => cb && cb({ id, windowId: 1 }));
    chrome.windows = { update: jest.fn((id, opts, cb) => cb && cb()) };

    require('../extension/close_tabs.js');

    // Find the onMessage listener
    const onMessageCall = chrome.runtime.onMessage.addListener.mock.calls[0];
    return onMessageCall[0]; // the handler function
  }

  describe('GET_COUNTS', () => {
    test('responds with counts and windowStats', () => {
      jest.isolateModules(() => {
        const tabs = [
          createMockTab(1, 'https://a.com', 'A', { windowId: 1 }),
          createMockTab(2, 'https://a.com', 'A', { windowId: 1 }),
          createMockTab(3, 'https://b.com', 'B', { windowId: 2 })
        ];
        const handler = loadModuleAndGetMessageHandler(tabs);
        const sendResponse = jest.fn();

        const result = handler({ type: 'GET_COUNTS' }, {}, sendResponse);

        expect(result).toBe(true); // async response
        expect(sendResponse).toHaveBeenCalledWith(
          expect.objectContaining({
            ok: true,
            totalTabs: 3,
            duplicates: 1,
            duplicatesCloseable: 1,
            uniqueUrls: 2,
            windowStats: expect.arrayContaining([
              expect.objectContaining({ count: expect.any(Number) })
            ]),
            settings: expect.objectContaining({
              autoClose: false,
              currentWindowOnly: false,
              sortTabs: false
            })
          })
        );
      });
    });
  });

  describe('CLOSE_DUPLICATES', () => {
    test('responds with ok and triggers close', () => {
      jest.isolateModules(() => {
        const tabs = [
          createMockTab(1, 'https://a.com', 'A', { windowId: 1 }),
          createMockTab(2, 'https://a.com', 'A', { windowId: 1 })
        ];
        const handler = loadModuleAndGetMessageHandler(tabs);
        const sendResponse = jest.fn();

        handler({ type: 'CLOSE_DUPLICATES' }, {}, sendResponse);

        expect(sendResponse).toHaveBeenCalledWith({ ok: true });
      });
    });
  });

  describe('SET_AUTO_CLOSE', () => {
    test('saves autoClose setting to storage', () => {
      jest.isolateModules(() => {
        chrome.storage.sync.set = jest.fn((data, cb) => cb && cb());
        const handler = loadModuleAndGetMessageHandler();
        const sendResponse = jest.fn();

        const result = handler({ type: 'SET_AUTO_CLOSE', value: true }, {}, sendResponse);

        expect(result).toBe(true);
        expect(chrome.storage.sync.set).toHaveBeenCalledWith(
          { autoClose: true },
          expect.any(Function)
        );
      });
    });
  });

  describe('FOCUS_DUPLICATE_BY_URL', () => {
    test('focuses a tab matching the URL', () => {
      jest.isolateModules(() => {
        const tabs = [
          createMockTab(1, 'https://a.com', 'A', { windowId: 1, index: 0 }),
          createMockTab(2, 'https://a.com', 'A', { windowId: 1, index: 1 })
        ];
        const handler = loadModuleAndGetMessageHandler(tabs);
        const sendResponse = jest.fn();

        handler({ type: 'FOCUS_DUPLICATE_BY_URL', url: 'https://a.com' }, {}, sendResponse);

        expect(chrome.tabs.update).toHaveBeenCalled();
      });
    });

    test('handles no URL provided', () => {
      jest.isolateModules(() => {
        const handler = loadModuleAndGetMessageHandler([]);
        const sendResponse = jest.fn();

        handler({ type: 'FOCUS_DUPLICATE_BY_URL', url: '' }, {}, sendResponse);

        expect(sendResponse).toHaveBeenCalledWith({ ok: false });
      });
    });
  });

  describe('CLOSE_ONE_DUPLICATE_BY_URL', () => {
    test('closes one duplicate tab for the given URL', () => {
      jest.isolateModules(() => {
        const tabs = [
          createMockTab(1, 'https://a.com', 'A', { windowId: 1, active: true }),
          createMockTab(2, 'https://a.com', 'A', { windowId: 1 }),
          createMockTab(3, 'https://a.com', 'A', { windowId: 1 })
        ];
        const handler = loadModuleAndGetMessageHandler(tabs);
        const sendResponse = jest.fn();

        handler({ type: 'CLOSE_ONE_DUPLICATE_BY_URL', url: 'https://a.com' }, {}, sendResponse);

        expect(chrome.tabs.remove).toHaveBeenCalled();
        // Should close a non-active tab
        const closedId = chrome.tabs.remove.mock.calls[0][0];
        expect(closedId).not.toBe(1); // not the active one
      });
    });

    test('responds false when only one tab matches', () => {
      jest.isolateModules(() => {
        const tabs = [
          createMockTab(1, 'https://a.com', 'A', { windowId: 1 })
        ];
        const handler = loadModuleAndGetMessageHandler(tabs);
        const sendResponse = jest.fn();

        handler({ type: 'CLOSE_ONE_DUPLICATE_BY_URL', url: 'https://a.com' }, {}, sendResponse);

        expect(chrome.tabs.remove).not.toHaveBeenCalled();
        expect(sendResponse).toHaveBeenCalledWith({ ok: false });
      });
    });
  });

  describe('unknown message', () => {
    test('does not call sendResponse for unknown type', () => {
      jest.isolateModules(() => {
        const handler = loadModuleAndGetMessageHandler();
        const sendResponse = jest.fn();

        handler({ type: 'UNKNOWN' }, {}, sendResponse);

        expect(sendResponse).not.toHaveBeenCalled();
      });
    });
  });
});
