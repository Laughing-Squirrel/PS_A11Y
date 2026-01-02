/**
 * A11Y_ARIA_SCANNER_JS
 * PeopleSoft Accessibility Widget - ARIA Detection and Remediation Module
 *
 * This module integrates with axe-core to provide:
 * - Automated accessibility scanning
 * - PeopleSoft-specific custom rules
 * - Remediation reporting
 * - Developer mode with visual highlighting
 *
 * @version 1.0.0
 * @license MIT
 */
(function(a11yJQ) {
    'use strict';

    // Ensure dependencies are available
    if (typeof a11yJQ === 'undefined') {
        console.error('[A11Y] a11yJQ not available. Load a11y-jquery-noconflict.js first.');
        return;
    }

    var CONFIG = window.A11Y_CONFIG || {};

    /**
     * ARIA Scanner Module
     */
    var A11Y_SCANNER = {

        // State
        _initialized: false,
        _axeLoaded: false,
        _results: null,
        _highlightElements: [],
        _developerMode: false,

        // PeopleSoft-specific rule definitions
        _psftRules: [
            {
                id: 'psft-prompt-icon',
                description: 'PeopleSoft prompt/lookup icons must have accessible names',
                selector: 'a[id*="ICSearch"], a[id*="ICList"], a[id*="ICDetail"], img.PTPROMPT',
                check: function(el) {
                    return el.hasAttribute('aria-label') ||
                           el.hasAttribute('title') ||
                           (el.tagName === 'IMG' && el.hasAttribute('alt') && el.alt !== '');
                },
                fix: 'Add aria-label="Search" or aria-label="Lookup" to prompt icons'
            },
            {
                id: 'psft-calendar-icon',
                description: 'Calendar picker icons must have accessible names',
                selector: 'a[id*="$prompt"], img[id*="CALENDAR"], a[id*="CALENDAR"]',
                check: function(el) {
                    return el.hasAttribute('aria-label') ||
                           el.hasAttribute('title') ||
                           (el.tagName === 'IMG' && el.hasAttribute('alt') && el.alt !== '');
                },
                fix: 'Add aria-label="Select Date" to calendar icons'
            },
            {
                id: 'psft-grid-actions',
                description: 'Grid Add/Delete buttons must have accessible names',
                selector: 'a[id*="$add$"], a[id*="$delete$"], a[id*="$new$"]',
                check: function(el) {
                    return el.hasAttribute('aria-label') ||
                           el.hasAttribute('title') ||
                           el.textContent.trim() !== '';
                },
                fix: 'Add aria-label="Add Row" or aria-label="Delete Row" to grid action buttons'
            },
            {
                id: 'psft-related-actions',
                description: 'Related Actions menus should use correct ARIA patterns',
                selector: '[id*="RELATED_ACTIONS"], .ps-related-actions',
                check: function(el) {
                    var role = el.getAttribute('role');
                    // Should not use menu role (misuse)
                    return role !== 'menu';
                },
                fix: 'Use disclosure pattern (aria-expanded) instead of menu role for Related Actions'
            },
            {
                id: 'psft-tabs-panel',
                description: 'Tab panels must be properly associated with their tabs',
                selector: '.PSTAB, .ps-tab-panel',
                check: function(el) {
                    return el.hasAttribute('aria-labelledby') ||
                           el.hasAttribute('aria-label');
                },
                fix: 'Add aria-labelledby referencing the associated tab ID'
            },
            {
                id: 'psft-modal-focus',
                description: 'Modal dialogs should trap focus',
                selector: '#ptMod_1, .ps-modal, [role="dialog"]',
                check: function(el) {
                    // Check if modal has focus management
                    return el.hasAttribute('aria-modal') ||
                           el.querySelector('[autofocus]') !== null;
                },
                fix: 'Add aria-modal="true" and implement focus trap for modal dialogs'
            },
            {
                id: 'psft-error-message',
                description: 'Validation errors must be linked to their fields',
                selector: '.PSERRORMESSAGE, .ps-error-message',
                check: function(el) {
                    // Check if error has an ID and is referenced by aria-describedby
                    if (!el.id) return false;
                    var linkedInput = document.querySelector('[aria-describedby*="' + el.id + '"]');
                    return linkedInput !== null;
                },
                fix: 'Add aria-describedby to input fields, referencing the error message ID'
            },
            {
                id: 'psft-grid-headers',
                description: 'Grid tables should have proper header associations',
                selector: 'table.PSLEVEL1GRID, table.PSLEVEL2GRID, table.ps-grid',
                check: function(el) {
                    var headers = el.querySelectorAll('th');
                    if (headers.length === 0) return false;
                    // Check if headers have scope attribute
                    return Array.from(headers).every(function(th) {
                        return th.hasAttribute('scope');
                    });
                },
                fix: 'Add scope="col" or scope="row" to table header cells'
            },
            {
                id: 'psft-required-field',
                description: 'Required fields must be marked with aria-required',
                selector: '.PSREQUIREDFLDLBL, [id*="req$"]',
                check: function(el) {
                    // Find associated input
                    var labelFor = el.getAttribute('for');
                    if (labelFor) {
                        var input = document.getElementById(labelFor);
                        return input && (input.hasAttribute('aria-required') || input.hasAttribute('required'));
                    }
                    return true; // Can't check, assume OK
                },
                fix: 'Add aria-required="true" to required form fields'
            }
        ],

        /**
         * Initialize the scanner
         */
        init: function() {
            if (this._initialized) {
                return;
            }

            this._checkAxeCore();
            this._initialized = true;
            console.log('[A11Y] ARIA Scanner initialized' +
                (this._axeLoaded ? ' with axe-core' : ' (axe-core not loaded)'));
        },

        /**
         * Check if axe-core is available
         * @private
         */
        _checkAxeCore: function() {
            if (typeof axe !== 'undefined') {
                this._axeLoaded = true;
                this._configureAxe();
            }
        },

        /**
         * Configure axe-core with PeopleSoft-specific settings
         * @private
         */
        _configureAxe: function() {
            if (!this._axeLoaded) return;

            axe.configure({
                branding: {
                    application: 'PeopleSoft A11Y Widget'
                },
                reporter: 'v2'
            });
        },

        /**
         * Run accessibility scan
         * @param {object} options - Scan options
         * @returns {Promise} Scan results
         */
        scan: function(options) {
            var self = this;
            options = options || {};

            // Clear previous highlights
            this.clearHighlights();

            // Get the scan context
            var context = options.context || document;

            // Run PeopleSoft-specific rules first
            var psftResults = this._runPsftRules(context);

            // If axe-core is loaded, run it too
            if (this._axeLoaded) {
                return this._runAxeScan(context, options).then(function(axeResults) {
                    self._results = self._mergeResults(psftResults, axeResults);

                    if (self._developerMode) {
                        self._highlightIssues();
                    }

                    return self._results;
                });
            } else {
                // Return PeopleSoft rules only
                this._results = psftResults;

                if (this._developerMode) {
                    this._highlightIssues();
                }

                return Promise.resolve(this._results);
            }
        },

        /**
         * Run PeopleSoft-specific rules
         * @private
         */
        _runPsftRules: function(context) {
            var self = this;
            var pageInfo = window.A11Y_PSFT ? window.A11Y_PSFT.getPageInfo() : null;

            var results = {
                timestamp: new Date().toISOString(),
                url: window.location.href,
                component: pageInfo ? pageInfo.component : 'unknown',
                page: pageInfo ? pageInfo.page : 'unknown',
                uiMode: pageInfo ? pageInfo.uiMode : 'unknown',
                violations: [],
                passes: [],
                incomplete: [],
                summary: {
                    critical: 0,
                    serious: 0,
                    moderate: 0,
                    minor: 0
                }
            };

            this._psftRules.forEach(function(rule) {
                var elements = context.querySelectorAll(rule.selector);

                elements.forEach(function(el) {
                    var passed = rule.check(el);

                    if (!passed) {
                        results.violations.push({
                            ruleId: rule.id,
                            impact: 'serious',
                            description: rule.description,
                            help: rule.fix,
                            helpUrl: '',
                            wcagCriteria: ['wcag2aa'],
                            element: {
                                selector: self._getSelector(el),
                                html: el.outerHTML.substring(0, 200),
                                failureSummary: rule.description
                            },
                            suggestedFix: rule.fix,
                            source: 'psft-rules'
                        });
                        results.summary.serious++;
                    } else {
                        results.passes.push({
                            ruleId: rule.id,
                            element: self._getSelector(el)
                        });
                    }
                });
            });

            return results;
        },

        /**
         * Run axe-core scan
         * @private
         */
        _runAxeScan: function(context, options) {
            var runOptions = {
                runOnly: options.runOnly || {
                    type: 'tag',
                    values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
                },
                resultTypes: ['violations', 'incomplete', 'passes']
            };

            return axe.run(context, runOptions);
        },

        /**
         * Merge PeopleSoft and axe-core results
         * @private
         */
        _mergeResults: function(psftResults, axeResults) {
            var self = this;

            // Process axe violations
            axeResults.violations.forEach(function(violation) {
                violation.nodes.forEach(function(node) {
                    psftResults.violations.push({
                        ruleId: violation.id,
                        impact: violation.impact,
                        description: violation.description,
                        help: violation.help,
                        helpUrl: violation.helpUrl,
                        wcagCriteria: violation.tags.filter(function(t) {
                            return t.indexOf('wcag') === 0;
                        }),
                        element: {
                            selector: node.target.join(' > '),
                            html: node.html,
                            failureSummary: node.failureSummary
                        },
                        suggestedFix: self._getSuggestedFix(violation.id, node),
                        source: 'axe-core'
                    });

                    psftResults.summary[violation.impact]++;
                });
            });

            // Process incomplete (needs manual review)
            axeResults.incomplete.forEach(function(incomplete) {
                incomplete.nodes.forEach(function(node) {
                    psftResults.incomplete.push({
                        ruleId: incomplete.id,
                        description: incomplete.description,
                        element: {
                            selector: node.target.join(' > '),
                            html: node.html
                        },
                        source: 'axe-core'
                    });
                });
            });

            return psftResults;
        },

        /**
         * Get PeopleSoft-specific fix suggestions
         * @private
         */
        _getSuggestedFix: function(ruleId, node) {
            var fixes = {
                'button-name': 'Add aria-label via Page Field Properties or use AddJavaScript to inject aria-label',
                'image-alt': 'Set Alt Text in Image Properties dialog in App Designer',
                'label': 'Associate label using PeopleTools label property or add aria-labelledby via JavaScript injection',
                'aria-required-attr': 'Add required ARIA attributes via Event Mapping or global JavaScript injection',
                'link-name': 'Add descriptive text to links or use aria-label',
                'color-contrast': 'Update stylesheet colors or use high contrast mode',
                'heading-order': 'Ensure heading levels increase sequentially (H1, H2, H3...)',
                'landmark-one-main': 'Add role="main" to the main content container',
                'page-has-heading-one': 'Add an H1 heading to the page',
                'region': 'Add landmark roles to major page sections'
            };

            return fixes[ruleId] || 'See axe-core documentation: https://dequeuniversity.com/rules/axe/' + ruleId;
        },

        /**
         * Generate CSS selector for an element
         * @private
         */
        _getSelector: function(el) {
            if (el.id) {
                return '#' + el.id;
            }

            var path = [];
            while (el && el.nodeType === Node.ELEMENT_NODE) {
                var selector = el.tagName.toLowerCase();

                if (el.id) {
                    selector = '#' + el.id;
                    path.unshift(selector);
                    break;
                } else if (el.className && typeof el.className === 'string') {
                    var classes = el.className.trim().split(/\s+/).slice(0, 2).join('.');
                    if (classes) {
                        selector += '.' + classes;
                    }
                }

                var sibling = el;
                var nth = 1;
                while (sibling = sibling.previousElementSibling) {
                    if (sibling.tagName === el.tagName) nth++;
                }
                if (nth > 1) selector += ':nth-of-type(' + nth + ')';

                path.unshift(selector);
                el = el.parentElement;

                if (path.length > 4) break;
            }

            return path.join(' > ');
        },

        /**
         * Enable/disable developer mode
         * @param {boolean} enabled - Enable developer mode
         */
        setDeveloperMode: function(enabled) {
            this._developerMode = enabled;

            if (!enabled) {
                this.clearHighlights();
            } else if (this._results) {
                this._highlightIssues();
            }

            console.log('[A11Y] Developer mode:', enabled ? 'enabled' : 'disabled');
        },

        /**
         * Highlight issues in the DOM
         * @private
         */
        _highlightIssues: function() {
            if (!this._results || !this._results.violations) return;

            var self = this;

            this._results.violations.forEach(function(violation) {
                try {
                    var el = document.querySelector(violation.element.selector);
                    if (el) {
                        self._addHighlight(el, violation);
                    }
                } catch (e) {
                    // Invalid selector, skip
                }
            });
        },

        /**
         * Add highlight to an element
         * @private
         */
        _addHighlight: function(el, violation) {
            var colors = {
                'critical': '#ff0000',
                'serious': '#ff6600',
                'moderate': '#ffcc00',
                'minor': '#0066ff'
            };

            var color = colors[violation.impact] || colors.moderate;

            el.style.outline = '3px solid ' + color;
            el.style.outlineOffset = '2px';
            el.setAttribute('data-a11y-issue', violation.ruleId);
            el.setAttribute('title', violation.description + '\n\nFix: ' + violation.suggestedFix);

            this._highlightElements.push(el);
        },

        /**
         * Clear all highlights
         */
        clearHighlights: function() {
            this._highlightElements.forEach(function(el) {
                el.style.outline = '';
                el.style.outlineOffset = '';
                el.removeAttribute('data-a11y-issue');
            });
            this._highlightElements = [];
        },

        /**
         * Get current results
         * @returns {object} Scan results
         */
        getResults: function() {
            return this._results;
        },

        /**
         * Export results to CSV
         * @returns {string} CSV content
         */
        exportToCSV: function() {
            if (!this._results) {
                console.warn('[A11Y] No scan results to export');
                return '';
            }

            var rows = [
                ['Component', 'Page', 'Rule', 'Impact', 'Element', 'Description', 'Fix', 'Source']
            ];

            var self = this;
            this._results.violations.forEach(function(v) {
                rows.push([
                    self._results.component,
                    self._results.page,
                    v.ruleId,
                    v.impact,
                    '"' + v.element.selector.replace(/"/g, '""') + '"',
                    '"' + v.description.replace(/"/g, '""') + '"',
                    '"' + v.suggestedFix.replace(/"/g, '""') + '"',
                    v.source || 'unknown'
                ]);
            });

            return rows.map(function(row) {
                return row.join(',');
            }).join('\n');
        },

        /**
         * Download results as CSV file
         */
        downloadCSV: function() {
            var csv = this.exportToCSV();
            if (!csv) return;

            var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            var link = document.createElement('a');
            var url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', 'a11y-scan-' + new Date().toISOString().split('T')[0] + '.csv');
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        /**
         * Export results to JSON
         * @returns {string} JSON content
         */
        exportToJSON: function() {
            if (!this._results) {
                console.warn('[A11Y] No scan results to export');
                return '{}';
            }

            return JSON.stringify(this._results, null, 2);
        },

        /**
         * Get summary of results
         * @returns {object} Summary object
         */
        getSummary: function() {
            if (!this._results) {
                return { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 };
            }

            return {
                total: this._results.violations.length,
                critical: this._results.summary.critical,
                serious: this._results.summary.serious,
                moderate: this._results.summary.moderate,
                minor: this._results.summary.minor,
                incomplete: this._results.incomplete.length,
                passes: this._results.passes.length
            };
        },

        /**
         * Log results to console in a readable format
         */
        logResults: function() {
            if (!this._results) {
                console.log('[A11Y] No scan results available. Run scan() first.');
                return;
            }

            var summary = this.getSummary();

            console.group('[A11Y] Accessibility Scan Results');
            console.log('Page:', this._results.component + ' / ' + this._results.page);
            console.log('UI Mode:', this._results.uiMode);
            console.log('Total Issues:', summary.total);
            console.log('  Critical:', summary.critical);
            console.log('  Serious:', summary.serious);
            console.log('  Moderate:', summary.moderate);
            console.log('  Minor:', summary.minor);
            console.log('Needs Review:', summary.incomplete);

            if (this._results.violations.length > 0) {
                console.group('Violations');
                this._results.violations.forEach(function(v, i) {
                    console.log((i + 1) + '. [' + v.impact.toUpperCase() + '] ' + v.ruleId);
                    console.log('   Element:', v.element.selector);
                    console.log('   Fix:', v.suggestedFix);
                });
                console.groupEnd();
            }

            console.groupEnd();
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            A11Y_SCANNER.init();
        });
    } else {
        A11Y_SCANNER.init();
    }

    // Expose globally
    window.A11Y_SCANNER = A11Y_SCANNER;

})(window.a11yJQ);
