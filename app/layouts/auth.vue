<template>
  <div class="auth-wrapper">
    <div class="bg-layer">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="grid-overlay"></div>
    </div>

    <div class="auth-center">
      <slot />
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Nunito:wght@400;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #0d0b1a; overflow-x: hidden; }
</style>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  background: #0d0b1a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Nunito', sans-serif;
  position: relative;
  padding: 24px 20px;
}

.bg-layer { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .35; }
.orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, #7c3aed, transparent 70%); top: -10%; left: -10%; animation: drift1 18s ease-in-out infinite; }
.orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, #a855f7, transparent 70%); bottom: -5%; right: -5%; animation: drift2 22s ease-in-out infinite; }
.orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, #6d28d9, transparent 70%); top: 40%; left: 40%; animation: drift3 15s ease-in-out infinite; }
.grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(196,181,253,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(196,181,253,.03) 1px, transparent 1px); background-size: 40px 40px; }
@keyframes drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px, 20px) scale(1.05); } }
@keyframes drift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px, -30px) scale(1.08); } }
@keyframes drift3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(15px, -15px) scale(0.95); } }

.auth-center {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
}
</style>