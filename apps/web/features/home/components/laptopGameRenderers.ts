import { drawRoundedRect } from './laptopDemoRenderers';

/**
 * Retro Space Shooter / Arcade Game Demo
 */
export function renderSpaceArcadeDemo(
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
    ctx.fillText('Loading <ArcadeScreen>...', previewLeft + 20, 135);
    return;
  }

  const gameY = 38;
  const gameH = 196;

  // Retro arcade CRT frame
  drawRoundedRect(
    ctx,
    previewLeft,
    gameY,
    previewW,
    gameH,
    10,
    '#050814',
    'rgba(56, 189, 248, 0.4)'
  );

  // Background Starfield
  const stars: Array<[number, number]> = [
    [15, 20], [60, 45], [110, 15], [150, 50], [30, 90],
    [95, 110], [140, 95], [45, 150], [120, 160], [80, 180]
  ];
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  for (const [sx, sy] of stars) {
    ctx.fillRect(previewLeft + (sx * previewW) / 180, gameY + sy, 1.5, 1.5);
  }

  // Step 1: Scoreboard HUD (line >= 4)
  if (typedLineCount >= 4) {
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('SCORE', previewLeft + 10, gameY + 16);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(isInteracted ? '14,700' : '14,200', previewLeft + 10, gameY + 30);

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('WAVE 03', previewLeft + previewW - 48, gameY + 16);
  }

  // Step 2: Space Invader Alien Fleet (line >= 5)
  if (typedLineCount >= 5) {
    const alienY = gameY + 45;
    const alienColors = ['#f43f5e', '#a855f7', '#ec4899', '#f59e0b', '#34d399'];
    for (let i = 0; i < 5; i++) {
      const ax = previewLeft + 16 + i * 32;
      const col = alienColors[i] || '#f43f5e';

      // Draw pixel alien
      ctx.fillStyle = col;
      drawRoundedRect(ctx, ax, alienY, 18, 12, 3, col);

      // Alien antennae & eyes
      ctx.fillRect(ax + 3, alienY - 3, 2, 3);
      ctx.fillRect(ax + 13, alienY - 3, 2, 3);
      ctx.fillStyle = '#050814';
      ctx.fillRect(ax + 4, alienY + 3, 3, 3);
      ctx.fillRect(ax + 11, alienY + 3, 3, 3);
    }
  }

  // Step 3: Laser Beams (line >= 6)
  if (typedLineCount >= 6) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(previewLeft + previewW / 2, gameY + 125);
    ctx.lineTo(previewLeft + previewW / 2, gameY + 65);
    ctx.stroke();

    // Laser glow
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(previewLeft + previewW / 2, gameY + 120);
    ctx.lineTo(previewLeft + previewW / 2, gameY + 70);
    ctx.stroke();
  }

  // Step 4: Player Fighter Ship (line >= 7)
  if (typedLineCount >= 7) {
    const shipX = previewLeft + previewW / 2;
    const shipY = gameY + 140;

    // Ship body
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(shipX, shipY);
    ctx.lineTo(shipX - 14, shipY + 22);
    ctx.lineTo(shipX + 14, shipY + 22);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(shipX, shipY + 12, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Engine thrusters glow
    const thrusterGrad = ctx.createLinearGradient(shipX, shipY + 22, shipX, shipY + 32);
    thrusterGrad.addColorStop(0, '#f59e0b');
    thrusterGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = thrusterGrad;
    ctx.fillRect(shipX - 6, shipY + 22, 12, 10);

    // Shield status
    drawRoundedRect(ctx, previewLeft + 12, gameY + 175, previewW - 24, 12, 3, '#1e293b');
    drawRoundedRect(
      ctx,
      previewLeft + 12,
      gameY + 175,
      (previewW - 24) * 0.85,
      12,
      3,
      '#10b981'
    );
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 7px monospace';
    ctx.fillText('SHIELD: 85%', previewLeft + 18, gameY + 184);
  }

  // Interactive reward overlay
  if (isInteracted) {
    const bannerY = gameY + 80;
    drawRoundedRect(
      ctx,
      previewLeft + 12,
      bannerY,
      previewW - 24,
      36,
      6,
      'rgba(16, 185, 129, 0.92)',
      '#34d399'
    );
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★ STAGE CLEAR! +500 PTS', previewLeft + previewW / 2, bannerY + 16);
    ctx.font = '8px monospace';
    ctx.fillText('BONUS MULTIPLIER x2', previewLeft + previewW / 2, bannerY + 28);
    ctx.textAlign = 'left';
  }
}

/**
 * Cyberpunk Synthwave Pong Game Demo
 */
export function renderNeonPongDemo(
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
    ctx.fillText('Connecting <SynthArena>...', previewLeft + 20, 135);
    return;
  }

  const arenaY = 38;
  const arenaH = 196;

  // Neon Arena Frame
  drawRoundedRect(
    ctx,
    previewLeft,
    arenaY,
    previewW,
    arenaH,
    10,
    '#090915',
    'rgba(236, 72, 153, 0.45)'
  );

  // Dashed center court line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(previewLeft + previewW / 2, arenaY + 10);
  ctx.lineTo(previewLeft + previewW / 2, arenaY + arenaH - 10);
  ctx.stroke();
  ctx.setLineDash([]);

  // Score HUD
  if (typedLineCount >= 4) {
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(isInteracted ? '08' : '07', previewLeft + previewW / 2 - 32, arenaY + 28);

    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('04', previewLeft + previewW / 2 + 14, arenaY + 28);
  }

  // Left Player Paddle
  if (typedLineCount >= 5) {
    const padLY = arenaY + 70;
    drawRoundedRect(
      ctx,
      previewLeft + 8,
      padLY,
      6,
      44,
      3,
      '#38bdf8'
    );
  }

  // Right AI Paddle
  if (typedLineCount >= 6) {
    const padRY = arenaY + 95;
    drawRoundedRect(
      ctx,
      previewLeft + previewW - 14,
      padRY,
      6,
      40,
      3,
      '#ec4899'
    );
  }

  // Neon Bouncing Ball with Glow & Particle Trail
  if (typedLineCount >= 7) {
    const ballX = isInteracted ? previewLeft + previewW - 24 : previewLeft + previewW / 2 + 10;
    const ballY = isInteracted ? arenaY + 115 : arenaY + 85;

    // Trail
    ctx.fillStyle = 'rgba(244, 63, 94, 0.3)';
    ctx.beginPath();
    ctx.arc(ballX - 10, ballY - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Ball
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(ballX, ballY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ballX - 1.5, ballY - 1.5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Bottom Speed Gauge
    drawRoundedRect(
      ctx,
      previewLeft + 12,
      arenaY + arenaH - 24,
      previewW - 24,
      14,
      4,
      'rgba(255, 255, 255, 0.06)'
    );
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 7.5px monospace';
    ctx.fillText(isInteracted ? '⚡ SMASH SHOT: 3.2x SPEED' : '● BALL VELOCITY: 2.4x', previewLeft + 18, arenaY + arenaH - 14);
  }
}

/**
 * 8-Bit Pixel Platformer Jump Game Demo
 */
export function renderPixelRunnerDemo(
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
    ctx.fillText('Spawning <Platformer>...', previewLeft + 20, 135);
    return;
  }

  const stageY = 38;
  const stageH = 196;

  // Sky Backdrop
  const skyGrad = ctx.createLinearGradient(previewLeft, stageY, previewLeft, stageY + stageH);
  skyGrad.addColorStop(0, '#1e1b4b');
  skyGrad.addColorStop(1, '#312e81');
  drawRoundedRect(ctx, previewLeft, stageY, previewW, stageH, 10, skyGrad, 'rgba(129, 140, 248, 0.35)');

  // Cloud layer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  drawRoundedRect(ctx, previewLeft + 18, stageY + 25, 42, 12, 6, 'rgba(255,255,255,0.2)');
  drawRoundedRect(ctx, previewLeft + previewW - 60, stageY + 35, 48, 14, 7, 'rgba(255,255,255,0.2)');

  // Ground Tiles (line >= 4)
  if (typedLineCount >= 4) {
    const groundY = stageY + stageH - 30;
    drawRoundedRect(ctx, previewLeft + 6, groundY, previewW - 12, 24, 4, '#15803d');
    drawRoundedRect(ctx, previewLeft + 6, groundY + 8, previewW - 12, 16, 2, '#78350f');
  }

  // Floating Blocks (line >= 5)
  if (typedLineCount >= 5) {
    const blockY = stageY + 90;
    // Brick Block
    drawRoundedRect(ctx, previewLeft + 40, blockY, 22, 22, 3, '#ea580c');
    ctx.fillStyle = '#fed7aa';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('?', previewLeft + 47, blockY + 16);

    // Coin Block
    drawRoundedRect(ctx, previewLeft + 66, blockY, 22, 22, 3, '#c2410c');
  }

  // Golden Coins (line >= 6)
  if (typedLineCount >= 6) {
    const coinY = isInteracted ? stageY + 60 : stageY + 68;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(previewLeft + 51, coinY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(previewLeft + 50, coinY - 1, 3, 0, Math.PI * 2);
    ctx.fill();

    if (isInteracted) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText('+100', previewLeft + 62, coinY + 3);
    }
  }

  // Hero Sprite Jumping (line >= 7)
  if (typedLineCount >= 7) {
    const heroX = previewLeft + 45;
    const heroY = isInteracted ? stageY + 115 : stageY + 130;

    // Cap & Head
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(heroX, heroY, 14, 5);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(heroX + 2, heroY + 5, 12, 8);

    // Blue Overalls
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(heroX, heroY + 13, 14, 10);

    // Shoes
    ctx.fillStyle = '#78350f';
    ctx.fillRect(heroX - 2, heroY + 23, 7, 5);
    ctx.fillRect(heroX + 9, heroY + 21, 7, 5);

    // Score Banner
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 8.5px monospace';
    ctx.fillText(isInteracted ? 'COINS: 05 ★' : 'COINS: 04', previewLeft + 14, stageY + 18);
  }
}
