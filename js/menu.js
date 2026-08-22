(function(){
'use strict';

function norm(s){
  return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
}
function labelOf(a){
  var txt=(a.textContent||'').replace(/\s+/g,' ').trim();
  if(txt)return txt;
  if(a.getAttribute('title'))return a.getAttribute('title').trim();
  if(a.getAttribute('aria-label'))return a.getAttribute('aria-label').trim();
  var img=a.querySelector('img[alt]');
  if(img && img.alt)return img.alt.trim();
  try{return new URL(a.href,location.href).pathname}catch(e){return a.getAttribute('href')||'Lien'}
}
function allNavLinks(nav){
  var out=[],seen={};
  Array.prototype.forEach.call(nav.querySelectorAll('a[href]'),function(a){
    var href=a.getAttribute('href')||'';
    if(!href || href==='#' || /^javascript:/i.test(href))return;
    var label=labelOf(a);
    var key=href+'|'+label;
    if(seen[key])return;
    seen[key]=1;
    out.push({node:a,href:a.href,label:label});
  });
  return out;
}
function findLink(links,re){
  return links.find(function(x){return re.test(norm(x.label+' '+x.href))});
}
function icon(name){
  var map={
    home:'ion-home',search:'ion-android-search',members:'ion-person-stalker',
    profile:'ion-person',messages:'ion-email',login:'ion-log-in',logout:'ion-log-out'
  };
  return map[name]||'ion-ios-circle-filled';
}
function data(){
  return (typeof window._userdata==='object' && window._userdata) ? window._userdata : {};
}
function isLogged(ud){
  return !!(ud && (ud.session_logged_in===1 || ud.session_logged_in==='1' || ud.session_logged_in===true));
}
function avatarMarkup(ud){
  if(ud && ud.avatar)return ud.avatar;
  if(ud && ud.avatar_link)return '<img src="'+ud.avatar_link+'" alt="">';
  return '';
}
function safeColor(c){
  return /^[0-9a-f]{3,8}$/i.test(c||'') ? '#'+c : '';
}

function init(){
  var nav=document.querySelector('.gd-navbar');
  var header=document.querySelector('.gd-header');
  if(!nav||!header||document.querySelector('.gd-topnav'))return;

  var links=allNavLinks(nav);
  if(!links.length)return;

  var ud=data(),logged=isLogged(ud);
  var login=findLink(links,/connexion|login/);
  var logout=findLink(links,/deconnexion|logout/);
  var register=findLink(links,/enregistr|register|inscription/);
  var profile=findLink(links,/profil|profile/);

  /* ---------- TOPBAR ---------- */
  var top=document.createElement('div');
  top.className='gd-topnav';

  var left=document.createElement('div');
  left.className='gd-topnav-left';

  var userLink=document.createElement(logged && profile ? 'a' : (login ? 'a' : 'div'));
  userLink.className='gd-topnav-userlink';
  if(userLink.tagName==='A')userLink.href=logged && profile ? profile.href : login.href;

  var av=document.createElement('div');
  av.className='gd-topnav-avatar';

  /* _userdata.avatar est le markup d'avatar Forumactif.
     Chez un membre il s'agit de son avatar ; chez un invité on laisse
     Forumactif fournir son avatar par défaut lorsqu'il est disponible. */
  var markup=avatarMarkup(ud);
  if(markup){
    av.innerHTML=markup;
    var img=av.querySelector('img');
    if(img){img.removeAttribute('width');img.removeAttribute('height')}
  }else{
    av.textContent='✦';
  }

  var userText=document.createElement('div');
  userText.className='gd-topnav-usertext';
  var username=logged && ud.username ? ud.username : 'Anonymous';
  userText.innerHTML='<strong></strong><small>'+(logged?'welcome back, wanderer':'welcome to the domain')+'</small>';
  userText.querySelector('strong').textContent=username;

  if(logged && ud.groupcolor){
    var col=safeColor(ud.groupcolor);
    if(col)userText.querySelector('strong').style.color=col;
  }

  userLink.appendChild(av);userLink.appendChild(userText);left.appendChild(userLink);

  var brand=document.createElement('a');
  brand.className='gd-topnav-brand';brand.href='/';
  brand.innerHTML='<span class="gd-topnav-brand-main">God’s Domain</span><span class="gd-topnav-brand-sub">beyond the veil</span>';

  var actions=document.createElement('nav');
  actions.className='gd-topnav-actions';actions.setAttribute('aria-label','Accès rapides');

  function quick(name,re,label){
    var x=findLink(links,re);
    if(!x)return;
    var q=document.createElement('a');
    q.className='gd-topnav-action';q.dataset.gdQuick=name;q.href=x.href;q.title=label;
    q.innerHTML='<i class="'+icon(name)+'" aria-hidden="true"></i><span class="gd-visually-hidden">'+label+'</span>';
    actions.appendChild(q);
  }

  quick('home',/accueil|index|\/forum/,'Accueil');
  quick('search',/recherch|search/,'Rechercher');
  quick('members',/membre|memberlist/,'Membres');
  if(logged)quick('profile',/profil|profile/,'Profil');
  if(logged)quick('messages',/messag|privmsg/,'Messagerie');

  /* Connexion/Déconnexion visible directement : on ne la perd plus. */
  var session=logged?logout:login;
  if(session){
    var s=document.createElement('a');
    s.className='gd-topnav-action gd-topnav-session';
    s.dataset.gdQuick=logged?'logout':'login';
    s.href=session.href;
    s.title=logged?'Déconnexion':'Connexion';
    s.innerHTML='<i class="'+icon(logged?'logout':'login')+'" aria-hidden="true"></i><span class="gd-visually-hidden">'+(logged?'Déconnexion':'Connexion')+'</span>';
    actions.appendChild(s);
  }

  top.appendChild(left);top.appendChild(brand);top.appendChild(actions);
  document.body.insertBefore(top,document.body.firstChild);

  /* ---------- NOTIFICATIONS ---------- */
  function mountNotifications(){
    var notif=document.getElementById('notiffi_button');
    if(!notif || notif.parentNode===actions)return !!notif;
    notif.classList.add('gd-topnav-notifications');
    actions.appendChild(notif);
    return true;
  }
  if(!mountNotifications()){
    var tries=0,timer=setInterval(function(){
      tries++;
      if(mountNotifications()||tries>24)clearInterval(timer);
    },250);
  }

  /* ---------- BOUTON ROND ---------- */
  var trigger=document.createElement('div');
  trigger.className='gd-menu-trigger';trigger.setAttribute('role','button');trigger.setAttribute('tabindex','0');
  trigger.setAttribute('aria-label','Ouvrir le menu principal');trigger.setAttribute('aria-expanded','false');
  trigger.innerHTML='<span class="gd-menu-sliders"><span></span><i></i><b></b><em></em></span>';
  header.appendChild(trigger);

  /* ---------- MENU COMPLET : TOUS LES LIENS FORUMACTIF ---------- */
  var pop=document.createElement('div');
  pop.className='gd-menu-popover';
  pop.innerHTML='<h2 class="gd-menu-popover-title">Navigate the domain</h2><p class="gd-menu-popover-note">all paths remain open</p>';

  var ul=document.createElement('ul');ul.className='gd-menu-popover-list';

  links.forEach(function(x){
    var li=document.createElement('li');
    var a=document.createElement('a');
    a.href=x.href;a.textContent=x.label;

    /* conserve les attributs fonctionnels utiles de Forumactif */
    ['target','rel','title'].forEach(function(attr){
      var v=x.node.getAttribute(attr);if(v)a.setAttribute(attr,v);
    });

    if((logged && logout && x.href===logout.href) || (!logged && login && x.href===login.href)){
      li.className='gd-menu-session';
    }
    li.appendChild(a);ul.appendChild(li);
  });

  pop.appendChild(ul);header.appendChild(pop);

  function close(){
    pop.classList.remove('is-open');trigger.setAttribute('aria-expanded','false');
  }
  function toggle(e){
    if(e){
      e.preventDefault();e.stopPropagation();
      if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    }
    var open=!pop.classList.contains('is-open');
    pop.classList.toggle('is-open',open);
    trigger.setAttribute('aria-expanded',open?'true':'false');
  }

  trigger.addEventListener('click',toggle,false);
  trigger.addEventListener('mousedown',function(e){e.preventDefault();e.stopPropagation()},false);
  trigger.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')toggle(e)},false);
  pop.addEventListener('click',function(e){e.stopPropagation()},false);
  document.addEventListener('click',close,false);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close()},false);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
