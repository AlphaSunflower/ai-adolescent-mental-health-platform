const app = getApp()

Page({
  data: {},
  handleWxLogin() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const userInfo = res.userInfo
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              wx.showLoading({ title: '登录中...' })
              wx.request({
                url: app.globalData.baseUrl + '/user/login/wx',
                method: 'POST',
                data: {
                  code: loginRes.code,
                  userInfo: JSON.stringify(userInfo)
                },
                success: (apiRes) => {
                  wx.hideLoading()
                  if (apiRes.data.code === 200) {
                    const { token, userInfo } = apiRes.data.data
                    wx.setStorageSync('token', token)
                    wx.setStorageSync('userInfo', userInfo)
                    app.globalData.isLogin = true
                    app.globalData.token = token
                    app.globalData.userInfo = userInfo
                    wx.showToast({ title: '登录成功' })
                    wx.switchTab({ url: '/pages/index/index' })
                  } else {
                    wx.showToast({ title: apiRes.data.message || '登录失败', icon: 'none' })
                  }
                },
                fail: (err) => {
                  wx.hideLoading()
                  console.error(err)
                  wx.showToast({ title: '网络请求失败', icon: 'none' })
                }
              })
            }
          }
        })
      },
      fail: () => {
          wx.showToast({ title: '需要授权才能登录', icon: 'none' })
      }
    })
  }
})