const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../..');
const ff=path.join(root,'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
const demo=path.resolve(process.argv[2]??path.join(root,'out/angithi-v2-demo.mp4'));
function pcm(file){
 const wave=execFileSync(ff,['-v','error','-i',file,'-vn','-ac','1','-ar','8000','-f','wav','pipe:1'],{maxBuffer:12e6,windowsHide:true});
 const start=wave.indexOf('data',12,'ascii');
 if(start<0)throw Error('Wave PCM chunk missing');
 return wave.subarray(start+8);
}
const master=pcm(path.join(__dirname,'vo.mp3')),output=pcm(demo);
const checks=[1.12,3.28,8.16,17.52,23.71,29.35,34,40,46.56,52.5,58.6,61.7,65,72.8,77.7,83,88.3].map(at=>{
 const sample=Math.round(at*8000),base=sample-640;
 let best={offset:0,correlation:-1};
 for(let shift=0;shift<=1280;shift+=2){
  let dot=0,inputEnergy=0,outputEnergy=0;
  for(let i=0;i<6900;i+=4){
   const a=master.readInt16LE((sample+i)*2),b=output.readInt16LE((base+i+shift)*2);
   dot+=a*b;inputEnergy+=a*a;outputEnergy+=b*b;
  }
  const correlation=dot/Math.sqrt(inputEnergy*outputEnergy);
  if(correlation>best.correlation)best={offset:(shift-640)/8000,correlation};
 }
 return {at,...best};
});
if(checks.some(point=>point.correlation<.87||Math.abs(point.offset)>.03))throw Error('Voice alignment needs review: '+JSON.stringify(checks));
const qaFile=path.join(__dirname,'qa.json');
const qa=JSON.parse(fs.readFileSync(qaFile,'utf8'));
qa.voiceAlignment=checks;
fs.writeFileSync(qaFile,JSON.stringify(qa,null,2)+'\n');
console.log(checks.length+' voice checkpoints passed; max measured offset '+Math.max(...checks.map(point=>Math.abs(point.offset)))+' s');
