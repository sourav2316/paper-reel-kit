import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {openBrowser,renderMedia,renderStill,selectComposition} from '@remotion/renderer';
import sharp from 'sharp';
import {ROOT,PUBLIC,loadStoryboard,referencedFiles} from '../../../scripts/lib.mjs';

const name='angithi',project=path.join(PUBLIC,'projects',name);
const work=path.join(ROOT,'out/angithi-v2-work'),publicDir=path.join(work,'render-public');
const ff=path.join(ROOT,'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
const probe=path.join(ROOT,'node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe');
const mode=process.argv[2]??'check';
const out=path.join(ROOT,'out/angithi-v2-demo.mp4');
const earlierMix=path.join(ROOT,'out/angithi-demo.mp4');
const reuseMix=fs.existsSync(earlierMix);
fs.mkdirSync(path.join(work,'remotion-temp'),{recursive:true});
process.env.TEMP=path.join(work,'remotion-temp');
process.env.TMP=process.env.TEMP;
const storyboard=loadStoryboard(name);
const available=[...new Set(referencedFiles(name,storyboard).map(item=>item.path))];
for(const file of available){
 const target=path.join(publicDir,file);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.copyFileSync(path.join(PUBLIC,file),target);
}
const inputProps={storyboard,base:'projects/'+name,frameRate:30,available};
const serveUrl=await bundle({entryPoint:path.join(ROOT,'src/index.ts'),publicDir});
const puppeteerInstance=await openBrowser('chrome');
const run=(exe,args,buffer=false)=>{
 const result=spawnSync(exe,args,{windowsHide:true,encoding:buffer?undefined:'utf8',maxBuffer:50e6});
 if(result.error||result.status!==0)throw Error(result.error?.message??String(result.stderr));
 return result;
};
const renderOptions={serveUrl,inputProps,puppeteerInstance,concurrency:2,codec:'h264',crf:24,scale:.5,imageFormat:'jpeg',jpegQuality:92,x264Preset:'veryfast'};
try{
 const composition=await selectComposition({serveUrl,id:'Reel',inputProps,puppeteerInstance});
 if(mode==='check'||mode==='polish'||mode==='motion'){
  const sampleTimes=mode==='polish'?[7.4,7.9,8.75,9.3,9.8,10.3,29.5,31.1,34.7,47.2,50.8,52.7,55.2,58.5,66.2,69.7,74,83.8]:[.5,2.85,3.55,4.65,6.25,8.75,9.95,12,22.3,24.8,29.5,31.1,34.25,40.1,46.2,51.7,57.8,61.95,65.8,68.7,78.5,83.8,88.8];
  for(const at of mode==='motion'?[]:sampleTimes){
   await renderStill({serveUrl,inputProps,composition,puppeteerInstance,frame:Math.round(at*30),scale:.4,output:path.join(work,`at-${at}.png`)});
  }
  if(mode==='check'||mode==='motion')await renderMedia({...renderOptions,composition,scale:.4,frameRange:[211,322],outputLocation:path.join(work,'closure-check.mp4')});
 }else{
  const raw=path.join(work,'demo-raw.mp4'),checked=path.join(work,'demo-verifying.mp4');
  let reported=-1;
  await renderMedia({...renderOptions,composition,muted:reuseMix,outputLocation:raw,onProgress:({progress,renderedFrames})=>{
   const bucket=Math.floor(progress*20);
   if(bucket>reported){reported=bucket;console.log(`${Math.round(progress*100)}% · ${renderedFrames} frames`);}
  }});
  if(reuseMix){
   run(ff,['-v','error','-y','-i',raw,'-i',earlierMix,'-map','0:v:0','-map','1:a:0','-c','copy','-movflags','+faststart',checked]);
  }else{
   run(ff,['-v','error','-y','-i',raw,'-map','0:v:0','-map','0:a:0','-c:v','copy','-af','loudnorm=I=-14:TP=-1.5:LRA=7,aresample=48000','-c:a','aac','-b:a','192k','-movflags','+faststart',checked]);
  }
  const metadata=JSON.parse(run(probe,['-v','error','-show_entries','stream=codec_name,width,height,r_frame_rate,nb_frames,duration:format=duration,size','-of','json',checked]).stdout);
  const video=metadata.streams.find(stream=>stream.codec_name==='h264');
  if(video?.width!==540||video.height!==960||video.r_frame_rate!=='30/1'||Number(video.nb_frames)!==composition.durationInFrames||!metadata.streams.some(stream=>stream.codec_name==='aac'))throw Error('Unexpected demo format');
  run(ff,['-v','error','-xerror','-i',checked,'-c:v','rawvideo','-c:a','pcm_s16le','-f','null','NUL']);
  const loudness=run(ff,['-hide_banner','-nostats','-i',checked,'-vn','-af','loudnorm=I=-14:TP=-1.5:LRA=7:print_format=json','-c:a','pcm_s16le','-f','null','NUL']).stderr.match(/\{\s*"input_i"[\s\S]*?\}/);
  const times=[...new Set([...storyboard.scenes.map(s=>Number(((s.start+s.end)/2).toFixed(2))),...Array.from({length:30},(_,i)=>i*3+1.5)])].sort((a,b)=>a-b);
  const tiles=[];
  for(const [i,time] of times.entries()){
   const data=run(ff,['-v','error','-ss',String(time),'-i',checked,'-frames:v','1','-c:v','png','-f','image2pipe','pipe:1'],true).stdout;
   tiles.push({input:await sharp(data).resize(108,192).png().toBuffer(),left:(i%10)*108,top:Math.floor(i/10)*211});
   tiles.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="108" height="19"><rect width="108" height="19" fill="#122825"/><text x="6" y="13" font-size="11" fill="#ecd7a3">${time.toFixed(2)} s</text></svg>`),left:(i%10)*108,top:Math.floor(i/10)*211+192});
  }
  await sharp({create:{width:1080,height:Math.ceil(times.length/10)*211,channels:3,background:'#122825'}}).composite(tiles).jpeg({quality:94}).toFile(path.join(work,'encoded-contact.jpg'));
  const qa={format:'540x960 at 30 fps',shots:storyboard.scenes.length,metadata,decodePassed:true,loudness:loudness?JSON.parse(loudness[0]):null,renderFile:out,contactSamples:times.length};
  fs.writeFileSync(path.join(project,'qa.json'),JSON.stringify(qa,null,2)+'\n');
  fs.renameSync(checked,out);
  fs.unlinkSync(raw);
  console.log('READY',out,JSON.stringify(qa));
 }
}finally{
 await puppeteerInstance.close({silent:true});
}
