//index.js
var util = require('../../utils/util.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    // 页面巨幕图片路径
    jumbotronSrc: './../../static/img/banner.png',
    // 选项卡参数设置
    tabSetting: {
      item: ['群排行', '群动态'],
      selectIndex: 0,
      rankHeight: '',
      btn: {
        defaultSize: 'default',
        primarySize: 'default',
        warnSize: 'default',
        disabled: false,
        plain: false,
        loading: false
      }
    },
    userInfo: null,
    showModalStatus: false,
    friendNum: undefined,
    result: {},  //个人排行榜
    load:true
  },
  //事件处理函数
  bindViewTap: function (e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      'tabSetting.selectIndex': index
    })
  },
  onShow:function(){
    var that = this;
    //获取屏幕高度
    let systemInfo = wx.getSystemInfoSync();
    let rankHeight = systemInfo.windowHeight - (systemInfo.screenWidth / 750) * (298 + 88 + 15) - 46;
    that.setData({
      'tabSetting.rankHeight': rankHeight + 'px'
    })
    console.log("rankHeight:" + rankHeight);
  }
  ,
  onLoad: function () {
    var that = this;
    //获取屏幕高度
    wx.getSystemInfo({
      success: function (res) {
        screenHeight = res.windowHeight;
        console.log(screenHeight)
        console.log(screenHeight - (wx.getSystemInfoSync().screenWidth / 750) * (298 + 88));
        var rankHeight = screenHeight - (wx.getSystemInfoSync().screenWidth / 750) * (298 + 88 + 15) - 46;
        console.log(rankHeight);
        that.setData({
          'tabSetting.rankHeight': rankHeight + 'px'
        })
      }
    })
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.setNavigationBarTitle({
      title: '加载中...'
    })
    //要求小程序返回分享目标信息
    wx.showShareMenu({
      withShareTicket: true
    })
    
    wx.showNavigationBarLoading()
    app.checkSession(function(res){
      //如果是理财师
      if (res.data.code === "SUCCESS") {
        console.log("是理财师");
        util.ajax('fpUserData', {
          session_3rd: wx.getStorageSync("session_3rd")
        }, 'POST', function (res) {
          console.log("11:" + res.data);
          if (res.data.code === 'SUCCESS') {
            that.setData({
              result: res.data.body,
              load: false,
            })
            wx.hideToast();
          } else {
            console.log("111");
            wx.hideToast();
            wx.showToast({
              title: '请稍后再试!'
            })
          }
        })
      } else {
        console.log("没有工作室");
        app.getUserInfo(function (userInfo) {
          console.log(userInfo)
          //更新数据
          that.setData({
            userInfo: userInfo,
            load: false,
          })
        })
        wx.hideToast(); 
      } 
    });
  },
  //转发函数
  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      //转发标题
      title: '快来看看你当前的获客排行吧',
      //desc
      desc: '快来看看你当前的获客排行吧!!',
      //转发路径
      path: '/pages/share/share',
      success: function (res) {
        // 转发成功
        console.log("转发成功!")
        console.log(JSON.stringify(res));
        console.log(res.shareTickets[0]);
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败!")
        console.log(JSON.stringify(res));
      },
      complete: function () {
        //转发结束后的回调函数
        console.log("转发操作!")
      }
    }
  }
})
