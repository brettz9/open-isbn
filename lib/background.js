import '../polyfills/browser-polyfill.min.js';

/**
 * @param {...any} args
 * @returns {string}
 */
function _ (...args) {
    return browser.i18n.getMessage(...args);
}

/**
 * @param {string} str
 * @returns {string}
 */
function stripExtraISBN (str) {
    return str.replaceAll(/[\s\-]/gv, '');
}

browser.runtime.onConnect.addListener((portFromOptions) => {
    portFromOptions.onMessage.addListener(async (/* m */) => {
        await updateContextMenus();
    });
});

// Get around eslint-config-standard limitation on "exported" directive
//   by exporting as follows:
//   https://github.com/standard/standard/issues/614
const updateContextMenus = async function () {
    await Promise.all([
        ['open_isbn_amazon', 'Open_ISBN_at_Amazon'],
        ['open_isbn_amazon_new_tab', 'Open_ISBN_at_Amazon_new_tab']
    ].map(async ([menuID, menuI18nKey, {
        contexts
    } = {contexts: ['selection', 'link']}]) => {
        try { // Errs at least in Chrome when not present
            await browser.contextMenus.remove(menuID);
        } catch (err) {}
        let enabled = true;
        try {
            ({['pref_' + menuID]: enabled = true} =
                await browser.storage.local.get('pref_' + menuID));
        } catch (err) {}
        if (enabled) {
            browser.contextMenus.create({
                id: menuID,
                title: _(menuI18nKey),
                contexts
            });
        }
    }));
};

browser.runtime.onInstalled.addListener(updateContextMenus);

browser.contextMenus.onShown.addListener(async (info /* , tab */) => {
    const {linkText} = info;
    let selectionText;
    if (('selectionText' in info)) {
        ({selectionText} = info);
    } else {
        try {
            [selectionText] = await browser.scripting.executeScript({
                func: () => globalThis.getSelection().toString()
            });
        } catch (err) {
            // eslint-disable-next-line no-console -- Debugging
            console.log('err', err);
        }
    }

    if (!linkText && !selectionText) {
        return;
    }

    const isbn = linkText || selectionText;
    const isISBN = (/[\d\-\s]{10}/v).test(stripExtraISBN(isbn));
    await updateContextMenus();
    if (!isISBN) {
        await Promise.all([
            browser.contextMenus.remove('open_isbn_amazon'),
            browser.contextMenus.remove('open_isbn_amazon_new_tab')
        ]);
    }

    browser.contextMenus.refresh();
});

browser.contextMenus.onClicked.addListener(
    async ({linkText, menuItemId, selectionText}, tab) => {
        if (![
            'open_isbn_amazon',
            'open_isbn_amazon_new_tab'
        ].includes(menuItemId)) {
            return;
        }

        const isbn = linkText || selectionText;
        const isISBN = (/[\d\-\s]{10}/v).test(stripExtraISBN(isbn));
        if (!isISBN) {
            return; // Shouldn't get here
        }

        const newURL = stripExtraISBN(isbn).replace(
            // eslint-disable-next-line prefer-named-capture-group -- Convenient
            /[\s\S]*?([\d\-\s]{13}|[\d\-\s]{10})[\s\S]*$/v,
            'https://www.amazon.com/gp/search/?ie=UTF8&Adv-Srch-Books-Submit.y=0&sort=relevanceexprank&search-alias=stripbooks&tag=wiki-addon-20' +
            // eslint-disable-next-line @stylistic/max-len -- Long
            '&linkCode=ur2&unfiltered=1&camp=1789&Adv-Srch-Books-Submit.x=0&field-dateop=&creative=390957&field-isbn=$1'
        );

        await (menuItemId.endsWith('new_tab')
            ? browser.tabs.create({
                // Of what use is there to indicate the opener like this?
                openerTabId: tab.id,
                active: true,
                url: newURL
            })
            : browser.tabs.update(tab.id, {
                url: newURL
            }));
    }
);
