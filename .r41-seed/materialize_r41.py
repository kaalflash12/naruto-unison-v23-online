#!/usr/bin/env python3
from __future__ import annotations
import concurrent.futures as cf
import gzip, json, re, shutil, sys, time
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

BASE = 'https://naruto-shinobi-r40-online.vercel.app/'
ROOT = Path('R41/Naruto Shinobi no Sho PC/_jogo')
RUNTIME = Path('r41-live')
TEXT_EXT = {'.html','.htm','.css','.js','.mjs','.json','.txt','.md','.svg','.xml','.webmanifest'}
FILE_EXT = r'(?:html?|css|m?js|json|png|jpe?g|webp|gif|svg|ico|mp3|wav|ogg|webm|mp4|woff2?|ttf|txt|md|webmanifest)'
QUOTED = re.compile(r'''["'`](?P<p>(?:(?:assets|data|src|content-packs|audio|images?|fonts)/)[^"'`?#<>]+?\.'''+FILE_EXT+r''')["'`]''', re.I)
CSSURL = re.compile(r'''url\(\s*["']?(?P<p>[^"')?#<>]+?\.'''+FILE_EXT+r''')["']?\s*\)''', re.I)
HTMLREF = re.compile(r'''(?:src|href)=["'](?P<p>[^"'?#<>]+?\.'''+FILE_EXT+r''')["']''', re.I)
SEEDS = {
    'index.html','app.js','styles.css','r31.css',
    'data/catalogo.js','data/catalogo.json','data/conteudo-livros.js','data/v5-content.js','data/v6-content.js','data/v7-content.js',
    'data/v74-content.js','data/v75-content.js','data/v81-leon-content.js','data/v84-visual-manifest.js','data/v84-live-world.js','data/v84-live-world.json',
    'data/r27-canon-events.js','data/r27-downloaded-canon-portraits.js','data/v84-knowledge-catalog.js','data/v84-knowledge-catalog.json',
    'data/r38-master-loader.js','data/r38-master-2792.json','data/v83-integrated-config.js','data/v84-integrated-config.js',
    'data/r29-user-assets.js','data/r30-assets.js','data/r31-assets.js','data/r31-assets.json','data/r33-mission-scripts.js',
    'assets/ui/logo.png','assets/ui/media-pendente.svg',
    'assets/r26/atlas_sources/atlas_03_areia_nevoa.png','assets/r26/atlas_sources/atlas_05_akatsuki_viloes.png','assets/r26/atlas_sources/atlas_08_boruto_nova_geracao.png',
}

def clean(p):
    p=p.strip().replace('\\','/')
    if not p or p.startswith(('http:','https:','data:','blob:','javascript:','#','/api/')): return None
    if p.startswith('./'): p=p[2:]
    if p.startswith('/'): p=p[1:]
    if '..' in Path(p).parts: return None
    return p

def get(path):
    url=BASE+quote(path, safe='/@:+,=()[]!$&;~-._')
    out=ROOT/path
    for n in range(4):
        try:
            req=Request(url,headers={'User-Agent':'R41-GitHub-Materializer/1.0'})
            with urlopen(req,timeout=45) as r:
                if r.status!=200: raise RuntimeError(f'HTTP {r.status}')
                data=r.read()
            out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(data)
            return path,True,''
        except Exception as e:
            if n==3:return path,False,str(e)
            time.sleep(1.2*(n+1))

def discover(path):
    p=ROOT/path
    if p.suffix.lower() not in TEXT_EXT or not p.exists() or p.stat().st_size>15_000_000:return set()
    try:s=p.read_text('utf-8',errors='ignore')
    except:return set()
    out=set()
    for rx in (QUOTED,CSSURL,HTMLREF):
        for m in rx.finditer(s):
            q=clean(m.group('p'))
            if q:out.add(q)
    return out

def main():
    ROOT.mkdir(parents=True,exist_ok=True)
    wanted=set(SEEDS); done=set(); missing={}
    for roundno in range(12):
        batch=sorted(wanted-done)
        if not batch:break
        print(f'ROUND {roundno+1}: {len(batch)} paths; total known={len(wanted)}',flush=True)
        with cf.ThreadPoolExecutor(max_workers=32) as ex:
            for path,ok,err in ex.map(get,batch):
                done.add(path)
                if not ok: missing[path]=err
        found=set()
        for path in batch:
            if path not in missing: found |= discover(path)
        wanted |= found
    required_missing=sorted(SEEDS & missing.keys())
    if required_missing:
        print('Required seeds missing:',*required_missing,sep='\n',file=sys.stderr);sys.exit(2)
    copies={
      'assets/r26/atlas_sources/atlas_03_areia_nevoa.png':'assets/r40/atlas_sources/atlas_03_areia_e_névoa.png',
      'assets/r26/atlas_sources/atlas_05_akatsuki_viloes.png':'assets/r40/atlas_sources/atlas_akatsuki_grandes_vilões.png',
      'assets/r26/atlas_sources/atlas_08_boruto_nova_geracao.png':'assets/r40/atlas_sources/atlas_de_personagens_boruto_e_nova_geração.png',
    }
    for a,b in copies.items():
        dst=ROOT/b;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/a,dst)
    parts=[]
    for p in sorted(RUNTIME.glob('c*.js')):
        s=p.read_text('utf-8');m=re.search(r"push\('([^']+)'\)",s)
        if m:parts.append(m.group(1))
    if not parts: raise SystemExit('R41 chunks missing')
    import base64, subprocess
    loader=gzip.decompress(base64.b64decode(''.join(parts))).decode('utf-8')
    gz=[gzip.decompress(base64.b64decode(x)).decode('utf-8') for x in re.findall(r"ungzip64\('([^']+)'\)",loader)]
    if len(gz)<5: raise SystemExit('R41 bootstrap payload incomplete')
    (ROOT/'styles.css').write_text(gz[0],'utf-8')
    (ROOT/'data/r41-verified-visuals.js').write_text(gz[1],'utf-8')
    (ROOT/'data/r41-exact-visuals.js').write_text(gz[2],'utf-8')
    (ROOT/'src/r41-core-bundle.js').parent.mkdir(parents=True,exist_ok=True)
    (ROOT/'src/r41-core-bundle.js').write_text(gz[3],'utf-8')
    patch=ROOT/'app-r41.patch';patch.write_text(gz[-1],'utf-8')
    subprocess.run(['patch','--batch','--forward',str(ROOT/'app.js'),str(patch)],check=True);patch.unlink()
    app=(ROOT/'app.js').read_text('utf-8')
    if 'R41-MD-OPERACIONAL-APLICADO-2026-08-17' not in app: raise SystemExit('R41 signature absent from patched app')
    mark='const EMBEDDED=';start=loader.index(mark)+len(mark)
    emb,end=json.JSONDecoder().raw_decode(loader[start:])
    for k,v in emb.items():
        out=ROOT/k.lstrip('/');out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n','utf-8')
    a=loader.find('(function(){\n  // R41 canonical-service repair');b=loader.find('\n const base=',a)
    if a>=0 and b>a:(ROOT/'src/r41-canonical-repair.js').write_text(loader[a:b].strip()+'\n','utf-8')
    (ROOT/'r41-github-api.js').write_text("(()=>{const B='https://naruto-shinobi-r40-online.vercel.app',f=window.fetch.bind(window);window.__SNS_GITHUB_PAGES__={build:'R41-MD-OPERACIONAL-APLICADO-2026-08-17',staticOrigin:location.origin,backend:B};window.fetch=(i,o)=>{const u=typeof i==='string'?i:(i&&i.url)||'';if(u.startsWith('/api/')){const x=Object.assign({},o||{});x.credentials='omit';return f(B+u,x)}return f(i,o)}})();\n",'utf-8')
    idx='''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="r41-build" content="R41-MD-OPERACIONAL-APLICADO-2026-08-17"><meta name="theme-color" content="#160f0b"><title>Shinobi no Sho R41 • TERION 2D10 • GitHub</title><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="r31.css"></head><body><div class="app-shell" id="app"><aside class="sidebar"><div class="brand"><img alt="Naruto Game" src="assets/ui/logo.png"><div><b>SHINOBI NO SHO</b><small>RPG SHINOBI • MUNDO VIVO • MESTRE IA</small></div></div><div class="side-profile" id="side-profile"></div><nav class="main-nav" id="main-nav"></nav><div class="sidebar-footer"><button class="nav-button" data-action="save"><span>💾</span> Salvar agora</button><div class="ai-mini-status" id="ai-mini-status">IA: verificando...</div><small>Campanha salva automaticamente</small></div></aside><main class="main-area"><header class="topbar"><button aria-label="Abrir menu" class="icon-button mobile-only" data-action="toggle-menu">☰</button><div class="top-resources" id="top-resources"></div><button class="icon-button" data-action="fullscreen" title="Tela cheia">⛶</button></header><section aria-live="polite" class="screen" id="screen"></section></main></div><div id="modal-root"></div><div aria-live="assertive" class="toast-root" id="toast-root"></div>\n'''
    scripts=['data/catalogo.js','data/conteudo-livros.js','data/v5-content.js','data/v6-content.js','data/v7-content.js','data/v74-content.js','data/v75-content.js','data/v81-leon-content.js','data/v84-visual-manifest.js','data/v84-live-world.js','data/r27-canon-events.js','data/r27-downloaded-canon-portraits.js','data/v84-knowledge-catalog.js','data/r38-master-loader.js','data/v83-integrated-config.js','data/v84-integrated-config.js','data/r29-user-assets.js','data/r30-assets.js','data/r31-assets.js','data/r33-mission-scripts.js','data/r41-verified-visuals.js','data/r41-exact-visuals.js','src/r41-core-bundle.js','src/r41-canonical-repair.js','r41-github-api.js','app.js']
    idx+=''.join(f'<script src="{x}"></script>\n' for x in scripts)+'</body></html>\n';(ROOT/'index.html').write_text(idx,'utf-8')
    src=json.loads((ROOT/'data/r38-master-2792.json').read_text('utf-8'))
    def pick(x,*keys):
        for k in keys:
            v=x.get(k)
            if v is not None:return v
    gm=[]
    for x in src:
        test=pick(x,'rolagem','testePadrao');cd=pick(x,'cd_referencia')
        if cd is None and isinstance(x.get('testePadrao'),dict):cd=x['testePadrao'].get('CD')
        gm.append({'id':x.get('id'),'name':pick(x,'nome_pt_br','nome','name'),'rank':pick(x,'rank_origem','rank'),'tier':x.get('tier_v68',''),'category':x.get('categoria',''),'nature':x.get('familia_natureza',''),'cost':x.get('custo'),'resource':x.get('recurso'),'test':test or '','cd':cd,'range':x.get('alcance'),'duration':x.get('duracao'),'requirement':pick(x,'requisitos','requisito'),'limit':x.get('limite'),'countermeasure':x.get('contramedidas'),'effect':pick(x,'dano_cura_efeito','descricao') or '','action':pick(x,'acao','ativacao') or '','source':{'catalog':x.get('origem_catalogo',''),'mediaStatus':x.get('midia_status',''),'conversionNotes':x.get('notas_conversao','')},'authority':'TERION_2D10','r41GM3':True})
    (ROOT/'data/r41-gm3-techniques.json').write_text(json.dumps(gm,ensure_ascii=False,indent=2)+'\n','utf-8')
    report={'build':'R41-MD-OPERACIONAL-APLICADO-2026-08-17','staticFilesDownloaded':len(done)-len(missing),'discoveredPaths':len(wanted),'missingNonSeed':len(missing),'gm3Techniques':len(gm),'staticHostedBy':'GitHub Pages','apiBackend':BASE.rstrip('/'),'note':'Vercel is used only for /api; static game files are materialized in this repository.'}
    (ROOT/'R41_GITHUB_MATERIALIZATION.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n','utf-8')
    (ROOT/'R41_MISSING_RUNTIME_PATHS.txt').write_text('\n'.join(f'{k}\t{v}' for k,v in sorted(missing.items()))+'\n','utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
