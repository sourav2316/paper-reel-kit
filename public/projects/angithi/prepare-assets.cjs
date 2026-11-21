const sharp=require('sharp');
const path=require('node:path');
const root=path.resolve(__dirname,'../../..');
const origins=path.join(root,'library/originals/angithi');
const assets=path.join(__dirname,'assets');
const target=name=>path.join(assets,name);
const original=name=>path.join(origins,name+'.png');

async function main(){
 for(const name of ['room','street']){
  await sharp(original(name)).resize({height:1536,withoutEnlargement:true}).jpeg({quality:94}).toFile(target(name+'.jpg'));
 }
 await sharp(original('street')).extract({left:835,top:540,width:189,height:443}).jpeg({quality:94}).toFile(target('window-view.jpg'));
 for(const name of ['family','coal']){
  await sharp(original(name)).trim().resize({width:1120,withoutEnlargement:true}).png().toFile(target(name+'.png'));
 }
 for(const name of ['closure','family-room','symptom-room']){
  await sharp(original(name)).resize(900,1600,{fit:'fill'}).jpeg({quality:94}).toFile(target(name+'.jpg'));
 }
 await sharp(original('breath-body')).trim().resize({height:1100}).png().toFile(target('breath-body.png'));
 const fan=original('fan');
 const {width:fanWidth,height:fanHeight}=await sharp(fan).metadata();
 const split=1460;
 for(const [left,width,name] of [[0,split,'fan-blade'],[split,fanWidth-split,'fan-motor']]){
  const crop=await sharp(fan).extract({left,top:0,width,height:fanHeight}).png().toBuffer();
  await sharp(crop).trim().resize({width:440,withoutEnlargement:true}).png().toFile(target(name+'.png'));
 }
 const atlas=original('actors');
 const {width,height}=await sharp(atlas).metadata();
 const halfWidth=Math.floor(width/2),halfHeight=Math.floor(height/2);
 for(const [index,name] of ['window-actor','door-actor','ill-actor','exit-actor'].entries()){
  const crop=await sharp(atlas).extract({left:index%2*halfWidth,top:Math.floor(index/2)*halfHeight,width:halfWidth,height:halfHeight}).png().toBuffer();
  await sharp(crop).trim().resize({height:700,withoutEnlargement:true}).png().toFile(target(name+'.png'));
 }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
