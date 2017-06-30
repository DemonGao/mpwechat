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
    // that.login();
  },
  //登陆态验证   检测当前用户登录态是否有效
  checkSession(fn) {
    var that = this;
    //验证
    wx.checkSession({
      success: function () {
        //session 未过期，并且在本生命周期一直有效
        // console.log("session未过期");
        // console.log(wx.getStorageSync("session_3rd"))
        util.ajax('checkSession',{
          session_3rd: wx.getStorageSync("session_3rd")
        },'POST',function(res){
          console.log(res);
          if(res.data.code == "SUCCESS"){
            //检查是否有工作室 若无工作室则跳转到error页面
            that.checkIsFinancialPlanner();
            if (typeof fn == "function") fn()
          }else{
            that.login();
          } 
        })
      },
      fail: function () {
        //登录态过期 重新登录(获取登陆凭证)
        // console.log("session过期");
        that.login();
      }
    })
  },
  //获取登录凭证（code）
  login(fn) {
    var that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          let code = res.code;  //登录凭证（code）
          console.log(res.code);
          wx.getUserInfo({
            //获取用户信息
            success(res2) {
              //把加密串转成URI编码
              let encryptedData = encodeURIComponent(res2.encryptedData)
              let iv = res2.iv;
              //请求服务器进行登录处理,返回数据
              that.UserLogin(code, encryptedData, iv, fn)
            },
            fail: function () {
              console.log("授权失败");
              wx.reLaunch({
                url: '../common/error/error?type=userInfo'
              })
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
  UserLogin(code, encryptedData, iv, fn) {
    var that = this;
    //创建一个dialog
    wx.showToast({
      title: '正在登录...',
      icon: 'loading',
      duration: 8000
    });
    util.ajax('login', {
      code: code,
      session_3rd: wx.getStorageSync("session_3rd"),
      userInfoEncryptedData: encryptedData,
      userInfoIv: iv
    }, 'POST', function (res) {
      //success
      let result = res.data;
      //登陆验证成功 返回 session_3rd 并本地存储
      if (result.code === "SUCCESS") {
        //存储session_3rd
        console.log("session_3rd: "+result.body.session_3rd)
        wx.setStorageSync("session_3rd", result.body.session_3rd)
        if (typeof fn === 'function') fn();
      }
    }, function () {
      wx.hideToast();
    })
  },
  //检查是否有工作室
  checkIsFinancialPlanner() {
    util.ajax('checkIsFinancialPlanner', {
      session_3rd: wx.getStorageSync("session_3rd")
    }, 'POST', function (res) {
      if (res.data.code != "SUCCESS") {
        wx.reLaunch({
          url: '../common/error/error?type=notHaveWorkspace'
        })
      }
    }, function () {
      console.log("checkIsFinancialPlanner");
    })
  },
  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow(options) {
    var that = this
    // that.login();
    //用户进入场景值判断 options.scene
    switch (options.scene) {
      // 1044: 带shareTicket的小程序消息卡片
      case 1044:
        console.log("1044: 带shareTicket的小程序消息卡片");
        that.globalData.shareTicket = options.shareTicket;
        break;
      // default :
      //   //登陆态验证   检测当前用户登录态是否有效
      //   that.checkSession();
      //   break;
    }
  },
  //通过 1044: 带shareTicket的小程序消息卡片 过来的事件
  jumpSharePageFn(shareTicket, rankcb, groupcb) {
    var that = this;
    //微信分享信息
    wx.getShareInfo({
      shareTicket,
      fail(res) {
        console.log(res);
      },
      complete(res) {
        // console.log("分享：");
        // console.log(res)
        // console.log('shareTicket: \n' + that.globalData.shareTicket);
        that.checkSession(function(){
          wx.showLoading({
            title: '加载中',
          })
          //请求服务器 解密数据
          util.ajax('loadCurriculumRankingList', {
            openGIdEncryptedData: encodeURIComponent(res.encryptedData),
            openGIdIv: res.iv,
            session_3rd: wx.getStorageSync("session_3rd")
          }, 'POST', function (res) {
            // success
            if(res.data.code === "SUCCESS"){
              if (typeof rankcb === "function") rankcb(res)
            }
            
          }, function () {
            // complete
          })
          //请求服务器 解密数据
          util.ajax('loadGroupDynamics', {
            openGIdEncryptedData: encodeURIComponent(res.encryptedData),
            openGIdIv: res.iv,
            session_3rd: wx.getStorageSync("session_3rd"),
            start:0,
            limit:10
          }, 'POST', function (res) {
            // success
            console.info(res);
            if (typeof groupcb === "function") groupcb(res);
          }, function () {
            // complete
          })
          
        });
      }
    })
  },

})
