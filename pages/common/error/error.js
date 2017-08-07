// error.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data:{},
    type:"",
    msg:{
      userInfo:{
        title:"用户授权失败",
        content:"您没有允许微信授权,暂不能使用后续功能,若想继续使用,可在【发现 - 小程序 - 获客排行榜】 长按删除(苹果手机需左滑删除) , 重新进入本小程序允许微信授权即可"
      },
      notHaveWorkspace:{
        title: "暂无工作室",
        content: "由于您没有工作室,只能开通工作室后才能使用获课排行榜小程序"
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.hideShareMenu()
    console.log(options.type)
    that.setData({
      type: options.type,
      data: that.data.msg[options.type]
    })
    wx.hideToast();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})