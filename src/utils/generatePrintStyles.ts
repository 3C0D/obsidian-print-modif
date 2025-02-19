import { App, Notice, PluginManifest } from "obsidian";
import { PrintPluginSettings } from "src/types";
import { CustomCSS } from "obsidian-typings";

/**
 * Generates CSS styles for printing, combining plugin styles, user snippets, and some styles settings
 */
export async function generatePrintStyles(
    app: App,
    manifest: PluginManifest,
    settings: PrintPluginSettings
): Promise<string> {
    const adapter = app.vault.adapter;

    // Read plugin stylesheet
    let pluginStyle = '';
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

    // Read user print stylesheet (optional)
    const userStyle =
        getPrintSnippet(app) && isPrintSnippetEnabled(app)
            ? getPrintSnippetValue(app) ?? ''
            : '';

    // Generate CSS for headings with sizes and colors from settings
    const headingsCSS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
        .map((tag) => {
            const sizeKey = `${tag}Size` as keyof PrintPluginSettings;
            const colorKey = `${tag}Color` as keyof PrintPluginSettings;
            return `.obsidian-print ${tag} { font-size: ${settings[sizeKey]}; color: ${settings[colorKey]}; }`;
        })
        .join('\n');

    // Final combined CSS - Remove the forced black color directive
    return `
        .obsidian-print { font-size: ${settings.fontSize}; }
        ${headingsCSS}
        ${settings.hrPageBreaks ? '.obsidian-print hr { page-break-before: always; border: none; }' : ''}
        ${pluginStyle}
        ${userStyle}
    `;
}

function getPrintSnippetValue(app: App): string | undefined {
    const printCssPath = ".obsidian/snippets/print.css";
    return app.customCss.csscache.get(printCssPath);
}

export function isPrintSnippetEnabled(app: App): boolean {
    return app.customCss.enabledSnippets.has("print");
}

export function getPrintSnippet(app: App): boolean {
    return app.customCss.snippets.contains("print");
}

//------ Find headers css ------------------------

/**
 * Gets all header colors from the current theme, handling dark mode
 */
export function getHeadersCSS(app: App): Map<number, string> {
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

/**
 * Gets the custom CSS from the active Obsidian theme
 * Uses Obsidian's customCSS API to access theme styles
 */
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
        const directStyleRegex = /(?:\.cm-header-(\d)|\.markdown-preview-view\s+h(\d))(?:[^{]*,\s*[^{]*)*{[^}]*?color:\s*([^;]+)/g;
        while ((match = directStyleRegex.exec(content)) !== null && foundHeaders < 6) {
            const level = parseInt(match[1] || match[2]);
            const color = match[3].trim();
            if (level >= 1 && level <= 6) {
                headerColors.set(level, color);
                foundHeaders++;
            }
        }
    }

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
            } else if (variableName.startsWith('rgb')) {
                return rgbToHex(variableName);
            } else { // e.g "red"
                temp.style.color = variableName;
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
