import { Stream } from 'agora-rtc-sdk';
import { fromJS, Map } from 'immutable';
const initState = () => {
    return fromJS({
        currentStream: null, // 主播当前流
        otherStreams: {}, // 旁路流
        mixPoistion: {}, // 合流位置
    });
};

export default {
    namespace: 'streams',

    state: initState(),

    reducers: {
        removeStream(state: Map<string, any>, action: Action) {
            // 移除某一路流
            const { id, callback } = action.payload;
            const otherStreams: Map<string, any> = state.get('otherStreams');
            const index = otherStreams.valueSeq().findIndex((stream: Stream) => {
                return stream.getId() === id;
            });
            if (index !== -1) {
                callback && callback(true);
                return state.setIn(['otherStreams', index], null);
            } else {
                callback && callback(false);
                return state;
            }
        },

        addStream(state: Map<string, any>, action: Action) {
            const { stream, position, callback } = action.payload;
            const otherStreams = state.get('otherStreams');
            const positionStream = otherStreams.get(position);
            if (positionStream === undefined) {
                callback && callback(true);
                // 空位置
                return state.setIn(['otherStreams', position], fromJS(stream));
            } else {
                callback && callback(false);
            }
        },

        updateMixPostion(state: any) {
            // 更换合流位置
            return {
                ...state,
            };
        },
    },

    effects: {},
};
