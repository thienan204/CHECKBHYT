const { XMLParser } = require('fast-xml-parser');

const xmlContent = `
<root>
    <item>
        <ID>1</ID>
        <MA_TTDV></MA_TTDV>
        <NORMAL>Value</NORMAL>
    </item>
    <item>
        <ID>2</ID>
        <MA_TTDV />
        <NORMAL>Value2</NORMAL>
    </item>
    <item>
        <ID>3</ID>
        <NORMAL>Value3</NORMAL>
    </item>
</root>
`;

const parser = new XMLParser({
    ignoreAttributes: false,
    cdataPropName: "__cdata",
    trimValues: true,
    parseTagValue: false,
});

const result = parser.parse(xmlContent);
console.log(JSON.stringify(result, null, 2));

const items = Array.isArray(result.root.item) ? result.root.item : [result.root.item];
items.forEach((item, idx) => {
    console.log(`Item ${idx + 1}:`);
    console.log(`  MA_TTDV key exists?`, 'MA_TTDV' in item);
    console.log(`  MA_TTDV value:`, item.MA_TTDV);
    console.log(`  Type:`, typeof item.MA_TTDV);
});
