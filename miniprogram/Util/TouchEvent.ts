/**
 * 点击事件监听类
 */
export class TouchEvent{
  /**
   * 点击坐标X
   */
  startX?: number

  /**
   * 点击坐标Y
   */
  startY?: number

  /**
   * 点击对象管理
   */
  items: Set<any> = new Set<any>()

  /**
   * 点击开始
   */
  touchStart(e: WechatMiniprogram.Touch,v: any){
    if(!this.items.has(v)) this.items.add(v);
    this.items.forEach((t)=>{
      t.hideDel();
    });
    this.startX = e.changedTouches[0].clientX;
    this.startY = e.changedTouches[0].clientY;
  }


  /**
   * 滑动
   */
  touchSlide(e: WechatMiniprogram.Touch,v: any){
    let endX = e.changedTouches[0].clientX;
    if((this.startX as number) - endX > 30) v.showDel()
    else v.hideDel()
  }
}