import type Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";

const jsxRenderManager = function (
	type: string | Function,
	mSettings: Record<string, string>,
	key: string,
	renderManager: RenderManager
): Function {
	return () => {
		if (typeof type === "string") {
			if (mSettings.ref) {
				renderManager.openStart(type, mSettings.ref);
			} else {
				renderManager.openStart(type);
			}
			for (const mSetting in mSettings) {
				if (
					mSetting !== "children" &&
					mSetting !== "ref" &&
					mSetting !== "class"
				) {
					renderManager.attr(mSetting, mSettings[mSetting]);
				}
			}
			if (mSettings.class) {
				mSettings.class.split(" ").forEach((className) => {
					renderManager.class(className);
				});
			}
			renderManager.openEnd();
		}
		const children = mSettings.children as
			| (string | Function | Control)
			| (string | Function | Control)[];
		if (Array.isArray(children)) {
			children.forEach((child) => {
				if (
					typeof child === "string" ||
					typeof child === "number" ||
					typeof child === "boolean"
				) {
					renderManager.text(child.toString());
				} else if (typeof child === "function") {
					child();
				} else if (child !== undefined) {
					renderManager.renderControl(child);
				}
			});
		} else if (
			typeof children === "string" ||
			typeof children === "number" ||
			typeof children === "boolean"
		) {
			renderManager.text(children.toString());
		} else if (typeof children === "function") {
			children();
		} else if (children !== undefined) {
			renderManager.renderControl(children);
		}

		if (typeof type === "string") {
			renderManager.close(type);
		}
	};
};
export default jsxRenderManager;
