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
    [value: string]: any;
}

const Live = (props: ILiveProps & DispatchProp) => {
    const { currentStream } = props;

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
            '0067304632c61014fd59a9999658a3d4fd8IABhcnMNZoJ1VtQDiVqGnv3FxTKmDJrmjhs656jOfJCpfajv/7wAAAAAEAAI1SnxAf5qXgEAAQAA/mpe',
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
                const { dispatch } = props;
                // 通知redux
                dispatch({
                    type: 'streams/addCurrentStream',
                    payload: {
                        stream: stream,
                    },
                });
            },
        );
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

    // 切换角色
    const changeRole = (event: any) => {
        const role = event.target.value;
        localClient.setClientRole(role);
        changeConfig({
            ...config,
            host: role === 'host',
        });
    };

    // 加入房间
    const joinChannel = () => {
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
        localClient.publish();
    };

    // 离开房间
    const leaveChannel = () => {
        localClient
            .leave()
            .then(() => {
                message.success('退出频道成功');
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
            <StreamPlayer
                role={Role.GUEST}
                domId={'other'}
                stream={currentStream}
                onDisconnect={onDisconnect}
                onCenterPosition={onCenterPosition}
                onMix={onMix}
            />
            <Button onClick={startLocalStream}>start local stream</Button>
            <Button onClick={joinChannel}>加入房间</Button>
            <Button
                onClick={publish}
                type={'primary'}
                disabled={[false, 'pending'].includes(localClient.rtc.joined)}
            >
                开启直播
            </Button>
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
}))(Live);
