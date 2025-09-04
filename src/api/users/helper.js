import request from "@/utils/request/request";

/**
 * 获取日志级别
 * @param params
 * @returns {Promise<*>}
 */
export function getLogLevel(params) {
	return request.post({
		url: "p/helper/getLogLevel",
		data: params,
		customs: {
			isLoading: true,
			loadingText: "获取日志级别中..."
		}
	});
}

/**
 * 设置类日志级别
 * @param params
 * @returns {Promise<*>}
 */
export function setClassLevel(params) {
	return request.post({
		url: "/p/helper/setClassLevel",
		data: params,
		customs: {
			isLoading: true
		}
	});
}

/**
 * 设置根日志级别
 * @param params
 * @returns {Promise<*>}
 */
export function setRootLevel(params) {
	return request.post({
		url: "/p/helper/setRootLevel",
		data: params,
		customs: {
			isLoading: true,
			loadingText: "设置根日志级别中..."
		}
	});
}

/**
 * 获取类路径级别
 * @param params
 * @returns {Promise<*>}
 */
export function getLoggerList(params) {
	return request.post({
		url: "/p/helper/getLoggerList",
		data: params,
		customs: {
			isLoading: true,
			loadingText: "设置类日志级别..."
		}
	});
}
