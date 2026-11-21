import React, {useId} from 'react';
import {staticFile} from 'remotion';
import {DISPLAY_FONT,MONO_FONT} from '../theme';

export type AngithiWorldProps={
 mode:'street'|'room'|'door'|'window'|'case'|'chemistry'|'breath'|'blood'|'symptoms'|'severity'|'safety';
 art:Record<string,string>;
 cues:Record<string,number>;
 time:number;
};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(x:number)=>{const p=clamp(x);return p*p*(3-2*p);};
const rnd=(i:number)=>{const f=Math.sin(i*123.348+74.731)*48173.187;return f-Math.floor(f);};
const wrap=(n:number)=>n-Math.floor(n);
const image=(src:string,x:number,y:number,width:number,height:number,fit='xMidYMid meet')=>
 <image href={staticFile(src)} {...{x,y,width,height}} preserveAspectRatio={fit}/>;
const Head:React.FC<{x?:number;y:number;children:React.ReactNode;size?:number;color?:string}>=({x=540,y,children,size=48,color='#f0d9a8'})=>
 <text x={x} y={y} textAnchor="middle" fontFamily={DISPLAY_FONT} fontSize={size} letterSpacing="2" fill={color}>{children}</text>;
const Plaque:React.FC<{y:number;children:React.ReactNode;size?:number}>=({y,children,size=36})=>
 <g><rect x="100" y={y-52} width="880" height="81" rx="5" fill="#143033" stroke="#786851" strokeWidth="2"/>
 <path d={`M113 ${y-44}v65`} stroke="#daa955" strokeWidth="6"/><Head y={y} size={size}>{children}</Head></g>;
function CoalBrazier({src,t,x=540,y=1450,w=420,gain=1}:{src:string;t:number;x?:number;y?:number;w?:number;gain?:number}){
 const id=useId(),s=w/420;
 return <g transform={`translate(${x} ${y}) scale(${s})`}>
  <defs><radialGradient id={id+'floor'}><stop stopColor="#ffae51" stopOpacity=".67"/><stop offset="1" stopColor="#ff7320" stopOpacity="0"/></radialGradient>
  <radialGradient id={id+'ember'}><stop stopColor="#fff0a7"/><stop offset=".28" stopColor="#ffad4d" stopOpacity=".93"/><stop offset="1" stopColor="#df3d11" stopOpacity="0"/></radialGradient>
  <clipPath id={id+'bowl'}><ellipse cx="0" cy="-118" rx="164" ry="58"/></clipPath></defs>
  <ellipse cx="0" cy="134" rx="294" ry="88" fill={`url(#${id}floor)`} opacity={gain*(.45+Math.sin(t*4.4)*.10+Math.sin(t*7.7)*.10)}/>
  <ellipse cx="0" cy="138" rx="159" ry="23" fill="#0c1210" opacity=".33"/>
  <g style={{filter:gain<.96?`brightness(${.56+.44*gain})`:undefined}}>{image(src,-210,-190,420,338,'xMidYMid meet')}</g>
  <g clipPath={`url(#${id}bowl)`} style={{mixBlendMode:'screen'}}>
   {Array.from({length:18},(_,i)=>{
    const x0=(rnd(i+10)-.5)*270,y0=-120+(rnd(i+55)-.5)*70;
    const f=.17+.44*(.5+.5*Math.sin(t*(2+rnd(i)*6)+i*1.92))**2;
    return <g key={i} opacity={f*gain}>
     <ellipse cx={x0} cy={y0} rx={13+rnd(i+61)*29} ry={6+rnd(i+66)*13} fill={`url(#${id}ember)`}/>
     <path d={`M${x0-8} ${y0+4}l6 -8 7 4 6 -5`} stroke={i%4?'#ed6828':'#ffd787'} strokeWidth="2.1" fill="none"/>
    </g>;
   })}
  </g>
  {Array.from({length:16},(_,i)=>{const p=wrap(t*(.48+.15*rnd(i+42))+rnd(i+15));const bx=(rnd(i+12)-.5)*237;
   return <ellipse key={i} cx={bx+Math.sin(p*4+i)*p*42} cy={-120-160*p-40*p*p} rx={1.4+rnd(i+51)*1.4} ry={2.3-p} fill={i%3?'#ffae58':'#fff2a8'} opacity={Math.sin(Math.PI*p)*(.31+rnd(i+80)*.6)*gain}/>;})}
 </g>;
}
function Casement({t,close,street,x=281,y=566,daylight=0}:{t:number;close:number;street:string;x?:number;y?:number;daylight?:number}){
 const w=192,flap=.18+.82*close;
 return <g transform={`translate(${x} ${y})`}>
  <defs><linearGradient id="angithi-glass" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop stopColor="#163d53"/><stop offset="1" stopColor="#748d89"/></linearGradient><clipPath id="angithi-glass-clip"><rect width="384" height="276"/></clipPath></defs>
  <rect x="-15" y="-15" width="414" height="306" rx="4" fill="#3c2c20" stroke="#211b18" strokeWidth="9"/>
  <rect width="384" height="276" fill="#304e58"/>
  <g clipPath="url(#angithi-glass-clip)">
   <rect width="384" height="276" fill="url(#angithi-glass)"/>
   {image(street,-54,-145,511,550,'xMidYMid slice')}
   <rect width="384" height="276" fill="#2c5b6a" opacity={.14+close*.27}/>
   <rect width="384" height="276" fill="#f8d99d" opacity={daylight*.64}/>
   <ellipse cx="112" cy="122" rx="150" ry="24" fill="#b0d1c6" opacity=".13" transform={`translate(${Math.sin(t*.48)*50} 0)`}/>
  </g>
  {[0,1].map(i=><g key={i} opacity={.8+.2*close} transform={`translate(${i?384:0} 0) scale(${i?-flap:flap} 1)`}>
   <rect width={w} height="276" fill="#498497" fillOpacity=".35" stroke="#523b29" strokeWidth="11"/>
   <path d="M0 139h192M96 0v276" stroke="#50392a" strokeWidth="7"/>
   <path d="M9 17v99M17 22v37M111 163v72" stroke="#b9d8d7" opacity=".45" strokeWidth="3"/>
   <path d="M173 171v34h-13" stroke="#d0a666" strokeWidth="6" fill="none"/>
  </g>)}
  <path d="M-12 282h408l14 11H-24Z" fill="#715137" stroke="#291f19" strokeWidth="2"/>
  <g opacity={close} transform={`rotate(${(1-close)*-45} 189 184)`}><rect x="171" y="177" width="32" height="8" rx="3" fill="#d5ab70"/></g>
 </g>;
}
function Curtain({t,air,x=265,y=550}:{t:number;air:number;x?:number;y?:number}){
 const swing=Math.sin(t*2.3)*18*air+Math.sin(t*4.6)*4;
 return <g transform={`translate(${x} ${y})`}>
  <defs><linearGradient id="angithi-cloth"><stop stopColor="#49242d"/><stop offset=".3" stopColor="#8b4445"/><stop offset=".58" stopColor="#a05d50"/><stop offset="1" stopColor="#57333a"/></linearGradient></defs>
  <path d="M-20 0H426" stroke="#936b46" strokeWidth="7"/>
  {[0,1].map(i=><g key={i} transform={`translate(${i?393:0} 0) scale(${i?-1:1} 1)`}>
   <path d={`M-13 5H52 Q28 105 ${43+swing*.28} 191 Q${51+swing} 239 ${68+swing} 317 Q${23+swing} 336 ${-14+swing} 321 Q-24 166 -13 5Z`} fill="url(#angithi-cloth)" stroke="#422628" strokeWidth="2"/>
   {[0,1,2,3].map(k=><path key={k} d={`M${k*16-3} 10 Q${k*11-11} 112 ${k*15-7+swing*.28} 213 T${k*19-9+swing} 318`} fill="none" stroke={k%2?'#c27d65':'#633346'} opacity=".58" strokeWidth="3"/>)}
  </g>)}
 </g>;
}
function Door({close,latch}:{close:number;latch:number}){
 return <g transform="translate(906 462) scale(.78 1.19)">
  <path d="M-7 -12H198V509H-7Z" fill="#2b2119" stroke="#5a3b28" strokeWidth="12"/>
  <path d="M4 0h183v501H4z" fill="#100f13"/>
  <g transform={`translate(187 0) scale(${.17+.83*close} 1)`}>
   <path d="M0 0h-182v501H0Z" fill="#5c3929" stroke="#281d17" strokeWidth="5"/>
   {[0,1,2].map(i=><rect key={i} x={-170+i*53} y="15" width="49" height="470" fill={['#65442f','#744e37','#52372a'][i]} stroke="#3c2b22" strokeWidth="3"/>)}
   <path d="M-172 64h158m-158 325h158" stroke="#39271d" strokeWidth="13"/>
   <path d="M-170 293h52v20h-52z" fill="#372821" stroke="#987b50" strokeWidth="3"/>
   <path d={`M${-158-15*latch} 302h35`} stroke="#ccab73" strokeWidth="7" strokeLinecap="round"/>
   <circle cx="-141" cy="300" r="7" fill="#ba975f" stroke="#483523" strokeWidth="3"/>
  </g>
 </g>;
}
function Fan({t,blade,motor,x=540,y=598}:{t:number;blade:string;motor:string;x?:number;y?:number}){
 const elapsed=Math.max(0,t),speed=ease(elapsed/1.03),angle=17+615*(elapsed-.56*(1-Math.exp(-elapsed/.56)));
 return <g transform={`translate(${x} ${y})`}>
  <ellipse cy="-172" rx="34" ry="15" fill="#837766" stroke="#594932" strokeWidth="7"/>
  <path d="M-5 -172L-5 -14M5 -172L5 -14" stroke="#8b7054" strokeWidth="7"/>
  <path d="M-4 -167V-17" stroke="#d7b178" strokeWidth="3" opacity=".52"/>
  <g transform="scale(1 .59)">
   {[[-12,.12],[-6,.23],[0,1]].map(([lag,alpha])=><g key={lag} opacity={lag?alpha*speed:1} transform={`rotate(${angle+lag})`}>
    {[0,120,240].map(a=><g key={a} transform={`rotate(${a})`}>{image(blade,10,-25,244,51,'none')}</g>)}
   </g>)}
  </g>
  {image(motor,-55,-34,110,84,'none')}
 </g>;
}
const armGeometry={
 door:{width:308,height:617,shoulder:[98,150],grip:[270,214],body:'M0 0H308V158H124L109 215H122V617H0Z',arm:'M88 131Q129 156 153 181L256 186 288 198 283 226 244 234 134 232 104 204Z'},
 window:{width:347,height:618,shoulder:[189,114],grip:[13,110],body:'M146 0H347V618H123V161H154Z',arm:'M0 62L39 83 40 104 91 102 180 83 216 99 209 145 163 168 104 161 26 146 0 136Z'},
};
function ReachActor({kind,src,t,target,x,y,opacity}:{kind:'door'|'window';src:string;t:number;target:[number,number];x:number;y:number;opacity:number}){
 const id=useId(),g=armGeometry[kind],scale=1.20;
 const canvas=image(src,0,0,g.width,g.height,'none');
 const [sx,sy]=g.shoulder,[hx,hy]=g.grip;
 const grip=[(target[0]-x)/scale,(target[1]-y)/scale];
 const original=Math.atan2(hy-sy,hx-sx)*180/Math.PI;
 const angle=Math.atan2(grip[1]-sy,grip[0]-sx)*180/Math.PI;
 const stretch=Math.hypot(grip[0]-sx,grip[1]-sy)/Math.hypot(hx-sx,hy-sy);
 return <g opacity={opacity}>
  <ellipse cx={x+(kind==='door'?70:219)*scale} cy={y+g.height*scale-1} rx="101" ry="21" fill="#1b1515" opacity=".30"/>
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
   <defs><clipPath id={id+'body'}><path d={g.body}/></clipPath><clipPath id={id+'arm'}><path d={g.arm}/></clipPath></defs>
   <g clipPath={`url(#${id}body)`}>{canvas}</g>
   <g transform={`translate(${sx} ${sy}) rotate(${angle}) scale(${stretch} ${1+Math.sin(t*2)*.012}) rotate(${-original}) translate(${-sx} ${-sy})`}>
    <g clipPath={`url(#${id}arm)`}>{canvas}</g>
   </g>
  </g>
 </g>;
}
function ClosureDoor({t,src,actor,progress,windowView}:{t:number;src:string;actor?:string;progress:number;windowView?:string}){
 const id=useId(),p=ease((progress-.18)/.95),bolt=ease((progress-1.12)/.35);
 const edge=948-161*p,top=589+28*p,bottom=1352+54*p,gripX=edge+23,gripY=981+8*p;
 const panel=`M${edge} ${top}L1027 609V1407L${edge} ${bottom}Z`;
 const inset=(v:number)=>edge+(1027-edge)*v;
 return <>
  {image(src,0,0,1080,1920,'xMidYMid slice')}
  {windowView&&<><Casement t={t} close={0} street={windowView} x={239} y={683}/><Curtain t={t} air={1} x={223} y={667}/></>}
  <defs><linearGradient id={id+'lace'}><stop stopColor="#6b4832"/><stop offset=".39" stopColor="#a7794e"/><stop offset=".72" stopColor="#5e3e2e"/><stop offset="1" stopColor="#322421"/></linearGradient><clipPath id={id+'wood'}><path d={panel}/></clipPath></defs>
  <path d={`M${edge-12} ${bottom}L1031 1406l-80 98-200-65Z`} fill="#26180e" opacity={.16+.09*p}/>
  <path d={panel} fill={`url(#${id}lace)`} stroke="#3e2a1c" strokeWidth="8"/>
  <g clipPath={`url(#${id}wood)`}>
   {Array.from({length:25},(_,i)=><path key={i} d={`M${inset(i/24)} 588Q${inset(i/24)+Math.sin(i*2)*7} 925 ${inset(i/24)-4} 1420`} stroke={i%2?'#e2ac73':'#3d261a'} strokeWidth={i%4===0?3:1.6} opacity={.33+rnd(i)*.17}/>)}
   <path d={`M${edge} ${top+94}L1027 699M${edge} ${bottom-112}L1027 1292`} stroke="#452e22" strokeWidth="14"/>
   <path d={`M${edge+11} ${top+27}V${bottom-26}`} stroke="#cc915a" opacity=".55" strokeWidth="5"/>
  </g>
  <rect x={gripX-12} y={gripY-15} width="42" height="30" rx="5" fill="#4c3c2c" stroke="#c09b65" strokeWidth="4"/>
  <path d={`M${gripX+9} ${gripY}h${-25-12*bolt}`} stroke="#dabb85" strokeWidth="9" strokeLinecap="round"/>
  {actor&&<ReachActor kind="door" src={actor} t={t} target={[gripX-7-5*bolt,gripY]} x={555-29*p} y={711} opacity={1}/>}
 </>;
}
function ClosureWindow({t,src,view,actor,progress}:{t:number;src:string;view:string;actor:string;progress:number}){
 const close=ease((progress-.20)/.98),flap=.18+.82*close;
 const gripX=623-173*flap,gripY=871;
 return <>
  <ClosureDoor t={t} src={src} progress={2}/>
  <Casement t={t} close={close} street={view} x={239} y={683}/>
  <Curtain t={t} air={1-.75*close} x={223} y={667}/>
  <ReachActor kind="window" src={actor} t={t} target={[gripX+4,gripY]} x={466-14*close} y={711} opacity={1}/>
 </>;
}
function DawnLight({amount}:{amount:number}){
 const id=useId();
 return <g opacity={amount}>
  <defs><linearGradient id={id+'light'} x1="0" y1="0" x2="1" y2="1">
   <stop stopColor="#edd4a4" stopOpacity=".34"/><stop offset=".79" stopColor="#ebc38a" stopOpacity=".11"/><stop offset="1" stopColor="#ead29f" stopOpacity="0"/>
  </linearGradient></defs>
  <path d="M300 601H658L1033 1403 733 1570 230 854Z" fill={`url(#${id}light)`} opacity=".68"/>
  <g transform={`translate(${23*amount} ${12*amount})`} style={{mixBlendMode:'screen'}}>
   {[0,1,2,3].map(column=>[0,1].map(row=>{
    const x=175+column*117+row*57,y=1311+row*125+column*9;
    return <path key={column*2+row} d={`M${x} ${y}l104 8 101 100-144-10Z`} fill={`url(#${id}light)`}/>;
   }))}
  </g>
 </g>;
}
const panelText=(t:string,x:number,y:number,fill='#e5ce9c',size=27)=>
 <text x={x} y={y} fontSize={size} fontFamily={MONO_FONT} textAnchor="middle" fill={fill}>{t}</text>;
export const AngithiWorld:React.FC<AngithiWorldProps>=({mode,art,cues,time:t})=>{
 const id=useId(),at=(key:string,fallback=0)=>cues[key]??fallback;
 const ramp=(key:string,d=1)=>ease((t-at(key))/d);
 const plate=(key:string)=>image(art[key],0,0,1080,1920,'xMidYMid slice');
 const bloom=.7+.12*Math.sin(t*4.3)+.09*Math.sin(t*6.9);
 const dawn=ramp('morning',2.45);
 const isNightReconstruction=t>=at('family')&&t<at('morning');
 const sleeperReveal=t>=at('family')?1:t<at('case')?ramp('sleep',.45):0;
 const closureProgress=t-(mode==='door'?(t>20?28:7.12):(t>20?30.08:9.01));
 const renderSleepers=()=> <>
  {plate('familyRoom')}
  {[0,1,2,3].map(i=>{
   const x=265+i*171,lift=(1-dawn)*Math.sin(t*(1.95+i*.17)+i*1.3)*3.2;
   return <g key={i}><defs><clipPath id={id+'quilt'+i}><ellipse cx={x} cy="1140" rx="58" ry="27"/></clipPath></defs>
    <g clipPath={`url(#${id}quilt${i})`}><g transform={`translate(0 ${lift})`}>{plate('familyRoom')}</g></g>
   </g>;
  })}
 </>;
 const card=ramp('alipur',.68)*(1-ramp('approach',.48));
 const focal=ease((t-at('co'))/2.45);
 const sensory=t>=at('noOdor')?'odor':t>=at('invisible')?'color':null;
 const senseProgress=sensory?ramp(sensory==='color'?'invisible':'noOdor',.4):0;
 const breathPulse=.5+.5*Math.sin(t*3.1);
 const particles=(count:number,y0:number,dy:number)=>Array.from({length:count},(_,i)=>{
  const p=wrap(t*.19+rnd(i+14)),x=-180+1450*p;
  return <ellipse key={i} cx={x} cy={y0+rnd(i+77)*dy+Math.sin(t+i)*23} rx={41+rnd(i+90)*116} ry={11+rnd(i+62)*25} fill={`url(#${id}cold)`} opacity={.07+.14*rnd(i+51)}/>;
 });
 return <svg width="100%" height="100%" viewBox="0 0 1080 1920" aria-hidden="true" style={{display:'block',overflow:'hidden'}}>
  <defs>
   <radialGradient id={id+'cold'}><stop stopColor="#b4d3d0" stopOpacity=".80"/><stop offset="1" stopColor="#82a6b2" stopOpacity="0"/></radialGradient>
   <radialGradient id={id+'warm'}><stop stopColor="#ffc276" stopOpacity=".45"/><stop offset=".5" stopColor="#f69848" stopOpacity=".23"/><stop offset="1" stopColor="#f57c41" stopOpacity="0"/></radialGradient>
   <linearGradient id={id+'plate'} x2="0" y2="1"><stop stopColor="#091f25"/><stop offset="1" stopColor="#194045"/></linearGradient>
   <linearGradient id={id+'vessel'} x2="0" y2="1"><stop stopColor="#965c54"/><stop offset=".42" stopColor="#311b25"/><stop offset="1" stopColor="#804546"/></linearGradient>
   <clipPath id={id+'vesselClip'}><rect x="72" y="721" width="936" height="483" rx="74"/></clipPath>
   <pattern id={id+'paper'} width="15" height="13" patternUnits="userSpaceOnUse"><path d="M1 3h9m3 7h-4" stroke="#bfb18c" strokeWidth=".6" opacity=".22"/></pattern>
  </defs>
  <rect width="1080" height="1920" fill={`url(#${id}plate)`}/>
  {mode==='street'&&<>{plate('street')}{particles(16,1075,610)}
   <ellipse cx="565" cy="881" rx="190" ry="225" fill={`url(#${id}warm)`} opacity={bloom*.63}/>
  </>}
  {mode==='door'&&<ClosureDoor t={t} src={art.closure} actor={art.doorActor} windowView={art.windowView} progress={closureProgress}/>}
  {mode==='window'&&<ClosureWindow t={t} src={art.closure} view={art.windowView} actor={art.windowActor} progress={closureProgress}/>}
  {mode==='room'&&<>
   {sleeperReveal<1&&plate('room')}
   {sleeperReveal>0&&<g opacity={sleeperReveal}>{renderSleepers()}</g>}
   <Casement t={t} close={t>=at('seal')?1:.48} street={art.windowView} daylight={dawn}/>
   <Curtain t={t} air={t>=at('seal')?.18:.65}/>
   <ellipse cx="193" cy="727" rx="215" ry="430" fill={`url(#${id}warm)`} opacity={bloom*.61*(1-dawn)}/>
   {dawn>0&&<DawnLight amount={dawn}/>}
   <CoalBrazier src={art.coal} t={t} x={526} y={1468} w={440} gain={1-dawn*.67}/>
   {isNightReconstruction&&t<at('family')+1.95&&[0,1,2,3].map(i=><g key={i} opacity={ease((t-at('family')-.20-i*.21)/.24)*(1-ease((t-at('family')-1.26)/.52))}>
    <circle cx={330+i*169} cy="898" r="21" fill="#253e3d" stroke="#e7c881" strokeWidth="2"/><Head x={330+i*169} y={906} size={24}>{i+1}</Head>
   </g>)}
  </>}
  {mode==='case'&&<>
   {plate('street')}{particles(10,1000,650)}
   <ellipse cx="563" cy="899" rx="180" ry="220" fill={`url(#${id}warm)`} opacity={bloom*.66}/>
   {t<at('alipur')&&<g opacity={ramp('locate',.45)} transform={`translate(563 ${815-24*ramp('locate',.5)})`}>
    <path d="M0 68C-10 46-39 20-39-6a39 39 0 0 1 78 0c0 26-29 52-39 74Z" fill="#a94f36" stroke="#f4cd83" strokeWidth="4"/>
    <circle cy="-7" r="13" fill="#f4cd83"/>
   </g>}
   {card>.002&&<g transform={`translate(${-170*(1-card)} ${160*(1-card)}) rotate(${-8*(1-card)} 540 1000)`} opacity={card}>
    <path d="M148 755h282l67 45h438v576H148Z" fill="#8f6844" stroke="#4b3f30" strokeWidth="6"/>
    <path d="M127 821H948l-21 506H156Z" fill="#e5cca0" stroke="#b19463" strokeWidth="5"/>
    <path d="M127 821H948l-21 506H156Z" fill={`url(#${id}paper)`}/>
    <Head y={932} size={34} color="#764535">14 JANUARY 2024</Head><Head y={1027} size={98} color="#233c40">ALIPUR</Head>
    <Head y={1101} size={45} color="#233c40">NORTH DELHI</Head>
    <path d="M250 1141h580" stroke="#b89a67" strokeWidth="3"/>
    {panelText('RECONSTRUCTION',540,1216,'#704c36',29)}
   </g>}
  </>}
  {mode==='chemistry'&&<>
   <g opacity=".29">{plate('room')}</g>
   <CoalBrazier src={art.coal} t={t} x={540} y={1368} w={655}/>
   {Array.from({length:12},(_,i)=>{
    const f=wrap(t*.43+i*.183),x=540+(rnd(i+11)-.5)*360+Math.sin(i+f*3)*f*75;
    return <g key={i} opacity={ramp('co',.85)*Math.sin(f*Math.PI)*.68*(1-senseProgress)} transform={`translate(${x} ${1196-f*520})`}>
     <circle r="23" fill="#304852" stroke="#e4bb67" strokeWidth="2"/>{panelText('CO',0,8,'#ffe3a0',17)}
    </g>;
   })}
   {focal>0&&senseProgress<1&&<g opacity={ramp('co',.34)*(1-senseProgress)} transform={`translate(${548+Math.sin(focal*3.14)*74} ${1132-355*focal}) scale(${.38+.62*focal})`}>
    <circle r="86" fill="#133139" fillOpacity=".91" stroke="#f1c17e" strokeWidth="4"/>
    <circle r="103" fill="none" stroke="#ebbd7d" strokeWidth="2" opacity={.53+.18*Math.sin(t*4)}/>
    <path d="M-70 72l-63 70" stroke="#f1c17e" strokeWidth="13" strokeLinecap="round"/>
    <circle cx="-28" r="29" fill="#78645d"/><circle cx="31" r="33" fill="#a95549"/>
    {panelText('C',-28,8,'#f8eacc',23)}{panelText('O',31,8,'#f8eacc',23)}
   </g>}
   {sensory&&<g opacity={senseProgress} transform={`translate(540 ${846+58*(1-senseProgress)})`}>
    <rect x="-205" y="-165" width="410" height="330" rx="22" fill="#17333a" stroke="#a18660" strokeWidth="4"/>
    {sensory==='color'?<>
     <path d="M-110-25Q0-128 110-25Q0 76-110-25Z" fill="none" stroke="#f4dcb0" strokeWidth="8"/>
     <circle cy="-25" r="33" fill="#f4dcb0"/><circle cy="-25" r="15" fill="#18333a"/>
    </>:<>
     <path d="M-14-100q13 52 42 85 14 25-24 25h-17q-31 28-68 10M60-71q48 25 17 60m33-59q50 30 16 78" fill="none" stroke="#f4dcb0" strokeWidth="8" strokeLinecap="round"/>
    </>}
    <path d="M-106 68L106-115" stroke="#e58667" strokeWidth="10" strokeLinecap="round"/>
    <Head x={0} y={118} size={47}>{sensory==='color'?'NO COLOR':'NO ODOR'}</Head>
   </g>}
   <Plaque y={1668} size={28}>CO MARKERS ARE A DIAGRAM</Plaque>
  </>}
  {mode==='breath'&&<>
   <g opacity=".22">{plate('room')}</g>
   <ellipse cx="547" cy="1040" rx="501" ry="646" fill={`url(#${id}cold)`} opacity=".43"/>
   {image(art.breathBody,190,529,700,1057,'none')}
   <g opacity=".74">
    <path d="M706 687C627 685 591 715 581 789S558 941 545 1057" fill="none" stroke="#211e25" strokeWidth="26"/>
    <path d="M706 687C627 685 591 715 581 789S558 941 545 1057" fill="none" stroke="#d99d80" strokeWidth="11"/>
   </g>
   <g opacity={.80+ramp('airway',1.3)*.18} transform={`translate(545 1211) scale(${1+breathPulse*.043} ${1+breathPulse*.075}) translate(-545 -1211)`}>
    <ellipse cx="545" cy="1211" rx="256" ry="225" fill="#263b43" opacity=".68"/>
    {image(art.lungs,327,1016,436,382)}
   </g>
   {Array.from({length:8},(_,i)=>{
    const f=wrap(t*.54+i/8),entry=f/.63,descent=(f-.63)/.37;
    const x=f<.63?913-332*entry:581-36*descent;
    const y=f<.63?687+102*entry**6:789+268*descent;
    return <g key={i} transform={`translate(${x} ${y})`} opacity={Math.sin(f*Math.PI)}><circle r="15" fill="#e7b76b"/>{panelText('CO',0,6,'#373025',13)}</g>;
   })}
   <Plaque y={1588} size={38}>{t<at('airway')?'INHALED WITH EACH BREATH':'INTO THE LUNGS'}</Plaque>
  </>}
  {mode==='blood'&&<>
   {plate('cells')}
   <rect width="1080" height="1920" fill="#101b24" opacity=".37"/>
   <g clipPath={`url(#${id}vesselClip)`}>
    <rect x="72" y="721" width="936" height="483" fill={`url(#${id}vessel)`}/>
    {Array.from({length:16},(_,i)=>{
     const f=wrap(t*.23+i*.117),s=.47+rnd(i+93)*.43,x=45+1080*f,y=780+rnd(i+4)*360+Math.sin(f*8+i)*25;
     return <g key={i} transform={`translate(${x} ${y}) rotate(${13*Math.sin(f*6+i)}) scale(${s} ${s*(.82+.13*Math.sin(f*12+i))})`} opacity={.39+rnd(i+89)*.46}>
     {image(art.redCell,-96,-64,192,128)}</g>;
    })}
   </g>
   <rect x="72" y="721" width="936" height="483" rx="74" fill="none" stroke="#c78270" strokeWidth="8"/>
   <g transform={`translate(540 1000) rotate(${Math.sin(t*1.3)*5})`}>
    {image(art.redCell,-192,-137,384,274)}
    {[-1,0,1].map((v,i)=>{
     const bound=ease((t-at('blood')-.75-i*.41)/1.02),m=36*(1-bound),x=v*95,y=-46;
     return <g key={i}>
      <g transform={`translate(${x-38*bound} ${y-112*bound})`} opacity={1-bound}><circle r="26" fill="#9ee5d3" stroke="#f3f7e4" strokeWidth="2"/>{panelText('O₂',0,8,'#1b4140',18)}</g>
      <g transform={`translate(${x+108*(1-bound)} ${y-m*2.5})`} opacity={bound}><circle r="25" fill="#e9b563" stroke="#fbe0a4" strokeWidth="2"/>{panelText('CO',0,8,'#3b312a',18)}</g>
     </g>;
    })}
   </g>
   <Plaque y={655} size={37}>CO BINDS TO HEMOGLOBIN</Plaque>
   <Plaque y={1422} size={34}>LESS OXYGEN REACHES TISSUES</Plaque>
   <rect x="180" y="1537" width="720" height="20" rx="10" fill="#354547"/>
   <rect x="180" y="1537" width={720-492*ramp('blood',3.1)} height="20" rx="10" fill="#93d7c4"/>
   {panelText('ILLUSTRATION • NOT A MEASUREMENT',540,1643,'#e6d4b0',24)}
  </>}
  {mode==='symptoms'&&<>
   {plate('symptomRoom')}
   <defs><clipPath id={id+'posture'}><path d="M411 700H720V1076H404Z"/></clipPath></defs>
   <g clipPath={`url(#${id}posture)`}><g transform={`rotate(${-1.75*ramp('weak',1.14)+Math.sin(t*2)*.45} 551 1055)`}>{plate('symptomRoom')}</g></g>
   {t<at('dizzy')&&<ellipse cx="614" cy="813" rx="119" ry="99" fill={`url(#${id}warm)`} opacity={.36+.25*Math.sin(t*6.4)}/>}
   {t>=at('dizzy')&&t<at('weak')&&<ellipse cx="541" cy="866" rx={298+30*Math.sin(t*5)} ry="360" stroke="#d0bd94" strokeWidth="22" fill="none" opacity=".13"/>}
   {t>=at('weak')&&t<at('faint')&&<ellipse cx="335" cy="1170" rx="97" ry="78" fill={`url(#${id}warm)`} opacity={.62*ramp('weak',.42)}/>}
   {t>=at('faint')&&<rect width="1080" height="1920" fill="#152023" opacity={ramp('faint',1.13)*.53}/>}
   <Plaque y={1700} size={33}>{t<at('dizzy')?'HEADACHE':t<at('weak')?'DIZZINESS':t<at('faint')?'WEAKNESS':'POSSIBLE FAINTING'}</Plaque>
  </>}
  {mode==='severity'&&<>
   {plate('symptomRoom')}<rect width="1080" height="1920" fill="#101f24" opacity=".78"/>
   <g transform="translate(540 1060)" opacity={ramp('high',.4)}>
    <path d="M0-240 267 218H-267Z" fill="#53302a" stroke="#e78662" strokeWidth="13" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1-ramp('high',.64)}/>
    <path d="M0-101V62" stroke="#f3ce9c" strokeWidth="29" strokeLinecap="round"/>
    <circle cy="139" r="15" fill="#f3ce9c"/>
    <path d="M-334 271H334" stroke="#56615b" strokeWidth="4"/>
    <path d={`M-334 271h${668*(1-ramp('severe',1.45))}`} stroke="#ed8764" strokeWidth="8"/>
   </g>
   <Plaque y={1580} size={35}>{t<at('severe')?'HIGH EXPOSURE':'CO POISONING CAN BE FATAL'}</Plaque>
  </>}
  {mode==='safety'&&<>
   {t<77.01?plate('room'):plate('familyRoom')}
   <Casement t={t} close={1} street={art.windowView}/><Curtain t={t} air={.16+.68*ramp('fan',.93)}/>
   {t<77.01&&<Door close={1} latch={1}/>}
   {t>=77.01&&<Fan t={t-at('fan')} blade={art.fanBlade} motor={art.fanMotor} x={523} y={603}/>}
   <CoalBrazier src={art.coal} t={t} x={520} y={1470} w={435}/>
   {t>at('fan')&&t<at('last')&&<g opacity={ramp('fan',.6)}>
    {[0,1,2].map(i=>{const f=wrap(t*.36+i/3),x=539+265*Math.sin(f*6.28),y=803+570*f;
     return <g key={i} transform={`translate(${x} ${y})`} opacity={.4+.5*Math.sin(Math.PI*f)}><circle r="23" fill="#394d50" stroke="#e1b05f" strokeWidth="2"/>{panelText('CO',0,7,'#fff0ba',19)}</g>;})}
   </g>}
   {t>=at('last')&&<g opacity={ramp('last',.6)}>
    <rect width="1080" height="1920" fill="#101c1d" opacity=".46"/>
    <g transform={`translate(520 1443) scale(${.85+ramp('last',.6)*.15})`}>
     <circle r="186" fill="none" stroke="#f08064" strokeWidth="17"/><path d="M-130 130L130-130" stroke="#f08064" strokeWidth="17"/>
    </g>
    <Plaque y={1720} size={36}>NEVER BURN CHARCOAL INDOORS</Plaque>
   </g>}
  </>}
 </svg>;
};
