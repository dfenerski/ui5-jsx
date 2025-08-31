# `ui5-jsx` - Intro

This is a demo app hacked together to evaluate the concept of using the more flexible `jsx/tsx` syntax for UI5 views.

Why?
- XML felt clunky 
	- slow to write
	- difficult to read
- Freestyle app so no auto UI generation from annotations
- no type support in xml 
	- easy typos
	- no variables
	- static asset  lookup requires weird domain specific syntax

# Status

### The good

The app is `build`-able and `serve`-able.

### The bad

The elephant in the room are aggregation bindings.

In other frameworks you sort of get a "hot" array variable which you `return list.map`.
In UI5 this is hidden behind a binding and does not work directly.
So doing
```jsx

const myList = (
	<List>
		{items.map((i) => (
			<StandardListItem title={`ITEM:${i}`} />
		))}
	</List>
);


	<View controllerName="com.df.controller.Main">
		<Page title={STATE.I18N.appTitle} id="page">
			{myList}
```

Will not update if `items` comes from a model. Unless you do a "manual" binding instance? 


### The ugly

Named aggregations are not real elements so TypeScript complains.
Currently suppressed using global module augment.

``` ts
declare global {
	namespace JSX {
		interface IntrinsicElements {
			content: any;
			additionalContent: any;
		}
	}
}
```


Furthermore:
- the API in `jsx-runtime.ts` sucks ("`if` much?") 
- the `babel` and `tsconfig` files can probably be improved
- there is a lazy shim in the `Component.ts`
# Collaboration & roadmap

If bindings can be fixed and no critical incompatibilities are found this may be convenient for usage.

Any and all collaboration is highly welcome ☀️.