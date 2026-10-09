import {readFileSync,writeFileSync} from 'node:fs';
const palette=JSON.parse(readFileSync(new URL('green-palette.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
const variables=palette.tokens.map(t=>`  --${t.name}: ${t.light};`).join('\n');
writeFileSync(new URL('green-tokens.css',import.meta.url),`:root {\n${variables}\n}\n`);
let html=readFileSync(new URL('constructor.html',import.meta.url),'utf8');
html=html.replace('03 · Конструктор полезных систем |','04 · Лесной зелёный |').replace('<body class="clay">','<body class="clay green">').replace('<link rel="stylesheet" href="styles.css">','<link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="green-tokens.css"><link rel="stylesheet" href="green.css">').replace('href="constructor.html" aria-current="page"','href="constructor.html"').replace('03 · Терракотовый</a></nav>','03 · Терракотовый</a><a href="green.html" aria-current="page">04 · Зелёный</a></nav>');
writeFileSync(new URL('green.html',import.meta.url),html);
console.log(JSON.stringify({adjusted:palette.tokens.filter(t=>t.contrast?.light?.adjusted).map(t=>t.name),brand:palette.tokens.find(t=>t.name==='bg-brand-active').light}));
