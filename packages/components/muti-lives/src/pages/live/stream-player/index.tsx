import React, { useState, useMemo, useEffect } from 'react';
import styles from './index.less';
import { Role } from '../../../utils/define';
import classnames from 'classnames';
import { Button } from 'antd';

import { Stream, StreamPlayError } from 'agora-rtc-sdk';

export interface IStreamPlayerProps {
    stream: Stream;
    domId: string;
    role: Role;
    onDisconnect?: (stream: Stream) => void; // 断开
    onCenterPosition?: Function; //c位设置
    onMix?: (stream: Stream) => void;
    className?: string;
}

const StreamPlayer = (props: IStreamPlayerProps) => {
    const { stream, domId, onCenterPosition, onDisconnect, onMix, role } = props;

    const [state, setState] = useState({
        audioMuted: false,
    });

    const [resume, changeResume] = useState(false);

    const [autoplay, changeAutoplay] = useState(false);

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

    const lockPlay = React.useRef(false);

    useEffect(() => {
        if (stream) {
            // 播放
            if (!stream.isPlaying()) {
                lockPlay.current = true;
                stream.play(domId, { fit: 'cover' }, (err: StreamPlayError | null) => {
                    if (err && err.status !== 'aborted') {
                        // 当为paused状态 浏览器策略 需要通过用户手势去触发播放
                        console.log('stream-player play failed ', domId);
                        changeAutoplay(true);
                    }
                    lockPlay.current = false;
                });
            }
            return () => {
                stream && stream.isPlaying() && stream.stop();
            };
        }
    }, [stream, domId]);

    // 自动播放
    const resumePlaying = () => {
        if (autoplay && !resume) {
            stream && stream.resume();
            changeResume(true);
        }
    };

    return (
        <div className={styles.streamContainer}>
            <div
                className={classnames(styles.playerCotainer, {
                    [styles.autoPlay]: autoplay,
                })}
                id={domId}
            ></div>
            <Button onClick={resumePlaying}>继续播放</Button>
            {Role.OWNER !== role ? (
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
            ) : null}
        </div>
    );
};

export default StreamPlayer;
