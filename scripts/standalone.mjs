import fs from 'node:fs/promises';
import path from 'node:path';
const dist=path.resolve('dist');
let html=await fs.readFile(path.join(dist,'index.html'),'utf8');
const jsTag=html.match(/<script[^>]*src="([^"]+)"[^>]*><\/script>/);
const cssTag=html.match(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);
if(!jsTag||!cssTag)throw new Error('Expected Vite module and stylesheet were not found');
let css=await fs.readFile(path.join(dist,cssTag[1]),'utf8');
for(const match of [...css.matchAll(/url\(([^)]+)\)/g)]){
  const ref=match[1].replace(/["']/g,'');if(ref.startsWith('data:'))continue;
  const file=path.resolve(dist,'assets',ref),bytes=await fs.readFile(file),mime=ref.endsWith('.woff2')?'font/woff2':'font/woff';
  css=css.replaceAll(match[0],`url(data:${mime};base64,${bytes.toString('base64')})`);
}
const js=await fs.readFile(path.join(dist,jsTag[1]),'utf8');
html=html.replace(jsTag[0],()=>`<script type="module">${js.replaceAll('</script','<\\/script')}</script>`).replace(cssTag[0],()=>`<style>${css}</style>`);
const licenses=[];
for(const name of ['three','@fontsource/space-grotesk','@fontsource/ibm-plex-mono']){
  const license=await fs.readFile(`node_modules/${name}/LICENSE`,'utf8');licenses.push(`${name}\n${license}`);
}
html=html.replace('<!doctype html>',()=>`<!doctype html>\n<!-- Third-party licenses\n${licenses.join('\n\n').replaceAll('--','—')}\n-->`);
const favicon=await fs.readFile(path.join(dist,'favicon.svg'));html=html.replace('./favicon.svg',`data:image/svg+xml;base64,${favicon.toString('base64')}`);
await fs.mkdir('standalone',{recursive:true});await fs.writeFile('standalone/thermal-cloak.html',html);
console.log('Standalone HTML created with embedded JavaScript, CSS, fonts, and favicon.');
