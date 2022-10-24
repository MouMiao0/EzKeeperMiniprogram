import { IUserToken } from "../../model/User";
import { FetchApi } from "../../service/request";

// pages/login/index.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    register: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let register = options.register;
    let message = options.message;
    //据传来的值决定显示那个界面
    if (register != undefined && register.length > 0) {
      this.setData({
        register: JSON.parse(register)
      })
    }

    if(message!= undefined && message.length > 0){
      wx.showToast({title:message, icon: "none", duration: 1200})
      //关闭加载动画
      wx.hideLoading();
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /**
   * 表单提交
   * @param data 表单数据
   */
  OnSubmit: function (data: WechatMiniprogram.FormSubmit) {
    let form_data = data.detail.value;
    let user_token: IUserToken = {
      userName: form_data.userName,
      pw: form_data.pw
    }
    if (this.data.register) {
      let pw = form_data.pw as string;
      let checkPw = form_data.pwCheck as string;
      //密码二次验证失败
      if (pw != checkPw) {
        wx.showToast({
          title: "两次密码不同",
          icon: "error"
        })
        return;
      }

      //注册
      this.doRegister(user_token);

    } else {
      //登陆
      this.doLogin(user_token);
    }
  },

  /**
   * 登陆
   * @param user 登陆密钥
   */
  doLogin: function (user: IUserToken) {
    FetchApi.login(user)
      .then(() => {
        // 跳转主界面
        wx.reLaunch({
          url: "/pages/home/index?toast=登陆成功"
        })
      })
      .catch(e => wx.showToast({ title: e, icon: "none" }))
  },

  /**
   * 注册
   * @param user 用户信息
   */
  doRegister: function (user: IUserToken) {
    FetchApi.register(user)
      .then(() => {
        // 跳转主界面
        wx.redirectTo({
          url: "/pages/home/index?toast=注册成功"
        })
      })
      .catch(e => wx.showToast({ title: e, icon: "none" }))
  },

  /**
   * 切换登陆注册界面
   */
  doSwitch: function () {
    let new_register: boolean = !this.data.register;
    this.setData({
      register: new_register
    })
  },
})