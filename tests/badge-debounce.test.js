describe('Badge inactive debounce prevents gray flash', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.resetModules();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('does not immediately set gray when count is 0 if a new active update arrives quickly', () => {
    jest.isolateModules(() => {
      const tabs0 = [createMockTab(1, 'https://a.com', 'A')];
      const tabsDup = [
        createMockTab(1, 'https://a.com', 'A'),
        createMockTab(2, 'https://a.com', 'A')
      ];

      // First call returns no closeable dups (0), second call (soon after) returns 1 dup
      let call = 0;
      chrome.tabs.query.mockImplementation((opts, cb) => {
        call += 1;
        cb(call === 1 ? tabs0 : tabsDup);
      });
      chrome.storage.sync.get.mockImplementation((defaults, cb) => cb({ exceptionsRules: '' }));

      require('../extension/close_tabs.js');
      const { refreshBadgeForTest } = global.__cdt_test;

      // trigger first update -> 0 closeable -> debounce should schedule gray
      refreshBadgeForTest();
      // no badge calls yet because we debounce inactive set
      expect(chrome.action.setBadgeText).not.toHaveBeenCalled();

      // before debounce fires, another update arrives with an active dup
      refreshBadgeForTest();
      // run timers a bit less than debounce
      jest.advanceTimersByTime(350);

      // now we should have set the red dup count once, and never set gray first
      const texts = chrome.action.setBadgeText.mock.calls.map(c => c[0].text);
      expect(texts[0]).toBe('1');
    });
  });
});
