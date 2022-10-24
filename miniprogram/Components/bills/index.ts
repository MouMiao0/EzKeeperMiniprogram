// Components/bills/index.ts

import { IBill } from "../../model/bill";
import { IBillCategory } from "../../model/billCategory";
import { categoryService } from "../../service/categoryService";
import { FetchApi } from "../../service/request";

const App = getApp();

/**
 * 星期几
 */
// enum dayType{
//   "天",
//   "一",
//   "二",
//   "三",
//   "四",
//   "五",
//   "六"
// }

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    "bill": {
      type: Object,
      value: <IBill>{
        id: 0,
        category: <IBillCategory>{
          name: "账单类型",
          incomed: false
        },
        number: 20,
        note: "备注"
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    time: "",
    isSlide: false,
    edittedBill: <IBill>{},
    categories: Array<IBillCategory>(),
    editModel: false,
    categoryIndex: 0,
    billDate: "00-00-00",
    billTime: "00:00",
    billIndex: -1,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 触摸开始
     */
    touchStart(e: WechatMiniprogram.Touch) {
      App.TouchEvent.touchStart(e, this);
    },
    /**
     * 滑动
     */
    touchMove(e: WechatMiniprogram.Touch) {
      App.TouchEvent.touchSlide(e, this);
    },

    /**
     * 显示删除
     */
    showDel() {
      this.setData({ isSlide: true })
    },

    /**
     * 隐藏删除
     */
    hideDel() {
      this.setData({
        isSlide: false
      })
    },

    /**
     * 修改分类
     */
    changeCategory(e: WechatMiniprogram.PickerChange) {
      let index: number = Number(e.detail.value);
      let bill = this.data.edittedBill;
      bill.userCustom = (index >= categoryService.defaultCategories.length);
      let category = categoryService.categories[index];
      bill.category = category;
      bill.categoryId = category.id;
      this.setData({ edittedBill: bill })
    },

    /**
     * 修改日期
     */
    changeDate(e: WechatMiniprogram.PickerChange) {
      let bill = this.data.edittedBill;
      let newDate = e.detail.value as string;
      this.setData({
        edittedBill: bill,
        billDate: newDate
      })
    },

    /**
     * 修改时间
     */
    changeTime(e: WechatMiniprogram.PickerChange) {
      let bill = this.data.edittedBill;
      let time = e.detail.value as string;
      this.setData({
        billTime: time,
        edittedBill: bill
      })
    },

    /**
     * 修改金额
     */
    changeNumber(e: WechatMiniprogram.Input) {
      let bill = this.data.edittedBill;
      bill.number = Number(e.detail.value);
      this.setData({
        edittedBill: bill
      })
    },

    /**
     * 修改备注 
     */
    changeNote(e: WechatMiniprogram.Input){
      let text = e.detail.value;
      let bill = this.data.edittedBill;
      bill.note = text;
      this.setData({edittedBill: bill});
    },

    /**
     * 提交修改
     */
    submitChange() {
      let bill = this.data.edittedBill;
      let time = this.data.billDate + " " + this.data.billTime;
      if(bill.note == undefined) delete bill.note;
      bill.time = time;
      delete bill.category;
      FetchApi.updateBill(bill).then(res => {
        bill = (res as any).data as IBill;
        if (bill.userCustom) {
          bill.category = categoryService.customCategories.filter(x => x.id == bill.categoryId)[0];
        } else {
          bill.category = categoryService.defaultCategories.filter(x => x.id == bill.categoryId)[0];
        }
        this.setData({
          bill: bill,
          editModel: false,
          edittedBill: <IBill>{}
        });
        wx.showToast({title:"修改成功", icon: "none", duration: 1200})
      })
        .catch(e => wx.showToast({ title: e, icon: "none" }));
    },

    /**
     * 取消修改并关闭界面
     */
    cancelChange() {
      this.setData({
        editModel: false,
        edittedBill: <IBill>{}
      })
    },

    /**
     * 打开修改界面
     */
    openEditModel() {
      let bill = this.properties.bill as IBill;
      let times = (bill.time as string).split(' ');
      let date = times[0];
      let time = times[1];
      this.setData({
        edittedBill: bill,
        billDate: date,
        billTime: time,
        editModel: true,
        categories: categoryService.categories
      })
    },

    /**
     * 删除
     */
    delBill(){
      let bill = this.properties.bill as IBill;
      let content = '删除'+bill.time+'的记账?';
      let pages = getCurrentPages();
      let currentPage = pages[pages.length -1];
      wx.showModal({
        title:'确认删除',
        content:content,
        success(res){
          if(res.confirm){
            FetchApi.delBill([bill.id])
            .then((res)=>{
              wx.showToast({title: (res as any).message, icon : "none"});
              currentPage.getBills();
            })
          }
        }
      })
    }
  },

  lifetimes: {
  }
})
