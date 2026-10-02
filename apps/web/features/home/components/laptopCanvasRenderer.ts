import {
  drawRoundedRect,
  renderProfileDemo,
  renderPaletteDemo,
  renderMetricsDemo,
} from './laptopDemoRenderers';
import {
  renderSpaceArcadeDemo,
  renderNeonPongDemo,
  renderPixelRunnerDemo,
} from './laptopGameRenderers';
import {
  renderSoundDeckDemo,
  renderAgentConsoleDemo,
  renderProductShowcaseDemo,
} from './laptopToolRenderers';

export type SnippetType =
  | 'profile'
  | 'palette'
  | 'metrics'
  | 'space-arcade'
  | 'neon-pong'
  | 'pixel-runner'
  | 'sound-deck'
  | 'agent-console'
  | 'product-showcase';

export interface CodeSnippet {
  id: string;
  filename: string;
  lines: string[];
  type: SnippetType;
}

export const SNIPPETS: CodeSnippet[] = [
  {
    id: 'space-arcade',
    filename: 'SpaceArcade.tsx',
    lines: [
      'export function SpaceArcade() {',
      '  return (',
      '    <ArcadeScreen theme="retro">',
      '      <ScoreBoard pts={14200} />',
      '      <AlienGrid wave={3} alive={5} />',
      '      <LaserBeam speed="turbo" />',
      '      <FighterShip x={50} shield />',
      '    </ArcadeScreen>',
      '  );',
      '}',
    ],
    type: 'space-arcade',
  },
  {
    id: 'profile',
    filename: 'Profile.tsx',
    lines: [
      'export function Profile() {',
      '  return (',
      '    <Card variant="glass">',
      '      <Avatar src="me.png" />',
      '      <h4>Else Sourav</h4>',
      '      <Badge>Fullstack Pro</Badge>',
      '      <Button>Connect +</Button>',
      '    </Card>',
      '  );',
      '}',
    ],
    type: 'profile',
  },
  {
    id: 'neon-pong',
    filename: 'NeonPong.tsx',
    lines: [
      'export function NeonPong() {',
      '  return (',
      '    <SynthArena mode="vs-ai">',
      '      <ScoreHUD p1={7} p2={4} />',
      '      <Paddle side="left" pos={45} />',
      '      <Paddle side="right" pos={60} />',
      '      <NeonBall glow="#f43f5e" />',
      '    </SynthArena>',
      '  );',
      '}',
    ],
    type: 'neon-pong',
  },
  {
    id: 'sound-deck',
    filename: 'SoundDeck.tsx',
    lines: [
      'export function SoundDeck() {',
      '  return (',
      '    <AudioMixer bpm={128}>',
      '      <BpmCounter status="live" />',
      '      <Waveform type="sine" hz={432} />',
      '      <Equalizer bars={7} peak />',
      '      <FaderKnob db={+4.2} />',
      '    </AudioMixer>',
      '  );',
      '}',
    ],
    type: 'sound-deck',
  },
  {
    id: 'palette',
    filename: 'Palette.tsx',
    lines: [
      'export function Palette() {',
      '  return (',
      '    <CommandMenu neon>',
      '      <SearchInput icon="⌘" />',
      '      <Kbd>Cmd + K</Kbd>',
      '      <Item icon="⚡" text="Deploy" />',
      '      <Item icon="✨" text="AI Chat" />',
      '    </CommandMenu>',
      '  );',
      '}',
    ],
    type: 'palette',
  },
  {
    id: 'pixel-runner',
    filename: 'PixelRunner.tsx',
    lines: [
      'export function PixelRunner() {',
      '  return (',
      '    <Platformer stage="sky">',
      '      <GroundTiles flora="moss" />',
      '      <FloatingBlock type="mystery" />',
      '      <CoinCluster count={5} />',
      '      <HeroSprite state="jump" />',
      '    </Platformer>',
      '  );',
      '}',
    ],
    type: 'pixel-runner',
  },
  {
    id: 'agent-console',
    filename: 'AgentConsole.tsx',
    lines: [
      'export function AgentConsole() {',
      '  return (',
      '    <AgentStream model="v2">',
      '      <ThoughtBubble state="thinking" />',
      '      <CodePatch file="engine.rs" />',
      '      <TestRunner pass={10} fail={0} />',
      '      <DeployStatus cloud="edge" />',
      '    </AgentStream>',
      '  );',
      '}',
    ],
    type: 'agent-console',
  },
  {
    id: 'metrics',
    filename: 'Metrics.tsx',
    lines: [
      'export function Metrics() {',
      '  return (',
      '    <Monitor live>',
      '      <Stat val="99.9%" />',
      '      <Sparkline trend="up" />',
      '      <Progress bar={94} />',
      '      <Badge>Operational</Badge>',
      '    </Monitor>',
      '  );',
      '}',
    ],
    type: 'metrics',
  },
  {
    id: 'product-showcase',
    filename: 'ProductShowcase.tsx',
    lines: [
      'export function ProductShowcase() {',
      '  return (',
      '    <ShowcaseCard variant="store">',
      '      <AppIcon glyph="⚡" color="amber" />',
      '      <AppMeta title="TurboDev" ver="v2.4" />',
      '      <TerminalSnippet run="pnpm add" />',
      '      <InstallBtn variant="glow" />',
      '    </ShowcaseCard>',
      '  );',
      '}',
    ],
    type: 'product-showcase',
  },
];

export function drawEditor(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  text: string,
  filename: string,
  snippetIdx: number,
  isHolding: boolean,
  isInteracted: boolean
) {
  const splitX = 215;

  // 1. Overall Dark IDE Canvas Background
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, W, H);

  // 2. macOS Window Header Bar
  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, W, 22);

  // Window Control Dots
  ctx.fillStyle = '#ff5f56';
  ctx.beginPath();
  ctx.arc(12, 11, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffbd2e';
  ctx.beginPath();
  ctx.arc(21, 11, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#27c93f';
  ctx.beginPath();
  ctx.arc(30, 11, 3.2, 0, Math.PI * 2);
  ctx.fill();

  // Active Code Tab
  ctx.fillStyle = '#0e131d';
  ctx.fillRect(40, 2, 88, 20);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('⚛', 46, 15);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '9px monospace';
  ctx.fillText(filename, 58, 15);

  // Live Preview Window Header on Right
  drawRoundedRect(ctx, splitX + 6, 4, W - splitX - 12, 14, 3, '#101522');
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(splitX + 14, 11, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#64748b';
  ctx.font = '8px monospace';
  ctx.fillText('preview.dev:3000', splitX + 22, 14);

  // Split Divider Line
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(splitX, 22);
  ctx.lineTo(splitX, H);
  ctx.stroke();

  // 3. Left Side: Multi-Line Code Editor
  const lines = text.split('\n');
  const startY = 38;
  const lineHeight = 17;

  ctx.font = '9.5px monospace';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const y = startY + i * lineHeight;

    // Line number
    ctx.fillStyle = '#334155';
    ctx.fillText(String(i + 1).padStart(2, ' '), 6, y);

    // Syntax coloring parser
    let cursorX = 26;
    const tokens = line.split(
      /(<\/?[A-Za-z0-9]+|class="[^"]*"|variant="[^"]*"|status="[^"]*"|icon="[^"]*"|text="[^"]*"|src="[^"]*"|val="[^"]*"|bar=\{[0-9]+\}|export|function|return|checked|neon|live|shield|trend="[^"]*"|mode="[^"]*"|speed="[^"]*"|wave="[^"]*"|hz=\{[0-9]+\}|bpm=\{[0-9]+\}|count=\{[0-9]+\}|alive=\{[0-9]+\}|pts=\{[0-9]+\}|p1=\{[0-9]+\}|p2=\{[0-9]+\}|pos=\{?[0-9a-zA-Z"]+\}?|side="[^"]*"|glow="[^"]*"|stage="[^"]*"|state="[^"]*"|flora="[^"]*"|model="[^"]*"|file="[^"]*"|pass=\{[0-9]+\}|fail=\{[0-9]+\}|cloud="[^"]*"|glyph="[^"]*"|ver="[^"]*"|title="[^"]*"|run="[^"]*"|theme="[^"]*"|>[^<]*<|[a-zA-Z0-9_-]+="[^"]*"|\/?>|\{|\}|\(|\))/gi
    );

    for (const token of tokens) {
      if (!token) continue;
      if (token.startsWith('</') || token.startsWith('<')) {
        ctx.fillStyle = '#f472b6';
      } else if (token === 'export' || token === 'function' || token === 'return') {
        ctx.fillStyle = '#c084fc';
      } else if (token.includes('=')) {
        ctx.fillStyle = '#38bdf8';
      } else if (token.startsWith('"') && token.endsWith('"')) {
        ctx.fillStyle = '#4ade80';
      } else if (token.includes('{') && token.includes('}')) {
        ctx.fillStyle = '#fbbf24';
      } else if (token === 'neon' || token === 'live' || token === 'shield') {
        ctx.fillStyle = '#f59e0b';
      } else {
        ctx.fillStyle = '#f1f5f9';
      }

      ctx.fillText(token, cursorX, y);
      cursorX += ctx.measureText(token).width;
    }

    if (i === lines.length - 1 && !isHolding) {
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(cursorX + 2, y - 8, 4, 10);
    }
  }

  // 4. Right Side: Progressive & Interactive Live UI Preview
  const previewLeft = splitX + 10;
  drawLivePreview(ctx, W, H, previewLeft, lines.length, snippetIdx, isInteracted);
}

function drawLivePreview(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  previewLeft: number,
  typedLineCount: number,
  snippetIdx: number,
  isInteracted: boolean
) {
  const current = SNIPPETS[snippetIdx]!;
  const previewW = W - previewLeft - 10;

  // Ambient radial glow behind UI output
  const glowGrad = ctx.createRadialGradient(
    previewLeft + previewW / 2,
    140,
    6,
    previewLeft + previewW / 2,
    140,
    previewW * 0.7
  );
  glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(previewLeft, 26, previewW, H - 30);

  switch (current.type) {
    case 'space-arcade':
      renderSpaceArcadeDemo(ctx, previewLeft, previewW, typedLineCount, isInteracted);
      break;
    case 'profile':
      renderProfileDemo(ctx, previewLeft, previewW, typedLineCount, isInteracted);
      break;
    case 'neon-pong':
      renderNeonPongDemo(ctx, previewLeft, previewW, typedLineCount, isInteracted);
      break;
    case 'sound-deck':
      renderSoundDeckDemo(ctx, previewLeft, previewW, typedLineCount, isInteracted);
      break;
    case 'palette':
      renderPaletteDemo(ctx, previewLeft, previewW, typedLineCount, isInteracted);
      break;
    case 'pixel-runner':
      renderPixelRunnerDemo(ctx, previewLeft, previewW, typedLineCount, isInteracted);
      break;
    case 'agent-console':
      renderAgentConsoleDemo(ctx, previewLeft, previewW, typedLineCount, isInteracted);
      break;
    case 'metrics':
      renderMetricsDemo(ctx, previewLeft, previewW, typedLineCount, isInteracted);
      break;
    case 'product-showcase':
      renderProductShowcaseDemo(ctx, previewLeft, previewW, typedLineCount, isInteracted);
      break;
  }
}
