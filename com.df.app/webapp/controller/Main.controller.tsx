import { defineUI5Class } from "com/df/ui5_jsx/base/ClassSupport";
import BaseController from "./BaseController";

@defineUI5Class("com.df.app.controller.Main")
class Main extends BaseController {
	public sayHello(): void {
		this.getRouter().navTo("detail");
	}
}

export default Main;
