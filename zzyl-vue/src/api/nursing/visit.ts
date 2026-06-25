import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, VisitQueryParams, VisitRecord } from '@/types/api/nursing/visit'

// 查询来访记录列表
export function listVisit(query: VisitQueryParams): Promise<TableDataInfo<VisitRecord[]>> {
  return request({
    url: '/nursing/visit/list',
    method: 'get',
    params: query
  })
}

// 查询来访记录详细
export function getVisit(id: number): Promise<AjaxResult<VisitRecord>> {
  return request({
    url: '/nursing/visit/' + id,
    method: 'get'
  })
}

// 新增来访记录
export function addVisit(data: VisitRecord): Promise<AjaxResult> {
  return request({
    url: '/nursing/visit',
    method: 'post',
    data: data
  })
}

// 修改来访记录
export function updateVisit(data: VisitRecord): Promise<AjaxResult> {
  return request({
    url: '/nursing/visit',
    method: 'put',
    data: data
  })
}

// 删除来访记录
export function delVisit(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/nursing/visit/' + id,
    method: 'delete'
  })
}

// 审核来访记录
export function approveVisit(id: number): Promise<AjaxResult> {
  return request({
    url: '/nursing/visit/approve/' + id,
    method: 'put'
  })
}

// 取消来访记录
export function cancelVisit(id: number): Promise<AjaxResult> {
  return request({
    url: '/nursing/visit/cancel/' + id,
    method: 'put'
  })
}

// 签到来访记录
export function signInVisit(id: number): Promise<AjaxResult> {
  return request({
    url: '/nursing/visit/signIn/' + id,
    method: 'put'
  })
}

// 离开登记
export function leaveVisit(id: number): Promise<AjaxResult> {
  return request({
    url: '/nursing/visit/leave/' + id,
    method: 'put'
  })
}
