import { IBill } from "../../model/bill";
import { IBillCategory } from "../../model/billCategory";
import { categoryService } from "../../service/categoryService";
import { FetchApi } from "../../service/request";

// pages/addBill/index.ts

Page({

  /**
   * 页面的初始数据
   */
  data: {
    billCategories: Array<IBillCategory>(),
    bill: <IBill>{userCustom:false},
    hiddenAdd: true,
    hiddenNumber: true,
    newBillCategory: <IBillCategory>{},
    hiddenModelForm: true,
    operationMode: true,
    backupsCategories: Array<IBillCategory>(),
    customBillCategories: Array<IBillCategory>(),
    delIds: Array<Number>(),
    modelTitle: "添加分类"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.setData({
      billCategories: categoryService.defaultCategories,
      customBillCategories: categoryService.customCategories
    })
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
    let pages = getCurrentPages();
    let beforPage = pages[pages.length - 2];
    beforPage.onRefresh();
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
   * 切换分类
   * @param e 
   */
  tabberSwitch(e: WechatMiniprogram.RadioGroupChange){
    let bill: IBill = this.data.bill;
    bill.userCustom = e.detail.value == "true";
    let hiddenAdd = !bill.userCustom;
    this.setData({
      bill: bill,
      hiddenAdd: hiddenAdd,
      hiddenNumber: true
    })
  },

  /**
   * 获取默认分类列表
   */
  getBillCategories(){
    let _this = this;
    categoryService.getDefaultCategories().then(res=>_this.setData({billCategories: res}));
  },

  /**
   * 获取自定义分类列表
   */
  getCustomBillCategories(){
    let _this = this;
    categoryService.getCustomCategories().then(res=>_this.setData({customBillCategories: res}));
  },

  /**
   * 更改分类
   * @param e radio信息 
   */
  changeCategory(e: WechatMiniprogram.RadioGroupChange){
    //更新分类id
    let bill: IBill = this.data.bill;
    bill.categoryId = Number(e.detail.value);
    this.setData({
      bill: bill,
      hiddenNumber: false
    })
  },

  /**
   * 隐藏输入键盘
   */
  hiddenInputNumber(){
    let bill  = <IBill>{userCustom: this.data.bill.userCustom};
    this.setData({
      hiddenNumber: true,
      bill: bill
    })
  },

  /**
   * 金额输入
   */
  numberChange(e: WechatMiniprogram.Input){
    let number: number = Number(e.detail.value);
    let bill: IBill = this.data.bill;
    bill.number = number;
    this.setData({
      bill: bill
    })
  },

  /**
   * 提交
   */
  confirmBill(){
    let bill: IBill = this.data.bill;
    let userCustom = this.data.bill.userCustom;
    FetchApi.loggingBill(bill).then((res)=>{
      wx.showToast({title: (res as any).message, icon :"none"})
      this.setData({
        hiddenNumber: true,
        bill:<IBill>{userCustom:userCustom}
      }),
      wx.navigateBack();
    }).catch(e=>wx.showToast({title: e, icon: "none"}))
  },

  /**
   * 显示添加分类的表单
   */
  showAddForm(){
    this.setData({
      modelTitle:"添加分类",
      hiddenModelForm: false,
      newBillCategory: <IBillCategory>{}
    })
  },

  /**
   * 隐藏添加分类的表单
   */
  hiddenAddForm(){
    this.setData({
      hiddenModelForm: true,
      newBillCategory: <IBillCategory>{}
    })
  },

  /**
   * 改变分类是否为收入
   */
  changeCategoryIncomed(e:WechatMiniprogram.SwitchChange){
    let incomed = e.detail.value;
    let billCategory = this.data.newBillCategory;
    billCategory.incomed = incomed;
    this.setData({
      newBillCategory:billCategory
    })
  },

  /**
   * 提交新分类
   */
  submitCategory(e:WechatMiniprogram.FormSubmit){
    let name = e.detail.value.name;
    let newBillCategory = this.data.newBillCategory;
    newBillCategory.name = name;
    this.setData({
      newBillCategory : newBillCategory
    });
    FetchApi.editCustomBillCategory(newBillCategory)
    .then((res)=>{
      wx.showToast({title:(res as any).message,icon:"none"});
      this.getCustomBillCategories();
      let bill: IBill = this.data.bill;
      bill.userCustom = true;
      this.setData({
        bill:bill,
        newBillCategory: <IBillCategory>{},
        hiddenModelForm: true
      })
    })
    .catch(e=>wx.showToast({title:e,icon:"none"}));
  },

  /**
   * 进入管理模式
   */
  onOperation(){
    //备份列表
    let categories = this.data.customBillCategories.slice(0);
    this.setData({
      backupsCategories: categories,
      //重置删除ids
      delIds: Array<Number>()
    })
    //显示删除按钮
    this.setData({operationMode: false});
  },

  /**
   * 确认删除
   */
  confirmDel(){
    let ids = this.data.delIds;
    let customBillCategories = categoryService.customCategories.filter(c=>ids.indexOf(c.id)==-1);
    FetchApi.delCustomBillCategory(ids)
    .then(()=>{
      wx.showToast({title:"操作成功",icon: "none"})
      //关闭界面
      this.setData({
        operationMode: true
      })
      //更新数据
      categoryService.customCategories = customBillCategories;
    })
    .catch(e=>wx.showToast({title: e, icon:"none"}))
  },

  /**
   * 取消删除
   */
  cancelDel(){
    //将备份的列表恢复
    let categories = this.data.backupsCategories;
    // console.log(categories)
    this.setData({
      customBillCategories : categories,
      //变回原来界面
      operationMode: true
    })
    // console.log(this.data.customBillCategories)
  },

  /**
   * 点击删除分类
   */
  delCategory(e: WechatMiniprogram.TouchEvent){
    //从列表获取分类
    let index : number = e.target.dataset.index;
    let customBillCategories = this.data.customBillCategories;
    let category = customBillCategories[index];
    //删除列表里的分类
    customBillCategories.splice(index,1);
    //id添加到delIds里
    let ids = this.data.delIds;
    ids.push(category.id);
    //更新列表,退出管理模式
    this.setData({
      customBillCategories: customBillCategories,
      delIds: ids
    })
  },

  /**
   * 点击修改分类
   */
  editCategory(e: WechatMiniprogram.TouchEvent){
    // console.log(e);
    //获取数据
    let index = e.target.dataset.index;
    let category = this.data.customBillCategories[index];
    //显示界面
    this.setData({
      modelTitle :"修改分类",
      newBillCategory: category,
      hiddenModelForm : false
    });

  },

  /**
   * 修改备注
   */
  noteChange(e:WechatMiniprogram.Input){
    let text = e.detail.value as string;
    let bill = this.data.bill;
    bill.note = text;
    this.setData({bill:bill});
  }
})