import AgoraRTC, { Client, Stream } from 'agora-rtc-sdk';
import Pubsub from 'pubsub-js';
import EventList from './custom-events';
// import { LiveConfig } from './define'

type RTC = {
  client: Client | null;
  joined: boolean | 'pending';
  published: boolean;
  localStream: Stream | null;
  remoteStreams: Array<any>;
  params: any;
};

type AgoraErr = {
  type: 'warning' | 'error';
  msg: string;
  info?: string;
};

type Option = {
  appId: string | undefined;
  channel: string;
  uid: any;
  token: string;
  role: 'audience' | 'host';
  mode: 'live' | 'rtc';
  codec: 'h264' | 'vp8';
};

export default class RTCClient {
  private rtc: RTC;
  private option: Option;
  private created: boolean; // 是否创建成功

  constructor() {
    this.rtc = {
      client: null,
      joined: false,
      published: false,
      localStream: null,
      remoteStreams: [],
      params: {},
    };
    this.option = {
      appId: process.env.AGORA_ID || '',
      channel: '',
      uid: null,
      token: '',
      role: 'audience',
      mode: 'live',
      codec: 'h264',
    };
    this.created = false;
  }

  public init = () => {
    this.rtc.client = AgoraRTC.createClient({
      codec: this.option.codec,
      mode: this.option.mode,
    });
    return this.rtc.client;
  };

  public destory = () => {
    this.rtc.client = null;
    this.created = false;
  };

  // 监听事件
  public observeEvent = (event: any, callback: (evt: any) => void) => {
    if (Object.values(EventList).includes(event)) {
      Pubsub.subscribe(event, callback);
    } else {
      this.rtc.client && this.rtc.client.on(event, callback);
    }
  };

  // 设置用户角色
  public setClientRole = (role: 'audience' | 'host') => {
    this.rtc.client && this.rtc.client.setClientRole(role);
    this.option.role = role;
  };

  // // 开启流
  // public createStream = (config: LiveConfig) => {
  //     return new Promise((reslolve, reject) => {

  //     })
  // }

  // // 加入频道
  // public join = (config: LiveConfig) => {
  // }
}
