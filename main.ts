import "zep-script";
import { startState, STATE_INTRO } from "./poopgame";

// 2명 이상 체크
function canStartGame(): boolean {
  return App.players.length >= 2;
}

// 특정 타일 이벤트
App.onTileTouched.Add((player: Player, tileID: number, x: number, y: number) => {
  if (tileID === 123) { //맵에서 지정한 타일 ID
    if (canStartGame()) {
      startState(STATE_INTRO); // 똥피하기 시작
    } else {
      player.showCenterLabel("⚠️ 2명 이상일 때만 시작할 수 있습니다!");
    }
  }
});
