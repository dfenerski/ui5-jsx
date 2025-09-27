// This list needs to come from AVT
const ENUM_VALUES: Record<string, Record<string, unknown>> = {
	"com.sap.vocabularies.Common.v1.FieldControlType": {
		Mandatory: 7,
		Optional: 3,
		ReadOnly: 0,
		Inapplicable: 0,
		Disabled: 1
	}
};
export const resolveEnumValue = function (enumName: string | undefined): unknown {
	if (!enumName) {
		return false;
	}
	const [termName, value] = enumName.split("/");
	if (ENUM_VALUES.hasOwnProperty(termName)) {
		return ENUM_VALUES[termName][value];
	} else {
		return false;
	}
};
