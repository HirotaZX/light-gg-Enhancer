import { fetch } from 'undici'
import * as fs from 'node:fs/promises';

const langList = ['en', 'zh-chs'];
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

const combinedItemList = [];

for(const key in itemDefineList[langList[0]]) {
    const combinedItem = {
        hash: key,
        name: {}
    };
    for (const lang of langList) {
        combinedItem.name[lang] = itemDefineList[lang][key].displayProperties.name;
    }
    combinedItemList.push(combinedItem);
}

await fs.rm('dist', { recursive: true, force: true });
await fs.mkdir('dist', { recursive: true });
await fs.writeFile('dist/item-list.json', JSON.stringify(combinedItemList));
console.log('combine done');