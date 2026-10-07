(()=>{var ot={CANVAS_WIDTH:720,CANVAS_HEIGHT:1280,TRACK_COUNT:3,LANE_WIDTH:3.2,LANE_SWITCH_SPEED:16,CAMERA:{FOV:60,NEAR:.1,FAR:280,OFFSET_X:0,OFFSET_Y:3.8,OFFSET_Z:-6.4,LOOK_OFFSET_Y:1.4,LOOK_OFFSET_Z:14},SPEED:{INITIAL:26,MAX:56,ACCELERATION:.45,RUSH_SPEED:65},PLAYER:{COLLIDER_WIDTH:1.1,COLLIDER_HEIGHT:1.85,COLLIDER_DEPTH:1,GRAVITY:36,JUMP_FORCE:14.5,SUPER_JUMP_FORCE:21,SLIDE_DURATION:.72,SLIDE_HEIGHT:.85},WORLD:{CHUNK_LENGTH:48,VISIBLE_CHUNKS:7,TRAIN_HEIGHT:2.45,TRAIN_WIDTH:2.65,TRAIN_LENGTH:15,RAMP_LENGTH:11.5,RAMP_HEIGHT:2.45,LONG_VEHICLE_LENGTH:220,VEHICLE_ROOF_FIRST_BARRIER:40,VEHICLE_ROOF_BARRIER_GAP:100,VEHICLE_ROUTE_EXIT_GAP:35},PROP_DURATION:{MILK:6,MAGNET:8,SHOE:8,SHIELD:999,FLIGHT:8},FLIGHT:{HEIGHT:12,LANDING_DURATION:1.1,LANDING_GRACE:1.5},MAGNET_RANGE:16,THEME:{SKY_COLOR:7390719,FOG_COLOR:16774885,SUN_COLOR:16775912,SAND_COLOR:16181972,STONE_COLOR:16774108,STONE_TRIM:15851451,RAIL_COLOR:16120058,WOOD_COLOR:9268835,AWNING_BLUE:623843,AWNING_WHITE:16777215,PALM_GREEN:3069299,TRAIN_BODY:16777215,TRAIN_STRIPE:623843,GOLD_COIN:16765738}};var Rl=class{constructor(){this.env=this.detectEnvironment(),this.canvas=null,this.ctx=null,this.systemInfo=null,this.touchListeners=[],this.keyListeners=[]}detectEnvironment(){return typeof wx<"u"&&wx.createCanvas?"wechat":typeof tt<"u"&&tt.createCanvas?"douyin":"browser"}initCanvas(t=null,e="webgl"){return this.env==="wechat"?(this.canvas=t||wx.createCanvas(),this.systemInfo=wx.getSystemInfoSync()):this.env==="douyin"?(this.canvas=t||tt.createCanvas(),this.systemInfo=tt.getSystemInfoSync()):(this.canvas=t||document.getElementById("gameCanvas"),this.updateBrowserSystemInfo()),e==="2d"&&this.canvas&&(this.ctx=this.canvas.getContext("2d",{alpha:!1})),this.setupInputListeners(),{canvas:this.canvas,ctx:this.ctx}}updateBrowserSystemInfo(){this.env==="browser"&&(this.systemInfo={windowWidth:window.innerWidth,windowHeight:window.innerHeight,pixelRatio:window.devicePixelRatio||1})}getWindowSize(){return this.env==="browser"&&this.updateBrowserSystemInfo(),{width:this.systemInfo?this.systemInfo.windowWidth:720,height:this.systemInfo?this.systemInfo.windowHeight:1280,pixelRatio:this.systemInfo&&this.systemInfo.pixelRatio||1}}getStorage(t,e=null){try{if(this.env==="wechat"){let i=wx.getStorageSync(t);return i!==""&&i!==void 0?i:e}else if(this.env==="douyin"){let i=tt.getStorageSync(t);return i!==""&&i!==void 0?i:e}else{let i=localStorage.getItem(t);return i!==null?JSON.parse(i):e}}catch(i){return console.warn("Storage read failed:",i),e}}setStorage(t,e){try{return this.env==="wechat"?wx.setStorageSync(t,e):this.env==="douyin"?tt.setStorageSync(t,e):localStorage.setItem(t,JSON.stringify(e)),!0}catch(i){return console.warn("Storage write failed:",i),!1}}setupInputListeners(){let t=0,e=0,i=0,n=(a,l)=>{t=a,e=l,i=Date.now(),this.notifyTouch("start",{x:a,y:l})},s=(a,l)=>{this.notifyTouch("move",{x:a,y:l})},o=(a,l)=>{let c=a-t,h=l-e,u=Date.now()-i;Math.hypot(c,h)>30&&u<600?Math.abs(c)>Math.abs(h)?c>0?this.notifyGesture("swipe_right"):this.notifyGesture("swipe_left"):h<0?this.notifyGesture("swipe_up"):this.notifyGesture("swipe_down"):this.notifyGesture("tap",{x:a,y:l}),this.notifyTouch("end",{x:a,y:l})};if(this.env==="wechat")wx.onTouchStart(a=>{a.touches&&a.touches[0]&&n(a.touches[0].clientX,a.touches[0].clientY)}),wx.onTouchMove(a=>{a.touches&&a.touches[0]&&s(a.touches[0].clientX,a.touches[0].clientY)}),wx.onTouchEnd(a=>{a.changedTouches&&a.changedTouches[0]&&o(a.changedTouches[0].clientX,a.changedTouches[0].clientY)});else if(this.env==="douyin")tt.onTouchStart(a=>{a.touches&&a.touches[0]&&n(a.touches[0].clientX,a.touches[0].clientY)}),tt.onTouchMove(a=>{a.touches&&a.touches[0]&&s(a.touches[0].clientX,a.touches[0].clientY)}),tt.onTouchEnd(a=>{a.changedTouches&&a.changedTouches[0]&&o(a.changedTouches[0].clientX,a.changedTouches[0].clientY)});else{let a=this.canvas;if(!a)return;a.addEventListener("touchstart",c=>{c.preventDefault();let h=a.getBoundingClientRect(),u=c.touches[0];n(u.clientX-h.left,u.clientY-h.top)},{passive:!1}),a.addEventListener("touchmove",c=>{c.preventDefault();let h=a.getBoundingClientRect(),u=c.touches[0];s(u.clientX-h.left,u.clientY-h.top)},{passive:!1}),a.addEventListener("touchend",c=>{c.preventDefault();let h=a.getBoundingClientRect(),u=c.changedTouches[0];o(u.clientX-h.left,u.clientY-h.top)},{passive:!1});let l=!1;a.addEventListener("mousedown",c=>{l=!0;let h=a.getBoundingClientRect();n(c.clientX-h.left,c.clientY-h.top)}),window.addEventListener("mousemove",c=>{if(!l)return;let h=a.getBoundingClientRect();s(c.clientX-h.left,c.clientY-h.top)}),window.addEventListener("mouseup",c=>{if(!l)return;l=!1;let h=a.getBoundingClientRect();o(c.clientX-h.left,c.clientY-h.top)}),window.addEventListener("keydown",c=>{["ArrowLeft","KeyA"].includes(c.code)?this.notifyGesture("swipe_left"):["ArrowRight","KeyD"].includes(c.code)?this.notifyGesture("swipe_right"):["ArrowUp","KeyW","Space"].includes(c.code)?this.notifyGesture("swipe_up"):["ArrowDown","KeyS"].includes(c.code)&&this.notifyGesture("swipe_down")})}}onGesture(t){this.touchListeners.push(t)}notifyGesture(t,e=null){for(let i of this.touchListeners)i(t,e)}notifyTouch(t,e){}vibrate(t=!0){try{this.env==="wechat"?t?wx.vibrateShort({type:"medium"}):wx.vibrateLong():this.env==="douyin"?t?tt.vibrateShort():tt.vibrateLong():typeof navigator<"u"&&navigator.vibrate&&navigator.vibrate(t?25:80)}catch{}}},he=new Rl;var kh="assets/audio/naiwa-sunny-run.mp3",Cl=class{constructor(){this.ctx=null,this.isMuted=he.getStorage("naiwa_muted",!1),this.bgmRequested=!1,this.bgmPlaying=!1,this.bgmInterval=null,this.bgmPlayer=null,this.bgmPlayerKind=null,this.bgmFileFailed=!1,this.bgmGeneration=0,this.comboCount=0,this.lastCoinTime=0,this.initialized=!1}init(){if(!this.initialized)try{let t=typeof window<"u"&&(window.AudioContext||window.webkitAudioContext);t&&(this.ctx=new t,this.initialized=!0)}catch(t){console.warn("AudioContext not supported:",t)}}resume(){if(this.initialized||this.init(),this.ctx&&this.ctx.state==="suspended")try{this.ctx.resume()?.catch?.(()=>{})}catch{}this.canPlayBGM()&&!this.bgmPlaying&&this.playBGM()}toggleMute(){return this.isMuted=!this.isMuted,he.setStorage("naiwa_muted",this.isMuted),this.isMuted?this.pauseBGM():this.resume(),this.isMuted}playCoin(){if(this.isMuted||(this.resume(),!this.ctx))return;let t=Date.now();t-this.lastCoinTime<800?this.comboCount=Math.min(this.comboCount+1,12):this.comboCount=0,this.lastCoinTime=t;let e=587.33,i=[1,1.122,1.259,1.498,1.681,2,2.24,2.51,2.99,3.36,4],n=e*(i[this.comboCount%i.length]||1),s=this.ctx.createOscillator(),o=this.ctx.createGain();s.type="triangle",s.frequency.setValueAtTime(n,this.ctx.currentTime),s.frequency.exponentialRampToValueAtTime(n*1.5,this.ctx.currentTime+.12),o.gain.setValueAtTime(.2,this.ctx.currentTime),o.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+.12),s.connect(o),o.connect(this.ctx.destination),s.start(),s.stop(this.ctx.currentTime+.13)}playJump(){if(this.isMuted||(this.resume(),!this.ctx))return;let t=this.ctx.createOscillator(),e=this.ctx.createGain();t.type="sine",t.frequency.setValueAtTime(220,this.ctx.currentTime),t.frequency.exponentialRampToValueAtTime(880,this.ctx.currentTime+.22),e.gain.setValueAtTime(.25,this.ctx.currentTime),e.gain.linearRampToValueAtTime(.01,this.ctx.currentTime+.22),t.connect(e),e.connect(this.ctx.destination),t.start(),t.stop(this.ctx.currentTime+.23)}playSlide(){if(this.isMuted||(this.resume(),!this.ctx))return;let t=this.ctx.createOscillator(),e=this.ctx.createGain();t.type="sawtooth",t.frequency.setValueAtTime(450,this.ctx.currentTime),t.frequency.exponentialRampToValueAtTime(110,this.ctx.currentTime+.3),e.gain.setValueAtTime(.18,this.ctx.currentTime),e.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+.3),t.connect(e),e.connect(this.ctx.destination),t.start(),t.stop(this.ctx.currentTime+.31)}playSwitch(){if(this.isMuted||(this.resume(),!this.ctx))return;let t=this.ctx.createOscillator(),e=this.ctx.createGain();t.type="sine",t.frequency.setValueAtTime(400,this.ctx.currentTime),t.frequency.linearRampToValueAtTime(300,this.ctx.currentTime+.08),e.gain.setValueAtTime(.12,this.ctx.currentTime),e.gain.linearRampToValueAtTime(.001,this.ctx.currentTime+.08),t.connect(e),e.connect(this.ctx.destination),t.start(),t.stop(this.ctx.currentTime+.09)}playProp(){if(this.isMuted||(this.resume(),!this.ctx))return;[523.25,659.25,783.99,1046.5].forEach((e,i)=>{let n=this.ctx.createOscillator(),s=this.ctx.createGain();n.type="sine",n.frequency.setValueAtTime(e,this.ctx.currentTime+i*.06),s.gain.setValueAtTime(.2,this.ctx.currentTime+i*.06),s.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+i*.06+.3),n.connect(s),s.connect(this.ctx.destination),n.start(this.ctx.currentTime+i*.06),n.stop(this.ctx.currentTime+i*.06+.32)})}playCrash(){if(this.isMuted||(this.resume(),!this.ctx))return;let t=this.ctx.createOscillator(),e=this.ctx.createGain();t.type="sawtooth",t.frequency.setValueAtTime(140,this.ctx.currentTime),t.frequency.exponentialRampToValueAtTime(25,this.ctx.currentTime+.45),e.gain.setValueAtTime(.4,this.ctx.currentTime),e.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+.45),t.connect(e),e.connect(this.ctx.destination),t.start(),t.stop(this.ctx.currentTime+.46)}playLaugh(){if(this.isMuted||(this.resume(),!this.ctx))return;let t=5;for(let e=0;e<t;e++){let i=this.ctx.currentTime+e*.11,n=this.ctx.createOscillator(),s=this.ctx.createGain();n.type="sawtooth";let o=360+e%2*50;n.frequency.setValueAtTime(o,i),n.frequency.exponentialRampToValueAtTime(o-80,i+.09),s.gain.setValueAtTime(.25,i),s.gain.linearRampToValueAtTime(.01,i+.09),n.connect(s),s.connect(this.ctx.destination),n.start(i),n.stop(i+.1)}}playInteract(){if(this.isMuted||(this.resume(),!this.ctx))return;[523.25,659.25,783.99,1046.5].forEach((e,i)=>{let n=this.ctx.createOscillator(),s=this.ctx.createGain();n.type="sine",n.frequency.setValueAtTime(e,this.ctx.currentTime+i*.05),s.gain.setValueAtTime(.2,this.ctx.currentTime+i*.05),s.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+i*.05+.18),n.connect(s),s.connect(this.ctx.destination),n.start(this.ctx.currentTime+i*.05),n.stop(this.ctx.currentTime+i*.05+.2)})}playStartRun(){if(this.isMuted||(this.resume(),!this.ctx))return;[440,554.37,659.25,880].forEach((e,i)=>{let n=this.ctx.createOscillator(),s=this.ctx.createGain();n.type="triangle",n.frequency.setValueAtTime(e,this.ctx.currentTime+i*.07),s.gain.setValueAtTime(.28,this.ctx.currentTime+i*.07),s.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+i*.07+.3),n.connect(s),s.connect(this.ctx.destination),n.start(this.ctx.currentTime+i*.07),n.stop(this.ctx.currentTime+i*.07+.32)})}startBGM(){this.bgmRequested=!0,this.resume()}canPlayBGM(){return this.bgmRequested&&!this.isMuted&&!(typeof document<"u"&&document.hidden)}createBGMPlayer(){if(this.bgmPlayer||this.bgmFileFailed)return this.bgmPlayer;try{let t=he.env==="wechat"&&typeof wx<"u"?wx:he.env==="douyin"&&typeof tt<"u"?tt:null;if(t?.createInnerAudioContext)this.bgmPlayer=t.createInnerAudioContext(),this.bgmPlayerKind="native",this.bgmPlayer.onError?.(e=>this.failFileBGM(e)),this.bgmPlayer.src=kh;else if(he.env==="browser"&&typeof window<"u"&&typeof window.Audio=="function")this.bgmPlayer=new window.Audio(`./${kh}`),this.bgmPlayerKind="browser",this.bgmPlayer.preload="auto",this.bgmPlayer.addEventListener("error",()=>this.failFileBGM(this.bgmPlayer?.error));else return this.bgmFileFailed=!0,null;return this.bgmPlayer.loop=!0,this.bgmPlayer.autoplay=!1,this.bgmPlayer.volume=.34,this.bgmPlayer}catch(t){return this.failFileBGM(t),null}}playBGM(){if(!this.canPlayBGM()||this.bgmPlaying)return;let t=this.createBGMPlayer();if(!t||this.bgmFileFailed){this.startSynthBGM();return}let e=++this.bgmGeneration;this.bgmPlaying=!0;try{t.play()?.then?.(()=>{e!==this.bgmGeneration||!this.canPlayBGM()||(this.bgmPlaying=!0)}).catch(n=>{e===this.bgmGeneration&&(this.bgmPlaying=!1,!(n?.name==="NotAllowedError"||n?.name==="AbortError")&&this.failFileBGM(n))})}catch(i){e===this.bgmGeneration&&this.failFileBGM(i)}}failFileBGM(t){this.bgmFileFailed||(this.bgmFileFailed=!0,this.pauseBGM(),console.warn("File BGM unavailable; using synthesized music:",t),this.canPlayBGM()&&this.startSynthBGM())}startSynthBGM(){if(!this.canPlayBGM()||this.bgmInterval!==null||!this.ctx)return;this.bgmPlaying=!0;let t=[261.63,329.63,392,329.63,440,392,329.63,293.66,261.63,329.63,392,523.25,493.88,392,440,392],e=0;this.bgmInterval=setInterval(()=>{if(!this.canPlayBGM()||!this.bgmPlaying||!this.ctx)return;let i=t[e%t.length],n=this.ctx.createOscillator(),s=this.ctx.createGain();n.type="square",n.frequency.setValueAtTime(i,this.ctx.currentTime),s.gain.setValueAtTime(.04,this.ctx.currentTime),s.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+.16),n.connect(s),s.connect(this.ctx.destination),n.start(),n.stop(this.ctx.currentTime+.18),e++},180)}pauseBGM(t=!1){if(this.bgmGeneration++,this.bgmPlaying=!1,this.bgmInterval!==null&&(clearInterval(this.bgmInterval),this.bgmInterval=null),!!this.bgmPlayer)try{t&&this.bgmPlayerKind==="native"?this.bgmPlayer.stop():(this.bgmPlayer.pause(),t&&(this.bgmPlayer.currentTime=0))}catch{}}stopBGM({reset:t=!1}={}){this.bgmRequested=!1,this.pauseBGM(t)}},fe=new Cl;/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */var bu=0,fc=1,Mu=2;var vr=1,qo=2,_s=3,gn=0,ke=1,Fe=2,zi=0,vs=1,pc=2,mc=3,gc=4,Su=5;var Nn=100,Eu=101,Tu=102,wu=103,Au=104,Ru=200,Cu=201,Iu=202,Pu=203,xc=204,yc=205,Lu=206,Du=207,Nu=208,Fu=209,Ou=210,Uu=211,Bu=212,ku=213,Hu=214,ho=0,uo=1,fo=2,as=3,po=4,mo=5,go=6,xo=7,_c=0,Gu=1,zu=2,Pi=0,vc=1,bc=2,Mc=3,Sc=4,Ec=5,Tc=6,wc=7,ic="attached",Vu="detached",Ac=300,xn=301,Fn=302,Yo=303,Zo=304,br=306,In=1e3,Ui=1001,yo=1002,We=1003,Wu=1004;var Mr=1005;var Ze=1006,$o=1007;var yn=1008;var ci=1009,Rc=1010,Cc=1011,bs=1012,Jo=1013,Li=1014,gi=1015,Di=1016,Ko=1017,jo=1018,Ms=1020,Ic=35902,Pc=35899,Lc=1021,Dc=1022,xi=1023,ki=1026,_n=1027,Qo=1028,ta=1029,vn=1030,ea=1031;var ia=1033,Sr=33776,Er=33777,Tr=33778,wr=33779,na=35840,sa=35841,ra=35842,oa=35843,aa=36196,la=37492,ca=37496,ha=37488,ua=37489,Ar=37490,da=37491,fa=37808,pa=37809,ma=37810,ga=37811,xa=37812,ya=37813,_a=37814,va=37815,ba=37816,Ma=37817,Sa=37818,Ea=37819,Ta=37820,wa=37821,Aa=36492,Ra=36494,Ca=36495,Ia=36283,Pa=36284,Rr=36285,La=36286;var Xs=2300,_o=2301,lo=2302,nc=2303,sc=2400,rc=2401,oc=2402;var Xu=3200;var Da=0,qu=1,ji="",Ve="srgb",qs="srgb-linear",Ys="linear",xe="srgb";var co=7680;var Yu=519,Zu=512,$u=513,Ju=514,Na=515,Ku=516,ju=517,Fa=518,Qu=519,td=35044,On=35048;var Nc="300 es",Ri=2e3,ls=2001;function Df(r){for(let t=r.length-1;t>=0;--t)if(r[t]>=65535)return!0;return!1}function Nf(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}function Zs(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function ed(){let r=Zs("canvas");return r.style.display="block",r}var Hh={},cs=null;function Fc(...r){let t="THREE."+r.shift();cs?cs("log",t,...r):console.log(t,...r)}function id(r){let t=r[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=r[1];e&&e.isStackTrace?r[0]+=" "+e.getLocation():r[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return r}function Gt(...r){r=id(r);let t="THREE."+r.shift();if(cs)cs("warn",t,...r);else{let e=r[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...r)}}function Yt(...r){r=id(r);let t="THREE."+r.shift();if(cs)cs("error",t,...r);else{let e=r[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...r)}}function Cn(...r){let t=r.join(" ");t in Hh||(Hh[t]=!0,Gt(...r))}function nd(r,t,e){return new Promise(function(i,n){function s(){switch(r.clientWaitSync(t,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:n();break;case r.TIMEOUT_EXPIRED:setTimeout(s,e);break;default:i()}}setTimeout(s,e)})}var sd={[ho]:uo,[fo]:go,[po]:xo,[as]:mo,[uo]:ho,[go]:fo,[xo]:po,[mo]:as},Hi=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){let i=this._listeners;if(i===void 0)return;let n=i[t];if(n!==void 0){let s=n.indexOf(e);s!==-1&&n.splice(s,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let i=e[t.type];if(i!==void 0){t.target=this;let n=i.slice(0);for(let s=0,o=n.length;s<o;s++)n[s].call(this,t);t.target=null}}},je=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Gh=1234567,Gs=Math.PI/180,hs=180/Math.PI;function bn(){let r=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(je[r&255]+je[r>>8&255]+je[r>>16&255]+je[r>>24&255]+"-"+je[t&255]+je[t>>8&255]+"-"+je[t>>16&15|64]+je[t>>24&255]+"-"+je[e&63|128]+je[e>>8&255]+"-"+je[e>>16&255]+je[e>>24&255]+je[i&255]+je[i>>8&255]+je[i>>16&255]+je[i>>24&255]).toLowerCase()}function te(r,t,e){return Math.max(t,Math.min(e,r))}function Oc(r,t){return(r%t+t)%t}function Ff(r,t,e,i,n){return i+(r-t)*(n-i)/(e-t)}function Of(r,t,e){return r!==t?(e-r)/(t-r):0}function zs(r,t,e){return(1-e)*r+e*t}function Uf(r,t,e,i){return zs(r,t,1-Math.exp(-e*i))}function Bf(r,t=1){return t-Math.abs(Oc(r,t*2)-t)}function kf(r,t,e){return r<=t?0:r>=e?1:(r=(r-t)/(e-t),r*r*(3-2*r))}function Hf(r,t,e){return r<=t?0:r>=e?1:(r=(r-t)/(e-t),r*r*r*(r*(r*6-15)+10))}function Gf(r,t){return r+Math.floor(Math.random()*(t-r+1))}function zf(r,t){return r+Math.random()*(t-r)}function Vf(r){return r*(.5-Math.random())}function Wf(r){r!==void 0&&(Gh=r);let t=Gh+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Xf(r){return r*Gs}function qf(r){return r*hs}function Yf(r){return r>0&&Number.isInteger(r)&&2**Math.round(Math.log2(r))===r}function Zf(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))}function $f(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function Jf(r,t,e,i,n){let s=Math.cos,o=Math.sin,a=s(e/2),l=o(e/2),c=s((t+i)/2),h=o((t+i)/2),u=s((t-i)/2),d=o((t-i)/2),f=s((i-t)/2),m=o((i-t)/2);switch(n){case"XYX":r.set(a*h,l*u,l*d,a*c);break;case"YZY":r.set(l*d,a*h,l*u,a*c);break;case"ZXZ":r.set(l*u,l*d,a*h,a*c);break;case"XZX":r.set(a*h,l*m,l*f,a*c);break;case"YXY":r.set(l*f,a*h,l*m,a*c);break;case"ZYZ":r.set(l*m,l*f,a*h,a*c);break;default:Gt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+n)}}function rs(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:case Uint8ClampedArray:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function si(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var oe={DEG2RAD:Gs,RAD2DEG:hs,generateUUID:bn,clamp:te,euclideanModulo:Oc,mapLinear:Ff,inverseLerp:Of,lerp:zs,damp:Uf,pingpong:Bf,smoothstep:kf,smootherstep:Hf,randInt:Gf,randFloat:zf,randFloatSpread:Vf,seededRandom:Wf,degToRad:Xf,radToDeg:qf,isPowerOfTwo:Yf,ceilPowerOfTwo:Zf,floorPowerOfTwo:$f,setQuaternionFromProperEuler:Jf,normalize:si,denormalize:rs},zc=class zc{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,n=t.elements;return this.x=n[0]*e+n[3]*i+n[6],this.y=n[1]*e+n[4]*i+n[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=te(this.x,t.x,e.x),this.y=te(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=te(this.x,t,e),this.y=te(this.y,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(te(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(te(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),n=Math.sin(e),s=this.x-t.x,o=this.y-t.y;return this.x=s*i-o*n+t.x,this.y=s*n+o*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};zc.prototype.isVector2=!0;var at=zc,Xe=class{constructor(t=0,e=0,i=0,n=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=n}static slerpFlat(t,e,i,n,s,o,a){let l=i[n+0],c=i[n+1],h=i[n+2],u=i[n+3],d=s[o+0],f=s[o+1],m=s[o+2],y=s[o+3];if(u!==y||l!==d||c!==f||h!==m){let g=l*d+c*f+h*m+u*y;g<0&&(d=-d,f=-f,m=-m,y=-y,g=-g);let p=1-a;if(g<.9995){let T=Math.acos(g),b=Math.sin(T);p=Math.sin(p*T)/b,a=Math.sin(a*T)/b,l=l*p+d*a,c=c*p+f*a,h=h*p+m*a,u=u*p+y*a}else{l=l*p+d*a,c=c*p+f*a,h=h*p+m*a,u=u*p+y*a;let T=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=T,c*=T,h*=T,u*=T}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,i,n,s,o){let a=i[n],l=i[n+1],c=i[n+2],h=i[n+3],u=s[o],d=s[o+1],f=s[o+2],m=s[o+3];return t[e]=a*m+h*u+l*f-c*d,t[e+1]=l*m+h*d+c*u-a*f,t[e+2]=c*m+h*f+a*d-l*u,t[e+3]=h*m-a*u-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,n){return this._x=t,this._y=e,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,n=t._y,s=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(i/2),h=a(n/2),u=a(s/2),d=l(i/2),f=l(n/2),m=l(s/2);switch(o){case"XYZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"YXZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"ZXY":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"ZYX":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"YZX":this._x=d*h*u+c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u-d*f*m;break;case"XZY":this._x=d*h*u-c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u+d*f*m;break;default:Gt("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,n=Math.sin(i);return this._x=t.x*n,this._y=t.y*n,this._z=t.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],n=e[4],s=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],u=e[10],d=i+a+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(s-c)*f,this._z=(o-n)*f}else if(i>a&&i>u){let f=2*Math.sqrt(1+i-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(n+o)/f,this._z=(s+c)/f}else if(a>u){let f=2*Math.sqrt(1+a-i-u);this._w=(s-c)/f,this._x=(n+o)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+u-i-a);this._w=(o-n)/f,this._x=(s+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(te(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let n=Math.min(1,e/i);return this.slerp(t,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,n=t._y,s=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=i*h+o*a+n*c-s*l,this._y=n*h+o*l+s*a-i*c,this._z=s*h+o*c+i*l-n*a,this._w=o*h-i*a-n*l-s*c,this._onChangeCallback(),this}slerp(t,e){let i=t._x,n=t._y,s=t._z,o=t._w,a=this.dot(t);a<0&&(i=-i,n=-n,s=-s,o=-o,a=-a);let l=1-e;if(a<.9995){let c=Math.acos(a),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+i*e,this._y=this._y*l+n*e,this._z=this._z*l+s*e,this._w=this._w*l+o*e,this._onChangeCallback()}else this._x=this._x*l+i*e,this._y=this._y*l+n*e,this._z=this._z*l+s*e,this._w=this._w*l+o*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(n*Math.sin(t),n*Math.cos(t),s*Math.sin(e),s*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Vc=class Vc{constructor(t=0,e=0,i=0){this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(zh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(zh.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,n=this.z,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6]*n,this.y=s[1]*e+s[4]*i+s[7]*n,this.z=s[2]*e+s[5]*i+s[8]*n,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,s=t.elements,o=1/(s[3]*e+s[7]*i+s[11]*n+s[15]);return this.x=(s[0]*e+s[4]*i+s[8]*n+s[12])*o,this.y=(s[1]*e+s[5]*i+s[9]*n+s[13])*o,this.z=(s[2]*e+s[6]*i+s[10]*n+s[14])*o,this}applyQuaternion(t){let e=this.x,i=this.y,n=this.z,s=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*n-a*i),h=2*(a*e-s*n),u=2*(s*i-o*e);return this.x=e+l*c+o*u-a*h,this.y=i+l*h+a*c-s*u,this.z=n+l*u+s*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,n=this.z,s=t.elements;return this.x=s[0]*e+s[4]*i+s[8]*n,this.y=s[1]*e+s[5]*i+s[9]*n,this.z=s[2]*e+s[6]*i+s[10]*n,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=te(this.x,t.x,e.x),this.y=te(this.y,t.y,e.y),this.z=te(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=te(this.x,t,e),this.y=te(this.y,t,e),this.z=te(this.z,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(te(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,n=t.y,s=t.z,o=e.x,a=e.y,l=e.z;return this.x=n*l-s*a,this.y=s*o-i*l,this.z=i*a-n*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return Il.copy(this).projectOnVector(t),this.sub(Il)}reflect(t){return this.sub(Il.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(te(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,n=this.z-t.z;return e*e+i*i+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let n=Math.sin(e)*t;return this.x=n*Math.sin(i),this.y=Math.cos(e)*t,this.z=n*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),n=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=n,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Vc.prototype.isVector3=!0;var I=Vc,Il=new I,zh=new Xe,Wc=class Wc{constructor(t,e,i,n,s,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,n,s,o,a,l,c)}set(t,e,i,n,s,o,a,l,c){let h=this.elements;return h[0]=t,h[1]=n,h[2]=a,h[3]=e,h[4]=s,h[5]=l,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,s=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],h=i[4],u=i[7],d=i[2],f=i[5],m=i[8],y=n[0],g=n[3],p=n[6],T=n[1],b=n[4],x=n[7],S=n[2],E=n[5],C=n[8];return s[0]=o*y+a*T+l*S,s[3]=o*g+a*b+l*E,s[6]=o*p+a*x+l*C,s[1]=c*y+h*T+u*S,s[4]=c*g+h*b+u*E,s[7]=c*p+h*x+u*C,s[2]=d*y+f*T+m*S,s[5]=d*g+f*b+m*E,s[8]=d*p+f*x+m*C,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],n=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-i*s*h+i*a*l+n*s*c-n*o*l}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=h*o-a*c,d=a*l-h*s,f=c*s-o*l,m=e*u+i*d+n*f;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/m;return t[0]=u*y,t[1]=(n*c-h*i)*y,t[2]=(a*i-n*o)*y,t[3]=d*y,t[4]=(h*e-n*l)*y,t[5]=(n*s-a*e)*y,t[6]=f*y,t[7]=(i*l-c*e)*y,t[8]=(o*e-i*s)*y,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,n,s,o,a){let l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*o+c*a)+o+t,-n*c,n*l,-n*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return Cn("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Pl.makeScale(t,e)),this}rotate(t){return Cn("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Pl.makeRotation(-t)),this}translate(t,e){return Cn("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Pl.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<9;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}};Wc.prototype.isMatrix3=!0;var Wt=Wc,Pl=new Wt,Vh=new Wt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Wh=new Wt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Kf(){let r={enabled:!0,workingColorSpace:qs,spaces:{},convert:function(n,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===xe&&(n.r=Ji(n.r),n.g=Ji(n.g),n.b=Ji(n.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(n.applyMatrix3(this.spaces[s].toXYZ),n.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===xe&&(n.r=os(n.r),n.g=os(n.g),n.b=os(n.b))),n},workingToColorSpace:function(n,s){return this.convert(n,this.workingColorSpace,s)},colorSpaceToWorking:function(n,s){return this.convert(n,s,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===ji?Ys:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,s=this.workingColorSpace){return n.fromArray(this.spaces[s].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,s,o){return n.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(n,s){return Cn("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),r.workingToColorSpace(n,s)},toWorkingColorSpace:function(n,s){return Cn("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),r.colorSpaceToWorking(n,s)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return r.define({[qs]:{primaries:t,whitePoint:i,transfer:Ys,toXYZ:Vh,fromXYZ:Wh,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Ve},outputColorSpaceConfig:{drawingBufferColorSpace:Ve}},[Ve]:{primaries:t,whitePoint:i,transfer:xe,toXYZ:Vh,fromXYZ:Wh,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Ve}}}),r}var re=Kf();function Ji(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function os(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}var Xn,vo=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{Xn===void 0&&(Xn=Zs("canvas")),Xn.width=t.width,Xn.height=t.height;let n=Xn.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),i=Xn}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Zs("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let n=i.getImageData(0,0,t.width,t.height),s=n.data;for(let o=0;o<s.length;o++)s[o]=Ji(s[o]/255)*255;return i.putImageData(n,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(Ji(e[i]/255)*255):e[i]=Ji(e[i]);return{data:e,width:t.width,height:t.height}}else return Gt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},jf=0,us=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:jf++}),this.uuid=bn(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let s;if(Array.isArray(n)){s=[];for(let o=0,a=n.length;o<a;o++)n[o].isDataTexture?s.push(Ll(n[o].image)):s.push(Ll(n[o]))}else s=Ll(n);i.url=s}return e||(t.images[this.uuid]=i),i}};function Ll(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?vo.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(Gt("Texture: Unable to serialize Texture."),{})}var Qf=0,Dl=new I,ri=class r extends Hi{constructor(t=r.DEFAULT_IMAGE,e=r.DEFAULT_MAPPING,i=Ui,n=Ui,s=Ze,o=yn,a=xi,l=ci,c=r.DEFAULT_ANISOTROPY,h=ji){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Qf++}),this.uuid=bn(),this.name="",this.source=new us(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new at(0,0),this.repeat=new at(1,1),this.center=new at(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Wt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Dl).x}get height(){return this.source.getSize(Dl).y}get depth(){return this.source.getSize(Dl).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let i=t[e];if(i===void 0){Gt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){Gt(`Texture.setValues(): property '${e}' does not exist.`);continue}n&&i&&n.isVector2&&i.isVector2||n&&i&&n.isVector3&&i.isVector3||n&&i&&n.isMatrix3&&i.isMatrix3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Ac)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case In:t.x=t.x-Math.floor(t.x);break;case Ui:t.x=t.x<0?0:1;break;case yo:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case In:t.y=t.y-Math.floor(t.y);break;case Ui:t.y=t.y<0?0:1;break;case yo:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};ri.DEFAULT_IMAGE=null;ri.DEFAULT_MAPPING=Ac;ri.DEFAULT_ANISOTROPY=1;var Xc=class Xc{constructor(t=0,e=0,i=0,n=1){this.x=t,this.y=e,this.z=i,this.w=n}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,n){return this.x=t,this.y=e,this.z=i,this.w=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,s=this.w,o=t.elements;return this.x=o[0]*e+o[4]*i+o[8]*n+o[12]*s,this.y=o[1]*e+o[5]*i+o[9]*n+o[13]*s,this.z=o[2]*e+o[6]*i+o[10]*n+o[14]*s,this.w=o[3]*e+o[7]*i+o[11]*n+o[15]*s,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,n,s,l=t.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],m=l[9],y=l[2],g=l[6],p=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-y)<.01&&Math.abs(m-g)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+y)<.1&&Math.abs(m+g)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let b=(c+1)/2,x=(f+1)/2,S=(p+1)/2,E=(h+d)/4,C=(u+y)/4,v=(m+g)/4;return b>x&&b>S?b<.01?(i=0,n=.707106781,s=.707106781):(i=Math.sqrt(b),n=E/i,s=C/i):x>S?x<.01?(i=.707106781,n=0,s=.707106781):(n=Math.sqrt(x),i=E/n,s=v/n):S<.01?(i=.707106781,n=.707106781,s=0):(s=Math.sqrt(S),i=C/s,n=v/s),this.set(i,n,s,e),this}let T=Math.sqrt((g-m)*(g-m)+(u-y)*(u-y)+(d-h)*(d-h));return Math.abs(T)<.001&&(T=1),this.x=(g-m)/T,this.y=(u-y)/T,this.z=(d-h)/T,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=te(this.x,t.x,e.x),this.y=te(this.y,t.y,e.y),this.z=te(this.z,t.z,e.z),this.w=te(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=te(this.x,t,e),this.y=te(this.y,t,e),this.z=te(this.z,t,e),this.w=te(this.w,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(te(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Xc.prototype.isVector4=!0;var be=Xc,bo=class extends Hi{constructor(t=1,e=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ze,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new be(0,0,t,e),this.scissorTest=!1,this.viewport=new be(0,0,t,e),this.textures=[];let n={width:t,height:e,depth:i.depth},s=new ri(n),o=i.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Ze,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let n=0,s=this.textures.length;n<s;n++)this.textures[n].image.width=t,this.textures[n].image.height=e,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let n=Object.assign({},t.textures[e].image);this.textures[e].source=new us(n)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},ai=class extends bo{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}},$s=class extends ri{constructor(t=null,e=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=We,this.minFilter=We,this.wrapR=Ui,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Mo=class extends ri{constructor(t=null,e=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=We,this.minFilter=We,this.wrapR=Ui,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Xo=class Xo{constructor(t,e,i,n,s,o,a,l,c,h,u,d,f,m,y,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,n,s,o,a,l,c,h,u,d,f,m,y,g)}set(t,e,i,n,s,o,a,l,c,h,u,d,f,m,y,g){let p=this.elements;return p[0]=t,p[4]=e,p[8]=i,p[12]=n,p[1]=s,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=m,p[11]=y,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Xo().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,i=t.elements,n=1/qn.setFromMatrixColumn(t,0).length(),s=1/qn.setFromMatrixColumn(t,1).length(),o=1/qn.setFromMatrixColumn(t,2).length();return e[0]=i[0]*n,e[1]=i[1]*n,e[2]=i[2]*n,e[3]=0,e[4]=i[4]*s,e[5]=i[5]*s,e[6]=i[6]*s,e[7]=0,e[8]=i[8]*o,e[9]=i[9]*o,e[10]=i[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,n=t.y,s=t.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(n),c=Math.sin(n),h=Math.cos(s),u=Math.sin(s);if(t.order==="XYZ"){let d=o*h,f=o*u,m=a*h,y=a*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=f+m*c,e[5]=d-y*c,e[9]=-a*l,e[2]=y-d*c,e[6]=m+f*c,e[10]=o*l}else if(t.order==="YXZ"){let d=l*h,f=l*u,m=c*h,y=c*u;e[0]=d+y*a,e[4]=m*a-f,e[8]=o*c,e[1]=o*u,e[5]=o*h,e[9]=-a,e[2]=f*a-m,e[6]=y+d*a,e[10]=o*l}else if(t.order==="ZXY"){let d=l*h,f=l*u,m=c*h,y=c*u;e[0]=d-y*a,e[4]=-o*u,e[8]=m+f*a,e[1]=f+m*a,e[5]=o*h,e[9]=y-d*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let d=o*h,f=o*u,m=a*h,y=a*u;e[0]=l*h,e[4]=m*c-f,e[8]=d*c+y,e[1]=l*u,e[5]=y*c+d,e[9]=f*c-m,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let d=o*l,f=o*c,m=a*l,y=a*c;e[0]=l*h,e[4]=y-d*u,e[8]=m*u+f,e[1]=u,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=f*u+m,e[10]=d-y*u}else if(t.order==="XZY"){let d=o*l,f=o*c,m=a*l,y=a*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=d*u+y,e[5]=o*h,e[9]=f*u-m,e[2]=m*u-f,e[6]=a*h,e[10]=y*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(tp,t,ep)}lookAt(t,e,i){let n=this.elements;return hi.subVectors(t,e),hi.lengthSq()===0&&(hi.z=1),hi.normalize(),sn.crossVectors(i,hi),sn.lengthSq()===0&&(Math.abs(i.z)===1?hi.x+=1e-4:hi.z+=1e-4,hi.normalize(),sn.crossVectors(i,hi)),sn.normalize(),kr.crossVectors(hi,sn),n[0]=sn.x,n[4]=kr.x,n[8]=hi.x,n[1]=sn.y,n[5]=kr.y,n[9]=hi.y,n[2]=sn.z,n[6]=kr.z,n[10]=hi.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,s=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],h=i[1],u=i[5],d=i[9],f=i[13],m=i[2],y=i[6],g=i[10],p=i[14],T=i[3],b=i[7],x=i[11],S=i[15],E=n[0],C=n[4],v=n[8],w=n[12],A=n[1],P=n[5],N=n[9],k=n[13],L=n[2],U=n[6],H=n[10],V=n[14],et=n[3],X=n[7],J=n[11],j=n[15];return s[0]=o*E+a*A+l*L+c*et,s[4]=o*C+a*P+l*U+c*X,s[8]=o*v+a*N+l*H+c*J,s[12]=o*w+a*k+l*V+c*j,s[1]=h*E+u*A+d*L+f*et,s[5]=h*C+u*P+d*U+f*X,s[9]=h*v+u*N+d*H+f*J,s[13]=h*w+u*k+d*V+f*j,s[2]=m*E+y*A+g*L+p*et,s[6]=m*C+y*P+g*U+p*X,s[10]=m*v+y*N+g*H+p*J,s[14]=m*w+y*k+g*V+p*j,s[3]=T*E+b*A+x*L+S*et,s[7]=T*C+b*P+x*U+S*X,s[11]=T*v+b*N+x*H+S*J,s[15]=T*w+b*k+x*V+S*j,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],n=t[8],s=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],u=t[6],d=t[10],f=t[14],m=t[3],y=t[7],g=t[11],p=t[15],T=l*f-c*d,b=a*f-c*u,x=a*d-l*u,S=o*f-c*h,E=o*d-l*h,C=o*u-a*h;return e*(y*T-g*b+p*x)-i*(m*T-g*S+p*E)+n*(m*b-y*S+p*C)-s*(m*x-y*E+g*C)}determinantAffine(){let t=this.elements,e=t[0],i=t[4],n=t[8],s=t[1],o=t[5],a=t[9],l=t[2],c=t[6],h=t[10];return e*(o*h-a*c)-i*(s*h-a*l)+n*(s*c-o*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let n=this.elements;return t.isVector3?(n[12]=t.x,n[13]=t.y,n[14]=t.z):(n[12]=t,n[13]=e,n[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=t[9],d=t[10],f=t[11],m=t[12],y=t[13],g=t[14],p=t[15],T=e*a-i*o,b=e*l-n*o,x=e*c-s*o,S=i*l-n*a,E=i*c-s*a,C=n*c-s*l,v=h*y-u*m,w=h*g-d*m,A=h*p-f*m,P=u*g-d*y,N=u*p-f*y,k=d*p-f*g,L=T*k-b*N+x*P+S*A-E*w+C*v;if(L===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let U=1/L;return t[0]=(a*k-l*N+c*P)*U,t[1]=(n*N-i*k-s*P)*U,t[2]=(y*C-g*E+p*S)*U,t[3]=(d*E-u*C-f*S)*U,t[4]=(l*A-o*k-c*w)*U,t[5]=(e*k-n*A+s*w)*U,t[6]=(g*x-m*C-p*b)*U,t[7]=(h*C-d*x+f*b)*U,t[8]=(o*N-a*A+c*v)*U,t[9]=(i*A-e*N-s*v)*U,t[10]=(m*E-y*x+p*T)*U,t[11]=(u*x-h*E-f*T)*U,t[12]=(a*w-o*P-l*v)*U,t[13]=(e*P-i*w+n*v)*U,t[14]=(y*b-m*S-g*T)*U,t[15]=(h*S-u*b+d*T)*U,this}scale(t){let e=this.elements,i=t.x,n=t.y,s=t.z;return e[0]*=i,e[4]*=n,e[8]*=s,e[1]*=i,e[5]*=n,e[9]*=s,e[2]*=i,e[6]*=n,e[10]*=s,e[3]*=i,e[7]*=n,e[11]*=s,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],n=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,n))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),n=Math.sin(e),s=1-i,o=t.x,a=t.y,l=t.z,c=s*o,h=s*a;return this.set(c*o+i,c*a-n*l,c*l+n*a,0,c*a+n*l,h*a+i,h*l-n*o,0,c*l-n*a,h*l+n*o,s*l*l+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,n,s,o){return this.set(1,i,s,0,t,1,o,0,e,n,1,0,0,0,0,1),this}compose(t,e,i){let n=this.elements,s=e._x,o=e._y,a=e._z,l=e._w,c=s+s,h=o+o,u=a+a,d=s*c,f=s*h,m=s*u,y=o*h,g=o*u,p=a*u,T=l*c,b=l*h,x=l*u,S=i.x,E=i.y,C=i.z;return n[0]=(1-(y+p))*S,n[1]=(f+x)*S,n[2]=(m-b)*S,n[3]=0,n[4]=(f-x)*E,n[5]=(1-(d+p))*E,n[6]=(g+T)*E,n[7]=0,n[8]=(m+b)*C,n[9]=(g-T)*C,n[10]=(1-(d+y))*C,n[11]=0,n[12]=t.x,n[13]=t.y,n[14]=t.z,n[15]=1,this}decompose(t,e,i){let n=this.elements;t.x=n[12],t.y=n[13],t.z=n[14];let s=this.determinantAffine();if(s===0)return i.set(1,1,1),e.identity(),this;let o=qn.set(n[0],n[1],n[2]).length(),a=qn.set(n[4],n[5],n[6]).length(),l=qn.set(n[8],n[9],n[10]).length();s<0&&(o=-o),Ei.copy(this);let c=1/o,h=1/a,u=1/l;return Ei.elements[0]*=c,Ei.elements[1]*=c,Ei.elements[2]*=c,Ei.elements[4]*=h,Ei.elements[5]*=h,Ei.elements[6]*=h,Ei.elements[8]*=u,Ei.elements[9]*=u,Ei.elements[10]*=u,e.setFromRotationMatrix(Ei),i.x=o,i.y=a,i.z=l,this}makePerspective(t,e,i,n,s,o,a=Ri,l=!1){let c=this.elements,h=2*s/(e-t),u=2*s/(i-n),d=(e+t)/(e-t),f=(i+n)/(i-n),m,y;if(l)m=s/(o-s),y=o*s/(o-s);else if(a===Ri)m=-(o+s)/(o-s),y=-2*o*s/(o-s);else if(a===ls)m=-o/(o-s),y=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=y,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,i,n,s,o,a=Ri,l=!1){let c=this.elements,h=2/(e-t),u=2/(i-n),d=-(e+t)/(e-t),f=-(i+n)/(i-n),m,y;if(l)m=1/(o-s),y=o/(o-s);else if(a===Ri)m=-2/(o-s),y=-(o+s)/(o-s);else if(a===ls)m=-1/(o-s),y=-s/(o-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=m,c[14]=y,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<16;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}};Xo.prototype.isMatrix4=!0;var Xt=Xo,qn=new I,Ei=new Xt,tp=new I(0,0,0),ep=new I(1,1,1),sn=new I,kr=new I,hi=new I,Xh=new Xt,qh=new Xe,$e=class r{constructor(t=0,e=0,i=0,n=r.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=n}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,n=this._order){return this._x=t,this._y=e,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let n=t.elements,s=n[0],o=n[4],a=n[8],l=n[1],c=n[5],h=n[9],u=n[2],d=n[6],f=n[10];switch(e){case"XYZ":this._y=Math.asin(te(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-te(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(te(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-te(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(te(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-te(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Gt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return Xh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Xh,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return qh.setFromEuler(this),this.setFromQuaternion(qh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};$e.DEFAULT_ORDER="XYZ";var Js=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},ip=0,Yh=new I,Yn=new Xe,Xi=new Xt,Hr=new I,Ds=new I,np=new I,sp=new Xe,Zh=new I(1,0,0),$h=new I(0,1,0),Jh=new I(0,0,1),Kh={type:"added"},rp={type:"removed"},Zn={type:"childadded",child:null},Nl={type:"childremoved",child:null},Je=class r extends Hi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:ip++}),this.uuid=bn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=r.DEFAULT_UP.clone();let t=new I,e=new $e,i=new Xe,n=new I(1,1,1);function s(){i.setFromEuler(e,!1)}function o(){e.setFromQuaternion(i,void 0,!1)}e._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new Xt},normalMatrix:{value:new Wt}}),this.matrix=new Xt,this.matrixWorld=new Xt,this.matrixAutoUpdate=r.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=r.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Js,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Yn.setFromAxisAngle(t,e),this.quaternion.multiply(Yn),this}rotateOnWorldAxis(t,e){return Yn.setFromAxisAngle(t,e),this.quaternion.premultiply(Yn),this}rotateX(t){return this.rotateOnAxis(Zh,t)}rotateY(t){return this.rotateOnAxis($h,t)}rotateZ(t){return this.rotateOnAxis(Jh,t)}translateOnAxis(t,e){return Yh.copy(t).applyQuaternion(this.quaternion),this.position.add(Yh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Zh,t)}translateY(t){return this.translateOnAxis($h,t)}translateZ(t){return this.translateOnAxis(Jh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Xi.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?Hr.copy(t):Hr.set(t,e,i);let n=this.parent;this.updateWorldMatrix(!0,!1),Ds.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Xi.lookAt(Ds,Hr,this.up):Xi.lookAt(Hr,Ds,this.up),this.quaternion.setFromRotationMatrix(Xi),n&&(Xi.extractRotation(n.matrixWorld),Yn.setFromRotationMatrix(Xi),this.quaternion.premultiply(Yn.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Yt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Kh),Zn.child=t,this.dispatchEvent(Zn),Zn.child=null):Yt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(rp),Nl.child=t,this.dispatchEvent(Nl),Nl.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Xi.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Xi.multiply(t.parent.matrixWorld)),t.applyMatrix4(Xi),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Kh),Zn.child=t,this.dispatchEvent(Zn),Zn.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,n=this.children.length;i<n;i++){let o=this.children[i].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);let n=this.children;for(let s=0,o=n.length;s<o;s++)n[s].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ds,t,np),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ds,sp,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,i=t.y,n=t.z,s=this.matrix.elements;s[12]+=e-s[0]*e-s[4]*i-s[8]*n,s[13]+=i-s[1]*e-s[5]*i-s[9]*n,s[14]+=n-s[2]*e-s[6]*i-s[10]*n}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e,i=!1){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),e===!0){let s=this.children;for(let o=0,a=s.length;o<a;o++)s[o].updateWorldMatrix(!1,!0,i)}}toJSON(t){let e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let n={};n.uuid=this.uuid,n.type=this.type,n.name=this.name,n.castShadow=this.castShadow,n.receiveShadow=this.receiveShadow,n.visible=this.visible,n.frustumCulled=this.frustumCulled,n.renderOrder=this.renderOrder,n.static=this.static,n.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.pivot!==null&&(n.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(n.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(n.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(a=>({...a})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(t),n.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON()));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=s(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];s(t.shapes,u)}else s(t.shapes,l)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(t.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(t.materials,this.material[l]));n.material=a}else n.material=s(t.materials,this.material);if(this.children.length>0){n.children=[];for(let a=0;a<this.children.length;a++)n.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){n.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];n.animations.push(s(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),u=o(t.shapes),d=o(t.skeletons),f=o(t.animations),m=o(t.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),d.length>0&&(i.skeletons=d),f.length>0&&(i.animations=f),m.length>0&&(i.nodes=m)}return i.object=n,i;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let n=t.children[i];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Je.DEFAULT_UP=new I(0,1,0);Je.DEFAULT_MATRIX_AUTO_UPDATE=!0;Je.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Nt=class extends Je{constructor(){super(),this.isGroup=!0,this.type="Group"}},op={type:"move"},ds=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Nt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Nt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Nt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let n=null,s=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(let y of t.hand.values()){let g=e.getJointPose(y,i),p=this._getHandJoint(c,y);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,m=.005;c.inputState.pinching&&d>f+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(s=e.getPose(t.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(n=e.getPose(t.targetRaySpace,i),n===null&&s!==null&&(n=s),n!==null&&(a.matrix.fromArray(n.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,n.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(n.linearVelocity)):a.hasLinearVelocity=!1,n.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(n.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(op)))}return a!==null&&(a.visible=n!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new Nt;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}},rd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},rn={h:0,s:0,l:0},Gr={h:0,s:0,l:0};function Fl(r,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?r+(t-r)*6*e:e<1/2?t:e<2/3?r+(t-r)*6*(2/3-e):r}var Ot=class{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let n=t;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Ve){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,re.colorSpaceToWorking(this,e),this}setRGB(t,e,i,n=re.workingColorSpace){return this.r=t,this.g=e,this.b=i,re.colorSpaceToWorking(this,n),this}setHSL(t,e,i,n=re.workingColorSpace){if(t=Oc(t,1),e=te(e,0,1),i=te(i,0,1),e===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+e):i+e-i*e,o=2*i-s;this.r=Fl(o,s,t+1/3),this.g=Fl(o,s,t),this.b=Fl(o,s,t-1/3)}return re.colorSpaceToWorking(this,n),this}setStyle(t,e=Ve){function i(s){s!==void 0&&parseFloat(s)<1&&Gt("Color: Alpha component of "+t+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(t)){let s,o=n[1],a=n[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,e);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,e);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,e);break;default:Gt("Color: Unknown color model "+t)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(t)){let s=n[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(s,16),e);Gt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Ve){let i=rd[t.toLowerCase()];return i!==void 0?this.setHex(i,e):Gt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Ji(t.r),this.g=Ji(t.g),this.b=Ji(t.b),this}copyLinearToSRGB(t){return this.r=os(t.r),this.g=os(t.g),this.b=os(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Ve){return re.workingToColorSpace(Qe.copy(this),t),Math.round(te(Qe.r*255,0,255))*65536+Math.round(te(Qe.g*255,0,255))*256+Math.round(te(Qe.b*255,0,255))}getHexString(t=Ve){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=re.workingColorSpace){re.workingToColorSpace(Qe.copy(this),e);let i=Qe.r,n=Qe.g,s=Qe.b,o=Math.max(i,n,s),a=Math.min(i,n,s),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case i:l=(n-s)/u+(n<s?6:0);break;case n:l=(s-i)/u+2;break;case s:l=(i-n)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=re.workingColorSpace){return re.workingToColorSpace(Qe.copy(this),e),t.r=Qe.r,t.g=Qe.g,t.b=Qe.b,t}getStyle(t=Ve){re.workingToColorSpace(Qe.copy(this),t);let e=Qe.r,i=Qe.g,n=Qe.b;return t!==Ve?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(t,e,i){return this.getHSL(rn),this.setHSL(rn.h+t,rn.s+e,rn.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(rn),t.getHSL(Gr);let i=zs(rn.h,Gr.h,e),n=zs(rn.s,Gr.s,e),s=zs(rn.l,Gr.l,e);return this.setHSL(i,n,s),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,n=this.b,s=t.elements;return this.r=s[0]*e+s[3]*i+s[6]*n,this.g=s[1]*e+s[4]*i+s[7]*n,this.b=s[2]*e+s[5]*i+s[8]*n,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Qe=new Ot;Ot.NAMES=rd;var Ks=class r{constructor(t,e=1,i=1e3){this.isFog=!0,this.name="",this.color=new Ot(t),this.near=e,this.far=i}clone(){return new r(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},js=class extends Je{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new $e,this.environmentIntensity=1,this.environmentRotation=new $e,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},Ti=new I,qi=new I,Ol=new I,Yi=new I,$n=new I,Jn=new I,jh=new I,Ul=new I,Bl=new I,kl=new I,Hl=new be,Gl=new be,zl=new be,cn=class r{constructor(t=new I,e=new I,i=new I){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,n){n.subVectors(i,e),Ti.subVectors(t,e),n.cross(Ti);let s=n.lengthSq();return s>0?n.multiplyScalar(1/Math.sqrt(s)):n.set(0,0,0)}static getBarycoord(t,e,i,n,s){Ti.subVectors(n,e),qi.subVectors(i,e),Ol.subVectors(t,e);let o=Ti.dot(Ti),a=Ti.dot(qi),l=Ti.dot(Ol),c=qi.dot(qi),h=qi.dot(Ol),u=o*c-a*a;if(u===0)return s.set(0,0,0),null;let d=1/u,f=(c*l-a*h)*d,m=(o*h-a*l)*d;return s.set(1-f-m,m,f)}static containsPoint(t,e,i,n){return this.getBarycoord(t,e,i,n,Yi)===null?!1:Yi.x>=0&&Yi.y>=0&&Yi.x+Yi.y<=1}static getInterpolation(t,e,i,n,s,o,a,l){return this.getBarycoord(t,e,i,n,Yi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Yi.x),l.addScaledVector(o,Yi.y),l.addScaledVector(a,Yi.z),l)}static getInterpolatedAttribute(t,e,i,n,s,o){return Hl.setScalar(0),Gl.setScalar(0),zl.setScalar(0),Hl.fromBufferAttribute(t,e),Gl.fromBufferAttribute(t,i),zl.fromBufferAttribute(t,n),o.setScalar(0),o.addScaledVector(Hl,s.x),o.addScaledVector(Gl,s.y),o.addScaledVector(zl,s.z),o}static isFrontFacing(t,e,i,n){return Ti.subVectors(i,e),qi.subVectors(t,e),Ti.cross(qi).dot(n)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,n){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[n]),this}setFromAttributeAndIndices(t,e,i,n){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,n),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Ti.subVectors(this.c,this.b),qi.subVectors(this.a,this.b),Ti.cross(qi).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return r.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return r.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,n,s){return r.getInterpolation(t,this.a,this.b,this.c,e,i,n,s)}containsPoint(t){return r.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return r.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,n=this.b,s=this.c,o,a;$n.subVectors(n,i),Jn.subVectors(s,i),Ul.subVectors(t,i);let l=$n.dot(Ul),c=Jn.dot(Ul);if(l<=0&&c<=0)return e.copy(i);Bl.subVectors(t,n);let h=$n.dot(Bl),u=Jn.dot(Bl);if(h>=0&&u<=h)return e.copy(n);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(i).addScaledVector($n,o);kl.subVectors(t,s);let f=$n.dot(kl),m=Jn.dot(kl);if(m>=0&&f<=m)return e.copy(s);let y=f*c-l*m;if(y<=0&&c>=0&&m<=0)return a=c/(c-m),e.copy(i).addScaledVector(Jn,a);let g=h*m-f*u;if(g<=0&&u-h>=0&&f-m>=0)return jh.subVectors(s,n),a=(u-h)/(u-h+(f-m)),e.copy(n).addScaledVector(jh,a);let p=1/(g+y+d);return o=y*p,a=d*p,e.copy(i).addScaledVector($n,o).addScaledVector(Jn,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Ie=class{constructor(t=new I(1/0,1/0,1/0),e=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(wi.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(wi.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=wi.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let s=i.getAttribute("position");if(e===!0&&s!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,wi):wi.fromBufferAttribute(s,o),wi.applyMatrix4(t.matrixWorld),this.expandByPoint(wi);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),zr.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),zr.copy(i.boundingBox)),zr.applyMatrix4(t.matrixWorld),this.union(zr)}let n=t.children;for(let s=0,o=n.length;s<o;s++)this.expandByObject(n[s],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,wi),wi.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ns),Vr.subVectors(this.max,Ns),Kn.subVectors(t.a,Ns),jn.subVectors(t.b,Ns),Qn.subVectors(t.c,Ns),on.subVectors(jn,Kn),an.subVectors(Qn,jn),Tn.subVectors(Kn,Qn);let e=[0,-on.z,on.y,0,-an.z,an.y,0,-Tn.z,Tn.y,on.z,0,-on.x,an.z,0,-an.x,Tn.z,0,-Tn.x,-on.y,on.x,0,-an.y,an.x,0,-Tn.y,Tn.x,0];return!Vl(e,Kn,jn,Qn,Vr)||(e=[1,0,0,0,1,0,0,0,1],!Vl(e,Kn,jn,Qn,Vr))?!1:(Wr.crossVectors(on,an),e=[Wr.x,Wr.y,Wr.z],Vl(e,Kn,jn,Qn,Vr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,wi).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(wi).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Zi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Zi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Zi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Zi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Zi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Zi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Zi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Zi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Zi),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Zi=[new I,new I,new I,new I,new I,new I,new I,new I],wi=new I,zr=new Ie,Kn=new I,jn=new I,Qn=new I,on=new I,an=new I,Tn=new I,Ns=new I,Vr=new I,Wr=new I,wn=new I;function Vl(r,t,e,i,n){for(let s=0,o=r.length-3;s<=o;s+=3){wn.fromArray(r,s);let a=n.x*Math.abs(wn.x)+n.y*Math.abs(wn.y)+n.z*Math.abs(wn.z),l=t.dot(wn),c=e.dot(wn),h=i.dot(wn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var Ue=new I,Xr=new at,ap=0,di=class extends Hi{constructor(t,e,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ap++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=td,this.updateRanges=[],this.gpuType=gi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let n=0,s=this.itemSize;n<s;n++)this.array[t+n]=e.array[i+n];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)Xr.fromBufferAttribute(this,e),Xr.applyMatrix3(t),this.setXY(e,Xr.x,Xr.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Ue.fromBufferAttribute(this,e),Ue.applyMatrix3(t),this.setXYZ(e,Ue.x,Ue.y,Ue.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Ue.fromBufferAttribute(this,e),Ue.applyMatrix4(t),this.setXYZ(e,Ue.x,Ue.y,Ue.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Ue.fromBufferAttribute(this,e),Ue.applyNormalMatrix(t),this.setXYZ(e,Ue.x,Ue.y,Ue.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Ue.fromBufferAttribute(this,e),Ue.transformDirection(t),this.setXYZ(e,Ue.x,Ue.y,Ue.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=rs(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=si(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=rs(e,this.array)),e}setX(t,e){return this.normalized&&(e=si(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=rs(e,this.array)),e}setY(t,e){return this.normalized&&(e=si(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=rs(e,this.array)),e}setZ(t,e){return this.normalized&&(e=si(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=rs(e,this.array)),e}setW(t,e){return this.normalized&&(e=si(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=si(e,this.array),i=si(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,n){return t*=this.itemSize,this.normalized&&(e=si(e,this.array),i=si(i,this.array),n=si(n,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this}setXYZW(t,e,i,n,s){return t*=this.itemSize,this.normalized&&(e=si(e,this.array),i=si(i,this.array),n=si(n,this.array),s=si(s,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this.array[t+3]=s,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var Pn=class extends di{constructor(t,e,i){super(new Uint16Array(t),e,i)}};var Qs=class extends di{constructor(t,e,i){super(new Uint32Array(t),e,i)}};var Ft=class extends di{constructor(t,e,i){super(new Float32Array(t),e,i)}},lp=new Ie,Fs=new I,Wl=new I,Gi=class{constructor(t=new I,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;e!==void 0?i.copy(e):lp.setFromPoints(t).getCenter(i);let n=0;for(let s=0,o=t.length;s<o;s++)n=Math.max(n,i.distanceToSquared(t[s]));return this.radius=Math.sqrt(n),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Fs.subVectors(t,this.center);let e=Fs.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),n=(i-this.radius)*.5;this.center.addScaledVector(Fs,n/i),this.radius+=n}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Wl.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Fs.copy(t.center).add(Wl)),this.expandByPoint(Fs.copy(t.center).sub(Wl))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},cp=0,_i=new Xt,Xl=new Je,ts=new I,ui=new Ie,Os=new Ie,ze=new I,de=class r extends Hi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:cp++}),this.uuid=bn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Df(t)?Qs:Pn)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let s=new Wt().getNormalMatrix(t);i.applyNormalMatrix(s),i.needsUpdate=!0}let n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(t),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return _i.makeRotationFromQuaternion(t),this.applyMatrix4(_i),this}rotateX(t){return _i.makeRotationX(t),this.applyMatrix4(_i),this}rotateY(t){return _i.makeRotationY(t),this.applyMatrix4(_i),this}rotateZ(t){return _i.makeRotationZ(t),this.applyMatrix4(_i),this}translate(t,e,i){return _i.makeTranslation(t,e,i),this.applyMatrix4(_i),this}scale(t,e,i){return _i.makeScale(t,e,i),this.applyMatrix4(_i),this}lookAt(t){return Xl.lookAt(t),Xl.updateMatrix(),this.applyMatrix4(Xl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ts).negate(),this.translate(ts.x,ts.y,ts.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let i=[];for(let n=0,s=t.length;n<s;n++){let o=t[n];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Ft(i,3))}else{let i=Math.min(t.length,e.count);for(let n=0;n<i;n++){let s=t[n];e.setXYZ(n,s.x,s.y,s.z||0)}t.length>e.count&&Gt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ie);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Yt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,n=e.length;i<n;i++){let s=e[i];ui.setFromBufferAttribute(s),this.morphTargetsRelative?(ze.addVectors(this.boundingBox.min,ui.min),this.boundingBox.expandByPoint(ze),ze.addVectors(this.boundingBox.max,ui.max),this.boundingBox.expandByPoint(ze)):(this.boundingBox.expandByPoint(ui.min),this.boundingBox.expandByPoint(ui.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Yt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Gi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Yt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(t){let i=this.boundingSphere.center;if(ui.setFromBufferAttribute(t),e)for(let s=0,o=e.length;s<o;s++){let a=e[s];Os.setFromBufferAttribute(a),this.morphTargetsRelative?(ze.addVectors(ui.min,Os.min),ui.expandByPoint(ze),ze.addVectors(ui.max,Os.max),ui.expandByPoint(ze)):(ui.expandByPoint(Os.min),ui.expandByPoint(Os.max))}ui.getCenter(i);let n=0;for(let s=0,o=t.count;s<o;s++)ze.fromBufferAttribute(t,s),n=Math.max(n,i.distanceToSquared(ze));if(e)for(let s=0,o=e.length;s<o;s++){let a=e[s],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)ze.fromBufferAttribute(a,c),l&&(ts.fromBufferAttribute(t,c),ze.add(ts)),n=Math.max(n,i.distanceToSquared(ze))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&Yt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Yt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.position,n=e.normal,s=e.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==i.count)&&(o=new di(new Float32Array(4*i.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let v=0;v<i.count;v++)a[v]=new I,l[v]=new I;let c=new I,h=new I,u=new I,d=new at,f=new at,m=new at,y=new I,g=new I;function p(v,w,A){c.fromBufferAttribute(i,v),h.fromBufferAttribute(i,w),u.fromBufferAttribute(i,A),d.fromBufferAttribute(s,v),f.fromBufferAttribute(s,w),m.fromBufferAttribute(s,A),h.sub(c),u.sub(c),f.sub(d),m.sub(d);let P=1/(f.x*m.y-m.x*f.y);isFinite(P)&&(y.copy(h).multiplyScalar(m.y).addScaledVector(u,-f.y).multiplyScalar(P),g.copy(u).multiplyScalar(f.x).addScaledVector(h,-m.x).multiplyScalar(P),a[v].add(y),a[w].add(y),a[A].add(y),l[v].add(g),l[w].add(g),l[A].add(g))}let T=this.groups;T.length===0&&(T=[{start:0,count:t.count}]);for(let v=0,w=T.length;v<w;++v){let A=T[v],P=A.start,N=A.count;for(let k=P,L=P+N;k<L;k+=3)p(t.getX(k+0),t.getX(k+1),t.getX(k+2))}let b=new I,x=new I,S=new I,E=new I;function C(v){S.fromBufferAttribute(n,v),E.copy(S);let w=a[v];b.copy(w),b.sub(S.multiplyScalar(S.dot(w))).normalize(),x.crossVectors(E,w);let P=x.dot(l[v])<0?-1:1;o.setXYZW(v,b.x,b.y,b.z,P)}for(let v=0,w=T.length;v<w;++v){let A=T[v],P=A.start,N=A.count;for(let k=P,L=P+N;k<L;k+=3)C(t.getX(k+0)),C(t.getX(k+1)),C(t.getX(k+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==e.count)i=new di(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let d=0,f=i.count;d<f;d++)i.setXYZ(d,0,0,0);let n=new I,s=new I,o=new I,a=new I,l=new I,c=new I,h=new I,u=new I;if(t)for(let d=0,f=t.count;d<f;d+=3){let m=t.getX(d+0),y=t.getX(d+1),g=t.getX(d+2);n.fromBufferAttribute(e,m),s.fromBufferAttribute(e,y),o.fromBufferAttribute(e,g),h.subVectors(o,s),u.subVectors(n,s),h.cross(u),a.fromBufferAttribute(i,m),l.fromBufferAttribute(i,y),c.fromBufferAttribute(i,g),a.add(h),l.add(h),c.add(h),i.setXYZ(m,a.x,a.y,a.z),i.setXYZ(y,l.x,l.y,l.z),i.setXYZ(g,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)n.fromBufferAttribute(e,d+0),s.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),h.subVectors(o,s),u.subVectors(n,s),h.cross(u),i.setXYZ(d+0,h.x,h.y,h.z),i.setXYZ(d+1,h.x,h.y,h.z),i.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)ze.fromBufferAttribute(t,e),ze.normalize(),t.setXYZ(e,ze.x,ze.y,ze.z)}toNonIndexed(){function t(a,l){let c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h),f=0,m=0;for(let y=0,g=l.length;y<g;y++){a.isInterleavedBufferAttribute?f=l[y]*a.data.stride+a.offset:f=l[y]*h;for(let p=0;p<h;p++)d[m++]=c[f++]}return new di(d,h,u)}if(this.index===null)return Gt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new r,i=this.index.array,n=this.attributes;for(let a in n){let l=n[a],c=t(l,i);e.setAttribute(a,c)}let s=this.morphAttributes;for(let a in s){let l=[],c=s[a];for(let h=0,u=c.length;h<u;h++){let d=c[h],f=t(d,i);l.push(f)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let n={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let f=c[u];h.push(f.toJSON(t.data))}h.length>0&&(n[l]=h,s=!0)}s&&(t.data.morphAttributes=n,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let n=t.attributes;for(let c in n){let h=n[c];this.setAttribute(c,h.clone(e))}let s=t.morphAttributes;for(let c in s){let h=[],u=s[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var ql=new I,hp=new I,up=new Wt,Ai=class{constructor(t=new I(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,n){return this.normal.set(t,e,i),this.constant=n,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let n=ql.subVectors(i,e).cross(hp.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(n,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,i=!0){let n=t.delta(ql),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let o=-(t.start.dot(this.normal)+this.constant)/s;return i===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(n,o)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||up.getNormalMatrix(t),n=this.coplanarPoint(ql).applyMatrix4(t),s=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(s),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},dp=0,hn=class extends Hi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:dp++}),this.uuid=bn(),this.name="",this.type="Material",this.blending=vs,this.side=gn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=xc,this.blendDst=yc,this.blendEquation=Nn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ot(0,0,0),this.blendAlpha=0,this.depthFunc=as,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Yu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=co,this.stencilZFail=co,this.stencilZPass=co,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let i=t[e];if(i===void 0){Gt(`Material: parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){Gt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(s=>s.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(e){let s=n(t.textures),o=n(t.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Ot().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new Ai().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new at().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new at().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let n=e.length;i=new Array(n);for(let s=0;s!==n;++s)i[s]=e[s].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var $i=new I,Yl=new I,qr=new I,Yr=new I,tr=class{constructor(t=new I,e=new I(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,$i)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=$i.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):($i.copy(this.origin).addScaledVector(this.direction,e),$i.distanceToSquared(t))}distanceSqToSegment(t,e,i,n){Yl.copy(t).add(e).multiplyScalar(.5),qr.copy(e).sub(t).normalize(),Yr.copy(this.origin).sub(Yl);let s=t.distanceTo(e)*.5,o=-this.direction.dot(qr),a=Yr.dot(this.direction),l=-Yr.dot(qr),c=Yr.lengthSq(),h=Math.abs(1-o*o),u,d,f,m;if(h>0)if(u=o*l-a,d=o*a-l,m=s*h,u>=0)if(d>=-m)if(d<=m){let y=1/h;u*=y,d*=y,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=s,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-s,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-m?(u=Math.max(0,-(-o*s+a)),d=u>0?-s:Math.min(Math.max(-s,-l),s),f=-u*u+d*(d+2*l)+c):d<=m?(u=0,d=Math.min(Math.max(-s,-l),s),f=d*(d+2*l)+c):(u=Math.max(0,-(o*s+a)),d=u>0?s:Math.min(Math.max(-s,-l),s),f=-u*u+d*(d+2*l)+c);else d=o>0?-s:s,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,u),n&&n.copy(Yl).addScaledVector(qr,d),f}intersectSphere(t,e){if(t.radius<0)return null;$i.subVectors(t.center,this.origin);let i=$i.dot(this.direction),n=$i.dot($i)-i*i,s=t.radius*t.radius;if(n>s)return null;let o=Math.sqrt(s-n),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,n,s,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(i=(t.min.x-d.x)*c,n=(t.max.x-d.x)*c):(i=(t.max.x-d.x)*c,n=(t.min.x-d.x)*c),h>=0?(s=(t.min.y-d.y)*h,o=(t.max.y-d.y)*h):(s=(t.max.y-d.y)*h,o=(t.min.y-d.y)*h),i>o||s>n||((s>i||isNaN(i))&&(i=s),(o<n||isNaN(n))&&(n=o),u>=0?(a=(t.min.z-d.z)*u,l=(t.max.z-d.z)*u):(a=(t.max.z-d.z)*u,l=(t.min.z-d.z)*u),i>l||a>n)||((a>i||i!==i)&&(i=a),(l<n||n!==n)&&(n=l),n<0)?null:this.at(i>=0?i:n,e)}intersectsBox(t){return this.intersectBox(t,$i)!==null}intersectTriangle(t,e,i,n,s){let o=this.origin,a=this.direction,l=a.x,c=a.y,h=a.z,u=t.x-o.x,d=t.y-o.y,f=t.z-o.z,m=e.x-o.x,y=e.y-o.y,g=e.z-o.z,p=i.x-o.x,T=i.y-o.y,b=i.z-o.z,x=Math.abs(l),S=Math.abs(c),E=Math.abs(h),C,v,w,A,P,N,k,L,U,H,V,et;if(x>=S&&x>=E?(w=l,N=u,U=m,et=p,l>=0?(C=c,v=h,A=d,P=f,k=y,L=g,H=T,V=b):(C=h,v=c,A=f,P=d,k=g,L=y,H=b,V=T)):S>=E?(w=c,N=d,U=y,et=T,c>=0?(C=h,v=l,A=f,P=u,k=g,L=m,H=b,V=p):(C=l,v=h,A=u,P=f,k=m,L=g,H=p,V=b)):(w=h,N=f,U=g,et=b,h>=0?(C=l,v=c,A=u,P=d,k=m,L=y,H=p,V=T):(C=c,v=l,A=d,P=u,k=y,L=m,H=T,V=p)),w===0)return null;let X=C/w,J=v/w,j=1/w,Ct=A-X*N,wt=P-J*N,ae=k-X*U,ie=L-J*U,le=H-X*et,$=V-J*et,it=le*ie-$*ae,bt=Ct*$-wt*le,qt=ae*wt-ie*Ct;if(n){if(it<0||bt<0||qt<0)return null}else if((it<0||bt<0||qt<0)&&(it>0||bt>0||qt>0))return null;let Tt=it+bt+qt;if(Tt===0)return null;let Zt=j*(it*N+bt*U+qt*et);return(Tt>0?Zt<0:Zt>0)?null:this.at(Zt/Tt,s)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},we=class extends hn{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ot(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $e,this.combine=_c,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Qh=new Xt,An=new tr,Zr=new Gi,tu=new I,$r=new I,Jr=new I,Kr=new I,Zl=new I,jr=new I,eu=new I,Qr=new I,_t=class extends Je{constructor(t=new de,e=new we){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=n.length;s<o;s++){let a=n[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(t,e){let i=this.geometry,n=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;e.fromBufferAttribute(n,t);let a=this.morphTargetInfluences;if(s&&a){jr.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let h=a[l],u=s[l];h!==0&&(Zl.fromBufferAttribute(u,t),o?jr.addScaledVector(Zl,h):jr.addScaledVector(Zl.sub(e),h))}e.add(jr)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.material,s=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Zr.copy(i.boundingSphere),Zr.applyMatrix4(s),An.copy(t.ray).recast(t.near),!(Zr.containsPoint(An.origin)===!1&&(An.intersectSphere(Zr,tu)===null||An.origin.distanceToSquared(tu)>(t.far-t.near)**2))&&(Qh.copy(s).invert(),An.copy(t.ray).applyMatrix4(Qh),!(i.boundingBox!==null&&An.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,An)))}_computeIntersections(t,e,i){let n,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,d=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let m=0,y=d.length;m<y;m++){let g=d[m],p=o[g.materialIndex],T=Math.max(g.start,f.start),b=Math.min(a.count,Math.min(g.start+g.count,f.start+f.count));for(let x=T,S=b;x<S;x+=3){let E=a.getX(x),C=a.getX(x+1),v=a.getX(x+2);n=to(this,p,t,i,c,h,u,E,C,v),n&&(n.faceIndex=Math.floor(x/3),n.face.materialIndex=g.materialIndex,e.push(n))}}else{let m=Math.max(0,f.start),y=Math.min(a.count,f.start+f.count);for(let g=m,p=y;g<p;g+=3){let T=a.getX(g),b=a.getX(g+1),x=a.getX(g+2);n=to(this,o,t,i,c,h,u,T,b,x),n&&(n.faceIndex=Math.floor(g/3),e.push(n))}}else if(l!==void 0)if(Array.isArray(o))for(let m=0,y=d.length;m<y;m++){let g=d[m],p=o[g.materialIndex],T=Math.max(g.start,f.start),b=Math.min(l.count,Math.min(g.start+g.count,f.start+f.count));for(let x=T,S=b;x<S;x+=3){let E=x,C=x+1,v=x+2;n=to(this,p,t,i,c,h,u,E,C,v),n&&(n.faceIndex=Math.floor(x/3),n.face.materialIndex=g.materialIndex,e.push(n))}}else{let m=Math.max(0,f.start),y=Math.min(l.count,f.start+f.count);for(let g=m,p=y;g<p;g+=3){let T=g,b=g+1,x=g+2;n=to(this,o,t,i,c,h,u,T,b,x),n&&(n.faceIndex=Math.floor(g/3),e.push(n))}}}};function fp(r,t,e,i,n,s,o,a){let l;if(t.side===ke?l=i.intersectTriangle(o,s,n,!0,a):l=i.intersectTriangle(n,s,o,t.side===gn,a),l===null)return null;Qr.copy(a),Qr.applyMatrix4(r.matrixWorld);let c=e.ray.origin.distanceTo(Qr);return c<e.near||c>e.far?null:{distance:c,point:Qr.clone(),object:r}}function to(r,t,e,i,n,s,o,a,l,c){r.getVertexPosition(a,$r),r.getVertexPosition(l,Jr),r.getVertexPosition(c,Kr);let h=fp(r,t,e,i,$r,Jr,Kr,eu);if(h){let u=new I;cn.getBarycoord(eu,$r,Jr,Kr,u),n&&(h.uv=cn.getInterpolatedAttribute(n,a,l,c,u,new at)),s&&(h.uv1=cn.getInterpolatedAttribute(s,a,l,c,u,new at)),o&&(h.normal=cn.getInterpolatedAttribute(o,a,l,c,u,new I),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new I,materialIndex:0};cn.getNormal($r,Jr,Kr,d.normal),h.face=d,h.barycoord=u}return h}var Us=new be,iu=new be,nu=new be,pp=new be,su=new Xt,eo=new I,$l=new Gi,ru=new Xt,Jl=new tr,er=class extends _t{constructor(t,e){super(t,e),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=ic,this.bindMatrix=new Xt,this.bindMatrixInverse=new Xt,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let t=this.geometry;this.boundingBox===null&&(this.boundingBox=new Ie),this.boundingBox.makeEmpty();let e=t.getAttribute("position");for(let i=0;i<e.count;i++)this.getVertexPosition(i,eo),this.boundingBox.expandByPoint(eo)}computeBoundingSphere(){let t=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Gi),this.boundingSphere.makeEmpty();let e=t.getAttribute("position");for(let i=0;i<e.count;i++)this.getVertexPosition(i,eo),this.boundingSphere.expandByPoint(eo)}copy(t,e){return super.copy(t,e),this.bindMode=t.bindMode,this.bindMatrix.copy(t.bindMatrix),this.bindMatrixInverse.copy(t.bindMatrixInverse),this.skeleton=t.skeleton,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}raycast(t,e){let i=this.material,n=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),$l.copy(this.boundingSphere),$l.applyMatrix4(n),t.ray.intersectsSphere($l)!==!1&&(ru.copy(n).invert(),Jl.copy(t.ray).applyMatrix4(ru),!(this.boundingBox!==null&&Jl.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(t,e,Jl)))}getVertexPosition(t,e){return super.getVertexPosition(t,e),this.applyBoneTransform(t,e),e}bind(t,e){this.skeleton=t,e===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),e=this.matrixWorld),this.bindMatrix.copy(e),this.bindMatrixInverse.copy(e).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let t=new be,e=this.geometry.attributes.skinWeight;for(let i=0,n=e.count;i<n;i++){t.fromBufferAttribute(e,i);let s=1/t.manhattanLength();s!==1/0?t.multiplyScalar(s):t.set(1,0,0,0),e.setXYZW(i,t.x,t.y,t.z,t.w)}}updateMatrixWorld(t){super.updateMatrixWorld(t),this.bindMode===ic?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Vu?this.bindMatrixInverse.copy(this.bindMatrix).invert():Gt("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(t,e){let i=this.skeleton,n=this.geometry;iu.fromBufferAttribute(n.attributes.skinIndex,t),nu.fromBufferAttribute(n.attributes.skinWeight,t),e.isVector4?(Us.copy(e),e.set(0,0,0,0)):(Us.set(...e,1),e.set(0,0,0)),Us.applyMatrix4(this.bindMatrix);for(let s=0;s<4;s++){let o=nu.getComponent(s);if(o!==0){let a=iu.getComponent(s);su.multiplyMatrices(i.bones[a].matrixWorld,i.boneInverses[a]),e.addScaledVector(pp.copy(Us).applyMatrix4(su),o)}}return e.isVector4&&(e.w=Us.w),e.applyMatrix4(this.bindMatrixInverse)}},Ln=class extends Je{constructor(){super(),this.isBone=!0,this.type="Bone"}},fs=class extends ri{constructor(t=null,e=1,i=1,n,s,o,a,l,c=We,h=We,u,d){super(null,o,a,l,c,h,n,s,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},ou=new Xt,mp=new Xt,ir=class r{constructor(t=[],e=[]){this.uuid=bn(),this.bones=t.slice(0),this.boneInverses=e,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let t=this.bones,e=this.boneInverses;if(this.boneMatrices=new Float32Array(t.length*16),e.length===0)this.calculateInverses();else if(t.length!==e.length){Gt("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,n=this.bones.length;i<n;i++)this.boneInverses.push(new Xt)}}calculateInverses(){this.boneInverses.length=0;for(let t=0,e=this.bones.length;t<e;t++){let i=new Xt;this.bones[t]&&i.copy(this.bones[t].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let t=0,e=this.bones.length;t<e;t++){let i=this.bones[t];i&&i.matrixWorld.copy(this.boneInverses[t]).invert()}for(let t=0,e=this.bones.length;t<e;t++){let i=this.bones[t];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){let t=this.bones,e=this.boneInverses,i=this.boneMatrices,n=this.boneTexture;for(let s=0,o=t.length;s<o;s++){let a=t[s]?t[s].matrixWorld:mp;ou.multiplyMatrices(a,e[s]),ou.toArray(i,s*16)}n!==null&&(n.needsUpdate=!0)}clone(){return new r(this.bones,this.boneInverses)}computeBoneTexture(){let t=Math.sqrt(this.bones.length*4);t=Math.ceil(t/4)*4,t=Math.max(t,4);let e=new Float32Array(t*t*4);e.set(this.boneMatrices);let i=new fs(e,t,t,xi,gi);return i.needsUpdate=!0,this.boneMatrices=e,this.boneTexture=i,this}getBoneByName(t){for(let e=0,i=this.bones.length;e<i;e++){let n=this.bones[e];if(n.name===t)return n}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(t,e){this.uuid=t.uuid;for(let i=0,n=t.bones.length;i<n;i++){let s=t.bones[i],o=e[s];o===void 0&&(Gt("Skeleton: No bone found with UUID:",s),o=new Ln),this.bones.push(o),this.boneInverses.push(new Xt().fromArray(t.boneInverses[i]))}return this.init(),this}toJSON(){let t={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};t.uuid=this.uuid;let e=this.bones,i=this.boneInverses;for(let n=0,s=e.length;n<s;n++){let o=e[n];t.bones.push(o.uuid);let a=i[n];t.boneInverses.push(a.toArray())}return t}},nr=class extends di{constructor(t,e,i,n=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=n}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},es=new Xt,au=new Xt,io=[],lu=new Ie,gp=new Xt,Bs=new _t,ks=new Gi,li=class extends _t{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new nr(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let n=0;n<i;n++)this.setMatrixAt(n,gp)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Ie),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,es),lu.copy(t.boundingBox).applyMatrix4(es),this.boundingBox.union(lu)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Gi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,es),ks.copy(t.boundingSphere).applyMatrix4(es),this.boundingSphere.union(ks)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let i=e.morphTargetInfluences,n=this.morphTexture.source.data.data,s=i.length+1,o=t*s+1;for(let a=0;a<i.length;a++)i[a]=n[o+a]}raycast(t,e){let i=this.matrixWorld,n=this.count;if(Bs.geometry=this.geometry,Bs.material=this.material,Bs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ks.copy(this.boundingSphere),ks.applyMatrix4(i),t.ray.intersectsSphere(ks)!==!1))for(let s=0;s<n;s++){this.getMatrixAt(s,es),au.multiplyMatrices(i,es),Bs.matrixWorld=au,Bs.raycast(t,io);for(let o=0,a=io.length;o<a;o++){let l=io[o];l.instanceId=s,l.object=this,e.push(l)}io.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new nr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let i=e.morphTargetInfluences,n=i.length+1;this.morphTexture===null&&(this.morphTexture=new fs(new Float32Array(n*this.count),n,this.count,Qo,gi));let s=this.morphTexture.source.data.data,o=0;for(let c=0;c<i.length;c++)o+=i[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=n*t;return s[l]=a,s.set(i,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Rn=new Gi,xp=new at(.5,.5),no=new I,ps=class{constructor(t=new Ai,e=new Ai,i=new Ai,n=new Ai,s=new Ai,o=new Ai){this.planes=[t,e,i,n,s,o]}set(t,e,i,n,s,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(i),a[3].copy(n),a[4].copy(s),a[5].copy(o),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=Ri,i=!1){let n=this.planes,s=t.elements,o=s[0],a=s[1],l=s[2],c=s[3],h=s[4],u=s[5],d=s[6],f=s[7],m=s[8],y=s[9],g=s[10],p=s[11],T=s[12],b=s[13],x=s[14],S=s[15];if(n[0].setComponents(c-o,f-h,p-m,S-T).normalize(),n[1].setComponents(c+o,f+h,p+m,S+T).normalize(),n[2].setComponents(c+a,f+u,p+y,S+b).normalize(),n[3].setComponents(c-a,f-u,p-y,S-b).normalize(),i)n[4].setComponents(l,d,g,x).normalize(),n[5].setComponents(c-l,f-d,p-g,S-x).normalize();else if(n[4].setComponents(c-l,f-d,p-g,S-x).normalize(),e===Ri)n[5].setComponents(c+l,f+d,p+g,S+x).normalize();else if(e===ls)n[5].setComponents(l,d,g,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Rn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Rn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Rn)}intersectsSprite(t){Rn.center.set(0,0,0);let e=xp.distanceTo(t.center);return Rn.radius=.7071067811865476+e,Rn.applyMatrix4(t.matrixWorld),this.intersectsSphere(Rn)}intersectsSphere(t){let e=this.planes,i=t.center,n=-t.radius;for(let s=0;s<6;s++)if(e[s].distanceToPoint(i)<n)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let n=e[i];if(no.x=n.normal.x>0?t.max.x:t.min.x,no.y=n.normal.y>0?t.max.y:t.min.y,no.z=n.normal.z>0?t.max.z:t.min.z,n.distanceToPoint(no)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var sr=class extends ri{constructor(t=[],e=xn,i,n,s,o,a,l,c,h){super(t,e,i,n,s,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},un=class extends ri{constructor(t,e,i,n,s,o,a,l,c){super(t,e,i,n,s,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var dn=class extends ri{constructor(t,e,i=Li,n,s,o,a=We,l=We,c,h=ki,u=1){if(h!==ki&&h!==_n)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:t,height:e,depth:u};super(d,n,s,o,a,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new us(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},So=class extends dn{constructor(t,e=Li,i=xn,n,s,o=We,a=We,l,c=ki){let h={width:t,height:t,depth:1},u=[h,h,h,h,h,h];super(t,t,e,i,n,s,o,a,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},rr=class extends ri{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},ee=class r extends de{constructor(t=1,e=1,i=1,n=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:n,heightSegments:s,depthSegments:o};let a=this;n=Math.floor(n),s=Math.floor(s),o=Math.floor(o);let l=[],c=[],h=[],u=[],d=0,f=0;m("z","y","x",-1,-1,i,e,t,o,s,0),m("z","y","x",1,-1,i,e,-t,o,s,1),m("x","z","y",1,1,t,i,e,n,o,2),m("x","z","y",1,-1,t,i,-e,n,o,3),m("x","y","z",1,-1,t,e,i,n,s,4),m("x","y","z",-1,-1,t,e,-i,n,s,5),this.setIndex(l),this.setAttribute("position",new Ft(c,3)),this.setAttribute("normal",new Ft(h,3)),this.setAttribute("uv",new Ft(u,2));function m(y,g,p,T,b,x,S,E,C,v,w){let A=x/C,P=S/v,N=x/2,k=S/2,L=E/2,U=C+1,H=v+1,V=0,et=0,X=new I;for(let J=0;J<H;J++){let j=J*P-k;for(let Ct=0;Ct<U;Ct++){let wt=Ct*A-N;X[y]=wt*T,X[g]=j*b,X[p]=L,c.push(X.x,X.y,X.z),X[y]=0,X[g]=0,X[p]=E>0?1:-1,h.push(X.x,X.y,X.z),u.push(Ct/C),u.push(1-J/v),V+=1}}for(let J=0;J<v;J++)for(let j=0;j<C;j++){let Ct=d+j+U*J,wt=d+j+U*(J+1),ae=d+(j+1)+U*(J+1),ie=d+(j+1)+U*J;l.push(Ct,wt,ie),l.push(wt,ae,ie),et+=6}a.addGroup(f,et,w),f+=et,d+=V}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var ue=class r extends de{constructor(t=1,e=1,i=1,n=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:n,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};let c=this;n=Math.floor(n),s=Math.floor(s);let h=[],u=[],d=[],f=[],m=0,y=[],g=i/2,p=0;T(),o===!1&&(t>0&&b(!0),e>0&&b(!1)),this.setIndex(h),this.setAttribute("position",new Ft(u,3)),this.setAttribute("normal",new Ft(d,3)),this.setAttribute("uv",new Ft(f,2));function T(){let x=new I,S=new I,E=0,C=(e-t)/i;for(let v=0;v<=s;v++){let w=[],A=v/s,P=A*(e-t)+t;for(let N=0;N<=n;N++){let k=N/n,L=k*l+a,U=Math.sin(L),H=Math.cos(L);S.x=P*U,S.y=-A*i+g,S.z=P*H,u.push(S.x,S.y,S.z),x.set(U,C,H).normalize(),d.push(x.x,x.y,x.z),f.push(k,1-A),w.push(m++)}y.push(w)}for(let v=0;v<n;v++)for(let w=0;w<s;w++){let A=y[w][v],P=y[w+1][v],N=y[w+1][v+1],k=y[w][v+1];(t>0||w!==0)&&(h.push(A,P,k),E+=3),(e>0||w!==s-1)&&(h.push(P,N,k),E+=3)}c.addGroup(p,E,0),p+=E}function b(x){let S=m,E=new at,C=new I,v=0,w=x===!0?t:e,A=x===!0?1:-1;for(let N=1;N<=n;N++)u.push(0,g*A,0),d.push(0,A,0),f.push(.5,.5),m++;let P=m;for(let N=0;N<=n;N++){let L=N/n*l+a,U=Math.cos(L),H=Math.sin(L);C.x=w*H,C.y=g*A,C.z=w*U,u.push(C.x,C.y,C.z),d.push(0,A,0),E.x=U*.5+.5,E.y=H*.5*A+.5,f.push(E.x,E.y),m++}for(let N=0;N<n;N++){let k=S+N,L=P+N;x===!0?h.push(L,L+1,k):h.push(L+1,L,k),v+=3}c.addGroup(p,v,x===!0?1:2),p+=v}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},or=class r extends ue{constructor(t=1,e=1,i=32,n=1,s=!1,o=0,a=Math.PI*2){super(0,t,e,i,n,s,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:n,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(t){return new r(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var fi=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Gt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let i=this.getUtoTmapping(t);return this.getPoint(i,e)}getPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return e}getSpacedPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPointAt(i/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],i,n=this.getPoint(0),s=0;e.push(0);for(let o=1;o<=t;o++)i=this.getPoint(o/t),s+=i.distanceTo(n),e.push(s),n=i;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let i=this.getLengths(),n=0,s=i.length,o;e?o=e:o=t*i[s-1];let a=0,l=s-1,c;for(;a<=l;)if(n=Math.floor(a+(l-a)/2),c=i[n]-o,c<0)a=n+1;else if(c>0)l=n-1;else{l=n;break}if(n=l,i[n]===o)return n/(s-1);let h=i[n],d=i[n+1]-h,f=(o-h)/d;return(n+f)/(s-1)}getTangent(t,e){let n=t-1e-4,s=t+1e-4;n<0&&(n=0),s>1&&(s=1);let o=this.getPoint(n),a=this.getPoint(s),l=e||(o.isVector2?new at:new I);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){let i=this.getUtoTmapping(t);return this.getTangent(i,e)}computeFrenetFrames(t,e=!1){let i=new I,n=[],s=[],o=[],a=new I,l=new Xt;for(let f=0;f<=t;f++){let m=f/t;n[f]=this.getTangentAt(m,new I)}s[0]=new I,o[0]=new I;let c=Number.MAX_VALUE,h=Math.abs(n[0].x),u=Math.abs(n[0].y),d=Math.abs(n[0].z);h<=c&&(c=h,i.set(1,0,0)),u<=c&&(c=u,i.set(0,1,0)),d<=c&&i.set(0,0,1),a.crossVectors(n[0],i).normalize(),s[0].crossVectors(n[0],a),o[0].crossVectors(n[0],s[0]);for(let f=1;f<=t;f++){if(s[f]=s[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(n[f-1],n[f]),a.length()>Number.EPSILON){a.normalize();let m=Math.acos(te(n[f-1].dot(n[f]),-1,1));s[f].applyMatrix4(l.makeRotationAxis(a,m))}o[f].crossVectors(n[f],s[f])}if(e===!0){let f=Math.acos(te(s[0].dot(s[t]),-1,1));f/=t,n[0].dot(a.crossVectors(s[0],s[t]))>0&&(f=-f);for(let m=1;m<=t;m++)s[m].applyMatrix4(l.makeRotationAxis(n[m],f*m)),o[m].crossVectors(n[m],s[m])}return{tangents:n,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},ms=class extends fi{constructor(t=0,e=0,i=1,n=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=i,this.yRadius=n,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(t,e=new at){let i=e,n=Math.PI*2,s=this.aEndAngle-this.aStartAngle,o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=n;for(;s>n;)s-=n;s<Number.EPSILON&&(o?s=0:s=n),this.aClockwise===!0&&!o&&(s===n?s=-n:s=s-n);let a=this.aStartAngle+t*s,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return i.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Eo=class extends ms{constructor(t,e,i,n,s,o){super(t,e,i,i,n,s,o),this.isArcCurve=!0,this.type="ArcCurve"}};function Uc(){let r=0,t=0,e=0,i=0;function n(s,o,a,l){r=s,t=a,e=-3*s+3*o-2*a-l,i=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){n(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,h,u){let d=(o-s)/c-(a-s)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;d*=h,f*=h,n(o,a,d,f)},calc:function(s){let o=s*s,a=o*s;return r+t*s+e*o+i*a}}}var cu=new I,hu=new I,Kl=new Uc,jl=new Uc,Ql=new Uc,ei=class extends fi{constructor(t=[],e=!1,i="centripetal",n=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=i,this.tension=n}getPoint(t,e=new I){let i=e,n=this.points,s=n.length,o=(s-(this.closed?0:1))*t,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,h;this.closed||a>0?c=n[(a-1)%s]:(hu.subVectors(n[0],n[1]).add(n[0]),c=hu);let u=n[a%s],d=n[(a+1)%s];if(this.closed||a+2<s?h=n[(a+2)%s]:(cu.subVectors(n[s-1],n[s-2]).add(n[s-1]),h=cu),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(u),f),y=Math.pow(u.distanceToSquared(d),f),g=Math.pow(d.distanceToSquared(h),f);y<1e-4&&(y=1),m<1e-4&&(m=y),g<1e-4&&(g=y),Kl.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,m,y,g),jl.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,m,y,g),Ql.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,m,y,g)}else this.curveType==="catmullrom"&&(Kl.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),jl.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),Ql.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return i.set(Kl.calc(l),jl.calc(l),Ql.calc(l)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(n.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let n=this.points[e];t.points.push(n.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(new I().fromArray(n))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function uu(r,t,e,i,n){let s=(i-t)*.5,o=(n-e)*.5,a=r*r,l=r*a;return(2*e-2*i+s+o)*l+(-3*e+3*i-2*s-o)*a+s*r+e}function yp(r,t){let e=1-r;return e*e*t}function _p(r,t){return 2*(1-r)*r*t}function vp(r,t){return r*r*t}function Vs(r,t,e,i){return yp(r,t)+_p(r,e)+vp(r,i)}function bp(r,t){let e=1-r;return e*e*e*t}function Mp(r,t){let e=1-r;return 3*e*e*r*t}function Sp(r,t){return 3*(1-r)*r*r*t}function Ep(r,t){return r*r*r*t}function Ws(r,t,e,i,n){return bp(r,t)+Mp(r,e)+Sp(r,i)+Ep(r,n)}var ar=class extends fi{constructor(t=new at,e=new at,i=new at,n=new at){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=i,this.v3=n}getPoint(t,e=new at){let i=e,n=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(Ws(t,n.x,s.x,o.x,a.x),Ws(t,n.y,s.y,o.y,a.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},To=class extends fi{constructor(t=new I,e=new I,i=new I,n=new I){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=i,this.v3=n}getPoint(t,e=new I){let i=e,n=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(Ws(t,n.x,s.x,o.x,a.x),Ws(t,n.y,s.y,o.y,a.y),Ws(t,n.z,s.z,o.z,a.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},lr=class extends fi{constructor(t=new at,e=new at){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new at){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new at){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},wo=class extends fi{constructor(t=new I,e=new I){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new I){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new I){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},cr=class extends fi{constructor(t=new at,e=new at,i=new at){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new at){let i=e,n=this.v0,s=this.v1,o=this.v2;return i.set(Vs(t,n.x,s.x,o.x),Vs(t,n.y,s.y,o.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},hr=class extends fi{constructor(t=new I,e=new I,i=new I){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new I){let i=e,n=this.v0,s=this.v1,o=this.v2;return i.set(Vs(t,n.x,s.x,o.x),Vs(t,n.y,s.y,o.y),Vs(t,n.z,s.z,o.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},ur=class extends fi{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new at){let i=e,n=this.points,s=(n.length-1)*t,o=Math.floor(s),a=s-o,l=n[o===0?o:o-1],c=n[o],h=n[o>n.length-2?n.length-1:o+1],u=n[o>n.length-3?n.length-1:o+2];return i.set(uu(a,l.x,c.x,h.x,u.x),uu(a,l.y,c.y,h.y,u.y)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(n.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let n=this.points[e];t.points.push(n.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(new at().fromArray(n))}return this}},Ao=Object.freeze({__proto__:null,ArcCurve:Eo,CatmullRomCurve3:ei,CubicBezierCurve:ar,CubicBezierCurve3:To,EllipseCurve:ms,LineCurve:lr,LineCurve3:wo,QuadraticBezierCurve:cr,QuadraticBezierCurve3:hr,SplineCurve:ur}),Ro=class extends fi{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let i=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Ao[i](e,t))}return this}getPoint(t,e){let i=t*this.getLength(),n=this.getCurveLengths(),s=0;for(;s<n.length;){if(n[s]>=i){let o=n[s]-i,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,e)}s++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let i=0,n=this.curves.length;i<n;i++)e+=this.curves[i].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],i;for(let n=0,s=this.curves;n<s.length;n++){let o=s[n],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,l=o.getPoints(a);for(let c=0;c<l.length;c++){let h=l[c];i&&i.equals(h)||(e.push(h),i=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let n=t.curves[e];this.curves.push(n.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,i=this.curves.length;e<i;e++){let n=this.curves[e];t.curves.push(n.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let n=t.curves[e];this.curves.push(new Ao[n.type]().fromJSON(n))}return this}},Ki=class extends Ro{constructor(t){super(),this.type="Path",this.currentPoint=new at,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,i=t.length;e<i;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let i=new lr(this.currentPoint.clone(),new at(t,e));return this.curves.push(i),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,i,n){let s=new cr(this.currentPoint.clone(),new at(t,e),new at(i,n));return this.curves.push(s),this.currentPoint.set(i,n),this}bezierCurveTo(t,e,i,n,s,o){let a=new ar(this.currentPoint.clone(),new at(t,e),new at(i,n),new at(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),i=new ur(e);return this.curves.push(i),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,i,n,s,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+a,e+l,i,n,s,o),this}absarc(t,e,i,n,s,o){return this.absellipse(t,e,i,i,n,s,o),this}ellipse(t,e,i,n,s,o,a,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,i,n,s,o,a,l),this}absellipse(t,e,i,n,s,o,a,l){let c=new ms(t,e,i,n,s,o,a,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},Pe=class extends Ki{constructor(t){super(t),this.uuid=bn(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let i=0,n=this.holes.length;i<n;i++)e[i]=this.holes[i].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){let n=t.holes[e];this.holes.push(n.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,i=this.holes.length;e<i;e++){let n=this.holes[e];t.holes.push(n.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){let n=t.holes[e];this.holes.push(new Ki().fromJSON(n))}return this}};function Tp(r,t,e=2){let i=t&&t.length,n=i?t[0]*e:r.length,s=od(r,0,n,e,!0),o=[];if(!s||s.next===s.prev)return o;let a,l,c;if(i&&(s=Ip(r,t,s,e)),r.length>80*e){a=r[0],l=r[1];let h=a,u=l;for(let d=e;d<n;d+=e){let f=r[d],m=r[d+1];f<a&&(a=f),m<l&&(l=m),f>h&&(h=f),m>u&&(u=m)}c=Math.max(h-a,u-l),c=c!==0?32767/c:0}return dr(s,o,e,a,l,c,0),o}function od(r,t,e,i,n){let s;if(n===Gp(r,t,e,i)>0)for(let o=t;o<e;o+=i)s=du(o/i|0,r[o],r[o+1],s);else for(let o=e-i;o>=t;o-=i)s=du(o/i|0,r[o],r[o+1],s);return s&&gs(s,s.next)&&(pr(s),s=s.next),s}function Dn(r,t){if(!r)return r;t||(t=r);let e=r,i;do if(i=!1,!e.steiner&&(gs(e,e.next)||Ce(e.prev,e,e.next)===0)){if(pr(e),e=t=e.prev,e===e.next)break;i=!0}else e=e.next;while(i||e!==t);return t}function dr(r,t,e,i,n,s,o){if(!r)return;!o&&s&&Fp(r,i,n,s);let a=r;for(;r.prev!==r.next;){let l=r.prev,c=r.next;if(s?Ap(r,i,n,s):wp(r)){t.push(l.i,r.i,c.i),pr(r),r=c.next,a=c.next;continue}if(r=c,r===a){o?o===1?(r=Rp(Dn(r),t),dr(r,t,e,i,n,s,2)):o===2&&Cp(r,t,e,i,n,s):dr(Dn(r),t,e,i,n,s,1);break}}}function wp(r){let t=r.prev,e=r,i=r.next;if(Ce(t,e,i)>=0)return!1;let n=t.x,s=e.x,o=i.x,a=t.y,l=e.y,c=i.y,h=Math.min(n,s,o),u=Math.min(a,l,c),d=Math.max(n,s,o),f=Math.max(a,l,c),m=i.next;for(;m!==t;){if(m.x>=h&&m.x<=d&&m.y>=u&&m.y<=f&&Hs(n,a,s,l,o,c,m.x,m.y)&&Ce(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function Ap(r,t,e,i){let n=r.prev,s=r,o=r.next;if(Ce(n,s,o)>=0)return!1;let a=n.x,l=s.x,c=o.x,h=n.y,u=s.y,d=o.y,f=Math.min(a,l,c),m=Math.min(h,u,d),y=Math.max(a,l,c),g=Math.max(h,u,d),p=ac(f,m,t,e,i),T=ac(y,g,t,e,i),b=r.prevZ,x=r.nextZ;for(;b&&b.z>=p&&x&&x.z<=T;){if(b.x>=f&&b.x<=y&&b.y>=m&&b.y<=g&&b!==n&&b!==o&&Hs(a,h,l,u,c,d,b.x,b.y)&&Ce(b.prev,b,b.next)>=0||(b=b.prevZ,x.x>=f&&x.x<=y&&x.y>=m&&x.y<=g&&x!==n&&x!==o&&Hs(a,h,l,u,c,d,x.x,x.y)&&Ce(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;b&&b.z>=p;){if(b.x>=f&&b.x<=y&&b.y>=m&&b.y<=g&&b!==n&&b!==o&&Hs(a,h,l,u,c,d,b.x,b.y)&&Ce(b.prev,b,b.next)>=0)return!1;b=b.prevZ}for(;x&&x.z<=T;){if(x.x>=f&&x.x<=y&&x.y>=m&&x.y<=g&&x!==n&&x!==o&&Hs(a,h,l,u,c,d,x.x,x.y)&&Ce(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function Rp(r,t){let e=r;do{let i=e.prev,n=e.next.next;!gs(i,n)&&ld(i,e,e.next,n)&&fr(i,n)&&fr(n,i)&&(t.push(i.i,e.i,n.i),pr(e),pr(e.next),e=r=n),e=e.next}while(e!==r);return Dn(e)}function Cp(r,t,e,i,n,s){let o=r;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Bp(o,a)){let l=cd(o,a);o=Dn(o,o.next),l=Dn(l,l.next),dr(o,t,e,i,n,s,0),dr(l,t,e,i,n,s,0);return}a=a.next}o=o.next}while(o!==r)}function Ip(r,t,e,i){let n=[];for(let s=0,o=t.length;s<o;s++){let a=t[s]*i,l=s<o-1?t[s+1]*i:r.length,c=od(r,a,l,i,!1);c===c.next&&(c.steiner=!0),n.push(Up(c))}n.sort(Pp);for(let s=0;s<n.length;s++)e=Lp(n[s],e);return e}function Pp(r,t){let e=r.x-t.x;if(e===0&&(e=r.y-t.y,e===0)){let i=(r.next.y-r.y)/(r.next.x-r.x),n=(t.next.y-t.y)/(t.next.x-t.x);e=i-n}return e}function Lp(r,t){let e=Dp(r,t);if(!e)return t;let i=cd(e,r);return Dn(i,i.next),Dn(e,e.next)}function Dp(r,t){let e=t,i=r.x,n=r.y,s=-1/0,o;if(gs(r,e))return e;do{if(gs(r,e.next))return e.next;if(n<=e.y&&n>=e.next.y&&e.next.y!==e.y){let u=e.x+(n-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(u<=i&&u>s&&(s=u,o=e.x<e.next.x?e:e.next,u===i))return o}e=e.next}while(e!==t);if(!o)return null;let a=o,l=o.x,c=o.y,h=1/0;e=o;do{if(i>=e.x&&e.x>=l&&i!==e.x&&ad(n<c?i:s,n,l,c,n<c?s:i,n,e.x,e.y)){let u=Math.abs(n-e.y)/(i-e.x);fr(e,r)&&(u<h||u===h&&(e.x>o.x||e.x===o.x&&Np(o,e)))&&(o=e,h=u)}e=e.next}while(e!==a);return o}function Np(r,t){return Ce(r.prev,r,t.prev)<0&&Ce(t.next,r,r.next)<0}function Fp(r,t,e,i){let n=r;do n.z===0&&(n.z=ac(n.x,n.y,t,e,i)),n.prevZ=n.prev,n.nextZ=n.next,n=n.next;while(n!==r);n.prevZ.nextZ=null,n.prevZ=null,Op(n)}function Op(r){let t,e=1;do{let i=r,n;r=null;let s=null;for(t=0;i;){t++;let o=i,a=0;for(let c=0;c<e&&(a++,o=o.nextZ,!!o);c++);let l=e;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||i.z<=o.z)?(n=i,i=i.nextZ,a--):(n=o,o=o.nextZ,l--),s?s.nextZ=n:r=n,n.prevZ=s,s=n;i=o}s.nextZ=null,e*=2}while(t>1);return r}function ac(r,t,e,i,n){return r=(r-e)*n|0,t=(t-i)*n|0,r=(r|r<<8)&16711935,r=(r|r<<4)&252645135,r=(r|r<<2)&858993459,r=(r|r<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,r|t<<1}function Up(r){let t=r,e=r;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==r);return e}function ad(r,t,e,i,n,s,o,a){return(n-o)*(t-a)>=(r-o)*(s-a)&&(r-o)*(i-a)>=(e-o)*(t-a)&&(e-o)*(s-a)>=(n-o)*(i-a)}function Hs(r,t,e,i,n,s,o,a){return!(r===o&&t===a)&&ad(r,t,e,i,n,s,o,a)}function Bp(r,t){return r.next.i!==t.i&&r.prev.i!==t.i&&!kp(r,t)&&(fr(r,t)&&fr(t,r)&&Hp(r,t)&&(Ce(r.prev,r,t.prev)||Ce(r,t.prev,t))||gs(r,t)&&Ce(r.prev,r,r.next)>0&&Ce(t.prev,t,t.next)>0)}function Ce(r,t,e){return(t.y-r.y)*(e.x-t.x)-(t.x-r.x)*(e.y-t.y)}function gs(r,t){return r.x===t.x&&r.y===t.y}function ld(r,t,e,i){let n=ro(Ce(r,t,e)),s=ro(Ce(r,t,i)),o=ro(Ce(e,i,r)),a=ro(Ce(e,i,t));return!!(n!==s&&o!==a||n===0&&so(r,e,t)||s===0&&so(r,i,t)||o===0&&so(e,r,i)||a===0&&so(e,t,i))}function so(r,t,e){return t.x<=Math.max(r.x,e.x)&&t.x>=Math.min(r.x,e.x)&&t.y<=Math.max(r.y,e.y)&&t.y>=Math.min(r.y,e.y)}function ro(r){return r>0?1:r<0?-1:0}function kp(r,t){let e=r;do{if(e.i!==r.i&&e.next.i!==r.i&&e.i!==t.i&&e.next.i!==t.i&&ld(e,e.next,r,t))return!0;e=e.next}while(e!==r);return!1}function fr(r,t){return Ce(r.prev,r,r.next)<0?Ce(r,t,r.next)>=0&&Ce(r,r.prev,t)>=0:Ce(r,t,r.prev)<0||Ce(r,r.next,t)<0}function Hp(r,t){let e=r,i=!1,n=(r.x+t.x)/2,s=(r.y+t.y)/2;do e.y>s!=e.next.y>s&&e.next.y!==e.y&&n<(e.next.x-e.x)*(s-e.y)/(e.next.y-e.y)+e.x&&(i=!i),e=e.next;while(e!==r);return i}function cd(r,t){let e=lc(r.i,r.x,r.y),i=lc(t.i,t.x,t.y),n=r.next,s=t.prev;return r.next=t,t.prev=r,e.next=n,n.prev=e,i.next=e,e.prev=i,s.next=i,i.prev=s,i}function du(r,t,e,i){let n=lc(r,t,e);return i?(n.next=i.next,n.prev=i,i.next.prev=n,i.next=n):(n.prev=n,n.next=n),n}function pr(r){r.next.prev=r.prev,r.prev.next=r.next,r.prevZ&&(r.prevZ.nextZ=r.nextZ),r.nextZ&&(r.nextZ.prevZ=r.prevZ)}function lc(r,t,e){return{i:r,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Gp(r,t,e,i){let n=0;for(let s=t,o=e-i;s<e;s+=i)n+=(r[o]-r[s])*(r[s+1]+r[o+1]),o=s;return n}var cc=class{static triangulate(t,e,i=2){return Tp(t,e,i)}},Bi=class r{static area(t){let e=t.length,i=0;for(let n=e-1,s=0;s<e;n=s++)i+=t[n].x*t[s].y-t[s].x*t[n].y;return i*.5}static isClockWise(t){return r.area(t)<0}static triangulateShape(t,e){let i=[],n=[],s=[];fu(t),pu(i,t);let o=t.length;e.forEach(fu);for(let l=0;l<e.length;l++)n.push(o),o+=e[l].length,pu(i,e[l]);let a=cc.triangulate(i,n);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}};function fu(r){let t=r.length;t>2&&r[t-1].equals(r[0])&&r.pop()}function pu(r,t){for(let e=0;e<t.length;e++)r.push(t[e].x),r.push(t[e].y)}var qe=class r extends de{constructor(t=new Pe([new at(.5,.5),new at(-.5,.5),new at(-.5,-.5),new at(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let i=this,n=[],s=[];for(let a=0,l=t.length;a<l;a++){let c=t[a];o(c)}this.setAttribute("position",new Ft(n,3)),this.setAttribute("uv",new Ft(s,2)),this.computeVertexNormals();function o(a){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1,d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,m=e.bevelSize!==void 0?e.bevelSize:f-.1,y=e.bevelOffset!==void 0?e.bevelOffset:0,g=e.bevelSegments!==void 0?e.bevelSegments:3,p=e.extrudePath,T=e.UVGenerator!==void 0?e.UVGenerator:zp,b,x=!1,S,E,C,v;if(p){b=p.getSpacedPoints(h),x=!0,d=!1;let nt=p.isCatmullRomCurve3?p.closed:!1;S=p.computeFrenetFrames(h,nt),E=new I,C=new I,v=new I}d||(g=0,f=0,m=0,y=0);let w=a.extractPoints(c),A=w.shape,P=w.holes;if(!Bi.isClockWise(A)){A=A.reverse();for(let nt=0,rt=P.length;nt<rt;nt++){let lt=P[nt];Bi.isClockWise(lt)&&(P[nt]=lt.reverse())}}function k(nt){let lt=10000000000000001e-36,ct=nt[0];for(let dt=1;dt<=nt.length;dt++){let zt=dt%nt.length,Ht=nt[zt],$t=Ht.x-ct.x,Jt=Ht.y-ct.y,D=$t*$t+Jt*Jt,pe=Math.max(Math.abs(Ht.x),Math.abs(Ht.y),Math.abs(ct.x),Math.abs(ct.y)),ne=lt*pe*pe;if(D<=ne){nt.splice(zt,1),dt--;continue}ct=Ht}}k(A),P.forEach(k);let L=P.length,U=A;for(let nt=0;nt<L;nt++){let rt=P[nt];A=A.concat(rt)}function H(nt,rt,lt){return rt||Yt("ExtrudeGeometry: vec does not exist"),nt.clone().addScaledVector(rt,lt)}let V=A.length;function et(nt,rt,lt){let ct,dt,zt,Ht=nt.x-rt.x,$t=nt.y-rt.y,Jt=lt.x-nt.x,D=lt.y-nt.y,pe=Ht*Ht+$t*$t,ne=Ht*D-$t*Jt;if(Math.abs(ne)>Number.EPSILON){let R=Math.sqrt(pe),_=Math.sqrt(Jt*Jt+D*D),B=rt.x-$t/R,W=rt.y+Ht/R,Y=lt.x-D/_,ht=lt.y+Jt/_,ut=((Y-B)*D-(ht-W)*Jt)/(Ht*D-$t*Jt);ct=B+Ht*ut-nt.x,dt=W+$t*ut-nt.y;let Z=ct*ct+dt*dt;if(Z<=2)return new at(ct,dt);zt=Math.sqrt(Z/2)}else{let R=!1;Ht>Number.EPSILON?Jt>Number.EPSILON&&(R=!0):Ht<-Number.EPSILON?Jt<-Number.EPSILON&&(R=!0):Math.sign($t)===Math.sign(D)&&(R=!0),R?(ct=-$t,dt=Ht,zt=Math.sqrt(pe)):(ct=Ht,dt=$t,zt=Math.sqrt(pe/2))}return new at(ct/zt,dt/zt)}let X=[];for(let nt=0,rt=U.length,lt=rt-1,ct=nt+1;nt<rt;nt++,lt++,ct++)lt===rt&&(lt=0),ct===rt&&(ct=0),X[nt]=et(U[nt],U[lt],U[ct]);let J=[],j,Ct=X.concat();for(let nt=0,rt=L;nt<rt;nt++){let lt=P[nt];j=[];for(let ct=0,dt=lt.length,zt=dt-1,Ht=ct+1;ct<dt;ct++,zt++,Ht++)zt===dt&&(zt=0),Ht===dt&&(Ht=0),j[ct]=et(lt[ct],lt[zt],lt[Ht]);J.push(j),Ct=Ct.concat(j)}let wt;if(g===0)wt=Bi.triangulateShape(U,P);else{let nt=[],rt=[];for(let lt=0;lt<g;lt++){let ct=lt/g,dt=f*Math.cos(ct*Math.PI/2),zt=m*Math.sin(ct*Math.PI/2)+y;for(let Ht=0,$t=U.length;Ht<$t;Ht++){let Jt=H(U[Ht],X[Ht],zt);bt(Jt.x,Jt.y,-dt),ct===0&&nt.push(Jt)}for(let Ht=0,$t=L;Ht<$t;Ht++){let Jt=P[Ht];j=J[Ht];let D=[];for(let pe=0,ne=Jt.length;pe<ne;pe++){let R=H(Jt[pe],j[pe],zt);bt(R.x,R.y,-dt),ct===0&&D.push(R)}ct===0&&rt.push(D)}}wt=Bi.triangulateShape(nt,rt)}let ae=wt.length,ie=m+y;for(let nt=0;nt<V;nt++){let rt=d?H(A[nt],Ct[nt],ie):A[nt];x?(C.copy(S.normals[0]).multiplyScalar(rt.x),E.copy(S.binormals[0]).multiplyScalar(rt.y),v.copy(b[0]).add(C).add(E),bt(v.x,v.y,v.z)):bt(rt.x,rt.y,0)}for(let nt=1;nt<=h;nt++)for(let rt=0;rt<V;rt++){let lt=d?H(A[rt],Ct[rt],ie):A[rt];x?(C.copy(S.normals[nt]).multiplyScalar(lt.x),E.copy(S.binormals[nt]).multiplyScalar(lt.y),v.copy(b[nt]).add(C).add(E),bt(v.x,v.y,v.z)):bt(lt.x,lt.y,u/h*nt)}for(let nt=g-1;nt>=0;nt--){let rt=nt/g,lt=f*Math.cos(rt*Math.PI/2),ct=m*Math.sin(rt*Math.PI/2)+y;for(let dt=0,zt=U.length;dt<zt;dt++){let Ht=H(U[dt],X[dt],ct);bt(Ht.x,Ht.y,u+lt)}for(let dt=0,zt=P.length;dt<zt;dt++){let Ht=P[dt];j=J[dt];for(let $t=0,Jt=Ht.length;$t<Jt;$t++){let D=H(Ht[$t],j[$t],ct);x?bt(D.x,D.y+b[h-1].y,b[h-1].x+lt):bt(D.x,D.y,u+lt)}}}le(),$();function le(){let nt=n.length/3;if(d){let rt=0,lt=V*rt;for(let ct=0;ct<ae;ct++){let dt=wt[ct];qt(dt[2]+lt,dt[1]+lt,dt[0]+lt)}rt=h+g*2,lt=V*rt;for(let ct=0;ct<ae;ct++){let dt=wt[ct];qt(dt[0]+lt,dt[1]+lt,dt[2]+lt)}}else{for(let rt=0;rt<ae;rt++){let lt=wt[rt];qt(lt[2],lt[1],lt[0])}for(let rt=0;rt<ae;rt++){let lt=wt[rt];qt(lt[0]+V*h,lt[1]+V*h,lt[2]+V*h)}}i.addGroup(nt,n.length/3-nt,0)}function $(){let nt=n.length/3,rt=0;it(U,rt),rt+=U.length;for(let lt=0,ct=P.length;lt<ct;lt++){let dt=P[lt];it(dt,rt),rt+=dt.length}i.addGroup(nt,n.length/3-nt,1)}function it(nt,rt){let lt=nt.length;for(;--lt>=0;){let ct=lt,dt=lt-1;dt<0&&(dt=nt.length-1);for(let zt=0,Ht=h+g*2;zt<Ht;zt++){let $t=V*zt,Jt=V*(zt+1),D=rt+ct+$t,pe=rt+dt+$t,ne=rt+dt+Jt,R=rt+ct+Jt;Tt(D,pe,ne,R)}}}function bt(nt,rt,lt){l.push(nt),l.push(rt),l.push(lt)}function qt(nt,rt,lt){Zt(nt),Zt(rt),Zt(lt);let ct=n.length/3,dt=T.generateTopUV(i,n,ct-3,ct-2,ct-1);ve(dt[0]),ve(dt[1]),ve(dt[2])}function Tt(nt,rt,lt,ct){Zt(nt),Zt(rt),Zt(ct),Zt(rt),Zt(lt),Zt(ct);let dt=n.length/3,zt=T.generateSideWallUV(i,n,dt-6,dt-3,dt-2,dt-1);ve(zt[0]),ve(zt[1]),ve(zt[3]),ve(zt[1]),ve(zt[2]),ve(zt[3])}function Zt(nt){n.push(l[nt*3+0]),n.push(l[nt*3+1]),n.push(l[nt*3+2])}function ve(nt){s.push(nt.x),s.push(nt.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,i=this.parameters.options;return Vp(e,i,t)}static fromJSON(t,e){let i=[];for(let s=0,o=t.shapes.length;s<o;s++){let a=e[t.shapes[s]];i.push(a)}let n=t.options.extrudePath;return n!==void 0&&(t.options.extrudePath=new Ao[n.type]().fromJSON(n)),new r(i,t.options)}},zp={generateTopUV:function(r,t,e,i,n){let s=t[e*3],o=t[e*3+1],a=t[i*3],l=t[i*3+1],c=t[n*3],h=t[n*3+1];return[new at(s,o),new at(a,l),new at(c,h)]},generateSideWallUV:function(r,t,e,i,n,s){let o=t[e*3],a=t[e*3+1],l=t[e*3+2],c=t[i*3],h=t[i*3+1],u=t[i*3+2],d=t[n*3],f=t[n*3+1],m=t[n*3+2],y=t[s*3],g=t[s*3+1],p=t[s*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new at(o,1-l),new at(c,1-u),new at(d,1-m),new at(y,1-p)]:[new at(a,1-l),new at(h,1-u),new at(f,1-m),new at(g,1-p)]}};function Vp(r,t,e){if(e.shapes=[],Array.isArray(r))for(let i=0,n=r.length;i<n;i++){let s=r[i];e.shapes.push(s.uuid)}else e.shapes.push(r.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var Ci=class r extends de{constructor(t=[new at(0,-.5),new at(.5,0),new at(0,.5)],e=12,i=0,n=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:i,phiLength:n},e=Math.floor(e),n=te(n,0,Math.PI*2);let s=[],o=[],a=[],l=[],c=[],h=1/e,u=new I,d=new at,f=new I,m=new I,y=new I,g=0,p=0;for(let T=0;T<=t.length-1;T++)switch(T){case 0:g=t[T+1].x-t[T].x,p=t[T+1].y-t[T].y,f.x=p*1,f.y=-g,f.z=p*0,y.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case t.length-1:l.push(y.x,y.y,y.z);break;default:g=t[T+1].x-t[T].x,p=t[T+1].y-t[T].y,f.x=p*1,f.y=-g,f.z=p*0,m.copy(f),f.x+=y.x,f.y+=y.y,f.z+=y.z,f.normalize(),l.push(f.x,f.y,f.z),y.copy(m)}for(let T=0;T<=e;T++){let b=i+T*h*n,x=Math.sin(b),S=Math.cos(b);for(let E=0;E<=t.length-1;E++){u.x=t[E].x*x,u.y=t[E].y,u.z=t[E].x*S,o.push(u.x,u.y,u.z),d.x=T/e,d.y=E/(t.length-1),a.push(d.x,d.y);let C=l[3*E+0]*x,v=l[3*E+1],w=l[3*E+0]*S;c.push(C,v,w)}}for(let T=0;T<e;T++)for(let b=0;b<t.length-1;b++){let x=b+T*t.length,S=x,E=x+t.length,C=x+t.length+1,v=x+1;s.push(S,E,v),s.push(C,v,E)}this.setIndex(s),this.setAttribute("position",new Ft(o,3)),this.setAttribute("uv",new Ft(a,2)),this.setAttribute("normal",new Ft(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.points,t.segments,t.phiStart,t.phiLength)}};var oi=class r extends de{constructor(t=1,e=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:n};let s=t/2,o=e/2,a=Math.floor(i),l=Math.floor(n),c=a+1,h=l+1,u=t/a,d=e/l,f=[],m=[],y=[],g=[];for(let p=0;p<h;p++){let T=p*d-o;for(let b=0;b<c;b++){let x=b*u-s;m.push(x,-T,0),y.push(0,0,1),g.push(b/a),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let T=0;T<a;T++){let b=T+c*p,x=T+c*(p+1),S=T+1+c*(p+1),E=T+1+c*p;f.push(b,x,E),f.push(x,S,E)}this.setIndex(f),this.setAttribute("position",new Ft(m,3)),this.setAttribute("normal",new Ft(y,3)),this.setAttribute("uv",new Ft(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.width,t.height,t.widthSegments,t.heightSegments)}};var vi=class r extends de{constructor(t=new Pe([new at(0,.5),new at(-.5,-.5),new at(.5,-.5)]),e=12){super(),this.type="ShapeGeometry",this.parameters={shapes:t,curveSegments:e};let i=[],n=[],s=[],o=[],a=0,l=0;if(Array.isArray(t)===!1)c(t);else for(let h=0;h<t.length;h++)c(t[h]),this.addGroup(a,l,h),a+=l,l=0;this.setIndex(i),this.setAttribute("position",new Ft(n,3)),this.setAttribute("normal",new Ft(s,3)),this.setAttribute("uv",new Ft(o,2));function c(h){let u=n.length/3,d=h.extractPoints(e),f=d.shape,m=d.holes;Bi.isClockWise(f)===!1&&(f=f.reverse());for(let g=0,p=m.length;g<p;g++){let T=m[g];Bi.isClockWise(T)===!0&&(m[g]=T.reverse())}let y=Bi.triangulateShape(f,m);for(let g=0,p=m.length;g<p;g++){let T=m[g];f=f.concat(T)}for(let g=0,p=f.length;g<p;g++){let T=f[g];n.push(T.x,T.y,0),s.push(0,0,1),o.push(T.x,T.y)}for(let g=0,p=y.length;g<p;g++){let T=y[g],b=T[0]+u,x=T[1]+u,S=T[2]+u;i.push(b,x,S),l+=3}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes;return Wp(e,t)}static fromJSON(t,e){let i=[];for(let n=0,s=t.shapes.length;n<s;n++){let o=e[t.shapes[n]];i.push(o)}return new r(i,t.curveSegments)}};function Wp(r,t){if(t.shapes=[],Array.isArray(r))for(let e=0,i=r.length;e<i;e++){let n=r[e];t.shapes.push(n.uuid)}else t.shapes.push(r.uuid);return t}var ye=class r extends de{constructor(t=1,e=32,i=16,n=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:n,phiLength:s,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),c=0,h=[],u=new I,d=new I,f=[],m=[],y=[],g=[];for(let p=0;p<=i;p++){let T=[],b=p/i,x=o+b*a,S=t*Math.cos(x),E=Math.sqrt(t*t-S*S),C=0;p===0&&o===0?C=.5/e:p===i&&l===Math.PI&&(C=-.5/e);for(let v=0;v<=e;v++){let w=v/e,A=n+w*s;u.x=-E*Math.cos(A),u.y=S,u.z=E*Math.sin(A),m.push(u.x,u.y,u.z),d.copy(u).normalize(),y.push(d.x,d.y,d.z),g.push(w+C,1-b),T.push(c++)}h.push(T)}for(let p=0;p<i;p++)for(let T=0;T<e;T++){let b=h[p][T+1],x=h[p][T],S=h[p+1][T],E=h[p+1][T+1];(p!==0||o>0)&&f.push(b,x,E),(p!==i-1||l<Math.PI)&&f.push(x,S,E)}this.setIndex(f),this.setAttribute("position",new Ft(m,3)),this.setAttribute("normal",new Ft(y,3)),this.setAttribute("uv",new Ft(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var Le=class r extends de{constructor(t=1,e=.4,i=12,n=48,s=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:n,arc:s,thetaStart:o,thetaLength:a},i=Math.floor(i),n=Math.floor(n);let l=[],c=[],h=[],u=[],d=new I,f=new I,m=new I;for(let y=0;y<=i;y++){let g=o+y/i*a;for(let p=0;p<=n;p++){let T=p/n*s;f.x=(t+e*Math.cos(g))*Math.cos(T),f.y=(t+e*Math.cos(g))*Math.sin(T),f.z=e*Math.sin(g),c.push(f.x,f.y,f.z),d.x=t*Math.cos(T),d.y=t*Math.sin(T),m.subVectors(f,d).normalize(),h.push(m.x,m.y,m.z),u.push(p/n),u.push(y/i)}}for(let y=1;y<=i;y++)for(let g=1;g<=n;g++){let p=(n+1)*y+g-1,T=(n+1)*(y-1)+g-1,b=(n+1)*(y-1)+g,x=(n+1)*y+g;l.push(p,T,x),l.push(T,b,x)}this.setIndex(l),this.setAttribute("position",new Ft(c,3)),this.setAttribute("normal",new Ft(h,3)),this.setAttribute("uv",new Ft(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};var Ii=class r extends de{constructor(t=new hr(new I(-1,-1,0),new I(-1,1,0),new I(1,1,0)),e=64,i=1,n=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:i,radialSegments:n,closed:s};let o=t.computeFrenetFrames(e,s);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new I,l=new I,c=new at,h=new I,u=[],d=[],f=[],m=[];y(),this.setIndex(m),this.setAttribute("position",new Ft(u,3)),this.setAttribute("normal",new Ft(d,3)),this.setAttribute("uv",new Ft(f,2));function y(){for(let b=0;b<e;b++)g(b);g(s===!1?e:0),T(),p()}function g(b){h=t.getPointAt(b/e,h);let x=o.normals[b],S=o.binormals[b];for(let E=0;E<=n;E++){let C=E/n*Math.PI*2,v=Math.sin(C),w=-Math.cos(C);l.x=w*x.x+v*S.x,l.y=w*x.y+v*S.y,l.z=w*x.z+v*S.z,l.normalize(),d.push(l.x,l.y,l.z),a.x=h.x+i*l.x,a.y=h.y+i*l.y,a.z=h.z+i*l.z,u.push(a.x,a.y,a.z)}}function p(){for(let b=1;b<=e;b++)for(let x=1;x<=n;x++){let S=(n+1)*(b-1)+(x-1),E=(n+1)*b+(x-1),C=(n+1)*b+x,v=(n+1)*(b-1)+x;m.push(S,E,v),m.push(E,C,v)}}function T(){for(let b=0;b<=e;b++)for(let x=0;x<=n;x++)c.x=b/e,c.y=x/n,f.push(c.x,c.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new r(new Ao[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}};function Un(r){let t={};for(let e in r){t[e]={};for(let i in r[e]){let n=r[e][i];if(mu(n))n.isRenderTargetTexture?(Gt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=n.clone();else if(Array.isArray(n))if(mu(n[0])){let s=[];for(let o=0,a=n.length;o<a;o++)s[o]=n[o].clone();t[e][i]=s}else t[e][i]=n.slice();else t[e][i]=n}}return t}function ii(r){let t={};for(let e=0;e<r.length;e++){let i=Un(r[e]);for(let n in i)t[n]=i[n]}return t}function mu(r){return r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)}function Xp(r){let t=[];for(let e=0;e<r.length;e++)t.push(r[e].clone());return t}function Bc(r){let t=r.getRenderTarget();return t===null?r.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:re.workingColorSpace}var hd={clone:Un,merge:ii},qp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Yp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,pi=class extends hn{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=qp,this.fragmentShader=Yp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Un(t.uniforms),this.uniformsGroups=Xp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let n in this.uniforms){let o=this.uniforms[n].value;o&&o.isTexture?e.uniforms[n]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[n]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[n]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[n]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[n]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[n]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[n]={type:"m4",value:o.toArray()}:e.uniforms[n]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let i in t.uniforms){let n=t.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=e[n.value]||null;break;case"c":this.uniforms[i].value=new Ot().setHex(n.value);break;case"v2":this.uniforms[i].value=new at().fromArray(n.value);break;case"v3":this.uniforms[i].value=new I().fromArray(n.value);break;case"v4":this.uniforms[i].value=new be().fromArray(n.value);break;case"m3":this.uniforms[i].value=new Wt().fromArray(n.value);break;case"m4":this.uniforms[i].value=new Xt().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},Co=class extends pi{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},xt=class extends hn{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ot(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ot(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Da,this.normalScale=new at(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $e,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var Io=class extends hn{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Xu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Po=class extends hn{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function is(r,t){return!r||r.constructor===t?r:typeof t.BYTES_PER_ELEMENT=="number"?new t(r):Array.prototype.slice.call(r)}function tc(r){return r!==void 0&&r.inTangents!==void 0&&r.outTangents!==void 0}var fn=class{constructor(t,e,i,n){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=n!==void 0?n:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,n=e[i],s=e[i-1];i:{t:{let o;e:{n:if(!(t<n)){for(let a=i+2;;){if(n===void 0){if(t<s)break n;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=n,n=e[++i],t<n)break t}o=e.length;break e}if(!(t>=s)){let a=e[1];t<a&&(i=2,s=a);for(let l=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(n=s,s=e[--i-1],t>=s)break t}o=i,i=0;break e}break i}for(;i<o;){let a=i+o>>>1;t<e[a]?o=a:i=a+1}if(n=e[i],s=e[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,n)}return this.interpolate_(i,s,t,n)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,n=this.valueSize,s=t*n;for(let o=0;o!==n;++o)e[o]=i[s+o];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Lo=class extends fn{constructor(t,e,i,n){super(t,e,i,n),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:sc,endingEnd:sc}}intervalChanged_(t,e,i){let n=this.parameterPositions,s=t-2,o=t+1,a=n[s],l=n[o];if(a===void 0)switch(this.getSettings_().endingStart){case rc:s=t,a=2*e-i;break;case oc:s=n.length-2,a=e+n[s]-n[s+1];break;default:s=t,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case rc:o=t,l=2*i-e;break;case oc:o=1,l=i+n[1]-n[0];break;default:o=t-1,l=e}let c=(i-e)*.5,h=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-i),this._offsetPrev=s*h,this._offsetNext=o*h}interpolate_(t,e,i,n){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,m=(i-e)/(n-e),y=m*m,g=y*m,p=-d*g+2*d*y-d*m,T=(1+d)*g+(-1.5-2*d)*y+(-.5+d)*m+1,b=(-1-f)*g+(1.5+f)*y+.5*m,x=f*g-f*y;for(let S=0;S!==a;++S)s[S]=p*o[h+S]+T*o[c+S]+b*o[l+S]+x*o[u+S];return s}},Do=class extends fn{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=(i-e)/(n-e),u=1-h;for(let d=0;d!==a;++d)s[d]=o[c+d]*u+o[l+d]*h;return s}},No=class extends fn{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t){return this.copySampleValue_(t-1)}},Fo=class extends fn{interpolate_(t,e,i,n){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this.inTangents,u=this.outTangents;if(!h||!u){let m=(i-e)/(n-e),y=1-m;for(let g=0;g!==a;++g)s[g]=o[c+g]*y+o[l+g]*m;return s}let d=a*2,f=t-1;for(let m=0;m!==a;++m){let y=o[c+m],g=o[l+m],p=f*d+m*2,T=u[p],b=u[p+1],x=t*d+m*2,S=h[x],E=h[x+1],C=$p(i,e,T,S,n);s[m]=ud(C,y,b,E,g)}return s}};function ud(r,t,e,i,n){let s=1-r;return s*s*s*t+3*s*s*r*e+3*s*r*r*i+r*r*r*n}function Zp(r,t,e,i,n){let s=1-r;return 3*s*s*(e-t)+6*s*r*(i-e)+3*r*r*(n-i)}function $p(r,t,e,i,n){let s=(r-t)/(n-t);for(let o=0;o<8;o++){let a=ud(s,t,e,i,n)-r;if(Math.abs(a)<1e-10)break;let l=Zp(s,t,e,i,n);if(Math.abs(l)<1e-10)break;s=Math.max(0,Math.min(1,s-a/l))}return s}var mi=class{constructor(t,e,i,n){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=is(e,this.TimeBufferType),this.values=is(i,this.ValueBufferType),this.setInterpolation(n||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:is(t.times,Array),values:is(t.values,Array)};let n=t.getInterpolation();n!==t.DefaultInterpolation&&(i.interpolation=n),tc(t.settings)&&(i.settings={inTangents:is(t.settings.inTangents,Array),outTangents:is(t.settings.outTangents,Array)})}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new No(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Do(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Lo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new Fo(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case Xs:e=this.InterpolantFactoryMethodDiscrete;break;case _o:e=this.InterpolantFactoryMethodLinear;break;case lo:e=this.InterpolantFactoryMethodSmooth;break;case nc:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Gt("KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Xs;case this.InterpolantFactoryMethodLinear:return _o;case this.InterpolantFactoryMethodSmooth:return lo;case this.InterpolantFactoryMethodBezier:return nc}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]*=t;tc(this.settings)&&(gu(this.settings.inTangents,t),gu(this.settings.outTangents,t))}return this}trim(t,e){let i=this.times,n=i.length,s=0,o=n-1;for(;s!==n&&i[s]<t;)++s;for(;o!==-1&&i[o]>e;)--o;if(++o,s!==0||o!==n){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Yt("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,n=this.values,s=i.length;s===0&&(Yt("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==s;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){Yt("KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){Yt("KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(n!==void 0&&Nf(n))for(let a=0,l=n.length;a!==l;++a){let c=n[a];if(isNaN(c)){Yt("KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),n=this.getInterpolation()===lo,s=t.length-1,o=1;for(let a=1;a<s;++a){let l=!1,c=t[a],h=t[a+1];if(c!==h&&(a!==1||c!==t[0]))if(n)l=!0;else{let u=a*i,d=u-i,f=u+i;for(let m=0;m!==i;++m){let y=e[u+m];if(y!==e[d+m]||y!==e[f+m]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let u=a*i,d=o*i;for(let f=0;f!==i;++f)e[d+f]=e[u+f]}++o}}if(s>0){t[o]=t[s];for(let a=s*i,l=o*i,c=0;c!==i;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*i)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),i=this.constructor,n=new i(this.name,t,e);return n.createInterpolant=this.createInterpolant,tc(this.settings)&&(n.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),n}};function gu(r,t){for(let e=0,i=r.length;e!==i;e+=2)r[e]*=t}mi.prototype.ValueTypeName="";mi.prototype.TimeBufferType=Float32Array;mi.prototype.ValueBufferType=Float32Array;mi.prototype.DefaultInterpolation=_o;var pn=class extends mi{constructor(t,e,i){super(t,e,i)}};pn.prototype.ValueTypeName="bool";pn.prototype.ValueBufferType=Array;pn.prototype.DefaultInterpolation=Xs;pn.prototype.InterpolantFactoryMethodLinear=void 0;pn.prototype.InterpolantFactoryMethodSmooth=void 0;var Oo=class extends mi{constructor(t,e,i,n){super(t,e,i,n)}};Oo.prototype.ValueTypeName="color";var Uo=class extends mi{constructor(t,e,i,n){super(t,e,i,n)}};Uo.prototype.ValueTypeName="number";var Bo=class extends fn{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-e)/(n-e),c=t*a;for(let h=c+a;c!==h;c+=4)Xe.slerpFlat(s,0,o,c-a,o,c,l);return s}},mr=class extends mi{constructor(t,e,i,n){super(t,e,i,n)}InterpolantFactoryMethodLinear(t){return new Bo(this.times,this.values,this.getValueSize(),t)}};mr.prototype.ValueTypeName="quaternion";mr.prototype.InterpolantFactoryMethodSmooth=void 0;var mn=class extends mi{constructor(t,e,i){super(t,e,i)}};mn.prototype.ValueTypeName="string";mn.prototype.ValueBufferType=Array;mn.prototype.DefaultInterpolation=Xs;mn.prototype.InterpolantFactoryMethodLinear=void 0;mn.prototype.InterpolantFactoryMethodSmooth=void 0;var ko=class extends mi{constructor(t,e,i,n){super(t,e,i,n)}};ko.prototype.ValueTypeName="vector";var Ho=class{constructor(t,e,i){let n=this,s=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this._abortController=null,this.itemStart=function(h){a++,s===!1&&n.onStart!==void 0&&n.onStart(h,o,a),s=!0},this.itemEnd=function(h){o++,n.onProgress!==void 0&&n.onProgress(h,o,a),o===a&&(s=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(h){n.onError!==void 0&&n.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let f=c[u],m=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},dd=new Ho,Go=class{constructor(t){this.manager=t!==void 0?t:dd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let i=this;return new Promise(function(n,s){i.load(t,n,e,s)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Go.DEFAULT_MATERIAL_NAME="__DEFAULT";var xs=class extends Je{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Ot(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},gr=class extends xs{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Je.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ot(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},ec=new Xt,xu=new I,yu=new I,zo=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new at(512,512),this.mapType=ci,this.map=null,this.mapPass=null,this.matrix=new Xt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ps,this._frameExtents=new at(1,1),this._viewportCount=1,this._viewports=[new be(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;xu.setFromMatrixPosition(t.matrixWorld),e.position.copy(xu),yu.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(yu),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,i,n){ec.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(ec,t.coordinateSystem,t.reversedDepth);let s=this._frameExtents,o=n?n.z/s.x:1,a=n?n.w/s.y:1,l=n?n.x/s.x:0,c=n?n.y/s.y:0;t.coordinateSystem===ls||t.reversedDepth?e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),e.multiply(ec)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},oo=new I,ao=new Xe,Oi=new I,xr=class extends Je{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Xt,this.projectionMatrix=new Xt,this.projectionMatrixInverse=new Xt,this.coordinateSystem=Ri,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(oo,ao,Oi),Oi.x===1&&Oi.y===1&&Oi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(oo,ao,Oi.set(1,1,1)).invert()}updateWorldMatrix(t,e,i=!1){super.updateWorldMatrix(t,e,i),this.matrixWorld.decompose(oo,ao,Oi),Oi.x===1&&Oi.y===1&&Oi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(oo,ao,Oi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ln=new I,_u=new at,vu=new at,ti=class extends xr{constructor(t=50,e=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=hs*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Gs*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return hs*2*Math.atan(Math.tan(Gs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){ln.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(ln.x,ln.y).multiplyScalar(-t/ln.z),ln.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(ln.x,ln.y).multiplyScalar(-t/ln.z)}getViewSize(t,e){return this.getViewBounds(t,_u,vu),e.subVectors(vu,_u)}setViewOffset(t,e,i,n,s,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Gs*.5*this.fov)/this.zoom,i=2*e,n=this.aspect*i,s=-.5*n,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*n/l,e-=o.offsetY*i/c,n*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(s+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+n,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var ys=class extends xr{constructor(t=-1,e=1,i=1,n=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=n,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,n,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2,s=i-t,o=i+t,a=n+e,l=n-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},hc=class extends zo{constructor(){super(new ys(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},yr=class extends xs{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Je.DEFAULT_UP),this.updateMatrix(),this.target=new Je,this.shadow=new hc}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}},_r=class extends xs{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}};var ns=-90,ss=1,Vo=class extends Je{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let n=new ti(ns,ss,t,e);n.layers=this.layers,this.add(n);let s=new ti(ns,ss,t,e);s.layers=this.layers,this.add(s);let o=new ti(ns,ss,t,e);o.layers=this.layers,this.add(o);let a=new ti(ns,ss,t,e);a.layers=this.layers,this.add(a);let l=new ti(ns,ss,t,e);l.layers=this.layers,this.add(l);let c=new ti(ns,ss,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,n,s,o,a,l]=e;for(let c of e)this.remove(c);if(t===Ri)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===ls)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,c,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),m=t.xr.enabled;t.xr.enabled=!1;let y=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let g=!1;t.isWebGLRenderer===!0?g=t.state.buffers.depth.getReversed():g=t.reversedDepthBuffer,t.setRenderTarget(i,0,n),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,s),t.setRenderTarget(i,1,n),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(i,2,n),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(i,3,n),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(i,4,n),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),i.texture.generateMipmaps=y,t.setRenderTarget(i,5,n),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(u,d,f),t.xr.enabled=m,i.texture.needsPMREMUpdate=!0}},Wo=class extends ti{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var kc="\\[\\]\\.:\\/",Jp=new RegExp("["+kc+"]","g"),Hc="[^"+kc+"]",Kp="[^"+kc.replace("\\.","")+"]",jp=/((?:WC+[\/:])*)/.source.replace("WC",Hc),Qp=/(WCOD+)?/.source.replace("WCOD",Kp),tm=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Hc),em=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Hc),im=new RegExp("^"+jp+Qp+tm+em+"$"),nm=["material","materials","bones","map"],uc=class{constructor(t,e,i){let n=i||Re.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,n)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,n=this._bindings[i];n!==void 0&&n.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let n=this._targetGroup.nCachedObjects_,s=i.length;n!==s;++n)i[n].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}},Re=class r{constructor(t,e,i){this.path=e,this.parsedPath=i||r.parseTrackName(e),this.node=r.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){return t&&t.isAnimationObjectGroup?new r.Composite(t,e,i):new r(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Jp,"")}static parseTrackName(t){let e=im.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},n=i.nodeName&&i.nodeName.lastIndexOf(".");if(n!==void 0&&n!==-1){let s=i.nodeName.substring(n+1);nm.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,n),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===e||a.uuid===e)return a;let l=i(a.children);if(l)return l}return null},n=i(t.children);if(n)return n}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)t[e++]=i[n]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)i[n]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)i[n]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)i[n]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,i=e.objectName,n=e.propertyName,s=e.propertyIndex;if(t||(t=r.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Gt("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=e.objectIndex;switch(i){case"materials":if(!t.material){Yt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Yt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Yt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Yt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Yt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Yt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){Yt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[n];if(o===void 0){let c=e.nodeName;Yt("PropertyBinding: Trying to update property for track: "+c+"."+n+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(n==="morphTargetInfluences"){if(!t.geometry){Yt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Yt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[s]!==void 0&&(s=t.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=n;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Re.Composite=uc;Re.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Re.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Re.prototype.GetterByBindingType=[Re.prototype._getValue_direct,Re.prototype._getValue_array,Re.prototype._getValue_arrayElement,Re.prototype._getValue_toArray];Re.prototype.SetterByBindingTypeAndVersioning=[[Re.prototype._setValue_direct,Re.prototype._setValue_direct_setNeedsUpdate,Re.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Re.prototype._setValue_array,Re.prototype._setValue_array_setNeedsUpdate,Re.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Re.prototype._setValue_arrayElement,Re.prototype._setValue_arrayElement_setNeedsUpdate,Re.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Re.prototype._setValue_fromArray,Re.prototype._setValue_fromArray_setNeedsUpdate,Re.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var N_=new Float32Array(1);var qc=class qc{constructor(t,e,i,n){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,i,n)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let i=0;i<4;i++)this.elements[i]=t[i+e];return this}set(t,e,i,n){let s=this.elements;return s[0]=t,s[2]=e,s[1]=i,s[3]=n,this}};qc.prototype.isMatrix2=!0;var dc=qc;function Gc(r,t,e,i){let n=sm(i);switch(e){case Lc:return r*t;case Qo:return r*t/n.components*n.byteLength;case ta:return r*t/n.components*n.byteLength;case vn:return r*t*2/n.components*n.byteLength;case ea:return r*t*2/n.components*n.byteLength;case Dc:return r*t*3/n.components*n.byteLength;case xi:return r*t*4/n.components*n.byteLength;case ia:return r*t*4/n.components*n.byteLength;case Sr:case Er:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*8;case Tr:case wr:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case sa:case oa:return Math.max(r,16)*Math.max(t,8)/4;case na:case ra:return Math.max(r,8)*Math.max(t,8)/2;case aa:case la:case ha:case ua:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*8;case ca:case Ar:case da:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case fa:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case pa:return Math.floor((r+4)/5)*Math.floor((t+3)/4)*16;case ma:return Math.floor((r+4)/5)*Math.floor((t+4)/5)*16;case ga:return Math.floor((r+5)/6)*Math.floor((t+4)/5)*16;case xa:return Math.floor((r+5)/6)*Math.floor((t+5)/6)*16;case ya:return Math.floor((r+7)/8)*Math.floor((t+4)/5)*16;case _a:return Math.floor((r+7)/8)*Math.floor((t+5)/6)*16;case va:return Math.floor((r+7)/8)*Math.floor((t+7)/8)*16;case ba:return Math.floor((r+9)/10)*Math.floor((t+4)/5)*16;case Ma:return Math.floor((r+9)/10)*Math.floor((t+5)/6)*16;case Sa:return Math.floor((r+9)/10)*Math.floor((t+7)/8)*16;case Ea:return Math.floor((r+9)/10)*Math.floor((t+9)/10)*16;case Ta:return Math.floor((r+11)/12)*Math.floor((t+9)/10)*16;case wa:return Math.floor((r+11)/12)*Math.floor((t+11)/12)*16;case Aa:case Ra:case Ca:return Math.ceil(r/4)*Math.ceil(t/4)*16;case Ia:case Pa:return Math.ceil(r/4)*Math.ceil(t/4)*8;case Rr:case La:return Math.ceil(r/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function sm(r){switch(r){case ci:case Rc:return{byteLength:1,components:1};case bs:case Cc:case Di:return{byteLength:2,components:1};case Ko:case jo:return{byteLength:2,components:4};case Li:case Jo:case gi:return{byteLength:4,components:1};case Ic:case Pc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${r}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Gt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Nd(){let r=null,t=!1,e=null,i=null;function n(s,o){i=r.requestAnimationFrame(n),e(s,o)}return{start:function(){t!==!0&&e!==null&&r!==null&&(i=r.requestAnimationFrame(n),t=!0)},stop:function(){r!==null&&r.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(s){e=s},setContext:function(s){r=s}}}function om(r){let t=new WeakMap;function e(a,l){let c=a.array,h=a.usage,u=c.byteLength,d=r.createBuffer();r.bindBuffer(l,d),r.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=r.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=r.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=r.HALF_FLOAT:f=r.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=r.SHORT;else if(c instanceof Uint32Array)f=r.UNSIGNED_INT;else if(c instanceof Int32Array)f=r.INT;else if(c instanceof Int8Array)f=r.BYTE;else if(c instanceof Uint8Array)f=r.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function i(a,l,c){let h=l.array,u=l.updateRanges;if(r.bindBuffer(c,a),u.length===0)r.bufferSubData(c,0,h);else{u.sort((f,m)=>f.start-m.start);let d=0;for(let f=1;f<u.length;f++){let m=u[d],y=u[f];y.start<=m.start+m.count+1?m.count=Math.max(m.count,y.start+y.count-m.start):(++d,u[d]=y)}u.length=d+1;for(let f=0,m=u.length;f<m;f++){let y=u[f];r.bufferSubData(c,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function n(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=t.get(a);l&&(r.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:n,remove:s,update:o}}var am=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,lm=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,cm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,hm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,um=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,dm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,fm=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,pm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,mm=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,gm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,xm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,ym=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,_m=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,vm=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bm=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Mm=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Sm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Em=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Tm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,wm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Am=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Rm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Cm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Im=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Pm=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Lm=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Dm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Nm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Fm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Om=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Um="gl_FragColor = linearToOutputTexel( gl_FragColor );",Bm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,km=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Hm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Gm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,zm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Vm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Wm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Xm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,qm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Ym=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Zm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,$m=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Jm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Km=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,jm=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Qm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,t0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,e0=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,i0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,n0=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,s0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,r0=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,o0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,a0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,l0=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,c0=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,h0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,u0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,d0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,f0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,p0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,m0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,g0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,x0=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,y0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,_0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,v0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,b0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,M0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,S0=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,E0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,T0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,w0=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,A0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,R0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,C0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,I0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,P0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,L0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,D0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,N0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,F0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,O0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,U0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,B0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,k0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,H0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,G0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,z0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,V0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,W0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,X0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,q0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Y0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Z0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,$0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,J0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,K0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,j0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Q0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tg=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,eg=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,ig=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,ng=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,sg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,rg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,og=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,ag=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,lg=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,hg=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ug=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,dg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,fg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,pg=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,mg=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,gg=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,xg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,yg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_g=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,vg=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,bg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Mg=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Sg=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Eg=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Tg=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,wg=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ag=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Rg=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Cg=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ig=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Pg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Lg=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Dg=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ng=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Fg=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Og=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ug=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Bg=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,kg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Hg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Qt={alphahash_fragment:am,alphahash_pars_fragment:lm,alphamap_fragment:cm,alphamap_pars_fragment:hm,alphatest_fragment:um,alphatest_pars_fragment:dm,aomap_fragment:fm,aomap_pars_fragment:pm,batching_pars_vertex:mm,batching_vertex:gm,begin_vertex:xm,beginnormal_vertex:ym,bsdfs:_m,iridescence_fragment:vm,bumpmap_pars_fragment:bm,clipping_planes_fragment:Mm,clipping_planes_pars_fragment:Sm,clipping_planes_pars_vertex:Em,clipping_planes_vertex:Tm,color_fragment:wm,color_pars_fragment:Am,color_pars_vertex:Rm,color_vertex:Cm,common:Im,cube_uv_reflection_fragment:Pm,defaultnormal_vertex:Lm,displacementmap_pars_vertex:Dm,displacementmap_vertex:Nm,emissivemap_fragment:Fm,emissivemap_pars_fragment:Om,colorspace_fragment:Um,colorspace_pars_fragment:Bm,envmap_fragment:km,envmap_common_pars_fragment:Hm,envmap_pars_fragment:Gm,envmap_pars_vertex:zm,envmap_physical_pars_fragment:Qm,envmap_vertex:Vm,fog_vertex:Wm,fog_pars_vertex:Xm,fog_fragment:qm,fog_pars_fragment:Ym,gradientmap_pars_fragment:Zm,lightmap_pars_fragment:$m,lights_lambert_fragment:Jm,lights_lambert_pars_fragment:Km,lights_pars_begin:jm,lights_toon_fragment:t0,lights_toon_pars_fragment:e0,lights_phong_fragment:i0,lights_phong_pars_fragment:n0,lights_physical_fragment:s0,lights_physical_pars_fragment:r0,lights_fragment_begin:o0,lights_fragment_maps:a0,lights_fragment_end:l0,lightprobes_pars_fragment:c0,logdepthbuf_fragment:h0,logdepthbuf_pars_fragment:u0,logdepthbuf_pars_vertex:d0,logdepthbuf_vertex:f0,map_fragment:p0,map_pars_fragment:m0,map_particle_fragment:g0,map_particle_pars_fragment:x0,metalnessmap_fragment:y0,metalnessmap_pars_fragment:_0,morphinstance_vertex:v0,morphcolor_vertex:b0,morphnormal_vertex:M0,morphtarget_pars_vertex:S0,morphtarget_vertex:E0,normal_fragment_begin:T0,normal_fragment_maps:w0,normal_pars_fragment:A0,normal_pars_vertex:R0,normal_vertex:C0,normalmap_pars_fragment:I0,clearcoat_normal_fragment_begin:P0,clearcoat_normal_fragment_maps:L0,clearcoat_pars_fragment:D0,iridescence_pars_fragment:N0,opaque_fragment:F0,packing:O0,premultiplied_alpha_fragment:U0,project_vertex:B0,dithering_fragment:k0,dithering_pars_fragment:H0,roughnessmap_fragment:G0,roughnessmap_pars_fragment:z0,shadowmap_pars_fragment:V0,shadowmap_pars_vertex:W0,shadowmap_vertex:X0,shadowmask_pars_fragment:q0,skinbase_vertex:Y0,skinning_pars_vertex:Z0,skinning_vertex:$0,skinnormal_vertex:J0,specularmap_fragment:K0,specularmap_pars_fragment:j0,tonemapping_fragment:Q0,tonemapping_pars_fragment:tg,transmission_fragment:eg,transmission_pars_fragment:ig,uv_pars_fragment:ng,uv_pars_vertex:sg,uv_vertex:rg,worldpos_vertex:og,background_vert:ag,background_frag:lg,backgroundCube_vert:cg,backgroundCube_frag:hg,cube_vert:ug,cube_frag:dg,depth_vert:fg,depth_frag:pg,distance_vert:mg,distance_frag:gg,equirect_vert:xg,equirect_frag:yg,linedashed_vert:_g,linedashed_frag:vg,meshbasic_vert:bg,meshbasic_frag:Mg,meshlambert_vert:Sg,meshlambert_frag:Eg,meshmatcap_vert:Tg,meshmatcap_frag:wg,meshnormal_vert:Ag,meshnormal_frag:Rg,meshphong_vert:Cg,meshphong_frag:Ig,meshphysical_vert:Pg,meshphysical_frag:Lg,meshtoon_vert:Dg,meshtoon_frag:Ng,points_vert:Fg,points_frag:Og,shadow_vert:Ug,shadow_frag:Bg,sprite_vert:kg,sprite_frag:Hg},vt={common:{diffuse:{value:new Ot(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Wt},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Wt}},envmap:{envMap:{value:null},envMapRotation:{value:new Wt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Wt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Wt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Wt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Wt},normalScale:{value:new at(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Wt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Wt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Wt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Wt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ot(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new I},probesMax:{value:new I},probesResolution:{value:new I}},points:{diffuse:{value:new Ot(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0},uvTransform:{value:new Wt}},sprite:{diffuse:{value:new Ot(16777215)},opacity:{value:1},center:{value:new at(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Wt},alphaMap:{value:null},alphaMapTransform:{value:new Wt},alphaTest:{value:0}}},Wi={basic:{uniforms:ii([vt.common,vt.specularmap,vt.envmap,vt.aomap,vt.lightmap,vt.fog]),vertexShader:Qt.meshbasic_vert,fragmentShader:Qt.meshbasic_frag},lambert:{uniforms:ii([vt.common,vt.specularmap,vt.envmap,vt.aomap,vt.lightmap,vt.emissivemap,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.fog,vt.lights,{emissive:{value:new Ot(0)},envMapIntensity:{value:1}}]),vertexShader:Qt.meshlambert_vert,fragmentShader:Qt.meshlambert_frag},phong:{uniforms:ii([vt.common,vt.specularmap,vt.envmap,vt.aomap,vt.lightmap,vt.emissivemap,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.fog,vt.lights,{emissive:{value:new Ot(0)},specular:{value:new Ot(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Qt.meshphong_vert,fragmentShader:Qt.meshphong_frag},standard:{uniforms:ii([vt.common,vt.envmap,vt.aomap,vt.lightmap,vt.emissivemap,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.roughnessmap,vt.metalnessmap,vt.fog,vt.lights,{emissive:{value:new Ot(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Qt.meshphysical_vert,fragmentShader:Qt.meshphysical_frag},toon:{uniforms:ii([vt.common,vt.aomap,vt.lightmap,vt.emissivemap,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.gradientmap,vt.fog,vt.lights,{emissive:{value:new Ot(0)}}]),vertexShader:Qt.meshtoon_vert,fragmentShader:Qt.meshtoon_frag},matcap:{uniforms:ii([vt.common,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.fog,{matcap:{value:null}}]),vertexShader:Qt.meshmatcap_vert,fragmentShader:Qt.meshmatcap_frag},points:{uniforms:ii([vt.points,vt.fog]),vertexShader:Qt.points_vert,fragmentShader:Qt.points_frag},dashed:{uniforms:ii([vt.common,vt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Qt.linedashed_vert,fragmentShader:Qt.linedashed_frag},depth:{uniforms:ii([vt.common,vt.displacementmap]),vertexShader:Qt.depth_vert,fragmentShader:Qt.depth_frag},normal:{uniforms:ii([vt.common,vt.bumpmap,vt.normalmap,vt.displacementmap,{opacity:{value:1}}]),vertexShader:Qt.meshnormal_vert,fragmentShader:Qt.meshnormal_frag},sprite:{uniforms:ii([vt.sprite,vt.fog]),vertexShader:Qt.sprite_vert,fragmentShader:Qt.sprite_frag},background:{uniforms:{uvTransform:{value:new Wt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Qt.background_vert,fragmentShader:Qt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Wt}},vertexShader:Qt.backgroundCube_vert,fragmentShader:Qt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Qt.cube_vert,fragmentShader:Qt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Qt.equirect_vert,fragmentShader:Qt.equirect_frag},distance:{uniforms:ii([vt.common,vt.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Qt.distance_vert,fragmentShader:Qt.distance_frag},shadow:{uniforms:ii([vt.lights,vt.fog,{color:{value:new Ot(0)},opacity:{value:1}}]),vertexShader:Qt.shadow_vert,fragmentShader:Qt.shadow_frag}};Wi.physical={uniforms:ii([Wi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Wt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Wt},clearcoatNormalScale:{value:new at(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Wt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Wt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Wt},sheen:{value:0},sheenColor:{value:new Ot(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Wt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Wt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Wt},transmissionSamplerSize:{value:new at},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Wt},attenuationDistance:{value:0},attenuationColor:{value:new Ot(0)},specularColor:{value:new Ot(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Wt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Wt},anisotropyVector:{value:new at},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Wt}}]),vertexShader:Qt.meshphysical_vert,fragmentShader:Qt.meshphysical_frag};var Oa={r:0,b:0,g:0},Gg=new Xt,Fd=new Wt;Fd.set(-1,0,0,0,1,0,0,0,1);function zg(r,t,e,i,n,s){let o=new Ot(0),a=n===!0?0:1,l,c,h=null,u=0,d=null;function f(T){let b=T.isScene===!0?T.background:null;if(b&&b.isTexture){let x=T.backgroundBlurriness>0;b=t.get(b,x)}return b}function m(T){let b=!1,x=f(T);x===null?g(o,a):x&&x.isColor&&(g(x,1),b=!0);let S=r.xr.getEnvironmentBlendMode();S==="additive"?e.buffers.color.setClear(0,0,0,1,s):S==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,s),(r.autoClear||b)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function y(T,b){let x=f(b);x&&(x.isCubeTexture||x.mapping===br)?(c===void 0&&(c=new _t(new ee(1,1,1),new pi({name:"BackgroundCubeMaterial",uniforms:Un(Wi.backgroundCube.uniforms),vertexShader:Wi.backgroundCube.vertexShader,fragmentShader:Wi.backgroundCube.fragmentShader,side:ke,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(S,E,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=x,c.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Gg.makeRotationFromEuler(b.backgroundRotation)).transpose(),x.isCubeTexture&&x.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Fd),c.material.toneMapped=re.getTransfer(x.colorSpace)!==xe,(h!==x||u!==x.version||d!==r.toneMapping)&&(c.material.needsUpdate=!0,h=x,u=x.version,d=r.toneMapping),c.layers.enableAll(),T.unshift(c,c.geometry,c.material,0,0,null)):x&&x.isTexture&&(l===void 0&&(l=new _t(new oi(2,2),new pi({name:"BackgroundMaterial",uniforms:Un(Wi.background.uniforms),vertexShader:Wi.background.vertexShader,fragmentShader:Wi.background.fragmentShader,side:gn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=x,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.toneMapped=re.getTransfer(x.colorSpace)!==xe,x.matrixAutoUpdate===!0&&x.updateMatrix(),l.material.uniforms.uvTransform.value.copy(x.matrix),(h!==x||u!==x.version||d!==r.toneMapping)&&(l.material.needsUpdate=!0,h=x,u=x.version,d=r.toneMapping),l.layers.enableAll(),T.unshift(l,l.geometry,l.material,0,0,null))}function g(T,b){T.getRGB(Oa,Bc(r)),e.buffers.color.setClear(Oa.r,Oa.g,Oa.b,b,s)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(T,b=1){o.set(T),a=b,g(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(T){a=T,g(o,a)},render:m,addToRenderList:y,dispose:p}}function Vg(r,t){let e=r.getParameter(r.MAX_VERTEX_ATTRIBS),i={},n=d(null),s=n,o=!1;function a(P,N,k,L,U){let H=!1,V=u(P,L,k,N);s!==V&&(s=V,c(s.object)),H=f(P,L,k,U),H&&m(P,L,k,U),U!==null&&t.update(U,r.ELEMENT_ARRAY_BUFFER),(H||o)&&(o=!1,x(P,N,k,L),U!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,t.get(U).buffer))}function l(){return r.createVertexArray()}function c(P){return r.bindVertexArray(P)}function h(P){return r.deleteVertexArray(P)}function u(P,N,k,L){let U=L.wireframe===!0,H=i[N.id];H===void 0&&(H={},i[N.id]=H);let V=P.isInstancedMesh===!0?P.id:0,et=H[V];et===void 0&&(et={},H[V]=et);let X=et[k.id];X===void 0&&(X={},et[k.id]=X);let J=X[U];return J===void 0&&(J=d(l()),X[U]=J),J}function d(P){let N=[],k=[],L=[];for(let U=0;U<e;U++)N[U]=0,k[U]=0,L[U]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:N,enabledAttributes:k,attributeDivisors:L,object:P,attributes:{},index:null}}function f(P,N,k,L){let U=s.attributes,H=N.attributes,V=0,et=k.getAttributes();for(let X in et)if(et[X].location>=0){let j=U[X],Ct=H[X];if(Ct===void 0&&(X==="instanceMatrix"&&P.instanceMatrix&&(Ct=P.instanceMatrix),X==="instanceColor"&&P.instanceColor&&(Ct=P.instanceColor)),j===void 0||j.attribute!==Ct||Ct&&j.data!==Ct.data)return!0;V++}return s.attributesNum!==V||s.index!==L}function m(P,N,k,L){let U={},H=N.attributes,V=0,et=k.getAttributes();for(let X in et)if(et[X].location>=0){let j=H[X];j===void 0&&(X==="instanceMatrix"&&P.instanceMatrix&&(j=P.instanceMatrix),X==="instanceColor"&&P.instanceColor&&(j=P.instanceColor));let Ct={};Ct.attribute=j,j&&j.data&&(Ct.data=j.data),U[X]=Ct,V++}s.attributes=U,s.attributesNum=V,s.index=L}function y(){let P=s.newAttributes;for(let N=0,k=P.length;N<k;N++)P[N]=0}function g(P){p(P,0)}function p(P,N){let k=s.newAttributes,L=s.enabledAttributes,U=s.attributeDivisors;k[P]=1,L[P]===0&&(r.enableVertexAttribArray(P),L[P]=1),U[P]!==N&&(r.vertexAttribDivisor(P,N),U[P]=N)}function T(){let P=s.newAttributes,N=s.enabledAttributes;for(let k=0,L=N.length;k<L;k++)N[k]!==P[k]&&(r.disableVertexAttribArray(k),N[k]=0)}function b(P,N,k,L,U,H,V){V===!0?r.vertexAttribIPointer(P,N,k,U,H):r.vertexAttribPointer(P,N,k,L,U,H)}function x(P,N,k,L){y();let U=L.attributes,H=k.getAttributes(),V=N.defaultAttributeValues;for(let et in H){let X=H[et];if(X.location>=0){let J=U[et];if(J===void 0&&(et==="instanceMatrix"&&P.instanceMatrix&&(J=P.instanceMatrix),et==="instanceColor"&&P.instanceColor&&(J=P.instanceColor)),J!==void 0){let j=J.normalized,Ct=J.itemSize,wt=t.get(J);if(wt===void 0)continue;let ae=wt.buffer,ie=wt.type,le=wt.bytesPerElement,$=ie===r.INT||ie===r.UNSIGNED_INT||J.gpuType===Jo;if(J.isInterleavedBufferAttribute){let it=J.data,bt=it.stride,qt=J.offset;if(it.isInstancedInterleavedBuffer){for(let Tt=0;Tt<X.locationSize;Tt++)p(X.location+Tt,it.meshPerAttribute);P.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=it.meshPerAttribute*it.count)}else for(let Tt=0;Tt<X.locationSize;Tt++)g(X.location+Tt);r.bindBuffer(r.ARRAY_BUFFER,ae);for(let Tt=0;Tt<X.locationSize;Tt++)b(X.location+Tt,Ct/X.locationSize,ie,j,bt*le,(qt+Ct/X.locationSize*Tt)*le,$)}else{if(J.isInstancedBufferAttribute){for(let it=0;it<X.locationSize;it++)p(X.location+it,J.meshPerAttribute);P.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let it=0;it<X.locationSize;it++)g(X.location+it);r.bindBuffer(r.ARRAY_BUFFER,ae);for(let it=0;it<X.locationSize;it++)b(X.location+it,Ct/X.locationSize,ie,j,Ct*le,Ct/X.locationSize*it*le,$)}}else if(V!==void 0){let j=V[et];if(j!==void 0)switch(j.length){case 2:r.vertexAttrib2fv(X.location,j);break;case 3:r.vertexAttrib3fv(X.location,j);break;case 4:r.vertexAttrib4fv(X.location,j);break;default:r.vertexAttrib1fv(X.location,j)}}}}T()}function S(){w();for(let P in i){let N=i[P];for(let k in N){let L=N[k];for(let U in L){let H=L[U];for(let V in H)h(H[V].object),delete H[V];delete L[U]}}delete i[P]}}function E(P){if(i[P.id]===void 0)return;let N=i[P.id];for(let k in N){let L=N[k];for(let U in L){let H=L[U];for(let V in H)h(H[V].object),delete H[V];delete L[U]}}delete i[P.id]}function C(P){for(let N in i){let k=i[N];for(let L in k){let U=k[L];if(U[P.id]===void 0)continue;let H=U[P.id];for(let V in H)h(H[V].object),delete H[V];delete U[P.id]}}}function v(P){for(let N in i){let k=i[N],L=P.isInstancedMesh===!0?P.id:0,U=k[L];if(U!==void 0){for(let H in U){let V=U[H];for(let et in V)h(V[et].object),delete V[et];delete U[H]}delete k[L],Object.keys(k).length===0&&delete i[N]}}}function w(){A(),o=!0,s!==n&&(s=n,c(s.object))}function A(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:a,reset:w,resetDefaultState:A,dispose:S,releaseStatesOfGeometry:E,releaseStatesOfObject:v,releaseStatesOfProgram:C,initAttributes:y,enableAttribute:g,disableUnusedAttributes:T}}function Wg(r,t,e){let i;function n(l){i=l}function s(l,c){r.drawArrays(i,l,c),e.update(c,i,1)}function o(l,c,h){h!==0&&(r.drawArraysInstanced(i,l,c,h),e.update(c,i,h))}function a(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let d=0;for(let f=0;f<h;f++)d+=c[f];e.update(d,i,1)}this.setMode=n,this.render=s,this.renderInstances=o,this.renderMultiDraw=a}function Xg(r,t,e,i){let n;function s(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){let C=t.get("EXT_texture_filter_anisotropic");n=r.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function o(C){return!(C!==xi&&i.convert(C)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(C){let v=C===Di&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(C!==ci&&C!==gi&&!v&&i.convert(C)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE))}function l(C){if(C==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(Gt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=e.logarithmicDepthBuffer===!0,d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&d===!1&&Gt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),m=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=r.getParameter(r.MAX_TEXTURE_SIZE),g=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),p=r.getParameter(r.MAX_VERTEX_ATTRIBS),T=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),b=r.getParameter(r.MAX_VARYING_VECTORS),x=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),S=r.getParameter(r.MAX_SAMPLES),E=r.getParameter(r.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:m,maxTextureSize:y,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:T,maxVaryings:b,maxFragmentUniforms:x,maxSamples:S,samples:E}}function qg(r){let t=this,e=null,i=0,n=!1,s=!1,o=new Ai,a=new Wt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||i!==0||n;return n=d,i=u.length,f},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,f){let m=u.clippingPlanes,y=u.clipIntersection,g=u.clipShadows,p=r.get(u);if(!n||m===null||m.length===0||s&&!g)s?h(null):c();else{let T=s?0:i,b=T*4,x=p.clippingState||null;l.value=x,x=h(m,d,b,f);for(let S=0;S!==b;++S)x[S]=e[S];p.clippingState=x,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=T}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(u,d,f,m){let y=u!==null?u.length:0,g=null;if(y!==0){if(g=l.value,m!==!0||g===null){let p=f+y*4,T=d.matrixWorldInverse;a.getNormalMatrix(T),(g===null||g.length<p)&&(g=new Float32Array(p));for(let b=0,x=f;b!==y;++b,x+=4)o.copy(u[b]).applyMatrix4(T,a),o.normal.toArray(g,x),g[x+3]=o.constant}l.value=g,l.needsUpdate=!0}return t.numPlanes=y,t.numIntersection=0,g}}var Es=4,Yg=6,Zg=20,$g=256,Cr=new ys,fd=new Ot,Yc=null,Zc=0,$c=0,Jc=!1,Jg=new I,Bn=new I,Ba=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,i=.1,n=100,s={}){let{size:o=256,position:a=Jg}=s;Yc=this._renderer.getRenderTarget(),Zc=this._renderer.getActiveCubeFace(),$c=this._renderer.getActiveMipmapLevel(),Jc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,i,n,l,a),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=gd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=md(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Yc,Zc,$c),this._renderer.xr.enabled=Jc,t.scissorTest=!1,Ss(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===xn||t.mapping===Fn?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Yc=this._renderer.getRenderTarget(),Zc=this._renderer.getActiveCubeFace(),$c=this._renderer.getActiveMipmapLevel(),Jc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:Ze,minFilter:Ze,generateMipmaps:!1,type:Di,format:xi,colorSpace:qs,depthBuffer:!1},n=pd(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=pd(t,e,i);let{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Kg(s)),this._blurMaterial=Qg(s,t,e),this._ggxMaterial=jg(s,t,e)}return n}_compileMaterial(t){let e=new _t(new de,t);this._renderer.compile(e,Cr)}_sceneToCubeUV(t,e,i,n,s){let l=new ti(90,1,e,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(fd),u.toneMapping=Pi,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(n),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new _t(new ee,new we({name:"PMREM.Background",side:ke,depthWrite:!1,depthTest:!1})));let y=this._backgroundBox,g=y.material,p=!1,T=t.background;T?T.isColor&&(g.color.copy(T),t.background=null,p=!0):(g.color.copy(fd),p=!0);for(let b=0;b<6;b++){let x=b%3;x===0?(l.up.set(0,c[b],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x+h[b],s.y,s.z)):x===1?(l.up.set(0,0,c[b]),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y+h[b],s.z)):(l.up.set(0,c[b],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y,s.z+h[b]));let S=this._cubeSize;Ss(n,x*S,b>2?S:0,S,S),u.setRenderTarget(n),p&&u.render(y,l),u.render(t,l)}u.toneMapping=f,u.autoClear=d,t.background=T}_textureToCubeUV(t,e){let i=this._renderer,n=t.mapping===xn||t.mapping===Fn;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=gd()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=md());let s=n?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=s;let a=s.uniforms;a.envMap.value=t;let l=this._cubeSize;Ss(e,0,0,3*l,2*l),i.setRenderTarget(e),i.render(o,Cr)}_applyPMREM(t){let e=this._renderer,i=e.autoClear;e.autoClear=!1;let n=this._lodMeshes.length;for(let s=1;s<n;s++)this._applyGGXFilter(t,s-1,s);e.autoClear=i}_applyGGXFilter(t,e,i){let n=this._renderer,s=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;let l=o.uniforms,c=i/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),d=c*1.25,f=u*d,{_lodMax:m}=this,y=this._sizeLods[i],g=3*y*(i>m-Es?i-m+Es:0),p=4*(this._cubeSize-y);l.envMap.value=t.texture,l.roughness.value=f,l.mipInt.value=m-e,Ss(s,g,p,3*y,2*y),n.setRenderTarget(s),n.render(a,Cr),l.envMap.value=s.texture,l.roughness.value=0,l.mipInt.value=m-i,Ss(t,g,p,3*y,2*y),n.setRenderTarget(t),n.render(a,Cr)}_blur(t,e,i,n){let s=this._pingPongRenderTarget,o=Math.min(n,Math.PI)/Math.SQRT2;this._blurPass(t,s,e,i,o),this._blurPass(s,t,i,i,o)}_blurPass(t,e,i,n,s){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[n];l.material=a;let c=a.uniforms;c.envMap.value=t.texture,c.sigma.value=s,c.mipInt.value=this._lodMax-i;let h=this._sizeLods[n],u=3*h*(n>this._lodMax-Es?n-this._lodMax+Es:0),d=4*(this._cubeSize-h);Ss(e,u,d,3*h,2*h),o.setRenderTarget(e),o.render(l,Cr)}};function Kg(r){let t=[],e=[],i=r,n=r-Es+1+Yg;for(let s=0;s<n;s++){let o=Math.pow(2,i);t.push(o);let a=1/(o-2),l=-a,c=1+a,h=[l,l,c,l,c,c,l,l,c,c,l,c],u=6,d=6,f=3,m=new Float32Array(f*d*u),y=new Float32Array(f*d*u);for(let p=0;p<u;p++){let T=p%3*2/3-1,b=p>2?0:-1,x=[T,b,0,T+2/3,b,0,T+2/3,b+1,0,T,b,0,T+2/3,b+1,0,T,b+1,0];m.set(x,f*d*p);for(let S=0;S<d;S++){let E=h[S*2]*2-1,C=h[S*2+1]*2-1;p===0?Bn.set(1,C,E):p===1?Bn.set(-E,1,-C):p===2?Bn.set(-E,C,1):p===3?Bn.set(-1,C,-E):p===4?Bn.set(-E,-1,C):Bn.set(E,C,-1),Bn.toArray(y,(p*d+S)*f)}}let g=new de;g.setAttribute("position",new di(m,f)),g.setAttribute("outputDirection",new di(y,f)),e.push(new _t(g,null)),i>Es&&i--}return{lodMeshes:e,sizeLods:t}}function pd(r,t,e){let i=new ai(r,t,e);return i.texture.mapping=br,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Ss(r,t,e,i,n){r.viewport.set(t,e,i,n),r.scissor.set(t,e,i,n)}function jg(r,t,e){return new pi({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:$g,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Ga(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:zi,depthTest:!1,depthWrite:!1})}function Qg(r,t,e){return new pi({name:"SphericalGaussianBlur",defines:{SAMPLES:Zg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Ga(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:zi,depthTest:!1,depthWrite:!1})}function md(){return new pi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ga(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:zi,depthTest:!1,depthWrite:!1})}function gd(){return new pi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ga(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:zi,depthTest:!1,depthWrite:!1})}function Ga(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var ka=class extends ai{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},n=[i,i,i,i,i,i];this.texture=new sr(n),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},n=new ee(5,5,5),s=new pi({name:"CubemapFromEquirect",uniforms:Un(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:ke,blending:zi});s.uniforms.tEquirect.value=e;let o=new _t(n,s),a=e.minFilter;return e.minFilter===yn&&(e.minFilter=Ze),new Vo(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,i=!0,n=!0){let s=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,i,n);t.setRenderTarget(s)}};function tx(r){let t=new WeakMap,e=new WeakMap,i=null;function n(d,f=!1){return d==null?null:f?o(d):s(d)}function s(d){if(d&&d.isTexture){let f=d.mapping;if(f===Yo||f===Zo)if(t.has(d)){let m=t.get(d).texture;return a(m,d.mapping)}else{let m=d.image;if(m&&m.height>0){let y=new ka(m.height);return y.fromEquirectangularTexture(r,d),t.set(d,y),d.addEventListener("dispose",c),a(y.texture,d.mapping)}else return null}}return d}function o(d){if(d&&d.isTexture){let f=d.mapping,m=f===Yo||f===Zo,y=f===xn||f===Fn;if(m||y){let g=e.get(d),p=g!==void 0?g.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==p)return i===null&&(i=new Ba(r)),g=m?i.fromEquirectangular(d,g):i.fromCubemap(d,g),g.texture.pmremVersion=d.pmremVersion,e.set(d,g),g.texture;if(g!==void 0)return g.texture;{let T=d.image;return m&&T&&T.height>0||y&&T&&l(T)?(i===null&&(i=new Ba(r)),g=m?i.fromEquirectangular(d):i.fromCubemap(d),g.texture.pmremVersion=d.pmremVersion,e.set(d,g),d.addEventListener("dispose",h),g.texture):null}}}return d}function a(d,f){return f===Yo?d.mapping=xn:f===Zo&&(d.mapping=Fn),d}function l(d){let f=0,m=6;for(let y=0;y<m;y++)d[y]!==void 0&&f++;return f===m}function c(d){let f=d.target;f.removeEventListener("dispose",c);let m=t.get(f);m!==void 0&&(t.delete(f),m.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let m=e.get(f);m!==void 0&&(e.delete(f),m.dispose())}function u(){t=new WeakMap,e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:n,dispose:u}}function ex(r){let t={};function e(i){if(t[i]!==void 0)return t[i];let n=r.getExtension(i);return t[i]=n,n}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){let n=e(i);return n===null&&Cn("WebGLRenderer: "+i+" extension not supported."),n}}}function ix(r,t,e,i){let n={},s=new WeakMap;function o(u){let d=u.target;d.index!==null&&t.remove(d.index);for(let m in d.attributes)t.remove(d.attributes[m]);d.removeEventListener("dispose",o),delete n[d.id];let f=s.get(d);f&&(t.remove(f),s.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(u,d){return n[d.id]===!0||(d.addEventListener("dispose",o),n[d.id]=!0,e.memory.geometries++),d}function l(u){let d=u.attributes;for(let f in d)t.update(d[f],r.ARRAY_BUFFER)}function c(u){let d=[],f=u.index,m=u.attributes.position,y=0;if(m===void 0)return;if(f!==null){let T=f.array;y=f.version;for(let b=0,x=T.length;b<x;b+=3){let S=T[b+0],E=T[b+1],C=T[b+2];d.push(S,E,E,C,C,S)}}else{let T=m.array;y=m.version;for(let b=0,x=T.length/3-1;b<x;b+=3){let S=b+0,E=b+1,C=b+2;d.push(S,E,E,C,C,S)}}let g=new(m.count>=65535?Qs:Pn)(d,1);g.version=y;let p=s.get(u);p&&t.remove(p),s.set(u,g)}function h(u){let d=s.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return s.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function nx(r,t,e){let i;function n(u){i=u}let s,o;function a(u){s=u.type,o=u.bytesPerElement}function l(u,d){r.drawElements(i,d,s,u*o),e.update(d,i,1)}function c(u,d,f){f!==0&&(r.drawElementsInstanced(i,d,s,u*o,f),e.update(d,i,f))}function h(u,d,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,s,u,0,f);let y=0;for(let g=0;g<f;g++)y+=d[g];e.update(y,i,1)}this.setMode=n,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function sx(r){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(e.calls++,o){case r.TRIANGLES:e.triangles+=a*(s/3);break;case r.LINES:e.lines+=a*(s/2);break;case r.LINE_STRIP:e.lines+=a*(s-1);break;case r.LINE_LOOP:e.lines+=a*s;break;case r.POINTS:e.points+=a*s;break;default:Yt("WebGLInfo: Unknown draw mode:",o);break}}function n(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:n,update:i}}function rx(r,t,e){let i=new WeakMap,n=new be;function s(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,d=i.get(a);if(d===void 0||d.count!==u){let w=function(){C.dispose(),i.delete(a),a.removeEventListener("dispose",w)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,m=a.morphAttributes.normal!==void 0,y=a.morphAttributes.color!==void 0,g=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],T=a.morphAttributes.color||[],b=0;f===!0&&(b=1),m===!0&&(b=2),y===!0&&(b=3);let x=a.attributes.position.count*b,S=1;x>t.maxTextureSize&&(S=Math.ceil(x/t.maxTextureSize),x=t.maxTextureSize);let E=new Float32Array(x*S*4*u),C=new $s(E,x,S,u);C.type=gi,C.needsUpdate=!0;let v=b*4;for(let A=0;A<u;A++){let P=g[A],N=p[A],k=T[A],L=x*S*4*A;for(let U=0;U<P.count;U++){let H=U*v;f===!0&&(n.fromBufferAttribute(P,U),E[L+H+0]=n.x,E[L+H+1]=n.y,E[L+H+2]=n.z,E[L+H+3]=0),m===!0&&(n.fromBufferAttribute(N,U),E[L+H+4]=n.x,E[L+H+5]=n.y,E[L+H+6]=n.z,E[L+H+7]=0),y===!0&&(n.fromBufferAttribute(k,U),E[L+H+8]=n.x,E[L+H+9]=n.y,E[L+H+10]=n.z,E[L+H+11]=k.itemSize===4?n.w:1)}}d={count:u,texture:C,size:new at(x,S)},i.set(a,d),a.addEventListener("dispose",w)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(r,"morphTexture",o.morphTexture,e);else{let f=0;for(let y=0;y<c.length;y++)f+=c[y];let m=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(r,"morphTargetBaseInfluence",m),l.getUniforms().setValue(r,"morphTargetInfluences",c)}l.getUniforms().setValue(r,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(r,"morphTargetsTextureSize",d.size)}return{update:s}}function ox(r,t,e,i,n){let s=new WeakMap;function o(c){let h=n.render.frame,u=c.geometry,d=t.get(c,u);if(s.get(d)!==h&&(t.update(d),s.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),s.get(c)!==h&&(e.update(c.instanceMatrix,r.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,r.ARRAY_BUFFER),s.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;s.get(f)!==h&&(f.update(),s.set(f,h))}return d}function a(){s=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:o,dispose:a}}var ax={[vc]:"LINEAR_TONE_MAPPING",[bc]:"REINHARD_TONE_MAPPING",[Mc]:"CINEON_TONE_MAPPING",[Sc]:"ACES_FILMIC_TONE_MAPPING",[Tc]:"AGX_TONE_MAPPING",[wc]:"NEUTRAL_TONE_MAPPING",[Ec]:"CUSTOM_TONE_MAPPING"};function lx(r,t,e,i,n,s){let o=new ai(t,e,{type:r,depthBuffer:n,stencilBuffer:s,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=new de;c.setAttribute("position",new Ft([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Ft([0,2,0,0,2,0],2));let h=new Co({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),u=new _t(c,h),d=new ys(-1,1,1,-1,0,1),f=null,m=null,y=!1,g,p=null,T=[],b=!1;this.setSize=function(x,S){o.setSize(x,S),a!==null&&a.setSize(x,S),l!==null&&l.setSize(x,S);for(let E=0;E<T.length;E++){let C=T[E];C.setSize&&C.setSize(x,S)}},this.setEffects=function(x){T=x,b=T.length>0&&T[0].isRenderPass===!0;let S=o.width,E=o.height;T.length>0&&a===null&&(a=new ai(S,E,{type:Di,depthBuffer:!1,stencilBuffer:!1}),l=new ai(S,E,{type:Di,depthBuffer:!1,stencilBuffer:!1}));for(let C=0;C<T.length;C++){let v=T[C];v.setSize&&v.setSize(S,E)}},this.begin=function(x,S){if(y||x.toneMapping===Pi&&T.length===0)return!1;if(p=S,S!==null){let E=S.width,C=S.height;(o.width!==E||o.height!==C)&&this.setSize(E,C)}return b===!1&&x.setRenderTarget(o),g=x.toneMapping,x.toneMapping=Pi,!0},this.hasRenderPass=function(){return b},this.end=function(x,S){x.toneMapping=g,y=!0;let E=o,C=a;for(let v=0;v<T.length;v++){let w=T[v];w.enabled!==!1&&(w.render(x,C,E,S),w.needsSwap!==!1&&(E=C,C=C===a?l:a))}if(f!==x.outputColorSpace||m!==x.toneMapping){f=x.outputColorSpace,m=x.toneMapping,h.defines={},re.getTransfer(f)===xe&&(h.defines.SRGB_TRANSFER="");let v=ax[m];v&&(h.defines[v]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=E.texture,x.setRenderTarget(p),x.render(u,d),p=null,y=!1},this.isCompositing=function(){return y},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var Od=new ri,Qc=new dn(1,1),Ud=new $s,Bd=new Mo,kd=new sr,xd=[],yd=[],_d=new Float32Array(16),vd=new Float32Array(9),bd=new Float32Array(4);function ws(r,t,e){let i=r[0];if(i<=0||i>0)return r;let n=t*e,s=xd[n];if(s===void 0&&(s=new Float32Array(n),xd[n]=s),t!==0){i.toArray(s,0);for(let o=1,a=0;o!==t;++o)a+=e,r[o].toArray(s,a)}return s}function He(r,t){if(r.length!==t.length)return!1;for(let e=0,i=r.length;e<i;e++)if(r[e]!==t[e])return!1;return!0}function Ge(r,t){for(let e=0,i=t.length;e<i;e++)r[e]=t[e]}function za(r,t){let e=yd[t];e===void 0&&(e=new Int32Array(t),yd[t]=e);for(let i=0;i!==t;++i)e[i]=r.allocateTextureUnit();return e}function cx(r,t){let e=this.cache;e[0]!==t&&(r.uniform1f(this.addr,t),e[0]=t)}function hx(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(He(e,t))return;r.uniform2fv(this.addr,t),Ge(e,t)}}function ux(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(r.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(He(e,t))return;r.uniform3fv(this.addr,t),Ge(e,t)}}function dx(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(He(e,t))return;r.uniform4fv(this.addr,t),Ge(e,t)}}function fx(r,t){let e=this.cache,i=t.elements;if(i===void 0){if(He(e,t))return;r.uniformMatrix2fv(this.addr,!1,t),Ge(e,t)}else{if(He(e,i))return;bd.set(i),r.uniformMatrix2fv(this.addr,!1,bd),Ge(e,i)}}function px(r,t){let e=this.cache,i=t.elements;if(i===void 0){if(He(e,t))return;r.uniformMatrix3fv(this.addr,!1,t),Ge(e,t)}else{if(He(e,i))return;vd.set(i),r.uniformMatrix3fv(this.addr,!1,vd),Ge(e,i)}}function mx(r,t){let e=this.cache,i=t.elements;if(i===void 0){if(He(e,t))return;r.uniformMatrix4fv(this.addr,!1,t),Ge(e,t)}else{if(He(e,i))return;_d.set(i),r.uniformMatrix4fv(this.addr,!1,_d),Ge(e,i)}}function gx(r,t){let e=this.cache;e[0]!==t&&(r.uniform1i(this.addr,t),e[0]=t)}function xx(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(He(e,t))return;r.uniform2iv(this.addr,t),Ge(e,t)}}function yx(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(He(e,t))return;r.uniform3iv(this.addr,t),Ge(e,t)}}function _x(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(He(e,t))return;r.uniform4iv(this.addr,t),Ge(e,t)}}function vx(r,t){let e=this.cache;e[0]!==t&&(r.uniform1ui(this.addr,t),e[0]=t)}function bx(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(He(e,t))return;r.uniform2uiv(this.addr,t),Ge(e,t)}}function Mx(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(He(e,t))return;r.uniform3uiv(this.addr,t),Ge(e,t)}}function Sx(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(He(e,t))return;r.uniform4uiv(this.addr,t),Ge(e,t)}}function Ex(r,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n);let s;this.type===r.SAMPLER_2D_SHADOW?(Qc.compareFunction=e.isReversedDepthBuffer()?Fa:Na,s=Qc):s=Od,e.setTexture2D(t||s,n)}function Tx(r,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),e.setTexture3D(t||Bd,n)}function Ax(r,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),e.setTextureCube(t||kd,n)}function Rx(r,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),e.setTexture2DArray(t||Ud,n)}function Cx(r){switch(r){case 5126:return cx;case 35664:return hx;case 35665:return ux;case 35666:return dx;case 35674:return fx;case 35675:return px;case 35676:return mx;case 5124:case 35670:return gx;case 35667:case 35671:return xx;case 35668:case 35672:return yx;case 35669:case 35673:return _x;case 5125:return vx;case 36294:return bx;case 36295:return Mx;case 36296:return Sx;case 35678:case 36198:case 36298:case 36306:case 35682:return Ex;case 35679:case 36299:case 36307:return Tx;case 35680:case 36300:case 36308:case 36293:return Ax;case 36289:case 36303:case 36311:case 36292:return Rx}}function Ix(r,t){r.uniform1fv(this.addr,t)}function Px(r,t){let e=ws(t,this.size,2);r.uniform2fv(this.addr,e)}function Lx(r,t){let e=ws(t,this.size,3);r.uniform3fv(this.addr,e)}function Dx(r,t){let e=ws(t,this.size,4);r.uniform4fv(this.addr,e)}function Nx(r,t){let e=ws(t,this.size,4);r.uniformMatrix2fv(this.addr,!1,e)}function Fx(r,t){let e=ws(t,this.size,9);r.uniformMatrix3fv(this.addr,!1,e)}function Ox(r,t){let e=ws(t,this.size,16);r.uniformMatrix4fv(this.addr,!1,e)}function Ux(r,t){r.uniform1iv(this.addr,t)}function Bx(r,t){r.uniform2iv(this.addr,t)}function kx(r,t){r.uniform3iv(this.addr,t)}function Hx(r,t){r.uniform4iv(this.addr,t)}function Gx(r,t){r.uniform1uiv(this.addr,t)}function zx(r,t){r.uniform2uiv(this.addr,t)}function Vx(r,t){r.uniform3uiv(this.addr,t)}function Wx(r,t){r.uniform4uiv(this.addr,t)}function Xx(r,t,e){let i=this.cache,n=t.length,s=za(e,n);He(i,s)||(r.uniform1iv(this.addr,s),Ge(i,s));let o;this.type===r.SAMPLER_2D_SHADOW?o=Qc:o=Od;for(let a=0;a!==n;++a)e.setTexture2D(t[a]||o,s[a])}function qx(r,t,e){let i=this.cache,n=t.length,s=za(e,n);He(i,s)||(r.uniform1iv(this.addr,s),Ge(i,s));for(let o=0;o!==n;++o)e.setTexture3D(t[o]||Bd,s[o])}function Yx(r,t,e){let i=this.cache,n=t.length,s=za(e,n);He(i,s)||(r.uniform1iv(this.addr,s),Ge(i,s));for(let o=0;o!==n;++o)e.setTextureCube(t[o]||kd,s[o])}function Zx(r,t,e){let i=this.cache,n=t.length,s=za(e,n);He(i,s)||(r.uniform1iv(this.addr,s),Ge(i,s));for(let o=0;o!==n;++o)e.setTexture2DArray(t[o]||Ud,s[o])}function $x(r){switch(r){case 5126:return Ix;case 35664:return Px;case 35665:return Lx;case 35666:return Dx;case 35674:return Nx;case 35675:return Fx;case 35676:return Ox;case 5124:case 35670:return Ux;case 35667:case 35671:return Bx;case 35668:case 35672:return kx;case 35669:case 35673:return Hx;case 5125:return Gx;case 36294:return zx;case 36295:return Vx;case 36296:return Wx;case 35678:case 36198:case 36298:case 36306:case 35682:return Xx;case 35679:case 36299:case 36307:return qx;case 35680:case 36300:case 36308:case 36293:return Yx;case 36289:case 36303:case 36311:case 36292:return Zx}}var th=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=Cx(e.type)}},eh=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=$x(e.type)}},ih=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let n=this.seq;for(let s=0,o=n.length;s!==o;++s){let a=n[s];a.setValue(t,e[a.id],i)}}},Kc=/(\w+)(\])?(\[|\.)?/g;function Md(r,t){r.seq.push(t),r.map[t.id]=t}function Jx(r,t,e){let i=r.name,n=i.length;for(Kc.lastIndex=0;;){let s=Kc.exec(i),o=Kc.lastIndex,a=s[1],l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===n){Md(e,c===void 0?new th(a,r,t):new eh(a,r,t));break}else{let u=e.map[a];u===void 0&&(u=new ih(a),Md(e,u)),e=u}}}var Ts=class{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){let a=t.getActiveUniform(e,o),l=t.getUniformLocation(e,a.name);Jx(a,l,this)}let n=[],s=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?n.push(o):s.push(o);n.length>0&&(this.seq=n.concat(s))}setValue(t,e,i,n){let s=this.map[e];s!==void 0&&s.setValue(t,i,n)}setOptional(t,e,i){let n=e[i];n!==void 0&&this.setValue(t,i,n)}static upload(t,e,i,n){for(let s=0,o=e.length;s!==o;++s){let a=e[s],l=i[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,n)}}static seqWithValue(t,e){let i=[];for(let n=0,s=t.length;n!==s;++n){let o=t[n];o.id in e&&i.push(o)}return i}};function Sd(r,t,e){let i=r.createShader(t);return r.shaderSource(i,e),r.compileShader(i),i}var Kx=37297,jx=0;function Qx(r,t){let e=r.split(`
`),i=[],n=Math.max(t-6,0),s=Math.min(t+6,e.length);for(let o=n;o<s;o++){let a=o+1;i.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return i.join(`
`)}var Ed=new Wt;function ty(r){re._getMatrix(Ed,re.workingColorSpace,r);let t=`mat3( ${Ed.elements.map(e=>e.toFixed(4))} )`;switch(re.getTransfer(r)){case Ys:return[t,"LinearTransferOETF"];case xe:return[t,"sRGBTransferOETF"];default:return Gt("WebGLProgram: Unsupported color space: ",r),[t,"LinearTransferOETF"]}}function Td(r,t,e){let i=r.getShaderParameter(t,r.COMPILE_STATUS),s=(r.getShaderInfoLog(t)||"").trim();if(i&&s==="")return"";let o=/ERROR: 0:(\d+)/.exec(s);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+s+`

`+Qx(r.getShaderSource(t),a)}else return s}function ey(r,t){let e=ty(t);return[`vec4 ${r}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var iy={[vc]:"Linear",[bc]:"Reinhard",[Mc]:"Cineon",[Sc]:"ACESFilmic",[Tc]:"AgX",[wc]:"Neutral",[Ec]:"Custom"};function ny(r,t){let e=iy[t];return e===void 0?(Gt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+r+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+r+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var Ua=new I;function sy(){re.getLuminanceCoefficients(Ua);let r=Ua.x.toFixed(4),t=Ua.y.toFixed(4),e=Ua.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function ry(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Pr).join(`
`)}function oy(r){let t=[];for(let e in r){let i=r[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function ay(r,t){let e={},i=r.getProgramParameter(t,r.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){let s=r.getActiveAttrib(t,n),o=s.name,a=1;s.type===r.FLOAT_MAT2&&(a=2),s.type===r.FLOAT_MAT3&&(a=3),s.type===r.FLOAT_MAT4&&(a=4),e[o]={type:s.type,location:r.getAttribLocation(t,o),locationSize:a}}return e}function Pr(r){return r!==""}function wd(r,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return r.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Ad(r,t){return r.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var ly=/^[ \t]*#include +<([\w\d./]+)>/gm;function nh(r){return r.replace(ly,hy)}var cy=new Map;function hy(r,t){let e=Qt[t];if(e===void 0){let i=cy.get(t);if(i!==void 0)e=Qt[i],Gt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return nh(e)}var uy=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Rd(r){return r.replace(uy,dy)}function dy(r,t,e,i){let n="";for(let s=parseInt(t);s<parseInt(e);s++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return n}function Cd(r){let t=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;return r.precision==="highp"?t+=`
#define HIGH_PRECISION`:r.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var fy={[vr]:"SHADOWMAP_TYPE_PCF",[_s]:"SHADOWMAP_TYPE_VSM"};function py(r){return fy[r.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var my={[xn]:"ENVMAP_TYPE_CUBE",[Fn]:"ENVMAP_TYPE_CUBE",[br]:"ENVMAP_TYPE_CUBE_UV"};function gy(r){return r.envMap===!1?"ENVMAP_TYPE_CUBE":my[r.envMapMode]||"ENVMAP_TYPE_CUBE"}var xy={[Fn]:"ENVMAP_MODE_REFRACTION"};function yy(r){return r.envMap===!1?"ENVMAP_MODE_REFLECTION":xy[r.envMapMode]||"ENVMAP_MODE_REFLECTION"}var _y={[_c]:"ENVMAP_BLENDING_MULTIPLY",[Gu]:"ENVMAP_BLENDING_MIX",[zu]:"ENVMAP_BLENDING_ADD"};function vy(r){return r.envMap===!1?"ENVMAP_BLENDING_NONE":_y[r.combine]||"ENVMAP_BLENDING_NONE"}function by(r){let t=r.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:i,maxMip:e}}function My(r,t,e,i){let n=r.getContext(),s=e.defines,o=e.vertexShader,a=e.fragmentShader,l=py(e),c=gy(e),h=yy(e),u=vy(e),d=by(e),f=ry(e),m=oy(s),y=n.createProgram(),g,p,T=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Pr).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Pr).join(`
`),p.length>0&&(p+=`
`)):(g=[Cd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Pr).join(`
`),p=[Cd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Pi?"#define TONE_MAPPING":"",e.toneMapping!==Pi?Qt.tonemapping_pars_fragment:"",e.toneMapping!==Pi?ny("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Qt.colorspace_pars_fragment,ey("linearToOutputTexel",e.outputColorSpace),sy(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Pr).join(`
`)),o=nh(o),o=wd(o,e),o=Ad(o,e),a=nh(a),a=wd(a,e),a=Ad(a,e),o=Rd(o),a=Rd(a),e.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,g=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",e.glslVersion===Nc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Nc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let b=T+g+o,x=T+p+a,S=Sd(n,n.VERTEX_SHADER,b),E=Sd(n,n.FRAGMENT_SHADER,x);n.attachShader(y,S),n.attachShader(y,E),e.index0AttributeName!==void 0?n.bindAttribLocation(y,0,e.index0AttributeName):e.hasPositionAttribute===!0&&n.bindAttribLocation(y,0,"position"),n.linkProgram(y);function C(P){if(r.debug.checkShaderErrors){let N=n.getProgramInfoLog(y)||"",k=n.getShaderInfoLog(S)||"",L=n.getShaderInfoLog(E)||"",U=N.trim(),H=k.trim(),V=L.trim(),et=!0,X=!0;if(n.getProgramParameter(y,n.LINK_STATUS)===!1)if(et=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(n,y,S,E);else{let J=Td(n,S,"vertex"),j=Td(n,E,"fragment");Yt("WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(y,n.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+U+`
`+J+`
`+j)}else U!==""?Gt("WebGLProgram: Program Info Log:",U):(H===""||V==="")&&(X=!1);X&&(P.diagnostics={runnable:et,programLog:U,vertexShader:{log:H,prefix:g},fragmentShader:{log:V,prefix:p}})}n.deleteShader(S),n.deleteShader(E),v=new Ts(n,y),w=ay(n,y)}let v;this.getUniforms=function(){return v===void 0&&C(this),v};let w;this.getAttributes=function(){return w===void 0&&C(this),w};let A=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return A===!1&&(A=n.getProgramParameter(y,Kx)),A},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(y),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=jx++,this.cacheKey=t,this.usedTimes=1,this.program=y,this.vertexShader=S,this.fragmentShader=E,this}var Sy=0,sh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,i){let n=this._getShaderCacheForMaterial(t);return n.has(e)===!1&&(n.add(e),e.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);return i===void 0&&(i=new rh(t),e.set(t,i)),i}},rh=class{constructor(t){this.id=Sy++,this.code=t,this.usedTimes=0}};function Ey(r){return r===vn||r===Ar||r===Rr}function Ty(r,t,e,i,n,s){let o=new Js,a=new sh,l=new Set,c=[],h=new Map,u=i.logarithmicDepthBuffer,d=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(v){return l.add(v),v===0?"uv":`uv${v}`}function y(v,w,A,P,N,k){let L=P.fog,U=N.geometry,H=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?P.environment:null,V=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,et=t.get(v.envMap||H,V),X=et&&et.mapping===br?et.image.height:null,J=f[v.type];v.precision!==null&&(d=i.getMaxPrecision(v.precision),d!==v.precision&&Gt("WebGLProgram.getParameters:",v.precision,"not supported, using",d,"instead."));let j=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,Ct=j!==void 0?j.length:0,wt=0;U.morphAttributes.position!==void 0&&(wt=1),U.morphAttributes.normal!==void 0&&(wt=2),U.morphAttributes.color!==void 0&&(wt=3);let ae,ie,le,$;if(J){let Ee=Wi[J];ae=Ee.vertexShader,ie=Ee.fragmentShader}else{ae=v.vertexShader,ie=v.fragmentShader;let Ee=a.getVertexShaderStage(v),me=a.getFragmentShaderStage(v);a.update(v,Ee,me),le=Ee.id,$=me.id}let it=r.getRenderTarget(),bt=r.state.buffers.depth.getReversed(),qt=N.isInstancedMesh===!0,Tt=N.isBatchedMesh===!0,Zt=!!v.map,ve=!!v.matcap,nt=!!et,rt=!!v.aoMap,lt=!!v.lightMap,ct=!!v.bumpMap&&v.wireframe===!1,dt=!!v.normalMap,zt=!!v.displacementMap,Ht=!!v.emissiveMap,$t=!!v.metalnessMap,Jt=!!v.roughnessMap,D=v.anisotropy>0,pe=v.clearcoat>0,ne=v.dispersion>0,R=v.retroreflectivity>0,_=v.iridescence>0,B=v.sheen>0,W=v.transmission>0,Y=D&&!!v.anisotropyMap,ht=pe&&!!v.clearcoatMap,ut=pe&&!!v.clearcoatNormalMap,Z=pe&&!!v.clearcoatRoughnessMap,Q=_&&!!v.iridescenceMap,ft=_&&!!v.iridescenceThicknessMap,Ut=B&&!!v.sheenColorMap,yt=B&&!!v.sheenRoughnessMap,pt=!!v.specularMap,Bt=!!v.specularColorMap,Vt=!!v.specularIntensityMap,Kt=W&&!!v.transmissionMap,O=W&&!!v.thicknessMap,mt=!!v.gradientMap,K=!!v.alphaMap,gt=v.alphaTest>0,Et=!!v.alphaHash,st=!!v.extensions,kt=Pi;v.toneMapped&&(it===null||it.isXRRenderTarget===!0)&&(kt=r.toneMapping);let Lt={shaderID:J,shaderType:v.type,shaderName:v.name,vertexShader:ae,fragmentShader:ie,defines:v.defines,customVertexShaderID:le,customFragmentShaderID:$,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:d,batching:Tt,batchingColor:Tt&&N._colorsTexture!==null,instancing:qt,instancingColor:qt&&N.instanceColor!==null,instancingMorph:qt&&N.morphTexture!==null,outputColorSpace:it===null?r.outputColorSpace:it.isXRRenderTarget===!0?it.texture.colorSpace:re.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:Zt,matcap:ve,envMap:nt,envMapMode:nt&&et.mapping,envMapCubeUVHeight:X,aoMap:rt,lightMap:lt,bumpMap:ct,normalMap:dt,displacementMap:zt,emissiveMap:Ht,normalMapObjectSpace:dt&&v.normalMapType===qu,normalMapTangentSpace:dt&&v.normalMapType===Da,packedNormalMap:dt&&v.normalMapType===Da&&Ey(v.normalMap.format),metalnessMap:$t,roughnessMap:Jt,anisotropy:D,anisotropyMap:Y,clearcoat:pe,clearcoatMap:ht,clearcoatNormalMap:ut,clearcoatRoughnessMap:Z,dispersion:ne,retroreflection:R,iridescence:_,iridescenceMap:Q,iridescenceThicknessMap:ft,sheen:B,sheenColorMap:Ut,sheenRoughnessMap:yt,specularMap:pt,specularColorMap:Bt,specularIntensityMap:Vt,transmission:W,transmissionMap:Kt,thicknessMap:O,gradientMap:mt,opaque:v.transparent===!1&&v.blending===vs&&v.alphaToCoverage===!1,alphaMap:K,alphaTest:gt,alphaHash:Et,combine:v.combine,mapUv:Zt&&m(v.map.channel),aoMapUv:rt&&m(v.aoMap.channel),lightMapUv:lt&&m(v.lightMap.channel),bumpMapUv:ct&&m(v.bumpMap.channel),normalMapUv:dt&&m(v.normalMap.channel),displacementMapUv:zt&&m(v.displacementMap.channel),emissiveMapUv:Ht&&m(v.emissiveMap.channel),metalnessMapUv:$t&&m(v.metalnessMap.channel),roughnessMapUv:Jt&&m(v.roughnessMap.channel),anisotropyMapUv:Y&&m(v.anisotropyMap.channel),clearcoatMapUv:ht&&m(v.clearcoatMap.channel),clearcoatNormalMapUv:ut&&m(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Z&&m(v.clearcoatRoughnessMap.channel),iridescenceMapUv:Q&&m(v.iridescenceMap.channel),iridescenceThicknessMapUv:ft&&m(v.iridescenceThicknessMap.channel),sheenColorMapUv:Ut&&m(v.sheenColorMap.channel),sheenRoughnessMapUv:yt&&m(v.sheenRoughnessMap.channel),specularMapUv:pt&&m(v.specularMap.channel),specularColorMapUv:Bt&&m(v.specularColorMap.channel),specularIntensityMapUv:Vt&&m(v.specularIntensityMap.channel),transmissionMapUv:Kt&&m(v.transmissionMap.channel),thicknessMapUv:O&&m(v.thicknessMap.channel),alphaMapUv:K&&m(v.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(dt||D),vertexNormals:!!U.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!U.attributes.uv&&(Zt||K),fog:!!L,useFog:v.fog===!0,fogExp2:!!L&&L.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||U.attributes.normal===void 0&&dt===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:bt,skinning:N.isSkinnedMesh===!0,hasPositionAttribute:U.attributes.position!==void 0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:Ct,morphTextureStride:wt,numSunLights:w.sun.length,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numSunLightShadows:w.sunShadowMap.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numLightProbeGrids:k.length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:v.dithering,shadowMapEnabled:r.shadowMap.enabled&&A.length>0,shadowMapType:r.shadowMap.type,toneMapping:kt,decodeVideoTexture:Zt&&v.map.isVideoTexture===!0&&re.getTransfer(v.map.colorSpace)===xe,decodeVideoTextureEmissive:Ht&&v.emissiveMap.isVideoTexture===!0&&re.getTransfer(v.emissiveMap.colorSpace)===xe,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===Fe,flipSided:v.side===ke,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:st&&v.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(st&&v.extensions.multiDraw===!0||Tt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return Lt.vertexUv1s=l.has(1),Lt.vertexUv2s=l.has(2),Lt.vertexUv3s=l.has(3),l.clear(),Lt}function g(v){let w=[];if(v.shaderID?w.push(v.shaderID):(w.push(v.customVertexShaderID),w.push(v.customFragmentShaderID)),v.defines!==void 0)for(let A in v.defines)w.push(A),w.push(v.defines[A]);return v.isRawShaderMaterial===!1&&(p(w,v),T(w,v),w.push(r.outputColorSpace)),w.push(v.customProgramCacheKey),w.join()}function p(v,w){v.push(w.precision),v.push(w.outputColorSpace),v.push(w.envMapMode),v.push(w.envMapCubeUVHeight),v.push(w.mapUv),v.push(w.alphaMapUv),v.push(w.lightMapUv),v.push(w.aoMapUv),v.push(w.bumpMapUv),v.push(w.normalMapUv),v.push(w.displacementMapUv),v.push(w.emissiveMapUv),v.push(w.metalnessMapUv),v.push(w.roughnessMapUv),v.push(w.anisotropyMapUv),v.push(w.clearcoatMapUv),v.push(w.clearcoatNormalMapUv),v.push(w.clearcoatRoughnessMapUv),v.push(w.iridescenceMapUv),v.push(w.iridescenceThicknessMapUv),v.push(w.sheenColorMapUv),v.push(w.sheenRoughnessMapUv),v.push(w.specularMapUv),v.push(w.specularColorMapUv),v.push(w.specularIntensityMapUv),v.push(w.transmissionMapUv),v.push(w.thicknessMapUv),v.push(w.combine),v.push(w.fogExp2),v.push(w.sizeAttenuation),v.push(w.morphTargetsCount),v.push(w.morphAttributeCount),v.push(w.numSunLights),v.push(w.numDirLights),v.push(w.numPointLights),v.push(w.numSpotLights),v.push(w.numSpotLightMaps),v.push(w.numHemiLights),v.push(w.numRectAreaLights),v.push(w.numSunLightShadows),v.push(w.numDirLightShadows),v.push(w.numPointLightShadows),v.push(w.numSpotLightShadows),v.push(w.numSpotLightShadowsWithMaps),v.push(w.numLightProbes),v.push(w.shadowMapType),v.push(w.toneMapping),v.push(w.numClippingPlanes),v.push(w.numClipIntersection),v.push(w.depthPacking)}function T(v,w){o.disableAll(),w.instancing&&o.enable(0),w.instancingColor&&o.enable(1),w.instancingMorph&&o.enable(2),w.matcap&&o.enable(3),w.envMap&&o.enable(4),w.normalMapObjectSpace&&o.enable(5),w.normalMapTangentSpace&&o.enable(6),w.clearcoat&&o.enable(7),w.iridescence&&o.enable(8),w.alphaTest&&o.enable(9),w.vertexColors&&o.enable(10),w.vertexAlphas&&o.enable(11),w.vertexUv1s&&o.enable(12),w.vertexUv2s&&o.enable(13),w.vertexUv3s&&o.enable(14),w.vertexTangents&&o.enable(15),w.anisotropy&&o.enable(16),w.alphaHash&&o.enable(17),w.batching&&o.enable(18),w.dispersion&&o.enable(19),w.retroreflection&&o.enable(24),w.batchingColor&&o.enable(20),w.gradientMap&&o.enable(21),w.packedNormalMap&&o.enable(22),w.vertexNormals&&o.enable(23),v.push(o.mask),o.disableAll(),w.fog&&o.enable(0),w.useFog&&o.enable(1),w.flatShading&&o.enable(2),w.logarithmicDepthBuffer&&o.enable(3),w.reversedDepthBuffer&&o.enable(4),w.skinning&&o.enable(5),w.morphTargets&&o.enable(6),w.morphNormals&&o.enable(7),w.morphColors&&o.enable(8),w.premultipliedAlpha&&o.enable(9),w.shadowMapEnabled&&o.enable(10),w.doubleSided&&o.enable(11),w.flipSided&&o.enable(12),w.useDepthPacking&&o.enable(13),w.dithering&&o.enable(14),w.transmission&&o.enable(15),w.sheen&&o.enable(16),w.opaque&&o.enable(17),w.pointsUvs&&o.enable(18),w.decodeVideoTexture&&o.enable(19),w.decodeVideoTextureEmissive&&o.enable(20),w.alphaToCoverage&&o.enable(21),w.numLightProbeGrids>0&&o.enable(22),w.hasPositionAttribute&&o.enable(23),v.push(o.mask)}function b(v){let w=f[v.type],A;if(w){let P=Wi[w];A=hd.clone(P.uniforms)}else A=v.uniforms;return A}function x(v,w){let A=h.get(w);return A!==void 0?++A.usedTimes:(A=new My(r,w,v,n),c.push(A),h.set(w,A)),A}function S(v){if(--v.usedTimes===0){let w=c.indexOf(v);c[w]=c[c.length-1],c.pop(),h.delete(v.cacheKey),v.destroy()}}function E(v){a.remove(v)}function C(){a.dispose()}return{getParameters:y,getProgramCacheKey:g,getUniforms:b,acquireProgram:x,releaseProgram:S,releaseShaderCache:E,programs:c,dispose:C}}function wy(){let r=new WeakMap;function t(o){return r.has(o)}function e(o){let a=r.get(o);return a===void 0&&(a={},r.set(o,a)),a}function i(o){r.delete(o)}function n(o,a,l){r.get(o)[a]=l}function s(){r=new WeakMap}return{has:t,get:e,remove:i,update:n,dispose:s}}function Ay(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.material.id!==t.material.id?r.material.id-t.material.id:r.materialVariant!==t.materialVariant?r.materialVariant-t.materialVariant:r.z!==t.z?r.z-t.z:r.id-t.id}function Id(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.z!==t.z?t.z-r.z:r.id-t.id}function Pd(){let r=[],t=0,e=[],i=[],n=[];function s(){t=0,e.length=0,i.length=0,n.length=0}function o(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function a(d,f,m,y,g,p){let T=r[t];return T===void 0?(T={id:d.id,object:d,geometry:f,material:m,materialVariant:o(d),groupOrder:y,renderOrder:d.renderOrder,z:g,group:p},r[t]=T):(T.id=d.id,T.object=d,T.geometry=f,T.material=m,T.materialVariant=o(d),T.groupOrder=y,T.renderOrder=d.renderOrder,T.z=g,T.group=p),t++,T}function l(d,f,m,y,g,p,T){T.reversedDepth===!0&&(g=-g);let b=a(d,f,m,y,g,p);m.transmission>0?i.push(b):m.transparent===!0?n.push(b):e.push(b)}function c(d,f,m,y,g,p){let T=a(d,f,m,y,g,p);m.transmission>0?i.unshift(T):m.transparent===!0?n.unshift(T):e.unshift(T)}function h(d,f){e.length>1&&e.sort(d||Ay),i.length>1&&i.sort(f||Id),n.length>1&&n.sort(f||Id)}function u(){for(let d=t,f=r.length;d<f;d++){let m=r[d];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:e,transmissive:i,transparent:n,init:s,push:l,unshift:c,finish:u,sort:h}}function Ry(){let r=new WeakMap;function t(i,n){let s=r.get(i),o;return s===void 0?(o=new Pd,r.set(i,[o])):n>=s.length?(o=new Pd,s.push(o)):o=s[n],o}function e(){r=new WeakMap}return{get:t,dispose:e}}function Cy(){let r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new I,color:new Ot};break;case"SpotLight":e={position:new I,direction:new I,color:new Ot,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new I,color:new Ot,distance:0,decay:0};break;case"HemisphereLight":e={direction:new I,skyColor:new Ot,groundColor:new Ot};break;case"RectAreaLight":e={color:new Ot,position:new I,halfWidth:new I,halfHeight:new I};break}return r[t.id]=e,e}}}function Iy(){let r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[t.id]=e,e}}}var Py=0;function Ly(r,t){return(t.castShadow?2:0)-(r.castShadow?2:0)+(t.map?1:0)-(r.map?1:0)}function Dy(r){let t=new Cy,e=Iy(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new I);let n=new I,s=new Xt,o=new Xt;function a(c){let h=0,u=0,d=0;for(let N=0;N<9;N++)i.probe[N].set(0,0,0);let f=0,m=0,y=0,g=0,p=0,T=0,b=0,x=0,S=0,E=0,C=0,v=0,w=0,A=0;c.sort(Ly);for(let N=0,k=c.length;N<k;N++){let L=c[N],U=L.color,H=L.intensity,V=L.distance,et=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===vn?et=L.shadow.map.texture:et=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)h+=U.r*H,u+=U.g*H,d+=U.b*H;else if(L.isLightProbe){for(let X=0;X<9;X++)i.probe[X].addScaledVector(L.sh.coefficients[X],H);A++}else if(L.isSunLight){let X=t.get(L);if(X.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let J=L.shadow,j=e.get(L);j.shadowIntensity=J.intensity,j.shadowBias=J.bias,j.shadowNormalBias=J.normalBias,j.shadowRadius=J.radius,j.shadowMapSize.copy(J.mapSize).multiply(J.getFrameExtents()),i.sunShadow[m]=j,i.sunShadowMap[m]=et;let Ct=J.getViewportCount();for(let wt=0;wt<Ct;wt++)i.sunShadowMatrix[y+wt]=J.getMatrix(wt),i.sunShadowCascade[y+wt]=J._cascadeData[wt];y+=Ct,m++}i.sun[f]=X,f++}else if(L.isDirectionalLight){let X=t.get(L);if(X.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let J=L.shadow,j=e.get(L);j.shadowIntensity=J.intensity,j.shadowBias=J.bias,j.shadowNormalBias=J.normalBias,j.shadowRadius=J.radius,j.shadowMapSize=J.mapSize,i.directionalShadow[g]=j,i.directionalShadowMap[g]=et,i.directionalShadowMatrix[g]=L.shadow.matrix,S++}i.directional[g]=X,g++}else if(L.isSpotLight){let X=t.get(L);X.position.setFromMatrixPosition(L.matrixWorld),X.color.copy(U).multiplyScalar(H),X.distance=V,X.coneCos=Math.cos(L.angle),X.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),X.decay=L.decay,i.spot[T]=X;let J=L.shadow;if(L.map&&(i.spotLightMap[v]=L.map,v++,J.updateMatrices(L),L.castShadow&&w++),i.spotLightMatrix[T]=J.matrix,L.castShadow){let j=e.get(L);j.shadowIntensity=J.intensity,j.shadowBias=J.bias,j.shadowNormalBias=J.normalBias,j.shadowRadius=J.radius,j.shadowMapSize=J.mapSize,i.spotShadow[T]=j,i.spotShadowMap[T]=et,C++}T++}else if(L.isRectAreaLight){let X=t.get(L);X.color.copy(U).multiplyScalar(H),X.halfWidth.set(L.width*.5,0,0),X.halfHeight.set(0,L.height*.5,0),i.rectArea[b]=X,b++}else if(L.isPointLight){let X=t.get(L);if(X.color.copy(L.color).multiplyScalar(L.intensity),X.distance=L.distance,X.decay=L.decay,L.castShadow){let J=L.shadow,j=e.get(L);j.shadowIntensity=J.intensity,j.shadowBias=J.bias,j.shadowNormalBias=J.normalBias,j.shadowRadius=J.radius,j.shadowMapSize=J.mapSize,j.shadowCameraNear=J.camera.near,j.shadowCameraFar=J.camera.far,i.pointShadow[p]=j,i.pointShadowMap[p]=et,i.pointShadowMatrix[p]=L.shadow.matrix,E++}i.point[p]=X,p++}else if(L.isHemisphereLight){let X=t.get(L);X.skyColor.copy(L.color).multiplyScalar(H),X.groundColor.copy(L.groundColor).multiplyScalar(H),i.hemi[x]=X,x++}}b>0&&(r.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=vt.LTC_FLOAT_1,i.rectAreaLTC2=vt.LTC_FLOAT_2):(i.rectAreaLTC1=vt.LTC_HALF_1,i.rectAreaLTC2=vt.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=d;let P=i.hash;(P.sunLength!==f||P.directionalLength!==g||P.pointLength!==p||P.spotLength!==T||P.rectAreaLength!==b||P.hemiLength!==x||P.numSunShadows!==m||P.numDirectionalShadows!==S||P.numPointShadows!==E||P.numSpotShadows!==C||P.numSpotMaps!==v||P.numLightProbes!==A)&&(i.sun.length=f,i.directional.length=g,i.spot.length=T,i.rectArea.length=b,i.point.length=p,i.hemi.length=x,i.sunShadow.length=m,i.sunShadowMap.length=m,i.sunShadowMatrix.length=y,i.sunShadowCascade.length=y,i.directionalShadow.length=S,i.directionalShadowMap.length=S,i.directionalShadowMatrix.length=S,i.pointShadow.length=E,i.pointShadowMap.length=E,i.pointShadowMatrix.length=E,i.spotShadow.length=C,i.spotShadowMap.length=C,i.spotLightMatrix.length=C+v-w,i.spotLightMap.length=v,i.numSpotLightShadowsWithMaps=w,i.numLightProbes=A,P.sunLength=f,P.directionalLength=g,P.pointLength=p,P.spotLength=T,P.rectAreaLength=b,P.hemiLength=x,P.numSunShadows=m,P.numDirectionalShadows=S,P.numPointShadows=E,P.numSpotShadows=C,P.numSpotMaps=v,P.numLightProbes=A,i.version=Py++)}function l(c,h){let u=0,d=0,f=0,m=0,y=0,g=0,p=h.matrixWorldInverse;for(let T=0,b=c.length;T<b;T++){let x=c[T];if(x.isSunLight){let S=i.sun[u];S.direction.setFromMatrixPosition(x.matrixWorld),S.direction.transformDirection(p),u++}else if(x.isDirectionalLight){let S=i.directional[d];S.direction.setFromMatrixPosition(x.matrixWorld),n.setFromMatrixPosition(x.target.matrixWorld),S.direction.sub(n),S.direction.transformDirection(p),d++}else if(x.isSpotLight){let S=i.spot[m];S.position.setFromMatrixPosition(x.matrixWorld),S.position.applyMatrix4(p),S.direction.setFromMatrixPosition(x.matrixWorld),n.setFromMatrixPosition(x.target.matrixWorld),S.direction.sub(n),S.direction.transformDirection(p),m++}else if(x.isRectAreaLight){let S=i.rectArea[y];S.position.setFromMatrixPosition(x.matrixWorld),S.position.applyMatrix4(p),o.identity(),s.copy(x.matrixWorld),s.premultiply(p),o.extractRotation(s),S.halfWidth.set(x.width*.5,0,0),S.halfHeight.set(0,x.height*.5,0),S.halfWidth.applyMatrix4(o),S.halfHeight.applyMatrix4(o),y++}else if(x.isPointLight){let S=i.point[f];S.position.setFromMatrixPosition(x.matrixWorld),S.position.applyMatrix4(p),f++}else if(x.isHemisphereLight){let S=i.hemi[g];S.direction.setFromMatrixPosition(x.matrixWorld),S.direction.transformDirection(p),g++}}}return{setup:a,setupView:l,state:i}}function Ld(r){let t=new Dy(r),e=[],i=[],n=[];function s(d){u.camera=d,e.length=0,i.length=0,n.length=0}function o(d){e.push(d)}function a(d){i.push(d)}function l(d){n.push(d)}function c(){t.setup(e)}function h(d){t.setupView(e,d)}let u={lightsArray:e,shadowsArray:i,lightProbeGridArray:n,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:u,setupLights:c,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function Ny(r){let t=new WeakMap;function e(n,s=0){let o=t.get(n),a;return o===void 0?(a=new Ld(r),t.set(n,[a])):s>=o.length?(a=new Ld(r),o.push(a)):a=o[s],a}function i(){t=new WeakMap}return{get:e,dispose:i}}var Fy=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Oy=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Uy=[new I(1,0,0),new I(-1,0,0),new I(0,1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1)],By=[new I(0,-1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1),new I(0,-1,0),new I(0,-1,0)],Dd=new Xt,Ir=new I,jc=new I;function ky(r,t,e){let i=new ps,n=new at,s=new at,o=new be,a=new Io,l=new Po,c={},h=e.maxTextureSize,u={[gn]:ke,[ke]:gn,[Fe]:Fe},d=new pi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new at},radius:{value:4}},vertexShader:Fy,fragmentShader:Oy}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let m=new de;m.setAttribute("position",new di(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new _t(m,d),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=vr;let p=this.type;this.render=function(E,C,v){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||E.length===0)return;this.type===qo&&(Gt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=vr);let w=r.getRenderTarget(),A=r.getActiveCubeFace(),P=r.getActiveMipmapLevel(),N=r.state;N.setBlending(zi),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);let k=p!==this.type;k&&C.traverse(function(L){L.material&&(Array.isArray(L.material)?L.material.forEach(U=>U.needsUpdate=!0):L.material.needsUpdate=!0)});for(let L=0,U=E.length;L<U;L++){let H=E[L],V=H.shadow;if(V===void 0){Gt("WebGLShadowMap:",H,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;n.copy(V.mapSize);let et=V.getFrameExtents();n.multiply(et),s.copy(V.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(s.x=Math.floor(h/et.x),n.x=s.x*et.x,V.mapSize.x=s.x),n.y>h&&(s.y=Math.floor(h/et.y),n.y=s.y*et.y,V.mapSize.y=s.y));let X=r.state.buffers.depth.getReversed();if(V.camera._reversedDepth=X,V.map===null||k===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===_s){if(H.isPointLight){Gt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new ai(n.x,n.y,{format:vn,type:Di,minFilter:Ze,magFilter:Ze,generateMipmaps:!1}),V.map.texture.name=H.name+".shadowMap",V.map.depthTexture=new dn(n.x,n.y,gi),V.map.depthTexture.name=H.name+".shadowMapDepth",V.map.depthTexture.format=ki,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=We,V.map.depthTexture.magFilter=We}else H.isPointLight?(V.map=new ka(n.x),V.map.depthTexture=new So(n.x,Li)):(V.map=new ai(n.x,n.y),V.map.depthTexture=new dn(n.x,n.y,Li)),V.map.depthTexture.name=H.name+".shadowMap",V.map.depthTexture.format=ki,this.type===vr?(V.map.depthTexture.compareFunction=X?Fa:Na,V.map.depthTexture.minFilter=Ze,V.map.depthTexture.magFilter=Ze):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=We,V.map.depthTexture.magFilter=We);V.camera.updateProjectionMatrix()}V.map.isWebGLCubeRenderTarget!==!0&&(V.map.width!==n.x||V.map.height!==n.y)&&V.map.setSize(n.x,n.y);let J=V.map.isWebGLCubeRenderTarget?6:V.getViewportCount();H.isPointLight!==!0&&V.updateMatrices(H,v);for(let j=0;j<J;j++){let Ct=V.getCamera(j);if(H.isPointLight){let wt=V.camera,ae=V.matrix,ie=H.distance||wt.far;ie!==wt.far&&(wt.far=ie,wt.updateProjectionMatrix()),Ir.setFromMatrixPosition(H.matrixWorld),wt.position.copy(Ir),jc.copy(wt.position),jc.add(Uy[j]),wt.up.copy(By[j]),wt.lookAt(jc),wt.updateMatrixWorld(),ae.makeTranslation(-Ir.x,-Ir.y,-Ir.z),Dd.multiplyMatrices(wt.projectionMatrix,wt.matrixWorldInverse),V._frustum.setFromProjectionMatrix(Dd,wt.coordinateSystem,wt.reversedDepth)}if(V.map.isWebGLCubeRenderTarget)r.setRenderTarget(V.map,j),r.clear();else{j===0&&(r.setRenderTarget(V.map),r.clear());let wt=V.getViewport(j);o.set(s.x*wt.x,s.y*wt.y,s.x*wt.z,s.y*wt.w),N.viewport(o)}i=V.getFrustum(j),x(C,v,Ct,H,this.type)}V.isPointLightShadow!==!0&&this.type===_s&&T(V,v),V.needsUpdate=!1}p=this.type,g.needsUpdate=!1,r.setRenderTarget(w,A,P)};function T(E,C){let v=t.update(y);d.defines.VSM_SAMPLES!==E.blurSamples&&(d.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null?E.mapPass=new ai(n.x,n.y,{format:vn,type:Di}):(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)&&E.mapPass.setSize(E.map.width,E.map.height),d.uniforms.shadow_pass.value=E.map.depthTexture,d.uniforms.resolution.value.set(E.map.width,E.map.height),d.uniforms.radius.value=E.radius,r.setRenderTarget(E.mapPass),r.clear(),r.renderBufferDirect(C,null,v,d,y,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value.set(E.map.width,E.map.height),f.uniforms.radius.value=E.radius,r.setRenderTarget(E.map),r.clear(),r.renderBufferDirect(C,null,v,f,y,null)}function b(E,C,v,w){let A=null,P=v.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(P!==void 0)A=P;else if(A=v.isPointLight===!0?l:a,r.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){let N=A.uuid,k=C.uuid,L=c[N];L===void 0&&(L={},c[N]=L);let U=L[k];U===void 0&&(U=A.clone(),L[k]=U,C.addEventListener("dispose",S)),A=U}if(A.visible=C.visible,A.wireframe=C.wireframe,w===_s?A.side=C.shadowSide!==null?C.shadowSide:C.side:A.side=C.shadowSide!==null?C.shadowSide:u[C.side],A.alphaMap=C.alphaMap,A.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,A.map=C.map,A.clipShadows=C.clipShadows,A.clippingPlanes=C.clippingPlanes,A.clipIntersection=C.clipIntersection,A.displacementMap=C.displacementMap,A.displacementScale=C.displacementScale,A.displacementBias=C.displacementBias,A.wireframeLinewidth=C.wireframeLinewidth,A.linewidth=C.linewidth,v.isPointLight===!0&&A.isMeshDistanceMaterial===!0){let N=r.properties.get(A);N.light=v}return A}function x(E,C,v,w,A){if(E.visible===!1)return;if(E.layers.test(C.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&A===_s)&&(!E.frustumCulled||E.intersectsFrustum(i))){E.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,E.matrixWorld);let k=t.update(E),L=E.material;if(Array.isArray(L)){let U=k.groups;for(let H=0,V=U.length;H<V;H++){let et=U[H],X=L[et.materialIndex];if(X&&X.visible){let J=b(E,X,w,A);E.onBeforeShadow(r,E,C,v,k,J,et),r.renderBufferDirect(v,null,k,J,E,et),E.onAfterShadow(r,E,C,v,k,J,et)}}}else if(L.visible){let U=b(E,L,w,A);E.onBeforeShadow(r,E,C,v,k,U,null),r.renderBufferDirect(v,null,k,U,E,null),E.onAfterShadow(r,E,C,v,k,U,null)}}let N=E.children;for(let k=0,L=N.length;k<L;k++)x(N[k],C,v,w,A)}function S(E){E.target.removeEventListener("dispose",S);for(let v in c){let w=c[v],A=E.target.uuid;A in w&&(w[A].dispose(),delete w[A])}}}function Hy(r,t){function e(){let O=!1,mt=new be,K=null,gt=new be(0,0,0,0);return{setMask:function(Et){K!==Et&&!O&&(r.colorMask(Et,Et,Et,Et),K=Et)},setLocked:function(Et){O=Et},setClear:function(Et,st,kt,Lt,Ee){Ee===!0&&(Et*=Lt,st*=Lt,kt*=Lt),mt.set(Et,st,kt,Lt),gt.equals(mt)===!1&&(r.clearColor(Et,st,kt,Lt),gt.copy(mt))},reset:function(){O=!1,K=null,gt.set(-1,0,0,0)}}}function i(){let O=!1,mt=!1,K=null,gt=null,Et=null;return{setReversed:function(st){if(mt!==st){let kt=t.get("EXT_clip_control");st?kt.clipControlEXT(kt.LOWER_LEFT_EXT,kt.ZERO_TO_ONE_EXT):kt.clipControlEXT(kt.LOWER_LEFT_EXT,kt.NEGATIVE_ONE_TO_ONE_EXT),mt=st;let Lt=Et;Et=null,this.setClear(Lt)}},getReversed:function(){return mt},setTest:function(st){st?it(r.DEPTH_TEST):bt(r.DEPTH_TEST)},setMask:function(st){K!==st&&!O&&(r.depthMask(st),K=st)},setFunc:function(st){if(mt&&(st=sd[st]),gt!==st){switch(st){case ho:r.depthFunc(r.NEVER);break;case uo:r.depthFunc(r.ALWAYS);break;case fo:r.depthFunc(r.LESS);break;case as:r.depthFunc(r.LEQUAL);break;case po:r.depthFunc(r.EQUAL);break;case mo:r.depthFunc(r.GEQUAL);break;case go:r.depthFunc(r.GREATER);break;case xo:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}gt=st}},setLocked:function(st){O=st},setClear:function(st){Et!==st&&(Et=st,mt&&(st=1-st),r.clearDepth(st))},reset:function(){O=!1,K=null,gt=null,Et=null,mt=!1}}}function n(){let O=!1,mt=null,K=null,gt=null,Et=null,st=null,kt=null,Lt=null,Ee=null;return{setTest:function(me){O||(me?it(r.STENCIL_TEST):bt(r.STENCIL_TEST))},setMask:function(me){mt!==me&&!O&&(r.stencilMask(me),mt=me)},setFunc:function(me,Si,Ni){(K!==me||gt!==Si||Et!==Ni)&&(r.stencilFunc(me,Si,Ni),K=me,gt=Si,Et=Ni)},setOp:function(me,Si,Ni){(st!==me||kt!==Si||Lt!==Ni)&&(r.stencilOp(me,Si,Ni),st=me,kt=Si,Lt=Ni)},setLocked:function(me){O=me},setClear:function(me){Ee!==me&&(r.clearStencil(me),Ee=me)},reset:function(){O=!1,mt=null,K=null,gt=null,Et=null,st=null,kt=null,Lt=null,Ee=null}}}let s=new e,o=new i,a=new n,l=new WeakMap,c=new WeakMap,h={},u={},d={},f=new WeakMap,m=[],y=null,g=!1,p=null,T=null,b=null,x=null,S=null,E=null,C=null,v=new Ot(0,0,0),w=0,A=!1,P=null,N=null,k=null,L=null,U=null,H=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,et=0,X=r.getParameter(r.VERSION);X.indexOf("WebGL")!==-1?(et=parseFloat(/^WebGL (\d)/.exec(X)[1]),V=et>=1):X.indexOf("OpenGL ES")!==-1&&(et=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),V=et>=2);let J=null,j={},Ct=r.getParameter(r.SCISSOR_BOX),wt=r.getParameter(r.VIEWPORT),ae=new be().fromArray(Ct),ie=new be().fromArray(wt);function le(O,mt,K,gt){let Et=new Uint8Array(4),st=r.createTexture();r.bindTexture(O,st),r.texParameteri(O,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(O,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let kt=0;kt<K;kt++)O===r.TEXTURE_3D||O===r.TEXTURE_2D_ARRAY?r.texImage3D(mt,0,r.RGBA,1,1,gt,0,r.RGBA,r.UNSIGNED_BYTE,Et):r.texImage2D(mt+kt,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,Et);return st}let $={};$[r.TEXTURE_2D]=le(r.TEXTURE_2D,r.TEXTURE_2D,1),$[r.TEXTURE_CUBE_MAP]=le(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),$[r.TEXTURE_2D_ARRAY]=le(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),$[r.TEXTURE_3D]=le(r.TEXTURE_3D,r.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),it(r.DEPTH_TEST),o.setFunc(as),ct(!1),dt(fc),it(r.CULL_FACE),rt(zi);function it(O){h[O]!==!0&&(r.enable(O),h[O]=!0)}function bt(O){h[O]!==!1&&(r.disable(O),h[O]=!1)}function qt(O,mt){return d[O]!==mt?(r.bindFramebuffer(O,mt),d[O]=mt,O===r.DRAW_FRAMEBUFFER&&(d[r.FRAMEBUFFER]=mt),O===r.FRAMEBUFFER&&(d[r.DRAW_FRAMEBUFFER]=mt),!0):!1}function Tt(O,mt){let K=m,gt=!1;if(O){K=f.get(mt),K===void 0&&(K=[],f.set(mt,K));let Et=O.textures;if(K.length!==Et.length||K[0]!==r.COLOR_ATTACHMENT0){for(let st=0,kt=Et.length;st<kt;st++)K[st]=r.COLOR_ATTACHMENT0+st;K.length=Et.length,gt=!0}}else K[0]!==r.BACK&&(K[0]=r.BACK,gt=!0);gt&&r.drawBuffers(K)}function Zt(O){return y!==O?(r.useProgram(O),y=O,!0):!1}let ve={[Nn]:r.FUNC_ADD,[Eu]:r.FUNC_SUBTRACT,[Tu]:r.FUNC_REVERSE_SUBTRACT};ve[wu]=r.MIN,ve[Au]=r.MAX;let nt={[Ru]:r.ZERO,[Cu]:r.ONE,[Iu]:r.SRC_COLOR,[xc]:r.SRC_ALPHA,[Ou]:r.SRC_ALPHA_SATURATE,[Nu]:r.DST_COLOR,[Lu]:r.DST_ALPHA,[Pu]:r.ONE_MINUS_SRC_COLOR,[yc]:r.ONE_MINUS_SRC_ALPHA,[Fu]:r.ONE_MINUS_DST_COLOR,[Du]:r.ONE_MINUS_DST_ALPHA,[Uu]:r.CONSTANT_COLOR,[Bu]:r.ONE_MINUS_CONSTANT_COLOR,[ku]:r.CONSTANT_ALPHA,[Hu]:r.ONE_MINUS_CONSTANT_ALPHA};function rt(O,mt,K,gt,Et,st,kt,Lt,Ee,me){if(O===zi){g===!0&&(bt(r.BLEND),g=!1);return}if(g===!1&&(it(r.BLEND),g=!0),O!==Su){if(O!==p||me!==A){if((T!==Nn||S!==Nn)&&(r.blendEquation(r.FUNC_ADD),T=Nn,S=Nn),me)switch(O){case vs:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case pc:r.blendFunc(r.ONE,r.ONE);break;case mc:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case gc:r.blendFuncSeparate(r.DST_COLOR,r.ONE_MINUS_SRC_ALPHA,r.ZERO,r.ONE);break;default:Yt("WebGLState: Invalid blending: ",O);break}else switch(O){case vs:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case pc:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE,r.ONE,r.ONE);break;case mc:Yt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case gc:Yt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Yt("WebGLState: Invalid blending: ",O);break}b=null,x=null,E=null,C=null,v.set(0,0,0),w=0,p=O,A=me}return}Et=Et||mt,st=st||K,kt=kt||gt,(mt!==T||Et!==S)&&(r.blendEquationSeparate(ve[mt],ve[Et]),T=mt,S=Et),(K!==b||gt!==x||st!==E||kt!==C)&&(r.blendFuncSeparate(nt[K],nt[gt],nt[st],nt[kt]),b=K,x=gt,E=st,C=kt),(Lt.equals(v)===!1||Ee!==w)&&(r.blendColor(Lt.r,Lt.g,Lt.b,Ee),v.copy(Lt),w=Ee),p=O,A=!1}function lt(O,mt){O.side===Fe?bt(r.CULL_FACE):it(r.CULL_FACE);let K=O.side===ke;mt&&(K=!K),ct(K),O.blending===vs&&O.transparent===!1?rt(zi):rt(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),o.setFunc(O.depthFunc),o.setTest(O.depthTest),o.setMask(O.depthWrite),s.setMask(O.colorWrite);let gt=O.stencilWrite;a.setTest(gt),gt&&(a.setMask(O.stencilWriteMask),a.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),a.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),Ht(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?it(r.SAMPLE_ALPHA_TO_COVERAGE):bt(r.SAMPLE_ALPHA_TO_COVERAGE)}function ct(O){P!==O&&(O?r.frontFace(r.CW):r.frontFace(r.CCW),P=O)}function dt(O){O!==bu?(it(r.CULL_FACE),O!==N&&(O===fc?r.cullFace(r.BACK):O===Mu?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):bt(r.CULL_FACE),N=O}function zt(O){O!==k&&(V&&r.lineWidth(O),k=O)}function Ht(O,mt,K){O?(it(r.POLYGON_OFFSET_FILL),(L!==mt||U!==K)&&(L=mt,U=K,o.getReversed()&&(mt=-mt),r.polygonOffset(mt,K))):bt(r.POLYGON_OFFSET_FILL)}function $t(O){O?it(r.SCISSOR_TEST):bt(r.SCISSOR_TEST)}function Jt(O){O===void 0&&(O=r.TEXTURE0+H-1),J!==O&&(r.activeTexture(O),J=O)}function D(O,mt,K){K===void 0&&(J===null?K=r.TEXTURE0+H-1:K=J);let gt=j[K];gt===void 0&&(gt={type:void 0,texture:void 0},j[K]=gt),(gt.type!==O||gt.texture!==mt)&&(J!==K&&(r.activeTexture(K),J=K),r.bindTexture(O,mt||$[O]),gt.type=O,gt.texture=mt)}function pe(){let O=j[J];O!==void 0&&O.type!==void 0&&(r.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function ne(){try{r.compressedTexImage2D(...arguments)}catch(O){Yt("WebGLState:",O)}}function R(){try{r.compressedTexImage3D(...arguments)}catch(O){Yt("WebGLState:",O)}}function _(){try{r.texSubImage2D(...arguments)}catch(O){Yt("WebGLState:",O)}}function B(){try{r.texSubImage3D(...arguments)}catch(O){Yt("WebGLState:",O)}}function W(){try{r.compressedTexSubImage2D(...arguments)}catch(O){Yt("WebGLState:",O)}}function Y(){try{r.compressedTexSubImage3D(...arguments)}catch(O){Yt("WebGLState:",O)}}function ht(){try{r.texStorage2D(...arguments)}catch(O){Yt("WebGLState:",O)}}function ut(){try{r.texStorage3D(...arguments)}catch(O){Yt("WebGLState:",O)}}function Z(){try{r.texImage2D(...arguments)}catch(O){Yt("WebGLState:",O)}}function Q(){try{r.texImage3D(...arguments)}catch(O){Yt("WebGLState:",O)}}function ft(O){return u[O]!==void 0?u[O]:r.getParameter(O)}function Ut(O,mt){u[O]!==mt&&(r.pixelStorei(O,mt),u[O]=mt)}function yt(O){ae.equals(O)===!1&&(r.scissor(O.x,O.y,O.z,O.w),ae.copy(O))}function pt(O){ie.equals(O)===!1&&(r.viewport(O.x,O.y,O.z,O.w),ie.copy(O))}function Bt(O,mt){let K=c.get(mt);K===void 0&&(K=new WeakMap,c.set(mt,K));let gt=K.get(O);gt===void 0&&(gt=r.getUniformBlockIndex(mt,O.name),K.set(O,gt))}function Vt(O,mt){let gt=c.get(mt).get(O);l.get(mt)!==gt&&(r.uniformBlockBinding(mt,gt,O.__bindingPointIndex),l.set(mt,gt))}function Kt(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),o.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),r.pixelStorei(r.PACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!1),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,r.BROWSER_DEFAULT_WEBGL),r.pixelStorei(r.PACK_ROW_LENGTH,0),r.pixelStorei(r.PACK_SKIP_PIXELS,0),r.pixelStorei(r.PACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_ROW_LENGTH,0),r.pixelStorei(r.UNPACK_IMAGE_HEIGHT,0),r.pixelStorei(r.UNPACK_SKIP_PIXELS,0),r.pixelStorei(r.UNPACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_SKIP_IMAGES,0),h={},u={},J=null,j={},d={},f=new WeakMap,m=[],y=null,g=!1,p=null,T=null,b=null,x=null,S=null,E=null,C=null,v=new Ot(0,0,0),w=0,A=!1,P=null,N=null,k=null,L=null,U=null,ae.set(0,0,r.canvas.width,r.canvas.height),ie.set(0,0,r.canvas.width,r.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:it,disable:bt,bindFramebuffer:qt,drawBuffers:Tt,useProgram:Zt,setBlending:rt,setMaterial:lt,setFlipSided:ct,setCullFace:dt,setLineWidth:zt,setPolygonOffset:Ht,setScissorTest:$t,activeTexture:Jt,bindTexture:D,unbindTexture:pe,compressedTexImage2D:ne,compressedTexImage3D:R,texImage2D:Z,texImage3D:Q,pixelStorei:Ut,getParameter:ft,updateUBOMapping:Bt,uniformBlockBinding:Vt,texStorage2D:ht,texStorage3D:ut,texSubImage2D:_,texSubImage3D:B,compressedTexSubImage2D:W,compressedTexSubImage3D:Y,scissor:yt,viewport:pt,reset:Kt}}function Gy(r,t,e,i,n,s,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new at,h=new WeakMap,u=new Set,d,f=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(R,_){return m?new OffscreenCanvas(R,_):Zs("canvas")}function g(R,_,B){let W=1,Y=ne(R);if((Y.width>B||Y.height>B)&&(W=B/Math.max(Y.width,Y.height)),W<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let ht=Math.floor(W*Y.width),ut=Math.floor(W*Y.height);d===void 0&&(d=y(ht,ut));let Z=_?y(ht,ut):d;return Z.width=ht,Z.height=ut,Z.getContext("2d").drawImage(R,0,0,ht,ut),Gt("WebGLRenderer: Texture has been resized from ("+Y.width+"x"+Y.height+") to ("+ht+"x"+ut+")."),Z}else return"data"in R&&Gt("WebGLRenderer: Image in DataTexture is too big ("+Y.width+"x"+Y.height+")."),R;return R}function p(R){return R.generateMipmaps}function T(R){r.generateMipmap(R)}function b(R){return R.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?r.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function x(R,_,B,W,Y,ht=!1){if(R!==null){if(r[R]!==void 0)return r[R];Gt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let ut;W&&(ut=t.get("EXT_texture_norm16"),ut||Gt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Z=_;if(_===r.RED&&(B===r.FLOAT&&(Z=r.R32F),B===r.HALF_FLOAT&&(Z=r.R16F),B===r.UNSIGNED_BYTE&&(Z=r.R8),B===r.UNSIGNED_SHORT&&ut&&(Z=ut.R16_EXT),B===r.SHORT&&ut&&(Z=ut.R16_SNORM_EXT)),_===r.RED_INTEGER&&(B===r.UNSIGNED_BYTE&&(Z=r.R8UI),B===r.UNSIGNED_SHORT&&(Z=r.R16UI),B===r.UNSIGNED_INT&&(Z=r.R32UI),B===r.BYTE&&(Z=r.R8I),B===r.SHORT&&(Z=r.R16I),B===r.INT&&(Z=r.R32I)),_===r.RG&&(B===r.FLOAT&&(Z=r.RG32F),B===r.HALF_FLOAT&&(Z=r.RG16F),B===r.UNSIGNED_BYTE&&(Z=r.RG8),B===r.UNSIGNED_SHORT&&ut&&(Z=ut.RG16_EXT),B===r.SHORT&&ut&&(Z=ut.RG16_SNORM_EXT)),_===r.RG_INTEGER&&(B===r.UNSIGNED_BYTE&&(Z=r.RG8UI),B===r.UNSIGNED_SHORT&&(Z=r.RG16UI),B===r.UNSIGNED_INT&&(Z=r.RG32UI),B===r.BYTE&&(Z=r.RG8I),B===r.SHORT&&(Z=r.RG16I),B===r.INT&&(Z=r.RG32I)),_===r.RGB_INTEGER&&(B===r.UNSIGNED_BYTE&&(Z=r.RGB8UI),B===r.UNSIGNED_SHORT&&(Z=r.RGB16UI),B===r.UNSIGNED_INT&&(Z=r.RGB32UI),B===r.BYTE&&(Z=r.RGB8I),B===r.SHORT&&(Z=r.RGB16I),B===r.INT&&(Z=r.RGB32I)),_===r.RGBA_INTEGER&&(B===r.UNSIGNED_BYTE&&(Z=r.RGBA8UI),B===r.UNSIGNED_SHORT&&(Z=r.RGBA16UI),B===r.UNSIGNED_INT&&(Z=r.RGBA32UI),B===r.BYTE&&(Z=r.RGBA8I),B===r.SHORT&&(Z=r.RGBA16I),B===r.INT&&(Z=r.RGBA32I)),_===r.RGB&&(B===r.UNSIGNED_SHORT&&ut&&(Z=ut.RGB16_EXT),B===r.SHORT&&ut&&(Z=ut.RGB16_SNORM_EXT),B===r.UNSIGNED_INT_5_9_9_9_REV&&(Z=r.RGB9_E5),B===r.UNSIGNED_INT_10F_11F_11F_REV&&(Z=r.R11F_G11F_B10F)),_===r.RGBA){let Q=ht?Ys:re.getTransfer(Y);B===r.FLOAT&&(Z=r.RGBA32F),B===r.HALF_FLOAT&&(Z=r.RGBA16F),B===r.UNSIGNED_BYTE&&(Z=Q===xe?r.SRGB8_ALPHA8:r.RGBA8),B===r.UNSIGNED_SHORT&&ut&&(Z=ut.RGBA16_EXT),B===r.SHORT&&ut&&(Z=ut.RGBA16_SNORM_EXT),B===r.UNSIGNED_SHORT_4_4_4_4&&(Z=r.RGBA4),B===r.UNSIGNED_SHORT_5_5_5_1&&(Z=r.RGB5_A1)}return(Z===r.R16F||Z===r.R32F||Z===r.RG16F||Z===r.RG32F||Z===r.RGBA16F||Z===r.RGBA32F)&&t.get("EXT_color_buffer_float"),Z}function S(R,_){let B;return R?_===null||_===Li||_===Ms?B=r.DEPTH24_STENCIL8:_===gi?B=r.DEPTH32F_STENCIL8:_===bs&&(B=r.DEPTH24_STENCIL8,Gt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Li||_===Ms?B=r.DEPTH_COMPONENT24:_===gi?B=r.DEPTH_COMPONENT32F:_===bs&&(B=r.DEPTH_COMPONENT16),B}function E(R,_){return p(R)===!0||R.isFramebufferTexture&&R.minFilter!==We&&R.minFilter!==Ze?Math.log2(Math.max(_.width,_.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?_.mipmaps.length:1}function C(R){let _=R.target;_.removeEventListener("dispose",C),w(_),_.isVideoTexture&&h.delete(_),_.isHTMLTexture&&u.delete(_)}function v(R){let _=R.target;_.removeEventListener("dispose",v),P(_)}function w(R){let _=i.get(R);if(_.__webglInit===void 0)return;let B=R.source,W=f.get(B);if(W){let Y=W[_.__cacheKey];Y.usedTimes--,Y.usedTimes===0&&A(R),Object.keys(W).length===0&&f.delete(B)}i.remove(R)}function A(R){let _=i.get(R);r.deleteTexture(_.__webglTexture);let B=R.source,W=f.get(B);delete W[_.__cacheKey],o.memory.textures--}function P(R){let _=i.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),i.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(_.__webglFramebuffer[W]))for(let Y=0;Y<_.__webglFramebuffer[W].length;Y++)r.deleteFramebuffer(_.__webglFramebuffer[W][Y]);else r.deleteFramebuffer(_.__webglFramebuffer[W]);_.__webglDepthbuffer&&r.deleteRenderbuffer(_.__webglDepthbuffer[W])}else{if(Array.isArray(_.__webglFramebuffer))for(let W=0;W<_.__webglFramebuffer.length;W++)r.deleteFramebuffer(_.__webglFramebuffer[W]);else r.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&r.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&r.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let W=0;W<_.__webglColorRenderbuffer.length;W++)_.__webglColorRenderbuffer[W]&&r.deleteRenderbuffer(_.__webglColorRenderbuffer[W]);_.__webglDepthRenderbuffer&&r.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let B=R.textures;for(let W=0,Y=B.length;W<Y;W++){let ht=i.get(B[W]);ht.__webglTexture&&(r.deleteTexture(ht.__webglTexture),o.memory.textures--),i.remove(B[W])}i.remove(R)}let N=0;function k(){N=0}function L(){return N}function U(R){N=R}function H(){let R=N;return R>=n.maxTextures&&Gt("WebGLTextures: Trying to use "+(R+1)+" texture units while this GPU supports only "+n.maxTextures),N+=1,R}function V(R){let _=[];return _.push(R.wrapS),_.push(R.wrapT),_.push(R.wrapR||0),_.push(R.magFilter),_.push(R.minFilter),_.push(R.anisotropy),_.push(R.internalFormat),_.push(R.format),_.push(R.type),_.push(R.generateMipmaps),_.push(R.premultiplyAlpha),_.push(R.flipY),_.push(R.unpackAlignment),_.push(R.colorSpace),_.join()}function et(R,_){let B=i.get(R);if(R.isVideoTexture&&D(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&B.__version!==R.version){let W=R.image;if(W===null)Gt("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Gt("WebGLRenderer: Texture marked for update but image is incomplete");else{bt(B,R,_);return}}else R.isExternalTexture&&(B.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(r.TEXTURE_2D,B.__webglTexture,r.TEXTURE0+_)}function X(R,_){let B=i.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&B.__version!==R.version){bt(B,R,_);return}else R.isExternalTexture&&(B.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(r.TEXTURE_2D_ARRAY,B.__webglTexture,r.TEXTURE0+_)}function J(R,_){let B=i.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&B.__version!==R.version){bt(B,R,_);return}e.bindTexture(r.TEXTURE_3D,B.__webglTexture,r.TEXTURE0+_)}function j(R,_){let B=i.get(R);if(R.isCubeDepthTexture!==!0&&R.version>0&&B.__version!==R.version){qt(B,R,_);return}e.bindTexture(r.TEXTURE_CUBE_MAP,B.__webglTexture,r.TEXTURE0+_)}let Ct={[In]:r.REPEAT,[Ui]:r.CLAMP_TO_EDGE,[yo]:r.MIRRORED_REPEAT},wt={[We]:r.NEAREST,[Wu]:r.NEAREST_MIPMAP_NEAREST,[Mr]:r.NEAREST_MIPMAP_LINEAR,[Ze]:r.LINEAR,[$o]:r.LINEAR_MIPMAP_NEAREST,[yn]:r.LINEAR_MIPMAP_LINEAR},ae={[Zu]:r.NEVER,[Qu]:r.ALWAYS,[$u]:r.LESS,[Na]:r.LEQUAL,[Ju]:r.EQUAL,[Fa]:r.GEQUAL,[Ku]:r.GREATER,[ju]:r.NOTEQUAL};function ie(R,_){if(_.type===gi&&t.has("OES_texture_float_linear")===!1&&(_.magFilter===Ze||_.magFilter===$o||_.magFilter===Mr||_.magFilter===yn||_.minFilter===Ze||_.minFilter===$o||_.minFilter===Mr||_.minFilter===yn)&&Gt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(R,r.TEXTURE_WRAP_S,Ct[_.wrapS]),r.texParameteri(R,r.TEXTURE_WRAP_T,Ct[_.wrapT]),(R===r.TEXTURE_3D||R===r.TEXTURE_2D_ARRAY)&&r.texParameteri(R,r.TEXTURE_WRAP_R,Ct[_.wrapR]),r.texParameteri(R,r.TEXTURE_MAG_FILTER,wt[_.magFilter]),r.texParameteri(R,r.TEXTURE_MIN_FILTER,wt[_.minFilter]),_.compareFunction&&(r.texParameteri(R,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(R,r.TEXTURE_COMPARE_FUNC,ae[_.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===We||_.minFilter!==Mr&&_.minFilter!==yn||_.type===gi&&t.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){let B=t.get("EXT_texture_filter_anisotropic");r.texParameterf(R,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,n.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function le(R,_){let B=!1;R.__webglInit===void 0&&(R.__webglInit=!0,_.addEventListener("dispose",C));let W=_.source,Y=f.get(W);Y===void 0&&(Y={},f.set(W,Y));let ht=V(_);if(ht!==R.__cacheKey){Y[ht]===void 0&&(Y[ht]={texture:r.createTexture(),usedTimes:0},o.memory.textures++,B=!0),Y[ht].usedTimes++;let ut=Y[R.__cacheKey];ut!==void 0&&(Y[R.__cacheKey].usedTimes--,ut.usedTimes===0&&A(_)),R.__cacheKey=ht,R.__webglTexture=Y[ht].texture}return B}function $(R,_,B){return Math.floor(Math.floor(R/B)/_)}function it(R,_,B,W){let ht=R.updateRanges;if(ht.length===0)e.texSubImage2D(r.TEXTURE_2D,0,0,0,_.width,_.height,B,W,_.data);else{ht.sort((Ut,yt)=>Ut.start-yt.start);let ut=0;for(let Ut=1;Ut<ht.length;Ut++){let yt=ht[ut],pt=ht[Ut],Bt=yt.start+yt.count,Vt=$(pt.start,_.width,4),Kt=$(yt.start,_.width,4);pt.start<=Bt+1&&Vt===Kt&&$(pt.start+pt.count-1,_.width,4)===Vt?yt.count=Math.max(yt.count,pt.start+pt.count-yt.start):(++ut,ht[ut]=pt)}ht.length=ut+1;let Z=e.getParameter(r.UNPACK_ROW_LENGTH),Q=e.getParameter(r.UNPACK_SKIP_PIXELS),ft=e.getParameter(r.UNPACK_SKIP_ROWS);e.pixelStorei(r.UNPACK_ROW_LENGTH,_.width);for(let Ut=0,yt=ht.length;Ut<yt;Ut++){let pt=ht[Ut],Bt=Math.floor(pt.start/4),Vt=Math.ceil(pt.count/4),Kt=Bt%_.width,O=Math.floor(Bt/_.width),mt=Vt,K=1;e.pixelStorei(r.UNPACK_SKIP_PIXELS,Kt),e.pixelStorei(r.UNPACK_SKIP_ROWS,O),e.texSubImage2D(r.TEXTURE_2D,0,Kt,O,mt,K,B,W,_.data)}R.clearUpdateRanges(),e.pixelStorei(r.UNPACK_ROW_LENGTH,Z),e.pixelStorei(r.UNPACK_SKIP_PIXELS,Q),e.pixelStorei(r.UNPACK_SKIP_ROWS,ft)}}function bt(R,_,B){let W=r.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(W=r.TEXTURE_2D_ARRAY),_.isData3DTexture&&(W=r.TEXTURE_3D);let Y=le(R,_),ht=_.source;e.bindTexture(W,R.__webglTexture,r.TEXTURE0+B);let ut=i.get(ht);if(ht.version!==ut.__version||Y===!0){if(e.activeTexture(r.TEXTURE0+B),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){let K=re.getPrimaries(re.workingColorSpace),gt=_.colorSpace===ji?null:re.getPrimaries(_.colorSpace),Et=_.colorSpace===ji||K===gt?r.NONE:r.BROWSER_DEFAULT_WEBGL;e.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,_.flipY),e.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),e.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Et)}e.pixelStorei(r.UNPACK_ALIGNMENT,_.unpackAlignment);let Q=g(_.image,!1,n.maxTextureSize);Q=pe(_,Q);let ft=s.convert(_.format,_.colorSpace),Ut=s.convert(_.type),yt=x(_.internalFormat,ft,Ut,_.normalized,_.colorSpace,_.isVideoTexture);ie(W,_);let pt,Bt=_.mipmaps,Vt=_.isVideoTexture!==!0,Kt=ut.__version===void 0||Y===!0,O=ht.dataReady,mt=E(_,Q);if(_.isDepthTexture)yt=S(_.format===_n,_.type),Kt&&(Vt?e.texStorage2D(r.TEXTURE_2D,1,yt,Q.width,Q.height):e.texImage2D(r.TEXTURE_2D,0,yt,Q.width,Q.height,0,ft,Ut,null));else if(_.isDataTexture)if(Bt.length>0){Vt&&Kt&&e.texStorage2D(r.TEXTURE_2D,mt,yt,Bt[0].width,Bt[0].height);for(let K=0,gt=Bt.length;K<gt;K++)pt=Bt[K],Vt?O&&e.texSubImage2D(r.TEXTURE_2D,K,0,0,pt.width,pt.height,ft,Ut,pt.data):e.texImage2D(r.TEXTURE_2D,K,yt,pt.width,pt.height,0,ft,Ut,pt.data);_.generateMipmaps=!1}else Vt?(Kt&&e.texStorage2D(r.TEXTURE_2D,mt,yt,Q.width,Q.height),O&&it(_,Q,ft,Ut)):e.texImage2D(r.TEXTURE_2D,0,yt,Q.width,Q.height,0,ft,Ut,Q.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Vt&&Kt&&e.texStorage3D(r.TEXTURE_2D_ARRAY,mt,yt,Bt[0].width,Bt[0].height,Q.depth);for(let K=0,gt=Bt.length;K<gt;K++)if(pt=Bt[K],_.format!==xi)if(ft!==null)if(Vt){if(O)if(_.layerUpdates.size>0){let Et=Gc(pt.width,pt.height,_.format,_.type);for(let st of _.layerUpdates){let kt=pt.data.subarray(st*Et/pt.data.BYTES_PER_ELEMENT,(st+1)*Et/pt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,K,0,0,st,pt.width,pt.height,1,ft,kt)}}else e.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,K,0,0,0,pt.width,pt.height,Q.depth,ft,pt.data)}else e.compressedTexImage3D(r.TEXTURE_2D_ARRAY,K,yt,pt.width,pt.height,Q.depth,0,pt.data,0,0);else Gt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Vt?O&&e.texSubImage3D(r.TEXTURE_2D_ARRAY,K,0,0,0,pt.width,pt.height,Q.depth,ft,Ut,pt.data):e.texImage3D(r.TEXTURE_2D_ARRAY,K,yt,pt.width,pt.height,Q.depth,0,ft,Ut,pt.data);_.layerUpdates.size>0&&_.clearLayerUpdates()}else{Vt&&Kt&&e.texStorage2D(r.TEXTURE_2D,mt,yt,Bt[0].width,Bt[0].height);for(let K=0,gt=Bt.length;K<gt;K++)pt=Bt[K],_.format!==xi?ft!==null?Vt?O&&e.compressedTexSubImage2D(r.TEXTURE_2D,K,0,0,pt.width,pt.height,ft,pt.data):e.compressedTexImage2D(r.TEXTURE_2D,K,yt,pt.width,pt.height,0,pt.data):Gt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Vt?O&&e.texSubImage2D(r.TEXTURE_2D,K,0,0,pt.width,pt.height,ft,Ut,pt.data):e.texImage2D(r.TEXTURE_2D,K,yt,pt.width,pt.height,0,ft,Ut,pt.data)}else if(_.isDataArrayTexture)if(Vt){if(Kt&&e.texStorage3D(r.TEXTURE_2D_ARRAY,mt,yt,Q.width,Q.height,Q.depth),O)if(_.layerUpdates.size>0){let K=Gc(Q.width,Q.height,_.format,_.type);for(let gt of _.layerUpdates){let Et=Q.data.subarray(gt*K/Q.data.BYTES_PER_ELEMENT,(gt+1)*K/Q.data.BYTES_PER_ELEMENT);e.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,gt,Q.width,Q.height,1,ft,Ut,Et)}_.clearLayerUpdates()}else e.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,ft,Ut,Q.data)}else e.texImage3D(r.TEXTURE_2D_ARRAY,0,yt,Q.width,Q.height,Q.depth,0,ft,Ut,Q.data);else if(_.isData3DTexture)Vt?(Kt&&e.texStorage3D(r.TEXTURE_3D,mt,yt,Q.width,Q.height,Q.depth),O&&e.texSubImage3D(r.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,ft,Ut,Q.data)):e.texImage3D(r.TEXTURE_3D,0,yt,Q.width,Q.height,Q.depth,0,ft,Ut,Q.data);else if(_.isFramebufferTexture){if(Kt)if(Vt)e.texStorage2D(r.TEXTURE_2D,mt,yt,Q.width,Q.height);else{let K=Q.width,gt=Q.height;for(let Et=0;Et<mt;Et++)e.texImage2D(r.TEXTURE_2D,Et,yt,K,gt,0,ft,Ut,null),K>>=1,gt>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in r){let K=r.canvas;if(K.hasAttribute("layoutsubtree")||K.setAttribute("layoutsubtree","true"),Q.parentNode!==K){K.appendChild(Q),u.add(_),K.onpaint=gt=>{let Et=gt.changedElements;for(let st of u)Et.includes(st.image)&&(st.needsUpdate=!0)},K.requestPaint();return}if(r.texElementImage2D.length===3)r.texElementImage2D(r.TEXTURE_2D,r.RGBA8,Q);else{let Et=r.RGBA,st=r.RGBA,kt=r.UNSIGNED_BYTE;r.texElementImage2D(r.TEXTURE_2D,0,Et,st,kt,Q)}r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE)}}else if(Bt.length>0){if(Vt&&Kt){let K=ne(Bt[0]);e.texStorage2D(r.TEXTURE_2D,mt,yt,K.width,K.height)}for(let K=0,gt=Bt.length;K<gt;K++)pt=Bt[K],Vt?O&&e.texSubImage2D(r.TEXTURE_2D,K,0,0,ft,Ut,pt):e.texImage2D(r.TEXTURE_2D,K,yt,ft,Ut,pt);_.generateMipmaps=!1}else if(Vt){if(Kt){let K=ne(Q);e.texStorage2D(r.TEXTURE_2D,mt,yt,K.width,K.height)}O&&e.texSubImage2D(r.TEXTURE_2D,0,0,0,ft,Ut,Q)}else e.texImage2D(r.TEXTURE_2D,0,yt,ft,Ut,Q);p(_)&&T(W),ut.__version=ht.version,_.onUpdate&&_.onUpdate(_)}R.__version=_.version}function qt(R,_,B){if(_.image.length!==6)return;let W=le(R,_),Y=_.source;e.bindTexture(r.TEXTURE_CUBE_MAP,R.__webglTexture,r.TEXTURE0+B);let ht=i.get(Y);if(Y.version!==ht.__version||W===!0){e.activeTexture(r.TEXTURE0+B);let ut=re.getPrimaries(re.workingColorSpace),Z=_.colorSpace===ji?null:re.getPrimaries(_.colorSpace),Q=_.colorSpace===ji||ut===Z?r.NONE:r.BROWSER_DEFAULT_WEBGL;e.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,_.flipY),e.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),e.pixelStorei(r.UNPACK_ALIGNMENT,_.unpackAlignment),e.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Q);let ft=_.isCompressedTexture||_.image[0].isCompressedTexture,Ut=_.image[0]&&_.image[0].isDataTexture,yt=[];for(let st=0;st<6;st++)!ft&&!Ut?yt[st]=g(_.image[st],!0,n.maxCubemapSize):yt[st]=Ut?_.image[st].image:_.image[st],yt[st]=pe(_,yt[st]);let pt=yt[0],Bt=s.convert(_.format,_.colorSpace),Vt=s.convert(_.type),Kt=x(_.internalFormat,Bt,Vt,_.normalized,_.colorSpace),O=_.isVideoTexture!==!0,mt=ht.__version===void 0||W===!0,K=Y.dataReady,gt=E(_,pt);ie(r.TEXTURE_CUBE_MAP,_);let Et;if(ft){O&&mt&&e.texStorage2D(r.TEXTURE_CUBE_MAP,gt,Kt,pt.width,pt.height);for(let st=0;st<6;st++){Et=yt[st].mipmaps;for(let kt=0;kt<Et.length;kt++){let Lt=Et[kt];_.format!==xi?Bt!==null?O?K&&e.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+st,kt,0,0,Lt.width,Lt.height,Bt,Lt.data):e.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+st,kt,Kt,Lt.width,Lt.height,0,Lt.data):Gt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):O?K&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+st,kt,0,0,Lt.width,Lt.height,Bt,Vt,Lt.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+st,kt,Kt,Lt.width,Lt.height,0,Bt,Vt,Lt.data)}}}else{if(Et=_.mipmaps,O&&mt){Et.length>0&&gt++;let st=ne(yt[0]);e.texStorage2D(r.TEXTURE_CUBE_MAP,gt,Kt,st.width,st.height)}for(let st=0;st<6;st++)if(Ut){O?K&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,0,0,yt[st].width,yt[st].height,Bt,Vt,yt[st].data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,Kt,yt[st].width,yt[st].height,0,Bt,Vt,yt[st].data);for(let kt=0;kt<Et.length;kt++){let Ee=Et[kt].image[st].image;O?K&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+st,kt+1,0,0,Ee.width,Ee.height,Bt,Vt,Ee.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+st,kt+1,Kt,Ee.width,Ee.height,0,Bt,Vt,Ee.data)}}else{O?K&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,0,0,Bt,Vt,yt[st]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,Kt,Bt,Vt,yt[st]);for(let kt=0;kt<Et.length;kt++){let Lt=Et[kt];O?K&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+st,kt+1,0,0,Bt,Vt,Lt.image[st]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+st,kt+1,Kt,Bt,Vt,Lt.image[st])}}}p(_)&&T(r.TEXTURE_CUBE_MAP),ht.__version=Y.version,_.onUpdate&&_.onUpdate(_)}R.__version=_.version}function Tt(R,_,B,W,Y,ht){let ut=s.convert(B.format,B.colorSpace),Z=s.convert(B.type),Q=x(B.internalFormat,ut,Z,B.normalized,B.colorSpace),ft=i.get(_),Ut=i.get(B);if(Ut.__renderTarget=_,!ft.__hasExternalTextures){let yt=Math.max(1,_.width>>ht),pt=Math.max(1,_.height>>ht);Y===r.TEXTURE_3D||Y===r.TEXTURE_2D_ARRAY?e.texImage3D(Y,ht,Q,yt,pt,_.depth,0,ut,Z,null):e.texImage2D(Y,ht,Q,yt,pt,0,ut,Z,null)}e.bindFramebuffer(r.FRAMEBUFFER,R),Jt(_)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,W,Y,Ut.__webglTexture,0,$t(_)):(Y===r.TEXTURE_2D||Y>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&Y<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,W,Y,Ut.__webglTexture,ht),e.bindFramebuffer(r.FRAMEBUFFER,null)}function Zt(R,_,B){if(r.bindRenderbuffer(r.RENDERBUFFER,R),_.depthBuffer){let W=_.depthTexture,Y=W&&W.isDepthTexture?W.type:null,ht=S(_.stencilBuffer,Y),ut=_.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;Jt(_)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,$t(_),ht,_.width,_.height):B?r.renderbufferStorageMultisample(r.RENDERBUFFER,$t(_),ht,_.width,_.height):r.renderbufferStorage(r.RENDERBUFFER,ht,_.width,_.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,ut,r.RENDERBUFFER,R)}else{let W=_.textures;for(let Y=0;Y<W.length;Y++){let ht=W[Y],ut=s.convert(ht.format,ht.colorSpace),Z=s.convert(ht.type),Q=x(ht.internalFormat,ut,Z,ht.normalized,ht.colorSpace);Jt(_)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,$t(_),Q,_.width,_.height):B?r.renderbufferStorageMultisample(r.RENDERBUFFER,$t(_),Q,_.width,_.height):r.renderbufferStorage(r.RENDERBUFFER,Q,_.width,_.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function ve(R,_,B){let W=_.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(r.FRAMEBUFFER,R),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Y=i.get(_.depthTexture);if(Y.__renderTarget=_,(!Y.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),W){if(Y.__webglInit===void 0&&(Y.__webglInit=!0,_.depthTexture.addEventListener("dispose",C)),Y.__webglTexture===void 0){Y.__webglTexture=r.createTexture(),e.bindTexture(r.TEXTURE_CUBE_MAP,Y.__webglTexture),ie(r.TEXTURE_CUBE_MAP,_.depthTexture);let ft=s.convert(_.depthTexture.format),Ut=s.convert(_.depthTexture.type),yt;_.depthTexture.format===ki?yt=r.DEPTH_COMPONENT24:_.depthTexture.format===_n&&(yt=r.DEPTH24_STENCIL8);for(let pt=0;pt<6;pt++)r.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+pt,0,yt,_.width,_.height,0,ft,Ut,null)}}else et(_.depthTexture,0);let ht=Y.__webglTexture,ut=$t(_),Z=W?r.TEXTURE_CUBE_MAP_POSITIVE_X+B:r.TEXTURE_2D,Q=_.depthTexture.format===_n?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;if(_.depthTexture.format===ki)Jt(_)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,Q,Z,ht,0,ut):r.framebufferTexture2D(r.FRAMEBUFFER,Q,Z,ht,0);else if(_.depthTexture.format===_n)Jt(_)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,Q,Z,ht,0,ut):r.framebufferTexture2D(r.FRAMEBUFFER,Q,Z,ht,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function nt(R){let _=i.get(R),B=R.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==R.depthTexture){let W=R.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),W){let Y=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,W.removeEventListener("dispose",Y)};W.addEventListener("dispose",Y),_.__depthDisposeCallback=Y}_.__boundDepthTexture=W}if(R.depthTexture&&!_.__autoAllocateDepthBuffer)if(B)for(let W=0;W<6;W++)ve(_.__webglFramebuffer[W],R,W);else{let W=R.texture.mipmaps;W&&W.length>0?ve(_.__webglFramebuffer[0],R,0):ve(_.__webglFramebuffer,R,0)}else if(B){_.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(e.bindFramebuffer(r.FRAMEBUFFER,_.__webglFramebuffer[W]),_.__webglDepthbuffer[W]===void 0)_.__webglDepthbuffer[W]=r.createRenderbuffer(),Zt(_.__webglDepthbuffer[W],R,!1);else{let Y=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ht=_.__webglDepthbuffer[W];r.bindRenderbuffer(r.RENDERBUFFER,ht),r.framebufferRenderbuffer(r.FRAMEBUFFER,Y,r.RENDERBUFFER,ht)}}else{let W=R.texture.mipmaps;if(W&&W.length>0?e.bindFramebuffer(r.FRAMEBUFFER,_.__webglFramebuffer[0]):e.bindFramebuffer(r.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=r.createRenderbuffer(),Zt(_.__webglDepthbuffer,R,!1);else{let Y=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ht=_.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,ht),r.framebufferRenderbuffer(r.FRAMEBUFFER,Y,r.RENDERBUFFER,ht)}}e.bindFramebuffer(r.FRAMEBUFFER,null)}function rt(R,_,B){let W=i.get(R);_!==void 0&&Tt(W.__webglFramebuffer,R,R.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),B!==void 0&&nt(R)}function lt(R){let _=R.texture,B=i.get(R),W=i.get(_);R.addEventListener("dispose",v);let Y=R.textures,ht=R.isWebGLCubeRenderTarget===!0,ut=Y.length>1;if(ut||(W.__webglTexture===void 0&&(W.__webglTexture=r.createTexture()),W.__version=_.version,o.memory.textures++),ht){B.__webglFramebuffer=[];for(let Z=0;Z<6;Z++)if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer[Z]=[];for(let Q=0;Q<_.mipmaps.length;Q++)B.__webglFramebuffer[Z][Q]=r.createFramebuffer()}else B.__webglFramebuffer[Z]=r.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer=[];for(let Z=0;Z<_.mipmaps.length;Z++)B.__webglFramebuffer[Z]=r.createFramebuffer()}else B.__webglFramebuffer=r.createFramebuffer();if(ut)for(let Z=0,Q=Y.length;Z<Q;Z++){let ft=i.get(Y[Z]);ft.__webglTexture===void 0&&(ft.__webglTexture=r.createTexture(),o.memory.textures++)}if(R.samples>0&&Jt(R)===!1){B.__webglMultisampledFramebuffer=r.createFramebuffer(),B.__webglColorRenderbuffer=[],e.bindFramebuffer(r.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let Z=0;Z<Y.length;Z++){let Q=Y[Z];B.__webglColorRenderbuffer[Z]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,B.__webglColorRenderbuffer[Z]);let ft=s.convert(Q.format,Q.colorSpace),Ut=s.convert(Q.type),yt=x(Q.internalFormat,ft,Ut,Q.normalized,Q.colorSpace,R.isXRRenderTarget===!0),pt=$t(R);r.renderbufferStorageMultisample(r.RENDERBUFFER,pt,yt,R.width,R.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Z,r.RENDERBUFFER,B.__webglColorRenderbuffer[Z])}r.bindRenderbuffer(r.RENDERBUFFER,null),R.depthBuffer&&(B.__webglDepthRenderbuffer=r.createRenderbuffer(),Zt(B.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(r.FRAMEBUFFER,null)}}if(ht){e.bindTexture(r.TEXTURE_CUBE_MAP,W.__webglTexture),ie(r.TEXTURE_CUBE_MAP,_);for(let Z=0;Z<6;Z++)if(_.mipmaps&&_.mipmaps.length>0)for(let Q=0;Q<_.mipmaps.length;Q++)Tt(B.__webglFramebuffer[Z][Q],R,_,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+Z,Q);else Tt(B.__webglFramebuffer[Z],R,_,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0);p(_)&&T(r.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(ut){for(let Z=0,Q=Y.length;Z<Q;Z++){let ft=Y[Z],Ut=i.get(ft),yt=r.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(yt=R.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),e.bindTexture(yt,Ut.__webglTexture),ie(yt,ft),Tt(B.__webglFramebuffer,R,ft,r.COLOR_ATTACHMENT0+Z,yt,0),p(ft)&&T(yt)}e.unbindTexture()}else{let Z=r.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(Z=R.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),e.bindTexture(Z,W.__webglTexture),ie(Z,_),_.mipmaps&&_.mipmaps.length>0)for(let Q=0;Q<_.mipmaps.length;Q++)Tt(B.__webglFramebuffer[Q],R,_,r.COLOR_ATTACHMENT0,Z,Q);else Tt(B.__webglFramebuffer,R,_,r.COLOR_ATTACHMENT0,Z,0);p(_)&&T(Z),e.unbindTexture()}R.depthBuffer&&nt(R)}function ct(R){let _=R.textures;for(let B=0,W=_.length;B<W;B++){let Y=_[B];if(p(Y)){let ht=b(R),ut=i.get(Y).__webglTexture;e.bindTexture(ht,ut),T(ht),e.unbindTexture()}}}let dt=[],zt=[];function Ht(R){if(R.samples>0){if(Jt(R)===!1){let _=R.textures,B=R.width,W=R.height,Y=r.COLOR_BUFFER_BIT,ht=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ut=i.get(R),Z=_.length>1;if(Z)for(let ft=0;ft<_.length;ft++)e.bindFramebuffer(r.FRAMEBUFFER,ut.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+ft,r.RENDERBUFFER,null),e.bindFramebuffer(r.FRAMEBUFFER,ut.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+ft,r.TEXTURE_2D,null,0);e.bindFramebuffer(r.READ_FRAMEBUFFER,ut.__webglMultisampledFramebuffer);let Q=R.texture.mipmaps;Q&&Q.length>0?e.bindFramebuffer(r.DRAW_FRAMEBUFFER,ut.__webglFramebuffer[0]):e.bindFramebuffer(r.DRAW_FRAMEBUFFER,ut.__webglFramebuffer);for(let ft=0;ft<_.length;ft++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(Y|=r.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(Y|=r.STENCIL_BUFFER_BIT)),Z){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,ut.__webglColorRenderbuffer[ft]);let Ut=i.get(_[ft]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,Ut,0)}r.blitFramebuffer(0,0,B,W,0,0,B,W,Y,r.NEAREST),l===!0&&(dt.length=0,zt.length=0,dt.push(r.COLOR_ATTACHMENT0+ft),R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&(dt.push(ht),zt.push(ht),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,zt)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,dt))}if(e.bindFramebuffer(r.READ_FRAMEBUFFER,null),e.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),Z)for(let ft=0;ft<_.length;ft++){e.bindFramebuffer(r.FRAMEBUFFER,ut.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+ft,r.RENDERBUFFER,ut.__webglColorRenderbuffer[ft]);let Ut=i.get(_[ft]).__webglTexture;e.bindFramebuffer(r.FRAMEBUFFER,ut.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+ft,r.TEXTURE_2D,Ut,0)}e.bindFramebuffer(r.DRAW_FRAMEBUFFER,ut.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&l){let _=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[_])}}}function $t(R){return Math.min(n.maxSamples,R.samples)}function Jt(R){let _=i.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function D(R){let _=o.render.frame;h.get(R)!==_&&(h.set(R,_),R.update())}function pe(R,_){let B=R.colorSpace,W=R.format,Y=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||B!==qs&&B!==ji&&(re.getTransfer(B)===xe?(W!==xi||Y!==ci)&&Gt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Yt("WebGLTextures: Unsupported texture color space:",B)),_}function ne(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=H,this.resetTextureUnits=k,this.getTextureUnits=L,this.setTextureUnits=U,this.setTexture2D=et,this.setTexture2DArray=X,this.setTexture3D=J,this.setTextureCube=j,this.rebindTextures=rt,this.setupRenderTarget=lt,this.updateRenderTargetMipmap=ct,this.updateMultisampleRenderTarget=Ht,this.setupDepthRenderbuffer=nt,this.setupFrameBufferTexture=Tt,this.useMultisampledRTT=Jt,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function zy(r,t){function e(i,n=ji){let s,o=re.getTransfer(n);if(i===ci)return r.UNSIGNED_BYTE;if(i===Ko)return r.UNSIGNED_SHORT_4_4_4_4;if(i===jo)return r.UNSIGNED_SHORT_5_5_5_1;if(i===Ic)return r.UNSIGNED_INT_5_9_9_9_REV;if(i===Pc)return r.UNSIGNED_INT_10F_11F_11F_REV;if(i===Rc)return r.BYTE;if(i===Cc)return r.SHORT;if(i===bs)return r.UNSIGNED_SHORT;if(i===Jo)return r.INT;if(i===Li)return r.UNSIGNED_INT;if(i===gi)return r.FLOAT;if(i===Di)return r.HALF_FLOAT;if(i===Lc)return r.ALPHA;if(i===Dc)return r.RGB;if(i===xi)return r.RGBA;if(i===ki)return r.DEPTH_COMPONENT;if(i===_n)return r.DEPTH_STENCIL;if(i===Qo)return r.RED;if(i===ta)return r.RED_INTEGER;if(i===vn)return r.RG;if(i===ea)return r.RG_INTEGER;if(i===ia)return r.RGBA_INTEGER;if(i===Sr||i===Er||i===Tr||i===wr)if(o===xe)if(s=t.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===Sr)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Er)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Tr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===wr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=t.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===Sr)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Er)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Tr)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===wr)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===na||i===sa||i===ra||i===oa)if(s=t.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===na)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===sa)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===ra)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===oa)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===aa||i===la||i===ca||i===ha||i===ua||i===Ar||i===da)if(s=t.get("WEBGL_compressed_texture_etc"),s!==null){if(i===aa||i===la)return o===xe?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===ca)return o===xe?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(i===ha)return s.COMPRESSED_R11_EAC;if(i===ua)return s.COMPRESSED_SIGNED_R11_EAC;if(i===Ar)return s.COMPRESSED_RG11_EAC;if(i===da)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===fa||i===pa||i===ma||i===ga||i===xa||i===ya||i===_a||i===va||i===ba||i===Ma||i===Sa||i===Ea||i===Ta||i===wa)if(s=t.get("WEBGL_compressed_texture_astc"),s!==null){if(i===fa)return o===xe?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===pa)return o===xe?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===ma)return o===xe?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===ga)return o===xe?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===xa)return o===xe?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===ya)return o===xe?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===_a)return o===xe?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===va)return o===xe?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===ba)return o===xe?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Ma)return o===xe?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Sa)return o===xe?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Ea)return o===xe?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Ta)return o===xe?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===wa)return o===xe?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Aa||i===Ra||i===Ca)if(s=t.get("EXT_texture_compression_bptc"),s!==null){if(i===Aa)return o===xe?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Ra)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Ca)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Ia||i===Pa||i===Rr||i===La)if(s=t.get("EXT_texture_compression_rgtc"),s!==null){if(i===Ia)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Pa)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Rr)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===La)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Ms?r.UNSIGNED_INT_24_8:r[i]!==void 0?r[i]:null}return{convert:e}}var Vy=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Wy=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,oh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let i=new rr(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,i=new pi({vertexShader:Vy,fragmentShader:Wy,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new _t(new oi(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ah=class extends Hi{constructor(t,e){super();let i=this,n=null,s=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,m=null,y=typeof XRWebGLBinding<"u",g=new oh,p={},T=e.getContextAttributes(),b=null,x=null,S=[],E=[],C=new at,v=null,w=null,A=new ti;A.viewport=new be;let P=new ti;P.viewport=new be;let N=[A,P],k=new Wo,L=null,U=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function($){let it=S[$];return it===void 0&&(it=new ds,S[$]=it),it.getTargetRaySpace()},this.getControllerGrip=function($){let it=S[$];return it===void 0&&(it=new ds,S[$]=it),it.getGripSpace()},this.getHand=function($){let it=S[$];return it===void 0&&(it=new ds,S[$]=it),it.getHandSpace()};function H($){let it=E.indexOf($.inputSource);if(it===-1)return;let bt=S[it];bt!==void 0&&(bt.update($.inputSource,$.frame,c||o),bt.dispatchEvent({type:$.type,data:$.inputSource}))}function V(){n.removeEventListener("select",H),n.removeEventListener("selectstart",H),n.removeEventListener("selectend",H),n.removeEventListener("squeeze",H),n.removeEventListener("squeezestart",H),n.removeEventListener("squeezeend",H),n.removeEventListener("end",V),n.removeEventListener("inputsourceschange",et);for(let $=0;$<S.length;$++){let it=E[$];it!==null&&(E[$]=null,S[$].disconnect(it))}L=null,U=null,g.reset();for(let $ in p)delete p[$];if(t.setRenderTarget(b),f=null,d=null,u=null,n=null,x=null,le.stop(),i.isPresenting=!1,t.setPixelRatio(v),t.setSize(C.width,C.height,!1),w!==null){let $=w.camera;$.fov=w.fov,$.zoom=w.zoom,$.updateProjectionMatrix(),w=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function($){s=$,i.isPresenting===!0&&Gt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function($){a=$,i.isPresenting===!0&&Gt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function($){c=$},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&y&&(u=new XRWebGLBinding(n,e)),u},this.getFrame=function(){return m},this.getSession=function(){return n},this.setSession=async function($){if(n=$,n!==null){if(b=t.getRenderTarget(),n.addEventListener("select",H),n.addEventListener("selectstart",H),n.addEventListener("selectend",H),n.addEventListener("squeeze",H),n.addEventListener("squeezestart",H),n.addEventListener("squeezeend",H),n.addEventListener("end",V),n.addEventListener("inputsourceschange",et),T.xrCompatible!==!0&&await e.makeXRCompatible(),v=t.getPixelRatio(),t.getSize(C),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let bt=null,qt=null,Tt=null;T.depth&&(Tt=T.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,bt=T.stencil?_n:ki,qt=T.stencil?Ms:Li);let Zt={colorFormat:e.RGBA8,depthFormat:Tt,scaleFactor:s};u=this.getBinding(),d=u.createProjectionLayer(Zt),n.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),x=new ai(d.textureWidth,d.textureHeight,{format:xi,type:ci,depthTexture:new dn(d.textureWidth,d.textureHeight,qt,void 0,void 0,void 0,void 0,void 0,void 0,bt),stencilBuffer:T.stencil,colorSpace:t.outputColorSpace,samples:T.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let bt={antialias:T.antialias,alpha:!0,depth:T.depth,stencil:T.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(n,e,bt),n.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),x=new ai(f.framebufferWidth,f.framebufferHeight,{format:xi,type:ci,colorSpace:t.outputColorSpace,stencilBuffer:T.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await n.requestReferenceSpace(a),le.setContext(n),le.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function et($){for(let it=0;it<$.removed.length;it++){let bt=$.removed[it],qt=E.indexOf(bt);qt>=0&&(E[qt]=null,S[qt].disconnect(bt))}for(let it=0;it<$.added.length;it++){let bt=$.added[it],qt=E.indexOf(bt);if(qt===-1){for(let Zt=0;Zt<S.length;Zt++)if(Zt>=E.length){E.push(bt),qt=Zt;break}else if(E[Zt]===null){E[Zt]=bt,qt=Zt;break}if(qt===-1)break}let Tt=S[qt];Tt&&Tt.connect(bt)}}let X=new I,J=new I;function j($,it,bt){X.setFromMatrixPosition(it.matrixWorld),J.setFromMatrixPosition(bt.matrixWorld);let qt=X.distanceTo(J),Tt=it.projectionMatrix.elements,Zt=bt.projectionMatrix.elements,ve=Tt[14]/(Tt[10]-1),nt=Tt[14]/(Tt[10]+1),rt=(Tt[9]+1)/Tt[5],lt=(Tt[9]-1)/Tt[5],ct=(Tt[8]-1)/Tt[0],dt=(Zt[8]+1)/Zt[0],zt=ve*ct,Ht=ve*dt,$t=qt/(-ct+dt),Jt=$t*-ct;if(it.matrixWorld.decompose($.position,$.quaternion,$.scale),$.translateX(Jt),$.translateZ($t),$.matrixWorld.compose($.position,$.quaternion,$.scale),$.matrixWorldInverse.copy($.matrixWorld).invert(),Tt[10]===-1)$.projectionMatrix.copy(it.projectionMatrix),$.projectionMatrixInverse.copy(it.projectionMatrixInverse);else{let D=ve+$t,pe=nt+$t,ne=zt-Jt,R=Ht+(qt-Jt),_=rt*nt/pe*D,B=lt*nt/pe*D;$.projectionMatrix.makePerspective(ne,R,_,B,D,pe),$.projectionMatrixInverse.copy($.projectionMatrix).invert()}}function Ct($,it){it===null?$.matrixWorld.copy($.matrix):$.matrixWorld.multiplyMatrices(it.matrixWorld,$.matrix),$.matrixWorldInverse.copy($.matrixWorld).invert()}this.updateCamera=function($){if(n===null)return;let it=$.near,bt=$.far;g.texture!==null&&(g.depthNear>0&&(it=g.depthNear),g.depthFar>0&&(bt=g.depthFar)),k.near=P.near=A.near=it,k.far=P.far=A.far=bt,(L!==k.near||U!==k.far)&&(n.updateRenderState({depthNear:k.near,depthFar:k.far}),L=k.near,U=k.far),k.layers.mask=$.layers.mask|6,A.layers.mask=k.layers.mask&-5,P.layers.mask=k.layers.mask&-3;let qt=$.parent,Tt=k.cameras;Ct(k,qt);for(let Zt=0;Zt<Tt.length;Zt++)Ct(Tt[Zt],qt);Tt.length===2?j(k,A,P):k.projectionMatrix.copy(A.projectionMatrix),w===null&&$.isPerspectiveCamera&&(w={camera:$,fov:$.fov,zoom:$.zoom}),wt($,k,qt)};function wt($,it,bt){bt===null?$.matrix.copy(it.matrixWorld):($.matrix.copy(bt.matrixWorld),$.matrix.invert(),$.matrix.multiply(it.matrixWorld)),$.matrix.decompose($.position,$.quaternion,$.scale),$.updateMatrixWorld(!0),$.projectionMatrix.copy(it.projectionMatrix),$.projectionMatrixInverse.copy(it.projectionMatrixInverse),$.isPerspectiveCamera&&($.fov=hs*2*Math.atan(1/$.projectionMatrix.elements[5]),$.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function($){l=$,d!==null&&(d.fixedFoveation=$),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=$)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(k)},this.getCameraTexture=function($){return p[$]};let ae=null;function ie($,it){if(h=it.getViewerPose(c||o),m=it,h!==null){let bt=h.views;f!==null&&(t.setRenderTargetFramebuffer(x,f.framebuffer),t.setRenderTarget(x));let qt=!1;bt.length!==k.cameras.length&&(k.cameras.length=0,qt=!0);for(let nt=0;nt<bt.length;nt++){let rt=bt[nt],lt=null;if(f!==null)lt=f.getViewport(rt);else{let dt=u.getViewSubImage(d,rt);lt=dt.viewport,nt===0&&(t.setRenderTargetTextures(x,dt.colorTexture,dt.depthStencilTexture),t.setRenderTarget(x))}let ct=N[nt];ct===void 0&&(ct=new ti,ct.layers.enable(nt),ct.viewport=new be,N[nt]=ct),ct.matrix.fromArray(rt.transform.matrix),ct.matrix.decompose(ct.position,ct.quaternion,ct.scale),ct.projectionMatrix.fromArray(rt.projectionMatrix),ct.projectionMatrixInverse.copy(ct.projectionMatrix).invert(),ct.viewport.set(lt.x,lt.y,lt.width,lt.height),nt===0&&(k.matrix.copy(ct.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),qt===!0&&k.cameras.push(ct)}let Tt=n.enabledFeatures;if(Tt&&Tt.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&y){u=i.getBinding();let nt=u.getDepthInformation(bt[0]);nt&&nt.isValid&&nt.texture&&g.init(nt,n.renderState)}if(Tt&&Tt.includes("camera-access")&&y){t.state.unbindTexture(),u=i.getBinding();for(let nt=0;nt<bt.length;nt++){let rt=bt[nt].camera;if(rt){let lt=p[rt];lt||(lt=new rr,p[rt]=lt);let ct=u.getCameraImage(rt);lt.sourceTexture=ct}}}}for(let bt=0;bt<S.length;bt++){let qt=E[bt],Tt=S[bt];qt!==null&&Tt!==void 0&&Tt.update(qt,it,c||o)}ae&&ae($,it),it.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:it}),m=null}let le=new Nd;le.setAnimationLoop(ie),this.setAnimationLoop=function($){ae=$},this.dispose=function(){}}},Xy=new Xt,Hd=new Wt;Hd.set(-1,0,0,0,1,0,0,0,1);function qy(r,t){function e(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function i(g,p){p.color.getRGB(g.fogColor.value,Bc(r)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function n(g,p,T,b,x){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?s(g,p):p.isMeshLambertMaterial?(s(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(s(g,p),u(g,p)):p.isMeshPhongMaterial?(s(g,p),h(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(s(g,p),d(g,p),p.isMeshPhysicalMaterial&&f(g,p,x)):p.isMeshMatcapMaterial?(s(g,p),m(g,p)):p.isMeshDepthMaterial?s(g,p):p.isMeshDistanceMaterial?(s(g,p),y(g,p)):p.isMeshNormalMaterial?s(g,p):p.isLineBasicMaterial?(o(g,p),p.isLineDashedMaterial&&a(g,p)):p.isPointsMaterial?l(g,p,T,b):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,e(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,e(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===ke&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,e(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===ke&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,e(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,e(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);let T=t.get(p),b=T.envMap,x=T.envMapRotation;b&&(g.envMap.value=b,g.envMapRotation.value.setFromMatrix4(Xy.makeRotationFromEuler(x)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(Hd),g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,g.aoMapTransform))}function o(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,e(p.map,g.mapTransform))}function a(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function l(g,p,T,b){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*T,g.scale.value=b*.5,p.map&&(g.map.value=p.map,e(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,e(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function h(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function u(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function d(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function f(g,p,T){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===ke&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.retroreflectivity>0&&(g.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=T.texture,g.transmissionSamplerSize.value.set(T.width,T.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,p){p.matcap&&(g.matcap.value=p.matcap)}function y(g,p){let T=t.get(p).light;g.referencePosition.value.setFromMatrixPosition(T.matrixWorld),g.nearDistance.value=T.shadow.camera.near,g.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function Yy(r,t,e,i){let n={},s={},o=[],a=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function l(x,S){let E=S.program;i.uniformBlockBinding(x,E)}function c(x,S){let E=n[x.id];E===void 0&&(g(x),E=h(x),n[x.id]=E,x.addEventListener("dispose",T));let C=S.program;i.updateUBOMapping(x,C);let v=t.render.frame;s[x.id]!==v&&(d(x),s[x.id]=v)}function h(x){let S=u();x.__bindingPointIndex=S;let E=r.createBuffer(),C=x.__size,v=x.usage;return r.bindBuffer(r.UNIFORM_BUFFER,E),r.bufferData(r.UNIFORM_BUFFER,C,v),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,S,E),E}function u(){for(let x=0;x<a;x++)if(o.indexOf(x)===-1)return o.push(x),x;return Yt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(x){let S=n[x.id],E=x.uniforms,C=x.__cache;r.bindBuffer(r.UNIFORM_BUFFER,S);for(let v=0,w=E.length;v<w;v++){let A=E[v];if(Array.isArray(A))for(let P=0,N=A.length;P<N;P++)f(A[P],v,P,C);else f(A,v,0,C)}r.bindBuffer(r.UNIFORM_BUFFER,null)}function f(x,S,E,C){if(y(x,S,E,C)===!0){let v=x.__offset,w=x.value;if(Array.isArray(w)){let A=0;for(let P=0;P<w.length;P++){let N=w[P],k=p(N);m(N,x.__data,A),typeof N!="number"&&typeof N!="boolean"&&!N.isMatrix3&&!ArrayBuffer.isView(N)&&(A+=k.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(w,x.__data,0);r.bufferSubData(r.UNIFORM_BUFFER,v,x.__data)}}function m(x,S,E){typeof x=="number"||typeof x=="boolean"?S[0]=x:x.isMatrix3?(S[0]=x.elements[0],S[1]=x.elements[1],S[2]=x.elements[2],S[3]=0,S[4]=x.elements[3],S[5]=x.elements[4],S[6]=x.elements[5],S[7]=0,S[8]=x.elements[6],S[9]=x.elements[7],S[10]=x.elements[8],S[11]=0):ArrayBuffer.isView(x)?S.set(new x.constructor(x.buffer,x.byteOffset,S.length)):x.toArray(S,E)}function y(x,S,E,C){let v=x.value,w=S+"_"+E;if(C[w]===void 0)return typeof v=="number"||typeof v=="boolean"?C[w]=v:ArrayBuffer.isView(v)?C[w]=v.slice():C[w]=v.clone(),!0;{let A=C[w];if(typeof v=="number"||typeof v=="boolean"){if(A!==v)return C[w]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(A.equals(v)===!1)return A.copy(v),!0}}return!1}function g(x){let S=x.uniforms,E=0,C=16;for(let w=0,A=S.length;w<A;w++){let P=Array.isArray(S[w])?S[w]:[S[w]];for(let N=0,k=P.length;N<k;N++){let L=P[N],U=Array.isArray(L.value)?L.value:[L.value];for(let H=0,V=U.length;H<V;H++){let et=U[H],X=p(et),J=E%C,j=J%X.boundary,Ct=J+j;E+=j,Ct!==0&&C-Ct<X.storage&&(E+=C-Ct),L.__data=new Float32Array(X.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=E,E+=X.storage}}}let v=E%C;return v>0&&(E+=C-v),x.__size=E,x.__cache={},this}function p(x){let S={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(S.boundary=4,S.storage=4):x.isVector2?(S.boundary=8,S.storage=8):x.isVector3||x.isColor?(S.boundary=16,S.storage=12):x.isVector4?(S.boundary=16,S.storage=16):x.isMatrix3?(S.boundary=48,S.storage=48):x.isMatrix4?(S.boundary=64,S.storage=64):x.isTexture?Gt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(S.boundary=16,S.storage=x.byteLength):Gt("WebGLRenderer: Unsupported uniform value type.",x),S}function T(x){let S=x.target;S.removeEventListener("dispose",T);let E=o.indexOf(S.__bindingPointIndex);o.splice(E,1),r.deleteBuffer(n[S.id]),delete n[S.id],delete s[S.id]}function b(){for(let x in n)r.deleteBuffer(n[x]);o=[],n={},s={}}return{bind:l,update:c,dispose:b}}var Zy=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Vi=null;function $y(){return Vi===null&&(Vi=new fs(Zy,16,16,vn,Di),Vi.name="DFG_LUT",Vi.minFilter=Ze,Vi.magFilter=Ze,Vi.wrapS=Ui,Vi.wrapT=Ui,Vi.generateMipmaps=!1,Vi.needsUpdate=!0),Vi}var Ha=class{constructor(t={}){let{canvas:e=ed(),context:i=null,depth:n=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=ci}=t;this.isWebGLRenderer=!0;let m;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=i.getContextAttributes().alpha}else m=o;let y=f,g=new Set([ia,ea,ta]),p=new Set([ci,Li,bs,Ms,Ko,jo]),T=new Uint32Array(4),b=new Int32Array(4),x=new I,S=null,E=null,C=[],v=[],w=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Pi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let A=this,P=!1,N=null,k=null,L=null,U=null;this._outputColorSpace=Ve;let H=0,V=0,et=null,X=-1,J=null,j=new be,Ct=new be,wt=null,ae=new Ot(0),ie=0,le=e.width,$=e.height,it=1,bt=null,qt=null,Tt=new be(0,0,le,$),Zt=new be(0,0,le,$),ve=!1,nt=new ps,rt=!1,lt=!1,ct=new Xt,dt=new I,zt=new be,Ht={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},$t=!1;function Jt(){return et===null?it:1}let D=i;function pe(M,F){return e.getContext(M,F)}let ne,R,_,B,W,Y,ht,ut,Z,Q,ft,Ut,yt,pt,Bt,Vt,Kt,O,mt,K,gt,Et,st;try{let M={alpha:!0,depth:n,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",Ee,!1),e.addEventListener("webglcontextrestored",me,!1),e.addEventListener("webglcontextcreationerror",Si,!1),D===null){let F="webgl2";if(D=pe(F,M),D===null)throw pe(F)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}kt()}catch(M){throw e.removeEventListener("webglcontextlost",Ee,!1),e.removeEventListener("webglcontextrestored",me,!1),e.removeEventListener("webglcontextcreationerror",Si,!1),Yt("WebGLRenderer: "+M.message),M}function kt(){ne=new ex(D),ne.init(),gt=new zy(D,ne),R=new Xg(D,ne,t,gt),_=new Hy(D,ne),R.reversedDepthBuffer&&d&&_.buffers.depth.setReversed(!0),k=D.createFramebuffer(),L=D.createFramebuffer(),U=D.createFramebuffer(),B=new sx(D),W=new wy,Y=new Gy(D,ne,_,W,R,gt,B),ht=new tx(A),ut=new om(D),Et=new Vg(D,ut),Z=new ix(D,ut,B,Et),Q=new ox(D,Z,ut,Et,B),O=new rx(D,R,Y),Bt=new qg(W),ft=new Ty(A,ht,ne,R,Et,Bt),Ut=new qy(A,W),yt=new Ry,pt=new Ny(ne),Kt=new zg(A,ht,_,Q,m,l),Vt=new ky(A,Q,R),st=new Yy(D,B,R,_),mt=new Wg(D,ne,B),K=new nx(D,ne,B),B.programs=ft.programs,A.capabilities=R,A.extensions=ne,A.properties=W,A.renderLists=yt,A.shadowMap=Vt,A.state=_,A.info=B}y!==ci&&(w=new lx(y,e.width,e.height,a,n,s));let Lt=new ah(A,D);this.xr=Lt,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let M=ne.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=ne.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return it},this.setPixelRatio=function(M){M!==void 0&&(it=M,this.setSize(le,$,!1))},this.getSize=function(M){return M.set(le,$)},this.setSize=function(M,F,q=!0){if(Lt.isPresenting){Gt("WebGLRenderer: Can't change size while VR device is presenting.");return}le=M,$=F,e.width=Math.floor(M*it),e.height=Math.floor(F*it),q===!0&&(e.style.width=M+"px",e.style.height=F+"px"),w!==null&&w.setSize(e.width,e.height),this.setViewport(0,0,M,F)},this.getDrawingBufferSize=function(M){return M.set(le*it,$*it).floor()},this.setDrawingBufferSize=function(M,F,q){le=M,$=F,it=q,e.width=Math.floor(M*q),e.height=Math.floor(F*q),this.setViewport(0,0,M,F)},this.setEffects=function(M){if(y===ci){Yt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let F=0;F<M.length;F++)if(M[F].isOutputPass===!0){Gt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}w.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(j)},this.getViewport=function(M){return M.copy(Tt)},this.setViewport=function(M,F,q,G){M.isVector4?Tt.set(M.x,M.y,M.z,M.w):Tt.set(M,F,q,G),_.viewport(j.copy(Tt).multiplyScalar(it).round())},this.getScissor=function(M){return M.copy(Zt)},this.setScissor=function(M,F,q,G){M.isVector4?Zt.set(M.x,M.y,M.z,M.w):Zt.set(M,F,q,G),_.scissor(Ct.copy(Zt).multiplyScalar(it).round())},this.getScissorTest=function(){return ve},this.setScissorTest=function(M){_.setScissorTest(ve=M)},this.setOpaqueSort=function(M){bt=M},this.setTransparentSort=function(M){qt=M},this.getClearColor=function(M){return M.copy(Kt.getClearColor())},this.setClearColor=function(){Kt.setClearColor(...arguments)},this.getClearAlpha=function(){return Kt.getClearAlpha()},this.setClearAlpha=function(){Kt.setClearAlpha(...arguments)},this.clear=function(M=!0,F=!0,q=!0){let G=0;if(M){let z=!1;if(et!==null){let St=et.texture.format;z=g.has(St)}if(z){let St=et.texture.type,Rt=p.has(St),Mt=Kt.getClearColor(),It=Kt.getClearAlpha(),Dt=Mt.r,jt=Mt.g,se=Mt.b;Rt?(T[0]=Dt,T[1]=jt,T[2]=se,T[3]=It,D.clearBufferuiv(D.COLOR,0,T)):(b[0]=Dt,b[1]=jt,b[2]=se,b[3]=It,D.clearBufferiv(D.COLOR,0,b))}else G|=D.COLOR_BUFFER_BIT}F&&(G|=D.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),q&&(G|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&D.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),N=M},this.dispose=function(){e.removeEventListener("webglcontextlost",Ee,!1),e.removeEventListener("webglcontextrestored",me,!1),e.removeEventListener("webglcontextcreationerror",Si,!1),Kt.dispose(),yt.dispose(),pt.dispose(),W.dispose(),ht.dispose(),Q.dispose(),Et.dispose(),st.dispose(),ft.dispose(),Lt.dispose(),Lt.removeEventListener("sessionstart",Ih),Lt.removeEventListener("sessionend",Ph),En.stop()};function Ee(M){M.preventDefault(),Fc("WebGLRenderer: Context Lost."),P=!0}function me(){Fc("WebGLRenderer: Context Restored."),P=!1;let M=B.autoReset,F=Vt.enabled,q=Vt.autoUpdate,G=Vt.needsUpdate,z=Vt.type;kt(),B.autoReset=M,Vt.enabled=F,Vt.autoUpdate=q,Vt.needsUpdate=G,Vt.type=z}function Si(M){Yt("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function Ni(M){let F=M.target;F.removeEventListener("dispose",Ni),wf(F)}function wf(M){Af(M),W.remove(M)}function Af(M){let F=W.get(M).programs;F!==void 0&&(F.forEach(function(q){ft.releaseProgram(q)}),M.isShaderMaterial&&ft.releaseShaderCache(M))}this.renderBufferDirect=function(M,F,q,G,z,St){F===null&&(F=Ht);let Rt=z.isMesh&&z.matrixWorld.determinantAffine()<0,Mt=If(M,F,q,G,z);_.setMaterial(G,Rt);let It=q.index,Dt=1;if(G.wireframe===!0){if(It=Z.getWireframeAttribute(q),It===void 0)return;Dt=2}let jt=q.drawRange,se=q.attributes.position,Pt=jt.start*Dt,ge=(jt.start+jt.count)*Dt;St!==null&&(Pt=Math.max(Pt,St.start*Dt),ge=Math.min(ge,(St.start+St.count)*Dt)),It!==null?(Pt=Math.max(Pt,0),ge=Math.min(ge,It.count)):se!=null&&(Pt=Math.max(Pt,0),ge=Math.min(ge,se.count));let Oe=ge-Pt;if(Oe<0||Oe===1/0)return;Et.setup(z,G,Mt,q,It);let Ae,Se=mt;if(It!==null&&(Ae=ut.get(It),Se=K,Se.setIndex(Ae)),z.isMesh)G.wireframe===!0?(_.setLineWidth(G.wireframeLinewidth*Jt()),Se.setMode(D.LINES)):Se.setMode(D.TRIANGLES);else if(z.isLine){let Ke=G.linewidth;Ke===void 0&&(Ke=1),_.setLineWidth(Ke*Jt()),z.isLineSegments?Se.setMode(D.LINES):z.isLineLoop?Se.setMode(D.LINE_LOOP):Se.setMode(D.LINE_STRIP)}else z.isPoints?Se.setMode(D.POINTS):z.isSprite&&Se.setMode(D.TRIANGLES);if(z.isBatchedMesh)if(ne.get("WEBGL_multi_draw"))Se.renderMultiDraw(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount);else{let Ke=z._multiDrawStarts,At=z._multiDrawCounts,ni=z._multiDrawCount,ce=It?ut.get(It).bytesPerElement:1,yi=W.get(G).currentProgram.getUniforms();for(let Fi=0;Fi<ni;Fi++)yi.setValue(D,"_gl_DrawID",Fi),Se.render(Ke[Fi]/ce,At[Fi])}else if(z.isInstancedMesh)Se.renderInstances(Pt,Oe,z.count);else if(q.isInstancedBufferGeometry){let Ke=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,At=Math.min(q.instanceCount,Ke);Se.renderInstances(Pt,Oe,At)}else Se.render(Pt,Oe)};function Ch(M,F,q,G){N!==null&&M.isNodeMaterial&&N.setObject(G,M),rt===!0&&Bt.setState(M,q,!1),M.transparent===!0&&M.side===Fe&&M.forceSinglePass===!1?(M.side=ke,M.needsUpdate=!0,Br(M,F,G),M.side=gn,M.needsUpdate=!0,Br(M,F,G),M.side=Fe):Br(M,F,G)}this.compile=function(M,F,q=null){q===null&&(q=M),N!==null&&N.renderStart(M,F,q),E=pt.get(q),E.init(F),v.push(E),q.traverseVisible(function(z){z.isLight&&z.layers.test(F.layers)&&(E.pushLight(z),z.castShadow&&E.pushShadow(z))}),M!==q&&M.traverseVisible(function(z){z.isLight&&z.layers.test(F.layers)&&(E.pushLight(z),z.castShadow&&E.pushShadow(z))}),E.setupLights(),N!==null&&N.updateLights(E.state.lightsArray),lt=this.localClippingEnabled,rt=Bt.init(this.clippingPlanes,lt),rt===!0&&Bt.setGlobalState(this.clippingPlanes,F),N!==null&&Vt.render(E.state.shadowsArray,q,F);let G=new Set;return M.traverse(function(z){if(!(z.isMesh||z.isPoints||z.isLine||z.isSprite))return;let St=z.material;if(St)if(Array.isArray(St))for(let Rt=0;Rt<St.length;Rt++){let Mt=St[Rt];Ch(Mt,q,F,z),G.add(Mt)}else Ch(St,q,F,z),G.add(St)}),E=v.pop(),N!==null&&N.renderEnd(),G},this.compileAsync=function(M,F,q=null){let G=this.compile(M,F,q);return new Promise(z=>{function St(){if(G.forEach(function(Rt){let It=W.get(Rt).currentProgram;(It===void 0||It.isReady())&&G.delete(Rt)}),G.size===0){z(M);return}setTimeout(St,10)}ne.get("KHR_parallel_shader_compile")!==null?St():setTimeout(St,10)})};let wl=null;function Rf(M){wl&&wl(M)}function Ih(){En.stop()}function Ph(){En.start()}let En=new Nd;En.setAnimationLoop(Rf),typeof self<"u"&&En.setContext(self),this.setAnimationLoop=function(M){wl=M,Lt.setAnimationLoop(M),M===null?En.stop():En.start()},Lt.addEventListener("sessionstart",Ih),Lt.addEventListener("sessionend",Ph),this.render=function(M,F){if(F!==void 0&&F.isCamera!==!0){Yt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;N!==null&&N.renderStart(M,F);let q=Lt.enabled===!0&&Lt.isPresenting===!0,G=w!==null&&(et===null||q)&&w.begin(A,et);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),Lt.enabled===!0&&Lt.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Lt.cameraAutoUpdate===!0&&Lt.updateCamera(F),F=Lt.getCamera()),M.isScene===!0&&M.onBeforeRender(A,M,F,et),E=pt.get(M,v.length),E.init(F),E.state.textureUnits=Y.getTextureUnits(),v.push(E),ct.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),nt.setFromProjectionMatrix(ct,Ri,F.reversedDepth),lt=this.localClippingEnabled,rt=Bt.init(this.clippingPlanes,lt),S=yt.get(M,C.length),S.init(),C.push(S),Lt.enabled===!0&&Lt.isPresenting===!0){let Rt=A.xr.getDepthSensingMesh();Rt!==null&&Al(Rt,F,-1/0,A.sortObjects)}Al(M,F,0,A.sortObjects),S.finish(),N!==null&&N.updateLights(E.state.lightsArray),A.sortObjects===!0&&S.sort(bt,qt),$t=Lt.enabled===!1||Lt.isPresenting===!1||Lt.hasDepthSensing()===!1,$t&&Kt.addToRenderList(S,M),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),rt===!0&&Bt.beginShadows();let z=E.state.shadowsArray;if(Vt.render(z,M,F),rt===!0&&Bt.endShadows(),(G&&w.hasRenderPass())===!1){let Rt=S.opaque,Mt=S.transmissive;if(E.setupLights(),F.isArrayCamera){let It=F.cameras;if(Mt.length>0)for(let Dt=0,jt=It.length;Dt<jt;Dt++){let se=It[Dt];Dh(Rt,Mt,M,se)}$t&&Kt.render(M);for(let Dt=0,jt=It.length;Dt<jt;Dt++){let se=It[Dt];Lh(S,M,se,se.viewport)}}else Mt.length>0&&Dh(Rt,Mt,M,F),$t&&Kt.render(M),Lh(S,M,F)}et!==null&&V===0&&(Y.updateMultisampleRenderTarget(et),Y.updateRenderTargetMipmap(et)),G&&w.end(A),M.isScene===!0&&M.onAfterRender(A,M,F),Et.resetDefaultState(),X=-1,J=null,v.pop(),v.length>0?(E=v[v.length-1],Y.setTextureUnits(E.state.textureUnits),rt===!0&&Bt.setGlobalState(A.clippingPlanes,E.state.camera)):E=null,C.pop(),C.length>0?S=C[C.length-1]:S=null,N!==null&&N.renderEnd()};function Al(M,F,q,G){if(M.visible===!1)return;if(M.layers.test(F.layers)){if(M.isGroup)q=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(F);else if(M.isLightProbeGrid)E.pushLightProbeGrid(M);else if(M.isLight)E.pushLight(M),M.castShadow&&E.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||M.intersectsFrustum(nt)){G&&zt.setFromMatrixPosition(M.matrixWorld).applyMatrix4(ct);let Rt=Q.update(M),Mt=M.material;Mt.visible&&S.push(M,Rt,Mt,q,zt.z,null,F)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||M.intersectsFrustum(nt))){let Rt=Q.update(M),Mt=M.material;if(G&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),zt.copy(M.boundingSphere.center)):(Rt.boundingSphere===null&&Rt.computeBoundingSphere(),zt.copy(Rt.boundingSphere.center)),zt.applyMatrix4(M.matrixWorld).applyMatrix4(ct)),Array.isArray(Mt)){let It=Rt.groups;for(let Dt=0,jt=It.length;Dt<jt;Dt++){let se=It[Dt],Pt=Mt[se.materialIndex];Pt&&Pt.visible&&S.push(M,Rt,Pt,q,zt.z,se,F)}}else Mt.visible&&S.push(M,Rt,Mt,q,zt.z,null,F)}}let St=M.children;for(let Rt=0,Mt=St.length;Rt<Mt;Rt++)Al(St[Rt],F,q,G)}function Lh(M,F,q,G){let{opaque:z,transmissive:St,transparent:Rt}=M;E.setupLightsView(q),rt===!0&&Bt.setGlobalState(A.clippingPlanes,q),G&&_.viewport(j.copy(G)),z.length>0&&Ur(z,F,q),St.length>0&&Ur(St,F,q),Rt.length>0&&Ur(Rt,F,q),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function Dh(M,F,q,G){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[G.id]===void 0){let Pt=ne.has("EXT_color_buffer_half_float")||ne.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[G.id]=new ai(1,1,{generateMipmaps:!0,type:Pt?Di:ci,minFilter:yn,samples:Math.max(4,R.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:re.workingColorSpace})}let St=E.state.transmissionRenderTarget[G.id],Rt=G.viewport||j;St.setSize(Rt.z*A.transmissionResolutionScale,Rt.w*A.transmissionResolutionScale);let Mt=A.getRenderTarget(),It=A.getActiveCubeFace(),Dt=A.getActiveMipmapLevel();A.setRenderTarget(St),A.getClearColor(ae),ie=A.getClearAlpha(),ie<1&&A.setClearColor(16777215,.5),A.clear(),$t&&Kt.render(q);let jt=A.toneMapping;A.toneMapping=Pi;let se=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),E.setupLightsView(G),rt===!0&&Bt.setGlobalState(A.clippingPlanes,G),Ur(M,q,G),Y.updateMultisampleRenderTarget(St),Y.updateRenderTargetMipmap(St),ne.has("WEBGL_multisampled_render_to_texture")===!1){let Pt=!1;for(let ge=0,Oe=F.length;ge<Oe;ge++){let Ae=F[ge],{object:Se,geometry:Ke,material:At,group:ni}=Ae;if(At.side===Fe&&Se.layers.test(G.layers)){let ce=At.side;At.side=ke,At.needsUpdate=!0,Nh(Se,q,G,Ke,At,ni),At.side=ce,At.needsUpdate=!0,Pt=!0}}Pt===!0&&(Y.updateMultisampleRenderTarget(St),Y.updateRenderTargetMipmap(St))}A.setRenderTarget(Mt,It,Dt),A.setClearColor(ae,ie),se!==void 0&&(G.viewport=se),A.toneMapping=jt}function Ur(M,F,q){let G=F.isScene===!0?F.overrideMaterial:null;for(let z=0,St=M.length;z<St;z++){let Rt=M[z],{object:Mt,geometry:It,group:Dt}=Rt,jt=Rt.material;jt.allowOverride===!0&&G!==null&&(jt=G),Mt.layers.test(q.layers)&&Nh(Mt,F,q,It,jt,Dt)}}function Nh(M,F,q,G,z,St){N!==null&&z.isNodeMaterial&&N.setObject(M,z),M.onBeforeRender(A,F,q,G,z,St),M.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),z.onBeforeRender(A,F,q,G,M,St),z.transparent===!0&&z.side===Fe&&z.forceSinglePass===!1?(z.side=ke,z.needsUpdate=!0,A.renderBufferDirect(q,F,G,z,M,St),z.side=gn,z.needsUpdate=!0,A.renderBufferDirect(q,F,G,z,M,St),z.side=Fe):A.renderBufferDirect(q,F,G,z,M,St),M.onAfterRender(A,F,q,G,z,St)}function Br(M,F,q){F.isScene!==!0&&(F=Ht);let G=W.get(M),z=E.state.lights,St=E.state.shadowsArray,Rt=z.state.version,Mt=ft.getParameters(M,z.state,St,F,q,E.state.lightProbeGridArray),It=ft.getProgramCacheKey(Mt),Dt=G.programs;G.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?F.environment:null,G.fog=F.fog;let jt=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;G.envMap=ht.get(M.envMap||G.environment,jt),G.envMapRotation=G.environment!==null&&M.envMap===null?F.environmentRotation:M.envMapRotation,Dt===void 0&&(M.addEventListener("dispose",Ni),Dt=new Map,G.programs=Dt);let se=Dt.get(It);if(se!==void 0){if(G.currentProgram===se&&G.lightsStateVersion===Rt)return Oh(M,Mt),se}else Mt.uniforms=ft.getUniforms(M),N!==null&&M.isNodeMaterial&&N.build(M,q,Mt),M.onBeforeCompile(Mt,A),se=ft.acquireProgram(Mt,It),Dt.set(It,se),G.uniforms=Mt.uniforms;let Pt=G.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(Pt.clippingPlanes=Bt.uniform),Oh(M,Mt),G.needsLights=Lf(M),G.lightsStateVersion=Rt,G.needsLights&&(Pt.ambientLightColor.value=z.state.ambient,Pt.lightProbe.value=z.state.probe,Pt.sunLights.value=z.state.sun,Pt.sunLightShadows.value=z.state.sunShadow,Pt.directionalLights.value=z.state.directional,Pt.directionalLightShadows.value=z.state.directionalShadow,Pt.spotLights.value=z.state.spot,Pt.spotLightShadows.value=z.state.spotShadow,Pt.rectAreaLights.value=z.state.rectArea,Pt.ltc_1.value=z.state.rectAreaLTC1,Pt.ltc_2.value=z.state.rectAreaLTC2,Pt.pointLights.value=z.state.point,Pt.pointLightShadows.value=z.state.pointShadow,Pt.hemisphereLights.value=z.state.hemi,Pt.sunShadowMatrix.value=z.state.sunShadowMatrix,Pt.sunShadowCascade.value=z.state.sunShadowCascade,Pt.directionalShadowMatrix.value=z.state.directionalShadowMatrix,Pt.spotLightMatrix.value=z.state.spotLightMatrix,Pt.spotLightMap.value=z.state.spotLightMap,Pt.pointShadowMatrix.value=z.state.pointShadowMatrix),G.lightProbeGrid=E.state.lightProbeGridArray.length>0,G.currentProgram=se,G.uniformsList=null,se}function Fh(M){if(M.uniformsList===null){let F=M.currentProgram.getUniforms();M.uniformsList=Ts.seqWithValue(F.seq,M.uniforms)}return M.uniformsList}function Oh(M,F){let q=W.get(M);q.outputColorSpace=F.outputColorSpace,q.batching=F.batching,q.batchingColor=F.batchingColor,q.instancing=F.instancing,q.instancingColor=F.instancingColor,q.instancingMorph=F.instancingMorph,q.skinning=F.skinning,q.morphTargets=F.morphTargets,q.morphNormals=F.morphNormals,q.morphColors=F.morphColors,q.morphTargetsCount=F.morphTargetsCount,q.numClippingPlanes=F.numClippingPlanes,q.numIntersection=F.numClipIntersection,q.vertexAlphas=F.vertexAlphas,q.vertexTangents=F.vertexTangents,q.toneMapping=F.toneMapping}function Cf(M,F){if(M.length===0)return null;if(M.length===1)return M[0].texture!==null?M[0]:null;x.setFromMatrixPosition(F.matrixWorld);for(let q=0,G=M.length;q<G;q++){let z=M[q];if(z.texture!==null&&z.boundingBox.containsPoint(x))return z}return null}function If(M,F,q,G,z){F.isScene!==!0&&(F=Ht),Y.resetTextureUnits();let St=F.fog,Rt=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?F.environment:null,Mt=et===null?A.outputColorSpace:et.isXRRenderTarget===!0?et.texture.colorSpace:re.workingColorSpace,It=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,Dt=ht.get(G.envMap||Rt,It),jt=G.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,se=!!q.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Pt=!!q.morphAttributes.position,ge=!!q.morphAttributes.normal,Oe=!!q.morphAttributes.color,Ae=Pi;G.toneMapped&&(et===null||et.isXRRenderTarget===!0)&&(Ae=A.toneMapping);let Se=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,Ke=Se!==void 0?Se.length:0,At=W.get(G),ni=E.state.lights;if(rt===!0&&(lt===!0||M!==J)){let Te=M===J&&G.id===X;Bt.setState(G,M,Te)}let ce=!1;G.version===At.__version?(At.needsLights&&At.lightsStateVersion!==ni.state.version||At.outputColorSpace!==Mt||z.isBatchedMesh&&At.batching===!1||!z.isBatchedMesh&&At.batching===!0||z.isBatchedMesh&&At.batchingColor===!0&&z._colorsTexture===null||z.isBatchedMesh&&At.batchingColor===!1&&z._colorsTexture!==null||z.isInstancedMesh&&At.instancing===!1||!z.isInstancedMesh&&At.instancing===!0||z.isSkinnedMesh&&At.skinning===!1||!z.isSkinnedMesh&&At.skinning===!0||z.isInstancedMesh&&At.instancingColor===!0&&z.instanceColor===null||z.isInstancedMesh&&At.instancingColor===!1&&z.instanceColor!==null||z.isInstancedMesh&&At.instancingMorph===!0&&z.morphTexture===null||z.isInstancedMesh&&At.instancingMorph===!1&&z.morphTexture!==null||At.envMap!==Dt||G.fog===!0&&At.fog!==St||At.numClippingPlanes!==void 0&&(At.numClippingPlanes!==Bt.numPlanes||At.numIntersection!==Bt.numIntersection)||At.vertexAlphas!==jt||At.vertexTangents!==se||At.morphTargets!==Pt||At.morphNormals!==ge||At.morphColors!==Oe||At.toneMapping!==Ae||At.morphTargetsCount!==Ke||!!At.lightProbeGrid!=E.state.lightProbeGridArray.length>0)&&(ce=!0):(ce=!0,At.__version=G.version);let yi=At.currentProgram;ce===!0&&(yi=Br(G,F,z),N&&G.isNodeMaterial&&N.onUpdateProgram(G,yi,At));let Fi=!1,tn=!1,Vn=!1,Me=yi.getUniforms(),Ne=At.uniforms;if(_.useProgram(yi.program)&&(Fi=!0,tn=!0,Vn=!0),G.id!==X&&(X=G.id,tn=!0),At.needsLights){let Te=Cf(E.state.lightProbeGridArray,z);At.lightProbeGrid!==Te&&(At.lightProbeGrid=Te,tn=!0)}if(Fi||J!==M){_.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),Me.setValue(D,"projectionMatrix",M.projectionMatrix),Me.setValue(D,"viewMatrix",M.matrixWorldInverse);let nn=Me.map.cameraPosition;nn!==void 0&&nn.setValue(D,dt.setFromMatrixPosition(M.matrixWorld)),R.logarithmicDepthBuffer&&Me.setValue(D,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&Me.setValue(D,"isOrthographic",M.isOrthographicCamera===!0),J!==M&&(J=M,tn=!0,Vn=!0)}if(At.needsLights&&(ni.state.sunShadowMap.length>0&&Me.setValue(D,"sunShadowMap",ni.state.sunShadowMap,Y),ni.state.directionalShadowMap.length>0&&Me.setValue(D,"directionalShadowMap",ni.state.directionalShadowMap,Y),ni.state.spotShadowMap.length>0&&Me.setValue(D,"spotShadowMap",ni.state.spotShadowMap,Y),ni.state.pointShadowMap.length>0&&Me.setValue(D,"pointShadowMap",ni.state.pointShadowMap,Y)),z.isSkinnedMesh){Me.setOptional(D,z,"bindMatrix"),Me.setOptional(D,z,"bindMatrixInverse");let Te=z.skeleton;Te&&(Te.boneTexture===null&&Te.computeBoneTexture(),Me.setValue(D,"boneTexture",Te.boneTexture,Y))}z.isBatchedMesh&&(Me.setOptional(D,z,"batchingTexture"),Me.setValue(D,"batchingTexture",z._matricesTexture,Y),Me.setOptional(D,z,"batchingIdTexture"),Me.setValue(D,"batchingIdTexture",z._indirectTexture,Y),Me.setOptional(D,z,"batchingColorTexture"),z._colorsTexture!==null&&Me.setValue(D,"batchingColorTexture",z._colorsTexture,Y));let en=q.morphAttributes;if((en.position!==void 0||en.normal!==void 0||en.color!==void 0)&&O.update(z,q,yi),(tn||At.receiveShadow!==z.receiveShadow)&&(At.receiveShadow=z.receiveShadow,Me.setValue(D,"receiveShadow",z.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&F.environment!==null&&(Ne.envMapIntensity.value=F.environmentIntensity),Ne.dfgLUT!==void 0&&(Ne.dfgLUT.value=$y()),tn){if(Me.setValue(D,"toneMappingExposure",A.toneMappingExposure),At.needsLights&&Pf(Ne,Vn),St&&G.fog===!0&&Ut.refreshFogUniforms(Ne,St),Ut.refreshMaterialUniforms(Ne,G,it,$,E.state.transmissionRenderTarget[M.id]),At.needsLights&&At.lightProbeGrid){let Te=At.lightProbeGrid;Ne.probesSH.value=Te.texture,Ne.probesMin.value.copy(Te.boundingBox.min),Ne.probesMax.value.copy(Te.boundingBox.max),Ne.probesResolution.value.copy(Te.resolution)}Ts.upload(D,Fh(At),Ne,Y)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Ts.upload(D,Fh(At),Ne,Y),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&Me.setValue(D,"center",z.center),Me.setValue(D,"modelViewMatrix",z.modelViewMatrix),Me.setValue(D,"normalMatrix",z.normalMatrix),Me.setValue(D,"modelMatrix",z.matrixWorld),G.uniformsGroups!==void 0){let Te=G.uniformsGroups;for(let nn=0,Wn=Te.length;nn<Wn;nn++){let Bh=Te[nn];st.update(Bh,yi),st.bind(Bh,yi)}}return yi}function Pf(M,F){M.ambientLightColor.needsUpdate=F,M.lightProbe.needsUpdate=F,M.sunLights.needsUpdate=F,M.sunLightShadows.needsUpdate=F,M.directionalLights.needsUpdate=F,M.directionalLightShadows.needsUpdate=F,M.pointLights.needsUpdate=F,M.pointLightShadows.needsUpdate=F,M.spotLights.needsUpdate=F,M.spotLightShadows.needsUpdate=F,M.rectAreaLights.needsUpdate=F,M.hemisphereLights.needsUpdate=F}function Lf(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return H},this.getActiveMipmapLevel=function(){return V},this.getRenderTarget=function(){return et},this.setRenderTargetTextures=function(M,F,q){let G=W.get(M);G.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),W.get(M.texture).__webglTexture=F,W.get(M.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:q,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,F){let q=W.get(M);q.__webglFramebuffer=F,q.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(M,F=0,q=0){et=M,H=F,V=q;let G=null,z=!1,St=!1;if(M){let Mt=W.get(M);if(Mt.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(D.FRAMEBUFFER,Mt.__webglFramebuffer),j.copy(M.viewport),Ct.copy(M.scissor),wt=M.scissorTest,_.viewport(j),_.scissor(Ct),_.setScissorTest(wt),X=-1;return}else if(Mt.__webglFramebuffer===void 0)Y.setupRenderTarget(M);else if(Mt.__hasExternalTextures)Y.rebindTextures(M,W.get(M.texture).__webglTexture,W.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let jt=M.depthTexture;if(Mt.__boundDepthTexture!==jt){if(jt!==null&&W.has(jt)&&(M.width!==jt.image.width||M.height!==jt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Y.setupDepthRenderbuffer(M)}}let It=M.texture;(It.isData3DTexture||It.isDataArrayTexture||It.isCompressedArrayTexture)&&(St=!0);let Dt=W.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Dt[F])?G=Dt[F][q]:G=Dt[F],z=!0):M.samples>0&&Y.useMultisampledRTT(M)===!1?G=W.get(M).__webglMultisampledFramebuffer:Array.isArray(Dt)?G=Dt[q]:G=Dt,j.copy(M.viewport),Ct.copy(M.scissor),wt=M.scissorTest}else j.copy(Tt).multiplyScalar(it).floor(),Ct.copy(Zt).multiplyScalar(it).floor(),wt=ve;if(q!==0&&(G=k),_.bindFramebuffer(D.FRAMEBUFFER,G)&&_.drawBuffers(M,G),_.viewport(j),_.scissor(Ct),_.setScissorTest(wt),z){let Mt=W.get(M.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+F,Mt.__webglTexture,q)}else if(St){let Mt=F;for(let It=0;It<M.textures.length;It++){let Dt=W.get(M.textures[It]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+It,Dt.__webglTexture,q,Mt)}}else if(M!==null&&q!==0){let Mt=W.get(M.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Mt.__webglTexture,q)}X=-1};function Uh(M){let F=W.get(M);return(F.__readFormat!==M.format||F.__readType!==M.type)&&(F.__readFormat=M.format,F.__readType=M.type,F.__formatReadable=R.textureFormatReadable(M.format),F.__typeReadable=R.textureTypeReadable(M.type)),F}this.readRenderTargetPixels=function(M,F,q,G,z,St,Rt,Mt=0){if(!(M&&M.isWebGLRenderTarget)){Yt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let It=W.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Rt!==void 0&&(It=It[Rt]),It){_.bindFramebuffer(D.FRAMEBUFFER,It);try{let Dt=M.textures[Mt],jt=Dt.format,se=Dt.type;M.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Mt);let Pt=Uh(Dt);if(Pt.__formatReadable===!1){Yt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Pt.__typeReadable===!1){Yt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=M.width-G&&q>=0&&q<=M.height-z&&D.readPixels(F,q,G,z,gt.convert(jt),gt.convert(se),St)}finally{let Dt=et!==null?W.get(et).__webglFramebuffer:null;_.bindFramebuffer(D.FRAMEBUFFER,Dt)}}},this.readRenderTargetPixelsAsync=async function(M,F,q,G,z,St,Rt,Mt=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let It=W.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Rt!==void 0&&(It=It[Rt]),It)if(F>=0&&F<=M.width-G&&q>=0&&q<=M.height-z){_.bindFramebuffer(D.FRAMEBUFFER,It);let Dt=M.textures[Mt],jt=Dt.format,se=Dt.type;M.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Mt);let Pt=Uh(Dt);if(Pt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Pt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ge=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,ge),D.bufferData(D.PIXEL_PACK_BUFFER,St.byteLength,D.STREAM_READ),D.readPixels(F,q,G,z,gt.convert(jt),gt.convert(se),0),D.bindBuffer(D.PIXEL_PACK_BUFFER,null);let Oe=et!==null?W.get(et).__webglFramebuffer:null;_.bindFramebuffer(D.FRAMEBUFFER,Oe);let Ae=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await nd(D,Ae,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,ge),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,St),D.bindBuffer(D.PIXEL_PACK_BUFFER,null),D.deleteBuffer(ge),D.deleteSync(Ae),St}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,F=null,q=0){let G=Math.pow(2,-q),z=Math.floor(M.image.width*G),St=Math.floor(M.image.height*G),Rt=F!==null?F.x:0,Mt=F!==null?F.y:0;Y.setTexture2D(M,0),D.copyTexSubImage2D(D.TEXTURE_2D,q,0,0,Rt,Mt,z,St),_.unbindTexture()},this.copyTextureToTexture=function(M,F,q=null,G=null,z=0,St=0){let Rt,Mt,It,Dt,jt,se,Pt,ge,Oe,Ae=M.isCompressedTexture?M.mipmaps[St]:M.image;if(q!==null)Rt=q.max.x-q.min.x,Mt=q.max.y-q.min.y,It=q.isBox3?q.max.z-q.min.z:1,Dt=q.min.x,jt=q.min.y,se=q.isBox3?q.min.z:0;else{let Ne=Math.pow(2,-z);Rt=Math.floor(Ae.width*Ne),Mt=Math.floor(Ae.height*Ne),M.isDataArrayTexture?It=Ae.depth:M.isData3DTexture?It=Math.floor(Ae.depth*Ne):It=1,Dt=0,jt=0,se=0}G!==null?(Pt=G.x,ge=G.y,Oe=G.z):(Pt=0,ge=0,Oe=0);let Se=gt.convert(F.format),Ke=gt.convert(F.type),At;F.isData3DTexture?(Y.setTexture3D(F,0),At=D.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(Y.setTexture2DArray(F,0),At=D.TEXTURE_2D_ARRAY):(Y.setTexture2D(F,0),At=D.TEXTURE_2D),_.activeTexture(D.TEXTURE0),_.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,F.flipY),_.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),_.pixelStorei(D.UNPACK_ALIGNMENT,F.unpackAlignment);let ni=_.getParameter(D.UNPACK_ROW_LENGTH),ce=_.getParameter(D.UNPACK_IMAGE_HEIGHT),yi=_.getParameter(D.UNPACK_SKIP_PIXELS),Fi=_.getParameter(D.UNPACK_SKIP_ROWS),tn=_.getParameter(D.UNPACK_SKIP_IMAGES);_.pixelStorei(D.UNPACK_ROW_LENGTH,Ae.width),_.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Ae.height),_.pixelStorei(D.UNPACK_SKIP_PIXELS,Dt),_.pixelStorei(D.UNPACK_SKIP_ROWS,jt),_.pixelStorei(D.UNPACK_SKIP_IMAGES,se);let Vn=M.isDataArrayTexture||M.isData3DTexture,Me=F.isDataArrayTexture||F.isData3DTexture;if(M.isDepthTexture){let Ne=W.get(M),en=W.get(F),Te=W.get(Ne.__renderTarget),nn=W.get(en.__renderTarget);_.bindFramebuffer(D.READ_FRAMEBUFFER,Te.__webglFramebuffer),_.bindFramebuffer(D.DRAW_FRAMEBUFFER,nn.__webglFramebuffer);for(let Wn=0;Wn<It;Wn++)Vn&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,W.get(M).__webglTexture,z,se+Wn),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,W.get(F).__webglTexture,St,Oe+Wn)),D.blitFramebuffer(Dt,jt,Rt,Mt,Pt,ge,Rt,Mt,D.DEPTH_BUFFER_BIT,D.NEAREST);_.bindFramebuffer(D.READ_FRAMEBUFFER,null),_.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(z!==0||M.isRenderTargetTexture||W.has(M)){let Ne=W.get(M),en=W.get(F);_.bindFramebuffer(D.READ_FRAMEBUFFER,L),_.bindFramebuffer(D.DRAW_FRAMEBUFFER,U);for(let Te=0;Te<It;Te++)Vn?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Ne.__webglTexture,z,se+Te):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Ne.__webglTexture,z),Me?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,en.__webglTexture,St,Oe+Te):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,en.__webglTexture,St),z!==0?D.blitFramebuffer(Dt,jt,Rt,Mt,Pt,ge,Rt,Mt,D.COLOR_BUFFER_BIT,D.NEAREST):Me?D.copyTexSubImage3D(At,St,Pt,ge,Oe+Te,Dt,jt,Rt,Mt):D.copyTexSubImage2D(At,St,Pt,ge,Dt,jt,Rt,Mt);_.bindFramebuffer(D.READ_FRAMEBUFFER,null),_.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else Me?M.isDataTexture||M.isData3DTexture?D.texSubImage3D(At,St,Pt,ge,Oe,Rt,Mt,It,Se,Ke,Ae.data):F.isCompressedArrayTexture?D.compressedTexSubImage3D(At,St,Pt,ge,Oe,Rt,Mt,It,Se,Ae.data):D.texSubImage3D(At,St,Pt,ge,Oe,Rt,Mt,It,Se,Ke,Ae):M.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,St,Pt,ge,Rt,Mt,Se,Ke,Ae.data):M.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,St,Pt,ge,Ae.width,Ae.height,Se,Ae.data):D.texSubImage2D(D.TEXTURE_2D,St,Pt,ge,Rt,Mt,Se,Ke,Ae);_.pixelStorei(D.UNPACK_ROW_LENGTH,ni),_.pixelStorei(D.UNPACK_IMAGE_HEIGHT,ce),_.pixelStorei(D.UNPACK_SKIP_PIXELS,yi),_.pixelStorei(D.UNPACK_SKIP_ROWS,Fi),_.pixelStorei(D.UNPACK_SKIP_IMAGES,tn),St===0&&F.generateMipmaps&&D.generateMipmap(At),_.unbindTexture()},this.initRenderTarget=function(M){W.get(M).__webglFramebuffer===void 0&&Y.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?Y.setTextureCube(M,0):M.isData3DTexture?Y.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?Y.setTexture2DArray(M,0):Y.setTexture2D(M,0),_.unbindTexture()},this.resetState=function(){H=0,V=0,et=null,_.reset(),Et.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ri}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=re._getDrawingBufferColorSpace(t),e.unpackColorSpace=re._getUnpackColorSpace()}};var Va=new Xt,Gd=new Wt,As=new I,Wa=new I,zd=new Xe,Vd=new $e,Wd=new I;function Jy(r){let t=[],e=[];for(let n of r){let s=n.geometry.index?n.geometry.toNonIndexed():n.geometry;Vd.set(...n.rotation||[0,0,0]),zd.setFromEuler(Vd),As.set(...n.position||[0,0,0]),Wd.set(...n.scale||[1,1,1]),Va.compose(As,zd,Wd),Gd.getNormalMatrix(Va);let o=s.getAttribute("position"),a=s.getAttribute("normal"),l=Va.determinant()<0;for(let c=0;c<o.count;c++){let h=c%3,u=l?c-h+(h===0?0:3-h):c;As.fromBufferAttribute(o,u).applyMatrix4(Va),Wa.fromBufferAttribute(a,u).applyMatrix3(Gd).normalize(),t.push(As.x,As.y,As.z),e.push(Wa.x,Wa.y,Wa.z)}s!==n.geometry&&s.dispose()}let i=new de;return i.setAttribute("position",new Ft(t,3)),i.setAttribute("normal",new Ft(e,3)),i.computeBoundingBox(),i.computeBoundingSphere(),i}function Qi(r,t,e=0){let i=new Pe;r.forEach(([s,o],a)=>a?i.lineTo(s,o):i.moveTo(s,o)),i.closePath();let n=new qe(i,{depth:t,steps:1,bevelEnabled:e>0,bevelThickness:e,bevelSize:e,bevelSegments:1,curveSegments:8});return n.computeVertexNormals(),n}function kn(r,t,e,i=r,n=t){let s=r/2,o=t/2,a=i/2,l=n/2,c=[[-s,0,-a],[s,0,-a],[s,0,a],[-s,0,a],[-o,e,-l],[o,e,-l],[o,e,l],[-o,e,l]],h=[[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0],[4,7,6,5],[0,1,2,3]],u=[];for(let[f,m,y,g]of h)for(let p of[f,m,y,f,y,g])u.push(...c[p]);let d=new de;return d.setAttribute("position",new Ft(u,3)),d.computeVertexNormals(),d}var Xa=class{constructor(){let t=(e,i=.82,n=0)=>new xt({color:e,roughness:i,metalness:n});this.materials={stone:t(15057291),cream:t(16771789),shade:t(11434315),dark:t(2309712),gold:t(15316293,.42,.3),turquoise:t(2730658,.62),indigo:t(3492725,.72),coral:t(15632747,.74),trunk:t(9136203),leaf:t(3771765,.84),leafLight:t(6335624,.84)},this.geometries={},this.unit={box:new ee(1,1,1),sphere:new ye(1,12,8),cylinder:new ue(1,1,1,12),ring:new Le(1,.085,5,20)},this.buildPyramid(),this.buildPharaoh(),this.buildObelisk(),this.buildPalm(),this.buildTempleGate()}part(t,e,i,n){return{geometry:this.unit[t],position:e,scale:i,rotation:n}}addGeometry(t,e){this.geometries[t]=Jy(e)}accent(t){let e=(Math.floor(t)%3+3)%3;return[this.materials.turquoise,this.materials.indigo,this.materials.coral][e]}model(t,e,i){let n=new Nt;n.name=`egypt-${t}`,n.userData.egyptProp=t,n.userData.variant=i;for(let[s,o,a]of e){let l=new _t(this.geometries[s],o==="accent"?this.accent(i):this.materials[o]);l.name=a||s,l.castShadow=t!=="palm"||o==="trunk",l.receiveShadow=!0,n.add(l)}return n}buildPyramid(){this.addGeometry("pyramidBase",[this.part("box",[0,.14,0],[12.5,.28,12.5])]),this.addGeometry("pyramidBody",[{geometry:kn(12,1.08,9),position:[0,.28,0]}]),this.addGeometry("pyramidCap",[{geometry:kn(1.08,0,.89),position:[0,9.28,0]}]);let t=[];for(let s=1;s<=8;s++){let o=.28+s*.98,a=6-(o-.28)*(5.46/9);t.push(this.part("box",[0,o,-a-.012],[a*2,.032,.03])),t.push(this.part("box",[0,o,a+.012],[a*2,.032,.03])),t.push(this.part("box",[-a-.012,o,0],[.03,.032,a*2])),t.push(this.part("box",[a+.012,o,0],[.03,.032,a*2]))}this.addGeometry("pyramidCourses",t);let e=Qi([[-.47,.28],[.47,.28],[.47,1.05],[.27,1.27],[-.27,1.27],[-.47,1.05]],.02),i=e.getAttribute("position");for(let s=0;s<i.count;s++)i.setZ(s,-6+(i.getY(s)-.28)*(5.46/9)-.033+i.getZ(s));e.computeVertexNormals(),this.addGeometry("pyramidPortal",[{geometry:e}]);let n=Math.atan(5.46/9);this.addGeometry("pyramidPortalTrim",[this.part("box",[-.54,.66,-5.798],[.1,.9,.032],[n,0,0]),this.part("box",[.54,.66,-5.798],[.1,.9,.032],[n,0,0]),this.part("box",[0,1.04,-5.566],[1.14,.1,.032],[n,0,0])])}createPyramid(t=0){return this.model("pyramid",[["pyramidBase","cream"],["pyramidBody",t%2?"cream":"stone"],["pyramidCourses","shade"],["pyramidCap","gold"],["pyramidPortal","dark"],["pyramidPortalTrim","accent"]],t)}buildPharaoh(){let t=Qi([[-.95,3.11],[-.79,4.22],[-.55,4.66],[-.28,4.85],[.28,4.85],[.55,4.66],[.79,4.22],[.95,3.11],[.48,3.07],[.36,3.59],[-.36,3.59],[-.48,3.07]],.5,.03);this.addGeometry("pharaohHood",[{geometry:t,position:[0,0,-.3]}]);let e=[];for(let u of[-1,1])for(let d=0;d<6;d++){let f=3.17+d*.185,m=d<3?.48:.42,y=.92-d*.034,g=[[u*m,f],[u*y,f],[u*(y-.025),f+.08],[u*m,f+.08]];u<0&&g.reverse(),e.push({geometry:Qi(g,.025),position:[0,0,-.355]})}e.push(this.part("box",[0,4.57,-.35],[.72,.075,.055])),e.push(this.part("box",[0,4.75,-.28],[.42,.065,.05])),this.addGeometry("pharaohHoodStripes",e);let i=Qi([[-.31,3.45],[-.42,3.75],[-.42,4.18],[-.27,4.35],[.27,4.35],[.42,4.18],[.42,3.75],[.31,3.45],[0,3.3]],.34,.035);this.addGeometry("pharaohFace",[{geometry:i,position:[0,0,-.65]}]),this.addGeometry("pharaohNose",[{geometry:kn(.15,.09,.29,.17,.09),position:[0,3.76,-.74]}]),this.addGeometry("pharaohFeatures",[this.part("box",[-.215,4.065,-.706],[.205,.045,.024],[0,0,-.045]),this.part("box",[.215,4.065,-.706],[.205,.045,.024],[0,0,.045]),this.part("box",[0,3.63,-.71],[.25,.032,.025])]),this.addGeometry("pharaohBeard",[{geometry:kn(.16,.22,.43,.16,.19),position:[0,2.98,-.53]}]);let s=[{geometry:Qi([[-.48,1.9],[-.69,2.48],[-.65,2.87],[-.31,3.16],[.31,3.16],[.65,2.87],[.69,2.48],[.48,1.9]],.68,.045),position:[0,0,-.24]}];for(let u of[-1,1])s.push(this.part("cylinder",[u*.76,2.45,.09],[.22,.9,.22],[0,0,u*.22])),s.push(this.part("sphere",[u*.68,2.87,.07],[.26,.27,.26])),s.push(this.part("cylinder",[u*.68,2.04,-.35],[.19,.74,.19],[Math.PI/2,0,u*.54])),s.push(this.part("sphere",[u*.45,2,-.64],[.22,.14,.12])),s.push(this.part("box",[u*.36,.86,.02],[.42,.93,.49])),s.push(this.part("box",[u*.36,.43,-.16],[.48,.24,.77]));this.addGeometry("pharaohBody",s);let o=kn(1.48,1.03,.95,.95,.74);this.addGeometry("pharaohSkirt",[{geometry:o,position:[0,1.12,.04]}]),this.addGeometry("pharaohBelt",[this.part("box",[0,2.06,-.04],[1.08,.18,.86])]);let a=Qi([[-.64,2.84],[-.35,3.1],[-.25,2.88],[0,2.8],[.25,2.88],[.35,3.1],[.64,2.84],[.44,2.6],[0,2.46],[-.44,2.6]],.065,.01);this.addGeometry("pharaohCollar",[{geometry:a,position:[0,0,-.335]}]);let l=[];for(let u=-2;u<=2;u++)l.push(this.part("sphere",[u*.15,2.6+.11*Math.abs(u),-.37],[.052,.073,.027]));for(let u of[-1,1])l.push(this.part("cylinder",[u*.59,2.03,-.48],[.207,.14,.207],[Math.PI/2,0,u*.54]));this.addGeometry("pharaohJewels",l);let c=[];for(let u=-3;u<=3;u++)c.push(this.part("box",[u*.15,1.54,-.423],[.024,.72,.028],[0,0,-u*.04]));this.addGeometry("pharaohPleats",c),this.addGeometry("pharaohPlinth",[this.part("box",[0,.11,0],[2.5,.22,2]),this.part("box",[0,.28,0],[2.2,.12,1.76])]);let h=Qi([[-.065,4.34],[-.065,4.57],[-.13,4.68],[-.1,4.8],[0,4.88],[.1,4.8],[.13,4.68],[.065,4.57],[.065,4.34]],.07);this.addGeometry("pharaohCobra",[{geometry:h,position:[0,0,-.46]}])}createPharaoh(t=0){return this.model("pharaoh",[["pharaohPlinth","shade"],["pharaohBody","stone"],["pharaohHood","gold"],["pharaohHoodStripes","accent"],["pharaohFace","cream"],["pharaohNose","cream"],["pharaohFeatures","dark"],["pharaohBeard","indigo"],["pharaohCobra","gold"],["pharaohSkirt","cream"],["pharaohBelt","gold"],["pharaohCollar","gold"],["pharaohJewels","accent"],["pharaohPleats","shade"]],t)}buildObelisk(){this.addGeometry("obeliskBase",[this.part("box",[0,.16,0],[1.8,.32,1.8]),this.part("box",[0,.42,0],[1.46,.2,1.46])]),this.addGeometry("obeliskShaft",[{geometry:kn(1.13,.82,5.7),position:[0,.52,0]}]),this.addGeometry("obeliskCrown",[{geometry:kn(.82,0,.85),position:[0,6.22,0]}]);let t=[this.part("ring",[0,4.92,-.478],[.2,.35,.06]),this.part("box",[0,4.02,-.5],[.043,.38,.04]),this.part("box",[0,4.07,-.5],[.23,.04,.04]),this.part("ring",[0,4.27,-.5],[.085,.11,.05]),this.part("box",[0,3.36,-.52],[.22,.04,.04]),this.part("box",[0,3.22,-.52],[.15,.04,.04]),this.part("box",[0,3.08,-.52],[.22,.04,.04]),this.part("sphere",[0,2.55,-.53],[.12,.12,.025]),this.part("box",[0,2.02,-.55],[.19,.045,.045]),this.part("box",[0,1.86,-.55],[.13,.045,.045])];this.addGeometry("obeliskGlyphs",t),this.addGeometry("obeliskBorders",[this.part("box",[-.31,3.18,-.52],[.025,4,.025]),this.part("box",[.31,3.18,-.52],[.025,4,.025])])}createObelisk(t=0){return this.model("obelisk",[["obeliskBase","shade"],["obeliskShaft","cream"],["obeliskCrown","gold"],["obeliskGlyphs","accent"],["obeliskBorders","gold"]],t)}buildPalm(){let t=new ei([new I(0,.1,0),new I(.12,1.45,.04),new I(.27,3.1,.07),new I(.21,4.7,0)]),e=new Ii(t,10,.17,7,!1);this.addGeometry("palmTrunk",[{geometry:e}]),this.addGeometry("palmRoot",[this.part("cylinder",[0,.065,0],[.37,.13,.37])]);let i=[];for(let l=0;l<7;l++){let c=l/6,h=c*2.18,u=.3*Math.sin(c*Math.PI)-.95*c*c,d=.31*Math.sin(Math.PI*(.08+c*.92));i.push([h,u,-d],[h,u+d*.16,0],[h,u,d])}let n=[];for(let l=0;l<6;l++)for(let c of[0,1]){let h=l*3+c,u=(l+1)*3+c;for(let d of[h,u,u+1,h,u+1,h+1])n.push(...i[d]);for(let d of[h+1,u+1,u,h+1,u,h])n.push(...i[d])}let s=new de;s.setAttribute("position",new Ft(n,3)),s.computeVertexNormals();let o=[[],[]];for(let l=0;l<9;l++)o[l%2].push({geometry:s,position:[.21,4.66+l%2*.11,0],rotation:[0,l*Math.PI*2/9,0],scale:[.93+l%3*.065,1,1]});this.addGeometry("palmLeavesA",o[0]),this.addGeometry("palmLeavesB",o[1]);let a=[];for(let l=0;l<3;l++)a.push(this.part("sphere",[.21+Math.cos(l*2.1)*.17,4.5,Math.sin(l*2.1)*.17],[.11,.14,.11]));this.addGeometry("palmFruit",a)}createPalm(t=0){return this.model("palm",[["palmRoot","shade"],["palmTrunk","trunk"],["palmLeavesA","leaf"],["palmLeavesB","leafLight"],["palmFruit","gold"]],t)}buildTempleGate(){let t=Qi([[-1,.35],[1,.35],[.8,8.65],[-.8,8.65]],2,.025);this.addGeometry("gateStone",[{geometry:t,position:[-7.5,0,-1]},{geometry:t,position:[7.5,0,-1]},this.part("box",[-7.5,.17,0],[2.35,.34,2.5]),this.part("box",[7.5,.17,0],[2.35,.34,2.5]),this.part("box",[0,8.93,0],[17,1.36,2.04])]),this.addGeometry("gateCornice",[this.part("box",[0,9.75,0],[17.6,.34,2.42]),this.part("box",[0,10,0],[17.84,.16,2.62]),this.part("box",[0,8.4,-1.075],[17.1,.1,.12])]),this.addGeometry("gatePanels",[this.part("box",[-7.5,4.15,-1.055],[.74,5.7,.08]),this.part("box",[7.5,4.15,-1.055],[.74,5.7,.08]),this.part("box",[0,9.31,-1.074],[15.4,.1,.07])]);let e=Qi([[.33,9.04],[1.03,9.21],[2.55,9.29],[3.84,9.38],[3.34,9],[2.6,8.88],[1.25,8.84]],.065);this.addGeometry("gateWings",[{geometry:e,position:[0,0,-1.18]},{geometry:e,position:[0,0,-1.18],scale:[-1,1,1]}]),this.addGeometry("gateSunRing",[this.part("ring",[0,9.15,-1.23],[.49,.49,.49])]),this.addGeometry("gateSun",[this.part("sphere",[0,9.15,-1.25],[.405,.405,.095])]);let i=[],n=[];for(let s of[-1,1]){for(let a=0;a<6;a++)i.push(this.part("box",[s*(1.22+a*.37),9.04+a*.025,-1.23],[.042,.3-a*.023,.033],[0,0,s*.4]));let o=s*7.5;n.push(this.part("ring",[o,5.42,-1.11],[.17,.24,.07])),n.push(this.part("box",[o,4.95,-1.12],[.075,.63,.045])),n.push(this.part("box",[o,5.13,-1.12],[.4,.075,.045]));for(let a=0;a<3;a++)n.push(this.part("box",[o,3.4+a*.19,-1.12],[.4-a%2*.1,.055,.04]));n.push(this.part("sphere",[o,2.21,-1.12],[.17,.17,.032]))}this.addGeometry("gateFeathers",i),this.addGeometry("gateGlyphs",n)}createTempleGate(t=0){return this.model("temple-gate",[["gateStone","cream"],["gateCornice","stone"],["gatePanels","accent"],["gateWings","gold"],["gateSunRing","gold"],["gateSun","accent"],["gateFeathers","indigo"],["gateGlyphs","cream"]],t)}};function lh(r,t){let e=(r^Math.imul(t,73244475))>>>0;return()=>{e+=1831565813;let i=Math.imul(e^e>>>15,1|e);return i^=i+Math.imul(i^i>>>7,61|i),((i^i>>>14)>>>0)/4294967296}}function Ky(){if(typeof document>"u")return null;let r=document.createElement("canvas");r.width=512,r.height=2048;let t=r.getContext("2d"),e=r.width,i=r.height;t.fillStyle="#f7ead1",t.fillRect(0,0,e,i),t.strokeStyle="#deceb3",t.lineWidth=2;for(let o=0;o<=i;o+=128){t.beginPath(),t.moveTo(0,o),t.lineTo(e,o),t.stroke();for(let a=0;a<e;a+=128){let l=a+(o%256?64:0);t.beginPath(),t.moveTo(l,o),t.lineTo(l,o+128),t.stroke()}}for(let o of[10,502])t.fillStyle="#247f88",t.fillRect(o-3,0,6,i),t.fillStyle="#ddae55",t.fillRect(o+(o<256?8:-10),0,3,i);let n=[e*.215,e*.5,e*.785];t.lineWidth=3;for(let o=0;o<4;o++)for(let a of n){if(t.save(),t.translate(a,190+o*512),t.globalAlpha=.38,t.strokeStyle=o%2?"#398a8a":"#b89248",o%2===0){t.beginPath(),t.arc(0,0,13,0,Math.PI*2),t.stroke();for(let l of[-1,1])for(let c=0;c<3;c++)t.beginPath(),t.moveTo(l*17,-7+c*7),t.lineTo(l*49,-20+c*7),t.lineTo(l*35,9+c*4),t.stroke()}else{t.beginPath();for(let l=-2;l<=2;l++)t.moveTo(0,22),t.quadraticCurveTo(l*22,-4,l*13,-25),t.quadraticCurveTo(l*5,0,0,22);t.stroke()}t.restore()}let s=new un(r);return s.colorSpace=Ve,s.anisotropy=4,s}function jy(){if(typeof document>"u")return null;let r=document.createElement("canvas");r.width=128,r.height=256;let t=r.getContext("2d");t.fillStyle="#fff3da",t.fillRect(10,10,108,3),t.fillRect(10,239,108,3),t.strokeStyle="#fff3da",t.lineWidth=3,t.beginPath(),t.arc(64,87,21,0,Math.PI*2),t.stroke();for(let i of[-1,1])for(let n=0;n<3;n++)t.beginPath(),t.moveTo(64+i*26,78+n*8),t.lineTo(64+i*48,66+n*8),t.stroke();for(let i=0;i<3;i++)t.beginPath(),t.moveTo(32,156+i*16),t.lineTo(48,145+i*16),t.lineTo(64,156+i*16),t.lineTo(80,145+i*16),t.lineTo(96,156+i*16),t.stroke();let e=new un(r);return e.colorSpace=Ve,e.anisotropy=4,e}var Hn=class{constructor(t,e={}){this.scene=t,this.options=e,this.chunkLength=ot.WORLD.CHUNK_LENGTH,this.chunkCount=ot.WORLD.VISIBLE_CHUNKS,this.fixedSeed=e.seed,this.seed=this.fixedSeed??Math.floor(Math.random()*4294967295),this.chunks=[],this.nextChunkZ=-this.chunkLength,this.kit=this.createKit(),this.geometries=this.initGeometries(),this.materials=this.initMaterials(),this.instancePool=new Map,this.renderGroup=new Nt,this.renderGroup.name=`${e.theme?.id||"egypt"}StaticInstances`,this.scene.add(this.renderGroup),this.distantHorizonGroup=new Nt,this.scene.add(this.distantHorizonGroup),this.buildDistantScenery();for(let i=0;i<this.chunkCount;i++)this.spawnChunk();this.rebuildInstances()}createKit(){return new Xa}initMaterials(){let t=n=>new xt({color:n,roughness:.86}),e=jy(),i=n=>{let s=new xt({color:n,roughness:.92,side:Fe});return e&&(s.map=e,s.onBeforeCompile=o=>{o.fragmentShader=o.fragmentShader.replace("#include <map_fragment>",`vec4 ink = texture2D(map, vMapUv);
                        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.96, .90, .78), ink.a);`)},s.customProgramCacheKey=()=>"egypt-textile-ink"),s};return{sand:t(15650721),dune:t(15056518),road:new xt({color:16777215,map:Ky(),roughness:.84}),pavement:t(16114882),sleeper:t(12106669),rail:new xt({color:3302763,roughness:.5,metalness:.28}),teal:t(1478545),navy:t(2243947),gold:t(14988121),coral:t(15759448),stone:t(15915180),tealBanner:i(1478545),coralBanner:i(15696484)}}initGeometries(){let t=e=>new oi(e,this.chunkLength).rotateX(-Math.PI/2);return{sand:t(180),road:t(11.2),pavement:t(3.2),rail:new ee(.085,.14,this.chunkLength),sleeper:new ee(2.1,.08,.24),curb:new ee(.24,.2,this.chunkLength),stripe:new ee(.045,.025,this.chunkLength),box:new ee(1,1,1),banner:new oi(1,1.9,1,4),sphere:new ye(1,16,8)}}mesh(t,e,i,n,s=[1,1,1],o=!1){let a=new _t(e,i);return a.position.set(...n),a.scale.set(...s),a.castShadow=o,a.receiveShadow=o,t.add(a),a}buildDistantScenery(){let t=new ye(250,24,16),e=[],i=t.attributes.position,n=new Ot(16114887),s=new Ot(9556447);for(let l=0;l<i.count;l++){let c=n.clone().lerp(s,oe.smoothstep(i.getY(l)/250,0,.5));e.push(c.r,c.g,c.b)}t.setAttribute("color",new Ft(e,3));let o=new _t(t,new we({vertexColors:!0,side:ke,fog:!1,depthWrite:!1}));o.renderOrder=-20,this.distantHorizonGroup.add(o);let a=new Nt;for(let[l,c,h]of[[-53,182,3.2],[64,211,4],[-96,224,2.5]]){let u=this.kit.createPyramid(0);u.position.set(l,-.4,c),u.scale.setScalar(h),u.traverse(d=>{d.isMesh&&(d.castShadow=!1)}),a.add(u)}a.updateMatrixWorld(!0);for(let l of this.collectInstances([a]).values()){let c=new li(l.geometry,l.material,l.matrices.length);l.matrices.forEach((h,u)=>c.setMatrixAt(u,h)),c.instanceMatrix.needsUpdate=!0,c.computeBoundingSphere(),this.distantHorizonGroup.add(c)}}addProp(t,e,i,n,s,o={}){let a={pyramid:"createPyramid",pharaoh:"createPharaoh",obelisk:"createObelisk",palm:"createPalm",gate:"createTempleGate"}[e],l=this.kit[a](o.variant??Math.floor(s()*2)),c=o.x??i*(e==="pyramid"?17+s()*7:e==="palm"?10.5+s()*2:8.4+s()*2);l.position.set(c,0,n);let h=o.scale??(e==="pyramid"?.75+s()*.4:.85+s()*.2);l.scale.setScalar(h),l.rotation.y=o.rotation??(e==="pyramid"?(s()-.5)*.28:i*-.12),l.traverse(u=>{u.isMesh&&(u.castShadow=e==="gate",u.receiveShadow=!1)}),t.add(l),l.updateWorldMatrix(!0,!0),t.userData.decorations.push({type:e,side:i,bounds:new Ie().setFromObject(l)})}buildKiosk(t,e,i,n){let s=new Nt;s.position.set(e*10.4,0,i);let o=this.geometries.box,a=this.materials;this.mesh(s,o,a.stone,[0,.3,0],[3.2,.6,3]);for(let c of[-1.25,1.25])for(let h of[-1,1])this.mesh(s,o,a.gold,[c,1.7,h],[.13,2.8,.13]);let l=n()<.5?a.teal:a.coral;this.mesh(s,o,l,[0,3.1,0],[3.8,.16,3.5]);for(let c=0;c<5;c++)this.mesh(s,o,a.pavement,[0,3.19,(c-2)*.65],[3.75,.018,.16]);this.mesh(s,o,a.navy,[0,.95,-1.05],[2.8,.5,.2]),t.add(s),s.updateWorldMatrix(!0,!0),t.userData.decorations.push({type:"market",side:e,bounds:new Ie().setFromObject(s)})}spawnChunk(){let t=this.nextChunkZ,e=Math.round(t/this.chunkLength),i=lh(this.seed,e),n=new Nt;n.position.z=t,n.userData={startZ:t,endZ:t+this.chunkLength,index:e,decorations:[]};let s=this.materials,o=this.geometries,a=this.chunkLength/2;this.mesh(n,o.sand,s.sand,[0,-.07,a]);let l=this.mesh(n,o.road,s.road,[0,-.005,a]);l.receiveShadow=!0;for(let c of[-ot.LANE_WIDTH,0,ot.LANE_WIDTH]){for(let h of[-.72,.72])this.mesh(n,o.rail,s.rail,[c+h,.075,a]);for(let h=0;h<this.chunkLength/2;h++)this.mesh(n,o.sleeper,s.sleeper,[c,.012,h*2+1])}for(let c of[-1,1]){this.mesh(n,o.curb,s.stone,[c*5.7,.08,a]),this.mesh(n,o.stripe,s.teal,[c*5.55,.1,a]),this.mesh(n,o.pavement,s.pavement,[c*7.5,.04,a]),this.mesh(n,o.stripe,s.gold,[c*9.05,.055,a]);for(let f=0;f<4;f++){let m=4+f*12;this.mesh(n,o.box,s.navy,[c*6.1,.37,m],[.18,.72,.18]),this.mesh(n,o.box,s.gold,[c*6.1,.77,m],[.24,.12,.24])}let h=c<0?11:36;this.mesh(n,o.box,s.navy,[c*7.25,1.95,h],[.07,3.9,.07]),this.mesh(n,o.box,s.gold,[c*7.25,3.92,h],[1.25,.07,.07]),this.mesh(n,o.banner,e%2?s.coralBanner:s.tealBanner,[c*7.25,2.91,h]);let u=e===0?c<0?0:1:Math.floor(i()*4),d=c<0?0:7;u===0?(this.addProp(n,"pyramid",c,26+d+i()*6,i),this.addProp(n,"pharaoh",c,16+d,i,{x:c*8.1}),this.addProp(n,"palm",c,4+d,i,{x:c*10})):u===1?(this.addProp(n,"pharaoh",c,22+d,i,{x:c*8.1,scale:1.12}),this.addProp(n,"obelisk",c,8+d,i,{x:c*9.6}),this.addProp(n,"pyramid",c,37,i,{x:c*21,scale:.7})):u===2?(this.buildKiosk(n,c,24+d,i),this.addProp(n,"palm",c,6+d,i),this.addProp(n,"palm",c,37+i()*5,i,{x:c*12.5})):(this.addProp(n,"obelisk",c,27+d,i),this.addProp(n,"pyramid",c,21+d,i,{x:c*25,scale:1.05}));for(let f=0;f<2;f++)this.mesh(n,o.sphere,f?s.dune:s.sand,[c*(26+i()*24),-.35,i()*48],[6+i()*7,.7+i(),7+i()*8])}e%4===2&&this.addProp(n,"gate",0,20,i,{x:0,scale:1,rotation:0,variant:0}),this.chunks.push(n),this.nextChunkZ+=this.chunkLength}collectInstances(t){let e=new Map;for(let i of t)i.updateMatrixWorld(!0),i.traverse(n=>{if(!n.isMesh||!this.shouldInstance(n,i))return;let s=[n.geometry.uuid,n.material.uuid,+n.castShadow,+n.receiveShadow].join(":");e.has(s)||e.set(s,{geometry:n.geometry,material:n.material,castShadow:n.castShadow,receiveShadow:n.receiveShadow,matrices:[]}),e.get(s).matrices.push(n.matrixWorld.clone())});return e}shouldInstance(){return!0}rebuildInstances(){for(let t of this.instancePool.values())t.mesh.visible=!1;for(let[t,e]of this.collectInstances(this.chunks)){let i=this.instancePool.get(t);if(!i||i.capacity<e.matrices.length){i&&(this.renderGroup.remove(i.mesh),i.mesh.dispose());let s=2**Math.ceil(Math.log2(Math.max(e.matrices.length,1))),o=new li(e.geometry,e.material,s);o.instanceMatrix.setUsage(On),o.castShadow=e.castShadow,o.receiveShadow=e.receiveShadow,i={mesh:o,capacity:s},this.instancePool.set(t,i),this.renderGroup.add(o)}let n=i.mesh;n.visible=!0,n.count=e.matrices.length,e.matrices.forEach((s,o)=>n.setMatrixAt(o,s)),n.instanceMatrix.needsUpdate=!0,n.computeBoundingSphere()}}reset(){this.chunks=[],this.nextChunkZ=-this.chunkLength,this.seed=this.fixedSeed??Math.floor(Math.random()*4294967295),this.distantHorizonGroup.position.z=0;for(let t=0;t<this.chunkCount;t++)this.spawnChunk();this.rebuildInstances()}update(t){this.distantHorizonGroup.position.z=t;let e=!1;for(;this.chunks.length&&this.chunks[0].userData.endZ<t-35;)this.chunks.shift(),e=!0;for(this.chunks.length||(this.nextChunkZ=Math.floor((t-35)/this.chunkLength)*this.chunkLength);this.nextChunkZ<t+320;)this.spawnChunk(),e=!0;e&&this.rebuildInstances()}dispose(){let t=new Set,e=new Set,i=new Set,n=a=>{if(a.isMesh){t.add(a.geometry);for(let l of Array.isArray(a.material)?a.material:[a.material]){e.add(l);for(let c of Object.values(l))c?.isTexture&&i.add(c)}a.isInstancedMesh&&a.dispose()}};this.renderGroup.traverse(n),this.distantHorizonGroup.traverse(n);for(let a of[this.geometries])for(let l of Object.values(a||{}))t.add(l);for(let a of Object.values(this.materials)){e.add(a);for(let l of Object.values(a))l?.isTexture&&i.add(l)}let s=new Set([...Object.values(this.kit.geometries||{}),...Object.values(this.kit.unit||{})]),o=new Set(Object.values(this.kit.materials||{}));t.forEach(a=>{s.has(a)||a.dispose()}),e.forEach(a=>{o.has(a)||a.dispose()}),i.forEach(a=>a.dispose()),this.kit.dispose?.(),this.kit.dispose||(s.forEach(a=>a.dispose()),o.forEach(a=>a.dispose())),this.scene.remove(this.renderGroup,this.distantHorizonGroup),this.instancePool.clear(),this.chunks=[]}};var qa=class{constructor(t){this.scene=t,this._records=[],this._byGeometry=new Map,this._inverseSceneWorld=new Xt,this._instanceMatrix=new Xt}_recordFor(t){let e=this._byGeometry.get(t.geometry);e||(e=new Map,this._byGeometry.set(t.geometry,e));let i=e.get(t.material);return i||(i={geometry:t.geometry,material:t.material,sources:[],mesh:null,capacity:0},e.set(t.material,i),this._records.push(i)),i}_ensureCapacity(t,e){if(t.capacity>=e)return;let i=t.capacity||32;for(;i<e;)i*=2;t.mesh&&(this.scene.remove(t.mesh),t.mesh.dispose());let n=t.sources[0],s=new li(t.geometry,t.material,i);s.name=`coinBatch${this._records.indexOf(t)}`,s.instanceMatrix.setUsage(On),s.count=0,s.matrixAutoUpdate=!1,s.matrixWorldNeedsUpdate=!0,s.frustumCulled=!1,s.castShadow=n.castShadow,s.receiveShadow=n.receiveShadow,s.layers.mask=n.layers.mask,s.renderOrder=n.renderOrder,t.mesh=s,t.capacity=i,this.scene.add(s)}sync(t){for(let e of this._records)e.sources.length=0;this.scene.updateWorldMatrix(!0,!1),this._inverseSceneWorld.copy(this.scene.matrixWorld).invert();for(let e of t||[]){let i=e.mesh;if(!i)continue;for(let a of i.children)a.isMesh&&(a.visible=!1);if(e.collected||!i.parent||!i.visible)continue;let n=i.parent,s=!1,o=!0;for(;n;){if(n.visible||(o=!1),n===this.scene){s=!0;break}n=n.parent}if(!(!s||!o)){i.updateWorldMatrix(!0,!0);for(let a of i.children)a.isMesh&&this._recordFor(a).sources.push(a)}}for(let e of this._records){let i=e.sources.length;if(i===0){e.mesh&&(e.mesh.count=0);continue}this._ensureCapacity(e,i);for(let n=0;n<i;n++)this._instanceMatrix.multiplyMatrices(this._inverseSceneWorld,e.sources[n].matrixWorld),e.mesh.setMatrixAt(n,this._instanceMatrix);e.mesh.count=i,e.mesh.matrixWorldNeedsUpdate=!0,e.mesh.instanceMatrix.needsUpdate=!0}}clear(){for(let t of this._records)t.sources.length=0,t.mesh&&(t.mesh.count=0)}};var ch=new Xt,Xd=new Wt,Ya=new I,Za=new I,qd=new Xe,Yd=new $e,Zd=new I,$d=new I;function Qy(r){let t=[],e=[];for(let n of r){let s=n.geometry,o=s.index?s.toNonIndexed():s;Zd.set(...n.position||[0,0,0]),$d.set(...n.scale||[1,1,1]),Yd.set(...n.rotation||[0,0,0]),qd.setFromEuler(Yd),ch.compose(Zd,qd,$d),Xd.getNormalMatrix(ch);let a=o.getAttribute("position"),l=o.getAttribute("normal");for(let c=0;c<a.count;c++)Ya.fromBufferAttribute(a,c).applyMatrix4(ch),Za.fromBufferAttribute(l,c).applyMatrix3(Xd).normalize(),t.push(Ya.x,Ya.y,Ya.z),e.push(Za.x,Za.y,Za.z);o!==s&&o.dispose()}let i=new de;return i.setAttribute("position",new Ft(t,3)),i.setAttribute("normal",new Ft(e,3)),i.computeBoundingBox(),i.computeBoundingSphere(),i}function hh(r,t,e=0){let i=new Pe;r.forEach(([s,o],a)=>a?i.lineTo(s,o):i.moveTo(s,o)),i.closePath();let n=new qe(i,{depth:t,bevelEnabled:e>0,bevelThickness:e,bevelSize:e,bevelSegments:1,steps:1,curveSegments:6});return n.computeVertexNormals(),n}function Jd(r){return new Ci(r.map(([t,e])=>new at(t,e)),20)}var $a=class{constructor(){let t=(e,i=.8,n=0)=>new xt({color:e,roughness:i,metalness:n});this.materials={cream:t(16774363),white:t(16448498),mint:t(7913387),coral:t(15697775),butter:t(15518577),matcha:t(8297569),caramel:t(13144671),tea:t(11104840),cocoa:t(5850683),ink:t(3887949),silver:t(13358284,.52,.15),glass:t(11982272,.35),berry:t(12021364)},this.unit={box:new ee(1,1,1),sphere:new ye(1,12,8),cylinder:new ue(1,1,1,12),ring:new Le(1,.095,5,20)},this.geometries={},this.buildStore(),this.buildTea()}part(t,e,i,n){return{geometry:this.unit[t],position:e,scale:i,rotation:n}}cache(t,e){this.geometries[t]=Qy(e);let i=new Set(Object.values(this.unit));for(let n of new Set(e.map(s=>s.geometry)))i.has(n)||n.dispose()}mesh(t,e,i,n,s,o){let a=new _t(typeof e=="string"?this.unit[e]:e,typeof i=="string"?this.materials[i]:i);return n&&a.position.set(...n),s&&a.scale.set(...s),o&&a.rotation.set(...o),a.receiveShadow=!0,a.castShadow=!1,t.add(a),a}accent(t,e){let i=(Math.floor(e)%3+3)%3;return this.materials[t.startsWith("tea")||["pearlIsland","strawGate"].includes(t)?["matcha","caramel","berry"][i]:["mint","coral","butter"][i]]}buildStore(){let t=[this.part("box",[0,.2,0],[5,.4,3]),this.part("box",[0,4.4,1.3],[4.5,8.3,.18]),this.part("box",[-2.3,4.5,0],[.4,8.6,3]),this.part("box",[2.3,4.5,0],[.4,8.6,3]),this.part("box",[0,8.75,0],[5,.5,3])],e=[this.part("box",[0,8.72,-1.54],[4.2,.29,.08])];for(let a=0;a<4;a++){let l=.52+a*1.92;t.push(this.part("box",[0,l,0],[4.3,.16,2.8])),e.push(this.part("box",[0,l,-1.48],[4.3,.14,.1]))}this.cache("storeShelfBody",t),this.cache("storeShelfTrim",e),this.cache("milkCartonBody",[{geometry:hh([[-1.95,.04],[1.95,.04],[1.95,6.5],[.82,7.72],[.82,7.96],[-.82,7.96],[-.82,7.72],[-1.95,6.5]],2.9,.04),position:[0,0,-1.45]}]);let i=[this.part("box",[0,.65,-.015],[4.02,.85,3.03]),this.part("box",[0,7.9,0],[1.72,.16,2.98]),this.part("box",[0,4.15,-1.54],[2.95,3.8,.055])];this.cache("milkCartonTrim",i),this.cache("snackBagBody",[{geometry:hh([[-1.5,.025],[1.5,.025],[1.84,.45],[1.98,1.45],[1.84,4.87],[1.98,5.83],[1.52,5.98],[-1.52,5.98],[-1.98,5.83],[-1.84,4.87],[-1.98,1.45],[-1.84,.45]],1.66,.025),position:[0,0,-.83]}]);let n=[this.part("box",[0,3.22,-.886],[2.8,2.25,.075]),this.part("box",[0,.24,0],[3.12,.24,1.76]),this.part("box",[0,5.85,0],[3.85,.18,1.76])];for(let a=-6;a<=6;a++)n.push(this.part("box",[a*.26,5.83,-.905],[.035,.26,.035]));this.cache("snackBagTrim",n),this.cache("fridgeBody",[this.part("box",[0,.3,0],[5,.6,3.25]),this.part("box",[0,5,1.35],[4.8,9.6,.4]),this.part("box",[-2.35,5,0],[.3,9.7,3.25]),this.part("box",[2.35,5,0],[.3,9.7,3.25]),this.part("box",[0,9.6,0],[5,.8,3.25])]);let s=[this.part("box",[0,9.58,-1.68],[4.5,.45,.08]),this.part("box",[0,4.8,-1.65],[.09,8.5,.1])];for(let a of[-2.18,2.18])s.push(this.part("box",[a,4.8,-1.65],[.1,8.5,.1]));for(let a of[.66,8.95])s.push(this.part("box",[0,a,-1.65],[4.46,.1,.1]));this.cache("fridgeTrim",s),this.cache("receiptGateBody",[this.part("box",[-7,4.65,0],[1.1,9.3,1.5]),this.part("box",[7,4.65,0],[1.1,9.3,1.5]),this.part("box",[0,9.36,0],[15.1,1.02,1.5])]);let o=[];for(let a of[-1,1]){o.push(this.part("box",[a*7,.35,0],[1.15,.7,1.55]));for(let l=0;l<12;l++)o.push(this.part("box",[a*7,1.2+l*.55,-.77],[.58-l%3*.1,.045,.04]))}o.push(this.part("box",[0,9.35,-.78],[9.4,.64,.06])),this.cache("receiptGateTrim",o)}buildTea(){this.cache("teaCupBody",[{geometry:Jd([[0,0],[1.88,0],[2,.25],[2.8,5.7],[2.8,6],[0,6]])}]);let t=[this.part("cylinder",[0,6.13,0],[3,.25,3]),this.part("ring",[0,5.96,0],[2.79,2.79,2.79],[Math.PI/2,0,0]),this.part("box",[0,3.3,-2.46],[2.65,2.4,.07],[-.145,0,0]),this.part("cylinder",[.68,7.1,0],[.18,1.8,.18],[0,0,-.16])];this.cache("teaCupTrim",t);let e=new ei([new I(1.42,2.42,0),new I(2.23,2.62,0),new I(2.7,3.39,0),new I(2.72,4.09,0)]);this.cache("teapotBody",[this.part("sphere",[0,2.68,0],[1.82,2.31,1.57]),this.part("cylinder",[0,.3,0],[1.52,.6,1.28]),{geometry:new Ii(e,9,.3,7,!1)},this.part("ring",[-1.86,3,0],[.99,1.56,1.02])]),this.cache("teapotTrim",[this.part("sphere",[0,4.91,0],[1.18,.3,1.01]),this.part("sphere",[0,5.48,0],[.27,.47,.27]),this.part("ring",[0,4.8,0],[1.1,.9,1.1],[Math.PI/2,0,0]),this.part("cylinder",[2.73,4.09,0],[.32,.1,.32]),this.part("sphere",[0,2.9,-1.565],[.65,.67,.035])]),this.cache("pearlIslandBody",[this.part("sphere",[0,.6,0],[3,.6,2.55]),this.part("cylinder",[0,.7,0],[2.4,.78,2.12])]);let i=[];for(let a=0;a<9;a++){let l=a*Math.PI*2/9;i.push(this.part("sphere",[Math.cos(l)*2.16,1.09,Math.sin(l)*1.7],[.39,.38,.39]))}i.push(this.part("cylinder",[-.78,1.96,.45],[.11,1.92,.11],[0,0,-.13])),i.push(this.part("box",[-.92,2.56,.45],[1.66,.55,.11],[0,0,.04])),this.cache("pearlIslandTrim",i);let n=[],s=[];for(let a of[-1,1]){n.push(this.part("cylinder",[a*7,4.6,0],[.5,9.2,.5])),n.push(this.part("sphere",[a*7,9.13,0],[.51,.51,.51]));for(let l=0;l<8;l++)s.push(this.part("cylinder",[a*7,1.12+l*1.02,0],[.508,.31,.508]));s.push(this.part("cylinder",[a*7,.18,0],[.57,.36,.57]))}n.push(this.part("cylinder",[0,9.13,0],[.5,14,.5],[0,0,Math.PI/2]));for(let a=-6;a<=6;a++)s.push(this.part("cylinder",[a*1.02,9.13,0],[.508,.31,.508],[0,0,Math.PI/2]));this.cache("strawGateBody",n),this.cache("strawGateTrim",s),this.cache("teaBoatBody",[{geometry:Jd([[0,0],[.6,0],[1,.35],[1.45,1.26],[1.48,1.44],[0,1.44]]),scale:[1.69,1,2.45]},this.part("box",[0,1.4,0],[4.25,.14,5.38])]);let o=[this.part("ring",[0,1.45,0],[2.42,3.5,1],[Math.PI/2,0,0]),this.part("cylinder",[0,1.94,.45],[.075,2.08,.075])];o.push({geometry:hh([[.12,1.84],[.12,2.98],[1.53,1.91]],.05),position:[0,0,.43]}),this.cache("teaBoatTrim",o)}create(t,e=0){if(!["storeShelf","milkCarton","snackBag","fridge","receiptGate","teaCup","teapot","pearlIsland","strawGate","teaBoat"].includes(t))throw new Error(`Unknown everyday prop: ${t}`);let n=new Nt;n.name=t,n.userData.propType=t,n.userData.variant=e;let s=this.accent(t,e),o={snackBag:s,teaCup:"cream",teapot:"cream",pearlIsland:"caramel",strawGate:"cream",teaBoat:"tea"}[t]||"white";this.mesh(n,this.geometries[`${t}Body`],o);let a={snackBag:"cream",pearlIsland:"cocoa",teaBoat:"cream"}[t]||s;if(this.mesh(n,this.geometries[`${t}Trim`],a),(t==="storeShelf"||t==="fridge")&&this.stock(n,t,e),t==="milkCarton"&&(this.mesh(n,"sphere","white",[0,4.4,-1.6],[.61,.78,.035]),this.mesh(n,"sphere","white",[0,5.06,-1.6],[.26,.37,.035]),this.mesh(n,"box","white",[0,2.78,-1.6],[1.58,.16,.035]),this.mesh(n,"box","white",[0,2.4,-1.6],[1.1,.1,.035]),this.mesh(n,"cylinder","white",[.77,7.2,-.25],[.32,.22,.32],[0,0,-.73])),t==="snackBag"){for(let l=0;l<3;l++)this.mesh(n,"sphere","caramel",[-.76+l*.69,3.34+l%2*.3,-.95],[.41,.53,.03],[0,0,-.2+l*.19]),this.mesh(n,"ring","white",[-.76+l*.69,3.34+l%2*.3,-.98],[.29,.41,.2],[0,0,-.2+l*.19]);this.mesh(n,"box","ink",[0,1.79,-.885],[2.1,.11,.035])}if(t==="receiptGate"){for(let l=-4;l<=4;l++)this.mesh(n,"box","white",[l*.55,9.34,-.827],[.17+(l%2?.08:0),.34,.025]);for(let l of[-1,1])for(let c=-4;c<=4;c++)this.mesh(n,"box","ink",[l*7+c*.07,7.85,-.8],[.03+(c%2?.013:0),.45,.025])}if(t==="teaCup"){for(let l=0;l<5;l++){let c=Math.PI*1.15+l*.18;this.mesh(n,"sphere","cocoa",[Math.cos(c)*2.09,.84+l%2*.28,Math.sin(c)*2.09],[.25,.26,.11])}this.mesh(n,"sphere","cream",[0,3.45,-2.71],[.67,.67,.035]),this.mesh(n,"sphere",s,[0,3.52,-2.755],[.34,.41,.022]),this.mesh(n,"box","cream",[0,2.62,-2.58],[1.55,.13,.045])}if(t==="teapot"&&(this.mesh(n,"sphere","matcha",[0,2.92,-1.63],[.26,.43,.035],[0,0,-.4]),this.mesh(n,"sphere","matcha",[.28,2.88,-1.63],[.17,.3,.035],[0,0,.45]),this.mesh(n,"cylinder","cocoa",[2.73,4.157,0],[.22,.035,.22])),t==="pearlIsland"&&(this.mesh(n,"cylinder","cream",[.3,1.3,-.18],[1.24,.4,1.12]),this.mesh(n,"ring",s,[.3,1.52,-.18],[1.05,1,1],[Math.PI/2,0,0]),this.mesh(n,"box","cream",[-.91,2.56,.375],[1.13,.07,.04],[0,0,.04])),t==="teaBoat"){for(let l=-1;l<=1;l++)this.mesh(n,"sphere","cocoa",[l*.8,1.72,-1.3],[.38,.35,.38]);this.mesh(n,"box",s,[-.7,1.72,1.43],[1.3,.58,1.04]),this.mesh(n,"box","cream",[-.7,2.07,1.43],[1.35,.1,1.08])}return n}stock(t,e,i){let n=e==="fridge",s=4,o=[this.materials.mint,this.materials.coral,this.materials.butter];for(let a=0;a<s;a++){let l=n?.93+a*1.93:.75+a*1.92;n&&this.mesh(t,"box","white",[0,l-.18,-.05],[4.35,.1,2.8]);for(let c=0;c<4;c++){let h=-1.56+c*1.04,u=o[((a+c+Math.floor(i))%3+3)%3];(a+c)%2===0?(this.mesh(t,"box",u,[h,l+.57,-.15],[.7,1.12,1.16]),this.mesh(t,"box","white",[h,l+.57,-.745],[.45,.35,.025]),this.mesh(t,"box","cream",[h,l+1.16,-.15],[.71,.12,1.15])):(this.mesh(t,"cylinder",u,[h,l+.51,-.16],[.34,1.03,.34]),this.mesh(t,"cylinder","white",[h,l+1.07,-.16],[.27,.14,.27]),this.mesh(t,"box","cream",[h,l+.52,-.51],[.41,.28,.035]))}}if(n)for(let a of[-1.1,1.1])this.mesh(t,"box","glass",[a,4.8,1.105],[2.01,7.98,.03]),this.mesh(t,"box","silver",[a>0?.26:-.26,5,-1.78],[.1,1.15,.17]);else for(let a=-3;a<=3;a++)this.mesh(t,"box","white",[a*.5,8.71,-1.596],[.28,.08,.03])}dispose(){for(let t of new Set([...Object.values(this.geometries),...Object.values(this.unit)]))t.dispose();for(let t of Object.values(this.materials))t.dispose()}};var Ja=new Xt,Kd=new Wt,jd=new $e,Qd=new Xe,Rs=new I,tf=new I,Ka=new I;function t_(r){let t=[],e=[];for(let n of r){let s=n.geometry,o=s.index?s.toNonIndexed():s;jd.set(...n.rotation||[0,0,0]),Qd.setFromEuler(jd),Rs.set(...n.position||[0,0,0]),tf.set(...n.scale||[1,1,1]),Ja.compose(Rs,Qd,tf),Kd.getNormalMatrix(Ja);let a=o.getAttribute("position"),l=o.getAttribute("normal"),c=Ja.determinant()<0;for(let h=0;h<a.count;h++){let u=h%3,d=c?h-u+(u===0?0:3-u):h;Rs.fromBufferAttribute(a,d).applyMatrix4(Ja),Ka.fromBufferAttribute(l,d).applyMatrix3(Kd).normalize(),t.push(Rs.x,Rs.y,Rs.z),e.push(Ka.x,Ka.y,Ka.z)}o!==s&&o.dispose()}let i=new de;return i.setAttribute("position",new Ft(t,3)),i.setAttribute("normal",new Ft(e,3)),i.computeBoundingBox(),i.computeBoundingSphere(),i}function ja(r,t=.16,e=.02){let i=new Pe;return r.forEach(([n,s],o)=>o?i.lineTo(n,s):i.moveTo(n,s)),i.closePath(),new qe(i,{depth:t,bevelEnabled:e>0,bevelSize:e,bevelThickness:e,bevelSegments:1,steps:1,curveSegments:12})}function e_(){let r=[],t=[],e=[];r.push([.07,.1,-.1]);for(let s=0;s<=28;s++){let o=-.98+s/28*(Math.PI*2-.52),a=1+.055*Math.sin(s*2.25);r.push([Math.cos(o)*a,.14+.035*Math.sin(s*1.7),Math.sin(o)*a])}r.push([-.07,.1,-.1]),t.push(0,.17,0,0,-.09,0);for(let[s,o,a]of r)t.push(s,o,a,s,o-.12,a);for(let s=0;s<r.length;s++){let o=2+s*2,a=2+(s+1)%r.length*2;e.push(0,a,o,1,o+1,a+1,o,a,a+1,o,a+1,o+1)}let n=new de;return n.setAttribute("position",new Ft(t,3)),n.setIndex(e),n.computeVertexNormals(),n}function i_(){let r=[[0,0],[-.28,.25],[-.43,.64],[-.3,1.04],[0,1.52],[.3,1.04],[.43,.64],[.28,.25]],t=[0,.15,.64,0,-.07,.64];for(let[n,s]of r)t.push(n,.045+s*s*.23,s,n,-.075+s*s*.23,s);let e=[];for(let n=0;n<r.length;n++){let s=2+n*2,o=2+(n+1)%r.length*2;e.push(0,s,o,1,o+1,s+1,s,s+1,o+1,s,o+1,o)}let i=new de;return i.setAttribute("position",new Ft(t,3)),i.setIndex(e),i.computeVertexNormals(),i}function n_(){let r=[],t=[];for(let a=0;a<2;a++)for(let l=0;l<=5;l++)for(let c=0;c<=10;c++){let h=c/10,u=l/5;r.push(h-.5,u+(1-u)*(.04+.025*Math.cos(h*Math.PI*6)),Math.sin(h*Math.PI*6)*.07*(1-u*.75)+Math.sin(u*Math.PI)*.05+a*.025)}let n=66;for(let a=0;a<5;a++)for(let l=0;l<10;l++){let c=a*11+l,h=c+1,u=c+10+1,d=u+1;t.push(c,u,h,h,u,d,c+n,h+n,u+n,h+n,d+n,u+n)}let s=[];for(let a=0;a<10;a++)s.push([a,a+1],[55+a+1,55+a]);for(let a=0;a<5;a++)s.push([(a+1)*11,a*11],[a*11+10,(a+1)*11+10]);for(let[a,l]of s)t.push(a,l,l+n,a,l+n,a+n);let o=new de;return o.setAttribute("position",new Ft(r,3)),o.setIndex(t),o.computeVertexNormals(),o}var ef={lotus:[["lotusLeaf","leaf"],["lotusFlower","flowerAccent"]],speakerStage:[["stageBody","plum"],["stageDrivers","ink"],["stageTrim","apricot"]],reedCluster:[["reedStalks","reed"],["reedLeaves","leafLight"]],festivalTent:[["tentCloth","festivalAccent"],["tentStructure","oat"]],leafGate:[["leafGateFrame","leaf"],["leafGateLights","apricot"]],washer:[["washerShell","oat"],["washerCavity","ink"],["washerDetails","sage"]],laundryBasket:[["basketWeave","wicker"],["basketClothes","laundryAccent"]],hangingClothes:[["clothesFrame","oat"],["clothesFabric","laundryAccent"]],cloudIsland:[["islandCloud","cloud"],["islandTop","sage"]],clothGate:[["clothGateFrame","sage"],["clothGateFabric","laundryAccent"]]},Qa=class{constructor(){let t=(e,i=.84,n=0)=>new xt({color:e,roughness:i,metalness:n});this.materials={leaf:t(2713679),leafLight:t(6069353),reed:t(8292704),plum:t(6901860),ink:t(3423036),apricot:t(16042638,.67),oat:t(16052195,.65),sage:t(9614240,.72),cloud:t(14736594),wicker:t(11901042),coral:t(15241344),rose:t(15250866),cream:t(16769704)},this.geometries={},this.sources={box:new ee(1,1,1),ball:new ye(1,12,8),rod:new ue(1,1,1,10),ring:new Le(1,.09,5,24),petal:i_(),lily:e_(),cloth:n_(),shirt:ja([[-.39,0],[.39,0],[.41,.86],[.68,.77],[.87,1.12],[.4,1.42],[.18,1.47],[.13,1.33],[-.13,1.33],[-.18,1.47],[-.4,1.42],[-.87,1.12],[-.68,.77],[-.41,.86]],.08,.015),sock:ja([[-.2,0],[.27,0],[.39,.12],[.35,.33],[.15,.41],[.13,1.15],[-.21,1.15]],.12,.018)},this.buildLotus(),this.buildStage(),this.buildReeds(),this.buildTent(),this.buildLeafGate(),this.buildWasher(),this.buildBasket(),this.buildClothes(),this.buildIsland(),this.buildClothGate();for(let[e,i]of Object.entries(ef)){let n=i.map(([o])=>this.geometries[o]);if(e==="reedCluster")for(let o of n)o.scale(.66,1,1);let s=Math.min(...n.map(o=>(o.computeBoundingBox(),o.boundingBox.min.y)));for(let o of n)o.translate(0,-s,0),o.computeBoundingBox(),o.computeBoundingSphere()}for(let e of Object.values(this.sources))e.dispose();this.sources={}}part(t,e,i=[1,1,1],n=[0,0,0]){return{geometry:this.sources[t],position:e,scale:i,rotation:n}}add(t,e){this.geometries[t]=t_(e)}accent(t,e){let i=(Math.floor(e)%3+3)%3,n={flowerAccent:["rose","cream","coral"],festivalAccent:["coral","rose","sage"],laundryAccent:["coral","sage","rose"]};return this.materials[n[t]?.[i]||t]}create(t,e=0){let i=ef[t];if(!i)throw new Error(`Unknown dream prop: ${t}`);let n=new Nt;n.name=`dream-${t}`,n.userData.dreamProp=t,n.userData.variant=e;for(let[s,o]of i){let a=new _t(this.geometries[s],this.accent(o,e));a.name=s,a.receiveShadow=!0,a.castShadow=!1,n.add(a)}return n}buildLotus(){let t=[this.part("lily",[0,.39,.15],[2.33,1.2,2.14]),this.part("rod",[.43,.9,-.15],[.11,1.35,.11],[0,0,-.13]),this.part("lily",[-1.3,.31,.56],[1.05,.8,.86],[0,.6,.14])];for(let i=0;i<9;i++)t.push(this.part("petal",[0,.64,.16],[.025,.02,1.32],[0,i*Math.PI*2/9,0]));this.add("lotusLeaf",t);let e=[];for(let i=0;i<9;i++)e.push(this.part("petal",[.43,1.42,-.15],[1.06,1.1,.91],[0,i*Math.PI*2/9,0]));for(let i=0;i<6;i++)e.push(this.part("petal",[.43,1.58,-.15],[.76,1.8,.61],[-.27,i*Math.PI/3+.22,0]));e.push(this.part("ball",[.43,1.85,-.15],[.28,.24,.28])),this.add("lotusFlower",e)}buildStage(){let t=ja([[-.5,-.5],[.5,-.5],[.5,.43],[.43,.5],[-.43,.5],[-.5,.43]],1,.02),e=[this.part("box",[0,.3,0],[6,.6,3.3]),this.part("box",[0,.71,-.54],[3.2,.22,1.7])];for(let s of[-1,1])e.push({geometry:t,position:[s*2.15,3.5,-.85],scale:[1.51,5.6,1.67]});this.add("stageBody",e),t.dispose();let i=[],n=[];for(let s of[-1,1]){let o=s*2.15;for(let[a,l]of[[2.12,.53],[3.54,.53],[5.01,.34]])i.push(this.part("rod",[o,a,-.943],[l,.1,l],[Math.PI/2,0,0])),i.push(this.part("ball",[o,a,-1.02],[l*.33,l*.33,.12])),n.push(this.part("ring",[o,a,-1.02],[l,l,.6]));for(let a=0;a<5;a++)i.push(this.part("box",[o,5.64+a*.085,-.94],[.93,.026,.04]));n.push(this.part("box",[o,6.33,.15],[1.67,.12,1.97]))}n.push(this.part("box",[0,.67,-1.61],[5.6,.09,.1])),n.push(this.part("rod",[.38,1.65,-.55],[.045,1.62,.045],[0,0,-.17])),n.push(this.part("ball",[.23,2.47,-.55],[.14,.21,.14])),n.push(this.part("box",[0,6.65,.15],[5.87,.24,.26]));for(let s=0;s<11;s++)n.push(this.part("ball",[-2.6+s*.52,6.94-.2*Math.sin(s/10*Math.PI),.14],[.105,.105,.105]));this.add("stageDrivers",i),this.add("stageTrim",n)}buildReeds(){let t=[],e=[];for(let i=0;i<9;i++){let n=-1.5+i%4*.9,s=-.7+Math.floor(i/4)*.55,o=2.95+i%3*.76,a=.07*Math.sin(i*2.8);t.push(this.part("rod",[n,o/2,s],[.045,o,.045],[0,0,a])),t.push(this.part("ball",[n-o/2*Math.sin(a),o+.12,s],[.13,.35,.13]));for(let l=0;l<2;l++)e.push(this.part("petal",[n,.55+l*.85,s],[.27,1.7,1.11],[-.65,i*1.8+l*2.8,.14]))}this.add("reedStalks",t),this.add("reedLeaves",e)}buildTent(){let t=ja([[-3,0],[-2.65,.47],[0,1.9],[2.65,.47],[3,0]],3.7,.02),e=[{geometry:t,position:[0,3.8,-1.85]}],i=[];for(let n of[-1,1])for(let s of[-1.45,1.45])i.push(this.part("rod",[n*2.5,2.05,s],[.11,4.1,.11]));i.push(this.part("box",[0,3.84,-1.86],[5.75,.14,.18])),i.push(this.part("box",[0,1.5,1.1],[4.9,.14,.85]));for(let n=0;n<6;n++)e.push(this.part("cloth",[-2.5+n,3.1,-1.9],[.9,.67,.65])),i.push(this.part("ball",[-2.5+n,3.46,-1.91],[.07,.09,.07]));i.push(this.part("rod",[0,5.52,0],[.07,.85,.07])),e.push(this.part("petal",[0,5.6,0],[.6,.3,.5],[-Math.PI/2,0,-.12])),this.add("tentCloth",e),this.add("tentStructure",i),t.dispose()}buildLeafGate(){let t=[],e=[];for(let i of[-1,1]){t.push(this.part("rod",[i*7.5,4.6,0],[.24,9.2,.24],[0,0,-i*.025])),t.push(this.part("lily",[i*7.5,.15,0],[1.03,.8,1.03]));for(let n=0;n<4;n++)t.push(this.part("petal",[i*7.56,3+n*1.34,0],[.77,.45,1.1],[0,i*(Math.PI/2+(n%2?.16:-.16)),-i*.11]))}t.push(this.part("rod",[0,9.29,0],[.12,15,.12],[0,0,Math.PI/2]));for(let i=0;i<9;i++){let n=-6+i*1.5,s=9.35+.12*Math.cos(i*.6);t.push(this.part("petal",[n,s,.25],[1.15,.3,1.12],[0,i%2?-.65:.65,0])),e.push(this.part("rod",[n,8.86,-.18],[.022,.64,.022])),e.push(this.part("ball",[n,8.43,-.18],[.15,.18,.15]))}this.add("leafGateFrame",t),this.add("leafGateLights",e)}buildWasher(){let t=new Pe;t.moveTo(-2.68,.6),t.lineTo(2.68,.6),t.lineTo(2.68,6.2),t.lineTo(-2.68,6.2),t.closePath();let e=new Ki;e.absarc(0,3.24,1.82,0,Math.PI*2,!0),t.holes.push(e);let i=new qe(t,{depth:.18,bevelEnabled:!0,bevelSize:.08,bevelThickness:.05,bevelSegments:1,curveSegments:24}),n=[{geometry:i,position:[0,0,-1.67]},this.part("box",[0,.23,0],[6,.46,3.7]),this.part("box",[0,7.45,0],[5.94,1.08,3.68]),this.part("box",[0,6.46,.12],[5.66,.88,3.28]),this.part("box",[-2.84,3.7,.14],[.27,6.42,3.26]),this.part("box",[2.84,3.7,.14],[.27,6.42,3.26]),this.part("box",[0,3.56,1.78],[5.68,6.52,.17]),this.part("ring",[0,3.24,-1.84],[1.82,1.82,1.7])];this.add("washerShell",n),i.dispose();let s=[this.part("rod",[0,3.24,-.23],[1.82,.2,1.82],[Math.PI/2,0,0]),this.part("ring",[0,3.24,-1.66],[1.67,1.67,1.3]),this.part("box",[-.94,7.45,-1.855],[2.3,.34,.03])];for(let a=0;a<8;a++)s.push(this.part("box",[-2.16+a*.22,.74,-1.7],[.09,.19,.03]));this.add("washerCavity",s);let o=[this.part("rod",[1.18,7.43,-1.91],[.38,.2,.38],[Math.PI/2,0,0]),this.part("box",[1.18,7.58,-2.02],[.06,.2,.08]),this.part("box",[2,7.44,-1.92],[.28,.17,.1]),this.part("box",[0,6.64,-1.6],[5.56,.24,.17]),this.part("box",[1.82,3.28,-1.92],[.18,.88,.22])];for(let a=0;a<6;a++){let l=a/6*Math.PI*2;o.push(this.part("box",[Math.cos(l)*1.52,3.24+Math.sin(l)*1.52,-.65],[.11,.35,.66],[0,0,l-Math.PI/2]))}for(let a=0;a<8;a++)o.push(this.part("box",[-1.9+a*.25,7.44,-1.895],[.11,.085+a%3*.045,.03]));this.add("washerDetails",o)}buildBasket(){let t=[this.part("box",[0,.15,0],[4.67,.3,3.75])];for(let e=0;e<7;e++){let i=.53+e*.5,n=2.15+i*.12,s=1.66+i*.1;for(let o of[-1,1])t.push(this.part("box",[0,i,o*s],[n*2,.13,.13])),t.push(this.part("box",[o*n,i,0],[.13,.13,s*2]))}for(let e of[-1,1])for(let i=0;i<7;i++){let n=-2.11+i*.7;t.push(this.part("rod",[n*1.08,1.95,e*1.93],[.07,3.6,.07],[e*.1,0,-n*.035]))}for(let e of[-1,1])t.push(this.part("ring",[e*2.62,3.2,0],[.64,.54,.64],[0,Math.PI/2,0])),t.push(this.part("box",[0,3.78,e*2.08],[5.42,.2,.2])),t.push(this.part("box",[e*2.61,3.78,0],[.2,.2,4.16]));this.add("basketWeave",t),this.add("basketClothes",[this.part("ball",[-.76,3.4,.32],[1.48,.81,1.4]),this.part("ball",[.86,3.78,.2],[1.18,.76,1.42]),this.part("cloth",[.16,2.1,-2.16],[1.9,2.05,1],[0,0,-.1]),this.part("sock",[1.8,3.34,-.62],[1.32,1.22,1],[0,0,.3])])}buildClothes(){let t=[this.part("rod",[-2.75,4.87,0],[.13,9.74,.13]),this.part("rod",[2.75,4.87,0],[.13,9.74,.13]),this.part("rod",[0,9.32,0],[.085,5.55,.085],[0,0,Math.PI/2])];for(let e of[-1,1])t.push(this.part("box",[e*2.75,.11,0],[.65,.22,1.6]));for(let e of[-1.84,-.45,1.2,1.86])t.push(this.part("box",[e,9.24,-.02],[.13,.38,.16],[0,0,e>0?-.12:.08])),t.push(this.part("ring",[e,9.29,-.12],[.075,.075,.4]));this.add("clothesFrame",t),this.add("clothesFabric",[this.part("shirt",[-1.1,6.67,-.03],[1.42,1.72,.7],[0,0,-.04]),this.part("cloth",[1.5,5.82,-.05],[1.47,3.38,1.3]),this.part("sock",[.12,7.87,-.17],[1.15,1.18,1],[0,0,.1])])}buildIsland(){let t=[this.part("ball",[0,1.25,.15],[3.48,1.25,2.36])],e=[[-2.3,1.18,-.73,1.13],[-1.02,1.54,-1.17,1.23],[.6,1.54,-1.21,1.37],[2.23,1.11,-.67,1.06],[-2.45,1.13,.75,.95],[2.32,1.14,.96,.91]];for(let[i,n,s,o]of e)t.push(this.part("ball",[i,n,s],[o,o*.73,o]));this.add("islandCloud",t),this.add("islandTop",[this.part("lily",[0,2.53,.2],[2.34,.9,1.33]),this.part("ball",[.82,2.87,.28],[.28,.21,.34]),this.part("petal",[-.95,2.73,.2],[.3,.42,.66],[0,-.9,0])])}buildClothGate(){let t=[];for(let i of[-1,1])t.push(this.part("rod",[i*7.4,5.33,0],[.15,10.66,.15])),t.push(this.part("box",[i*7.4,.13,0],[1.6,.26,2.1])),t.push(this.part("rod",[i*7.4,10.61,0],[.25,.18,.25]));t.push(this.part("rod",[0,10.15,0],[.11,14.8,.11],[0,0,Math.PI/2]));for(let i=0;i<8;i++)t.push(this.part("box",[-6.15+i*1.77,10.03,-.12],[.16,.4,.24],[0,0,.12]));this.add("clothGateFrame",t);let e=[];for(let i=0;i<4;i++)e.push(this.part("cloth",[-5.4+i*3.6,8.43+i%2*.12,-.15],[3.1,1.5,1.05]));this.add("clothGateFabric",e)}dispose(){for(let t of Object.values(this.geometries))t.dispose();for(let t of Object.values(this.materials))t.dispose()}};var nf={store:"storeShop",tea:"teaHouse",pond:"festivalPavilion",laundry:"laundryLoft"};function sf(r,{side:t,layer:e,width:i,depth:n,height:s,variant:o}){let a=new Nt,{themeId:l,geometries:c,materials:h}=r;a.name=`${nf[l]}-${e}`,a.userData={architecture:!0,type:nf[l],variant:o,layer:e};let u=-n/2,d=o%2?h.accent:h.edge,f=(p,T,b,x,S)=>{let E=r.mesh(a,c.box,T,b,x);return E.name=p,S&&E.rotation.set(...S),E},m=l==="pond"?h.edge:o%3===0?h.ink:h.cream;f("plinth",h.dark,[0,.12,0],[n+.12,.24,i]),f("buildingBody",m,[.15,s/2,0],[n-.3,s,i-.35]);let y=e==="middle"?3:2,g=(s-1.2)/y;for(let p=0;p<y;p++){let T=.85+g*(p+.5);f("glazedFront",h.dark,[u-.025,T,0],[.07,g*.64,i-1.1]);for(let b of[-i*.26,0,i*.26])f("windowMullion",h.ink,[u-.08,T,b],[.1,g*.65,.07]);f("floorTrim",d,[u-.085,T-g*.36,0],[.12,.1,i-.35])}f("streetEndWindow",h.dark,[0,s*.56,-i/2+.145],[n*.65,s*.5,.07]),f("doorFrame",h.ink,[u-.1,1.2,-i*.25],[.13,2.3,.95]),f("door",h.dark,[u-.18,1.15,-i*.25],[.045,2.05,.74]),f("signBoard",d,[u-.17,s-.5,0],[.28,.72,i-.5]);for(let p=0;p<3;p++)f("signGlyph",h.cream,[u-.322,s-.5,(p-1)*i*.18],[.025,.26,i*.115]);if(l==="store"){f("flatRoof",h.edge,[0,s+.13,0],[n+.25,.28,i+.15]),f("stripedAwning",d,[u-.43,2.8,0],[1.15,.16,i+.25]);for(let p=-2;p<=2;p++)f("awningStripe",h.cream,[u-.43,2.897,p*i/5],[1.14,.022,i/11]);f("pricePylon",h.dark,[n*.25,s+1,-i*.22],[.1,1.6,.1]),f("priceLabel",d,[n*.25,s+1.45,-i*.22],[.3,.65,i*.45]),f("priceLabelInk",h.cream,[n*.25-.173,s+1.45,-i*.22],[.035,.2,i*.28])}else if(l==="tea"){f("teaCanopy",d,[u-.4,2.85,0],[1.12,.14,i+.3]);for(let p of[-1,1])f("roofSlope",h.edge,[0,s+.3,p*i*.245],[n+.45,.15,i*.55],[p*-.12,0,0]),f("verandaPost",h.ink,[u-.77,1.43,p*(i/2-.3)],[.11,2.86,.11]);f("cupSign",h.cream,[n*.15,s+1,0],[1,1.35,1]),f("cupBand",d,[n*.15,s+.96,0],[1.03,.4,1.03]),f("cupStraw",h.dark,[n*.15,s+2.05,.12],[.12,1.15,.12],[.16,0,0])}else if(l==="pond"){for(let p of[-1,1])f("festivalRoof",d,[0,s+.24,p*i*.245],[n+.6,.14,i*.57],[p*-.23,0,0]),f("timberPost",h.dark,[u-.34,s/2,p*(i/2-.3)],[.18,s,.18]);f("stageBanner",h.cream,[u-.36,s-.48,0],[.06,1,i*.44]),f("bannerStripe",d,[u-.4,s-.48,0],[.025,.13,i*.31]);for(let p of[-i*.32,i*.32])f("speakerCase",h.dark,[u-.44,.95,p],[.56,1.35,.65]),f("speakerCone",h.ink,[u-.735,1,p],[.025,.42,.42])}else{f("loftRoof",h.edge,[0,s+.17,0],[n+.3,.35,i+.28]);for(let p of[-i*.27,i*.27])f("balconySlab",h.ink,[u-.3,s*.55,p],[.75,.12,i*.32]),f("balconyRail",h.dark,[u-.65,s*.55+.48,p],[.08,.1,i*.32]),f("dryingCloth",d,[u-.68,s*.55+.25,p],[.03,.7,i*.18]);f("dryerSign",h.cream,[n*.15,s+1.02,0],[.9,1.45,1.3]),f("dryerDoor",h.dark,[n*.15-.485,s+1.02,0],[.06,.83,.83]),f("dryerDoorInset",d,[n*.15-.53,s+1.02,0],[.025,.49,.49])}return t<0&&(a.rotation.y=Math.PI),a.updateMatrixWorld(!0),a}function rf(r,{side:t,layer:e,width:i,depth:n,height:s,variant:o}){let a=new Nt,{materials:l}=r,c=r.geometries,h=e==="middle"?{...c,sphere:c.sphereLow,cylinder:c.cylinderLow,taper:c.taperLow,ringWall:c.ringWallLow}:c,u=(o%3+3)%3,d=o%2?l.accent:l.edge,f=(p,T,b,x,S,E)=>{let C=r.mesh(a,T,b,x,S);return C.name=p,E&&C.rotation.set(...E),C},m=(p,T,b,x,S)=>f(p,h.box,T,b,x,S),y=(p,T,b,x,S)=>f(p,h.cylinder,T,b,x,S),g;if(r.themeId==="store")if(u===0){g="milkCartonHouse";let p=-n*.46,T=s*.78;m("cartonBody",l.cream,[0,T/2,0],[n*.9,T,i*.86]),m("milkColorBand",d,[p-.035,s*.39,0],[.09,s*.37,i*.87]),m("cartonSideBand",d,[0,s*.39,-i*.435],[n*.91,s*.37,.06]);let b=Math.atan2(s*.15,i*.43);for(let x of[-1,1])m("foldedCartonRoof",l.edge,[0,T+s*.071,x*i*.21],[n*.93,.12,Math.hypot(i*.45,s*.15)],[x*b,0,0]);m("sealedCartonRidge",d,[0,s*.955,0],[n*.97,s*.08,i*.065]),m("cartonLabel",l.cream,[p-.11,s*.52,0],[.065,s*.15,i*.56]),m("labelMilkStripe",d,[p-.148,s*.53,0],[.02,s*.036,i*.38]),m("shopDoor",l.dark,[p-.1,s*.15,0],[.1,s*.29,i*.19]),m("doorGlass",l.ink,[p-.157,s*.17,0],[.025,s*.16,i*.13]);for(let x of[-i*.28,i*.28])m("cartonWindow",l.dark,[p-.08,s*.32,x],[.1,s*.14,i*.15]),m("upperWindow",l.dark,[p-.075,s*.675,x],[.1,s*.12,i*.14]);m("milkShopAwning",d,[p-.38,s*.305,0],[.86,.14,i*.79]),m("awningCenterStripe",l.cream,[p-.38,s*.305+.081,0],[.86,.025,i*.12])}else if(u===1){g="cookieTinHouse",y("roundedCookieTin",d,[0,s*.45,0],[n*.43,s*.87,i*.43]),y("tinBaseRim",l.cream,[0,.16,0],[n*.46,.21,i*.46]),y("tinLid",l.cream,[0,s*.9,0],[n*.47,s*.085,i*.47]),m("tinLabelPanel",l.cream,[-n*.435,s*.48,0],[.16,s*.41,i*.56]),y("cookieEmblem",l.ground,[-n*.535,s*.565,0],[i*.13,.045,s*.11],[0,0,Math.PI/2]);for(let p of[-i*.065,i*.065])m("cookieChocolateChip",l.dark,[-n*.575,s*.57,p],[.025,s*.035,i*.034]);m("tinEntrance",l.dark,[-n*.46,s*.14,0],[.12,s*.27,i*.2]),m("entranceGlass",l.ink,[-n*.528,s*.165,0],[.025,s*.14,i*.13]);for(let p of[-i*.22,i*.22])m("tinUpperWindow",l.dark,[-n*.36,s*.74,p],[.21,s*.12,i*.14]),m("tinLowerWindow",l.dark,[-n*.36,s*.32,p],[.21,s*.12,i*.14]);m("cookieShopCanopy",l.edge,[-n*.52,s*.285,0],[.82,.12,i*.64]),m("leadingFaceWindow",l.dark,[0,s*.49,-i*.427],[n*.38,s*.28,.11])}else{g="fridgeHouse";let p=-n*.47;m("fridgeCabinet",l.edge,[0,s*.46,0],[n*.94,s*.91,i*.9]),m("roundedFridgeHeader",d,[0,s*.938,0],[n,s*.11,i*.96]);for(let T of[-i*.225,i*.225]){m("fridgeGlassDoor",l.dark,[p-.04,s*.47,T],[.1,s*.75,i*.37]),m("mintDoorGlass",l.ink,[p-.097,s*.47,T],[.03,s*.65,i*.3]),m("fridgeHandle",l.cream,[p-.175,s*.4,T-Math.sign(T)*i*.1],[.1,s*.18,.09]);for(let b of[.3,.54])m("displayShelf",l.cream,[p-.12,s*b,T],[.025,.09,i*.3])}m("sideCoolingVent",l.dark,[0,s*.36,-i*.454],[n*.56,s*.36,.06]),m("ventCrossbar",l.edge,[0,s*.36,-i*.49],[n*.56,.12,.025]),m("headerLight",l.light,[p-.055,s*.945,0],[.05,s*.035,i*.67]),m("fridgePorch",l.cream,[p-.24,.1,0],[.71,.2,i*.75]),m("fridgeAwning",d,[p-.3,s*.265,0],[.85,.13,i*.88])}else if(u===0){g="bubbleTeaCupHouse";let p=n*.43,T=i*.42,b=s*.73;f("taperedMilkTeaCup",h.taper,l.cream,[0,.19+b/2,0],[p,b,T]),y("teaCupFoot",d,[0,.16,0],[p*.79,.25,T*.79]),y("teaCupLid",d,[0,b+.26,0],[p*1.09,.27,T*1.09]),y("lidRim",l.edge,[0,b+.425,0],[p*1.055,.08,T*1.055]);let x=y("angledDrinkingStraw",l.edge,[n*.09,s*.875,i*.13],[.11,s*.24,.11],[.29,0,-.16]),S=new I(0,s*.12,0).applyQuaternion(x.quaternion).add(x.position);y("strawOpening",l.dark,S.toArray(),[.073,.025,.073],[.29,0,-.16]);for(let E of[-i*.19,0,i*.19]){let C=-p*(E===0?.79:.7);f("visibleTapiocaPearl",h.sphere,l.dark,[C-.05,b*.17,E],[.22,.23,.24])}m("cupFrontLabel",d,[-p*.955,b*.56,0],[.13,s*.21,i*.48]),m("teaShopDoor",l.dark,[-p*.875-.025,s*.25,0],[.13,s*.23,i*.18]),m("doorGlass",l.ink,[-p*.875-.099,s*.265,0],[.025,s*.12,i*.12]);for(let E of[-i*.17,i*.17])m("cupUpperWindow",l.dark,[-p*.87,s*.56,E],[.2,s*.1,i*.12]);m("cupPorchRoof",l.edge,[-p-.25,s*.365,0],[.83,.11,i*.54]),m("cupLeadingWindow",l.dark,[0,s*.47,-T*.945],[n*.28,s*.16,.17])}else if(u===1){g="teapotTeaHouse",f("roundTeapotBody",h.sphere,l.edge,[0,s*.42,i*.035],[n*.42,s*.35,i*.3]),y("teapotFoot",d,[0,s*.105,i*.035],[n*.31,.24,i*.26]),y("teapotLid",d,[0,s*.76,i*.035],[n*.3,s*.09,i*.24]),f("lidKnob",h.sphere,l.cream,[0,s*.84,i*.035],[.24,s*.055,.24]),f("teapotLoopHandle",h.ringWall,d,[0,s*.47,i*.32],[i*.145,s*.215,n*.33],[0,Math.PI/2,0]),y("teapotSpout",l.edge,[0,s*.6,-i*.325],[i*.075,i*.31,i*.075],[-.91,0,0]),y("darkSpoutOpening",l.dark,[0,s*.6+i*.096,-i*.447],[i*.047,.032,i*.047],[-.91,0,0]),m("teapotEntryPorch",l.cream,[-n*.36,s*.16,i*.035],[n*.35,s*.32,i*.27]),m("teaHouseDoor",l.dark,[-n*.542,s*.145,i*.035],[.035,s*.275,i*.16]),m("teaDoorGlass",l.ink,[-n*.565,s*.16,i*.035],[.015,s*.14,i*.1]);for(let p of[-i*.115,i*.15])m("teapotWindow",l.dark,[-n*.375,s*.47,p],[n*.095,s*.13,i*.12]);m("teapotCanopy",d,[-n*.46,s*.32,i*.035],[n*.5,.12,i*.43]),m("teaHouseLabel",l.cream,[-n*.422,s*.64,i*.035],[.06,s*.09,i*.25])}else{g="stackedCupLidTower";for(let p=0;p<3;p++){let T=s*(.15+p*.27),b=n*(.43-p*.025),x=i*(.42-p*.025);f("stackedCupFloor",h.taper,p===1?d:l.cream,[0,T,0],[b,s*.255,x]),y("stackedCupLid",l.edge,[0,T+s*.14,0],[b*1.09,s*.055,x*1.09]),m("towerFrontWindow",l.dark,[-b*.955,T+s*.015,0],[.13,s*.12,i*.33]),m("towerLeadingWindow",l.dark,[0,T+s*.015,-x*.945],[n*.3,s*.1,.14])}y("towerRoofStraw",d,[0,s*.93,i*.1],[.1,s*.13,.1],[.2,0,.13]),m("towerGroundDoor",l.dark,[-n*.425,s*.1,0],[.17,s*.19,i*.17]),m("towerEntryCanopy",l.edge,[-n*.46,s*.2,0],[.8,.12,i*.48]);for(let p of[-i*.2,i*.2])f("towerBasePearl",h.sphere,l.dark,[-n*.33,s*.055,p],[.17,.19,.19])}return a.name=`${g}-${e}`,a.userData={architecture:!0,type:g,variant:o,layer:e,signature:!0},t<0&&(a.rotation.y=Math.PI),a.updateMatrixWorld(!0),a}var s_={pond:["lilyPavilion","speakerStageHouse","lotusExhibitionHall"],laundry:["washerHouse","basketHouse","skyLaundryLoft"]};function of(r,{side:t,layer:e,width:i,depth:n,height:s,variant:o=0}){let a=new Nt,{themeId:l,materials:c}=r,h=r.geometries,u=e==="middle"?{...h,sphere:h.sphereLow,cylinder:h.cylinderLow,taper:h.taperLow,ringWall:h.ringWallLow}:h,d=(Math.floor(o)%3+3)%3,f=s_[l]?.[d];if(!f)throw new Error(`Unsupported dream architecture theme: ${l}`);a.name=`${f}-${e}`,a.userData={architecture:!0,type:f,variant:d,layer:e,signature:!0};let m=(b,x,S,E,C,v)=>{let w=r.mesh(a,u[x],S,E,C);return w.name=b,v&&w.rotation.set(...v),w},y=(b,x,S,E)=>m(b,"box",x,S,E),g=(b,x,S,E,C)=>m(b,"cylinder",x,S,E,C),p=(b,x,S,E)=>m(b,"sphere",x,S,E),T=(b,x,S,E,C,v)=>m(b,"ringWall",x,[0,S,0],[E,C,v/.065],[Math.PI/2,0,0]);if(l==="pond"&&d===0){g("roundBoardwalk",c.road,[0,s*.05,0],[n*.46,s*.1,i*.46]);for(let b of[-1,1])for(let x of[-1,1])g("lilyStemColumn",c.edge,[b*n*.29,s*.44,x*i*.29],[n*.032,s*.68,i*.022]);p("mainLilyRoof",c.edge,[0,s*.87,0],[n*.47,s*.13,i*.46]);for(let b of[-1,1])p("overlappingLilyRoof",b<0?c.edge:c.ink,[n*.03,s*.85,b*i*.16],[n*.44,s*.12,i*.27]);y("frontStep",c.ink,[-n*.39,s*.03,0],[n*.22,s*.06,i*.43]);for(let b of[-1,1])y("pavilionRail",c.dark,[0,s*.23,b*i*.32],[n*.55,s*.035,i*.025]),y("leafVein",c.ink,[-n*.1,s*.975,b*i*.13],[n*.5,s*.012,i*.018])}else if(l==="pond"&&d===1){y("stagePlinth",c.road,[0,s*.035,0],[n*.96,s*.07,i*.96]),y("stageRearWall",c.edge,[n*.12,s*.34,0],[n*.65,s*.54,i*.43]),y("stageDeck",c.cream,[-n*.17,s*.13,0],[n*.6,s*.12,i*.55]),y("stageCanopy",c.accent,[0,s*.65,0],[n*.9,s*.08,i*.45]);for(let b of[-1,1]){let x=b*i*.34;y("giantSpeakerTower",c.dark,[-n*.12,s*.49,x],[n*.6,s*.84,i*.25]),y("speakerTowerCrown",c.accent,[-n*.12,s*.95,x],[n*.66,s*.1,i*.28]);for(let S of[.27,.65])g("speakerDriver",c.ink,[-n*.445,s*S,x],[s*.125,n*.045,i*.068],[0,0,Math.PI/2]),m("speakerDriverRim","ringWall",c.cream,[-n*.48,s*S,x],[i*.071,s*.13,n*.21],[0,Math.PI/2,0]);y("stageLight",c.light,[-n*.46,s*.88,x],[n*.05,s*.025,i*.09])}}else if(l==="pond"){g("lotusHallPlinth",c.road,[0,s*.045,0],[n*.47,s*.09,i*.46]),m("lotusHallShell","taper",c.ink,[0,s*.38,0],[n*.44,s*.63,i*.41]),p("centralLotusPetal",c.accent,[0,s*.78,0],[n*.43,s*.22,i*.21]);for(let b of[-1,1])p("outerLotusPetal",b<0?c.cream:c.accent,[n*.025,s*.74,b*i*.23],[n*.39,s*.18,i*.21]),g("lotusStem",c.edge,[n*.16,s*.49,b*i*.32],[n*.022,s*.67,i*.022]),g("lotusHallPorthole",c.dark,[-n*.43,s*.48,b*i*.19],[s*.065,n*.025,i*.07],[0,0,Math.PI/2]);y("lotusHallEntrance",c.dark,[-n*.445,s*.2,0],[n*.025,s*.24,i*.17])}else if(d===0){y("washerPlinth",c.edge,[0,s*.04,0],[n*.94,s*.08,i*.94]),y("washerShell",c.cream,[0,s*.46,0],[n*.85,s*.78,i*.89]),y("washerControlStrip",c.edge,[-n*.455,s*.8,0],[n*.08,s*.11,i*.88]),y("washerTop",c.ink,[0,s*.875,0],[n*.92,s*.055,i*.94]);let b=Math.min(i*.31,s*.28),x=s*.43;g("washerDarkDrum",c.dark,[-n*.446,x,0],[b*.87,n*.045,b*.87],[0,0,Math.PI/2]),m("washerDoorRim","ringWall",c.edge,[-n*.483,x,0],[b,b,n*.23],[0,Math.PI/2,0]),p("washerDoorGlass",c.dark,[-n*.497,x,0],[n*.035,b*.74,b*.74]),y("washerDoorReflection",c.ink,[-n*.536,x+b*.23,-b*.25],[n*.012,b*.5,b*.1]);for(let S of[-.3,.25])g("washerControlDial",S<0?c.dark:c.accent,[-n*.505,s*.8,i*S],[s*.025,n*.025,i*.035],[0,0,Math.PI/2]);m("detergentBottle","taper",c.accent,[n*.1,s*.945,i*.2],[n*.08,s*.09,i*.07]),g("detergentCap",c.dark,[n*.1,s*.993,i*.2],[n*.06,s*.014,i*.05]),y("detergentLabel",c.cream,[n*.017,s*.945,i*.2],[n*.009,s*.035,i*.09])}else if(d===1){m("basketHouseBody","taper",c.ink,[0,s*.34,0],[n*.44,s*.64,i*.44]);for(let b of[.18,.43,.67])T("basketWeaveBand",c.edge,s*b,n*(.36+b*.12),i*(.36+b*.12),s*.018);for(let b of[-.29,-.1,.1,.29])y("basketVerticalWeave",c.cream,[-n*.405,s*.35,i*b],[n*.035,s*.54,i*.025]);for(let b of[-1,1])p("basketClothPile",b<0?c.accent:c.cloud,[n*.03,s*.82,b*i*.14],[n*.34,s*.18,i*.23]);y("drapedLaundry",c.accent,[-n*.42,s*.61,i*.19],[n*.035,s*.26,i*.16]),y("basketHouseDoor",c.dark,[-n*.38,s*.17,0],[n*.04,s*.25,i*.16]),y("basketDoorLintel",c.edge,[-n*.408,s*.31,0],[n*.045,s*.04,i*.2])}else{y("laundryLoftDeck",c.road,[0,s*.14,0],[n*.94,s*.1,i*.94]);for(let b of[-1,1])for(let x of[-1,1])y("dryingFramePost",c.edge,[b*n*.38,s*.5,x*i*.4],[n*.06,s,i*.045]);for(let b of[-1,1])y("dryingRoofBeam",c.edge,[0,s*.965,b*i*.4],[n*.84,s*.07,i*.065]);for(let b of[-1,1])g("longClothesline",c.dark,[b*n*.28,s*.86,0],[n*.016,i*.75,n*.016],[Math.PI/2,0,0]);for(let b of[-1,1]){let x=b*i*.21,S=b<0?c.accent:c.cloud;y("giantHangingShirtBody",S,[-n*.28,s*.61,x],[n*.045,s*.36,i*.2]),y("giantHangingShirtSleeves",S,[-n*.28,s*.745,x],[n*.045,s*.09,i*.35]);for(let E of[-1,1])y("oversizedClothespin",c.cream,[-n*.29,s*.845,x+E*i*.075],[n*.07,s*.075,i*.025])}p("loftCloudFoundation",c.cloud,[n*.03,s*.055,0],[n*.49,s*.055,i*.46])}return t<0&&(a.rotation.y=Math.PI),a.updateMatrixWorld(!0),a}var tl={store:{ground:"#ede9dd",road:"#526660",edge:"#d1e5d8",ink:"#e2e8da",accent:"#e97e65",props:["milkCarton","fridge","storeShelf","snackBag"],gate:"receiptGate"},tea:{ground:"#ad7652",road:"#9ebc9d",edge:"#f4e3bd",ink:"#d8e1c6",accent:"#c87250",props:["teaCup","teapot","pearlIsland","teaBoat"],gate:"strawGate"},pond:{ground:"#3d7363",road:"#c2a783",edge:"#426e52",ink:"#e5d2ad",accent:"#d3857a",props:["speakerStage","lotus","festivalTent","reedCluster"],gate:"leafGate"},laundry:{ground:"#e1ded5",road:"#a8b8a4",edge:"#f3eee0",ink:"#e1e6d9",accent:"#d48170",props:["washer","hangingClothes","laundryBasket","cloudIsland"],gate:"clothGate"}};function af(r,t=!1){if(typeof document>"u")return null;let e=document.createElement("canvas");e.width=512,e.height=t?512:2048;let i=e.getContext("2d"),n=e.width,s=e.height;if(i.fillStyle=t?r.ground:r.road,i.fillRect(0,0,n,s),t){i.strokeStyle=r.ink,i.globalAlpha=.15,i.lineWidth=2;for(let a=0;a<4;a++)i.beginPath(),i.moveTo(a*128,0),i.lineTo(a*128,s),i.stroke(),i.beginPath(),i.moveTo(0,a*128),i.lineTo(n,a*128),i.stroke()}else{if(i.strokeStyle=r.ink,i.lineWidth=2,r===tl.store){for(let a=0;a<s;a+=64)i.globalAlpha=.12,i.fillStyle=r.ink,i.fillRect(0,a,n,2);i.globalAlpha=.9,i.fillStyle="#f0e9d8",i.fillRect(228,0,56,s),i.fillStyle="#9ba79b";for(let a=32;a<s;a+=80)i.fillRect(239,a,34,2),i.fillRect(239,a+7,25,2),i.fillRect(239,a+14,30,2)}else if(r===tl.tea||r===tl.pond)for(let a=0;a<s;a+=96){i.globalAlpha=.28,i.fillStyle=r.ink,i.fillRect(0,a,n,2);for(let l=24;l<n;l+=92)i.beginPath(),i.ellipse(l,a+46,11,2,0,0,Math.PI*2),i.stroke()}else{i.globalAlpha=.18;for(let a=0;a<s;a+=8)i.beginPath(),i.moveTo(0,a),i.lineTo(n,a),i.stroke();for(let a=0;a<n;a+=8)i.beginPath(),i.moveTo(a,0),i.lineTo(a,s),i.stroke()}i.globalAlpha=.65,i.fillStyle=r.edge;for(let a of[12,500])i.fillRect(a-3,0,6,s);i.globalAlpha=.28;for(let a of[180,332])for(let l=0;l<s;l+=128)i.fillRect(a-1,l,2,38);i.globalAlpha=.25;for(let a of[105,256,407])for(let l=310;l<s;l+=768)i.beginPath(),i.moveTo(a-10,l+12),i.lineTo(a,l),i.lineTo(a+10,l+12),i.stroke()}let o=new un(e);return o.colorSpace=Ve,o.anisotropy=4,o.wrapT=In,t&&(o.wrapS=o.wrapT=In,o.repeat.set(12,3.2)),o}var el=class extends Hn{createKit(){return this.theme=this.options.theme,this.themeId=this.theme.id,this.style=tl[this.themeId],["store","tea"].includes(this.themeId)?new $a:new Qa}initGeometries(){let t=e=>new oi(e,this.chunkLength).rotateX(-Math.PI/2);return{ground:t(180),road:t(11.2),box:new ee(1,1,1),sphere:new ye(1,12,8),bulb:new ye(1,6,4),ring:new Le(1,.035,3,20).rotateX(-Math.PI/2),cylinder:new ue(1,1,1,16),taper:new ue(1,.77,1,16),ringWall:new Le(1,.065,4,16),sphereLow:new ye(1,8,6),cylinderLow:new ue(1,1,1,10),taperLow:new ue(1,.77,1,10),ringWallLow:new Le(1,.065,3,12)}}initMaterials(){let t=e=>new xt({color:e,roughness:.86});return{ground:new xt({color:16777215,map:af(this.style,!0),roughness:.78}),road:new xt({color:16777215,map:af(this.style),roughness:.91}),edge:t(this.style.edge),ink:t(this.style.ink),accent:t(this.style.accent),dark:t(4281160),cream:t(16183005),cloud:t(16183781),light:new we({color:16771240})}}buildDistantScenery(){let t=new ye(250,24,16),e=[],i=t.attributes.position,n=new Ot(this.theme.fogColor),s=new Ot(this.theme.skyColor);for(let l=0;l<i.count;l++){let c=n.clone().lerp(s,oe.smoothstep(i.getY(l)/250,.02,.55));e.push(c.r,c.g,c.b)}t.setAttribute("color",new Ft(e,3));let o=new _t(t,new we({vertexColors:!0,side:ke,depthWrite:!1,fog:!1}));o.renderOrder=-20,this.distantHorizonGroup.add(o);let a=new Nt;if(this.themeId==="store"){this.mesh(a,this.geometries.box,this.materials.cream,[0,13,210],[165,30,3]);for(let l of[-55,-25,25,55])this.mesh(a,this.geometries.box,this.materials.edge,[l,22,204],[17,3,.3]),this.mesh(a,this.geometries.box,this.materials.light,[l,24.5,196],[13,.18,4])}else{for(let[l,c,h]of[[-44,150,2.7],[57,205,3.6],[-82,228,3]]){let u=this.kit.create(this.themeId==="tea"?"teaCup":this.themeId==="pond"?"reedCluster":"cloudIsland");u.position.set(l,this.themeId==="laundry"?-4:-.3,c),u.scale.setScalar(h),a.add(u)}if(this.themeId==="pond"){let l=this.mesh(a,this.geometries.sphere,this.materials.light,[35,19,190],[11,11,1]);l.name="sunsetDisc"}}for(let l of this.collectInstances([a]).values()){let c=new li(l.geometry,l.material,l.matrices.length);l.matrices.forEach((h,u)=>c.setMatrixAt(u,h)),c.instanceMatrix.needsUpdate=!0,c.computeBoundingSphere(),this.distantHorizonGroup.add(c)}}placeProp(t,e,i,n,s,o=1,a=6.9,l=0){let c=this.kit.create(e,Math.floor(s()*3));c.scale.setScalar(o),c.rotation.y=i*(.08+s()*.13),c.updateMatrixWorld(!0);let h=new Ie().setFromObject(c),u=h.max.z-h.min.z;u>5.35&&(c.scale.multiplyScalar(5.35/u),c.updateMatrixWorld(!0),h=new Ie().setFromObject(c));let d=i>0?a-h.min.x:-a-h.max.x;c.position.set(d,0,n-(h.min.z+h.max.z)/2),c.userData.sceneryLayer="near",c.userData.slot=l,c.traverse(m=>{m.isMesh&&(m.castShadow=!1,m.receiveShadow=!1)}),t.add(c),c.updateWorldMatrix(!0,!0);let f=new Ie().setFromObject(c);return t.userData.decorations.push({type:e,side:i,layer:"near",slot:l,bounds:f}),f}placeArchitecture(t,e,i,n,s,o,a,l=!0){let c=s==="middle",h=((t.userData.index+o+(e>0?1:0)+(c?1:0))%3+3)%3,u=(c?8.1:5)+n()*(c?2.8:2),f=(l?["store","tea"].includes(this.themeId)?rf:of:sf)(this,{side:e,layer:s,variant:h,height:u,width:c?6.3:4.8,depth:c?5.2:3.3}),m=new Ie().setFromObject(f),y=e>0?a-m.min.x:-a-m.max.x;f.position.set(y,0,i-(m.min.z+m.max.z)/2),f.userData.sceneryLayer=s,f.userData.slot=o,t.add(f),f.updateWorldMatrix(!0,!0);let g=new Ie().setFromObject(f);return t.userData.architecture.push({type:f.userData.type,side:e,layer:s,slot:o,variant:h,signature:l,innerEdge:a,bounds:g}),g}spawnChunk(){let t=this.nextChunkZ,e=Math.round(t/this.chunkLength),i=lh(this.seed,e),n=new Nt;n.position.z=t,n.userData={startZ:t,endZ:t+this.chunkLength,index:e,decorations:[],architecture:[]};let s=this.materials,o=this.geometries,a=this.chunkLength/2,l=this.mesh(n,o.ground,s.ground,[0,-.11,a]);l.name="surroundingSurface";let c=this.mesh(n,o.road,s.road,[0,-.005,a]);c.receiveShadow=!0;let h=null,u=null;e%4===0&&(h=this.kit.create(this.style.gate,e%3),h.position.z=37,h.traverse(d=>{d.isMesh&&(d.castShadow=!1,d.receiveShadow=!1)}),n.add(h),h.updateWorldMatrix(!0,!0),u=new Ie().setFromObject(h));for(let d of[-1,1]){this.mesh(n,o.box,s.edge,[d*5.66,.07,a],[.16,.15,this.chunkLength]);let f=0;for(let y=0;y<8;y++){let g=3+y*6,T=u&&t+g+2.8>=u.min.z&&t+g-2.8<=u.max.z?Math.max(6.9,(d<0?-u.min.x:u.max.x)+.4):6.9,b;if(y%2===1){let x=(d<0?0:2)+Math.floor(y/2),S=this.style.props[(e===0?x:Math.floor(i()*this.style.props.length))%this.style.props.length],E=this.themeId==="store"?.95+i()*.14:.82+i()*.16;b=this.placeProp(n,S,d,g,i,E,T,y)}else b=this.placeArchitecture(n,d,g,i,"near",y,T);f=Math.max(f,d<0?-b.min.x:b.max.x)}let m=Math.max(14.3,f+.95);for(let y=0;y<6;y++)this.placeArchitecture(n,d,4+y*8,i,"middle",y,m,y%3!==1);if(this.themeId==="pond"){for(let y=0;y<6;y++){let g=3+y*8,p=3.5+Math.sin(y*.7)*.4;this.mesh(n,o.box,s.dark,[d*6.75,1.7,g],[.055,3.4,.055]),this.mesh(n,o.bulb,s.light,[d*6.75,p,g],[.14,.2,.14]),this.mesh(n,o.box,s.dark,[d*6.75,3.5,g+4],[.025,.025,8])}for(let y=0;y<3;y++)this.mesh(n,o.ring,s.ink,[d*(15+i()*17),-.06,i()*48],[2+i()*3,1,1.1])}else if(this.themeId==="tea")for(let y=0;y<4;y++)this.mesh(n,o.sphere,s.dark,[d*(16+i()*24),-.5,i()*48],[1+i(),.75,1+i()]);else if(this.themeId==="laundry")for(let y=0;y<3;y++)this.mesh(n,o.sphere,s.cloud,[d*(17+i()*20),-.8,i()*48],[4+i()*5,1.8,4+i()*4])}h&&n.userData.decorations.push({type:"gate",side:0,layer:"overhead",bounds:u}),n.userData.density={nearSlotsPerSide:8,buildingsPerSide:10,signatureBuildingsPerSide:8,landmarksPerSide:4,nearSpacing:6,middleSpacing:8,layers:["near","middle"]},this.chunks.push(n),this.nextChunkZ+=this.chunkLength}update(t,e=0){this.renderPlayerZ=t,super.update(t),this.instancePlayerZ!==t&&this.chunks.some(i=>i.children.some(n=>n.isGroup&&this.isSourceVisible(n,i,this.instancePlayerZ)!==this.isSourceVisible(n,i,t)))&&this.rebuildInstances(),this.elapsed=(this.elapsed||0)+e,this.themeId==="store"&&this.materials.road.map&&(this.materials.road.map.offset.y=this.elapsed*.09%1)}rebuildInstances(){super.rebuildInstances(),this.instancePlayerZ=this.renderPlayerZ??0}isSourceVisible(t,e,i){let n=e.userData.startZ+t.position.z-i,s=t.userData.architecture?t.userData.layer==="middle"?120:100:64;return n>=-14&&n<=s}shouldInstance(t,e){if(e.userData.startZ===void 0||t.parent===e)return!0;let i=t;for(;i.parent&&i.parent!==e;)i=i.parent;return this.isSourceVisible(i,e,this.renderPlayerZ??0)}reset(){this.renderPlayerZ=0,this.elapsed=0,super.reset()}};var r_={store:{body:15787985,trim:6658438,deck:4810841,dark:4018503},tea:{body:14729096,trim:6391148,deck:9614993,dark:5913389},pond:{body:12227694,trim:4812368,deck:7838819,dark:5260377},laundry:{body:15657436,trim:10993582,deck:7378305,dark:5661530}};function o_(){let r=new Pe;return[[-.13,-.45],[.13,-.45],[.13,.02],[.36,.02],[0,.48],[-.36,.02],[-.13,.02]].forEach(([t,e],i)=>i?r.lineTo(t,e):r.moveTo(t,e)),r.closePath(),new vi(r)}var il=class{constructor(t){this.id=t;let e=r_[t],i=o=>new xt({color:o,roughness:.8});this.materials={body:i(e.body),trim:i(e.trim),deck:i(e.deck),dark:i(e.dark),hazard:i(14710624),cream:i(16773847),feature:i(4487260),mark:new we({color:16774104,side:Fe})};let n=new Pe;n.moveTo(0,0),n.lineTo(1,1),n.lineTo(1,0),n.closePath();let s=new qe(n,{steps:1,depth:1,bevelEnabled:!1});s.rotateY(-Math.PI/2),s.translate(.5,0,0),this.geometries={box:new ee(1,1,1),sphere:new ye(1,12,8),cylinder:new ue(1,1,1,16),ring:new Le(1,.1,5,20),arrow:o_(),wedge:s,floor:new oi(1,1).rotateX(-Math.PI/2)}}part(t,e,i,n,s=[1,1,1],o=[0,0,0],a=!0){let l=new _t(this.geometries[e],this.materials[i]);return l.position.set(...n),l.scale.set(...s),l.rotation.set(...o),l.castShadow=a,l.receiveShadow=a,t.add(l),l}create(t,e){let i=new Nt;i.name=`${this.id}-${t}`;let{width:n,height:s,length:o,clearanceY:a}=e;if(t==="ramp"){this.part(i,"wedge","deck",[0,0,0],[n,s,o]);for(let c=1;c<8;c++)this.part(i,"box","trim",[0,s*c/8+.016,o*c/8],[n,.025,.13]);let l=Math.atan2(s,o);for(let c of[.24,.5,.76])this.part(i,"arrow","mark",[0,s*c+.035,o*c],[1,1,1],[Math.PI/2-l,0,0],!1);for(let c of[-1,1])this.part(i,"box","body",[c*(n/2-.06),s/2+.14,o/2],[.1,.18,Math.hypot(o,s)],[-l,0,0])}else if(t==="platform"){this.part(i,"box","body",[0,s/2,o/2],[n,s,o]),this.part(i,"box","deck",[0,s+.045,o/2],[n,.09,o]);for(let l of[.2,.5,.8])this.part(i,"arrow","mark",[0,s+.1,o*l],[.8,.8,.8],[Math.PI/2,0,0],!1);if(this.id==="store"){for(let l of[1.5,o-1.5])for(let c of[-n/2,n/2])this.part(i,"cylinder","dark",[c,.3,l],[.28,.16,.28],[0,0,Math.PI/2]);for(let l of[1,5,9,13]){this.part(i,"box","trim",[0,s*.52,l],[n+.035,.55,.18]);for(let c of[-1,1])this.part(i,"box","trim",[c*n/2,s*.52,l],[.1,s*.7,1.8])}this.part(i,"box","trim",[0,s*.5,-.025],[n,.14,.055]),this.part(i,"box","dark",[0,s*.65,-.06],[n*.5,.28,.04])}else if(this.id==="tea"){for(let l of[-1,1])this.part(i,"box","trim",[l*n*.47,s*.85,o/2],[.17,.26,o]);this.part(i,"ring","cream",[0,s*.5,-.1],[.5,.5,.5]);for(let l of[2,6,10,14])for(let c of[-1,1])this.part(i,"sphere","dark",[c*n*.48,.45,l],[.32,.32,.32]);for(let l of[2,5,8,11,14])this.part(i,"box","trim",[0,s+.101,l],[n*.94,.015,.055],[0,0,0],!1)}else if(this.id==="pond"){this.part(i,"box","dark",[0,s*.55,-.08],[n*.85,s*.72,.15]);for(let l of[-.65,.65])this.part(i,"ring","trim",[l,s*.55,-.18],[.35,.35,.35]);for(let l of[2,5,8,11,14])for(let c of[-1,1])this.part(i,"box","dark",[c*n*.48,s*.48,l],[.12,s*.8,1.8])}else{for(let l of[.28,.57,.85]){this.part(i,"box","trim",[0,s*l,o/2],[n+.025,.06,o+.035]);for(let c of[-1,1])this.part(i,"box","cream",[c*(n/2+.02),s*l+.15,o/2],[.05,.035,o*.92])}this.part(i,"box","dark",[0,.12,o/2],[n,.16,o])}}else if(t==="jump"){if(this.id==="pond"||this.id==="tea"){if(this.part(i,"cylinder",this.id==="tea"?"dark":"hazard",[0,s/2,0],[n*.44,s,.46]),this.part(i,"cylinder","cream",[0,s-.03,0],[n*.44,.07,.46]),this.id==="pond")for(let l of[-1,1])this.part(i,"box","dark",[l*n*.34,s*.5,-.4],[.06,s*.7,.06])}else{this.part(i,"box","hazard",[0,s/2,0],[n,s,.65]);for(let l=0;l<6;l++)this.part(i,"box","body",[(l-2.5)*n/7,s/2,-.34],[.04,s*.75,.03],[0,0,0],!1);this.id==="laundry"&&this.part(i,"sphere","cream",[0,s-.12,0],[n*.35,.2,.25])}this.part(i,"box","dark",[0,s*.6,-.4],[.65,.66,.04]),this.part(i,"arrow","mark",[0,s*.6,-.43],[.6,.6,.6],[0,0,0],!1).name="jumpArrow"}else if(t==="slide"){for(let c of[-1,1])this.part(i,"box","dark",[c*(n/2-.1),s/2,0],[.14,s,.16]),this.part(i,"box","body",[c*(n/2-.1),.09,0],[.34,.18,.35]);let l=s-a;this.part(i,"box",this.id==="laundry"?"trim":"hazard",[0,a+l/2,0],[n,l,.24]);for(let c of[-1,1])this.part(i,"box","cream",[c*n*.32,a+l/2,-.14],[.12,l*.8,.025],[0,0,.2],!1);if(this.part(i,"arrow","mark",[0,a+l/2,-.15],[.85,.85,.85],[0,0,Math.PI],!1).name="slideArrow",this.id==="laundry")for(let c of[-1,1])this.part(i,"box","body",[c*n*.4,s+.12,0],[.1,.26,.2])}else if(t==="feature"){this.part(i,"box","feature",[0,.015,0],[ot.LANE_WIDTH*.83,.04,7],[0,0,0],!1);for(let l of[-2.3,0,2.3])this.part(i,"arrow","mark",[0,.044,l],[1.1,1.1,1.1],[Math.PI/2,0,0],!1);this.id!=="store"&&this.part(i,"ring","cream",[0,.07,-1.6],[.7,.7,.7],[Math.PI/2,0,0],!1)}return i}dispose(){Object.values(this.geometries).forEach(t=>t.dispose()),Object.values(this.materials).forEach(t=>t.dispose())}},nl=class{constructor(t,e,i,n){this.scene=t,this.lane=i,this.z=n,this.length=7,this.triggered=!1,this.mesh=e.create("feature",{}),this.mesh.position.set(-i*ot.LANE_WIDTH,0,n),t.add(this.mesh)}destroy(){this.scene.remove(this.mesh)}};var sl=class{constructor(t){this.scene=t,this.pool=new Map,this.matrix=new Xt,this.inverse=new Xt}sync(t){for(let e of this.pool.values())e.sources.length=0;this.scene.updateWorldMatrix(!0,!1),this.inverse.copy(this.scene.matrixWorld).invert();for(let e of t){let i=e.mesh;!i?.parent||!i.visible||(i.updateWorldMatrix(!0,!0),i.traverse(n=>{if(!n.isMesh)return;n.visible=!1;let s=[n.geometry.uuid,n.material.uuid,+n.castShadow,+n.receiveShadow].join(":");this.pool.has(s)||this.pool.set(s,{geometry:n.geometry,material:n.material,castShadow:n.castShadow,receiveShadow:n.receiveShadow,sources:[],mesh:null,capacity:0}),this.pool.get(s).sources.push(n)}))}for(let e of this.pool.values()){let i=e.sources.length;if(!i){e.mesh&&(e.mesh.count=0);continue}i>e.capacity&&(e.mesh&&(this.scene.remove(e.mesh),e.mesh.dispose()),e.capacity=2**Math.ceil(Math.log2(Math.max(16,i))),e.mesh=new li(e.geometry,e.material,e.capacity),e.mesh.name="worldEntityInstances",e.mesh.instanceMatrix.setUsage(On),e.mesh.castShadow=e.castShadow,e.mesh.receiveShadow=e.receiveShadow,this.scene.add(e.mesh)),e.sources.forEach((n,s)=>e.mesh.setMatrixAt(s,this.matrix.multiplyMatrices(this.inverse,n.matrixWorld))),e.mesh.count=i,e.mesh.instanceMatrix.needsUpdate=!0,e.mesh.computeBoundingSphere()}}clear(){for(let t of this.pool.values())t.sources.length=0,t.mesh&&(t.mesh.count=0)}dispose(){for(let t of this.pool.values())t.mesh&&(this.scene.remove(t.mesh),t.mesh.dispose());this.pool.clear()}};var Mn={cream:{id:"cream",name:"奶油云翼",price:1e4,description:"奶油羽片与浅金饰边，常驻展示，拾羽毛可飞行",feather:16774098,trim:14530419,tip:13230019}},rl=class{constructor(t){this.group=new Nt,this.group.name="wingSystem",this.group.position.set(0,1.44,-.28),t.add(this.group),this.time=0,this.featherGeometry=new ye(1,12,8),this.materials={feather:new xt({roughness:.87}),trim:new xt({roughness:.8}),tip:new xt({roughness:.82})},this.wings=[];for(let e of[-1,1]){let i=new Nt;i.name=e<0?"rightWing":"leftWing",i.position.x=e*.16;let n=(s,o,a,l=0)=>{let c=new _t(this.featherGeometry,s);c.position.set(e*o[0],o[1],o[2]),c.scale.set(...a),c.rotation.z=e*l,c.castShadow=!0,i.add(c)};n(this.materials.trim,[.2,.015,0],[.25,.15,.075],.27),n(this.materials.feather,[.39,.08,-.018],[.31,.2,.08],.18);for(let s=0;s<6;s++)n(s===5?this.materials.tip:this.materials.feather,[.38+s*.105,.19-s*.065,-.03],[.31-s*.013,.066,.045],.22-s*.1);this.group.add(i),this.wings.push({wing:i,side:e})}this.equip("cream"),this.update(0,!1)}equip(t){let e=Object.prototype.hasOwnProperty.call(Mn,t)?Mn[t]:null;if(this.skinId=e?t:"none",this.group.visible=!!e,e)for(let i of["feather","trim","tip"])this.materials[i].color.setHex(e[i]);return this.skinId}update(t,e){this.group.visible=this.skinId!=="none"||e,this.time+=t;for(let{wing:i,side:n}of this.wings)i.rotation.y=n*(e?.08+Math.sin(this.time*9)*.18:.6+Math.sin(this.time*2.4)*.025),i.rotation.z=n*(e?.03:.16)}dispose(){this.group.removeFromParent(),this.featherGeometry.dispose(),Object.values(this.materials).forEach(t=>t.dispose())}},uh;function lf(){uh||(uh={feather:new ye(1,10,6),stem:new ue(.025,.025,1.35,6),ring:new Le(.86,.045,6,24),cream:new xt({color:16773581,roughness:.8}),mint:new xt({color:7648923,roughness:.75}),gold:new we({color:14990966})});let r=uh,t=new Nt;t.name="flightFeatherPickup";let e=new _t(r.ring,r.gold);t.add(e);let i=new _t(r.stem,r.gold);i.rotation.z=-.35,t.add(i);for(let n=0;n<5;n++)for(let s of[-1,1]){let o=new _t(r.feather,n===4?r.mint:r.cream);o.scale.set(.28-n*.035,.09,.065),o.position.set(s*(.16-n*.02)+(n-2)*.07,-.45+n*.23,0),o.rotation.z=s*.55,t.add(o)}return t}var Ye={cream:16773332,sand:15126186,teal:1478545,indigo:2243947,gold:15314243,coral:15952978};function ol(r){let t=new Pe;t.moveTo(r[0][0],r[0][1]);for(let e=1;e<r.length;e++)t.lineTo(r[e][0],r[e][1]);return t.closePath(),t}function ll(r=1,t=0){return ol([[-.18,-.68],[.18,-.68],[.18,.05],[.5,.05],[0,.66],[-.5,.05],[-.18,.05]].map(([e,i])=>[e*r,i*r+t]))}function a_(){let r=new Pe;r.absarc(0,0,.12,0,Math.PI*2,!1);let t=[[.17,.07],[.65,.15],[.58,-.01],[.46,-.04],[.39,-.1],[.29,-.08],[.21,-.13],[.16,-.04]];return new vi([r,ol(t),ol(t.map(([e,i])=>[-e,i]))],12)}function cf(r,t){let e=[],i=r*.38;for(let n of[-1,1])for(let s of[.28,.42]){let o=n*t*s,a=i*.4;e.push(ol([[o-.075-a,-i],[o+.075-a,-i],[o+.075+a,i],[o-.075+a,i]]))}return new vi(e)}function Lr(r){return new we({color:r,side:Fe})}var dh=null;function l_(){if(!dh){let r=new ue(.52,.52,.14,20);r.rotateX(Math.PI/2);let t=new ee(.36,.36,.18);t.rotateZ(Math.PI/4),dh={coinGeom:r,coinMat:new xt({color:16765738,metalness:.35,roughness:.38,emissive:16753922,emissiveIntensity:.35}),starGeom:t,starMat:new xt({color:16773749,metalness:.3,roughness:.35})}}return dh}var fh=null;function c_(r,t,e){if(!fh){let i=new Pe;i.moveTo(0,0),i.lineTo(r,t),i.lineTo(r,0),i.closePath();let n={steps:1,depth:e,bevelEnabled:!1},s=new qe(i,n);s.rotateY(-Math.PI/2),s.translate(e/2,0,0);let o=new ue(.06,.06,r*1.05,8);o.rotateX(Math.PI/2-Math.atan2(t,r));let a=Math.hypot(r,t),l=new vi([.22,.5,.78].map(c=>ll(1.02,a*c)));l.rotateX(Math.PI/2-Math.atan2(t,r)),fh={rampGeom:s,rampMat:new xt({color:Ye.teal,roughness:.72,metalness:.08}),arrowGeom:l,arrowMat:Lr(Ye.cream),handrailGeom:o,postGeom:new ue(.05,.05,.9,8),railMat:new xt({color:Ye.gold,roughness:.42,metalness:.3})}}return fh}var ph=null;function h_(r,t,e){if(!ph){let i=new xt({color:Ye.indigo,roughness:.24,metalness:.35,side:Fe}),n=new vi([.24,.5,.76].map(s=>ll(.82,e*s)));n.rotateX(Math.PI/2),ph={bodyGeom:new ee(r,t,e),bodyMat:new xt({color:Ye.cream,roughness:.58,metalness:.1}),stripeGeom:new ee(r+.04,.45,e+.04),stripeMat:new xt({color:Ye.teal,roughness:.62}),skirtGeom:new ee(r+.05,.15,e+.05),skirtMat:new xt({color:Ye.indigo,roughness:.7}),roofGeom:new ee(r*.88,.12,e*.96),roofMat:new xt({color:Ye.teal,roughness:.8}),roofArrowsGeom:n,routeMat:Lr(Ye.cream),crestGeom:a_(),crestMat:Lr(Ye.gold),cabWindowGeom:new oi(r*.75,t*.38),cabWindowMat:i,lightGeom:new ye(.18,12,12),lightMat:new we({color:16773057}),sideWinGeom:new oi(1.4,.75)}}return ph}var mh=null;function u_(r,t){return mh||(mh={poleGeom:new ue(.1,.1,t,12),poleMat:new xt({color:Ye.sand,roughness:.88}),barGeom:new ee(r,.42,.14),barMat:new xt({color:Ye.coral,roughness:.6}),signGeom:new ee(.48,.48,.16),signMat:new xt({color:Ye.indigo,roughness:.68}),footGeom:new ee(.24,.2,.2),arrowGeom:new vi(ll(.26)),stripesGeom:cf(.42,r),markingMat:Lr(Ye.cream)}),mh}var gh=null;function d_(r,t,e){if(!gh){let i=t-e;gh={poleGeom:new ue(.12,.12,t,12),poleMat:new xt({color:Ye.indigo,roughness:.75}),beamGeom:new ee(r,i,.22),beamMat:new xt({color:Ye.gold,roughness:.68}),footGeom:new ee(.24,.2,.24),footMat:new xt({color:Ye.sand,roughness:.88}),arrowGeom:new vi(ll(.46)),stripesGeom:cf(i,r),markingMat:Lr(Ye.indigo)}}return gh}function xh(r,t,e,i){if(Math.abs(t-r)<1e-8)return r>e&&r<i?[0,1]:null;let n=(e-r)/(t-r),s=(i-r)/(t-r),o=Math.max(0,Math.min(n,s)),a=Math.min(1,Math.max(n,s));return o<a?[o,a]:null}var yh=null;function f_(){if(!yh){let r={milk:16726072,magnet:623843,shoe:47252,shield:53971},t={};for(let[e,i]of Object.entries(r))t[e]=new xt({color:i,roughness:.2,metalness:.4,emissive:i,emissiveIntensity:.35});yh={ballGeom:new ye(.52,16,16),ringGeom:new Le(.72,.05,8,24),ringMat:new we({color:16777215}),mats:t}}return yh}var bi=class{constructor(t,e,i,n=1){this.scene=t,this.lane=e,this.z=i,this.y=n,this.collected=!1,this.mesh=this.buildMesh(),this.mesh.position.set(-e*ot.LANE_WIDTH,n,i),this.scene.add(this.mesh)}buildMesh(){let t=l_(),e=new Nt,i=new _t(t.coinGeom,t.coinMat);e.add(i);let n=new _t(t.starGeom,t.starMat);return e.add(n),e}update(t){this.collected||(this.mesh.rotation.y+=t*4.2,this.mesh.position.y=this.y+Math.sin(this.mesh.rotation.y*1.5)*.1)}destroy(){this.scene.remove(this.mesh)}},al=class{constructor(t,e,i,n=null){this.scene=t,this.lane=e,this.startZ=i,this.length=ot.WORLD.RAMP_LENGTH,this.endZ=i+this.length,this.height=ot.WORLD.RAMP_HEIGHT,this.width=ot.WORLD.TRAIN_WIDTH*.95,this.mesh=n?n.create("ramp",this):this.buildMesh(),this.mesh.position.set(-e*ot.LANE_WIDTH,0,i),this.scene.add(this.mesh)}buildMesh(){let t=c_(this.length,this.height,this.width),e=new Nt,i=new _t(t.rampGeom,t.rampMat);i.castShadow=!0,i.receiveShadow=!0,e.add(i);let n=new _t(t.arrowGeom,t.arrowMat);n.name="rampForwardArrows",n.position.y=.018,e.add(n);for(let s of[-1,1]){let o=s*(this.width/2-.08),a=new _t(t.handrailGeom,t.railMat);a.position.set(o,this.height/2+.65,this.length/2),e.add(a);for(let l=0;l<=5;l++){let c=l/5*this.length,h=l/5*this.height,u=new _t(t.postGeom,t.railMat);u.position.set(o,h+.45,c),e.add(u)}}return e}getHeightAtZ(t){return t<this.startZ||t>this.endZ?null:(t-this.startZ)/this.length*this.height}destroy(){this.scene.remove(this.mesh)}},Dr=class{constructor(t,e,i,n=0,s=null){this.scene=t,this.lane=e,this.z=i,this.speed=n,this.width=ot.WORLD.TRAIN_WIDTH,this.height=ot.WORLD.TRAIN_HEIGHT,this.length=ot.WORLD.TRAIN_LENGTH,this.mesh=s?s.create("platform",this):this.buildMesh(),this.mesh.position.set(-e*ot.LANE_WIDTH,0,i),this.scene.add(this.mesh)}buildMesh(){let t=h_(this.width,this.height,this.length),e=new Nt,i=new _t(t.bodyGeom,t.bodyMat);i.position.set(0,this.height/2,this.length/2),i.castShadow=!0,i.receiveShadow=!0,e.add(i);let n=new _t(t.stripeGeom,t.stripeMat);n.position.set(0,this.height*.42,this.length/2),e.add(n);let s=new _t(t.skirtGeom,t.skirtMat);s.position.set(0,.18,this.length/2),e.add(s);let o=new _t(t.roofGeom,t.roofMat);o.position.set(0,this.height+.06,this.length/2),o.receiveShadow=!0,e.add(o);let a=new _t(t.roofArrowsGeom,t.routeMat);a.name="roofForwardArrows",a.position.y=this.height+.124,e.add(a);let l=new _t(t.crestGeom,t.crestMat);l.name="trainWingedSun",l.position.set(0,this.height*.42,-.027),e.add(l);for(let d of[-1,1]){let f=new _t(t.crestGeom,t.crestMat);f.position.set(d*(this.width/2+.025),this.height*.42,this.length*.5),f.rotation.y=d*Math.PI/2,e.add(f)}let c=new _t(t.cabWindowGeom,t.cabWindowMat);c.position.set(0,this.height*.65,-.029),e.add(c);for(let d of[-1,1]){let f=new _t(t.lightGeom,t.lightMat);f.position.set(d*.95,this.height*.32,-.04),e.add(f)}let h=2.4,u=Math.floor(this.length/h)-1;for(let d=0;d<u;d++){let f=2+d*h;for(let m of[-1,1]){let y=new _t(t.sideWinGeom,t.cabWindowMat);y.position.set(m*(this.width/2+.02),this.height*.62,f),y.rotation.y=m>0?Math.PI/2:-Math.PI/2,e.add(y)}}return e}update(t){this.speed>0&&(this.z-=this.speed*t,this.mesh.position.z=this.z)}destroy(){this.scene.remove(this.mesh)}},Sn=class{constructor(t,e,i=null,n=Math.random()<.5?"jump":"slide",s=10){this.scene=t,this.train=e,this.lane=e.lane,this.offsetZ=Math.max(0,Math.min(s,e.length-3)),this.type=n==="slide"?"slide":"jump";let o=ot.LANE_WIDTH*(this.type==="jump"?.88:.9);this.deckWidth=e.roofWidth??e.width*(i?1:.88),this.width=Math.min(o,this.deckWidth-.2),this.height=this.type==="jump"?1.35:2.15,this.clearanceY=this.type==="slide"?1.15:0,this.depth=this.type==="jump"&&i?.92:this.type==="jump"?.2:.24,this.deckTopOffset=e.roofTopOffset??(i?.09:.12),i?this.mesh=i.create(this.type,this):(this.mesh=(this.type==="jump"?Gn:zn).prototype.buildMesh.call({width:o,height:this.height,clearanceY:this.clearanceY}),this.mesh.scale.x=this.width/o),this.mesh.name=`roof-${this.type}-barrier`,this.mesh.position.set(-this.lane*ot.LANE_WIDTH,this.baseY,this.z),this.previousZ=this.z,t.add(this.mesh)}get z(){return this.train.z+this.offsetZ}get baseY(){return this.train.height+this.deckTopOffset}update(){this.previousZ=this.mesh.position.z,this.mesh.position.set(-this.lane*ot.LANE_WIDTH,this.baseY,this.z)}collidesWith(t,e={}){let i=t.isSliding?ot.PLAYER.SLIDE_HEIGHT:ot.PLAYER.COLLIDER_HEIGHT,n=ot.PLAYER.COLLIDER_DEPTH/2+this.depth/2,s=ot.PLAYER.COLLIDER_WIDTH/2+this.width/2,o=[xh((e.z??t.z)-this.previousZ,t.z-this.z,-n,n),xh((e.x??t.x)+this.lane*ot.LANE_WIDTH,t.x+this.lane*ot.LANE_WIDTH,-s,s),xh(e.y??t.y,t.y,this.baseY+this.clearanceY-i,this.baseY+this.height-(this.type==="jump"?.15:0))];return o.every(Boolean)&&Math.max(...o.map(a=>a[0]))<Math.min(...o.map(a=>a[1]))}destroy(){this.scene.remove(this.mesh)}},Gn=class{constructor(t,e,i,n=null){this.scene=t,this.lane=e,this.z=i,this.width=ot.LANE_WIDTH*.88,this.height=1.35,this.mesh=n?n.create("jump",this):this.buildMesh(),this.mesh.position.set(-e*ot.LANE_WIDTH,0,i),this.scene.add(this.mesh)}buildMesh(){let t=u_(this.width,this.height),e=new Nt;for(let a of[-1,1]){let l=new _t(t.poleGeom,t.poleMat);l.position.set(a*(this.width/2-.12),this.height/2,0),l.castShadow=!0,e.add(l);let c=new _t(t.footGeom,t.poleMat);c.position.set(a*(this.width/2-.12),.1,0),e.add(c)}let i=new _t(t.barGeom,t.barMat);i.position.set(0,this.height-.25,0),i.castShadow=!0,e.add(i);let n=new _t(t.signGeom,t.signMat);n.position.set(0,this.height-.25,-.015),e.add(n);let s=new _t(t.arrowGeom,t.markingMat);s.name="jumpArrow",s.position.set(0,this.height-.25,-.099),e.add(s);let o=new _t(t.stripesGeom,t.markingMat);return o.position.set(0,this.height-.25,-.074),e.add(o),e}destroy(){this.scene.remove(this.mesh)}},zn=class{constructor(t,e,i,n=null){this.scene=t,this.lane=e,this.z=i,this.width=ot.LANE_WIDTH*.9,this.clearanceY=1.15,this.height=2.15,this.mesh=n?n.create("slide",this):this.buildMesh(),this.mesh.position.set(-e*ot.LANE_WIDTH,0,i),this.scene.add(this.mesh)}buildMesh(){let t=d_(this.width,this.height,this.clearanceY),e=new Nt;for(let a of[-1,1]){let l=new _t(t.poleGeom,t.poleMat);l.position.set(a*(this.width/2-.12),this.height/2,0),l.castShadow=!0,e.add(l);let c=new _t(t.footGeom,t.footMat);c.position.set(a*(this.width/2-.12),.1,0),e.add(c)}let i=this.height-this.clearanceY,n=new _t(t.beamGeom,t.beamMat);n.position.set(0,this.clearanceY+i/2,0),n.castShadow=!0,e.add(n);let s=new _t(t.arrowGeom,t.markingMat);s.name="slideArrow",s.position.set(0,this.clearanceY+i/2,-.116),s.rotation.z=Math.PI,e.add(s);let o=new _t(t.stripesGeom,t.markingMat);return o.position.set(0,this.clearanceY+i/2,-.116),e.add(o),e}destroy(){this.scene.remove(this.mesh)}},Cs=class{constructor(t,e,i,n,s=1.2){this.scene=t,this.lane=e,this.z=i,this.y=s,this.type=n,this.collected=!1,this.mesh=this.buildMesh(),this.mesh.position.set(-e*ot.LANE_WIDTH,s,i),this.scene.add(this.mesh)}buildMesh(){if(this.type==="flight")return lf();let t=f_(),e=new Nt,i=t.mats[this.type]||t.mats.milk,n=new _t(t.ballGeom,i);e.add(n);let s=new _t(t.ringGeom,t.ringMat);return e.add(s),e}update(t){this.collected||(this.mesh.rotation.y+=t*3.5,this.type!=="flight"&&(this.mesh.rotation.z+=t*2),this.mesh.position.y=this.y+Math.sin(this.mesh.rotation.y)*.15)}destroy(){this.scene.remove(this.mesh)}};var p_={store:{title:"夜宵订单",instruction:"沿中间道收集 3 枚金币",hit:"金币收好",length:205},tea:{title:"泡泡航线",instruction:"回到中间道，踩珍珠垫穿过 3 个空中泡泡",hit:"泡泡命中",length:140},pond:{title:"荷塘三连拍",instruction:"跟着地板提示：左 → 中 → 右，踩中 3 个节拍",hit:"踩中节拍",length:205},laundry:{title:"云上收袜子",instruction:"中间道踩暖风口，或沿坡登台，收齐 3 只袜子",hit:"袜子收好",length:140}};function hf(r,t,e){return t>=r&&r<e&&t>=e}var _h=class{constructor(t,e){this.scene=t,this.lane=0,this.height=ot.WORLD.RAMP_HEIGHT,this.safeSupport=!0,this.rampLength=ot.WORLD.RAMP_LENGTH,this.length=91.5,this.width=ot.WORLD.TRAIN_WIDTH*.95,this.mesh=new Nt,this.mesh.name="safeLaundryDryingDeck",this.mesh.add(e.create("ramp",{width:this.width,height:this.height,length:this.rampLength}));let i=e.create("platform",{width:this.width,height:this.height,length:80});i.position.z=this.rampLength,this.mesh.add(i),this.startZ=0,this.endZ=this.length}reset(t){this.startZ=t,this.endZ=t+this.length,this.mesh.position.set(0,0,t),this.scene.add(this.mesh)}getHeightAtZ(t){return t<this.startZ||t>this.endZ?null:Math.min(1,(t-this.startZ)/this.rampLength)*this.height}destroy(){this.scene.remove(this.mesh)}},cl=class{constructor(t,e){this.scene=t,this.visualKit=e,this.pool=[]}acquire(t){let e=this.pool.find(i=>!i.inUse);return e||(e=new vh(this.scene,this.visualKit),this.pool.push(e)),e.reset(t),e}clear(){for(let t of this.pool)t.destroy()}dispose(){this.clear(),this.pool.length=0}},vh=class{constructor(t,e){this.scene=t,this.kit=e,this.type=e.id,this.rule=p_[this.type],this.mesh=new Nt,this.mesh.name=`${this.type}-trackChallenge`,this.targets=[],this.inUse=!1,this.state={id:"",title:this.rule.title,instruction:this.rule.instruction,total:3,completed:0,combo:0,feedback:"",active:!0,progress:0,remaining:3,reward:0},this.support=this.type==="laundry"?new _h(t,e):null,this.build()}build(){let t=this.kit;t.part(this.mesh,"box","trim",[0,.014,0],[ot.LANE_WIDTH*2.9,.022,.8],[0,0,0],!1);for(let e of[-1,1])t.part(this.mesh,"box","dark",[e*5.6,.9,4],[.16,1.8,.16]),t.part(this.mesh,"box","trim",[e*5.6,1.8,4],[.95,.8,.1]),t.part(this.mesh,"arrow","mark",[e*5.6,1.8,3.93],[.7,.7,.7],[0,0,Math.PI/2],!1);(this.type==="tea"||this.type==="laundry")&&(this.launchMesh=t.create("feature",{}),this.launchMesh.position.z=30,this.mesh.add(this.launchMesh));for(let e=0;e<3;e++){let i=new Nt;i.name=`${this.type}-checkpoint-${e+1}`;let n={index:e,lane:this.type==="pond"?e-1:0,z:0,y:0,processed:!1,hit:!1,visual:i,markers:[]};if(this.type==="store"?(n.coin=new bi(this.scene,0,0,0),n.coin.mesh.name="store-orderCoin",i.add(n.coin.mesh)):this.type==="tea"?(n.markers.push(t.part(i,"ring","trim",[0,0,0],[1.55,1.55,1.55],[0,0,0],!1)),t.part(i,"ring","cream",[0,0,-.04],[1.36,1.36,1.36],[0,0,0],!1),t.part(i,"sphere","cream",[-.72,.72,-.03],[.16,.16,.16],[0,0,0],!1)):this.type==="pond"?(n.markers.push(t.part(i,"cylinder","trim",[0,.03,0],[1.18,.065,1.18],[0,0,0],!1)),t.part(i,"ring","cream",[0,.08,0],[1.01,1.01,1.01],[Math.PI/2,0,0],!1),t.part(i,"box","cream",[-.17,.085,.08],[.14,.018,.95],[0,0,0],!1),t.part(i,"box","cream",[.17,.085,.08],[.14,.018,.95],[0,0,0],!1),t.part(i,"arrow","mark",[0,.095,-3],[1.35,1.35,1.35],[Math.PI/2,0,e===0?-Math.PI/2:e===2?Math.PI/2:0],!1)):(n.markers.push(t.part(i,"box","trim",[.04,.17,0],[.43,.75,.15],[0,0,.12],!1)),n.markers.push(t.part(i,"box","trim",[-.2,-.19,0],[.8,.3,.17],[0,0,.12],!1)),t.part(i,"box","cream",[.09,.51,-.025],[.44,.12,.18],[0,0,.12],!1),t.part(i,"ring","cream",[0,0,.06],[1.04,1.04,1.04],[0,0,0],!1)),this.type!=="store")for(let s=0;s<=e;s++)t.part(i,"box","cream",[(s-e/2)*.3,this.type==="pond"?.092:-.65,-.45],[.15,.022,.15],[0,0,0],!1);this.mesh.add(i),this.targets.push(n)}}reset(t){this.startZ=t,this.endZ=t+this.rule.length,this.length=this.rule.length,this.launchZ=t+30,this.launched=!1,this.launchAttempted=!1,this.inUse=!0,this.pendingReward=0,this.feedbackTime=0,Object.assign(this.state,{id:`${this.type}:${t}`,completed:0,combo:0,feedback:"",active:!0,progress:0,remaining:3,reward:0,instruction:this.rule.instruction}),this.mesh.position.set(0,0,t),this.scene.add(this.mesh);for(let e of this.targets){e.z=this.type==="store"||this.type==="pond"?t+55+e.index*55:this.launchZ+36+e.index*19,e.y=this.type==="tea"?3.9:this.type==="laundry"?3.25:this.type==="store"?.9:0,e.processed=!1,e.hit=!1,e.visual.scale.setScalar(1),e.coin&&(e.coin.collected=!1,e.coin.mesh.rotation.set(0,0,0),e.coin.mesh.position.set(0,0,0));for(let i of e.markers)i.material=this.kit.materials.trim;this.positionTarget(e)}this.support?.reset(this.launchZ+1)}positionTarget(t){t.visual.position.set(-t.lane*ot.LANE_WIDTH,t.y,t.z-this.startZ)}launch(t,e){this.launched=!0,e.jump();let i=this.type==="tea"?19:17.5,n=e.y;e.vy=i,e.isGrounded=!1;for(let s of this.targets){let o=[.3,.55,.8][s.index];s.z=e.z+t*o;let a=n+i*o-.5*ot.PLAYER.GRAVITY*o*o,l=this.support?.getHeightAtZ(s.z)??0;s.y=Math.max(a,l)+.8,this.positionTarget(s)}this.state.instruction=this.type==="tea"?"保持中间道，穿过空中的 3 个泡泡":"保持中间道，收袜子后落在晾衣台",this.state.feedback=this.type==="tea"?"珍珠起飞！":"暖风托举！",this.feedbackTime=.9}update(t,e,i,n){if(!this.inUse||i.z<this.startZ-30||i.z>this.endZ+16)return 0;if(i.props.flight>0){for(let o of this.targets)!o.processed&&o.z<=i.z&&(o.processed=!0,this.state.remaining--,this.state.combo=0);return i.z>=this.launchZ&&(this.launchAttempted=!0),this.state.active=this.state.remaining>0,this.state.feedback="",this.feedbackTime=0,0}this.feedbackTime-=t,this.feedbackTime<=0&&(this.state.feedback="");for(let o of this.targets)o.coin?.update(t);if(this.state.progress=Math.max(0,Math.min(1,(i.z-this.startZ)/this.length)),(this.type==="tea"||this.type==="laundry")&&!this.launchAttempted&&hf(n.z,i.z,this.launchZ)){this.launchAttempted=!0;let o=(this.launchZ-n.z)/Math.max(1e-4,i.z-n.z),a=n.x+(i.x-n.x)*o,l=n.y+(i.y-n.y)*o;Math.abs(a)<1.12&&l<.28&&i.isGrounded&&this.launch(e,i)}for(let o of this.targets){if(o.processed||!hf(n.z,i.z,o.z))continue;o.processed=!0;let a=(o.z-n.z)/Math.max(1e-4,i.z-n.z),l=n.x+(i.x-n.x)*a,c=n.y+(i.y-n.y)*a,u=Math.abs(l+o.lane*ot.LANE_WIDTH)<1.12&&(this.type==="pond"?c<.28:Math.abs(c+.8-o.y)<1.25);if(o.hit=u,u){this.state.completed++,this.state.combo++,this.pendingReward+=2,this.state.reward+=2,this.state.feedback=`${this.rule.hit} ${this.state.completed}/3 · +2 金币`;for(let d of o.markers)d.material=this.kit.materials.feature;o.coin&&(o.coin.collected=!0,o.visual.scale.setScalar(0)),(this.type==="tea"||this.type==="laundry")&&o.visual.scale.setScalar(.32),this.state.completed===3&&(this.pendingReward+=12,this.state.reward+=12,this.state.feedback="三连完成！额外 +12 金币")}else this.state.combo=0,this.state.feedback="错过这一点，继续试下一点";this.feedbackTime=1.6,this.state.remaining=this.targets.filter(d=>!d.processed).length}this.state.active=this.state.remaining>0;let s=this.pendingReward;return this.pendingReward=0,s}destroy(){this.inUse=!1,this.scene.remove(this.mesh),this.support?.destroy()}};var hl=class{constructor(t,e=Math.random){this.world=t,this.random=e,this.reset()}reset(){this.active=!1,this.nextAirCoinZ=0,this.nextPickupZ=this.randomDistance(600,900)}randomDistance(t,e){return t+Math.floor(this.random()*(e-t+1))}update(t,e){let i=this.world;for(;this.nextPickupZ<t.z+180;){let n=i.challenges.find(s=>this.nextPickupZ>=s.startZ-20&&this.nextPickupZ<=s.endZ+25);if(n){this.nextPickupZ=n.endZ+50;continue}i.props.push(new Cs(i.scene,0,this.nextPickupZ,"flight")),this.nextPickupZ+=this.randomDistance(1100,1600)}for(let n of i.props)n.type==="flight"&&!n.collected&&this.clearHazards(n.z-40,n.z+12);if(t.isFlying)if(this.active||(this.nextAirCoinZ=t.z+Math.max(18,e*.75)),this.active=!0,t.props.flight>1.2){let n=t.z+Math.min(100,e*Math.max(0,t.props.flight-.9));for(;this.nextAirCoinZ<n;){for(let s of[-1,0,1]){let o=new bi(i.scene,s,this.nextAirCoinZ,ot.FLIGHT.HEIGHT+.4);o.airborne=!0,i.coins.push(o)}this.nextAirCoinZ+=6}}else this.clearHazards(t.z-12,t.z+e*1.8+25);else this.active&&(this.clearHazards(t.z-12,t.z+e*1.8+25),i.coins=i.coins.filter(n=>n.airborne?(n.destroy(),!1):!0),this.active=!1)}clearHazards(t,e){let i=this.world;for(let n of["trains","barriers","ramps"])i[n]=i[n].filter(s=>{if(s.safeSupport)return!0;let o=s.startZ??s.z,a=s.endZ??s.z+(s.length||1);return o<=e&&a>=t?(s.destroy(),!1):!0})}};var ul=null,bh=new Map,uf={egypt:{cream:16773332,paint:1478545,light:8636349,dark:2243947,accent:15314243},store:{cream:16051160,paint:6658438,light:11849655,dark:4018503,accent:14981736},tea:{cream:16772562,paint:11959633,light:15189398,dark:5913389,accent:8629133},pond:{cream:16773080,paint:6587739,light:10862467,dark:5260377,accent:15246460},laundry:{cream:16183525,paint:10128552,light:13031112,dark:5857648,accent:14922911}};function m_(){let r=new Pe,t=.1;r.moveTo(-.5+t,-.5),r.lineTo(.5-t,-.5),r.quadraticCurveTo(.5,-.5,.5,-.5+t),r.lineTo(.5,.5-t),r.quadraticCurveTo(.5,.5,.5-t,.5),r.lineTo(-.5+t,.5),r.quadraticCurveTo(-.5,.5,-.5,.5-t),r.lineTo(-.5,-.5+t),r.quadraticCurveTo(-.5,-.5,-.5+t,-.5);let e=new qe(r,{depth:1,steps:1,curveSegments:3,bevelEnabled:!1});return e.translate(0,0,-.5),e}function df(r){let t=new de;return t.setAttribute("position",new Ft(r.flat(),3)),t.setIndex([0,1,2,0,2,3]),t.computeVertexNormals(),t}function g_(){if(ul)return ul;let r=new ee(1,1,1),t=r.attributes.position;for(let e=0;e<t.count;e++)t.getY(e)>0&&(t.setX(e,t.getX(e)*.84),t.setZ(e,t.getZ(e)*.6));return t.needsUpdate=!0,r.computeVertexNormals(),ul={box:new ee(1,1,1),soft:m_(),wheel:new ue(1,1,1,16).rotateZ(Math.PI/2),cabin:r,carFrontGlass:df([[-.438,-.32,-.47],[.438,-.32,-.47],[.365,.34,-.334],[-.365,.34,-.334]]),carSideGlass:df([[.49,-.32,-.39],[.49,-.32,.4],[.44,.32,.252],[.44,.32,-.252]])},ul}function x_(r){let t=uf[r]?r:"egypt";if(bh.has(t))return bh.get(t);let e=uf[t],i=s=>new xt({color:s,roughness:.72,metalness:.04}),n={cream:i(e.cream),paint:i(e.paint),light:i(e.light),dark:i(e.dark),accent:i(e.accent),tire:i(2106667),bumper:i(3490122),hub:new xt({color:14278103,roughness:.38,metalness:.46}),glass:new xt({color:e.dark,roughness:.24,metalness:.32,side:Fe}),reflection:new we({color:12247004}),headlight:new we({color:16773565}),tail:new we({color:15824998}),indicator:new we({color:15840861})};return bh.set(t,n),n}function Mh(r,t){return Number.isFinite(r)&&r>0?r:t}var Is=class{constructor(t,e,i,{kind:n="bus",mapId:s="egypt",length:o,height:a,width:l,movingSpeed:c=0}={}){this.scene=t,this.lane=e,this.z=i,this.kind=["hatchback","bus","truck"].includes(n)?n:"bus",this.mapId=s,this.speed=Number.isFinite(c)?c:0;let h=this.kind==="hatchback";this.width=Mh(l,h?2.35:2.65),this.height=Mh(a,h?1.4:2.45),this.length=Mh(o,h?6:160),this.isRideable=!h,this.roofWidth=this.width,this.roofTopOffset=h?0:.1,this.wheels=[],this.mesh=this.buildMesh(),this.mesh.position.set(-e*ot.LANE_WIDTH,0,i),t.add(this.mesh)}part(t,e,i,n,s,o,a=[0,0,0],l=!0){let c=new _t(g_()[e],x_(this.mapId)[i]);return c.name=n,c.position.set(...s),c.scale.set(...o),c.rotation.set(...a),c.castShadow=l,c.receiveShadow=l,t.add(c),c}addWheels(t,e,i){let n=this.width,s=i+.025;for(let o of e)for(let a of[-1,1]){let l=new Nt;l.name="roadWheel",l.position.set(a*(n/2-.025),s,o),this.part(l,"wheel","tire","blackTire",[0,0,0],[.24,i,i]),this.part(l,"wheel","hub","wheelRim",[a*.132,0,0],[.035,i*.55,i*.55]),this.part(l,"wheel","dark","rimCenter",[a*.155,0,0],[.014,i*.23,i*.23]),t.add(l),this.wheels.push(l)}this.wheelRadius=i}addMirrors(t,e,i){for(let n of[-1,1])this.part(t,"box","bumper","mirrorArm",[n*(this.width/2+.06),e,i],[.25,.065,.08]),this.part(t,"soft","paint","sideMirror",[n*(this.width/2+.19),e+.045,i-.03],[.18,.23,.21]),this.part(t,"box","glass","mirrorGlass",[n*(this.width/2+.19),e+.045,i+.078],[.13,.15,.014],[0,0,0],!1)}addFront(t,e=!1){let i=this.width,n=this.height,s=n*(e?.43:.3);this.part(t,"soft","bumper","frontBumper",[0,n*.22,.1],[i*.92,n*.11,.25]),this.part(t,"soft","dark","frontGrille",[0,n*(e?.38:.37),-.015],[i*.45,n*.12,.035]),this.part(t,"soft","cream","frontPlate",[0,n*.23,-.033],[i*.22,n*.07,.026],[0,0,0],!1);for(let o of[-1,1])this.part(t,"soft","headlight","headlight",[o*i*.335,s,-.024],[i*.19,n*.09,.045],[0,0,0],!1),this.part(t,"soft","indicator","turnIndicator",[o*i*.424,s,-.026],[i*.038,n*.068,.048],[0,0,0],!1)}addRear(t,e=!1){let i=this.width,n=this.height,s=this.length;this.part(t,"soft","bumper","rearBumper",[0,n*.22,s-.08],[i*.92,n*.1,.22]),this.part(t,"soft","cream","rearPlate",[0,n*.38,s+.015],[i*.22,n*.065,.028],[0,0,0],!1);for(let o of[-1,1])this.part(t,"soft","tail","taillight",[o*i*.37,n*.44,s+.018],[i*(e?.15:.1),n*(e?.09:.18),.033],[0,0,0],!1)}buildHatchback(t){let e=this.width,i=this.height,n=this.length;this.part(t,"soft","paint","hatchbackBody",[0,i*.405,n/2],[e,i*.45,n]),this.part(t,"soft","light","shortCarHood",[0,i*.62,n*.145],[e*.94,i*.1,n*.29]);let s=[0,i*.752,n*.54],o=[e*.9,i*.36,n*.55];this.part(t,"cabin","cream","hatchbackCabin",s,o),this.part(t,"carFrontGlass","glass","slopingWindshield",s,o,[0,0,0],!1),this.part(t,"carFrontGlass","glass","rearHatchWindow",s,[o[0],o[1],-o[2]],[0,0,0],!1),this.part(t,"soft","cream","smallCarRoof",[0,i-i*.045,n*.54],[e*.78,i*.09,n*.34]);for(let a of[-1,1])this.part(t,"carSideGlass","glass","carSideWindow",s,[a*o[0],o[1],o[2]],[0,0,0],!1),this.part(t,"box","cream","carWindowPillar",[a*e*.416,i*.77,n*.545],[.045,i*.25,.085]),this.part(t,"box","light","carDoorSeam",[a*(e/2+.005),i*.43,n*.56],[.018,i*.26,.025],[0,0,0],!1),this.part(t,"soft","cream","carDoorHandle",[a*(e/2+.012),i*.53,n*.61],[.025,i*.042,n*.06],[0,0,0],!1);this.addWheels(t,[n*.21,n*.79],i*.215),this.addMirrors(t,i*.71,n*.305),this.addFront(t,!0),this.addRear(t,!0)}addTallCabFace(t){let e=this.width,i=this.height;this.part(t,"soft","paint","paintedRoadNose",[0,i*.35,.075],[e*.96,i*.3,.19]),this.part(t,"soft","glass","wideRoadWindshield",[0,i*.7,-.019],[e*.84,i*.36,.034],[0,0,0],!1),this.part(t,"box","cream","windshieldCenterPost",[0,i*.7,-.04],[.055,i*.355,.025]);for(let n of[-1,1])this.part(t,"box","reflection","windshieldGlint",[n*e*.29,i*.79,-.043],[e*.13,i*.025,.012],[0,0,-.18],!1),this.part(t,"box","bumper","windshieldWiper",[n*e*.19,i*.54,-.045],[e*.21,.025,.016],[0,0,n*.13],!1);this.addMirrors(t,i*.7,.8),this.addFront(t)}buildBus(t){let e=this.width,i=this.height,n=this.length,s=i*.15;this.part(t,"soft","cream","busCoachBody",[0,(i+s)/2,n/2],[e,i-s,n]),this.part(t,"soft","paint","busLowerBody",[0,i*.31,n/2],[e*1.006,i*.27,n*.995]),this.part(t,"box","light","busColorStripe",[0,i*.47,n/2],[e*1.009,i*.055,n*.996]),this.part(t,"box","accent","busFineStripe",[0,i*.415,n/2],[e*1.011,i*.027,n*.997]),this.part(t,"box","bumper","busUndercarriage",[0,i*.16,n/2],[e*.86,i*.1,n*.985]);let o=Math.min(12,Math.max(2,Math.floor(n/2.5))),a=Math.min(4,o),l=[];for(let f=0;f<a;f++){let m=3.35+f*2.5;m<n-1.8&&l.push([m,Math.min(1.88,n*.18)])}let c=o-l.length,h=Math.min(13.2,n*.6),u=n-2.1;if(c>0&&u>h)for(let f=0;f<c;f++){let m=(u-h)/Math.max(1,c-1);l.push([h+m*f,Math.min(4.2,Math.max(1.5,m*.68))])}for(let f of[-1,1]){for(let[m,y]of l)this.part(t,"soft","glass","busSideWindow",[f*(e/2+.013),i*.73,m],[.028,i*.29,y],[0,0,0],!1);this.part(t,"soft","glass","busDriverSideWindow",[f*(e/2+.015),i*.72,.82],[.03,i*.31,1.24],[0,0,0],!1)}for(let f of[1.97,n-1.18])this.part(t,"soft","dark","busDoorFrame",[e/2+.019,i*.56,f],[.035,i*.71,1.01]),this.part(t,"box","glass","busDoorGlass",[e/2+.041,i*.64,f],[.012,i*.46,.84],[0,0,0],!1),this.part(t,"box","cream","busDoorDivider",[e/2+.05,i*.57,f],[.018,i*.66,.045]),this.part(t,"box","accent","busDoorStep",[e/2+.035,i*.24,f],[.08,.065,.86]);this.addTallCabFace(t),this.part(t,"soft","dark","busDestinationPanel",[0,i*.935,-.017],[e*.68,i*.068,.031],[0,0,0],!1);for(let f of[-.25,0,.25])this.part(t,"box","headlight","busRouteMark",[f*e,i*.935,-.035],[e*.12,i*.021,.01],[0,0,0],!1);let d=n>12?[1.5,5.25,n-3.1,n-1.55]:[n*.2,n*.79];this.addWheels(t,d,i*.16),this.addRear(t)}buildTruck(t){let e=this.width,i=this.height,n=this.length,s=Math.min(4.9,n*.38),o=s+Math.min(.18,n*.015),a=n-o,l=i*.2;this.part(t,"box","bumper","truckChassis",[0,i*.22,n/2],[e*.82,i*.12,n*.995]),this.part(t,"soft","paint","truckDriverCab",[0,i*.575,s/2],[e,i*.85,s]),this.part(t,"soft","cream","truckCargoBox",[0,(l+i)/2,o+a/2],[e,i-l,a]),this.part(t,"box","light","truckCargoBelt",[0,i*.44,o+a/2],[e*1.012,i*.12,a*.997]);for(let h of[-1,1]){this.part(t,"soft","glass","truckCabSideWindow",[h*(e/2+.017),i*.72,1.49],[.035,i*.31,Math.min(2.2,s*.53)],[0,0,0],!1),this.part(t,"box","light","truckCabDoorSeam",[h*(e/2+.022),i*.53,s*.69],[.02,i*.61,.035],[0,0,0],!1),this.part(t,"soft","cream","truckDoorHandle",[h*(e/2+.028),i*.53,s*.58],[.027,.072,.36],[0,0,0],!1),this.part(t,"box","bumper","truckCabStep",[h*(e/2-.02),i*.21,s*.62],[.18,.1,s*.46]),this.part(t,"box","light","cargoUpperTrim",[h*(e/2+.013),i*.92,o+a/2],[.026,i*.055,a]);for(let u of[.02,.34,.67,.98])this.part(t,"box","light","cargoPanelRib",[h*(e/2+.017),i*.64,o+a*u],[.032,i*.56,.065])}this.part(t,"box","light","rearCargoDoorFrame",[0,i*.63,n+.016],[e*.93,i*.64,.025]),this.part(t,"box","cream","rearCargoDoors",[0,i*.63,n+.033],[e*.85,i*.58,.02]),this.part(t,"box","dark","cargoDoorJoin",[0,i*.63,n+.047],[.035,i*.58,.01],[0,0,0],!1);for(let h of[-1,1])this.part(t,"box","hub","cargoDoorLatch",[h*e*.12,i*.56,n+.058],[.025,i*.3,.018]);this.addTallCabFace(t);let c=n>12?[1.55,s+.75,n-3.05,n-1.5]:[n*.18,n*.75,n*.88];this.addWheels(t,c,i*.16),this.addRear(t)}buildMesh(){let t=new Nt;return t.name=`${this.mapId}-${this.kind}`,t.userData.vehicleKind=this.kind,this.kind==="hatchback"?this.buildHatchback(t):(this.kind==="truck"?this.buildTruck(t):this.buildBus(t),this.part(t,"box","light","roadVehicleFlatRoof",[0,this.height+this.roofTopOffset/2,this.length/2],[this.roofWidth,this.roofTopOffset,this.length])),t}update(t){if(!Number.isFinite(t)||t<=0||this.speed===0)return;let e=this.speed*t;this.z-=e,this.mesh.position.z=this.z;for(let i of this.wheels)i.rotation.x-=e/this.wheelRadius}destroy(){this.scene.remove(this.mesh)}};var dl=class{constructor(t){this.canvas=t,this.scene=new js,this.camera=null,this.renderer=null,this.dirLight=null,this.hemiLight=null,this.environment=null,this.trains=[],this.ramps=[],this.barriers=[],this.coins=[],this.props=[],this.particles=[],this.features=[],this.featureState=null,this.patternIndex=0,this.mapId="egypt",this.obstacleKit=null,this.challengeKit=null,this.challenges=[],this.challengeState=null,this.challengeRewards=0,this.challengePrevious={x:0,y:0,z:0,isSliding:!1,slideTimer:0},this.renderEntities=[],this.nextPatternZ=45,this.distance=0,this.cameraMode="LOBBY",this.lobbyTime=0,this.initThree(),this.wingFlight=new hl(this)}initThree(){let t=this.canvas.clientWidth||window.innerWidth,e=this.canvas.clientHeight||window.innerHeight;this.camera=new ti(ot.CAMERA.FOV,t/e,ot.CAMERA.NEAR,ot.CAMERA.FAR),!this.contextListenerBound&&this.canvas&&(this.contextListenerBound=!0,this.canvas.addEventListener("webglcontextlost",n=>{n.preventDefault(),console.warn("WebGL context lost - preventing default to enable recovery")},!1),this.canvas.addEventListener("webglcontextrestored",()=>{console.log("WebGL context restored - recovering 3D scene")},!1)),this.renderer=new Ha({canvas:this.canvas,antialias:!0,alpha:!1,powerPreference:"high-performance"}),this.renderer.setSize(t,e,!1),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,t<600?1.5:2)),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=qo,this.scene.background=new Ot(ot.THEME.SKY_COLOR),this.scene.fog=new Ks(ot.THEME.FOG_COLOR,140,265),this.hemiLight=new gr(14743546,16775399,1.35),this.scene.add(this.hemiLight);let i=new _r(16777215,.42);this.scene.add(i),this.dirLight=new yr(ot.THEME.SUN_COLOR,1.95),this.dirLight.position.set(25,45,-15),this.dirLight.castShadow=!0,this.dirLight.shadow.mapSize.width=1024,this.dirLight.shadow.mapSize.height=1024,this.dirLight.shadow.camera.near=10,this.dirLight.shadow.camera.far=120,this.dirLight.shadow.camera.left=-20,this.dirLight.shadow.camera.right=20,this.dirLight.shadow.camera.top=35,this.dirLight.shadow.camera.bottom=-10,this.dirLight.shadow.bias=-5e-4,this.scene.add(this.dirLight),this.scene.add(this.dirLight.target),this.environment=new Hn(this.scene),this.coinBatch=new qa(this.scene),this.entityBatch=new sl(this.scene),this.setLobbyCamera(0)}reset(){for(this.distance=0,this.nextPatternZ=45,this.patternIndex=0,this.featureState=null,this.challengeState=null,this.challengeRewards=0,Object.assign(this.challengePrevious,{x:0,y:0,z:0,isSliding:!1,slideTimer:0}),this.clearEntities(),this.environment&&this.environment.reset();this.nextPatternZ<220;){let t=this.generatePattern(this.nextPatternZ);this.nextPatternZ+=t||45+Math.random()*12}this.wingFlight?.reset()}clearEntities(){this.trains.forEach(t=>t.destroy()),this.ramps.forEach(t=>t.destroy()),this.barriers.forEach(t=>t.destroy()),this.coins.forEach(t=>t.destroy()),this.props.forEach(t=>t.destroy()),this.features.forEach(t=>t.destroy()),this.challengeKit?.clear(),this.trains=[],this.ramps=[],this.barriers=[],this.coins=[],this.props=[],this.features=[],this.challenges=[],this.challengeState=null,this.challengeRewards=0,this.coinBatch?.clear(),this.entityBatch?.clear(),this.wingFlight?.reset()}generatePattern(t){let e=[-1,0,1],i=Math.random(),n=this.patternIndex++;if(this.challengeKit&&n%5===0){let s=this.challengeKit.acquire(t);return this.challenges.push(s),s.support&&this.ramps.push(s.support),s.length+35}if(this.obstacleKit&&n%4===0){let s=n===0?0:e[Math.floor(Math.random()*e.length)];if(this.features.push(new nl(this.scene,this.obstacleKit,s,t+6)),this.mapId==="store")this.spawnCoinLine(s,t+4,12,.9);else for(let o=0;o<10;o++){let a=o/9;this.coins.push(new bi(this.scene,s,t+8+a*24,.9+Math.sin(a*Math.PI)*3.8))}this.spawnCoinLine(s===0?-1:0,t+1,7,.9);return}if(Math.random()<.08){let s=["milk","magnet","shoe","shield"],o=s[Math.floor(Math.random()*s.length)],a=e[Math.floor(Math.random()*e.length)];this.props.push(new Cs(this.scene,a,t+5,o))}if(i<.35){let s=e[Math.floor(Math.random()*e.length)],o=new al(this.scene,s,t,this.obstacleKit);this.ramps.push(o);for(let u=0;u<6;u++){let d=t+1.5+u*1.8,f=u/6*o.height+.9;this.coins.push(new bi(this.scene,s,d,f))}let a=t+o.length,l=Math.random()<.55,c=l?new Is(this.scene,s,a,{kind:Math.random()<.5?"bus":"truck",mapId:this.mapId,length:ot.WORLD.LONG_VEHICLE_LENGTH}):new Dr(this.scene,s,a,0,this.obstacleKit);if(this.trains.push(c),l){for(let u of[ot.WORLD.VEHICLE_ROOF_FIRST_BARRIER,ot.WORLD.VEHICLE_ROOF_FIRST_BARRIER+ot.WORLD.VEHICLE_ROOF_BARRIER_GAP])this.barriers.push(new Sn(this.scene,c,this.obstacleKit,Math.random()<.5?"jump":"slide",u));for(let u of[4,70,170])this.spawnCoinLine(s,a+u,8,c.height+.85)}else{this.barriers.push(new Sn(this.scene,c,this.obstacleKit));for(let u=0;u<5;u++)this.coins.push(new bi(this.scene,s,a+2.5+u*2.2,c.height+.85))}let h=e.filter(u=>u!==s);if(this.spawnCoinLine(h[0],t,5,.9),l)return o.length+c.length+ot.WORLD.VEHICLE_ROUTE_EXIT_GAP}else if(i<.6){let s=e[Math.floor(Math.random()*e.length)],o=Math.random()<.65,a=this.trains.some(h=>h instanceof Is&&h.isRideable),l=o?new Is(this.scene,s,t,{kind:"hatchback",mapId:this.mapId}):new Dr(this.scene,s,t,this.obstacleKit||a?0:12,this.obstacleKit);this.trains.push(l),o||this.barriers.push(new Sn(this.scene,l,this.obstacleKit));let c=e.find(h=>h!==s);this.spawnCoinLine(c,t-5,6,.9)}else if(i<.8){let s=e[Math.floor(Math.random()*e.length)];this.barriers.push(new Gn(this.scene,s,t,this.obstacleKit)),this.spawnCoinArc(s,t,5);let o=e.find(a=>a!==s);this.barriers.push(new zn(this.scene,o,t,this.obstacleKit)),this.spawnCoinLine(o,t-8,4,.4)}else e.forEach(s=>{this.spawnCoinLine(s,t-10,5,.9)})}spawnCoinLine(t,e,i,n=.9){for(let s=0;s<i;s++)this.coins.push(new bi(this.scene,t,e+s*2.2,n))}spawnCoinArc(t,e,i=5){for(let n=0;n<i;n++){let s=(n-(i-1)/2)/((i-1)/2),o=.9+(1-s*s)*1.8;this.coins.push(new bi(this.scene,t,e-4+n*2,o))}}update(t,e,i){if(this.distance=i.z,this.dirLight.position.z=i.z-15,this.dirLight.target.position.set(0,0,i.z+20),this.dirLight.target.updateMatrixWorld(),this.environment.update(i.z,t),this.updateFeatures(t,i),this.updateChallenges(t,e,i),this.trains.forEach(s=>s.update(t)),this.barriers.forEach(s=>s.update?.(t)),this.coins.forEach(s=>s.update(t)),this.props.forEach(s=>s.update(t)),i.props.magnet>0||i.props.milk>0)for(let s of this.coins)s.collected||Math.hypot(s.mesh.position.x-i.x,s.mesh.position.z-i.z)<ot.MAGNET_RANGE&&(s.mesh.position.x+=(i.x-s.mesh.position.x)*Math.min(1,t*10),s.mesh.position.z+=(i.z-s.mesh.position.z)*Math.min(1,t*10),s.mesh.position.y+=(i.y+1-s.mesh.position.y)*Math.min(1,t*10));for(;this.nextPatternZ<i.z+180;){let s=this.generatePattern(this.nextPatternZ);this.nextPatternZ+=s||42+Math.random()*10}this.wingFlight.update(i,e),this.cleanupBehind(i.z-25),this.updateCamera(t,i)}setLobbyCamera(t=0){let e=this.stableLobbyCamera?0:Math.sin(t*.75)*.04,i=this.stableLobbyCamera?0:Math.cos(t*1.1)*.025;this.camera.position.set(e,1.25+i,-3.6),this.camera.lookAt(0,.9,0)}updateTransitionCamera(t,e){let i=1-Math.pow(1-t,3),n=0,s=1.25,o=-3.6,a=e.x*.78,l=e.y*.5+ot.CAMERA.OFFSET_Y,c=e.z+ot.CAMERA.OFFSET_Z,h=0,u=.9,d=0,f=e.x*.55,m=e.y*.5+ot.CAMERA.LOOK_OFFSET_Y,y=e.z+ot.CAMERA.LOOK_OFFSET_Z;this.camera.position.x=oe.lerp(n,a,i),this.camera.position.y=oe.lerp(s,l,i),this.camera.position.z=oe.lerp(o,c,i);let g=oe.lerp(h,f,i),p=oe.lerp(u,m,i),T=oe.lerp(d,y,i);this.camera.lookAt(g,p,T)}applyMapTheme(t){if(!t)return;this.mapId!==t.id&&(this.clearEntities(),this.entityBatch.dispose(),this.environment.dispose(),this.challengeKit?.dispose(),this.obstacleKit?.dispose(),this.mapId=t.id,this.obstacleKit=t.id==="egypt"?null:new il(t.id),this.challengeKit=this.obstacleKit?new cl(this.scene,this.obstacleKit):null,this.environment=t.id==="egypt"?new Hn(this.scene):new el(this.scene,{theme:t}),this.distance=0,this.nextPatternZ=45,this.patternIndex=0,this.featureState=null,this.challengeState=null,this.challengeRewards=0,Object.assign(this.challengePrevious,{x:0,y:0,z:0,isSliding:!1,slideTimer:0})),this.scene&&(t.skyColor&&(this.scene.background=new Ot(t.skyColor)),t.fogColor&&this.scene.fog&&(this.scene.fog.color=new Ot(t.fogColor),this.scene.fog.near=t.id==="egypt"?140:85,this.scene.fog.far=t.id==="egypt"?265:180)),this.dirLight&&t.sunColor&&(this.dirLight.color=new Ot(t.sunColor));let e=t.lighting;e&&(this.hemiLight.color.setHex(e.hemiSky),this.hemiLight.groundColor.setHex(e.hemiGround),this.hemiLight.intensity=e.hemiIntensity,this.dirLight.intensity=e.sunIntensity,this.dirLight.position.set(...e.sunPosition))}getSpeedMultiplier(t){return this.featureState?.type==="store"&&t.z<this.featureState.endZ&&Math.abs(t.x+this.featureState.lane*ot.LANE_WIDTH)<1.25?1.22:1}updateFeatures(t,e){if(e.isFlying){this.featureState=null,e.mapFeatureLabel="";return}this.featureState&&(this.featureState.time-=t,(this.featureState.time<=0||e.z>this.featureState.endZ)&&(this.featureState=null));for(let i of this.features){if(i.triggered||!e.isGrounded||e.y>.2||Math.abs(e.x+i.lane*ot.LANE_WIDTH)>1.25||Math.abs(e.z-i.z)>2.9)continue;i.triggered=!0;let n={store:"传送带加速",tea:"珍珠弹跳",pond:"鼓面弹跳",laundry:"暖风托举"}[this.mapId];this.featureState={type:this.mapId,lane:i.lane,time:1.35,endZ:i.z+35,label:n},this.mapId!=="store"&&(e.jump(),e.vy={tea:19,pond:20,laundry:17.5}[this.mapId])}e.mapFeatureLabel=this.featureState?.label||""}consumeChallengeRewards(){let t=this.challengeRewards;return this.challengeRewards=0,t}updateChallenges(t,e,i){this.challengeState=null;for(let s of this.challenges){if(i.isFlying||i.props.flight>0){for(let o of s.targets)o.z<=i.z&&!o.processed&&(o.processed=!0,s.state.remaining--,s.state.combo=0);s.state.active=s.state.remaining>0,s.state.feedback="",i.z>=s.launchZ&&(s.launchAttempted=!0);continue}this.challengeRewards+=s.update(t,e,i,this.challengePrevious),(s.state.active||s.feedbackTime>0)&&i.z>=s.startZ-30&&i.z<=s.endZ+16&&(this.challengeState=s.state)}i.mapChallengeLabel=this.challengeState?.title||"";let n=this.challengePrevious;n.x=i.x,n.y=i.y,n.z=i.z,n.isSliding=i.isSliding,n.slideTimer=i.slideTimer}updateCamera(t,e){let i=e.x*.78,n=Math.min(1,e.flightBlend||0),s=.5+.5*n,o=e.y*s+ot.CAMERA.OFFSET_Y,a=e.z+ot.CAMERA.OFFSET_Z;this.camera.position.x+=(i-this.camera.position.x)*Math.min(1,t*14),this.camera.position.y+=(o-this.camera.position.y)*Math.min(1,t*10),this.camera.position.z=a;let l=e.x*.55,c=e.y*s+ot.CAMERA.LOOK_OFFSET_Y*(1-.65*n),h=e.z+ot.CAMERA.LOOK_OFFSET_Z;this.camera.lookAt(l,c,h)}cleanupBehind(t){this.challenges=this.challenges.filter(e=>e.endZ<t?(e.destroy(),!1):!0),this.features=this.features.filter(e=>e.z+e.length<t?(e.destroy(),!1):!0),this.trains=this.trains.filter(e=>e.z+e.length<t?(e.destroy(),!1):!0),this.ramps=this.ramps.filter(e=>e.endZ<t?(e.destroy(),!1):!0),this.barriers=this.barriers.filter(e=>e.z<t?(e.destroy(),!1):!0),this.coins=this.coins.filter(e=>e.z<t||e.collected?(e.destroy(),!1):!0),this.props=this.props.filter(e=>e.z<t||e.collected?(e.destroy(),!1):!0)}render(){this.coinBatch.sync(this.coins);let t=this.renderEntities;t.length=0;for(let e of this.trains)t.push(e);for(let e of this.ramps)t.push(e);for(let e of this.barriers)t.push(e);for(let e of this.features)t.push(e);for(let e of this.challenges)t.push(e);this.entityBatch.sync(t),this.renderer.render(this.scene,this.camera)}};var Sh=(r,t,e)=>{let i=Math.max(e-Math.abs(r-t),0)/e;return Math.min(r,t)-i*i*e*.25};function ff(r){let t=.135*oe.smoothstep(r,1.58,1.93),e=.045*Math.exp(-(((r-1.75)/.13)**2));return t-e}function pf(r){let t=r.points[0].y,e=r.points[r.points.length-1].y,i=e-t,n={centerY:1.93,radiusY:.27,radiusX:.295,radiusZ:.265},s={centerY:1.075,radiusY:.44,radiusX:.605,radiusZ:.455},o=(b,x)=>{let S=Math.sqrt(Math.max(0,1-((x-b.centerY)/b.radiusY)**2));return[Math.max(.001,b.radiusX*S),Math.max(.001,b.radiusZ*S)]},a=(b,x,S,E)=>{let C=S-b.centerY,v=Math.hypot(x/b.radiusX,C/b.radiusY,E/b.radiusZ),w=Math.hypot(x/b.radiusX**2,C/b.radiusY**2,E/b.radiusZ**2);return w>1e-8?v*(v-1)/w:-Math.min(b.radiusX,b.radiusY,b.radiusZ)},l=(b,x)=>.008*Math.exp(-((b/.14)**4)-((x-1.955)/.075)**2),c=[];for(let b=0;b<=256;b++){let x=t+i*b/256,S=0,E=1;for(let v=0;v<18;v++){let w=(S+E)/2;r.getPoint(w).y<x?S=w:E=w}let C=r.getPoint((S+E)/2);c.push([Math.max(C.x,.001),Math.max(C.z,.001)])}let h=b=>{if(b>=n.centerY)return o(n,b);if(b<=s.centerY)return o(s,b);let x=oe.clamp((b-t)/i*256,0,256),S=Math.min(255,Math.floor(x)),E=x-S;return[oe.lerp(c[S][0],c[S+1][0],E),oe.lerp(c[S][1],c[S+1][1],E)]},u=(b,x,S)=>{let E=ff(x),C=S-E-(S>E?l(b,x):0);if(x>=n.centerY+.04)return a(n,b,x,C);if(x<=s.centerY-.04)return a(s,b,x,C);let[v,w]=h(x),A=(Math.hypot(b/v,C/w)-1)*Math.min(v,w);return x>n.centerY-.07?oe.lerp(A,a(n,b,x,C),oe.smoothstep(x,n.centerY-.07,n.centerY+.04)):x<s.centerY+.04?oe.lerp(a(s,b,x,C),A,oe.smoothstep(x,s.centerY-.04,s.centerY+.04)):A},f=new ei([new I(.275,1.54,.015),new I(.46,1.38,.31),new I(.475,1.23,.47),new I(.42,1.16,.54),new I(.31,1.16,.58)]).getPoints(20),m=b=>.112+.004*Math.sin(Math.PI*b)-.04*b*b-.01*b**4-.019*b**6,y=(b,x,S)=>{b=Math.abs(b);let E=1/0;for(let w=0;w<f.length-1;w++){let A=f[w],P=f[w+1],N=P.x-A.x,k=P.y-A.y,L=P.z-A.z,U=Math.hypot(N,k,L),H=b-A.x,V=x-A.y,et=S-A.z,X=(H*N+V*k+et*L)/U,J=Math.sqrt(Math.max(0,H*H+V*V+et*et-X*X)),j=m(w/20),Ct=(m((w+1)/20)-j)/U,wt=oe.clamp(X+Ct*J/Math.sqrt(1-Ct*Ct),0,U),ae=Math.hypot(J,X-wt)-j-Ct*wt;E=Math.min(E,ae)}let C=.045*(1-oe.smoothstep(x,1.36,1.48)),v=Sh(C-u(b,x,S),1.48-x,.025);return E=-Sh(-E,-v,.012),E};return{distance:(b,x,S)=>{let E=u(b,x,S),C=y(b,x,S),v=.075*oe.smoothstep(x,1.38,1.5);return v>1e-6?Sh(E,C,v):Math.min(E,C)},armWeight:(b,x,S)=>{let E=.025+.05*oe.smoothstep(x,1.38,1.5),C=oe.smoothstep(u(b,x,S)-y(b,x,S),-E,E),v=1-oe.smoothstep(x,1.43,1.59);return C*v},front:(b,x)=>{let[S,E]=h(x);return ff(x)+E*Math.sqrt(Math.max(0,1-(b/S)**2))+l(b,x)},armWrist:f[f.length-1],yBounds:[t,e],headCap:n}}function y_(r,t){let e=r.attributes.position,i=[],n=[];for(let s=0;s<e.count;s++){let o=e.getX(s),a=e.getY(s),l=e.getZ(s),c=t.armWeight(o,a,l);i.push(0,o>0?1:2,0,0),n.push(1-c,c,0,0)}r.setAttribute("skinIndex",new Pn(i,4)),r.setAttribute("skinWeight",new Ft(n,4))}function mf(r){let e=[-.759,r.yBounds[0]-.06,-.644],i=[67,Math.ceil((r.yBounds[1]-e[1]+.06)/.023)+1,67],[n,s,o]=i,a=n*s*o,l=new Float32Array(a),c=(A,P,N)=>(P*o+N)*n+A;for(let A=0;A<s;A++)for(let P=0;P<o;P++)for(let N=0;N<n;N++)l[c(N,A,P)]=r.distance(e[0]+N*.023,e[1]+A*.023,e[2]+P*.023);let h=A=>{let P=A%n,N=Math.floor(A/n),k=N%o,L=Math.floor(N/o);return[e[0]+P*.023,e[1]+L*.023,e[2]+k*.023]},u=[],d=[],f=[],m=new Map,y=(A,P)=>{A>P&&([A,P]=[P,A]);let N=A*a+P;if(m.has(N))return m.get(N);let k=h(A),L=h(P),U=l[A]/(l[A]-l[P]),H=k.map((J,j)=>oe.lerp(J,L[j],U)),V=.002,et=new I(r.distance(H[0]+V,H[1],H[2])-r.distance(H[0]-V,H[1],H[2]),r.distance(H[0],H[1]+V,H[2])-r.distance(H[0],H[1]-V,H[2]),r.distance(H[0],H[1],H[2]+V)-r.distance(H[0],H[1],H[2]-V)).normalize(),X=u.length/3;return u.push(...H),d.push(et.x,et.y,et.z),m.set(N,X),X},g=(A,P,N)=>{let k=new I().fromArray(u,A*3),L=new I().fromArray(u,P*3),U=new I().fromArray(u,N*3),H=L.sub(k).cross(U.sub(k)),V=new I().fromArray(d,A*3);H.dot(V)<0?f.push(A,N,P):f.push(A,P,N)},p=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];for(let A=0;A<s-1;A++)for(let P=0;P<o-1;P++)for(let N=0;N<n-1;N++){let k=[c(N,A,P),c(N+1,A,P),c(N+1,A+1,P),c(N,A+1,P),c(N,A,P+1),c(N+1,A,P+1),c(N+1,A+1,P+1),c(N,A+1,P+1)];if(!(k.every(L=>l[L]>=0)||k.every(L=>l[L]<0)))for(let L of p){let U=[],H=[];for(let V of L)(l[k[V]]<0?U:H).push(k[V]);if(U.length===1||U.length===3){let V=U.length===1?U[0]:H[0],et=U.length===1?H:U;g(...et.map(X=>y(V,X)))}else if(U.length===2){let V=y(U[0],H[0]),et=y(U[0],H[1]),X=y(U[1],H[0]),J=y(U[1],H[1]);g(V,et,X),g(et,J,X)}}}let T=Array.from({length:u.length/3},(A,P)=>P),b=A=>{for(;T[A]!==A;)T[A]=T[T[A]],A=T[A];return A};for(let A=0;A<f.length;A+=3)T[b(f[A])]=b(f[A+1]),T[b(f[A+1])]=b(f[A+2]);let x=new Map;for(let A=0;A<T.length;A++){let P=b(A);x.set(P,(x.get(P)||0)+1)}let S=[...x].sort((A,P)=>P[1]-A[1])[0],E=u,C=d,v=f;if(x.size>1&&S[1]>T.length*.995){E=[],C=[],v=[];let A=new Map;for(let P=0;P<T.length;P++)b(P)===S[0]&&(A.set(P,E.length/3),E.push(...u.slice(P*3,P*3+3)),C.push(...d.slice(P*3,P*3+3)));for(let P=0;P<f.length;P+=3)A.has(f[P])&&v.push(A.get(f[P]),A.get(f[P+1]),A.get(f[P+2]))}let w=new de;return w.setAttribute("position",new Ft(E,3)),w.setAttribute("normal",new Ft(C,3)),w.setIndex(v),y_(w,r),w}var De={none:{id:"none",price:0,name:"原味奶蛙",description:"暖黄色原装，软乎乎的大肚皮",icon:"🐸",color:"#ffd247",colors:{primary:16765511,secondary:16772546,accent:14530419}},nurse:{id:"nurse",price:800,name:"桃桃护理员",description:"桃粉制服、奶油围裙与软帽",icon:"🩺",color:"#efb6c6",colors:{primary:15709894,secondary:16775146,accent:13392253}},bandit:{id:"bandit",price:1200,name:"午夜小偷",description:"条纹衫、针织帽与迷你战利品袋",icon:"🦹",color:"#424651",colors:{primary:3422528,secondary:15724263,accent:10652589}},street:{id:"street",price:1500,name:"薄荷校队",description:"薄荷棒球衫、奶白袖口与鸭舌帽",icon:"🧢",color:"#8faf9a",colors:{primary:9416602,secondary:16774623,accent:4220757}},ufo:{id:"ufo",price:3600,name:"UFO临时工",description:"荧光工服、飞碟帽与接收天线",icon:"🛸",color:"#b6d66f",colors:{primary:11982447,secondary:6707081,accent:15727553}},tv:{id:"tv",price:4500,name:"雪花电视怪",description:"复古开放电视框、兔耳天线与调台钮",icon:"📺",color:"#bc9274",colors:{primary:4677224,secondary:15325367,accent:13206887}},jellyfish:{id:"jellyfish",price:6e3,name:"深海果冻",description:"透亮水母伞、卷曲触须与气泡制服",icon:"🪼",color:"#a99bcf",colors:{primary:11115471,secondary:10080213,accent:14997236}},mushroom:{id:"mushroom",price:2800,name:"孢子观察员",description:"珊瑚菌帽、奶白斑点与森林工作服",icon:"🍄",color:"#df877a",colors:{primary:6323816,secondary:16771800,accent:14649210}},zipper:{id:"zipper",price:8e3,name:"肚皮吞金兽",description:"酒红软帽、卡通拉链大嘴与小奶牙",icon:"🦷",color:"#874658",colors:{primary:8865368,secondary:16770232,accent:3157311}},dumpling:{id:"dumpling",price:2200,name:"逃跑小笼包",description:"褶皱包子帽、轻轻蒸汽与竹编制服",icon:"🥟",color:"#dfc396",colors:{primary:14664598,secondary:16774622,accent:7050362}}},xf={none:0,nurse:1,bandit:2,street:3,ufo:4,tv:5,jellyfish:6,mushroom:7,zipper:8,dumpling:9};for(let[r,t]of Object.entries(De))t.category=xf[r]>=4?"weird":"daily";var __=`
                float outfitHeight = smoothstep(.71, .75, vFrogRestPosition.y) *
                    (1.0 - smoothstep(1.565, 1.605, vFrogRestPosition.y));
                float outfitFront = smoothstep(.15, .25, vFrogRestPosition.z);
                if (frogOutfitId > .5 && frogOutfitId < 1.5) {
                    vec2 apronCoord = (vFrogRestPosition.xy - vec2(0.0, 1.17)) / vec2(.455, .365);
                    float apron = (1.0 - smoothstep(.97, 1.03, dot(apronCoord, apronCoord))) * vFrogBellyMask;
                    vec3 nurseCloth = mix(frogOutfitPrimary, frogOutfitSecondary, apron);
                    float cuff = smoothstep(.65, .9, vOutfitArmWeight) *
                        smoothstep(1.14, 1.16, vFrogRestPosition.y) *
                        (1.0 - smoothstep(1.20, 1.23, vFrogRestPosition.y));
                    nurseCloth = mix(nurseCloth, frogOutfitAccent, cuff);
                    diffuseColor.rgb = mix(diffuseColor.rgb, nurseCloth, outfitHeight);
                } else if (frogOutfitId > 1.5 && frogOutfitId < 2.5) {
                    float stripeWave = sin((vFrogRestPosition.y - .73) * 35.0);
                    float stripe = smoothstep(-.07, .07, stripeWave);
                    vec3 banditCloth = mix(frogOutfitPrimary, frogOutfitSecondary, stripe);
                    diffuseColor.rgb = mix(diffuseColor.rgb, banditCloth, outfitHeight);
                    float mask = smoothstep(1.998, 2.015, vFrogRestPosition.y) *
                        (1.0 - smoothstep(2.122, 2.144, vFrogRestPosition.y)) * outfitFront;
                    diffuseColor.rgb = mix(diffuseColor.rgb, frogOutfitPrimary, mask);
                } else if (frogOutfitId > 2.5 && frogOutfitId < 3.5) {
                    float sleeve = smoothstep(.18, .63, vOutfitArmWeight);
                    float placket = (1.0 - smoothstep(.014, .025, abs(vFrogRestPosition.x))) *
                        outfitFront * (1.0 - smoothstep(.12, .32, vOutfitArmWeight));
                    float collar = smoothstep(1.505, 1.52, vFrogRestPosition.y);
                    vec3 streetCloth = mix(frogOutfitPrimary, frogOutfitSecondary, max(sleeve, max(placket, collar)));
                    diffuseColor.rgb = mix(diffuseColor.rgb, streetCloth, outfitHeight);
                } else if (frogOutfitId > 3.5 && frogOutfitId < 4.5) {
                    float spaceSeam = smoothstep(1.33, 1.35, vFrogRestPosition.y) *
                        (1.0 - smoothstep(1.40, 1.42, vFrogRestPosition.y));
                    float spaceBelt = 1.0 - smoothstep(.017, .031, abs(vFrogRestPosition.y - .865));
                    vec3 spaceCloth = mix(frogOutfitPrimary, frogOutfitSecondary, max(spaceSeam, spaceBelt));
                    vec2 patchCoord = (vFrogRestPosition.xy - vec2(-.18, 1.47)) / vec2(.080, .048);
                    float spacePatch = (1.0 - smoothstep(.91, 1.05, dot(patchCoord, patchCoord))) * vFrogBellyMask;
                    spaceCloth = mix(spaceCloth, frogOutfitAccent, spacePatch);
                    diffuseColor.rgb = mix(diffuseColor.rgb, spaceCloth, outfitHeight);
                } else if (frogOutfitId > 4.5 && frogOutfitId < 5.5) {
                    float signal = 1.0 - smoothstep(.037, .055, abs(vFrogRestPosition.y - 1.17));
                    float tuning = smoothstep(-.015, .015, sin(vFrogRestPosition.x * 31.0));
                    vec3 tvCloth = mix(frogOutfitPrimary, mix(frogOutfitSecondary, frogOutfitAccent, tuning), signal);
                    float staticNoise = step(.86, fract(sin(dot(floor(vFrogRestPosition.xy * 51.0), vec2(12.9898, 78.233))) * 43758.5453));
                    tvCloth = mix(tvCloth, frogOutfitSecondary, staticNoise * .10);
                    diffuseColor.rgb = mix(diffuseColor.rgb, tvCloth, outfitHeight);
                } else if (frogOutfitId > 5.5 && frogOutfitId < 6.5) {
                    float oceanWave = smoothstep(-.16, .16, sin(vFrogRestPosition.y * 19.0 + vFrogRestPosition.x * 7.0));
                    vec3 jellyCloth = mix(frogOutfitPrimary, frogOutfitSecondary, oceanWave * .48);
                    vec2 bubbleCell = fract(vFrogRestPosition.xy * vec2(5.0, 7.0)) - .5;
                    float bubbleDistance = length(bubbleCell);
                    float bubble = smoothstep(.21, .24, bubbleDistance) * (1.0 - smoothstep(.27, .30, bubbleDistance));
                    jellyCloth = mix(jellyCloth, frogOutfitAccent, bubble * .65 * vFrogBellyMask);
                    diffuseColor.rgb = mix(diffuseColor.rgb, jellyCloth, outfitHeight);
                } else if (frogOutfitId > 6.5 && frogOutfitId < 7.5) {
                    float gardenBib = (1.0 - smoothstep(.36, .405, abs(vFrogRestPosition.x))) *
                        smoothstep(.87, .90, vFrogRestPosition.y) * (1.0 - smoothstep(1.43, 1.47, vFrogRestPosition.y)) * vFrogBellyMask;
                    vec3 gardenCloth = mix(frogOutfitPrimary, frogOutfitSecondary, gardenBib * .17);
                    vec2 mushroomCoord = vFrogRestPosition.xy - vec2(-.19, 1.455);
                    float pinCap = (1.0 - smoothstep(.93, 1.06, dot(mushroomCoord / vec2(.061, .030), mushroomCoord / vec2(.061, .030)))) *
                        smoothstep(-.008, -.001, mushroomCoord.y) * vFrogBellyMask;
                    float pinStem = (1.0 - smoothstep(.009, .015, abs(mushroomCoord.x))) *
                        smoothstep(-.047, -.042, mushroomCoord.y) * (1.0 - smoothstep(-.005, .0, mushroomCoord.y)) * vFrogBellyMask;
                    gardenCloth = mix(gardenCloth, frogOutfitSecondary, pinStem);
                    gardenCloth = mix(gardenCloth, frogOutfitAccent, pinCap);
                    diffuseColor.rgb = mix(diffuseColor.rgb, gardenCloth, outfitHeight);
                } else if (frogOutfitId > 7.5 && frogOutfitId < 8.5) {
                    vec2 mouthCoord = vFrogRestPosition.xy - vec2(0.0, 1.055);
                    float mouthOval = dot(mouthCoord / vec2(.365, .135), mouthCoord / vec2(.365, .135));
                    float bellyMouth = (1.0 - smoothstep(.95, 1.02, mouthOval)) * vFrogBellyMask;
                    float toothPhase = abs(fract((mouthCoord.x + .41) * 15.5) - .5) * 2.0;
                    float tooth = smoothstep(.052 + .045 * toothPhase, .058 + .045 * toothPhase, abs(mouthCoord.y));
                    vec3 mouthCloth = mix(frogOutfitAccent, frogOutfitSecondary, tooth);
                    vec3 zipperCloth = mix(frogOutfitPrimary, mouthCloth, bellyMouth);
                    float teethTrack = (1.0 - smoothstep(.025, .047, abs(mouthOval - 1.19))) * vFrogBellyMask;
                    zipperCloth = mix(zipperCloth, frogOutfitSecondary, teethTrack * .50);
                    diffuseColor.rgb = mix(diffuseColor.rgb, zipperCloth, outfitHeight);
                } else if (frogOutfitId > 8.5 && frogOutfitId < 9.5) {
                    float bamboo = smoothstep(.48, .56, fract((vFrogRestPosition.x + vFrogRestPosition.y) * 26.0)) *
                        smoothstep(.48, .56, fract((vFrogRestPosition.y - vFrogRestPosition.x) * 26.0));
                    vec3 dumplingCloth = mix(frogOutfitPrimary, frogOutfitSecondary, .22 + bamboo * .16);
                    float flourBib = smoothstep(1.24, 1.27, vFrogRestPosition.y) * vFrogBellyMask;
                    dumplingCloth = mix(dumplingCloth, frogOutfitSecondary, flourBib);
                    float scallion = (1.0 - smoothstep(.015, .023, abs(vFrogRestPosition.x + .17))) *
                        smoothstep(1.375, 1.39, vFrogRestPosition.y) * (1.0 - smoothstep(1.465, 1.48, vFrogRestPosition.y)) * vFrogBellyMask;
                    dumplingCloth = mix(dumplingCloth, frogOutfitAccent, scallion);
                    diffuseColor.rgb = mix(diffuseColor.rgb, dumplingCloth, outfitHeight);
                }
`,fl=(r,t=24)=>new Ci(r.map(e=>new at(...e)),t),Eh=(r,t,e=12)=>new Ii(new ei(r.map(i=>new I(...i))),e,t,4,!1);function gf(r,t,e,i=Pe){let n=new i,s=-r/2,o=-t/2;return n.moveTo(s+e,o),n.lineTo(s+r-e,o),n.quadraticCurveTo(s+r,o,s+r,o+e),n.lineTo(s+r,o+t-e),n.quadraticCurveTo(s+r,o+t,s+r-e,o+t),n.lineTo(s+e,o+t),n.quadraticCurveTo(s,o+t,s,o+t-e),n.lineTo(s,o+e),n.quadraticCurveTo(s,o,s+e,o),n}function v_(){let r=gf(.79,.63,.075);r.holes.push(gf(.625,.495,.055,Ki));let t=new qe(r,{depth:.39,steps:1,bevelEnabled:!0,bevelThickness:.013,bevelSize:.01,bevelSegments:2,curveSegments:4});return t.translate(0,0,-.195),t}function b_(){let r=fl([[0,-.035],[.23,-.035],[.34,-.01],[.35,.055],[.3,.15],[.205,.235],[.08,.265],[0,.275]],40),t=r.attributes.position;for(let e=0;e<t.count;e++){let i=t.getX(e),n=t.getZ(e),s=t.getY(e),o=1+.055*Math.cos(Math.atan2(n,i)*10)*Math.sin(oe.clamp((s+.035)/.31,0,1)*Math.PI);t.setXYZ(e,i*o,s,n*o)}return r.computeVertexNormals(),r}var pl=class{constructor(t){this.character=t,this.group=new Nt,this.group.name="outfitAccessories",t.bodyGroup.add(this.group),this.uniform={value:0},this.uniforms={frogOutfitId:this.uniform,frogOutfitPrimary:{value:new Ot},frogOutfitSecondary:{value:new Ot},frogOutfitAccent:{value:new Ot}},this.geometries={sphere:new ye(1,12,8),box:new ee(1,1,1),ring:new Le(1,.035,4,24),bonnet:new Ci([[0,-.04],[.2,-.04],[.22,-.015],[.22,.055],[.16,.1],[0,.12]].map(e=>new at(...e)),24),cap:new Ci([[0,-.045],[.178,-.045],[.2,-.02],[.2,.04],[.14,.095],[0,.11]].map(e=>new at(...e)),24),cylinder:new ue(1,1,1,8),saucer:fl([[0,-.035],[.15,-.035],[.36,-.015],[.43,.027],[.43,.05],[.32,.072],[.15,.105],[0,.11]],32),television:v_(),jellyBell:fl([[0,-.02],[.29,-.02],[.395,0],[.41,.06],[.37,.18],[.27,.28],[.13,.335],[0,.355]]),jellyTendril:Eh([[0,0,0],[.043,-.11,.007],[.007,-.23,.015],[.05,-.34,-.012],[.03,-.44,.02]],.012),mushroom:fl([[0,-.025],[.34,-.025],[.42,0],...Array.from({length:7},(e,i)=>{let n=Math.PI/2*(1-(i+1)/7);return[.42*Math.sin(n),.3*Math.cos(n)]})]),bun:b_(),bunPleat:Eh([[.245,.025,0],[.22,.14,0],[.12,.235,0],[.025,.274,0]],.009,10),steam:Eh([[0,0,0],[-.024,.06,0],[.028,.12,.005],[0,.19,0]],.007,12)},this.materials={cream:new xt({color:De.nurse.colors.secondary,roughness:.92}),pink:new xt({color:De.nurse.colors.accent,roughness:.9}),dark:new xt({color:De.bandit.colors.primary,roughness:.98}),lilac:new xt({color:De.bandit.colors.accent,roughness:.95}),mint:new xt({color:De.street.colors.primary,roughness:.92}),ink:new xt({color:De.street.colors.accent,roughness:.92}),violet:new xt({color:De.ufo.colors.secondary,roughness:.62}),lime:new xt({color:De.ufo.colors.primary,roughness:.72}),television:new xt({color:12358260,roughness:.86}),jelly:new xt({color:De.jellyfish.colors.primary,transparent:!0,opacity:.76,depthWrite:!1,roughness:.36}),aqua:new xt({color:De.jellyfish.colors.secondary,roughness:.68}),jellyInk:new xt({color:8680113,roughness:.72}),coral:new xt({color:De.mushroom.colors.accent,roughness:.87}),wine:new xt({color:De.zipper.colors.primary,roughness:.96}),gold:new xt({color:15252858,roughness:.55,metalness:.12}),flour:new xt({color:De.dumpling.colors.secondary,roughness:.96}),doughFold:new xt({color:14205342,roughness:.96}),steam:new xt({color:16774887,transparent:!0,opacity:.65,depthWrite:!1,roughness:1})},this.accessories={},this.buildNurse(),this.buildBandit(),this.buildStreet(),this.buildUFO(),this.buildTelevision(),this.buildJellyfish(),this.buildMushroom(),this.buildZipper(),this.buildDumpling(),this.equip("none")}mesh(t,e,i,n,s){let o=new _t(this.geometries[e],this.materials[i]);return o.scale.set(...n),o.position.set(...s),o.castShadow=!1,o.receiveShadow=!1,t.add(o),o}makeGroup(t){let e=new Nt;return e.name=`${t}OutfitAccessories`,this.group.add(e),this.accessories[t]=e,e}instances(t,e,i,n,s){let o=new li(this.geometries[e],this.materials[i],n.length),a=new Xt,l=new Xe;return n.forEach((c,h)=>{c.normal?l.setFromUnitVectors(new I(0,0,1),new I(...c.normal).normalize()):l.setFromEuler(new $e(...c.rotation??[0,0,0])),a.compose(new I(...c.position),l,new I(...c.scale)),o.setMatrixAt(h,a)}),o.instanceMatrix.needsUpdate=!0,o.computeBoundingBox(),o.computeBoundingSphere(),o.name=s,t.add(o),o}rod(t,e,i,n,s){let o=new I(...i),a=new I(...n),l=a.clone().sub(o),c=this.mesh(t,"cylinder",e,[s,l.length(),s],o.clone().add(a).multiplyScalar(.5).toArray());return c.quaternion.setFromUnitVectors(new I(0,1,0),l.normalize()),c}buildNurse(){let t=this.makeGroup("nurse");this.mesh(t,"bonnet","cream",[1,1,1],[0,2.185,.135]).name="nurseSoftHat";let e=this.mesh(t,"ring","pink",[.211,.211,.16],[0,2.169,.135]);e.rotation.x=Math.PI/2,this.mesh(t,"box","pink",[.08,.02,.015],[0,2.226,.353]),this.mesh(t,"box","pink",[.022,.075,.015],[0,2.226,.353]);let i=-.16,n=1.465,s=this.character.surface.front(i,n);this.mesh(t,"sphere","cream",[.047,.047,.012],[i,n,s+.012]).name="nurseChestBadge",this.mesh(t,"box","pink",[.04,.011,.012],[i,n,s+.025]),this.mesh(t,"box","pink",[.011,.04,.012],[i,n,s+.025])}buildBandit(){let t=this.makeGroup("bandit");this.mesh(t,"cap","dark",[1,1,1],[0,2.19,.135]).name="banditBeanie",this.mesh(t,"sphere","lilac",[.17,.225,.125],[.24,.9,-.525]).name="banditLootSack",this.mesh(t,"sphere","dark",[.063,.029,.042],[.24,1.092,-.525]),this.mesh(t,"sphere","lilac",[.066,.07,.044],[.24,1.14,-.525])}buildStreet(){let t=this.makeGroup("street");this.mesh(t,"cap","mint",[1,.82,.93],[0,2.195,.135]).name="streetBaseballCap",this.mesh(t,"sphere","mint",[.175,.014,.125],[0,2.175,.302]).name="streetCapBrim";for(let o of[1.37,1.19])this.mesh(t,"sphere","ink",[.013,.013,.005],[0,o,this.character.surface.front(0,o)+.007]);let e=-.18,i=1.425,n=this.character.surface.front(e,i);this.mesh(t,"sphere","cream",[.052,.055,.009],[e,i,n+.013]).name="streetChestPatch";for(let o of[-.017,.017])this.mesh(t,"box","ink",[.008,.046,.01],[e+o,i,n+.024]);let s=this.mesh(t,"box","ink",[.007,.053,.01],[e,i,n+.024]);s.rotation.z=.6}buildUFO(){let t=this.makeGroup("ufo");this.mesh(t,"saucer","violet",[1,1,1],[0,2.18,.135]).name="ufoSaucerHat",this.mesh(t,"sphere","lime",[.19,.13,.17],[0,2.293,.135]).name="ufoCockpit";let e=this.mesh(t,"ring","gold",[.425,.425,.18],[0,2.219,.135]);e.rotation.x=Math.PI/2,this.rod(t,"violet",[0,2.37,.135],[.035,2.54,.135],.012).name="ufoAntenna",this.mesh(t,"sphere","lime",[.036,.036,.036],[.035,2.54,.135]),this.instances(t,"sphere","lime",Array.from({length:6},(i,n)=>{let s=n*Math.PI/3;return{position:[Math.sin(s)*.377,2.211,.135+Math.cos(s)*.377],scale:[.023,.014,.023]}}),"ufoLandingLights")}buildTelevision(){let t=this.makeGroup("tv");this.mesh(t,"television","television",[1,1,1],[0,2.08,.145]).name="televisionOpenFrame",this.mesh(t,"box","television",[.71,.53,.05],[0,2.08,-.16]).name="televisionBackPanel";for(let e of[2.035,2.14]){let i=this.mesh(t,"sphere","dark",[.04,.04,.026],[.413,e,.335]);i.name="televisionTuningKnob"}for(let e of[-1,1]){let i=[e*.22,2.64,.095];this.rod(t,"dark",[e*.095,2.365,.095],i,.011).name="televisionRabbitAntenna",this.mesh(t,"sphere","gold",[.023,.023,.023],i)}}buildJellyfish(){let t=this.makeGroup("jellyfish");this.mesh(t,"jellyBell","jelly",[1,1,1],[0,2.19,.135]).name="jellyfishTranslucentBell";let e=this.mesh(t,"ring","aqua",[.393,.393,.22],[0,2.202,.135]);e.rotation.x=Math.PI/2;let i=[];for(let n of[-1,1])for(let s=0;s<3;s++){let o=n*(.363+s*.016),a=-.025+s*.135,l=this.mesh(t,"jellyTendril",s===1?"aqua":"jellyInk",[1,1,1],[o,2.19,a]);n<0&&(l.rotation.y=Math.PI),l.name="jellyfishSideTendril",i.push({position:[o+n*.03,1.75,a+n*.02],scale:[.022,.024,.022]})}this.instances(t,"sphere","aqua",i,"jellyfishPearlTips")}buildMushroom(){let t=this.makeGroup("mushroom");this.mesh(t,"mushroom","coral",[1,1,1],[0,2.195,.135]).name="mushroomCoralCap";let e=this.mesh(t,"ring","cream",[.403,.403,.25],[0,2.197,.135]);e.rotation.x=Math.PI/2;let i=this.mesh(t,"ring","cream",[.367,.305,.48],[0,1.625,-.012]);i.rotation.x=Math.PI/2,i.name="mushroomSoftCollar";let n=[[.355,-1.05],[.35,-.35],[.35,.45],[.355,1.15],[.22,0],[.33,3.2],[.26,4.5]].map(([s,o],a)=>{let l=Math.sin(o)*s,c=Math.cos(o)*s,h=.3*Math.sqrt(1-(s/.42)**2),u=new I(l/.42**2,h/.3**2,c/.42**2).normalize();return{position:[l+u.x*.006,2.195+h+u.y*.006,.135+c+u.z*.006],scale:[.043+a%3*.008,.043+a%3*.008,.006],normal:u.toArray()}});this.instances(t,"sphere","cream",n,"mushroomMilkSpots")}buildZipper(){let t=this.makeGroup("zipper");this.mesh(t,"cap","wine",[1,1,1],[0,2.19,.135]).name="zipperPlushBeanie";for(let o of[-1,1]){let a=this.mesh(t,"sphere","cream",[.034,.07,.034],[o*.135,2.287,.135]);a.rotation.z=-o*.3,a.name="zipperSoftToothEar"}let e=.412,i=1.075,n=this.character.surface.front(e,i),s=this.mesh(t,"ring","gold",[.047,.061,.55],[e,i,n+.037]);s.rotation.y=.59,s.name="zipperGoldPull",this.mesh(t,"box","gold",[.031,.058,.025],[e,i+.067,n+.038]).name="zipperSlider"}buildDumpling(){let t=this.makeGroup("dumpling");this.mesh(t,"bun","flour",[1,1,1],[0,2.185,.135]).name="dumplingPleatedHat",this.instances(t,"bunPleat","doughFold",Array.from({length:6},(e,i)=>({position:[0,2.185,.135],scale:[1,1,1],rotation:[0,i*Math.PI/3,0]})),"dumplingGatheredFolds"),this.mesh(t,"sphere","flour",[.074,.035,.074],[0,2.453,.135]).name="dumplingPinchedTop",this.instances(t,"steam","steam",[-1,0,1].map((e,i)=>({position:[e*.105,2.48-i%2*.005,.12+Math.abs(e)*.017],scale:[.85,1-Math.abs(e)*.15,.85],rotation:[0,e*.3,0]})),"dumplingSteamWisps")}equip(t){this.skinId=Object.prototype.hasOwnProperty.call(De,t)?t:"none";let e=De[this.skinId];this.uniform.value=xf[this.skinId];for(let i of["primary","secondary","accent"]){let n=`frogOutfit${i[0].toUpperCase()}${i.slice(1)}`;this.uniforms[n].value.setHex(e.colors[i])}this.group.visible=this.skinId!=="none";for(let[i,n]of Object.entries(this.accessories))n.visible=i===this.skinId;return this.skinId}patchShader(t){if(Object.assign(t.uniforms,this.uniforms),t.fragmentShader.includes("uniform float frogOutfitId;"))return t;let e="vec2 eyeCoord =";if(!t.fragmentShader.includes(e))throw new Error("Outfits require the reference frog surface shader");return t.vertexShader=`varying float vOutfitArmWeight;
`+t.vertexShader,t.vertexShader=t.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
                vOutfitArmWeight = 0.0;
                #ifdef USE_SKINNING
                    vOutfitArmWeight = skinWeight.y;
                #endif`),t.fragmentShader=`uniform float frogOutfitId;
            uniform vec3 frogOutfitPrimary;
            uniform vec3 frogOutfitSecondary;
            uniform vec3 frogOutfitAccent;
            varying float vOutfitArmWeight;
`+t.fragmentShader,t.fragmentShader=t.fragmentShader.replace(e,__+`
                `+e),t}dispose(){this.disposed||(this.disposed=!0,this.group.traverse(t=>{t.isInstancedMesh&&t.dispose()}),this.group.removeFromParent(),Object.values(this.geometries).forEach(t=>t.dispose()),Object.values(this.materials).forEach(t=>t.dispose()))}};var ml=class{constructor(){this.group=new Nt,this.runCycle=0,this.lateralTilt=0,this.bodyGroup=null,this.bodyMesh=null,this.bellyMesh=null,this.tailMesh=null,this.leftArm=null,this.rightArm=null,this.leftLeg=null,this.rightLeg=null,this.leftFoot=null,this.rightFoot=null,this.rocketMesh=null,this.shieldMesh=null,this.magnetMesh=null,this.lobbyMode=!1,this.lobbyTime=0,this.isInteracting=!1,this.interactTime=0,this.buildCharacter(),this.group.scale.set(.72,.72,.72)}buildCharacter(){let t=new xt({color:16765511,roughness:.86,metalness:0}),e=new xt({color:6443820,roughness:.92}),i=new xt({color:9091405,roughness:.7}),n=new xt({color:527109,roughness:.45});this.bodyGroup=new Nt,this.group.add(this.bodyGroup),this.bodyProfile=new ei([[0,.635,0],[.3,.69,.25],[.5,.83,.42],[.59,.99,.5],[.605,1.075,.455],[.6,1.12,.46],[.545,1.31,.415],[.445,1.49,.345],[.345,1.66,.3],[.315,1.78,.28],[.305,1.85,.275],[.295,1.93,.265],[0,2.2,0]].map(c=>new I(...c)),!1,"centripetal"),this.surface=pf(this.bodyProfile),this.buildArms(t,e);let s=mf(this.surface),o=[],a=s.attributes.position;for(let c=0;c<a.count;c++){let h=a.getX(c),u=a.getY(c),d=a.getZ(c),f=d>0?1-oe.smoothstep(d-this.frontSurface(h,u),.025,.09):0;o.push(f*(1-oe.smoothstep(s.attributes.skinWeight.getY(c),.5,.9)))}s.setAttribute("frogBellyMask",new Ft(o,1));let l=t.clone();l.onBeforeCompile=c=>{c.uniforms.frogCream={value:new Ot(16772546)},c.uniforms.frogEyeGreen={value:i.color.clone()},c.uniforms.frogPupil={value:n.color.clone()},c.vertexShader=`attribute float frogBellyMask;
                varying vec3 vFrogRestPosition;
                varying float vFrogBellyMask;
`+c.vertexShader,c.vertexShader=c.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
                vFrogRestPosition = position;
                vFrogBellyMask = frogBellyMask;`),c.fragmentShader=`uniform vec3 frogCream;
                uniform vec3 frogEyeGreen;
                uniform vec3 frogPupil;
                varying vec3 vFrogRestPosition;
                varying float vFrogBellyMask;
`+c.fragmentShader,c.fragmentShader=c.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
                vec2 bellyCoord = (vFrogRestPosition.xy - vec2(0.0, 1.235)) / vec2(.475, .355);
                float belly = (1.0 - smoothstep(.985, 1.015, dot(bellyCoord, bellyCoord))) * vFrogBellyMask;
                diffuseColor.rgb = mix(diffuseColor.rgb, frogCream, belly);
                vec2 eyeCoord = (vec2(abs(vFrogRestPosition.x), vFrogRestPosition.y) - vec2(.147, 2.07)) / vec2(.058, .061);
                float faceFront = step(.14, vFrogRestPosition.z);
                float eye = (1.0 - smoothstep(.96, 1.04, dot(eyeCoord, eyeCoord))) * faceFront;
                vec2 pupilCoord = (vec2(abs(vFrogRestPosition.x), vFrogRestPosition.y) - vec2(.150, 2.067)) / vec2(.030, .034);
                float pupil = (1.0 - smoothstep(.94, 1.06, dot(pupilCoord, pupilCoord))) * faceFront;
                diffuseColor.rgb = mix(diffuseColor.rgb, frogEyeGreen, eye);
                diffuseColor.rgb = mix(diffuseColor.rgb, frogPupil, pupil);`),this.outfits?.patchShader(c)},l.customProgramCacheKey=()=>"milky-frog-surface-eyes-outfits-v2",this.bodyMesh=this.addSkinnedMesh(s,l),this.bellyMesh=this.bodyMesh,this.buildEyesAndFace(t,i,n),this.buildLegsAndFeet(t,e),this.tailMesh=this.ellipsoid(this.bodyGroup,t,[.065,.075,.095],[0,.9,-.4]),this.buildPropAttachments(),this.wings=new rl(this.bodyGroup),this.outfits=new pl(this)}frontSurface(t,e){return this.surface.front(t,e)}addSkinnedMesh(t,e){let i=new er(t,e);return i.castShadow=!0,i.receiveShadow=!1,i.frustumCulled=!1,this.bodyGroup.add(i),i.bind(this.skeleton),i}addMesh(t,e,i){let n=new _t(e,i);return n.castShadow=!0,n.receiveShadow=!0,t.add(n),n}ellipsoid(t,e,i,n){let s=this.addMesh(t,new ye(1,24,16),e);return s.scale.set(...i),s.position.set(...n),s}buildEyesAndFace(t,e,i){let n=new xt({color:4797725,roughness:.9}),s=[];for(let a=0;a<=32;a++){let l=(a/32-.5)*.246,c=1.952+.025*(l/.123)**2;s.push(new I(l,c,this.frontSurface(l,c)+.008))}let o=this.addMesh(this.bodyGroup,new Ii(new ei(s),48,.005,8,!1),n);o.name="smileMouth",o.castShadow=!1,o.receiveShadow=!1;for(let a of[s[0],s[s.length-1]]){let l=this.ellipsoid(this.bodyGroup,n,[.005,.005,.005],a.toArray());l.castShadow=!1,l.receiveShadow=!1}}buildArms(t,e){let i=new Ln;i.name="torso",this.bodyGroup.add(i);let n=[i];for(let s of[1,-1]){let o=new Ln;o.name=s===1?"leftShoulder":"rightShoulder",o.position.set(s*.315,1.51,.015),i.add(o),n.push(o);let a=new Nt,l=this.surface.armWrist;a.position.set(s*(l.x-.315-.05),l.y-1.51-.005,l.z-.015+.005),a.rotation.z=-s*1.12,this.ellipsoid(a,e,[.08,.092,.057],[0,0,0]);for(let c=0;c<3;c++)this.ellipsoid(a,e,[.027,.06,.034],[(c-1)*.043,-.059,.012]);this.ellipsoid(a,e,[.034,.05,.034],[-s*.065,.018,.018]),o.add(a),s===1?this.leftArm=o:this.rightArm=o}this.bodyGroup.updateMatrixWorld(!0),this.skeleton=new ir(n)}buildLegsAndFeet(t,e){for(let i of[1,-1]){let n=new Nt;n.position.set(i*.25,.745,0);let s=new ei([new I(0,-.7,0),new I(.052,-.67,0),new I(.062,-.61,0),new I(.12,-.43,0),new I(.175,-.19,0),new I(.16,.04,0),new I(0,.16,0)]),o=new Ci(s.getPoints(32).map(l=>new at(l.x,l.y)),32);o.scale(1,1,1.05),this.addMesh(n,o,t);let a=new Nt;a.position.set(0,-.68,.085),this.ellipsoid(a,e,[.14,.068,.175],[0,.012,.04]);for(let l=0;l<3;l++)this.ellipsoid(a,e,[.046,.052,.065],[(l-1)*.075,-.003,.175]);n.add(a),this.bodyGroup.add(n),i===1?(this.leftLeg=n,this.leftFoot=a):(this.rightLeg=n,this.rightFoot=a)}}buildPropAttachments(){this.rocketMesh=new Nt;let t=new ue(.15,.15,.55,16),e=new xt({color:16726072,roughness:.2}),i=new _t(t,e);i.rotation.x=Math.PI/2,this.rocketMesh.add(i);let n=new or(.14,.5,12);n.rotateX(Math.PI);let s=new we({color:16752410}),o=new _t(n,s);o.position.set(0,-.4,-.22),this.rocketMesh.add(o),this.rocketMesh.position.set(0,1.1,-.65),this.rocketMesh.visible=!1,this.bodyGroup.add(this.rocketMesh);let a=new ye(1.15,24,20),l=new xt({color:53971,transparent:!0,opacity:.42,roughness:.1,metalness:.8,side:Fe});this.shieldMesh=new _t(a,l),this.shieldMesh.position.set(0,1.05,0),this.shieldMesh.visible=!1,this.group.add(this.shieldMesh);let c=new Le(1.15,.06,12,32);c.rotateX(Math.PI/2);let h=new we({color:623843});this.magnetMesh=new _t(c,h),this.magnetMesh.position.set(0,.8,0),this.magnetMesh.visible=!1,this.group.add(this.magnetMesh)}setLobbyMode(t){this.lobbyMode=t,this.lobbyTime=0,this.isInteracting=!1,this.interactTime=0,t?(this.group.rotation.set(0,Math.PI,0),this.group.position.set(0,0,0),this.group.scale.set(.76,.76,.76),this.resetPoses()):(this.group.rotation.set(0,0,0),this.group.scale.set(.72,.72,.72),this.resetPoses())}resetPoses(){this.bodyGroup.position.set(0,0,0),this.bodyGroup.rotation.set(0,0,0),this.bodyGroup.scale.set(1,1,1),this.leftArm&&this.leftArm.rotation.set(0,0,0),this.rightArm&&this.rightArm.rotation.set(0,0,0),this.leftLeg&&(this.leftLeg.rotation.set(0,0,0),this.leftLeg.position.y=.745),this.rightLeg&&(this.rightLeg.rotation.set(0,0,0),this.rightLeg.position.y=.745),this.leftFoot&&this.leftFoot.rotation.set(0,0,0),this.rightFoot&&this.rightFoot.rotation.set(0,0,0)}updateLobby(t){this.lobbyTime+=t,this.wings.update(t,!1);let e=this.lobbyTime;if(this.rocketMesh&&(this.rocketMesh.visible=!1),this.shieldMesh&&(this.shieldMesh.visible=!1),this.magnetMesh&&(this.magnetMesh.visible=!1),this.isInteracting){this.interactTime+=t;let s=Math.abs(Math.sin(this.interactTime*14))*.28;this.bodyGroup.position.y=s,this.bodyGroup.rotation.z=Math.sin(this.interactTime*12)*.14,this.leftArm.rotation.z=-.55+Math.sin(this.interactTime*12)*.12,this.leftArm.rotation.x=-.2,this.rightArm.rotation.z=.55-Math.sin(this.interactTime*12)*.12,this.rightArm.rotation.x=-.2,this.bodyGroup.scale.set(1+.025*Math.sin(this.interactTime*20),1-.018*Math.sin(this.interactTime*20),1),this.leftLeg.rotation.x=Math.sin(this.interactTime*12)*.25,this.rightLeg.rotation.x=-Math.sin(this.interactTime*12)*.25,this.interactTime>1.25&&(this.isInteracting=!1,this.interactTime=0);return}let i=Math.sin(e*2.5)*.05;this.bodyGroup.scale.set(1+i*.12,1+i*.08,1+i*.12),this.bodyGroup.rotation.z=Math.sin(e*1.4)*.05,this.bodyGroup.rotation.y=Math.sin(e*.9)*.07,this.bodyGroup.position.y=Math.sin(e*2.8)*.02,this.leftArm.rotation.set(0,0,0),this.rightArm.rotation.set(0,0,0);let n=(e+4.3)%6.4;if(n<1.5){let s=Math.sin(n/1.5*Math.PI);this.rightArm.rotation.z=(.75+.1*Math.sin(n*10))*s,this.rightArm.rotation.x=-.16*s}else{let s=Math.sin(e*2.5)*.025;this.leftArm.rotation.x=s,this.rightArm.rotation.x=-s}this.tailMesh.rotation.y=Math.sin(e*3.2)*.28,this.leftLeg.rotation.set(0,0,0),this.rightLeg.rotation.set(0,0,0),this.leftFoot.rotation.set(0,0,0),this.rightFoot.rotation.set(0,0,0)}triggerInteract(){this.isInteracting=!0,this.interactTime=0}updateStartTransition(t){t===0&&this.resetPoses(),this.group.rotation.y=Math.PI*(1-t);let e=.76-t*(.76-.72);this.group.scale.set(e,e,e);let i=Math.sin(t*Math.PI)*.32;if(this.bodyGroup.position.y=i,this.bodyGroup.rotation.x=t*.12,t>.4){let n=(t-.4)/.6;this.leftLeg.rotation.x=Math.sin(n*Math.PI*2)*.7,this.rightLeg.rotation.x=-Math.sin(n*Math.PI*2)*.7,this.leftArm.rotation.x=-this.leftLeg.rotation.x*.6,this.rightArm.rotation.x=-this.rightLeg.rotation.x*.6}}update(t,e,i){let{isGrounded:n,isSliding:s,props:o,targetTilt:a}=i;this.wings.update(t,!!i.isFlying||i.flightBlend>.05),this.lateralTilt+=(a-this.lateralTilt)*Math.min(1,t*14),this.group.rotation.z=this.lateralTilt*.22,this.group.rotation.y=-this.lateralTilt*.18,this.rocketMesh.visible=o.milk>0,this.shieldMesh.visible=o.shield,this.magnetMesh.visible=o.magnet>0,this.magnetMesh.visible&&(this.magnetMesh.rotation.y+=t*6),i.isFlying||i.flightBlend>.05?this.animateFlight(t,i.flightBlend??1):s?this.animateSlide(t):n?this.animateRun(t,e):this.animateJump(t,i.vy)}animateFlight(t,e=1){this.bodyGroup.rotation.set(Math.PI/2*e,0,0),this.bodyGroup.position.set(0,.36*e,-.9*e),this.bodyGroup.scale.set(1,1,1),this.leftArm.rotation.set(-.08,0,-.28*e),this.rightArm.rotation.set(-.08,0,.28*e),this.leftLeg.rotation.set(.04,0,-.08),this.rightLeg.rotation.set(.04,0,.08),this.leftLeg.position.y=this.rightLeg.position.y=.745,this.leftFoot.rotation.x=this.rightFoot.rotation.x=.1,this.tailMesh.rotation.y*=.9}animateRun(t,e){let i=Math.min(e*.38,18);this.runCycle+=t*i;let n=Math.abs(Math.sin(this.runCycle))*.13;this.bodyGroup.position.y=n,this.bodyGroup.position.z=0;let s=Math.sin(this.runCycle)*.14;this.bodyGroup.rotation.z=s,this.bodyGroup.rotation.y=0;let o=Math.sin(this.runCycle)*.58;this.leftLeg.rotation.x=o,this.rightLeg.rotation.x=-o,o>0?(this.leftFoot.rotation.x=-.15,this.rightFoot.rotation.x=.95,this.rightLeg.position.y=.745+.06,this.leftLeg.position.y=.745):(this.rightFoot.rotation.x=-.15,this.leftFoot.rotation.x=.95,this.leftLeg.position.y=.745+.06,this.rightLeg.position.y=.745);let a=Math.sin(this.runCycle);this.leftArm.rotation.set(.35-a*.55,.3+a*.1,.55+a*.12),this.rightArm.rotation.set(.35+a*.55,-.3+a*.1,-.55+a*.12),this.tailMesh.rotation.y=Math.sin(this.runCycle*2)*.35,this.bodyGroup.scale.set(1,1,1),this.bodyGroup.rotation.x=.08}animateJump(t,e){this.bodyGroup.position.y=.08,this.bodyGroup.position.z=0,this.bodyGroup.rotation.z*=.8,this.bodyGroup.rotation.x=-.12,this.bodyGroup.scale.set(.92,1.15,.92),this.leftLeg.rotation.x=-.42,this.rightLeg.rotation.x=-.32,this.leftFoot.rotation.x=.65,this.rightFoot.rotation.x=.65,this.leftArm.rotation.x=-.45,this.leftArm.rotation.z=-.28,this.rightArm.rotation.x=-.45,this.rightArm.rotation.z=.28}animateSlide(t){this.bodyGroup.position.y=-.38,this.bodyGroup.position.z=0,this.bodyGroup.rotation.x=.9,this.bodyGroup.rotation.z*=.8,this.bodyGroup.scale.set(1.22,.62,1.3),this.leftLeg.rotation.x=.92,this.rightLeg.rotation.x=.92,this.leftFoot.rotation.x=.2,this.rightFoot.rotation.x=.2,this.leftArm.rotation.x=.55,this.rightArm.rotation.x=.55}animateCrash(){this.bodyGroup.rotation.x=-Math.PI/2.1,this.bodyGroup.position.y=-.42,this.leftLeg.rotation.x=.35,this.rightLeg.rotation.x=-.55}};var gl=class{constructor(t){this.scene=t,this.character=new ml,this.scene.add(this.character.group),this.reset()}reset(){this.lane=0,this.targetLane=0,this.x=0,this.y=0,this.z=0,this.vy=0,this.isGrounded=!0,this.isOnRoof=!1,this.isSliding=!1,this.slideTimer=0,this.pendingJumpCompletion=!1,this.pendingSlideCompletion=!1,this.targetTilt=0,this.invincibleTimer=0,this.dead=!1,this.mapFeatureLabel="",this.mapChallengeLabel="",this.flightLandingTimer=0,this.flightBlend=0,this.props={milk:0,magnet:0,shoe:0,shield:!1,flight:0},this.updateMeshPosition()}setLobbyMode(t){this.x=0,this.y=0,this.z=0,this.lane=0,this.targetLane=0,this.character.setLobbyMode(t),this.updateMeshPosition()}updateLobby(t){this.character.updateLobby(t)}triggerInteract(){this.character.triggerInteract()}updateStartTransition(t){this.character.updateStartTransition(t)}moveLeft(){this.dead||(this.targetLane>-1?(this.targetLane-=1,this.targetTilt=-1,fe.playSwitch(),he.vibrate(!0)):this.targetTilt=-.3)}moveRight(){this.dead||(this.targetLane<1?(this.targetLane+=1,this.targetTilt=1,fe.playSwitch(),he.vibrate(!0)):this.targetTilt=.3)}jump(){if(!(this.dead||this.isFlying)&&(this.isSliding=!1,this.slideTimer=0,this.pendingSlideCompletion=!1,this.isGrounded)){let t=this.props.shoe>0;this.vy=t?ot.PLAYER.SUPER_JUMP_FORCE:ot.PLAYER.JUMP_FORCE,this.isGrounded=!1,this.pendingJumpCompletion=!0,fe.playJump(),he.vibrate(!0)}}slide(){this.dead||this.isFlying||(this.isGrounded||(this.vy=-ot.PLAYER.GRAVITY*1.2),this.isSliding=!0,this.pendingSlideCompletion=!0,this.slideTimer=ot.PLAYER.SLIDE_DURATION,fe.playSlide(),he.vibrate(!0))}addProp(t){t==="shield"?this.props.shield=!0:ot.PROP_DURATION[t.toUpperCase()]&&(this.props[t]=ot.PROP_DURATION[t.toUpperCase()]),t==="flight"&&(this.flightLandingTimer=0,this.isSliding=!1,this.slideTimer=0,this.isGrounded=!1,this.isOnRoof=!1,this.vy=0,this.pendingJumpCompletion=this.pendingSlideCompletion=!1),fe.playProp(),he.vibrate(!1)}takeHit(){return this.isFlying||this.props.milk>0?!1:this.props.shield?(this.props.shield=!1,this.invincibleTimer=1.5,fe.playLaugh(),he.vibrate(!1),!1):this.invincibleTimer>0?!1:(this.dead=!0,this.pendingJumpCompletion=this.pendingSlideCompletion=!1,this.character.animateCrash(),fe.playCrash(),fe.playLaugh(),he.vibrate(!1),!0)}update(t,e,i){if(this.dead)return;let n=this.z,s=Math.round(-this.x/ot.LANE_WIDTH);this.z+=e*t;let o=-this.targetLane*ot.LANE_WIDTH;if(this.x+=(o-this.x)*Math.min(1,t*ot.LANE_SWITCH_SPEED),this.targetTilt+=(0-this.targetTilt)*Math.min(1,t*6),this.isFlying){if(this.props.flight>0)this.props.flight=Math.max(0,this.props.flight-t),this.y+=(ot.FLIGHT.HEIGHT-this.y)*(1-Math.exp(-t*7)),this.props.flight===0&&(this.flightLandingTimer=ot.FLIGHT.LANDING_DURATION);else{let h=this.flightLandingTimer;this.flightLandingTimer=Math.max(0,h-t);let u=Math.round(-this.x/ot.LANE_WIDTH),d=0;for(let f of i?.ramps||[])f.safeSupport&&f.lane===u&&(d=Math.max(d,f.getHeightAtZ(this.z)??0));this.y=d+Math.max(0,this.y-d)*(h>0?this.flightLandingTimer/h:0),this.flightLandingTimer===0&&(this.y=d,this.isGrounded=!0,this.invincibleTimer=ot.FLIGHT.LANDING_GRACE)}this.vy=0,this.isOnRoof=!1,this.isSliding=!1,this.props.flight>0?this.flightBlend+=(1-this.flightBlend)*(1-Math.exp(-t*9)):this.flightBlend=Math.min(this.flightBlend,this.flightLandingTimer/(ot.FLIGHT.LANDING_DURATION*.5)),this.tickProps(t),this.updateMeshPosition(),this.character.update(t,e,{isGrounded:this.isGrounded,isSliding:!1,props:this.props,targetTilt:this.targetTilt,vy:0,isFlying:this.isFlying,flightBlend:this.flightBlend});return}this.flightBlend*=Math.exp(-t*12);let a=0,l=!1,c=Math.round(-this.x/ot.LANE_WIDTH);if(i){if(i.ramps){for(let h of i.ramps)if(h.lane===c){let u=h.getHeightAtZ(this.z);u!==null&&u>a&&(a=u,u>=h.height*.8&&(l=!0))}}if(i.trains){for(let h of i.trains)if(h.isRideable!==!1&&h.lane===c&&this.z>=h.z&&this.z<=h.z+h.length){let u=this.isGrounded&&s===c&&(i.ramps||[]).some(d=>{if(d.lane!==c||Math.abs(d.endZ-h.z)>.01||Math.abs(d.height-h.height)>.01||n>d.endZ||this.z<d.endZ)return!1;let f=d.getHeightAtZ(n);return f!==null&&this.y>=f-.08});(this.y>=h.height-.45||u)&&(a=Math.max(a,h.height),l=!0)}}}this.isOnRoof=l,this.isGrounded?a>this.y?this.y=a:a<this.y&&(this.isGrounded=!1):(this.y+=this.vy*t,this.vy-=ot.PLAYER.GRAVITY*t,this.y<=a&&(this.y=a,this.vy=0,this.isGrounded=!0,this.pendingJumpCompletion&&(this.pendingJumpCompletion=!1,this.onActionCompleted?.("jump")))),this.isSliding&&(this.slideTimer-=t,this.slideTimer<=0&&(this.isSliding=!1,this.pendingSlideCompletion&&(this.pendingSlideCompletion=!1,this.onActionCompleted?.("slide")))),this.tickProps(t),this.updateMeshPosition(),this.character.update(t,e,{isGrounded:this.isGrounded,isSliding:this.isSliding,props:this.props,targetTilt:this.targetTilt,vy:this.vy,isFlying:!1,flightBlend:this.flightBlend})}get isFlying(){return this.props.flight>0||this.flightLandingTimer>0}tickProps(t){for(let e of["milk","magnet","shoe"])this.props[e]>0&&(this.props[e]-=t,this.props[e]<0&&(this.props[e]=0));this.invincibleTimer>0&&(this.invincibleTimer-=t)}updateMeshPosition(){this.character.group.position.set(this.x,this.y,this.z)}getBounds(){let t=this.isSliding?ot.PLAYER.SLIDE_HEIGHT:ot.PLAYER.COLLIDER_HEIGHT;return{x:this.x,y:this.y,z:this.z,width:ot.PLAYER.COLLIDER_WIDTH,height:t,depth:ot.PLAYER.COLLIDER_DEPTH,isSliding:this.isSliding}}};var M_={egypt:'<rect width="100" height="82" fill="#f3e8ce"/><circle cx="77" cy="20" r="10" fill="#ebbd54"/><path d="M3 68 34 22 65 68Z" fill="#cea766"/><path d="M34 22 65 68 42 68Z" fill="#b99156"/><path d="M49 68 72 36 97 68Z" fill="#e3c38b"/><path d="M0 70h100" stroke="#a58d61" stroke-width="2"/><rect x="8" y="60" width="84" height="5" rx="2" fill="#278f8b"/>',store:'<rect width="100" height="82" fill="#eaf1e5"/><rect x="6" y="12" width="33" height="58" rx="4" fill="#519488"/><rect x="10" y="17" width="25" height="40" rx="2" fill="#cce0d2"/><path d="M12 31h21M12 45h21" stroke="#519488" stroke-width="2"/><rect x="17" y="23" width="4" height="7" rx="1" fill="#e9bc62"/><rect x="25" y="38" width="5" height="7" rx="1" fill="#e07d66"/><rect x="65" y="22" width="26" height="48" rx="10" fill="#e78068"/><rect x="70" y="31" width="16" height="24" rx="2" fill="#fff0d8"/><path d="M76 35v16M72 43h8" stroke="#519488" stroke-width="3"/><path d="m42 66 11-19q3-5 6 0l11 19q2 4-3 4H45q-5 0-3-4" fill="#fff6e7" stroke="#d5c6ac"/><rect x="50" y="61" width="12" height="9" rx="1" fill="#344c40"/><path d="M0 74h100" stroke="#bccbb8" stroke-width="2"/>',tea:'<rect width="100" height="82" fill="#f6e9d7"/><path d="M0 61q18-7 34 0t34 0 32 0v21H0Z" fill="#cd9b6c"/><path d="m54 20 27-4-4 41H59Z" fill="#e5b987" stroke="#a67a50" stroke-width="2"/><path d="m56 24 23-3M65 11l10 24" stroke="#9a776a" stroke-width="5"/><rect x="52" y="16" width="31" height="7" rx="3" fill="#fff6e5"/><circle cx="65" cy="47" r="4" fill="#604a3b"/><circle cx="74" cy="49" r="4" fill="#604a3b"/><ellipse cx="30" cy="55" rx="23" ry="10" fill="#fff4df"/><path d="M8 56v9q23 13 46 0v-9" fill="#edcf9e"/><ellipse cx="30" cy="54" rx="23" ry="8" fill="#fff6e7"/><circle cx="19" cy="70" r="6" fill="#604a3b"/><circle cx="85" cy="68" r="8" fill="#604a3b"/><circle cx="19" cy="20" r="6" fill="none" stroke="#ddb58b" stroke-width="2"/>',pond:'<rect width="100" height="82" fill="#f5d9bb"/><circle cx="78" cy="20" r="11" fill="#eaa875"/><rect y="53" width="100" height="29" fill="#8dad8d"/><path d="M3 17q46 20 94 0" fill="none" stroke="#7b7551" stroke-width="1.5"/><path d="M19 24v4M38 30v4M59 30v4M79 24v4" stroke="#fff6cf" stroke-width="4" stroke-linecap="round"/><rect x="65" y="35" width="18" height="26" rx="2" fill="#526350"/><circle cx="74" cy="48" r="6" fill="#a7b99a"/><circle cx="74" cy="39" r="2" fill="#d8debd"/><ellipse cx="34" cy="65" rx="26" ry="12" fill="#5c8d5e"/><path d="m34 65 24-8-11 15Z" fill="#8dad8d"/><ellipse cx="33" cy="56" rx="16" ry="6" fill="#d99a73"/><path d="M17 56v7q16 9 32 0v-7" fill="#b46f54"/><ellipse cx="33" cy="55" rx="16" ry="5" fill="#f5dcbd"/>',laundry:'<rect width="100" height="82" fill="#efece7"/><path d="M0 68q7-14 21-7 12-15 26-5 9-8 19 0 23-8 34 9v17H0Z" fill="#fffaf0"/><rect x="8" y="36" width="35" height="35" rx="5" fill="#b7acbd"/><rect x="11" y="40" width="29" height="6" rx="2" fill="#e6dce6"/><circle cx="25" cy="58" r="10" fill="#706c80"/><circle cx="25" cy="58" r="7" fill="#e8e4ed"/><path d="M46 14q22 9 49 2" fill="none" stroke="#918375" stroke-width="2"/><path d="m53 18-4 5 6 7 4-3 3 20h16l1-20 4 3 6-7-5-5-9 5h-13Z" fill="#d9a17f"/><path d="m89 20-1 19h-7v7h14V21" fill="#9eac8e"/><rect x="57" y="57" width="30" height="6" rx="3" fill="#c6c4a8"/><rect x="60" y="63" width="32" height="6" rx="3" fill="#c8b8c9"/>'};function S_(r){let t=M_[r.id];return t?`<svg viewBox="0 0 100 82" aria-hidden="true" focusable="false">${t}</svg>`:`<span aria-hidden="true">${r.icon}</span>`}var yf={base:'<ellipse cx="38" cy="44" rx="20" ry="26" fill="#f4c74b"/><ellipse cx="38" cy="52" rx="14" ry="16" fill="#fae6b9"/><circle cx="31" cy="27" r="4" fill="#769b5c"/><circle cx="45" cy="27" r="4" fill="#769b5c"/><circle cx="31" cy="27" r="2" fill="#273d2e"/><circle cx="45" cy="27" r="2" fill="#273d2e"/><path d="M33 34q5 3 10 0" stroke="#89652f" stroke-width="1.3" fill="none"/>',nurse:'<path d="m22 27-10 8 6 10 6-4v26h29V41l5 4 6-10-11-8-15 5Z" fill="#efb6c6"/><path d="M28 32h20l4 35H24Z" fill="#fff9ed"/><path d="M25 8h26l3 14H22Z" fill="#fff9ed"/><path d="M35 12h6v3h4v6h-4v3h-6v-3h-4v-6h4Z" fill="#cc597d"/><path d="M35 41h6m-3-3v6" stroke="#cc597d" stroke-width="1.6"/>',thief:'<path d="m23 29-12 7 7 12 7-4v24h28V44l5 4 7-12-12-7-15 5Z" fill="#f8f3e4"/><path d="M19 35h38M23 44h32M25 53h28M25 62h28" stroke="#4a5150" stroke-width="5"/><path d="M24 20q14-10 28 0l-2 6H26Z" fill="#495150"/><ellipse cx="31" cy="23" rx="4" ry="2" fill="#f4c74b"/><ellipse cx="45" cy="23" rx="4" ry="2" fill="#f4c74b"/><path d="M23 14q15-20 30 0Z" fill="#535651"/>',street:'<path d="m23 27-11 8 7 13 7-4v24h26V44l6 4 7-13-12-8-14 8Z" fill="#fff5df"/><path d="M26 31v37h25V31l-12 8Z" fill="#8faf9a"/><path d="M39 38v29" stroke="#fff5df" stroke-width="2"/><path d="m31 43 4 7 3-7" stroke="#406755" stroke-width="1.7" fill="none"/><path d="M21 17q17-17 34 0v5H21Z" fill="#8faf9a"/><path d="M21 21H12q-4 5 2 5h19" fill="#406755"/>',ufo:'<ellipse cx="38" cy="47" rx="18" ry="22" fill="#b6d66f"/><path d="M23 55h30M28 46h20" stroke="#665789" stroke-width="3"/><ellipse cx="38" cy="27" rx="28" ry="9" fill="#665789"/><path d="M24 25a14 17 0 0 1 28 0Z" fill="#b6d66f"/><ellipse cx="38" cy="27" rx="28" ry="5" fill="#807099"/><circle cx="18" cy="28" r="2" fill="#effbc1"/><circle cx="38" cy="31" r="2" fill="#effbc1"/><circle cx="58" cy="28" r="2" fill="#effbc1"/><path d="M38 11V5" stroke="#665789" stroke-width="1.5"/><circle cx="38" cy="5" r="3" fill="#b6d66f"/>',tv:'<ellipse cx="38" cy="54" rx="20" ry="18" fill="#475e68"/><path d="M22 49h32" stroke="#c98567" stroke-width="3"/><path d="M24 58h28" stroke="#e9d8b7" stroke-width="1.5"/><rect x="14" y="13" width="48" height="29" rx="6" fill="#bc9274"/><rect x="19" y="18" width="34" height="19" rx="3" fill="#e9d8b7"/><path d="m24 22 6 3-6 3 7 3-4 3m12-13 4 3-5 3 8 3-5 3" stroke="#829a8e" stroke-width="1.5" fill="none"/><circle cx="57" cy="25" r="1.5" fill="#665847"/><circle cx="57" cy="32" r="1.5" fill="#665847"/><path d="m31 13-6-7m20 7 6-7" stroke="#665847" stroke-width="1.7" stroke-linecap="round"/>',jellyfish:'<ellipse cx="38" cy="52" rx="20" ry="20" fill="#adbdcc"/><path d="M12 28a26 23 0 0 1 52 0q-7 9-13 0-7 9-13 0-7 9-13 0-7 9-13 0Z" fill="#c7b4d1"/><path d="M21 31q-8 11 0 19m10-17q6 8-1 15m17-15q-7 10 2 18m9-20q8 8 0 15" stroke="#b098c1" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="31" cy="13" rx="8" ry="3" fill="#e9dbe8" transform="rotate(-22 31 13)"/><path d="M31 56h14" stroke="#dfd6e9" stroke-width="2"/>',mushroom:'<ellipse cx="38" cy="54" rx="20" ry="19" fill="#607e68"/><path d="M28 28h20v14H28Z" fill="#f2e8c9"/><path d="M9 28C15 0 58 0 67 28q-29 11-58 0Z" fill="#df877a"/><ellipse cx="38" cy="29" rx="29" ry="5" fill="#e9c1a0"/><circle cx="26" cy="16" r="4" fill="#f5e8c9"/><circle cx="43" cy="12" r="4" fill="#f5e8c9"/><circle cx="54" cy="22" r="3" fill="#f5e8c9"/><circle cx="17" cy="24" r="3" fill="#f5e8c9"/><rect x="26" y="46" width="10" height="12" rx="2" fill="#ffead8"/><path d="M43 45v21" stroke="#8ba78d" stroke-width="1.5"/>',zipper:'<ellipse cx="38" cy="44" rx="23" ry="27" fill="#874658"/><ellipse cx="38" cy="25" rx="16" ry="12" fill="#f4c74b"/><path d="M18 17q3-22 20-17 17-5 20 17Z" fill="#874658"/><ellipse cx="38" cy="51" rx="16" ry="11" fill="#302d3f"/><path d="M22 49h32M23 53h30" stroke="#b99568" stroke-width="2"/><path d="M25 47v8m5-8v8m5-8v8m5-8v8m5-8v8m5-8v8" stroke="#ffe4b8" stroke-width="1.5"/><rect x="49" y="47" width="5" height="9" rx="1" fill="#a58853"/><circle cx="31" cy="24" r="3" fill="#76975d"/><circle cx="45" cy="24" r="3" fill="#76975d"/><path d="M32 32q6 3 12 0" stroke="#a28152" stroke-width="1.5" fill="none"/>',dumpling:'<ellipse cx="38" cy="53" rx="21" ry="19" fill="#dfca9d"/><path d="M12 32Q11 15 25 10L38 5l13 5q14 5 13 22-27 14-52 0Z" fill="#f5e8c8"/><path d="m38 7-6 27m6-27 6 27m-12-23-10 19m22-19 10 19m-16-9v15" stroke="#dbc696" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="38" cy="37" rx="24" ry="4" fill="#b8bf92"/><path d="M30 50h16M30 56h16" stroke="#fff1d3" stroke-width="2"/>'};function E_(r,t){if(t==="wing")return`<svg viewBox="0 0 76 78" aria-hidden="true" focusable="false">${r==="none"?'<circle cx="38" cy="39" r="21" fill="none" stroke="#c9c4b7" stroke-width="1.4"/><path d="m23 54 30-30" stroke="#c9c4b7" stroke-width="1.4"/>':'<path d="M36 53C12 57 8 32 11 18c10 7 15 11 23 13l4 17Z" fill="#e7c787"/><path d="M40 53c24 4 28-21 25-35-10 7-15 11-23 13l-4 17Z" fill="#e7c787"/><path d="M36 49C13 51 13 34 14 23c9 9 14 12 22 14Zm4 0c23 2 23-15 22-26-9 9-14 12-22 14Z" fill="#fff3d2"/><path d="m19 32 13 11m-13-4 12 7m26-14-13 11m13-4-12 7" stroke="#cfb37f" stroke-width="1.2" stroke-linecap="round"/>'}</svg>`;let e={none:"base",default:"base",original:"base",bandit:"thief",casual:"street"}[r]||r;return`<svg viewBox="0 0 76 78" aria-hidden="true" focusable="false">${yf[e]||yf.base}</svg>`}var xl=class{constructor(){this.dom={hudTop:document.getElementById("hudTop"),hudSpeed:document.getElementById("hudSpeed"),touchControls:document.getElementById("touchControls"),pauseBtn:document.getElementById("btnPause"),stageCard:document.getElementById("stageCard"),stageName:document.getElementById("stageName"),stageTimer:document.getElementById("stageTimer"),stageSub:document.getElementById("stageSub"),stageProgress:document.getElementById("stageProgressBar"),multiplierTag:document.getElementById("multiplierTag"),scoreText:document.getElementById("scoreText"),coinText:document.getElementById("coinText"),speedValue:document.getElementById("speedValue"),statusTag:document.getElementById("statusTag"),challengeHud:document.getElementById("challengeHud"),challengeIcon:document.getElementById("challengeIcon"),challengeTitle:document.getElementById("challengeTitle"),challengeCount:document.getElementById("challengeCount"),challengeInstruction:document.getElementById("challengeInstruction"),challengeFeedback:document.getElementById("challengeFeedback"),challengeProgress:document.getElementById("challengeProgress"),wingSkinList:document.getElementById("wingSkinList"),outfitSkinList:document.getElementById("outfitSkinList"),wardrobePreview:document.getElementById("wardrobePreview"),wardrobePreviewName:document.getElementById("wardrobePreviewName"),btnWardrobeClothes:document.getElementById("btnWardrobeClothes"),btnWardrobeWings:document.getElementById("btnWardrobeWings"),btnWardrobeLeft:document.getElementById("btnWardrobeLeft"),btnWardrobeRight:document.getElementById("btnWardrobeRight"),btnWardrobeReset:document.getElementById("btnWardrobeReset"),btnEquipWardrobe:document.getElementById("btnEquipWardrobe"),wardrobeSectionNote:document.getElementById("wardrobeSectionNote"),wardrobeCoins:document.getElementById("wardrobeCoins"),wardrobePurchaseMessage:document.getElementById("wardrobePurchaseMessage"),outfitBrowser:document.getElementById("outfitBrowser"),outfitFilters:document.getElementById("outfitFilters"),outfitCount:document.getElementById("outfitCount"),btnOutfitPrev:document.getElementById("btnOutfitPrev"),btnOutfitNext:document.getElementById("btnOutfitNext"),lobbyOverlay:document.getElementById("lobbyOverlay"),lobbyCoins:document.getElementById("lobbyCoins"),lobbyHighScore:document.getElementById("lobbyHighScore"),muteIcon:document.getElementById("muteIcon"),btnMute:document.getElementById("btnMute"),speechBubble:document.getElementById("speechBubble"),bubbleText:document.getElementById("bubbleText"),characterTouchZone:document.getElementById("characterTouchZone"),reactionContainer:document.getElementById("reactionContainer"),btnOpenMaps:document.getElementById("btnOpenMaps"),btnOpenWardrobe:document.getElementById("btnOpenWardrobe"),btnOpenAchievements:document.getElementById("btnOpenAchievements"),btnOpenRank:document.getElementById("btnOpenRank"),btnOpenDaily:document.getElementById("btnOpenDaily"),lobbyMapTitle:document.getElementById("lobbyMapTitle"),lobbyMapCard:document.getElementById("lobbyMapCard"),lobbyMapTag:document.getElementById("lobbyMapTag"),lobbyStartHint:document.getElementById("lobbyStartHint"),btnChangeMap:document.getElementById("btnChangeMap"),btnStartRun:document.getElementById("btnStartRun"),mapModal:document.getElementById("mapModal"),mapListContainer:document.getElementById("mapListContainer"),btnCloseMapModal:document.getElementById("btnCloseMapModal"),wardrobeModal:document.getElementById("wardrobeModal"),btnCloseWardrobeModal:document.getElementById("btnCloseWardrobeModal"),achievementsModal:document.getElementById("achievementsModal"),btnCloseAchievementsModal:document.getElementById("btnCloseAchievementsModal"),achBestDistance:document.getElementById("achBestDistance"),achLifetimeCoins:document.getElementById("achLifetimeCoins"),achJumps:document.getElementById("achJumps"),achSlides:document.getElementById("achSlides"),rankModal:document.getElementById("rankModal"),rankList:document.getElementById("rankList"),rankSummary:document.getElementById("rankSummary"),btnCloseRankModal:document.getElementById("btnCloseRankModal"),dailyModal:document.getElementById("dailyModal"),btnClaimDaily:document.getElementById("btnClaimDaily"),dailyDescription:document.getElementById("dailyDescription"),btnCloseDailyModal:document.getElementById("btnCloseDailyModal"),pauseModal:document.getElementById("pauseModal"),btnResume:document.getElementById("btnResume"),btnPauseToLobby:document.getElementById("btnPauseToLobby"),gameOverModal:document.getElementById("gameOverModal"),btnRestart:document.getElementById("btnRestart"),btnGameOverToLobby:document.getElementById("btnGameOverToLobby"),finalScore:document.getElementById("finalScore"),finalCoins:document.getElementById("finalCoins"),deathJoke:document.getElementById("deathJoke")};let t=[this.dom.btnWardrobeClothes,this.dom.btnWardrobeWings];for(let e of t)e?.addEventListener("keydown",i=>{if(!["ArrowLeft","ArrowRight","Home","End"].includes(i.key))return;i.preventDefault();let n=i.key==="Home"?t[0]:i.key==="End"?t[1]:t[1-t.indexOf(e)];n.click(),n.focus({preventScroll:!0})});this.outfitFilter="all",this.outfitScrollPositions={},this.dom.outfitFilters?.addEventListener("click",e=>{let i=e.target.closest("[data-outfit-filter]");!i||!this.outfitBrowserState||(this.outfitScrollPositions[this.outfitFilter]=this.dom.outfitSkinList.scrollLeft,this.outfitFilter=i.dataset.outfitFilter,this.renderOutfitBrowser())});for(let[e,i]of[[this.dom.btnOutfitPrev,-1],[this.dom.btnOutfitNext,1]])e?.addEventListener("click",()=>this.dom.outfitSkinList.scrollBy({left:i*this.dom.outfitSkinList.clientWidth*.75,behavior:"smooth"}));this.dom.outfitSkinList?.addEventListener("scroll",()=>{this.outfitScrollPositions[this.outfitFilter]=this.dom.outfitSkinList.scrollLeft,this.updateOutfitBrowseArrows()},{passive:!0})}showLobby(t={}){this.dom.lobbyOverlay&&(this.dom.lobbyOverlay.style.display="flex"),this.dom.hudTop&&(this.dom.hudTop.style.display="none"),this.dom.hudSpeed&&(this.dom.hudSpeed.style.display="none"),this.dom.touchControls&&(this.dom.touchControls.style.display="none"),this.updateChallenge(null),this.hideAllModals(),t.coins!==void 0&&this.dom.lobbyCoins&&(this.dom.lobbyCoins.textContent=t.coins),t.highScore!==void 0&&this.dom.lobbyHighScore&&(this.dom.lobbyHighScore.textContent=`${Math.floor(t.highScore)}m`),t.currentMap&&this.applyMap(t.currentMap)}applyMap(t){this.currentMap=t,this.dom.lobbyMapTitle&&(this.dom.lobbyMapTitle.textContent=`${t.name} ${t.icon||""}`),this.dom.lobbyStartHint&&(this.dom.lobbyStartHint.textContent=t.startHint||"变道、跳跃、滑铲，探索前方的世界！"),this.dom.lobbyMapTag&&(this.dom.lobbyMapTag.textContent=t.stageTitle||t.name,this.dom.lobbyMapTag.style.backgroundColor=t.themeColor,this.dom.lobbyMapTag.style.color="#fff"),this.dom.lobbyMapCard&&(this.dom.lobbyMapCard.style.borderColor=t.themeColor),this.dom.stageName&&(this.dom.stageName.textContent=t.stageTitle||t.name),this.dom.stageSub&&(this.dom.stageSub.textContent=t.stageSubtitle||t.tag),this.dom.stageProgress&&(this.dom.stageProgress.style.backgroundColor=t.themeColor)}hideLobby(){this.dom.lobbyOverlay&&(this.dom.lobbyOverlay.style.display="none"),this.dom.hudTop&&(this.dom.hudTop.style.display="flex"),this.dom.hudSpeed&&(this.dom.hudSpeed.style.display="block"),this.dom.touchControls&&(this.dom.touchControls.style.display="flex")}setSpeechBubble(t){!this.dom.bubbleText||!this.dom.speechBubble||(this.dom.bubbleText.textContent=t,this.dom.speechBubble.style.transform="scale(1.08)",setTimeout(()=>{this.dom.speechBubble&&(this.dom.speechBubble.style.transform="")},160))}spawnReaction(t="💖"){if(!this.dom.reactionContainer)return;let e=["💖","✨","⭐","🦖","🌟"],i=t||e[Math.floor(Math.random()*e.length)],n=document.createElement("div");n.className="floating-reaction",n.textContent=i;let s=44+(Math.random()*20-10),o=42+(Math.random()*16-8);n.style.left=`${s}%`,n.style.top=`${o}%`,this.dom.reactionContainer.appendChild(n),setTimeout(()=>{n.parentNode&&n.remove()},1200)}renderMapList(t,e,i){this.dom.mapListContainer&&(this.dom.mapListContainer.innerHTML="",t.forEach(n=>{let s=document.createElement("button"),o=n.id===e,a=!n.available;s.className=`map-card-item ${o?"active":""} ${a?"locked":""}`,s.type="button",s.dataset.map=n.id,s.disabled=a,s.style.setProperty("--map-color",n.themeColor),s.setAttribute("aria-label",`${n.name}，${o?"当前地图":a?"尚未开放":"开始探索"}`),o&&s.setAttribute("aria-current","true"),s.innerHTML=`
                <div class="map-item-preview">${S_(n)}</div>
                <div class="map-item-info">
                    <div class="map-item-heading">
                        <div class="map-item-name">${n.name}</div>
                        <span class="map-item-badge ${o?"active-badge":a?"lock-badge":""}">
                            ${o?"当前":a?"筹备中":"出发"}
                        </span>
                    </div>
                    <div class="map-item-tag">${n.tag}</div>
                    <div class="map-item-desc">${n.shortDescription||n.description}</div>
                </div>
            `,a||s.addEventListener("click",()=>{i&&i(n.id),this.hideMapModal()}),this.dom.mapListContainer.appendChild(s)}))}updateHUD(t){this.updateChallenge(t.player.isFlying?{id:"flight",title:"云翼飞行",completed:0,total:0,remaining:t.player.props.flight||t.player.flightLandingTimer,instruction:"左右换道收集空中金币，天空没有障碍",feedback:t.player.props.flight>0?"肚皮朝下 · 自动飞行":"准备降落 · 跑道已清空",progress:t.player.props.flight/8}:t.challenge);let e=t.score/120%30,i=Math.max(1,Math.ceil(30-e));if(this.dom.stageTimer&&(this.dom.stageTimer.textContent=`${i}s`),this.dom.stageProgress){let a=Math.min(100,e/30*100);this.dom.stageProgress.style.width=`${a}%`}let n=Math.floor(t.score),s=String(n).padStart(6,"0");if(this.dom.scoreText&&(this.dom.scoreText.textContent=`${s} 米`),this.dom.coinText&&(this.dom.coinText.textContent=`${t.coins}`),this.dom.multiplierTag){let a=t.player.props.milk>0?"x4":"x2";this.dom.multiplierTag.textContent=a}let o=Math.floor(t.speed);this.dom.speedValue&&(this.dom.speedValue.textContent=`${o}`),this.dom.statusTag&&(t.player.isFlying?(this.dom.statusTag.textContent="🪽 翅膀飞行",this.dom.statusTag.style.color="#f6dda1"):t.player.props.milk>0?(this.dom.statusTag.textContent="🔥 奶瓶暴走",this.dom.statusTag.style.color="#ff4757"):t.player.mapChallengeLabel?(this.dom.statusTag.textContent=`✦ ${t.player.mapChallengeLabel}`,this.dom.statusTag.style.color="#f6dda1"):t.player.isOnRoof?(this.dom.statusTag.textContent=`⚡ ${this.currentMap?.roofLabel||"高台冲刺"}`,this.dom.statusTag.style.color="#00d2d3"):t.player.mapFeatureLabel?(this.dom.statusTag.textContent=`✨ ${t.player.mapFeatureLabel}`,this.dom.statusTag.style.color="#a6edc2"):(this.dom.statusTag.textContent="极限巡航",this.dom.statusTag.style.color="#78e08f"))}updateChallenge(t){let e=this.dom;if(!e.challengeHud||(e.challengeHud.hidden=!t,!t))return;let i=t.id.split(":")[0];e.challengeHud.dataset.theme=i,e.challengeIcon.textContent={store:"🛒",tea:"🫧",pond:"♫",laundry:"🧦",flight:"🪽"}[i]||"✦",e.challengeTitle.textContent=t.title,e.challengeCount.textContent=t.total?`${t.completed}/${t.total}`:`${Math.ceil(t.remaining)}s`,e.challengeInstruction.textContent=t.instruction,e.challengeFeedback.textContent=t.feedback||(t.combo?`${t.combo} 连击`:"跟随赛道上的动作标记"),e.challengeHud.dataset.complete=String(t.total>0&&t.completed===t.total),e.challengeProgress.style.transform=`scaleX(${Math.max(0,Math.min(1,t.progress||0))})`}updateMuteIcon(t){this.dom.muteIcon&&(this.dom.muteIcon.textContent=t?"🔇":"🔊")}renderSkins(t,e,i,n,s,o,a){if(!t)return;t.replaceChildren();let l=new Set(a?.[o==="outfit"?"outfits":"wings"]||["none"]);for(let c of e){let h=l.has(c.id),u=h&&c.id===i,d=Math.max(0,Math.floor(Number(c.price)||0)),f=document.createElement("button");f.type="button",f.className=`skin-card ${o}-skin-card`,f.classList.toggle("active",c.id===n),f.classList.toggle("equipped",u),f.classList.toggle("locked",!h),f.dataset[o]=c.id,f.dataset.owned=String(h),c.description&&(f.title=c.description),f.setAttribute("aria-pressed",String(c.id===n)),f.setAttribute("aria-label",`${c.name}，${u?"已装备":h?"已解锁":`未解锁，售价 ${d.toLocaleString("zh-CN")} 金币`}，点击试穿`);let m=document.createElement("span");m.className="skin-illustration",m.innerHTML=E_(c.id,o);let y=document.createElement("span");y.className="skin-name",y.textContent=c.name;let g=document.createElement("span");if(g.className=`skin-tag${h?"":" skin-price"}`,g.textContent=u?"已装备":h?c.id==="none"?"免费":"已解锁":`✦ ${d.toLocaleString("zh-CN")}`,f.append(m,y,g),!h){let p=document.createElement("span");p.className="skin-lock-badge",p.setAttribute("aria-hidden","true"),p.innerHTML='<svg viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="2" fill="currentColor"/><path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="10" r="1" fill="#fff9e9"/></svg>',f.append(p)}f.addEventListener("click",()=>s?.(c.id)),t.append(f)}}renderOutfitSkins(t,e,i,n,s){n&&(this.onPreviewOutfit=n),this.outfitBrowserState&&!this.dom.outfitSkinList.hidden&&(this.outfitScrollPositions[this.outfitFilter]=this.dom.outfitSkinList.scrollLeft),this.outfitBrowserState={skins:Object.values(t),equippedId:e,previewId:i,inventoryState:s},this.renderOutfitBrowser()}renderOutfitBrowser(){let t=this.outfitBrowserState;if(!t)return;let e=["ufo","tv","jellyfish","mushroom","zipper","dumpling"],i=s=>s.category||(e.includes(s.id)?"weird":"daily"),n=t.skins.filter(s=>this.outfitFilter==="all"||i(s)===this.outfitFilter);this.renderSkins(this.dom.outfitSkinList,n,t.equippedId,t.previewId,this.onPreviewOutfit,"outfit",t.inventoryState);for(let s of this.dom.outfitFilters.querySelectorAll("[data-outfit-filter]")){let o=s.dataset.outfitFilter===this.outfitFilter;s.classList.toggle("active",o),s.setAttribute("aria-pressed",String(o))}this.dom.outfitCount.textContent=this.outfitFilter==="all"?`${t.skins.length} 套造型`:`${n.length} / ${t.skins.length} 套`,this.dom.outfitSkinList.scrollLeft=this.outfitScrollPositions[this.outfitFilter]||0,this.updateOutfitBrowseArrows()}updateOutfitBrowseArrows(){let t=this.dom.outfitSkinList;t&&(this.dom.btnOutfitPrev.disabled=t.scrollLeft<=2,this.dom.btnOutfitNext.disabled=t.scrollLeft>=t.scrollWidth-t.clientWidth-2)}renderWingSkins(t,e,i,n=e,s){i&&(this.onPreviewWing=i),this.renderSkins(this.dom.wingSkinList,[{id:"none",name:"不佩戴翅膀",price:0},...Object.values(t)],e,n,this.onPreviewWing,"wing",s)}showWardrobeTab(t){let e=t!=="wings";this.wardrobeTab=e?"clothes":"wings",this.dom.outfitSkinList.hidden=!e,this.dom.wingSkinList.hidden=e,this.dom.outfitBrowser.hidden=!e;for(let[i,n]of[[this.dom.btnWardrobeClothes,e],[this.dom.btnWardrobeWings,!e]])i.classList.toggle("active",n),i.setAttribute("aria-selected",String(n)),i.tabIndex=n?0:-1;this.dom.wardrobeSectionNote.textContent=e?"点选试穿，喜欢就穿上。":"翅膀常驻显示，拾到羽毛才会起飞。"}updateWardrobePreview({name:t,equipped:e,description:i,owned:n=!0,price:s=0,coins:o=0,purchaseMessage:a}){this.dom.wardrobePreviewName.textContent=t;let l=this.outfitBrowserState?.skins.find(m=>m.id===this.outfitBrowserState.previewId),c=i||(this.wardrobeTab==="clothes"?l?.description:null);c&&(this.dom.wardrobeSectionNote.textContent=c),this.dom.wardrobeSectionNote.title=this.dom.wardrobeSectionNote.textContent;let h=Math.max(0,Math.floor(Number(s)||0)),u=Math.max(0,Math.floor(Number(o)||0));this.dom.wardrobeCoins.textContent=u.toLocaleString("zh-CN");let d=typeof a=="string"?a:a?.text||"";this.dom.wardrobePurchaseMessage.textContent=d,this.dom.wardrobePurchaseMessage.hidden=!d,this.dom.wardrobePurchaseMessage.dataset.status=/不足|未保存|失败|重试/.test(d)?"error":"success";let f=this.dom.btnEquipWardrobe;f.disabled=n?e:u<h,f.classList.toggle("is-equipped",n&&e),f.classList.toggle("is-purchase",!n),f.classList.toggle("is-short",!n&&u<h),f.dataset.action=n?"equip":"purchase",f.querySelector("span").textContent=n?e?"已装备":this.wardrobeTab==="wings"?"装备这双翅膀":"穿上这套":u<h?`还差 ${(h-u).toLocaleString("zh-CN")} 金币`:`✦ ${h.toLocaleString("zh-CN")} 金币 · ${this.wardrobeTab==="wings"?"解锁并装备":"解锁并穿上"}`,f.querySelector("i").textContent=n?"✓":"+"}updateDailyAvailability({claimed:t}){this.dom.btnClaimDaily&&(this.dom.btnClaimDaily.disabled=!!t,this.dom.btnClaimDaily.textContent=t?"今日已领取":"领取 100 金币",this.dom.btnClaimDaily.classList.toggle("daily-claimed",!!t),this.dom.dailyDescription&&(this.dom.dailyDescription.textContent=t?"今天的补给已收下，明天再来。":"每日领一份补给，攒金币解锁新造型。"),this.dom.dailyModal&&(this.dom.dailyModal.dataset.claimed=String(!!t)))}renderAchievements(t){let e=i=>Math.max(0,Math.floor(Number(i)||0)).toLocaleString("zh-CN");for(let[i,n]of[["bestDistance",this.dom.achBestDistance],["lifetimeCoins",this.dom.achLifetimeCoins],["jumps",this.dom.achJumps],["slides",this.dom.achSlides]])n&&(n.textContent=e(t?.[i]))}showMapModal(){this.dom.mapModal&&(this.dom.mapModal.style.display="flex")}hideMapModal(){this.dom.mapModal&&(this.dom.mapModal.style.display="none")}showWardrobeModal(){this.dom.wardrobeModal&&(this.dom.wardrobeModal.style.display="flex"),this.dom.lobbyOverlay&&(this.dom.lobbyOverlay.style.visibility="hidden"),this.dom.btnOpenWardrobe?.setAttribute("aria-expanded","true"),this.dom.wardrobePreview?.focus({preventScroll:!0})}hideWardrobeModal(){let t=this.dom.wardrobeModal?.style.display!=="none";this.dom.wardrobeModal&&(this.dom.wardrobeModal.style.display="none"),this.dom.lobbyOverlay&&(this.dom.lobbyOverlay.style.visibility=""),this.dom.btnOpenWardrobe?.setAttribute("aria-expanded","false"),t&&(this.onWardrobeClose?.(),this.dom.btnOpenWardrobe?.focus({preventScroll:!0}))}showAchievementsModal(t){t&&this.renderAchievements(t),this.dom.achievementsModal&&(this.dom.achievementsModal.style.display="flex"),this.dom.btnOpenAchievements?.setAttribute("aria-expanded","true"),this.dom.btnCloseAchievementsModal?.focus({preventScroll:!0})}hideAchievementsModal(){let t=this.dom.achievementsModal?.style.display!=="none";this.dom.achievementsModal&&(this.dom.achievementsModal.style.display="none"),this.dom.btnOpenAchievements?.setAttribute("aria-expanded","false"),t&&this.dom.btnOpenAchievements?.focus({preventScroll:!0})}showRankModal(t={}){let e=m=>Math.max(0,Math.floor(Number(m)||0)).toLocaleString("zh-CN"),i=typeof t=="number"&&t>0?[{distance:t,legacy:!0}]:[...t.entries||[]],n=m=>Number.isFinite(new Date(m.finishedAt).getTime())?new Date(m.finishedAt).getTime():0;i.sort((m,y)=>(y.distance||0)-(m.distance||0)||(y.coins||0)-(m.coins||0)||n(y)-n(m));let s=typeof t=="number"?t:t.bestDistance||0,o=this.dom.rankSummary;o.replaceChildren();let a=document.createElement("div"),l=document.createElement("span");l.textContent="最远距离";let c=document.createElement("strong");c.textContent=`${e(s)} 米`,a.append(l,c);let h=document.createElement("div"),u=document.createElement("span");u.textContent="完成跑酷";let d=document.createElement("strong");d.textContent=`${e(t.totalRuns||0)} 局`,h.append(u,d),o.append(a,h);let f=this.dom.rankList;if(f.replaceChildren(),f.scrollTop=0,!i.length){let m=document.createElement("li");m.className="personal-rank-empty";let y=document.createElement("span");y.setAttribute("aria-hidden","true"),y.textContent="↗";let g=document.createElement("strong");g.textContent="第一局，就从现在开始";let p=document.createElement("p");p.textContent="完成一次跑酷，距离、金币和地图就会记在这里。",m.append(y,g,p),f.append(m)}for(let[m,y]of i.slice(0,20).entries()){let g=document.createElement("li");g.className=`personal-rank-item${y.legacy?" legacy":""}`,y.id&&(g.dataset.runId=y.id);let p=document.createElement("span");p.className="personal-rank-position",p.textContent=String(m+1).padStart(2,"0");let T=document.createElement("div");T.className="personal-rank-body";let b=document.createElement("div");b.className="personal-rank-headline";let x=document.createElement("strong");if(x.textContent=`${e(y.distance)} 米`,b.append(x),!y.legacy){let C=document.createElement("span");C.className="personal-rank-coins",C.textContent=`✦ ${e(y.coins)} 金币`,b.append(C)}let S=document.createElement("div");S.className="personal-rank-details";let E=document.createElement("span");if(E.textContent=y.legacy?"历史最佳记录":y.mapName||"奶蛙跑酷",S.append(E),!y.legacy){let C=document.createElement("time"),v=new Date(y.finishedAt);C.textContent=n(y)?v.toLocaleString("zh-CN",{year:"2-digit",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}):"未记录时间",n(y)&&(C.dateTime=v.toISOString()),S.append(C)}T.append(b,S),g.append(p,T),f.append(g)}this.dom.rankModal.style.display="flex",this.dom.btnOpenRank?.setAttribute("aria-expanded","true"),this.dom.btnCloseRankModal?.focus({preventScroll:!0})}hideRankModal(){let t=this.dom.rankModal?.style.display!=="none";this.dom.rankModal&&(this.dom.rankModal.style.display="none"),this.dom.btnOpenRank?.setAttribute("aria-expanded","false"),t&&this.dom.btnOpenRank?.focus({preventScroll:!0})}showDailyModal(){this.dom.dailyModal&&(this.dom.dailyModal.style.display="flex")}hideDailyModal(){this.dom.dailyModal&&(this.dom.dailyModal.style.display="none")}showGameOver(t,e,i){this.updateChallenge(null),this.dom.gameOverModal&&(this.dom.gameOverModal.style.display="flex",this.dom.finalScore&&(this.dom.finalScore.textContent=`${Math.floor(t)} 米`),this.dom.finalCoins&&(this.dom.finalCoins.textContent=`${e}`),this.dom.deathJoke&&(this.dom.deathJoke.textContent=i||"等我奶蛙跑酷达到10万米我也要去问问许嵩 那阵子我们的感情到底出了什么问题#奶蛙"))}hideGameOver(){this.dom.gameOverModal&&(this.dom.gameOverModal.style.display="none")}showPause(){this.updateChallenge(null),this.dom.pauseModal&&(this.dom.pauseModal.style.display="flex")}hidePause(){this.dom.pauseModal&&(this.dom.pauseModal.style.display="none")}hideAllModals(){this.hideMapModal(),this.hideWardrobeModal(),this.hideAchievementsModal(),this.hideRankModal(),this.hideDailyModal(),this.hidePause(),this.hideGameOver()}};var Nr={egypt:{id:"egypt",name:"埃及·砂岩集市",englishName:"Egyptian Sandstone Bazaar",icon:"🏛️",badge:"📍 埃及",skyColor:11919846,fogColor:16114887,sunColor:16772558,groundColor:15650721,themeColor:"#168f91",environmentStyle:"egypt",lighting:{hemiSky:14743546,hemiGround:16775399,hemiIntensity:1.35,sunIntensity:1.95,sunPosition:[25,45,-15]},stageTitle:"埃及",stageSubtitle:"砂岩集市",tag:"沙漠·奇遇",shortDescription:"金字塔、法老与棕榈集市，沿着沙金跑道追逐阳光。",surfaceLabel:"砂岩跑道",rideLabel:"埃及特快",roofLabel:"车顶冲刺",startHint:"顺着引桥冲上车顶，穿过砂岩集市！",description:"沿着青绿金边的砂岩跑道冲刺，邂逅错落金字塔、法老雕像与棕榈市集，冲上埃及特快车顶！",dialogues:["快摸摸我的大肚皮，等下要冲上火车顶啦！","今天阳光真好，听说砂岩集市里有黄金烤全羊！","等我跑过10万米，就去跟许嵩表白~","听说埃及特快的车顶风景特别棒，还能捡金币！","点我摸摸肚皮，给你加个好运暴走Buff！","看我可爱的绿色大眼睛，是不是萌化你啦？","DuangDuang~ 我的小尾巴摇得停不下来！"],available:!0},store:{id:"store",name:"巨物便利店",englishName:"Midnight Mini Mart",icon:"🛒",badge:"巨物·夜宵",environmentStyle:"store",skyColor:15919324,fogColor:16183267,sunColor:16773851,groundColor:15130575,themeColor:"#2c877a",lighting:{hemiSky:15990772,hemiGround:15456445,hemiIntensity:1.5,sunIntensity:1.5,sunPosition:[15,40,-20]},stageTitle:"巨物",stageSubtitle:"便利店",tag:"巨物·夜宵",shortDescription:"逛满满的零食街，收集三枚金币，完成夜宵订单。",description:"穿过密集货架、巨物零食与冰柜街道，登上包装盒平台。看到夜宵订单提示，沿中间道收集三枚金币，完成三连可获额外金币。",surfaceLabel:"便利店走道",rideLabel:"零食包装箱",roofLabel:"货架冲刺",startHint:"看订单提示，沿中间道收集 3 枚金币领奖励！",dialogues:["牛奶盒比我还大！这家店我可以住一整年。","别急着结账，我还没跑到零食那一排呢！","冰柜里凉凉的，先摸摸肚皮暖一暖。","今晚的计划：跑一圈，再吃亿点点！"],available:!0},tea:{id:"tea",name:"奶茶泡泡港",englishName:"Boba Bubble Harbor",icon:"🧋",badge:"奶茶·漂流",environmentStyle:"tea",skyColor:16247004,fogColor:16181460,sunColor:16772558,groundColor:13144418,themeColor:"#986038",lighting:{hemiSky:16774373,hemiGround:15385500,hemiIntensity:1.5,sunIntensity:1.65,sunPosition:[-20,40,-20]},stageTitle:"奶茶",stageSubtitle:"泡泡港",tag:"奶茶·漂流",shortDescription:"珍珠弹射起飞，穿过空中三连泡泡，收集甜蜜奖励。",description:"穿梭茶杯、吸管与奶茶小店组成的港口。泡泡航线开启时回到中间道，踩珍珠垫起飞，保持航线穿过三个空中泡泡；错过只会失去奖励。",surfaceLabel:"奶盖码头",rideLabel:"珍珠货船",roofLabel:"杯盖冲刺",startHint:"回中间道踩珍珠垫，穿过 3 个空中泡泡！",dialogues:["三分糖，加珍珠！等等，珍珠怎么比我还大？","我的肚皮自带奶盖，今天申请免费续杯。","这条河闻起来好香，跑完再喝一口。","船要开啦！快跟上奶蛙的甜蜜航线。"],available:!0},pond:{id:"pond",name:"蛙塘音乐节",englishName:"Lily Pad Music Festival",icon:"🎵",badge:"荷塘·律动",environmentStyle:"pond",skyColor:16041649,fogColor:16046524,sunColor:16768193,groundColor:7907732,themeColor:"#567d52",lighting:{hemiSky:16769476,hemiGround:10926731,hemiIntensity:1.55,sunIntensity:1.6,sunPosition:[-30,28,-20]},stageTitle:"蛙塘",stageSubtitle:"音乐节",tag:"荷塘·律动",shortDescription:"跟着左、中、右节拍点换道，在落日音乐节打出三连拍。",description:"沿摊位、帐篷、音箱围绕的荷叶栈道跑酷。三连拍开启时按地板提示向左、中、右换道，脚踏实地点亮三个节拍，连击成功领取额外金币。",surfaceLabel:"荷叶栈道",rideLabel:"鼓面舞台",roofLabel:"舞台冲刺",startHint:"跟地板提示换道：左 → 中 → 右，踩出三连拍！",dialogues:["今晚我不是奶蛙，我是荷塘最会跳的主唱！","摸摸肚皮，咚咚咚！这个鼓点怎么样？","等夕阳落下，灯串亮起，我们就出发。","别踩错拍子，今晚的快乐要跑着收集！"],available:!0},laundry:{id:"laundry",name:"云端洗衣房",englishName:"Cloud Laundry Club",icon:"🧺",badge:"云端·轻盈",environmentStyle:"laundry",skyColor:15525856,fogColor:16183785,sunColor:16774111,groundColor:15065561,themeColor:"#807394",lighting:{hemiSky:16118015,hemiGround:15064267,hemiIntensity:1.65,sunIntensity:1.3,sunPosition:[20,45,-10]},stageTitle:"云端",stageSubtitle:"洗衣房",tag:"云端·轻盈",shortDescription:"踩暖风口追逐三只袜子，沿高架晾衣台轻盈落地。",description:"沿洗衣机、衣架与云岛组成的毛巾桥奔跑。收袜子挑战开启时回中间道，踩暖风口托举追袜子，也可沿坡登上晾衣台收集，三只全齐领取额外金币。",surfaceLabel:"毛巾桥",rideLabel:"折叠毛巾台",roofLabel:"晾衣台冲刺",startHint:"中间道踩暖风或沿坡登台，收齐 3 只袜子！",dialogues:["刚晒好的毛巾软软的，跑完我要躺一下。","谁把我的袜子晾到云上去了？我来追！","这里的风闻起来像干净的阳光。","今天不用洗肚皮，只要把快乐晒一晒！"],available:!0},cyber:{id:"cyber",name:"霓虹·赛博都市",englishName:"Cyberpunk Neon City",icon:"🌃",badge:"🔒 即将上线",skyColor:988970,fogColor:1973067,sunColor:3718648,groundColor:1976635,themeColor:"#00d2d3",tag:"科幻·夜景",description:"在未来全息磁悬浮列车顶飞驰，穿梭于摩天大楼与全息霓虹天际线！",dialogues:["赛博世界里有没有电子烤羊肉串呀？"],available:!1},jungle:{id:"jungle",name:"玛雅·热带雨林",englishName:"Maya Jungle Ruins",icon:"🌴",badge:"🔒 即将上线",skyColor:3718648,fogColor:14482663,sunColor:16707722,groundColor:7877903,themeColor:"#10b981",tag:"神秘·自然",description:"滑过古老神庙藤蔓与巨石机关，探索失落的翡翠遗迹与黄金树冠！",dialogues:["雨林里有好多大香蕉和神秘图腾！"],available:!1}},Th=class{constructor(){this.currentMapId="egypt"}getCurrentMap(){return Nr[this.currentMapId]||Nr.egypt}setMap(t){return Nr[t]&&Nr[t].available?(this.currentMapId=t,!0):!1}getAllMaps(){return Object.values(Nr)}},Mi=new Th;var _f="naiwa_achievements",vf=["bestDistance","lifetimeCoins","jumps","slides"];function Fr(r){return typeof r!="number"||!Number.isFinite(r)||r<=0?0:Math.min(Number.MAX_SAFE_INTEGER,Math.floor(r))}function T_(r){return r!==null&&typeof r=="object"&&!Array.isArray(r)}var yl=class{constructor(t,e={}){this.storage=t;let i=null;try{i=t.getStorage(_f,null)}catch{}let n=T_(i)?i:{};this.stats=Object.fromEntries(vf.map(s=>[s,Fr(n[s])])),this.dirty=n.version!==1||vf.some(s=>n[s]!==this.stats[s]),this.mergeLegacy(e)}mergeLegacy({highScore:t,coins:e}={}){let i=Math.max(this.stats.bestDistance,Fr(t)),n=Math.max(this.stats.lifetimeCoins,Fr(e)),s=i!==this.stats.bestDistance||n!==this.stats.lifetimeCoins;return s&&(this.stats.bestDistance=i,this.stats.lifetimeCoins=n,this.dirty=!0),s}recordDistance(t){let e=Fr(t);return e<=this.stats.bestDistance?!1:(this.stats.bestDistance=e,this.dirty=!0,!0)}addCoins(t){return this.addCount("lifetimeCoins",Fr(t))}completeAction(t){return t==="jump"?this.addCount("jumps",1):t==="slide"?this.addCount("slides",1):!1}addCount(t,e){let i=Math.min(Number.MAX_SAFE_INTEGER,this.stats[t]+e);return i===this.stats[t]?!1:(this.stats[t]=i,this.dirty=!0,!0)}snapshot(){return{...this.stats}}save(){if(!this.dirty)return!1;try{return this.storage.setStorage(_f,{version:1,...this.snapshot()})===!1?!1:(this.dirty=!1,!0)}catch{return!1}}};var _l=class{constructor(t,e,i){this.world=t,this.player=e,this.element=i,this.angle=0,this.targetAngle=0,this.active=!1,this.size=new at,this.accessoryBounds=new Ie,this.paper=new Ot(16051938),this.stand=new _t(new ue(.85,.89,.05,40),new xt({color:14605516,roughness:.88})),this.stand.name="wardrobeFittingStand",this.stand.position.y=-.03,this.stand.receiveShadow=!0,this.stand.visible=!1,t.scene.add(this.stand)}open(){if(this.active)return;let{scene:t,camera:e,renderer:i}=this.world;this.original={background:t.background,fog:t.fog,clearColor:i.getClearColor(new Ot),clearAlpha:i.getClearAlpha(),fov:e.fov,aspect:e.aspect,position:e.position.clone(),quaternion:e.quaternion.clone(),visibility:new Map(t.children.map(n=>[n,n.visible]))};for(let n of t.children)n.visible=n.isLight||n===this.player.character.group;this.stand.visible=!0,t.background=this.paper,t.fog=null,this.angle=this.targetAngle=0,this.active=!0}rotate(t){Number.isFinite(t)&&(this.targetAngle+=t)}resetAngle(){this.targetAngle=0}render(t){if(!this.active)return;let{renderer:e,camera:i,scene:n}=this.world,s=e.domElement.getBoundingClientRect(),o=this.element.getBoundingClientRect();e.getSize(this.size);let a=Math.max(1,Math.min(this.size.x,o.width-24)),l=Math.max(1,Math.min(this.size.y,o.height-76)),c=Math.max(0,o.left-s.left+12),h=Math.max(0,this.size.y-(o.top-s.top+l));this.angle+=(this.targetAngle-this.angle)*(1-Math.exp(-Math.max(0,t)*14));let u=this.player.character;u.group.rotation.set(0,Math.PI+this.angle,0),u.group.scale.setScalar(.84),i.fov=42,i.aspect=a/l,i.updateProjectionMatrix(),u.group.updateMatrixWorld(!0);let d=u.outfits.accessories[u.outfits.skinId],f=d?Math.max(1.96,this.accessoryBounds.setFromObject(d).max.y+.06):1.96,m=Math.tan(oe.degToRad(21)),y=Math.max(3.35,1.05/(m*i.aspect),f/(2*m*.84)),g=f/2;i.position.set(0,g+.06,-y),i.lookAt(0,g,0);let p=e.autoClear;e.setScissorTest(!1),e.setViewport(0,0,this.size.x,this.size.y),e.setClearColor(this.paper,1),e.clear(),e.setViewport(c,h,a,l),e.setScissor(c,h,a,l),e.setScissorTest(!0),e.autoClear=!1,e.render(n,i),e.autoClear=p,e.setScissorTest(!1),e.setViewport(0,0,this.size.x,this.size.y)}close(){if(!this.active)return;let{scene:t,camera:e,renderer:i}=this.world,n=this.original;for(let[s,o]of n.visibility)s.visible=o;t.background=n.background,t.fog=n.fog,e.fov=n.fov,e.aspect=n.aspect,e.position.copy(n.position),e.quaternion.copy(n.quaternion),e.updateProjectionMatrix(),i.setScissorTest(!1),i.setClearColor(n.clearColor,n.clearAlpha),this.active=!1,this.original=null}dispose(){this.close(),this.world.scene.remove(this.stand),this.stand.geometry.dispose(),this.stand.material.dispose()}};var bf="naiwa_run_records";var w_=["id","legacy","distance","coins","mapId","mapName","finishedAt"];function vl(r){return r!==null&&typeof r=="object"&&!Array.isArray(r)}function Ps(r){return typeof r!="number"||!Number.isFinite(r)||r<0?0:Math.min(Number.MAX_SAFE_INTEGER,Math.floor(r))}function Or(r,t){return typeof r!="string"?null:r.trim().slice(0,t)||null}function Mf(r){return typeof r!="number"||!Number.isFinite(r)||r<0?null:Math.min(864e13,Math.floor(r))}function A_(r){return{id:"legacy-best",legacy:!0,distance:r,coins:null,mapId:null,mapName:null,finishedAt:null}}function Sf(r,t){return t.distance-r.distance||(t.coins??-1)-(r.coins??-1)||(t.finishedAt??-1)-(r.finishedAt??-1)||t.id.localeCompare(r.id,"en",{numeric:!0})}var bl=class{constructor(t,{bestDistance:e=0}={}){this.storage=t;let i=null;try{i=t.getStorage(bf,null)}catch{}let n=vl(i)?i:{},s=Array.isArray(n.entries)?n.entries:[],o=new Set,a=Ps(e),l=[];for(let u=0;u<s.length;u++){let d=s[u];if(!vl(d))continue;let f=Ps(d.distance);if(f===0)continue;if(d.legacy===!0){a=Math.max(a,f);continue}let m=Or(d.id,96)||`recovered-${u}`;m==="legacy-best"&&(m=`recovered-${u}`),!o.has(m)&&(o.add(m),l.push({id:m,legacy:!1,distance:f,coins:Ps(d.coins),mapId:Or(d.mapId,64),mapName:Or(d.mapName,120),finishedAt:Mf(d.finishedAt)}))}let c=l.reduce((u,d)=>Math.max(u,d.distance),0);this.bestDistance=Math.max(a,c),this.totalRuns=Math.max(Ps(n.totalRuns),l.length),a>c&&l.push(A_(a)),this.entries=l.sort(Sf).slice(0,20);let h=n.version===1&&n.totalRuns===this.totalRuns&&Array.isArray(n.entries)&&n.entries.length===this.entries.length&&n.entries.every((u,d)=>vl(u)&&w_.every(f=>u[f]===this.entries[d][f]));this.dirty=!h&&(i!==null||this.entries.length>0),this.dirty&&this.save()}recordRun(t={}){if(!vl(t))return null;let e=Ps(t.distance);if(e===0)return null;let i=Mf(t.finishedAt===void 0?Date.now():t.finishedAt);this.totalRuns=Math.min(Number.MAX_SAFE_INTEGER,this.totalRuns+1);let n=`run-${this.totalRuns}-${i??"unknown"}`,s=n,o=0;for(;this.entries.some(l=>l.id===s);)s=`${n}-${++o}`;let a={id:s,legacy:!1,distance:e,coins:Ps(t.coins),mapId:Or(t.mapId,64),mapName:Or(t.mapName,120),finishedAt:i};return this.bestDistance=Math.max(this.bestDistance,e),this.entries=[...this.entries,a].filter(l=>!l.legacy||e<l.distance).sort(Sf).slice(0,20),this.dirty=!0,this.save(),{...a}}snapshot(){return{entries:this.entries.map(t=>({...t})),bestDistance:this.bestDistance,totalRuns:this.totalRuns}}save(){if(!this.dirty)return!1;try{return this.storage.setStorage(bf,{version:1,entries:this.entries.map(e=>({...e})),totalRuns:this.totalRuns})===!1?!1:(this.dirty=!1,!0)}catch{return!1}}};var Ef="naiwa_wardrobe_inventory",Ml={clothes:"outfits",wings:"wings"};function Ah(r){return r!==null&&typeof r=="object"&&!Array.isArray(r)}function Ls(r){return typeof r=="number"&&Number.isSafeInteger(r)&&r>=0}function wh(r){if(typeof r!="string"||!/^\d{4}-\d{2}-\d{2}$/.test(r))return!1;let[t,e,i]=r.split("-").map(Number);if(t<1||e<1||e>12||i<1)return!1;let s=[31,t%4===0&&(t%100!==0||t%400===0)?29:28,31,30,31,30,31,31,30,31,30,31];return i<=s[e-1]}function Tf(r){let t=new Map([["none",0]]);if(!Ah(r))return t;for(let[e,i]of Object.entries(r))e!=="none"&&Ah(i)&&Ls(i.price)&&t.set(e,i.price);return t}var Sl=class{constructor(t,{outfits:e,wings:i,coins:n=0}={}){this.storage=t,this.prices={clothes:Tf(e),wings:Tf(i)};let s=null;try{s=t.getStorage(Ef,null)}catch{}let o=Ah(s)&&s.version===1?s:{};this.coins=Ls(o.coins)?o.coins:Ls(n)?n:0,this.owned={clothes:new Set(["none"]),wings:new Set(["none"])};for(let[l,c]of Object.entries(Ml))if(Array.isArray(o[c]))for(let h of o[c])typeof h=="string"&&this.getPrice(l,h)!==null&&this.owned[l].add(h);this.dailyClaimDay=wh(o.dailyClaimDay)?o.dailyClaimDay:null;let a=this.snapshot();this.dirty=o.coins!==this.coins||o.version!==1||(o.dailyClaimDay??null)!==this.dailyClaimDay||Object.values(Ml).some(l=>!Array.isArray(o[l])||o[l].length!==a[l].length||o[l].some((c,h)=>c!==a[l][h]))}getPrice(t,e){return!Object.prototype.hasOwnProperty.call(Ml,t)||typeof e!="string"?null:this.prices[t].get(e)??null}isOwned(t,e){let i=this.getPrice(t,e);return i!==null&&(i===0||this.owned[t].has(e))}snapshot(){return{outfits:[...this.owned.clothes],wings:[...this.owned.wings]}}purchase(t,e,i=this.coins){let n=this.getPrice(t,e),s=(l,c,h=this.coins,u=n??0)=>({ok:l,status:c,coins:h,cost:u});if(n===null||!Ls(i)||i!==this.coins)return s(!1,"invalid");if(this.isOwned(t,e))return s(!0,"already-owned",this.coins,0);if(this.coins<n)return s(!1,"insufficient");let o=this.coins-n,a=this.snapshot();return a[Ml[t]].push(e),this.write(a,o)?(this.owned[t].add(e),this.coins=o,this.dirty=!1,s(!0,"purchased")):s(!1,"storage-error")}addCoins(t){if(!Ls(t)||t===0)return!1;let e=Math.min(Number.MAX_SAFE_INTEGER,this.coins+t);return e===this.coins?!1:(this.coins=e,this.dirty=!0,!0)}hasClaimedDaily(t){return wh(t)&&this.dailyClaimDay===t}claimDaily(t,e=100){let i=(o,a,l=0)=>({ok:o,status:a,coins:this.coins,amount:l});if(!wh(t)||!Ls(e)||e===0)return i(!1,"invalid");if(this.hasClaimedDaily(t))return i(!1,"already-claimed");let n=Math.min(Number.MAX_SAFE_INTEGER,this.coins+e);if(!this.write(this.snapshot(),n,t))return i(!1,"storage-error");let s=n-this.coins;return this.coins=n,this.dailyClaimDay=t,this.dirty=!1,i(!0,"claimed",s)}save(){return!this.dirty||!this.write(this.snapshot(),this.coins)?!1:(this.dirty=!1,!0)}write(t,e,i=this.dailyClaimDay){try{return this.storage.setStorage(Ef,{version:1,coins:e,outfits:[...t.outfits],wings:[...t.wings],dailyClaimDay:i})!==!1}catch{return!1}}};var _e={LOBBY:"LOBBY",TRANSITION:"TRANSITION",PLAYING:"PLAYING",PAUSED:"PAUSED",GAMEOVER:"GAMEOVER"},R_=["等我奶蛙跑酷达到10万米我也要去问问许嵩 那阵子我们的感情到底出了什么问题#奶蛙","奶龙跑得太快，肚皮把金字塔撞出了一个窟窿！","刚才那一脚后蹬太帅，可惜撞到了迎面驶来的埃及特快！","人在埃及刚下火车，被奶龙圆滚滚的大肚皮弹飞了300米！","据说只要在砂岩集市车顶跑够2万米，就能召唤黄金烤全羊！"],C_={store:["差一点就到零食区了！肚皮已经准备好，脚却先打了结。","收银员说：这只奶蛙超速了，先排队再结账！","刚才那个零食盒太大，奶蛙决定先吃掉它再跑。"],tea:["珍珠太Q弹，奶蛙也被弹成了三分糖！","奶盖航线暂时靠岸，下一杯继续出发！","吸管拦住了去路，奶蛙申请加一份勇气。"],pond:["这一拍没跟上！奶蛙决定摸摸肚皮，重新找节奏。","荷塘主唱摔了个跤，观众说：再来一首！","音箱还在响，奶蛙先去后台喝口水。"],laundry:["袜子追到了，奶蛙却被毛巾绊住了！","暖风把勇气吹满了，脚步还得再晒一晒。","奶蛙宣布：刚才那一下是柔顺剂太滑！"]},El=class{constructor(){this.state=_e.LOBBY,this.canvas=null,this.world=null,this.player=null,this.ui=new xl,this.score=0,this.coins=he.getStorage("naiwa_coins",0),this.savedCoinBalance=this.coins,this.wardrobeInventory=new Sl(he,{outfits:De,wings:Mn,coins:this.coins}),this.coins=this.wardrobeInventory.coins,this.speed=ot.SPEED.INITIAL,this.highScore=he.getStorage("naiwa_highscore",0),this.savedHighScore=this.highScore,this.progress=new yl(he,{highScore:this.highScore,coins:this.coins}),this.highScore=this.progress.stats.bestDistance,this.runRecords=new bl(he,{bestDistance:this.highScore}),this.progress.recordDistance(this.runRecords.snapshot().bestDistance),this.highScore=this.progress.stats.bestDistance,this.activeRun=null,this.progressSaveElapsed=0,this.wardrobeSession=null,this.lobbyTime=0,this.transitionTime=0,this.transitionDuration=.85,this.lastTime=0,this.deathJoke="",this.boundLoop=this.loop.bind(this)}init(t=null){if(this.canvas=t||document.getElementById("gameCanvas"),!this.canvas){console.error("Cannot find #gameCanvas");return}he.initCanvas(this.canvas,"webgl"),this.world=new dl(this.canvas),this.player=new gl(this.world.scene);let e=he.getStorage("naiwa_wing_skin","none"),i=this.wardrobeInventory.isOwned("wings",e)?e:"none";this.player.character.wings.equip(i),this.equippedWingId=this.player.character.wings.skinId;let n=he.getStorage("naiwa_outfit_skin","none");this.equippedOutfitId=this.wardrobeInventory.isOwned("clothes",n)?n:"none",this.player.character.outfits.equip(this.equippedOutfitId),i!==e&&he.setStorage("naiwa_wing_skin",i),this.equippedOutfitId!==n&&he.setStorage("naiwa_outfit_skin",this.equippedOutfitId),this.player.onActionCompleted=o=>{this.state===_e.PLAYING&&(this.progress.completeAction(o),this.flushProgress())},window.addEventListener("pagehide",()=>this.handleBackground()),document.addEventListener("visibilitychange",()=>{document.hidden&&this.handleBackground()}),this.flushProgress(),this.world.applyMapTheme(Mi.getCurrentMap()),this.player.setLobbyMode(!0),this.world.setLobbyCamera(0),this.resize(),window.addEventListener("resize",()=>this.resize()),he.onGesture(o=>this.handleGesture(o)),this.bindEvents();let s=Mi.getCurrentMap();this.ui.showLobby({coins:this.coins,highScore:this.highScore,currentMap:s}),s.dialogues&&s.dialogues.length>0&&this.ui.setSpeechBubble(s.dialogues[0]),this.ui.updateMuteIcon(fe.isMuted),this.lastTime=performance.now(),requestAnimationFrame(this.boundLoop)}bindEvents(){let t=i=>{if(i&&(i.preventDefault(),i.stopPropagation()),this.state!==_e.LOBBY)return;fe.playInteract(),this.player.triggerInteract();let n=Mi.getCurrentMap();if(n.dialogues&&n.dialogues.length>0){let s=n.dialogues[Math.floor(Math.random()*n.dialogues.length)];this.ui.setSpeechBubble(s)}this.ui.spawnReaction()};this.ui.dom.characterTouchZone&&(this.ui.dom.characterTouchZone.addEventListener("click",t),this.ui.dom.characterTouchZone.addEventListener("touchstart",t,{passive:!1})),this.ui.dom.speechBubble&&this.ui.dom.speechBubble.addEventListener("click",t),this.ui.dom.btnStartRun&&this.ui.dom.btnStartRun.addEventListener("click",()=>this.startRunTransition());let e=()=>{this.ui.renderMapList(Mi.getAllMaps(),Mi.getCurrentMap().id,i=>this.switchMap(i)),this.ui.showMapModal()};this.ui.dom.btnChangeMap&&this.ui.dom.btnChangeMap.addEventListener("click",e),this.ui.dom.btnOpenMaps&&this.ui.dom.btnOpenMaps.addEventListener("click",e),this.ui.dom.btnCloseMapModal&&this.ui.dom.btnCloseMapModal.addEventListener("click",()=>this.ui.hideMapModal()),this.ui.dom.btnOpenWardrobe&&this.ui.dom.btnOpenWardrobe.addEventListener("click",()=>this.openWardrobe()),this.ui.dom.btnCloseWardrobeModal&&this.ui.dom.btnCloseWardrobeModal.addEventListener("click",()=>this.ui.hideWardrobeModal()),this.ui.onWardrobeClose=()=>this.closeWardrobe(),this.bindWardrobeControls(),this.ui.dom.btnOpenAchievements&&this.ui.dom.btnOpenAchievements.addEventListener("click",()=>{this.flushProgress(),this.ui.renderAchievements(this.progress.snapshot()),this.ui.showAchievementsModal()}),this.ui.dom.btnCloseAchievementsModal&&this.ui.dom.btnCloseAchievementsModal.addEventListener("click",()=>this.ui.hideAchievementsModal()),this.ui.dom.btnOpenRank&&this.ui.dom.btnOpenRank.addEventListener("click",()=>this.ui.showRankModal(this.runRecords.snapshot())),this.ui.dom.btnCloseRankModal&&this.ui.dom.btnCloseRankModal.addEventListener("click",()=>this.ui.hideRankModal()),this.ui.dom.btnOpenDaily&&this.ui.dom.btnOpenDaily.addEventListener("click",()=>{this.ui.updateDailyAvailability({claimed:this.wardrobeInventory.hasClaimedDaily(this.dailyDateKey())}),this.ui.showDailyModal()}),this.ui.dom.btnCloseDailyModal&&this.ui.dom.btnCloseDailyModal.addEventListener("click",()=>this.ui.hideDailyModal()),this.ui.dom.btnClaimDaily&&this.ui.dom.btnClaimDaily.addEventListener("click",()=>{this.claimDaily()}),this.ui.dom.btnMute&&this.ui.dom.btnMute.addEventListener("click",i=>{i.stopPropagation();let n=fe.toggleMute();this.ui.updateMuteIcon(n)}),this.ui.dom.pauseBtn&&this.ui.dom.pauseBtn.addEventListener("click",i=>{i.stopPropagation(),this.pause()}),this.ui.dom.btnResume&&this.ui.dom.btnResume.addEventListener("click",()=>this.resume()),this.ui.dom.btnPauseToLobby&&this.ui.dom.btnPauseToLobby.addEventListener("click",()=>this.returnToLobby()),this.ui.dom.btnRestart&&this.ui.dom.btnRestart.addEventListener("click",()=>this.restart()),this.ui.dom.btnGameOverToLobby&&this.ui.dom.btnGameOverToLobby.addEventListener("click",()=>this.returnToLobby())}switchMap(t){if(this.state===_e.LOBBY&&Mi.setMap(t)){let e=Mi.getCurrentMap();this.world.applyMapTheme(e),this.player.reset(),this.player.setLobbyMode(!0),this.lobbyTime=0,this.world.setLobbyCamera(0),this.ui.showLobby({coins:this.coins,highScore:this.highScore,currentMap:e}),e.dialogues&&e.dialogues.length>0&&this.ui.setSpeechBubble(e.dialogues[0])}}startRunTransition(){this.state===_e.TRANSITION||this.state===_e.PLAYING||(this.wardrobeSession&&this.ui.hideWardrobeModal(),this.finishRun(),fe.stopBGM({reset:!0}),fe.resume(),fe.playStartRun(),fe.startBGM(),this.ui.hideLobby(),this.state=_e.TRANSITION,this.transitionTime=0,this.score=0,this.speed=ot.SPEED.INITIAL,this.world.reset(),this.player.reset(),this.beginRun())}start(){this.startRunTransition()}returnToLobby(){this.finishRun(),this.flushProgress(),this.wardrobeSession&&this.ui.hideWardrobeModal(),this.state=_e.LOBBY,this.lobbyTime=0,fe.stopBGM({reset:!0}),this.world.reset(),this.player.reset(),this.player.setLobbyMode(!0),this.world.setLobbyCamera(0),this.ui.showLobby({coins:this.coins,highScore:this.highScore,currentMap:Mi.getCurrentMap()})}restart(){this.finishRun(),this.flushProgress(),this.player.reset(),this.world.reset(),this.player.setLobbyMode(!1),this.score=0,this.beginRun(),this.speed=ot.SPEED.INITIAL,this.state=_e.PLAYING,this.lastTime=performance.now(),this.ui.hideGameOver(),this.ui.hidePause(),this.ui.hideLobby(),fe.stopBGM({reset:!0}),fe.resume(),fe.startBGM()}pause(){(this.state===_e.PLAYING||this.state===_e.TRANSITION)&&(this.flushProgress(),this.pausedState=this.state,this.state=_e.PAUSED,this.ui.showPause(),fe.stopBGM())}resume(){this.state===_e.PAUSED&&(this.state=this.pausedState===_e.TRANSITION?_e.TRANSITION:_e.PLAYING,this.pausedState=null,this.ui.hidePause(),fe.startBGM(),this.lastTime=performance.now())}handleBackground(){this.state===_e.PLAYING||this.state===_e.TRANSITION?this.pause():this.flushProgress(),fe.stopBGM()}resize(){if(!this.world||!this.canvas)return;let t=this.canvas.clientWidth||window.innerWidth,e=this.canvas.clientHeight||window.innerHeight;this.world.renderer&&this.world.camera&&(this.world.renderer.setSize(t,e,!1),this.world.camera.aspect=t/e,this.world.camera.updateProjectionMatrix())}handleGesture(t){if(fe.resume(),this.state!==_e.LOBBY&&!(this.state===_e.GAMEOVER||this.state===_e.PAUSED)&&this.state===_e.PLAYING)switch(t){case"swipe_left":this.player.moveLeft();break;case"swipe_right":this.player.moveRight();break;case"swipe_up":this.player.jump();break;case"swipe_down":this.player.slide();break}}loop(t){this.lastTime||(this.lastTime=t);let e=Math.max(0,Math.min((t-this.lastTime)/1e3,.05));if(this.lastTime=t,this.state===_e.LOBBY)this.lobbyTime+=e,this.player.updateLobby(e),this.wardrobeSession||this.world.setLobbyCamera(this.lobbyTime);else if(this.state===_e.TRANSITION){this.transitionTime+=e;let i=Math.min(1,this.transitionTime/this.transitionDuration);this.player.updateStartTransition(i),this.world.updateTransitionCamera(i,this.player),i>=1&&(this.state=_e.PLAYING,this.player.setLobbyMode(!1),fe.startBGM())}else this.state===_e.PLAYING&&this.update(e);this.world&&(this.wardrobeSession?this.renderWardrobe(e):this.world.render()),requestAnimationFrame(this.boundLoop)}update(t){this.player.props.milk>0?this.speed=ot.SPEED.RUSH_SPEED:this.speed=Math.min(this.speed+ot.SPEED.ACCELERATION*t,ot.SPEED.MAX);let e=this.speed*this.world.getSpeedMultiplier(this.player);this.score+=e*t,this.progress&&(this.progress.recordDistance(this.score),this.highScore=this.progress.stats.bestDistance,this.progressSaveElapsed+=t,this.progressSaveElapsed>=2&&this.flushProgress()),this.previousPlayerZ=this.player.z,this.previousPlayerX=this.player.x,this.previousPlayerY=this.player.y,this.player.update(t,e,{ramps:this.world.ramps,trains:this.world.trains}),this.world.update(t,e,this.player);let i=this.world.consumeChallengeRewards();i>0&&(this.addCoins(i),fe.playCoin()),this.checkCollisions(),this.ui.updateHUD({score:this.score,coins:this.coins,speed:e,player:this.player,challenge:this.world.challengeState})}checkCollisions(){let t=Math.round(-this.player.x/ot.LANE_WIDTH),e=this.player.y+(this.player.isFlying?.4:.8),i=this.previousPlayerZ??this.player.z;for(let n of this.world.coins)if(!n.collected&&n.lane===t){let s=n.mesh.position.z,o=s>=Math.min(i,this.player.z)-.7&&s<=Math.max(i,this.player.z)+.7,a=Math.abs(n.mesh.position.y-e),l=Math.abs(n.mesh.position.x-this.player.x);o&&a<1.4&&l<1.2&&(n.collected=!0,this.addCoins(1),fe.playCoin(),n.destroy())}for(let n of this.world.props)if(!n.collected&&n.lane===t){let s=Math.abs(n.z-this.player.z),o=n.z>=Math.min(i,this.player.z)-.7&&n.z<=Math.max(i,this.player.z)+.7;(s<1.5||o)&&Math.abs(n.mesh.position.y-e)<1.65&&Math.abs(n.mesh.position.x-this.player.x)<1.2&&(n.collected=!0,this.player.addProp(n.type),n.destroy())}if(!(this.player.dead||this.player.isFlying)){for(let n of this.world.trains)if(n.lane===t&&this.player.z>=n.z-.4&&this.player.z<=n.z+n.length&&!(this.player.y>=n.height-.35)){this.handleHit();return}for(let n of this.world.barriers)if(n instanceof Sn&&n.collidesWith(this.player,{x:this.previousPlayerX,y:this.previousPlayerY,z:i})){this.handleHit();return}for(let n of this.world.barriers)if(n instanceof Gn&&n.lane===t&&Math.abs(n.z-this.player.z)<.65&&this.player.y<n.height-.15){this.handleHit();return}for(let n of this.world.barriers)if(n instanceof zn&&n.lane===t&&Math.abs(n.z-this.player.z)<.65){let s=this.player.isSliding?ot.PLAYER.SLIDE_HEIGHT:ot.PLAYER.COLLIDER_HEIGHT;if(this.player.y<n.height&&this.player.y+s>n.clearanceY){this.handleHit();return}}}}handleHit(){if(this.player.takeHit()){this.finishRun(),this.state=_e.GAMEOVER,fe.stopBGM(),this.persistCoinWallet(),this.score>this.highScore&&(this.highScore=Math.floor(this.score),he.setStorage("naiwa_highscore",this.highScore)),this.progress?.recordDistance(this.score),this.flushProgress();let e=C_[Mi.getCurrentMap().id]||R_;this.deathJoke=e[Math.floor(Math.random()*e.length)],setTimeout(()=>{this.ui.showGameOver(this.score,this.coins,this.deathJoke)},600)}}addCoins(t){if(!Number.isFinite(t)||t<=0)return;let e=Math.floor(t);this.wardrobeInventory?(this.wardrobeInventory.addCoins(e),this.coins=this.wardrobeInventory.coins):this.coins+=e,this.activeRun&&this.state===_e.PLAYING&&(this.activeRun.coins=Math.min(Number.MAX_SAFE_INTEGER,this.activeRun.coins+e)),this.progress?.addCoins(e),this.persistCoinWallet()}persistCoinWallet(){return this.wardrobeInventory&&(this.wardrobeInventory.save(),this.wardrobeInventory.dirty)?!1:this.savedCoinBalance===this.coins?!0:he.setStorage("naiwa_coins",this.coins)===!1?!1:(this.savedCoinBalance=this.coins,!0)}dailyDateKey(){let t=new Date;return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}claimDaily(){if(this.state!==_e.LOBBY)return;let t=this.dailyDateKey(),e=this.wardrobeInventory.claimDaily(t,100);this.ui.updateDailyAvailability({claimed:this.wardrobeInventory.hasClaimedDaily(t)}),e.ok&&(this.coins=e.coins,this.progress?.addCoins(e.amount),this.flushProgress(),fe.playCoin(),this.ui.showLobby({coins:this.coins,highScore:this.highScore,currentMap:Mi.getCurrentMap()}),this.ui.spawnReaction("⭐"))}beginRun(){let t=Mi.getCurrentMap();this.activeRun={coins:0,mapId:t.id,mapName:t.name}}finishRun(){if(!this.activeRun)return null;let t=this.activeRun;return this.activeRun=null,this.runRecords?.recordRun({...t,distance:this.score})??null}flushProgress(){this.persistCoinWallet(),this.runRecords?.save(),this.progress&&(this.progress.save(),this.highScore>this.savedHighScore&&(he.setStorage("naiwa_highscore",this.highScore),this.savedHighScore=this.highScore),this.progressSaveElapsed=0)}bindWardrobeControls(){let t=this.ui.dom;t.btnWardrobeClothes?.addEventListener("click",()=>this.setWardrobeTab("clothes")),t.btnWardrobeWings?.addEventListener("click",()=>this.setWardrobeTab("wings")),t.btnEquipWardrobe?.addEventListener("click",()=>this.equipWardrobeSelection()),t.btnWardrobeLeft?.addEventListener("click",()=>this.wardrobePreview?.rotate(-Math.PI/2)),t.btnWardrobeRight?.addEventListener("click",()=>this.wardrobePreview?.rotate(Math.PI/2)),t.btnWardrobeReset?.addEventListener("click",()=>this.wardrobePreview?.resetAngle());let e=null;t.wardrobePreview?.addEventListener("pointerdown",n=>{!this.wardrobeSession||n.target.closest("button")||(n.preventDefault(),e={id:n.pointerId,x:n.clientX,angle:this.wardrobePreview.targetAngle},t.wardrobePreview.setPointerCapture(n.pointerId))}),t.wardrobePreview?.addEventListener("pointermove",n=>{!e||e.id!==n.pointerId||(this.wardrobePreview.targetAngle=e.angle+(n.clientX-e.x)*.014)});let i=n=>{e?.id===n.pointerId&&(e=null)};t.wardrobePreview?.addEventListener("pointerup",i),t.wardrobePreview?.addEventListener("pointercancel",i),t.wardrobePreview?.addEventListener("keydown",n=>{!this.wardrobeSession||!["ArrowLeft","ArrowRight","Home"].includes(n.key)||(n.preventDefault(),n.stopPropagation(),n.key==="Home"?this.wardrobePreview.resetAngle():this.wardrobePreview.rotate(n.key==="ArrowLeft"?-.35:.35))}),document.addEventListener("keydown",n=>{n.key==="Escape"&&(this.wardrobeSession?this.ui.hideWardrobeModal():this.ui.hideAchievementsModal())})}openWardrobe(){this.state!==_e.LOBBY||this.wardrobeSession||(this.wardrobeSession={tab:"clothes",clothes:this.equippedOutfitId,wings:this.equippedWingId,purchaseMessage:""},this.wardrobePreview||(this.wardrobePreview=new _l(this.world,this.player,this.ui.dom.wardrobePreview)),this.wardrobePreview.open(),this.ui.showWardrobeModal(),this.setWardrobeTab("clothes"))}setWardrobeTab(t){this.wardrobeSession&&(this.wardrobeSession.tab=t,this.ui.showWardrobeTab(t),this.refreshWardrobe())}refreshWardrobe(){let t=this.wardrobeSession;if(!t)return;let e=this.wardrobeInventory.snapshot();this.ui.renderOutfitSkins(De,this.equippedOutfitId,t.clothes,a=>{Object.prototype.hasOwnProperty.call(De,a)&&(t.purchaseMessage="",t.clothes=a,this.player.character.outfits.equip(a),this.refreshWardrobe())},e),this.ui.renderWingSkins(Mn,this.equippedWingId,a=>{a!=="none"&&!Object.prototype.hasOwnProperty.call(Mn,a)||(t.purchaseMessage="",t.wings=a,this.player.character.wings.equip(a),this.refreshWardrobe())},t.wings,e);let i=t[t.tab],n=t.tab==="clothes"?this.equippedOutfitId:this.equippedWingId,s=t.tab==="clothes"?De[i].name:Mn[i]?.name||"不佩戴翅膀",o=t.tab==="clothes"?De[i].description:Mn[i]?.description||"轻装跑酷，拾到羽毛仍可飞行";this.ui.updateWardrobePreview({name:s,description:o,equipped:i===n,owned:this.wardrobeInventory.isOwned(t.tab,i),price:this.wardrobeInventory.getPrice(t.tab,i),coins:this.coins,purchaseMessage:t.purchaseMessage})}equipWardrobeSelection(){let t=this.wardrobeSession;if(!t)return;let e=t[t.tab];if(!this.wardrobeInventory.isOwned(t.tab,e)){let i=this.wardrobeInventory.purchase(t.tab,e,this.coins);if(!i.ok){t.purchaseMessage=i.status==="insufficient"?`还差 ${Math.max(0,this.wardrobeInventory.getPrice(t.tab,e)-this.coins).toLocaleString("zh-CN")} 金币`:"购买没有保存，请重试",this.refreshWardrobe();return}this.coins=i.coins,this.persistCoinWallet(),this.ui.dom.lobbyCoins&&(this.ui.dom.lobbyCoins.textContent=this.coins),t.purchaseMessage="已解锁，已为奶蛙装备",fe.playCoin()}t.tab==="clothes"?(this.equippedOutfitId=t.clothes,he.setStorage("naiwa_outfit_skin",this.equippedOutfitId)):(this.equippedWingId=t.wings,he.setStorage("naiwa_wing_skin",this.equippedWingId)),this.refreshWardrobe()}renderWardrobe(t){this.wardrobePreview.render(t)}closeWardrobe(){this.wardrobeSession&&(this.wardrobePreview.close(),this.wardrobeSession=null,this.player.character.outfits.equip(this.equippedOutfitId),this.player.character.wings.equip(this.equippedWingId),this.player.setLobbyMode(!0),this.world.setLobbyCamera(this.lobbyTime),this.resize())}};var Rh=new El;Rh.init();window.naiwaGame=Rh;document.documentElement.dataset.naiwaBuild=document.querySelector("[data-naiwa-bundle]")?.dataset.build||"development";new URLSearchParams(window.location.search).has("autostart")&&Rh.start();var Tl=(r,t)=>{let e=document.getElementById(r);if(!e)return;let i=n=>{n.preventDefault(),n.stopPropagation(),he.notifyGesture(t)};e.addEventListener("touchstart",i,{passive:!1}),e.addEventListener("mousedown",i)};Tl("btnLeft","swipe_left");Tl("btnRight","swipe_right");Tl("btnJump","swipe_up");Tl("btnSlide","swipe_down");})();
