declare module '*.css';
declare module '*.png';
declare module '*.less';
declare module '*.svg';
declare module 'pubsub-js' {
  const pubsub: {
    subscribe: Function;
    subscribeOnce: Function;
    unsubscribe: Function;
    publish: Function;
  };
  export default pubsub;
}
