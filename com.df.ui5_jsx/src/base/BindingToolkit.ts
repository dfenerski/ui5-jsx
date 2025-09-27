import type {
	ActionParameter,
	AndAnnotationExpression,
	AndConditionalExpression,
	ApplyAnnotationExpression,
	Boolean,
	ConditionalCheckOrValue,
	EntitySet,
	EntityType,
	EqAnnotationExpression,
	EqConditionalExpression,
	GeAnnotationExpression,
	GeConditionalExpression,
	GtAnnotationExpression,
	GtConditionalExpression,
	IfAnnotationExpression,
	IfAnnotationExpressionValue,
	LeAnnotationExpression,
	LeConditionalExpression,
	LtAnnotationExpression,
	LtConditionalExpression,
	NeAnnotationExpression,
	NeConditionalExpression,
	NotAnnotationExpression,
	NotConditionalExpression,
	OrAnnotationExpression,
	OrConditionalExpression,
	PathAnnotationExpression,
	PathConditionExpression,
	Property,
	PropertyAnnotationValue,
	ConstantExpression as VocabConstantExpression,
} from "@sap-ux/vocabularies-types";
// import { CommonAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Common";
import { resolveEnumValue } from "./AnnotationEnum";
import type { BindingInfoHolder } from "./ClassSupport";

export type PrimitiveType =
	| string
	| number
	| bigint
	| boolean
	| object
	| null
	| undefined;
type DefinedPrimitiveType = string | number | bigint | boolean | object;
type PrimitiveTypeCast<P> = P extends String
	? string
	: P extends Boolean
	? boolean
	: P extends Number
	? number
	: P;
type BaseExpression<_T> = {
	_type: string;
};

export type FormatOptions = Partial<{
	customUnits: Record<string, object>;
	customCurrencies: Record<string, object>;
	decimals: number;
	emptyString: null | number | string;
	fiscalType: string;
	groupingEnabled: boolean;
	maxFractionDigits: number;
	maxIntegerDigits: number;
	minFractionDigits: number;
	minIntegerDigits: number;
	parseAsString: boolean;
	parseKeepsEmptyString: boolean;
	pattern: string;
	precision: number;
	preserveDecimals: boolean;
	shortDecimals: number;
	shortRefNumber: number;
	showMeasure: boolean;
	showNumber: boolean;
	showScale: boolean;
	style: string;
}>;

export type ConstantExpression<T> = BaseExpression<T> & {
	_type: "Constant";
	value: T;
};

type SetOperator = "&&" | "||";
export type SetExpression = BaseExpression<boolean> & {
	_type: "Set";
	operator: SetOperator;
	operands: BindingToolkitExpression<boolean>[];
};

export type NotExpression = BaseExpression<boolean> & {
	_type: "Not";
	operand: BindingToolkitExpression<boolean>;
};

export type TruthyExpression = BaseExpression<boolean> & {
	_type: "Truthy";
	operand: BindingToolkitExpression<string>;
};

export type ReferenceExpression = BaseExpression<object> & {
	_type: "Ref";
	ref: string | null;
};

export type FormatterExpression<T> = BaseExpression<T> & {
	_type: "Formatter";
	fn: string;
	parameters: BindingToolkitExpression<unknown>[];
};

type ComplexTypeExpression<T> = BaseExpression<T> & {
	_type: "ComplexType";
	type: string;
	formatOptions: FormatOptions;
	constraints: object;
	parameters: object;
	bindingParameters: BindingToolkitExpression<unknown>[];
};

export type FunctionExpression<T> = BaseExpression<T> & {
	_type: "Function";
	obj?: BindingToolkitExpression<object>;
	fn: string;
	isFormattingFn: boolean;
	parameters: BindingToolkitExpression<unknown>[];
};

export type ConcatExpression = BaseExpression<string> & {
	_type: "Concat";
	expressions: BindingToolkitExpression<string>[];
};

export type LengthExpression = BaseExpression<string> & {
	_type: "Length";
	pathInModel: PathInModelExpression<unknown>;
};

type UnresolvablePathExpression = BaseExpression<string> & {
	_type: "Unresolvable";
};

/**
 * @typedef PathInModelExpression
 */
export type PathInModelExpression<T> = BaseExpression<T> & {
	_type: "PathInModel";
	modelName?: string;
	path: string;
	targetEntitySet?: EntitySet;
	type?: string;
	constraints?: BindingConstraints;
	parameters?: object;
	targetType?: string;
	mode?: string;
	formatOptions?: FormatOptions;
	alwaysKeepTargetType?: boolean;
};

export type EmbeddedUI5BindingExpression<T> = BaseExpression<T> & {
	_type: "EmbeddedBinding";
	value: string;
};

export type EmbeddedUI5ExpressionBindingExpression<T> = BaseExpression<T> & {
	_type: "EmbeddedExpressionBinding";
	value: string;
};

export type ComparisonOperator = "===" | "!==" | ">=" | ">" | "<=" | "<";
export type ComparisonExpression = BaseExpression<boolean> & {
	_type: "Comparison";
	operator: ComparisonOperator;
	operand1: BindingToolkitExpression<unknown>;
	operand2: BindingToolkitExpression<unknown>;
};

export type IfElseExpression<T> = BaseExpression<T> & {
	_type: "IfElse";
	condition: BindingToolkitExpression<boolean>;
	onTrue: BindingToolkitExpression<T>;
	onFalse: BindingToolkitExpression<T>;
};
export function isProperty(serviceObject: unknown): serviceObject is Property {
	return (serviceObject as Property)?._type === "Property";
}

/**
 * An expression that evaluates to type T.
 * @typedef BindingToolkitExpression
 */
export type BindingToolkitExpression<T> =
	| UnresolvablePathExpression
	| ConstantExpression<T>
	| SetExpression
	| NotExpression
	| TruthyExpression
	| ConcatExpression
	| LengthExpression
	| PathInModelExpression<T>
	| EmbeddedUI5BindingExpression<T>
	| EmbeddedUI5ExpressionBindingExpression<T>
	| ComparisonExpression
	| IfElseExpression<T>
	| FormatterExpression<T>
	| ComplexTypeExpression<T>
	| ReferenceExpression
	| FunctionExpression<T>;

type TypeMappingDefinition = {
	type: string;
	constraints?: {
		$Precision?: string;
		$V4?: string;
		$Scale?: string;
		$MaxLength?: string;
		$Nullable?: string;
		"@Org.OData.Validation.V1.Minimum/$Decimal"?: string;
		"@Org.OData.Validation.V1.Minimum@Org.OData.Validation.V1.Exclusive"?: string;
		"@Org.OData.Validation.V1.Maximum/$Decimal"?: string;
		"@Org.OData.Validation.V1.Maximum@Org.OData.Validation.V1.Exclusive"?: string;
		"@com.sap.vocabularies.Common.v1.IsDigitSequence"?: string;
	};
};
export const EDM_TYPE_MAPPING: Record<string, TypeMappingDefinition> = {
	"Edm.Boolean": { type: "sap.ui.model.odata.type.Boolean" },
	"Edm.Byte": { type: "sap.ui.model.odata.type.Byte" },
	"Edm.Date": { type: "sap.ui.model.odata.type.Date" },
	"Edm.DateTimeOffset": {
		constraints: {
			$Precision: "precision",
			$V4: "V4",
		},
		type: "sap.ui.model.odata.type.DateTimeOffset",
	},
	"Edm.Decimal": {
		constraints: {
			"@Org.OData.Validation.V1.Minimum/$Decimal": "minimum",
			"@Org.OData.Validation.V1.Minimum@Org.OData.Validation.V1.Exclusive":
				"minimumExclusive",
			"@Org.OData.Validation.V1.Maximum/$Decimal": "maximum",
			"@Org.OData.Validation.V1.Maximum@Org.OData.Validation.V1.Exclusive":
				"maximumExclusive",
			$Precision: "precision",
			$Scale: "scale",
		},
		type: "sap.ui.model.odata.type.Decimal",
	},
	"Edm.Double": { type: "sap.ui.model.odata.type.Double" },
	"Edm.Guid": { type: "sap.ui.model.odata.type.Guid" },
	"Edm.Int16": { type: "sap.ui.model.odata.type.Int16" },
	"Edm.Int32": { type: "sap.ui.model.odata.type.Int32" },
	"Edm.Int64": { type: "sap.ui.model.odata.type.Int64" },
	"Edm.SByte": { type: "sap.ui.model.odata.type.SByte" },
	"Edm.Single": { type: "sap.ui.model.odata.type.Single" },
	"Edm.Stream": { type: "sap.ui.model.odata.type.Stream" },
	"Edm.Binary": { type: "sap.ui.model.odata.type.Stream" },
	"Edm.String": {
		constraints: {
			"@com.sap.vocabularies.Common.v1.IsDigitSequence": "isDigitSequence",
			$MaxLength: "maxLength",
			$Nullable: "nullable",
		},
		type: "sap.ui.model.odata.type.String",
	},
	"Edm.TimeOfDay": {
		constraints: {
			$Precision: "precision",
		},
		type: "sap.ui.model.odata.type.TimeOfDay",
	},
};

/**
 * An expression that evaluates to type T, or a constant value of type T
 */
export type ExpressionOrPrimitive<T extends PrimitiveType> =
	| BindingToolkitExpression<T>
	| T;

export const unresolvableExpression: UnresolvablePathExpression = {
	_type: "Unresolvable",
};

export function escapeXmlAttribute(inputString: string): string {
	return inputString.replace(/'/g, "\\'");
}

export function hasUnresolvableExpression(
	...expressions: BindingToolkitExpression<unknown>[]
): boolean {
	return (
		expressions.find((expr) => expr._type === "Unresolvable") !== undefined
	);
}
/**
 * Check two expressions for (deep) equality.
 * @param a
 * @param b
 * @returns `true` if the two expressions are equal
 */
export function _checkExpressionsAreEqual<T>(
	a: BindingToolkitExpression<T>,
	b: BindingToolkitExpression<T>
): boolean {
	if (a._type !== b._type) {
		return false;
	}

	switch (a._type) {
		case "Unresolvable":
			return false; // Unresolvable is never equal to anything even itself
		case "Constant":
		case "EmbeddedBinding":
		case "EmbeddedExpressionBinding":
			return a.value === (b as ConstantExpression<T>).value;

		case "Not":
			return _checkExpressionsAreEqual(a.operand, (b as NotExpression).operand);
		case "Truthy":
			return _checkExpressionsAreEqual(
				a.operand,
				(b as TruthyExpression).operand
			);
		case "Set":
			return (
				a.operator === (b as SetExpression).operator &&
				a.operands.length === (b as SetExpression).operands.length &&
				a.operands.every((expression) =>
					(b as SetExpression).operands.some((otherExpression) =>
						_checkExpressionsAreEqual(expression, otherExpression)
					)
				)
			);

		case "IfElse":
			return (
				_checkExpressionsAreEqual(
					a.condition,
					(b as IfElseExpression<T>).condition
				) &&
				_checkExpressionsAreEqual(
					a.onTrue,
					(b as IfElseExpression<T>).onTrue
				) &&
				_checkExpressionsAreEqual(a.onFalse, (b as IfElseExpression<T>).onFalse)
			);

		case "Comparison":
			return (
				a.operator === (b as ComparisonExpression).operator &&
				_checkExpressionsAreEqual(
					a.operand1,
					(b as ComparisonExpression).operand1
				) &&
				_checkExpressionsAreEqual(
					a.operand2,
					(b as ComparisonExpression).operand2
				)
			);

		case "Concat":
			const aExpressions = a.expressions;
			const bExpressions = (b as ConcatExpression).expressions;
			if (aExpressions.length !== bExpressions.length) {
				return false;
			}
			return aExpressions.every((expression, index) => {
				return _checkExpressionsAreEqual(expression, bExpressions[index]);
			});

		case "Length":
			return _checkExpressionsAreEqual(
				a.pathInModel,
				(b as LengthExpression).pathInModel
			);

		case "PathInModel":
			return (
				a.modelName === (b as PathInModelExpression<T>).modelName &&
				a.path === (b as PathInModelExpression<T>).path &&
				a.targetEntitySet === (b as PathInModelExpression<T>).targetEntitySet
			);

		case "Formatter":
			return (
				a.fn === (b as FormatterExpression<T>).fn &&
				a.parameters.length ===
					(b as FormatterExpression<T>).parameters.length &&
				a.parameters.every((value, index) =>
					_checkExpressionsAreEqual(
						(b as FormatterExpression<T>).parameters[index],
						value
					)
				)
			);
		case "ComplexType":
			return (
				a.type === (b as ComplexTypeExpression<T>).type &&
				a.bindingParameters.length ===
					(b as ComplexTypeExpression<T>).bindingParameters.length &&
				a.bindingParameters.every((value, index) =>
					_checkExpressionsAreEqual(
						(b as ComplexTypeExpression<T>).bindingParameters[index],
						value
					)
				)
			);
		case "Function":
			const otherFunction = b as FunctionExpression<T>;
			if (a.obj === undefined || otherFunction.obj === undefined) {
				return a.obj === otherFunction;
			}

			return (
				a.fn === otherFunction.fn &&
				_checkExpressionsAreEqual(a.obj, otherFunction.obj) &&
				a.parameters.length === otherFunction.parameters.length &&
				a.parameters.every((value, index) =>
					_checkExpressionsAreEqual(otherFunction.parameters[index], value)
				)
			);

		case "Ref":
			return a.ref === (b as ReferenceExpression).ref;
	}
	return false;
}

/**
 * Converts a nested SetExpression by inlining operands of type SetExpression with the same operator.
 * @param expression The expression to flatten
 * @returns A new SetExpression with the same operator
 */
function flattenSetExpression(expression: SetExpression): SetExpression {
	return expression.operands.reduce(
		(result: SetExpression, operand) => {
			const candidatesForFlattening =
				operand._type === "Set" && operand.operator === expression.operator
					? operand.operands
					: [operand];
			candidatesForFlattening.forEach((candidate) => {
				if (
					result.operands.every((e) => !_checkExpressionsAreEqual(e, candidate))
				) {
					result.operands.push(candidate);
				}
			});
			return result;
		},
		{ _type: "Set", operator: expression.operator, operands: [] }
	);
}

/**
 * Detects whether an array of boolean expressions contains an expression and its negation.
 * @param expressions Array of expressions
 * @returns `true` if the set of expressions contains an expression and its negation
 */
function hasOppositeExpressions(
	expressions: BindingToolkitExpression<boolean>[]
): boolean {
	const negatedExpressions = expressions.map(not);
	return expressions.some((expression, index) => {
		for (let i = index + 1; i < negatedExpressions.length; i++) {
			if (_checkExpressionsAreEqual(expression, negatedExpressions[i])) {
				return true;
			}
		}
		return false;
	});
}

/**
 * Logical `and` expression.
 *
 * The expression is simplified to false if this can be decided statically (that is, if one operand is a constant
 * false or if the expression contains an operand and its negation).
 * @param operands Expressions to connect by `and`
 * @returns Expression evaluating to boolean
 */
export function and(
	...operands: ExpressionOrPrimitive<boolean>[]
): BindingToolkitExpression<boolean> {
	const expressions = flattenSetExpression({
		_type: "Set",
		operator: "&&",
		operands: operands.map(wrapPrimitive),
	}).operands;

	if (hasUnresolvableExpression(...expressions)) {
		return unresolvableExpression;
	}
	let isStaticFalse = false;
	const nonTrivialExpression = expressions.filter((expression) => {
		if (isFalse(expression)) {
			isStaticFalse = true;
		}
		return !isConstant(expression);
	});
	if (isStaticFalse) {
		return constant(false);
	} else if (nonTrivialExpression.length === 0) {
		// Resolve the constant then
		const isValid = expressions.reduce(
			(result, expression) => result && isTrue(expression),
			true
		);
		return constant(isValid);
	} else if (nonTrivialExpression.length === 1) {
		return nonTrivialExpression[0];
	} else if (hasOppositeExpressions(nonTrivialExpression)) {
		return constant(false);
	} else {
		return {
			_type: "Set",
			operator: "&&",
			operands: nonTrivialExpression,
		};
	}
}

/**
 * Logical `or` expression.
 *
 * The expression is simplified to true if this can be decided statically (that is, if one operand is a constant
 * true or if the expression contains an operand and its negation).
 * @param operands Expressions to connect by `or`
 * @returns Expression evaluating to boolean
 */
export function or(
	...operands: ExpressionOrPrimitive<boolean>[]
): BindingToolkitExpression<boolean> {
	const expressions = flattenSetExpression({
		_type: "Set",
		operator: "||",
		operands: operands.map(wrapPrimitive),
	}).operands;
	if (hasUnresolvableExpression(...expressions)) {
		return unresolvableExpression;
	}
	let isStaticTrue = false;
	const nonTrivialExpression = expressions.filter((expression) => {
		if (isTrue(expression)) {
			isStaticTrue = true;
		}
		return !isConstant(expression) || expression.value;
	});
	if (isStaticTrue) {
		return constant(true);
	} else if (nonTrivialExpression.length === 0) {
		// Resolve the constant then
		const isValid = expressions.reduce(
			(result, expression) => result && isTrue(expression),
			true
		);
		return constant(isValid);
	} else if (nonTrivialExpression.length === 1) {
		return nonTrivialExpression[0];
	} else if (hasOppositeExpressions(nonTrivialExpression)) {
		return constant(true);
	} else {
		return {
			_type: "Set",
			operator: "||",
			operands: nonTrivialExpression,
		};
	}
}

/**
 * Logical `not` operator.
 * @param operand The expression to reverse
 * @returns The resulting expression that evaluates to boolean
 */
export function not(
	operand: ExpressionOrPrimitive<boolean>
): BindingToolkitExpression<boolean> {
	operand = wrapPrimitive(operand);
	if (hasUnresolvableExpression(operand)) {
		return unresolvableExpression;
	} else if (isConstant(operand)) {
		return constant(!operand.value);
	} else if (
		typeof operand === "object" &&
		operand._type === "Set" &&
		operand.operator === "||" &&
		operand.operands.every(
			(expression) => isConstant(expression) || isComparison(expression)
		)
	) {
		return and(...operand.operands.map((expression) => not(expression)));
	} else if (
		typeof operand === "object" &&
		operand._type === "Set" &&
		operand.operator === "&&" &&
		operand.operands.every(
			(expression) => isConstant(expression) || isComparison(expression)
		)
	) {
		return or(...operand.operands.map((expression) => not(expression)));
	} else if (isComparison(operand)) {
		// Create the reverse comparison
		switch (operand.operator) {
			case "!==":
				return { ...operand, operator: "===" };
			case "<":
				return { ...operand, operator: ">=" };
			case "<=":
				return { ...operand, operator: ">" };
			case "===":
				return { ...operand, operator: "!==" };
			case ">":
				return { ...operand, operator: "<=" };
			case ">=":
				return { ...operand, operator: "<" };
		}
	} else if (operand._type === "Not") {
		return operand.operand;
	}

	return {
		_type: "Not",
		operand: operand,
	};
}

/**
 * Evaluates whether a binding expression is equal to true with a loose equality.
 * @param operand The expression to check
 * @returns The resulting expression that evaluates to boolean
 */
export function isTruthy(
	operand: BindingToolkitExpression<string>
): BindingToolkitExpression<boolean> {
	if (isConstant(operand)) {
		return constant(!!operand.value);
	} else {
		return {
			_type: "Truthy",
			operand: operand,
		};
	}
}

/**
 * Creates a binding expression that will be evaluated by the corresponding model.
 * @param path
 * @param modelName
 * @param visitedNavigationPaths
 * @param pathVisitor
 * @returns An expression representating that path in the model
 * @deprecated use pathInModel instead
 */
export function bindingExpression<TargetType extends PrimitiveType>(
	path: string,
	modelName?: string,
	visitedNavigationPaths: string[] = [],
	pathVisitor?: Function
): PathInModelExpression<TargetType> | UnresolvablePathExpression {
	return pathInModel(path, modelName, visitedNavigationPaths, pathVisitor);
}

/**
 * Creates a binding expression that will be evaluated by the corresponding model.
 * @template TargetType
 * @param path The path on the model
 * @param [modelName] The name of the model
 * @param [visitedNavigationPaths] The paths from the root entitySet
 * @param [pathVisitor] A function to modify the resulting path
 * @returns An expression representating that path in the model
 */
export function pathInModel(
	path: undefined,
	modelName?: string,
	visitedNavigationPaths?: string[],
	pathVisitor?: Function
): UnresolvablePathExpression;
export function pathInModel<TargetType extends PrimitiveType>(
	path: string,
	modelName?: string,
	visitedNavigationPaths?: string[],
	pathVisitor?: undefined
): PathInModelExpression<TargetType>;
export function pathInModel<TargetType extends PrimitiveType>(
	path: string | undefined,
	modelName?: string,
	visitedNavigationPaths?: string[],
	pathVisitor?: Function
): UnresolvablePathExpression | PathInModelExpression<TargetType>;
export function pathInModel<TargetType extends PrimitiveType>(
	path: string | undefined,
	modelName?: string,
	visitedNavigationPaths: string[] = [],
	pathVisitor?: Function
): UnresolvablePathExpression | PathInModelExpression<TargetType> {
	if (path === undefined) {
		return unresolvableExpression;
	}
	let targetPath;
	if (pathVisitor) {
		targetPath = pathVisitor(path);
		if (targetPath === undefined) {
			return unresolvableExpression;
		}
	} else {
		const localPath = visitedNavigationPaths.concat();
		localPath.push(path);
		targetPath = localPath.join("/");
	}
	return {
		_type: "PathInModel",
		modelName: modelName,
		path: targetPath,
	};
}

type PlainExpressionObject = {
	[index: string]: BindingToolkitExpression<unknown>;
};

/**
 * Creates a constant expression based on a primitive value.
 * @template T
 * @param value The constant to wrap in an expression
 * @returns The constant expression
 */
export function constant<T extends PrimitiveType>(
	value: T
): ConstantExpression<T> {
	let constantValue: T;

	if (typeof value === "object" && value !== null && value !== undefined) {
		if (Array.isArray(value)) {
			constantValue = value.map(wrapPrimitive) as T;
		} else if (isPrimitiveObject(value)) {
			constantValue = value.valueOf() as T;
		} else {
			constantValue = Object.entries(value).reduce(
				(plainExpression, [key, val]) => {
					const wrappedValue = wrapPrimitive(val);
					if (
						wrappedValue._type !== "Constant" ||
						wrappedValue.value !== undefined
					) {
						plainExpression[key] = wrappedValue;
					}
					return plainExpression;
				},
				{} as PlainExpressionObject
			) as T;
		}
	} else {
		constantValue = value;
	}

	return { _type: "Constant", value: constantValue };
}

export function resolveBindingString<T extends PrimitiveType>(
	value: string | boolean | number,
	targetType?: string
):
	| ConstantExpression<T>
	| PathInModelExpression<T>
	| EmbeddedUI5BindingExpression<T>
	| EmbeddedUI5ExpressionBindingExpression<T> {
	if (
		value !== undefined &&
		typeof value === "string" &&
		value.startsWith("{")
	) {
		const pathInModelRegex = /^{(.*)>(.+)}$/; // Matches model paths like "model>path" or ">path" (default model)
		const pathInModelRegexMatch = pathInModelRegex.exec(value);

		if (value.startsWith("{=")) {
			// Expression binding, we can just remove the outer binding things
			return {
				_type: "EmbeddedExpressionBinding",
				value: value,
			};
		} else if (pathInModelRegexMatch) {
			return pathInModel(
				pathInModelRegexMatch[2] || "",
				pathInModelRegexMatch[1] || undefined
			);
		} else {
			return {
				_type: "EmbeddedBinding",
				value: value,
			};
		}
	} else if (
		targetType === "boolean" &&
		typeof value === "string" &&
		(value === "true" || value === "false")
	) {
		return constant(value === "true") as ConstantExpression<T>;
	} else if (
		targetType === "number" &&
		typeof value === "string" &&
		(!isNaN(Number(value)) || value === "NaN")
	) {
		return constant(Number(value)) as ConstantExpression<T>;
	} else {
		return constant(value) as ConstantExpression<T>;
	}
}

/**
 * A named reference.
 * @see fn
 * @param reference Reference
 * @returns The object reference binding part
 */
export function ref(reference: string | null): ReferenceExpression {
	return { _type: "Ref", ref: reference };
}

/**
 * Wrap a state object into a path in model expression.
 * @template T
 * @param stateObjectProp The object to evaluate, if it's a constant it will be wrapped in a constant expression, if it's a state property it will be bound
 * @param key The key of the state object to bind
 * @returns The correct binding toolkit expression
 */
export function bindState<T extends object, K extends PrimitiveType>(
	stateObjectProp: T,
	key: keyof T
): PathInModelExpression<K> | ConstantExpression<K> {
	if (
		typeof stateObjectProp === "object" &&
		(stateObjectProp as BindingInfoHolder<T>).__bindingInfo
	) {
		return pathInModel(
			"/" + key.toString(),
			(stateObjectProp as BindingInfoHolder<T>).__bindingInfo.model
		);
	} else {
		return constant(stateObjectProp) as unknown as ConstantExpression<K>;
	}
}
/**
 * Wrap a primitive into a constant expression if it is not already an expression.
 * @template T
 * @param something The object to wrap in a Constant expression
 * @returns Either the original object or the wrapped one depending on the case
 */
export function wrapPrimitive<T extends PrimitiveType>(
	something: ExpressionOrPrimitive<T>
): BindingToolkitExpression<T> {
	if (isBindingToolkitExpression(something)) {
		return something as BindingToolkitExpression<T>;
	}

	return constant(something);
}

/**
 * Checks if the expression or value provided is a binding tooling expression or not.
 *
 * Every object having a property named `_type` of some value is considered an expression, even if there is actually
 * no such expression type supported.
 * @param expression
 * @returns `true` if the expression is a binding toolkit expression
 */
export function isBindingToolkitExpression(
	expression: BindingToolkitExpression<unknown> | unknown
): expression is BindingToolkitExpression<unknown> {
	return (expression as BindingToolkitExpression<unknown>)?._type !== undefined;
}

/**
 * Checks if the expression or value provided is constant or not.
 * @template T The target type
 * @param  maybeConstant The expression or primitive value that is to be checked
 * @returns `true` if it is constant
 */
export function isConstant<T extends PrimitiveType>(
	maybeConstant: ExpressionOrPrimitive<T>
): maybeConstant is ConstantExpression<T> {
	return (
		typeof maybeConstant !== "object" ||
		(maybeConstant as BaseExpression<T>)._type === "Constant"
	);
}

function isTrue(expression: BindingToolkitExpression<PrimitiveType>): boolean {
	return isConstant(expression) && expression.value === true;
}

function isFalse(expression: BindingToolkitExpression<PrimitiveType>): boolean {
	return isConstant(expression) && expression.value === false;
}

/**
 * Checks if the expression or value provided is a path in model expression or not.
 * @template T The target type
 * @param  maybeBinding The expression or primitive value that is to be checked
 * @returns `true` if it is a path in model expression
 */
export function isPathInModelExpression<T extends PrimitiveType>(
	maybeBinding: ExpressionOrPrimitive<T>
): maybeBinding is PathInModelExpression<T> {
	return (maybeBinding as BaseExpression<T>)?._type === "PathInModel";
}

/**
 * Checks if the expression or value provided is a complex type expression.
 * @template T The target type
 * @param  maybeBinding The expression or primitive value that is to be checked
 * @returns `true` if it is a path in model expression
 */
export function isComplexTypeExpression<T extends PrimitiveType>(
	maybeBinding: ExpressionOrPrimitive<T>
): maybeBinding is ComplexTypeExpression<T> {
	return (maybeBinding as BaseExpression<T>)?._type === "ComplexType";
}

/**
 * Checks if the expression or value provided is a concat expression or not.
 * @param expression
 * @returns `true` if the expression is a ConcatExpression
 */
function isConcatExpression(
	expression: BindingToolkitExpression<PrimitiveType>
): expression is ConcatExpression {
	return (expression as BaseExpression<PrimitiveType>)?._type === "Concat";
}

/**
 * Checks if the expression or value provided is a IfElse expression or not.
 * @param expression
 * @returns `true` if the expression is a IfElseExpression
 */
function isIfElseExpression(
	expression: BindingToolkitExpression<PrimitiveType>
): expression is ConcatExpression {
	return (expression as BaseExpression<PrimitiveType>)?._type === "IfElse";
}

/**
 * Checks if the expression provided is a comparison or not.
 * @template T The target type
 * @param expression The expression
 * @returns `true` if the expression is a ComparisonExpression
 */
function isComparison<T extends PrimitiveType>(
	expression: BindingToolkitExpression<T>
): expression is ComparisonExpression {
	return expression._type === "Comparison";
}

/**
 * Checks whether the input parameter is a constant expression of type undefined.
 * @param expression The input expression or object in general
 * @returns `true` if the input is constant which has undefined for value
 */
export function isUndefinedExpression(
	expression: unknown
): expression is ConstantExpression<undefined> {
	const expressionAsExpression =
		expression as BindingToolkitExpression<unknown>;
	return (
		expressionAsExpression?._type === "Constant" &&
		expressionAsExpression?.value === undefined
	);
}

type ComplexAnnotationExpression<P> =
	| PathAnnotationExpression<P>
	| ApplyAnnotationExpression<P>
	| IfAnnotationExpression<P>
	| OrAnnotationExpression<P>
	| AndAnnotationExpression<P>
	| NeAnnotationExpression<P>
	| EqAnnotationExpression<P>
	| NotAnnotationExpression<P>
	| GtAnnotationExpression<P>
	| GeAnnotationExpression<P>
	| LeAnnotationExpression<P>
	| LtAnnotationExpression<P>
	| VocabConstantExpression<P>;

function isPrimitiveObject(objectType: object): boolean {
	switch (objectType.constructor.name) {
		case "String":
		case "Number":
		case "Boolean":
			return true;
		default:
			return false;
	}
}
/**
 * Check if the passed annotation annotationValue is a ComplexAnnotationExpression.
 * @template T The target type
 * @param  annotationValue The annotation annotationValue to evaluate
 * @returns `true` if the object is a {ComplexAnnotationExpression}
 */
function isComplexAnnotationExpression<T>(
	annotationValue: PropertyAnnotationValue<T>
): annotationValue is ComplexAnnotationExpression<T> {
	return (
		typeof annotationValue === "object" &&
		!isPrimitiveObject(annotationValue as object)
	);
}

/**
 * Generate the corresponding annotationValue for a given annotation annotationValue.
 * @template T The target type
 * @param annotationValue The source annotation annotationValue
 * @param visitedNavigationPaths The path from the root entity set
 * @param defaultValue Default value if the annotationValue is undefined
 * @param pathVisitor A function to modify the resulting path
 * @returns The annotationValue equivalent to that annotation annotationValue
 */
export function getExpressionFromAnnotation<T extends PrimitiveType>(
	annotationValue: PropertyAnnotationValue<T> | undefined,
	visitedNavigationPaths: string[] = [],
	defaultValue?: ExpressionOrPrimitive<T>,
	pathVisitor?: Function
): BindingToolkitExpression<PrimitiveTypeCast<T>> {
	if (annotationValue === undefined) {
		return wrapPrimitive(defaultValue as PrimitiveTypeCast<T>);
	}
	annotationValue = annotationValue?.valueOf() as PropertyAnnotationValue<T>;
	if (!isComplexAnnotationExpression(annotationValue)) {
		return constant(annotationValue);
	}

	switch (annotationValue.type) {
		case "Path":
			return pathInModel(
				annotationValue.path,
				undefined,
				visitedNavigationPaths,
				pathVisitor
			);
		case "If":
			return annotationIfExpression(
				annotationValue.$If,
				visitedNavigationPaths,
				pathVisitor
			) as BindingToolkitExpression<PrimitiveTypeCast<T>>;
		case "Not":
			return not(
				parseAnnotationCondition(
					annotationValue.$Not,
					visitedNavigationPaths,
					pathVisitor
				)
			) as BindingToolkitExpression<PrimitiveTypeCast<T>>;
		case "Eq":
			return equal(
				parseAnnotationCondition(
					annotationValue.$Eq[0],
					visitedNavigationPaths,
					pathVisitor
				),
				parseAnnotationCondition(
					annotationValue.$Eq[1],
					visitedNavigationPaths,
					pathVisitor
				)
			) as BindingToolkitExpression<PrimitiveTypeCast<T>>;
		case "Ne":
			return notEqual(
				parseAnnotationCondition(
					annotationValue.$Ne[0],
					visitedNavigationPaths,
					pathVisitor
				),
				parseAnnotationCondition(
					annotationValue.$Ne[1],
					visitedNavigationPaths,
					pathVisitor
				)
			) as BindingToolkitExpression<PrimitiveTypeCast<T>>;
		case "Gt":
			return greaterThan(
				parseAnnotationCondition(
					annotationValue.$Gt[0],
					visitedNavigationPaths,
					pathVisitor
				),
				parseAnnotationCondition(
					annotationValue.$Gt[1],
					visitedNavigationPaths,
					pathVisitor
				)
			) as BindingToolkitExpression<PrimitiveTypeCast<T>>;
		case "Ge":
			return greaterOrEqual(
				parseAnnotationCondition(
					annotationValue.$Ge[0],
					visitedNavigationPaths,
					pathVisitor
				),
				parseAnnotationCondition(
					annotationValue.$Ge[1],
					visitedNavigationPaths,
					pathVisitor
				)
			) as BindingToolkitExpression<PrimitiveTypeCast<T>>;
		case "Lt":
			return lessThan(
				parseAnnotationCondition(
					annotationValue.$Lt[0],
					visitedNavigationPaths,
					pathVisitor
				),
				parseAnnotationCondition(
					annotationValue.$Lt[1],
					visitedNavigationPaths,
					pathVisitor
				)
			) as BindingToolkitExpression<PrimitiveTypeCast<T>>;
		case "Le":
			return lessOrEqual(
				parseAnnotationCondition(
					annotationValue.$Le[0],
					visitedNavigationPaths,
					pathVisitor
				),
				parseAnnotationCondition(
					annotationValue.$Le[1],
					visitedNavigationPaths,
					pathVisitor
				)
			) as BindingToolkitExpression<PrimitiveTypeCast<T>>;
		case "Or":
			return or(
				...annotationValue.$Or.map(function (orCondition) {
					return parseAnnotationCondition<boolean>(
						orCondition,
						visitedNavigationPaths,
						pathVisitor
					);
				})
			) as BindingToolkitExpression<PrimitiveTypeCast<T>>;
		case "And":
			return and(
				...annotationValue.$And.map(function (andCondition) {
					return parseAnnotationCondition<boolean>(
						andCondition,
						visitedNavigationPaths,
						pathVisitor
					);
				})
			) as BindingToolkitExpression<PrimitiveTypeCast<T>>;
		case "Apply":
			return annotationApplyExpression(
				annotationValue as ApplyAnnotationExpression<string>,
				visitedNavigationPaths,
				pathVisitor
			) as BindingToolkitExpression<PrimitiveTypeCast<T>>;
		case "Constant":
			// Not a real case but the type system needs it
			return constant(annotationValue.value as PrimitiveTypeCast<T>);
	}
	return unresolvableExpression;
}

/**
 * Parse the annotation condition into an expression.
 * @template T The target type
 * @param annotationValue The condition or value from the annotation
 * @param visitedNavigationPaths The path from the root entity set
 * @param pathVisitor A function to modify the resulting path
 * @returns An equivalent expression
 */
function parseAnnotationCondition<T extends PrimitiveType>(
	annotationValue: ConditionalCheckOrValue,
	visitedNavigationPaths: string[] = [],
	pathVisitor?: Function
): BindingToolkitExpression<T> {
	if (annotationValue === null || typeof annotationValue !== "object") {
		return constant(annotationValue as T);
	} else if (annotationValue.hasOwnProperty("$Or")) {
		return or(
			...((annotationValue as OrConditionalExpression).$Or.map(function (
				orCondition
			) {
				return parseAnnotationCondition(
					orCondition,
					visitedNavigationPaths,
					pathVisitor
				);
			}) as unknown as BindingToolkitExpression<boolean>[])
		) as BindingToolkitExpression<T>;
	} else if (annotationValue.hasOwnProperty("$And")) {
		return and(
			...((annotationValue as AndConditionalExpression).$And.map(function (
				andCondition
			) {
				return parseAnnotationCondition(
					andCondition,
					visitedNavigationPaths,
					pathVisitor
				);
			}) as unknown as BindingToolkitExpression<boolean>[])
		) as BindingToolkitExpression<T>;
	} else if (annotationValue.hasOwnProperty("$Not")) {
		return not(
			parseAnnotationCondition(
				(annotationValue as NotConditionalExpression).$Not,
				visitedNavigationPaths,
				pathVisitor
			)
		) as BindingToolkitExpression<T>;
	} else if (annotationValue.hasOwnProperty("$Eq")) {
		return equal(
			parseAnnotationCondition(
				(annotationValue as EqConditionalExpression).$Eq[0],
				visitedNavigationPaths,
				pathVisitor
			),
			parseAnnotationCondition(
				(annotationValue as EqConditionalExpression).$Eq[1],
				visitedNavigationPaths,
				pathVisitor
			)
		) as BindingToolkitExpression<T>;
	} else if (annotationValue.hasOwnProperty("$Ne")) {
		return notEqual(
			parseAnnotationCondition(
				(annotationValue as NeConditionalExpression).$Ne[0],
				visitedNavigationPaths,
				pathVisitor
			),
			parseAnnotationCondition(
				(annotationValue as NeConditionalExpression).$Ne[1],
				visitedNavigationPaths,
				pathVisitor
			)
		) as BindingToolkitExpression<T>;
	} else if (annotationValue.hasOwnProperty("$Gt")) {
		return greaterThan(
			parseAnnotationCondition(
				(annotationValue as GtConditionalExpression).$Gt[0],
				visitedNavigationPaths,
				pathVisitor
			),
			parseAnnotationCondition(
				(annotationValue as GtConditionalExpression).$Gt[1],
				visitedNavigationPaths,
				pathVisitor
			)
		) as BindingToolkitExpression<T>;
	} else if (annotationValue.hasOwnProperty("$Ge")) {
		return greaterOrEqual(
			parseAnnotationCondition(
				(annotationValue as GeConditionalExpression).$Ge[0],
				visitedNavigationPaths,
				pathVisitor
			),
			parseAnnotationCondition(
				(annotationValue as GeConditionalExpression).$Ge[1],
				visitedNavigationPaths,
				pathVisitor
			)
		) as BindingToolkitExpression<T>;
	} else if (annotationValue.hasOwnProperty("$Lt")) {
		return lessThan(
			parseAnnotationCondition(
				(annotationValue as LtConditionalExpression).$Lt[0],
				visitedNavigationPaths,
				pathVisitor
			),
			parseAnnotationCondition(
				(annotationValue as LtConditionalExpression).$Lt[1],
				visitedNavigationPaths,
				pathVisitor
			)
		) as BindingToolkitExpression<T>;
	} else if (annotationValue.hasOwnProperty("$Le")) {
		return lessOrEqual(
			parseAnnotationCondition(
				(annotationValue as LeConditionalExpression).$Le[0],
				visitedNavigationPaths,
				pathVisitor
			),
			parseAnnotationCondition(
				(annotationValue as LeConditionalExpression).$Le[1],
				visitedNavigationPaths,
				pathVisitor
			)
		) as BindingToolkitExpression<T>;
	} else if (annotationValue.hasOwnProperty("$Path")) {
		return pathInModel(
			(annotationValue as PathConditionExpression<T>).$Path,
			undefined,
			visitedNavigationPaths,
			pathVisitor
		);
	} else if (annotationValue.hasOwnProperty("$Apply")) {
		return getExpressionFromAnnotation(
			{
				type: "Apply",
				$Function: (annotationValue as { $Function?: string }).$Function,
				$Apply: (annotationValue as { $Apply?: unknown }).$Apply,
			} as ApplyAnnotationExpression<T>,
			visitedNavigationPaths,
			undefined,
			pathVisitor
		) as BindingToolkitExpression<T>;
	} else if (annotationValue.hasOwnProperty("$If")) {
		return getExpressionFromAnnotation(
			{
				type: "If",
				$If: (annotationValue as { $If?: unknown }).$If,
			} as IfAnnotationExpression<T>,
			visitedNavigationPaths,
			undefined,
			pathVisitor
		) as BindingToolkitExpression<T>;
	} else if (annotationValue.hasOwnProperty("$EnumMember")) {
		return constant(
			resolveEnumValue(
				(annotationValue as { $EnumMember?: string }).$EnumMember
			) as T
		);
	}
	return constant(false as T);
}

/**
 * Process the {IfAnnotationExpressionValue} into an expression.
 * @template T The target type
 * @param annotationValue An If expression returning the type T
 * @param visitedNavigationPaths The path from the root entity set
 * @param pathVisitor A function to modify the resulting path
 * @returns The equivalent ifElse expression
 */
export function annotationIfExpression<T extends PrimitiveType>(
	annotationValue: IfAnnotationExpressionValue<T>,
	visitedNavigationPaths: string[] = [],
	pathVisitor?: Function
): BindingToolkitExpression<T> {
	return ifElse(
		parseAnnotationCondition(
			annotationValue[0],
			visitedNavigationPaths,
			pathVisitor
		),
		parseAnnotationCondition(
			annotationValue[1] as ConditionalCheckOrValue,
			visitedNavigationPaths,
			pathVisitor
		),
		parseAnnotationCondition(
			annotationValue[2] as ConditionalCheckOrValue,
			visitedNavigationPaths,
			pathVisitor
		)
	);
}
// This type is not recursively transformed from the metamodel content, as such we have some ugly things there
type SubApplyExpressionFromMetamodel = Record<string, unknown>;
function convertSubApplyParameters(
	applyParam: SubApplyExpressionFromMetamodel
): SubApplyExpressionFromMetamodel | PrimitiveType {
	let applyParamConverted = applyParam;
	if (applyParam.hasOwnProperty("$Path")) {
		applyParamConverted = {
			type: "Path",
			path: applyParam.$Path,
		} as PathAnnotationExpression<string>;
	} else if (applyParam.hasOwnProperty("$If")) {
		applyParamConverted = {
			type: "If",
			$If: applyParam.$If,
		} as IfAnnotationExpression<string>;
	} else if (applyParam.hasOwnProperty("$Apply")) {
		applyParamConverted = {
			type: "Apply",
			$Function: applyParam.$Function,
			$Apply: applyParam.$Apply,
		} as ApplyAnnotationExpression<string>;
	}
	return applyParamConverted;
}

type ODataFunction =
	| "odata.concat"
	| "odata.fillUriTemplate"
	| "odata.uriEncode";
export function annotationApplyExpression(
	applyExpression: ApplyAnnotationExpression<string>,
	visitedNavigationPaths: string[] = [],
	pathVisitor?: Function
): BindingToolkitExpression<string> {
	switch (applyExpression.$Function as ODataFunction) {
		case "odata.concat":
			return concat(
				...applyExpression.$Apply.map((applyParam) => {
					return getExpressionFromAnnotation(
						convertSubApplyParameters(
							applyParam
						) as PropertyAnnotationValue<string>,
						visitedNavigationPaths,
						undefined,
						pathVisitor
					);
				})
			);
		case "odata.uriEncode":
			const parameter = getExpressionFromAnnotation(
				convertSubApplyParameters(
					applyExpression
						.$Apply[0] as unknown as SubApplyExpressionFromMetamodel
				) as PropertyAnnotationValue<string>,
				visitedNavigationPaths,
				undefined,
				pathVisitor
			);
			// The second parameter for uriEncode is always a string since the target evaluation is against a formatValue call in ODataUtils which expect the target type as second parameter
			return fn("odata.uriEncode", [parameter, "Edm.String"], undefined, true);
		case "odata.fillUriTemplate":
			const template = applyExpression.$Apply[0];
			const templateParams = applyExpression.$Apply.slice(
				1
			) as unknown as SubApplyExpressionFromMetamodel[];
			const targetObject: Record<
				string,
				BindingToolkitExpression<unknown>
			> = {};
			templateParams.forEach((applyParam) => {
				targetObject[applyParam.$Name as string] = getExpressionFromAnnotation(
					convertSubApplyParameters(
						applyParam.$LabeledElement as SubApplyExpressionFromMetamodel
					) as PropertyAnnotationValue<string>,
					visitedNavigationPaths,
					undefined,
					pathVisitor
				);
			});
			return fn(
				"odata.fillUriTemplate",
				[template, targetObject],
				undefined,
				true
			);
	}
	return unresolvableExpression;
}

/**
 * Generic helper for the comparison operations (equal, notEqual, ...).
 * @template T The target type
 * @param operator The operator to apply
 * @param leftOperand The operand on the left side of the operator
 * @param rightOperand The operand on the right side of the operator
 * @returns An expression representing the comparison
 */
function comparison<T extends PrimitiveType>(
	operator: ComparisonOperator,
	leftOperand: ExpressionOrPrimitive<T>,
	rightOperand: ExpressionOrPrimitive<T>
): BindingToolkitExpression<boolean> {
	const leftExpression = wrapPrimitive(leftOperand);
	const rightExpression = wrapPrimitive(rightOperand);
	if (hasUnresolvableExpression(leftExpression, rightExpression)) {
		return unresolvableExpression;
	}
	if (isConstant(leftExpression) && isConstant(rightExpression)) {
		switch (operator) {
			case "!==":
				return constant(leftExpression.value !== rightExpression.value);
			case "===":
				return constant(leftExpression.value === rightExpression.value);
			case "<":
				if (
					leftExpression.value === null ||
					leftExpression.value === undefined ||
					rightExpression.value === null ||
					rightExpression.value === undefined
				) {
					return constant(false);
				}
				return constant(leftExpression.value < rightExpression.value);
			case "<=":
				if (
					leftExpression.value === null ||
					leftExpression.value === undefined ||
					rightExpression.value === null ||
					rightExpression.value === undefined
				) {
					return constant(false);
				}
				return constant(leftExpression.value <= rightExpression.value);
			case ">":
				if (
					leftExpression.value === null ||
					leftExpression.value === undefined ||
					rightExpression.value === null ||
					rightExpression.value === undefined
				) {
					return constant(false);
				}
				return constant(leftExpression.value > rightExpression.value);
			case ">=":
				if (
					leftExpression.value === null ||
					leftExpression.value === undefined ||
					rightExpression.value === null ||
					rightExpression.value === undefined
				) {
					return constant(false);
				}
				return constant(leftExpression.value >= rightExpression.value);
		}
	} else {
		return {
			_type: "Comparison",
			operator: operator,
			operand1: leftExpression,
			operand2: rightExpression,
		};
	}
}

/**
 * Generic helper for the length of an expression.
 * @param expression The input expression pointing to an array
 * @param checkUndefined Is the array potentially undefined
 * @returns An expression representing the length
 */
export function length(
	expression: PathInModelExpression<unknown> | UnresolvablePathExpression,
	checkUndefined = false
): BindingToolkitExpression<number> {
	if (expression._type === "Unresolvable") {
		return expression;
	}
	if (!checkUndefined) {
		return {
			_type: "Length",
			pathInModel: expression,
		};
	}
	return ifElse(equal(expression, undefined), -1, length(expression));
}

/**
 * Comparison: "equal" (===).
 * @template T The target type
 * @param leftOperand The operand on the left side
 * @param rightOperand The operand on the right side of the comparison
 * @returns An expression representing the comparison
 */
export function equal<T extends PrimitiveType>(
	leftOperand: ExpressionOrPrimitive<T>,
	rightOperand: ExpressionOrPrimitive<T>
): BindingToolkitExpression<boolean> {
	const leftExpression = wrapPrimitive(leftOperand);
	const rightExpression = wrapPrimitive(rightOperand);
	if (hasUnresolvableExpression(leftExpression, rightExpression)) {
		return unresolvableExpression;
	}
	if (_checkExpressionsAreEqual(leftExpression, rightExpression)) {
		return constant(true);
	}

	function reduce(
		left: BindingToolkitExpression<T>,
		right: BindingToolkitExpression<T>
	): BindingToolkitExpression<boolean> | undefined {
		if (left._type === "Comparison" && isTrue(right)) {
			// compare(a, b) === true ~~> compare(a, b)
			return left;
		} else if (left._type === "Comparison" && isFalse(right)) {
			// compare(a, b) === false ~~> !compare(a, b)
			return not(left);
		} else if (
			left._type === "IfElse" &&
			_checkExpressionsAreEqual(left.onTrue, right)
		) {
			// (if (x) { a } else { b }) === a ~~> x || (b === a)
			return or(left.condition, equal(left.onFalse, right));
		} else if (
			left._type === "IfElse" &&
			_checkExpressionsAreEqual(left.onFalse, right)
		) {
			// (if (x) { a } else { b }) === b ~~> !x || (a === b)
			return or(not(left.condition), equal(left.onTrue, right));
		} else if (
			left._type === "IfElse" &&
			isConstant(left.onTrue) &&
			isConstant(left.onFalse) &&
			isConstant(right) &&
			!_checkExpressionsAreEqual(left.onTrue, right) &&
			!_checkExpressionsAreEqual(left.onFalse, right)
		) {
			return constant(false);
		}
		return undefined;
	}

	// exploit symmetry: a === b <~> b === a
	const reduced =
		reduce(leftExpression, rightExpression) ??
		reduce(rightExpression, leftExpression);
	return reduced ?? comparison("===", leftExpression, rightExpression);
}

/**
 * Comparison: "not equal" (!==).
 * @template T The target type
 * @param leftOperand The operand on the left side
 * @param rightOperand The operand on the right side of the comparison
 * @returns An expression representing the comparison
 */
export function notEqual<T extends PrimitiveType>(
	leftOperand: ExpressionOrPrimitive<T>,
	rightOperand: ExpressionOrPrimitive<T>
): BindingToolkitExpression<boolean> {
	return not(equal(leftOperand, rightOperand));
}

/**
 * Comparison: "greater or equal" (>=).
 * @template T The target type
 * @param leftOperand The operand on the left side
 * @param rightOperand The operand on the right side of the comparison
 * @returns An expression representing the comparison
 */
export function greaterOrEqual<T extends DefinedPrimitiveType>(
	leftOperand: ExpressionOrPrimitive<T>,
	rightOperand: ExpressionOrPrimitive<T>
): BindingToolkitExpression<boolean> {
	return comparison(">=", leftOperand, rightOperand);
}

/**
 * Comparison: "greater than" (>).
 * @template T The target type
 * @param leftOperand The operand on the left side
 * @param rightOperand The operand on the right side of the comparison
 * @returns An expression representing the comparison
 */
export function greaterThan<T extends DefinedPrimitiveType>(
	leftOperand: ExpressionOrPrimitive<T>,
	rightOperand: ExpressionOrPrimitive<T>
): BindingToolkitExpression<boolean> {
	return comparison(">", leftOperand, rightOperand);
}

/**
 * Comparison: "less or equal" (<=).
 * @template T The target type
 * @param leftOperand The operand on the left side
 * @param rightOperand The operand on the right side of the comparison
 * @returns An expression representing the comparison
 */
export function lessOrEqual<T extends DefinedPrimitiveType>(
	leftOperand: ExpressionOrPrimitive<T>,
	rightOperand: ExpressionOrPrimitive<T>
): BindingToolkitExpression<boolean> {
	return comparison("<=", leftOperand, rightOperand);
}

/**
 * Comparison: "less than" (<).
 * @template T The target type
 * @param leftOperand The operand on the left side
 * @param rightOperand The operand on the right side of the comparison
 * @returns An expression representing the comparison
 */
export function lessThan<T extends DefinedPrimitiveType>(
	leftOperand: ExpressionOrPrimitive<T>,
	rightOperand: ExpressionOrPrimitive<T>
): BindingToolkitExpression<boolean> {
	return comparison("<", leftOperand, rightOperand);
}

/**
 * If-then-else expression.
 *
 * Evaluates to onTrue if the condition evaluates to true, else evaluates to onFalse.
 * @template T The target type
 * @param condition The condition to evaluate
 * @param onTrue Expression result if the condition evaluates to true
 * @param onFalse Expression result if the condition evaluates to false
 * @returns The expression that represents this conditional check
 */
export function ifElse<T extends PrimitiveType>(
	condition: ExpressionOrPrimitive<boolean>,
	onTrue: ExpressionOrPrimitive<T>,
	onFalse: ExpressionOrPrimitive<T>
): BindingToolkitExpression<T> {
	let conditionExpression = wrapPrimitive(condition);
	let onTrueExpression = wrapPrimitive(onTrue);
	let onFalseExpression = wrapPrimitive(onFalse);

	// swap branches if the condition is a negation
	if (conditionExpression._type === "Not") {
		// ifElse(not(X), a, b) --> ifElse(X, b, a)
		[onTrueExpression, onFalseExpression] = [
			onFalseExpression,
			onTrueExpression,
		];
		conditionExpression = not(conditionExpression);
	}

	// inline nested if-else expressions: onTrue branch
	// ifElse(X, ifElse(X, a, b), c) ==> ifElse(X, a, c)
	if (
		onTrueExpression._type === "IfElse" &&
		_checkExpressionsAreEqual(conditionExpression, onTrueExpression.condition)
	) {
		onTrueExpression = onTrueExpression.onTrue;
	}

	// inline nested if-else expressions: onFalse branch
	// ifElse(X, a, ifElse(X, b, c)) ==> ifElse(X, a, c)
	if (
		onFalseExpression._type === "IfElse" &&
		_checkExpressionsAreEqual(conditionExpression, onFalseExpression.condition)
	) {
		onFalseExpression = onFalseExpression.onFalse;
	}

	// (if true then a else b)  ~~> a
	// (if false then a else b) ~~> b
	if (isConstant(conditionExpression)) {
		return conditionExpression.value ? onTrueExpression : onFalseExpression;
	}

	// if (isConstantBoolean(onTrueExpression) || isConstantBoolean(onFalseExpression)) {
	// 	return or(and(condition, onTrueExpression as Expression<boolean>), and(not(condition), onFalseExpression as Expression<boolean>)) as Expression<T>
	// }

	// (if X then a else a) ~~> a
	if (_checkExpressionsAreEqual(onTrueExpression, onFalseExpression)) {
		return onTrueExpression;
	}

	// if X then a else false ~~> X && a
	if (isFalse(onFalseExpression)) {
		return and(
			conditionExpression,
			onTrueExpression as BindingToolkitExpression<boolean>
		) as BindingToolkitExpression<T>;
	}

	// if X then a else true ~~> !X || a
	if (isTrue(onFalseExpression)) {
		return or(
			not(conditionExpression),
			onTrueExpression as BindingToolkitExpression<boolean>
		) as BindingToolkitExpression<T>;
	}

	// if X then false else a ~~> !X && a
	if (isFalse(onTrueExpression)) {
		return and(
			not(conditionExpression),
			onFalseExpression as BindingToolkitExpression<boolean>
		) as BindingToolkitExpression<T>;
	}

	// if X then true else a ~~> X || a
	if (isTrue(onTrueExpression)) {
		return or(
			conditionExpression,
			onFalseExpression as BindingToolkitExpression<boolean>
		) as BindingToolkitExpression<T>;
	}
	if (
		hasUnresolvableExpression(
			conditionExpression,
			onTrueExpression,
			onFalseExpression
		)
	) {
		return unresolvableExpression;
	}
	if (
		isComplexTypeExpression(condition) ||
		isComplexTypeExpression(onTrue) ||
		isComplexTypeExpression(onFalse)
	) {
		let pathIdx = 0;
		const myIfElseExpression = formatResult(
			[condition, onTrue, onFalse],
			"sap.fe.core.formatters.StandardFormatter#ifElse"
		);
		const allParts = [];
		transformRecursively(
			myIfElseExpression,
			"PathInModel",
			(constantPath: PathInModelExpression<unknown>) => {
				allParts.push(constantPath);
				return pathInModel(`$${pathIdx++}`, "$");
			},
			true
		);
		allParts.unshift(constant(JSON.stringify(myIfElseExpression)));
		return formatResult(
			allParts,
			"sap.fe.core.formatters.StandardFormatter#evaluateComplexExpression",
			undefined,
			true
		);
	}
	return {
		_type: "IfElse",
		condition: conditionExpression,
		onTrue: onTrueExpression,
		onFalse: onFalseExpression,
	};
}

/**
 * Checks whether the current expression has a reference to the default model (undefined).
 * @param expression The expression to evaluate
 * @returns `true` if there is a reference to the default context
 */
function hasReferenceToDefaultContext(
	expression: BindingToolkitExpression<unknown>
): boolean {
	switch (expression._type) {
		case "Constant":
		case "Formatter":
		case "ComplexType":
			return false;
		case "Set":
			return expression.operands.some(hasReferenceToDefaultContext);
		case "PathInModel":
			return expression.modelName === undefined;
		case "Comparison":
			return (
				hasReferenceToDefaultContext(expression.operand1) ||
				hasReferenceToDefaultContext(expression.operand2)
			);
		case "IfElse":
			return (
				hasReferenceToDefaultContext(expression.condition) ||
				hasReferenceToDefaultContext(expression.onTrue) ||
				hasReferenceToDefaultContext(expression.onFalse)
			);
		case "Not":
		case "Truthy":
			return hasReferenceToDefaultContext(expression.operand);
		default:
			return false;
	}
}

// This is one case where any does make sense...
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Fn<T> = ((...params: any) => T | Promise<T>) & {
	__functionName: string;
};

/**
 * @typedef WrappedTuple
 */
type WrappedTuple<T> = {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	[K in keyof T]: WrappedTuple<T[K]> | ExpressionOrPrimitive<T[K]> | undefined;
};

// So, this works but I cannot get it to compile :D, but it still does what is expected...

/**
 * A function reference or a function name.
 */
type FunctionOrName<T> = Fn<T> | string;

/**
 * Function parameters, either derived from the function or an untyped array.
 */
type FunctionParameters<T, F extends FunctionOrName<T>> = F extends Fn<T>
	? Parameters<F>
	: unknown[];

/**
 * Calls a formatter function to process the parameters.
 * If requireContext is set to true and no context is passed a default context will be added automatically.
 * @template T
 * @template U
 * @param parameters The list of parameter that should match the type and number of the formatter function
 * @param formatterFunction The function to call
 * @param [contextEntityType] If no parameter refers to the context then we use this information to add a reference to the keys from the entity type.
 * @param [ignoreComplexType] Whether to ignore the transgformation to the StandardFormatter or not
 * @returns The corresponding expression
 */
export function formatResult<T, U extends Fn<T>>(
	parameters: WrappedTuple<Parameters<U>>,
	formatterFunction: U | string,
	contextEntityType?: EntityType,
	ignoreComplexType = false
): BindingToolkitExpression<T> {
	const parameterExpressions = (
		parameters as ExpressionOrPrimitive<PrimitiveType>[]
	).map(wrapPrimitive);

	if (hasUnresolvableExpression(...parameterExpressions)) {
		return unresolvableExpression;
	}
	if (contextEntityType) {
		// Otherwise, if the context is required and no context is provided make sure to add the default binding
		if (!parameterExpressions.some(hasReferenceToDefaultContext)) {
			contextEntityType.keys.forEach((key) =>
				parameterExpressions.push(pathInModel(key.name, ""))
			);
		}
	}
	let functionName = "";
	if (typeof formatterFunction === "string") {
		functionName = formatterFunction;
	} else {
		functionName = formatterFunction.__functionName;
	}
	// FormatterName can be of format sap.fe.core.xxx#methodName to have multiple formatter in one class
	const [formatterClass, formatterName] = functionName.split("#");

	// In some case we also cannot call directly a function because of too complex input, in that case we need to convert to a simpler function call
	if (
		!ignoreComplexType &&
		(parameterExpressions.some(isComplexTypeExpression) ||
			parameterExpressions.some(isConcatExpression) ||
			parameterExpressions.some(isIfElseExpression))
	) {
		let pathIdx = 0;
		const myFormatExpression = formatResult(
			parameterExpressions,
			functionName,
			undefined,
			true
		);
		const allParts = [];
		transformRecursively(
			myFormatExpression,
			"PathInModel",
			(constantPath: PathInModelExpression<unknown>) => {
				allParts.push(constantPath);
				return pathInModel(`$${pathIdx++}`, "$");
			},
			true
		);
		allParts.unshift(constant(JSON.stringify(myFormatExpression)));
		return formatResult(
			allParts,
			"sap.fe.core.formatters.StandardFormatter#evaluateComplexExpression",
			undefined,
			true
		);
	} else if (!!formatterName && formatterName.length > 0) {
		parameterExpressions.unshift(constant(formatterName));
	}

	return {
		_type: "Formatter",
		fn: formatterClass,
		parameters: parameterExpressions,
	};
}

type BindingConstraints = {
	scale?: number;
	precision?: number;
	maxLength?: number;
	nullable?: boolean;
	minimum?: string;
	maximum?: string;
	isDigitSequence?: boolean;
	V4?: boolean;
};
export function setUpConstraints(
	targetMapping: TypeMappingDefinition,
	property: Property | ActionParameter
): BindingConstraints {
	const constraints: BindingConstraints = {};
	if (targetMapping?.constraints?.$Scale && property.scale !== undefined) {
		constraints.scale = property.scale;
	}
	if (
		targetMapping?.constraints?.$Precision &&
		property.precision !== undefined
	) {
		constraints.precision = property.precision;
	}
	if (
		targetMapping?.constraints?.$MaxLength &&
		property.maxLength !== undefined
	) {
		constraints.maxLength = property.maxLength;
	}
	if (property.nullable === false) {
		constraints.nullable = false;
	}
	if (
		targetMapping?.constraints?.["@Org.OData.Validation.V1.Minimum/$Decimal"] &&
		!isNaN(property.annotations?.Validation?.Minimum)
	) {
		constraints.minimum = `${property.annotations?.Validation?.Minimum}`;
	}
	if (
		targetMapping?.constraints?.["@Org.OData.Validation.V1.Maximum/$Decimal"] &&
		!isNaN(property.annotations?.Validation?.Maximum)
	) {
		constraints.maximum = `${property.annotations?.Validation?.Maximum}`;
	}
	if (
		property.annotations?.Common?.IsDigitSequence &&
		targetMapping.type === "sap.ui.model.odata.type.String" &&
		targetMapping?.constraints?.[
			"@com.sap.vocabularies.Common.v1.IsDigitSequence"
		]
	) {
		constraints.isDigitSequence = true;
	}
	if (targetMapping?.constraints?.$V4) {
		constraints.V4 = true;
	}
	return constraints;
}

/**
 * Generates the binding expression for the property, and sets up the formatOptions and constraints.
 * @param property The Property for which we are setting up the binding
 * @param propertyBindingExpression The BindingExpression of the property above. Serves as the basis to which information can be added
 * @param ignoreConstraints Ignore constraints of the property
 * @returns The binding expression for the property with formatOptions and constraints
 */
export function formatWithTypeInformation<T>(
	property: Property | ActionParameter,
	propertyBindingExpression: BindingToolkitExpression<string>,
	ignoreConstraints = false
): PathInModelExpression<T> {
	const outExpression: PathInModelExpression<unknown> =
		propertyBindingExpression as PathInModelExpression<unknown>;
	if (property._type !== "Property" && property._type !== "ActionParameter") {
		return outExpression;
	}
	const targetMapping = EDM_TYPE_MAPPING[property.type];
	if (!targetMapping) {
		return outExpression;
	}
	if (!outExpression.formatOptions) {
		outExpression.formatOptions = {};
	}
	outExpression.constraints = {};

	outExpression.type = targetMapping.type;
	if (!ignoreConstraints) {
		outExpression.constraints = setUpConstraints(targetMapping, property);
	}

	if (
		(outExpression?.type?.indexOf("sap.ui.model.odata.type.Int") === 0 &&
			outExpression?.type !== "sap.ui.model.odata.type.Int64") ||
		outExpression?.type === "sap.ui.model.odata.type.Double"
	) {
		outExpression.formatOptions = Object.assign(outExpression.formatOptions, {
			parseAsString: false,
		});
	}
	if (
		outExpression.type === "sap.ui.model.odata.type.String" &&
		isProperty(property)
	) {
		if (
			outExpression.constraints?.isDigitSequence ||
			(outExpression.constraints?.nullable !== false &&
				property.nullable === true)
		) {
			outExpression.formatOptions.parseKeepsEmptyString = false;
		} else {
			outExpression.formatOptions.parseKeepsEmptyString = true;
		}
		const fiscalType = getFiscalType(property);
		if (fiscalType) {
			outExpression.formatOptions.fiscalType = fiscalType;
			outExpression.type = "sap.fe.core.type.FiscalDate";
		}
	}
	const typesSupportingParseEmptyValueToZero = [
		"sap.ui.model.odata.type.Int16",
		"sap.ui.model.odata.type.Int32",
		"sap.ui.model.odata.type.Int64",
		"sap.ui.model.odata.type.Single",
		"sap.ui.model.odata.type.Double",
		"sap.ui.model.odata.type.Decimal",
		"sap.ui.model.odata.type.Byte",
		"sap.ui.model.odata.type.SByte",
	];
	if (
		outExpression.constraints?.nullable === false &&
		outExpression.type &&
		typesSupportingParseEmptyValueToZero.includes(outExpression.type)
	) {
		outExpression.formatOptions = Object.assign(outExpression.formatOptions, {
			parseEmptyValueToZero: true,
		});
	}
	if (
		outExpression.constraints?.nullable !== false &&
		(outExpression.type === "sap.ui.model.odata.type.Int64" ||
			outExpression.type === "sap.ui.model.odata.type.Decimal")
	) {
		outExpression.formatOptions = Object.assign(outExpression.formatOptions, {
			emptyString: "",
		});
	}

	return outExpression;
}

export const getFiscalType = function (property: Property): string | undefined {
	return;
	// if (property.annotations?.Common?.IsFiscalYear) {
	// 	return CommonAnnotationTerms.IsFiscalYear;
	// }
	// if (property.annotations?.Common?.IsFiscalPeriod) {
	// 	return CommonAnnotationTerms.IsFiscalPeriod;
	// }
	// if (property.annotations?.Common?.IsFiscalYearPeriod) {
	// 	return CommonAnnotationTerms.IsFiscalYearPeriod;
	// }
	// if (property.annotations?.Common?.IsFiscalQuarter) {
	// 	return CommonAnnotationTerms.IsFiscalQuarter;
	// }
	// if (property.annotations?.Common?.IsFiscalYearQuarter) {
	// 	return CommonAnnotationTerms.IsFiscalYearQuarter;
	// }
	// if (property.annotations?.Common?.IsFiscalWeek) {
	// 	return CommonAnnotationTerms.IsFiscalWeek;
	// }
	// if (property.annotations?.Common?.IsFiscalYearWeek) {
	// 	return CommonAnnotationTerms.IsFiscalYearWeek;
	// }
	// if (property.annotations?.Common?.IsDayOfFiscalYear) {
	// 	return CommonAnnotationTerms.IsDayOfFiscalYear;
	// }
};

/**
 * Calls a complex type to process the parameters.
 * If requireContext is set to true and no context is passed, a default context will be added automatically.
 * @template T
 * @template U
 * @param parameters The list of parameters that should match the type for the complex type=
 * @param type The complex type to use
 * @param [contextEntityType] The context entity type to consider
 * @param oFormatOptions
 * @param oConstraintOptions
 * @returns The corresponding expression
 */
export function addTypeInformation<T, U extends Fn<T>>(
	parameters: WrappedTuple<Parameters<U>>,
	type: string,
	contextEntityType?: EntityType,
	oFormatOptions?: ComplexTypeFormatOptions,
	oConstraintOptions?: ComplexTypeConstraintOptions
):
	| UnresolvablePathExpression
	| ComplexTypeExpression<T>
	| ConstantExpression<T> {
	const parameterExpressions = (
		parameters as ExpressionOrPrimitive<PrimitiveType>[]
	).map(wrapPrimitive);
	if (hasUnresolvableExpression(...parameterExpressions)) {
		return unresolvableExpression;
	}
	// If there is only one parameter and it is a constant and we don't expect the context then return the constant
	if (
		parameterExpressions.length === 1 &&
		isConstant(parameterExpressions[0]) &&
		!contextEntityType
	) {
		return parameterExpressions[0] as ConstantExpression<T>;
	} else if (contextEntityType) {
		// Otherwise, if the context is required and no context is provided make sure to add the default binding
		if (!parameterExpressions.some(hasReferenceToDefaultContext)) {
			contextEntityType.keys.forEach((key) =>
				parameterExpressions.push(pathInModel(key.name, ""))
			);
		}
	}
	oFormatOptions = _getComplexTypeFormatOptionsFromFirstParam(
		parameters[0],
		oFormatOptions
	);

	if (type === "sap.ui.model.odata.type.Unit") {
		const uomPath = pathInModel("/##@@requestUnitsOfMeasure");
		uomPath.targetType = "any";
		uomPath.mode = "OneTime";
		oFormatOptions ??= {};
		oFormatOptions.preserveDecimals =
			oConstraintOptions?.skipDecimalsValidation ?? false;
		parameterExpressions.push(uomPath);
	} else if (type === "sap.ui.model.odata.type.Currency") {
		const currencyPath = pathInModel("/##@@requestCurrencyCodes");
		currencyPath.targetType = "any";
		currencyPath.mode = "OneTime";
		oFormatOptions ??= {};
		oFormatOptions.preserveDecimals = false; // default value since we don't have a CLDR
		parameterExpressions.push(currencyPath);
	}

	return {
		_type: "ComplexType",
		type: type,
		formatOptions: oFormatOptions || {},
		constraints: oConstraintOptions || {},
		parameters: {},
		bindingParameters: parameterExpressions,
	};
}

type ComplexTypeFormatOptions = {
	showNumber?: boolean;
	showMeasure?: boolean;
	parseAsString?: boolean;
	parseKeepsEmptyString?: boolean;
	emptyString?: string | number | null;
	showTime?: boolean;
	showDate?: boolean;
	showTimezone?: boolean;
	preserveDecimals?: boolean;
	decimalPadding?: number;
};

export type ComplexTypeConstraintOptions = {
	skipDecimalsValidation?: boolean;
};

/**
 * Process the formatOptions for a complexType based on the first parameter.
 * @param param The first parameter of the complex type
 * @param formatOptions Initial formatOptions
 * @returns The modified formatOptions
 */
function _getComplexTypeFormatOptionsFromFirstParam<T, U extends Fn<T>>(
	param: Parameters<U>,
	formatOptions: undefined | ComplexTypeFormatOptions
): ComplexTypeFormatOptions | undefined {
	// if showMeasure is set to false we want to not parse as string to see the 0
	// we do that also for all bindings because otherwise the mdc Field isn't editable
	if (
		!(formatOptions && formatOptions.showNumber === false) &&
		((<any>param)?.type?.indexOf("sap.ui.model.odata.type.Int") === 0 ||
			(<any>param)?.type === "sap.ui.model.odata.type.Decimal" ||
			(<any>param)?.type === "sap.ui.model.odata.type.Double")
	) {
		if (
			(<any>param)?.type === "sap.ui.model.odata.type.Int64" ||
			(<any>param)?.type === "sap.ui.model.odata.type.Decimal"
		) {
			//sap.ui.model.odata.type.Int64 do not support parseAsString false
			formatOptions =
				formatOptions?.showMeasure === false
					? {
							showMeasure: false,
							decimalPadding: formatOptions.decimalPadding,
							emptyString: formatOptions?.emptyString,
					  }
					: {
							decimalPadding: formatOptions?.decimalPadding,
							emptyString: formatOptions?.emptyString,
					  };
		} else {
			formatOptions =
				formatOptions?.showMeasure === false
					? {
							parseAsString: false,
							showMeasure: false,
							decimalPadding: formatOptions.decimalPadding,
							emptyString: formatOptions?.emptyString,
					  }
					: {
							parseAsString: false,
							decimalPadding: formatOptions?.decimalPadding,
							emptyString: formatOptions?.emptyString,
					  };
		}
		if ((<any>param)?.constraints?.nullable !== false) {
			formatOptions.emptyString = null;
		} else {
			formatOptions.emptyString ??= 0;
		}
	}
	return formatOptions;
}
/**
 * Function call, optionally with arguments.
 * @param func Function name or reference to function
 * @param parameters Arguments
 * @param on Object to call the function on
 * @param isFormattingFn
 * @returns Expression representing the function call (not the result of the function call!)
 */
export function fn<T, U extends FunctionOrName<T>>(
	func: U,
	parameters: WrappedTuple<FunctionParameters<T, U>>,
	on?: ExpressionOrPrimitive<object>,
	isFormattingFn = false
): FunctionExpression<T> {
	const functionName = typeof func === "string" ? func : func.__functionName;
	return {
		_type: "Function",
		obj: on !== undefined ? wrapPrimitive(on) : undefined,
		fn: functionName,
		isFormattingFn: isFormattingFn,
		parameters: (parameters as ExpressionOrPrimitive<PrimitiveType>[]).map(
			wrapPrimitive
		),
	};
}

/**
 * Shortcut function to determine if a binding value is null, undefined or empty.
 * @param expression
 * @returns A Boolean expression evaluating the fact that the current element is empty
 */
export function isEmpty(
	expression: BindingToolkitExpression<string>
): BindingToolkitExpression<boolean> {
	const aBindings: ExpressionOrPrimitive<boolean>[] = [];
	transformRecursively(expression, "PathInModel", (expr) => {
		const finalExpression = {
			...expr,
			alwaysKeepTargetType: true,
		} as PathInModelExpression<string>;
		aBindings.push(
			or(equal(finalExpression, ""), equal(expr, undefined), equal(expr, null))
		);
		return expr;
	});
	return and(...aBindings);
}

export function concat(
	...inExpressions: ExpressionOrPrimitive<string>[]
): BindingToolkitExpression<string> {
	const expressions = inExpressions.map(wrapPrimitive);
	if (hasUnresolvableExpression(...expressions)) {
		return unresolvableExpression;
	}
	if (expressions.every(isConstant)) {
		return constant(
			expressions.reduce((concatenated: string, value) => {
				if (value.value !== undefined && value.value !== null) {
					return concatenated + value.value.toString();
				}
				return concatenated;
			}, "")
		);
	} else if (expressions.some(isComplexTypeExpression)) {
		let pathIdx = 0;
		const myConcatExpression = formatResult(
			expressions,
			"sap.fe.core.formatters.StandardFormatter#concat",
			undefined,
			true
		);
		const allParts = [];
		transformRecursively(
			myConcatExpression,
			"PathInModel",
			(constantPath: PathInModelExpression<unknown>) => {
				allParts.push(constantPath);
				return pathInModel(`$${pathIdx++}`, "$");
			}
		);
		allParts.unshift(constant(JSON.stringify(myConcatExpression)));
		return formatResult(
			allParts,
			"sap.fe.core.formatters.StandardFormatter#evaluateComplexExpression",
			undefined,
			true
		);
	}
	return {
		_type: "Concat",
		expressions: expressions,
	};
}

type ExpressionTypeToExpression<
	T extends ExpressionType,
	V
> = T extends "Constant"
	? ConstantExpression<V>
	: T extends "PathInModel"
	? PathInModelExpression<V>
	: T extends "Function"
	? FunctionExpression<V>
	: T extends "Unresolvable"
	? UnresolvablePathExpression
	: BindingToolkitExpression<V>;

export type TransformFunction<T, V> = (
	expressionPart: T
) => BindingToolkitExpression<V>;
export type ExpressionType = Pick<
	BindingToolkitExpression<unknown>,
	"_type"
>["_type"];
export function transformRecursively<
	T extends PrimitiveType | unknown,
	ET extends ExpressionType
>(
	inExpression: BindingToolkitExpression<T>,
	expressionType: ET,
	transformFunction: TransformFunction<ExpressionTypeToExpression<ET, T>, T>,
	includeAllExpression = false
): BindingToolkitExpression<T> {
	let expression: BindingToolkitExpression<T> = inExpression;
	switch (expression._type) {
		case "Function":
		case "Formatter":
			expression.parameters = expression.parameters.map((parameter) =>
				transformRecursively(
					parameter as BindingToolkitExpression<T>,
					expressionType,
					transformFunction,
					includeAllExpression
				)
			);
			break;
		case "Concat":
			expression.expressions = expression.expressions.map((subExpression) =>
				transformRecursively(
					subExpression,
					expressionType,
					transformFunction as unknown as TransformFunction<
						ExpressionTypeToExpression<ET, string>,
						string
					>,
					includeAllExpression
				)
			);
			expression = concat(
				...expression.expressions
			) as BindingToolkitExpression<T>;
			break;
		case "ComplexType":
			expression.bindingParameters = expression.bindingParameters.map(
				(bindingParameter) =>
					transformRecursively(
						bindingParameter as BindingToolkitExpression<T>,
						expressionType,
						transformFunction,
						includeAllExpression
					)
			);
			break;
		case "IfElse":
			const onTrue = transformRecursively(
				expression.onTrue,
				expressionType,
				transformFunction as unknown as TransformFunction<
					ExpressionTypeToExpression<ET, unknown>,
					unknown
				>,
				includeAllExpression
			);
			const onFalse = transformRecursively(
				expression.onFalse,
				expressionType,
				transformFunction as unknown as TransformFunction<
					ExpressionTypeToExpression<ET, unknown>,
					unknown
				>,
				includeAllExpression
			);
			let condition = expression.condition;
			if (includeAllExpression) {
				condition = transformRecursively(
					expression.condition,
					expressionType,
					transformFunction as unknown as TransformFunction<
						ExpressionTypeToExpression<ET, boolean>,
						boolean
					>,
					includeAllExpression
				);
			}
			expression = ifElse(
				condition,
				onTrue,
				onFalse
			) as BindingToolkitExpression<T>;
			break;
		case "Not":
			if (includeAllExpression) {
				const operand = transformRecursively(
					expression.operand,
					expressionType,
					transformFunction as unknown as TransformFunction<
						ExpressionTypeToExpression<ET, boolean>,
						boolean
					>,
					includeAllExpression
				);
				expression = not(operand) as BindingToolkitExpression<T>;
			}
			break;
		case "Truthy":
			break;
		case "Set":
			if (includeAllExpression) {
				const operands = expression.operands.map((operand) =>
					transformRecursively(
						operand,
						expressionType,
						transformFunction as unknown as TransformFunction<
							ExpressionTypeToExpression<ET, boolean>,
							boolean
						>,
						includeAllExpression
					)
				);
				expression =
					expression.operator === "||"
						? (or(...operands) as BindingToolkitExpression<T>)
						: (and(...operands) as BindingToolkitExpression<T>);
			}
			break;
		case "Comparison":
			if (includeAllExpression) {
				const operand1 = transformRecursively(
					expression.operand1 as BindingToolkitExpression<T>,
					expressionType,
					transformFunction,
					includeAllExpression
				);
				const operand2 = transformRecursively(
					expression.operand2 as BindingToolkitExpression<T>,
					expressionType,
					transformFunction,
					includeAllExpression
				);
				expression = comparison(
					expression.operator,
					operand1,
					operand2
				) as BindingToolkitExpression<T>;
			}
			break;
		case "Constant":
			const constantValue: Record<
				string,
				BindingToolkitExpression<unknown>
			> = expression.value as Record<string, BindingToolkitExpression<unknown>>;
			if (typeof constantValue === "object" && constantValue) {
				Object.keys(constantValue).forEach((key) => {
					constantValue[key] = transformRecursively(
						constantValue[key],
						expressionType,
						transformFunction as unknown as TransformFunction<
							ExpressionTypeToExpression<ET, unknown>,
							unknown
						>,
						includeAllExpression
					);
				});
			}
			break;
		case "Ref":
		case "Length":
		case "PathInModel":
		case "EmbeddedBinding":
		case "EmbeddedExpressionBinding":
		case "Unresolvable":
			// Do nothing
			break;
	}
	if (expressionType === expression._type) {
		expression = transformFunction(
			inExpression as ExpressionTypeToExpression<ET, T>
		);
	}
	return expression;
}

export type CompiledBindingToolkitExpression = string | undefined;

const needParenthesis = function <T extends PrimitiveType>(
	expr: ExpressionOrPrimitive<T>
): boolean {
	return (
		!isConstant(expr) &&
		!isPathInModelExpression(expr) &&
		isBindingToolkitExpression(expr) &&
		expr._type !== "IfElse" &&
		expr._type !== "Function"
	);
};

/**
 * Compiles a constant object to a string.
 * @param expr
 * @param isNullable
 * @returns The compiled string
 */
function compileConstantObject(
	expr: ConstantExpression<object>,
	isNullable = false
): string {
	if (isNullable && Object.keys(expr.value).length === 0) {
		return "";
	}
	const objects = expr.value as PlainExpressionObject;
	const properties: string[] = [];
	Object.keys(objects).forEach((key) => {
		const value = objects[key];
		const childResult = compileExpression(value, true, false, isNullable);
		if (childResult && childResult.length > 0) {
			properties.push(`${key}: ${childResult}`);
		}
	});
	return `{${properties.join(", ")}}`;
}

/**
 * Compiles a Constant Binding Expression.
 * @param expr
 * @param embeddedInBinding
 * @param isNullable
 * @param doNotStringify
 * @returns The compiled string
 */
export function compileConstant<T extends PrimitiveType>(
	expr: ConstantExpression<T>,
	embeddedInBinding: boolean,
	isNullable?: boolean,
	doNotStringify?: false
): CompiledBindingToolkitExpression;
export function compileConstant<T extends PrimitiveType>(
	expr: ConstantExpression<T>,
	embeddedInBinding: boolean,
	isNullable?: boolean,
	doNotStringify?: true
): PrimitiveType;
export function compileConstant<T extends PrimitiveType>(
	expr: ConstantExpression<T>,
	embeddedInBinding: boolean,
	isNullable = false,
	doNotStringify = false
): CompiledBindingToolkitExpression | PrimitiveType {
	if (expr.value === null) {
		return doNotStringify ? null : "null";
	}
	if (expr.value === undefined) {
		return doNotStringify ? undefined : "undefined";
	}
	if (typeof expr.value === "object") {
		if (Array.isArray(expr.value)) {
			const entries = expr.value.map((expression) =>
				compileExpression(expression, true)
			);
			return `[${entries.join(", ")}]`;
		} else {
			return compileConstantObject(
				expr as ConstantExpression<object>,
				isNullable
			);
		}
	}

	if (embeddedInBinding) {
		switch (typeof expr.value) {
			case "number":
			case "bigint":
			case "boolean":
				return expr.value.toString();
			case "string":
				return `'${escapeXmlAttribute(expr.value.toString())}'`;
			default:
				return "";
		}
	} else {
		return doNotStringify ? expr.value : expr.value.toString();
	}
}

/**
 * Generates the binding string for a Binding expression.
 * @param expressionForBinding The expression to compile
 * @param embeddedInBinding Whether the expression to compile is embedded into another expression
 * @param embeddedSeparator The binding value evaluator ($ or % depending on whether we want to force the type or not)
 * @returns The corresponding expression binding
 */
function compilePathInModelExpression<T extends PrimitiveType>(
	expressionForBinding: PathInModelExpression<T>,
	embeddedInBinding: boolean,
	embeddedSeparator: string
): CompiledBindingToolkitExpression {
	if (
		expressionForBinding.type ||
		expressionForBinding.parameters ||
		expressionForBinding.targetType ||
		expressionForBinding.formatOptions ||
		expressionForBinding.constraints
	) {
		// This is now a complex binding definition, let's prepare for it
		const complexBindingDefinition = {
			path: compilePathInModel(expressionForBinding),
			type: expressionForBinding.type,
			targetType: expressionForBinding.targetType,
			parameters: expressionForBinding.parameters,
			formatOptions: expressionForBinding.formatOptions,
			constraints: expressionForBinding.constraints,
		};
		const outBinding = compileExpression(
			complexBindingDefinition,
			false,
			false,
			true
		);
		if (embeddedInBinding) {
			const separator = expressionForBinding.alwaysKeepTargetType
				? "$"
				: embeddedSeparator;
			return `${separator}${outBinding}`;
		}
		return outBinding;
	} else if (embeddedInBinding) {
		return `${embeddedSeparator}{${compilePathInModel(expressionForBinding)}}`;
	} else {
		return `{${compilePathInModel(expressionForBinding)}}`;
	}
}

function compileComplexTypeExpression<T extends PrimitiveType>(
	expression: ComplexTypeExpression<T>
): string {
	if (expression.bindingParameters.length === 1) {
		return `{${compilePathParameter(
			expression
				.bindingParameters[0] as BindingToolkitExpression<PrimitiveType>,
			true
		)}, type: '${expression.type}'}`;
	}

	let outputEnd = `], type: '${expression.type}'`;
	if (hasElements(expression.formatOptions)) {
		outputEnd += `, formatOptions: ${compileExpression(
			expression.formatOptions
		)}`;
	}
	if (hasElements(expression.constraints)) {
		outputEnd += `, constraints: ${compileExpression(expression.constraints)}`;
	}
	if (hasElements(expression.parameters)) {
		outputEnd += `, parameters: ${compileExpression(expression.parameters)}`;
	}
	outputEnd += "}";

	return `{mode:'TwoWay', parts:[${expression.bindingParameters
		.map((param) =>
			compilePathParameter(param as BindingToolkitExpression<PrimitiveType>)
		)
		.join(",")}${outputEnd}`;
}

/**
 * Wrap the compiled binding string as required depending on its context.
 * @param expression The compiled expression
 * @param embeddedInBinding True if the compiled expression is to be embedded in a binding
 * @param parenthesisRequired True if the embedded binding needs to be wrapped in parethesis so that it is evaluated as one
 * @returns Finalized compiled expression
 */
export function wrapBindingExpression(
	expression: string,
	embeddedInBinding: boolean,
	parenthesisRequired = false
): CompiledBindingToolkitExpression {
	if (embeddedInBinding) {
		if (parenthesisRequired) {
			return `(${expression})`;
		} else {
			return expression;
		}
	} else {
		return `{= ${expression}}`;
	}
}

/**
 * Compile an expression into an expression binding.
 * @template T The target type
 * @param expression The expression to compile
 * @param embeddedInBinding Whether the expression to compile is embedded into another expression
 * @param keepTargetType Keep the target type of the embedded bindings instead of casting them to any
 * @param isNullable Whether binding expression can resolve to empty string or not
 * @returns The corresponding expression binding
 */
export function compileExpression<T extends PrimitiveType>(
	expression: ExpressionOrPrimitive<T>,
	embeddedInBinding = false,
	keepTargetType = false,
	isNullable = false
): CompiledBindingToolkitExpression {
	const expr = wrapPrimitive(expression);
	const embeddedSeparator = keepTargetType ? "$" : "%";

	switch (expr._type) {
		case "Unresolvable":
			return undefined;

		case "Constant":
			return compileConstant(expr, embeddedInBinding, isNullable);

		case "Ref":
			return expr.ref || "null";

		case "Function":
			let hasEmbeddedFunctionCallOrBinding = false;
			if (expr.isFormattingFn) {
				transformRecursively(
					expr,
					"Function",
					(subFn) => {
						if (subFn !== expr && subFn.obj === undefined) {
							hasEmbeddedFunctionCallOrBinding = true;
						}
						return subFn;
					},
					true
				);
				transformRecursively(
					expr,
					"Constant",
					(subFn: ConstantExpression<T>) => {
						if (
							(subFn as unknown) !== expr &&
							typeof subFn.value === "object"
						) {
							transformRecursively(subFn, "PathInModel", (subSubFn) => {
								hasEmbeddedFunctionCallOrBinding = true;
								return subSubFn;
							});
						}

						return subFn;
					},
					true
				);
			}
			const argumentString = `${expr.parameters
				.map((arg) => compileExpression(arg, true))
				.join(", ")}`;
			let fnCall =
				expr.obj === undefined
					? `${expr.fn}(${argumentString})`
					: `${compileExpression(expr.obj, true)}.${
							expr.fn
					  }(${argumentString})`;
			if (!embeddedInBinding && hasEmbeddedFunctionCallOrBinding) {
				fnCall = `{= ${fnCall}}`;
			}
			return fnCall;

		case "EmbeddedExpressionBinding":
			return embeddedInBinding
				? `(${expr.value.substring(2, expr.value.length - 1)})`
				: `${expr.value}`;

		case "EmbeddedBinding":
			return embeddedInBinding
				? `${embeddedSeparator}${expr.value}`
				: `${expr.value}`;

		case "PathInModel":
			return compilePathInModelExpression(
				expr,
				embeddedInBinding,
				embeddedSeparator
			);

		case "Comparison":
			const comparisonExpression = compileComparisonExpression(expr);
			return wrapBindingExpression(comparisonExpression, embeddedInBinding);

		case "IfElse":
			const ifElseExpression = `${compileExpression(
				expr.condition,
				true
			)} ? ${compileExpression(
				expr.onTrue,
				true,
				keepTargetType
			)} : ${compileExpression(expr.onFalse, true, keepTargetType)}`;
			return wrapBindingExpression(ifElseExpression, embeddedInBinding, true);

		case "Set":
			const setExpression = expr.operands
				.map((operand) => compileExpression(operand, true))
				.join(` ${expr.operator} `);
			return wrapBindingExpression(setExpression, embeddedInBinding, true);

		case "Concat":
			const concatExpression = expr.expressions
				.map((nestedExpression) =>
					compileExpression(nestedExpression, true, true)
				)
				.join(" + ");
			return wrapBindingExpression(concatExpression, embeddedInBinding);

		case "Length":
			const lengthExpression = `${compileExpression(
				expr.pathInModel,
				true
			)}.length`;
			return wrapBindingExpression(lengthExpression, embeddedInBinding);

		case "Not":
			const notExpression = `!${compileExpression(expr.operand, true)}`;
			return wrapBindingExpression(notExpression, embeddedInBinding);

		case "Truthy":
			const truthyExpression = `!!${compileExpression(expr.operand, true)}`;
			return wrapBindingExpression(truthyExpression, embeddedInBinding);

		case "Formatter":
			const formatterExpression = compileFormatterExpression(expr);
			return embeddedInBinding
				? `$${formatterExpression}`
				: formatterExpression;

		case "ComplexType":
			const complexTypeExpression = compileComplexTypeExpression(expr);
			return embeddedInBinding
				? `$${complexTypeExpression}`
				: complexTypeExpression;

		default:
			return "";
	}
}

/**
 * Compile a comparison expression.
 * @param expression The comparison expression.
 * @returns The compiled expression. Needs wrapping before it can be used as an expression binding.
 */
function compileComparisonExpression(expression: ComparisonExpression): string {
	function compileOperand(
		operand: BindingToolkitExpression<unknown>
	): CompiledBindingToolkitExpression {
		const compiledOperand = compileExpression(operand, true) ?? "undefined";
		return wrapBindingExpression(
			compiledOperand,
			true,
			needParenthesis(operand)
		);
	}

	return `${compileOperand(expression.operand1)} ${
		expression.operator
	} ${compileOperand(expression.operand2)}`;
}

/**
 * Compile a formatter expression.
 * @param expression The formatter expression.
 * @returns The compiled expression.
 */
function compileFormatterExpression<T extends PrimitiveType>(
	expression: FormatterExpression<T>
): string {
	if (expression.parameters.length === 1) {
		return `{${compilePathParameter(
			expression.parameters[0] as BindingToolkitExpression<PrimitiveType>,
			true
		)}, formatter: '${expression.fn}'}`;
	} else {
		const parts = expression.parameters.map((param) => {
			if (param._type === "ComplexType") {
				return compileComplexTypeExpression(param);
			} else {
				return compilePathParameter(
					param as BindingToolkitExpression<PrimitiveType>
				);
			}
		});
		return `{parts: [${parts.join(", ")}], formatter: '${expression.fn}'}`;
	}
}

/**
 * Compile the path parameter of a formatter call.
 * @param expression The binding part to evaluate
 * @param singlePath Whether there is one or multiple path to consider
 * @returns The string snippet to include in the overall binding definition
 */
function compilePathParameter(
	expression: BindingToolkitExpression<PrimitiveType>,
	singlePath = false
): string {
	let outValue = "";
	if (expression._type === "Constant") {
		if (expression.value === undefined) {
			// Special case otherwise the JSTokenizer complains about incorrect content
			outValue = `value: 'undefined'`;
		} else {
			outValue = `value: ${compileConstant(expression, true)}`;
		}
	} else if (expression._type === "PathInModel") {
		outValue = `path: '${compilePathInModel(expression)}'`;

		outValue += expression.type
			? `, type: '${expression.type}'`
			: `, targetType: 'any'`;
		if (expression.mode) {
			outValue += `, mode: '${compileExpression(expression.mode)}'`;
		}
		if (hasElements(expression.constraints)) {
			outValue += `, constraints: ${compileExpression(expression.constraints)}`;
		}
		if (hasElements(expression.formatOptions)) {
			outValue += `, formatOptions: ${compileExpression(
				expression.formatOptions
			)}`;
		}
		if (hasElements(expression.parameters)) {
			outValue += `, parameters: ${compileExpression(expression.parameters)}`;
		}
	} else {
		return "";
	}
	return singlePath ? outValue : `{${outValue}}`;
}

function hasElements(obj: object | undefined): boolean {
	return !!obj && Object.keys(obj).length > 0;
}

/**
 * Compile a binding expression path.
 * @param expression The expression to compile.
 * @returns The compiled path.
 */
function compilePathInModel<T extends PrimitiveType>(
	expression: PathInModelExpression<T>
): string {
	return `${expression.modelName ? expression.modelName + ">" : ""}${
		expression.path
	}`;
}
