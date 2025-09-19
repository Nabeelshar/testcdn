jQuery(document).ready(function($) {
    'use strict';
    
    // Test GitHub connection
    $('#test-connection').on('click', function(e) {
        e.preventDefault();
        
        var $button = $(this);
        var originalText = $button.text();
        
        // Get form values
        var username = $('#github_js_cdn_github_username').val();
        var repository = $('#github_js_cdn_github_repository').val();
        var token = $('#github_js_cdn_github_token').val();
        
        if (!username || !repository || !token) {
            alert('Please fill in all GitHub configuration fields before testing.');
            return;
        }
        
        // Show loading state
        $button.text(github_js_cdn_ajax.strings.testing).prop('disabled', true);
        
        // Clear previous results
        $('#connection-result').hide();
        
        // Make AJAX request
        $.ajax({
            url: github_js_cdn_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'github_js_cdn_test_connection',
                nonce: github_js_cdn_ajax.nonce,
                username: username,
                repository: repository,
                token: token
            },
            success: function(response) {
                var $result = $('#connection-result');
                
                if (response.success) {
                    $result.removeClass('notice-error').addClass('notice-success');
                    $result.find('p').text(github_js_cdn_ajax.strings.success + ' ' + response.data);
                } else {
                    $result.removeClass('notice-success').addClass('notice-error');
                    $result.find('p').text(github_js_cdn_ajax.strings.error + ' ' + response.data);
                }
                
                $result.show();
            },
            error: function(xhr, status, error) {
                var $result = $('#connection-result');
                $result.removeClass('notice-success').addClass('notice-error');
                $result.find('p').text(github_js_cdn_ajax.strings.error + ' ' + error);
                $result.show();
            },
            complete: function() {
                // Restore button state
                $button.text(originalText).prop('disabled', false);
            }
        });
    });
    
    // Manual sync
    $('#manual-sync').on('click', function(e) {
        e.preventDefault();
        
        var $button = $(this);
        var originalText = $button.text();
        
        // Show loading state
        $button.text(github_js_cdn_ajax.strings.syncing).prop('disabled', true);
        
        // Clear previous results
        $('#sync-result').hide();
        
        // Make AJAX request
        $.ajax({
            url: github_js_cdn_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'github_js_cdn_sync_now',
                nonce: github_js_cdn_ajax.nonce
            },
            success: function(response) {
                var $result = $('#sync-result');
                
                if (response.success) {
                    $result.removeClass('notice-error').addClass('notice-success');
                    $result.find('p').text(github_js_cdn_ajax.strings.sync_complete + ' ' + response.data);
                } else {
                    $result.removeClass('notice-success').addClass('notice-error');
                    $result.find('p').text(github_js_cdn_ajax.strings.error + ' ' + response.data);
                }
                
                $result.show();
                
                // Refresh page after successful sync to update stats
                if (response.success) {
                    setTimeout(function() {
                        location.reload();
                    }, 2000);
                }
            },
            error: function(xhr, status, error) {
                var $result = $('#sync-result');
                $result.removeClass('notice-success').addClass('notice-error');
                $result.find('p').text(github_js_cdn_ajax.strings.error + ' ' + error);
                $result.show();
            },
            complete: function() {
                // Restore button state
                $button.text(originalText).prop('disabled', false);
            }
        });
    });
    
    // Check Git status on page load
    checkGitStatus();
    
    // CDN provider change handler
    $('#github_js_cdn_cdn_provider').on('change', function() {
        updateCdnPreview();
    });
    
    // Update CDN preview when GitHub settings change
    $('#github_js_cdn_github_username, #github_js_cdn_github_repository, #github_js_cdn_github_branch').on('input', function() {
        updateCdnPreview();
    });
    
    /**
     * Check Git availability
     */
    function checkGitStatus() {
        $.ajax({
            url: github_js_cdn_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'github_js_cdn_check_git',
                nonce: github_js_cdn_ajax.nonce
            },
            success: function(response) {
                var $status = $('#git-status');
                
                if (response.success) {
                    $status.removeClass('status-error').addClass('status-success');
                    $status.text('Available');
                } else {
                    $status.removeClass('status-success').addClass('status-error');
                    $status.text('Not Available');
                }
            },
            error: function() {
                var $status = $('#git-status');
                $status.removeClass('status-success').addClass('status-error');
                $status.text('Unknown');
            }
        });
    }
    
    /**
     * Update CDN URL preview
     */
    function updateCdnPreview() {
        var provider = $('#github_js_cdn_cdn_provider').val();
        var username = $('#github_js_cdn_github_username').val();
        var repository = $('#github_js_cdn_github_repository').val();
        var branch = $('#github_js_cdn_github_branch').val() || 'main';
        
        if (!username || !repository) {
            $('.cdn-url-preview').text('Please configure GitHub settings first');
            return;
        }
        
        var cdnUrl = '';
        
        switch (provider) {
            case 'jsdelivr':
                cdnUrl = 'https://cdn.jsdelivr.net/gh/' + username + '/' + repository + '@' + branch + '/';
                break;
            case 'githubio':
                cdnUrl = 'https://' + username + '.github.io/' + repository + '/';
                break;
            case 'custom':
                cdnUrl = 'Custom URL (configure in settings)';
                break;
        }
        
        $('.cdn-url-preview').text(cdnUrl);
    }
    
    // Form validation
    $('#github-js-cdn-settings-form').on('submit', function(e) {
        var hasErrors = false;
        var errorMessages = [];
        
        // Validate GitHub username
        var username = $('#github_js_cdn_github_username').val();
        if (username && !username.match(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i)) {
            hasErrors = true;
            errorMessages.push('Invalid GitHub username format.');
        }
        
        // Validate repository name
        var repository = $('#github_js_cdn_github_repository').val();
        if (repository && !repository.match(/^[a-zA-Z0-9._-]+$/)) {
            hasErrors = true;
            errorMessages.push('Invalid repository name format.');
        }
        
        // Validate GitHub token
        var token = $('#github_js_cdn_github_token').val();
        if (token && !token.match(/^(gh[ps]_[a-zA-Z0-9]{36,}|[a-f0-9]{40})$/)) {
            hasErrors = true;
            errorMessages.push('Invalid GitHub token format.');
        }
        
        // Validate email
        var email = $('#github_js_cdn_git_author_email').val();
        if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            hasErrors = true;
            errorMessages.push('Invalid email address format.');
        }
        
        if (hasErrors) {
            e.preventDefault();
            alert('Please fix the following errors:\n\n' + errorMessages.join('\n'));
            return false;
        }
    });
    
    // Auto-save settings (draft mode)
    var autoSaveTimeout;
    $('.github-js-cdn-setting').on('input change', function() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(function() {
            saveDraftSettings();
        }, 2000);
    });
    
    /**
     * Save draft settings
     */
    function saveDraftSettings() {
        var formData = $('#github-js-cdn-settings-form').serialize();
        
        $.ajax({
            url: github_js_cdn_ajax.ajax_url,
            type: 'POST',
            data: formData + '&action=github_js_cdn_save_draft&nonce=' + github_js_cdn_ajax.nonce,
            success: function(response) {
                // Optionally show a small success indicator
                if (response.success) {
                    showTemporaryMessage('Settings saved as draft', 'success');
                }
            }
        });
    }
    
    /**
     * Show temporary message
     */
    function showTemporaryMessage(message, type) {
        var $message = $('<div class="notice notice-' + type + ' is-dismissible github-js-cdn-temp-message"><p>' + message + '</p></div>');
        $message.insertAfter('h1').delay(3000).fadeOut(function() {
            $(this).remove();
        });
    }
    
    // Tooltips for help text
    $('.github-js-cdn-help').on('click', function(e) {
        e.preventDefault();
        var helpText = $(this).data('help');
        if (helpText) {
            alert(helpText);
        }
    });
    
    // Collapsible sections
    $('.github-js-cdn-section-toggle').on('click', function() {
        var $section = $(this).closest('.postbox');
        var $content = $section.find('.inside');
        
        $content.slideToggle();
        $(this).toggleClass('closed');
    });
    
    // Initialize tooltips if available
    if (typeof $.fn.tooltip === 'function') {
        $('[data-toggle="tooltip"]').tooltip();
    }
    
    // Handle file pattern validation
    $('#github_js_cdn_excluded_files').on('blur', function() {
        var patterns = $(this).val().split('\n');
        var validPatterns = [];
        var hasInvalid = false;
        
        for (var i = 0; i < patterns.length; i++) {
            var pattern = patterns[i].trim();
            if (pattern === '') continue;
            
            // Check for dangerous characters
            if (pattern.match(/[`$|&;()<>{}]/)) {
                hasInvalid = true;
                continue;
            }
            
            validPatterns.push(pattern);
        }
        
        if (hasInvalid) {
            showTemporaryMessage('Some file patterns contained invalid characters and were removed.', 'warning');
            $(this).val(validPatterns.join('\n'));
        }
    });
});