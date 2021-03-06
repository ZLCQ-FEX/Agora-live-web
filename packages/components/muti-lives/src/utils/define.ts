export type LiveConfig = {
    token?: string | null;
    channel: string;
    microphoneId?: string | undefined;
    cameraId?: string | undefined;
    resolution: string; // 具体分辨率参考 https://docs.agora.io/en/Voice/API%20Reference/web/interfaces/agorartc.stream.html#setvideoprofile
    muteVideo?: boolean;
    muteAudio?: boolean;
    uid?: string | number | null;
    host?: boolean; // 是否为主播
    beauty?: boolean; // 是否开启美颜
};

export enum Role {
    OWNER = 'owner', // 主播
    PLAYER = 'player', // 选手
    GUEST = 'guest', // 嘉宾
    VISITOR = 'visitor', // 访客
}
