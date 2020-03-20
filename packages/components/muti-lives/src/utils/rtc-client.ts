import AgoraRTC, { Client, Stream } from 'agora-rtc-sdk';
import Pubsub from 'pubsub-js';
import EventList from './custom-events';
import { LiveConfig } from './define';

type RTC = {
    client: Client | null;
    joined: boolean;
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
    appId: string;
    uid: any;
    token: string;
    role: 'audience' | 'host';
    mode: 'live' | 'rtc';
    codec: 'h264' | 'vp8';
    beauty: boolean;
};

export default class RTCClient {
    public created: boolean; // 是否创建成功
    public rtc: RTC;
    public option: Option;

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
            appId: '7304632c61014fd59a9999658a3d4fd8',
            uid: null,
            token: '',
            role: 'audience',
            mode: 'live',
            codec: 'h264',
            beauty: false,
        };
        this.created = false;
    }

    public initClient = () => {
        this.rtc.client = AgoraRTC.createClient({
            codec: this.option.codec,
            mode: this.option.mode,
        });
        return this.rtc.client;
    };

    public destory = () => {
        // this.rtc.client = null;
        this.created = false;
    };

    // 监听事件
    public observeEvent = (event: any, callback: any) => {
        if (Object.values(EventList).includes(event)) {
            Pubsub.subscribe(event, callback);
        } else {
            this.rtc.client && this.rtc.client.on(event, callback);
        }
    };

    // 取消监听
    public unObserveEvent = (event: any, callback: any) => {
        if (Object.values(EventList).includes(event)) {
            Pubsub.unsubscribe(event, callback);
        } else {
            this.rtc.client && this.rtc.client.off(event, callback);
        }
    };

    // 设置用户角色
    public setClientRole = (role: 'audience' | 'host') => {
        this.rtc.client && this.rtc.client.setClientRole(role);
        this.option.role = role;
    };

    // 开启流
    public createStream = (config: LiveConfig) => {
        return new Promise((reslolve, reject) => {
            const { localStream } = this.rtc;
            if (localStream) {
                // 关闭之前存在的流
                this.stopLocalStream();
            }
            // 流配置
            const rtcStream = AgoraRTC.createStream({
                streamID: this.option.uid || 0,
                audio: true,
                video: true,
                screen: false,
                microphoneId: config.microphoneId,
                cameraId: config.cameraId,
            });
            // 设置分辨率
            if (config.resolution && config.resolution !== 'default') {
                rtcStream.setVideoProfile(config.resolution);
            }

            // 初始化
            rtcStream.init(
                () => {
                    this.rtc.localStream = rtcStream;
                    Pubsub.publish(EventList.LOCAL_STREAM_INITED, {
                        stream: rtcStream,
                    });
                    // 关闭摄像头
                    if (config.muteVideo === true) {
                        rtcStream.muteVideo();
                    }
                    // 关闭麦克风
                    if (config.muteAudio === true) {
                        rtcStream.muteAudio();
                    }
                    // if (config.beauty === true && this.option.beauty === false) {
                    //     // 未开启美颜
                    //     rtcStream.setBeautyEffectOptions(true, {
                    //         lighteningContrastLevel: 1,
                    //         lighteningLevel: 1,
                    //         smoothnessLevel: 1,
                    //         rednessLevel: 1,
                    //     });
                    //     this.option.beauty = true;
                    // }
                    reslolve && reslolve();
                },
                (err: AgoraErr) => {
                    reject(err);
                    console.error('init local stream failed ', err);
                },
            );
        });
    };

    // 关闭本地流
    public stopLocalStream = () => {
        const { localStream } = this.rtc;
        // const { beauty } = this.option;
        if (localStream) {
            if (this.rtc.joined) {
                this.stopPublishing((err: any) => {
                    console.log('停止推流失败', err);
                });
            }
            // stop前必须关闭美颜
            // if (beauty) {
            //     localStream.setBeautyEffectOptions(false, {});
            //     this.option.beauty = false;
            // }
            if (localStream.isPlaying()) {
                localStream.stop();
            }
            localStream.close();
            this.rtc.localStream = null;
        }
    };

    // 订阅流
    public subscribeStream = (
        stream: Stream,
        option: { video?: boolean; audio?: boolean },
        failedCallback: (err: string) => void,
    ) => {
        this.rtc.client!.subscribe(stream, option, failedCallback);
    };

    // 取消订阅
    public unsubcribeStream = (stream: Stream, failedCallback: (err: string) => void) => {
        this.rtc.client && this.rtc.client.unsubscribe(stream, failedCallback);
    };

    // 大小流
    public setRemoteVideoStreamType = (stream: Stream, type: 0 | 1) => {
        this.rtc.client && this.rtc.client.setRemoteVideoStreamType(stream, type);
    };

    // 获取设备信息, 在非直播时调用， 否则会中断
    public getDevices = () => {
        return new Promise(resolve => {
            if (!this.rtc.client) {
                // 初始化客户端
                this.initClient();
            }
            this.createTmpStream().then(() => {
                AgoraRTC.getDevices(devices => {
                    this.rtc.localStream!.close();
                    this.rtc.localStream = null;
                    resolve(devices);
                });
            });
        });
    };

    // 加入频道
    public join = (config: LiveConfig) => {
        return new Promise((resolve, reject) => {
            this.rtc.params = config;
            this.rtc.client!.init(
                this.option.appId,
                () => {
                    const { uid, token, channel, host } = config;
                    this.rtc.client!.join(
                        token || null,
                        channel,
                        uid || null,
                        channelUId => {
                            console.log(
                                'join channel: ' + channel + ' success, uid: ' + channelUId,
                            );
                            this.rtc.joined = true;
                            this.option.uid = channelUId;
                            config.uid = channelUId;
                            if (host) {
                                // 主播
                                this.createStream(config)
                                    .then(() => {
                                        // 开启双流
                                        this.enableDualStreams();
                                        // 设置小流的配置
                                        this.setLowStreamParameter();
                                        resolve();
                                    })
                                    .catch(err => {
                                        reject(err);
                                    });
                            } else {
                                resolve();
                            }
                        },
                        (err: string) => {
                            this.rtc.joined = false;
                            reject(err);
                            console.error('client join failed', err);
                        },
                    );
                },
                (err: string) => {
                    this.rtc.joined = false;
                    console.error('client init failed', err);
                    reject(err);
                },
            );
        });
    };

    // 推流
    public publish = (failedCallback: Function) => {
        const { client, localStream } = this.rtc;
        if (client && localStream) {
            client.publish(localStream, err => {
                this.rtc.published = false;
                failedCallback(err);
                console.log('推流失败', err);
            });
            this.rtc.published = true;
        }
    };

    // 停止推流
    public stopPublishing = (failedCallback: Function) => {
        const { client, localStream } = this.rtc;
        // const { beauty } = this.option
        if (!client || !localStream) {
            return;
        }
        // unpublish前必须关闭美颜
        // if (beauty) {
        //     localStream.setBeautyEffectOptions(false, {});
        //     this.option.beauty = false;
        // }
        client.unpublish(localStream, err => {
            failedCallback(err);
            console.log('停止推流失败', err);
        });
        this.rtc.published = false;
    };

    // 离开频道
    public leave = () => {
        const { client, localStream } = this.rtc;
        const { beauty } = this.option;
        return new Promise((resolve, reject) => {
            if (client) {
                //leave前需要先关闭美颜
                if (localStream && beauty) {
                    localStream.setBeautyEffectOptions(false, {});
                    this.option.beauty = false;
                }
                client.leave(
                    () => {
                        this.rtc.joined = false;
                        this.rtc.published = false;
                        this.option.uid = null;
                        this.destory();
                        resolve();
                    },
                    err => {
                        console.log('channel leave failed', err);
                        reject(err);
                    },
                );
            }
        });
    };

    // 在join后开启双流模式(大流/小流)
    private enableDualStreams = () => {
        this.rtc.client!.enableDualStream();
    };

    // 设置小流的帧率、码率和分辨率
    private setLowStreamParameter = () => {
        this.rtc.client!.setLowStreamParameter({
            width: 120,
            height: 120,
            framerate: 15,
            bitrate: 120,
        });
    };

    // 创建临时的流， 用于检测设备信息
    private createTmpStream = () => {
        return new Promise(resolve => {
            if (this.rtc.localStream) {
                // 关闭正在采集的本地流
                this.rtc.localStream.close();
            }
            // 创建rtc 流
            const tmpStream = AgoraRTC.createStream({
                audio: true,
                video: true,
                screen: false,
            });

            // 初始化本地流
            tmpStream.init(
                () => {
                    this.rtc.localStream = tmpStream;
                    resolve();
                },
                (err: AgoraErr) => {
                    console.error('init temporay stream failed ', err);
                },
            );
        });
    };
}
