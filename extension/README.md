# DupeSweep - Chrome Extension

A Chrome extension that sweeps away duplicate browser tabs instantly, freeing up memory and keeping your browser organized.

## Quick Installation

### Method 1: Load from GitHub (Recommended)

1. **Download**: Clone or download this repository
2. **Open Chrome**: Go to `chrome://extensions/`
3. **Enable Developer Mode**: Toggle the switch in the top right
4. **Load Extension**: Click "Load unpacked" and select the `extension` folder
5. **Done**: The extension will appear in your toolbar

## Features

- **Smart Duplicate Detection**: Identifies tabs with identical URLs
- **Live Badge Counter**: Shows number of duplicate tabs on extension icon
- **Intelligent Sweeping**: Preserves active and pinned tabs when removing duplicates
- **Tab Suspender Support**: Works with Marvellous Suspender and other tab suspenders
- **Auto-Sweep Mode**: Automatically remove duplicates as they're detected
- **Window Filtering**: Option to limit duplicate detection to current window only
- **Tab Sorting**: Reorganize tabs by URL when sweeping duplicates
- **Keyboard Shortcut**: `Alt+Shift+D` (or `Option+Shift+D` on Mac)
- **Privacy First**: No data collection, all processing happens locally

## How to Use

### Basic Usage

1. **Automatic Detection**: The extension automatically monitors your tabs
2. **View Duplicates**: Check the badge number on the extension icon
3. **Sweep Duplicates**: Click the extension icon or use `Alt+Shift+D`
4. **Smart Preservation**: Active and pinned tabs are automatically preserved

### Settings

Right-click the extension icon and select "Options" to configure:

- **Auto-Sweep**: Automatically sweep duplicates as they're detected (2-second delay)
- **Current Window Only**: Limit duplicate detection to the current window
- **Sort Tabs**: Reorganize tabs by URL when sweeping duplicates
- **Exceptions**: Rules to skip specific URLs or titles
- **Badge Color**: Choose your preferred badge color

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: `tabs` (for duplicate detection), `storage` (for settings)
- **Compatibility**: Chrome 88+ (Manifest V3 requirement)
- **Architecture**: Service Worker based for efficiency

## Privacy & Security

- **No Data Collection**: Zero telemetry or analytics
- **Local Processing**: All duplicate detection happens in your browser
- **No External Connections**: No network requests to external servers
- **Minimal Permissions**: Only requests necessary permissions
- **Open Source**: Full source code available for review

## Troubleshooting

### Extension Not Working?

1. **Refresh Extension**: Go to `chrome://extensions/` and click the refresh icon
2. **Check Permissions**: Ensure the extension has access to tabs
3. **Restart Chrome**: Sometimes a browser restart helps

### Badge Not Updating?

1. **Wait a Moment**: Badge updates automatically when tabs change
2. **Click Extension**: Manual click will force a refresh
3. **Check Settings**: Ensure "Current Window Only" setting matches your needs

## Updates & Changelog

See [CHANGELOG.md](../CHANGELOG.md) for detailed version history and updates.

## Contributing

This is an open-source project. Contributions are welcome!

## Support

- **Issues**: Report bugs on [GitHub Issues](https://github.com/skippdot/DupeSweep/issues)
- **Privacy Policy**: See [privacy-policy.html](privacy-policy.html) for full details

## License

This project is open source under the MIT License.

---

**Version 3.0.0** - Fresh release with auto-sweep, tab suspender support, exceptions, and localization
