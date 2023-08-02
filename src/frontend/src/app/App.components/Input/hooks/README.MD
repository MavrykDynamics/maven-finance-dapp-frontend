# How to use validatorFns

The Input component by default have ASCII validation

`InputProps {.... validationFns = [[validateInput, ERR_MSG_INPUT]], ....}`

If you wanna pas additional validators, f.e. for length etc, pass them like this

....
`<Input inputProps={inputProps} settings={
// ...rest of settigs,
validationFns = [[validateInputLength, ERR_MSG_INPUT]]
} />`
...

This code will validate for ASCII and Input length. You can pass as many validators as you want.

The structure of validator fn.

This is an array that contains tuples, where the first argument is the actual validator function that is returning errorMessage as string
or empty string

Example:

```
export function validateInputLength(value: string, limit = defaultLargeInputMaxLength) {
  if (value.length > limit) {
    return INPUT_MAX_LIMIT_TOAST_TEXT // text for error message
  }

  return ''
}
```

As you can see it have the second parametr - limit. It have some default value, let's say 20. If you wanna chnage it, you need to pass
the third tuple argument - array of args.

Here is how you can do this:

....
`<Input inputProps={inputProps} settings={
// ...rest of settigs,
validationFns = [[validateInputLength, ERR_MSG_INPUT, [40]]]
} />`
...

Now it will validate not for 20, but for 40.

If your custom validation function will have more params, that's not an issue, just pass all of them to the third tuple argument.

F.e.

```
export function validateInputExample(value: string, a: number, b: number, c: boolean) {
    cosnt l = value.length;
  if (; > limit) {
    return INPUT_MAX_LIMIT_TOAST_TEXT // text for error message
  }

  if (l < a && l > b && !c ) return ...

  return ''
}

....
<Input inputProps={inputProps} settings={
// ...rest of settigs,
validationFns = [[validateInputLength, ERR_MSG_INPUT, [15, 20, 33, true]]]
} />
...
```

## Tuple consts

Also you may have noticed some const as the second parametr - **ERR_MSG_INPUT**

For now thare are only two types for it - **ERR_MSG_INPUT** | **ERR_MSG_TOAST**

**ERR_MSG_INPUT** - means show error message under the input
**ERR_MSG_TOAST** - means show error message as toaster block that is appearing from the right side on the screen

> **NOTE** - you cannot change input if there is an error. Like to enter more symbols if input length didn't pass the validation
> or enter non ASCII symbols.
