import jsxControl from "./jsx-control";
import jsxRenderManager from "./jsx-renderManager";
import jsxXml from "./jsx-xml";
// import type AppComponent from "sap/fe/core/AppComponent";
import type Control from "sap/ui/core/Control";
import type Element from "sap/ui/core/Element";
import type RenderManager from "sap/ui/core/RenderManager";

import type View from "sap/ui/core/mvc/View";

type ControlPropertyNames<T> = {
	[K in keyof T]: T[K] extends
		| string
		| boolean
		| Function
		| number
		| undefined
		| string[]
		? never
		: K;
}[keyof T];
export type ControlProperties<T> = Partial<
	Record<ControlPropertyNames<T>, Element>
> & {
	[k: string]: Element;
};
export type NonControlProperties<T> = Partial<Omit<T, ControlPropertyNames<T>>>;
export type CommandProperties = `cmd:${string}|${string}`;

let renderNextAsXML = false;
let renderNextUsingRenderManager: RenderManager | undefined;
let xmlNamespaceMap: Record<string, string> = {};
const jsx = function <T>(
	ControlType: typeof Control,
	mSettings: NonControlProperties<T> & {
		key: string;
		children?: Element | ControlProperties<T>;
	},
	key: string,
): string | Control | Control[] | undefined {
	if (!renderNextAsXML && !renderNextUsingRenderManager) {
		return jsxControl(ControlType, mSettings, key, jsxContext);
	} else if (renderNextUsingRenderManager !== undefined) {
		return jsxRenderManager(
			ControlType as unknown as string,
			mSettings as Record<string, string>,
			key,
			renderNextUsingRenderManager,
		) as unknown as string | Control | Control[] | undefined;
	} else {
		return jsxXml(ControlType, mSettings, key, xmlNamespaceMap);
	}
};
jsx.renderUsingRenderManager = function (
	renderManager: RenderManager,
	control: Control,
	renderMethod: Function,
): void {
	renderNextUsingRenderManager = renderManager;
	const returnValue = renderMethod(control);
	renderNextUsingRenderManager = undefined;
	returnValue();
};
jsx.defineXMLNamespaceMap = async function (
	namespaceMap: Record<string, string>,
	renderMethod: Function,
): Promise<unknown> {
	xmlNamespaceMap = namespaceMap;
	const returnValue = await renderMethod();
	xmlNamespaceMap = {};
	return returnValue;
};
/**
 * Indicates that the next JSX call should be rendered as XML.
 * @param renderMethod The method that needs to be rendered as XML
 * @returns The XML representation of the control
 */
jsx.renderAsXML = function <T>(renderMethod: () => T): T {
	renderNextAsXML = true;
	const returnValue = renderMethod();
	renderNextAsXML = false;
	return returnValue;
};

export type Ref<T extends Element> = {
	current?: T;
	setCurrent(oControlInstance: T): void;
};

export type JSXContext = {
	ownerControl?: Control & {
		controlReferences?: Record<string, Element>;
		controlReferencesId?: number;
	};
	view?: View;
	appComponent?: any /*AppComponent*/;
};
let jsxContext: JSXContext = {};
jsx.getContext = function (): JSXContext {
	return jsxContext;
};

jsx.withContext = function <T>(
	context: JSXContext,
	functionToExecute: () => T,
): T {
	jsxContext = context;
	const callBackReturn = functionToExecute();
	jsxContext = {};
	return callBackReturn;
};

export default jsx;
