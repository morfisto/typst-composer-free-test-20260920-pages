// Browser layout decides which two-dimensional regions need a scroll affordance.
(() => {
  const init=()=>{
    const regions=[...document.querySelectorAll('article :is(pre,.math-block,.composer-grid-scroll,.composer-native-table-scroll,.composer-web-table-scroll)')];
    const entries=regions.map(node=>{
      const hint=document.createElement('small');hint.className='blog-overflow-hint';hint.textContent='左右滚动查看完整内容';hint.hidden=true;node.after(hint);
      return {node,hint,tab:node.getAttribute('tabindex'),label:node.getAttribute('aria-label')};
    });
    let pending=false;
    const update=()=>{pending=false;for(const {node,hint,tab,label} of entries){
      const overflow=node.clientWidth>0&&node.scrollWidth>node.clientWidth+1;
      hint.hidden=!overflow;
      if(overflow){node.dataset.blogOverflow='true';if(tab===null)node.tabIndex=0;if(label===null)node.setAttribute('aria-label','可横向滚动的'+(node.tagName==='PRE'?'代码':node.classList.contains('math-block')?'公式':'内容'));}
      else{delete node.dataset.blogOverflow;if(tab===null)node.removeAttribute('tabindex');if(label===null)node.removeAttribute('aria-label');}
    }};
    const schedule=()=>{if(!pending){pending=true;requestAnimationFrame(update);}};
    const observer=new ResizeObserver(schedule);entries.forEach(({node})=>observer.observe(node));
    window.addEventListener('resize',schedule,{passive:true});window.addEventListener('load',schedule,{once:true});document.fonts?.ready.then(schedule);schedule();
    window.addEventListener('pagehide',event=>{if(!event.persisted)observer.disconnect();},{once:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
