import ObjectPath from "sap/base/util/ObjectPath";
import deepClone from "sap/base/util/deepClone";
import merge from "sap/base/util/merge";
import uid from "sap/base/util/uid";
import { hookable, propagateHookFromMixin } from "./HookSupport";
import type { Ref } from "./jsx-runtime/jsx";
import type UI5Event from "sap/ui/base/Event";
import type ManagedObject from "sap/ui/base/ManagedObject";
import Metadata from "sap/ui/base/Metadata";
import BaseObject from "sap/ui/base/Object";
import type Control from "sap/ui/core/Control";
import type { $ControlSettings } from "sap/ui/core/Control";
import type UI5Element from "sap/ui/core/Element";
import type ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
// @ts-ignore
import ControllerMetadata from "sap/ui/core/mvc/ControllerMetadata";
import type OverrideExecution from "sap/ui/core/mvc/OverrideExecution";
import type Context from "sap/ui/model/Context";
import type { Model$PropertyChangeEvent } from "sap/ui/model/Model";
import JSONModel from "sap/ui/model/json/JSONModel";

type OverrideDefinition = Record<string, Function>;
type UI5ControllerMethodDefinition = {
	overrideExecution?: OverrideExecution;
	public?: boolean;
	final?: boolean;
};
export type NonAbstractClass<T> = Pick<T, keyof T> &
	(new (...args: unknown[]) => T);

type UI5PropertyMetadata = {
	type: string;
	bindable?: boolean;
	required?: boolean;
	group?: string;
	defaultValue?: unknown;
	byValue?: boolean;
	isBindingInfo?: boolean;
	bindToState?: boolean;
	expectedAnnotations?: string[];
	expectedTypes?: string[];
	allowedValues?: string[];
	visibility?: string;
};
export type UI5AggregationMetadata = {
	type: string;
	altTypes?: string[];
	multiple?: boolean;
	isDefault?: boolean;
	defaultValue?: unknown;
	defaultClass?: unknown;
	singularName?: string;
	visibility?: string;
	forwarding?: object;
};
export type UI5AssociationMetadata = {
	type: string;
	multiple?: boolean;
	singularName?: string;
};
export type UI5ControlMetadataDefinition = {
	defaultAggregation?: string;
	controllerExtensions: Record<string, typeof ControllerExtension | Function>;
	properties: Record<string, UI5PropertyMetadata>;
	aggregations: Record<string, UI5AggregationMetadata>;
	references: Record<string, boolean>;
	associations: Record<string, UI5AssociationMetadata>;
	methods: Record<string, UI5ControllerMethodDefinition>;
	events: Record<string, {}>;
	interfaces: string[];
	library?: string;
	designtime?: string;
	config?: {
		fullWidth?: boolean;
	};
	stateProperty?: string;
	statePropertyDefaultValue?: unknown;
	manifest?: string | unknown;
	returnTypes?: string[];
	buildingBlockMetadata?: unknown;
};
export type AccessorDescriptor<T> = TypedPropertyDescriptor<T> & {
	initializer?: () => T;
};
type UI5ControllerDefinition = {
	override?: { extension?: Record<string, OverrideDefinition> } & {
		[k: string]: Function;
	};
	overrides?: { extension?: Record<string, OverrideDefinition> } & {
		[k: string]: Function;
	};
	metadata?: UI5ControlMetadataDefinition;
	renderer?: Function;
};

type UI5ControlDefinition = {
	metadata?: UI5ControlMetadataDefinition;
	override?: unknown;
	renderer?: Function;
};

type UI5APIControl = Control & {
	getAPI(event: UI5Event, fqdn?: string): UI5APIControl | undefined;
	instanceMap: WeakMap<object, object[]>;
	__apiRegistered: boolean;
} & {
	[k: string]: Function;
};

export type XMLEventHolder = {
	getAPI(event: UI5Event, fqdn?: string): UI5APIControl | undefined;
	instanceMap: WeakMap<object, object[]>;
};

type ControlPropertyNames<T> = {
	// needed because of the TS compiler
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
export type PropertiesOf<
	T,
	K extends keyof T | undefined = undefined
> = Partial<Pick<T, ControlPropertyNames<T>>> &
	(K extends keyof T ? Partial<Pick<T, K>> : {}) &
	$ControlSettings;
export type ConvertContextToString<T> = {
	[K in keyof T]: K extends "metaPath" | "contextPath" ? string : T[K];
};
type ContextToString<T> = {
	[K in keyof T]: T[K] extends Context | undefined ? string | undefined : T[K];
};

export type PropertiesOfBuildingBlock<T> = ContextToString<PropertiesOf<T>>;
export type StrictPropertiesOf<T> = Pick<T, ControlPropertyNames<T>>;
export type UI5Accessors<T> = {
	// Add all the getXXX method, might add too much as I'm not filtering on actual properties...
	[P in keyof Required<T> as `get${Capitalize<string & P>}`]: () => T[P];
};
export type UI5Setters<T> = {
	// Add all the setXXX method, might add too much as I'm not filtering on actual properties...
	[P in keyof Required<T> as `set${Capitalize<string & P>}`]: (
		value: T[P]
	) => T;
};
export type EnhanceWithUI5<T> = {
	new (props: PropertiesOf<T>): EnhanceWithUI5<T>;
	new (sId: string, props: PropertiesOf<T>): EnhanceWithUI5<T>;
} & T &
	UI5Accessors<T> &
	UI5Setters<T>;

export type ExtensionOverrideExecution =
	| "Instead"
	| "Before"
	| "After"
	| "AfterAsync"
	| "BeforeAsync";

const ensureMetadata = function (
	target: UI5ControllerDefinition | UI5ControlDefinition
): UI5ControlMetadataDefinition {
	target.metadata = merge(
		{
			controllerExtensions: {},
			properties: {},
			aggregations: {},
			references: {},
			associations: {},
			methods: {},
			events: {},
			interfaces: [],
		},
		target.metadata ?? {}
	) as UI5ControlMetadataDefinition;
	return target.metadata;
};

/**
 * Method that will find the correct API object based on the current control hierarchy.
 * @param target
 * @returns The proper getAPI function for this constructor
 */
function prepareGetAPIFunction(target: UI5APIControl) {
	return function <T extends UI5APIControl>(
		this: UI5APIControl,
		oEvent: UI5Event,
		apiFQN: string = target.getMetadata().getName()
	): T | undefined {
		let oSource = oEvent.getSource() as ManagedObject | null;
		if (target._getAPIExtension) {
			oSource = target._getAPIExtension(oSource) ?? oSource;
		}
		while (oSource && !oSource.isA<T>(apiFQN) && oSource.getParent) {
			if (this.isDependentBound) {
				const oDependents = (oSource as Control).getDependents();
				const hasCorrectDependent = oDependents.find((oDependent: UI5Element) =>
					oDependent.isA(apiFQN)
				);
				if (hasCorrectDependent) {
					oSource = hasCorrectDependent as unknown as T;
				} else {
					oSource = oSource.getParent() as unknown as T;
				}
			} else {
				oSource = oSource.getParent();
			}
		}

		if (!oSource || !oSource.isA<T>(apiFQN)) {
			const oSourceMap = this.instanceMap.get(this) as T[];
			oSource = oSourceMap?.[oSourceMap.length - 1];
		}
		let targetControl;
		if (oSource && oSource.isA<T>(apiFQN)) {
			targetControl = oSource;
		}
		return targetControl;
	};
}

/**
 * Ensures that when an xmlEventHandler is defined, the `getAPI` function is properly assigned.
 * @param target The class constructor that should hold the static functions
 */
const ensureGetAPI = function (target: UI5APIControl): void {
	if (!target.__apiRegistered) {
		target.__apiRegistered = true;
		target.instanceMap = new WeakMap<object, object[]>();
		target.registerInstance = function (_instance: Function): void {
			if (!this.instanceMap.get(_instance.constructor)) {
				this.instanceMap.set(_instance.constructor, []);
			}
			(this.instanceMap.get(_instance.constructor) as object[]).push(_instance);
		};
		target.getAPI = prepareGetAPIFunction(target);
	}
};

type ExtendWithObject<T, K> = T extends object
	? K & { [TKey in keyof T]?: BindingInfoHolder<T[TKey]> }
	: K;

export type StateOf<T> = {
	[K in keyof T]: T[K] extends Array<infer U> | ReadonlyArray<infer U>
		? ExtendWithObject<U, ReadonlyArray<U>>
		: T[K];
};
export type BindingInfoHolder<T> = T & {
	__bindingInfo: {
		path: string;
		model: string;
		type: T;
	};
};

/**
 * Allows to define a property that will hold the control state.
 *
 * Properties defined with this decorator will be automatically bound to the control state when used in JSX.
 * Arrays need to be bound using the `bindState` function.
 * @experimental
 * @returns A property decorator
 */
export function defineState(): PropertyDecorator {
	return function (
		target: UI5ControlDefinition,
		propertyKey: string,
		propertyDescriptor: TypedPropertyDescriptor<unknown>
	) {
		const metadata = ensureMetadata(target);
		if (metadata.stateProperty !== undefined) {
			throw new Error("Only one state property per control is allowed");
		}
		metadata.stateProperty = propertyKey;
		delete propertyDescriptor.writable;
		metadata.statePropertyDefaultValue ??= (
			propertyDescriptor as { initializer?: Function }
		).initializer?.();
		delete (propertyDescriptor as { initializer?: Function }).initializer;

		return propertyDescriptor;
	} as unknown as PropertyDecorator; // This is technically an accessor decorator, but somehow the compiler doesn't like it if i declare it as such.;
}

/* #region CONTROLLER EXTENSIONS */

/**
 * Defines that the following method is an override for the method name with the same name in the specific controller extension or base implementation.
 * @param extensionName The name of the extension that will be overridden
 * @returns The decorated method
 */
export function methodOverride(extensionName?: string): MethodDecorator {
	return function (target: UI5ControllerDefinition, propertyKey) {
		if (!target.override) {
			target.override = {};
		}
		if (!target.overrides) {
			target.overrides = {};
		}
		let currentTarget = target.overrides;
		if (extensionName) {
			if (!currentTarget.extension) {
				currentTarget.extension = {};
			}
			if (!currentTarget.extension[extensionName]) {
				currentTarget.extension[extensionName] = {};
			}
			currentTarget = currentTarget.extension[extensionName];
		}
		currentTarget[propertyKey.toString()] = (
			target as Record<string, Function>
		)[propertyKey.toString()];
	};
}

/**
 * Defines that the method can be extended by other controller extension based on the defined overrideExecutionType.
 * @param overrideExecution The OverrideExecution defining when the override should run (Before / After / Instead)
 * @returns The decorated method
 */
export function extensible(
	overrideExecution: ExtensionOverrideExecution
): MethodDecorator {
	return function (
		target: UI5ControllerDefinition,
		propertyKey,
		descriptor: PropertyDescriptor
	) {
		const metadata = ensureMetadata(target);
		if (!metadata.methods[propertyKey.toString()]) {
			metadata.methods[propertyKey.toString()] = {};
		}
		metadata.methods[propertyKey.toString()].overrideExecution =
			overrideExecution as unknown as OverrideExecution;

		// by default, every extensible method is also hookable (except those defined as Instead)
		if (overrideExecution !== "Instead") {
			hookable(overrideExecution)(target, propertyKey, descriptor);
		}
	};
}

/**
 * Defines that the method will be publicly available for controller extension usage.
 * @returns The decorated method
 */
export function publicExtension(): MethodDecorator {
	return function (
		target: UI5ControllerDefinition,
		propertyKey,
		descriptor
	): void {
		const metadata = ensureMetadata(target);
		descriptor.enumerable = true;
		if (!metadata.methods[propertyKey.toString()]) {
			metadata.methods[propertyKey.toString()] = {};
		}
		metadata.methods[propertyKey.toString()].public = true;
	};
}
/**
 * Defines that the method will be only available for internal usage of the controller extension.
 * @returns The decorated method
 */
export function privateExtension(): MethodDecorator {
	return function (target: UI5ControllerDefinition, propertyKey, descriptor) {
		const metadata = ensureMetadata(target);
		descriptor.enumerable = true;
		if (!metadata.methods[propertyKey.toString()]) {
			metadata.methods[propertyKey.toString()] = {};
		}
		metadata.methods[propertyKey.toString()].public = false;
	};
}
/**
 * Defines that the method cannot be further extended by other controller extension.
 * @returns The decorated method
 */
export function finalExtension(): MethodDecorator {
	return function (target: UI5ControllerDefinition, propertyKey, descriptor) {
		const metadata = ensureMetadata(target);
		descriptor.enumerable = true;
		if (!metadata.methods[propertyKey.toString()]) {
			metadata.methods[propertyKey.toString()] = {};
		}
		metadata.methods[propertyKey.toString()].final = true;
	};
}

/**
 * Defines that we are going to use instantiate a controller extension under the following variable name.
 * @param extensionClass The controller extension that will be instantiated
 * @returns The decorated property
 */
export function usingExtension(
	extensionClass: typeof ControllerExtension | Function
): PropertyDecorator {
	return function (
		target: UI5ControllerDefinition,
		propertyKey: string,
		propertyDescriptor: TypedPropertyDescriptor<unknown>
	) {
		const metadata = ensureMetadata(target);
		delete (propertyDescriptor as { initializer?: unknown }).initializer;
		metadata.controllerExtensions[propertyKey.toString()] = extensionClass;
		return propertyDescriptor;
	} as unknown as PropertyDecorator; // This is technically an accessor decorator, but somehow the compiler doesn't like it if I declare it as such.
}

/* #endregion */

/* #region CONTROL */
/**
 * Indicates that the property shall be declared as an event on the control metadata.
 * @returns The decorated property
 */
export function event(): PropertyDecorator {
	return function (target: UI5ControlDefinition, eventKey: string | Symbol) {
		const metadata = ensureMetadata(target);
		if (!metadata.events[eventKey.toString()]) {
			metadata.events[eventKey.toString()] = {};
		}
	};
}

/**
 * Defines the following property in the control metadata.
 * @param attributeDefinition The property definition
 * @returns The decorated property.
 */
export function property(
	attributeDefinition: UI5PropertyMetadata
): PropertyDecorator {
	return function (
		target: UI5ControlDefinition,
		propertyKey: string,
		propertyDescriptor: TypedPropertyDescriptor<unknown>
	) {
		const metadata = ensureMetadata(target);
		if (attributeDefinition.bindable === undefined) {
			attributeDefinition.bindable = true;
		}
		if (attributeDefinition.isBindingInfo === true) {
			attributeDefinition.bindable = false;
			attributeDefinition.group = "Data";
		}
		if (!metadata.properties[propertyKey]) {
			metadata.properties[propertyKey] = attributeDefinition;
		}
		delete propertyDescriptor.writable;
		attributeDefinition.defaultValue ??= (
			propertyDescriptor as { initializer?: Function }
		).initializer?.();
		delete (propertyDescriptor as { initializer?: unknown }).initializer;

		return propertyDescriptor;
	} as unknown as PropertyDecorator; // This is technically an accessor decorator, but somehow the compiler doesn't like it if i declare it as such.
}

/**
 * Defines and configures the following aggregation in the control metadata.
 * @param aggregationDefinition The aggregation definition
 * @returns The decorated property.
 */
export function aggregation(
	aggregationDefinition: UI5AggregationMetadata
): PropertyDecorator {
	return function (
		target: UI5ControlDefinition,
		propertyKey: string,
		propertyDescriptor: TypedPropertyDescriptor<unknown>
	) {
		const metadata = ensureMetadata(target);
		if (aggregationDefinition.multiple === undefined) {
			// UI5 defaults this to true but this is just weird...
			aggregationDefinition.multiple = false;
		}
		if (!metadata.aggregations[propertyKey]) {
			metadata.aggregations[propertyKey] = aggregationDefinition;
		}
		if (aggregationDefinition.isDefault) {
			metadata.defaultAggregation = propertyKey;
		}
		delete propertyDescriptor.writable;
		aggregationDefinition.defaultValue ??= (
			propertyDescriptor as { initializer?: Function }
		).initializer?.();
		delete (propertyDescriptor as { initializer?: unknown }).initializer;

		return propertyDescriptor;
	} as unknown as PropertyDecorator; // This is technically an accessor decorator, but somehow the compiler doesn't like it if I declare it as such.
}

/**
 * Defines and configures the following association in the control metadata.
 * @param ui5AssociationMetadata The definition of the association.
 * @returns The decorated property
 */
export function association(
	ui5AssociationMetadata: UI5AssociationMetadata
): PropertyDecorator {
	return function (
		target: UI5ControlDefinition,
		propertyKey: string,
		propertyDescriptor: TypedPropertyDescriptor<unknown>
	) {
		const metadata = ensureMetadata(target);
		if (!metadata.associations[propertyKey]) {
			metadata.associations[propertyKey] = ui5AssociationMetadata;
		}
		delete propertyDescriptor.writable;
		delete (propertyDescriptor as { initializer?: unknown }).initializer;

		return propertyDescriptor;
	} as unknown as PropertyDecorator; // This is technically an accessor decorator, but somehow the compiler doesn't like it if i declare it as such.
}

/**
 * Defines in the metadata that this control implements a specific interface.
 * @param interfaceName The name of the implemented interface
 * @returns The decorated method
 */
export function implementInterface(interfaceName: string): PropertyDecorator {
	return function (target: UI5ControlDefinition) {
		const metadata = ensureMetadata(target);

		metadata.interfaces.push(interfaceName);
	};
}

/**
 * Indicates that the following method should also be exposed statically so we can call it from XML.
 * @returns The decorated method
 */
export function xmlEventHandler(): MethodDecorator {
	return function (target: UI5ControlDefinition, propertykey) {
		const currentConstructor: UI5APIControl =
			target.constructor as unknown as UI5APIControl;
		ensureGetAPI(currentConstructor);
		currentConstructor[propertykey.toString()] = function (
			...args: unknown[]
		): void {
			if (args?.length) {
				const currentTarget = currentConstructor.getAPI(args[0] as UI5Event);
				currentTarget?.[propertykey.toString()](...args);
			}
		};
	};
}

type UI5ControlAndMore = typeof Control &
	Function & {
		registerInstance?: Function;
		override?: Function;
		renderer?: unknown;
		render: Function;
		metadata?: UI5ControlMetadataDefinition;
	};

/**
 * Indicates that the following class should define a UI5 control of the specified name.
 * @param sTarget The fully qualified name of the UI5 class
 * @param metadataDefinition Inline metadata definition
 * @returns A class decorator that will create a ui5 class
 */
export function defineUI5Class(
	sTarget: string,
	metadataDefinition?: Partial<UI5ControlMetadataDefinition>
): ClassDecorator {
	return function (constructor: UI5ControlAndMore) {
		if (!constructor.prototype.metadata) {
			constructor.prototype.metadata = {};
		}
		if (metadataDefinition) {
			for (const key in metadataDefinition) {
				if (constructor.prototype.metadata[key] !== undefined) {
					if (Array.isArray(constructor.prototype.metadata[key])) {
						constructor.prototype.metadata[key] =
							constructor.prototype.metadata[key].concat(
								metadataDefinition[key as keyof UI5ControlMetadataDefinition]
							);
					} else {
						constructor.prototype.metadata[key] = {
							...constructor.prototype.metadata[key],
							...(metadataDefinition[
								key as keyof UI5ControlMetadataDefinition
							] as object),
						};
					}
				} else {
					constructor.prototype.metadata[key] =
						metadataDefinition[key as keyof UI5ControlMetadataDefinition];
				}
			}
		}
		return registerUI5Metadata(constructor, sTarget, constructor.prototype);
	} as ClassDecorator;
}
type Constructor<T = {}> = new (...a: unknown[]) => T;
/**
 * Mixin a specific interface including all its methods and properties into the control.
 * @param interfaceClass Implementation class of the control
 * @returns The decorated class
 */
export function mixin<T extends IInterfaceWithMixin>(
	interfaceClass: Constructor<T>
): ClassDecorator {
	return function (baseCtor: UI5ControlAndMore) {
		if (baseCtor.prototype.extend) {
			throw new Error(
				"The mixinInterface decorator must be placed after `defineUi5Class`"
			);
		}
		const metadata = ensureMetadata(baseCtor.prototype);

		let interfaceProtoTypeToMix = interfaceClass.prototype;
		while (interfaceProtoTypeToMix) {
			baseCtor = _addInterfaceProtoTypesToBaseClass(
				baseCtor,
				metadata,
				interfaceProtoTypeToMix
			);
			interfaceProtoTypeToMix = Object.getPrototypeOf(interfaceProtoTypeToMix);
		}
		propagateHookFromMixin(baseCtor, interfaceClass);

		// Hook to add potentially more logic to the mixin
		interfaceClass.prototype.setupMixin?.(baseCtor);
		return baseCtor;
	} as ClassDecorator;
}

export interface IInterfaceWithMixin {
	/**
	 * Returns the name of the interface that should be added to the receiving control.
	 * If not defined, the interface will not be added.
	 * @returns The name of the interface
	 */
	getInterfaceName?(): string;

	/**
	 * Hook to add more logic to the mixin.
	 * This is called before the controls are created and can be used to add some additional logic to the base class.
	 * @param baseClass The base class that will be extended
	 */
	setupMixin?(baseClass: Function): void;
}

export function createReference<T extends UI5Element>(): Ref<T> {
	return {
		current: undefined as unknown as T,
		setCurrent: function (oControlInstance: T): void {
			this.current = oControlInstance;
		},
	};
}
/**
 * Defines that the following object will hold a reference to a control through jsx templating.
 * @returns The decorated property.
 */
export function defineReference(): PropertyDecorator {
	return function (
		target: UI5ControlDefinition,
		propertyKey: string,
		propertyDescriptor: TypedPropertyDescriptor<unknown>
	) {
		const metadata = ensureMetadata(target);
		delete propertyDescriptor.writable;
		delete (propertyDescriptor as { initializer?: unknown }).initializer;
		if (BaseObject.isObjectA(target, "sap.ui.core.Control")) {
			if (!metadata.references[propertyKey]) {
				metadata.references[propertyKey] = true;
			}
		} else {
			(propertyDescriptor as { initializer?: unknown }).initializer =
				createReference;
		}

		return propertyDescriptor;
	} as unknown as PropertyDecorator; // This is technically an accessor decorator, but somehow the compiler doesn't like it if i declare it as such.;
}

function _addInterfaceProtoTypesToBaseClass(
	baseCtor: UI5ControlAndMore,
	baseClassMetadata: UI5ControlMetadataDefinition,
	interfaceClassPrototype: Function["prototype"]
): UI5ControlAndMore {
	const interfaceName = interfaceClassPrototype?.getInterfaceName?.();
	if (interfaceName) {
		baseClassMetadata.interfaces.push(interfaceName);
	}

	Object.getOwnPropertyNames(interfaceClassPrototype).forEach((name) => {
		if (
			name !== "constructor" &&
			name !== "setupMixin" &&
			name !== "metadata"
		) {
			if (!baseCtor.prototype[name]) {
				// The base class "wins" over the mixin
				Object.defineProperty(
					baseCtor.prototype,
					name,
					Object.getOwnPropertyDescriptor(interfaceClassPrototype, name) ||
						Object.create(null)
				);
			}
		}
		if (name === "metadata") {
			baseCtor.prototype.metadata = merge(
				baseCtor.prototype.metadata,
				interfaceClassPrototype.metadata
			);
		}
	});
	return baseCtor;
}

function _getHandlerForStateProperty(
	jsonModel: JSONModel,
	prop: string
): unknown {
	const pathInModel = `/${prop.toString()}`;
	const oObj = deepClone(jsonModel.getObject(pathInModel));
	let oTarget;
	if (prop === "__bindingInfo") {
		return { model: "$componentState" };
	}
	if (typeof oObj === "string") {
		oTarget = oObj;
	} else if (typeof oObj === "number") {
		oTarget = oObj;
	} else if (typeof oObj === "boolean") {
		oTarget = oObj;
	} else if (Array.isArray(oObj)) {
		oTarget = new Proxy(oObj, {
			get(target: unknown[], p: string | symbol, receiver: unknown[]): unknown {
				const ref = Reflect.get(target, p, receiver);
				if (typeof ref === "function") {
					return ref.bind(target);
				} else if (ref === undefined && isNaN(Number(p.toString()))) {
					return {
						__bindingInfo: {
							model: "$componentState",
							path: p,
						},
					};
				}
				return ref;
			},
		});
	} else {
		oTarget = { ...oObj };
	}
	if (typeof oTarget === "object") {
		oTarget.__bindingInfo = {
			model: "$componentState",
			path: pathInModel,
		};
	}
	return oTarget;
}
const boundProperties = Symbol("boundProperties");

function createStateProxy(
	targetControl: Control & {
		[boundProperties]: string[];
		__stateCreated: boolean;
		_updateState: Function;
		_updateStateDebounced: Function;
		_ignoreStatePropertyUpdate: boolean;
		_updateStateTimer: unknown;
		_changedProps?: string[];
	},
	statePropertyName: string,
	boundToStateProps: string[],
	initialData?: object
): JSONModel {
	// Lazy initialization of the state property
	targetControl.setModel(new JSONModel(initialData), "$componentState");
	const stateModel = targetControl.getModel("$componentState") as JSONModel;
	stateModel.attachPropertyChange((evt: Model$PropertyChangeEvent) => {
		const path = evt.getParameter("path")?.substring(1); // to remove the first /
		if (path && boundToStateProps.includes(path)) {
			targetControl.setProperty(path, evt.getParameter("value"));
		}
	});
	targetControl.__stateCreated = true;
	const proxy = new Proxy(stateModel, {
		get: (target: JSONModel, prop: string): unknown => {
			return _getHandlerForStateProperty(target, prop);
		},
		set: (setStateModel: JSONModel, prop, value): boolean => {
			// we need to check whether the property is a known bound property in any of the related classes
			const knownBoundProperties = targetControl[boundProperties];
			if (knownBoundProperties.includes(prop.toString())) {
				targetControl._ignoreStatePropertyUpdate = true;
				targetControl.setProperty(prop.toString(), value);
				targetControl._ignoreStatePropertyUpdate = false;
			}
			const setResult = setStateModel.setProperty(`/${prop.toString()}`, value);
			targetControl._updateStateDebounced(prop.toString());
			return setResult;
		},
	});
	Object.defineProperty(targetControl, statePropertyName, {
		configurable: true,
		get: () => {
			return proxy;
		},
		set(value) {
			// Replacing the complete state
			stateModel.setProperty(`/`, value);
		},
	});
	return proxy;
}

function _createStateProperty(
	obj: UI5ControlDefinition,
	targetControl: Control & {
		[boundProperties]: string[];
		__stateCreated: boolean;
		__stateName: string;
		_updateState: Function;
		_updateStateDebounced: Function;
		_ignoreStatePropertyUpdate: boolean;
		_updateStateTimer: unknown;
		_changedProps?: string[];
	}
): void {
	if (obj.metadata?.stateProperty || targetControl[boundProperties]) {
		let updatingState = false;
		const boundToStateProps: string[] = [];
		for (const propertyName in obj.metadata?.properties) {
			const propertyDef = obj.metadata.properties[propertyName];
			if (propertyDef.bindToState) {
				boundToStateProps.push(propertyName);
			}
		}
		// as we may have bound properties in parent classes and subclasses, we keep track of those in the model itself
		targetControl[boundProperties] ??= [];
		targetControl[boundProperties] = [
			...targetControl[boundProperties],
			...boundToStateProps,
		];

		if (obj.metadata?.stateProperty) {
			// This method can be used to force the state to be applied and wait for it to be applied in tests
			targetControl._updateState = async function (): Promise<void> {
				delete this._updateStateTimer;
				if (!updatingState) {
					updatingState = true;
					await (this as { onStateChange?: Function }).onStateChange?.(
						this._changedProps
					);
					this._changedProps = [];
					updatingState = false;
				}
			};
			targetControl._updateStateDebounced = function (
				changedProp: string
			): void {
				this._changedProps ??= [];
				if (!this._changedProps.includes(changedProp)) {
					this._changedProps.push(changedProp);
				}
				if (!this._updateStateTimer && !updatingState) {
					this._updateStateTimer = setTimeout(() => {
						this._updateState();
					}, 200);
				}
			};
			const statePropertyName = obj.metadata.stateProperty;
			targetControl.__stateCreated = false;
			targetControl.__stateName = statePropertyName;
			Object.defineProperty(targetControl, statePropertyName, {
				configurable: true,
				get: () => {
					return createStateProxy(
						targetControl,
						statePropertyName,
						targetControl[boundProperties]
					);
				},
				set: (value) => {
					createStateProxy(
						targetControl,
						statePropertyName,
						targetControl[boundProperties],
						value
					);
				},
			});
			if (obj.metadata.statePropertyDefaultValue) {
				targetControl[obj.metadata.stateProperty as keyof Control] = {
					...(<any>obj.metadata.statePropertyDefaultValue),
				} as never;
			}
			const fnApplySettings = targetControl.applySettings;
			targetControl.applySettings = function (mSettings: {
				models?: Record<string, never>;
			}): typeof targetControl {
				delete mSettings?.models?.$componentState;
				return fnApplySettings.call(this, mSettings);
			};
		}
		const fnSetProperty = targetControl.setProperty;
		if (targetControl[boundProperties].length > 0) {
			targetControl.setProperty = function (
				sPropertyName: string,
				oValue: unknown,
				bSuppressInvalidate
			): typeof targetControl {
				if (
					targetControl[boundProperties].includes(sPropertyName) &&
					!this._ignoreStatePropertyUpdate
				) {
					if (!this.__stateCreated) {
						createStateProxy(
							targetControl,
							targetControl.__stateName,
							targetControl[boundProperties]
						);
					}
					(this.getModel("$componentState") as JSONModel).setProperty(
						`/${sPropertyName}`,
						oValue
					);
					targetControl._updateStateDebounced(sPropertyName);
				}
				return fnSetProperty.call(
					this,
					sPropertyName,
					oValue,
					bSuppressInvalidate
				);
			};
		}
	}
}

/**
 * Internal heavy lifting that will take care of creating the class property for ui5 to use.
 * @param clazz The class prototype
 * @param name The name of the class to create
 * @param inObj The metadata object
 * @returns The metadata class
 */
function registerUI5Metadata(
	clazz: UI5ControlAndMore,
	name: string,
	inObj: UI5ControllerDefinition | UI5ControlDefinition
): Function {
	if (clazz.getMetadata?.().isA("sap.ui.core.mvc.ControllerExtension")) {
		Object.getOwnPropertyNames(inObj).forEach((objName) => {
			const descriptor = Object.getOwnPropertyDescriptor(inObj, objName);
			if (descriptor && !descriptor.enumerable) {
				descriptor.enumerable = true;
			}
		});
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const obj: any = {};
	obj.metadata = inObj.metadata || {};
	obj.override = inObj.override;
	obj.constructor = clazz;
	obj.metadata.baseType = Object.getPrototypeOf(clazz.prototype)
		.getMetadata()
		.getName();

	if (
		(
			clazz?.getMetadata() as unknown as { getStereotype: Function }
		)?.getStereotype() === "control"
	) {
		const rendererDefinition = inObj.renderer || clazz.renderer || clazz.render;
		obj.renderer = { apiVersion: 2 };
		if (typeof rendererDefinition === "function") {
			obj.renderer.render = rendererDefinition;
		} else if (rendererDefinition != undefined) {
			obj.renderer = rendererDefinition;
		}
	}
	obj.metadata.interfaces =
		inObj.metadata?.interfaces || clazz.metadata?.interfaces;
	Object.keys(clazz.prototype).forEach((key) => {
		if (key !== "metadata") {
			try {
				obj[key] = clazz.prototype[key];
			} catch (e) {
				// Do nothing
			}
		}
	});

	if (
		obj.metadata?.controllerExtensions &&
		Object.keys(obj.metadata.controllerExtensions).length > 0
	) {
		for (const cExtName in obj.metadata.controllerExtensions) {
			obj[cExtName] = obj.metadata.controllerExtensions[cExtName];
		}
	}
	const output = clazz.extend(name, obj) as typeof Control & Function;
	const fnInit = output.prototype.init;
	const fnAfterInit = output.prototype.afterInit;
	output.prototype.init = function (...args: unknown[]): void {
		if (fnInit) {
			fnInit.apply(this, args);
		}
		if (clazz.registerInstance) {
			clazz.registerInstance(this);
		}
		this.metadata = obj.metadata;

		if (obj.metadata.properties) {
			const aPropertyKeys = Object.keys(obj.metadata.properties);
			aPropertyKeys.forEach((propertyKey) => {
				const propertyDef = obj.metadata.properties[propertyKey];
				// If a value was set in `init` we need to make sure it is set in the value in the end
				const propertyDefault = this[propertyKey] ?? propertyDef.defaultValue;
				if (propertyDef.isBindingInfo === true) {
					this._bindingProperties ??= {};

					Object.defineProperty(this, propertyKey, {
						configurable: true,
						set: (v: unknown) => {
							this._bindingProperties[propertyKey] = v;
							this.mProperties[propertyKey] = v;
							return this;
						},
						get(): unknown {
							// Special case we need to consider the property first and not just the _bindingProperties
							// During the initialization, if the property is set with a non binding value, setProperty is called and not bindProperty
							const propertyValue = this.getProperty(propertyKey);
							const bindingPropertyValue = this._bindingProperties[propertyKey];
							// If the property is set to a different value we update the _bindingProperties
							if (
								propertyValue !== undefined &&
								propertyValue !== bindingPropertyValue
							) {
								this._bindingProperties[propertyKey] = propertyValue;
							}
							const propValue = this._bindingProperties[propertyKey];
							if (typeof propValue === "object") {
								return { ...propValue }; // Create shallow copy
							} else {
								return propValue;
							}
						},
					});
				} else {
					Object.defineProperty(this, propertyKey, {
						configurable: true,
						set: (v: unknown) => {
							return this.setProperty(propertyKey, v);
						},
						get: () => {
							return this.getProperty(propertyKey);
						},
					});
				}
				if (
					propertyDefault !== undefined &&
					this[propertyKey] !== propertyDefault
				) {
					// don't overwrite the default value if it's already there
					this._applyingSettings = true;
					this[propertyKey] = propertyDefault;
					this._applyingSettings = false;
					delete this._applyingSettings;
				}
			});
			const aAggregationKeys = Object.keys(obj.metadata.aggregations);
			aAggregationKeys.forEach((aggregationKey) => {
				const aggregationDef = obj.metadata.aggregations[aggregationKey];
				const defaultValue =
					this[aggregationKey] ?? aggregationDef.defaultValue;
				Object.defineProperty(this, aggregationKey, {
					configurable: true,
					set: (v: unknown) => {
						return this.setAggregation(aggregationKey, v);
					},
					get: () => {
						const aggregationContent = this.getAggregation(aggregationKey);
						if (obj.metadata.aggregations[aggregationKey].multiple) {
							return aggregationContent || [];
						} else {
							return aggregationContent;
						}
					},
				});
				if (defaultValue && (defaultValue as UI5Element)?.isA) {
					this._applyingSettings = true;
					this[aggregationKey] = defaultValue;
					this._applyingSettings = false;
					delete this._applyingSettings;
				}
			});
			const aAssociationKeys = Object.keys(obj.metadata.associations);
			aAssociationKeys.forEach((associationKey) => {
				Object.defineProperty(this, associationKey, {
					configurable: true,
					set: (v: unknown) => {
						return this.setAssociation(associationKey, v);
					},
					get: () => {
						const aggregationContent = this.getAssociation(associationKey);
						if (obj.metadata.associations[associationKey].multiple) {
							return aggregationContent || [];
						} else {
							return aggregationContent;
						}
					},
				});
			});
		}
		if (obj.metadata.references) {
			const referenceProperties = Object.keys(obj.metadata.references);
			referenceProperties.forEach((propertyKey) => {
				Object.defineProperty(this, propertyKey, {
					configurable: true,
					value: createReference(),
				});
			});
		}
		if (obj.metadata.methods) {
			for (const methodName in obj.metadata.methods) {
				const methodDefinition = obj.metadata.methods[methodName];
				if (
					methodDefinition.overrideExecution === "AfterAsync" ||
					methodDefinition.overrideExecution === "BeforeAsync"
				) {
					if (!this.methodHolder) {
						this.methodHolder = [];
					}
					this.methodHolder[methodName] = [this[methodName]];
					Object.defineProperty(this, methodName, {
						configurable: true,
						set: (v: Function) => {
							return this.methodHolder[methodName].push(v);
						},
						get: () => {
							return async (...methodArgs: unknown[]) => {
								const methodArrays = this.methodHolder[methodName];
								if (methodDefinition.overrideExecution === "BeforeAsync") {
									methodArrays.reverse();
								}
								let result;
								for (const arg of methodArrays) {
									result = await arg.apply(this, methodArgs);
								}
								return result;
							};
						},
					});
				}
			}
		}
		_createStateProperty(obj, this);
		if (fnAfterInit) {
			fnAfterInit.apply(this, args);
		}
	};

	clazz.override = function (oExtension: unknown): Function {
		const pol = {};
		(pol as Function).constructor = function (...args: unknown[]): Function {
			return clazz.apply(this, args);
		};
		const oClass = (
			Metadata as unknown as { createClass: Function }
		).createClass(
			clazz,
			`anonymousExtension~${uid()}`,
			pol,
			ControllerMetadata
		);
		oClass.getMetadata()._staticOverride = oExtension;
		oClass.getMetadata()._override = (
			clazz.getMetadata() as { _override?: unknown }
		)._override;
		return oClass;
	};

	ObjectPath.set(name, output);

	return output;
}
