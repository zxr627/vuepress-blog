import assert from "node:assert/strict";
import test from "node:test";
import { createTouchCompatController } from "../src/.vuepress/touchCompatController.mjs";

const setupController = () => {
  const activations = [];
  const scheduled = [];
  const controller = createTouchCompatController({
    activate: (target, point) => activations.push({ target, point }),
    schedule: (callback, delay) => scheduled.push({ callback, delay }),
  });

  return {
    activations,
    controller,
    runScheduled: () => scheduled.splice(0).forEach(({ callback }) => callback()),
    scheduled,
  };
};

test("activates the touched target after the compatibility delay", () => {
  const state = setupController();
  const target = {};

  state.controller.touchStart(target, { x: 10, y: 20 });
  state.controller.touchEnd(target, { x: 11, y: 21 });

  assert.equal(state.scheduled[0].delay, 80);
  state.runScheduled();
  assert.deepEqual(state.activations, [
    { target, point: { x: 11, y: 21 } },
  ]);
});

test("cancels fallback when the browser emits a native click", () => {
  const state = setupController();
  const target = {};

  state.controller.touchStart(target, { x: 0, y: 0 });
  state.controller.touchEnd(target, { x: 0, y: 0 });
  state.controller.click(target);
  state.runScheduled();

  assert.equal(state.activations.length, 0);
});

test("does not activate after scrolling beyond the movement threshold", () => {
  const state = setupController();
  const target = {};

  state.controller.touchStart(target, { x: 0, y: 0 });
  state.controller.touchMove({ x: 13, y: 0 });
  state.controller.touchEnd(target, { x: 13, y: 0 });
  state.runScheduled();

  assert.equal(state.scheduled.length, 0);
  assert.equal(state.activations.length, 0);
});

test("does not activate a cancelled or default-prevented touch", () => {
  const cancelled = setupController();
  const prevented = setupController();
  const target = {};

  cancelled.controller.touchStart(target, { x: 0, y: 0 });
  cancelled.controller.touchEnd(target, { x: 0, y: 0 });
  cancelled.controller.touchCancel();
  cancelled.runScheduled();

  prevented.controller.touchStart(target, { x: 0, y: 0 });
  prevented.controller.touchEnd(target, { x: 0, y: 0 }, () => true);
  prevented.runScheduled();

  assert.equal(cancelled.activations.length, 0);
  assert.equal(prevented.activations.length, 0);
});
