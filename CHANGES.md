# 0.3.0

- Move to webextensions
- Enhancement: Only inject context menu on ISBN formatted links and selections
- Enhancement: For Firefox 60+, besides avoiding injecting context menu items
    on non-ISBN links (`all_urls` host permissions are unfortunately needed
    for this since we need to inject a script to get the selection since
    `selectionText` is not being supplied in `onShown`)
- Linting: Use eslint-config-standard, .remarkrc for Markdown
- npm: Add ESLint devDeps, and scripts for copying dependencies (Jamilih,
    webextension-polyfill)
- npm: Specify scripts for running specific versions of Firefox
- Yarn: Add `yarn.lock`

# 0.2.0

- Add support for private window browsing

# 0.1.1

- jpm packaging

# 0.1.0

- Internationalized
