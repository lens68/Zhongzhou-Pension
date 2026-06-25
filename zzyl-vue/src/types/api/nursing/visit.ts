import type { PageDomain, BaseEntity } from "../common";

/** 来访管理分页查询参数 */
export interface VisitQueryParams extends PageDomain {
  /** 访客姓名 */
  visitorName?: string;
  /** 被访人姓名 */
  visitedName?: string;
  /** 来访状态（0:待审核, 1:已预约, 2:已签到, 3:已离开, 4:已取消） */
  status?: number;
  /** 来访日期开始 */
  beginVisitDate?: string;
  /** 来访日期结束 */
  endVisitDate?: string;
}

/** 来访记录信息 */
export interface VisitRecord extends BaseEntity {
  /** 编号 */
  id?: number;
  /** 访客姓名 */
  visitorName?: string;
  /** 访客电话 */
  visitorPhone?: string;
  /** 访客身份证 */
  visitorIdCard?: string;
  /** 被访人姓名 */
  visitedName?: string;
  /** 被访人部门 */
  visitedDept?: string;
  /** 来访事由 */
  visitReason?: string;
  /** 预约来访日期 */
  visitDate?: string;
  /** 预约来访时间 */
  visitTime?: string;
  /** 实际来访时间 */
  actualVisitTime?: string;
  /** 离开时间 */
  leaveTime?: string;
  /** 来访状态（0:待审核, 1:已预约, 2:已签到, 3:已离开, 4:已取消） */
  status?: number;
  /** 备注 */
  remark?: string;
  /** 创建人 */
  createBy?: string;
  /** 更新人 */
  updateBy?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}
