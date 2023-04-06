/* eslint-env webextensions */
'use strict';

import '../polyfills/browser-polyfill.min.js';

function _ (...args) {
    return browser.i18n.getMessage(...args);
}

function stripExtraISBN (str) {
    return str.replace(/(\s|-)/g, '');
}

browser.runtime.onConnect.addListener(async (portFromOptions) => {
    portFromOptions.onMessage.addListener(async (m) => {
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
    ].map(async ([menuID, menuI18nKey, {contexts} = {contexts: ['selection', 'link']}]) => {
        try { // Errs at least in Chrome when not present
            await browser.contextMenus.remove(menuID);
        } catch (err) {}
        let enabled = true;
        try {
            ({['pref_' + menuID]: enabled = true} = await browser.storage.local.get('pref_' + menuID));
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

// Todo: Remove the first condition once Firefox 60+ is widespread
browser.contextMenus.onShown && browser.contextMenus.onShown.addListener(async (info /* , tab */) => {
    const {linkText} = info;
    let selectionText;
    if (('selectionText' in info)) {
        ({selectionText} = info);
    } else {
        try {
            [selectionText] = await browser.scripting.executeScript({
                func: () => window.getSelection().toString()
            });
        } catch (err) {
            console.log('err', err);
        }
    }

    if (!linkText && !selectionText) {
        return;
    }

    const isbn = linkText || selectionText;
    const isISBN = (/[\d\-\s]{10}/).test(stripExtraISBN(isbn));
    await updateContextMenus();
    if (!isISBN) {
        await Promise.all([
            browser.contextMenus.remove('open_isbn_amazon'),
            browser.contextMenus.remove('open_isbn_amazon_new_tab')
        ]);
    }

    browser.contextMenus.refresh();
});

browser.contextMenus.onClicked.addListener(async ({linkText, menuItemId, selectionText}, tab) => {
    if (![
        'open_isbn_amazon',
        'open_isbn_amazon_new_tab'
    ].includes(menuItemId)) {
        return;
    }

    const isbn = linkText || selectionText;
    const isISBN = (/[\d\-\s]{10}/).test(stripExtraISBN(isbn));
    if (!isISBN) {
        return; // Shouldn't get here
    }

    const newURL = stripExtraISBN(isbn).replace(
        /[\s\S]*?([\d\-\s]{13}|[\d\-\s]{10})[\s\S]*$/,
        'http://www.amazon.com/gp/search/?ie=UTF8&Adv-Srch-Books-Submit.y=0&sort=relevanceexprank&search-alias=stripbooks&tag=wiki-addon-20' +
        '&linkCode=ur2&unfiltered=1&camp=1789&Adv-Srch-Books-Submit.x=0&field-dateop=&creative=390957&field-isbn=$1'
    );

    if (menuItemId.endsWith('new_tab')) {
        await browser.tabs.create({
            openerTabId: tab.id, // Of what use is there to indicate the opener like this?
            active: true,
            url: newURL
        });
    } else {
        await browser.tabs.update(tab.id, {
            url: newURL
        });
    }
});
