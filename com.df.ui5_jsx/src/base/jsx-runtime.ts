import jsx from "./jsx-runtime/jsx";
import jsxs from "./jsx-runtime/jsxs";
import Fragment from "./jsx-runtime/Fragment";

/**
 * When coming from the JSX factory, the JSX factory will call this function with the type of the element, the props and the children.
 * The babel plugin expects this file to exist.
 */
export default { jsxs, jsx, Fragment };
