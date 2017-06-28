//app.js
//小程序的生命周期  注册程序
let shareTicket = '';
App({
  globalData: {
    API_URL:"123.207.169.191:3001/",
    userInfo: null,
    shareTicket: "",
    appId:"wxc3b7460bd268aece",
    secret:"",
    js_code:"",
    grant_type:"authorization_code"
  },
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch(options) {
    var that = this;
    wx.login({
      success: function (res) {
        
        if (res.code) {
          let code = res.code;  //登录凭证（code）
          wx.getUserInfo({
            //获取用户信息
            success(res2){
              //把加密串转成URI编码
              let encryptedData = encodeURIComponent(res2.encryptedData)
              let iv = res2.iv;
              //请求服务器进行登录处理,返回数据
              console.log("loginCode:\n" + res.code)
              console.log("userInfoiv:\n" + iv)
              console.log("userInfoencryptedData:\n"+encryptedData)
              // UserLogin(code, encryptedData, iv)
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })

    //用户进入场景值判断 options.scene
    if (options.scene == 1044) {
      console.log("1044: 带shareTicket的小程序消息卡片");
      that.globalData.shareTicket = options.shareTicket;
      wx.getShareInfo({
        shareTicket: that.globalData.shareTicket,
        fail(res){
          console.log(res);
        },
        complete(res) {
          console.log("分享：");
          console.log(res)
          console.log(that.globalData.shareTicket);
          //请求服务器 解密数据
          // wx.request({
          //   url: that.globalData.API_URL,
          //   data: {
          //     encryptedData: encryptedData,
          //     iv: iv
          //   },
          //   method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          //   header: {
          //     'content-type': 'application/json'
          //   }, // 设置请求的 header
          //   success(res) {
          //     // success
          //     console.log('服务器返回' + res.data);

          //   },
          //   fail() {
          //     // fail
          //     // wx.hideToast();
          //   },
          //   complete() {
          //     // complete
          //     wx.hideToast();
          //   }
          // })
        }
      })
    }
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow(options) {
    
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide() {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError(msg) {
    
  },
  getUserInfo(cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: true,
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },
  UserLogin(code, encryptedData, iv){
    var that = this;
    console.log('code=' + code + '&encryptedData=' + encryptedData + '&iv=' + iv);
    //创建一个dialog
    wx.showToast({
      title: '正在登录...',
      icon: 'loading',
      duration: 8000
    });
    //请求服务器
    wx.request({
      url: that.globalData.API_URL,
      data: {
        code: code,
        encryptedData: encryptedData,
        iv: iv
      },
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'content-type': 'application/json'
      }, // 设置请求的 header
      success(res) {
        // success
        console.log('服务器返回' + res.data);

      },
      fail(){
        // fail
        // wx.hideToast();
      },
      complete(){
        // complete
        wx.hideToast();
      }
    })
  },
})
