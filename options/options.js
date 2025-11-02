import {jml, body} from './jml.js';

/**
 * @param {string} arg
 * @returns {string}
 */
function _ (arg) {
    return browser.i18n.getMessage(arg);
}

const port = browser.runtime.connect({name: 'options-port'});

document.title = _('extensionName'); // If switch to tabs

jml('section', await Promise.all([
    // Todo: Allow user choice of one or more extra items
    ['pref_open_isbn_amazon'],
    ['pref_open_isbn_amazon_new_tab']
].map(async ([preferenceKey]) => {
    let enabled = true;
    try {
        enabled = /** @type {boolean} */ ((
            await browser.storage.local.get(preferenceKey)
        )[preferenceKey] ?? true);
    } catch (err) {}
    return /** @type {import('jamilih').JamilihArray} */ (['label', [
        ['input', {
            type: 'checkbox',
            checked: enabled,
            $on: {
                async change ({target}) {
                    await browser.storage.local.set({
                        [preferenceKey]: /** @type {HTMLInputElement} */ (
                            target
                        ).checked
                    });
                    // eslint-disable-next-line @stylistic/max-len -- Long
                    // eslint-disable-next-line unicorn/require-post-message-target-origin -- Webextensions
                    port.postMessage({message: 'updateContextMenus'});
                }
            }
        }],
        ' ',
        _(preferenceKey + '_title'),
        ['section', {class: 'addon-description'}, [
            _(preferenceKey + '_description')
        ]],
        ['br']
    ]]);
})), body);
