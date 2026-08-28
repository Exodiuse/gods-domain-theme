(function(){
  function initGuide(root){
    var navItems=Array.prototype.slice.call(root.querySelectorAll('.gd-guide-nav-item[data-guide-target]'));
    var panels=Array.prototype.slice.call(root.querySelectorAll('[data-guide-panel]'));

    if(!navItems.length||!panels.length)return;

    function showPanel(target,focusNav){
      var panel=root.querySelector('[data-guide-panel="'+target+'"]');

      if(!panel)return;

      panels.forEach(function(item){
        var active=item===panel;
        item.hidden=!active;
        item.classList.toggle('is-active',active);
      });

      navItems.forEach(function(item){
        var active=item.getAttribute('data-guide-target')===target;

        item.classList.toggle('is-active',active);
        item.setAttribute('aria-selected',active?'true':'false');

        if(active&&focusNav){
          item.focus();
        }
      });
    }

    root.addEventListener('click',function(event){
      var trigger=event.target.closest('[data-guide-target]');

      if(!trigger||!root.contains(trigger))return;

      event.preventDefault();

      showPanel(
        trigger.getAttribute('data-guide-target'),
        false
      );
    });

    root.addEventListener('keydown',function(event){
      var current=event.target.closest('.gd-guide-nav-item[data-guide-target]');

      if(!current)return;

      var index=navItems.indexOf(current);

      if(index<0)return;

      if(event.key==='ArrowDown'||event.key==='ArrowRight'){
        event.preventDefault();

        var next=navItems[(index+1)%navItems.length];

        showPanel(
          next.getAttribute('data-guide-target'),
          true
        );
      }

      if(event.key==='ArrowUp'||event.key==='ArrowLeft'){
        event.preventDefault();

        var prev=navItems[(index-1+navItems.length)%navItems.length];

        showPanel(
          prev.getAttribute('data-guide-target'),
          true
        );
      }

      if(event.key==='Home'){
        event.preventDefault();

        showPanel(
          navItems[0].getAttribute('data-guide-target'),
          true
        );
      }

      if(event.key==='End'){
        event.preventDefault();

        showPanel(
          navItems[navItems.length-1].getAttribute('data-guide-target'),
          true
        );
      }
    });

    var initial=root.querySelector('.gd-guide-nav-item.is-active');

    showPanel(
      initial
        ? initial.getAttribute('data-guide-target')
        : navItems[0].getAttribute('data-guide-target'),
      false
    );
  }

  function init(){
    document.querySelectorAll('[data-guide]').forEach(initGuide);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  }else{
    init();
  }
})();
