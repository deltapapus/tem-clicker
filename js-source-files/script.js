const discordInput = document.getElementById("discordInput");
const clickBtn = document.getElementById('clicker');
const counterEl = document.getElementById('counter');
const CHEAT_THRESHOLD = 1e15; // umbral para detectar números absurdos
const cheatOverlay = document.getElementById('cheatOverlay');




let count = 0;
let autoClickers = 0;
let multiplier = 1;
let bonusActive = false;

// Límites de compras
let multiplierCount = 0;
let superMultiplierBought = false;
let godModeBought = false;



// Cargar juego
try {
    const saved = localStorage.getItem('undertale_clicker_data');
    if(saved){
        const data = JSON.parse(saved);
        count = data.count || 0;
        autoClickers = data.autoClickers || 0;
        multiplier = data.multiplier || 1;
        multiplierCount = data.multiplierCount || 0;
        superMultiplierBought = data.superMultiplierBought || false;
        godModeBought = data.godModeBought || false;
    }
}catch(e){ console.warn('localStorage disabled', e); }

function saveGame(){
    try{
        localStorage.setItem('undertale_clicker_data', JSON.stringify({
            count,
            autoClickers,
            multiplier,
            multiplierCount,
            superMultiplierBought,
            godModeBought
        }));
    }catch(e){}
}

function updateDisplay(){
    // Mostrar con toLocaleString para legibilidad si es finito
    if(!isFinite(count)) counterEl.textContent = String(count);
    else counterEl.textContent = Math.floor(count).toLocaleString();
}

function resetForCheat(){
    // Resetea todo a estado base (más seguro)
    count = 0;
    autoClickers = 0;
    multiplier = 1;
    multiplierCount = 0;
    superMultiplierBought = false;
    godModeBought = false;
    saveGame();
    updateDisplay();
}

// Detección de cheats
function detectCheat(){
    try {
        // condición: no es finito, o supera el umbral, o su representación contiene 'e' (notación científica)
        if(!isFinite(count) || count > CHEAT_THRESHOLD || String(count).toLowerCase().includes('e')){
            return true;
        }
    } catch(e){
        return true;
    }
    return false;
}

function triggerCheatResponse(){
    // Si ya está mostrando overlay, no lo repitamos
    if(cheatOverlay.style.display === 'flex') return;

    // Mostrar overlay y resetear
    cheatOverlay.style.display = 'flex';
    resetForCheat();

    // Mantener mensaje 5s y luego ocultar
    setTimeout(()=>{
        cheatOverlay.style.display = 'none';
    }, 5000);
}

function addClick(amount=1){
    // Primero añade normalmente
    if(bonusActive) amount *= 2;
    count += amount * multiplier;

    // Detectar cheats justo después del cambio
    if(detectCheat()){
        triggerCheatResponse();
    } else {
        updateDisplay();
        saveGame();
    }
}

clickBtn.addEventListener('click', ()=> addClick());

// tecla espacio también cuenta
window.addEventListener('keydown', (e)=>{
    if(e.code === 'Space'){
        e.preventDefault();
        clickBtn.click();
    }
});

// ---- Powerups ----
function buyPowerup(type){
    switch(type){
        case 'autoClick':
            if(count >= 50){ count -= 50; autoClickers++; }
            break;

        case 'multiplier':
            if(count >= 200 && multiplierCount < 2){
                count -= 200;
                multiplier *= 2;
                multiplierCount++;
            }
            break;

        case 'bonus':
            if(count >= 100){
                count -= 100;
                if(!bonusActive){
                    bonusActive = true;
                    setTimeout(()=> bonusActive = false, 10000);
                }
            }
            break;

        case 'college':
            if(count >= 500){ count -= 500; autoClickers += 5; } // nerfeado a +5
            break;

        case 'madness':
            if(count >= 1500){
                count -= 1500;
                let oldMult = multiplier;
                multiplier *= 5;
                setTimeout(()=> multiplier = oldMult, 5000);
            }
            break;

        case 'army':
            if(count >= 10000){ count -= 10000; autoClickers += 20; } // nerfeado a +20
            break;

        case 'godMode':
            if(count >= 50000 && !godModeBought){
                count -= 50000;
                multiplier *= 10;
                godModeBought = true;
            }
            break;
    }

    // Tras comprar, revisamos cheat por si el jugador hackeó el valor antes de comprar
    if(detectCheat()){
        triggerCheatResponse();
    } else {
        updateDisplay();
        saveGame();
    }
}

// Autoclickers
setInterval(()=>{
    if(autoClickers > 0){
        addClick(autoClickers);
    }
}, 1000);

// Chequeo periódico por si el valor se modifica externamente
setInterval(()=>{
    if(detectCheat()){
        triggerCheatResponse();
    }
}, 1000);

// Inicializa la UI
updateDisplay();