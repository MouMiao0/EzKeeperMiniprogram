import { IBill } from "../../model/bill"
import { IUser } from "../../model/User";
import { categoryService } from "../../service/categoryService"
import { FetchApi } from "../../service/request"
const App = getApp();

// pages/home/index.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bills: Array<IBill>(),
    navBarHeight: 0,
    statusBarHeight: 0,
    showLeftModel: false,
    user: <IUser>{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //获取缓存token
    if (!FetchApi.Instance.Init()) {
      wx.redirectTo({
        url: "/pages/login/index"
      })
    }

    //注册登陆的提示框 
    let toast: string | undefined = options["toast"]
    if (toast != undefined && toast.length > 0) {
      wx.showToast({
        title: toast,
        icon: "none"
      })
    }

    //初始化数据
    this.onRefresh();
    let user: IUser = FetchApi.User;
    this.setData({user: user})
  },

  /**
   * 刷新数据
   */
  onRefresh() {
    wx.showNavigationBarLoading();
    wx.showLoading({
      title: "刷新中..."
    })
    categoryService.getCustomCategories();
    categoryService.getDefaultCategories()
    this.getBills()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.setData({
      navBarHeight:App.globalData.navBarHeight,
      statusBarHeight:App.globalData.statusBarHeight,
    })
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
    wx.setBackgroundTextStyle({
      textStyle:"dark"
    })
    this.onRefresh();
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
   * 添加帐目 
   */
  addBill() {
    wx.navigateTo({
      url: "/pages/addBill/index"
    })
  },

  /**
   * 获取账目列表
   */
  getBills(){
    let _this = this;
    FetchApi.browseBill().then((res) => {
      let bills: Array<IBill> = (res as any).data.records;
      _this.setData({
        bills: bills
      })
      setTimeout(() => {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }, 500);
    })
  },

  /**
   * 显示侧边栏
   */
  showLeftModel(){
    this.setData({showLeftModel: true})
  },

  /**
   * 关闭侧边栏
   */
  hideLeftModel(){
    this.setData({showLeftModel: false})
  },

  /**
   * 登出账号
   */
  doLogout(){
    FetchApi.logout();
    this.hideLeftModel();
  }
})