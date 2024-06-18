import { fetch } from 'undici'
import * as fs from 'node:fs/promises';
import aliasList from './alias.js';

const langList = ['en', 'fr', 'es', 'es-mx', 'de', 'it', 'ja', 'pt-br', 'ru', 'pl', 'ko', 'zh-cht', 'zh-chs'];
const itemFilter = [1, 20, 59]; // [weapon, armor, mods]
const itemDefineList = {};

const manifestResp = await fetch('https://www.bungie.net/Platform/Destiny2/Manifest/');
const manifest = await manifestResp.json();

for (const lang of langList) {
    const itemDefinePath = manifest.Response.jsonWorldComponentContentPaths[lang].DestinyInventoryItemLiteDefinition;
    console.log(itemDefinePath);
    const itemDefineResp = await fetch('https://www.bungie.net' + itemDefinePath);
    const itemDefine = await itemDefineResp.json();
    itemDefineList[lang] = itemDefine;
    console.log(lang + ' done');
}

const combinedItemList = {};

for(const key in itemDefineList[langList[0]]) {
    const item = itemDefineList[langList[0]][key];
    // filter items, only keep weapon, armor and mods
    if(item.itemCategoryHashes && item.itemCategoryHashes.some(hash => itemFilter.includes(hash))) {
        // only keep items have name
        if(item.displayProperties.name && item.displayProperties.name.trim()) {
            const combinedItemName = {};
            for (const lang of langList) {
                combinedItemName[lang] = itemDefineList[lang][key].displayProperties.name;
            }
            if(item.displayProperties.icon) {
                const iconHash = item.displayProperties.icon.match(/\/common\/destiny2_content\/icons\/(.*)/);
                combinedItemName.icon =  (iconHash && iconHash[1]) ? iconHash[1] : "";
            }
            itemFilter.some(type => {
                if(item.itemCategoryHashes.includes(type)) {
                    combinedItemName.type = type;
                    return true;
                }
            });
            combinedItemList[key] = combinedItemName;
        }
    }
}

for(const key in aliasList) {
    combinedItemList[key].alias = aliasList[key];
}

await fs.rm('dist', { recursive: true, force: true });
await fs.mkdir('dist', { recursive: true });
await fs.writeFile('dist/item-list.json', JSON.stringify(combinedItemList));
console.log('combine done! filtered and combined ' + Object.keys(combinedItemList).length + ' items!');