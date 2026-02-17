# Changelog

All notable changes to the DupeSweep extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-17

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
