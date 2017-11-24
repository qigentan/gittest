/**
 * author: nick
 * fixTime:2017-4-18
 * desc: 静默登录
 */
// 途虎基础服务api 命名空间:wx.tuhu 调用方法进入
/* 部分ios版本有问题 eg:王晓宇 暂时用官方填充版本 */
import Fetch from '@tuhu/weapp-tuhu/lib/fetch'
import TA from '@tuhu/weapp-tuhu/lib/ta'
import * as tuhuUtil from '@tuhu/weapp-tuhu/lib/util'
import Pay from '@tuhu/weapp-tuhu/lib/pay'
import { CarTypes, getCarRouter } from './CarModules/CarRouter'
import getCarPresenter from './CarModules/CarPresenter'
import * as PromisePollfill from './modules/promise'
import './modules/tuhu'
import UpLoadFileApi from './modules/uploadFile'

const { Promise: _promise } = PromisePollfill

wx.Promise = _promise;
Promise = _promise;

const tuhuFetch = new Fetch({
  TAHandle(obj) {
    wx.Ta(obj)
  },
  getUserAuthorizationHeader() {
    const userInfo = wx.tuhu.getUserInfo()
    return `Bearer ${userInfo ? userInfo.UserSession : ''}`
  },
  processHttpStatusCode(httpStatusCode) {
    if (httpStatusCode === 401) {
      const currentPageUrl = tuhuUtil.getCurrentPage();
      wx.tuhu.gotoPageWithUser({
        url: `/${currentPageUrl.pagePath}?${currentPageUrl.pageOptions}`,
      })
      return
    }
    if (httpStatusCode === 200) return true
  },
  processResultHandle({
    resultCode,
    resultMessage,
    requestOpts,
  }) {
    if (resultCode * 1 === 0 && resultMessage === '请重新登录' && requestOpts.url.indexOf(wx.apis.login) < 0) {
      wx.redirectTo({
        url: '../login/login?page=home',
      });
      return
    }
    return true
  },
})

wx.fetch = tuhuFetch.fetch.bind(tuhuFetch)

const fileFetch = new UpLoadFileApi({
  getUserAuthorizationHeader() {
    const userInfo = wx.tuhu.getUserInfo()
    return `Bearer ${userInfo ? userInfo.UserSession : ''}`
  },
  processHttpStatusCode(httpStatusCode) {
    if (httpStatusCode === 401) {
      const currentPageUrl = tuhuUtil.getCurrentPage();
      wx.tuhu.gotoPageWithUser({
        url: `/${currentPageUrl.pagePath}?${currentPageUrl.pageOptions}`,
      })
      return
    }
    if (httpStatusCode === 200) return true
  },
  processResultHandle({
    resultCode,
    resultMessage,
    requestOpts,
  }) {
    if (resultCode * 1 === 0 && resultMessage === '请重新登录' && requestOpts.url.indexOf(wx.apis.login) < 0) {
      wx.redirectTo({
        url: '../login/login',
      });
      return
    }
    return true
  },
})

const uploadFile = fileFetch.uploadFileFetch.bind(fileFetch)
Object.defineProperty(wx, 'uploadFile', {
  get() {
    return uploadFile
  },
})

const tuhuTA = new TA({
  getUserId() {
    return wx.tuhu.getUserId()
  },
  getLocation() {
    return wx.tuhu.getLocation()
  },
  appID: 'wx_app',
})

wx.Ta = tuhuTA.getTrack.bind(tuhuTA)
wx.Ta.ta = wx.Ta
wx.Ta.getTrack = wx.Ta.ta
wx.tuhuUtil = tuhuUtil;

require('./modules/proxy-wx.js').Init();
wx.Util = require('./modules/util');
wx.myPage = require('./modules/myPage');
wx.image = require('./modules/image');
require('./modules/polyfills');

wx.getCarRouter = opts => getCarRouter(opts)
wx.CarTypes = CarTypes
wx.getCarPresenter = () => getCarPresenter()

const tuhuPay = new Pay({
  generateAutoJumpUrl({ orderId }) {
    return `/pages/wait/orderDetail?orderNo=${orderId}`
  },
  generatePaySuccessUrl({ orderId, type }) {
    return `/pages/order/success?paysuccess=1&OrderID=${orderId}&type=${type}`
  },
})
wx.pay = (orderId, channel, type, autoJump) => tuhuPay.wxPay(orderId, channel, type, autoJump);

/** 安全跳转 */
wx.safeNavigateTo = (obj) => {
  wx.navigateTo({
    url: obj.url,
    fail() {
      wx.redirectTo({
        url: obj.url,
        fail() {
          wx.switchTab({
            url: obj.url,
          })
        },
      })
    },
  })
}

wx.systemInfo = wx.getSystemInfoSync();

// 小程序 版本号
wx.AppVersion = '4.6.11';

wx.header_version = {
  version: 'iOS 5.0.9',
};

wx.NOVARS = {
  vid5: 1,
  vid7: 9,
  channel: 'WXAPP',
  ver: 1,
};

wx.addcoupon = null;

let WX_SITE = 'http://wx.tuhu.work/'
let API_SITE = 'http://api.tuhu.work/'
let ITEM_SITE = 'http://item.tuhu.work/'
let BY_SITE = 'http://by.tuhu.work/'
let WWW_SITE = 'http://www.tuhu.work/'
let ITEM_DEV = 'http://item.dev.tuhu.work/'
let API_DEV = 'http://apidev.tuhu.work/'
let TEST_DEV = 'http://api.tuhu.work/'
let WX_DEV = 'http://wxdev.tuhu.work/'
// let TEST_DEV = 'http://apirelease.tuhu.work/'
// 是否是开发环境
let _DEV_ = true;
try {
  _DEV_ = process.env.NODE_ENV === 'DEV'
} catch (e) {}

// 线上版本
if (!_DEV_) {
  WX_SITE = 'https://wx.tuhu.cn/'
  API_SITE = 'https://api.tuhu.cn/'
  ITEM_SITE = 'https://item.tuhu.cn/'
  BY_SITE = 'https://by.tuhu.cn/'
  WWW_SITE = 'https://www.tuhu.cn/'
  TEST_DEV = 'https://api.tuhu.cn/'
  ITEM_DEV = ITEM_SITE
  API_DEV = API_SITE
  WX_DEV = WX_SITE
}

const apis = {
  login: ['/user/SignIn', `${WX_SITE}user/SignIn`],
  orderList: [
    '/order/orderlistforwechatapp/',
    `${WX_SITE}order/orderlistforwechatapp`,
  ],
  detail: [
    '/order/OrderDetailForWeChatApp/',
    `${WX_SITE}order/OrderDetailForWeChatApp`,
  ],
  phoneLogin: ['/user/SignInByPhone', `${WX_SITE}user/SignInByPhone`],
  selectMap: ['/user/SelectMap', `${WX_SITE}user/SelectMap`],
  selectCovert: [
    '/user/SelectConvertToSOSO',
    `${WX_SITE}user/SelectConvertToSOSO`,
  ],
  getCode: ['/user/GetIdentityCode', `${WX_SITE}user/GetIdentityCode`],
  bindPay: [
    '/order/SubmitOrderSamllWechat',
    `${WX_SITE}order/SubmitOrderSamllWechat`,
  ],
  cancelPay: [
    '/order/CancelOrderSamllWechat',
    `${WX_SITE}order/CancelOrderSamllWechat`,
  ],
  wxPay: [
    '/pay/WeChatAppRequestPayment',
    `${WX_SITE}pay/WeChatAppRequestPayment`,
  ],
  brand: ['/Car/GetCarBrands', `${ITEM_SITE}Car/GetCarBrands`],
  cars: ['/Car/SelOneBrand', `${ITEM_SITE}Car/SelOneBrand`],
  carBrands: ['/Car/GetCarBrands2', `${ITEM_SITE}Car/GetCarBrands2`],
  tires: ['/Product/SelectTires.html', `${ITEM_SITE}Product/SelectTires.html`],
  tireDetail: [
    '/Product/FetchTiresDetail.html',
    `${ITEM_SITE}Product/FetchTiresDetail.html`,
  ],
  GetShopNumberByArea: `${API_SITE}Product/GetShopNumberByArea`,
  giveaway: [
    '/PartitialProducts/SelectGifts.html',
    `${ITEM_SITE}PartitialProducts/SelectGifts.html`,
  ],
  fetchTireDetail: [
    '/Product/FetchTiresDetail.html',
    `${ITEM_SITE}Product/FetchTiresDetail.html`,
  ],
  shopList: ['/Shops/SelectBookShops', `${API_SITE}Shops/SelectBookShops`],
  defaultInfo: ['/Order/GetDefaultInfo', `${API_SITE}Order/GetDefaultInfo`],
  selectVehicle: ['/Car/SelectVehicle', `${ITEM_SITE}Car/SelectVehicle`],
  orderService: [
    '/Order/SelectProductServicesAndGifts',
    `${API_SITE}Order/SelectProductServicesAndGifts`,
  ],
  selectCar: [
    '/CarHistory/SelectCarObject.html',
    `${ITEM_SITE}CarHistory/SelectCarObject.html`,
  ],
  addCar: [
    '/CarHistory/AddCarObject.html',
    `${ITEM_SITE}CarHistory/AddCarObject.html`,
  ],
  updateCar: [
    '/CarHistory/UpdateCarObject.html',
    `${ITEM_SITE}CarHistory/UpdateCarObject.html`,
  ],
  deleteCar: [
    '/CarHistory/DeleteCarObject.html',
    `${ITEM_SITE}CarHistory/DeleteCarObject.html`,
  ],
  commentTag: [
    '/Comment/GetCommentStatistic.html',
    `${ITEM_SITE}Comment/GetCommentStatistic.html`,
  ],
  commentList: [
    '/Comment/GetProductComments',
    `${API_SITE}/Comment/GetProductComments`,
  ], // 替换老接口：Comment/FetchApi.html
  installService: [
    '/apinew/GetInstallServices.html',
    `${BY_SITE}apinew/GetInstallServices.html`,
  ],
  baoyangPay: ['/Order/CreateOrder', `${API_SITE}Order/CreateOrder`],
  baoyangWare: ['/apinew/itemList.html', `${BY_SITE}apinew/itemList.html`],
  checkShipFee: [
    '/Order/GetGradeDeliveryFee',
    `${API_SITE}Order/GetGradeDeliveryFee`,
  ],
  selectCouponList: [
    '/Order/SelectCouponList',
    `${API_SITE}Order/SelectCouponList`,
  ],
  SelectGiftsAndDeliveryFee: [
    '/CarProduct/SelectGiftsAndDeliveryFee',
    `${API_SITE}CarProduct/SelectGiftsAndDeliveryFee`,
  ],
  SelectAddresses: [
    '/Addresses/SelectAddresses',
    `${API_SITE}Addresses/SelectAddresses`,
  ],
  GetRegionName2: [
    '/beautify/GetRegionName2',
    `${API_SITE}beautify/GetRegionName2`,
  ],
  AddOrEditAddress: [
    '/Addresses/AddOrEditAddress',
    `${API_SITE}Addresses/AddOrEditAddress`,
  ],
  SetDefaultAddress: [
    '/Addresses/SetDefaultAddress',
    `${API_SITE}Addresses/SetDefaultAddress`,
  ],
  DeleteAddress: [
    '/Addresses/DeleteAddress',
    `${API_SITE}Addresses/DeleteAddress`,
  ],
  getCoupon: [
    '/Order/SelectPromotionCodeByType',
    `${API_SITE}Order/SelectPromotionCodeByType`,
  ],
  getCarProvince: [
    '/Car/SelectAllProvinces',
    `${API_SITE}Car/SelectAllProvinces`,
  ],
  getCarViolateInfo: [
    '/Peccancy/SelectCarViolateInfo',
    `${API_SITE}Peccancy/SelectCarViolateInfo`,
  ],
  getQueryConfigCityList: [
    '/Peccancy/SelectQueryConfigCityList',
    `${API_SITE}Peccancy/SelectQueryConfigCityList`,
  ],
  uploadPeccancyImage: [
    '/Peccancy/ImageUpLoad',
    `${API_SITE}Peccancy/ImageUpLoad`,
  ],
  getPeccancyOrderCondition: [
    '/Peccancy/SelectCheXingYiOrderCondition',
    `${API_SITE}Peccancy/SelectCheXingYiOrderCondition`,
  ],
  createPeccancyOrder: [
    '/peccancy/CreatePayOrder',
    `${API_SITE}peccancy/CreatePayOrder`,
  ],
  selectCoupon: [
    '/Order/SelectCouponList',
    `${API_SITE}Order/SelectCouponList`,
  ],
  chepinList: [
    '/search/SearchAutoProductList.html',
    `${ITEM_SITE}search/SearchAutoProductList.html`,
  ],
  chepinDetail: ['/Products/Properties/', `${ITEM_SITE}Products/Properties/`],
  chepinComment: [
    '/Comment/SelectProductTopNComments',
    `${API_SITE}Comment/SelectProductTopNComments`,
  ],
  chepinFetchDetail: [
    '/Product/FetchTiresDetail.html',
    `${ITEM_SITE}Product/FetchTiresDetail.html`,
  ],
  buyCarList: [
    '/Cart/SelectCartDetailsNew',
    `${API_SITE}Cart/SelectCartDetailsNew`,
  ],
  GetCartItemTotalCount: [
    '/Cart/GetCartItemTotalCount',
    `${API_SITE}Cart/GetCartItemTotalCount`,
  ],
  addCartNew: ['/Cart/addCartNew', `${API_SITE}Cart/AddCartItem`],
  addBuyCar: [
    '/Cart/AddProductToCartNew',
    `${API_SITE}Cart/AddProductToCartNew`,
  ],
  chepinIndex: [
    '/Advertise/SelectProductCategoriesNew',
    `${API_SITE}Advertise/SelectProductCategoriesNew`,
  ],
  updateBuyCar: [
    '/Cart/ModifyCartProductNew',
    `${API_SITE}Cart/ModifyCartProductNew`,
  ],
  deleteBuyCar: ['/Cart/DelCartProduct', `${API_SITE}Cart/DelCartProduct`],
  getBuyCarDetail: [
    '/Order/GetGradeDeliveryFee',
    `${API_SITE}Order/GetGradeDeliveryFee`,
  ],
  selectTogetherZoneNew: [
    '/User/SelectTogetherZoneNew',
    `${API_SITE}User/SelectTogetherZoneNew`,
  ],
  selectPromotionCodeByType: [
    '/Order/SelectPromotionCodeByType',
    `${API_SITE}Order/SelectPromotionCodeByType`,
  ],
  getBaoYangAppPackages: [
    '/apinew/GetBaoYangAppPackages.html',
    `${BY_SITE}apinew/GetBaoYangAppPackages.html`,
  ],
  detailComment: [
    '/Comment/SelectProductTopNComments',
    `${API_SITE}Comment/SelectProductTopNComments`,
  ],
  getPCodeByGetRuleID: [
    '/SPages/GetPCodeByGetRuleID.aspx',
    `${WWW_SITE}SPages/GetPCodeByGetRuleID.aspx`,
  ],
  SelectUserInfoVersion1: [
    '/User/SelectUserInfoVersion1',
    `${API_SITE}User/SelectUserInfoVersion1`,
  ],
  SelectOrdersVersion: [
    '/Order/SelectOrdersVersion1',
    `${API_SITE}Order/SelectOrdersVersion1`,
  ],
  FetchOrderDetialVersion: [
    '/Order/FetchOrderDetialVersion1',
    `${API_SITE}Order/FetchOrderDetialVersion1`,
  ],
  GetOrderDetailStatusInfo: [
    '/Order/GetOrderDetailStatusInfo',
    `${API_SITE}Order/GetOrderDetailStatusInfo`
  ],
  SelectPeccancyOrderDetail: [
    '/Order/SelectPeccancyOrderDetail',
    `${API_SITE}Order/SelectPeccancyOrderDetail`,
  ],
  getSilunService: [
    '/Order/GetSilunService',
    `${API_SITE}Order/GetSilunService`,
  ],
  GetOptionalsForTireOrder: [
    '/Order/GetOptionalsForTireOrder',
    `${API_SITE}Order/GetOptionalsForTireOrder`,
  ],
  // homeList: ['/wechatapp/GetWechatHome', `${WX_SITE}wechatapp/GetWechatHome`],
  homeList: [
    '/wechatapp/getwechatHomeNew',
    `${WX_SITE}wechatapp/getwechatHomeNew`,
  ],
  picDetail: [
    '/products/GetProductDesction',
    `${WX_SITE}products/GetProductDesction`,
  ],
  getproducts: [
    '/wechat/getproducts',
    `${WX_SITE}wechatapp/getgroupbuyproducts`,
  ],
  GetOrderStatus: [
    '/wechatapp/GetOrderStatus',
    `${WX_SITE}wechatapp/GetOrderStatus`,
  ],
  GetGroupBuyEntity: [
    '/wechatapp/GetGroupBuyEntity',
    `${WX_SITE}wechatapp/GetGroupBuyEntity`,
  ],
  GetGroupBuying: [
    '/wechatapp/GetGroupBuying',
    `${WX_SITE}wechatapp/GetGroupBuying`,
  ],
  InsertGroupBuyingOrder: [
    '/wechatapp/InsertGroupBuyingOrder',
    `${WX_SITE}wechatapp/InsertGroupBuyingOrder`,
  ],
  GetBtnCancel: [
    '/WechatAPP/GetBtnCancel',
    `${WX_SITE}WechatAPP/GetBtnCancel?isShow=1`,
  ],
  GetOrderTrack: [
    '/Order/SelectOrderTracking',
    `${API_SITE}Order/SelectOrderTracking`,
  ],
  GetSameSeriesJiYouNew: [
    '/apinew/GetSameSeriesJiYouNew.html',
    `${BY_SITE}apinew/GetSameSeriesJiYouNew.html`,
  ],
  GetBaoYangAppPropertyResult: [
    '/apinew/GetBaoYangAppPropertyResult.html',
    `${BY_SITE}apinew/GetBaoYangAppPropertyResult.html`,
  ],
  SearchAppBaoYangProduct: [
    '/apinew/SearchAppBaoYangProduct.html',
    `${BY_SITE}apinew/SearchAppBaoYangProduct.html`,
  ],
  GetSameSeriesWiper: [
    '/apinew/GetSameSeriesWiper.html',
    `${BY_SITE}apinew/GetSameSeriesWiper.html`,
  ],
  SetDefaultCar: [
    '/CarHistory/SetDefaultCar.html',
    `${ITEM_SITE}CarHistory/SetDefaultCar.html`,
  ],
  CreateOrder: ['/CarProduct/CreateOrder', `${API_DEV}CarProduct/CreateOrder`],
  userPointCenter: [
    '/User/GetInternalCenterInfo',
    `${API_SITE}User/GetInternalCenterInfo`,
  ],
  pointRecord: [
    '/User/SelectUserIntegralRecordByUserId',
    `${API_SITE}User/SelectUserIntegralRecordByUserId`,
  ],
  GetUserCard: ['/WechatAPP/GetUserCard', `${WX_SITE}WechatAPP/GetUserCard`],
  doPacket: ['/LuckyWheel/GetPacket', `${WX_SITE}LuckyWheel/GetPacket`],
  luckList: ['/Activity/GetEntityCache', `${WX_SITE}Activity/GetEntityCache`],
  canPacket: [
    '/LuckyWheel/SelectCanPacker',
    `${WX_SITE}LuckyWheel/SelectCanPacker`,
  ],
  reloadLuck: ['/Activity/ReloadEntity', `${WX_SITE}Activity/ReloadEntity`],
  SignInOpenid: ['/user/SignInOpenid', `${WX_SITE}user/SignInOpenid`],
  SelectAreas: ['/Addresses/SelectAreas', `${API_SITE}Addresses/SelectAreas`],
  CheckOrderHasLunTaiXian: [
    '/order/CheckOrderHasLunTaiXian',
    `${WX_SITE}order/CheckOrderHasLunTaiXian`,
  ],
  InsertLunTaiXianForAPP: [
    '/order/InsertLunTaiXianForAPP',
    `${WX_SITE}order/InsertLunTaiXianForAPP`,
  ],
  wxShareUrl: ['/LuckyWheel/ShareAddOne', `${WX_SITE}LuckyWheel/ShareAddOne`],
  ShareAddOne: ['/BigBrand/ShareAddOne', `${WX_DEV}BigBrand/ShareAddOne`],
  getReceiptUrl: ['/Order/ConfirmReceipt', `${API_SITE}Order/ConfirmReceipt`],
  GetCartDetail: ['/Cart/GetCartDetail', `${API_SITE}Cart/GetCartDetail`],
  RemoveCartItem: ['/Cart/RemoveCartItem', `${API_SITE}Cart/RemoveCartItem`],
  BatchModifyCartItem: [
    '/Cart/BatchModifyCartItem',
    `${API_SITE}Cart/BatchModifyCartItem`,
  ],
  SelectBaoYangActivitySetting: [
    '/action/SelectBaoYangActivitySetting',
    `${API_SITE}action/SelectBaoYangActivitySetting`,
  ],
  CreateBaoYangActivityPromotion: [
    '/action/CreateBaoYangActivityPromotion',
    `${API_SITE}action/CreateBaoYangActivityPromotion`,
  ],
  //= == 门店相关 start ===
  shopCategories: `${API_SITE}Shops/SelectShopCategories`,
  SelectBeautyCategories: `${API_SITE}Shops/SelectBeautyCategories`,
  shopListArea: [
    '/Shops/SelectShopListArea',
    `${API_SITE}Shops/SelectShopListArea`,
  ],
  mdList: ['/Shops/SelectShopList', `${API_SITE}Shops/SelectShopList`],
  GetShopDetailByShopId: `${API_SITE}/Shops/GetShopDetailByShopId`,
  SelectPromotion: `${API_SITE}User/SelectPromotion`,
  CreateShopOrder: `${API_SITE}/Order/CreateShopOrder`,
  SelectShopComments: `${API_SITE}Comment/SelectShopComments`,
  //= == end ===
  getHotSerach: `${API_SITE}/Search/SelectDefaultAndHotSearchKeyWord`,
  getSearchList: `${ITEM_SITE}Search/SearchListVersion2.html`,
  showfilterPop: `${ITEM_SITE}Search/SearchPropertyList.html`,
  SelectSkuProductGroup: [
    '/Product/SelectSkuProductGroup',
    `${ITEM_DEV}Product/SelectSkuProductGroup.html`,
  ],
  SelectBookShopArea: `${API_SITE}/Shops/SelectBookShopArea`,
  selectProperty: `${ITEM_SITE}/Product/SelectProperty.html`,
  secKill: `${WX_SITE}/Seckill/SelectSeckill`,
  SelectProductInstallServices: `${ITEM_SITE}Product/SelectProductInstallServices.html`,
  SelectShanGouProducts: `${API_SITE}/Prime/SelectShanGouProducts`,
  IsProductVehicleMatch: `${API_SITE}/Order/IsProductVehicleMatch`,
  SelectVehicleSalesName: `${ITEM_SITE}/Car/SelectVehicleSalesName`,
  convertFreePromotionCode: `${API_SITE}Active/ConvertFreePromotionCode`,
  SelectProductPromotionGetRules: `${API_SITE}Action/SelectProductPromotionGetRules`,
  CreateProductPromotion: `${API_SITE}Action/CreateProductPromotion`,
  GetShandan: `${BY_SITE}apinew/GetShandan.html`,
  //= == 订单评价 start ===
  selectCommentListByUserId: [
    '/Order/SelectCommentListByUserId',
    `${API_SITE}Order/SelectCommentListByUserId`,
  ],
  selectOrderCommentsByOrderId: [
    '/Comment/SelectOrderCommentsByOrderId',
    `${API_SITE}Comment/SelectOrderCommentsByOrderId`,
  ],
  submitCommentOrderVersion1: [
    '/Comment/SubmitCommentOrderVersion1',
    `${API_SITE}Comment/SubmitCommentOrderVersion1`,
  ],
  seleltShopCommentsByOrderId: [
    '/Comment/SeleltShopCommentsByOrderId',
    `${API_SITE}Comment/SeleltShopCommentsByOrderId`,
  ],
  //= == 订单评价 end ===
  GetOrSearchAllBusiness: [
    '/search/allbusiness',
    `${WX_SITE}search/allbusiness`,
  ],
  //= == 会员商城 start ===
  GetMemberMallUserInfo: `${API_SITE}user/GetMemberMallUserInfo`,
  GetMemberMallPopupLayer: `${API_SITE}user/GetMemberMallPopupLayer`,
  GetMemberMallModuleConfig: `${API_SITE}/user/GetMemberMallModuleConfig`,
  GetMemberMallModuleContent: `${API_SITE}/user/GetMemberMallModuleContent`,
  GetMemberMallProducts4Tabs: `${API_SITE}/user/GetMemberMallProducts4Tabs`,
  GetMemberMallCouponList: `${API_SITE}/user/GetMemberMallCouponList`,
  GetExchangeProductDetail: `${API_SITE}/User/GetExchangeProductDetail`,
  IntegralDraw: `${API_SITE}/Action/IntegralDraw`,
  InsertExchangeProductRecord: `${API_SITE}User/InsertExchangeProductRecord`,
  //= == end ===
  OrderImageUpLoad: `${API_SITE}Order/ImageUpLoad`,
  GetReturnGoodsApplyTaskByUserId: `${API_SITE}Order/GetReturnGoodsApplyTaskByUserId`,
  GetReturnGoodsApplyTaskByTaskId: `${API_SITE}Order/GetReturnGoodsApplyTaskByTaskId`,
  CreateReturnGoodsDeliveryInfo: `${API_SITE}Order/CreateReturnGoodsDeliveryInfo`,
  GetReturnGoodsOprLog: `${API_SITE}Order/GetReturnGoodsOprLog`,
  CreateReturnGoodsApplyTask: `${API_SITE}Order/CreateReturnGoodsApplyTask`,
  GetReturnGoodsProductDetails: `${API_SITE}Order/GetReturnGoodsProductDetails`,

  // 轮胎列表活动
  SelectTireActivitySetting: `${API_SITE}Tires/SelectTireActivity`,
  SelectActivityTires: `${API_SITE}Tires/SelectActivityTires`,
  GetTireActivity: `${API_SITE}Tires/GetTireActivity`,
  //= == 个人信息 start ===
  userInfoDetail: `${WX_SITE}user/GetUserCurrent`,
  ImageUpLoad: `${API_SITE}/User/ImageUpLoad`,
  UpdateUserObjects: `${API_SITE}User/UpdateUserObjects`,
  Alert: `${API_SITE}User/Alert`,
  //= == end ===
  SelectBatteryListNew: `${API_SITE}BaoYang/SelectBatteryListNew`,
  SelectOrderAdvertise: `${API_SITE}order/SelectOrderAdvertise`,
  GetDefaultShopForProductDetail: `${API_SITE}Shops/GetDefaultShopForProductDetail`,
  GetArrivedBookDateTimeByPids: `${API_SITE}Order/GetArrivedBookDateTimeByPids`,
  CreatePromotionCode: `${BY_SITE}/apinew/CreatePromotionCode.html`,
  GetPromotionRulesByPackageType: `${BY_SITE}apinew/GetPromotionRulesByPackageType.html`,
  GetRoadRescueData: `${API_SITE}Order/GetRoadRescueData`,
  GetRoadRescueProduct: `${API_SITE}Order/GetRoadRescueProduct`,
  //= == 喷漆相关 start ===
  SelectPaintProducts: `${API_SITE}Paint/SelectPaintProducts`,
  GetServiceCharge: `${API_SITE}Paint/GetServiceCharge`,
  SelectPaintShops: `${API_SITE}Paint/SelectPaintShops`,
  SelectPaintPromotion: `${API_SITE}Paint/SelectPaintPromotion`,
  CreatePaintOrder: `${API_SITE}Paint/CreatePaintOrder`,
  SelectPaintShopComments: `${API_SITE}Paint/SelectPaintShopComments`,
  SelectPaintShopArea: `${API_SITE}Paint/SelectPaintShopArea`,
  //= == end ===
  //= == 轮毂相关 ===
  SelectHub: `${ITEM_SITE}Product/SelectHub.html`,
  InsertProductBrowseRecord: `${API_SITE}User/InsertProductBrowseRecord`,
  SelectSkuProductGroup2: `${ITEM_SITE}Product/SelectSkuProductGroup.html`,
  GetTransMoneyByProduct: `${WX_SITE}Products/GetTransMoneyByProduct`,
  //= == end ===
  SelectProductCommentByOrderListId: `${API_SITE}Comment/SelectProductCommentByOrderListId`,
  //= == 车品相关 start ===
  GetPackageTypeByPid: `${API_SITE}product/GetPackageTypeByPid`,
  //= == end ===
  SelectPack: `${WX_SITE}LuckyWheel/SelectPack`,
  //= == 轮胎花纹 ===
  FetchApi: `${ITEM_SITE}Comment/FetchApi.html`,
  GetPatternArticle: `${WX_SITE}shops/GetPatternArticle`,
  GetTiresize: `${WX_SITE}shops/GetTiresize`,
  PatternDetailForWxApp: `${WX_SITE}Shops/PatternDetailForWxApp`,
  //= == end
  SelectLikeCat: `${WX_SITE}Car/SelectLikeCat`,
  // 砍价
  GetBargainProductList: [
    '/Active/GetBargainProductList',
    `${API_DEV}Active/GetBargainProductList`,
  ],
  FetchShareBargainInfo: [
    '/Active/FetchShareBargainInfo',
    `${API_DEV}Active/FetchShareBargainInfo`,
  ],
  GetShareBargainConfig: [
    '/Active/GetShareBargainConfig',
    `${API_DEV}Active/GetShareBargainConfig`,
  ],
  FetchBargainProductHistory: [
    '/Active/FetchBargainProductHistory',
    `${API_DEV}Active/FetchBargainProductHistory`,
  ],
  GetShareBargainId: [
    '/Active/GetShareBargainId',
    `${API_DEV}Active/GetShareBargainId`,
  ],
  AddBargainAction: [
    '/Active/AddBargainAction',
    `${API_DEV}Active/AddBargainAction`,
  ],
  CheckBargainProductStatus: [
    '/Active/CheckBargainProductStatus',
    `${API_DEV}Active/CheckBargainProductStatus`,
  ],
  SetShareBargainStatus: [
    '/Active/SetShareBargainStatus',
    `${API_SITE}Active/SetShareBargainStatus`,
  ],
  SelectPrimeTiresPrice: [
    '/Prime/SelectPrimeTiresPrice',
    `${API_SITE}Prime/SelectPrimeTiresPrice`,
  ], // 首页轮胎显示最低价格
  GetTopCareList: [
    '/Prime/GetTopCareList',
    `${API_SITE}Prime/GetTopCareList`,
  ], // 首页保养显示最低价格
  SelectApiConfigure: `${API_SITE}prime/SelectApiConfigure`,
  SendInvoiceTemplate: `${API_SITE}Order/SendInvoiceTemplate`,
  //= == 保养定价 ===
  GetFixedPriceActivityStatus: `${API_SITE}Active/GetFixedPriceActivityStatus`,
  GetAppFirstPageExternalData: `${BY_SITE}apinew/GetAppFirstPageExternalData.html`,
  SearchAppBaoYangProductv2: `${BY_SITE}apinew/SearchAppBaoYangProductv2.html`,
  GetSameSeriesProductsWithDefaultCount: `${BY_SITE}apinew/GetSameSeriesProductsWithDefaultCount.html`,
  GetSameSeriesProduct: `${BY_SITE}apinew/GetSameSeriesProduct.html`,
  GetConfirmOrderDataForMaintain: `${API_SITE}Order/GetConfirmOrderDataForMaintain`,
  SignInByPhoneNumber: [
    '/user/SignInByPhoneNumber',
    `${WX_SITE}user/SignInByPhoneNumber`,
  ], // 微信获取手机号快速登录
  // 新版活动页api
  GetActivity: `${API_SITE}/Active/GetActivity`,
  GetPacket: `${WX_DEV}bigbrand/GetPacket`,
  SelectCanPacker: `${WX_SITE}/bigbrand/SelectCanPacker`,
  GetProductVideoInfo: `${API_SITE}/Product/GetProductVideoInfo`, // ?pId=TR-ME-PRIMACY-3-ST%7C8
  GetAccountRedPacket: `${TEST_DEV}user/GetWechatOfficialAccountRedPacket`, //公众号绑定领现金券线下接口
  UpdateRealAddress: `${WX_DEV}bigbrand/UpdateRealAddress`,
  selectCanPacker: `${WX_DEV}bigbrand/selectCanPacker`,
  // 取消订单原因
  GetOrderCancelReason: [
    '/Order/GetOrderCancelReason',
    `${API_SITE}Order/GetOrderCancelReason`,
  ],
  CancelOrder: [
    '/Order/CancelOrder',
    `${API_SITE}Order/CancelOrder`,
  ], // 调用和C端客户端一样的接口
  //formId接口
  GetReminding: [
    '/ZeroActivity/Reminding', `${WX_SITE}ZeroActivity/Reminding`
  ]
};

wx.apis = {};

Object.keys(apis).forEach((name) => {
  const urls = apis[name]
  if (Object.prototype.toString.call(urls) === '[object Array]') {
    wx.apis[name] = urls[urls.length - 1] // 最后一个
  } else {
    wx.apis[name] = urls;
  }
})

/** 首屏数据和banner第一张图片预加载*/
/** 去掉先获取 userId 的接口，该接口对新人很耗时，在首页拿到 userId 再刷新一次*/
wx.initHomeConfigPromise = () => wx.fetch({
  url: `${wx.apis.homeList}?version=${wx.AppVersion}&t=${(+new Date())}`,
  data: {
    userId: wx.tuhu.getUserId(),
  },
  noStatus: true,
});

wx.homeConfigPromise = wx.initHomeConfigPromise().then(res => res, () => {
  wx.homeConfigPromise = null;
});

App({
  onLaunch(options) {
    /* setTimeout(() => {
      if (options.shareTicket) {
        wx.getShareInfo({
          shareTicket: options.shareTicket,
          fail: (data) => {
            console.log(123412, data)
          },
          success: (data) => {
            wx.Ta.ta({
              event_action: 'wxapp_sharedata_test',
              event_type: 'event',
              metadata: JSON.stringify({data1: options.shareTicket, data2: data, data3: wx.tuhu.loginCode})
            });
            console.log(5555, options.shareTicket, data, wx.tuhu.loginCode, JSON.stringify({data1: options.shareTicket, data2: data, data3: wx.tuhu.loginCode}))
          }
        })
      }
    }, 1000)*/
    // https://mp.weixin.qq.com/debug/wxadoc/dev/framework/app-service/app.html


    wx.app = this;
    if ((options && options.path && options.path !== 'pages/login/login2Win') || !options) {
      const userInfo = wx.tuhu.getUserInfo();
      this.wxLogin()
      if (userInfo) {
        const userId = userInfo.UserId;
        this.getAllCarsAfterLogin(userId);
      }
    }

    // options 可能为空
    if (options) {
      const {
        scene,
      } = options
      // 场景值
      if (scene) {
        this.sceneValue = scene * 1
        wx.Ta.getTrack({
          event_type: 'event',
          metadata: {
            sceneValue: this.sceneValue,
          },
          event_action: 'wxapp_scene_value',
        })
      }
      this.autoNavigateTo()
    }

    // 获取 api 配置接口
    this.selectApiConfigure();
  },
  selectApiConfigure() {
    wx.fetch({
      url: wx.apis.SelectApiConfigure,
      noStatus: true,
    }).then((res) => {
      if (res.data.Code - 0 === 1) {
        wx.setStorageSync('ApiConfigure', res.data.Configure);
      }
    })
  },
  onHide() {

    /* setTimeout(() => {
      wx.switchTab({
        url: '../home/home'
      })
    }, 0)*/
  },
  autoNavigateTo() {
    if (this.autoNavigated) return
    this.autoNavigated = true
    if (this.sceneValue) {
      switch (this.sceneValue) {
        case 1026:
          wx.safeNavigateTo({
            url: '/pages/home/home',
          })
          break;
        default:
          break;
      }
    }
  },
  onShow() {},
  onError() {
    // 记得wxapp错误日志记录
  },
  onUnload() {
    wx.setStorageSync('deletedBuyCars', this.globalData.deletedBuyCars);
    wx.setStorageSync('deletedSelectCars', this.globalData.deletedSelectCars);
  },
  globalData: {
    code: null,
    pagePay: null,
    payLoaded: false,
    orderLoaded: false,
    loginLoaded: false,
    selectedShop: null,
    payDetailBack: false,
    baoYangGoods: null,
    baoYangProducts: null,
    baoyangCarInfo: null,
    baoyangChoose: null,
    chePingLoadData: null,
    chePingAddress: null,
    selectedCoupon: null,
    couponLists: null,
    buyCarList: null,
    deletedBuyCars: wx.getStorageSync('deletedBuyCars') || {},
    deletedSelectCars: wx.getStorageSync('deletedSelectCars') || {},
    outLogin: false,
    isFirstToTire: true,
    BatteryLoadData: null,
    BatteryAddress: null, // 电瓶的收货地址
    toChangeAddress: false,
    mdListArgs: '', // 门店列表参数
    isPerfectCar: false, // 搜索页判断是否完善车型回来
    search_changCar: false, // 判断搜索页是否是换车或完善车型回来
  },
  getCoupon(id) {
    if (wx.addcoupon) {
      const data = {
        cardId: wx.addcoupon.card_id || '',
        encryptCode: wx.addcoupon.encrypt_code || '',
        codeChannel: 'WXAPP',
        userId: id || '',
      };
      wx.fetch({
        url: wx.apis.GetUserCard,
        data,
        noStatus: true,
      })
    }
  },
  wxLogin() {
    // mark 静默登录
    wx.login({
      success: (res) => {
        if (res.code) {
          // wx.apis.SignInOpenid
          /* wx.tuhu.loginCode = res.code;
          return;*/

          wx.request({
            url: wx.apis.SignInOpenid,
            method: 'POST',
            noStatus: true,
            data: {
              wxcode: res.code,
              channel: wx.NOVARS.channel,
            },
            success: (result) => {
              if (result.data.Code === -1) {
                wx.login({
                  success: (resData) => {
                    this.wxAuthorization().then((resultData) => {
                      // wx.apis.login
                      wx.request({
                        url: wx.apis.login,
                        method: 'POST',
                        data: {
                          wxcode: resData.code,
                          signature: resultData.signature,
                          encryptedData: resultData.encryptedData,
                          channel: wx.NOVARS.channel,
                          iv: resultData.iv,
                        },
                        success: (resInfo) => {
                          if (resInfo.data.Code === 1) {
                            wx.tuhu.setUserInfo(resInfo.data);

                            this.getCoupon(resInfo.UserId);

                            this.getAllCarsAfterLogin(resInfo.UserId);
                          }
                        },
                      })
                    });
                  },
                })
              } else if (result.data.Code === 1) {
                wx.tuhu.setUserInfo(result.data);

                this.getCoupon(result.data.UserId);
                this.getAllCarsAfterLogin(result.data.UserId);
              } else {
                wx.tuhu.setUserInfo(null);
              }
            },
          })
        }
      },
    })
  },
  getAllCarsAfterLogin(userId) {
    // 每次启动后，都获取一下最新车型
    wx.getCarPresenter(userId).getAllCars().then(() => {
      if (this.refreshHomeCar) {
        this.refreshHomeCar()
      }
    });
  },
  wxAuthorization() {
    // mark 授权登录
    return new wx.Promise((resolve) => {
      wx.getUserInfo({
        complete(res) {
          resolve(res)
        },
      })
    })
  },
  formSubmit(event) {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.fetch({
            url: wx.apis.GetReminding,
            data: {
              formId: event.detail.formId,
              code: res.code
            },
            method: 'post'
          }).then((res) => {
            // console.log(res.data)
          })
        }
      }
    })
  }
})
