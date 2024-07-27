import { createApp } from "vue";
import "@/assets/style/global.less";
import "@/assets/style/vxev-ariable.scss";
import VXETable from "vxe-table";
import TinyLayer from "tinylayer";
import VXETablePluginExportXLSX from "vxe-table-plugin-export-xlsx";
import ExcelJS from "exceljs";
import App from "@/App.vue";
import { setupStore } from "@/store";
import router, { setupRouter } from "@/router";
import { AppProvider } from "@/components/Application";
import { setupCustomComponents, setupDirectives, setupGlobalMethods } from "@/plugins";
import { setupIcon } from "@/plugins/icons";
import "xe-utils"; // 全局导入方式，所有版本通用

async function bootstrap() {
	// 单独挂载一个vue实例方便在js中单独调用
	const appProvider = createApp(AppProvider);
	const app = createApp(App);
	// 挂载vxe-table
	VXETable.use(VXETablePluginExportXLSX, {
		ExcelJS
	});
	// 挂载vxe-table
	app.use(VXETable);
	// 导入弹窗组件
	app.use(TinyLayer);
	// 挂载状态管理
	setupStore(app);
	// 注册全局图标
	setupIcon(app);
	// 注册全局自定义组件
	setupCustomComponents(app);
	// 注册全局自定义指令，如：v-permission权限指令
	setupDirectives(app);
	// 注册全局方法，如：app.config.globalProperties.$message = message
	setupGlobalMethods(app);
	// 优先挂载一下 Provider 解决路由守卫，Axios中可使用，Dialog，Message 等之类组件
	appProvider.mount("#appProvider", true);
	// 挂载路由
	await setupRouter(app);
	// 监听路由准备就绪后挂载APP实例
	await router.isReady();
	// 挂载vue实例
	app.mount("#app", true);
}

// eslint-disable-next-line no-void
void bootstrap();
