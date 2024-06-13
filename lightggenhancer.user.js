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
// ==/UserScript==

(function() {
    'use strict';

    // transform item words in review to chs and tooltip trigger
    function transformReviewItems() {
        function modifyReviewResponse() {
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
                                    modifiedText = modifiedText.replace(new RegExp(itemList[key]['en'], "ig"),
                                        '<span translate=\\"no\\" style=\\"color:dodgerblue;font-weight:bold;\\" class=\\"item show-hover notranslate\\" data-id=\\"' + key + '\\">'
                                        + (itemList[key][lang] ? itemList[key][lang] : itemList[key]['en'])
                                        + '</span>');
                                }
                            });
                            console.log('Review transformed!');
                            Object.defineProperty(this, 'response', {writable: true});
                            Object.defineProperty(this, 'responseText', {writable: true});
                            this.response = this.responseText = modifiedText;
                        }
                    });
                }
                return realOpen.apply(this, arguments);
            };
        }
        var script = document.createElement("script");
        script.textContent =
            "window.itemList = " + GM_getResourceText('itemList') + ";\n\n " +
            "(" + modifyReviewResponse.toString() + ")();";
        document.body.appendChild(script);
    }

    transformReviewItems();
})();
