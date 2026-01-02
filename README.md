# A11Y Widget

A PeopleSoft Accessibility Widget overlay for PeopleSoft PeopleTools 8.5+ systems.

## Overview

The A11Y Widget provides a comprehensive accessibility overlay that enables users to customize their PeopleSoft experience according to their individual accessibility needs. It supports both Fluid and Classic UI modes.

## Features

- **Font Size Adjustment** - Scale text from 80% to 200%
- **High Contrast Modes** - Dark, Light, Invert, Yellow/Black themes
- **Stop Animations** - Pause all animations and videos
- **Reading Guide** - Visual guide that follows mouse cursor
- **Focus Highlighting** - Enhanced focus indicators for keyboard navigation
- **Link Highlighting** - Make all links visually prominent
- **Spacing Controls** - Adjust line height and letter spacing
- **Cursor Size Options** - Default, Large, and X-Large cursor options
- **Accessibility Profiles** - Pre-configured presets for common needs:
  - Low Vision
  - Color Blind Friendly
  - Light Sensitive
  - Motor Accessibility
  - Dyslexia Friendly
  - ADHD Friendly
  - Seizure Safe
  - Screen Reader Optimized
  - Senior Friendly
- **ARIA Scanner** - Automated accessibility issue detection (requires axe-core)
- **Keyboard Shortcuts** - Full keyboard control support
- **Preference Persistence** - Settings saved across sessions

## Quick Start

1. Download jQuery 3.7.1 and embed it in `a11y-jquery-noconflict.js`
2. Create JavaScript definitions in PeopleSoft Branding Objects
3. Configure Branding System Options with the correct load order
4. Clear cache and verify widget appears

See [Installation Guide](docs/INSTALLATION_GUIDE.md) for complete instructions.

## File Structure

```
A11Y/
├── src/
│   ├── js/
│   │   ├── a11y-jquery-noconflict.js   # jQuery noConflict wrapper
│   │   ├── a11y-config.js              # Configuration module
│   │   ├── a11y-psft-hooks.js          # PeopleSoft integration
│   │   ├── a11y-styles.js              # Dynamic CSS engine
│   │   ├── a11y-profiles.js            # Accessibility profiles
│   │   ├── a11y-aria-scanner.js        # ARIA detection module
│   │   └── a11y-core.js                # Main widget framework
│   └── css/
│       ├── a11y-widget.css             # Widget UI styles
│       ├── a11y-fluid.css              # Fluid UI overrides
│       └── a11y-classic.css            # Classic UI overrides
├── docs/
│   └── INSTALLATION_GUIDE.md           # Installation instructions
├── IMPLEMENTATION_PLAN.md              # Development roadmap
└── README.md                           # This file
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Alt + A | Toggle widget panel |
| Alt + + | Increase font size |
| Alt + - | Decrease font size |
| Alt + 0 | Reset font size |
| Alt + C | Cycle contrast modes |
| Alt + R | Toggle reading guide |
| Alt + S | Run accessibility scan |
| Escape | Close widget |

## Requirements

- PeopleTools 8.54 or higher
- Modern browser (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- jQuery 3.7.1 (included/embedded)
- axe-core 4.x (optional, for ARIA scanning)

## Documentation

- [Installation Guide](docs/INSTALLATION_GUIDE.md) - Step-by-step setup instructions
- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Development phases and architecture

## Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Edge | 90+ |
| Safari | 14+ |

## License

MIT License

## Contributing

Contributions are welcome! Please ensure any changes maintain WCAG 2.1 AA compliance.
