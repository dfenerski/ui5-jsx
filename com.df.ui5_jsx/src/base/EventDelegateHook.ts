import type { PropertiesOf } from "./ClassSupport";
import { defineUI5Class, event, property } from "./ClassSupport";
import type { $ElementSettings } from "sap/ui/core/Element";
import Element from "sap/ui/core/Element";
// import type { EventHandler } from "types/extension_types";

/**
 * Create an event delegate hook on the parent of this control to deal with event propagation.
 *
 * This is a specific solution for the Avatar control case where the press cannot be interrupted and which then ends up interacting with control behind it.
 *
 */
@defineUI5Class("com.df.ui5_jsx.EventDelegateHook")
export default class EventDelegateHook extends Element {
	@property({ type: "boolean" })
	stopTapPropagation = false;

	@event()
	tap?: any /*EventHandler*/;

	constructor(idOrSettings?: EventDelegateSettings);

	constructor(idOrSettings: string, settings?: EventDelegateSettings);

	constructor(
		idOrSettings?: string | PropertiesOf<EventDelegateHook>,
		settings?: EventDelegateSettings
	) {
		super(idOrSettings as string, settings);
	}

	setParent(
		parentObject: Element,
		aggregationName: string,
		suppressInvalidate: boolean
	): void {
		if (this.getParent()) {
			(this.getParent() as Element).removeEventDelegate(this);
		}
		parentObject.addEventDelegate(this);

		// @ts-ignore
		super.setParent(parentObject, aggregationName, suppressInvalidate);
	}

	ontap(tapEvent: JQuery.Event): void {
		if (this.stopTapPropagation) {
			tapEvent.stopPropagation();
		}
		this.fireEvent("tap");
	}
}

type EventDelegateSettings = $ElementSettings & PropertiesOf<EventDelegateHook>;
