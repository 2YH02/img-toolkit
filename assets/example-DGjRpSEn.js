(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))r(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function l(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerPolicy&&(i.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?i.credentials="include":t.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(t){if(t.ep)return;t.ep=!0;const i=l(t);fetch(t.href,i)}})();const x=()=>{const e=document.getElementById("image-input"),n=document.getElementById("wating-text"),l=document.getElementById("image-preview"),r=t=>{const i=t.target;if(i.files&&i.files[0]){const o=i.files[0],d=new FileReader;d.onload=()=>{const u=document.querySelector(".image-text");u&&(u.textContent=o.name+` (${Math.ceil(o.size/1024)} kB)`)};const c=new URL(l.src).pathname;!c||c==="/"?n.innerText="Please press the convert button!":n.style.display="none",d.readAsDataURL(o)}};e&&e.addEventListener("change",r)},b=(e,n,l,r)=>{const t=e.getImageData(0,0,n,l),i=t.data,o=i.length,d=r*2.5;for(let c=0;c<o;c+=4)i[c]=Math.min(255,i[c]*d),i[c+1]=Math.min(255,i[c+1]*d),i[c+2]=Math.min(255,i[c+2]*d);e.putImageData(t,0,0)},L=(e,n,l)=>{const r=e/n;let t,i;return l.width==="auto"&&l.height==="auto"?(t=e,i=n):l.width==="auto"?(i=l.height,t=i*r):l.height==="auto"?(t=l.width,i=t/r):(t=l.width,i=l.height),{width:t,height:i}},y=e=>{switch(e){case"webp":return"image/webp";case"png":return"image/png";case"jpg":default:return"image/jpeg"}},N=(e,n,l,r,t)=>{const i=(e.width-l)/t,o=(e.height-r)/t,d=document.createElement("canvas"),c=d.getContext("2d");if(c)for(let u=0;u<t;u++){const s=Math.round(e.width-i),a=Math.round(e.height-o);d.width=s,d.height=a,c.drawImage(e,0,0,e.width,e.height,0,0,s,a),e.width=s,e.height=a,n.clearRect(0,0,s,a),n.drawImage(d,0,0,s,a)}},P=async(e,n)=>new Promise((l,r)=>{(n.quality<0||n.quality>1)&&r(new Error("Please enter a value between 0 and 1"));const t=new FileReader;t.onload=i=>{var d;const o=new Image;o.onload=()=>{const c=n.width!==void 0?n.width:"auto",u=n.height!==void 0?n.height:"auto",{width:s,height:a}=L(o.width,o.height,{...n,width:c,height:u}),m=document.createElement("canvas");m.width=o.width,m.height=o.height;const p=m.getContext("2d");if(p){p.drawImage(o,0,0);const v=n.resampling??0;if(v>=1&&N(m,p,s,a,v),m.width!==s||m.height!==a){const g=document.createElement("canvas");g.width=s,g.height=a;const h=g.getContext("2d");if(h){h.drawImage(m,0,0,m.width,m.height,0,0,s,a),b(h,s,a,n.brightness??.4);const f=y(n.format);g.toBlob(w=>{if(w){const I=e.name.replace(/\.[^/.]+$/,"")+`.${n.format}`,B=new File([w],I,{type:f,lastModified:Date.now()});l(B)}else r(new Error("Canvas toBlob failed"))},f,n.quality)}else r(new Error("Failed to get 2D context for final canvas"))}else{b(p,s,a,n.brightness??.4);const g=y(n.format);m.toBlob(h=>{if(h){const f=e.name.replace(/\.[^/.]+$/,"")+`.${n.format}`,w=new File([h],f,{type:g,lastModified:Date.now()});l(w)}else r(new Error("Canvas toBlob failed"))},g,n.quality)}}else r(new Error("Failed to get 2D context"))},o.src=(d=i.target)==null?void 0:d.result},t.readAsDataURL(e)}),F=()=>{let e={height:"auto",width:550,quality:.7,format:"webp",resampling:0,brightness:.4};const n=document.getElementById("image-transform-button"),l=document.getElementById("image-input"),r=document.getElementById("image-preview"),t=document.getElementById("quality-input"),i=document.getElementById("height-input"),o=document.getElementById("width-input"),d=document.getElementById("format-input"),c=document.getElementById("brightness-input"),u=document.getElementById("resample-input");t.addEventListener("change",s=>{const a=s.target;Number(a.value)<0?(e.quality=0,t.value="0"):Number(a.value)>1?(e.quality=1,t.value="1"):e.quality=Number(a.value)}),i.addEventListener("change",s=>{const a=s.target;Number(a.value)<=0?(e.height="auto",i.value="0"):e.height=Number(a.value)}),o.addEventListener("change",s=>{const a=s.target;Number(a.value)<=0?(e.width="auto",o.value="0"):e.width=Number(a.value)}),d.addEventListener("change",s=>{const a=s.target;e.format=a.value}),c.addEventListener("change",s=>{const a=s.target;Number(a.value)<0?(e.brightness=0,c.value="0"):Number(a.value)>1?(e.brightness=1,c.value="1"):e.brightness=Number(a.value)}),u.addEventListener("change",s=>{const a=s.target;Number(a.value)<0?(e.resampling=0,u.value="0"):Number(a.value)>10?(e.resampling=10,u.value="10"):e.resampling=Number(a.value)}),n.addEventListener("click",async()=>{const s=l.files;if(s&&s.length>0){const a=document.getElementById("format-image-size"),m=document.getElementById("image-preview"),p=document.getElementById("wating-text"),v=s[0],g=await P(v,e);r&&(r.style.display="block");const h=URL.createObjectURL(g);r.src=h;const f=new URL(m.src).pathname;!f||f==="/"?p.innerText="Please press the convert button!":p.style.display="none",a.innerText=`${Math.floor(g.size/1024)} kB`}else console.log("No file selected.")})},q=`
<h1 class="max-width mx-auto">Image Resize</h1>
<section class="container image-form-wrap">
  <div class="image-form">
    <div class="choose-file">
      <p>File Upload</p>
      <div class="divider"></div>
      <div class="image-input-wrap">
        <label for="image-input" class="button">Select File</label>
        <input type="file" id="image-input" accept="image/*" style="display: none"/>
        <p class="ml-3 image-text"></p>
      </div>
    </div>
    <div class="choose-file">
      <p>option</p>
      <div class="divider"></div>
      <div class="center mb-3">
        <div class="center option-input-wrap mr-3">
          <label for="quality-input">quality</label>
          <input type="number" id="quality-input" min="0.1" max="1" step="0.05" value="0.7"/>
        </div>
        <div class="center option-input-wrap">
          <label for="brightness-input">brightness</label>
          <input type="number" id="brightness-input" min="0.1" max="1" step="0.05" value="0.4"/>
        </div>
      </div>
      <div class="size-input-wrap mb-1">
        <div class="center mr-3 option-input-wrap">
          <label for="width-input">width</label>
          <input type="number" id="width-input" step="10" value="550"/>
        </div>
        <div class="center option-input-wrap">
          <label for="height-input">height</label>
          <input type="number" id="height-input" step="10" value="0"/>
        </div>
      </div>
      <div class="mb-3 color-main font-4">
        If either width or height is set to 0, it will be automatically adjusted to maintain the aspect ratio
      </div>
      <div class="center option-input-wrap mb-3">
        <label for="resample-input">resample</label>
        <input type="number" id="resample-input" min="0" max="10" step="1" value="0"/>
      </div>
      <div class="center option-input-wrap">
        <label for="format-input">format</label>
        <select id="format-input" name="imageFormat">
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp" selected>WEBP</option>
        </select>
      </div>
    </div>
    <div>
      <button class="button" id="image-transform-button">Convert</button>
    </div>
  </div>
</section>
<section class="container image-preview-wrap">
  <p id="format-image-size" class="mb-3"></p>
  <div id="preview-container">
    <img
      id="image-preview"
      src=""
      alt="Image Preview"
      style="display: none"
    />
  </div>
  <p class="color-main font-6" id="wating-text">Waiting for photo selection...</p>
</section>
`,C={content:q,scripts:[x,F]},M=`
<h1>Image Edit</h1>
`,R={content:M},z={"/":C,"/edit":R},E=()=>{const e=document.getElementById("app"),l=(window.location.hash||"#/").substring(1),r=z[l]||"Page Not Found";e&&(e.innerHTML=r.content,r.scripts&&r.scripts.map(t=>t()))};window.addEventListener("hashchange",E);window.addEventListener("load",E);
