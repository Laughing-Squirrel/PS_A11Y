/**
 * A11Y_CORE_JS
 * PeopleSoft Accessibility Widget - Core Framework
 *
 * This is the main entry point for the accessibility widget.
 * It provides:
 * - Widget UI panel
 * - Keyboard shortcuts
 * - Module integration
 * - Event handling
 *
 * @version 1.0.0
 * @license MIT
 */
(function(a11yJQ) {
    'use strict';

    // Ensure jQuery is available
    if (typeof a11yJQ === 'undefined') {
        console.error('[A11Y] a11yJQ not available. Load a11y-jquery-noconflict.js first.');
        return;
    }

    var $ = a11yJQ;
    var CONFIG = window.A11Y_CONFIG || {};

    /**
     * A11Y Core Widget
     */
    var A11Y_CORE = {

        // State
        _initialized: false,
        _widgetElement: null,
        _panelOpen: false,
        _position: 'right',

        /**
         * Initialize the accessibility widget
         */
        init: function() {
            if (this._initialized) {
                return;
            }

            this._createWidget();
            this._bindEvents();
            this._setupKeyboardShortcuts();
            this._setupPageChangeHandler();

            this._initialized = true;
            console.log('[A11Y] Accessibility Widget initialized');

            // Dispatch ready event
            document.dispatchEvent(new CustomEvent('a11y:ready'));
        },

        /**
         * Create the widget UI
         * @private
         */
        _createWidget: function() {
            var widgetHTML = this._generateWidgetHTML();

            // Remove existing widget if present
            var existing = document.getElementById('a11y-widget');
            if (existing) {
                existing.remove();
            }

            // Insert widget
            var container = document.createElement('div');
            container.innerHTML = widgetHTML;
            this._widgetElement = container.firstChild;
            document.body.appendChild(this._widgetElement);

            // Apply saved position
            this._loadPosition();
        },

        /**
         * Generate widget HTML
         * @private
         */
        _generateWidgetHTML: function() {
            return [
                '<div id="a11y-widget" class="a11y-widget a11y-widget--closed a11y-widget--right" role="complementary" aria-label="Accessibility Controls">',

                // Trigger button
                '  <button id="a11y-trigger" class="a11y-trigger" aria-label="Open Accessibility Menu" aria-expanded="false" aria-controls="a11y-panel">',
                '    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">',
                '      <circle cx="12" cy="4" r="2" fill="currentColor"/>',
                '      <path d="M19 13v-2c-1.54.02-3.09-.75-4.07-1.83l-1.29-1.43c-.17-.19-.38-.34-.61-.45-.01 0-.01-.01-.02-.01H13c-.35-.2-.75-.3-1.19-.26C10.76 7.11 10 8.04 10 9.09V15c0 1.1.9 2 2 2h5v5h2v-5.5c0-1.1-.9-2-2-2h-3v-3.45c1.29 1.07 3.25 1.94 5 1.95zm-6.17 5c-.41 1.16-1.52 2-2.83 2-1.66 0-3-1.34-3-3 0-1.31.84-2.41 2-2.83V12.1c-2.28.46-4 2.48-4 4.9 0 2.76 2.24 5 5 5 2.42 0 4.44-1.72 4.9-4h-2.07z" fill="currentColor"/>',
                '    </svg>',
                '  </button>',

                // Panel
                '  <div id="a11y-panel" class="a11y-panel" role="dialog" aria-label="Accessibility Options" aria-hidden="true">',

                // Header
                '    <div class="a11y-panel__header">',
                '      <h2 id="a11y-panel-title">Accessibility</h2>',
                '      <button class="a11y-panel__close" aria-label="Close accessibility menu">&times;</button>',
                '    </div>',

                // Content
                '    <div class="a11y-panel__content">',

                // Profiles Section
                '      <section class="a11y-section">',
                '        <h3>Quick Profiles</h3>',
                '        <div class="a11y-profiles">',
                '          <select id="a11y-profile-select" class="a11y-select" aria-label="Select accessibility profile">',
                '            <option value="">-- Select Profile --</option>',
                '            <option value="low-vision">Low Vision</option>',
                '            <option value="color-blind">Color Blind Friendly</option>',
                '            <option value="light-sensitive">Light Sensitive</option>',
                '            <option value="motor-impaired">Motor Accessibility</option>',
                '            <option value="dyslexia">Dyslexia Friendly</option>',
                '            <option value="adhd-friendly">ADHD Friendly</option>',
                '            <option value="seizure-safe">Seizure Safe</option>',
                '            <option value="screen-reader">Screen Reader Optimized</option>',
                '            <option value="senior-friendly">Senior Friendly</option>',
                '          </select>',
                '          <button id="a11y-profile-reset" class="a11y-btn a11y-btn--secondary">Reset</button>',
                '        </div>',
                '      </section>',

                // Font Size Section
                '      <section class="a11y-section">',
                '        <h3>Text Size</h3>',
                '        <div class="a11y-control-group">',
                '          <button id="a11y-font-decrease" class="a11y-btn" aria-label="Decrease text size">A-</button>',
                '          <span id="a11y-font-value" class="a11y-value" aria-live="polite">100%</span>',
                '          <button id="a11y-font-increase" class="a11y-btn" aria-label="Increase text size">A+</button>',
                '        </div>',
                '      </section>',

                // Contrast Section
                '      <section class="a11y-section">',
                '        <h3>Contrast</h3>',
                '        <div class="a11y-control-group a11y-contrast-buttons">',
                '          <button id="a11y-contrast-none" class="a11y-btn a11y-btn--active" data-mode="none">Normal</button>',
                '          <button id="a11y-contrast-dark" class="a11y-btn" data-mode="dark">Dark</button>',
                '          <button id="a11y-contrast-light" class="a11y-btn" data-mode="light">Light</button>',
                '          <button id="a11y-contrast-invert" class="a11y-btn" data-mode="invert">Invert</button>',
                '        </div>',
                '      </section>',

                // Features Section
                '      <section class="a11y-section">',
                '        <h3>Features</h3>',
                '        <div class="a11y-toggles">',
                '          <label class="a11y-toggle">',
                '            <input type="checkbox" id="a11y-toggle-animations">',
                '            <span>Stop Animations</span>',
                '          </label>',
                '          <label class="a11y-toggle">',
                '            <input type="checkbox" id="a11y-toggle-reading-guide">',
                '            <span>Reading Guide</span>',
                '          </label>',
                '          <label class="a11y-toggle">',
                '            <input type="checkbox" id="a11y-toggle-focus">',
                '            <span>Focus Highlight</span>',
                '          </label>',
                '          <label class="a11y-toggle">',
                '            <input type="checkbox" id="a11y-toggle-links">',
                '            <span>Highlight Links</span>',
                '          </label>',
                '        </div>',
                '      </section>',

                // Spacing Section
                '      <section class="a11y-section">',
                '        <h3>Spacing</h3>',
                '        <div class="a11y-slider-group">',
                '          <label for="a11y-line-height">Line Height</label>',
                '          <input type="range" id="a11y-line-height" min="1" max="2" step="0.1" value="1">',
                '        </div>',
                '        <div class="a11y-slider-group">',
                '          <label for="a11y-letter-spacing">Letter Spacing</label>',
                '          <input type="range" id="a11y-letter-spacing" min="0" max="5" step="0.5" value="0">',
                '        </div>',
                '      </section>',

                // Cursor Section
                '      <section class="a11y-section">',
                '        <h3>Cursor</h3>',
                '        <div class="a11y-control-group">',
                '          <button id="a11y-cursor-default" class="a11y-btn a11y-btn--active" data-cursor="default">Default</button>',
                '          <button id="a11y-cursor-large" class="a11y-btn" data-cursor="large">Large</button>',
                '          <button id="a11y-cursor-xlarge" class="a11y-btn" data-cursor="xlarge">X-Large</button>',
                '        </div>',
                '      </section>',

                // Developer Tools Section (collapsed by default)
                '      <section class="a11y-section a11y-section--dev">',
                '        <h3>',
                '          <button class="a11y-section__toggle" aria-expanded="false">',
                '            Developer Tools',
                '            <span class="a11y-section__arrow">&#9660;</span>',
                '          </button>',
                '        </h3>',
                '        <div class="a11y-section__content" hidden>',
                '          <button id="a11y-scan" class="a11y-btn a11y-btn--full">Run Accessibility Scan</button>',
                '          <label class="a11y-toggle">',
                '            <input type="checkbox" id="a11y-toggle-dev-mode">',
                '            <span>Developer Mode (Highlight Issues)</span>',
                '          </label>',
                '          <div id="a11y-scan-results" class="a11y-scan-results" hidden>',
                '            <div class="a11y-scan-summary"></div>',
                '            <div class="a11y-scan-actions">',
                '              <button id="a11y-export-csv" class="a11y-btn a11y-btn--small">Export CSV</button>',
                '              <button id="a11y-export-json" class="a11y-btn a11y-btn--small">Export JSON</button>',
                '            </div>',
                '          </div>',
                '        </div>',
                '      </section>',

                '    </div>',

                // Footer
                '    <div class="a11y-panel__footer">',
                '      <button id="a11y-reset-all" class="a11y-btn a11y-btn--secondary a11y-btn--full">Reset All Settings</button>',
                '      <div class="a11y-panel__position">',
                '        <button id="a11y-position-left" class="a11y-btn a11y-btn--small" aria-label="Move widget to left">&#8592;</button>',
                '        <button id="a11y-position-right" class="a11y-btn a11y-btn--small" aria-label="Move widget to right">&#8594;</button>',
                '      </div>',
                '    </div>',

                '  </div>',
                '</div>'
            ].join('\n');
        },

        /**
         * Bind event handlers
         * @private
         */
        _bindEvents: function() {
            var self = this;
            var $widget = $(this._widgetElement);

            // Toggle panel
            $widget.on('click', '#a11y-trigger', function() {
                self.togglePanel();
            });

            // Close button
            $widget.on('click', '.a11y-panel__close', function() {
                self.closePanel();
            });

            // Profile selection
            $widget.on('change', '#a11y-profile-select', function() {
                var profileId = this.value;
                if (profileId && window.A11Y_PROFILES) {
                    window.A11Y_PROFILES.applyProfile(profileId);
                    self._updateUI();
                }
            });

            // Profile reset
            $widget.on('click', '#a11y-profile-reset', function() {
                if (window.A11Y_PROFILES) {
                    window.A11Y_PROFILES.deactivateProfile();
                    $('#a11y-profile-select').val('');
                    self._updateUI();
                }
            });

            // Font size controls
            $widget.on('click', '#a11y-font-decrease', function() {
                if (window.A11Y_STYLES) {
                    window.A11Y_STYLES.decreaseFontSize();
                    self._updateFontDisplay();
                }
            });

            $widget.on('click', '#a11y-font-increase', function() {
                if (window.A11Y_STYLES) {
                    window.A11Y_STYLES.increaseFontSize();
                    self._updateFontDisplay();
                }
            });

            // Contrast buttons
            $widget.on('click', '.a11y-contrast-buttons .a11y-btn', function() {
                var mode = $(this).data('mode');
                if (window.A11Y_STYLES) {
                    window.A11Y_STYLES.setHighContrast(mode);
                    self._updateContrastButtons(mode);
                }
            });

            // Feature toggles
            $widget.on('change', '#a11y-toggle-animations', function() {
                if (window.A11Y_STYLES) {
                    window.A11Y_STYLES.setStopAnimations(this.checked);
                }
            });

            $widget.on('change', '#a11y-toggle-reading-guide', function() {
                if (window.A11Y_STYLES) {
                    window.A11Y_STYLES.setReadingGuide(this.checked);
                }
            });

            $widget.on('change', '#a11y-toggle-focus', function() {
                if (window.A11Y_STYLES) {
                    window.A11Y_STYLES.setFocusHighlight(this.checked);
                }
            });

            $widget.on('change', '#a11y-toggle-links', function() {
                if (window.A11Y_STYLES) {
                    window.A11Y_STYLES.setLinkHighlight(this.checked);
                }
            });

            // Spacing sliders
            $widget.on('input', '#a11y-line-height', function() {
                if (window.A11Y_STYLES) {
                    window.A11Y_STYLES.setLineHeight(parseFloat(this.value));
                }
            });

            $widget.on('input', '#a11y-letter-spacing', function() {
                if (window.A11Y_STYLES) {
                    window.A11Y_STYLES.setLetterSpacing(parseFloat(this.value));
                }
            });

            // Cursor buttons
            $widget.on('click', '[data-cursor]', function() {
                var size = $(this).data('cursor');
                if (window.A11Y_STYLES) {
                    window.A11Y_STYLES.setCursorSize(size);
                    $('[data-cursor]').removeClass('a11y-btn--active');
                    $(this).addClass('a11y-btn--active');
                }
            });

            // Developer section toggle
            $widget.on('click', '.a11y-section__toggle', function() {
                var expanded = $(this).attr('aria-expanded') === 'true';
                $(this).attr('aria-expanded', !expanded);
                $(this).closest('.a11y-section').find('.a11y-section__content').prop('hidden', expanded);
            });

            // Run scan
            $widget.on('click', '#a11y-scan', function() {
                self._runScan();
            });

            // Developer mode toggle
            $widget.on('change', '#a11y-toggle-dev-mode', function() {
                if (window.A11Y_SCANNER) {
                    window.A11Y_SCANNER.setDeveloperMode(this.checked);
                }
            });

            // Export buttons
            $widget.on('click', '#a11y-export-csv', function() {
                if (window.A11Y_SCANNER) {
                    window.A11Y_SCANNER.downloadCSV();
                }
            });

            $widget.on('click', '#a11y-export-json', function() {
                if (window.A11Y_SCANNER) {
                    var json = window.A11Y_SCANNER.exportToJSON();
                    var blob = new Blob([json], { type: 'application/json' });
                    var link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'a11y-scan-' + new Date().toISOString().split('T')[0] + '.json';
                    link.click();
                }
            });

            // Reset all
            $widget.on('click', '#a11y-reset-all', function() {
                self.resetAll();
            });

            // Position buttons
            $widget.on('click', '#a11y-position-left', function() {
                self.setPosition('left');
            });

            $widget.on('click', '#a11y-position-right', function() {
                self.setPosition('right');
            });

            // Close on escape
            $(document).on('keydown', function(e) {
                if (e.key === 'Escape' && self._panelOpen) {
                    self.closePanel();
                }
            });

            // Close when clicking outside
            $(document).on('click', function(e) {
                if (self._panelOpen && !$(e.target).closest('#a11y-widget').length) {
                    self.closePanel();
                }
            });
        },

        /**
         * Setup keyboard shortcuts
         * @private
         */
        _setupKeyboardShortcuts: function() {
            var self = this;

            $(document).on('keydown', function(e) {
                // Alt + A: Toggle widget
                if (e.altKey && e.key === 'a') {
                    e.preventDefault();
                    self.togglePanel();
                }

                // Alt + +: Increase font
                if (e.altKey && (e.key === '+' || e.key === '=')) {
                    e.preventDefault();
                    if (window.A11Y_STYLES) {
                        window.A11Y_STYLES.increaseFontSize();
                        self._updateFontDisplay();
                    }
                }

                // Alt + -: Decrease font
                if (e.altKey && e.key === '-') {
                    e.preventDefault();
                    if (window.A11Y_STYLES) {
                        window.A11Y_STYLES.decreaseFontSize();
                        self._updateFontDisplay();
                    }
                }

                // Alt + 0: Reset font
                if (e.altKey && e.key === '0') {
                    e.preventDefault();
                    if (window.A11Y_STYLES) {
                        window.A11Y_STYLES.resetFontSize();
                        self._updateFontDisplay();
                    }
                }

                // Alt + C: Toggle contrast
                if (e.altKey && e.key === 'c') {
                    e.preventDefault();
                    if (window.A11Y_STYLES) {
                        window.A11Y_STYLES.toggleContrast();
                        self._updateContrastButtons(window.A11Y_STYLES.getContrastMode());
                    }
                }

                // Alt + R: Toggle reading guide
                if (e.altKey && e.key === 'r') {
                    e.preventDefault();
                    if (window.A11Y_STYLES) {
                        window.A11Y_STYLES.toggleReadingGuide();
                        var settings = window.A11Y_STYLES.getSettings();
                        $('#a11y-toggle-reading-guide').prop('checked', settings.readingGuide);
                    }
                }

                // Alt + S: Run scan
                if (e.altKey && e.key === 's') {
                    e.preventDefault();
                    self._runScan();
                }
            });
        },

        /**
         * Setup page change handler
         * @private
         */
        _setupPageChangeHandler: function() {
            var self = this;

            if (window.A11Y_PSFT) {
                window.A11Y_PSFT.onPageChange(function(data) {
                    // Re-apply styles after Ajax navigation
                    self._updateUI();
                });
            }
        },

        /**
         * Toggle panel open/closed
         */
        togglePanel: function() {
            if (this._panelOpen) {
                this.closePanel();
            } else {
                this.openPanel();
            }
        },

        /**
         * Open the panel
         */
        openPanel: function() {
            this._panelOpen = true;

            var $widget = $(this._widgetElement);
            $widget.removeClass('a11y-widget--closed').addClass('a11y-widget--open');

            var $trigger = $widget.find('#a11y-trigger');
            $trigger.attr('aria-expanded', 'true');
            $trigger.attr('aria-label', 'Close Accessibility Menu');

            var $panel = $widget.find('#a11y-panel');
            $panel.attr('aria-hidden', 'false');

            // Focus first focusable element
            $panel.find('button, select, input').first().focus();

            // Update UI to reflect current settings
            this._updateUI();
        },

        /**
         * Close the panel
         */
        closePanel: function() {
            this._panelOpen = false;

            var $widget = $(this._widgetElement);
            $widget.removeClass('a11y-widget--open').addClass('a11y-widget--closed');

            var $trigger = $widget.find('#a11y-trigger');
            $trigger.attr('aria-expanded', 'false');
            $trigger.attr('aria-label', 'Open Accessibility Menu');
            $trigger.focus();

            var $panel = $widget.find('#a11y-panel');
            $panel.attr('aria-hidden', 'true');
        },

        /**
         * Update UI to reflect current settings
         * @private
         */
        _updateUI: function() {
            if (!window.A11Y_STYLES) return;

            var settings = window.A11Y_STYLES.getSettings();

            // Font size
            this._updateFontDisplay();

            // Contrast
            this._updateContrastButtons(settings.contrastMode);

            // Toggles
            $('#a11y-toggle-animations').prop('checked', settings.stopAnimations);
            $('#a11y-toggle-reading-guide').prop('checked', settings.readingGuide);
            $('#a11y-toggle-focus').prop('checked', settings.focusHighlight);
            $('#a11y-toggle-links').prop('checked', settings.linkHighlight);

            // Sliders
            $('#a11y-line-height').val(settings.lineHeight);
            $('#a11y-letter-spacing').val(settings.letterSpacing);

            // Cursor
            $('[data-cursor]').removeClass('a11y-btn--active');
            $('[data-cursor="' + settings.cursorSize + '"]').addClass('a11y-btn--active');

            // Profile
            if (window.A11Y_PROFILES) {
                var activeProfile = window.A11Y_PROFILES.getActiveProfile();
                $('#a11y-profile-select').val(activeProfile ? activeProfile.id : '');
            }
        },

        /**
         * Update font size display
         * @private
         */
        _updateFontDisplay: function() {
            if (!window.A11Y_STYLES) return;

            var fontSize = window.A11Y_STYLES.getFontSize();
            $('#a11y-font-value').text(Math.round(fontSize * 100) + '%');
        },

        /**
         * Update contrast button states
         * @private
         */
        _updateContrastButtons: function(mode) {
            $('.a11y-contrast-buttons .a11y-btn').removeClass('a11y-btn--active');
            $('.a11y-contrast-buttons [data-mode="' + mode + '"]').addClass('a11y-btn--active');
        },

        /**
         * Run accessibility scan
         * @private
         */
        _runScan: function() {
            var self = this;
            var $results = $('#a11y-scan-results');
            var $summary = $results.find('.a11y-scan-summary');
            var $scanBtn = $('#a11y-scan');

            $scanBtn.prop('disabled', true).text('Scanning...');

            if (window.A11Y_SCANNER) {
                window.A11Y_SCANNER.scan().then(function(results) {
                    var summary = window.A11Y_SCANNER.getSummary();

                    $summary.html([
                        '<strong>Scan Complete</strong><br>',
                        'Total Issues: ' + summary.total + '<br>',
                        '<span style="color:#ff0000">Critical: ' + summary.critical + '</span> | ',
                        '<span style="color:#ff6600">Serious: ' + summary.serious + '</span> | ',
                        '<span style="color:#ffcc00">Moderate: ' + summary.moderate + '</span> | ',
                        '<span style="color:#0066ff">Minor: ' + summary.minor + '</span>'
                    ].join(''));

                    $results.prop('hidden', false);
                    $scanBtn.prop('disabled', false).text('Run Accessibility Scan');

                    // Also log to console
                    window.A11Y_SCANNER.logResults();
                }).catch(function(err) {
                    $summary.html('<strong>Scan Error:</strong> ' + err.message);
                    $results.prop('hidden', false);
                    $scanBtn.prop('disabled', false).text('Run Accessibility Scan');
                });
            } else {
                $summary.html('<strong>Error:</strong> Scanner not available');
                $results.prop('hidden', false);
                $scanBtn.prop('disabled', false).text('Run Accessibility Scan');
            }
        },

        /**
         * Set widget position
         * @param {string} position - 'left' or 'right'
         */
        setPosition: function(position) {
            this._position = position;

            var $widget = $(this._widgetElement);
            $widget.removeClass('a11y-widget--left a11y-widget--right');
            $widget.addClass('a11y-widget--' + position);

            this._savePosition();
        },

        /**
         * Save position to localStorage
         * @private
         */
        _savePosition: function() {
            try {
                localStorage.setItem('a11y_widget_position', this._position);
            } catch (e) {}
        },

        /**
         * Load position from localStorage
         * @private
         */
        _loadPosition: function() {
            try {
                var position = localStorage.getItem('a11y_widget_position');
                if (position === 'left' || position === 'right') {
                    this.setPosition(position);
                }
            } catch (e) {}
        },

        /**
         * Reset all settings
         */
        resetAll: function() {
            if (window.A11Y_STYLES) {
                window.A11Y_STYLES.resetAll();
            }

            if (window.A11Y_PROFILES) {
                window.A11Y_PROFILES.deactivateProfile();
            }

            if (window.A11Y_SCANNER) {
                window.A11Y_SCANNER.clearHighlights();
                window.A11Y_SCANNER.setDeveloperMode(false);
            }

            // Reset UI
            $('#a11y-profile-select').val('');
            $('#a11y-scan-results').prop('hidden', true);
            $('#a11y-toggle-dev-mode').prop('checked', false);

            this._updateUI();

            console.log('[A11Y] All settings reset');
        },

        /**
         * Destroy the widget
         */
        destroy: function() {
            if (this._widgetElement) {
                this._widgetElement.remove();
                this._widgetElement = null;
            }

            this._initialized = false;
        },

        /**
         * Get widget version
         * @returns {string} Version string
         */
        getVersion: function() {
            return CONFIG.version || '1.0.0';
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Small delay to ensure other modules are initialized
            setTimeout(function() {
                A11Y_CORE.init();
            }, 200);
        });
    } else {
        setTimeout(function() {
            A11Y_CORE.init();
        }, 200);
    }

    // Expose globally
    window.A11Y_CORE = A11Y_CORE;

})(window.a11yJQ);
