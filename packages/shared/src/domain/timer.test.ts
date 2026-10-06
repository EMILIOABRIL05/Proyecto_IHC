import { describe, expect, it } from 'vitest';
import {
  adjustElapsed,
  currentElapsedMs,
  formatElapsed,
  isTimerPossiblyForgotten,
  pauseTimer,
  resetTimer,
  startTimer,
  type TimerState,
} from './timer';

const T0 = new Date('2026-10-07T15:00:00.000Z');
const despues = (segundos: number) => new Date(T0.getTime() + segundos * 1000);

const detenido = (elapsedMs = 0): TimerState => ({
  elapsedMs,
  timerStartedAt: null,
  timeAdjusted: false,
});
const corriendo = (elapsedMs = 0, inicio = T0): TimerState => ({
  elapsedMs,
  timerStartedAt: inicio,
  timeAdjusted: false,
});

describe('currentElapsedMs (RN-08)', () => {
  it('devuelve lo acumulado cuando el cronómetro está detenido', () => {
    expect(currentElapsedMs(detenido(42_000), despues(999))).toBe(42_000);
  });

  it('suma el tiempo transcurrido desde el inicio cuando está corriendo', () => {
    expect(currentElapsedMs(corriendo(10_000), despues(30))).toBe(40_000);
  });

  it('tras una recarga simulada conserva el tiempo, porque se calcula con la hora del servidor (D1)', () => {
    // La BD guarda elapsedMs y timerStartedAt; al recargar 5 minutos después el tiempo sigue correcto.
    const guardado = corriendo(0, T0);

    expect(currentElapsedMs(guardado, despues(5 * 60))).toBe(300_000);
  });

  it('nunca devuelve un tiempo negativo si el reloj quedó atrás del inicio', () => {
    expect(currentElapsedMs(corriendo(5_000, despues(10)), T0)).toBe(5_000);
  });
});

describe('startTimer', () => {
  it('guarda el instante de inicio y conserva lo acumulado', () => {
    const estado = startTimer(detenido(8_000), T0);

    expect(estado.timerStartedAt).toEqual(T0);
    expect(estado.elapsedMs).toBe(8_000);
  });

  it('es idempotente: iniciar uno que ya corre no mueve el inicio', () => {
    const yaCorre = corriendo(0, T0);

    expect(startTimer(yaCorre, despues(60))).toEqual(yaCorre);
  });

  it('no modifica el estado recibido', () => {
    const original = detenido(1_000);

    startTimer(original, T0);

    expect(original.timerStartedAt).toBeNull();
  });
});

describe('pauseTimer', () => {
  it('consolida el tiempo corrido en elapsedMs y apaga el cronómetro', () => {
    const estado = pauseTimer(corriendo(10_000), despues(20));

    expect(estado.elapsedMs).toBe(30_000);
    expect(estado.timerStartedAt).toBeNull();
  });

  it('es idempotente: pausar uno detenido no cambia nada', () => {
    const quieto = detenido(7_000);

    expect(pauseTimer(quieto, despues(60))).toEqual(quieto);
  });

  it('acumula varios ciclos de iniciar y pausar', () => {
    let estado = startTimer(detenido(), T0);
    estado = pauseTimer(estado, despues(60)); // 60 s
    estado = startTimer(estado, despues(120));
    estado = pauseTimer(estado, despues(150)); // + 30 s

    expect(estado.elapsedMs).toBe(90_000);
  });
});

describe('resetTimer', () => {
  it('lleva el tiempo a cero y detiene el cronómetro', () => {
    const estado = resetTimer(corriendo(50_000));

    expect(estado).toEqual({ elapsedMs: 0, timerStartedAt: null, timeAdjusted: false });
  });

  it('quita la marca de ajuste manual, porque el tiempo se vuelve a medir desde cero', () => {
    const ajustado: TimerState = { elapsedMs: 9_000, timerStartedAt: null, timeAdjusted: true };

    expect(resetTimer(ajustado).timeAdjusted).toBe(false);
  });
});

describe('adjustElapsed (corrección manual, RN-08)', () => {
  it('fija el tiempo, detiene el cronómetro y deja registrado el ajuste', () => {
    const estado = adjustElapsed(corriendo(0, T0), 125_000);

    expect(estado).toEqual({ elapsedMs: 125_000, timerStartedAt: null, timeAdjusted: true });
  });

  it('acepta cero', () => {
    expect(adjustElapsed(detenido(5_000), 0).elapsedMs).toBe(0);
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rechaza un tiempo inválido (%s)',
    (invalido) => {
      expect(() => adjustElapsed(detenido(), invalido)).toThrow(RangeError);
    },
  );
});

describe('isTimerPossiblyForgotten (RN-08, D2)', () => {
  const DOS_HORAS = 2 * 60 * 60;

  it('avisa cuando lleva corriendo más de 2 horas', () => {
    expect(isTimerPossiblyForgotten(corriendo(), despues(DOS_HORAS + 1))).toBe(true);
  });

  it('no avisa con exactamente 2 horas', () => {
    expect(isTimerPossiblyForgotten(corriendo(), despues(DOS_HORAS))).toBe(false);
  });

  it('no avisa si lleva menos de 2 horas', () => {
    expect(isTimerPossiblyForgotten(corriendo(), despues(60))).toBe(false);
  });

  it('mide solo el tramo actual, no lo ya acumulado', () => {
    const muchoAcumulado = corriendo(5 * 60 * 60 * 1000, T0);

    expect(isTimerPossiblyForgotten(muchoAcumulado, despues(60))).toBe(false);
  });

  it('no avisa si el cronómetro está detenido', () => {
    expect(isTimerPossiblyForgotten(detenido(10 * 60 * 60 * 1000), despues(DOS_HORAS * 5))).toBe(
      false,
    );
  });
});

describe('formatElapsed (mm:ss, RN-06)', () => {
  it.each([
    [0, '00:00'],
    [999, '00:00'],
    [59_999, '00:59'],
    [522_000, '08:42'],
    [3_600_000, '60:00'],
    [7_503_000, '125:03'],
  ])('%i ms se muestra como %s', (ms, texto) => {
    expect(formatElapsed(ms)).toBe(texto);
  });

  it('muestra 00:00 ante un valor negativo', () => {
    expect(formatElapsed(-5_000)).toBe('00:00');
  });
});
