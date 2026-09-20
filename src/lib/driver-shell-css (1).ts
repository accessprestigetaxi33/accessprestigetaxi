export const driverShellCss = `
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; touch-action: manipulation; }
  html, body {
    margin: 0; padding: 0;  overflow: hidden;
    overscroll-behavior-y: contain; background: #03070d;
    font-family: 'DM Sans', sans-serif;
  }
  input, textarea, select { font-size: 16px; }
  .drv-root {
     
    display: flex; flex-direction: column;
    
  }
  /* Tablette (iPad portrait et paysage) : colonne élargie, plus de cadre centré. */
  
  /* Desktop / grand écran : colonne encore plus large, texte légèrement agrandi. */
  
  /* Souris/trackpad (pas d'écran tactile) : hover discret sur les éléments cliquables,
     la logique :active seule (pensée pour le tactile) ne suffit pas sur PC. */
  @media (hover: hover) and (pointer: fine) {
    .drv-tab:hover { color: #0f172a; }
    .drv-btn-primary:hover { background: #1e293b; }
    .drv-btn-secondary:hover { background: #e2e8f0; }
    .drv-btn-danger:hover { background: #fee2e2; }
    .drv-card:hover, .drv-route-opt:hover, .drv-chat-thread:hover { border-color: #c99b4a; }
  }
  .drv-header {
     color: #FDFBF7; display: flex; align-items: center; gap: 10px;
    
    flex-shrink: 0;
  }
  .drv-header h1 { margin: 0; font-size: 17px; font-weight: 700; flex: 1; font-family: 'DM Sans', sans-serif; }
  .drv-tabs {
      
    padding-left: env(safe-area-inset-left, 0px); padding-right: env(safe-area-inset-right, 0px);
    flex-shrink: 0;
    /* Fix : avec 8 onglets + labels longs ("Course + chat client"), la
       rangée peut dépasser la largeur de l'écran sur mobile étroit. Comme
       html/body ont overflow:hidden (plus haut), sans scroll ICI le
       débordement était juste coupé et invisible (ex. l'onglet "Devis"
       disparaissait sans aucun moyen d'y accéder). On rend la barre
       scrollable horizontalement, scrollbar masquée pour rester discrète. */
     -webkit-overflow-scrolling: touch; scrollbar-width: none;
  }
  .drv-tabs::-webkit-scrollbar { display: none; }
  .drv-tab {
    flex: 0 0 auto; min-width: 66px; display: flex;  align-items: center; 
       background: none; 
     font-family: 'DM Sans', sans-serif; cursor: pointer; border-bottom: 2px solid transparent;
    transition: color 0.15s; -webkit-user-select: none; user-select: none;
    white-space: nowrap;
  }
  .drv-tab:active {  }
  .drv-tab.active {   }
  .drv-tab svg { width: 22px; height: 22px; }
  .drv-badge { background: #ef4444; color: #FDFBF7; border-radius: 99px; font-size: 10px; font-weight: 700; padding: 1px 5px; position: absolute; top: -3px; right: -5px; }
  .drv-tab-count { display: none; }
  .drv-body {
    flex: 1;  
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
    overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain;
  }
  .drv-section { font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 10px; }
  .drv-card { background: #FDFBF7; border: 1px solid rgba(201,155,74,.45); border-radius: 16px; padding: 14px; margin-bottom: 10px; }
  .drv-swipe { position: relative; margin-bottom: 10px; border-radius: 16px; overflow: hidden; }
  .drv-swipe .drv-card { margin-bottom: 0; }
  .drv-swipe-content { position: relative; z-index: 1; touch-action: pan-y; will-change: transform; }
  .drv-swipe-action {
    position: absolute; top: 0; right: 0; bottom: 0; width: 96px; z-index: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
    background: #dc2626; color: #fff; border: none; font-size: 20px; font-weight: 700; cursor: pointer;
  }
  .drv-swipe-action span { font-size: 11px; font-weight: 700; letter-spacing: .04em; }
  .drv-card.pending { border-color: #f59e0b; }
  .drv-card.new { border-color: #3b82f6; box-shadow: 0 0 0 3px #3b82f620; }
  .drv-card.done { opacity: 0.5; }
  .drv-card.accepted { border-color: #22c55e; }
  .drv-card.refused { border-color: #ef4444; opacity: 0.6; }
  .drv-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .drv-time { font-size: 22px; font-weight: 800; color: #0f172a; }
  .drv-name { font-size: 14px; font-weight: 600; color: #0f172a; }
  .drv-sub { font-size: 12px; color: #64748b; }
  .drv-route { display: flex; flex-direction: column; gap: 4px; margin: 8px 0; }
  .drv-route span { display: flex; align-items: flex-start; gap: 6px; font-size: 13px; color: #334155; line-height: 1.4; }
  .drv-meta { display: flex; gap: 12px; font-size: 12px; color: #64748b; margin: 8px 0 12px; flex-wrap: wrap; }
  .drv-meta span { display: flex; align-items: center; gap: 4px; }
  .drv-btns { display: flex; gap: 8px; }
  .drv-btn-primary { flex: 1; min-height: 46px;    border-radius: 12px; padding: 12px; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; }
  .drv-btn-primary:active { background: #1e293b; }
  .drv-btn-secondary { flex: 1; min-height: 46px;    border-radius: 12px; padding: 12px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; }
  .drv-btn-secondary:active { background: #e2e8f0; }
  .drv-btn-danger { flex: 1; min-height: 46px;   border: 1px solid #fecaca; border-radius: 12px; padding: 12px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; }
  .drv-btn-danger:active { background: #fee2e2; }
  .drv-badge-pill { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 99px; }
  .drv-badge-blue {   }
  .drv-badge-green {   }
  .drv-badge-amber { background: #FDFBF7beb; color: #92400e; }
  .drv-badge-red { background: #fef2f2; color: #b91c1c; }
  .drv-badge-gray {   }
  .drv-stars { color: #f59e0b; font-size: 15px; letter-spacing: 1px; }
  .drv-stars-empty { color: var(--border); font-size: 15px; }
  .drv-stat-grid { display: grid;    }
  .drv-stat {    }
  .drv-stat-lbl {   margin-bottom: 4px; }
  .drv-stat-val {  font-weight: 800;  }
  .drv-stat-sub {   margin-top: 2px; }
  .drv-empty { text-align: center; padding: 50px 20px; color: #94a3b8; }
  .drv-empty svg { width: 40px; height: 40px; margin-bottom: 10px; opacity: 0.4; }
  .drv-route-opt { border: 1.5px solid rgba(201,155,74,.45); border-radius: 14px; padding: 12px 14px; margin-bottom: 10px; cursor: pointer; transition: border-color 0.15s; min-height: 44px; }
  .drv-route-opt:active { background: #f8fafc; }
  .drv-route-opt.selected { border-color: #c99b4a; background: #f8fafc; }
  .drv-route-opt-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .drv-route-label { font-size: 13px; font-weight: 700; color: #0f172a; }
  .drv-route-price { font-size: 16px; font-weight: 800; color: #0f172a; }
  .drv-route-meta { display: flex; gap: 10px; font-size: 12px; color: #64748b; }
  .drv-map { width: 100%; height: 200px; border-radius: 12px; overflow: hidden; margin-bottom: 14px; border: 1px solid rgba(201,155,74,.45); touch-action: pan-x pan-y; }
  .drv-divider { border: none; border-top: 1px solid rgba(201,155,74,.25); margin: 16px 0; }
  .drv-planning-slot { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 12px; }
  .drv-planning-time { font-size: 12px; color: #64748b; min-width: 40px; padding-top: 3px; }
  .drv-planning-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
  .drv-planning-card { flex: 1; background: #FDFBF7; border: 1px solid rgba(201,155,74,.45); border-radius: 12px; padding: 10px 12px; }
  
  .drv-chat-thread { border: 1px solid rgba(201,155,74,.45); border-radius: 14px; padding: 12px 14px; margin-bottom: 8px; cursor: pointer; background: #FDFBF7; display: flex; align-items: center; gap: 10px; }
  .drv-chat-thread:active { background: #f8fafc; }
  .drv-chat-thread.unread {   }
  .drv-chat-avatar { width: 38px; height: 38px; border-radius: 50%; background: #0f172a; color: #FDFBF7; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; flex-shrink: 0; }
  .drv-chat-bubble { max-width: 78%; border-radius: 14px; padding: 9px 12px; font-size: 13.5px; line-height: 1.45; }
  .drv-chat-bubble.me {   border-radius: 14px 14px 4px 14px; margin-left: auto; }
  .drv-chat-bubble.them {   border-radius: 14px 14px 14px 4px; }
  @keyframes drv-fadein { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:none; } }
  .drv-msg-in { animation: drv-fadein 0.25s ease both; }
  @keyframes drv-pulse { 0%, 100% { opacity:1; box-shadow: 0 0 0 3px rgba(34,197,94,0.3); } 50% { opacity:0.6; box-shadow: 0 0 0 6px rgba(34,197,94,0.1); } }
  .drv-visitor-dot-active { animation: drv-pulse 2s ease-in-out infinite; }

  /* ── Access Prestige mobile visual system ───────────────────────────── */
  .drv-root {  color:#f6f0e5 !important; }
  .drv-header {     }
  .drv-brand-mark { width:42px; height:42px;   display:grid; place-items:center; color:#e0b866; font-family:Georgia,serif; font-weight:800; letter-spacing:.08em; flex:0 0 42px; }
  .drv-header-title { min-width:0; flex:1; display:flex; flex-direction:column; gap:2px; }
  .drv-header-title strong { color:#f6f0e5;  font-weight:800; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .drv-header-title span { color:rgba(246,240,229,.55);  }
  .drv-header-back { display:flex; align-items:center; gap:5px; height:34px; padding:0 10px; border:1px solid #c99b4a; border-radius:8px; background:#07101a; color:#e0b866; text-decoration:none; font-size:11.5px; font-weight:700; white-space:nowrap; flex:0 0 auto; }
  .drv-header-back svg { flex-shrink:0; }
  .drv-header-notif { display:flex; align-items:center; gap:5px; height:34px; padding:0 10px; border:1px solid #d6a83d; border-radius:8px; background:#d6a83d; color:#07101a; font-size:11.5px; font-weight:800; white-space:nowrap; flex:0 0 auto; cursor:pointer; }
  .drv-header-notif svg { flex-shrink:0; }
  @media (max-width: 900px) {
    .drv-header-notif .drv-header-notif-label { display:none; }
    .drv-header-notif { width:34px; padding:0; justify-content:center; }
  }

  @media (max-width: 380px) {
    .drv-time { font-size: 18px; }
    .drv-stat-val { font-size: 20px; }
  

    .drv-header-back span.drv-header-back-label { display:none; }
    .drv-header-back { width:34px; height:34px; padding:0; justify-content:center; }
  
}
  /* En-tête : pastille "EN LIGNE", date/heure et cloche de notifications,
     visibles sur toutes les pages (pas seulement le tableau de bord),
     à l'image de la maquette. */
  .drv-header-live { flex:0 0 auto; }
  .drv-header-datetime {
    display:none; flex:0 0 auto; text-align:right; font-size:10.5px; line-height:1.35;
    color:rgba(246,240,229,.6); white-space:nowrap;
  }
  .drv-header-datetime strong { display:block; color:#f6f0e5; font-size:12px; font-weight:700; }
  
  .drv-header-bell {
    position:relative; flex:0 0 auto; width:34px; height:34px; display:grid; place-items:center;
    background:#07101a; border:1px solid #c99b4a; border-radius:8px; color:#e0b866; cursor:pointer;
  }
  .drv-header-bell svg { width:16px; height:16px; }
  .drv-header-bell .drv-badge { top:-5px; right:-5px; }
  .drv-overview { padding:14px 14px 4px; background:#03070d; }
  .drv-overview-head {
    display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px;
    border: 1px solid rgba(201,155,74,.45); border-radius: 12px; padding: 12px 14px; background:#050a10;
  }
  .drv-overview-head p { margin:0 0 2px; color:#e0b866; font-size:9px; letter-spacing:.12em; font-weight:800; }
  .drv-overview-head h2 { margin:0; color:#f6f0e5; font-family:Georgia,serif; font-size:19px; }
  .drv-live-pill { display:inline-flex; align-items:center; gap:6px; border:1px solid rgba(95,208,138,.45); color:#8ee39f; border-radius:999px; padding:5px 8px; font-size:9px; font-weight:800; }
  .drv-live-pill i { width:6px; height:6px; border-radius:50%; background:#5fd08a; display:block; }
  .drv-stat-grid { grid-template-columns:repeat(2,1fr) !important; gap:8px !important; margin-bottom:10px !important; }
  .drv-stat { background:linear-gradient(180deg,#0a1118,#050a10) !important; border:1px solid rgba(201,155,74,.45); border-radius:9px !important; padding:11px !important;
    display:grid !important; grid-template-columns:minmax(0,1fr) auto; align-items:center; column-gap:8px; }
  .drv-stat-lbl { grid-column:1; grid-row:1; margin:0 !important; color:rgba(246,240,229,.55) !important; font-size:8.5px !important; letter-spacing:.08em; font-weight:800; line-height:1.25; }
  .drv-stat-val { grid-column:2; grid-row:1 / span 2; justify-self:end; text-align:right; white-space:nowrap; color:#e0b866 !important; font-size:22px !important; line-height:1.1; }
  .drv-stat-sub { grid-column:1; grid-row:2; margin:0 !important; color:rgba(246,240,229,.45) !important; font-size:9px !important; line-height:1.2; }
  @media (max-width:340px) { .drv-stat-val { font-size:18px !important; } }
  .drv-overview-actions { display:grid; grid-template-columns:repeat(4,1fr); border:1px solid rgba(201,155,74,.45); border-radius:9px; overflow:hidden; margin-bottom:10px; background:#050a10; }
  .drv-overview-actions button { min-height:64px; border:0; border-right:1px solid rgba(201,155,74,.45); background:transparent; color:#f6f0e5; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; font-size:8px; cursor:pointer; }
  .drv-overview-actions button:last-child { border-right:0; }
  .drv-overview-actions svg { width:20px; height:20px; color:#e0b866; }
  .drv-quick6 { grid-template-columns:repeat(3,1fr); gap:8px; background:transparent; border:0; }
  .drv-quick6 button { position:relative; background:#050a10; border:1px solid rgba(201,155,74,.45) !important; border-radius:9px; min-height:70px; font-size:9.5px; font-weight:700; letter-spacing:.02em; text-transform:uppercase; }
  .drv-quick6 button:active { background:#0a1118; }
  .drv-quick6 .drv-badge { position:absolute; top:6px; right:10px; }
  @media (min-width:640px) { .drv-quick6 { grid-template-columns:repeat(6,1fr); } }

  /* ── Tableau de bord (grille responsive) ─────────────────────────────── */
  .drv-main {  flex-direction:column; flex:1;  }
  .drv-section-row { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px; }
  .drv-section-row .drv-section { margin:0; }
  .drv-link-btn { background:none; border:none; color:#e0b866; font-size:11px; font-weight:700; cursor:pointer; padding:2px 0; text-transform:uppercase; letter-spacing:.04em; }
  .drv-live-pill-sm { font-size:8px; padding:3px 7px; }
  .drv-dash-grid { display:grid; grid-template-columns:1fr; gap:0; padding:0 14px; }
  .drv-dash-col { display:flex; flex-direction:column; min-width:0; }
  .drv-dash-next .drv-empty { padding:24px 10px; }
  .drv-dash-row {
    display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer;
    border: 1px solid rgba(201,155,74,.45); border-radius: 10px; margin-bottom: 8px;
  }
  .drv-dash-row:last-child { margin-bottom: 0; }
  .drv-dash-row-time { flex:0 0 48px; font-size:12px; font-weight:700; color:#e0b866; }
  .drv-dash-row-route { flex:1; min-width:0; font-size:13px; color:#f6f0e5; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .drv-dash-row-price { flex:0 0 auto; font-size:12px; font-weight:700; color:#f6f0e5; }
  .drv-dash-notif {
    display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px 12px; cursor:pointer;
    border: 1px solid rgba(201,155,74,.45); border-radius: 10px; margin-bottom: 8px;
    font-size:12.5px; color:rgba(246,240,229,.75);
  }
  .drv-dash-notif:last-child { margin-bottom: 0; }
  .drv-dash-notif strong { color:#e0b866; font-size:14px; }

  /* Tablette : deux colonnes pour le tableau de bord. */
  @media (min-width:700px) {
    html, body { background: #01040a; }
  

 .drv-header-datetime { display:block; } 

    .drv-dash-grid { grid-template-columns: 1.4fr 1fr; gap:14px; align-items:start; padding:0 14px; }
  
}
  /* Desktop / grand écran : sidebar de navigation fixe + contenu élargi. */
  @media (min-width:1024px) {
    .drv-body {  }
    .drv-card { padding: 16px; }
  

    .drv-tabs {
      position: fixed; top:74px; left:0; bottom:0; width:230px; z-index:5;
      flex-direction: column; align-items:stretch; overflow-y:auto; overflow-x:hidden;
      background:#050a10; border-bottom:0; border-right:1px solid rgba(201,155,74,.3);
      padding:0 0 16px;
    }
    .drv-tabs::before {
      content:'NOVA PRESTIGE RIDE'; display:block; padding:18px 18px 14px;
      font-family:Georgia,serif; font-weight:800; color:#e0b866; font-size:12px;
      letter-spacing:.1em; border-bottom:1px solid rgba(201,155,74,.25); margin-bottom:6px;
    }
    .drv-tab {
      flex-direction:row; justify-content:flex-start; align-items:center; gap:12px;
      min-height:44px; padding:10px 18px; font-size:13px; font-weight:600;
      border-bottom:0; border-left:3px solid transparent; text-align:left; white-space:normal;
    }
    .drv-tab svg { width:18px; height:18px; flex-shrink:0; }
    .drv-tab.active { color:#f6f0e5; border-left-color:#c99b4a; background:rgba(201,155,74,.12); }
    .drv-tab-count {
      margin-left:auto; flex:0 0 auto; background:rgba(201,155,74,.16); color:#e0b866;
      font-size:11px; font-weight:800; padding:2px 8px; border-radius:999px;
    }
    .drv-tab.active .drv-tab-count { background:rgba(201,155,74,.32); color:#f6f0e5; }
    .drv-main { margin-left:230px; }
    .drv-dash-grid { grid-template-columns: 1.6fr 1fr; gap:18px; padding:0; }
    .drv-overview { padding:18px 0 4px; }
    .drv-body { padding:20px 28px; }
  
}
  .drv-tabs {  border-top:1px solid rgba(201,155,74,.35) !important; border-bottom:1px solid rgba(201,155,74,.35) !important; }
  .drv-tab {    }
  .drv-tab.active {  border-bottom-color:#e0b866 !important; }
  .drv-tab:active { background:#0a1118 !important; }
  .drv-body { background:#03070d !important; padding:12px 12px calc(88px + env(safe-area-inset-bottom, 0px)) !important; }
  .drv-card, .drv-route-opt, .drv-chat-thread, .drv-planning-card { background:#050a10 !important; border-color:rgba(201,155,74,.45) !important; color:#f6f0e5 !important; }
  .drv-time, .drv-name, .drv-route-label, .drv-planning-card, .drv-route span, .drv-section { color:#f6f0e5 !important; }
  .drv-sub, .drv-meta, .drv-route-meta, .drv-planning-time { color:rgba(246,240,229,.55) !important; }
  .drv-btn-primary { background:#050a10 !important; color:#fff !important; border:1px solid #e0b866 !important; }
  .drv-btn-secondary { background:#050a10 !important; color:#e0b866 !important; border:1px solid #c99b4a !important; }
  .drv-btn-danger { background:#1b0c0c !important; color:#f0a0a0 !important; border-color:#8b3a3a !important; }
  .drv-badge-blue { background:#17243a !important; color:#9fc2ff !important; }
  .drv-badge-green { background:#10271b !important; color:#8ee39f !important; }
  .drv-badge-gray { background:#111820 !important; color:#c8c0b2 !important; }
  .drv-chat-bubble.me { background:#101820 !important; color:#fff !important; border:1px solid #e0b866 !important; }
  .drv-chat-bubble.them { background:#101820 !important; color:#f6f0e5 !important; }
  .drv-chat-thread.unread { background:#101d28 !important; border-color:#c99b4a !important; }
  .drv-team-map { background:#050a10 !important; border-color:rgba(201,155,74,.45) !important; }
  /* Recolor legacy inline light surfaces without touching their behaviour.
     IMPORTANT : les navigateurs réécrivent les couleurs hex des styles inline
     en rgb(...) dans l'attribut style réellement posé sur le DOM — les
     sélecteurs [style*="#hex"] ci-dessous ne matchent donc quasiment jamais
     en pratique (c'est ce qui rendait des textes/bordures "trop sombres" un
     peu partout, écran + onglets, malgré ces règles). On ajoute donc pour
     chaque couleur son équivalent rgb() en plus du hex. */
  [style*="#FDFBF7"], [style*="#f8fafc"], [style*="#f1f5f9"],
  [style*="rgb(253, 251, 247)"], [style*="rgb(248, 250, 252)"], [style*="rgb(241, 245, 249)"] {
    background-color:#050a10 !important;
  }
  [style*="#0f172a"], [style*="rgb(15, 23, 42)"] { color:#f6f0e5 !important; background-color:#0b1118 !important; }
  [style*="#e2e8f0"], [style*="rgb(226, 232, 240)"] { border-color:rgba(201,155,74,.45) !important; }
  [style*="#f1f5f9"], [style*="rgb(241, 245, 249)"] { border-color:rgba(201,155,74,.22) !important; }
  [style*="rgba(255,255,255,0.2)"], [style*="rgba(255, 255, 255, 0.2)"] { border-color:rgba(201,155,74,.45) !important; }
  [style*="#64748b"], [style*="#94a3b8"], [style*="#475569"], [style*="#334155"], [style*="#cbd5e1"],
  [style*="rgb(100, 116, 139)"], [style*="rgb(148, 163, 184)"], [style*="rgb(71, 85, 105)"],
  [style*="rgb(51, 65, 85)"], [style*="rgb(203, 213, 225)"] {
    color:rgba(246,240,229,.6) !important;
  }
  [style*="#fef2f2"], [style*="#fff7ed"], [style*="#F4EFE4"], [style*="#fffbeb"], [style*="#eff6ff"], [style*="#f0fdf4"], [style*="#fff"],
  [style*="rgb(254, 242, 242)"], [style*="rgb(255, 247, 237)"], [style*="rgb(244, 239, 228)"], [style*="rgb(255, 251, 235)"],
  [style*="rgb(239, 246, 255)"], [style*="rgb(240, 253, 244)"], [style*="rgb(255, 255, 255)"] {
    background-color:#0b1118 !important;
  }
  .drv-root input, .drv-root select, .drv-root textarea {
    background:#050a10 !important; color:#f6f0e5 !important;
    border:1px solid rgba(201,155,74,.45) !important; border-radius:10px !important;
  }
  .drv-root input::placeholder, .drv-root textarea::placeholder { color:rgba(246,240,229,.4) !important; }
  .drv-root select option { background:#050a10; color:#f6f0e5; }
  .drv-root input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(1) sepia(1) saturate(4) hue-rotate(5deg); }
  @media (max-width:600px) {
    .drv-root { max-width:100%; border:0; }
    .drv-overview-actions button { min-height:58px; }
    .drv-team-map { margin:8px 0 10px !important; }
  }
  /* MAQUETTE APT */
  html, body { overflow-x:hidden !important; overflow-y:auto !important; height:auto !important; min-height:100%; }
  body { overscroll-behavior-y:auto !important; }
  .drv-root { position:relative !important; inset:auto !important; min-height:100dvh; height:auto !important; overflow:visible !important; background:#02070d !important; }
  .drv-header { height:78px !important; min-height:78px !important; padding:0 18px !important; background:linear-gradient(180deg,#07111a,#03080e) !important; border-bottom:1px solid rgba(201,155,74,.16) !important; }
  .drv-header-title strong { font-size:18px !important; } .drv-header-title span { font-size:12px !important; }
  .drv-header-live { margin-left:20px; }
  .drv-header-kpi { display:flex; flex-direction:column; min-width:120px; padding:0 22px; border-left:1px solid rgba(255,255,255,.07); }
  .drv-header-kpi small { color:#7f8b98; font-size:9px; letter-spacing:.04em; } .drv-header-kpi strong { color:#f6f0e5; font-size:20px; margin-top:4px; } .drv-header-kpi strong span { color:#e0b866; }
  .drv-header-datetime { margin-left:auto; }
  .drv-main { display:block !important; margin-left:0 !important; min-height:calc(100dvh - 78px) !important; overflow:visible !important; }
  .drv-tabs { position:fixed !important; top:0 !important; left:0 !important; bottom:0 !important; width:164px !important; height:100dvh !important; padding:0 10px 20px !important; display:flex !important; flex-direction:column !important; background:#040a11 !important; border:0 !important; border-right:1px solid rgba(201,155,74,.18) !important; z-index:30 !important; overflow-y:auto !important; overflow-x:hidden !important; }
  .drv-side-logo { height:104px; display:flex; flex-direction:column; align-items:center; justify-content:center; border-bottom:1px solid rgba(255,255,255,.06); margin:0 -10px 12px; }
  .drv-side-logo span { color:#e0b866; font:32px Georgia,serif; line-height:.8; } .drv-side-logo b { color:#fff; font:20px Georgia,serif; } .drv-side-logo em { color:#e0b866; font:700 7px Arial,sans-serif; letter-spacing:.15em; font-style:normal; }
  .drv-tab { width:100% !important; min-height:42px !important; padding:9px 10px !important; flex-direction:row !important; justify-content:flex-start !important; gap:11px !important; border:0 !important; border-left:3px solid transparent !important; border-radius:6px !important; color:#b9c1ca !important; font-size:10px !important; font-weight:700 !important; }
  .drv-tab.active { background:linear-gradient(90deg,rgba(201,155,74,.22),rgba(201,155,74,.04)) !important; color:#fff !important; border-left-color:#e0b866 !important; }
  .drv-tab-icon { display:grid; place-items:center; width:20px; flex:0 0 20px; } .drv-tab-icon svg { width:18px !important; height:18px !important; }
  .drv-tab-count { margin-left:auto !important; background:#14304e !important; color:#9ec8ff !important; padding:3px 7px !important; border-radius:5px !important; font-size:9px !important; }
  .drv-content { min-height:calc(100dvh - 78px); margin-left:164px; padding:0 18px 26px; overflow:visible; }
  .drv-dashboard { width:100%; max-width:1500px; margin:0 auto; padding:14px 0 30px; }
  .drv-dashboard-grid-top { display:grid; grid-template-columns:minmax(330px,1.15fr) minmax(320px,1fr) minmax(260px,.86fr); gap:10px; }
  .drv-dashboard-grid-mid { display:grid; grid-template-columns:1.15fr 1fr .9fr; gap:10px; margin-top:10px; }
  .drv-dashboard-grid-bottom { display:grid; grid-template-columns:1fr 1.15fr .95fr 1.35fr; gap:10px; margin-top:10px; }
  .drv-dashboard .drv-card { background:linear-gradient(145deg,#08131d,#050b12) !important; border:1px solid rgba(116,146,169,.22) !important; border-radius:9px !important; color:#f7f7f4 !important; margin:0 !important; box-shadow:inset 0 1px rgba(255,255,255,.025); }
  .drv-card-head { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:13px; color:#f5f5f3; font-size:12px; font-weight:800; }
  .drv-card-head > span { letter-spacing:.01em; } .drv-card-head > b { background:#123050; color:#b7dcff; border-radius:5px; padding:3px 7px; font-size:9px; } .drv-card-head > button { background:none; border:0; color:#cbd2d8; font-size:9px; font-weight:800; cursor:pointer; }
  .drv-next-card { min-height:315px; } .drv-next-layout { display:grid; grid-template-columns:100px 1fr; gap:14px; padding:2px 0 15px; border-bottom:1px solid rgba(255,255,255,.07); }
  .drv-next-time strong { display:block; color:#fff; font-size:32px; line-height:1; } .drv-next-time span { display:block; margin-top:8px; color:#aab4bf; font-size:11px; }
  .drv-next-route { border-left:1px solid rgba(255,255,255,.08); padding-left:15px; display:grid; gap:13px; } .drv-next-route > div { position:relative; padding-left:15px; } .drv-next-route strong { display:block; font-size:14px; } .drv-next-route small { display:block; color:#8995a1; font-size:10px; margin-top:3px; }
  .dot { position:absolute; left:0; top:4px; width:8px; height:8px; border-radius:50%; } .dot.green { background:#58cf39; } .dot.red { background:#ff4350; }
  .drv-next-meta { display:grid; grid-template-columns:1.3fr 1fr .65fr; gap:10px; padding:12px 0; color:#d9dee2; font-size:10px; } .drv-next-meta span { display:flex; flex-direction:column; gap:3px; border-right:1px solid rgba(255,255,255,.07); } .drv-next-meta span:last-child { border:0; } .drv-next-meta small { color:#8995a1; }
  .drv-btn-start,.drv-btn-detail { min-height:40px; border-radius:5px; padding:9px 10px; font-size:10px; font-weight:800; cursor:pointer; } .drv-btn-start { flex:1.4; background:#43b51f; color:#fff; border:1px solid #5bdc35; } .drv-btn-detail { flex:1; background:#07101a; color:#f2f2ef; border:1px solid #50606e; }
  .drv-day-card,.drv-revenue-card { min-height:315px; } .drv-day-list { display:flex; flex-direction:column; }
  .drv-day-row { display:grid; grid-template-columns:45px minmax(0,1fr) 42px 58px; gap:5px; align-items:center; padding:8px 0; border:0; border-top:1px solid rgba(255,255,255,.055); background:transparent; color:#dce1e5; text-align:left; font-size:10px; cursor:pointer; } .drv-day-row:first-child { border-top:0; } .drv-day-row time { color:#fff; font-weight:700; } .drv-day-row span { overflow:hidden; white-space:nowrap; text-overflow:ellipsis; } .drv-day-row strong { text-align:right; } .drv-day-row em { font-style:normal; text-align:center; border-radius:10px; padding:3px 2px; background:#17351e; color:#57d63d; font-size:7px; font-weight:800; } .drv-day-row em.upcoming { background:#17304a; color:#55b5ff; }
  .drv-revenue-main { display:grid; grid-template-columns:1fr auto; align-items:start; } .drv-revenue-main strong { color:#52d638; font-size:32px; line-height:1; } .drv-revenue-main span { grid-column:1; color:#59d93e; font-size:9px; margin-top:5px; } .drv-revenue-main b { color:#54db3b; font-size:14px; text-align:right; } .drv-revenue-main b small { display:block; color:#9ca7b0; font-size:8px; font-weight:400; margin-top:4px; }
  .drv-revenue-card .drv-card-head select { background:#09131d; color:#e5e9eb; border:1px solid #3b4c5a; border-radius:5px; padding:5px 8px; font-size:9px; }
  .drv-chart { height:112px; margin:10px 0; display:flex; align-items:flex-end; gap:4px; padding:0 3px; border-bottom:1px solid rgba(255,255,255,.08); background:repeating-linear-gradient(to bottom,transparent 0,transparent 27px,rgba(255,255,255,.045) 28px); } .drv-chart i { flex:1; background:#49c933; border-radius:1px 1px 0 0; opacity:.9; }
  .drv-revenue-footer { display:grid; grid-template-columns:repeat(3,1fr); text-align:center; border-top:1px solid rgba(255,255,255,.06); padding-top:10px; } .drv-revenue-footer span { font-size:8px; color:#a5afb8; border-right:1px solid rgba(255,255,255,.06); } .drv-revenue-footer span:last-child { border:0; } .drv-revenue-footer b { display:block; color:#eef0f0; font-size:15px; margin-bottom:3px; }
  .drv-plan-row { display:grid; grid-template-columns:102px minmax(0,1fr) 40px 25px; gap:7px; align-items:center; padding:11px 0; border-top:1px solid rgba(255,255,255,.06); font-size:10px; } .drv-plan-row:first-of-type { border-top:0; } .drv-plan-row > span { color:#bbc3c9; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; } .drv-plan-row > b { text-align:right; } .drv-plan-row > em { color:#be6eff; font-style:normal; }
  .violet-pill { background:#32225b !important; color:#c69bff !important; } .red-pill { background:#54232c !important; color:#ff8c98 !important; } .gold-pill { background:#58440d !important; color:#ffd449 !important; }
  button.drv-message-row { width:100%; background:transparent; border:0; text-align:left; color:inherit; cursor:pointer; font:inherit; }
  .drv-message-row { display:grid; grid-template-columns:32px 1fr 38px; gap:8px; align-items:center; padding:9px 0; border-top:1px solid rgba(255,255,255,.06); } .avatar { width:30px; height:30px; border-radius:50%; display:grid; place-items:center; background:#d9b49a; color:#16202a; font-size:8px; font-weight:900; } .drv-message-row div:nth-child(2) b { display:block; font-size:10px; } .drv-message-row div:nth-child(2) span { display:block; color:#9ba5ae; font-size:9px; margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; } .drv-message-row > small { color:#7e8993; text-align:right; font-size:8px; } .drv-message-row > small i { display:inline-block; width:5px; height:5px; border-radius:50%; background:#ff4b55; }
  .drv-rating strong { font-size:42px; color:#f4f4f1; } .drv-rating > span { color:#9aa5ae; font-size:14px; } .drv-rating div { color:#ffc928; font-size:17px; letter-spacing:2px; margin-top:8px; } .drv-rating small { display:block; color:#9aa5ae; font-size:9px; margin-top:5px; } .drv-rating-bars { margin-top:-50px; margin-left:120px; } .drv-rating-bars > div { display:flex; align-items:center; gap:5px; margin:5px 0; } .drv-rating-bars b { width:28px; font-size:8px; } .drv-rating-bars i { height:5px; flex:1; background:#25313a; border-radius:5px; overflow:hidden; } .drv-rating-bars i span { display:block; height:100%; background:#f5bb18; }
  .drv-fleet { list-style:none; margin:0 0 8px; padding:0; display:flex; flex-direction:column; gap:8px; } .drv-fleet li { display:grid; grid-template-columns:64px minmax(0,1fr) auto; align-items:center; gap:9px; padding:7px; border:1px solid rgba(201,155,74,.35); border-radius:9px; background:rgba(255,255,255,.02); } .drv-fleet li.is-mine { border-color:rgba(201,155,74,.85); box-shadow:inset 0 0 0 1px rgba(201,155,74,.25); } .drv-fleet img { width:64px; height:44px; object-fit:cover; border-radius:7px; flex-shrink:0; } .drv-fleet strong { display:block; font-size:11px; line-height:1.25; } .drv-fleet span { display:block; color:#9aa5ae; font-size:9px; } .drv-fleet em { font-style:normal; font-size:7px; font-weight:800; letter-spacing:.06em; color:#e7bd5d; border:1px solid rgba(201,155,74,.6); border-radius:999px; padding:3px 6px; white-space:nowrap; } @media(max-width:420px){ .drv-fleet li { grid-template-columns:52px minmax(0,1fr); } .drv-fleet img { width:52px; height:38px; } .drv-fleet em { grid-column:1 / -1; justify-self:start; } }
  .drv-vehicle-card > strong { display:block; font-size:14px; margin-bottom:3px; } .drv-vehicle-card > span { color:#9aa5ae; font-size:10px; } .drv-car-placeholder { height:70px; margin:10px 0 5px; display:grid; place-items:end center; color:#687580; font-size:28px; font-weight:900; font-style:italic; background:radial-gradient(ellipse at center,#1a2731 0,transparent 55%); } .drv-vehicle-card footer { display:flex; gap:10px; border-top:1px solid rgba(255,255,255,.06); padding-top:8px; color:#b8c1c8; font-size:8px; } .drv-vehicle-card footer i { color:#44cc39; font-style:normal; }
  .drv-gps-card > strong { display:block; font-size:10px; } .drv-gps-card > span { color:#a4adb4; font-size:9px; display:block; margin-top:2px; } .gps-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:#4ed239; margin-right:5px; } .live-small { background:#15371c !important; color:#5cdb44 !important; }
  .gps-map { height:97px; margin-top:8px; border-radius:6px; position:relative; overflow:hidden; background-color:#6f6c60; background-image:linear-gradient(25deg,transparent 45%,rgba(255,255,255,.5) 46%,rgba(255,255,255,.5) 48%,transparent 49%),linear-gradient(120deg,transparent 40%,rgba(53,54,47,.65) 41%,rgba(53,54,47,.65) 44%,transparent 45%),repeating-linear-gradient(12deg,rgba(180,177,160,.35) 0 2px,transparent 2px 15px); } .gps-map > span { position:absolute; z-index:2; left:50%; top:52%; transform:translate(-50%,-50%); width:16px; height:16px; border-radius:50%; background:#2387ed; border:3px solid #d9efff; color:transparent; }
  .drv-notif-row { display:grid; grid-template-columns:18px 1fr auto; align-items:center; gap:6px; padding:9px 0; border-bottom:1px solid rgba(255,255,255,.06); color:#dce1e4; font-size:9px; } .drv-notif-row small { color:#7d8891; font-size:7px; } .drv-see-all { display:block; margin:9px auto 0; background:none; border:0; color:#d0d5d9; font-size:8px; cursor:pointer; }
  .shortcut-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; } .shortcut-grid button { border:0; background:transparent; color:#f1f3f2; cursor:pointer; min-width:0; } .shortcut-grid b { display:grid; place-items:center; width:46px; height:46px; margin:0 auto 8px; border-radius:10px; font-size:27px; background:#0965d8; color:#fff; } .shortcut-grid button:nth-child(2) b { background:#2d9b36; } .shortcut-grid button:nth-child(3) b { background:#9348b7; } .shortcut-grid button:nth-child(4) b { background:#087f82; } .shortcut-grid span { font-size:7px; font-weight:800; line-height:1.35; }
  .drv-mobile-stats { display:none; }
  .drv-mobile-nav { display:none; } .drv-body { overflow:visible !important; height:auto !important; min-height:0 !important; }
  
  

  /* Mobile: the fifth action opens the complete navigation drawer. */
  .drv-mobile-drawer-backdrop { display:none; }
  .drv-mobile-drawer { display:none; }
  

  @media (min-width:701px) { .drv-header > .drv-brand-mark { display:none !important; } }
  
  /* Le menu déroulant Adam/Ayoub doit toujours passer au-dessus du header
     sticky, de la sidebar/tabs et de tout le reste de l'UI, quel que soit le
     breakpoint (le header seul crée déjà son propre contexte d'empilement
     via position:sticky + z-index, donc le switcher doit dépasser TOUTES
     les valeurs de z-index utilisées ailleurs dans ce fichier, y compris
     .drv-tabs et .drv-mobile-drawer). */
  .drv-identity-switcher,
  .drv-identity-menu { z-index: 300 !important; }

  #root { height:auto !important; min-height:100% !important; overflow:visible !important; }
  .drv-root, .drv-main, .drv-content, .drv-dashboard { touch-action:auto !important; }
  
  

  /* ================================================================
     APT — ALIGNEMENT FINAL SUR LA MAQUETTE FOURNIE
     Breakpoints: mobile / tablette / desktop.
     Ces règles restent uniquement visuelles et ne modifient aucune
     logique métier, donnée, navigation ou appel serveur.
     ================================================================ */

  /* ---------- DESKTOP : >= 1101px ---------- */
  

  /* ---------- TABLETTE : 701–1100px ----------
     Navigation horizontale + contenu en grille 2 colonnes. */
  

  /* ---------- MOBILE : <= 700px ----------
     On colle au téléphone de la maquette : barre compacte,
     carte prochaine course, 3 KPI, courses du jour et navigation basse. */
  

  /* ================================================================
     APT — DASHBOARD FINAL / MAQUETTE
     Priorité au rendu d'arrivée sur /driver.
     On conserve volontairement le sélecteur Adam/Ayoub et
     « Retour au site ». Aucun comportement métier n'est modifié.
     ================================================================ */
  @media (min-width:1101px) {
 .drv-header {  } 

    html, body {  }

    .drv-header {
      
      
      
      
      
    }

    .drv-tabs {
      
      
    }

    .drv-side-logo {
      
      
    }

    .drv-content {
      
      
      
    }

    .drv-dashboard {
      
      
      
    }

    /* La maquette desktop utilise trois colonnes de même poids. */
    .drv-dashboard-grid-top {
      grid-template-columns:repeat(3,minmax(0,1fr)) !important;
      gap:10px !important;
    }

    .drv-dashboard-grid-mid {
      grid-template-columns:repeat(3,minmax(0,1fr)) !important;
      gap:10px !important;
      
    }

    /* 4 cartes du bas : véhicule / GPS / notifications / raccourcis. */
    .drv-dashboard-grid-bottom {
      
      
      
    }

    .drv-dashboard .drv-card {
      
      
    }

    .drv-next-card,
    .drv-day-card,
    .drv-revenue-card {
      
    }

    .drv-next-card { padding:14px !important; }
    .drv-day-card,
    .drv-revenue-card { padding:14px !important; }

    .drv-next-layout {  }
    .drv-next-route {  }
    .drv-next-route strong,
    .drv-day-row span,
    .drv-plan-row > span,
    .drv-message-row div:nth-child(2) span {
      
      
    }

    .drv-plan-row {
      
    }

    .drv-message-row {
      
    }

    .drv-rating-bars {
      
    }

    .shortcut-grid {
      
      
    }

    .shortcut-grid b {
      
      
    }
  

    html, body { overflow-x:hidden !important; }

    .drv-root {
      min-height:100dvh !important;
      background:#02070d !important;
    }

    /* Sidebar = colonne fixe de la maquette */
    .drv-tabs {
      position:fixed !important;
      inset:0 auto 0 0 !important;
      width:145px !important;
      height:100dvh !important;
      padding:0 9px 18px !important;
      display:flex !important;
      flex-direction:column !important;
      background:#040a11 !important;
      border:0 !important;
      border-right:1px solid rgba(201,155,74,.18) !important;
      overflow-y:auto !important;
      overflow-x:hidden !important;
      z-index:40 !important;
    }

    .drv-side-logo {
      width:auto !important;
      height:104px !important;
      margin:0 -9px 12px !important;
      flex:0 0 104px !important;
    }

    .drv-tab {
      width:100% !important;
      min-height:42px !important;
      flex:0 0 42px !important;
      padding:9px 8px !important;
      display:flex !important;
      flex-direction:row !important;
      justify-content:flex-start !important;
      align-items:center !important;
      gap:10px !important;
      border:0 !important;
      border-left:3px solid transparent !important;
      border-radius:6px !important;
      color:#b9c1ca !important;
      font-size:10px !important;
      font-weight:700 !important;
    }

    .drv-tab.active {
      color:#fff !important;
      border-left-color:#e0b866 !important;
      background:linear-gradient(90deg,rgba(201,155,74,.22),rgba(201,155,74,.04)) !important;
    }

    .drv-tab-icon { width:20px !important; flex:0 0 20px !important; display:grid !important; place-items:center !important; }
    .drv-tab-icon svg { width:18px !important; height:18px !important; }
    .drv-tab-label { min-width:0 !important; overflow:hidden !important; text-overflow:ellipsis !important; white-space:nowrap !important; }
    .drv-tab-count { display:inline-flex !important; margin-left:auto !important; flex:0 0 auto !important; }

    /* Header aligné sur le bord droit de la sidebar */
    .drv-header {
      position:relative !important;
      z-index:35 !important;
      margin-left:145px !important;
      width:calc(100% - 145px) !important;
      height:78px !important;
      min-height:78px !important;
      padding:0 18px !important;
      gap:10px !important;
      background:linear-gradient(180deg,#07111a,#03080e) !important;
      border-bottom:1px solid rgba(201,155,74,.16) !important;
      overflow:visible !important;
    }

    .drv-brand-mark { display:none !important; }

    .drv-header-title {
      min-width:180px !important;
      flex:1 1 auto !important;
      display:flex !important;
      flex-direction:column !important;
      gap:2px !important;
    }
    .drv-header-title strong { font-size:17px !important; color:#f6f0e5 !important; }
    .drv-header-title span { font-size:11px !important; color:rgba(246,240,229,.55) !important; }

    /* Conservation explicite du sélecteur */
    .drv-header > div[style*="position: relative"] {
      display:block !important;
      flex:0 0 auto !important;
    }
    .drv-header > div[style*="position: relative"] > button {
      min-height:32px !important;
      white-space:nowrap !important;
    }

    .drv-header-live {
      flex:0 0 auto !important;
      margin-left:0 !important;
    }

    .drv-header-kpi {
      min-width:105px !important;
      padding:0 15px !important;
    }
    .drv-header-kpi small { font-size:8px !important; }
    .drv-header-kpi strong { font-size:18px !important; }

    .drv-header-datetime {
      display:block !important;
      flex:0 0 auto !important;
      margin-left:auto !important;
      min-width:96px !important;
      font-size:10px !important;
      text-align:right !important;
    }
    .drv-header-datetime strong { font-size:11px !important; }

    .drv-header-bell {
      flex:0 0 34px !important;
      width:34px !important;
      height:34px !important;
    }

    /* Conservation explicite de « Retour au site » */
    .drv-header-back {
      display:flex !important;
      flex:0 0 auto !important;
      align-items:center !important;
      height:34px !important;
      padding:0 10px !important;
      border:1px solid rgba(201,155,74,.65) !important;
      border-radius:8px !important;
      background:#07101a !important;
      color:#e0b866 !important;
      font-size:10px !important;
      font-weight:700 !important;
      white-space:nowrap !important;
    }

    .drv-main {
      margin-left:0 !important;
      min-height:calc(100dvh - 78px) !important;
      display:block !important;
      overflow:visible !important;
    }

    .drv-content {
      margin-left:145px !important;
      width:calc(100% - 145px) !important;
      min-width:0 !important;
      padding:0 15px 26px !important;
      overflow:visible !important;
    }

    .drv-dashboard {
      width:100% !important;
      max-width:none !important;
      margin:0 !important;
      padding:12px 0 30px !important;
    }

    /* Trois colonnes égales, comme la maquette */
    .drv-dashboard-grid-top,
    .drv-dashboard-grid-mid {
      width:100% !important;
      display:grid !important;
      grid-template-columns:repeat(3,minmax(0,1fr)) !important;
      gap:10px !important;
    }
    .drv-dashboard-grid-mid { margin-top:10px !important; }

    /* Quatre blocs en bas avec le poids visuel de la maquette */
    .drv-dashboard-grid-bottom {
      width:100% !important;
      display:grid !important;
      grid-template-columns:.83fr .96fr .87fr 1.39fr !important;
      gap:10px !important;
      margin-top:10px !important;
    }

    .drv-dashboard .drv-card {
      min-width:0 !important;
      margin:0 !important;
      padding:14px !important;
      border-radius:9px !important;
      background:linear-gradient(145deg,#08131d,#050b12) !important;
      border:1px solid rgba(116,146,169,.22) !important;
      box-shadow:inset 0 1px rgba(255,255,255,.025) !important;
      overflow:hidden !important;
    }

    .drv-next-card,
    .drv-day-card,
    .drv-revenue-card { min-height:315px !important; }

    .drv-card-head {
      min-height:22px !important;
      margin-bottom:8px !important;
      font-size:11px !important;
    }
    .drv-card-head > span { min-width:0 !important; }

    .drv-next-layout {
      grid-template-columns:100px minmax(0,1fr) !important;
      gap:14px !important;
    }
    .drv-next-time strong { font-size:31px !important; }
    .drv-next-route { min-width:0 !important; }
    .drv-next-route strong,
    .drv-day-row span,
    .drv-plan-row > span,
    .drv-message-row div:nth-child(2) span {
      overflow:hidden !important;
      text-overflow:ellipsis !important;
    }

    .drv-day-list { min-width:0 !important; }
    .drv-day-row {
      grid-template-columns:40px minmax(0,1fr) 38px 54px !important;
      min-width:0 !important;
      padding:7px 0 !important;
    }

    .drv-plan-row {
      grid-template-columns:102px minmax(0,1fr) 40px 25px !important;
      min-width:0 !important;
    }

    .drv-message-row {
      grid-template-columns:32px minmax(0,1fr) 38px !important;
    }

    .drv-rating-bars { margin-left:120px !important; }

    .shortcut-grid {
      grid-template-columns:repeat(4,minmax(0,1fr)) !important;
      gap:6px !important;
    }
    .shortcut-grid b { width:46px !important; height:46px !important; }
  
}

  /* Tablette : dashboard lisible sans supprimer les contrôles du header */
  @media (min-width:701px) and (max-width:1100px) {
    .drv-header-kpi {   } .drv-header-kpi strong {  }
    .drv-content {   } .drv-tabs {   left:auto !important;       } .drv-side-logo {  } .drv-tab { width:auto !important;       } .drv-tab.active {   } .drv-dashboard-grid-top {  } .drv-revenue-card {  } .drv-dashboard-grid-mid,.drv-dashboard-grid-bottom {  }
  

    html, body { overflow-x:hidden !important; }

    .drv-header {
      height:72px !important;
      min-height:72px !important;
      padding:0 16px !important;
    }

    .drv-header > .drv-brand-mark {
      display:grid !important;
      width:42px !important;
      height:42px !important;
      flex:0 0 42px !important;
      font-size:17px !important;
    }

    .drv-header-title strong { font-size:16px !important; }
    .drv-header-title span { font-size:10px !important; }

    .drv-header-live {
      margin-left:auto !important;
    }

    .drv-header-kpi {
      
      
    }

    .drv-header-kpi small {  }
    .drv-header-kpi strong {  }

    .drv-header-datetime { display:block !important; font-size:9px !important; }
    .drv-header-datetime strong { font-size:10px !important; }

    .drv-tabs {
      position:sticky !important;
      top:0 !important;
      width:100% !important;
      height:56px !important;
      min-height:56px !important;
      padding:0 6px !important;
      flex-direction:row !important;
      align-items:stretch !important;
      overflow-x:auto !important;
      overflow-y:hidden !important;
      z-index:20 !important;
    }

    .drv-side-logo { display:none !important; }

    .drv-tab {
      min-width:86px !important;
      min-height:56px !important;
      flex:0 0 auto !important;
      padding:7px 8px !important;
      flex-direction:column !important;
      justify-content:center !important;
      gap:3px !important;
      border-left:0 !important;
      border-bottom:3px solid transparent !important;
      border-radius:0 !important;
      font-size:9px !important;
    }

    .drv-tab.active {
      border-left:0 !important;
      border-bottom-color:#e0b866 !important;
    }

    .drv-tab-icon svg { width:17px !important; height:17px !important; }

    .drv-content {
      margin-left:0 !important;
      padding:0 14px 26px !important;
    }

    .drv-dashboard {
      max-width:none !important;
      padding:12px 0 28px !important;
    }

    .drv-dashboard-grid-top {
      
      gap:10px !important;
    }

    .drv-next-card,
    .drv-day-card {
      min-height:315px !important;
    }

    .drv-revenue-card {
      grid-column:1 / -1 !important;
      min-height:270px !important;
    }

    .drv-dashboard-grid-mid,
    .drv-dashboard-grid-bottom {
      grid-template-columns:repeat(2,minmax(0,1fr)) !important;
      gap:10px !important;
    }

    .drv-dashboard-grid-mid,
    .drv-dashboard-grid-bottom { margin-top:10px !important; }

    .drv-dashboard .drv-card {
      min-width:0 !important;
      overflow:hidden !important;
    }
  

    .drv-header-back { display:flex !important; }
    .drv-header > div[style*="position: relative"] { display:block !important; }
    .drv-header-kpi { min-width:78px !important; padding:0 7px !important; }
    .drv-header-kpi small { font-size:7px !important; }
    .drv-header-kpi strong { font-size:14px !important; }
    .drv-dashboard-grid-top { grid-template-columns:repeat(2,minmax(0,1fr)) !important; }
    .drv-dashboard-grid-mid,.drv-dashboard-grid-bottom { grid-template-columns:repeat(2,minmax(0,1fr)) !important; }
  
}

  /* ================================================================
     APT — PARITÉ MOBILE / TABLETTE / DESKTOP DU TABLEAU DE BORD
     Le mobile affiche exactement les mêmes cartes que le PC,
     empilées sur une colonne (aucune section masquée).
     ================================================================ */
  

  /* Logo officiel du site dans l'espace chauffeur (header + sidebar). */
  .drv-brand-mark { border:0 !important; border-radius:8px !important; overflow:hidden; background:#03070d; }
  .drv-brand-mark img { width:100%; height:100%; object-fit:contain; }
  .drv-side-logo img { max-width:100%; height:auto; object-fit:contain; padding:0 6px; }

  /* Bouton "activer les notifications" du header (visible tant que la
     permission n'est pas accordée). */
  .drv-header-pushbtn { display:inline-flex; align-items:center; gap:5px; height:34px; padding:0 10px; border:1px solid #c99b4a; border-radius:8px; background:linear-gradient(135deg,#C9A84C,#E8C96D); color:#07101a; font-size:11.5px; font-weight:800; white-space:nowrap; cursor:pointer; flex:0 0 auto; }
  .drv-header-pushbtn:disabled { opacity:.6; cursor:progress; }

  /* Rangée d'actions rapides ("Activer les notifications" / "Retour au
     site") affichée en haut du tableau de bord, juste avant la carte
     "Prochaine course" — indépendante du header pour ne pas hériter de ses
     règles responsive (qui masquent certains éléments sur mobile). */
  .drv-quick-actions { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:12px; }
  .drv-quick-btn { display:inline-flex; align-items:center; gap:6px; height:36px; padding:0 14px; border-radius:9px; font-size:12.5px; font-weight:700; white-space:nowrap; cursor:pointer; text-decoration:none; }
  .drv-quick-btn svg { width:15px; height:15px; flex-shrink:0; }
  .drv-quick-btn-notif { border:1px solid #c99b4a; background:linear-gradient(135deg,#C9A84C,#E8C96D); color:#07101a; }
  .drv-quick-btn-notif:disabled { cursor:progress; opacity:.7; }
  .drv-quick-btn-notif.is-done { background:rgba(34,197,94,.12); border:1px solid rgba(34,197,94,.4); color:#16a34a; cursor:default; opacity:1; }
  .drv-quick-btn-back { border:1px solid rgba(148,163,184,.4); background:#0d1720; color:#cbd5e1; }
  .drv-quick-btn-back:hover { border-color:#c99b4a; color:#e0b866; }
  

  /* Mobile : on conserve « Retour au site » et l'activation des notifications
     (uniquement l'icône pour tenir dans la barre). */
  @media (max-width:700px) {
    html,body { overflow-y:auto !important; -webkit-overflow-scrolling:touch !important; touch-action:pan-y !important; } .drv-root { min-height:100svh !important; padding-bottom:68px !important; } .drv-header { position:sticky !important; top:0 !important; z-index:50;    } .drv-brand-mark { width:34px !important; height:34px !important; flex-basis:34px !important; font-size:16px; } .drv-header-title strong { font-size:12px !important; } .drv-header-title span { font-size:8px !important; } .drv-header-live {    } .drv-header-kpi,.drv-header-datetime,.drv-header-back { display:none !important; } .drv-header-bell {   border:0 !important; background:transparent !important; } .drv-tabs { display:none !important; } .drv-main { min-height:0 !important; } .drv-content {   min-height:0 !important; } .drv-dashboard {  } .drv-dashboard-grid-top {    } .drv-next-card {    } .drv-next-layout {   padding-bottom:9px; } .drv-next-time strong { font-size:24px; } .drv-next-time span { font-size:8px; margin-top:5px; } .drv-next-route { padding-left:10px; gap:8px; } .drv-next-route strong { font-size:10px; } .drv-next-route small { font-size:7px; } .drv-next-meta { font-size:7px; padding:8px 0; gap:5px; } .drv-next-meta small { font-size:6.5px; } .drv-btn-start,.drv-btn-detail { min-height:31px; font-size:7px; padding:6px; } .drv-card-head { font-size:9px; margin-bottom:8px; } .drv-revenue-card,.drv-dashboard-grid-mid,.drv-dashboard-grid-bottom { display:none !important; } .drv-day-card {    } .drv-day-row { grid-template-columns:38px minmax(0,1fr) 34px 45px; padding:6px 0; font-size:7.5px; } .drv-day-row em { font-size:6px; } .drv-mobile-stats {     } .drv-mobile-stats div { background:#07121b; border:1px solid rgba(116,146,169,.2); border-radius:8px; padding:8px 4px; text-align:center; } .drv-mobile-stats b { display:block; color:#f4f5f3; font-size:12px; } .drv-mobile-stats span { display:block; color:#7e8993; font-size:6px; margin-top:3px; letter-spacing:.04em; }
    .drv-mobile-nav { position:fixed; display:grid; grid-template-columns:repeat(5,1fr); left:0; right:0; bottom:0;  padding-bottom:env(safe-area-inset-bottom,0); background:#050a10; border-top:1px solid rgba(201,155,74,.22); z-index:100; } .drv-mobile-nav button { position:relative; border:0; background:transparent; color:#88939e; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; font-size:7px; font-weight:700; } .drv-mobile-nav button.active { color:#e0b866; } .drv-mobile-nav svg { width:18px; height:18px; } .drv-mobile-nav b { position:absolute; top:8px; margin-left:17px; min-width:13px; height:13px; display:grid; place-items:center; border-radius:8px; background:#164b88; color:#fff; font-size:7px; }
    .drv-body { overflow:visible !important; -webkit-overflow-scrolling:auto !important; touch-action:auto !important; padding:8px 0 28px !important; } .drv-body * { touch-action:auto; }
  

    .drv-mobile-drawer-backdrop { position:fixed; inset:0; z-index:110; display:block; background:rgba(0,0,0,.62); }
    .drv-mobile-drawer { position:fixed; top:0; right:0; bottom:0; z-index:111; display:flex; width:min(86vw,340px); flex-direction:column; gap:5px; overflow-y:auto; padding:calc(env(safe-area-inset-top,0px) + 18px) 14px calc(env(safe-area-inset-bottom,0px) + 84px); background:#050a10; border-left:1px solid rgba(201,155,74,.45); box-shadow:-18px 0 40px rgba(0,0,0,.35); }
    .drv-mobile-drawer-head { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:0 4px 14px; margin-bottom:4px; border-bottom:1px solid rgba(201,155,74,.25); color:#e0b866; font-size:13px; font-weight:800; }
    .drv-mobile-drawer-close { width:34px; height:34px; border:1px solid rgba(201,155,74,.45); border-radius:7px; background:#07101a; color:#e0b866; font-size:20px; cursor:pointer; }
    .drv-mobile-drawer button:not(.drv-mobile-drawer-close) { display:flex; align-items:center; gap:12px; min-height:48px; padding:10px 12px; border:1px solid transparent; border-radius:7px; background:transparent; color:#b9c1ca; font-size:12px; font-weight:700; text-align:left; cursor:pointer; }
    .drv-mobile-drawer button.active { color:#fff; background:rgba(201,155,74,.14); border-color:rgba(201,155,74,.35); }
    .drv-mobile-drawer svg { width:19px; height:19px; flex:0 0 auto; color:#e0b866; }
    .drv-mobile-drawer .drv-tab-count { margin-left:auto; }
  

    .drv-identity-switcher { display:block !important; flex:0 0 auto !important; }
    .drv-identity-switcher > button { width:auto !important; height:32px !important; min-height:32px !important; padding:5px 9px !important; font-size:11px !important; border:1px solid #c99b4a !important; background:#07101a !important; color:#e0b866 !important; }
  

 #root { overflow:visible !important; } .drv-root { overflow:visible !important; } .drv-main,.drv-content { overflow:visible !important; } 

    .drv-header {
      height:58px !important;
      min-height:58px !important;
      padding:7px 10px !important;
      gap:7px !important;
    }

    .drv-header > .drv-brand-mark {
      display:grid !important;
      width:34px !important;
      height:34px !important;
      flex:0 0 34px !important;
      font-size:15px !important;
    }

    /* Dans la maquette téléphone, le nom n'occupe pas la barre du haut :
       le bouton hamburger reste juste à côté du logo. */
    .drv-header-title { display:none !important; }

    .drv-header-live {
      margin-left:auto !important;
      padding:4px 7px !important;
      font-size:7px !important;
    }

    .drv-header-bell {
      width:31px !important;
      height:31px !important;
    }

    .drv-content {
      margin:0 !important;
      padding:0 10px !important;
    }

    .drv-dashboard {
      width:100% !important;
      padding:9px 0 22px !important;
    }

    .drv-dashboard-grid-top {
      display:flex !important;
      flex-direction:column !important;
      gap:8px !important;
    }

    .drv-next-card {
      order:0 !important;
      min-height:0 !important;
      padding:11px !important;
    }

    .drv-mobile-stats {
      order:1 !important;
      
      grid-template-columns:repeat(3,minmax(0,1fr)) !important;
      gap:6px !important;
    }

    .drv-day-card {
      order:2 !important;
      min-height:0 !important;
      padding:10px !important;
    }

    .drv-revenue-card,
    .drv-dashboard-grid-mid,
    .drv-dashboard-grid-bottom {
      display:none !important;
    }

    .drv-next-layout {
      grid-template-columns:70px minmax(0,1fr) !important;
      gap:9px !important;
    }

    .drv-next-route { min-width:0 !important; }
    .drv-next-route strong {
      overflow:hidden !important;
      text-overflow:ellipsis !important;
      white-space:nowrap !important;
    }

    .drv-next-meta {
      grid-template-columns:1.25fr 1fr .65fr !important;
    }

    .drv-btns {
      gap:7px !important;
    }

    .drv-mobile-nav {
      height:68px !important;
    }
  

    .drv-mobile-stats { display:none !important; }
    .drv-dashboard-grid-top,
    .drv-dashboard-grid-mid,
    .drv-dashboard-grid-bottom {
      display:grid !important;
      grid-template-columns:minmax(0,1fr) !important;
      gap:8px !important;
    }
    .drv-dashboard-grid-top > *,
    .drv-dashboard-grid-mid > *,
    .drv-dashboard-grid-bottom > * {
      grid-column:auto !important;
      min-width:0 !important;
      min-height:0 !important;
    }
    .drv-revenue-card {
      display:block !important;
      order:3 !important;
      min-height:0 !important;
      padding:11px !important;
    }
    .drv-dashboard-grid-mid,
    .drv-dashboard-grid-bottom { margin-top:8px !important; }
  

    .drv-quick-btn { height:33px; padding:0 11px; font-size:11.5px; }
  

    .drv-header-back { display:inline-flex !important; width:31px !important; height:31px !important; padding:0 !important; justify-content:center !important; }
    .drv-header-back .drv-header-back-label { display:none !important; }
    .drv-header-pushbtn { height:31px !important; padding:0 8px !important; font-size:10px !important; }
  
}




/* ── Tableau de bord : liste à icônes (style Nova) ─────────────────────── */
.drv-dash-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }

.drv-dash-row {
  display: flex; align-items: center; gap: 12px;
  width: 100%; text-align: left; border: 0; cursor: pointer;
  background: linear-gradient(145deg, #0d1720, #070d13);
  border: 1px solid rgba(201, 155, 74, 0.18);
  border-radius: 12px;
  padding: 12px 14px;
  color: #f6f0e5;
  transition: border-color .15s ease, background .15s ease;
}
.drv-dash-row:hover { border-color: rgba(201, 155, 74, 0.4); }
.drv-dash-row:disabled { opacity: 0.6; cursor: default; }

.drv-dash-ico {
  flex: 0 0 auto;
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
}
.drv-dash-ico svg { width: 18px; height: 18px; }

.drv-dash-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.drv-dash-txt strong { font-size: 14px; font-weight: 600; color: #f6f0e5; }
.drv-dash-txt span { font-size: 12.5px; color: #9aa3ad; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.drv-dash-plus { flex: 0 0 auto; font-size: 16px; color: #e0b866; opacity: 0.8; }

.drv-dash-badge {
  flex: 0 0 auto; min-width: 20px; height: 20px; padding: 0 6px;
  border-radius: 999px; background: #e11d48; color: #fff;
  font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;
}

.drv-dash-map {
  border: 1px solid rgba(201, 155, 74, 0.18);
  border-radius: 12px;
  background: #070d13;
}
`;
