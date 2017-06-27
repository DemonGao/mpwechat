//index.js
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
      },
      data: [
        {
          nickName: '韩帅帅',
          type: 1,
          friendNum: 197,
          newclientNum: 29,
          allclientNum: 159
        },
        {
          nickName: '韩帅帅',
          type: 0,
          friendNum: 197,
          newclientNum: 29,
          allclientNum: 159
        },
      ],
      data1: [
        
      ]
    },
    userInfo: {},
    showModalStatus: false,
    friendNum: undefined,
    result: { //个人排行榜
      friendNum: 22,
      newclientNum: 46,
      allclientNum: 110
    }
  },
  //事件处理函数
  bindViewTap: function (e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      'tabSetting.selectIndex': index
    })
  },
  onLoad: function () {
    var that = this
    //要求小程序返回分享目标信息
    wx.showShareMenu({
      withShareTicket: true
    })
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
    //获取屏幕高度
    var screenHeight = wx.getSystemInfo({
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
  },
  //转发函数
  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      //转发标题
      title: '排行榜',
      //desc
      desc: '看看你当前的排行吧!',
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
