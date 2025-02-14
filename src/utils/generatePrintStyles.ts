import { App, Notice, PluginManifest } from "obsidian";
import { PrintPluginSettings } from "src/types";
import { CustomCSS } from "obsidian-typings";

/**
 * Retrieves styles.css from plugin and the optional print.css snippet. 
 * Add font size styles from settings and return a css string.
 * 
 * @param app 
 * @param manifest 
 * @param settings 
 * @returns 
 */
export async function generatePrintStyles(app: App, manifest: PluginManifest, settings: PrintPluginSettings): Promise<string> {
    const adapter = app.vault.adapter;

    let pluginStyle = '';
    let userStyle = '';

    if (manifest.dir) {
        const cssPath = `${manifest.dir}/styles.css`;
        try {
            pluginStyle = await adapter.read(cssPath);
        } catch (error) {
            new Notice('Default styling could not be located.');
        }
    } else {
        new Notice('Could not find the plugin path. No default print styles will be added.');
    }

    // Read user styles (optional)
    // Only include if the print.css is activated and still exists.
    if (getPrintSnippet(app) && isPrintSnippetEnabled(app)) {
        userStyle = getPrintSnippetValue(app) ?? '';
    }

    return `
        body { font-size: ${settings.fontSize}; }
        h1 { font-size: ${settings.h1Size}; }
        h2 { font-size: ${settings.h2Size}; }
        h3 { font-size: ${settings.h3Size}; }
        h4 { font-size: ${settings.h4Size}; }
        h5 { font-size: ${settings.h5Size}; }
        h6 { font-size: ${settings.h6Size}; }
        h1 { color: ${settings.h1Color}; }
        h2 { color: ${settings.h2Color}; }
        h3 { color: ${settings.h3Color}; }
        h4 { color: ${settings.h4Color}; }
        h5 { color: ${settings.h5Color}; }
        h6 { color: ${settings.h6Color}; }
        hr { page-break-before: ${settings.hrPageBreaks ? 'always' : 'auto'}; border-width: ${settings.hrPageBreaks ? '0' : 'revert-layer'}; }
        ${pluginStyle}
        ${userStyle}
    `;
}


function getPrintSnippetValue(app: App,): string | undefined {
    const printCssPath = ".obsidian/snippets/print.css";
    return app.customCss.csscache.get(printCssPath);
}


export function isPrintSnippetEnabled(app: App): boolean {
    return app.customCss.enabledSnippets.has("print")
}

export function getPrintSnippet(app: App): boolean {
    return app.customCss.snippets.contains("print");
}


//------ Find headers css ------------------------


/**
 * Gets all header colors from the current theme, handling dark mode
 */
export function getHeadersCSS(app: App) {
    const css = getCustomCSS(app);
    const headerColors = extractHeaderColors(css);
    const isDark = isDarkMode();

    const realColors = new Map<number, string>();
    headerColors.forEach((color, level) => {
        const realColor = getCSSVariableValue(color, isDark);
        realColors.set(level, realColor);
    });

    return realColors;
}

export function getCustomCSS(app: App): string {
    const theme = app.customCss.theme;
    return app.customCss.csscache.get(`.obsidian/themes/${theme}/theme.css`) ?? '';
}

function extractHeaderColors(content: string): Map<number, string> {
    const headerColors = new Map<number, string>();
    let foundHeaders = 0;

    // First pass: detect CSS variables (--h1-color...)
    const variableRegex = /--h(\d)-color:\s*([^;]+);/g;
    let match;

    while ((match = variableRegex.exec(content)) !== null && foundHeaders < 6) {
        const [, level, color] = match;
        const headerLevel = parseInt(level);
        if (headerLevel >= 1 && headerLevel <= 6) {
            headerColors.set(headerLevel, color.trim());
            foundHeaders++;
        }
    }

    // Else second pass: detect direct header styles
    // Match .cm-header-N or .markdown-preview-view h1-h6 selectors
    if (foundHeaders === 0) {
        const directStyleRegex = /(?:\.cm-header-(\d)|\.markdown-preview-view\s+h(\d))(?:[^{]*,\s*[^{]*)*{[^}]*?color:\s*([^;]+)/g; while ((match = directStyleRegex.exec(content)) !== null && foundHeaders < 6) {
            const level = parseInt(match[1] || match[2]);
            const color = match[3].trim();
            if (level >= 1 && level <= 6) {
                headerColors.set(level, color);
                foundHeaders++;
            }
        }
    }
    console.log("headerColors", headerColors)
    return headerColors;
}


export function isDarkMode(): boolean {
    return document.body.classList.contains('theme-dark');
}

/**
 * Gets the computed color value for a CSS variable, handling dark mode conversion
 */
export function getCSSVariableValue(variableName: string, isDark: boolean): string {
    return temporaryThemeSwitch(isDark, () => {
        const temp = document.createElement('div');
        document.body.appendChild(temp);

        try {
            if (variableName.startsWith('var(')) {
                temp.style.color = variableName;
            } else if (variableName.startsWith('#')) {
                return variableName;
            } 
            else if (variableName.startsWith('rgb')) {
                return rgbToHex(variableName);
            }
            else { // e.g "red"
                temp.style.color = variableName
            }

            const computedColor = window.getComputedStyle(temp).color;
            return rgbToHex(computedColor);
        } finally {
            document.body.removeChild(temp);
        }
    });
}

/**
 * Temporarily switches theme to light mode if darkmode and executes a callback.
 */
function temporaryThemeSwitch(isDark: boolean, callback: () => string): string {
    const body = document.body;
    const wasDark = isDarkMode();

    try {
        // Only switch if we're in dark mode and need to switch
        if (wasDark && isDark) {
            body.classList.remove('theme-dark');
            body.classList.add('theme-light');
        }

        // Execute the callback to get the color
        const result = callback();

        return result;
    } finally {
        // Always restore the original theme
        if (wasDark && isDark) {
            body.classList.remove('theme-light');
            body.classList.add('theme-dark');
        }
    }
}

export function rgbToHex(rgb: string): string {
    const values = rgb.match(/\d+/g);
    if (!values) return rgb;

    const r = parseInt(values[0]).toString(16).padStart(2, '0');
    const g = parseInt(values[1]).toString(16).padStart(2, '0');
    const b = parseInt(values[2]).toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
}





