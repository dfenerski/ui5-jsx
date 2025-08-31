import Button from "sap/m/Button";
import IllustratedMessage from "sap/m/IllustratedMessage";
import Page from "sap/m/Page";
import View from "sap/ui/core/mvc/View";
import { jsx } from "../lib/ui5-jsx/jsx-runtime";
import Toolbar from "sap/m/Toolbar";
import Title from "sap/m/Title";
import List from "sap/m/List";
import StandardListItem from "sap/m/StandardListItem";

const STATE = {
	I18N: {
		appTitle: "this.formatter.getDynamicI18N() call...",
	},
};

const sayHello = () => {
	alert("Hello");
};

declare global {
	namespace JSX {
		interface IntrinsicElements {
			content: any;
			additionalContent: any;
		}
	}
}

const items = Array.from({ length: 5 }, (_, i) => i);
const myList = (
	<List>
		{items.map((i) => (
			<StandardListItem title={`ITEM:${i}`} />
		))}
	</List>
);

const MainView = (
	<View controllerName="com.df.controller.Main" displayBlock={true}>
		<Page title={STATE.I18N.appTitle} id="page">
			<Toolbar>
				<Title text="This is a message" />
			</Toolbar>
			<Toolbar>
				<content>
					<Title text="This is a message" />
				</content>
			</Toolbar>
			{myList}
			<IllustratedMessage
				title="{i18n>appTitle}"
				illustrationType="sapIllus-SuccessHighFive"
				enableVerticalResponsiveness={true}
				description="{i18n>appDescription}"
			>
				<additionalContent>
					<Button
						id="helloButton"
						text="{formatter: 'formatter.formatValue', path: 'i18n>btnText'}"
						press={sayHello}
					/>
					<Button
						id="helloButton1"
						text="{formatter: 'formatter.formatValue', path: 'i18n>btnText'}"
						press={sayHello}
					/>
				</additionalContent>
			</IllustratedMessage>
		</Page>
	</View>
);

export default MainView;
