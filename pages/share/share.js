//index.js
var util = require('../../utils/util.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    // 页面巨幕图片路径
    jumbotronSrc: './../../static/img/banner.png',
    // 选项卡参数设置
    tabSetting: {
      item: ['群排行', '群动态'],
      selectIndex: 0,
      rankHeight: '',
      btn: {
        btnText: '签到',
        defaultSize: 'default',
        primarySize: 'default',
        warnSize: 'default',
        disabled: true,
        plain: false,
        loading: false
      },
      groupdata: [],
      rank: {  //群排行
        data: [],
        load: true
      },
      dynamicgroup: {//群动态
        data: [],
        load: true,           //初始化加载loadding
        loadNextPage: false,  //上拉刷新加载loadding
        PageNum: 0,           //当前页数
        Total: 0               //总页数
      }
    },
    showModalStatus: false,
    friendNum: undefined,
    IsFinancialPlanner:false, //是否是理财师
    userInfo:null,            //非理财师用户信息
    currentuserId:null        //当前理财师的userId
  },
  //事件处理函数
  bindViewTap: function (e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      'tabSetting.selectIndex': index
    })
  },
  onLoad: function(){
    var that = this;
    wx.showShareMenu({
      withShareTicket: true,
    })
    //获取屏幕高度
    let systemInfo = wx.getSystemInfoSync();
    let rankHeight = systemInfo.windowHeight - (systemInfo.screenWidth / 750) * (298 + 88 + 15) - 46;
    that.setData({
      'tabSetting.rankHeight': rankHeight + 'px',
      
    })
  },
  onShow: function () {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    that.checkIsSign();
    // //要求小程序返回分享目标信息
    // wx.showShareMenu({
    //   withShareTicket: true
    // })
    //获取屏幕高度
    // that.setData({
    //   'tabSetting.rankHeight': wx.getSystemInfoSync().windowHeight - (wx.getSystemInfoSync().screenWidth / 750) * (298 + 88 + 15) - 46 + 'px'
    // })
    // app.checkSession(function () {
     
      // util.log('scene:' + app.globalData.scene)
      // util.log('shareTicket:' + app.globalData.shareTicket)
      if (app.globalData.shareTicket && app.globalData.scene === 1044) {
        // 通过 1044: 带shareTicket的小程序消息卡片 过来的事件
        app.jumpSharePageFn(app.globalData.shareTicket, function (result) {
          //群排行数据回掉
          util.log("群排行");
          util.log(result);
          if (result.data.code === "SUCCESS") {
            // var setDataObj = {};
            // setDataObj['IsFinancialPlanner']=result.data.body.IsFinancialPlanner;
            // setDataObj['currentuserId']= result.data.body.currentuserId;
            // setDataObj['tabSetting.rank.data']= result.data.body.data;
            // setDataObj['tabSetting.rank.load']= false;
            // setDataObj['tabSetting.btn.btnText']= '签到';
            that.setData({
              'IsFinancialPlanner': result.data.body.IsFinancialPlanner,
              'currentuserId': result.data.body.currentuserId,
              'tabSetting.rank.data': result.data.body.data,
              'tabSetting.rank.load': false,

            })
            if (!result.data.body.IsFinancialPlanner) {
              app.getUserInfo(function (userInfo) {
                //更新数据
                console.log();
                // setDataObj['userInfo'] = wx.getStorageSync("d1money_userInfo");
                // setDataObj['tabSetting.btn.disabled'] = true;
                // setDataObj['load'] = false;
                that.setData({
                  userInfo: userInfo,
                  'tabSetting.btn.disabled': true,
                  load: false,
                })
              })
            }
            // that.setData(setDataObj);
          }else{
            if (result.data.code === "000005") {
              util.log("分享页：获取群排行失败");
              util.log(wx.getStorageSync("session_3rd"));
              app.login(that.onShow); //获取session失败后，重新login 然后加载当前页面
            }else{
              util.log("分享页：获取群排行失败 :" + result.data.code);
            }
          }
        }, function (result) {
          //群动态数据回调
          util.log(result);
          if (result.data.code === "SUCCESS") {
            wx.hideToast();
            that.setData({
              'tabSetting.dynamicgroup.data': result.data.body.data,
              'tabSetting.dynamicgroup.load': false
            })
          }else{
            if (result.data.code === "000005") {
              util.log("分享页：获取群动态失败");
              util.log(wx.getStorageSync("session_3rd"));
              app.login(that.onShow); //获取session失败后，重新login 然后加载当前页面
            }else{
              util.log("分享页：获取群动态失败 :" + result.data.code);
            }
          }
        });
      } else {
        wx.hideLoading();
        // util.log(res);
        wx.reLaunch({
          url: '../index/index'
        })
      }
    // });
  },
  //转发函数
  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      util.log(res.target)
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
        util.log("转发成功!")
        // util.log(JSON.stringify(res));
        // util.log(res.shareTickets[0]);
      },
      fail: function (res) {
        // 转发失败
        util.log("转发失败!")
        util.log(JSON.stringify(res));
      },
      complete: function () {
        //转发结束后的回调函数
        util.log("转发操作!")
      }
    }
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },
  util: function (currentStatu) {
    var that = this;
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 200, //动画时长 
      timingFunction: "linear", //线性 
      delay: 0 //0则不延迟 
    });

    // 第2步：这个动画实例赋给当前的动画实例 
    this.animation = animation;

    // 第3步：执行第一组动画 
    animation.opacity(0).rotateX(-100).step();

    // 第4步：导出动画对象赋给数据对象储存 
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画 
    setTimeout(function () {
      // 执行第二组动画 
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
      this.setData({
        animationData: animation
      })

      //关闭 
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false,
            friendNum: null
          }
        );
      }
      //关闭 
      if (currentStatu == "ok") {


        if (!this.data.friendNum) {
          wx.showToast({
            title: '好友数不能为空',
            image: './../../static/img/no64.png',
            duration: 1000
          })
          this.setData(
            {
              showModalStatus: false,
              friendNum: null
            })
          return;
        }
        this.userSign();

      }
    }.bind(this), 200)
    // 显示 
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }
  },
  //签到判断
  checkIsSign() {
    var that = this;
    util.ajax("checkIsSign", {
      session_3rd: wx.getStorageSync("session_3rd")
    }, "POST", function (res) {
      util.log(res);
      console.log(res)
      if (res.data.code == "SUCCESS") {
        //SUCCESS 是没签到
        that.setData(
          {
            'tabSetting.btn.disabled': false,
            'tabSetting.btn.btnText': '签到'
          }
        );
      } else {
        that.setData(
          {
            'tabSetting.btn.disabled': true,
            'tabSetting.btn.btnText': '已签到'
          }
        );
      }
    })
  },
  //签到
  userSign() {
    var that = this;
    that.setData({
        'showModalStatus': false,
        'tabSetting.btn.disabled': true,
        'tabSetting.btn.loading': true,
        'tabSetting.btn.btnText': '签到中'
    });
    util.ajax('SignCommit', {
      intradayfriendNumber: that.data.friendNum,
      session_3rd: wx.getStorageSync("session_3rd")
    }, 'POST', function (res) {
      util.info("签到")
      util.log(res);
      that.loadCurriculumRankingList(function (result) {
        that.setData({
          'IsFinancialPlanner': result.data.body.IsFinancialPlanner,
          'currentuserId': result.data.body.currentuserId,
          'tabSetting.rank.data': result.data.body.data,
          'tabSetting.rank.load': false,
          'tabSetting.btn.disabled': true,
          'tabSetting.btn.loading': false,
          'tabSetting.btn.btnText': '已签到'
        })
        wx.hideLoading()
        wx.showToast({
          // title: '今日好友数' + that.data.friendNum,
          title: '签到成功',
          icon: 'success',
          duration: 2000
        })
      })
    }, function () {
      //complete
    }, function () {
      //fail
      wx.hideLoading();
      wx.showToast({
        title: '签到失败，请稍后再试',
        image: './../../static/img/no64.png',
        duration: 1000
      });
    })
  },
  bindKeyInput(e) {
    this.setData({
      friendNum: e.detail.value
    })
  },
  //群动态上拉加载
  lower(e) {
    var that = this;
    if (that.data.tabSetting.dynamicgroup.loadNextPage || that.data.tabSetting.dynamicgroup.PageNum > that.data.tabSetting.dynamicgroup.total) {
      return;
    }
    this.setData(
      {
        'tabSetting.dynamicgroup.loadNextPage': true
      }
    );
    this.loadDynamicgroupDate(function (result) {
      util.log(result);
      if (result && result.data.body.data.length!=0){
        that.data.tabSetting.dynamicgroup.data.push.apply(that.data.tabSetting.dynamicgroup.data, result.data.body.data)
        //群动态数据回调
        that.setData({
          'tabSetting.dynamicgroup.data': that.data.tabSetting.dynamicgroup.data,
          'tabSetting.dynamicgroup.total': result.data.body.Total,
          'tabSetting.dynamicgroup.loadNextPage': false
        })
      }
      
    });
  },
  // 刷新群动态
  loadCurriculumRankingList(fn) {
    var that = this;
    wx.getShareInfo({
      shareTicket: app.globalData.shareTicket,
      fail(res) {
        util.log(res);
      },
      complete(res) {
        //请求服务器 解密数据
        util.ajax('loadCurriculumRankingList', {
          openGIdEncryptedData: encodeURIComponent(res.encryptedData),
          openGIdIv: res.iv,
          session_3rd: wx.getStorageSync("session_3rd")
        }, 'POST', function (res) {
          // success
          util.info(res);
          if (typeof fn === "function") fn(res);
        }, function () {
          // complete
        })
      }
    })
  },
  //加载群动态
  loadDynamicgroupDate(fn) {
    var that = this;
    wx.getShareInfo({
      shareTicket: app.globalData.shareTicket,
      fail(res) {
        util.log(res);
      },
      complete(res) {
        util.log(that.data.tabSetting.dynamicgroup.PageNum)
        that.setData({
          'tabSetting.dynamicgroup.PageNum': that.data.tabSetting.dynamicgroup.PageNum + 1
        })
        //请求服务器 解密数据
        util.ajax('loadGroupDynamics', {
          openGIdEncryptedData: encodeURIComponent(res.encryptedData),
          openGIdIv: res.iv,
          session_3rd: wx.getStorageSync("session_3rd"),
          start: that.data.tabSetting.dynamicgroup.PageNum,
          limit: 10
        }, 'POST', function (res) {
          // success
          // util.info(res);

          if (typeof fn === "function") fn(res);
        }, function () {
          // complete
        })
      }
    })
  }
})
