const app = getApp()

Page({
  data: {
    isLogin: false,
    userInfo: {},
    quotes: [
      { content: "每一天都是新的开始，拥抱阳光。" },
      { content: "心若向阳，无畏悲伤。" }
    ]
  },
  onShow() {
    this.setData({
      isLogin: app.globalData.isLogin,
      userInfo: app.globalData.userInfo || {}
    })
    this.fetchQuotes()
  },
  fetchQuotes() {
    // Call backend to fetch quotes
    // For now mock
  }
})