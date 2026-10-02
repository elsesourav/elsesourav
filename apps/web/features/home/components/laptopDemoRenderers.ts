export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill?: string | CanvasGradient | CanvasPattern,
  stroke?: string | CanvasGradient | CanvasPattern
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

export function renderProfileDemo(
  ctx: CanvasRenderingContext2D,
  previewLeft: number,
  previewW: number,
  typedLineCount: number,
  isInteracted: boolean
) {
  if (typedLineCount < 3) {
    drawRoundedRect(ctx, previewLeft, 40, previewW, 190, 8, 'rgba(30, 41, 59, 0.2)');
    ctx.fillStyle = '#475569';
    ctx.font = '8px monospace';
    ctx.fillText('Compiling <Card>...', previewLeft + 30, 135);
    return;
  }

  // Step 1: Card container frame appears (line >= 3)
  const cardY = 38;
  const cardH = 196;
  drawRoundedRect(
    ctx,
    previewLeft,
    cardY,
    previewW,
    cardH,
    10,
    'rgba(15, 23, 42, 0.88)',
    'rgba(99, 102, 241, 0.35)'
  );

  // Step 2: Avatar graphic appears (line >= 4)
  if (typedLineCount >= 4) {
    const avX = previewLeft + previewW / 2;
    const avY = cardY + 28;
    const avGrad = ctx.createLinearGradient(avX - 16, avY - 16, avX + 16, avY + 16);
    avGrad.addColorStop(0, '#818cf8');
    avGrad.addColorStop(1, '#ec4899');
    ctx.fillStyle = avGrad;
    ctx.beginPath();
    ctx.arc(avX, avY, 17, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ES', avX, avY + 4);

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(avX + 12, avY + 12, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Step 3: Name & Role text appears (line >= 5)
  if (typedLineCount >= 5) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Else Sourav', previewLeft + previewW / 2, cardY + 66);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px sans-serif';
    ctx.fillText('Personal Software Studio', previewLeft + previewW / 2, cardY + 79);
  }

  // Step 4: Pro Badge appears (line >= 6)
  if (typedLineCount >= 6) {
    const badgeW = 86;
    const badgeX = previewLeft + (previewW - badgeW) / 2;
    drawRoundedRect(
      ctx,
      badgeX,
      cardY + 90,
      badgeW,
      16,
      8,
      'rgba(56, 189, 248, 0.12)',
      'rgba(56, 189, 248, 0.4)'
    );
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('● Verified Pro', previewLeft + previewW / 2, cardY + 101);
  }

  // Step 5: Connect Button appears (line >= 7)
  if (typedLineCount >= 7) {
    const btnW = previewW - 24;
    const btnX = previewLeft + 12;
    const btnY = cardY + 120;
    const btnH = 26;

    if (isInteracted) {
      drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 6, '#10b981');
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9.5px sans-serif';
      ctx.fillText('✓ Connected', previewLeft + previewW / 2, btnY + 16);

      // Extra dynamic metric added after interaction
      drawRoundedRect(
        ctx,
        btnX,
        btnY + 32,
        btnW,
        18,
        4,
        'rgba(245, 158, 11, 0.15)',
        'rgba(245, 158, 11, 0.4)'
      );
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText('★ 2.5k Followers (+1)', previewLeft + previewW / 2, btnY + 44);
    } else {
      const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY);
      btnGrad.addColorStop(0, '#6366f1');
      btnGrad.addColorStop(1, '#8b5cf6');
      drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 6, btnGrad);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9.5px sans-serif';
      ctx.fillText('Connect +', previewLeft + previewW / 2, btnY + 16);
    }
  }
  ctx.textAlign = 'left';
}

export function renderPaletteDemo(
  ctx: CanvasRenderingContext2D,
  previewLeft: number,
  previewW: number,
  typedLineCount: number,
  isInteracted: boolean
) {
  if (typedLineCount < 3) {
    drawRoundedRect(ctx, previewLeft, 40, previewW, 190, 8, 'rgba(30, 41, 59, 0.2)');
    ctx.fillStyle = '#475569';
    ctx.font = '8px monospace';
    ctx.fillText('Mounting <CommandMenu>...', previewLeft + 22, 135);
    return;
  }

  const menuY = 40;
  const menuH = 192;
  drawRoundedRect(
    ctx,
    previewLeft,
    menuY,
    previewW,
    menuH,
    8,
    'rgba(15, 23, 42, 0.92)',
    'rgba(56, 189, 248, 0.35)'
  );

  // Search Input
  if (typedLineCount >= 4) {
    drawRoundedRect(
      ctx,
      previewLeft + 8,
      menuY + 8,
      previewW - 16,
      24,
      5,
      'rgba(255, 255, 255, 0.05)',
      'rgba(255, 255, 255, 0.15)'
    );
    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px monospace';
    ctx.fillText('⌘', previewLeft + 15, menuY + 23);

    ctx.fillStyle = isInteracted ? '#67e8f9' : '#64748b';
    ctx.font = '8.5px monospace';
    ctx.fillText(isInteracted ? 'deploy --prod' : 'Search action...', previewLeft + 28, menuY + 23);
  }

  // Kbd shortcut
  if (typedLineCount >= 5) {
    drawRoundedRect(ctx, previewLeft + previewW - 40, menuY + 12, 28, 16, 3, '#1e293b');
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 7.5px monospace';
    ctx.fillText('⌘K', previewLeft + previewW - 35, menuY + 23);
  }

  // Item 1: Deploy
  if (typedLineCount >= 6) {
    const item1Y = menuY + 40;
    const bg = isInteracted ? 'rgba(99, 102, 241, 0.28)' : 'rgba(255, 255, 255, 0.04)';
    drawRoundedRect(ctx, previewLeft + 8, item1Y, previewW - 16, 26, 4, bg);
    ctx.font = '10px monospace';
    ctx.fillText('⚡', previewLeft + 14, item1Y + 17);
    ctx.fillStyle = '#ffffff';
    ctx.font = '8.5px sans-serif';
    ctx.fillText(isInteracted ? 'Deploying to Edge...' : 'Deploy Project', previewLeft + 30, item1Y + 16);

    if (isInteracted) {
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 7.5px monospace';
      ctx.fillText('● 100%', previewLeft + previewW - 36, item1Y + 16);
    }
  }

  // Item 2: AI Chat
  if (typedLineCount >= 7) {
    const item2Y = menuY + 72;
    drawRoundedRect(ctx, previewLeft + 8, item2Y, previewW - 16, 26, 4, 'rgba(255, 255, 255, 0.04)');
    ctx.font = '10px monospace';
    ctx.fillText('✨', previewLeft + 14, item2Y + 17);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '8.5px sans-serif';
    ctx.fillText('Antigravity AI Agent', previewLeft + 30, item2Y + 16);
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 7px monospace';
    ctx.fillText('v2.0', previewLeft + previewW - 28, item2Y + 16);
  }

  if (isInteracted) {
    const statY = menuY + 110;
    drawRoundedRect(
      ctx,
      previewLeft + 8,
      statY,
      previewW - 16,
      42,
      5,
      'rgba(16, 185, 129, 0.12)',
      'rgba(16, 185, 129, 0.35)'
    );
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 8.5px monospace';
    ctx.fillText('✓ Live Build Succeeded', previewLeft + 14, statY + 18);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '7.5px monospace';
    ctx.fillText('Latency: 12ms · Edge Global', previewLeft + 14, statY + 32);
  }
}

export function renderMetricsDemo(
  ctx: CanvasRenderingContext2D,
  previewLeft: number,
  previewW: number,
  typedLineCount: number,
  isInteracted: boolean
) {
  if (typedLineCount < 3) {
    drawRoundedRect(ctx, previewLeft, 40, previewW, 190, 8, 'rgba(30, 41, 59, 0.2)');
    ctx.fillStyle = '#475569';
    ctx.font = '8px monospace';
    ctx.fillText('Initializing <Monitor>...', previewLeft + 22, 135);
    return;
  }

  const monY = 38;
  const monH = 196;
  drawRoundedRect(
    ctx,
    previewLeft,
    monY,
    previewW,
    monH,
    10,
    'rgba(15, 23, 42, 0.92)',
    'rgba(16, 185, 129, 0.35)'
  );

  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(previewLeft + 16, monY + 16, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('SYSTEM MONITOR', previewLeft + 24, monY + 19);

  if (typedLineCount >= 4) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(isInteracted ? '100%' : '99.98%', previewLeft + 14, monY + 48);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 7.5px monospace';
    ctx.fillText('▲ Turbo Speed', previewLeft + 100, monY + 46);
  }

  if (typedLineCount >= 5) {
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    const pts = [
      [0, 20],
      [25, 14],
      [50, 18],
      [75, 8],
      [100, 12],
      [125, 4],
      [150, 8],
    ];
    for (let i = 0; i < pts.length; i++) {
      const pt = pts[i];
      if (!pt) continue;
      const px = previewLeft + 14 + (pt[0]! * (previewW - 28)) / 150;
      const py = monY + 60 + pt[1]!;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  if (typedLineCount >= 6) {
    const barY = monY + 96;
    const barW = previewW - 28;
    drawRoundedRect(ctx, previewLeft + 14, barY, barW, 6, 3, '#1e293b');
    const fillW = isInteracted ? barW : barW * 0.94;
    drawRoundedRect(ctx, previewLeft + 14, barY, fillW, 6, 3, '#10b981');
  }

  if (typedLineCount >= 7) {
    drawRoundedRect(
      ctx,
      previewLeft + 14,
      monY + 114,
      previewW - 28,
      20,
      4,
      'rgba(16, 185, 129, 0.12)',
      'rgba(16, 185, 129, 0.4)'
    );
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 8px monospace';
    ctx.fillText(
      isInteracted ? '● ALL SYSTEMS 60FPS' : '● Operational Live',
      previewLeft + 24,
      monY + 127
    );
  }

  if (isInteracted) {
    const stat2Y = monY + 144;
    drawRoundedRect(
      ctx,
      previewLeft + 14,
      stat2Y,
      previewW - 28,
      38,
      5,
      'rgba(99, 102, 241, 0.15)',
      'rgba(99, 102, 241, 0.4)'
    );
    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('⚡ 0ms Frame Drops', previewLeft + 22, stat2Y + 16);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '7.5px monospace';
    ctx.fillText('Power: Ultra Low Profile', previewLeft + 22, stat2Y + 29);
  }
}
