// Data arrays are shared with the standalone demo; this invalidates reader
// derivations when live preview replaces their contents without remounting.
export const readerRuntime = $state({ revision: 0 });
