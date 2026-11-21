const fs=require('node:fs');
const path=require('node:path');
const here=__dirname;
const write=(name,data)=>fs.writeFileSync(path.join(here,name),typeof data==='string'?data:JSON.stringify(data,null,2)+'\n');
const art={
 street:'assets/street.jpg',room:'assets/room.jpg',windowView:'assets/window-view.jpg',coal:'assets/coal.png',familyRoom:'assets/family-room.jpg',closure:'assets/closure.jpg',symptomRoom:'assets/symptom-room.jpg',breathBody:'assets/breath-body.png',fanBlade:'assets/fan-blade.png',fanMotor:'assets/fan-motor.png',
 doorActor:'assets/door-actor.png',windowActor:'assets/window-actor.png',
 lungs:'/projects/hair-nails-after-death/assets/lungs-real.png',
 cells:'/projects/hair-nails-after-death/assets/cell-world.jpg',
 redCell:'/projects/pimple-danger-triangle/assets/red-cell.png',
};
const use={
 street:['street'],room:['windowView','room','coal','familyRoom'],door:['closure','doorActor','windowView'],window:['closure','windowView','windowActor'],case:['street'],
 chemistry:['room','coal'],breath:['room','lungs','breathBody'],blood:['cells','redCell'],
 symptoms:['symptomRoom'],severity:['symptomRoom'],safety:['windowView','room','coal','familyRoom','fanBlade','fanMotor'],
};
// Phrase boundaries read from the supplied audio, using silencedetect and recognition.
const cues={
 sleep:5.56,seal:8.04,case:17.35,family:23.66,locked:28.39,morning:32.62,question:38.85,
 locate:18.86,alipur:20.53,approach:22.14,co:44.02,invisible:49.96,noOdor:51.93,airway:56.68,blood:60.39,dizzy:66.60,weak:67.39,faint:68.84,high:70.42,severe:72.39,fan:82,last:85.10,
};
const rows=[
 [0,'street','OUTSIDE','BITTER COLD',[1.0,.5,.51],[2.10,.529,.475],'Outside in winter','Street mist and window glow drift independently, then the camera tracks the lit window.'],
 [3.17,'room','INSIDE THE ROOM','ANGITHI',[1.42,.44,.38],[2.02,.486,.735],'A brazier in the room','Through the lit window into the room, then tilt down to the coal bed. Coals pulse and sparks rise inside the bowl.'],
 [5.56,'room','WARM AND QUIET','ASLEEP',null,[1.41,.482,.553],'Falling asleep','Lift from the coals to the quilt, which rises at sleeping breaths.'],
 [7.12,'door','TO KEEP THE HEAT IN','DOOR SHUT',[1.0,.51,.53],[1.08,.58,.54],'Closing the door','Track the hand into the latch. Door turns around right hinge before the bolt slides.'],
 [9.01,'window','THE WINDOW TOO','CLOSED',[1.06,.51,.53],[1.10,.49,.53],'Closing the window','Pan to the two turning panes. Their latch meets and the curtain settles as the draft falls.'],
 [10.80,'room','THIS SMALL CHOICE','CAN BE DEADLY',[1.18,.50,.56],[1.32,.49,.66],'The danger','Pull back to the sleeping area and fire so the viewer sees what shares the closed room.'],
 [13.51,'room','A CLOSED ROOM','WITH LIVE COALS',null,[1.36,.49,.654],'One small mistake','Follow the last light from the coals across the room before returning to the window.'],
 [15.65,'room','IT SOUNDS SCARY','IT HAPPENED',null,[1.64,.43,.365],'This happened','Lift from the bed toward the same window before the location reveal.'],
 [17.35,'case','A REAL INCIDENT','NORTH DELHI',[1.00,.50,.54],[1.14,.51,.55],'A real Delhi incident','Move out toward Delhi lane and pick out the lit building while mist travels across the lane.'],
 [18.86,'case','NORTH DELHI','A WINTER NIGHT',null,[1.30,.52,.50],'A real incident','An animated location pin lands on the house as the exterior camera moves closer.'],
 [20.53,'case','JANUARY 2024','ALIPUR',null,[1.16,.50,.55],'January 2024 in Alipur','The dated reconstruction card folds in and clears the building.'],
 [22.14,'case','ALIPUR','THE FAMILY',null,[2.10,.53,.49],'The family in Alipur','Camera leaves the card and pushes toward the lit window.'],
 [23.65,'room','THE SAME ROOM','FOUR ASLEEP',[1.12,.50,.52],[1.55,.49,.557],'Four family members,' ,'Show four faces at once. Four numbered ticks appear in order without covering faces.'],
 [25.22,'room','IN THE ROOM','COALS STILL LIT',null,[1.96,.487,.738],'The brazier kept burning','Follow the light falling off the quilt down to the coals.'],
 [28.00,'door','KEEPING WARM','THE DOOR',[1.04,.55,.53],[1.10,.58,.55],'Door shuts','Boots on the floor, hand tracks the handle as the door swings and latches.'],
 [30.08,'window','KEEPING WARM','THE WINDOW',[1.09,.52,.53],[1.14,.49,.53],'Window shuts','Shift to the window and show the sashes meet as the curtain settles.'],
 [32.59,'room','THE NEXT','MORNING',[1.25,.46,.42],[1.33,.49,.53],'The next morning','Follow directional dawn light from the glass as divided shadows move along the floor.'],
 [33.98,'room','THE NEXT MORNING','FOUR LIVES LOST',null,[1.36,.49,.56],'Four lives lost','Move to the four figures and let the remaining coals dim.'],
 [35.63,'room','HOW CAN A SMALL','ANGITHI KILL?',null,[2.15,.489,.733],'How can it be so dangerous?','Stay inside the room. The camera descends again and lands at the center of the coal bed.'],
 [38.83,'chemistry','WHEN FUEL BURNS','COAL OR WOOD',[1.32,.50,.65],[1.0,.50,.54],'When coal or wood burns','Match the bowl across the transition and follow glowing fissures and embers upward.'],
 [41.12,'chemistry','GLOWING','EMBERS',null,[1.57,.50,.66],'Fuel burns','Push over the coals and follow the changing hot spots before tracking the first marker.'],
 [43.82,'chemistry','A TOXIC GAS','CARBON MONOXIDE',null,[1.32,.53,.53],'Carbon monoxide','A representative marker separates from the rising CO illustration.'],
 [46.06,'chemistry','A TOXIC GAS','CARBON MONOXIDE',null,[1.63,.51,.405],'The toxic gas','Track the selected marker to a closer molecular diagram.'],
 [48.13,'chemistry','THE HIDDEN DANGER','HARD TO DETECT',null,[1.12,.5,.46],'The most dangerous part','Pull away from the diagram as the room behind it comes back into focus.'],
 [49.96,'chemistry','YOU CANNOT SEE IT','NO COLOR',null,[1.14,.5,.47],'No color','A dedicated eye illustration sweeps into place as the earlier markers fade.'],
 [51.93,'chemistry','YOU CANNOT SMELL IT','NO ODOR',null,[1.17,.5,.48],'No odor','The nose illustration takes over before the camera finds the actual nose.'],
 [54.00,'breath','WITH EACH BREATH','CO GETS IN',[1.05,.57,.51],[1.27,.55,.44],'You may breathe it in','Follow schematic particles from the face into airways and expand the lungs separately.'],
 [56.68,'breath','WITH EACH BREATH','DOWN THE AIRWAY',null,[1.36,.54,.566],'The gas enters your body','Follow the particles from the nose along the airway into the chest.'],
 [58.48,'breath','INSIDE THE CHEST','INTO THE LUNGS',null,[1.40,.52,.633],'The lungs','Move down through the torso as the lungs expand with an inhalation.'],
 [60.38,'blood','IN THE BLOOD','LESS OXYGEN',[1.13,.50,.52],[1.04,.50,.51],'Blood carries less oxygen','Track a stream of rotating red blood cells and show CO binding to hemoglobin.'],
 [62.68,'blood','OXYGEN DELIVERY','DROPS',null,[1.22,.50,.57],'Less oxygen reaches tissues','CO markers bind as the oxygen transport illustration drops.'],
 [64.91,'symptoms','THE FIRST SIGNS','HEADACHE',[1.16,.52,.54],[1.22,.52,.54],'Headache','Find the same character with his hand on his temple.'],
 [66.60,'symptoms','THEN','DIZZINESS',null,[1.31,.51,.51],'Dizziness','Eye level drifts and a small orbit illustrates dizziness while the character steadies himself.'],
 [67.39,'symptoms','AS IT GETS WORSE','WEAKNESS',null,[1.71,.37,.62],'Weakness','Follow his weight from the forehead down to the hand braced on the mattress.'],
 [68.84,'symptoms','AS IT GETS WORSE','FAINTING',null,[1.31,.52,.54],'Fainting','Narrow focus as the character slumps at the edge of the bed.'],
 [70.42,'severity','AT HIGH EXPOSURE','SERIOUS DANGER',[1.16,.52,.55],[1.12,.51,.55],'High exposure','The close view gives way to an animated danger symbol.'],
 [72.39,'severity','AT HIGH EXPOSURE','IT CAN KILL',null,[1.24,.51,.57],'Severe exposure can be fatal','The lower graphic drains as the fatal risk is stated.'],
 [74.68,'safety','WINTER SAFETY','KEEP COALS OUT',[1.14,.50,.53],[1.49,.482,.69],'Never sleep with burning coals indoors','Re-enter the room and lead the viewer from the bed to the burner while the warning arrives.'],
 [77.01,'safety','IN A CLOSED ROOM','DO NOT SLEEP',null,[1.24,.49,.52],'Do not go to sleep','Raise the camera from the brazier to the bed and closed window.'],
 [79.52,'safety','BURNING CHARCOAL','KEEP IT OUTSIDE',null,[1.39,.49,.69],'Keep burning coals out','Bring back the origin of the warning before following the air up.'],
 [82.00,'safety','A FAN ONLY','MOVES THE AIR',null,[1.13,.49,.38],'A fan does not get rid of CO','Tilt to a working ceiling fan. Airflow moves the curtain and markers remain inside.'],
 [85.08,'safety','STAY WARM SAFELY','KEEP IT OUTSIDE',null,[1.11,.50,.54],'Incorrect heating can be fatal','Return to the room and draw a prohibition over the burning charcoal.'],
 [88.06,'safety','WINTER SAFETY','KEEP IT OUTSIDE',null,[1.28,.49,.645],'Final warning','Land on the brazier in the final warning as the room stays visible.'],
];
const duration=91.010563;
const travelFocus={room:{x:.48,y:.49},case:{x:.49,y:.45},chemistry:{x:.49,y:.57},breath:{x:.62,y:.46},blood:{x:.50,y:.58},symptoms:{x:.51,y:.52},safety:{x:.52,y:.58}};
const scenes=rows.map((row,i)=>{
 const [start,mode,small,big,from,to]=row;
 const previous=rows[i-1],end=rows[i+1]?.[0]??duration;
 const a=from??previous[5],turn=previous&&previous[1]!==mode;
 const aperture=turn&&!['door','window','severity'].includes(mode)&&!['door','window'].includes(previous[1]);
 const k=(pose,at)=>({at,zoom:pose[0],x:pose[1],y:pose[2]});
 const camera=[k(a,0),k(to,end-start)];

 if(start===3.17)camera.splice(1,0,k([1.47,.48,.49],.61));
 return {
  id:mode+'-'+String(i+1).padStart(2,'0'),start,end,dark:true,set:{builtin:'layered-paper-stage'},
  transitionIn:aperture?'travel':'cut',...(aperture?{transitionDuration:.46,transitionAperture:true,transitionFocus:travelFocus[mode]??{x:.5,y:.5}}:{}),
  camera:{keyframes:camera},
  headlines:[{at:start+.035,bigAt:start+.16,small,big,bigColor:[10.80,33.98,43.82,46.06,70.42,72.39,85.08].includes(start)?'red':'mustard'}],
  layers:[
   {type:'angithi-world',mode,cues,art:Object.fromEntries(use[mode].map(key=>[key,art[key]]))},
   ...(start===82?[{type:'text',text:'A FAN DOES NOT REMOVE CO',x:.5,y:.81,w:.82,size:37,color:'#f1deb6',backplate:true,screenSpace:true,enter:'slide-up'}]:[]),
   {type:'image',src:'assets/brand.png',x:.914,y:.901,w:.083,screenSpace:true,shadow:false,opacity:.80,enter:'none'},
  ],
 };
});
const storyboard={title:'Angithi — the danger you cannot see',audio:'vo.mp3',audioVolume:1,musicVolume:.08,endPadding:1,paperCreases:false,scenes};
write('shotlist.md','# Angithi review direction\n\n| Time | Narration cue | Action and camera handoff |\n|---|---|---|\n'+rows.map((row,i)=>`| ${row[0].toFixed(2)}–${(rows[i+1]?.[0]??duration).toFixed(2)} | ${row[6]} | ${row[7]} |`).join('\n')+'\n');
write('storyboard.json',storyboard);
write('timings.json',{audioDuration:duration,alignment:'Opening checked against local Hindi recognition. Phrase boundaries matched from the supplied script and FFmpeg silence detection, with sub-phrase action cues estimated inside the corresponding phrases.',cues,beats:rows.map((row,i)=>({at:row[0],end:rows[i+1]?.[0]??duration,cue:row[6]}))});
if(!fs.existsSync(path.join(here,'production-state.json')))write('production-state.json',{channelName:'Somehow Sourav',branding:'assets/brand.png',language:'Hindi',voice:'User-supplied Angithi.mp3.mpeg',status:'demo-in-production',demo:'540x960 30 fps',final:'1080x1920 60 fps pending review'});
write('bible.json',{world:'Cold blue North Delhi street and continuous amber room, followed into coal, inhalation and a blood vessel. Return to the same room for the fan and safety warning.',camera:'Carry end pose into the next cue unless changing physical space. New-space aperture opens at the outgoing point of interest.',motion:['Source-anchored ember flicker and sparks','Window panes and door close around fixed hinges','Four distinct quilt breathing phases','Proof-of-concept CO symbols in educational diagrams only','Red blood cells advect and CO binding sites change'],palette:['#143033','#e7b76b','#f08064','#314e53']});
write('assets.json',Object.entries(art).map(([key,file])=>({file,kind:['street','room','cells','closure','familyRoom','symptomRoom'].includes(key)?'background':'cutout',source:file.startsWith('/')?'Paper-Reel Kit library':'Project ImageGen source'})).concat({file:'assets/brand.png',kind:'cutout',source:'Somehow Sourav approved branding folder'}));
write('sources.json',[
 {title:'The Indian Express reporting and police account of the Alipur incident',url:'https://indianexpress.com/article/cities/delhi/angithi-left-burning-4-of-a-family-suffocate-to-death-at-house-in-outer-delhis-alipur-9108804/lite/',use:'Date, location, four fatalities and the reported brazier. Characters and room are a reconstruction, not documentary images.'},
 {title:'CDC — Carbon Monoxide Poisoning Basics',url:'https://www.cdc.gov/carbon-monoxide/about/index.html',use:'Colorless and odorless, symptoms, fatal risk and never burn charcoal indoors.'},
 {title:'US EPA — What is carbon monoxide?',url:'https://www.epa.gov/indoor-air-quality-iaq/what-carbon-monoxide',use:'Carboxyhemoglobin formation and oxygen transport effects.'},
]);
