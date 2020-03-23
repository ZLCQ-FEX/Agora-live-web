import React, { useMemo, useEffect, useState } from 'react';
import styles from './index.less';
import RTCClient from '../../utils/rtc-client';
import { Role } from '../../utils/define';
import { connect, DispatchProp } from 'dva';
import { Button, Radio, message } from 'antd';
import CustomEvents from '../../utils/custom-events';
import { Stream } from 'agora-rtc-sdk';
import StreamPlayer from './stream-player';

const RadioGroup = Radio.Group;

message.config({
    maxCount: 1,
});

interface ILiveProps {
    currentStream: Stream;
    otherStreams: any;
    [value: string]: any;
}

const Live = (props: ILiveProps & DispatchProp) => {
    const { currentStream, otherStreams, dispatch } = props;

    // 初始化客户端
    const localClient = useMemo(() => {
        const client = new RTCClient();
        if (!client.created) {
            client.initClient();
            // 设置角色
            client.setClientRole('host');
            client.created = true;
        }
        return client;
    }, []);

    // 直播配置
    const [config, changeConfig] = useState({
        token:
            '0067304632c61014fd59a9999658a3d4fd8IADit3cXsX2wAwwQ0yknR/ROz04b1e45Y7EO12A5oL/FQ6jv/7wAAAAAEAAIXauOP+F5XgEAAQA+4Xle',
        channel: 'li',
        microphoneId: undefined,
        cameraId: undefined,
        uid: null,
        host: true,
        muteAudio: false,
        muteVideo: false,
        beauty: true,
        resolution: '480p',
    });

    // 开启监听
    const startObserving = () => {
        // 监听本地流初始化成功
        localClient.observeEvent(
            CustomEvents.LOCAL_STREAM_INITED,
            (_: string, params: { stream: Stream }) => {
                const { stream } = params;
                // 通知redux
                dispatch({
                    type: 'streams/addCurrentStream',
                    payload: {
                        stream: stream,
                    },
                });
            },
        );
        // 其他主播进入频道
        localClient.observeEvent('stream-added', (event: any) => {
            const stream: Stream = event.stream;
            const id = stream.getId();
            message.info(`有主播进入频道, ${id}`);
            // 判断是否是自己的id
            if (localClient.option.uid !== id) {
                // 添加其他嘉宾的流
                dispatch({
                    type: 'streams/addOtherStream',
                    payload: {
                        position: null, // 不传自动分配空位置
                        stream: stream,
                        callback: (success: boolean) => {
                            if (success) {
                                // 添加嘉宾的流成功
                                message.success(`成功添加 ${id} 嘉宾的流`);
                                // 订阅嘉宾
                                localClient.subscribeStream(
                                    stream,
                                    {
                                        video: true,
                                        audio: true,
                                    },
                                    err => {
                                        message.error(`订阅流失败, ${err}`);
                                    },
                                );
                                // 切换成小流
                                localClient.setRemoteVideoStreamType(stream, 1);
                            }
                        },
                    },
                });
            }
        });

        // 其他主播离开频道
        localClient.observeEvent('stream-removed', (event: any) => {
            const stream: Stream = event.stream;
            const id = stream.getId();
            message.info(`有主播离开频道, ${id}`);
            localClient.unsubcribeStream(stream, err => {
                message.error(`取消订阅流失败, ${err}`);
            });
        });

        // localClient.observeEvent('peer-online', (event: any) => {
        //     // 无stream {type: "peer-online", uid: XXX}
        // })

        localClient.observeEvent('peer-leave', (event: any) => {
            // const stream: Stream = event.stream
            const id = event.uid;
            // message.info(`有主播离开频道, ${id}`)
            // localClient.unsubcribeStream(stream, (err) => {
            //     message.error(`取消订阅流失败, ${err}`)
            // })
            dispatch({
                type: 'streams/removeOtherStream',
                payload: {
                    id,
                    callback: (success: boolean) => {
                        if (success) {
                            // 移除嘉宾的流成功
                            message.success(`成功移除 ${id} 嘉宾的流`);
                        }
                    },
                },
            });
        });
    };

    // 移除监听
    const removeObserve = () => {
        localClient.unObserveEvent(CustomEvents.LOCAL_STREAM_INITED, null);
    };

    // 开启本地流
    const startLocalStream = () => {
        localClient.createStream(config);
        // 监听事件
        startObserving();
    };

    // 关闭本地流
    const stopLocalStream = () => {
        localClient.stopLocalStream();
        dispatch({
            type: 'streams/removeCurrentStream',
        });
    };

    // 切换角色
    const changeRole = (event: any) => {
        const role = event.target.value;
        localClient.setClientRole(role);
        changeConfig({
            ...config,
            host: role === 'host',
        });
    };

    // 加入房间 会自动开启本地流
    const joinChannel = () => {
        // 监听事件
        startObserving();
        localClient
            .join(config)
            .then(() => {
                message.success('加入频道成功');
            })
            .catch(err => {
                if (err === 'INVALID_OPERATION') {
                    message.error('进入房间失败或已在房间内');
                } else {
                    message.error(`进入房间失败 ${err}`);
                }
            });
    };

    // 开启直播
    const publish = () => {
        localClient.publish((err: any) => {
            message.error(`推流到远端失败, ${err}`);
        });
    };

    // 离开房间
    const leaveChannel = () => {
        localClient
            .leave()
            .then(() => {
                message.success('退出频道成功');
                stopLocalStream();
            })
            .catch(err => {
                message.error(`${err}`);
            });
    };

    // 断开连接
    const onDisconnect = (stream: Stream) => {
        // 调用接口通知其他人
        stream.stop();
        stream.close();
        localClient.leave();
    };

    // C位
    const onCenterPosition = (stream: Stream) => {
        stream;
    };

    // 合流
    const onMix = (stream: Stream) => {
        stream;
    };

    // // 关闭本地流
    // const stopLocalStream = () => {
    //     localClient.stopLocalStream()
    // }

    useEffect(() => {
        // didmount
        //TODO:
        // unmount
        return () => {
            removeObserve();
        };
    }, []);
    return (
        <div className={styles.liveContainer}>
            <div className={styles.playerContainer}>
                <StreamPlayer role={Role.OWNER} domId={'owner'} stream={currentStream} />
            </div>
            <div className={styles.othersContainer}>
                {otherStreams.map((otherStream: Stream, streamPosition: number) => {
                    return (
                        <div
                            className={styles.othersStreamPlayer}
                            key={`otherStream-${streamPosition}`}
                        >
                            {otherStream ? (
                                <StreamPlayer
                                    role={Role.GUEST}
                                    domId={`other-${streamPosition}`}
                                    stream={otherStream}
                                    onDisconnect={onDisconnect}
                                    onCenterPosition={onCenterPosition}
                                    onMix={onMix}
                                />
                            ) : null}
                        </div>
                    );
                })}
            </div>
            <Button onClick={startLocalStream}>开启本地流（测试本地流）</Button>
            <Button onClick={stopLocalStream}>停止本地流</Button>
            <Button onClick={joinChannel}>加入房间</Button>
            <Button onClick={publish} type={'primary'} disabled={!localClient.rtc.joined}>
                推流到远端
            </Button>
            <Button disabled={!localClient.rtc.published}>停止推流到远端</Button>
            <Button onClick={leaveChannel}>离开房间</Button>
            <RadioGroup onChange={changeRole}>
                <Radio value="host">主播</Radio>
                <Radio value="audience">观众(此项目不考虑观众模式)</Radio>
            </RadioGroup>
        </div>
    );
};

export default connect(({ streams }: any) => ({
    currentStream: streams.get('currentStream'),
    otherStreams: streams.get('otherStreams'),
}))(Live);
