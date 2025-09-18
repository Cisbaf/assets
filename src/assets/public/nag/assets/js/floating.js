const menu = document.getElementById('draggableMenu');


let activePointerId = null;
let dragging = false;

let startX = 0;       // posição do ponteiro no início do arraste
let baseLeft = 0;     // left do menu quando o arraste começou
let currentLeft = 0;  // posição atual alvo (usado pelo RAF)
let lastX = 0;        // último clientX observado
let lastTime = 0;     // timestamp do último movimento
let velocity = 0;     // px / ms

let rafId = null;
let inertiaId = null;

function clamp(v, a, b){ return Math.min(Math.max(v, a), b); }

function getMaxLeft(){
  return Math.max(0, window.innerWidth - menu.offsetWidth);
}

function applyPosition(left){
  menu.style.left = `${left}px`;
}

// inicia captura e prepara variáveis
function onPointerDown(e){
  // 🚨 se clicou no submenu (ícone ou dropdown), não iniciar drag
  if (e.target.tagName === "BUTTON" || e.target.tagName === "LABEL" || e.target.closest("button")) return;

  activePointerId = e.pointerId;
  dragging = true;
  menu.setPointerCapture(activePointerId);

  startX = e.clientX;
  baseLeft = menu.offsetLeft;
  currentLeft = baseLeft;
  lastX = startX;
  lastTime = performance.now();
  velocity = 0;

  menu.classList.add('dragging');
  cancelInertia();
  e.preventDefault();
}

function onPointerMove(e){
  if(!dragging || e.pointerId !== activePointerId) return;

  const now = performance.now();
  const dt = Math.max(1, now - lastTime);
  const dx = e.clientX - lastX;

  velocity = dx / dt;
  const desired = baseLeft + (e.clientX - startX);
  const maxLeft = getMaxLeft();
  currentLeft = clamp(desired, 0, maxLeft);

  if(!rafId){
    rafId = requestAnimationFrame(() => {
      applyPosition(currentLeft);
      rafId = null;
    });
  }

  lastX = e.clientX;
  lastTime = now;
  e.preventDefault();
}

function onPointerUp(e){
  if(!dragging || e.pointerId !== activePointerId) return;

  dragging = false;
  try { menu.releasePointerCapture(activePointerId); } catch(_) {}
  activePointerId = null;
  menu.classList.remove('dragging');

  baseLeft = currentLeft;
  startInertia();
  e.preventDefault();
}

function startInertia(){
  cancelInertia();

  const minVelocity = 0.02;
  if(Math.abs(velocity) < minVelocity) {
    velocity = 0;
    return;
  }

  const frameFriction = 0.92;
  let prev = performance.now();

  function step(now){
    const dt = Math.max(1, now - prev);
    prev = now;

    const frames = dt / 16.67;
    velocity *= Math.pow(frameFriction, frames);

    const delta = velocity * dt;
    const maxLeft = getMaxLeft();
    currentLeft = clamp(currentLeft + delta, 0, maxLeft);
    applyPosition(currentLeft);

    if(Math.abs(velocity) < 0.01 || currentLeft === 0 || currentLeft === maxLeft){
      velocity = 0;
      baseLeft = currentLeft;
      inertiaId = null;
      return;
    }

    inertiaId = requestAnimationFrame(step);
  }

  inertiaId = requestAnimationFrame(step);
}

function cancelInertia(){
  if(inertiaId){
    cancelAnimationFrame(inertiaId);
    inertiaId = null;
  }
}

function onResize(){
  const maxLeft = getMaxLeft();
  if(menu.offsetLeft > maxLeft){
    currentLeft = clamp(menu.offsetLeft, 0, maxLeft);
    baseLeft = currentLeft;
    applyPosition(currentLeft);
  }
}


// Listener pointer (abrange mouse+touch+pen)
menu.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);
window.addEventListener('pointercancel', onPointerUp);
window.addEventListener('resize', onResize);

// acessibilidade: permite arrastar via teclado
menu.tabIndex = 0;
menu.addEventListener('keydown', (e) => {
  const step = 16;
  if(e.key === 'ArrowLeft' || e.key === 'ArrowRight'){
    const dir = e.key === 'ArrowLeft' ? -1 : 1;
    cancelInertia();
    const maxLeft = getMaxLeft();
    currentLeft = clamp(menu.offsetLeft + dir * step, 0, maxLeft);
    applyPosition(currentLeft);
    baseLeft = currentLeft;
    e.preventDefault();
  }
});

