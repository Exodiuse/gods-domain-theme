(function(){
'use strict';
function norm(s){return(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
function iconFor(text,href){var s=norm(text+' '+href);if(/accueil|index|\/forum/.test(s))return'ion-home';if(/recherch|search/.test(s))return'ion-android-search';if(/membre|memberlist/.test(s))return'ion-person-stalker';if(/profil|profile/.test(s))return'ion-person';if(/messag|privmsg/.test(s))return'ion-email';return'ion-ios-circle-filled'}
function pickQuick(links,pattern){return links.find(function(a){return pattern.test(norm(a.textContent+' '+a.getAttribute('href')))})}
function init(){
var nav=document.querySelector('.gd-navbar'),hero=document.querySelector('.gd-hero'),header=document.querySelector('.gd-header');
if(!nav||!hero||!header||document.querySelector('.gd-menu-panel'))return;
var links=Array.prototype.slice.call(nav.querySelectorAll('a[href]')).filter(function(a){var t=norm(a.textContent),h=a.getAttribute('href')||'';return t&&h&&h!=='#'});
if(!links.length)return;
var bar=document.createElement('div');bar.className='gd-utility-bar';
var brand=document.createElement('a');brand.className='gd-utility-brand';brand.href='/';brand.textContent="God's Domain";
var quick=document.createElement('nav');quick.className='gd-utility-links';quick.setAttribute('aria-label','Accès rapides');
[[/accueil|index|\/forum/,'Accueil'],[/recherch|search/,'Rechercher'],[/membre|memberlist/,'Membres'],[/profil|profile/,'Profil'],[/messag|privmsg/,'Messagerie']].forEach(function(def){
var a=pickQuick(links,def[0]);if(!a)return;var clone=document.createElement('a');clone.className='gd-utility-link';clone.href=a.href;clone.title=def[1];clone.innerHTML='<i class="'+iconFor(def[1],a.href)+'" aria-hidden="true"></i><span>'+def[1]+'</span>';quick.appendChild(clone)});
bar.appendChild(brand);bar.appendChild(quick);header.parentNode.insertBefore(bar,header);
var trigger=document.createElement('button');trigger.type='button';trigger.className='gd-menu-trigger';trigger.setAttribute('aria-label','Ouvrir le menu principal');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','gd-main-menu');trigger.innerHTML='<span class="gd-menu-trigger-lines" aria-hidden="true"></span>';hero.appendChild(trigger);
var backdrop=document.createElement('div');backdrop.className='gd-menu-backdrop';document.body.appendChild(backdrop);
var panel=document.createElement('aside');panel.className='gd-menu-panel';panel.id='gd-main-menu';panel.setAttribute('aria-hidden','true');
var head=document.createElement('div');head.className='gd-menu-panel-head';head.innerHTML='<div><span class="gd-menu-kicker">God’s Domain</span><h2 class="gd-menu-panel-title">Navigate the domain</h2></div>';
var close=document.createElement('button');close.type='button';close.className='gd-menu-close';close.setAttribute('aria-label','Fermer le menu');head.appendChild(close);
var list=document.createElement('ul');list.className='gd-menu-list';
links.forEach(function(a,i){var li=document.createElement('li'),c=a.cloneNode(true);c.removeAttribute('class');c.setAttribute('data-gd-index',String(i+1).padStart(2,'0'));li.appendChild(c);list.appendChild(li)});
var foot=document.createElement('div');foot.className='gd-menu-panel-foot';foot.textContent='because we’ve breached God’s Domain';
panel.appendChild(head);panel.appendChild(list);panel.appendChild(foot);document.body.appendChild(panel);
function openMenu(){document.body.classList.add('gd-menu-open');trigger.setAttribute('aria-expanded','true');panel.setAttribute('aria-hidden','false');close.focus()}
function closeMenu(){document.body.classList.remove('gd-menu-open');trigger.setAttribute('aria-expanded','false');panel.setAttribute('aria-hidden','true');trigger.focus()}
trigger.addEventListener('click',function(){document.body.classList.contains('gd-menu-open')?closeMenu():openMenu()});close.addEventListener('click',closeMenu);backdrop.addEventListener('click',closeMenu);document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.body.classList.contains('gd-menu-open'))closeMenu()})
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
