import { LiveConfig } from '../utils/define';

export default {
    namespace: 'liveConfig',

    state: {
        token: null,
        channel: '',
        microphoneId: undefined,
        cameraId: undefined,
        uid: null,
        host: true,
        muteAudio: true,
        muteVideo: false,
        beauty: true,
        resolution: '480p',
    } as LiveConfig,
};
