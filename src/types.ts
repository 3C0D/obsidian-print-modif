export interface PrintPluginSettings {
    printTitle: boolean;
    fontSize: string;
    h1Size: string;
    h2Size: string;
    h3Size: string;
    h4Size: string;
    h5Size: string;
    h6Size: string;
    h1Color: string;
    h2Color: string;    
    h3Color: string;
    h4Color: string;
    h5Color: string;
    h6Color: string;
    hasInitializedColors: boolean;  // to track if colors were initialized
    combineFolderNotes: boolean;
    hrPageBreaks: boolean;
}

export const DEFAULT_SETTINGS: PrintPluginSettings = {
    printTitle: true,
    fontSize: '14px',
    h1Size: '20px',
    h2Size: '18px',
    h3Size: '16px',
    h4Size: '14px',
    h5Size: '14px',
    h6Size: '12px',
    h1Color: 'black',
    h2Color: 'black',
    h3Color: 'black',        
    h4Color: 'black',
    h5Color: 'black',
    h6Color: 'black',
    hasInitializedColors: false,
    combineFolderNotes: false,
    hrPageBreaks: false,
};