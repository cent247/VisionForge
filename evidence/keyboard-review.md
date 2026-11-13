# Keyboard and focused accessibility improvements

Timeline clip selection now uses native focusable buttons with descriptive names
including track, start and duration, plus aria-pressed selection state. Icon-only
add-at-playhead and zoom controls have explicit names. Keyboard focus has a
visible outline and the editor status is an atomic polite live region.

The global Space playback shortcut no longer intercepts activation of focused
buttons, links and disclosure controls. Global frame stepping remains available
while a clip button is focused. Text-entry controls retain their existing shortcut
exclusion.

Typecheck and production build passed before stock-component insertion. Seven
actual Electron keyboard checks passed (keyboard-desktop.json and .log), including
Enter/Space selection, focused zoom activation, focus outline, frame stepping,
live-region semantics and icon names. The final integrated build and regressions
must run after stock integration.

This is focused automated keyboard/DOM verification, not screen-reader acceptance,
native Windows assistive-technology acceptance or comprehensive accessibility
certification. Cross-track keyboard movement and full trim-handle keyboard
interaction remain outside this change; numeric clip controls remain available.
