import React,{useId} from "react";
import {Img,staticFile} from "remotion";

export const RibbonCutout: React.FC<{src:string;ratio:number;time:number;amplitude?:number;rooted?:boolean}> = ({src,ratio,time,amplitude=4.1,rooted})=>{
  const uid=useId(), url=staticFile(src);
  const divisions=16;
  const wave=(x:number)=>{
    if (rooted) return amplitude * Math.sin(x * 9 - time * 12) * x;
    const distanceFromHead=Math.min(1,Math.max(0,(.88-x)*2.6));
    return amplitude*distanceFromHead*Math.sin(x*14.4-time*6);
  };
  return <div style={{position:"relative",width:"100%",aspectRatio:ratio}}>
    <Img src={url} style={{position:"absolute",width:1,height:1,opacity:0}} />
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{display:"block",overflow:"visible"}} aria-hidden="true">
      {Array.from({length:divisions},(_,i)=>{
        const from=i/divisions, to=(i+1)/divisions;
        const step=(to-from)*100;
        const displacement=wave(from);
        const shear=(wave(to)-displacement)/step;
        const clip=uid+"-ribbon-"+i;
        return <g key={i} transform={`matrix(1 ${shear} 0 1 0 ${displacement-shear*from*100})`}>
          <defs><clipPath id={clip}><rect x={from*100} width={step+.45} height={100}/></clipPath></defs>
          <image href={url} width={100} height={100} preserveAspectRatio="none" clipPath={`url(#${clip})`}/>
        </g>;
      })}
    </svg>
  </div>;
};
