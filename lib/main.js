// This is an active module of the Open ISBN Add-on

/*globals exports, require*/

(function () {'use strict';

// todo: add unload

exports.main = function() {
    var
        _ = require('sdk/l10n').get,
        contextMenu = require('sdk/context-menu'),
        tabs = require('sdk/tabs'),
        data = require('sdk/self').data;
    
    contextMenu.Item({
        label: _("Open_ISBN_at_Amazon"),
        context: contextMenu.SelectorContext('a[href]'),
        contentScriptFile: data.url('openISBNSameTab.js')
    });

    // Multiple contexts not working in an array, so respecifying here
    contextMenu.Item({
        label: _("Open_ISBN_at_Amazon_new_tab"),
        context: contextMenu.SelectorContext('a[href]'),
        contentScriptFile: data.url('openISBNNewTab.js'),
        onMessage: function (href) {
            tabs.open(href);
        }
    });

    contextMenu.Item({
        label: _("Open_ISBN_at_Amazon"),
        context: contextMenu.SelectionContext(),
        contentScriptFile: data.url('openISBNSameTab.js')
    });
    
    contextMenu.Item({
        label: _("Open_ISBN_at_Amazon_new_tab"),
        context: contextMenu.SelectionContext(),
        contentScriptFile: data.url('openISBNNewTab.js'),
        onMessage: function (href) {
            tabs.open(href);
        }
    });

};

}());
