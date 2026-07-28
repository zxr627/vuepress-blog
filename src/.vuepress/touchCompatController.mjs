export const createTouchCompatController = ({
  activate,
  schedule,
  delay = 80,
  movementThreshold = 12,
}) => {
  let startPoint = null;
  let activeTarget = null;
  let moved = false;
  let pendingToken = 0;

  const cancelPending = () => {
    pendingToken += 1;
    activeTarget = null;
    startPoint = null;
    moved = false;
  };

  return {
    touchStart(target, point) {
      cancelPending();
      activeTarget = target;
      startPoint = point;
    },

    touchMove(point) {
      if (!activeTarget || !startPoint) return;

      if (
        Math.abs(point.x - startPoint.x) > movementThreshold ||
        Math.abs(point.y - startPoint.y) > movementThreshold
      ) {
        moved = true;
      }
    },

    click(target) {
      if (target && target === activeTarget) cancelPending();
    },

    touchCancel() {
      cancelPending();
    },

    touchEnd(target, point, isDefaultPrevented = () => false) {
      const resolvedTarget = target || activeTarget;

      if (!resolvedTarget || moved) {
        cancelPending();
        return;
      }

      const token = ++pendingToken;
      activeTarget = resolvedTarget;

      schedule(() => {
        if (token !== pendingToken || isDefaultPrevented()) return;

        activeTarget = null;
        startPoint = null;
        activate(resolvedTarget, point);
      }, delay);
    },
  };
};
