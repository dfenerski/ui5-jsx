import type { BindingToolkitExpression } from "../BindingToolkit";
import { compileExpression } from "../BindingToolkit";
import type { ControlProperties, NonControlProperties } from "./jsx";
// import type BuildingBlockTemplatingBase from "core/buildingBlocks/templating/BuildingBlockTemplatingBase";
import type Control from "sap/ui/core/Control";
import type UI5Element from "sap/ui/core/Element";
import type Context from "sap/ui/model/Context";

function isBindingToolkitExpression(
	expression: BindingToolkitExpression<unknown> | unknown
): expression is BindingToolkitExpression<unknown> {
	return (expression as BindingToolkitExpression<unknown>)?._type !== undefined;
}

const writeChildren = function (val: string | string[]): string {
	if (Array.isArray(val)) {
		return val.join("");
	} else {
		return val;
	}
};

/**
 * Some characters needs to be escaped when used as XML attribute value, otherwise this result in incorrect XML.
 * @param value
 * @returns The escaped xml attribute
 */
function escapeXMLAttributeValue(value?: string): string | undefined {
	return value
		?.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

const addChildAggregation = function (
	aggregationChildren: Record<string, (Control | string)[]>,
	aggregationName: string,
	child: string | Record<string, string>
): void {
	if (child === undefined) {
		return;
	}
	if (!aggregationChildren[aggregationName]) {
		aggregationChildren[aggregationName] = [];
	}
	if (typeof child === "string") {
		if (child.trim().length > 0) {
			aggregationChildren[aggregationName].push(child);
		}
	} else if (Array.isArray(child)) {
		child.forEach((subChild) => {
			addChildAggregation(aggregationChildren, aggregationName, subChild);
		});
	} else {
		for (const childKey of Object.keys(child)) {
			addChildAggregation(aggregationChildren, childKey, child[childKey]);
		}
	}
};

const isAControl = function (
	children?: typeof Control | Function
): children is typeof Control {
	return !!(children as typeof Control)?.getMetadata;
};

const FL_DELEGATE = "fl:delegate";
const DT_DESIGNTIME = "dt:designtime";
const CORE_REQUIRE = "core:require";
const LOG_SOURCEPATH = "log:sourcePath";
const CUSTOM_ENTITYTYPE = "customData:entityType";

function processObjectPropertyValue(
	childrenObject: Record<string, unknown>,
	namespaceAlias: string | undefined,
	propertyName: string
): string {
	// This is called when the child is
	const aggregationProperties: string[] = [];
	const aggregationChildren: string[] = [];
	Object.keys(childrenObject).forEach((subPropName) => {
		const childValue = childrenObject[subPropName];
		if (childValue !== undefined) {
			if (typeof childValue === "object") {
				if (Array.isArray(childValue)) {
					aggregationChildren.push(`<${subPropName}>`);
					for (const childrenObjectElement of childValue) {
						aggregationChildren.push(
							processObjectPropertyValue(
								childrenObjectElement as Record<string, unknown>,
								namespaceAlias,
								subPropName
							)
						);
					}
					aggregationChildren.push(`</${subPropName}>`);
				} else {
					// if the property is a value it needs to be serialized as a children
					// <myObjectProp prop1='xxx', prop2='xxt'/>
					aggregationChildren.push(
						processObjectPropertyValue(
							childValue as Record<string, unknown>,
							namespaceAlias,
							subPropName
						)
					);
				}
			} else {
				// Otherwise it's part of the main object just as another property
				aggregationProperties.push(
					`${subPropName}='${escapeXMLAttributeValue(childValue.toString())}'`
				);
			}
		}
	});

	const namespacedProperty = namespaceAlias
		? `${namespaceAlias}:${propertyName}`
		: propertyName;
	return `<${namespacedProperty} ${aggregationProperties.join(
		" "
	)}>${aggregationChildren.join("\n")}</${namespacedProperty}>`;
}

function processProperties<T>(
	mSettings: Record<string, unknown>,
	metadataProperties: Record<
		string,
		{
			name?: string;
			type?: string;
		}
	>,
	namespaceAlias: string,
	propertiesString: string[],
	aggregationString: string[],
	isControl: boolean
): void {
	Object.keys(metadataProperties).forEach((propertyName) => {
		if (
			mSettings.hasOwnProperty(propertyName) &&
			mSettings[propertyName] !== undefined
		) {
			const propertyValue = mSettings[propertyName];
			if (propertyName === CORE_REQUIRE) {
				propertiesString.push(`xmlns:core="sap.ui.core"`);
			}
			if (propertyName === FL_DELEGATE) {
				propertiesString.push(`xmlns:fl="sap.ui.fl"`);
			}
			if (propertyName === DT_DESIGNTIME) {
				propertiesString.push(`xmlns:dt="sap.ui.dt"`);
			}
			if (propertyName === LOG_SOURCEPATH) {
				propertiesString.push(
					`xmlns:log="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"`
				);
			}
			if (propertyName === CUSTOM_ENTITYTYPE) {
				propertiesString.push(
					`xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"`
				);
			}
			if (propertyValue && typeof propertyValue === "object") {
				if (metadataProperties[propertyName].type === "sap.ui.model.Context") {
					propertiesString.push(
						`${propertyName}='${(propertyValue as Context).getPath()}'`
					);
				} else if (isBindingToolkitExpression(propertyValue)) {
					propertiesString.push(
						`${propertyName}='${escapeXMLAttributeValue(
							compileExpression(propertyValue)
						)}'`
					);
				} else if (Array.isArray(propertyValue)) {
					if (propertyValue.length === 1) {
						const outValue =
							typeof propertyValue[0] === "string"
								? propertyValue[0]
								: JSON.stringify(propertyValue[0]);
						propertiesString.push(`${propertyName}='${outValue}'`);
					} else {
						const separator = metadataProperties[propertyName].type?.endsWith(
							"[]"
						)
							? ","
							: " ";
						const outValue = propertyValue.every(
							(val) => typeof val === "string"
						)
							? propertyValue.join(separator)
							: JSON.stringify(propertyValue);
						propertiesString.push(`${propertyName}='${outValue}'`);
					}
				} else if (isControl) {
					const propAsUI5Object = { ui5object: true, ...propertyValue };
					propertiesString.push(
						`${propertyName}='${escapeXMLAttributeValue(
							JSON.stringify(propAsUI5Object)
						)}'`
					);
				} else {
					aggregationString.push(
						processObjectPropertyValue(
							propertyValue as Record<string, string>,
							undefined,
							propertyName
						)
					);
				}
			} else if (propertyValue !== null) {
				const prop = propertyValue as string | boolean | number;
				propertiesString.push(
					`${propertyName}='${escapeXMLAttributeValue(prop.toString())}'`
				);
			}
		} else if (
			mSettings.children?.hasOwnProperty(propertyName) &&
			Object.keys(
				(mSettings.children as ControlProperties<T>)?.[propertyName] ?? {}
			).length > 0
		) {
			// Object / Array properties are part of the `children` aggregation and as such still need to be processed as properties
			const childrenObject = (mSettings.children as ControlProperties<T>)?.[
				propertyName
			] as unknown as Record<string, object>;
			aggregationString.push(
				processObjectPropertyValue(childrenObject, namespaceAlias, propertyName)
			);
		}
	});
}

/**
 * Processes the command.
 *
 * Resolves the command set on the control via the intrinsic class attribute "jsx:command".
 * If no command has been set or the targeted event doesn't exist, no configuration is set.
 * @param settings Metadata of the control
 * @param metadataEvents Settings of the control
 */
function processCommand(
	settings: Record<string, unknown>,
	metadataEvents: Record<
		string,
		{
			name: string;
		}
	>
): void {
	const commandProperty = settings["jsx:command"];
	if (commandProperty) {
		const [command, eventName] = (commandProperty as string).split("|");
		const event = metadataEvents[eventName];
		if (event && command.startsWith("cmd:")) {
			settings[event.name] = command;
		}
	}
	delete settings["jsx:command"];
}

function processAggregations(
	mSettings: Record<string, unknown>,
	metadataAggregations: Record<string, object>,
	namespaceAlias: string,
	defaultAggregationName: string | undefined,
	propertiesString: string[],
	aggregationString: string[]
): Record<string, string[]> {
	const aggregationChildren: Record<string, string[]> = {};
	addChildAggregation(
		aggregationChildren,
		defaultAggregationName ?? "customData",
		mSettings.children as Record<string, string>
	);
	const aggregationChildKeys = Object.keys(aggregationChildren);
	let writeOnlyDefaultAggregation = false;
	if (
		aggregationChildKeys.length === 1 &&
		aggregationChildKeys[0] === defaultAggregationName
	) {
		writeOnlyDefaultAggregation = true;
	}
	Object.keys(metadataAggregations).forEach((aggregationName) => {
		if (
			aggregationChildren.hasOwnProperty(aggregationName) &&
			aggregationChildren[aggregationName].length > 0
		) {
			if (
				aggregationName === defaultAggregationName &&
				writeOnlyDefaultAggregation
			) {
				aggregationString.push(
					`${writeChildren(aggregationChildren[aggregationName])}`
				);
			} else {
				aggregationString.push(
					`<${namespaceAlias}:${aggregationName}>
						${writeChildren(aggregationChildren[aggregationName])}
					</${namespaceAlias}:${aggregationName}>`
				);
			}
		}
		if (
			mSettings.hasOwnProperty(aggregationName) &&
			mSettings[aggregationName] !== undefined
		) {
			if (typeof mSettings[aggregationName] === "object") {
				propertiesString.push(
					`${aggregationName}='${JSON.stringify(mSettings[aggregationName])}'`
				);
			} else {
				// In some case the aggregation expect a string value (like for the tooltip), in this case we set it directly as a property
				propertiesString.push(
					`${aggregationName}='${escapeXMLAttributeValue(
						mSettings[aggregationName] as string
					)}'`
				);
			}
		}
	});
	return aggregationChildren;
}

const jsxXml = function <T>(
	type: typeof Control | /*typeof BuildingBlockTemplatingBase | */ "slot",
	mSettings: NonControlProperties<T> & {
		key?: string;
		children?: UI5Element | ControlProperties<T>;
		name?: string;
	},
	key: string | undefined,
	xmlNamespaceMap: Record<string, string>,
	overrideNodeName?: string
): string {
	let metadata;
	let metadataProperties: Record<string, { name?: string; type?: string }>;
	let metadataEvents: Record<string, { name: string }>;
	let controlName;
	let metadataAggregations;
	let defaultAggregationName: string | undefined;
	let isControl = false;
	if (type === "slot") {
		return `<slot name="${mSettings.name}"/>`;
	} else if (isAControl(type)) {
		metadata = type.getMetadata();
		metadataProperties = metadata.getAllProperties();
		metadataProperties = <any>{
			...metadataProperties,
			...metadata.getAllEvents(),
			...metadata.getAllAssociations(),
		};
		metadataEvents = <any>metadata.getAllEvents();
		controlName = metadata.getName();
		metadataAggregations = metadata.getAllAggregations();
		defaultAggregationName = metadata.getDefaultAggregationName();
		isControl = true;
	} else {
		metadata = (<any>type).metadata;
		metadataProperties = { ...metadata.properties };
		metadataAggregations = {
			...{ dependents: {}, customData: {} },
			...metadata.aggregations,
		};
		metadataEvents = {};
		defaultAggregationName = metadata.defaultAggregation;
		controlName = metadata.namespace + "." + metadata.name;
	}
	const namesSplit = controlName.split(".");
	if (key !== undefined) {
		mSettings["key"] = key;
	}

	metadataProperties["class"] = { name: "class" };
	metadataProperties["id"] = { name: "id" };
	metadataProperties["binding"] = { name: "binding" };
	metadataProperties[FL_DELEGATE] = { name: FL_DELEGATE };
	metadataProperties[DT_DESIGNTIME] = { name: DT_DESIGNTIME };
	metadataProperties[CORE_REQUIRE] = { name: CORE_REQUIRE };
	metadataProperties[LOG_SOURCEPATH] = { name: LOG_SOURCEPATH };
	metadataProperties[CUSTOM_ENTITYTYPE] = { name: CUSTOM_ENTITYTYPE };
	metadataProperties["xmlns:fl"] = { name: FL_DELEGATE };
	metadataProperties["xmlns:dt"] = { name: DT_DESIGNTIME };
	metadataProperties["xmlns:core"] = { name: CORE_REQUIRE };
	metadataProperties["xmlns:log"] = { name: LOG_SOURCEPATH };
	if (controlName === "sap.ui.core.Fragment") {
		metadataProperties["fragmentName"] = { name: "fragmentName" };
	}
	const namespace = namesSplit.slice(0, -1);
	const name = namesSplit[namesSplit.length - 1];
	let namespaceAlias = namespace[namespace.length - 1];
	if (xmlNamespaceMap[namespace.join(".")]) {
		namespaceAlias = xmlNamespaceMap[namespace.join(".")];
	}
	let tagName = `${namespaceAlias}:${name}`;
	const propertiesString: string[] = [];
	const aggregationString: string[] = [];
	processCommand(mSettings, metadataEvents);
	processProperties(
		mSettings,
		metadataProperties,
		namespaceAlias,
		propertiesString,
		aggregationString,
		isControl
	);
	processAggregations(
		mSettings,
		metadataAggregations,
		namespaceAlias,
		defaultAggregationName,
		propertiesString,
		aggregationString
	);
	if (overrideNodeName) {
		tagName = overrideNodeName;
	}
	return `<${tagName} xmlns:${namespaceAlias}="${namespace.join(
		"."
	)}" ${propertiesString.join(" ")}>${aggregationString.join("")}</${tagName}>`;
};
export default jsxXml;
