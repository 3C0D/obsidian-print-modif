# Print

The Print plugin adds print functionality to your Obsidian workspace. You can activate the print action from the command palette, the printer ribbon or by right-clicking a note. If you like it or find it useful, please consider give it a [star ![GitHub Repo stars](https://img.shields.io/github/stars/marijnbent/obsidian-print?style=social)](https://github.com/marijnbent/obsidian-print) on Github.

https://github.com/user-attachments/assets/5882f08c-19e6-46da-b808-608b95376979

*Screen recording of the plugin in use.*

## Features

- **Print notes**: Simply but effective. Activate the print action via the command palette, the printer ribbon or by right-clicking a note.
- **Print all notes in a folder**: Right-click on a folder or use the command palette to print all notes in a folder.

You can also add a shortcut to the print action for even quicker access.

| | |
|:------:|:-------------------------:|
|![image](https://github.com/user-attachments/assets/8ba2959c-20a2-4cab-8ae7-c2f5f2475217)|![image](https://github.com/user-attachments/assets/ddb54bd0-4b58-410f-9d69-0f6a58b2ddfd)

## Support

If you are enjoying this plugin then please support my work and enthusiasm by buying me a coffee
on [https://www.buymeacoffee.com/marijnbent](https://www.buymeacoffee.com/marijnbent).

<a href="https://www.buymeacoffee.com/marijnbent"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=marijnbent&button_colour=6495ED&font_colour=ffffff&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00"></a>

## Getting Started

### Install from the Community Plugin Store

1. Open Obsidian and go to **Settings** > **Community plugins**.
2. Click on **Browse** and search for **Print**.
3. Click **Install** to add the plugin to your Obsidian setup.
4. Once installed, enable the plugin and optionally go to the settings page.

If you print often, you probably want to add a shortcode to the print action. Go to **Settings** > **Hotkeys**, search for 'print' and bind your preferred shortcut. 

## Settings

- **Include note title**: Enable to print the title.
- **Font size**: Adjust the font sizes through the settings panel.
- **Combine folder notes**: Enable to remove page breaks between notes when printing all notes from a folder.
- **Debug mode**: Use this to preview and fix styling issues by viewing your notes content in the print window.

![image](https://github.com/user-attachments/assets/2ffed185-cc8f-43d9-8444-7cb9657d61f7)

## Customize CSS

You can customize the appearance of your printed notes in two ways:

### 1. Built-in Settings
- Adjust font sizes for text and all heading levels
- Set custom colors for each heading level
- Import colors directly from your current theme using the "Get theme colors" button
- Toggle title visibility and page breaks

### 2. Custom CSS Snippet
To add your own custom styles:
1. Go to Settings > Appearance > CSS snippets (or click the folder icon in plugin settings)
2. Create a new file named `print.css`
3. Add your custom styles using the `.obsidian-print` prefix
4. Enable the snippet in CSS snippets
5. Enable "Custom CSS" in plugin settings

Example of custom styles:
```css
.obsidian-print strong {
    color: #452d48b2 !important;
}

.obsidian-print a {
    font-weight: 600;
}