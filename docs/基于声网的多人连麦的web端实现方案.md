## 基于声网的多人连麦的web端实现方案

### 1. 初始化

- **初始化agora客户端**

  ```javascript
  // 生成客户端实例
  this.rtc.client = AgoraRTC.createClient({
      codec， // 编码方式  h264|vp8
      mode， // 直播模式 live | rtc
  });
  
  // 客户端初始化
  init(
      appId: string,
      onSuccess?: () => void,
      onFailure?: (err: string) => void
  ): void;
  ```

- **设置角色(也可以在加入频道后调用，host切换audience会自动断流，并触发事件)**

  ```javascript
  setClientRole(role: "audience" | "host", callback?: (err?: string | null) => void): void;
  ```

- **向后端请求配置**

  > 请求`token`和`channelId`

- **加入频道**

  ```javascript
  join(
      tokenOrKey: string | null,
      channel: string,
      uid: number | string | null,
      onSuccess?: (uid: number | string) => void,
      onFailure?: (err: string) => void
  ): void;
  ```

-  **开启本地物理设备**

  ```javascript
   if (localStream) {
      // 关闭之前存在的流
      this.stopLocalStream();
  }
  // 流配置
  const rtcStream = AgoraRTC.createStream({
      streamID: this.option.uid,  // 传空系统分配
      audio: true,
      video: true,
      screen: false,
      microphoneId: config.microphoneId, // 可不传
      cameraId: config.cameraId, // 可不传
  });
  ```

- **设置分辨率（默认480p）**

  ```javascript
  // 设置分辨率
  if (config.resolution && config.resolution !== 'default') {
      rtcStream.setVideoProfile(config.resolution);
  }
  ```

- **设置mic采样率等一系列参数（暂时没有实现，需求没有要求）**

- **本地流初始化（同时可以开启声网自带美颜）**

  ```javascript
  // 初始化
  rtcStream.init(
      () => {
          this.rtc.localStream = rtcStream;
          Pubsub.publish(EventList.LOCAL_STREAM_INITED, {
              stream: rtcStream,
          });
          // 关闭摄像头
          if (config.muteVideo === true) {
              rtcStream.muteVideo();
          }
          // 关闭麦克风
          if (config.muteAudio === true) {
              rtcStream.muteAudio();
          }
          if (config.beauty === true) {
              // 美颜
              rtcStream.setBeautyEffectOptions(true, {
                  lighteningContrastLevel: 1,
                  lighteningLevel: 0.7,
                  smoothnessLevel: 0.5,
                  rednessLevel: 0.1,
              });
              this.option.beauty = true;
          }
          reslolve && reslolve();
      },
      (err: AgoraErr) => {
          reject(err);
          console.error('init local stream failed ', err);
      },
  );
  });
  ```

- **推流到远端**

### 2. 与其他主播互动

> 连麦互动会有至少两名主播在直播间，这时候需要我们在进入频道前监听client的`stream-added`的事件，来
>
> `subscribe`每个`stream`

- **拉取其他主播的流**

  ```javascript
  // 订阅流
  public subscribeStream = (
      stream: Stream,
      option: { video?: boolean; audio?: boolean },
      failedCallback: (err: string) => void,
  ) => {
      this.rtc.client!.subscribe(stream, option, failedCallback);
  };
  ```

-  **展示所有订阅的流**

- **监听每个主播状态的变化事件**

  > 包括 加入频道、离开频道、打开/关闭麦、断流、网络不稳定等

  - 加入频道

    加入频道的主播，在拿到`stream`后，订阅音视频，然后渲染到相应的位置

  - 离开频道

    离开频道的主播， 取消订阅流，并从视图中删除

  - 断流

    如果判断某一位正在合流的主播的流断了，该流将退出合流，其余操作待定

  - 网络不稳定

    网络不稳定需要给出提示? 

- **操作其他主播的流**

  > 包括 禁/开麦、合流 /调整合流位置、 断开连接、 C位

  - 开/禁麦

    发送消息到被禁言的用户端，调用声网的`mute/unmuteAudio`方法

  - 合流

    根据id和位置，配置合流的布局，将合流推到CDN，观众端直接选择拉此流

  - C位

    默认C位是主播，其他人选择C位，需要和主播调换位置，其余的操作不用变

### 3. 异常情况

 -  某一主播被系统封禁
 -  

### 4. 结束直播

