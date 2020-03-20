import { Stream } from 'agora-rtc-sdk';
import { fromJS, Map, List } from 'immutable';
const initState = () => {
    return fromJS({
        currentStream: null, // 主播当前流
        otherStreams: new Array(7), // 旁路流
        mixPoistion: {}, // 合流位置
    });
};

export default {
    namespace: 'streams',

    state: initState(),

    reducers: {
        addCurrentStream(state: Map<string, any>, action: Action) {
            const { stream } = action.payload;
            return state.set('currentStream', stream);
        },

        removeCurrentStream(state: Map<string, any>) {
            return state.set('currentStream', null);
        },

        removeOtherStream(state: Map<string, any>, action: Action) {
            // 移除某个流
            // 移除某一路流
            const { id, callback } = action.payload;
            const otherStreams: List<any> = state.get('otherStreams');
            const index = otherStreams.findIndex((stream: Stream) => {
                return stream && stream.getId() === id;
            });
            if (index !== -1) {
                callback && callback(true);
                return state.setIn(['otherStreams', index], null);
            } else {
                callback && callback(false);
                return state;
            }
        },

        addOtherStream(state: Map<string, any>, action: Action) {
            // 添加某个流
            const { stream, position, callback } = action.payload;
            const otherStreams: List<any> = state.get('otherStreams');
            if (position) {
                // 指定位置
                const positionStream = otherStreams.get(position);
                if (positionStream === undefined) {
                    callback && callback(true);
                    // 空位置
                    return state.setIn(['otherStreams', position], stream);
                } else {
                    callback && callback(false);
                    return state;
                }
            } else {
                // 不指定位置， 插入空余座位
                const emptyPosition = otherStreams.findIndex((obj: any) => {
                    return obj === undefined;
                });
                if (emptyPosition !== -1) {
                    callback && callback(true);
                    // 有空位置
                    return state.setIn(['otherStreams', emptyPosition], stream);
                } else {
                    // 无空位置
                    callback && callback(false);
                    return state;
                }
            }
        },

        updateMixPostion(state: any) {
            // 更换某个流的位置
            return {
                ...state,
            };
        },
    },

    effects: {},
};
