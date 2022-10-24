import { IBillCategory } from "../model/billCategory"
import { FetchApi } from "./request"

interface ICategoryService {
  /**
   * 系统默认分类
   */
  defaultCategories: Array<IBillCategory>

  /**
   * 自定义分类
   */
  customCategories: Array<IBillCategory>
  
  /**
   * 总分类列表
   */
  readonly categories: Array<IBillCategory>

  /**
   * 从服务器获取默认列表
   */
  getDefaultCategories(): Promise<Array<IBillCategory>>
  /**
   * 从服务器获取自定义分类列表
   */
  getCustomCategories(): Promise<Array<IBillCategory>>
}

const categoryService = <ICategoryService>{

  defaultCategories: Array<IBillCategory>(),

  customCategories: Array<IBillCategory>(),

  get categories() : Array<IBillCategory>{
    return this.defaultCategories.concat(this.customCategories);
  },

  getDefaultCategories() {
    let _this =  this;
    return new Promise((resolve, reject) => {
      FetchApi.getBillCategory().then((res) => {
        let billCategories = (res as any).data as Array<IBillCategory>;
        _this.defaultCategories = billCategories;
        resolve(_this.defaultCategories);
      }).catch(e =>{
        wx.showToast({ title: e, icon: "none" });
        reject(e);
      })
    })
  },

  getCustomCategories() {
    let _this =  this;
    return new Promise((resolve, reject) => {
      FetchApi.getCustomBillCategory().then((res) => {
        let billCategories = (res as any).data as Array<IBillCategory>;
        _this.customCategories = billCategories;
        resolve(_this.customCategories);
      }).catch(e =>{
        wx.showToast({ title: e, icon: "none" });
        reject(e);
      })
    })
  }
}

export { categoryService }