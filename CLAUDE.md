# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutoFill Scout is a Chrome extension that automatically fills application forms with smart field matching using dynamic linguistic patterns and optionally AWS services for enhanced AI-powered field recognition.

## Architecture

### Core Components

1. **Content Script (`content.js`)**
   - Injected into web pages to detect and fill form fields
   - Contains `DynamicFieldMatcher` class for intelligent field recognition using n-grams, word features, and linguistic patterns
   - Handles form field detection, profile retrieval, and autofill operations
   - Communicates with background script via Chrome messaging

2. **Background Script (`background.js`)**
   - Manages extension installation and default settings
   - Minimal service worker for extension lifecycle

3. **Popup Interface (`popup.js`, `popup.html`)**
   - User control panel for triggering fills and managing settings
   - Handles script injection into active tabs
   - Manages passphrase-based encryption unlock for sessions

4. **Options Page (`options.js`, `options.html`)**
   - Profile data management interface
   - Supports both plaintext and encrypted storage
   - Integration with AWS services for profile syncing (when configured)

5. **AWS Service Integration (`aws_service.js`)**
   - Pluggable service layer for enhanced field matching
   - Currently in mock mode (`SERVICE_CONFIG.useMockService = true`)
   - Provides `FieldMatchingService` and `StorageService` classes
   - Switch to production by setting `useMockService: false` and configuring endpoints

6. **Encryption Module (`crypto.js`)**
   - WebCrypto-based AES-GCM encryption for profile data
   - PBKDF2 key derivation with configurable iterations
   - Session-based passphrase caching

## Key Features

- **Dynamic Field Matching**: Intelligent field recognition using linguistic patterns, n-grams, and Jaccard similarity
- **Encryption Support**: Optional AES-GCM encryption for stored profiles
- **AWS Integration Ready**: Switchable between mock and production AWS services
- **Content Script Injection**: On-demand script injection for compatibility
- **Session Storage**: Secure passphrase caching for browser sessions

## Development Commands

Since this is a Chrome extension without a build process:

1. **Load Extension**: 
   - Open Chrome Extensions page (chrome://extensions/)
   - Enable Developer mode
   - Click "Load unpacked" and select this directory

2. **Test Changes**:
   - Make code changes
   - Click "Reload" button on the extension card in chrome://extensions/

3. **Debug**:
   - Background script: Click "service worker" link on extension card
   - Content script: Open DevTools on any webpage
   - Popup: Right-click extension icon → "Inspect popup"

## AWS Service Configuration

To enable production AWS services:

1. Edit `SERVICE_CONFIG` in `aws_service.js`
2. Set `useMockService: false`
3. Configure real endpoints:
   - `apiEndpoint`: Your API Gateway URL
   - `apiKey`: Your API key
   - AWS endpoints (comprehend, sagemaker, personalize)

## Important Patterns

- **Field Matching Logic**: The `DynamicFieldMatcher` class uses multiple signals:
  - Autocomplete attributes (highest priority)
  - Exact keyword matches
  - Linguistic pattern recognition
  - N-gram similarity scoring
  - Context analysis from labels and placeholders

- **Storage Strategy**: 
  - Profiles stored in `chrome.storage.local`
  - Encrypted profiles use `af_profile_enc` key
  - Session passphrases in `chrome.storage.session`

- **Message Types**:
  - `AF_FILL_NOW`: Trigger autofill
  - `AF_LIST_FIELDS`: Debug field detection
  - `AF_TOGGLE_ENABLED`: Toggle autofill state