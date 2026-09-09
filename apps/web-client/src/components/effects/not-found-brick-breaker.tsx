"use client";

import Link from "next/link";
import {
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { Badge } from "@/components/pouf/Badge";
import { Card, CardContent } from "@/components/pouf/Card";
import { buttonClasses } from "@/components/pouf/Button";
import {
  advanceBrickBreaker,
  BRICK_BREAKER_BOARD_HEIGHT,
  BRICK_BREAKER_BOARD_WIDTH,
  BRICK_BREAKER_FIXED_STEP,
  BRICK_BREAKER_MAX_FRAME_DELTA,
  type BrickBreakerEvent,
  type BrickBreakerInput,
  type BrickBreakerPhase,
  type BrickBreakerState,
  createBrickBreakerState,
  launchBrickBreakerBall,
  pauseBrickBreaker,
  restartBrickBreaker,
  resumeBrickBreaker,
  startBrickBreaker,
} from "@/lib/games/brick-breaker";
import { cn } from "@/lib/utils";

const MAX_PHYSICS_STEPS_PER_FRAME = 6;
const MAX_DEVICE_PIXEL_RATIO = 2;
const NON_REPEAT_KEYS = new Set([" ", "p", "escape", "r"]);
const MOVEMENT_KEYS: Readonly<Partial<Record<string, "left" | "right">>> = {
  a: "left",
  arrowleft: "left",
  arrowright: "right",
  d: "right",
};

const PHASE_LABELS: Record<BrickBreakerPhase, string> = {
  idle: "待命",
  lost: "信号丢失",
  paused: "已暂停",
  playing: "对战中",
  ready: "准备发射",
  won: "通道已打通",
};

const ACTION_LABELS: Record<BrickBreakerPhase, string> = {
  idle: "开始游戏",
  lost: "再玩一次",
  paused: "继续",
  playing: "暂停",
  ready: "发射",
  won: "再玩一次",
};

// pouf 语义色：对战中 mint、暂停 yellow、获胜 pink、失败 orange，待命/准备走品牌紫。
const PHASE_TONE: Record<
  BrickBreakerPhase,
  "purple" | "mint" | "yellow" | "pink" | "orange"
> = {
  idle: "purple",
  lost: "orange",
  paused: "yellow",
  playing: "mint",
  ready: "purple",
  won: "pink",
};

interface BrickBreakerHud {
  lives: number;
  phase: BrickBreakerPhase;
  score: number;
}

interface CanvasColors {
  accent: string;
  background: string;
  border: string;
  foreground: string;
  muted: string;
  primary: string;
  secondary: string;
}

interface FrameAdvanceResult {
  accumulator: number;
  events: BrickBreakerEvent[];
}

export interface NotFoundBrickBreakerProps
  extends React.ComponentPropsWithoutRef<"section"> {
  badge?: string;
  cta?: string;
  description?: string;
  href?: string;
  title?: string;
}

function createInputState(): BrickBreakerInput {
  return {
    left: false,
    pointerX: null,
    right: false,
  };
}

function createHud(state: BrickBreakerState): BrickBreakerHud {
  return {
    lives: state.lives,
    phase: state.phase,
    score: state.score,
  };
}

function getCssColor(
  styles: CSSStyleDeclaration,
  token: string,
  fallback: string
): string {
  return styles.getPropertyValue(token).trim() || fallback;
}

/* pouf 令牌：画布从计算样式里读它们，随主题（light/dark）自动翻转。 */
function readCanvasColors(source: Element): CanvasColors {
  const styles = getComputedStyle(source);
  return {
    accent: getCssColor(styles, "--mint", "#a8f0d0"),
    background: getCssColor(styles, "--bg", "#f0e9ff"),
    border: getCssColor(styles, "--purple", "#c9a8ff"),
    foreground: getCssColor(styles, "--ink", "#3a2e5c"),
    muted: getCssColor(styles, "--muted", "#71609b"),
    primary: getCssColor(styles, "--purple", "#c9a8ff"),
    secondary: getCssColor(styles, "--pink", "#ffb3d1"),
  };
}

function configureCanvas(canvas: HTMLCanvasElement): void {
  const pixelRatio = Math.min(
    window.devicePixelRatio || 1,
    MAX_DEVICE_PIXEL_RATIO
  );
  canvas.width = BRICK_BREAKER_BOARD_WIDTH * pixelRatio;
  canvas.height = BRICK_BREAKER_BOARD_HEIGHT * pixelRatio;

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.imageSmoothingEnabled = false;
}

function drawBrickBreaker(
  canvas: HTMLCanvasElement,
  state: BrickBreakerState,
  colors: CanvasColors
): void {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.clearRect(
    0,
    0,
    BRICK_BREAKER_BOARD_WIDTH,
    BRICK_BREAKER_BOARD_HEIGHT
  );
  context.fillStyle = colors.background;
  context.fillRect(0, 0, BRICK_BREAKER_BOARD_WIDTH, BRICK_BREAKER_BOARD_HEIGHT);

  context.lineWidth = 4;
  context.strokeStyle = colors.border;
  context.strokeRect(2, 2, BRICK_BREAKER_BOARD_WIDTH - 4, 316);

  for (const brick of state.bricks) {
    if (!brick.active) {
      continue;
    }

    const row = Math.round((brick.y - 38) / 18);
    context.fillStyle = row % 2 === 0 ? colors.primary : colors.secondary;
    context.fillRect(brick.x, brick.y, brick.width, brick.height);
    context.lineWidth = 2;
    context.strokeStyle = colors.foreground;
    context.strokeRect(
      brick.x + 1,
      brick.y + 1,
      brick.width - 2,
      brick.height - 2
    );
    context.fillStyle = colors.background;
    context.fillRect(brick.x + 5, brick.y + 4, brick.width - 10, 2);
  }

  context.fillStyle = colors.primary;
  context.fillRect(
    Math.round(state.paddle.x),
    state.paddle.y,
    state.paddle.width,
    state.paddle.height
  );
  context.fillStyle = colors.accent;
  context.fillRect(
    Math.round(state.paddle.x) + 6,
    state.paddle.y + 2,
    state.paddle.width - 12,
    2
  );

  context.beginPath();
  context.fillStyle = colors.foreground;
  context.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
  context.fill();

  if (state.phase === "paused") {
    context.fillStyle = colors.muted;
    context.fillRect(218, 142, 16, 36);
    context.fillRect(246, 142, 16, 36);
  }
}

function getAnnouncement(
  events: BrickBreakerEvent[],
  state: BrickBreakerState
): string | undefined {
  if (events.some((event) => event.type === "won")) {
    return "通道已打通，最终得分 404。";
  }
  if (events.some((event) => event.type === "lost")) {
    return "游戏结束，信号丢失。";
  }

  const lifeEvent = events.find(
    (event): event is Extract<BrickBreakerEvent, { type: "life-lost" }> =>
      event.type === "life-lost"
  );
  if (lifeEvent) {
    return `球丢了，还剩 ${lifeEvent.livesRemaining} 条命。`;
  }

  if (state.phase === "won") {
    return "通道已打通，最终得分 404。";
  }
  return undefined;
}

function isPrimaryActionKey(key: string, phase: BrickBreakerPhase): boolean {
  switch (key) {
    case " ":
      return phase === "idle" || phase === "ready";
    case "p":
    case "escape":
      return phase === "playing" || phase === "paused";
    case "r":
      return phase === "won" || phase === "lost";
    default:
      return false;
  }
}

function advanceFixedFrame(
  state: BrickBreakerState,
  input: BrickBreakerInput,
  elapsed: number,
  accumulator: number
): FrameAdvanceResult {
  const events: BrickBreakerEvent[] = [];
  let remainingTime = accumulator + elapsed;
  let steps = 0;

  while (
    remainingTime >= BRICK_BREAKER_FIXED_STEP &&
    steps < MAX_PHYSICS_STEPS_PER_FRAME &&
    state.phase === "playing"
  ) {
    events.push(...advanceBrickBreaker(state, input, BRICK_BREAKER_FIXED_STEP));
    remainingTime -= BRICK_BREAKER_FIXED_STEP;
    steps += 1;
  }

  if (
    steps === MAX_PHYSICS_STEPS_PER_FRAME &&
    remainingTime >= BRICK_BREAKER_FIXED_STEP
  ) {
    remainingTime = 0;
  }

  return { accumulator: remainingTime, events };
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-h-5 items-center justify-center rounded-md bg-bg px-1.5 text-[11px] font-bold text-muted">
      {children}
    </kbd>
  );
}

export function NotFoundBrickBreaker({
  badge = "404 · 迷路",
  className,
  cta = "返回首页",
  description = "这条路被一面由 404 拼成的砖墙挡住了。把它全部打碎就能通行，或者直接回到首页。",
  href = "/",
  title = "击碎砖墙，打通这条路",
  ...sectionProps
}: NotFoundBrickBreakerProps) {
  const headingId = useId();
  const instructionsId = useId();
  const [initialEngine] = useState(createBrickBreakerState);
  const engineRef = useRef(initialEngine);
  const inputRef = useRef<BrickBreakerInput>(createInputState());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playfieldRef = useRef<HTMLButtonElement>(null);
  const colorsRef = useRef<CanvasColors>({
    accent: "#a8f0d0",
    background: "#f0e9ff",
    border: "#c9a8ff",
    foreground: "#3a2e5c",
    muted: "#71609b",
    primary: "#c9a8ff",
    secondary: "#ffb3d1",
  });
  const animationFrameRef = useRef<number | null>(null);
  const previousTimestampRef = useRef<number | null>(null);
  const accumulatorRef = useRef(0);
  const frameCallbackRef = useRef<FrameRequestCallback>(() => undefined);
  const activePointerRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const [hud, setHud] = useState<BrickBreakerHud>(() =>
    createHud(initialEngine)
  );
  const [announcement, setAnnouncement] = useState("砖块游戏已就绪，发射小球即可开始。");

  const clearHeldInput = useCallback(() => {
    inputRef.current.left = false;
    inputRef.current.right = false;
    inputRef.current.pointerX = null;
  }, []);

  const cancelLoop = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    previousTimestampRef.current = null;
    accumulatorRef.current = 0;
  }, []);

  const renderCanvas = useCallback(() => {
    if (canvasRef.current) {
      drawBrickBreaker(canvasRef.current, engineRef.current, colorsRef.current);
    }
  }, []);

  const publishEngine = useCallback((message?: string) => {
    if (!mountedRef.current) {
      return;
    }
    setHud(createHud(engineRef.current));
    if (message) {
      setAnnouncement(message);
    }
  }, []);

  const scheduleFrame = useCallback(() => {
    if (
      animationFrameRef.current === null &&
      engineRef.current.phase === "playing" &&
      mountedRef.current
    ) {
      animationFrameRef.current = requestAnimationFrame((timestamp) => {
        frameCallbackRef.current(timestamp);
      });
    }
  }, []);

  const pauseGame = useCallback(
    (message = "游戏已暂停。") => {
      if (engineRef.current.phase !== "playing") {
        return;
      }

      pauseBrickBreaker(engineRef.current);
      clearHeldInput();
      cancelLoop();
      publishEngine(message);
      renderCanvas();
    },
    [cancelLoop, clearHeldInput, publishEngine, renderCanvas]
  );

  const resumeGame = useCallback(() => {
    if (engineRef.current.phase !== "paused") {
      return;
    }

    resumeBrickBreaker(engineRef.current);
    previousTimestampRef.current = null;
    accumulatorRef.current = 0;
    publishEngine("游戏继续。");
    renderCanvas();
    scheduleFrame();
    playfieldRef.current?.focus();
  }, [publishEngine, renderCanvas, scheduleFrame]);

  const launchGame = useCallback(() => {
    if (engineRef.current.phase !== "ready") {
      return;
    }

    launchBrickBreakerBall(engineRef.current);
    previousTimestampRef.current = null;
    accumulatorRef.current = 0;
    publishEngine("球已发射。");
    renderCanvas();
    scheduleFrame();
    playfieldRef.current?.focus();
  }, [publishEngine, renderCanvas, scheduleFrame]);

  const startGame = useCallback(() => {
    if (engineRef.current.phase !== "idle") {
      return;
    }

    startBrickBreaker(engineRef.current);
    publishEngine("游戏就绪，发射小球。");
    renderCanvas();
    playfieldRef.current?.focus();
  }, [publishEngine, renderCanvas]);

  const restartGame = useCallback(() => {
    cancelLoop();
    clearHeldInput();
    engineRef.current = restartBrickBreaker();
    startBrickBreaker(engineRef.current);
    publishEngine("新一局已就绪，发射小球。");
    renderCanvas();
    playfieldRef.current?.focus();
  }, [cancelLoop, clearHeldInput, publishEngine, renderCanvas]);

  const primaryAction = useCallback(() => {
    switch (engineRef.current.phase) {
      case "idle":
        startGame();
        break;
      case "ready":
        launchGame();
        break;
      case "playing":
        pauseGame();
        break;
      case "paused":
        resumeGame();
        break;
      case "won":
      case "lost":
        restartGame();
        break;
      default:
        break;
    }
  }, [launchGame, pauseGame, restartGame, resumeGame, startGame]);

  const activatePlayfield = useCallback(() => {
    if (engineRef.current.phase === "idle") {
      startGame();
    } else if (engineRef.current.phase === "ready") {
      launchGame();
    }
  }, [launchGame, startGame]);

  useEffect(() => {
    frameCallbackRef.current = (timestamp) => {
      animationFrameRef.current = null;
      const engine = engineRef.current;

      if (!mountedRef.current || engine.phase !== "playing") {
        return;
      }

      if (previousTimestampRef.current === null) {
        previousTimestampRef.current = timestamp;
        renderCanvas();
        scheduleFrame();
        return;
      }

      const elapsed = Math.min(
        Math.max(0, (timestamp - previousTimestampRef.current) / 1000),
        BRICK_BREAKER_MAX_FRAME_DELTA
      );
      previousTimestampRef.current = timestamp;
      const frameResult = advanceFixedFrame(
        engine,
        inputRef.current,
        elapsed,
        accumulatorRef.current
      );
      accumulatorRef.current = frameResult.accumulator;

      renderCanvas();
      if (frameResult.events.length > 0) {
        publishEngine(getAnnouncement(frameResult.events, engine));
      }

      if (engine.phase !== "playing") {
        previousTimestampRef.current = null;
        accumulatorRef.current = 0;
        return;
      }
      scheduleFrame();
    };
  }, [publishEngine, renderCanvas, scheduleFrame]);

  useEffect(() => {
    mountedRef.current = true;

    const refreshCanvas = () => {
      if (!canvasRef.current) {
        return;
      }
      colorsRef.current = readCanvasColors(canvasRef.current);
      configureCanvas(canvasRef.current);
      renderCanvas();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        pauseGame("标签页被隐藏，游戏暂停。");
      }
    };

    refreshCanvas();
    window.addEventListener("resize", refreshCanvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const themeObserver =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(refreshCanvas);
    themeObserver?.observe(document.documentElement, {
      attributeFilter: ["class", "data-theme", "style"],
      attributes: true,
    });

    return () => {
      mountedRef.current = false;
      cancelLoop();
      clearHeldInput();
      window.removeEventListener("resize", refreshCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      themeObserver?.disconnect();

      const pointerId = activePointerRef.current;
      const playfield = playfieldRef.current;
      if (pointerId !== null && playfield?.hasPointerCapture?.(pointerId)) {
        playfield.releasePointerCapture(pointerId);
      }
      activePointerRef.current = null;
    };
  }, [cancelLoop, clearHeldInput, pauseGame, renderCanvas]);

  const updatePointerPosition = (
    event: ReactPointerEvent<HTMLButtonElement>
  ): void => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const renderedX =
      bounds.width > 0
        ? ((event.clientX - bounds.left) / bounds.width) *
          BRICK_BREAKER_BOARD_WIDTH
        : BRICK_BREAKER_BOARD_WIDTH / 2;
    inputRef.current.pointerX = Math.min(
      Math.max(renderedX, 0),
      BRICK_BREAKER_BOARD_WIDTH
    );

    if (engineRef.current.phase === "ready") {
      advanceBrickBreaker(
        engineRef.current,
        inputRef.current,
        BRICK_BREAKER_FIXED_STEP
      );
      renderCanvas();
    }
  };

  const handlePlayfieldPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>
  ): void => {
    if (event.button !== 0) {
      return;
    }

    event.currentTarget.focus();
    activePointerRef.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    updatePointerPosition(event);

    if (engineRef.current.phase === "idle" && event.pointerType !== "mouse") {
      startGame();
      updatePointerPosition(event);
    }
    if (engineRef.current.phase === "ready") {
      launchGame();
    }
  };

  const handlePlayfieldPointerMove = (
    event: ReactPointerEvent<HTMLButtonElement>
  ): void => {
    const isActivePointer = activePointerRef.current === event.pointerId;
    if (event.pointerType === "mouse" || isActivePointer) {
      updatePointerPosition(event);
    }
  };

  const handlePlayfieldPointerLeave = (): void => {
    if (activePointerRef.current === null) {
      inputRef.current.pointerX = null;
    }
  };

  const clearPointer = (pointerId: number): void => {
    if (activePointerRef.current !== pointerId) {
      return;
    }
    activePointerRef.current = null;
    inputRef.current.pointerX = null;
  };

  const handlePlayfieldPointerUp = (
    event: ReactPointerEvent<HTMLButtonElement>
  ): void => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    clearPointer(event.pointerId);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    const key = event.key.toLowerCase();
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }
    if (event.repeat && NON_REPEAT_KEYS.has(key)) {
      if (isPrimaryActionKey(key, engineRef.current.phase)) {
        event.preventDefault();
      }
      return;
    }

    const canMove =
      engineRef.current.phase === "ready" ||
      engineRef.current.phase === "playing";
    const movementDirection = MOVEMENT_KEYS[key];
    let handled = false;

    if (movementDirection && canMove) {
      inputRef.current.pointerX = null;
      inputRef.current[movementDirection] = true;
      handled = true;
    } else if (isPrimaryActionKey(key, engineRef.current.phase)) {
      primaryAction();
      handled = true;
    }

    if (handled) {
      event.preventDefault();
    }
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>): void => {
    const movementDirection = MOVEMENT_KEYS[event.key.toLowerCase()];
    const wasHeld = movementDirection
      ? inputRef.current[movementDirection]
      : false;
    if (movementDirection) {
      inputRef.current[movementDirection] = false;
    }
    if (wasHeld) {
      event.preventDefault();
    }
  };

  const actionLabel = ACTION_LABELS[hud.phase];

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex min-h-[100dvh] w-full items-center justify-center px-4 py-10",
        className
      )}
      {...sectionProps}
    >
      <Card className="w-full max-w-3xl">
        <CardContent className="grid gap-4 pb-6 pt-5">
          <header className="grid justify-items-center gap-3 text-center">
            <Badge variant="secondary">{badge}</Badge>
            <h1 className="grid gap-3 text-ink" id={headingId}>
              <span className="text-xs font-black tracking-[0.2em] text-muted">
                ERROR 404
              </span>
              <span className="text-2xl font-black tracking-tight sm:text-4xl">
                {title}
              </span>
            </h1>
            <p className="max-w-xl text-xs font-bold text-muted sm:text-sm">
              {description}
            </p>
          </header>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-between">
            <Badge variant="secondary">
              得分 {hud.score.toString().padStart(3, "0")}
            </Badge>
            <Badge variant="secondary">生命 {hud.lives}</Badge>
            <Badge tone={PHASE_TONE[hud.phase]}>{PHASE_LABELS[hud.phase]}</Badge>
          </div>

          <button
            aria-describedby={instructionsId}
            aria-keyshortcuts="ArrowLeft ArrowRight A D Space P Escape R"
            aria-label="砖块游戏区"
            className="block aspect-[3/2] w-full touch-none overflow-hidden rounded-control bg-bg cushion-field"
            data-testid="brick-breaker-playfield"
            onBlur={clearHeldInput}
            onClick={activatePlayfield}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onLostPointerCapture={(event) => clearPointer(event.pointerId)}
            onPointerCancel={(event) => clearPointer(event.pointerId)}
            onPointerDown={handlePlayfieldPointerDown}
            onPointerLeave={handlePlayfieldPointerLeave}
            onPointerMove={handlePlayfieldPointerMove}
            onPointerUp={handlePlayfieldPointerUp}
            ref={playfieldRef}
            type="button"
          >
            <span aria-hidden="true" className="contents">
              <canvas
                className="block h-full w-full"
                height={BRICK_BREAKER_BOARD_HEIGHT}
                ref={canvasRef}
                width={BRICK_BREAKER_BOARD_WIDTH}
              >
                砖块游戏：打碎 404 砖墙，或用“返回首页”离开。
              </canvas>
            </span>
          </button>

          <div
            className="grid justify-items-center gap-2 text-center"
            id={instructionsId}
          >
            <p className="text-xs font-bold text-muted">
              触摸并拖动游戏区来移动挡板，首次触摸即可开始并发射小球。
            </p>
            <div className="hidden flex-wrap items-center justify-center gap-2 sm:inline-flex">
              <Kbd>←</Kbd>
              <Kbd>A</Kbd>
              <span className="text-xs font-bold text-muted">移动</span>
              <Kbd>→</Kbd>
              <Kbd>D</Kbd>
              <span className="text-xs font-bold text-muted">移动</span>
              <Kbd>空格</Kbd>
              <span className="text-xs font-bold text-muted">发射</span>
              <Kbd>P</Kbd>
              <span className="text-xs font-bold text-muted">暂停</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <button
              className={cn(
                buttonClasses({ size: "md", block: true }),
                "sm:w-auto"
              )}
              onClick={primaryAction}
              type="button"
            >
              {actionLabel}
            </button>
            <Link
              className={cn(
                buttonClasses({ size: "md", variant: "quiet", block: true }),
                "sm:w-auto"
              )}
              href={href}
            >
              {cta}
            </Link>
          </div>
        </CardContent>
      </Card>

      <p aria-atomic="true" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}

export default NotFoundBrickBreaker;
