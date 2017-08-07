//app.js
var util = require('utils/util.js')
//小程序的生命周期  注册程序
let shareTicket = '';
App({
  globalData: {
    session_3rd: wx.getStorageSync('session_3rd'),  //获取本地存储的session_3rd
    userInfo: null,
    shareTicket: "",  //当前用户缓存的
    scene:0,
  },
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch(options) {
    // var that = this;
    wx.showShareMenu({
      withShareTicket: true
    })
    util.log("onLaunch--shareTicket：" + options.shareTicket)
    wx.setStorageSync("d1money_shareTicket", options.shareTicket);
  },
  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow(options) {
    var that = this;
    that.globalData.scene = options.scene;
    util.log("入口号：" + options.scene)
    // util.log("that.globalData.scene:" + that.globalData.scene)
    // that.globalData.shareTicket = null;
    //要求小程序返回分享目标信息
    
    //用户进入场景值判断 options.scene
    switch (options.scene) {
      // 1044: 带shareTicket的小程序消息卡片
      case 1044:
        util.log("1044: 带shareTicket的小程序消息卡片: options.shareTicket" + options.shareTicket);
        util.log("1044: 带shareTicket的小程序消息卡片: d1money_shareTicket" + wx.getStorageSync("d1money_shareTicket"));
        that.globalData.shareTicket = wx.getStorageSync("d1money_shareTicket");
        break;
    }
  },
  //登陆态验证   检测当前用户登录态是否有效
  checkSession(fn) {
    var that = this;
    //验证
    wx.checkSession({
      success: function () {
        // session 未过期，并且在本生命周期一直有效
        util.log("checkSession方法：wx.checkSession未过期 " + wx.getStorageSync("session_3rd"));
        util.log('ajax:checkSession');
        util.ajax('checkSession', {
          session_3rd: wx.getStorageSync("session_3rd")
        }, 'POST', function (res) {
          // 如果session_3rd未过期
          if (res.data.code == "SUCCESS") {
            util.log("session_3rd未过期，调用app.checkIsFinancialPlanner函数");
            
            //检查是否有工作室 若无工作室则跳转到error页面
            that.checkIsFinancialPlanner(fn);
          } else {
            //session_3rd 过期或者未授权
            util.log("session_3rd已过期，调用app.login函数");
            that.login(fn);
          }
        })
      },
      fail: function () {
        //登录态过期 重新登录(获取登陆凭证)
        // util.log("session过期");
        that.login(fn);
      },
      complete: function () {
        //接口调用结束的回调函数（调用成功、失败都会执行）
        
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
          util.log(res.code);
          wx.getUserInfo({
            //获取用户信息
            success(res2) {
              util.log(res2.userInfo);
              wx.setStorageSync("d1money_userInfo", res2.userInfo);
              //把加密串转成URI编码
              let encryptedData = encodeURIComponent(res2.encryptedData)
              let iv = res2.iv;
              //请求服务器进行登录处理,返回数据
              that.UserLogin(code, encryptedData, iv, fn)
            },
            fail: function () {
              util.log("授权失败");
              wx.reLaunch({
                url: '../common/error/error?type=userInfo'
              })
            }
          })
        } else {
          util.log('获取用户登录态失败！' + res.errMsg)
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
        util.log("session_3rd: " + result.body.session_3rd)
        wx.setStorageSync("session_3rd", result.body.session_3rd)
        //检查是否有工作室 若无工作室则跳转到error页面
        that.checkIsFinancialPlanner(fn);
      }
    }, function () {
      // wx.hideToast();
    })
  },
  //检查是否有工作室(理财师)
  checkIsFinancialPlanner(fn) {
    util.ajax('checkIsFinancialPlanner', {
      session_3rd: wx.getStorageSync("session_3rd")
    }, 'POST', function (res) {
      if (typeof fn === 'function') fn(res);
     
    }, function () {
      //complete
      // wx.hideToast();
      util.log("checkIsFinancialPlanner");
    })
  },
  
  //通过 1044: 带shareTicket的小程序消息卡片 过来的事件
  jumpSharePageFn(shareTicket, rankcb, groupcb) {
    var that = this;
    //微信分享信息
    wx.getShareInfo({
      shareTicket,
      fail(res) {
        wx.hideLoading();
        // util.log(res);
        util.log("wx.getShareInfo获取失败");
        wx.reLaunch({
          url: '../index/index'
        })
      },
      success(res) {
        // util.log("分享：");
        // util.log(res)
        // util.log('shareTicket: \n' + that.globalData.shareTicket);
        that.checkSession(function (result) {
          wx.showLoading({
            title: '加载中',
          })
          // util.log("------- 分享信息 encryptedData iv session_3rd-----------");
          // util.log(encodeURIComponent(res.encryptedData));
          // util.log(res.iv);
          // util.log(wx.getStorageSync("session_3rd"));
          //请求服务器 解密数据
          util.ajax('loadCurriculumRankingList', {
            openGIdEncryptedData: encodeURIComponent(res.encryptedData),
            openGIdIv: res.iv,
            session_3rd: wx.getStorageSync("session_3rd")
          }, 'POST', function (res) {
            // success
              if (typeof rankcb === "function") rankcb(res)
          }, function () {
            // complete
            // 获取群动态
            util.ajax('loadGroupDynamics', {
              openGIdEncryptedData: encodeURIComponent(res.encryptedData),
              openGIdIv: res.iv,
              session_3rd: wx.getStorageSync("session_3rd"),
              start: 0,
              limit: 10
            }, 'POST', function (res) {
              // success
              
              if (typeof groupcb === "function") groupcb(res);
            }, function () {
              // complete

            })

          });
        })

      }
    })
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  }
})
