/**
 * SwiftUI's `Spring(response:dampingRatio:)`, solved in closed form rather than
 * integrated. A closed form is a pure function of time, so a frame at 120 Hz,
 * 60 Hz or 1000 Hz lands on exactly the curve the app draws, and a scrubber
 * can jump to any instant without replaying the ones before it.
 *
 * Unit mass, as SwiftUI: ω₀ = 2π / response, ζ = dampingRatio.
 */
export type SwiftSpring = { response: number; dampingRatio: number };

export const swiftSpring = (
  response: number,
  dampingRatio: number
): SwiftSpring => ({ response, dampingRatio });

/**
 * Displacement from the target `t` seconds in, for a spring released with
 * displacement `x0` and velocity `v0` (units per second, toward positive).
 */
const displacement = (
  { response, dampingRatio: zeta }: SwiftSpring,
  x0: number,
  v0: number,
  t: number
) => {
  const w0 = (2 * Math.PI) / response;
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const decay = Math.exp(-zeta * w0 * t);
    return (
      decay *
      (x0 * Math.cos(wd * t) + ((v0 + zeta * w0 * x0) / wd) * Math.sin(wd * t))
    );
  }
  if (zeta === 1) {
    return Math.exp(-w0 * t) * (x0 + (v0 + w0 * x0) * t);
  }
  const s = Math.sqrt(zeta * zeta - 1);
  const r1 = -w0 * (zeta - s);
  const r2 = -w0 * (zeta + s);
  const c2 = (v0 - r1 * x0) / (r2 - r1);
  return (x0 - c2) * Math.exp(r1 * t) + c2 * Math.exp(r2 * t);
};

/** `Spring.value(target:time:)`: from 0 toward `target`. */
export const springValue = (spring: SwiftSpring, target: number, t: number) =>
  target + displacement(spring, -target, 0, t);

/** `Spring.value(fromValue:toValue:initialVelocity:time:)`. */
export const springValueFrom = (
  spring: SwiftSpring,
  from: number,
  to: number,
  velocity: number,
  t: number
) => to + displacement(spring, from - to, velocity, t);

/**
 * When an underdamped step response first reaches its target:
 * (π − acos ζ) / ω_d. The settled coin stops its halves here.
 */
export const firstContact = ({ response, dampingRatio: zeta }: SwiftSpring) => {
  const w0 = (2 * Math.PI) / response;
  const wd = w0 * Math.sqrt(1 - zeta * zeta);
  return (Math.PI - Math.acos(zeta)) / wd;
};

/** Seconds until displacement and velocity both fall below `epsilon`. */
export const settleTime = (spring: SwiftSpring, epsilon = 0.001) => {
  const w0 = (2 * Math.PI) / spring.response;
  const rate = Math.min(spring.dampingRatio, 1) * w0;
  return Math.log(1 / epsilon) / rate;
};
