# Cache Busting Guide for GitHub Pages

## Problem
When you push changes to GitHub Pages, browsers may cache old versions of your CSS and JavaScript files, causing your site to show outdated content even after refreshing.

## Solution Implemented
I've added cache-busting query parameters to your CSS and JavaScript files in `index.html`. This forces browsers to fetch fresh versions of your files when the version number changes.

## How to Use

### When You Make Changes to CSS or JavaScript:
1. Update the version number in `index.html` on **both** of these lines:
   - Line 49: `<link rel="stylesheet" href="styles.css?v=2.0.1">`
   - Line 615: `<script src="script-secure.js?v=2.0.1"></script>`

2. Increment the version number (e.g., from `2.0.1` to `2.0.2`, or `2.0.2` to `2.1.0`)

3. Commit and push your changes:
   ```bash
   git add index.html styles.css script-secure.js
   git commit -m "Update website with cache-busting version 2.0.2"
   git push origin main
   ```

### Quick Version Update Examples:
- Minor fix: `2.0.1` → `2.0.2`
- Feature update: `2.0.2` → `2.1.0`
- Major update: `2.1.0` → `3.0.0`

## Additional Cache Control
Meta tags have been added to the HTML head to help prevent caching of the HTML file itself:
- `Cache-Control: no-cache, no-store, must-revalidate`
- `Pragma: no-cache`
- `Expires: 0`

## Testing After Deployment

### Method 1: Hard Refresh
- **Chrome/Firefox (Mac)**: `Cmd + Shift + R`
- **Chrome/Firefox (Windows/Linux)**: `Ctrl + Shift + R`
- **Safari**: `Cmd + Option + R`

### Method 2: Incognito/Private Mode
Open your GitHub Pages site in an incognito/private browser window to see the fresh version without cached files.

### Method 3: Clear Browser Cache
1. Open browser developer tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

## Important Notes

1. **Always update both version numbers together** - Keep them synchronized
2. **Wait 1-2 minutes** after pushing to GitHub before testing - GitHub Pages needs time to rebuild
3. **Test in incognito mode** first to verify the changes are live
4. **Don't use timestamps** - Use version numbers that you increment manually for better control

## Troubleshooting

If you still see old content after updating the version:
1. Verify the version number was updated in both places in `index.html`
2. Confirm your changes were pushed to GitHub
3. Wait 2-3 minutes for GitHub Pages to rebuild
4. Clear your browser cache completely
5. Try accessing from a different device or network

## Future Enhancement

Consider automating this with a build script that increments the version automatically, or use a timestamp-based approach if you deploy frequently.

