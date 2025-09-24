const clickBtn = document.getElementById('clicker');
const counterEl = document.getElementById('counter');

let count = 0;
try{
  const saved = localStorage.getItem('undertale_clicker_count');
  if(saved !== null) count = parseInt(saved, 10) || 0;
}catch(e){ console.warn('localStorage disabled', e); }

counterEl.textContent = count;

clickBtn.addEventListener('click', ()=>{
  count++;
  counterEl.textContent = count;
  try{ localStorage.setItem('undertale_clicker_count', String(count)); }catch(e){}
});

// tecla espacio también cuenta
window.addEventListener('keydown', (e)=>{
  if(e.code === 'Space'){
    e.preventDefault();
    clickBtn.click();
  }
});