/**
 * A11Y_PSFT_HOOKS_JS
 * PeopleSoft Accessibility Widget - PeopleSoft Integration Hooks
 *
 * This module provides PeopleSoft-specific integration including:
 * - UI mode detection (Fluid vs Classic)
 * - Ajax navigation monitoring via MutationObserver
 * - Page metadata extraction
 * - PeopleSoft event integration
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

    /**
     * PeopleSoft Integration Module
     */
    var A11Y_PSFT = {

        // State
        _initialized: false,
        _observer: null,
        _callbacks: [],
        _debounceTimer: null,
        _debounceDelay: 100,
        _lastPageInfo: null,

        /**
         * Initialize the PeopleSoft hooks
         */
        init: function() {
            if (this._initialized) {
                return;
            }

            this._initialized = true;
            this._detectUIMode();
            this._initMutationObserver();
            this._hookPeopleSoftEvents();

            console.log('[A11Y] PeopleSoft hooks initialized - Mode: ' +
                (this.isFluid() ? 'Fluid' : 'Classic'));
        },

        /**
         * Detect if current page is using Fluid UI
         * @returns {boolean} True if Fluid UI
         */
        isFluid: function() {
            return document.querySelector('.ps_apps-fluid') !== null ||
                   document.querySelector('#PTNUI_LAND_REC') !== null ||
                   document.querySelector('.psc_body-fluid') !== null;
        },

        /**
         * Detect if current page is using Classic Plus
         * @returns {boolean} True if Classic Plus
         */
        isClassicPlus: function() {
            return document.querySelector('.ps_classic-plus') !== null ||
                   document.querySelector('#pthdr2container') !== null;
        },

        /**
         * Get current UI mode as string
         * @returns {string} 'fluid', 'classic-plus', or 'classic'
         */
        getUIMode: function() {
            if (this.isFluid()) return 'fluid';
            if (this.isClassicPlus()) return 'classic-plus';
            return 'classic';
        },

        /**
         * Get current page/component information from PT metadata
         * @returns {object|null} Page info object or null
         */
        getPageInfo: function() {
            var pageInfo = document.getElementById('pt_pageinfo_win0');

            if (pageInfo) {
                return {
                    component: pageInfo.getAttribute('component') || '',
                    page: pageInfo.getAttribute('page') || '',
                    menu: pageInfo.getAttribute('menu') || '',
                    market: pageInfo.getAttribute('market') || '',
                    portal: pageInfo.getAttribute('portal') || '',
                    node: pageInfo.getAttribute('node') || '',
                    action: pageInfo.getAttribute('action') || '',
                    uiMode: this.getUIMode()
                };
            }

            // Try alternative sources
            var component = this._getMetaContent('component');
            var page = this._getMetaContent('page');

            if (component || page) {
                return {
                    component: component || '',
                    page: page || '',
                    menu: '',
                    market: '',
                    portal: '',
                    node: '',
                    action: '',
                    uiMode: this.getUIMode()
                };
            }

            return null;
        },

        /**
         * Get meta tag content
         * @private
         */
        _getMetaContent: function(name) {
            var meta = document.querySelector('meta[name="' + name + '"]');
            return meta ? meta.getAttribute('content') : '';
        },

        /**
         * Detect UI mode and store it
         * @private
         */
        _detectUIMode: function() {
            this._uiMode = this.getUIMode();
        },

        /**
         * Initialize MutationObserver for Ajax navigation detection
         * @private
         */
        _initMutationObserver: function() {
            var self = this;

            // Find the best target node to observe
            var targetNode = document.getElementById('ptifrmtgtframe') ||
                            document.getElementById('pt_pageinfo_win0') ||
                            document.getElementById('PTNUI_LAND_REC') ||
                            document.body;

            var config = {
                childList: true,
                subtree: true,
                attributes: false,
                characterData: false
            };

            this._observer = new MutationObserver(function(mutations) {
                self._handleMutations(mutations);
            });

            this._observer.observe(targetNode, config);

            console.log('[A11Y] MutationObserver initialized on:', targetNode.id || 'document.body');
        },

        /**
         * Handle DOM mutations with debouncing
         * @private
         */
        _handleMutations: function(mutations) {
            var self = this;

            // Check if this is a significant change (page navigation)
            var isSignificant = mutations.some(function(mutation) {
                return mutation.addedNodes.length > 5 ||
                       (mutation.target.id && mutation.target.id.indexOf('win') !== -1);
            });

            if (!isSignificant) {
                return;
            }

            // Debounce callbacks
            clearTimeout(this._debounceTimer);
            this._debounceTimer = setTimeout(function() {
                self._onPageChange();
            }, this._debounceDelay);
        },

        /**
         * Called when page content changes (Ajax navigation)
         * @private
         */
        _onPageChange: function() {
            var newPageInfo = this.getPageInfo();
            var pageChanged = false;

            // Check if page actually changed
            if (this._lastPageInfo && newPageInfo) {
                pageChanged = this._lastPageInfo.component !== newPageInfo.component ||
                             this._lastPageInfo.page !== newPageInfo.page;
            } else if (newPageInfo) {
                pageChanged = true;
            }

            this._lastPageInfo = newPageInfo;

            // Execute registered callbacks
            this._callbacks.forEach(function(callback) {
                try {
                    callback({
                        pageInfo: newPageInfo,
                        pageChanged: pageChanged,
                        uiMode: this.getUIMode()
                    });
                } catch (e) {
                    console.error('[A11Y] Callback error:', e);
                }
            }.bind(this));
        },

        /**
         * Register a callback for page changes
         * @param {function} callback - Function to call on page change
         * @returns {function} Unsubscribe function
         */
        onPageChange: function(callback) {
            if (typeof callback !== 'function') {
                console.error('[A11Y] onPageChange requires a function');
                return function() {};
            }

            this._callbacks.push(callback);

            // Return unsubscribe function
            var self = this;
            return function() {
                var index = self._callbacks.indexOf(callback);
                if (index > -1) {
                    self._callbacks.splice(index, 1);
                }
            };
        },

        /**
         * Hook into PeopleSoft's native events
         * @private
         */
        _hookPeopleSoftEvents: function() {
            var self = this;

            // Hook into PeopleSoft's submitAction if available
            if (typeof window.submitAction_win0 === 'function') {
                var originalSubmit = window.submitAction_win0;
                window.submitAction_win0 = function() {
                    self._onBeforeSubmit();
                    return originalSubmit.apply(this, arguments);
                };
            }

            // Hook into processing_win0 completion
            if (typeof window.processing_win0 !== 'undefined') {
                this._watchProcessing();
            }

            // Listen for PeopleSoft's custom events if available
            document.addEventListener('PSPageLoaded', function(e) {
                self._onPageChange();
            });
        },

        /**
         * Called before form submission
         * @private
         */
        _onBeforeSubmit: function() {
            // Can be used to save state before navigation
        },

        /**
         * Watch the processing indicator
         * @private
         */
        _watchProcessing: function() {
            var self = this;
            var processingEl = document.getElementById('processing_win0');

            if (!processingEl) return;

            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.attributeName === 'style') {
                        var isVisible = processingEl.style.visibility !== 'hidden' &&
                                       processingEl.style.display !== 'none';
                        if (!isVisible) {
                            // Processing complete, trigger page change check
                            setTimeout(function() {
                                self._onPageChange();
                            }, 50);
                        }
                    }
                });
            });

            observer.observe(processingEl, { attributes: true });
        },

        /**
         * Get the main content container element
         * @returns {HTMLElement} Content container
         */
        getContentContainer: function() {
            if (this.isFluid()) {
                return document.querySelector('.ps_apps-fluid') ||
                       document.querySelector('#PTNUI_LAND_REC') ||
                       document.body;
            }

            // Classic mode - check for iframe
            var iframe = document.getElementById('ptifrmtgtframe');
            if (iframe && iframe.contentDocument) {
                return iframe.contentDocument.body;
            }

            return document.getElementById('ptpgltbody') || document.body;
        },

        /**
         * Execute function in the correct document context
         * @param {function} fn - Function to execute
         */
        inContentContext: function(fn) {
            var container = this.getContentContainer();
            var doc = container.ownerDocument || document;

            try {
                fn(container, doc, a11yJQ);
            } catch (e) {
                console.error('[A11Y] Error in content context:', e);
            }
        },

        /**
         * Check if we're in an iframe context
         * @returns {boolean} True if in iframe
         */
        isInIframe: function() {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        },

        /**
         * Get the top-level window
         * @returns {Window} Top window
         */
        getTopWindow: function() {
            try {
                return window.top;
            } catch (e) {
                return window;
            }
        },

        /**
         * Destroy the module and clean up
         */
        destroy: function() {
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }

            clearTimeout(this._debounceTimer);
            this._callbacks = [];
            this._initialized = false;
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            A11Y_PSFT.init();
        });
    } else {
        A11Y_PSFT.init();
    }

    // Expose globally
    window.A11Y_PSFT = A11Y_PSFT;

})(window.a11yJQ);
