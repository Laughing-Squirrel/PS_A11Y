# A11Y Widget Installation Guide

## PeopleSoft Accessibility Widget - Complete Installation Instructions

This guide provides comprehensive step-by-step instructions for installing and configuring the A11Y Accessibility Widget in your PeopleSoft environment.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [File Overview](#file-overview)
3. [Step 1: Prepare JavaScript Files](#step-1-prepare-javascript-files)
4. [Step 2: Create JavaScript Definitions in PeopleSoft](#step-2-create-javascript-definitions-in-peoplesoft)
5. [Step 3: Configure Branding System Options](#step-3-configure-branding-system-options)
6. [Step 4: Create CSS Stylesheets](#step-4-create-css-stylesheets)
7. [Step 5: Verification and Testing](#step-5-verification-and-testing)
8. [Optional: ARIA Scanner Setup](#optional-aria-scanner-setup)
9. [Troubleshooting](#troubleshooting)
10. [Keyboard Shortcuts Reference](#keyboard-shortcuts-reference)
11. [Customization](#customization)

---

## Prerequisites

Before beginning installation, ensure you have:

- **PeopleTools 8.54 or higher** (8.56+ recommended for full Fluid support)
- **PeopleSoft Administrator access** with the following roles:
  - Portal Administrator
  - Branding Administrator
- **Web server access** for deploying static files (optional)

### jQuery Requirements

The widget is designed to use **PeopleSoft's native jQuery** by default:

| PeopleSoft Version | Native jQuery | Widget Compatible |
|-------------------|---------------|-------------------|
| 8.55+ | 1.12.x | Yes (default) |
| 8.57+ | 3.x | Yes (optimal) |
| 8.54 and below | 1.6.x or none | Requires CDN/embed |

**No separate jQuery download is required** for PeopleSoft 8.55+. The widget will automatically detect and use the native jQuery if it meets the minimum version (1.12.0).

### axe-core Requirements (Optional)

For ARIA scanning functionality, axe-core can be loaded via:
1. **CDN fallback** (enabled by default) - No action required
2. **Embedded** - For environments without CDN access
3. **Pre-loaded** - If already available globally

### Supported Browsers

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Edge | 90+ |
| Safari | 14+ |

---

## File Overview

The A11Y Widget consists of the following files:

### JavaScript Files (`src/js/`)

| File | Description | Required |
|------|-------------|----------|
| `a11y-jquery-noconflict.js` | jQuery wrapper for noConflict mode | Yes |
| `a11y-config.js` | Configuration and constants | Yes |
| `a11y-psft-hooks.js` | PeopleSoft integration hooks | Yes |
| `a11y-styles.js` | Dynamic CSS injection engine | Yes |
| `a11y-profiles.js` | Accessibility profile presets | Yes |
| `a11y-aria-scanner.js` | ARIA detection and reporting | Optional |
| `a11y-core.js` | Main widget UI and controller | Yes |

### CSS Files (`src/css/`)

| File | Description | Target |
|------|-------------|--------|
| `a11y-widget.css` | Main widget styling | All UI modes |
| `a11y-fluid.css` | Fluid UI overrides | Fluid pages |
| `a11y-classic.css` | Classic UI overrides | Classic pages |

---

## Step 1: Prepare JavaScript Files

### 1.1 jQuery Configuration

**For PeopleSoft 8.55+ (Recommended - No Action Required)**

The widget will automatically use PeopleSoft's native jQuery. No embedding or downloading is needed.

To verify your PeopleSoft jQuery version, open browser console and run:
```javascript
console.log(jQuery.fn.jquery);
```

**For PeopleSoft 8.54 or Older (Requires jQuery)**

If your PeopleSoft version has jQuery < 1.12.0, you have two options:

**Option A: CDN Fallback (Default)**
The widget will automatically load jQuery from CDN if native jQuery is unavailable. No action required, but requires external CDN access.

**Option B: Embed jQuery (For Restricted Networks)**
1. Download jQuery 3.7.1 from https://code.jquery.com/jquery-3.7.1.min.js
2. Open `src/js/a11y-jquery-noconflict.js`
3. Locate the placeholder section:
   ```javascript
   /* === BEGIN JQUERY EMBED === */
   ```
4. Paste the jQuery source code after the comment block
5. Save the file

**jQuery Configuration Options:**
```javascript
var CONFIG = {
    JQUERY_MIN_VERSION: '1.12.0',  // Minimum required version
    PREFER_NATIVE: true,            // Use PeopleSoft's jQuery when compatible
    JQUERY_CDN_VERSION: '3.7.1',    // Version to load from CDN if needed
    // ...
};
```

### 1.2 axe-core Configuration (Optional)

The ARIA scanner module provides accessibility scanning using axe-core. It has three loading modes:

**Option A: CDN Fallback (Default - No Action Required)**
The scanner will automatically load axe-core from CDN. This is enabled by default.

**Option B: Embed axe-core (For Restricted Networks)**
1. Download axe-core from https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.4/axe.min.js
   - Or via npm: `npm install axe-core`
2. Open `src/js/a11y-aria-scanner.js`
3. Locate the placeholder section:
   ```javascript
   /* === BEGIN AXE-CORE EMBED === */
   ```
4. Paste the axe.min.js contents after the comment block
5. Save the file

**Option C: Disable CDN Fallback**
To use only PeopleSoft-specific rules (no axe-core):
```javascript
var SCANNER_CONFIG = {
    ENABLE_CDN_FALLBACK: false  // Disable CDN loading
};
```

**axe-core Configuration Options:**
```javascript
var SCANNER_CONFIG = {
    AXE_VERSION: '4.8.4',           // Version for CDN loading
    ENABLE_CDN_FALLBACK: true,      // Enable/disable CDN loading
    LOAD_TIMEOUT: 15000             // CDN load timeout (ms)
};
```

### 1.3 Combine Files (Recommended for Production)

For optimal performance, combine the JavaScript files in this order:

```
1. a11y-jquery-noconflict.js (with jQuery embedded)
2. a11y-config.js
3. a11y-psft-hooks.js
4. a11y-styles.js
5. a11y-profiles.js
6. a11y-aria-scanner.js (optional)
7. a11y-core.js
8. a11y-widget.css (embedded or linked)
```

**Example combined file header:**
```javascript
/**
 * A11Y Widget Bundle
 * PeopleSoft Accessibility Widget v1.0.0
 * Combined production build
 */
```

---

## Step 2: Create JavaScript Definitions in PeopleSoft

### 2.1 Navigate to Branding Objects

1. Log into PeopleSoft as an administrator
2. Navigate to: **PeopleTools > Portal > Branding > Branding Objects**
3. Select the **JavaScript** tab

### 2.2 Create JavaScript Definitions

Create the following JavaScript definitions by clicking **Add a new value**:

#### Definition 1: A11Y_JQUERY_NOCONFLICT_JS

| Field | Value |
|-------|-------|
| Object Name | A11Y_JQUERY_NOCONFLICT_JS |
| Description | A11Y Widget - jQuery NoConflict Wrapper |
| JavaScript Code | (Paste contents of `a11y-jquery-noconflict.js` with jQuery embedded) |

Click **Save**.

#### Definition 2: A11Y_CONFIG_JS

| Field | Value |
|-------|-------|
| Object Name | A11Y_CONFIG_JS |
| Description | A11Y Widget - Configuration Module |
| JavaScript Code | (Paste contents of `a11y-config.js`) |

Click **Save**.

#### Definition 3: A11Y_PSFT_HOOKS_JS

| Field | Value |
|-------|-------|
| Object Name | A11Y_PSFT_HOOKS_JS |
| Description | A11Y Widget - PeopleSoft Integration |
| JavaScript Code | (Paste contents of `a11y-psft-hooks.js`) |

Click **Save**.

#### Definition 4: A11Y_STYLES_JS

| Field | Value |
|-------|-------|
| Object Name | A11Y_STYLES_JS |
| Description | A11Y Widget - Dynamic Styles Engine |
| JavaScript Code | (Paste contents of `a11y-styles.js`) |

Click **Save**.

#### Definition 5: A11Y_PROFILES_JS

| Field | Value |
|-------|-------|
| Object Name | A11Y_PROFILES_JS |
| Description | A11Y Widget - Accessibility Profiles |
| JavaScript Code | (Paste contents of `a11y-profiles.js`) |

Click **Save**.

#### Definition 6: A11Y_ARIA_SCANNER_JS (Optional)

| Field | Value |
|-------|-------|
| Object Name | A11Y_ARIA_SCANNER_JS |
| Description | A11Y Widget - ARIA Scanner Module |
| JavaScript Code | (Paste contents of `a11y-aria-scanner.js`) |

Click **Save**.

#### Definition 7: A11Y_CORE_JS

| Field | Value |
|-------|-------|
| Object Name | A11Y_CORE_JS |
| Description | A11Y Widget - Core Widget Framework |
| JavaScript Code | (Paste contents of `a11y-core.js`) |

Click **Save**.

#### Definition 8: A11Y_WIDGET_CSS_JS

Create a JavaScript definition that injects the CSS:

| Field | Value |
|-------|-------|
| Object Name | A11Y_WIDGET_CSS_JS |
| Description | A11Y Widget - CSS Injection |
| JavaScript Code | (See below) |

```javascript
(function() {
    var css = `
    /* Paste the contents of a11y-widget.css here */
    `;

    var style = document.createElement('style');
    style.id = 'a11y-widget-styles';
    style.textContent = css;
    document.head.appendChild(style);
})();
```

Click **Save**.

---

## Step 3: Configure Branding System Options

### 3.1 Navigate to Branding System Options

1. Navigate to: **PeopleTools > Portal > Branding > Branding System Options**
2. Select the **System-Wide JavaScript** section

### 3.2 Add JavaScript Definitions

In the **Additional JavaScript Objects** grid, add the definitions in this exact order:

| Order | JavaScript Definition | Description |
|-------|----------------------|-------------|
| 1 | A11Y_JQUERY_NOCONFLICT_JS | Load jQuery first |
| 2 | A11Y_CONFIG_JS | Load configuration |
| 3 | A11Y_PSFT_HOOKS_JS | Load PeopleSoft hooks |
| 4 | A11Y_STYLES_JS | Load styles engine |
| 5 | A11Y_PROFILES_JS | Load profiles |
| 6 | A11Y_ARIA_SCANNER_JS | Load ARIA scanner (optional) |
| 7 | A11Y_WIDGET_CSS_JS | Inject CSS |
| 8 | A11Y_CORE_JS | Initialize widget |

### 3.3 Save Configuration

Click **Save** to apply the changes.

### 3.4 Clear Cache

After saving, clear the browser cache and PeopleSoft cache:

1. Navigate to: **PeopleTools > Web Profile > Web Profile Configuration**
2. Select your web profile
3. Click **Flush Cache**

Alternatively, restart the web server or application server.

---

## Step 4: Create CSS Stylesheets

For enhanced styling support, create sub stylesheets for Fluid and Classic UI.

### 4.1 Create Fluid UI Stylesheet

1. Navigate to: **PeopleTools > Portal > Branding > Branding Objects**
2. Select the **Style Sheets** tab
3. Click **Add a new value**
4. Enter the following:

| Field | Value |
|-------|-------|
| Object Name | A11Y_FLUID_CSS |
| Type | Free Form Style Sheet |
| Style Sheet Code | (Paste contents of `a11y-fluid.css`) |

5. Click **Save**

### 4.2 Attach Fluid Stylesheet

1. Navigate to: **PeopleTools > Portal > Branding > Branding Objects**
2. Search for parent stylesheet: **PSSTYLEDEF_FMODE**
3. In the **Sub Style Sheets** section, add **A11Y_FLUID_CSS**
4. Click **Save**

### 4.3 Create Classic UI Stylesheet

1. Create a new style sheet definition:

| Field | Value |
|-------|-------|
| Object Name | A11Y_CLASSIC_CSS |
| Type | Free Form Style Sheet |
| Style Sheet Code | (Paste contents of `a11y-classic.css`) |

2. Click **Save**

### 4.4 Attach Classic Stylesheet

1. Search for parent stylesheet: **PSSTYLEDEF_TANGERINE**
2. In the **Sub Style Sheets** section, add **A11Y_CLASSIC_CSS**
3. Click **Save**

---

## Step 5: Verification and Testing

### 5.1 Initial Verification

1. Clear your browser cache completely
2. Log into PeopleSoft
3. Look for the accessibility widget button (circular button with accessibility icon) on the right side of the screen
4. Click the button to open the accessibility panel

### 5.2 Feature Testing Checklist

Test each feature to ensure proper functionality:

- [ ] **Widget Toggle**: Button appears and opens/closes panel
- [ ] **Profile Selection**: Quick profiles apply correctly
- [ ] **Font Size**: Increase/decrease buttons work
- [ ] **Contrast Modes**: All contrast options function
- [ ] **Stop Animations**: Videos and animations pause
- [ ] **Reading Guide**: Yellow guide follows mouse
- [ ] **Focus Highlight**: Enhanced focus indicators appear
- [ ] **Keyboard Shortcuts**: Alt+A toggles widget
- [ ] **Persistence**: Settings survive page navigation
- [ ] **Position Toggle**: Widget moves left/right
- [ ] **Reset**: All settings clear properly

### 5.3 Cross-UI Mode Testing

Test in both UI modes:

**Fluid UI:**
- Navigate to Homepage
- Open various Fluid pages
- Test tile navigation
- Verify all features work

**Classic UI:**
- Navigate to a Classic component
- Test form interactions
- Verify grid accessibility
- Check modal dialogs

### 5.4 Browser Testing

Test in all supported browsers:
- Chrome
- Firefox
- Edge
- Safari

---

## Optional: ARIA Scanner Setup

### axe-core Loading Options

The ARIA scanner now includes built-in axe-core loading. Choose the option that best fits your environment:

#### Option 1: CDN Loading (Default)

No additional setup required. The scanner will automatically load axe-core from CDN when a scan is initiated.

**Console output when CDN loading succeeds:**
```
[A11Y] Loading axe-core 4.8.4 from CDN...
[A11Y] axe-core 4.8.4 loaded from CDN
[A11Y] ARIA Scanner initialized with axe-core 4.8.4
```

#### Option 2: Embedded axe-core (Recommended for Production)

For environments without CDN access or for faster loading:

1. Download axe-core: https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.4/axe.min.js
2. Open `src/js/a11y-aria-scanner.js`
3. Find the placeholder:
   ```javascript
   /* === BEGIN AXE-CORE EMBED === */
   ```
4. Paste the full axe.min.js content after the comment
5. Save and redeploy

**Console output when using embedded axe-core:**
```
[A11Y] Using existing axe-core 4.8.4
[A11Y] ARIA Scanner initialized with axe-core 4.8.4
```

#### Option 3: Separate JavaScript Definition (Legacy)

If you prefer to load axe-core as a separate PeopleSoft JavaScript definition:

1. Create a JavaScript definition:

| Field | Value |
|-------|-------|
| Object Name | A11Y_AXE_CORE_JS |
| Description | axe-core Accessibility Engine |
| JavaScript Code | (Paste axe.min.js contents) |

2. Add to Branding System Options **before** A11Y_ARIA_SCANNER_JS
3. Disable CDN fallback in `a11y-aria-scanner.js`:
   ```javascript
   ENABLE_CDN_FALLBACK: false
   ```

#### Option 4: PeopleSoft Rules Only (No axe-core)

For minimal setup, use only PeopleSoft-specific rules:

1. Set `ENABLE_CDN_FALLBACK: false` in the scanner config
2. Do not embed or pre-load axe-core

**Console output when running without axe-core:**
```
[A11Y] ARIA Scanner initialized (PeopleSoft rules only)
```

The scanner will use 9 PeopleSoft-specific rules that check for common accessibility issues in PeopleSoft components.

### Using the Scanner

1. Open the accessibility widget
2. Expand "Developer Tools" section
3. Enable "Developer Mode" to highlight issues visually
4. Click "Run Accessibility Scan"
5. View results in the panel (shows scanner mode: axe-core or PeopleSoft rules only)
6. Export to CSV or JSON for reporting

### Scanner API

```javascript
// Check if axe-core is loaded
A11Y_SCANNER.isAxeLoaded();  // Returns true/false

// Get axe-core version
A11Y_SCANNER.getAxeVersion();  // Returns "4.8.4" or null

// Run scan programmatically
A11Y_SCANNER.scan().then(function(results) {
    console.log('Issues found:', results.violations.length);
});
```

---

## Troubleshooting

### Widget Not Appearing

1. **Check Console for Errors**:
   - Open browser developer tools (F12)
   - Check Console tab for JavaScript errors
   - Look for `[A11Y]` prefixed messages

2. **Verify Load Order**:
   - Ensure JavaScript definitions are in correct order
   - jQuery must load before other scripts

3. **Cache Issues**:
   - Clear browser cache
   - Flush PeopleSoft cache
   - Try incognito/private browsing mode

4. **Check Branding System Options**:
   - Verify all definitions are added
   - Confirm order is correct

### jQuery Conflicts

If you see jQuery-related errors:

1. Check that `a11yJQ` is defined: `console.log(window.a11yJQ)`
2. Check native jQuery version: `console.log(jQuery.fn.jquery)`
3. Verify minimum version (1.12.0+) is available
4. Check console for jQuery detection messages:
   ```
   [A11Y] jQuery detection: 1.12.4 (native PeopleSoft)
   [A11Y] Using PeopleSoft native jQuery 1.12.4
   ```
5. If native jQuery is too old, ensure CDN access or embed jQuery

**Force CDN Loading (for testing):**
```javascript
// In a11y-jquery-noconflict.js
CONFIG.PREFER_NATIVE = false;
```

### Styles Not Applying

1. Check CSS injection script executed
2. Look for `#a11y-dynamic-styles` element in DOM
3. Verify localStorage is available
4. Check for CSS specificity conflicts

### ARIA Scanner Not Working

1. Check scanner status:
   ```javascript
   console.log('axe-core loaded:', A11Y_SCANNER.isAxeLoaded());
   console.log('axe-core version:', A11Y_SCANNER.getAxeVersion());
   ```

2. Check console for loading messages:
   ```
   [A11Y] Loading axe-core 4.8.4 from CDN...
   [A11Y] axe-core 4.8.4 loaded from CDN
   ```

3. If CDN is blocked, you'll see:
   ```
   [A11Y] axe-core not available: Failed to load axe-core from CDN
   [A11Y] Scanner will use PeopleSoft-specific rules only.
   ```

4. **Solutions for blocked CDN:**
   - Embed axe-core in `a11y-aria-scanner.js`
   - Create separate A11Y_AXE_CORE_JS definition (loaded before scanner)
   - Whitelist `cdnjs.cloudflare.com` in network policies

5. **Test axe-core directly:**
   ```javascript
   console.log(typeof axe);  // Should be "object" if loaded
   ```

### Performance Issues

1. Reduce MutationObserver scope
2. Increase debounce delay in config
3. Lazy-load ARIA scanner module

---

## Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| Alt + A | Toggle accessibility widget |
| Alt + + | Increase font size |
| Alt + - | Decrease font size |
| Alt + 0 | Reset font size |
| Alt + C | Cycle through contrast modes |
| Alt + R | Toggle reading guide |
| Alt + S | Run accessibility scan |
| Escape | Close widget panel |

---

## Customization

### Modifying Default Settings

Edit `a11y-config.js` to change defaults:

```javascript
defaults: {
    fontSize: 1.0,           // Starting font scale
    fontSizeMin: 0.8,        // Minimum allowed
    fontSizeMax: 2.0,        // Maximum allowed
    fontSizeStep: 0.1,       // Step increment
    contrastMode: 'none',    // Starting contrast
    widgetPosition: 'right', // 'left' or 'right'
    // ... more options
}
```

### Adding Custom Profiles

Edit `a11y-profiles.js` to add new profiles:

```javascript
'my-custom-profile': {
    id: 'my-custom-profile',
    name: 'My Custom Profile',
    description: 'Description here',
    icon: 'custom',
    settings: {
        fontSize: 1.3,
        contrastMode: 'dark',
        focusHighlight: true
    }
}
```

### Changing Widget Appearance

Modify CSS variables in `a11y-widget.css`:

```css
:root {
    --a11y-primary: #0066cc;      /* Main brand color */
    --a11y-primary-dark: #004c99; /* Hover state */
    --a11y-radius: 8px;           /* Border radius */
    --a11y-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### Adding Custom ARIA Rules

Edit `a11y-aria-scanner.js` to add PeopleSoft-specific rules:

```javascript
{
    id: 'my-custom-rule',
    description: 'Description of what this checks',
    selector: '.my-selector',
    check: function(el) {
        // Return true if passes, false if fails
        return el.hasAttribute('aria-label');
    },
    fix: 'How to fix this issue'
}
```

---

## Support and Resources

### Documentation
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- axe-core Rules: https://dequeuniversity.com/rules/axe/
- PeopleSoft Branding: Oracle PeopleTools Documentation

### Reporting Issues
- Check console logs for `[A11Y]` messages
- Document browser version and PeopleTools version
- Include steps to reproduce

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.2 | January 2026 | jQuery: Default to PeopleSoft native jQuery; axe-core: Built-in CDN loading and embedding support |
| 1.0.1 | January 2026 | Code review fixes: Memory leaks, XSS prevention, browser compatibility, input validation |
| 1.0.0 | January 2026 | Initial release |

### v1.0.2 Highlights

**jQuery Loading Changes:**
- Now prefers PeopleSoft's native jQuery by default (minimum v1.12.0)
- No jQuery download/embedding required for PeopleSoft 8.55+
- Automatic CDN fallback if native jQuery is unavailable
- Configurable via `CONFIG.PREFER_NATIVE` and `CONFIG.JQUERY_MIN_VERSION`

**axe-core Loading Changes:**
- Built-in CDN fallback loading (enabled by default)
- Embedding placeholder added to `a11y-aria-scanner.js`
- Graceful degradation to PeopleSoft-specific rules if axe-core unavailable
- New helper methods: `isAxeLoaded()`, `getAxeVersion()`

---

*A11Y Widget - Making PeopleSoft Accessible for Everyone*
