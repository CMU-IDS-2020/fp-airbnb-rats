import { pointer, select } from "d3-selection";

export default function trackPointer(e, { start, move, out, end }) {
  const tracker = {},
    id = (tracker.id = e.pointerId),
    target = e.target;
  tracker.point = pointer(e, target);
  target.setPointerCapture(id);

  select(target)
    .on(`pointerup.${id} pointercancel.${id}`, (e) => {
      if (e.pointerId !== id) return;
      tracker.sourceEvent = e;
      select(target).on(`.${id}`, null);
      target.releasePointerCapture(id);
      end && end(tracker);
    })
    .on(`pointermove.${id}`, (e) => {
      if (e.pointerId !== id) return;
      tracker.sourceEvent = e;
      tracker.prev = tracker.point;
      tracker.point = pointer(e, target);
      move && move(tracker);
    })
    .on(`pointerout.${id}`, (e) => {
      if (e.pointerId !== id) return;
      tracker.sourceEvent = e;
      tracker.point = null;
      out && out(tracker);
    });

  start && start(tracker);
}
