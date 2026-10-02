import { drawRoundedRect } from './laptopDemoRenderers';

/**
 * Audio Synthesizer & Beat Deck Demo
 */
export function renderSoundDeckDemo(
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
    ctx.fillText('Booting <AudioMixer>...', previewLeft + 22, 135);
    return;
  }

  const mixerY = 38;
  const mixerH = 196;

  // Studio hardware chassis
  drawRoundedRect(
    ctx,
    previewLeft,
    mixerY,
    previewW,
    mixerH,
    10,
    '#0b0f17',
    'rgba(245, 158, 11, 0.35)'
  );

  // Top Master Status & BPM
  if (typedLineCount >= 4) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(previewLeft + 16, mixerY + 18, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('REC', previewLeft + 26, mixerY + 21);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(isInteracted ? '132.0 BPM' : '128.0 BPM', previewLeft + previewW - 65, mixerY + 21);
  }

  // Waveform oscilloscope (line >= 5)
  if (typedLineCount >= 5) {
    const waveY = mixerY + 40;
    drawRoundedRect(ctx, previewLeft + 12, waveY, previewW - 24, 34, 5, '#04070d', 'rgba(255, 255, 255, 0.08)');

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    const waveW = previewW - 24;
    for (let x = 0; x < waveW; x += 3) {
      const freq = isInteracted ? 0.24 : 0.16;
      const amp = isInteracted ? 11 : 8;
      const wy = waveY + 17 + Math.sin(x * freq) * amp;
      if (x === 0) ctx.moveTo(previewLeft + 12 + x, wy);
      else ctx.lineTo(previewLeft + 12 + x, wy);
    }
    ctx.stroke();
  }

  // 7-Band Equalizer (line >= 6)
  if (typedLineCount >= 6) {
    const eqY = mixerY + 86;
    const barCount = 7;
    const barWidth = 14;
    const gap = 8;
    const totalW = barCount * barWidth + (barCount - 1) * gap;
    const startX = previewLeft + (previewW - totalW) / 2;

    const baseHeights = [28, 42, 58, 70, 52, 38, 22];
    const peakHeights = [38, 56, 74, 82, 68, 52, 34];
    const heights = isInteracted ? peakHeights : baseHeights;

    for (let i = 0; i < barCount; i++) {
      const bx = startX + i * (barWidth + gap);
      const bh = heights[i]!;
      const by = eqY + 85 - bh;

      // Meter background slot
      drawRoundedRect(ctx, bx, eqY, barWidth, 85, 3, '#161e2e');

      // Colored meter fill (green to amber)
      const meterGrad = ctx.createLinearGradient(bx, eqY + 85, bx, by);
      meterGrad.addColorStop(0, '#10b981');
      meterGrad.addColorStop(0.65, '#f59e0b');
      meterGrad.addColorStop(1, '#ef4444');
      drawRoundedRect(ctx, bx, by, barWidth, bh, 3, meterGrad);
    }
  }

  // Master Volume Output Tag
  if (typedLineCount >= 7) {
    drawRoundedRect(
      ctx,
      previewLeft + 12,
      mixerY + mixerH - 22,
      previewW - 24,
      14,
      3,
      'rgba(245, 158, 11, 0.12)'
    );
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 7.5px monospace';
    ctx.fillText(isInteracted ? 'MASTER: +4.2dB (LIMITER ACTIVE)' : 'MASTER: +0.0dB (OPTIMAL)', previewLeft + 18, mixerY + mixerH - 12);
  }
}

/**
 * AI Neural Code Streaming Terminal Demo
 */
export function renderAgentConsoleDemo(
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
    ctx.fillText('Starting <AgentStream>...', previewLeft + 22, 135);
    return;
  }

  const termY = 38;
  const termH = 196;

  // Terminal Window
  drawRoundedRect(
    ctx,
    previewLeft,
    termY,
    previewW,
    termH,
    10,
    '#080c14',
    'rgba(168, 85, 247, 0.4)'
  );

  // Top Agent Header
  if (typedLineCount >= 4) {
    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('✨ ANTIGRAVITY AGENT', previewLeft + 12, termY + 18);

    drawRoundedRect(ctx, previewLeft + previewW - 48, termY + 8, 38, 14, 3, 'rgba(168, 85, 247, 0.15)');
    ctx.fillStyle = '#e9d5ff';
    ctx.font = 'bold 7.5px monospace';
    ctx.fillText('v2.0', previewLeft + previewW - 40, termY + 18);
  }

  // Thought Bubble (line >= 5)
  if (typedLineCount >= 5) {
    drawRoundedRect(
      ctx,
      previewLeft + 10,
      termY + 30,
      previewW - 20,
      32,
      6,
      'rgba(255, 255, 255, 0.04)',
      'rgba(255, 255, 255, 0.1)'
    );
    ctx.fillStyle = '#94a3b8';
    ctx.font = '7.5px monospace';
    ctx.fillText('THOUGHT STREAM:', previewLeft + 16, termY + 42);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '8px monospace';
    ctx.fillText(isInteracted ? '✓ Optimization patch ready' : 'Analyzing AST graph...', previewLeft + 16, termY + 54);
  }

  // Code Diff Output (line >= 6)
  if (typedLineCount >= 6) {
    const diffY = termY + 70;
    drawRoundedRect(ctx, previewLeft + 10, diffY, previewW - 20, 56, 5, '#04070d');

    ctx.fillStyle = '#475569';
    ctx.font = '7.5px monospace';
    ctx.fillText('patch/engine.rs', previewLeft + 16, diffY + 14);

    ctx.fillStyle = '#f43f5e';
    ctx.font = '8px monospace';
    ctx.fillText('- let latency = compute_heavy();', previewLeft + 16, diffY + 28);

    ctx.fillStyle = '#34d399';
    ctx.font = '8px monospace';
    ctx.fillText('+ let latency = zero_copy_cache();', previewLeft + 16, diffY + 42);
  }

  // Verification Badge & Build Status (line >= 7)
  if (typedLineCount >= 7) {
    const statY = termY + 136;
    drawRoundedRect(
      ctx,
      previewLeft + 10,
      statY,
      previewW - 20,
      44,
      6,
      isInteracted ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
      isInteracted ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.4)'
    );

    ctx.fillStyle = isInteracted ? '#34d399' : '#818cf8';
    ctx.font = 'bold 8.5px monospace';
    ctx.fillText(isInteracted ? '✓ 10/10 UNIT TESTS PASSED' : '● RUNNING CARGO TEST...', previewLeft + 16, statY + 18);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '7.5px monospace';
    ctx.fillText(isInteracted ? 'Deployed to Edge: 4ms global latency' : 'Validating memory boundaries...', previewLeft + 16, statY + 34);
  }
}

/**
 * Indie App Showcase Card Demo
 */
export function renderProductShowcaseDemo(
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
    ctx.fillText('Rendering <ShowcaseCard>...', previewLeft + 22, 135);
    return;
  }

  const cardY = 38;
  const cardH = 196;

  // Card Chassis
  drawRoundedRect(
    ctx,
    previewLeft,
    cardY,
    previewW,
    cardH,
    10,
    '#0d111a',
    'rgba(245, 158, 11, 0.4)'
  );

  // App Icon Graphic (line >= 4)
  if (typedLineCount >= 4) {
    const iconW = 38;
    const iconX = previewLeft + 14;
    const iconY = cardY + 16;
    const iconGrad = ctx.createLinearGradient(iconX, iconY, iconX + iconW, iconY + iconW);
    iconGrad.addColorStop(0, '#f59e0b');
    iconGrad.addColorStop(1, '#ea580c');
    drawRoundedRect(ctx, iconX, iconY, iconW, iconW, 8, iconGrad);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('⚡', iconX + 8, iconY + 26);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('TurboDev CLI', iconX + 46, iconY + 18);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px monospace';
    ctx.fillText('Developer Suite · v2.4', iconX + 46, iconY + 31);
  }

  // Rating & Stats (line >= 5)
  if (typedLineCount >= 5) {
    const statY = cardY + 66;
    drawRoundedRect(ctx, previewLeft + 14, statY, previewW - 28, 24, 5, '#161d2b');

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 8.5px monospace';
    ctx.fillText('★ 4.98', previewLeft + 22, statY + 16);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px monospace';
    ctx.fillText('|  18.4k Installs', previewLeft + 66, statY + 16);
  }

  // Terminal Snippet (line >= 6)
  if (typedLineCount >= 6) {
    const termY = cardY + 98;
    drawRoundedRect(ctx, previewLeft + 14, termY, previewW - 28, 26, 5, '#05070c', 'rgba(255, 255, 255, 0.08)');

    ctx.fillStyle = '#38bdf8';
    ctx.font = '8px monospace';
    ctx.fillText('$', previewLeft + 22, termY + 16);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '8px monospace';
    ctx.fillText('pnpm add -g turbodev', previewLeft + 32, termY + 16);
  }

  // Action Button (line >= 7)
  if (typedLineCount >= 7) {
    const btnY = cardY + 136;
    const btnW = previewW - 28;
    const btnH = 30;

    if (isInteracted) {
      drawRoundedRect(ctx, previewLeft + 14, btnY, btnW, btnH, 6, '#10b981');
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓ Installed Successfully', previewLeft + previewW / 2, btnY + 19);
      ctx.textAlign = 'left';
    } else {
      const btnGrad = ctx.createLinearGradient(previewLeft + 14, btnY, previewLeft + 14 + btnW, btnY);
      btnGrad.addColorStop(0, '#f59e0b');
      btnGrad.addColorStop(1, '#ea580c');
      drawRoundedRect(ctx, previewLeft + 14, btnY, btnW, btnH, 6, btnGrad);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Install Package →', previewLeft + previewW / 2, btnY + 19);
      ctx.textAlign = 'left';
    }
  }
}
