/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { defineUI5Class } from "com/df/ui5_jsx/base/ClassSupport";
import jsx from "com/df/ui5_jsx/base/jsx-runtime";
import List from "sap/m/List";
import Page from "sap/m/Page";
import Title from "sap/m/Title";
import BaseObject from "sap/ui/base/Object";
import Control from "sap/ui/core/Control";
import Controller from "sap/ui/core/mvc/Controller";
import View from "sap/ui/core/mvc/View";

// const STATE = {
// 	I18N: {
// 		appTitle: "this.formatter.getDynamicI18N() call...",
// 	},
// };

// const sayHello = () => {
// 	alert("Hello");
// };

@defineUI5Class("com.df.app.view.Detail")
class Detail extends View {
	public override getControllerModuleName(): string {
		return "com.df.app.controller.Detail";
	}

	public override createContent(controller: Controller) {
		return (
			<Page title={"DETAIL IS BEIN SHOWN HOORAY"}>
				{{
					content: (
						<>
							<Title text={"Title2"} />
							{/* <br/>
							<span>{"Spanning across html"}</span>
							<span ref={jsx.renderUsingRenderManager()}> */}
							<Title text={"Title2"} />
							<Title text={"Title3"} />
							<List>
								{{
									items: {},
								}}
							</List>
						</>
					),
				}}
			</Page>
		);
	}
}

export default Detail;
