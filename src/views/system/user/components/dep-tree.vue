<template>
	<n-card
		size="small"
		style="width: 200px; flex-shrink: 0"
		title="科室列表"
		:segmented="{
			content: true
		}"
		:content-style="{ overflow: 'auto' }"
	>
		<div style="width: 100%; height: 100%; display: flex; flex-direction: column">
			<div style="flex-shrink: 0">
				<n-input v-model:value="pattern" placeholder="搜索科室" clearable />
			</div>
			<div style="flex: 1; min-height: 0; overflow: auto">
				<n-tree
					show-line
					block-line
					:pattern="pattern"
					:cancelable="true"
					:data="treeData"
					:default-selected-keys="defaultSelect"
					:render-label="treeRenderLabel"
					@update-selected-keys="select"
					:show-irrelevant-nodes="false"
				/>
			</div>
		</div>
	</n-card>
</template>

<script setup>
import { h, ref, nextTick } from "vue";
import { getDeptByOrgCode } from "@/api/system/depAdmin";

const pattern = ref("");
const treeData = ref([]);
const defaultSelect = ref([]);
const orgCode = ref();
const emits = defineEmits(["selectDep"]);
const reLoad = ref(true);

const treeRenderLabel = ({ option }) => {
	return h("span", { style: "display: block; overflow: hidden; white-space: nowrap; text-overflow:ellipsis;" }, option.label);
};

const handleReLoad = () => {
	reLoad.value = false;
	nextTick(() => {
		reLoad.value = true;
	});
};

// 获取科室列表
const getDep = data => {
	handleReLoad();
	if (data.ifExist) {
		orgCode.value = data.orgCode;
		getDeptByOrgCode({ orgCode: data.orgCode }).then(res => {
			if (res.success) {
				const optionData = res.result.map(item => {
					return { code: item.code, pcode: item.pcode ? item.pcode : "", key: item.code, label: item.name };
				});
				// 转为树形数据
				const cloneData = JSON.parse(JSON.stringify(optionData)); // 对源数据深度克隆,防止污染原始数据
				treeData.value = cloneData.filter(father => {
					const branchArr = cloneData.filter(child => father.code === child.pcode); // 返回每一项的子级数组
					// eslint-disable-next-line no-unused-expressions,no-param-reassign
					branchArr.length > 0 ? (father.children = branchArr) : ""; // 如果存在子级，则给父级添加一个children属性，并赋值
					if (father.pcode === "") return true;
					return !!cloneData.find(item => item.code === father.pcode);
					// return ; // 返回第一层
				});
				if (treeData.value.length > 0) {
					defaultSelect.value.splice(0, defaultSelect.value.length);
					defaultSelect.value.push(treeData.value[0]?.key);
					emits("selectDep", { depCode: treeData.value[0].code, depName: treeData.value[0].name, ifExist: true });
				} else {
					emits("selectDep", { depCode: "", depName: "", ifExist: false });
				}
			}
		});
	} else {
		treeData.value = [];
		orgCode.value = null;
		emits("selectDep", { depCode: "", depName: "", ifExist: false });
	}
};

// 选中科室
// eslint-disable-next-line no-unused-vars
const select = (keys, option) => {
	if (keys.length > 0) {
		emits("selectDep", { depCode: option[0].code, depName: option[0].name, ifExist: true });
	} else {
		emits("selectDep", { depCode: null, depName: null, ifExist: true });
	}
};

defineExpose({ getDep });
</script>

<style scoped>
::v-deep(.n-tree .n-tree-node) {
	padding: 7px 5px 2px 0;
}
</style>
