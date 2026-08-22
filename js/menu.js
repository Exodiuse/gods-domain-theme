(function(){
'use strict';

function norm(s){
  return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
}
function labelOf(a){
  var txt=(a.textContent||'').replace(/\s+/g,' ').trim();
  if(txt)return txt;
  var title=a.getAttribute('title');
  if(title)return title.trim();
  var aria=a.getAttribute('aria-label');
  if(aria)return aria.trim();
  var img=a.querySelector('img[alt]');
  if(img && img.alt)return img.alt.trim();
  try{
    var u=new URL(a.href,location.href);
    return u.pathname+(u.search||'');
  }catch(e){
    return a.getAttribute('href')||'Lien';
  }
}

/* On ne fabrique PAS la navigation :
   on lit tous les <a> réellement produits par {GENERATED_NAV_BAR}. */
function collectForumactifLinks(nav){
  var result=[];
  Array.prototype.forEach.call(nav.querySelectorAll('a[href]'),function(a){
    var href=a.getAttribute('href')||'';
    if(!href || href==='#' || /^javascript:/i.test(href))return;
    result.push({
      source:a,
      label:labelOf(a)
    });
  });
  return result;
}

function typeFor(label,href){
  var s=norm(label+' '+href);
  if(/deconnexion|logout/.test(s))return'logout';
  if(/connexion|login/.test(s))return'login';
  if(/enregistr|register|inscription/.test(s))return'register';
  if(/nouveaux messages prives|new private|new pm/.test(s))return'newpm';
  if(/messages prives|messagerie|privmsg/.test(s))return'messages';
  if(/editer mon profil|profil|profile/.test(s))return'profile';
  if(/groupes|groups/.test(s))return'groups';
  if(/membres|memberlist/.test(s))return'members';
  if(/recherche avancee|advanced search/.test(s))return'advancedsearch';
  if(/recherch|search/.test(s))return'search';
  if(/publications|publish/.test(s))return'publications';
  if(/faq/.test(s))return'faq';
  if(/activites|activity/.test(s))return'activity';
  if(/dernieres images|latest images/.test(s))return'latestimages';
  if(/galerie|gallery/.test(s))return'gallery';
  if(/calendrier|calendar/.test(s))return'calendar';
  if(/portail|portal/.test(s))return'portal';
  if(/accueil|index|\/forum/.test(s))return'home';
  return'other';
}
function iconFor(type){
  var icons={
    home:'ion-home',
    portal:'ion-ios-world',
    calendar:'ion-calendar',
    gallery:'ion-images',
    latestimages:'ion-images',
    activity:'ion-ios-pulse-strong',
    faq:'ion-help-circled',
    publications:'ion-document-text',
    search:'ion-android-search',
    advancedsearch:'ion-ios-search-strong',
    members:'ion-person-stalker',
    groups:'ion-person-stalker',
    profile:'ion-person',
    messages:'ion-email',
    newpm:'ion-email-unread',
    register:'ion-person-add',
    login:'ion-log-in',
    logout:'ion-log-out',
    other:'ion-android-more-horizontal'
  };
  return icons[type]||icons.other;
}
function copyAttributes(from,to){
  Array.prototype.forEach.call(from.attributes,function(attr){
    if(attr.name==='class' || attr.name==='style')return;
    to.setAttribute(attr.name,attr.value);
  });
}
function userData(){
  return (typeof window._userdata==='object' && window._userdata) ? window._userdata : {};
}
function logged(ud){
  return !!(ud && (ud.session_logged_in===1 || ud.session_logged_in==='1' || ud.session_logged_in===true));
}
function avatarHTML(ud){
  if(ud && ud.avatar)return ud.avatar;
  if(ud && ud.avatar_link)return '<img src="'+ud.avatar_link+'" alt="">';
  return '';
}

function init(){
  var nav=document.querySelector('.gd-navbar');
  if(!nav || document.querySelector('.gd-topnav'))return;

  var items=collectForumactifLinks(nav);
  if(!items.length)return;

  var ud=userData();
  var isLogged=logged(ud);

  var profileItem=items.find(function(x){
    return typeFor(x.label,x.source.href)==='profile';
  });
  var loginItem=items.find(function(x){
    return typeFor(x.label,x.source.href)==='login';
  });

  var top=document.createElement('div');
  top.className='gd-topnav';

  /* ---------- UTILISATEUR ---------- */
  var left=document.createElement('div');
  left.className='gd-topnav-left';

  var userLink=document.createElement((isLogged && profileItem) || (!isLogged && loginItem) ? 'a' : 'div');
  userLink.className='gd-topnav-userlink';
  if(userLink.tagName==='A'){
    userLink.href=isLogged && profileItem ? profileItem.source.href : loginItem.source.href;
  }

  var avatar=document.createElement('div');
  avatar.className='gd-topnav-avatar';

  var html=avatarHTML(ud);
  if(html){
    avatar.innerHTML=html;
    var im=avatar.querySelector('img');
    if(im){
      im.removeAttribute('width');
      im.removeAttribute('height');
      im.alt=isLogged && ud.username ? 'Avatar de '+ud.username : 'Avatar par défaut';
    }
  }else{
    /* Secours uniquement si Forumactif ne fournit aucun avatar dans _userdata. */
    avatar.textContent='✦';
  }

  var userText=document.createElement('div');
  userText.className='gd-topnav-usertext';
  var name=isLogged && ud.username ? ud.username : 'Anonymous';
  userText.innerHTML='<strong></strong><small>'+(isLogged?'welcome back, wanderer':'welcome to the domain')+'</small>';
  userText.querySelector('strong').textContent=name;

  userLink.appendChild(avatar);
  userLink.appendChild(userText);
  left.appendChild(userLink);

  /* ---------- BRAND ---------- */
  var brand=document.createElement('a');
  brand.className='gd-topnav-brand';
  brand.href='/';
  brand.innerHTML='<span class="gd-topnav-brand-main">God’s Domain</span><span class="gd-topnav-brand-sub">beyond the veil</span>';

  /* ---------- TOUS LES LIENS FORUMACTIF ---------- */
  var actions=document.createElement('nav');
  actions.className='gd-topnav-actions';
  actions.setAttribute('aria-label','Navigation principale');

  items.forEach(function(item){
    var type=typeFor(item.label,item.source.href);
    var a=document.createElement('a');

    /* Tous les attributs fonctionnels du lien original sont conservés :
       href de déconnexion avec session, target, onclick, rel, data-*, etc. */
    copyAttributes(item.source,a);

    a.className='gd-topnav-action gd-nav-'+type;
    a.title=item.label;
    a.setAttribute('aria-label',item.label);
    a.innerHTML='<i class="'+iconFor(type)+'" aria-hidden="true"></i><span class="gd-visually-hidden"></span>';
    a.querySelector('.gd-visually-hidden').textContent=item.label;
    actions.appendChild(a);
  });

  top.appendChild(left);
  top.appendChild(brand);
  top.appendChild(actions);
  document.body.insertBefore(top,document.body.firstChild);

  /* ---------- VRAI BOUTON NOTIFICATIONS ---------- */
  function mountNotifications(){
    var notif=document.getElementById('notiffi_button');
    if(!notif || notif.parentNode===actions)return !!notif;
    notif.classList.add('gd-topnav-notifications');
    actions.appendChild(notif);
    return true;
  }
  if(!mountNotifications()){
    var attempts=0;
    var timer=setInterval(function(){
      attempts++;
      if(mountNotifications() || attempts>24)clearInterval(timer);
    },250);
  }

  /* Si un ancien JS menu est encore brièvement en cache, on enlève son bouton/popup. */
  document.querySelectorAll('.gd-menu-trigger,.gd-menu-popover').forEach(function(el){el.remove()});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
