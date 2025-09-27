import { defineUI5Class } from "com/df/ui5_jsx/base/ClassSupport";
import BaseController from "./BaseController";
import MessageBox from "sap/m/MessageBox";

@defineUI5Class("com.df.app.controller.Detail")
class Detail extends BaseController {
	public sayHello(): void {
		alert("DETAIL");
	}

	public onAfterRendering(): void | undefined {
		const paragraph = window.document.createElement("p");
		paragraph.innerText = "HI LOL";
		window.document.body.insertBefore(
			paragraph,
			window.document.querySelector('div[data-name="com.df.app"]'),
		);
	}
}

export default Detail;
