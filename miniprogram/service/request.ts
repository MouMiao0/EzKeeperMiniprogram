import { IBill } from "../model/bill";
import { IBillCategory } from "../model/billCategory";
import { IUser, IUserToken } from "../model/User";

/**
 * 数据请求方式
 */
enum Method {
  options = 'OPTIONS',
  get = 'GET',
  head = 'HEAD',
  post = 'POST',
  put = 'PUT',
  delete = 'DELETE',
  trace = 'TRACE',
  connect = 'CONNECT',
}

/**
 * 提交数据格式
 */
enum ContentType {
  form_data = "multipart/form-data",
  www_form = "application/x-www-form-urlencoded",
  binary = "application/octet-stream",
  json = "application/json",
  xml = "application/xml",
}

/**
 * API 输入数据
 */
interface IFetchOption {
  /**
   * 接口地址
   */
  port: string
  /**
   * 请求方式
   */
  method?: Method
  /**
   * 数据格式  
   */
  content_type?: string | ContentType
  /**
   * 额外头部
  */
  extend_header?: Record<string, any>
  /**
   * 请求数据
   */
  data?: string | Record<string, any> | WechatMiniprogram.IAnyObject | ArrayBuffer
  /** 需要基础库： `1.7.0`
   *
   * 响应的数据类型
   *
   * 可选值：
   * - 'text': 响应的数据为文本;
   * - 'arraybuffer': 响应的数据为 ArrayBuffer; */
  responseType?: 'text' | 'arraybuffer'
}

//系统Api封装
export class FetchApi {

  private static instance?: FetchApi = undefined;

  private _url?: string;

  private _token?: string;

  private constructor() { }

  /**
   * 用户信息
   */
  private user: IUser = <IUser>{}

  /**
   * 返回用户信息
   */
  public static get User() : IUser{
    return FetchApi.Instance.user;
  }

  public static get Instance(): FetchApi {
    if (FetchApi.instance == undefined) FetchApi.instance = new FetchApi();
    return FetchApi.instance;
  }

  public static set Url(url: string) {
    FetchApi.Instance._url = url;
  }

  /**
   * Init 初始化
   */
  public Init(): boolean {
    //初始化Token
    let token = wx.getStorageSync("token");
    if (token == undefined || (token as string).length < 1) return false;
    FetchApi.Instance._token = token;

    //初始化user
    let userStr = wx.getStorageSync("user");
    let user : IUser | undefined = undefined;
    if(userStr !=undefined && userStr.length > 1) user = JSON.parse(userStr) as IUser;
    if(user == undefined || (user.userName == undefined)) return false;
    FetchApi.Instance.user = user;

    return true;
  }


  /**
   * 使用Promise 封装 wx.request, 自动填入token
   *  */
  private async request(option: IFetchOption): Promise<string | Record<string, any> | ArrayBuffer | WechatMiniprogram.IAnyObject> {
    return new Promise((resolve, reject) => {
      let _this = FetchApi.Instance;
      let extend_header = option.extend_header;
      try {
        wx.request({
          url: _this._url + option.port,
          method: option.method,
          header: {
            'token': _this._token,
            'content-type': (option.content_type ?? ContentType.www_form) + ";charset=UTF-8",
            extend_header
          },
          data: option.data,
          success(res) {
            let data = res.data as any;
            //未登录,登陆过时
            if (data.body != undefined &&
              data.body.status == "401") {
              FetchApi.Instance._token = undefined;
              // 跳转登陆界面
              setTimeout(() => {
                wx.reLaunch({
                  url: "/pages/login/index?message=" + "未登陆, 登陆超时"
                }), 1200
              })
              reject(data.body.message);
            }

            //其他情况
            if (data.status != "200" || (data.body != undefined && data.body.status != "200")) reject(data.message);
            resolve(data);
          },
          fail(res) {
            reject(res.errMsg);
          }
        })
      } catch (error) {
        reject(error.message);
      }
    })
  }


  /**
   * 用户注册
   * */
  static async register(user_token: IUserToken): Promise<string> {
    return new Promise((resolve, reject) => {
      let _this = FetchApi.Instance;
      _this.request({
        port: "/users/register",
        method: Method.post,
        content_type: ContentType.www_form,
        data: user_token
      }).then((res) => {
        let token = (res as any).data as string;
        //更新token
        _this._token = token;
        wx.setStorageSync("token", _this._token);
        //更新用户
        _this.user = <IUser>{userName: user_token.userName};
        wx.setStorageSync("user",JSON.stringify(_this.user));
        resolve("注册成功");
      }).catch(e => {
        reject(e);
      })
    })
  }

  /**
   * 用户登陆
   */
  static async login(user_token: IUserToken): Promise<string> {
    return new Promise((resolve, reject) => {
      let _this = FetchApi.Instance;
      _this.request({
        port: "/users/login",
        method: Method.post,
        data: user_token
      }).then((res) => {
        let token = (res as any).data as string;
        //更新token
        _this._token = token;
        //缓存token
        wx.setStorageSync("token", _this._token);
        //更新用户
        _this.user = <IUser>{userName: user_token.userName};
        wx.setStorageSync("user",JSON.stringify(_this.user));
        resolve("登陆成功");
      }).catch(e => {
        //返回错误信息
        reject(e);
      })
    })
  }

  /**
   * 记账
   * 
   */
  public static async loggingBill(bill: IBill): Promise<string | Record<string, any> | WechatMiniprogram.IAnyObject | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      let _this = FetchApi.Instance;
      _this.request({
        port: "/bill/logging",
        method: Method.post,
        data: bill
      }).then((res) => {
        resolve(res);
      }).catch(e => reject(e));
    });
  }

  /**
   * 浏览账目
   */
  public static async browseBill(pageIndex?: number): Promise<string | Record<string, any> | WechatMiniprogram.IAnyObject | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      let _this = FetchApi.Instance;
      _this.request({
        port: "/bill/browse",
        method: Method.get,
        content_type: ContentType.json,
        data: {
          pageIndex: pageIndex ?? ""
        }
      }).then(res => resolve(res)).catch(e => reject(e));
    })
  }

  /**
   * 修改账目
   */
  public static async updateBill(bill: IBill): Promise<string | Record<string, any> | WechatMiniprogram.IAnyObject | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      let _this = FetchApi.Instance;
      _this.request({
        port: "/bill/update",
        method: Method.post,
        data: bill
      }).then(res => resolve(res)).catch(e => reject(e));
    })
  }

  /**
   * 删除账目
   *  */
  public static async delBill(ids: Array<number>): Promise<string | Record<string, any> | WechatMiniprogram.IAnyObject | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      let _this = FetchApi.Instance;
      _this.request({
        port: "/bill/del",
        method: Method.post,
        data: {
          ids: ids
        }
      }).then(res => resolve(res)).catch(e => reject(e))
    })
  }

  /***
   * 获取系统账目默认分类
   */
  public static async getBillCategory(id?: number): Promise<string | Record<string, any> | WechatMiniprogram.IAnyObject | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      let _this = FetchApi.Instance;
      _this.request({
        port: "/bill_category",
        content_type: ContentType.json,
        data: {
          id: id ?? ""
        }
      }).then(res => resolve(res)).catch(e => reject(e))
    })
  }

  /**
   * 
   * 获取用户账目分类
   */
  public static async getCustomBillCategory(id?: number): Promise<string | Record<string, any> | WechatMiniprogram.IAnyObject | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      let _this = FetchApi.Instance;
      _this.request({
        port: "/custom_bill_category",
        content_type: ContentType.json,
        data: {
          id: id ?? ""
        }
      }).then(res => resolve(res)).catch(e => reject(e))
    })
  }

  /**
   * 修改用户账目分类
   */
  public static async editCustomBillCategory(bill_category: IBillCategory): Promise<string | Record<string, any> | WechatMiniprogram.IAnyObject | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      let _this = FetchApi.Instance;
      _this.request({
        port: "/custom_bill_category/save_or_update",
        method: Method.post,
        data: bill_category
      }).then(res => resolve(res)).catch(e => reject(e))
    })
  }

  /**
   * 删除用户账目分类
   * 
   */
  public static async delCustomBillCategory(ids: Array<Number>): Promise<string | Record<string, any> | WechatMiniprogram.IAnyObject | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      let _this = FetchApi.Instance;
      _this.request({
        port: "/custom_bill_category/del?ids=",
        method: Method.delete,
        content_type: ContentType.json,
        data: ids
      }).then(res => resolve(res)).catch(e => reject(e))
    })
  }
 
  /**
   * 用户登出
   */
  public static async logout(): Promise<string|Error>{
    let _this = FetchApi.Instance;
    return new Promise((resolve)=>{
      //清空Token,用户信息
      _this._token = undefined;
      _this.user = <IUser>{};
      wx.clearStorageSync();
      //跳转到登陆界面
      wx.reLaunch({
        url:'/pages/login/index?message='+'登出成功'
      })
      resolve("登出成功");
    });
  }
}