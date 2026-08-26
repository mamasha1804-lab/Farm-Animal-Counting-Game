const rounds=[
{name:"cows",answer:6,image:"game/cows-v2.webp",points:[[27,35],[51,35],[75,35],[27,70],[51,70],[75,70]]},
{name:"horses",answer:9,image:"game/horses-v2.webp",points:[[27,28],[51,28],[75,28],[27,53],[51,53],[75,53],[27,78],[51,78],[75,78]]},
{name:"pigs",answer:10,image:"game/pigs-v2.webp",points:[[15,32],[35,32],[53,32],[70,32],[88,32],[15,70],[35,70],[53,70],[70,70],[88,70]]},
{name:"sheep",answer:8,image:"game/sheep-v2.webp",points:[[18,31],[42,31],[65,31],[87,31],[18,69],[42,69],[65,69],[87,69]]},
{name:"ducks",answer:7,image:"game/ducks-v2.webp",points:[[29,35],[52,35],[75,35],[15,69],[39,69],[63,69],[87,69]]},
{name:"roosters",answer:3,image:"game/roosters-v2.webp",points:[[25,56],[51,56],[76,56]]},
{name:"cats",answer:5,image:"game/cats-v2.webp",points:[[39,36],[61,36],[28,69],[51,69],[73,69]]},
{name:"dogs",answer:4,image:"game/dogs-v2.webp",points:[[20,52],[42,52],[65,52],[86,52]]},
{name:"frogs",answer:2,image:"game/frogs-v2.webp",points:[[35,58],[68,58]]}
];
let screen="start",index=0,score=0,picked=null,wrong=[],counted=0,sound=true,ctx=null;
const root=document.getElementById("game");
const icon=(name)=>name==="sound"?(sound?"🔊":"🔇"):name==="star"?"★":name==="sparkle"?"✦":"↻";
function britishVoice(){return speechSynthesis.getVoices().find(v=>v.lang==="en-GB"&&/natural|premium|enhanced|google|microsoft/i.test(v.name))||speechSynthesis.getVoices().find(v=>v.lang==="en-GB")||null}
function say(text){if(!sound)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="en-GB";u.rate=.9;u.pitch=1;u.voice=britishVoice();speechSynthesis.speak(u)}
function choices(r){const s=new Set([r.answer]);let o=1;while(s.size<3){const lo=Math.max(1,r.answer-o),hi=Math.min(10,r.answer+o);if(lo!==r.answer)s.add(lo);if(s.size<3&&hi!==r.answer)s.add(hi);o++}return [...s].sort((a,b)=>a-b)}
function shell(content){return '<div class="cloud cloud-a"></div><div class="cloud cloud-b"></div><div class="twinkles" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i><i>✧</i><i>✦</i><i>✧</i></div><header class="topbar"><div class="brand" aria-label="Учимся с Ларисой Коротаевой"><span class="brand-mark">✦</span><span class="brand-copy"><small>Учимся с</small><strong>Ларисой Коротаевой</strong></span></div><button class="sound" id="sound" aria-label="Sound">'+icon("sound")+'</button></header>'+content+'<div class="grass"></div>'}
function render(){
 if(screen==="start") root.innerHTML=shell('<section class="start-card"><div class="sticker">✦ COUNT 1–10</div><h1>Magical Farm<br><span>Counting Adventure</span></h1><div class="cover-wrap"><img src="game/cows-v2.webp" alt="Animated farm animals in a sunny meadow"><div class="cover-badge">★ A counting adventure</div></div><button class="primary" id="start">✦ START <span>→</span></button><small>9 fun rounds · English listening practice</small></section>');
 if(screen==="play"){
  const r=rounds[index],locked=counted<r.answer;
  const spots=r.points.map((p,i)=>'<button data-animal="'+i+'" class="'+(i<counted?"counted ":"")+(i===counted?"next":"")+'" style="left:'+p[0]+'%;top:'+p[1]+'%" aria-label="'+(i+1)+'"><span>'+(i+1)+'</span></button>').join("");
  const opts=choices(r).map(v=>'<button data-answer="'+v+'" '+(picked!==null||locked?"disabled":"")+' class="'+(picked===v?"correct ":"")+(wrong.includes(v)?"wrong":"")+'">'+v+'</button>').join("");
  root.innerHTML=shell('<section class="play-card"><div class="game-status"><span>Round '+(index+1)+' of '+rounds.length+'</span><div class="score">★ '+score+'</div></div><div class="progress"><div style="width:'+(((index+(picked!==null?1:0))/rounds.length)*100)+'%"></div></div><button class="question" id="question">Count the '+r.name+'. How many are there? 🔊</button><div class="scene count-'+r.answer+'"><img src="'+r.image+'" alt="Count the '+r.name+'"><div class="animal-hotspots">'+spots+'</div>'+(picked!==null?'<div class="correct-burst"><span>★</span> Great job!</div>':'')+'</div><div class="answer-area"><p>Choose the answer</p><div class="answers">'+opts+'</div>'+(locked?'<div class="count-first">Count every animal in order to unlock the answers.</div>':'')+(wrong.length&&picked===null?'<div class="hint">Almost! Touch each animal and count again.</div>':'')+'</div></section>');
 }
 if(screen==="finish")root.innerHTML=shell('<section class="finish-card"><div class="stars">★ ★ ★</div><h1>Magical!</h1><p>You counted every animal and brought a golden star to the farm!</p><div class="medal"><span class="award">★</span><strong>'+score+' / '+rounds.length+'</strong><span>Farm Star</span></div><button class="primary" id="start">↻ Play again</button></section>');
 bind();
}
function bind(){
 document.getElementById("sound").onclick=()=>{sound=!sound;if(!sound)speechSynthesis.cancel();render()};
 const start=document.getElementById("start");if(start)start.onclick=()=>{if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();ctx.resume();screen="play";index=0;score=0;picked=null;wrong=[];counted=0;render();setTimeout(()=>say("Count the cows. How many are there?"),120)};
 const q=document.getElementById("question");if(q)q.onclick=()=>say("Count the "+rounds[index].name+". How many are there?");
 document.querySelectorAll("[data-animal]").forEach(b=>{const act=()=>countAnimal(+b.dataset.animal);b.onpointerenter=act;b.onclick=act;b.onfocus=act});
 document.querySelectorAll("[data-answer]").forEach(b=>b.onclick=()=>choose(+b.dataset.answer));
}
function countAnimal(i){if(i!==counted)return;counted++;say(String(i+1));render()}
function choose(v){const r=rounds[index];if(picked!==null||counted<r.answer)return;if(v===r.answer){picked=v;score++;counted=0;say(index===rounds.length-1?"Great job!":"Great job! There are "+r.answer+" "+r.name+".");render();setTimeout(()=>{if(index===rounds.length-1){screen="finish";render();playVictory()}else{index++;picked=null;wrong=[];counted=0;render();setTimeout(()=>say("Count the "+rounds[index].name+". How many are there?"),100)}},1200)}else{wrong.push(v);say("Try again! Count slowly.");render()}}
function playVictory(){if(!sound||!ctx)return;ctx.resume();const now=ctx.currentTime,notes=[523.25,659.25,783.99,1046.5];notes.forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=i===3?"sine":"triangle";o.frequency.value=f;g.gain.setValueAtTime(0,now+i*.18);g.gain.linearRampToValueAtTime(.18,now+i*.18+.03);g.gain.exponentialRampToValueAtTime(.001,now+i*.18+.65);o.connect(g).connect(ctx.destination);o.start(now+i*.18);o.stop(now+i*.18+.7)})}
speechSynthesis.onvoiceschanged=()=>{};render();
