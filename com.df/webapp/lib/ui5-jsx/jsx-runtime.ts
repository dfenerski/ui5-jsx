import Control from "sap/ui/core/Control";
import Controller from "sap/ui/core/mvc/Controller";
import View from "sap/ui/core/mvc/View";

function createView(controllerName: string, content: any) {
	const view = View.extend(controllerName.replace("controller", "view"), {
		getControllerModuleName(): string {
			return controllerName.replaceAll(".", "/");
		},
		createContent(controller: Controller) {
			return content;
		},
	});

	return view;
}

class UI5JSX {
	public static parse(
		controlOrToken: Control | string,
		{ children, ...controlSettings }: Record<string, any>
	) {
		if (
			(<Control>controlOrToken).getMetadata?.().getName() ===
			"sap.ui.core.mvc.View"
		) {
			return createView(
				controlSettings.controllerName,
				Array.isArray(children)
					? children.map((c) => c.control)
					: children.control
			);
		}

		// leaf
		if (!Boolean(children)) {
			return {
				type: "leaf",
				control: new (<any>controlOrToken)(controlSettings),
			};
		}
		// named
		else if (typeof controlOrToken === "string") {
			return {
				type: "named",
				name: controlOrToken,
				children: (() => {
					if (children.type === "leaf" || children.type === "intermediate") {
						return [children.control];
					} else if (Array.isArray(children)) {
						return children.map((c) => c.control);
					} else {
						throw new Error("named node received unknown children type");
					}
				})(),
			};
		}
		// intermediate
		else {
			const metadata = controlOrToken.getMetadata();

			const aggregationName = (() => {
				if (children.type === "named") {
					return children.name;
				} else {
					return metadata.getDefaultAggregationName();
				}
			})();

			const aggregation = metadata.getAggregation(aggregationName);

			const isAggregationMultiple = aggregation.multiple;

			return {
				type: "intermediate",
				control: new (<any>controlOrToken)({
					...controlSettings,
					[aggregationName]: (() => {
						const intermediateChildren: any[] = [];
						if (children.type === "named") {
							intermediateChildren.push.apply(children.children);
						} else if (Array.isArray(children)) {
							return children.map((c) => c.control);
						} else if (
							children.type === "leaf" ||
							children.type === "intermediate"
						) {
							intermediateChildren.push(children.control);
						}

						return isAggregationMultiple
							? intermediateChildren
							: intermediateChildren[0];
					})(),
				}),
			};
		}
	}
}

export const jsx = UI5JSX.parse.bind(UI5JSX);
export const jsxs = UI5JSX.parse.bind(UI5JSX);
