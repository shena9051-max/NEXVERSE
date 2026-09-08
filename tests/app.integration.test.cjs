const fs=require('fs'),vm=require('vm');
class Classes{constructor(active=false){this.s=new Set(active?['active']:[])}toggle(k,on){on?this.s.add(k):this.s.delete(k)}contains(k){return this.s.has(k)}}
class El{constructor({active=false,dataset={}}={}){this.classList=new Classes(active);this.dataset=dataset;this.attrs={};this.listeners={};this.textContent='';this.innerHTML='';this.hidden=false;this.style={}}addEventListener(t,f){(this.listeners[t]??=[]).push(f)}fire(t,e={preventDefault(){},pointerId:1}){for(const f of this.listeners[t]||[])f(e)}setAttribute(k,v){this.attrs[k]=v}querySelector(){return null}}
const watch=new El({active:true}),play=new El(),game=new El(),stage=new El();stage.clientWidth=390;stage.clientHeight=600;stage.getBoundingClientRect=()=>({width:390,height:600});
const score=new El(),message=new El(),title=new El(),messageText=new El(),start=new El(),back=new El();const navWatch=new El({active:true,dataset:{page:'watch'}}),navPlay=new El({dataset:{page:'play'}});
const videos=[{plays:0,pauses:0,play(){this.plays++;return Promise.resolve()},pause(){this.pauses++}},{plays:0,pauses:0,play(){this.plays++;return Promise.resolve()},pause(){this.pauses++}}];const counts=[{textContent:'0'},{textContent:'0'}];const posts=videos.map((v,i)=>{const e=new El();e.querySelector=s=>s==='video'?v:s==='.view-count'?counts[i]:null;return e});posts.push(new El());
const makeLike=id=>{const e=new El({dataset:{likeId:id}}),heart=new El(),count=new El();e.querySelector=s=>s==='.heart'?heart:s==='.like-count'?count:null;e.count=count;return e};const likes=[makeLike('video-1'),makeLike('video-2')];const enter=new El({dataset:{game:'nex-runner'}}),playNow=new El({dataset:{game:'nex-runner'}}),left=new El({dataset:{direction:'left'}}),right=new El({dataset:{direction:'right'}}),playCounts=[new El(),new El()];
const ctx={setTransform(){},clearRect(){},fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},strokeRect(){}};const canvas=new El();canvas.getContext=()=>ctx;const ids={watchPage:watch,playPage:play,gamePage:game,gameCanvas:canvas,gameStage:stage,score,gameMessage:message,messageTitle:title,messageText,startGame:start};const selectors={'.nav [data-page]':[navWatch,navPlay],video:videos,'.post':posts,'.like':likes,'[data-game="nex-runner"]':[enter,playNow],'.runner-play-count':playCounts,'.move-btn':[left,right]};const document={getElementById:id=>ids[id],querySelectorAll:s=>selectors[s]||[],querySelector:s=>s==='.back-games'?back:s.includes('left')?left:s.includes('right')?right:null};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};let sandbox;class IntersectionObserver{constructor(cb){sandbox.observerCallback=cb}observe(){}}const window=new El();window.devicePixelRatio=1;sandbox={document,localStorage,IntersectionObserver,window,performance:{now:()=>100},requestAnimationFrame:()=>7,cancelAnimationFrame(){},Math,Number,String};
const tests=`
if(!pages.watch.classList.contains('active')) throw Error('initial WATCH page');
observerCallback([{target:posts[0],isIntersecting:true,intersectionRatio:.65}]);
observerCallback([{target:posts[0],isIntersecting:true,intersectionRatio:.9}]);
if(String(posts[0].querySelector('.view-count').textContent)!=='1'||videos[0].plays!==2) throw Error('view/video');
document.querySelectorAll('.like')[0].fire('click');
if(document.querySelectorAll('.like')[0].count.textContent!=='1'||localStorage.getItem('nexverse:like:video-1')!=='true') throw Error('like');

document.querySelectorAll('[data-game="nex-runner"]')[0].fire('click');
if(!pages.game.classList.contains('active')) throw Error('ENTER WORLD');
navButtons[1].fire('click');
if(!pages.play.classList.contains('active')) throw Error('PLAY navigation');
document.querySelectorAll('[data-game="nex-runner"]')[1].fire('click');
if(!pages.game.classList.contains('active')) throw Error('PLAY NOW');
startButton.fire('click');
if(!running||animationId!==7) throw Error('start');

window.fire('keydown',{key:'ArrowLeft',preventDefault(){}});
const oldX=player.x;updateGame(.1);
if(!(player.x<oldX)) throw Error('keyboard left');
window.fire('keyup',{key:'ArrowLeft'});
window.fire('keydown',{key:'d',preventDefault(){}});
const x2=player.x;updateGame(.1);
if(!(player.x>x2)) throw Error('keyboard right');
window.fire('keyup',{key:'d'});
document.querySelector('[data-direction="left"]').fire('pointerdown');
if(!controls.left) throw Error('touch');
document.querySelector('[data-direction="left"]').fire('pointerup');
if(controls.left) throw Error('touch release');

obstacles=[{x:player.x,y:player.y,w:player.w,h:player.h,speed:0}];running=true;updateGame(0);
if(running||messageTitle.textContent!=='GAME OVER'||startButton.textContent!=='RETRY') throw Error('game over');
startButton.fire('click');
if(!running||!message.hidden) throw Error('retry');
navButtons[0].fire('click');
if(!pages.watch.classList.contains('active')||running) throw Error('WATCH return');
`;
vm.runInNewContext(fs.readFileSync('app.js','utf8')+'\n'+tests,sandbox);console.log('Navigation, game start, keyboard/touch controls, collision, retry, WATCH return, view counter, video, and likes passed.');
