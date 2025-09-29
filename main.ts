import "zep-script";
import { startState, STATE_INTRO } from "./poopgame";

// 맵에 있는 플레이어 수 확인
function canStartGame(): boolean {
  return App.players.length >= 2;
}

// 오브젝트(F키 상호작용) 이벤트
App.onObjectTouched.Add((player: ScriptPlayer, obj: ScriptGameObject) => {
  if (obj.text === "start") {   
    if (canStartGame()) {
      startState(STATE_INTRO); 
    } else {
      player.showCenterLabel("2명 이상일 때만 시작할 수 있습니다!");
    }
  }
});

