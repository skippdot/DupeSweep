# Testing Guide - DupeSweep Extension v3.0.0

## 🧪 **Automated Testing**

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch

# Run standalone URL extraction test
npm run test:url
```

### Test Results Summary
- **Total Tests**: 24
- **Passing**: 24 ✅
- **Failing**: 0 ❌
- **Coverage**: Comprehensive edge case testing

## 🔍 **Manual Testing Checklist**

### 1. Extension Installation
- [ ] Go to `chrome://extensions/`
- [ ] Enable "Developer mode"
- [ ] Click "Load unpacked"
- [ ] Select the extension directory
- [ ] Verify extension appears in toolbar

### 2. Basic Functionality
- [ ] **Tab Counting**: Open multiple tabs, verify badge shows correct count
- [ ] **Duplicate Detection**: Create duplicate tabs, verify badge shows duplicates
- [ ] **Tab Closing**: Click extension icon, verify duplicates are closed
- [ ] **Keyboard Shortcut**: Use Alt+Shift+D (Option+Shift+D on Mac)

### 3. Marvellous Suspender Compatibility
- [ ] Install Marvellous Suspender extension
- [ ] Create duplicate tabs
- [ ] Let some tabs get suspended
- [ ] Verify suspended tabs are detected as duplicates
- [ ] Verify extension closes correct tabs (preserves active/pinned)

### 4. Settings Testing
- [ ] Right-click extension → Options
- [ ] Test **Auto Close** setting:
  - [ ] Enable auto-close
  - [ ] Create duplicate tabs
  - [ ] Wait 2 seconds, verify auto-close works
- [ ] Test **Current Window Only** setting:
  - [ ] Open multiple browser windows
  - [ ] Enable currentWindowOnly
  - [ ] Verify only current window tabs are processed
- [ ] Test **Sort Tabs** setting:
  - [ ] Enable sort tabs
  - [ ] Create mixed tabs
  - [ ] Verify tabs are sorted by URL after closing duplicates

### 5. Edge Cases
- [ ] **Large Tab Count**: Test with 100+ tabs
- [ ] **Mixed Protocols**: Test http:// and https:// versions of same site
- [ ] **Long URLs**: Test with very long URLs
- [ ] **Special Characters**: Test URLs with special characters
- [ ] **Pinned Tabs**: Verify pinned tabs are preserved
- [ ] **Active Tabs**: Verify active tabs are preserved

### 6. Performance Testing
- [ ] **Memory Usage**: Monitor extension memory usage with many tabs
- [ ] **Response Time**: Verify badge updates quickly
- [ ] **Large Scale**: Test with 500+ tabs (user's scenario)

## 🐛 **Known Issues to Monitor**

### Fixed Issues ✅
- ✅ Tab counting bug (was showing 5 instead of 500)
- ✅ Marvellous Suspender compatibility
- ✅ currentWindowOnly functionality
- ✅ Global variable declarations
- ✅ Error handling

### Potential Issues to Watch
- **Performance**: With very large tab counts (1000+)
- **Memory**: Long-running sessions
- **Network**: Slow tab loading affecting detection

## 📊 **Test Scenarios**

### Scenario 1: Basic Duplicate Detection
```
1. Open 3 tabs to https://www.google.com
2. Open 2 tabs to https://www.github.com
3. Expected: Badge shows "3" (3 duplicates)
4. Click extension: Should close 3 tabs, keep 2
```

### Scenario 2: Suspended Tab Detection
```
1. Open tab to https://example.com
2. Let Marvellous Suspender suspend it
3. Open another tab to https://example.com
4. Expected: Badge shows "1" (1 duplicate)
5. Click extension: Should close 1 tab
```

### Scenario 3: Mixed Window Testing
```
1. Open Window 1 with tabs: google.com, github.com, google.com
2. Open Window 2 with tabs: google.com, stackoverflow.com
3. With currentWindowOnly OFF: Badge shows "2" duplicates
4. With currentWindowOnly ON: Badge shows "1" duplicate (current window only)
```

### Scenario 4: Auto-Close Testing
```
1. Enable auto-close in settings
2. Open tab to https://example.com
3. Wait 1 second, open another tab to https://example.com
4. Expected: After 2 seconds, duplicate should auto-close
```

## 🚀 **Deployment Checklist**

### Pre-Deployment
- [ ] All automated tests passing
- [ ] Manual testing completed
- [ ] Performance testing with large tab counts
- [ ] Cross-browser compatibility (if applicable)
- [ ] Settings persistence testing

### Chrome Web Store Submission
- [ ] Update manifest version
- [ ] Update README.md with new features
- [ ] Create release notes
- [ ] Package extension for submission
- [ ] Test packaged version

### Post-Deployment Monitoring
- [ ] Monitor user feedback
- [ ] Watch for error reports
- [ ] Performance monitoring
- [ ] Feature usage analytics (if implemented)

## 🔧 **Development Testing**

### Adding New Features
1. Write tests first (TDD approach)
2. Implement feature
3. Run full test suite
4. Manual testing
5. Performance testing

### Regression Testing
```bash
# Before any changes
npm test

# After changes
npm test
npm run test:coverage

# Manual smoke test
# - Load extension
# - Test basic functionality
# - Test new feature
```

## 📈 **Performance Benchmarks**

### Target Performance
- **Badge Update**: < 100ms
- **Tab Closing**: < 500ms for 100 tabs
- **Memory Usage**: < 50MB with 1000 tabs
- **Extension Load**: < 200ms

### Monitoring Commands
```javascript
// In browser console
console.time('badgeUpdate');
// Trigger badge update
console.timeEnd('badgeUpdate');

// Memory usage
console.log(performance.memory);
```

## 🎯 **Success Criteria**

### Critical Success Factors
- ✅ All automated tests pass
- ✅ Tab counting works correctly with 500+ tabs
- ✅ Marvellous Suspender compatibility works
- ✅ All settings function correctly
- ✅ No memory leaks or performance issues
- ✅ User feedback is positive

### Quality Gates
- **Test Coverage**: 100% of critical paths tested
- **Performance**: Meets all benchmarks
- **Compatibility**: Works with major tab suspender extensions
- **Usability**: Settings are intuitive and work correctly
- **Reliability**: No crashes or data loss

This testing guide ensures comprehensive validation of all implemented features and provides a framework for ongoing quality assurance.
