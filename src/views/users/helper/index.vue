<!--
  文件描述：
  创建时间：2023/10/4 13:49
  创建人：gzh
-->
<template>
	<page-content :style="{ height: height + 'px' }">
		<n-card
			style="height: 100%"
			size="small"
			:segmented="{
				content: true
			}"
			:content-style="{ height: '100%' }"
		>
			<n-tabs size="small" type="line" v-model:value="activeTab" :bar-width="500" @update:value="changeTab">
				<n-tab-pane :name="1" tab="修改日志级别" style="height: 100%" display-directive="show"> </n-tab-pane>
			</n-tabs>
			<div style="height: calc(100% - 42px)">
				<div v-if="activeTab === 1" style="width: 100%; height: 100%; overflow-y: scroll">
					<!--根路径-->
					<div class="content-log-container">
						<card-header class="content-log-header">根路径</card-header>
						<n-space class="content-log-row" align="center">
							<div class="content-log-label">当前级别：</div>
							<div class="content-log-current-level">{{ rootLevel }}</div>
							<n-icon size="14" title="获取根路径最新的级别" @click="getRootLevel()">
								<Refresh />
							</n-icon>
						</n-space>
						<n-space class="content-log-row" align="center">
							<div class="content-log-label">修改为：</div>
							<n-select
								v-model:value="newRootLevel"
								:options="logLevelOptions"
								placeholder="请选择根路径日志级别"
								style="width: 400px"
							></n-select>
							<n-button type="primary" @click="saveRootLeave">确认</n-button>
						</n-space>
					</div>
					<!--类路径-->
					<div class="content-log-container">
						<card-header class="content-log-header">类路径</card-header>
						<div style="width: 100%; display: flex; gap: 10px">
							<vxe-table
								style="width: calc(50% - 10px)"
								stripe
								border
								height="300px"
								align="center"
								:auto-resize="true"
								show-header-overflow="title"
								show-overflow
								:data="classList"
								:row-config="{ isCurrent: true, isHover: true }"
								row-id="id"
								resizable
								@cell-click="onSelectedClass"
							>
								<vxe-column field="name" min-width="200px" show-overflow="title" align="left" title="路径"></vxe-column>
								<vxe-column field="level" min-width="100px" show-overflow="title" title="级别"></vxe-column>
							</vxe-table>
							<div
								style="
									width: 50%;
									border: 1px solid #e0e0e0;
									border-radius: 8px;
									background-color: #ffffff;
									box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
									padding: 16px;
								"
							>
								<n-space class="content-log-row" align="center">
									<div class="content-log-label">类路径：</div>
									<div class="content-log-current-level">{{ classLevelPath }}</div>
								</n-space>
								<n-space class="content-log-row" align="center">
									<div class="content-log-label">当前级别：</div>
									<div class="content-log-current-level">{{ classLevel }}</div>
								</n-space>
								<n-space class="content-log-row" align="center">
									<div class="content-log-label">修改为：</div>
									<n-select
										v-model:value="newclassLevel"
										:options="logLevelOptions"
										placeholder="请选择类日志级别"
										style="width: 300px"
									></n-select>
									<n-button type="primary" @click="saveClassLeave">确认</n-button>
								</n-space>
							</div>
						</div>
					</div>
				</div>
			</div>
		</n-card>
	</page-content>
</template>

<script setup>
import { getLoggerList, getLogLevel, setClassLevel, setRootLevel } from "@/api/users/helper";
import { useWindowSize } from "@/hooks/useWindowSize";

defineOptions({ name: "helper" });
const { height } = useWindowSize();

const activeTab = ref(1); // tab默认1：修改日志级别

const rootLevel = ref(null); // 根路径当前级别
const newRootLevel = ref(null); // 根路径修改为级别
const logLevelOptions = ref([
	{ label: "ALL", value: "ALL" },
	{ label: "INFO", value: "INFO" },
	{ label: "WARN", value: "WARN" },
	{ label: "ERROR", value: "ERROR" },
	{ label: "TRACE", value: "TRACE" },
	{ label: "DEBUG", value: "DEBUG" },
	{ label: "OFF", value: "OFF" }
]);

// 类路径
const classLevelPath = ref(null);
// 类级别--根据类路径返回
const classLevel = ref(null);
// 修改的类级别
const newclassLevel = ref(null);
// 类日志list
const classList = ref([]);
// 获取日志级别
const getRootLevel = () => {
	getLogLevel({ logName: "root" }).then(res => {
		if (res.success) {
			rootLevel.value = res.result;
		} else {
			rootLevel.value = null;
		}
	});
};
// 保存根日志级别
const saveRootLeave = () => {
	if (!newRootLevel.value) {
		window.$message.warning("请选择你要修改的日志级别！");
		return;
	}
	// 设置根日志级别
	setRootLevel({ rootLevel: newRootLevel.value })
		.then(res => {
			if (res.success) {
				// eslint-disable-next-line no-use-before-define
				getClassList();
				getRootLevel();
			}
		})
		.finally(() => {
			newRootLevel.value = null;
		});
};

// 选中类
const onSelectedClass = ({ row }) => {
	classLevelPath.value = row.name;
	classLevel.value = row.level;
};

// 获取类list
const getClassList = () => {
	getLoggerList().then(res => {
		if (res.success) {
			classList.value = res.result;
			if (classLevelPath.value) {
				const info = classList.value.find(data => data.name === classLevelPath.value);
				if (info) {
					classLevel.value = info.level;
				} else {
					classLevelPath.value = null;
					classLevel.value = null;
				}
			}
		}
	});
};

// 设置类日志级别
const saveClassLeave = () => {
	if (!rootLevel.value) {
		window.$message.warning("根路径的级别不可为空，请先设置！");
		return;
	}
	if (!classLevelPath.value) {
		window.$message.warning("请输入类路径！");
		return;
	}
	if (!newclassLevel.value) {
		window.$message.warning("请选择你要修改的日志级别");
		return;
	}
	// 设置类日志级别
	setClassLevel({ rootLevel: rootLevel.value, level: newclassLevel.value, path: classLevelPath.value })
		.then(res => {
			if (res.success) {
				getClassList();
				getRootLevel();
			}
		})
		.finally(() => {
			newclassLevel.value = null;
		});
};

// 切换tab
const changeTab = val => {
	activeTab.value = val;
};

onMounted(() => {
	getRootLevel();
	getClassList();
});
</script>

<style scoped lang="less">
.content-log-container {
	width: 100%;
	padding: 16px;
	box-sizing: border-box;
	border: 1px solid #e0e0e0;
	border-radius: 8px;
	background-color: #ffffff;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	margin-bottom: 16px;
}

/* 标题 */
.content-log-header {
	text-align: center;
	margin-bottom: 20px;
	font-size: 16px;
	color: #333;
}

/* 行容器 */
.content-log-row {
	width: 100%;
	margin-bottom: 16px;
}

/* 标签样式 */
.content-log-label {
	width: 70px;
	color: #777;
	font-weight: 500;
	text-align: right;
}

/* 当前级别文字 */
.content-log-current-level {
	color: #1a1a1a;
	font-weight: 500;
	min-width: 80px;
	text-align: center;
}
</style>
