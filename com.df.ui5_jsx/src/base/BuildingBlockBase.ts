import type {
	ConstantExpression,
	PathInModelExpression,
	PrimitiveType,
} from "./BindingToolkit";
import * as BindingToolkit from "./BindingToolkit";
import type { PropertiesOf, StateOf } from "./ClassSupport";
import {
	aggregation,
	association,
	defineState,
	defineUI5Class,
} from "./ClassSupport";
import type ManagedObject from "sap/ui/base/ManagedObject";
import type { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import Control from "sap/ui/core/Control";
import type UI5Element from "sap/ui/core/Element";
import InvisibleRenderer from "sap/ui/core/InvisibleRenderer";
import type RenderManager from "sap/ui/core/RenderManager";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface BuildingBlockBase<
	T extends UI5Element = Control,
	K extends object = {}
> {
	// Force a state update
	_updateState(): Promise<void>;
}

/**
 * Base class for building blocks.
 * This contains the low level functionality of having a content aggregation and handling the rendering of the content without an actual DOM element.
 * The building block also defines a state object that can be used to store the state of the building block.
 * Accessibility and classes information are forwarded to the content control.
 * @experimental
 * @public
 */
@defineUI5Class("com.df.ui5_jsx.BuildingBlockBase")
class BuildingBlockBase<
	T extends UI5Element = Control,
	K extends object = {}
> extends Control {
	@aggregation({
		type: "sap.ui.core.Element",
		multiple: false,
		isDefault: true,
	})
	content?: T;

	/**
	 * Association to controls / IDs that label this control (see WAI-ARIA attribute aria-labelledby).
	 */
	@association({
		type: "sap.ui.core.Control",
		multiple: true,
		singularName: "ariaLabelledBy",
	})
	ariaLabelledBy: string[];

	@defineState()
	protected state: StateOf<K>;

	constructor(
		settings?: string | PropertiesOf<BuildingBlockBase<T>>,
		others?: PropertiesOf<BuildingBlockBase<T>>
	) {
		if (typeof settings === "string") {
			others ??= {};
			others.id = settings;
		}
		super(settings as unknown as string, others);
	}

	private _oldDomRef: WeakRef<Element> | null = null;

	static render<T extends Control>(
		oRm: RenderManager,
		oControl: BuildingBlockBase<T>
	): void {
		if (!oControl.content || oControl.getVisible() === false) {
			InvisibleRenderer.render(oRm, oControl);
		} else {
			oRm.renderControl(oControl.content);
		}
	}

	/**
	 * Override the bindProperty to deal with the case where the property is a binding info.
	 * @param name The name of te property
	 * @param bindingInfo The binding info
	 * @returns The instance of the building block for chaining
	 */
	override bindProperty(name: string, bindingInfo: PropertyBindingInfo): this {
		const propertyMetadata = this.getMetadata().getProperty(name);
		if (
			propertyMetadata?.bindable === false &&
			propertyMetadata.group === "Data"
		) {
			(this as Record<string, unknown>)[name] = bindingInfo;
		} else {
			super.bindProperty(name, bindingInfo);
		}
		return this;
	}

	//set the old dom ref
	override onAfterRendering(event: JQuery.Event): void {
		const domRef = this.getDomRef();
		if (domRef) {
			this._oldDomRef = new WeakRef(domRef);
		} else {
			this._oldDomRef = null;
		}
		super.onAfterRendering(event);
	}

	override getDomRef(suffix?: string): Element | null {
		const oContent = this.content;
		let domRef: Element | null =
			oContent?.getDomRef(suffix) ?? super.getDomRef(suffix);
		if (!domRef && !suffix) {
			domRef = this._oldDomRef?.deref() ?? null;
			if (domRef) {
				return document.getElementById(domRef.id);
			}
		}
		return domRef;
	}

	override getFocusDomRef(): Element | null {
		const oContent = this.content;
		return oContent ? oContent.getFocusDomRef() : super.getFocusDomRef();
	}

	/**
	 * This function asks up the control tree to enhance the accessibility state of the control.
	 * @param _oElement The element to enhance
	 * @param mAriaProps The current aria properties
	 * @returns The enhanced aria properties
	 */
	override enhanceAccessibilityState(
		_oElement: object,
		mAriaProps: object
	): object {
		const oParent = this.getParent();

		if (
			oParent &&
			(oParent as ManagedObject & { enhanceAccessibilityState?: Function })
				.enhanceAccessibilityState
		) {
			// forward  enhanceAccessibilityState call to the parent
			(
				oParent as ManagedObject & { enhanceAccessibilityState: Function }
			).enhanceAccessibilityState(_oElement, mAriaProps);
		}

		return mAriaProps;
	}

	/**
	 * This function (if available on the concrete control) provides the current accessibility state of the control.
	 * @returns The accessibility information for the control.
	 */
	override getAccessibilityInfo(): Object {
		let accessibilityInfo = {};
		if (this.content?.isA<Control>("sap.ui.core.Control")) {
			accessibilityInfo = this.content.getAccessibilityInfo();
		}
		return accessibilityInfo;
	}

	/**
	 * Returns the DOMNode ID to be used for the "labelFor" attribute.
	 *
	 * We forward the call of this method to the content control.
	 * @returns ID to be used for the <code>labelFor</code>
	 */
	override getIdForLabel(): string {
		if (this.content?.isA<Control>("sap.ui.core.Control")) {
			return this.content.getIdForLabel();
		}
		return "";
	}

	override addStyleClass(styleClass: string): this {
		(this.content as unknown as Control)?.addStyleClass(styleClass);
		super.addStyleClass(styleClass);
		return this;
	}

	override removeStyleClass(styleClass: string): this {
		(this.content as unknown as Control)?.removeStyleClass(styleClass);
		super.removeStyleClass(styleClass);
		return this;
	}

	/**
	 * Shorthand for the BindingToolkit.bindState function with the current state object.
	 * @param path A property in the state object
	 * @returns The binding toolkit expression for the state
	 */
	protected bindState<ST extends PrimitiveType>(
		path: keyof K
	): PathInModelExpression<ST> | ConstantExpression<ST> {
		return BindingToolkit.bindState(this.state as K, path);
	}
}

export default BuildingBlockBase;
