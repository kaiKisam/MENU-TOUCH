(() => {
"use strict";
const $=id=>document.getElementById(id), panel=$("panel"), launcher=$("launcher"), dragbar=$("dragbar");
const defaults={menuEnabled:true,opacity:96,scale:100,aimEnabled:false,fov:12,smooth:65};
let config={...defaults};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function applyUI(){
 panel.style.opacity=config.opacity/100;
 panel.style.width=`min(${430*config.scale/100}px,calc(100vw - 28px))`;
 $("menuEnabled").checked=config.menuEnabled; $("opacity").value=config.opacity; $("opacityValue").textContent=config.opacity+"%";
 $("scale").value=config.scale; $("scaleValue").textContent=config.scale+"%";
 $("aimEnabled").checked=config.aimEnabled; $("fov").value=config.fov; $("fovValue").textContent=config.fov+"°";
 $("smooth").value=config.smooth; $("smoothValue").textContent=config.smooth+"%";
 panel.classList.toggle("hidden",!config.menuEnabled);
 $("status").textContent=config.aimEnabled?"AIM API ENABLED":"ALL SYSTEMS READY";
}
function save(){try{localStorage.setItem("zyon-touch-config-v1",JSON.stringify(config));$("savedState").textContent="SAVED";}catch(e){$("savedState").textContent="SESSION ONLY";}}
function applyAndSave(){applyUI();save();$("status").textContent="SETTINGS APPLIED";}
function update(k,v){config[k]=v;applyUI();$("savedState").textContent="UNAPPLIED"; }
function load(){try{const s=JSON.parse(localStorage.getItem("zyon-touch-config-v1")||"null");if(s)config={...defaults,...s};}catch(e){} config.opacity=clamp(+config.opacity||96,45,100);config.scale=clamp(+config.scale||100,80,120);config.fov=clamp(+config.fov||12,2,35);config.smooth=clamp(+config.smooth||65,5,100);applyUI();}
$("menuEnabled").onchange=e=>update("menuEnabled",e.target.checked);
$("opacity").oninput=e=>update("opacity",+e.target.value);
$("scale").oninput=e=>update("scale",+e.target.value);
$("aimEnabled").onchange=e=>update("aimEnabled",e.target.checked);
$("fov").oninput=e=>update("fov",+e.target.value);
$("smooth").oninput=e=>update("smooth",+e.target.value);
$("apply").onclick=applyAndSave;
$("close").onclick=$("minimize").onclick=()=>{panel.classList.add("hidden");launcher.hidden=false;};
launcher.onclick=()=>{panel.classList.remove("hidden");launcher.hidden=true;};
$("openGame").onclick=()=>{$("gamePicker").classList.remove("hidden");$("launchStatus").textContent="Chọn Free Fire hoặc Free Fire MAX.";};
$("pickerClose").onclick=()=> $("gamePicker").classList.add("hidden");
document.querySelectorAll(".game-choice").forEach(btn=>btn.addEventListener("click",()=>{
 const pkg=btn.dataset.package, scheme=btn.dataset.scheme;
 $("launchStatus").textContent="Đang yêu cầu Android mở "+btn.textContent.trim()+"…";
 // Android intent URL: works only in a compatible Android browser/WebView and if the app is installed.
 location.href=`intent://${scheme}/#Intent;scheme=${scheme};package=${pkg};action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;end`;
 setTimeout(()=>{$("launchStatus").textContent="Nếu game không mở, hãy kiểm tra ứng dụng đã được cài đặt và WebView cho phép mở liên kết ứng dụng.";},1800);
}));
let drag=null;
dragbar.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;const r=panel.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,left:r.left,top:r.top};dragbar.setPointerCapture(e.pointerId);});
dragbar.addEventListener("pointermove",e=>{if(!drag)return;panel.style.left=clamp(drag.left+e.clientX-drag.x,5,innerWidth-panel.offsetWidth-5)+"px";panel.style.top=clamp(drag.top+e.clientY-drag.y,5,innerHeight-panel.offsetHeight-5)+"px";panel.style.transform="none";});
["pointerup","pointercancel"].forEach(ev=>dragbar.addEventListener(ev,()=>drag=null));
function selectTarget(candidates,currentAngle=0){if(!config.aimEnabled||!Array.isArray(candidates))return null;return candidates.filter(t=>t&&t.visible===true&&t.isOpponent===true&&Number.isFinite(t.angleDeg)&&Math.abs(t.angleDeg-currentAngle)<=config.fov).sort((a,b)=>Math.abs(a.angleDeg-currentAngle)-Math.abs(b.angleDeg-currentAngle))[0]||null;}
function getSuggestedAngle(current,target){if(!config.aimEnabled||!Number.isFinite(current)||!Number.isFinite(target))return current;return current+(target-current)*(1-config.smooth/100);}
window.ZYONAimAssist=Object.freeze({get enabled(){return config.aimEnabled;},get settings(){return Object.freeze({fov:config.fov,smoothing:config.smooth});},selectTarget,getSuggestedAngle});
load();
})();