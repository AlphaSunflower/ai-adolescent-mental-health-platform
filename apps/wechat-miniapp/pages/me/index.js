const app = getApp()

Page({
  data: {
    isLogin: false,
    userInfo: {}
  },
  onShow() {
    this.setData({
      isLogin: app.globalData.isLogin,
      userInfo: app.globalData.userInfo || {}
    })
  },
  handleProfile() {
    if (this.data.isLogin) {
      wx.navigateTo({ url: '/pages/profile/index' })
    } else {
      wx.navigateTo({ url: '/pages/login/index' })
    }
  },
  goToMyConsultation(e) {
    if (!this.data.isLogin) {
      wx.navigateTo({ url: '/pages/login/index' })
      return
    }
    const status = e.currentTarget.dataset.status
    wx.navigateTo({ url: `/pages/my-consultation/index?status=${status}` })
  },
  handleLogout() {
    wx.clearStorageSync()
    app.globalData.isLogin = false
    app.globalData.token = ''
    app.globalData.userInfo = null
    this.setData({
      isLogin: false,
      userInfo: {}
    })
    wx.reLaunch({ url: '/pages/index/index' })
  }
})