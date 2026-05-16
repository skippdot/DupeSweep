# Changelog

All notable changes to the DupeSweep extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/3.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Window Stats in Popup**: New "Windows" section showing tab counts per Chrome window, sorted by count descending. Click a window row to focus it. Section is hidden when only one window is open.
- **Comprehensive Test Suite**: 7 new test files (110 total tests across 12 suites):
  - `window-stats.test.js` — windowStats grouping, sorting, sum invariant
  - `compute-counts.test.js` — computeCountsFromTabs: totals, duplicates, topDomains, exceptions
  - `utility-functions.test.js` — getDomain, isCloseableUrl, extractRealUrl, mapBadgeColor, compileExceptions
  - `close-duplicates.test.js` — closeDuplicateTabs: keeps active/pinned, respects exceptions, suspended tabs
  - `message-handlers.test.js` — all message types (GET_COUNTS, CLOSE_DUPLICATES, SET_AUTO_CLOSE, FOCUS/CLOSE_ONE)
  - `focus-duplicate.test.js` — focusDuplicateByUrl: cycling, wrap-around, error handling
  - `init-and-config.test.js` — loadConfigs, storage.onChanged, keyboard shortcuts, sortTabs
- **CLAUDE.md**: Project documentation for AI-assisted development

### Changed
- `close_tabs.js`: `computeCountsFromTabs()` now returns `windowStats` (tab counts grouped by windowId)
- `close_tabs.js`: Expanded `__cdt_test` exports with `extractRealUrl`, `mapBadgeColor`, `getTopDomainsTitle`, `hasTitleExceptions`, `_urlMatchVariants`
- `GET_COUNTS` message response now includes `windowStats` array
- `popup.js`: Added `renderWindowStats()` function called between duplicates and top domains
- `popup.html`: Added "Windows" section with `#windowStats` container

### Coverage
- `close_tabs.js`: 40% → 81% statements, 72% branches, 81% functions
- 33 tests (5 suites) → 110 tests (12 suites), all passing

---

## [3.0.0] - 2026-02-17

### Initial Release

#### Features
- **Smart Duplicate Detection**: Identifies tabs with identical URLs across all windows
- **Auto-Sweep Mode**: Automatically remove duplicates as they're detected (2-second debounce)
- **Tab Suspender Compatibility**: Full support for Marvellous Suspender and other tab suspender extensions
- **Keyboard Shortcut**: `Alt+Shift+D` (Windows/Linux) and `Option+Shift+D` (Mac)
- **Current Window Only**: Option to limit duplicate detection to the current window
- **Tab Sorting**: Reorganize all tabs by URL when sweeping duplicates
- **Exceptions**: Configure rules to skip specific URLs or titles (wildcards and regex supported)
- **Badge Color**: Customizable badge color (green, red, orange, yellow, blue, purple, gray)
- **Real-time Statistics**: Live dashboard showing tab counts, duplicates, and domains
- **Search Functionality**: Real-time search across domains and page titles
- **8 Languages**: English, Russian, Spanish, French, Italian, Bulgarian, Chinese (Simplified), Hindi
- **Privacy First**: Zero data collection, all processing happens locally
- **Manifest V3**: Built on the latest Chrome extension standard

#### Technical
- Service Worker architecture for efficiency
- Comprehensive error handling with graceful fallbacks
- Automated test suite with Jest
- ESLint + Prettier for code quality
- Minimal permissions (tabs + storage only)

---

## Support

- **GitHub Issues**: [Report bugs and request features](https://github.com/skippdot/DupeSweep/issues)
