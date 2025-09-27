/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { defineUI5Class } from "com/df/ui5_jsx/base/ClassSupport";
import View from "sap/ui/core/mvc/View";
import jsx from "com/df/ui5_jsx/base/jsx-runtime";
import IllustratedMessage from "sap/m/IllustratedMessage";
import Page from "sap/m/Page";
import Example from "com/df/ui5_jsx/Example";
import Button from "sap/m/Button";

const sayHello = () => {
	alert("Hello");
};

@defineUI5Class("com.df.app.controller.Main")
class Main extends View {
	public override getControllerModuleName(): string {
		return "com.df.app.controller.Detail";
	}

	public override createContent(controller: Controller) {
		return (
			<Page title="{i18n>appTitle}" id="page">
				{{
					content: (
						<IllustratedMessage
							title="{i18n>appTitle}"
							illustrationType="sapIllus-SuccessHighFive"
							enableVerticalResponsiveness={true}
							description="{i18n>appDescription}"
						>
							{{
								additionalContent: (
									<>
										<Example />
										<Button
											id="helloButton"
											text="{formatter: 'formatter.formatValue', path: 'i18n>btnText'}"
											press={sayHello}
										/>
									</>
								),
							}}
						</IllustratedMessage>
					),
				}}
			</Page>
		);
	}
}

export default Main;
