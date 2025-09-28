/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./poopgame.ts
const poop = App.loadSpritesheet("poop.png");
const tomb = App.loadSpritesheet("tomb.png", 32, 48, {
  left: [0],
  right: [0],
  up: [0],
  down: [0]
});
const STATE_INIT = 3000;
const STATE_READY = 3001;
const STATE_PLAYING = 3002;
const STATE_JUDGE = 3004;
const STATE_END = 3005;
const STATE_INTRO = 3006;
let _state = STATE_INIT;
let _level = 1;
let _levelTimer = 15;
let _levelAddTimer = 0;
let _start = false;
let _ending = false;
let _timer = 5;
let _poops = (/* unused pure expression or super */ null && ([]));
let _stateTimer = 0;
let _genTime = 0;
let _dropTime = 0;
let _flushTime = 0;
let _viewPlayer = false;
let _viewTimer = 1;
let _viewAddTimer = 0;
let _live = 0;
let _liveList = "";
let lastSurvivor = null;
let _widget = null;
let _widget2 = null;
let _players = App.players;
let poopkeys = [];
function customShowLabelWithRadius(player, str, width, radius) {
  if (player.isMobile) {
    width = 100;
  }
  const spanStyle = `<span style="
    position: absolute;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    width: ${width}%;
    top: 200px;
    left: ${(100 - width) / 2}%;
    background-color: rgba(0, 0, 0, 0.6);
    flex-direction: column;
    border-radius: ${radius}px;">
  `;
  const res = spanStyle + str + "</span>";
  player.showCustomLabel(res, 0xffffff, 0x000000, -150, 100, 1);
}
function showLabel(str) {
  for (let i in _players) {
    const p = _players[i];
    customShowLabelWithRadius(p, str, 40, 14);
  }
}
function startState(state) {
  _state = state;
  _stateTimer = 0;
  if (_widget) {
    _widget.destroy();
    _widget = null;
  }
  switch (_state) {
    case STATE_INTRO:
      showLabel("\n 미니게임 - 똥피하기 \n\n");
      App.playSound("intro.ogg");
      _start = true;
      break;
    case STATE_INIT:
      showLabel("- 게임목표 - \n\n 위에서 떨어지는 똥을 피해 마지막까지 생존하세요 \n\n ( 잠시 후 게임이 시작됩니다 )");
      _stateTimer = 0;
      _genTime = 0;
      _dropTime = 0;
      _timer = 90;
      for (let i in _players) {
        let p = _players[i];
        p.tag = {
          alive: true
        };
      }
      break;
    case STATE_PLAYING:
      break;
    case STATE_JUDGE:
      ZepMap.clearAllObjects();
      App.playSound("result.ogg", false);
      if (_live == 1 && lastSurvivor) {
        showLabel(`- 최종 생존자는 - \n\n ${lastSurvivor.name}`);
      } else if (_live == 0) {
        showLabel(`생존자가 없습니다.`);
      } else {
        showLabel(`- 최종 생존자는 - \n\n ${_liveList}`);
      }
      break;
    case STATE_END:
      _start = false;
      for (let i in _players) {
        let p = _players[i];
        p.sprite = null;
        p.moveSpeed = 80;
        p.sendUpdated();
      }
      App.stopSound();
      break;
  }
}
App.onInit.Add(() => {
  if (_widget) {
    _widget.destroy();
    _widget = null;
  }
});
App.onJoinPlayer.Add(p => {
  if (_start) {
    p.tag = {
      alive: false
    };
    p.moveSpeed = 20;
    p.sprite = tomb;
  } else {
    p.moveSpeed = 80;
    p.sprite = null;
  }
  p.sendUpdated();
  _players = App.players;
});
App.onLeavePlayer.Add(p => {
  p.title = null;
  p.sprite = null;
  p.moveSpeed = 80;
  p.sendUpdated();
  _players = App.players;
});
App.onAppObjectTouched.Add((player, key, x, y, tileID) => {
  if (player.tag.alive) {
    _viewPlayer = true;
    _viewAddTimer = 0;
    player.tag.alive = false;
    player.sprite = tomb;
    player.moveSpeed = 20;
    player.sendUpdated();
    App.playSound("poopp.mp3");
    if (checkSuvivors() !== 1) {
      showLabel(`${player.name} 님 탈락!`);
    }
  }
});
App.onDestroy.Add(() => {
  ZepMap.clearAllObjects();
  if (_widget) {
    _widget.destroy();
    _widget = null;
  }
  App.stopSound();
});
function checkSuvivors() {
  if (!_start) return;
  let alive = 0;
  for (let i in _players) {
    const p = _players[i];
    if (!p.sprite) {
      lastSurvivor = p;
      ++alive;
    }
  }
  return alive;
}
function broardCastingSuvivors() {
  if (!_start) return;
  _liveList = "";
  for (let i in _players) {
    const p = _players[i];
    if (p.tag.alive) {
      _liveList += p.name + " ";
    }
  }
}
App.onUpdate.Add(dt => {
  if (!_start) return;
  _stateTimer += dt;
  switch (_state) {
    case STATE_INTRO:
      if (_stateTimer >= 3) startState(STATE_INIT);
      break;
    case STATE_INIT:
      if (_stateTimer >= 3) startState(STATE_PLAYING);
      break;
    case STATE_PLAYING:
      if (!_viewPlayer) {
        if (_level < 6) {
          showLabel(`- 레벨 ${_level} - \n ${_timer} 초`);
        } else {
          showLabel(`- 최고레벨 - \n ${_timer} 초`);
        }
      }
      _genTime -= dt;
      if (_genTime <= 0) {
        _genTime = Math.random() * (0.5 - _level * 0.05);
        const rand_X = Math.floor(ZepMap.width * Math.random());
        const poopkey = new Date().getTime() + Math.random();
        poopkeys.push(poopkey);
        ZepMap.putObjectWithKey(rand_X, 0, poop, {
          overlap: true,
          movespeed: 80 + _level * 10,
          key: poopkey
        });
        ZepMap.moveObjectWithKey(poopkey, rand_X, ZepMap.height - 1, false);
      }
      _flushTime += dt;
      if (_flushTime >= 3) {
        _flushTime = 0;
        for (let i = 0; i < poopkeys.length; i++) {
          const key = poopkeys[i];
          if (ZepMap.getObjectWithKey(key).tileY == ZepMap.height - 1) {
            ZepMap.putObjectWithKey(ZepMap.getObjectWithKey(key).tileX, ZepMap.height - 1, null, {
              key
            });
            poopkeys.splice(i--, 1);
          }
        }
      }
      _levelAddTimer += dt;
      if (_levelAddTimer >= _levelTimer) {
        _level++;
        _levelAddTimer = 0;
        if (_level > 6) _level = 6;
      }
      _live = checkSuvivors();
      if (_live == 1 || _live == 0) {
        startState(STATE_JUDGE);
      } else {
        if (_stateTimer >= 1) {
          _stateTimer = 0;
          _timer--;
          if (_timer <= 0) {
            broardCastingSuvivors();
            startState(STATE_JUDGE);
          }
        }
      }
      if (_viewPlayer) {
        _viewAddTimer += dt;
        if (_viewAddTimer >= _viewTimer) {
          _viewAddTimer = 0;
          _viewPlayer = false;
        }
      }
      break;
    case STATE_JUDGE:
      if (_stateTimer >= 5) startState(STATE_END);
      break;
  }
});
;// ./main.ts

function canStartGame() {
  return App.players.length >= 2;
}
App.onTileTouched.Add((player, tileID, x, y) => {
  if (tileID === 123) {
    if (canStartGame()) {
      startState(STATE_INTRO);
    } else {
      player.showCenterLabel("⚠️ 2명 이상일 때만 시작할 수 있습니다!");
    }
  }
});
/******/ })()
;