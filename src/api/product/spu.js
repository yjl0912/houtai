import request from "@/utils/request";

const api_name = '/admin/product';

export default {
  // 获取spu分页列表
  getSpuList({category3Id, page, limit}){
    return request ({
      url:`${api_name}/${page}/${limit}`,
      method:'GET',
      params:{
        category3Id
      }
    })
  },
  // 获取销售属性列表
  getSaleAttrList(){
    return request({
      url:`${api_name}/baseSaleAttrList`,
      method:'GET'
    });
  },
  // 删除spu
  deleteSpu(spuId){
    return request({
      url:`${api_name}/deleteSpu/${spuId}`,
      method:'DELETE'
    })
  },

//  添加spu
 saveSpu(spu){
  return request({
    url:`${api_name}/saveSpuInfo`,
    method:'POST',
    data:spu
  })
},
//  更新spu
updateSpu(spu){
  return request({
    url:`${api_name}/updateSpuInfo`,
    method:'POST',
    data:spu
  })
}
}
