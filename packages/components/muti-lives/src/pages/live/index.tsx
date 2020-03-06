import React, { useMemo, useEffect } from 'react';
import styles from './index.less';
import RTCClient from '../../utils/rtc-client';
import { LiveConfig } from '../../utils/define';
import { connect } from 'dva';
import { Button } from 'antd';
import CustomEvents from '../../utils/custom-events';
import { Stream, StreamPlayError } from 'agora-rtc-sdk';
// import BypassPlayer from './bypass-player'

interface ILiveProps {
    liveConfig: LiveConfig;
    [value: string]: any;
}

const Live = (props: ILiveProps) => {
    const { liveConfig } = props;

    // 初始化客户端
    const localClient = useMemo(() => {
        const client = new RTCClient();
        if (!client.created) {
            client.initClient();
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
        <div id="player" className={styles.playerContainer}>
            <Button onClick={startLocalStream}>start local stream</Button>
        </div>
    );
};

export default connect(({ liveConfig }: any) => ({
    liveConfig: liveConfig,
}))(Live);
