/* eslint-env browser, webextensions */
import jml from './jml.js';

function _ (...args) {
    return browser.i18n.getMessage(...args);
}

document.title = _('extensionName'); // If switch to tabs
(async () => {
jml('section', await Promise.all([
    // Todo: Allow user choice of one or more extra items
    ['pref_open_isbn_amazon'],
    ['pref_open_isbn_amazon_new_tab']
].map(async ([preferenceKey]) => {
    let enabled = true;
    try {
        ({[preferenceKey]: enabled = true} = await browser.storage.local.get(preferenceKey));
    } catch (err) {}
    return ['label', [
        ['input', {
            type: 'checkbox',
            checked: enabled,
            $on: {
                change: async ({target}) => {
                    await browser.storage.local.set({
                        [preferenceKey]: target.checked
                    });
                    const backgroundPage = browser.extension.getBackgroundPage();
                    backgroundPage.updateContextMenus();
                }
            }
        }],
        ' ',
        _(preferenceKey + '_title'),
        ['section', {class: 'addon-description'}, [
            _(preferenceKey + '_description')
        ]],
        ['br']
    ]];
})), document.body);
})();
