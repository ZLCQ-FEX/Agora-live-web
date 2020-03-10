import React, { useMemo, useEffect } from 'react';
import styles from './index.less';
import RTCClient from '../../utils/rtc-client';
import { LiveConfig, Role } from '../../utils/define';
import { connect, DispatchProp } from 'dva';
import { Button } from 'antd';
import CustomEvents from '../../utils/custom-events';
import { Stream, StreamPlayError } from 'agora-rtc-sdk';
import BypassPlayer from './bypass-player';

interface ILiveProps {
    liveConfig: LiveConfig;
    currentStream: Stream;
    [value: string]: any;
}

const Live = (props: ILiveProps & DispatchProp) => {
    const { liveConfig, currentStream } = props;

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
    const config: LiveConfig = useMemo((): LiveConfig => {
        return { ...liveConfig };
    }, [liveConfig]);

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

                stream.play('player', { fit: 'cover' }, (err: null | StreamPlayError) => {
                    if (err && err.status !== 'aborted') {
                        console.log('stream-player play failed. domId = player ');
                    }
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
            <Button onClick={startLocalStream}>start local stream</Button>
            <div id="player" className={styles.playerContainer} />
            <BypassPlayer
                role={Role.GUEST}
                domId={'other'}
                stream={currentStream}
                onDisconnect={onDisconnect}
                onCenterPosition={onCenterPosition}
                onMix={onMix}
            />
        </div>
    );
};

export default connect(({ liveConfig, streams }: any) => ({
    liveConfig: liveConfig,
    currentStream: streams.get('currentStream'),
}))(Live);
