// Mock Chrome APIs for testing
global.chrome = {
  tabs: {
    query: jest.fn(),
    remove: jest.fn(),
    move: jest.fn(),
    onCreated: { addListener: jest.fn() },
    onUpdated: { addListener: jest.fn() },
    onRemoved: { addListener: jest.fn() },
    onReplaced: { addListener: jest.fn() },
    onActivated: { addListener: jest.fn() }
  },
  action: {
    setIcon: jest.fn((opts, cb) => cb && cb()),
    setBadgeText: jest.fn((opts, cb) => cb && cb()),
    setBadgeBackgroundColor: jest.fn((opts, cb) => cb && cb()),
    setTitle: jest.fn((opts, cb) => cb && cb()),
    onClicked: { addListener: jest.fn() }
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    },
    onChanged: { addListener: jest.fn() }
  },
  runtime: {
    onInstalled: { addListener: jest.fn() },
    onStartup: { addListener: jest.fn() },
    onMessage: { addListener: jest.fn() },
    lastError: null
  },
  commands: {
    onCommand: { addListener: jest.fn() }
  },
  notifications: {
    create: jest.fn()
  }
};

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Helper function to reset all mocks
global.resetAllMocks = () => {
  jest.clearAllMocks();
  chrome.runtime.lastError = null;
};

// Helper function to simulate Chrome API errors
global.simulateError = errorMessage => {
  chrome.runtime.lastError = { message: errorMessage };
};

// Helper function to create mock tabs
global.createMockTab = (id, url, title = 'Test Tab', options = {}) => ({
  id,
  url,
  title,
  active: options.active || false,
  pinned: options.pinned || false,
  windowId: options.windowId || 1,
  ...options
});

// Helper function to create suspended tab URL
global.createSuspendedUrl = (realUrl, suspenderExtensionId = 'test123') => {
  const encodedUrl = encodeURIComponent(realUrl);
  return `chrome-extension://${suspenderExtensionId}/suspended.html#uri=${encodedUrl}`;
};
