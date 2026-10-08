// Cronómetro de una tarea (RN-08). Funciones puras: reciben `now` y nunca leen el reloj, para
// probarlas con tiempo fijo. En producción `now` es la hora del SERVIDOR, no la del navegador.

export interface TimerState {
  /** Tiempo acumulado en ms, sin contar el tramo que está corriendo. */
  elapsedMs: number;
  /** Instante en que arrancó el tramo actual; `null` si está detenido. */
  timerStartedAt: Date | null;
  /** `true` si alguien corrigió el tiempo a mano. */
  timeAdjusted: boolean;
}

/** Con más de 2 h seguidas corriendo se pregunta si se olvidó pausarlo (RN-08). */
export const FORGOTTEN_TIMER_THRESHOLD_MS = 2 * 60 * 60 * 1000;

function runningMs(state: TimerState, now: Date): number {
  if (state.timerStartedAt === null) return 0;
  // Si el reloj quedó atrás del inicio, no se descuenta tiempo.
  return Math.max(0, now.getTime() - state.timerStartedAt.getTime());
}

/** Tiempo actual = acumulado + (ahora − inicio del tramo en curso). */
export function currentElapsedMs(state: TimerState, now: Date): number {
  return state.elapsedMs + runningMs(state, now);
}

export function startTimer(state: TimerState, now: Date): TimerState {
  if (state.timerStartedAt !== null) return state;
  return { ...state, timerStartedAt: now };
}

/** Pausar consolida el tramo corrido en `elapsedMs`. */
export function pauseTimer(state: TimerState, now: Date): TimerState {
  if (state.timerStartedAt === null) return state;
  return { ...state, elapsedMs: currentElapsedMs(state, now), timerStartedAt: null };
}

export function resetTimer(_state: TimerState): TimerState {
  // Se vuelve a medir desde cero, por eso también se limpia la marca de ajuste manual.
  return { elapsedMs: 0, timerStartedAt: null, timeAdjusted: false };
}

/** Corrección manual del tiempo: detiene el cronómetro y deja registrado el ajuste. */
export function adjustElapsed(state: TimerState, elapsedMs: number): TimerState {
  if (!Number.isInteger(elapsedMs) || elapsedMs < 0) {
    throw new RangeError(
      'El tiempo corregido debe ser un número entero de milisegundos, mínimo 0.',
    );
  }
  return { ...state, elapsedMs, timerStartedAt: null, timeAdjusted: true };
}

/** Solo mide el tramo en curso: lo ya acumulado no cuenta como "olvidado". */
export function isTimerPossiblyForgotten(state: TimerState, now: Date): boolean {
  return runningMs(state, now) > FORGOTTEN_TIMER_THRESHOLD_MS;
}

/** Formato `mm:ss`; con más de una hora los minutos siguen contando (125:03). */
export function formatElapsed(ms: number): string {
  const totalSegundos = Math.floor(Math.max(0, ms) / 1000);
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}
