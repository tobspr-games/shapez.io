import { GameState } from "../core/game_state";

export class WegameSplashState extends GameState {
    constructor() {
        super("WegameSplashState");
    }

    getInnerHTML() {
        return `
        <div class="wrapper">
            <strong>健康游戏忠告</strong>
            <div>抵制不良游戏,拒绝盗版游戏。</div>
            <div>注意自我保护,谨防受骗上当。</div>
            <div>适度游戏益脑,沉迷游戏伤身。</div>
            <div>合理安排时间,享受健康生活。</div>
        </div>
`;
    }
    onEnter() {
        setTimeout(
            () => {
                this.app.stateMgr.moveToState("PreloadState");
            },
            G_IS_DEV ? 1 : 6000
        );
    }
}
