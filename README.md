# DupeSweep

A Chrome extension that sweeps away duplicate browser tabs instantly, freeing up memory and keeping your browser organized.

## Quick Install

1. **Download**: [Download ZIP](https://github.com/skippdot/DupeSweep/archive/main.zip) or clone this repo
2. **Extract**: Unzip the downloaded file
3. **Chrome**: Go to `chrome://extensions/` and enable "Developer mode"
4. **Load**: Click "Load unpacked" and select the `extension` folder
5. **Done**: Start sweeping duplicate tabs!

## Features

- **Duplicate Detection**: Automatically identifies tabs with identical URLs
- **Smart Badge**: Shows the number of duplicate tabs in the extension icon
- **Intelligent Sweeping**: Preserves active and pinned tabs when removing duplicates
- **Tab Sorting**: Optional feature to reorganize tabs by URL when sweeping duplicates
- **Multi-Window Support**: Works across all browser windows
- **Real-time Updates**: Badge updates automatically as you browse
- **Auto-Sweep**: Automatically remove duplicates as they're detected
- **Tab Suspender Support**: Compatible with Marvellous Suspender and other tab suspenders
- **Keyboard Shortcut**: `Alt+Shift+D` (or `Option+Shift+D` on Mac)
- **Exceptions**: Configure rules to skip specific URLs or titles
- **Badge Color**: Customizable badge color
- **8 Languages**: English, Russian, Spanish, French, Italian, Bulgarian, Chinese, Hindi

## Installation

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `extension` folder (not the root directory)
5. The extension will appear in your toolbar

> **Important**: Make sure to select the `extension` folder, which contains only the necessary extension files.

## How It Works

1. **Detection**: The extension monitors all your tabs and identifies duplicates by comparing URLs
2. **Badge Display**: The number of duplicate tabs is shown on the extension icon
3. **Smart Sweeping**: When you click the extension icon, it removes duplicate tabs while preserving:
   - Active tabs (currently selected)
   - Pinned tabs
   - The most recently accessed tab for each URL

## Settings

Access settings by right-clicking the extension icon and selecting "Options":

- **Auto-Sweep**: Automatically sweep away duplicates as they're detected (2-second delay)
- **Current Window Only**: Limit duplicate detection to the current window
- **Sort Tabs**: Reorganize tabs by URL when sweeping duplicates
- **Exceptions**: Rules to exclude specific URLs or titles from sweeping
- **Badge Color**: Choose your preferred badge color

## Privacy

This extension respects your privacy:
- No data collection
- No external connections
- All processing happens locally in your browser
- Only stores your preferences locally

See our full [Privacy Policy](extension/privacy-policy.html).

## Permissions

The extension requires these permissions:
- **tabs**: To read tab URLs, identify duplicates, and remove duplicate tabs
- **storage**: To save your preferences

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Background**: Service Worker (efficient and modern)
- **Compatibility**: Chrome 88+ (Manifest V3 requirement)

## Development

### Project Structure
```
├── extension/            # Chrome Extension Files (load this folder)
│   ├── manifest.json     # Extension configuration
│   ├── close_tabs.js     # Main extension logic
│   ├── options.html      # Settings page
│   ├── options.js        # Settings functionality
│   ├── popup.html        # Popup interface
│   ├── popup.js          # Popup functionality
│   ├── privacy-policy.html # Privacy policy
│   └── icon_*.png        # Extension icons
├── tests/                # Test files and framework
├── docs/                 # Documentation and guides
├── README.md             # This file (project overview)
├── CHANGELOG.md          # Version history
└── package.json          # Development dependencies
```

### Building
No build process required - this is a vanilla JavaScript extension.

### Development & Testing
1. **Load Extension**: Load the `extension` folder in Chrome developer mode
2. **Run Tests**: `npm test` to run the automated test suite
3. **Manual Testing**: Open multiple tabs with the same URL
4. **Verify Badge**: Check that the badge shows the number of duplicates
5. **Test Sweeping**: Click the extension icon to sweep duplicates
6. **Check Preservation**: Verify that active/pinned tabs are preserved

### Available Scripts
```bash
# Testing
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Code Quality
npm run lint          # Check for linting errors
npm run lint:fix      # Fix auto-fixable linting errors
npm run format        # Format all files with Prettier
npm run format:check  # Check if files are properly formatted
npm run quality       # Run all quality checks (lint + format + tests)
```

### Quick Start
```bash
# Clone the repository
git clone https://github.com/skippdot/DupeSweep.git
cd DupeSweep

# Install development dependencies
npm install

# Run tests
npm test
```

## Contributing

Contributions are welcome!

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Test** your changes (`npm test`)
4. **Commit** your changes
5. **Push** to the branch
6. **Open** a Pull Request

### Contribution Guidelines
- All quality checks must pass (`npm run quality`)
- Follow existing code style and patterns (enforced by ESLint/Prettier)
- Update documentation for new features
- Add tests for new functionality

## License

This project is open source under the MIT License.

## Support

- Report issues on [GitHub Issues](https://github.com/skippdot/DupeSweep/issues)
