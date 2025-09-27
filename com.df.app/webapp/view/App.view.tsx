/* eslint-disable @typescript-eslint/no-unsafe-return */
import { defineUI5Class } from "com/df/ui5_jsx/base/ClassSupport";
import Controller from "sap/ui/core/mvc/Controller";
import View from "sap/ui/core/mvc/View";
import jsx from "com/df/ui5_jsx/base/jsx-runtime";
import MApp from "sap/m/App";

{
	/* <mvc:View
	controllerName=""
	displayBlock="true"
	xmlns="sap.m"
	xmlns:mvc="sap.ui.core.mvc">

	<App id="app" />

</mvc:View> */
}

@defineUI5Class("com.df.app.view.App")
class App extends View {
	public override getControllerModuleName(): string {
		return "com.df.app.controller.Detail";
	}

	public override createContent(controller: Controller) {
		return <MApp id="app" />;
	}
}

export default App;
