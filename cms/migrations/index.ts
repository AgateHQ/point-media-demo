import * as migration_20261104_074435_initial from './20261104_074435_initial';

export const migrations = [
  {
    up: migration_20261104_074435_initial.up,
    down: migration_20261104_074435_initial.down,
    name: '20261104_074435_initial'
  },
];
