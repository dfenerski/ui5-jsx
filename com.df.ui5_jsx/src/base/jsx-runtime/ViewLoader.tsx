import type { NonAbstractClass } from "../ClassSupport";
import { defineUI5Class, property } from "../ClassSupport";
// import type { XMLPreprocessorContext } from "fe/core/TemplateComponent";
import Component from "sap/ui/core/Component";
import type Control from "sap/ui/core/Control";
import type { $ControlSettings } from "sap/ui/core/Control";
import type Controller from "sap/ui/core/mvc/Controller";
import View from "sap/ui/core/mvc/View";
import "reflect-metadata";

type JSXViewController = Controller & { render?: () => Control };
@defineUI5Class("com.df.ui5_jsx.jsx-runtime.ViewLoader")
export default class ViewLoader extends View {
	static preprocessorData?: /*XMLPreprocessorContext*/ any;

	static controller: Controller;

	@property({ type: "string" })
	viewName: string;

	private viewContent?: Control;

	private viewContentFn?: Function;

	public sViewName: string;

	public _oContainingView: this;

	constructor(mSettings: Record<string, unknown>) {
		delete mSettings.cache;
		super(mSettings);
		this.sViewName = this.viewName;
		this._oContainingView = this;
	}

	async loadDependency(name: string): Promise<unknown> {
		return new Promise((resolve) => {
			sap.ui.require([name], (MDXContent: Function): void => {
				resolve(MDXContent);
			});
		});
	}

	async initViewSettings(mSettings: Record<string, unknown>): Promise<void> {
		const viewConfig = this.getViewData() as {
			viewContent?: Control;
			_jsxViewName: string;
		} & Record<string, unknown>;
		const viewContent =
			viewConfig.viewContent ||
			((await this.loadDependency(viewConfig._jsxViewName)) as
				| Control
				| Function);
		delete mSettings.cache;
		if (
			(viewContent as Control)
				?.getMetadata?.()
				.isA("sap.ui.core.mvc.Controller")
		) {
			mSettings.controller = new (viewContent as NonAbstractClass<Control>)(
				viewConfig as $ControlSettings,
			);
		} else {
			this.viewContentFn = viewContent as Function;
		}
	}

	getControllerName(): string {
		const viewData = this.getViewData() as { controllerName: string };
		return viewData.controllerName;
	}

	getAutoPrefixId(): boolean {
		return true;
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	createContent(oController: JSXViewController): Control {
		ViewLoader.preprocessorData = (
			this as { mPreprocessors?: { xml?: /*XMLPreprocessorContext*/ any } }
		)?.mPreprocessors?.xml;
		ViewLoader.controller = oController;

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this._fnSettingsPreprocessor = function (this: {
			controller?: Controller;
		}): void {
			this.controller = oController;
		};

		const owner = Component.getOwnerComponentFor(this)! ?? {
			runAsOwner: (fn: Function) => fn(),
		};
		return owner.runAsOwner(() => {
			if (oController && oController.render) {
				return oController.render();
			}
			return this.viewContentFn?.();
		});
	}
}
