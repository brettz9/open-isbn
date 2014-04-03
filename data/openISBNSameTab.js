// openISBNSameTab.js - Open ISBN's module
/*globals self*/

(function () {'use strict';

function strip(str) {
    return str.replace(/(\s|\-)/g, '');
}

self.on('context', function (node) {
    return (/[\d\-\s]{10}/).test(strip(node.href || window.getSelection().toString()));
});
self.on('click', function (node, data) {
    var href = strip(node.href || window.getSelection().toString()).replace(
    /[\s\S]*?([\d\-\s]{13}|[\d\-\s]{10})[\s\S]*$/,
        'http://www.amazon.com/gp/search/?ie=UTF8&Adv-Srch-Books-Submit.y=0&sort=relevanceexprank&search-alias=stripbooks&tag=wiki-addon-20' +
        '&linkCode=ur2&unfiltered=1&camp=1789&Adv-Srch-Books-Submit.x=0&field-dateop=&creative=390957&field-isbn=$1'
    );
    window.location.href = href;
});

}());
