import { defineUI5Class } from "com/df/ui5_jsx/base/ClassSupport";
import BaseController from "./BaseController";

@defineUI5Class("com.df.app.controller.App")
class App extends BaseController {
	public onInit(): void {
		// apply content density mode to root view
		this.getView().addStyleClass(
			this.getOwnerComponent().getContentDensityClass(),
		);
	}
}

export default App;
