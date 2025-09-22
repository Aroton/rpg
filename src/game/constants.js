(function(){
  const TILE_SIZE = 16;
  const MOVE_SPEED_PPS = 32; // 2 tiles/sec
  const ENCOUNTER_BASE_RATE = 0.6; // tuned for testing
  const STEP_THRESHOLD_MIN = 8;
  const STEP_THRESHOLD_MAX = 64;
  window.Game = window.Game || {};
  Game.Constants = { TILE_SIZE, MOVE_SPEED_PPS, ENCOUNTER_BASE_RATE, STEP_THRESHOLD_MIN, STEP_THRESHOLD_MAX };
})();
