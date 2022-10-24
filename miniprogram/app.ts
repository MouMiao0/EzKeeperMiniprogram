// app.ts
import { IAppOption } from "../typings";
import { FetchApi } from "./service/request";
import { TouchEvent } from "./Util/TouchEvent";

App<IAppOption>({
  globalData: {
    navBarHeight: 0,
    statusBarHeight: 0,
    url:"https://ezkeeper.work"
    // url:'https://127.0.0.1:443'
  },
  onLaunch() {
    //初始化 FetchApi
    let url = this.globalData.url;
    if(url != undefined) FetchApi.Url = url;

    //获取缓存token
    if(!FetchApi.Instance.Init()){
      wx.redirectTo({
        url:"/pages/login/index"
      })
    }
    //获取状态 和导航栏 高度
    let  statusBarHeight: number = 0;
    wx.getSystemInfo({
      success(res){
        statusBarHeight = res.statusBarHeight;
      }
    })
    const rect =  wx.getMenuButtonBoundingClientRect();
    let navBarHeight = (rect.top - statusBarHeight) * 2 + rect.height;
    // console.log(navBarHeight);
    this.globalData.navBarHeight = navBarHeight;
    this.globalData.statusBarHeight = statusBarHeight;
    
  },
  TouchEvent: new TouchEvent(),
})