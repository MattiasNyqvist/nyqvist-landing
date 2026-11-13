/**
 * Wandering light: two large, very soft light patches drift slowly behind the
 * hero and change shape as they go (stretching, squashing, turning). Now and
 * then a patch fades out completely (no light at all) and later back in. The
 * result is a little life in the background without drawing attention.
 *
 * The fixed spotlight behind the intro line (.hero-intro::before in
 * css/hero.css) stays the strongest light. The patches stay in the left part of
 * the hero, close to it, and are much fainter.
 *
 * Cost: JavaScript only picks new target values every 13-20 seconds. The motion
 * itself is a long CSS transition on `transform` and `opacity`, which the
 * browser runs on the GPU - no repainting and no per-frame script.
 * Not started with `prefers-reduced-motion`; targets are skipped while the tab
 * is hidden.
 */
(function () {
  'use strict';

  /** Everything worth tuning. Ranges are [min, max]; a value is picked at random within them. */
  const CONFIG = {
    patches: 2,
    size: 400,                // px, diameter of a patch before it is stretched
    changeEvery: [13, 20],    // seconds between new targets; a move takes as long as the wait for the next one
    scaleX: [0.7, 1.4],       // stretch (width)
    scaleY: [0.45, 1.1],      // stretch (height)
    rotate: [-50, 50],        // degrees
    darkChance: 0.4,          // probability that a patch fades out completely at its next target
    brightness: [0.5, 1],     // opacity when a patch is lit
    // Where a patch centre may be, as fractions of the hero's size:
    areaX: [0.06, 0.5],       //   horizontally on desktop (the left column)
    areaXNarrow: [0.1, 0.9],  //   horizontally on narrow screens (single column)
    areaY: [0.3, 0.9],        //   vertically, weighted towards the intro line at the bottom
  };

  const DESKTOP_MIN_WIDTH = 1000;   // px; must match the breakpoint in css/hero.css

  /**
   * A random number within [min, max].
   * @param {number[]} range
   */
  function random(range) {
    return range[0] + Math.random() * (range[1] - range[0]);
  }

  /** Entry point, called from main.js. */
  function initLight() {
    const hero = document.querySelector('.hero');
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /** @type {HTMLElement[]} */
    const patches = [];
    for (let i = 0; i < CONFIG.patches; i++) {
      const patch = document.createElement('div');
      patch.className = 'light-patch';   // styled in css/hero.css
      patch.setAttribute('aria-hidden', 'true');
      patch.style.width = patch.style.height = `${CONFIG.size}px`;
      hero.appendChild(patch);
      patches.push(patch);
    }

    /**
     * Gives a patch a new random position, shape and brightness.
     * @param {HTMLElement} patch
     * @param {number} seconds  how long the move takes (0 = jump there at once)
     * @param {boolean} [forceLit]  never choose "no light" this time
     */
    const retarget = (patch, seconds, forceLit = false) => {
      const { width, height } = hero.getBoundingClientRect();
      const areaX = width >= DESKTOP_MIN_WIDTH ? CONFIG.areaX : CONFIG.areaXNarrow;
      const x = random(areaX) * width - CONFIG.size / 2;
      const y = random(CONFIG.areaY) * height - CONFIG.size / 2;
      const rotate = random(CONFIG.rotate);
      const scaleX = random(CONFIG.scaleX);
      const scaleY = random(CONFIG.scaleY);
      const dark = !forceLit && Math.random() < CONFIG.darkChance;

      patch.style.transition = seconds ? `transform ${seconds}s ease-in-out, opacity ${seconds}s ease-in-out` : 'none';
      patch.style.opacity = dark ? '0' : random(CONFIG.brightness).toFixed(2);
      patch.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px) rotate(${rotate.toFixed(0)}deg) scale(${scaleX.toFixed(2)}, ${scaleY.toFixed(2)})`;
    };

    /**
     * Retargets a patch again and again, at random intervals.
     * @param {HTMLElement} patch
     */
    function keepMoving(patch) {
      const wait = random(CONFIG.changeEvery);
      setTimeout(() => {
        if (!document.hidden) retarget(patch, wait);   // nobody is watching a hidden tab
        keepMoving(patch);
      }, wait * 1000);
    }

    patches.forEach((patch, index) => {
      // Start at a random place and shape without animating there. The first patch is always lit, so the page never starts dark.
      retarget(patch, 0, index === 0);
      keepMoving(patch);
    });
  }

  window.Site = window.Site || {};
  window.Site.initLight = initLight;
})();
