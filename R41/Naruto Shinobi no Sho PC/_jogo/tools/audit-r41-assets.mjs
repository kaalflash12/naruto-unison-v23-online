import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const outDir = path.join(root, 'audit');
const outFile = path.join(outDir, 'r41-assets.json');
const scanExt = new Set(['.js','.mjs','.cjs','.html','.css','.json']);
const quotedAsset = /['"`]((?:\.\/)?assets\/[^'"`?#\n\r]+?\.(?:png|jpe?g|webp|gif|svg|mp3|ogg|wav))(?=['"`?#])/gi;
const cssAsset = /url\(\s*['" ]*((?:\.\/)?assets\/[^\)'"?#\n\r]+?\.(?:png|jpe?g|webp|gif|svg|mp3|ogg|wav))['" ]*\)/gi;
const skipDirs = new Set(['node_modules','.git','audit']);

function walk(dir, files=[]){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(skipDirs.has(ent.name)) continue;
    const p=path.join(dir,ent.name);
    if(ent.isDirectory()) walk(p,files);
    else if(scanExt.has(path.extname(ent.name).toLowerCase())) files.push(p);
  }
  return files;
}
function cleanRef(ref){
  let s=String(ref||'').trim().replace(/^\.\//,'').replaceAll('\\','/');
  try{s=decodeURIComponent(s);}catch{}
  return s;
}
function isDynamic(ref){return /\$\{|\{\{|<%|\*|\[.+\]/.test(ref);}
function addRef(map,ref,source){
  const r=cleanRef(ref);
  if(!r.startsWith('assets/') || isDynamic(r) || r.includes('..')) return;
  const rec=map.get(r)||{path:r,sources:[]};
  const rel=path.relative(root,source).replaceAll('\\','/');
  if(!rec.sources.includes(rel)) rec.sources.push(rel);
  map.set(r,rec);
}

const refs=new Map();
for(const file of walk(root)){
  let text='';
  try{text=fs.readFileSync(file,'utf8');}catch{continue;}
  for(const rx of [quotedAsset,cssAsset]){
    rx.lastIndex=0;
    let m;
    while((m=rx.exec(text))) addRef(refs,m[1],file);
  }
}

const rows=[...refs.values()].sort((a,b)=>a.path.localeCompare(b.path,'pt-BR'));
for(const row of rows){
  const abs=path.join(root,...row.path.split('/'));
  row.exists=fs.existsSync(abs) && fs.statSync(abs).isFile() && fs.statSync(abs).size>0;
  if(row.exists) row.bytes=fs.statSync(abs).size;
}
const missing=rows.filter(x=>!x.exists);
const report={build:'R41-ASSET-AUDIT-20260819',generatedAt:new Date().toISOString(),root,literalReferences:rows.length,existing:rows.length-missing.length,missing:missing.length,dynamicReferencesIgnored:true,missingFiles:missing,ok:missing.length===0};
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(outFile,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({ok:report.ok,literalReferences:report.literalReferences,existing:report.existing,missing:report.missing,report:path.relative(root,outFile)},null,2));
if(missing.length){
  console.error('\nReferencias literais ausentes:');
  for(const x of missing.slice(0,100)) console.error(`- ${x.path} <- ${x.sources.join(', ')}`);
  process.exitCode=1;
}
