import React, { useState, useMemo, useEffect } from 'react';
import styles from './index.less';
import { Role } from '../../../utils/define';

import { Stream, StreamPlayError } from 'agora-rtc-sdk';

export interface IBypassPlayerProps {
    stream: Stream;
    domId: string;
    role: Role;
    onDisconnect: (stream: Stream) => void; // 断开
    onCenterPosition: Function; //c位设置
    onMix: (stream: Stream) => void;
}

const BypassPlayer = (props: IBypassPlayerProps) => {
    const { stream, domId, onCenterPosition, onDisconnect, onMix, role } = props;

    const [state, setState] = useState({
        audioMuted: false,
    });

    const muteAudio = (mute: boolean) => {
        setState({
            audioMuted: mute,
        });
    };

    // 按钮配置
    const actionConfig = useMemo(() => {
        return [
            {
                title: 'C位',
                enable: true,
                action: onCenterPosition,
                icon: '',
            },
            {
                title: '合流',
                enable: true,
                action: onMix,
                icon: '',
            },
            {
                title: state.audioMuted ? '打开' : '关闭',
                enable: true,
                action: muteAudio,
                icon: '',
            },
            {
                title: '断开',
                enable: [Role.GUEST, Role.PLAYER].includes(role),
                action: onDisconnect,
                icon: '',
            },
        ];
    }, [state, role]);

    useEffect(() => {
        if (stream && !stream.isPlaying()) {
            // 播放
            stream.play(domId, { fit: 'cover' }, (err: StreamPlayError | null) => {
                if (err && err.status === 'aborted') {
                    console.log('stream-player play failed ', domId);
                }
            });
        }
        return () => {
            stream && stream.isPlaying() && stream.stop();
        };
    }, [stream, domId]);

    return (
        <div className={styles.bypassContainer}>
            <div className={styles.playerCotainer} id={domId || ''}></div>
            <div className={styles.menu}>
                {actionConfig.map((singleActionConfig, menuIdx: number) => {
                    const {
                        title,
                        enable,
                        // icon,
                        action,
                    } = singleActionConfig;
                    return (
                        <div
                            key={`menuItem-${menuIdx}`}
                            onClick={() => enable && action && action(stream)}
                            className={styles.actionBtn}
                        >
                            <img className={styles.actionIcon} src="" />
                            <div className={styles.actionDes}>{title}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BypassPlayer;
