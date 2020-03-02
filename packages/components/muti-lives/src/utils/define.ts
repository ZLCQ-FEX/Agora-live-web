export type LiveConfig = {
  token?: string | null;
  channel: string;
  microphoneId?: string | number;
  cameraId?: string | number;
  resolution: any;
  muteVideo?: boolean;
  muteAudio?: boolean;
  uid?: string | number;
  host?: boolean; // 是否为主播
  beauty?: boolean; // 是否开启美颜
};
