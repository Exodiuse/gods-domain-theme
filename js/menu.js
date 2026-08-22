(function(){
'use strict';

function n(s){
  return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
}
function findLink(links,re){
  return links.find(function(a){return re.test(n((a.textContent||'')+' '+(a.getAttribute('href')||'')))});
}
function ico(label){
  if(label==='home')return'ion-home';
  if(label==='search')return'ion-android-search';
  if(label==='members')return'ion-person-stalker';
  if(label==='profile')return'ion-person';
  if(label==='messages')return'ion-email';
  return'ion-ios-circle-filled';
}
function firstAvatar(){
  var sels=[
    '.switcheroo__avatar img',
    '.switcheroo img.avatar',
    '.switcheroo img',
    '.gd-qeel img',
    '.postprofile-avatar img'
  ];
  for(var i=0;i<sels.length;i++){
    var el=document.querySelector(sels[i]);
    if(el && el.src)return el.src;
  }
  return '';
}
function currentName(){
  var sels=[
    '.gd-qeel-user-name',
    '.switcheroo__name',
    '.switcheroo .username',
    '.postprofile-name'
  ];
  for(var i=0;i<sels.length;i++){
    var el=document.querySelector(sels[i]);
    if(el && n(el.textContent))return el.textContent.trim();
  }
  return "God's Domain";
}

function init(){
  var nav=document.querySelector('.gd-navbar');
  var hero=document.querySelector('.gd-hero');
  if(!nav||!hero||document.querySelector('.gd-topnav'))return;

  var links=Array.prototype.slice.call(nav.querySelectorAll('a[href]')).filter(function(a){
    var h=a.getAttribute('href')||'';
    return h && h!=='#' && n(a.textContent);
  });
  if(!links.length)return;

  /* top nav */
  var top=document.createElement('div');
  top.className='gd-topnav';

  var left=document.createElement('div');
  left.className='gd-topnav-left';

  var av=document.createElement('div');
  av.className='gd-topnav-avatar';
  var src=firstAvatar();
  if(src){
    var img=document.createElement('img');
    img.src=src;
    img.alt='';
    av.appendChild(img);
  }else{
    av.textContent='✦';
  }

  var ut=document.createElement('div');
  ut.className='gd-topnav-usertext';
  ut.innerHTML='<strong>'+currentName()+'</strong><small>welcome, wanderer</small>';

  left.appendChild(av);
  left.appendChild(ut);

  var brand=document.createElement('a');
  brand.className='gd-topnav-brand';
  brand.href='/';
  brand.innerHTML='<span class="gd-topnav-brand-main">God’s Domain</span><span class="gd-topnav-brand-sub">beyond the veil</span>';

  var actions=document.createElement('nav');
  actions.className='gd-topnav-actions';
  actions.setAttribute('aria-label','Accès rapides');

  [
    ['home',/accueil|index|\/forum/,'Accueil'],
    ['search',/recherch|search/,'Rechercher'],
    ['members',/membre|memberlist/,'Membres'],
    ['profile',/profil|profile/,'Profil'],
    ['messages',/messag|privmsg/,'Messagerie']
  ].forEach(function(def){
    var a=findLink(links,def[1]);
    if(!a)return;
    var q=document.createElement('a');
    q.className='gd-topnav-action';
    q.dataset.gdQuick=def[0];
    q.href=a.href;
    q.title=def[2];
    q.innerHTML='<i class="'+ico(def[0])+'" aria-hidden="true"></i><span class="gd-visually-hidden">'+def[2]+'</span>';
    actions.appendChild(q);
  });

  top.appendChild(left);
  top.appendChild(brand);
  top.appendChild(actions);

  /* place vraiment pleine largeur, tout en haut du body */
  document.body.insertBefore(top,document.body.firstChild);

  /* bouton rond dans le header */
  var trigger=document.createElement('button');
  trigger.type='button';
  trigger.className='gd-menu-trigger';
  trigger.setAttribute('aria-label','Ouvrir le menu');
  trigger.setAttribute('aria-expanded','false');
  trigger.innerHTML='<span class="gd-menu-sliders"><span></span><i></i><b></b><em></em></span>';
  hero.appendChild(trigger);

  var pop=document.createElement('div');
  pop.className='gd-menu-popover';
  pop.innerHTML='<h2 class="gd-menu-popover-title">Navigate the domain</h2>';
  var ul=document.createElement('ul');
  ul.className='gd-menu-popover-list';

  links.forEach(function(a){
    var li=document.createElement('li');
    var c=a.cloneNode(true);
    c.removeAttribute('class');
    li.appendChild(c);
    ul.appendChild(li);
  });
  pop.appendChild(ul);
  hero.appendChild(pop);

  function close(){
    pop.classList.remove('is-open');
    trigger.setAttribute('aria-expanded','false');
  }
  trigger.addEventListener('click',function(e){
    e.stopPropagation();
    var open=!pop.classList.contains('is-open');
    pop.classList.toggle('is-open',open);
    trigger.setAttribute('aria-expanded',open?'true':'false');
  });
  pop.addEventListener('click',function(e){e.stopPropagation()});
  document.addEventListener('click',close);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
