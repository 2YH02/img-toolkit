(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&o(r)}).observe(document,{childList:!0,subtree:!0});function l(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerPolicy&&(i.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?i.credentials="include":t.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(t){if(t.ep)return;t.ep=!0;const i=l(t);fetch(t.href,i)}})();const x=()=>{const e=document.getElementById("image-input"),n=document.getElementById("wating-text"),l=document.getElementById("image-preview"),o=t=>{const i=t.target;if(i.files&&i.files[0]){const r=i.files[0],d=new FileReader;d.onload=()=>{const u=document.querySelector(".image-text");u&&(u.textContent=r.name+` (${Math.ceil(r.size/1024)} kB)`)};const c=new URL(l.src).pathname;!c||c==="/img-toolkit/"||c==="/"?n.innerText="Please press the convert button!":n.style.display="none",d.readAsDataURL(r)}};e&&e.addEventListener("change",o)},y=(e,n,l,o)=>{const t=e.getImageData(0,0,n,l),i=t.data,r=i.length,d=o*2.5;for(let c=0;c<r;c+=4)i[c]=Math.min(255,i[c]*d),i[c+1]=Math.min(255,i[c+1]*d),i[c+2]=Math.min(255,i[c+2]*d);e.putImageData(t,0,0)},L=(e,n,l)=>{const o=e/n;let t,i;return l.width==="auto"&&l.height==="auto"?(t=e,i=n):l.width==="auto"?(i=l.height,t=i*o):l.height==="auto"?(t=l.width,i=t/o):(t=l.width,i=l.height),{width:t,height:i}},E=e=>{switch(e){case"webp":return"image/webp";case"png":return"image/png";case"jpg":default:return"image/jpeg"}},N=(e,n,l,o,t)=>{const i=(e.width-l)/t,r=(e.height-o)/t,d=document.createElement("canvas"),c=d.getContext("2d");if(c)for(let u=0;u<t;u++){const m=Math.round(e.width-i),s=Math.round(e.height-r);d.width=m,d.height=s,c.drawImage(e,0,0,e.width,e.height,0,0,m,s),e.width=m,e.height=s,n.clearRect(0,0,m,s),n.drawImage(d,0,0,m,s)}},P=async(e,n)=>new Promise((l,o)=>{(n.quality<0||n.quality>1)&&o(new Error("Please enter a value between 0 and 1"));const t=new FileReader;t.onload=i=>{var d;const r=new Image;r.onload=()=>{const c=n.width!==void 0?n.width:"auto",u=n.height!==void 0?n.height:"auto",{width:m,height:s}=L(r.width,r.height,{...n,width:c,height:u}),a=document.createElement("canvas");a.width=r.width,a.height=r.height;const f=a.getContext("2d");if(f){f.drawImage(r,0,0);const v=n.resampling??0;if(v>=1&&N(a,f,m,s,v),a.width!==m||a.height!==s){const g=document.createElement("canvas");g.width=m,g.height=s;const h=g.getContext("2d");if(h){h.drawImage(a,0,0,a.width,a.height,0,0,m,s),y(h,m,s,n.brightness??.4);const w=E(n.format);g.toBlob(p=>{if(p){const b=e.name.replace(/\.[^/.]+$/,"")+`.${n.format}`,B=new File([p],b,{type:w,lastModified:Date.now()});l(B)}else o(new Error("Canvas toBlob failed"))},w,n.quality)}else o(new Error("Failed to get 2D context for final canvas"))}else{y(f,m,s,n.brightness??.4);const g=E(n.format);a.toBlob(h=>{if(h){const w=e.name.replace(/\.[^/.]+$/,"")+`.${n.format}`,p=new File([h],w,{type:g,lastModified:Date.now()});l(p)}else o(new Error("Canvas toBlob failed"))},g,n.quality)}}else o(new Error("Failed to get 2D context"))},r.src=(d=i.target)==null?void 0:d.result},t.readAsDataURL(e)}),F=()=>{let e={height:"auto",width:550,quality:.7,format:"webp",resampling:0,brightness:.4};const n=document.getElementById("image-transform-button"),l=document.getElementById("image-input"),o=document.getElementById("image-preview"),t=document.getElementById("quality-input"),i=document.getElementById("height-input"),r=document.getElementById("width-input"),d=document.getElementById("format-input"),c=document.getElementById("brightness-input"),u=document.getElementById("resample-input"),m=document.getElementById("image-download-button");t.addEventListener("change",s=>{const a=s.target;Number(a.value)<0?(e.quality=0,t.value="0"):Number(a.value)>1?(e.quality=1,t.value="1"):e.quality=Number(a.value)}),i.addEventListener("change",s=>{const a=s.target;Number(a.value)<=0?(e.height="auto",i.value="0"):e.height=Number(a.value)}),r.addEventListener("change",s=>{const a=s.target;Number(a.value)<=0?(e.width="auto",r.value="0"):e.width=Number(a.value)}),d.addEventListener("change",s=>{const a=s.target;e.format=a.value}),c.addEventListener("change",s=>{const a=s.target;Number(a.value)<0?(e.brightness=0,c.value="0"):Number(a.value)>1?(e.brightness=1,c.value="1"):e.brightness=Number(a.value)}),u.addEventListener("change",s=>{const a=s.target;Number(a.value)<0?(e.resampling=0,u.value="0"):Number(a.value)>10?(e.resampling=10,u.value="10"):e.resampling=Number(a.value)}),n.addEventListener("click",async()=>{const s=l.files;if(s&&s.length>0){const a=document.getElementById("format-image-size"),f=document.getElementById("image-preview"),v=document.getElementById("wating-text"),g=s[0],h=await P(g,e);o&&(o.style.display="block");const w=URL.createObjectURL(h);o.src=w;const p=new URL(f.src).pathname;if(!p||p==="/")v.innerText="Please press the convert button!";else{const b=o.src;v.style.display="none",m.style.display="block",m.href=b,m.download=b.split("/")[b.split("/").length-1]}a.innerText=`${Math.floor(h.size/1024)} kB`}else console.log("No file selected.")})},q=`
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
  <div>
    <a class="button mt-3" id="image-download-button" style="display: none">download</a>
  </div>
</section>
`,C={content:q,scripts:[x,F]},M=`
<h1>Image Edit</h1>
`,R={content:M},z={"/":C,"/edit":R},I=()=>{const e=document.getElementById("app"),l=(window.location.hash||"#/").substring(1),o=z[l]||"Page Not Found";e&&(e.innerHTML=o.content,o.scripts&&o.scripts.map(t=>t()))};window.addEventListener("hashchange",I);window.addEventListener("load",I);
