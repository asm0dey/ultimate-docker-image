import{j as L,k as w}from"../modules/unplugin-icons-DahtZTTW.js";import{d as E,t as I,P as N,E as y,M as B,A as v,aP as M,o as c,b as _,f as q,C as u,c as C,g as V,i as $,h as z}from"../modules/vue-CIkDTG0q.js";import{v as k,al as D,C as K,ao as P,ap as R}from"../index-CmvFqjLi.js";import{u as j}from"./context-C6S-lFxX.js";const U=["title"],O=E({__name:"CodeBlockWrapper",props:{ranges:{type:Array,default:()=>[]},finally:{type:[String,Number],default:"last"},startLine:{type:Number,default:1},lines:{type:Boolean,default:k.lineNumbers},at:{type:[String,Number],default:"+1"},maxHeight:{type:String,default:void 0}},setup(S){const e=S,{$clicksContext:a}=j(),n=I(),d=D();N(()=>{a.unregister(d)}),y(()=>{var t;(t=n.value)==null||t.classList.toggle("slidev-code-line-numbers",e.lines)}),B(()=>{var r;if(!a||!((r=e.ranges)!=null&&r.length))return;const t=a.calculateSince(e.at,e.ranges.length-1);a.register(d,t);const o=v(()=>t?Math.max(0,a.current-t.start+1):K),s=v(()=>e.finally==="last"?e.ranges.at(-1):e.finally.toString());y(()=>{if(!n.value)return;let i=e.ranges[o.value]??s.value;const g=i==="hide";n.value.classList.toggle(P,g),g&&(i=e.ranges[o.value+1]??s.value);const f=n.value.querySelector(".shiki"),h=Array.from(f.querySelectorAll("code > .line")),A=h.length;if(R(i,A,e.startLine,l=>[h[l]]),e.maxHeight){const l=Array.from(f.querySelectorAll(".line.highlighted"));l.reduce((m,H)=>H.offsetHeight+m,0)>n.value.offsetHeight?l[0].scrollIntoView({behavior:"smooth",block:"start"}):l.length>0&&l[Math.round((l.length-1)/2)].scrollIntoView({behavior:"smooth",block:"center"})}})});const{copied:p,copy:b}=M();function x(){var o,s;const t=(s=(o=n.value)==null?void 0:o.querySelector(".slidev-code"))==null?void 0:s.textContent;t&&b(t)}return(t,o)=>{const s=L,r=w;return c(),_("div",{ref_key:"el",ref:n,class:$(["slidev-code-wrapper relative group",{"slidev-code-line-numbers":e.lines}]),style:z({"max-height":e.maxHeight,"overflow-y":e.maxHeight?"scroll":void 0,"--start":e.startLine})},[q(t.$slots,"default"),u(k).codeCopy?(c(),_("button",{key:0,class:"slidev-code-copy absolute top-0 right-0 transition opacity-0 group-hover:opacity-20 hover:!opacity-100",title:u(p)?"Copied":"Copy",onClick:o[0]||(o[0]=i=>x())},[u(p)?(c(),C(s,{key:0,class:"p-2 w-8 h-8"})):(c(),C(r,{key:1,class:"p-2 w-8 h-8"}))],8,U)):V("v-if",!0)],6)}}});export{O as _};
