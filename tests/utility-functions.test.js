describe('Utility functions', () => {
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

  describe('getDomain', () => {
    test('extracts domain from https URL', () => {
      jest.isolateModules(() => {
        const { getDomain } = loadModule();
        expect(getDomain('https://example.com/path')).toBe('example.com');
      });
    });

    test('extracts domain from http URL', () => {
      jest.isolateModules(() => {
        const { getDomain } = loadModule();
        expect(getDomain('http://example.com/path')).toBe('example.com');
      });
    });

    test('handles URL with query string', () => {
      jest.isolateModules(() => {
        const { getDomain } = loadModule();
        expect(getDomain('https://example.com?query=1')).toBe('example.com');
      });
    });

    test('handles URL with hash', () => {
      jest.isolateModules(() => {
        const { getDomain } = loadModule();
        expect(getDomain('https://example.com#section')).toBe('example.com');
      });
    });

    test('handles subdomain', () => {
      jest.isolateModules(() => {
        const { getDomain } = loadModule();
        expect(getDomain('https://sub.example.com/page')).toBe('sub.example.com');
      });
    });
  });

  describe('isCloseableUrl', () => {
    test('returns true for non-empty URLs', () => {
      jest.isolateModules(() => {
        const { isCloseableUrl } = loadModule();
        expect(isCloseableUrl('https://example.com')).toBe(true);
        expect(isCloseableUrl('chrome://newtab')).toBe(true);
      });
    });

    test('returns false for empty/falsy URLs', () => {
      jest.isolateModules(() => {
        const { isCloseableUrl } = loadModule();
        expect(isCloseableUrl('')).toBe(false);
        expect(isCloseableUrl(null)).toBe(false);
        expect(isCloseableUrl(undefined)).toBe(false);
      });
    });
  });

  describe('extractRealUrl', () => {
    test('returns normal URLs unchanged', () => {
      jest.isolateModules(() => {
        const { extractRealUrl } = loadModule();
        expect(extractRealUrl('https://example.com')).toBe('https://example.com');
      });
    });

    test('extracts URL from suspended tab hash format', () => {
      jest.isolateModules(() => {
        const { extractRealUrl } = loadModule();
        const suspended =
          'chrome-extension://test/suspended.html#uri=https%3A%2F%2Fexample.com%2Fpage';
        expect(extractRealUrl(suspended)).toBe('https://example.com/page');
      });
    });

    test('handles null/undefined input', () => {
      jest.isolateModules(() => {
        const { extractRealUrl } = loadModule();
        expect(extractRealUrl(null)).toBeNull();
        expect(extractRealUrl(undefined)).toBeUndefined();
        expect(extractRealUrl('')).toBe('');
      });
    });

    test('extracts from Marvellous Suspender format', () => {
      jest.isolateModules(() => {
        const { extractRealUrl } = loadModule();
        const url =
          'chrome-extension://noogafoofpebimajpfpamcfhoaifemoa/suspended.html#ttl=Test&pos=0&uri=https://example.com/page';
        expect(extractRealUrl(url)).toBe('https://example.com/page');
      });
    });

    test('extracts from query param format', () => {
      jest.isolateModules(() => {
        const { extractRealUrl } = loadModule();
        const url = 'chrome-extension://greatid/suspended.html?uri=https%3A%2F%2Fexample.com';
        expect(extractRealUrl(url)).toBe('https://example.com');
      });
    });

    test('returns original if no uri param found in suspended URL', () => {
      jest.isolateModules(() => {
        const { extractRealUrl } = loadModule();
        const url = 'chrome-extension://test/suspended.html#invalid';
        expect(extractRealUrl(url)).toBe(url);
      });
    });
  });

  describe('mapBadgeColor', () => {
    test('returns correct RGBA for known colors', () => {
      jest.isolateModules(() => {
        const { mapBadgeColor } = loadModule();
        expect(mapBadgeColor('red')).toEqual([217, 48, 37, 255]);
        expect(mapBadgeColor('green')).toEqual([52, 168, 83, 255]);
        expect(mapBadgeColor('blue')).toEqual([66, 133, 244, 255]);
        expect(mapBadgeColor('orange')).toEqual([255, 152, 0, 255]);
        expect(mapBadgeColor('yellow')).toEqual([251, 188, 5, 255]);
        expect(mapBadgeColor('purple')).toEqual([156, 39, 176, 255]);
        expect(mapBadgeColor('gray')).toEqual([128, 128, 128, 255]);
      });
    });

    test('defaults to red for unknown color', () => {
      jest.isolateModules(() => {
        const { mapBadgeColor } = loadModule();
        expect(mapBadgeColor('pink')).toEqual([217, 48, 37, 255]);
        expect(mapBadgeColor('')).toEqual([217, 48, 37, 255]);
      });
    });

    test('defaults to red for null/undefined', () => {
      jest.isolateModules(() => {
        const { mapBadgeColor } = loadModule();
        expect(mapBadgeColor(null)).toEqual([217, 48, 37, 255]);
        expect(mapBadgeColor(undefined)).toEqual([217, 48, 37, 255]);
      });
    });

    test('is case insensitive', () => {
      jest.isolateModules(() => {
        const { mapBadgeColor } = loadModule();
        expect(mapBadgeColor('RED')).toEqual([217, 48, 37, 255]);
        expect(mapBadgeColor('Green')).toEqual([52, 168, 83, 255]);
      });
    });
  });

  describe('getTopDomainsTitle', () => {
    test('returns formatted string for domains with count >= 5', () => {
      jest.isolateModules(() => {
        const { getTopDomainsTitle } = loadModule();
        const domains = [
          { domain: 'google.com', count: 10 },
          { domain: 'github.com', count: 5 },
          { domain: 'example.com', count: 3 }
        ];
        const result = getTopDomainsTitle(domains);
        expect(result).toContain('10 : google.com');
        expect(result).toContain('5 : github.com');
        expect(result).not.toContain('example.com');
        expect(result).toMatch(/^## Top Domains\n/);
      });
    });

    test('returns empty string when no domains have count >= 5', () => {
      jest.isolateModules(() => {
        const { getTopDomainsTitle } = loadModule();
        const domains = [
          { domain: 'a.com', count: 2 },
          { domain: 'b.com', count: 4 }
        ];
        expect(getTopDomainsTitle(domains)).toBe('');
      });
    });

    test('returns empty string for empty array', () => {
      jest.isolateModules(() => {
        const { getTopDomainsTitle } = loadModule();
        expect(getTopDomainsTitle([])).toBe('');
      });
    });
  });

  describe('hasTitleExceptions', () => {
    test('returns true when title exceptions are compiled', () => {
      jest.isolateModules(() => {
        const { compileExceptions, hasTitleExceptions } = loadModule();
        compileExceptions('title/My Title/');
        expect(hasTitleExceptions()).toBe(true);
      });
    });

    test('returns false when only URL exceptions exist', () => {
      jest.isolateModules(() => {
        const { compileExceptions, hasTitleExceptions } = loadModule();
        compileExceptions('*://example.com/*');
        expect(hasTitleExceptions()).toBe(false);
      });
    });

    test('returns false with no exceptions', () => {
      jest.isolateModules(() => {
        const { compileExceptions, hasTitleExceptions } = loadModule();
        compileExceptions('');
        expect(hasTitleExceptions()).toBe(false);
      });
    });
  });

  describe('_urlMatchVariants', () => {
    test('returns original URL and with trailing slash toggled', () => {
      jest.isolateModules(() => {
        const { _urlMatchVariants } = loadModule();
        expect(_urlMatchVariants('https://example.com')).toEqual([
          'https://example.com',
          'https://example.com/'
        ]);
        expect(_urlMatchVariants('https://example.com/')).toEqual([
          'https://example.com/',
          'https://example.com'
        ]);
      });
    });

    test('returns empty string for falsy input', () => {
      jest.isolateModules(() => {
        const { _urlMatchVariants } = loadModule();
        expect(_urlMatchVariants('')).toEqual(['']);
        expect(_urlMatchVariants(null)).toEqual(['']);
      });
    });

    test('does not add slash variant for non-protocol URLs', () => {
      jest.isolateModules(() => {
        const { _urlMatchVariants } = loadModule();
        expect(_urlMatchVariants('example.com')).toEqual(['example.com']);
      });
    });
  });

  describe('compileExceptions advanced', () => {
    test('ignores comments and blank lines', () => {
      jest.isolateModules(() => {
        const { compileExceptions, isExcepted } = loadModule();
        compileExceptions('# comment\n\nhttps://example.com\n');
        expect(isExcepted('https://example.com', '')).toBe(true);
        expect(isExcepted('https://other.com', '')).toBe(false);
      });
    });

    test('handles multiple rules', () => {
      jest.isolateModules(() => {
        const { compileExceptions, isExcepted } = loadModule();
        compileExceptions('*://a.com/*\ntitle/Special/');
        expect(isExcepted('https://a.com/path', '')).toBe(true);
        expect(isExcepted('https://other.com', 'Special Page')).toBe(true);
        expect(isExcepted('https://other.com', 'Normal')).toBe(false);
      });
    });

    test('isExcepted checks URL variants for trailing slash', () => {
      jest.isolateModules(() => {
        const { compileExceptions, isExcepted } = loadModule();
        compileExceptions('/^https:\\/\\/example\\.com$/');
        // Should match both with and without trailing slash
        expect(isExcepted('https://example.com', '')).toBe(true);
        expect(isExcepted('https://example.com/', '')).toBe(true);
      });
    });
  });
});
