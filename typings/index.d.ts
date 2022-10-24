/// <reference path="./types/index.d.ts" />

import { FetchApi } from "../miniprogram/service/request";
import { TouchEvent } from "../miniprogram/Util/TouchEvent";

interface IAppOption {
  globalData: {
    url?: string,
    userInfo?: WechatMiniprogram.UserInfo,
    /**
     * 状态栏高度
     */
    statusBarHeight: number,
    /**
     * 导航栏高度
     */
    navBarHeight: number
  },
  TouchEvent: TouchEvent
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}