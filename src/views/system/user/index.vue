<template>
	<page-content :style="{ height: height + 'px' }">
		<div id="userSearchBox" style="position: relative; height: 100%">
			<div style="display: flex; justify-content: space-between; height: 100%">
				<!--   机构树-->
				<org-tree style="margin-right: 5px" @selectOrg="selectOrg"></org-tree>
				<!--   科室树-->
				<dep-tree ref="DepTreeRef" @selectDep="selectDep"></dep-tree>

				<div style="width: calc(100% - 400px); padding-right: 10px">
					<n-card style="margin-left: 5px">
						<template #header>
							<n-space>
								<n-input
									style="width: 150px"
									v-model:value="searchForm.name"
									placeholder="用户姓名\拼音码"
									@keydown.enter="resetTableList"
									clearable
								/>
								<n-input
									style="width: 150px"
									v-model:value="searchForm.account"
									placeholder="请输入账号"
									@keydown.enter="resetTableList"
									clearable
								/>

								<n-select v-model:value="searchForm.state" :options="stateJudgeOption" style="width: 100px" />
								<n-select
									clearable
									placeholder="请选择用户角色"
									v-model:value="searchForm.roleId"
									:options="roleList"
									style="width: 150px"
								/>
								<n-button type="primary" @click="resetTableList">查询</n-button>
								<n-button @click="resetQuery">重置</n-button>
							</n-space>
						</template>
						<template #header-extra>
							<n-button type="primary" @click="handleAddUser">新增用户</n-button>
							<n-divider vertical />
							<search-box :placement="'top'" :to="'#userSearchBox'" @reset="resetQuery" @search="resetTableList">
								<n-form
									ref="formRef"
									:model="searchForm"
									inline
									label-placement="left"
									label-width="100px"
									require-mark-placement="left"
								>
									<n-grid cols="2 s:3 m:3 l:3 xl:4 2xl:5" responsive="screen">
										<n-grid-item>
											<n-form-item label="用户姓名:" path="name">
												<n-input v-model:value="searchForm.name" placeholder="请输入用户姓名" />
											</n-form-item>
										</n-grid-item>
										<n-grid-item>
											<n-form-item label="手机号:" path="phone">
												<n-input v-model:value="searchForm.phone" placeholder="请输入用户手机号" />
											</n-form-item>
										</n-grid-item>
										<n-grid-item>
											<n-form-item label="用户账号:" path="account">
												<n-input v-model:value="searchForm.account" :resizable="false" placeholder="请输入账号" />
											</n-form-item>
										</n-grid-item>
										<n-grid-item>
											<n-form-item label="是否在线:" path="ifOnline">
												<n-select v-model:value="searchForm.ifOnline" :options="onLineOption" style="width: 100%" />
											</n-form-item>
										</n-grid-item>
										<n-grid-item>
											<n-form-item label="状态:" path="state">
												<n-select v-model:value="searchForm.state" :options="stateJudgeOption" style="width: 100%" />
											</n-form-item>
										</n-grid-item>
										<n-grid-item>
											<n-form-item label="创建时间:" path="dateTimeRange">
												<n-date-picker
													v-model:value="dateTimeRange"
													:forma="'YYYY-mm-dd HH:MM:SS'"
													clearable
													type="datetimerange"
													@update-value="changeTime"
												/>
											</n-form-item>
										</n-grid-item>
									</n-grid>
								</n-form>
							</search-box>
							<n-divider vertical />
							<n-tooltip>
								<span>上传用户excel文件</span>
								<template #trigger>
									<n-icon size="17" @click="importDataEvent">
										<Upload />
									</n-icon>
								</template>
							</n-tooltip>
							<n-divider vertical />
							<n-tooltip>
								<span>用户信息模板下载</span>
								<template #trigger>
									<n-icon size="17" @click="exportDataEvent">
										<Download />
									</n-icon>
								</template>
							</n-tooltip>
							<n-divider vertical />
							<n-tooltip>
								<span>刷新</span>
								<template #trigger>
									<n-icon size="17" @click="resetTableList">
										<Refresh />
									</n-icon>
								</template>
							</n-tooltip>
							<n-divider vertical />
							<n-tooltip>
								<span>密度</span>
								<template #trigger>
									<n-popselect v-model:value="tableSize" :options="tableSizeOptions" trigger="click">
										<n-icon size="17">
											<AutoFitHeight20Filled />
										</n-icon>
									</n-popselect>
								</template>
							</n-tooltip>
							<n-divider vertical />
						</template>

						<vxe-table
							stripe
							ref="tableRef"
							:data="tableList"
							:height="height - 140"
							:loading="tableLoading"
							:size="tableSize"
							align="center"
							border="none"
							resizable
							row-id="code"
							show-header-overflow="title"
							show-overflow
							:row-config="{ isHover: true, isCurrent: true }"
						>
							<vxe-column field="id" show-overflow="title" title="ID" width="50px"></vxe-column>
							<vxe-column field="account" min-width="100px" show-overflow="title" title="账号"></vxe-column>
							<vxe-column field="name" min-width="100px" show-overflow="title" title="用户名称"></vxe-column>
							<vxe-column field="piny" min-width="100px" show-overflow="title" title="拼音码"></vxe-column>
							<vxe-column field="nmsUserCode" min-width="100" show-overflow="title" title="医保编码"></vxe-column>
							<vxe-column field="nmsUserName" min-width="120" show-overflow="title" title="医保名称"></vxe-column>
							<vxe-column field="deptList" min-width="100" show-overflow="title" title="所处科室数">
								<template #default="{ row }">
									<n-tag size="small" type="primary" @click="viewDepartments(row)">
										<n-icon :component="UserOutlined" />
										<span style="font-size: 16px; margin-left: 5px">{{ row.deptList?.length || 0 }}</span>
									</n-tag>
								</template>
							</vxe-column>
							<vxe-column field="roleObjList" min-width="100" show-overflow="title" title="拥有角色数">
								<template #default="{ row }">
									<n-tag size="small" type="primary" @click="openBindRoles(row)">
										<n-icon :component="UserOutlined" />
										<span style="font-size: 16px; margin-left: 5px">{{ row.roleObjList?.length || 0 }}</span>
									</n-tag>
								</template>
							</vxe-column>
							<vxe-column field="phone" min-width="100px" show-overflow="title" title="手机号"></vxe-column>
							<vxe-column field="email" min-width="100px" show-overflow="title" title="邮箱"></vxe-column>
							<vxe-column field="userType" min-width="100px" show-overflow="title" title="用户类型">
								<template #default="{ row }">
									<dict-show :dictCode="row.userType"></dict-show>
								</template>
							</vxe-column>
							<vxe-column field="state" min-width="80px" show-overflow="title" title="状态">
								<template #default="{ row }">
									<option-badge :options="stateJudgeOption" :val="row.state" />
								</template>
							</vxe-column>
							<vxe-column field="ifOnline" min-width="120px" show-overflow="title" title="是否在线">
								<template #default="{ row }">
									<option-badge :options="ifOnLineOption" :val="row.ifOnline" />
								</template>
							</vxe-column>
							<vxe-column field="sortNum" min-width="100px" show-overflow="title" title="排序号"></vxe-column>

							<vxe-column fixed="right" title="操作" width="240px">
								<template #default="{ row }">
									<div class="dropDown">
										<n-button v-action:editUserButton quaternary size="small" type="primary" @click="edit(row)">编辑 </n-button>
										<n-button v-action:userAssignRoles quaternary size="small" type="primary" @click="openBindRoles(row)">
											分配角色
										</n-button>
										<n-popover placement="bottom" trigger="click">
											<template #trigger>
												<n-button v-action:userMoreHandle quaternary size="small" type="info">更多操作</n-button>
											</template>

											<div style="display: flex; flex-direction: column; align-items: center">
												<n-button
													v-if="row.state !== 2"
													quaternary
													size="small"
													type="error"
													@click="moreHandleSelect('disabled', row)"
													>禁用
												</n-button>
												<n-button
													v-if="row.state !== 3"
													quaternary
													size="small"
													type="error"
													@click="moreHandleSelect('delete', row)"
													>删除
												</n-button>
												<n-button
													v-if="row.state === 4"
													quaternary
													size="small"
													type="info"
													@click="moreHandleSelect('unlock', row)"
													>解锁
												</n-button>
												<n-button
													v-if="row.state === 2 || row.state === 3"
													quaternary
													size="small"
													type="info"
													@click="moreHandleSelect('recoverState', row)"
												>
													恢复状态
												</n-button>
												<n-button quaternary size="small" type="info" @click="moreHandleSelect('resetPassword', row)">
													重置密码
												</n-button>
												<n-button
													v-if="row.ifOnline === 1"
													quaternary
													size="small"
													type="error"
													@click="moreHandleSelect('forcedOffline', row)"
													>强制离线
												</n-button>
											</div>
										</n-popover>
									</div>
								</template>
							</vxe-column>
							<template #empty>
								<n-empty description="暂无数据"></n-empty>
							</template>
						</vxe-table>
						<n-pagination
							v-model:page="page.currentPage"
							v-model:page-size="page.pageSize"
							:item-count="page.totalResult"
							:page-sizes="page.pageSizes"
							show-quick-jumper
							show-size-picker
							style="display: flex; justify-content: right; margin-top: 5px"
							@update:page="onChange"
							@update:page-size="onUpdatePageSize"
						>
							<template #suffix> 共 {{ page.totalResult }} 条数据</template>
						</n-pagination>
						<create-form ref="userCreateFormRef" @ok="resetTableList"></create-form>
						<bind-roles ref="bindRolesRef"></bind-roles>
						<dept-users ref="deptUsersRef" />
					</n-card>
				</div>
			</div>
		</div>
	</page-content>
</template>

<script setup>
import { ref } from "vue";
import { useMessage, useDialog } from "naive-ui";
import { UserOutlined } from "@vicons/antd";
import { useWindowSize } from "@/hooks/useWindowSize";
import useTable from "@/hooks/useTable";
import { ifOnLineOption, stateJudgeOption } from "@/constant/system/resource";
import CreateForm from "@/views/system/user/components/create-form.vue";
import DepTree from "@/views/system/user/components/dep-tree.vue";
import OrgTree from "@/views/system/user/components/org-tree.vue";
import {
	restPasswd,
	kickout,
	disableOrDelUser,
	recoveryUser,
	unlock,
	uploadUser,
	downLoadTemplate,
	getUserListNew
} from "@/api/system/user";
import useTableData from "@/hooks/useTableData";
import file from "@/utils/file";
import BindRoles from "@/views/system/user/components/bind-roles.vue";
import DeptUsers from "./components/deptUsers.vue";
import { getRoleList } from "@/api/system/role";

defineOptions({ name: "user" });

const deptUsersRef = ref();
const DepTreeRef = ref();
const bindRolesRef = ref();
const tableRef = ref();
const userCreateFormRef = ref();
// eslint-disable-next-line no-unused-vars
const message = useMessage();
const dialog = useDialog();
const { height } = useWindowSize();
const { tableSizeOptions, tableSize } = useTable();
const dateTimeRange = ref(null);
const orgInfo = ref({}); // 机构信息
const depInfo = ref({}); // 科室信息
const roleList = ref([]);
const onLineOption = ref([
	{ value: 0, label: "离线" },
	{ value: 1, label: "在线" }
]);

const formData = {
	orgCode: null,
	departCode: null,
	name: null,
	phone: null,
	account: null,
	ifOnline: null,
	state: 1,
	roleId: null,
	createTimeScope: null
};
// eslint-disable-next-line no-unused-vars
const { tableList, tableLoading, searchForm, page, onChange, onUpdatePageSize, resetTableList, getTableData } = useTableData({
	requestMethod: getUserListNew,
	formData,
	LoadData: false
});

getRoleList({ pageNo: 1, pageSize: 100 }).then(res => {
	if (res.success) {
		roleList.value = res.result.data.map(item => {
			return { ...item, label: item.name, value: item.id };
		});
	}
});

// 选中机构
const selectOrg = data => {
	DepTreeRef.value.getDep(data);
	orgInfo.value = data;
};
// 选中科室
const selectDep = data => {
	depInfo.value = data;
	searchForm.value.orgCode = orgInfo.value.orgCode;
	searchForm.value.departCode = depInfo.value.depCode;
	resetTableList();
};

const viewDepartments = row => {
	deptUsersRef.value.open(row);
};

// 重置查询条件
const resetQuery = () => {
	searchForm.value.name = "";
	searchForm.value.phone = "";
	searchForm.value.account = "";
	searchForm.value.createTimeScope = "";
	searchForm.value.ifOnline = undefined;
	searchForm.value.state = 1;
	resetTableList();
};

// 改变时间范围
const changeTime = (value, formattedValue) => {
	if (formattedValue?.length > 0) {
		searchForm.value.createTimeScope = `${formattedValue[0]}~${formattedValue[1]}`;
	} else {
		searchForm.value.createTimeScope = "";
	}
};

// 新增用户
const handleAddUser = () => {
	if (orgInfo.value.ifExist && depInfo.value.ifExist && depInfo.value.depCode) {
		userCreateFormRef.value.addUser({ ...orgInfo.value, ...depInfo.value });
	} else {
		message.warning("请先选择科室");
	}
};

// 编辑用户
const edit = row => {
	userCreateFormRef.value.editUser({ ...row, deptList: undefined, roleObjList: undefined });
};

// 选择更多操作
// eslint-disable-next-line no-unused-vars
const moreHandleSelect = (key, row) => {
	if (key === "resetPassword") {
		dialog.warning({
			title: "重置密码",
			content: "你确定要重置该用户的密码为111111吗？",
			positiveText: "重置",
			negativeText: "取消",
			onPositiveClick: () => {
				restPasswd({ userId: row.id }).then(res => {
					if (res.success) {
						message.success("密码已重置");
						resetTableList();
					}
				});
			},
			onNegativeClick: () => {
				console.log("取消");
			}
		});
	}
	if (key === "forcedOffline") {
		dialog.warning({
			title: "强制离线",
			content: "你确定要强制该用户离线吗？",
			positiveText: "确定",
			negativeText: "取消",
			onPositiveClick: () => {
				kickout({ userId: row.id }).then(res => {
					if (res.success) {
						message.success("已成功强制该用户离线");
						resetTableList();
					}
				});
			},
			onNegativeClick: () => {
				console.log("取消");
			}
		});
	}
	if (key === "disabled") {
		dialog.warning({
			title: "禁用",
			content: "你确定要禁用该用户吗？",
			positiveText: "确定",
			negativeText: "取消",
			onPositiveClick: () => {
				disableOrDelUser({ userId: row.id, type: "disable" }).then(res => {
					if (res.success) {
						message.success("已成功禁用该用户");
						resetTableList();
					}
				});
			},
			onNegativeClick: () => {
				console.log("取消");
			}
		});
	}
	if (key === "delete") {
		dialog.warning({
			title: "删除",
			content: "你确定要删除该用户吗？",
			positiveText: "确定",
			negativeText: "取消",
			onPositiveClick: () => {
				disableOrDelUser({ userId: row.id, type: "delete" }).then(res => {
					if (res.success) {
						message.success("已成功删除该用户");
						resetTableList();
					}
				});
			},
			onNegativeClick: () => {
				console.log("取消");
			}
		});
	}
	if (key === "recoverState") {
		recoveryUser({ userId: row.id }).then(res => {
			if (res.success) {
				message.success("操作成功");
				resetTableList();
			}
		});
	}
	if (key === "unlock") {
		unlock({ userId: row.id }).then(res => {
			if (res.success) {
				message.success("操作成功");
				resetTableList();
			}
		});
	}
};

// 导入
const importDataEvent = () => {
	file({ accept: ".xlsx,.xls", number: 1 }).then(files => {
		uploadUser({ file: files[0] }).then(res => {
			console.log("导入结果：{}", res.result);
			if (res.success) {
				resetTableList();
			}
		});
	});
};

// 模板下载
const exportDataEvent = () => {
	downLoadTemplate({ type: 1 }).then(data => {
		console.log(data, "data");
		// 截取文件名，这里是后端返回了文件名+后缀，如果没有可以自己拼接
		const fileName = decodeURI("用户信息模板.xlsx");
		// 将`blob`对象转化成一个可访问的`url`
		const url = window.URL.createObjectURL(new Blob([data]));
		const link = document.createElement("a");
		link.style.display = "none";
		link.href = url;
		link.setAttribute("download", fileName);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	});
};

const openBindRoles = row => {
	bindRolesRef.value.open(row);
};
</script>

<style lang="less" scoped></style>
