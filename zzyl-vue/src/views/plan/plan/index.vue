<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="planName">
        <el-input
          v-model="queryParams.planName"
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in nursing_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['plan:plan:add']"
        >新增</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="planList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="sortNo" />
      <el-table-column label="名称" align="center" prop="planName" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
       <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="nursing_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['plan:plan:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['plan:plan:remove']">删除</el-button>
          <el-button link type="primary" icon="Search" @click="handleLook(scope.row)">查看</el-button>
          <el-button link type="primary" :icon="scope.row.status == 0 ? 'Unlock' : 'lock'"
            @click="handleEnable(scope.row)">{{ scope.row.status == 1 ? '禁用' : '启用' }}</el-button>

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

    <!-- 添加或修改护理计划对话框 -->
   <el-dialog :title="title" v-model="open" width="840px"  @close="cancel()">
      <el-form ref="planRef" :model="form" :rules="rules" label-width="120px">
        <el-row gutter="10">
          <el-col :span="24" class="elcolFlex">
            <el-form-item label="护理计划名称：" prop="planName">
              <el-input v-model="form.planName" :disabled="isLook"></el-input>
            </el-form-item>
            <el-form-item label="状态：" prop="status">
              <el-radio-group v-model="form.status" :disabled="isLook">
                <el-radio v-for="dict in nursing_status" :value="dict.value" :label="dict.value"
                  :key="dict.value">{{
                    dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="排序：" prop="sortNo">
              <el-input-number :disabled="isLook" v-model="form.sortNo" :min="0" large-number :max="999999"
                :decimal-places="0" @blur="textBlurNo" @change="textBlurNo"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="护理项目：">
          <div class="info family">
            <div class="tableHead">
              <div>护理项目名称</div>
              <div>期望服务时间</div>
              <div>执行周期</div>
              <div>执行频次(次)</div>
              <div v-if="!isLook">操作</div>
            </div>
            <div class="tableBody">
              <div class="tableColumn" v-for="(item, index) in projectList" :key="index">
                <div class="column">
                  <el-select :disabled="isLook" v-model="item.projectId" placeholder="请选择">
                    <el-option v-for="item in projectOptions" :key="item.value" :label="item.label"
                      :value="item.value"></el-option>
                  </el-select>
                </div>
                <div class="column">
                  <el-time-picker v-model="item.executeTime" format="HH:mm:ss" value-format="HH:mm:ss"
                    :style="{ width: '100%' }" placeholder="请选择时间选择" :disabled="isLook" clearable></el-time-picker>
                </div>
                <div class="column">
                  <el-select v-model="item.executeCycle" placeholder="请选择" :disabled="isLook">
                    <el-option v-for="item in executeCycleOptions" :key="item.value" :label="item.label"
                      :value="item.value"></el-option>
                  </el-select>
                </div>
                <div class="column">
                  <el-input-number v-model="item.executeFrequency" :controls="false" :max="7" :min="1"
                    :disabled="isLook" />
                </div>
                <div class="column" v-if="!isLook">
                    <el-button   type="primary" circle @click="handleRowAdd(item, index)"> + </el-button>
                    <el-button   type="danger"  circle v-if="projectList.length > 1" @click="handleRowDel"  > - </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div class="dialog-footer" v-if="!isLook">
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="cancel()">取消</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script setup lang="ts" name="Plan">
import type { NursingPlan, PlanQueryParams } from "@/types/api/plan/plan"
import { listPlan, getPlan, delPlan, addPlan, updatePlan } from "@/api/plan/plan"
import { getAllProjects } from '@/api/nursing/project';

const { proxy } = getCurrentInstance()
const { nursing_status } = useDict('nursing_status')


const open = ref<boolean>(false)
const loading = ref<boolean>(true)
const showSearch = ref<boolean>(true)
const ids = ref<number[]>([])
const single = ref<boolean>(true)
const multiple = ref<boolean>(true)
const total = ref<number>(0)
const title = ref<string>("")
const isLook = ref(false);
const projectOptions = ref([]);
const executeCycleOptions = ref([
  { label: '天', value: '0' },
  { label: '周', value: '1' },
  { label: '月', value: '2' },
]);

const planList = ref([])
const projectList = ref([
  {
    projectId: '',
    executeTime: '',
    executeCycle: '',
    executeFrequency: '',
  }
])

// 删除行数据
const handleRowDel = (item:NursingPlan, index:number) => {
  if (projectList.value.length === 1) return;
  projectList.value.splice(index, 1);
};
// 添加行数据
const handleRowAdd = () => {
  const obj = {
    projectId: '',
    executeTime: '',
    executeCycle: '',
    executeFrequency: '',
  };
  projectList.value.push(obj);
};


const data = reactive({
  form: {} as NursingPlan,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    planName: undefined,
    status: undefined,
  } as PlanQueryParams,
  rules: {
    planName: [
      { required: true, message: "名称不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态 0禁用 1启用不能为空", trigger: "change" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

const handleEnable = async (row:NursingPlan) => {
  try {
    // 获取状态
    const status = row.status;
    const info = status === 0 ? '启用' : '禁用';

    const confirmMessage = `是否确认${info}护理项目的数据项？`;

    // 确认操作
    if (await proxy.$modal.confirm(confirmMessage)) {
      // 更新参数
      const param = {
        id: row.id,
        status: status === 0 ? 1 : 0,
      };

      // 执行更新操作
      updatePlan(param).then((response) => {
        // 成功消息
        proxy.$modal.msgSuccess(`${info}成功`);
        // 刷新列表
        getList()
      });
    }
  } catch (error) {
    // 异常处理：这里可以根据实际需求进行调整，例如打印错误日志或显示用户友好的错误信息
    console.error('操作失败，请重试或联系管理员');
  }
};
// 监听排序
const textBlurNo = () => {
  const data = form.value.sortNo;
  if (data <= 1) {
    form.value.sortNo = 1;
  }
  // 最大值设置
  if (data > 99999999) {
    form.value.sortNo = 99999999;
  }
};

// 查询所有护理项目
function getProjectList(){
  getAllProjects().then(response => {
    console.log(response);
    projectOptions.value = response.data;
  });
};

/** 查询护理计划列表 */
function getList() {
  loading.value = true
  listPlan(queryParams.value).then(response => {
    planList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  isLook.value = false;
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    planName: null,
    status: '1',
    sortNo: 1,
  };
  projectList.value = [
    {
      projectId: '',
      executeTime: '',
      executeCycle: '',
      executeFrequency: '1',
    },
  ];
  proxy.resetForm('planRef');
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection: NursingPlan[]) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加护理计划"
}

/** 修改按钮操作 */
function handleUpdate(row: NursingPlan) {
  reset()
  const _id = row.id || ids.value
  getPlan(_id).then(response => {
    form.value = response.data
    form.value.status = String(form.value.status)
    projectList.value = form.value.projectPlans;
    open.value = true
    title.value = "修改护理计划"
  })
}

// 查看
function handleLook (row: NursingPlan) {
  isLook.value = true;
  open.value = true;
  const _id = row.id || ids.value[0]
  getPlan(_id).then((response) => {
    form.value = response.data;
    form.value.status = String(form.value.status);
    projectList.value = form.value.projectPlans;
    open.value = true;
    title.value = '查看护理计划';
  });
};


// 根据id去重
function hasDuplicateIds(objectsArray: any[]) {
  // 如果没有提供数组或数组为空，则直接返回false（因为没有元素可比较）
  if (!Array.isArray(objectsArray) || objectsArray.length === 0) {
    return false;
  }

  // 创建一个新的Set来存储id
  const idSet = new Set();

  // 遍历数组中的每个对象
  for (const obj of objectsArray) {
    // 假设每个对象都有一个id属性
    if (obj.projectId !== undefined) {
      // 尝试将id添加到Set中
      idSet.add(obj.projectId);
    }
  }

  // 比较Set的大小和数组的大小
  // 如果Set的大小小于数组的大小，说明有重复的id
  return idSet.size !== objectsArray.length;
}
/** 提交按钮 */
function submitForm() {
  // 判断选择的护理项目是否有重复的
  if (hasDuplicateIds(projectList.value)) {
    // 提示重复
    proxy.$modal.msgError('请勿选择重复的护理项目');
    return;
  }
  form.value['projectPlans'] = projectList.value;

  proxy.$refs['planRef'].validate((valid:boolean) => {
    if (valid) {
      if (form.value.id != null) {
        updatePlan(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功');
          cancel();
          getList();
        });
      } else {
        addPlan(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功');
          cancel();
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row: NursingPlan) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除护理计划编号为"' + _ids + '"的数据项？').then(function() {
    return delPlan(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('plan/plan/export', {
    ...queryParams.value
  }, `plan_${new Date().getTime()}.xlsx`)
}


getList()
getProjectList()
</script>
<style src="./index.scss" lang="scss"></style>