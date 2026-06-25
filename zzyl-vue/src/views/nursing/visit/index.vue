<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="访客姓名" prop="visitorName">
        <el-input
          v-model="queryParams.visitorName"
          placeholder="请输入访客姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="被访人" prop="visitedName">
        <el-input
          v-model="queryParams.visitedName"
          placeholder="请输入被访人姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="来访状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in visit_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="来访日期" prop="visitDate">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['nursing:visit:add']"
        >新增来访</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="visitList">
      <el-table-column label="访客姓名" align="center" prop="visitorName" />
      <el-table-column label="访客电话" align="center" prop="visitorPhone" width="120" />
      <el-table-column label="访客身份证" align="center" prop="visitorIdCard" width="180" />
      <el-table-column label="被访人" align="center" prop="visitedName" />
      <el-table-column label="被访人部门" align="center" prop="visitedDept" />
      <el-table-column label="来访事由" align="center" prop="visitReason" :show-overflow-tooltip="true" />
      <el-table-column label="预约日期" align="center" prop="visitDate" width="100" />
      <el-table-column label="预约时间" align="center" prop="visitTime" width="100" />
      <el-table-column label="实际来访时间" align="center" prop="actualVisitTime" width="160" />
      <el-table-column label="离开时间" align="center" prop="leaveTime" width="160" />
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :options="visit_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)" v-hasPermi="['nursing:visit:query']">详情</el-button>
          <template v-if="scope.row.status === '0'">
            <el-button link type="success" icon="Check" @click="handleApprove(scope.row)" v-hasPermi="['nursing:visit:approve']">审核</el-button>
            <el-button link type="danger" icon="Close" @click="handleCancel(scope.row)" v-hasPermi="['nursing:visit:cancel']">取消</el-button>
          </template>
          <template v-if="scope.row.status === '1'">
            <el-button link type="success" icon="Position" @click="handleSignIn(scope.row)" v-hasPermi="['nursing:visit:signIn']">签到</el-button>
          </template>
          <template v-if="scope.row.status === '2'">
            <el-button link type="warning" icon="Logout" @click="handleLeave(scope.row)" v-hasPermi="['nursing:visit:leave']">离开</el-button>
          </template>
          <template v-if="scope.row.status !== '3' && scope.row.status !== '4'">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['nursing:visit:edit']">修改</el-button>
          </template>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['nursing:visit:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改来访记录对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="visitRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="访客姓名" prop="visitorName">
              <el-input v-model="form.visitorName" placeholder="请输入访客姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="访客电话" prop="visitorPhone">
              <el-input v-model="form.visitorPhone" placeholder="请输入访客电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="访客身份证" prop="visitorIdCard">
              <el-input v-model="form.visitorIdCard" placeholder="请输入访客身份证" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="被访人" prop="visitedName">
              <el-input v-model="form.visitedName" placeholder="请输入被访人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="被访人部门" prop="visitedDept">
              <el-input v-model="form.visitedDept" placeholder="请输入被访人部门" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预约日期" prop="visitDate">
              <el-date-picker
                v-model="form.visitDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择预约日期"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预约时间" prop="visitTime">
              <el-time-picker
                v-model="form.visitTime"
                value-format="HH:mm:ss"
                placeholder="请选择预约时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="来访事由" prop="visitReason">
              <el-input v-model="form.visitReason" type="textarea" placeholder="请输入来访事由" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 来访详情对话框 -->
    <el-dialog title="来访详情" v-model="detailOpen" width="600px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="访客姓名">{{ detailData.visitorName }}</el-descriptions-item>
        <el-descriptions-item label="访客电话">{{ detailData.visitorPhone }}</el-descriptions-item>
        <el-descriptions-item label="访客身份证" :span="2">{{ detailData.visitorIdCard }}</el-descriptions-item>
        <el-descriptions-item label="被访人">{{ detailData.visitedName }}</el-descriptions-item>
        <el-descriptions-item label="被访人部门">{{ detailData.visitedDept }}</el-descriptions-item>
        <el-descriptions-item label="来访事由" :span="2">{{ detailData.visitReason }}</el-descriptions-item>
        <el-descriptions-item label="预约日期">{{ detailData.visitDate }}</el-descriptions-item>
        <el-descriptions-item label="预约时间">{{ detailData.visitTime }}</el-descriptions-item>
        <el-descriptions-item label="实际来访时间">{{ detailData.actualVisitTime }}</el-descriptions-item>
        <el-descriptions-item label="离开时间">{{ detailData.leaveTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <dict-tag :options="visit_status" :value="detailData.status"/>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="Visit">
import type { VisitRecord, VisitQueryParams } from "@/types/api/nursing/visit"
import { listVisit, getVisit, addVisit, updateVisit, delVisit, approveVisit, cancelVisit, signInVisit, leaveVisit } from "@/api/nursing/visit"

const { proxy } = getCurrentInstance()
const { visit_status } = useDict('visit_status')

const visitList = ref<VisitRecord[]>([])
const open = ref<boolean>(false)
const detailOpen = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const total = ref<number>(0)
const title = ref<string>("")
const dateRange = ref<string[]>([])
const detailData = ref<VisitRecord>({})

const data = reactive({
  form: {} as VisitRecord,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    visitorName: undefined,
    visitedName: undefined,
    status: undefined,
  } as VisitQueryParams,
  rules: {
    visitorName: [
      { required: true, message: "访客姓名不能为空", trigger: "blur" }
    ],
    visitorPhone: [
      { required: true, message: "访客电话不能为空", trigger: "blur" }
    ],
    visitedName: [
      { required: true, message: "被访人不能为空", trigger: "blur" }
    ],
    visitDate: [
      { required: true, message: "预约日期不能为空", trigger: "change" }
    ],
    visitTime: [
      { required: true, message: "预约时间不能为空", trigger: "change" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询来访记录列表 */
function getList() {
  loading.value = true
  listVisit(proxy.addDateRange(queryParams.value, dateRange.value, 'visitDate')).then(response => {
    visitList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: null,
    visitorName: null,
    visitorPhone: null,
    visitorIdCard: null,
    visitedName: null,
    visitedDept: null,
    visitReason: null,
    visitDate: null,
    visitTime: null,
    actualVisitTime: null,
    leaveTime: null,
    status: 0,
    remark: null,
    createBy: null,
    updateBy: null,
    createTime: null,
    updateTime: null
  }
  proxy.resetForm("visitRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  form.value.status = 0
  open.value = true
  title.value = "新增来访登记"
}

/** 修改按钮操作 */
function handleUpdate(row: VisitRecord) {
  reset()
  const _id = row.id || ids.value[0]
  getVisit(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改来访记录"
  })
}

/** 详情按钮操作 */
function handleDetail(row: VisitRecord) {
  getVisit(row.id!).then(response => {
    detailData.value = response.data
    detailOpen.value = true
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["visitRef"].validate((valid: boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updateVisit(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addVisit(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row: VisitRecord) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除来访记录编号为"' + _ids + '"的数据项？').then(function() {
    return delVisit(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 审核按钮操作 */
function handleApprove(row: VisitRecord) {
  proxy.$modal.confirm('是否确认审核通过该来访记录？').then(function() {
    return approveVisit(row.id!)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("审核成功")
  }).catch(() => {})
}

/** 取消按钮操作 */
function handleCancel(row: VisitRecord) {
  proxy.$modal.confirm('是否确认取消该来访记录？').then(function() {
    return cancelVisit(row.id!)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("取消成功")
  }).catch(() => {})
}

/** 签到按钮操作 */
function handleSignIn(row: VisitRecord) {
  proxy.$modal.confirm('是否确认该访客已签到？').then(function() {
    return signInVisit(row.id!)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("签到成功")
  }).catch(() => {})
}

/** 离开按钮操作 */
function handleLeave(row: VisitRecord) {
  proxy.$modal.confirm('是否确认该访客已离开？').then(function() {
    return leaveVisit(row.id!)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("离开登记成功")
  }).catch(() => {})
}

getList()
</script>
