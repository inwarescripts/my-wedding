// GSAP ScrollTrigger defaults to watching the window's scroll. That's correct
// on the public site (the page itself scrolls), but the admin editor renders
// this same tree inside a fixed-height `overflow-y-auto` preview pane — the
// window never scrolls there, only that inner div does. Without telling
// ScrollTrigger which element to watch, every scroll-driven reveal/parallax
// silently never fires inside the editor. Walk up to the nearest scrollable
// ancestor so the same component works correctly in both places.
export function getScrollContainer(el: Element): HTMLElement | Window {
  let node = el.parentElement;
  while (node) {
    const style = window.getComputedStyle(node);
    const scrollsY = /(auto|scroll)/.test(style.overflowY);
    if (scrollsY && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return window;
}
