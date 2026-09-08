const pages = {watch: document.getElementById('watchPage'), play: document.getElementById('playPage'), game: document.getElementById('gamePage')};
const navButtons = [...document.querySelectorAll('.nav [data-page]')];
const videos = [...document.querySelectorAll('video')];
const posts = [...document.querySelectorAll('.post')];

function showPage(name){
  Object.entries(pages).forEach(([key,page])=>page.classList.toggle('active', key === name));
  navButtons.forEach(btn=>btn.classList.toggle('active', btn.dataset.page === (name === 'game' ? 'play' : name)));
  if(name !== 'watch') videos.forEach(video=>video.pause());
  if(name !== 'game') stopGame();
}

const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    const video = entry.target.querySelector('video');
    if(!video) return;
    const isVisible = pages.watch.classList.contains('active') && entry.isIntersecting && entry.intersectionRatio >= .65;
    if(isVisible){
      if(entry.target.dataset.isViewing !== 'true'){
        const count = entry.target.querySelector('.view-count');
        count.textContent = Number(count.textContent) + 1;
        entry.target.dataset.isViewing = 'true';
      }
      videos.forEach(other=>{if(other !== video) other.pause()});
      video.play().catch(()=>{});
    }else{
      entry.target.dataset.isViewing = 'false';
      video.pause();
    }
  });
},{threshold:[0,.65,1]});
posts.forEach(post=>observer.observe(post));

document.querySelectorAll('.like').forEach(btn=>{
  const storageKey = `nexverse:like:${btn.dataset.likeId}`;
  let liked = localStorage.getItem(storageKey) === 'true';
  const renderLike = ()=>{
    btn.classList.toggle('liked',liked);
    btn.setAttribute('aria-pressed',String(liked));
    btn.querySelector('.heart').textContent = liked ? '♥' : '♡';
    btn.querySelector('.like-count').textContent = liked ? '1' : '0';
  };
  renderLike();
  btn.addEventListener('click',()=>{liked=!liked;localStorage.setItem(storageKey,String(liked));renderLike()});
});

navButtons.forEach(btn=>btn.addEventListener('click',()=>showPage(btn.dataset.page)));
document.querySelector('.back-games').addEventListener('click',()=>showPage('play'));
document.querySelectorAll('[data-game="nex-runner"]').forEach(btn=>btn.addEventListener('click',openRunner));

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const stage = document.getElementById('gameStage');
const scoreElement = document.getElementById('score');
const message = document.getElementById('gameMessage');
const messageTitle = document.getElementById('messageTitle');
const messageText = document.getElementById('messageText');
const startButton = document.getElementById('startGame');
const controls = {left:false,right:false};
let player, obstacles, score, running=false, animationId=0, lastTime=0, spawnTimer=0;

function updatePlayCount(){
  const key='nexverse:plays:nex-runner';
  const count=Number(localStorage.getItem(key) || 2481)+1;
  localStorage.setItem(key,String(count));
  document.querySelectorAll('.runner-play-count').forEach(el=>el.textContent=count.toLocaleString('en-US'));
}
function openRunner(){
  showPage('game');
  message.hidden=false;messageTitle.textContent='NEX RUNNER';messageText.innerHTML='左右に移動して、迫り来る障害物を回避せよ。<br>PC: ← → / A D　スマホ: 下のボタン';startButton.textContent='START RUN';
  resizeCanvas();drawScene();
}
function resizeCanvas(){
  const rect=stage.getBoundingClientRect();
  const dpr=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.max(1,Math.floor(rect.width*dpr));canvas.height=Math.max(1,Math.floor(rect.height*dpr));
  canvas.style.width=`${rect.width}px`;canvas.style.height=`${rect.height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);
  canvas.gameWidth=rect.width;canvas.gameHeight=rect.height;
}
function resetGame(){
  resizeCanvas();score=0;obstacles=[];spawnTimer=0;lastTime=performance.now();
  player={x:canvas.gameWidth/2-16,y:canvas.gameHeight-62,w:32,h:38,speed:260};scoreElement.textContent='000';
}
function startGame(){stopGame();resetGame();message.hidden=true;running=true;updatePlayCount();animationId=requestAnimationFrame(gameLoop)}
function stopGame(){running=false;if(animationId)cancelAnimationFrame(animationId);animationId=0;controls.left=controls.right=false}
function endGame(){stopGame();messageTitle.textContent='GAME OVER';messageText.textContent=`SCORE ${String(score).padStart(3,'0')} — 世界は再挑戦を待っている。`;startButton.textContent='RETRY';message.hidden=false}
function spawnObstacle(){const size=24+Math.random()*22;obstacles.push({x:Math.random()*(canvas.gameWidth-size),y:-size,w:size,h:size,speed:150+Math.min(score*4,130)})}
function overlaps(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function updateGame(dt){
  const direction=(controls.right?1:0)-(controls.left?1:0);player.x=Math.max(0,Math.min(canvas.gameWidth-player.w,player.x+direction*player.speed*dt));
  spawnTimer+=dt;if(spawnTimer>Math.max(.42,.9-score*.012)){spawnObstacle();spawnTimer=0}
  for(let i=obstacles.length-1;i>=0;i--){const obstacle=obstacles[i];obstacle.y+=obstacle.speed*dt;if(overlaps(player,obstacle)){endGame();return}if(obstacle.y>canvas.gameHeight){obstacles.splice(i,1);score++;scoreElement.textContent=String(score).padStart(3,'0')}}
}
function drawScene(){
  const w=canvas.gameWidth||stage.clientWidth,h=canvas.gameHeight||stage.clientHeight;ctx.clearRect(0,0,w,h);ctx.fillStyle='#070b12';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='#d9ff4618';ctx.lineWidth=1;for(let x=0;x<w;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=0;y<h;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  if(!player)player={x:w/2-16,y:h-62,w:32,h:38};ctx.shadowBlur=18;ctx.shadowColor='#d9ff46';ctx.fillStyle='#d9ff46';ctx.fillRect(player.x,player.y,player.w,player.h);ctx.shadowBlur=0;
  obstacles?.forEach(o=>{ctx.fillStyle='#ff456d';ctx.fillRect(o.x,o.y,o.w,o.h);ctx.strokeStyle='#fff';ctx.strokeRect(o.x+4,o.y+4,o.w-8,o.h-8)});
}
function gameLoop(now){if(!running)return;const dt=Math.min((now-lastTime)/1000,.034);lastTime=now;updateGame(dt);drawScene();if(running)animationId=requestAnimationFrame(gameLoop)}
function setDirection(direction,active){controls[direction]=active;document.querySelector(`[data-direction="${direction}"]`).classList.toggle('active',active)}
window.addEventListener('keydown',event=>{if(!pages.game.classList.contains('active'))return;if(['ArrowLeft','a','A'].includes(event.key)){event.preventDefault();setDirection('left',true)}if(['ArrowRight','d','D'].includes(event.key)){event.preventDefault();setDirection('right',true)}});
window.addEventListener('keyup',event=>{if(['ArrowLeft','a','A'].includes(event.key))setDirection('left',false);if(['ArrowRight','d','D'].includes(event.key))setDirection('right',false)});
document.querySelectorAll('.move-btn').forEach(btn=>{const direction=btn.dataset.direction;btn.addEventListener('pointerdown',event=>{event.preventDefault();btn.setPointerCapture?.(event.pointerId);setDirection(direction,true)});['pointerup','pointercancel','lostpointercapture'].forEach(type=>btn.addEventListener(type,()=>setDirection(direction,false)))});
startButton.addEventListener('click',startGame);window.addEventListener('resize',()=>{if(pages.game.classList.contains('active')){resizeCanvas();if(!running)drawScene()}});

const storedPlays=Number(localStorage.getItem('nexverse:plays:nex-runner')||2481);document.querySelectorAll('.runner-play-count').forEach(el=>el.textContent=storedPlays.toLocaleString('en-US'));
