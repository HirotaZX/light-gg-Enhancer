// ==UserScript==
// @name                light.gg Enhancer
// @name:zh             light.gg 功能增强
// @name:zh-CN          light.gg 功能增强
// @namespace           https://github.com/HirotaZX
// @version             0.1.0
// @description         light.gg Enhancer.
// @description:zh      light.gg 功能增强。
// @description:zh-CN   light.gg 功能增强。
// @author              HirotaZX
// @match               https://www.light.gg/*
// @resource itemList   https://light-gg-enhancer.hirotazx.com/item-list.json?v=202406140236
// @grant               GM_getResourceText
// @downloadURL https://update.greasyfork.org/scripts/497836/lightgg%20Enhancer.user.js
// @updateURL https://update.greasyfork.org/scripts/497836/lightgg%20Enhancer.meta.js
// ==/UserScript==

(function() {
    'use strict';

    // transform item words in review to chs and tooltip trigger
    function transformReviewItems() {
        var itemElms = document.querySelectorAll('.item.show-hover');
        var langStr = window.location.pathname.match(/\/db\/(.*)\/items/);
        var lang = langStr ? langStr[1] : 'en';

        var reviewUrlRegex = /api.light.gg\/items\/\d*\/reviews/;
        var realOpen = window.XMLHttpRequest.prototype.open;
        window.XMLHttpRequest.prototype.open = function() {
            var url = arguments['1'];
            if (reviewUrlRegex.test(url)) {
                this.addEventListener('readystatechange', function(e) {
                    if (this.readyState === 4) {
                        var originalText = e.target.responseText;
                        var modifiedText = originalText;
                        itemElms.forEach(function(item) {
                            var key = item.dataset.id;
                            if(itemList[key] && itemList[key]['en'] && itemList[key]['en'].trim()) {
                                var newName = itemList[key][lang] ? itemList[key][lang] : itemList[key]['en'];
                                console.log(newName)
                                modifiedText = modifiedText.replace(new RegExp(itemList[key]['en'], "ig"),
                                    '<span translate=\\"no\\" style=\\"color:dodgerblue;font-weight:bold;\\" class=\\"item show-hover notranslate\\" data-id=\\"' + key + '\\">'
                                    + newName.replaceAll('"', '\\"')
                                    + '</span>');
                            }
                        });
                        Object.defineProperty(this, 'response', {writable: true});
                        Object.defineProperty(this, 'responseText', {writable: true});
                        this.response = this.responseText = modifiedText;
                        console.log('【light.gg Enhancer】Review transformed!');
                    }
                });
            }
            return realOpen.apply(this, arguments);
        };
    }

    // remember locale
    function persistLocale() {
        var localeStr = window.location.pathname.match(/\/db\/(.*)\/items|\/db\/items/);
        if(!localeStr || !localeStr[0]) {
            console.log('【light.gg Enhancer】None item page.');
            return;
        }
        initLocale();
        listenLocaleChange();

        // redirect to saved locale on enter item page
        function initLocale() {
            var savedLocale = window.localStorage.getItem("enhancer-locale");
            console.log('【light.gg Enhancer】Saved locale: ' + savedLocale);

            var curLocale = localeStr[1];
            if(curLocale) {
                if(savedLocale) {
                    if(savedLocale != curLocale) {
                        window.location.replace(window.location.pathname.replace(/\/db\/.*\/items/, '/db/' + savedLocale + '/items'));
                        console.log('【light.gg Enhancer】Redirect to saved locale: ' + savedLocale);
                    }
                } else {
                    window.localStorage.setItem("enhancer-locale", curLocale);
                    console.log('【light.gg Enhancer】Locale ' + curLocale + ' saved!');
                }
            } else {
                if(savedLocale && savedLocale != 'en') {
                    window.location.replace(window.location.pathname.replace(/\/db\/items/, '/db/' + savedLocale + '/items'));
                    console.log('【light.gg Enhancer】Redirect to saved locale: ' + savedLocale);
                }
            }
        }

        // save locale on click locale icon
        function listenLocaleChange() {
            var localeLinks = document.querySelectorAll('#localemodal a, #sidebar-locales a');
            localeLinks.forEach(function(link) {
                link.dataset.href = link.href;
                link.href = 'javascript:void(0);';
                link.addEventListener('click', handleLocaleClick);
            });

            function handleLocaleClick(e) {
                var elm = e.currentTarget;
                if(elm.dataset && elm.dataset.href) {
                    var elmLocale = 'en';
                    var elmLocaleStr = elm.dataset.href.match(/\/db\/(.*)\/items|\/db\/items/);
                    if(elmLocaleStr && elmLocaleStr[1]) {
                        elmLocale = elmLocaleStr[1];
                    }
                    window.localStorage.setItem("enhancer-locale", elmLocale);
                    console.log('【light.gg Enhancer】Locale ' + elmLocale + ' saved!');
                    window.location.replace(elm.dataset.href);
                }
            }
        }
    }

    // append script to page
    var script = document.createElement("script");
    script.textContent =
        "window.itemList = " + GM_getResourceText('itemList') + ";\n\n "
         + "(" + transformReviewItems.toString() + ")();\n\n"
         + "(" + persistLocale.toString() + ")();\n\n";
    document.body.appendChild(script);
})();
