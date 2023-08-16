## useContractAction props

`actionType` - type of action for contract (f.e. STAKE_ACTION)

`actionFn` - the actual action which is invoked inside hook

`dappActionCallback` - callback which is triggered inside DappProvider effect when all final toasters are removed and contract method successfuly executed.

`afterActionCallback` - callback that is invoked immidiately after action was executed (it doesnt matter if action succeed or failed)

`errActionCallback` - callback that is invoked inside catch block (f.e. to change status from loading true - to false)
if some error occured

`willUseSharedError` - instead of showing "bug toast" will set error message inside ToasterProvider, so you can take this state and show some custom css block.

`isSilentAction` - if true, does not trigger toasts

---

**Hook is using generics, by default it's unknown
The generic is used for action which will take some arguments**

## ReturnType

**Hook returns two actions:**

`action` - simple action without arguments which you can call anywhere
When you need to pass some data (f.e. from form) you can use `bind` with this action to pass the actual data. See example in `StakeUnstake.view`

`actionWithArgs` - action which will take some args (generic is used for this type of action). So you need to pass type when using this action.
