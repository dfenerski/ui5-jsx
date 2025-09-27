import deepClone from "sap/base/util/deepClone";
import type { ExtensionOverrideExecution } from "./ClassSupport";
import type Controller from "sap/ui/core/mvc/Controller";
import type XMLView from "sap/ui/core/mvc/XMLView";
/**
 * This type is to be extended with all controller extensions and methods that are hookable.
 */
type HookableControllerExtensions = {
	editFlow: {
		onAfterSave: true;
		onBeforeSave: true;
	};
	inlineEditFlow: {
		inlineEditEnd: true;
		inlineEditStart: true;
	};
	collaborationManager: {
		collectAvailableCards: true;
	};
	paginator: {
		initialize: true;
	};
	routing: {
		onAfterBinding: true;
	};
};

type HandlerConfiguration<CExtName extends keyof HookableControllerExtensions> =
	{
		name: CExtName;
		method: keyof HookableControllerExtensions[CExtName];
	};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandlerRegistration = HandlerConfiguration<any> & {
	targetMethod: string;
	handlerFunction?: Function;
};

type FunctionMap = {
	[key: string]: Function;
};
type DeepFunctionMap = {
	[key: string]: FunctionMap;
};
type HookMap = {
	hookedHandlers: {
		[key: string]: Function[];
	};
};

// Use two arrays as we cannot index a map through an arbitrary object instance
const registeredInstances: Function[] = [];
const registeredHandlers: HandlerRegistration[][] = [];

/**
 * Marks a controller extension method to be hookable by generating additional methods that can be used to attach and detach handlers at runtime.
 * @param execution
 * @returns A method decorator
 */
export function hookable(
	execution: ExtensionOverrideExecution
): MethodDecorator {
	return function (
		target: unknown,
		propertyKey: string | symbol,
		descriptor: PropertyDescriptor
	) {
		const indexableTarget = target as FunctionMap;

		indexableTarget[`attach${propertyKey.toString()}`] = function (
			fn: Function
		): void {
			const cExTInstanceHookMap = this as unknown as HookMap;
			if (!cExTInstanceHookMap.hookedHandlers) {
				cExTInstanceHookMap.hookedHandlers = {};
			}
			if (!cExTInstanceHookMap.hookedHandlers[propertyKey.toString()]) {
				cExTInstanceHookMap.hookedHandlers[propertyKey.toString()] = [];
			}
			cExTInstanceHookMap.hookedHandlers[propertyKey.toString()].push(fn);
		};
		indexableTarget[`detach${propertyKey.toString()}`] = function (
			fn: Function
		): void {
			const cExTInstanceHookMap = this as unknown as HookMap;
			const handlers =
				cExTInstanceHookMap.hookedHandlers[propertyKey.toString()];
			const index = handlers.indexOf(fn);
			if (index !== -1) {
				handlers.splice(index, 1);
			}
		};

		const oldValue = descriptor.value;
		if (execution === "BeforeAsync" || execution === "AfterAsync") {
			descriptor.value = async function (...args: unknown[]): Promise<unknown> {
				const cExTInstanceHookMap = this as unknown as HookMap;
				const handlers =
					(cExTInstanceHookMap?.hookedHandlers &&
						cExTInstanceHookMap?.hookedHandlers[propertyKey.toString()]) ||
					[];
				let returnValue: unknown;
				if (execution === "AfterAsync") {
					returnValue = await oldValue.bind(this)(...args);
				}
				for (const handler of handlers) {
					await handler.bind(this)(...args);
				}
				if (execution === "BeforeAsync") {
					returnValue = await oldValue.bind(this)(...args);
				}
				return returnValue;
			};
		} else {
			descriptor.value = function (...args: unknown[]): unknown {
				const cExTInstanceHookMap = this as unknown as HookMap;
				const handlers =
					(cExTInstanceHookMap?.hookedHandlers &&
						cExTInstanceHookMap?.hookedHandlers[propertyKey.toString()]) ||
					[];
				let returnValue: unknown;
				if (execution === "After") {
					returnValue = oldValue.bind(this)(...args);
				}
				for (const handler of handlers) {
					handler.bind(this)(...args);
				}
				if (execution === "Before") {
					returnValue = oldValue.bind(this)(...args);
				}
				return returnValue;
			};
		}
	};
}

/**
 * Checks whether a newRegistration is already included in some existingRegistrations by comparing all relevant attributes.
 * @param existingRegistrations
 * @param newRegistration
 * @returns Result of the check
 */
function isAlreadyRegistered(
	existingRegistrations: HandlerRegistration[],
	newRegistration: HandlerRegistration
): boolean {
	return !!existingRegistrations.find(
		(r) =>
			r.name === newRegistration.name &&
			r.method === newRegistration.method &&
			r.targetMethod === newRegistration.targetMethod
	);
}

export const hooks = Symbol("hooks");

/**
 * Registers a method as controller extension hook handler.
 *
 * Currently, only methods of runtime building blocks are supported.
 * @param name Controller extension to hook into
 * @param method Method to hook into
 * @returns A method decorator
 */
export function controllerExtensionHandler<
	CExtName extends keyof HookableControllerExtensions
>(
	name: CExtName,
	method: keyof HookableControllerExtensions[CExtName]
): MethodDecorator {
	return function (
		target: { constructor: Function & { [hooks]?: HandlerRegistration[] } },
		propertyKey: string
	) {
		const newRegistration = {
			name,
			method: String(method),
			targetMethod: propertyKey,
		};
		const index = registeredInstances.indexOf(target.constructor);
		if (!target.constructor[hooks]) {
			Object.defineProperty(target.constructor, hooks, {
				value: [],
			});
		}
		target.constructor[hooks]?.push(newRegistration);
		// We need to check if this exact handler is already registered as handlers are registered statically (on the constructor)
		if (
			index !== -1 &&
			!isAlreadyRegistered(registeredHandlers[index], newRegistration)
		) {
			registeredHandlers[index].push(newRegistration);
		} else {
			registeredInstances.push(target.constructor);
			registeredHandlers.push([newRegistration]);
		}
	} as MethodDecorator;
}

/**
 * Initializes all controller extension handlers registered for a given target.
 * @param target Target class to initialize the handlers for
 * @param target.constructor
 * @param controller PageController instance to get the controller extensions instances from
 */
export function initControllerExtensionHookHandlers(
	target: { constructor: Function & { [hooks]?: HandlerRegistration[] } } & {
		[hooks]?: HandlerRegistration[];
	},
	controller: Controller
): void {
	if (target.constructor[hooks]) {
		let registeredHooks = target.constructor[hooks];
		target[hooks] = deepClone(registeredHooks);
		registeredHooks = target[hooks]!;
		const indexableTarget = target as unknown as FunctionMap;
		const indexableController = controller as unknown as DeepFunctionMap;
		for (const registeredHook of registeredHooks) {
			registeredHook.handlerFunction =
				indexableTarget[registeredHook.targetMethod].bind(target);
			indexableController[registeredHook.name][
				`attach${String(registeredHook.method)}`
			](registeredHook.handlerFunction);
			controller.getView()?.attachBeforeExit(() => {
				indexableController[registeredHook.name][
					`detach${String(registeredHook.method)}`
				](registeredHook.handlerFunction);
			});
		}
	}
}

export function removeControllerExtensionHookHandlers(
	target: { constructor: Function & { [hooks]?: HandlerRegistration[] } } & {
		[hooks]?: HandlerRegistration[];
	},
	controller: Controller
): void {
	if (target[hooks]) {
		const registeredHooks = target[hooks];
		const indexableController = controller as unknown as DeepFunctionMap;
		for (const registeredHook of registeredHooks) {
			indexableController[registeredHook.name]?.[
				`detach${String(registeredHook.method)}`
			]?.(registeredHook.handlerFunction);
		}
	}
}

export function propagateHookFromMixin(
	target: Function & { [hooks]?: HandlerRegistration[] },
	source: Function & { [hooks]?: HandlerRegistration[] }
): void {
	if (source[hooks]) {
		if (target[hooks]) {
			target[hooks]!.splice(0, 0, ...source[hooks]);
		} else {
			Object.defineProperty(
				target,
				hooks,
				Object.getOwnPropertyDescriptor(source, hooks) || Object.create([])
			);
		}
	}
}

export function xmlViewPreprocessor(
	source: object,
	_caller?: unknown,
	_settings?: object
): void {
	const sourceView = source as XMLView;
	const controller = sourceView.getController() as Controller | undefined;
	if (controller) {
		const macroAPIChild = sourceView.findAggregatedObjects(true, (s) =>
			s.isA("sap.fe.macros.MacroAPI")
		);
		for (const managedObject of macroAPIChild) {
			initControllerExtensionHookHandlers(managedObject, controller);
		}
	}
}
