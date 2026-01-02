# A11Y Widget Implementation Plan

## Overview

This document outlines the implementation plan for the PeopleSoft Accessibility (A11Y) Widget based on the Technical Implementation Guide. The widget provides an accessibility overlay for PeopleSoft PeopleTools 8.5+ systems using Oracle-supported configuration mechanisms.

---

## Architecture Summary

The solution consists of two main components:

1. **Branding System Options Integration** - Global JavaScript/CSS injection via PeopleSoft's branding framework
2. **ARIA Detection Module** - Automated accessibility scanning using axe-core with PeopleSoft-specific rules

### Component Architecture

| Component | Purpose |
|-----------|---------|
| A11Y_JQUERY_NOCONFLICT_JS | jQuery library wrapped in noConflict mode |
| A11Y_REQUIREJS_JS | RequireJS for dependency management |
| A11Y_CONFIG_JS | RequireJS configuration and module paths |
| A11Y_CORE_JS | Core accessibility widget framework and UI panel |
| A11Y_STYLES_JS | Dynamic CSS injection engine for style overrides |
| A11Y_PROFILES_JS | Disability profile presets and user preference storage |
| A11Y_PSFT_HOOKS_JS | PeopleSoft-specific integration (Ajax, UI mode detection) |
| A11Y_ARIA_SCANNER_JS | ARIA detection and remediation reporting module |
| A11Y_AXE_CORE_JS | axe-core accessibility testing engine |

---

## Implementation Phases

### Phase 1: Foundation Setup

**Objective:** Establish development environment and core infrastructure

#### Tasks:

1. **Set up development environment**
   - Configure PeopleTools 8.54+ development instance
   - Set up version control for JavaScript/CSS assets
   - Create development and testing workflow

2. **Create jQuery noConflict wrapper**
   - Implement the wrapper pattern to avoid conflicts with PeopleSoft's internal jQuery
   - Expose `window.a11yJQ` as the private jQuery reference
   - Test compatibility with existing PeopleSoft jQuery usage

3. **Implement RequireJS configuration**
   - Download and configure RequireJS
   - Define module path mappings for all A11Y components
   - Set up proper load order dependencies

#### Deliverables:
- [ ] Development environment configured
- [ ] A11Y_JQUERY_NOCONFLICT_JS module
- [ ] A11Y_REQUIREJS_JS module
- [ ] A11Y_CONFIG_JS module

---

### Phase 2: Core Module Development

**Objective:** Build the foundational modules for PeopleSoft integration

#### Tasks:

1. **Implement A11Y_PSFT_HOOKS_JS**
   - UI mode detection (Fluid vs Classic)
   - MutationObserver for Ajax page transitions
   - Page info extraction from PT metadata
   - Debounced callback handling for DOM changes

2. **Implement A11Y_STYLES_JS**
   - Dynamic style element creation and management
   - Font size scaling functionality
   - High contrast mode support (dark, light, invert)
   - Animation/transition stopping
   - localStorage preference persistence
   - Preference loading on page initialization

3. **Implement A11Y_PROFILES_JS**
   - Define disability profile presets (visual, motor, cognitive, etc.)
   - Profile selection and application logic
   - Profile customization capabilities

#### Key Integration Patterns:

**Ajax Navigation Handling:**
```javascript
// Monitor for page transitions via MutationObserver
A11Y_PSFT.initMutationObserver(function() {
    // Re-apply styles after Ajax navigation
    A11Y_STYLES.applyRules();
});
```

**UI Mode Detection:**
```javascript
A11Y_PSFT.isFluid = function() {
    return document.querySelector('.ps_apps-fluid') !== null ||
           document.querySelector('#PTNUI_LAND_REC') !== null;
};
```

#### Deliverables:
- [ ] A11Y_PSFT_HOOKS_JS module
- [ ] A11Y_STYLES_JS module
- [ ] A11Y_PROFILES_JS module

---

### Phase 3: ARIA Scanner Integration

**Objective:** Integrate axe-core and implement PeopleSoft-specific accessibility scanning

#### Tasks:

1. **Integrate axe-core library**
   - Download axe-core from npm
   - Create A11Y_AXE_CORE_JS JavaScript definition
   - Configure axe-core for PeopleSoft environment

2. **Implement A11Y_ARIA_SCANNER_JS**
   - Scanner initialization with PeopleSoft-specific rules
   - Scan execution with configurable options
   - Results processing into remediation-focused format
   - PeopleSoft-specific fix suggestions
   - CSV export functionality

3. **Create custom PeopleSoft ARIA rules**

   | Rule | Issue Detected | Remediation |
   |------|----------------|-------------|
   | psft-prompt-icon | Prompt lookup icons missing aria-label | Inject aria-label="Search" via global JS |
   | psft-calendar-icon | Calendar picker icons missing accessible name | Add aria-label="Select Date" via JS |
   | psft-grid-actions | Add/Delete row buttons lack labels | Enable Screen Reader mode or inject labels |
   | psft-related-actions | Related Actions menus use incorrect ARIA menu roles | Remove role="menu" via JS; use disclosure pattern |
   | psft-tabs-panel | Tab panels missing aria-labelledby connection | Add aria-labelledby referencing tab ID |
   | psft-modal-focus | Modal dialogs don't trap focus | Implement focus trap via Event Mapping JS |
   | psft-error-message | Validation errors not linked to fields | Add aria-describedby linking error to input |

#### Deliverables:
- [ ] A11Y_AXE_CORE_JS module
- [ ] A11Y_ARIA_SCANNER_JS module
- [ ] Custom PeopleSoft ARIA rules configuration

---

### Phase 4: Widget UI Development

**Objective:** Create the user-facing accessibility control panel

#### Tasks:

1. **Design widget UI panel**
   - Floating/collapsible accessibility control panel
   - Accessible keyboard navigation
   - High contrast compatible styling

2. **Implement A11Y_CORE_JS**
   - Widget initialization and lifecycle management
   - UI panel rendering and interaction handling
   - Integration with styles, profiles, and scanner modules
   - Settings persistence across sessions

3. **Widget Features:**
   - Font size adjustment slider
   - High contrast mode toggle (dark/light/invert)
   - Animation stop toggle
   - Reading guide/focus indicator
   - Profile selector dropdown
   - Accessibility scan trigger (developer mode)

#### Deliverables:
- [ ] A11Y_CORE_JS module
- [ ] Widget UI CSS styling
- [ ] User documentation

---

### Phase 5: PeopleSoft Configuration

**Objective:** Deploy the widget through PeopleSoft Branding System Options

#### Tasks:

1. **Create JavaScript definitions**
   - Navigate to PeopleTools > Portal > Branding > Branding Objects
   - Create all JavaScript definitions in the JavaScript tab
   - Configure proper script ordering

2. **Configure Branding System Options**
   - Navigate to PeopleTools > Portal > Branding > Branding System Options
   - Add JavaScript definitions in correct load order:

   | Order | JavaScript Definition | Purpose |
   |-------|----------------------|---------|
   | 1 | A11Y_JQUERY_NOCONFLICT_JS | Load jQuery first (dependency) |
   | 2 | A11Y_REQUIREJS_JS | Load RequireJS module loader |
   | 3 | A11Y_CONFIG_JS | Configure RequireJS paths |
   | 4 | A11Y_AXE_CORE_JS | Load axe-core engine |
   | 5 | A11Y_CORE_JS | Initialize accessibility widget |

3. **Create custom stylesheets**
   - For Fluid UI: Create A11Y_FLUID_CSS as sub stylesheet of PSSTYLEDEF_FMODE
   - For Classic UI: Create A11Y_CLASSIC_CSS as sub stylesheet of PSSTYLEDEF_TANGERINE

#### CSS Selector Reference:

| Target Element | Fluid Selector | Classic Selector |
|----------------|----------------|------------------|
| Page Container | .ps_apps-fluid | #ptifrmtgtframe, #ptpgltbody |
| Field Labels | .ps-label | .PSLONGEDITBOX, .PSEDITBOX |
| Buttons | .ps-button | .PSPUSHBUTTON, .PSPUSHBUTTONTBHDR |
| Grid/Table | .ps-grid | .PSLEVEL1GRID, .PSLEVEL2GRID |
| Links | .ps-link | .PSHYPERLINK, .PSHYPERLINKDISABLED |

#### Deliverables:
- [ ] JavaScript definitions created in PeopleSoft
- [ ] Branding System Options configured
- [ ] Stylesheets created and attached

---

### Phase 6: Remediation Tracking Dashboard

**Objective:** Create enterprise-wide accessibility issue tracking

#### Tasks:

1. **Create database table PS_A11Y_SCAN_RESULTS**

   | Field | Type | Description |
   |-------|------|-------------|
   | SCAN_ID | Number (Key) | Unique scan identifier |
   | SCAN_DTTM | DateTime | When scan was performed |
   | COMPONENT | Char(30) | PeopleSoft component name |
   | PAGE_NAME | Char(30) | PeopleSoft page name |
   | RULE_ID | Char(50) | axe-core rule identifier |
   | IMPACT | Char(10) | critical/serious/moderate/minor |
   | ELEMENT_SELECTOR | Long | CSS selector path to element |
   | STATUS | Char(10) | Open/In Progress/Resolved/Won't Fix |
   | ASSIGNED_TO | Char(30) | OPRID of assigned developer |

2. **Create reporting pagelet**
   - Aggregated views by component and severity
   - Trend analysis for remediation progress
   - Assignment workflow for developers
   - CSV/Excel export capabilities

3. **Implement scan result persistence**
   - API to save scan results to database
   - Duplicate detection logic
   - Status update capabilities

#### Deliverables:
- [ ] PS_A11Y_SCAN_RESULTS table
- [ ] Reporting pagelet
- [ ] Scan persistence API

---

### Phase 7: Testing and Quality Assurance

**Objective:** Comprehensive testing across all PeopleSoft UI modes

#### Tasks:

1. **Unit testing**
   - Test each module in isolation
   - Verify localStorage operations
   - Test MutationObserver callbacks

2. **Integration testing**
   - Test module interactions
   - Verify Ajax navigation handling
   - Test preference persistence across pages

3. **UI mode testing**
   - Test in Fluid interface
   - Test in Classic interface
   - Test in Classic Plus interface

4. **Accessibility testing**
   - Verify widget is itself accessible
   - Test with screen readers (JAWS, NVDA)
   - Keyboard navigation testing
   - Color contrast verification

5. **Browser compatibility testing**
   - Chrome
   - Firefox
   - Edge
   - Safari

6. **Run baseline ARIA scans**
   - Scan high-traffic pages
   - Document baseline accessibility state
   - Prioritize issues for remediation

#### Deliverables:
- [ ] Test plan and results
- [ ] Baseline ARIA scan report
- [ ] Browser compatibility matrix

---

## File Structure

```
A11Y/
├── src/
│   ├── js/
│   │   ├── vendor/
│   │   │   ├── jquery.min.js
│   │   │   ├── require.min.js
│   │   │   └── axe.min.js
│   │   ├── a11y-jquery-noconflict.js
│   │   ├── a11y-config.js
│   │   ├── a11y-core.js
│   │   ├── a11y-styles.js
│   │   ├── a11y-profiles.js
│   │   ├── a11y-psft-hooks.js
│   │   └── a11y-aria-scanner.js
│   └── css/
│       ├── a11y-widget.css
│       ├── a11y-fluid.css
│       └── a11y-classic.css
├── docs/
│   └── user-guide.md
├── tests/
│   └── ...
├── README.md
└── IMPLEMENTATION_PLAN.md
```

---

## Risk Considerations

| Risk | Mitigation |
|------|------------|
| jQuery conflicts with PeopleSoft | Use noConflict wrapper pattern; expose as `window.a11yJQ` |
| Style specificity issues | Use `!important` judiciously; load CSS last in cascade |
| Ajax navigation breaks functionality | Use MutationObserver with debouncing |
| Performance impact | Debounce observers; lazy-load axe-core |
| Browser compatibility | Test across all supported browsers; use polyfills if needed |
| PeopleTools version differences | Test on 8.54, 8.55, 8.56, 8.57, 8.58, 8.59 |

---

## Dependencies

- **PeopleTools 8.54+** - Required for Branding System Options
- **jQuery 3.x** - Core DOM manipulation
- **RequireJS 2.x** - Module loading (optional but recommended)
- **axe-core 4.x** - Accessibility testing engine
- **Modern browser** - MutationObserver support required

---

## Success Criteria

1. Widget successfully loads on all PeopleSoft pages without errors
2. User preferences persist across sessions
3. All accessibility features function correctly (font size, contrast, animations)
4. ARIA scanner identifies accessibility issues with zero false positives
5. Widget is itself fully accessible (keyboard navigable, screen reader compatible)
6. No conflicts with existing PeopleSoft functionality
7. Performance impact is minimal (< 100ms page load overhead)

---

## Next Steps

1. Set up development environment with PeopleTools 8.54+
2. Download jQuery, RequireJS, and axe-core
3. Create initial JavaScript definition files
4. Implement core modules starting with A11Y_PSFT_HOOKS_JS
5. Run initial ARIA scans on high-traffic pages to assess baseline
6. Develop widget UI panel
7. Deploy to test environment and conduct comprehensive testing
