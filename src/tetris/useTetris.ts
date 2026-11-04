import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActivePiece,
  BoardMatrix,
  ClearEvent,
  GameMode,
  GameState,
  GameStats,
  HighScoreRecord,
  KeyBindings,
  TetrominoType,
  ThemeId,
} from './types';
import {
  MATRIX_COLS,
  MATRIX_ROWS,
  TOTAL_ROWS,
  TETROMINO_SHAPES,
  SPAWN_POSITIONS,
  DEFAULT_KEYBINDINGS,
  SECONDARY_KEYS,
  getDropInterval,
} from './constants';
import {
  createEmptyMatrix,
  isValidPosition,
  tryRotate,
  getGhostPiecePosition,
  checkTSpin,
} from './srs';
import { soundEngine } from './sound';

const ALL_PIECES: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

// Fisher-Yates shuffle for 7-bag randomizer
function generate7Bag(): TetrominoType[] {
  const bag = [...ALL_PIECES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

const STORAGE_KEY_PREFIX = 'tetris_master_records_';

export function useTetris() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [gameMode, setGameMode] = useState<GameMode>('marathon');
  const [theme, setTheme] = useState<ThemeId>('neon');
  const [board, setBoard] = useState<BoardMatrix>(() => createEmptyMatrix());
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);
  const [nextQueue, setNextQueue] = useState<TetrominoType[]>([]);
  const [clearEvents, setClearEvents] = useState<ClearEvent[]>([]);
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [keyBindings, setKeyBindings] = useState<KeyBindings>(DEFAULT_KEYBINDINGS);

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    lines: 0,
    level: 1,
    combo: -1,
    maxCombo: 0,
    piecesDropped: 0,
    tetrisCount: 0,
    tSpinCount: 0,
    singleCount: 0,
    doubleCount: 0,
    tripleCount: 0,
    timeElapsed: 0,
    timeRemaining: 120,
  });

  const [highScores, setHighScores] = useState<Record<GameMode, HighScoreRecord | null>>({
    marathon: null,
    sprint40: null,
    blitz2m: null,
  });

  // Load high scores from localStorage
  useEffect(() => {
    try {
      const marathonRec = localStorage.getItem(`${STORAGE_KEY_PREFIX}marathon`);
      const sprintRec = localStorage.getItem(`${STORAGE_KEY_PREFIX}sprint40`);
      const blitzRec = localStorage.getItem(`${STORAGE_KEY_PREFIX}blitz2m`);

      setHighScores({
        marathon: marathonRec ? JSON.parse(marathonRec) : null,
        sprint40: sprintRec ? JSON.parse(sprintRec) : null,
        blitz2m: blitzRec ? JSON.parse(blitzRec) : null,
      });

      const savedTheme = localStorage.getItem('tetris_master_theme') as ThemeId;
      if (savedTheme) setTheme(savedTheme);
    } catch {
      // safe fallback
    }
  }, []);

  const changeTheme = (newTheme: ThemeId) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('tetris_master_theme', newTheme);
    } catch {}
  };

  // Mutable refs to prevent stale closures inside requestAnimationFrame & key loops
  const boardRef = useRef(board);
  boardRef.current = board;

  const pieceRef = useRef(activePiece);
  pieceRef.current = activePiece;

  const bagRef = useRef<TetrominoType[]>([]);
  const holdRef = useRef(holdPiece);
  holdRef.current = holdPiece;

  const canHoldRef = useRef(canHold);
  canHoldRef.current = canHold;

  const statsRef = useRef(stats);
  statsRef.current = stats;

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const gameModeRef = useRef(gameMode);
  gameModeRef.current = gameMode;

  const b2bRef = useRef<boolean>(false);
  const lockTimerRef = useRef<number | null>(null);
  const lockResetsRef = useRef<number>(0);
  const lastDropTimeRef = useRef<number>(0);
  const gameStartTimeRef = useRef<number>(0);
  const lastSecTimeRef = useRef<number>(0);

  // Bag replenishing helper
  const pullNextPiece = useCallback((): TetrominoType => {
    if (bagRef.current.length < 7) {
      bagRef.current = [...bagRef.current, ...generate7Bag(), ...generate7Bag()];
    }
    const next = bagRef.current.shift()!;
    setNextQueue([...bagRef.current.slice(0, 5)]);
    return next;
  }, []);

  // Save new high score if achieved
  const recordHighScore = useCallback(
    (mode: GameMode, finalStats: GameStats) => {
      try {
        const current = highScores[mode];
        let isBetter = false;

        if (!current) {
          isBetter = true;
        } else if (mode === 'sprint40') {
          // In 40L sprint, lower time is better
          isBetter = finalStats.lines >= 40 && finalStats.timeElapsed < current.time;
        } else {
          // In Marathon & Blitz, higher score is better
          isBetter = finalStats.score > current.score;
        }

        if (isBetter) {
          const newRecord: HighScoreRecord = {
            score: finalStats.score,
            lines: finalStats.lines,
            level: finalStats.level,
            time: finalStats.timeElapsed,
            date: new Date().toLocaleDateString(),
          };
          localStorage.setItem(`${STORAGE_KEY_PREFIX}${mode}`, JSON.stringify(newRecord));
          setHighScores((prev) => ({ ...prev, [mode]: newRecord }));
        }
      } catch {}
    },
    [highScores]
  );

  // Spawn a new piece at the top
  const spawnPiece = useCallback(
    (type: TetrominoType, currentBoard: BoardMatrix): boolean => {
      const spawnPos = SPAWN_POSITIONS[type];
      const newPiece: ActivePiece = {
        type,
        rotation: 0,
        x: spawnPos.x,
        y: spawnPos.y,
        lastMoveWasRotate: false,
      };

      if (!isValidPosition(newPiece.type, newPiece.rotation, newPiece.x, newPiece.y, currentBoard)) {
        // Game Over!
        setGameState('GAME_OVER');
        soundEngine.playGameOver();
        recordHighScore(gameModeRef.current, statsRef.current);
        return false;
      }

      setActivePiece(newPiece);
      setCanHold(true);
      lockResetsRef.current = 0;
      if (lockTimerRef.current !== null) {
        window.clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }
      return true;
    },
    [recordHighScore]
  );

  // Lock the current piece into the board and calculate line clears & score
  const lockPiece = useCallback(() => {
    const piece = pieceRef.current;
    const currentBoard = boardRef.current;
    if (!piece) return;

    if (lockTimerRef.current !== null) {
      window.clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }

    // 1. Stamp piece onto board
    const shape = TETROMINO_SHAPES[piece.type][piece.rotation];
    const newBoard = currentBoard.map((row) => [...row]);
    const size = shape.length;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (shape[r][c]) {
          const by = piece.y + r;
          const bx = piece.x + c;
          if (by >= 0 && by < TOTAL_ROWS && bx >= 0 && bx < MATRIX_COLS) {
            newBoard[by][bx] = piece.type;
          }
        }
      }
    }

    // Check T-spin before moving on
    const { isTSpin, isMini } = checkTSpin(piece, currentBoard);

    // 2. Detect cleared rows
    const clearedIndices: number[] = [];
    for (let r = 0; r < TOTAL_ROWS; r++) {
      if (newBoard[r].every((cell) => cell !== null)) {
        clearedIndices.push(r);
      }
    }

    const linesCleared = clearedIndices.length;
    let gainedScore = 0;
    let clearText = '';
    const currentLevel = statsRef.current.level;
    const isTetris = linesCleared === 4;

    // Line clear scoring calculation (Standard Tetris Guideline)
    if (linesCleared > 0) {
      setClearingRows(clearedIndices);
      setTimeout(() => setClearingRows([]), 180);

      const isDifficult = isTetris || isTSpin;
      const b2bMultiplier = isDifficult && b2bRef.current ? 1.5 : 1;
      const currentCombo = statsRef.current.combo + 1;

      if (isTSpin) {
        if (isMini) {
          clearText = 'T-Spin Mini!';
          gainedScore = 100 * currentLevel * b2bMultiplier;
        } else if (linesCleared === 1) {
          clearText = 'T-Spin Single!';
          gainedScore = 800 * currentLevel * b2bMultiplier;
        } else if (linesCleared === 2) {
          clearText = 'T-Spin Double!';
          gainedScore = 1200 * currentLevel * b2bMultiplier;
        } else if (linesCleared === 3) {
          clearText = 'T-Spin Triple!';
          gainedScore = 1600 * currentLevel * b2bMultiplier;
        }
      } else {
        if (linesCleared === 1) {
          clearText = 'Single (單行消除)';
          gainedScore = 100 * currentLevel;
        } else if (linesCleared === 2) {
          clearText = 'Double (雙行消除)';
          gainedScore = 300 * currentLevel;
        } else if (linesCleared === 3) {
          clearText = 'Triple (三行消除)';
          gainedScore = 500 * currentLevel;
        } else if (linesCleared === 4) {
          clearText = b2bRef.current ? 'B2B TETRIS!' : 'TETRIS! (四行消除)';
          gainedScore = 800 * currentLevel * b2bMultiplier;
        }
      }

      // Combo bonus
      if (currentCombo > 0) {
        gainedScore += 50 * currentCombo * currentLevel;
      }

      b2bRef.current = isDifficult;
      soundEngine.playLineClear(linesCleared);

      // Create filtered new board
      const filteredBoard = newBoard.filter((_, idx) => !clearedIndices.includes(idx));
      while (filteredBoard.length < TOTAL_ROWS) {
        filteredBoard.unshift(Array(MATRIX_COLS).fill(null));
      }

      // Perfect Clear check (whole board completely empty)
      const isPerfectClear = filteredBoard.every((row) => row.every((c) => c === null));
      if (isPerfectClear) {
        clearText = 'PERFECT CLEAR! (全清)';
        gainedScore += (linesCleared === 4 ? 2000 : 1000) * currentLevel;
        soundEngine.playVictory();
      }

      const totalLines = statsRef.current.lines + linesCleared;
      const newLevel = Math.min(20, Math.floor(totalLines / 10) + 1);

      if (newLevel > currentLevel) {
        soundEngine.playLevelUp();
      }

      setStats((prev) => ({
        ...prev,
        score: prev.score + gainedScore,
        lines: totalLines,
        level: newLevel,
        combo: currentCombo,
        maxCombo: Math.max(prev.maxCombo, currentCombo),
        piecesDropped: prev.piecesDropped + 1,
        tetrisCount: prev.tetrisCount + (isTetris ? 1 : 0),
        tSpinCount: prev.tSpinCount + (isTSpin ? 1 : 0),
        singleCount: prev.singleCount + (linesCleared === 1 ? 1 : 0),
        doubleCount: prev.doubleCount + (linesCleared === 2 ? 1 : 0),
        tripleCount: prev.tripleCount + (linesCleared === 3 ? 1 : 0),
      }));

      // Trigger visual clear toast / animation
      const clearEvent: ClearEvent = {
        lines: linesCleared,
        text: clearText,
        isTetris,
        isTSpin,
        isBackToBack: b2bRef.current,
        isPerfectClear,
        scoreGained: gainedScore,
        timestamp: Date.now(),
      };
      setClearEvents((prev) => [clearEvent, ...prev.slice(0, 2)]);

      setBoard(filteredBoard);

      // Check sprint 40 lines completion
      if (gameModeRef.current === 'sprint40' && totalLines >= 40) {
        setGameState('VICTORY');
        soundEngine.playVictory();
        recordHighScore(
          'sprint40',
          { ...statsRef.current, score: statsRef.current.score + gainedScore, lines: totalLines }
        );
        return;
      }

      // Spawn next piece
      const nextType = pullNextPiece();
      spawnPiece(nextType, filteredBoard);
    } else {
      // No lines cleared, reset combo
      setStats((prev) => ({
        ...prev,
        combo: -1,
        piecesDropped: prev.piecesDropped + 1,
      }));
      setBoard(newBoard);

      const nextType = pullNextPiece();
      spawnPiece(nextType, newBoard);
    }
  }, [pullNextPiece, spawnPiece, recordHighScore]);

  // Try move piece horizontally
  const moveHorizontally = useCallback((deltaX: number) => {
    const piece = pieceRef.current;
    const currentBoard = boardRef.current;
    if (!piece || gameStateRef.current !== 'PLAYING') return;

    const newX = piece.x + deltaX;
    if (isValidPosition(piece.type, piece.rotation, newX, piece.y, currentBoard)) {
      setActivePiece({
        ...piece,
        x: newX,
        lastMoveWasRotate: false,
      });
      soundEngine.playMove();

      // Reset lock delay if piece is on floor and resets remain
      if (!isValidPosition(piece.type, piece.rotation, newX, piece.y + 1, currentBoard)) {
        if (lockResetsRef.current < 15) {
          lockResetsRef.current++;
          if (lockTimerRef.current !== null) {
            window.clearTimeout(lockTimerRef.current);
            lockTimerRef.current = null;
          }
        }
      }
    }
  }, []);

  // Soft drop (move down 1 cell)
  const softDrop = useCallback(() => {
    const piece = pieceRef.current;
    const currentBoard = boardRef.current;
    if (!piece || gameStateRef.current !== 'PLAYING') return;

    if (isValidPosition(piece.type, piece.rotation, piece.x, piece.y + 1, currentBoard)) {
      setActivePiece({
        ...piece,
        y: piece.y + 1,
        lastMoveWasRotate: false,
      });
      setStats((prev) => ({ ...prev, score: prev.score + 1 }));
      soundEngine.playSoftDrop();
    } else {
      // Hit bottom, trigger lock delay immediately
      if (lockTimerRef.current === null) {
        lockTimerRef.current = window.setTimeout(lockPiece, 500);
      }
    }
  }, [lockPiece]);

  // Hard drop (drop straight to bottom and lock instantly)
  const hardDrop = useCallback(() => {
    const piece = pieceRef.current;
    const currentBoard = boardRef.current;
    if (!piece || gameStateRef.current !== 'PLAYING') return;

    let targetY = piece.y;
    while (isValidPosition(piece.type, piece.rotation, piece.x, targetY + 1, currentBoard)) {
      targetY++;
    }

    const dropDistance = targetY - piece.y;
    const droppedPiece = { ...piece, y: targetY };
    setActivePiece(droppedPiece);
    pieceRef.current = droppedPiece;

    setStats((prev) => ({ ...prev, score: prev.score + dropDistance * 2 }));
    soundEngine.playHardDrop();
    lockPiece();
  }, [lockPiece]);

  // Rotate piece (CW or CCW) with SRS
  const rotate = useCallback((direction: 'cw' | 'ccw' = 'cw') => {
    const piece = pieceRef.current;
    const currentBoard = boardRef.current;
    if (!piece || gameStateRef.current !== 'PLAYING') return;

    const result = tryRotate(piece, currentBoard, direction);
    if (result.success) {
      setActivePiece(result.piece);
      soundEngine.playRotate();

      // Reset lock delay if on floor and resets remain
      if (!isValidPosition(result.piece.type, result.piece.rotation, result.piece.x, result.piece.y + 1, currentBoard)) {
        if (lockResetsRef.current < 15) {
          lockResetsRef.current++;
          if (lockTimerRef.current !== null) {
            window.clearTimeout(lockTimerRef.current);
            lockTimerRef.current = null;
          }
        }
      }
    }
  }, []);

  // Hold piece feature
  const hold = useCallback(() => {
    const piece = pieceRef.current;
    const currentBoard = boardRef.current;
    if (!piece || !canHoldRef.current || gameStateRef.current !== 'PLAYING') return;

    soundEngine.playHold();
    if (lockTimerRef.current !== null) {
      window.clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }

    const currentType = piece.type;
    const existingHold = holdRef.current;

    setHoldPiece(currentType);
    setCanHold(false);

    if (existingHold) {
      spawnPiece(existingHold, currentBoard);
    } else {
      const nextType = pullNextPiece();
      spawnPiece(nextType, currentBoard);
    }
  }, [pullNextPiece, spawnPiece]);

  // Start / Restart game
  const startGame = useCallback(
    (mode: GameMode = gameMode) => {
      const emptyBoard = createEmptyMatrix();
      setBoard(emptyBoard);
      setGameMode(mode);
      b2bRef.current = false;
      lockResetsRef.current = 0;
      if (lockTimerRef.current !== null) {
        window.clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }

      bagRef.current = [...generate7Bag(), ...generate7Bag()];
      const firstPiece = bagRef.current.shift()!;
      setNextQueue([...bagRef.current.slice(0, 5)]);

      setHoldPiece(null);
      setCanHold(true);
      setClearEvents([]);
      setClearingRows([]);

      setStats({
        score: 0,
        lines: 0,
        level: 1,
        combo: -1,
        maxCombo: 0,
        piecesDropped: 0,
        tetrisCount: 0,
        tSpinCount: 0,
        singleCount: 0,
        doubleCount: 0,
        tripleCount: 0,
        timeElapsed: 0,
        timeRemaining: mode === 'blitz2m' ? 120 : undefined,
      });

      setGameState('PLAYING');
      gameStartTimeRef.current = Date.now();
      lastDropTimeRef.current = Date.now();
      lastSecTimeRef.current = Date.now();

      spawnPiece(firstPiece, emptyBoard);
      soundEngine.startMusic();
    },
    [gameMode, spawnPiece]
  );

  const togglePause = useCallback(() => {
    if (gameStateRef.current === 'PLAYING') {
      setGameState('PAUSED');
      soundEngine.stopMusic();
    } else if (gameStateRef.current === 'PAUSED') {
      setGameState('PLAYING');
      lastDropTimeRef.current = Date.now();
      soundEngine.startMusic();
    }
  }, []);

  // Main game loop (Gravity tick + blitz countdown + lock delay tick)
  useEffect(() => {
    let animId: number;

    const gameLoop = (timestamp: number) => {
      if (gameStateRef.current === 'PLAYING') {
        const now = Date.now();
        const piece = pieceRef.current;
        const currentBoard = boardRef.current;

        // Second clock for elapsed time & blitz mode
        if (now - lastSecTimeRef.current >= 1000) {
          const deltaSec = Math.floor((now - lastSecTimeRef.current) / 1000);
          lastSecTimeRef.current = now;

          setStats((prev) => {
            const nextTime = prev.timeElapsed + deltaSec;
            if (gameModeRef.current === 'blitz2m') {
              const rem = Math.max(0, (prev.timeRemaining ?? 120) - deltaSec);
              if (rem <= 0) {
                // Blitz time over
                setGameState('GAME_OVER');
                soundEngine.playVictory();
                recordHighScore('blitz2m', { ...prev, timeElapsed: 120, timeRemaining: 0 });
              }
              return { ...prev, timeElapsed: nextTime, timeRemaining: rem };
            }
            return { ...prev, timeElapsed: nextTime };
          });
        }

        // Piece gravity
        if (piece) {
          const dropSpeed = getDropInterval(statsRef.current.level);
          const isGrounded = !isValidPosition(
            piece.type,
            piece.rotation,
            piece.x,
            piece.y + 1,
            currentBoard
          );

          if (isGrounded) {
            // Start or continue lock timer
            if (lockTimerRef.current === null) {
              lockTimerRef.current = window.setTimeout(lockPiece, 500);
            }
          } else {
            // Not grounded: cancel lock timer if it was running
            if (lockTimerRef.current !== null) {
              window.clearTimeout(lockTimerRef.current);
              lockTimerRef.current = null;
            }

            // Normal gravity drop
            if (now - lastDropTimeRef.current >= dropSpeed) {
              lastDropTimeRef.current = now;
              setActivePiece((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  y: prev.y + 1,
                  lastMoveWasRotate: false,
                };
              });
            }
          }
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [lockPiece, recordHighScore]);

  // Keyboard controls with DAS (Delayed Auto Shift)
  useEffect(() => {
    const pressedKeys = new Set<string>();
    let dasTimer: number | null = null;
    let arrTimer: number | null = null;
    let activeDirection: number | null = null;

    const startRepeat = (dir: number) => {
      activeDirection = dir;
      moveHorizontally(dir);

      if (dasTimer !== null) clearTimeout(dasTimer);
      if (arrTimer !== null) clearInterval(arrTimer);

      dasTimer = window.setTimeout(() => {
        arrTimer = window.setInterval(() => {
          if (activeDirection !== null) {
            moveHorizontally(activeDirection);
          }
        }, 35); // Fast smooth repeat
      }, 150); // 150ms DAS
    };

    const stopRepeat = (dir: number) => {
      if (activeDirection === dir) {
        if (dasTimer !== null) clearTimeout(dasTimer);
        if (arrTimer !== null) clearInterval(arrTimer);
        activeDirection = null;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser default scrolling for game keys
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key) &&
        gameStateRef.current === 'PLAYING'
      ) {
        e.preventDefault();
      }

      if (pressedKeys.has(e.key)) return;
      pressedKeys.add(e.key);

      const key = e.key;
      const lower = key.toLowerCase();

      // Pause toggle
      if (
        key === keyBindings.pause ||
        lower === keyBindings.pause ||
        SECONDARY_KEYS[key] === 'pause'
      ) {
        togglePause();
        return;
      }

      // Quick restart
      if (key === keyBindings.restart || lower === keyBindings.restart) {
        startGame();
        return;
      }

      if (gameStateRef.current !== 'PLAYING') return;

      // Move left
      if (key === keyBindings.moveLeft || SECONDARY_KEYS[lower] === 'moveLeft') {
        startRepeat(-1);
        return;
      }

      // Move right
      if (key === keyBindings.moveRight || SECONDARY_KEYS[lower] === 'moveRight') {
        startRepeat(1);
        return;
      }

      // Soft drop
      if (key === keyBindings.softDrop || SECONDARY_KEYS[lower] === 'softDrop') {
        softDrop();
        return;
      }

      // Hard drop
      if (key === keyBindings.hardDrop) {
        hardDrop();
        return;
      }

      // Rotate Clockwise
      if (key === keyBindings.rotateCW || SECONDARY_KEYS[lower] === 'rotateCW') {
        rotate('cw');
        return;
      }

      // Rotate Counter-Clockwise
      if (key === keyBindings.rotateCCW || SECONDARY_KEYS[key] === 'rotateCCW') {
        rotate('ccw');
        return;
      }

      // Hold
      if (key === keyBindings.hold || SECONDARY_KEYS[key] === 'hold') {
        hold();
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.delete(e.key);
      const key = e.key;
      const lower = key.toLowerCase();

      if (key === keyBindings.moveLeft || SECONDARY_KEYS[lower] === 'moveLeft') {
        stopRepeat(-1);
      }
      if (key === keyBindings.moveRight || SECONDARY_KEYS[lower] === 'moveRight') {
        stopRepeat(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (dasTimer !== null) clearTimeout(dasTimer);
      if (arrTimer !== null) clearInterval(arrTimer);
    };
  }, [
    keyBindings,
    moveHorizontally,
    softDrop,
    hardDrop,
    rotate,
    hold,
    togglePause,
    startGame,
  ]);

  // Compute ghost piece
  const ghostPiece =
    activePiece && gameState === 'PLAYING'
      ? getGhostPiecePosition(activePiece, board)
      : null;

  return {
    gameState,
    gameMode,
    theme,
    board,
    activePiece,
    ghostPiece,
    holdPiece,
    canHold,
    nextQueue,
    clearEvents,
    clearingRows,
    stats,
    highScores,
    keyBindings,
    setKeyBindings,
    changeTheme,
    setGameMode,
    startGame,
    togglePause,
    moveHorizontally,
    softDrop,
    hardDrop,
    rotate,
    hold,
  };
}
