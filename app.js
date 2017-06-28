//app.js
var util = require('utils/util.js')
//小程序的生命周期  注册程序
let shareTicket = '';
App({
  globalData: {
    API_URL: "https://xcx.d1money.com/", //请求服务器地址
    session_3rd: wx.getStorageSync('session_3rd'),  //获取本地存储的session_3rd
    userInfo: null,
    shareTicket: "",
  },
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch(options) {
    var that = this;
    //登陆态验证   检测当前用户登录态是否有效
    // that.checkSession();
    that.login();

    //用户进入场景值判断 options.scene
    if (options.scene == 1044) {
      console.log("1044: 带shareTicket的小程序消息卡片");
      that.globalData.shareTicket = options.shareTicket;
      wx.getShareInfo({
        shareTicket: that.globalData.shareTicket,
        fail(res) {
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
  },
  //获取用户信息
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
  //登陆态验证   检测当前用户登录态是否有效
  checkSession() {
    //验证
    wx.checkSession({
      success: function () {
        //session 未过期，并且在本生命周期一直有效
        console.log("session未过期");
      },
      fail: function () {
        //登录态过期 重新登录(获取登陆凭证)
        this.login();
      }
    })
  },
  //获取登录凭证（code）
  login() {
    var that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          let code = res.code;  //登录凭证（code）
          wx.getUserInfo({
            //获取用户信息
            success(res2) {
              //把加密串转成URI编码
              let encryptedData = encodeURIComponent(res2.encryptedData)
              let iv = res2.iv;
              //请求服务器进行登录处理,返回数据
              // console.log("loginCode:\n" + res.code)
              console.log("userInfoiv:\n" + iv)
              console.log("userInfoencryptedData:\n" + encryptedData)
              that.UserLogin(code, encryptedData, iv)
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },
  /**
   * 用户登陆
   * arguments:{
   *    code:String 登陆凭证
   *    session_3rd:String 登陆态状态码（用于第三方服务器和小程序之间做登陆态校验）
   *    encryptedData: 完整用户信息的加密数据（wx.getUserInfo）
   *    iv: 加密算法的初始向量(wx.getUserInfo)
   * }
   */
  UserLogin(code, encryptedData, iv) {
    var that = this;
    //创建一个dialog
    wx.showToast({
      title: '正在登录...',
      icon: 'loading',
      duration: 8000
    });
    util.ajax('services/hkphb/login', {
      code: code,
      session_3rd: that.globalData.session_3rd
    }, 'POST', function (res){
      //success
      let result = res.data;
      //登陆验证成功 返回 session_3rd 并本地存储
      if (result.code === "SUCCESS") {
        //存储session_3rd
        wx.setStorageSync("session_3rd", result.body.session_3rd)
        if (!result.body.hava_user_info) {
          console.log(that.globalData.session_3rd);
          //若hava_user_info为false 则 将encryptedData iv 保存到数据库
          util.ajax('services/hkphb/decodeAndSaveUserInfo',{
            session_3rd: wx.getStorageSync("session_3rd"),
            userInfoEncryptedData: encryptedData,
            userInfoIv: iv
          },'POST',function (res){
            //complete
            console.log("发送完整用户信息的加密数据给后台解析  -- 请求成功");
          })
        }
      }
    },function(){
      wx.hideToast();
    })
  },
  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow(options) {
    var that = this
    //登陆态验证   检测当前用户登录态是否有效
    that.checkSession();
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
})
