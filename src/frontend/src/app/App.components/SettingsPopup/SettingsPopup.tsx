import React, { useCallback, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useClickAway, useLockBodyScroll } from 'react-use'
import { State } from 'reducers'

// helpers, consts
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  BUTTON_SECONDARY_PURPLE,
  BUTTON_SIMPLE,
  BUTTON_WIDE,
} from '../Button/Button.constants'
import { INPUT_STATUS_DEFAULT, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { INPUT_STATUS_ERROR } from 'app/App.components/Input/Input.constants'
import { isValidRPCNode } from 'utils/validatorFunctions'
import { stopPropagation } from 'utils/eventsHelpers/stopPropagation'

// actions
import { selectNewRPCNode, setNewRPCNodes } from './SettingsPopup.actions'
import {
  DARK_THEME,
  LIGHT_THEME,
  SPACE_THEME,
  themeSetterAction,
  ThemeType,
} from '../DarkThemeProvider/DarkThemeProvider.actions'

// types
import { InputStatusType } from 'app/App.components/Input/Input.constants'
import { RPCNodeType } from 'reducers/preferences'

// views
import Button from '../Button/NewButton'
import Icon from '../Icon/Icon.view'
import { ImageWithPlug } from '../Icon/ImageWithPlug'
import { Input } from '../Input/NewInput'

// styles
import { PopupContainer, PopupContainerWrapper } from '../popup/PopupMain.style'
import { ChangeNodeNodesList, ChangeNodeNodesListItem, SettingsPopupBase } from '../popup/bases/SettingsPopup.style'

const MAX_NODES_AMOUNT = 3
const DEFAULT_NODE_INPUT_STATE: { node: string; nodeValidation: InputStatusType } = {
  node: '',
  nodeValidation: INPUT_STATUS_DEFAULT,
}

export const SettingPopup = ({ isModalOpened, closeModal }: { isModalOpened: boolean; closeModal: () => void }) => {
  useLockBodyScroll(isModalOpened)

  const dispatch = useDispatch()
  const { RPC_NODES, REACT_APP_RPC_PROVIDER } = useSelector((state: State) => state.preferences)

  const inputRef = useRef<HTMLInputElement>(null)
  const inputWrapperRef = useRef<HTMLDivElement>(null)

  useClickAway(inputWrapperRef, () => setExpandedInput(false))

  const [inputData, setInputData] = useState(DEFAULT_NODE_INPUT_STATE)
  const [expandedInput, setExpandedInput] = useState(false)
  const [selectedNode, setSelectedNode] = useState(REACT_APP_RPC_PROVIDER)
  const [rpcNodeError, setRpcNodeError] = useState<null | string>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputData((prev) => ({
      ...prev,
      node: enteredNode,
    }))

    const enteredNode = e.target.value.trim()
    const isValidRPC = await isValidRPCNode(enteredNode, RPC_NODES)

    setRpcNodeError(isValidRPC.errorMsg)
    setInputData((prev) => ({
      ...prev,
      node: enteredNode,
      nodeValidation:
        enteredNode === '' ? INPUT_STATUS_DEFAULT : isValidRPC.status ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
    }))
  }

  const confirmHandler = () => {
    if (inputData.node && inputData.nodeValidation !== INPUT_STATUS_ERROR) {
      const newRPCNodes: Array<RPCNodeType> = [
        ...RPC_NODES,
        { title: inputData.node, url: inputData.node, isUser: true },
      ]
      dispatch(setNewRPCNodes(newRPCNodes))
      dispatch(selectNewRPCNode(inputData.node))
      setSelectedNode(inputData.node)
      setInputData(DEFAULT_NODE_INPUT_STATE)
    } else {
      dispatch(selectNewRPCNode(selectedNode))
    }
  }

  const removeUserNode = (e: React.MouseEvent) => {
    stopPropagation(e)
    const filteredNodes = RPC_NODES.filter(({ isUser }) => !isUser)
    const newSelectedNode = filteredNodes[0].url

    setSelectedNode(newSelectedNode)
    dispatch(setNewRPCNodes(filteredNodes, true))
    dispatch(selectNewRPCNode(newSelectedNode, true))
  }

  const nodeClickHandler = (nodeUrl: string) => {
    setSelectedNode(nodeUrl)
    setInputData(DEFAULT_NODE_INPUT_STATE)
    setRpcNodeError(null)
  }

  const confirmDisabled =
    (Boolean(inputData.node) && inputData.nodeValidation !== INPUT_STATUS_SUCCESS) ||
    (!inputData.node && REACT_APP_RPC_PROVIDER === selectedNode)

  return (
    <PopupContainer onClick={closeModal} show={isModalOpened}>
      <PopupContainerWrapper onClick={stopPropagation} className="settings">
        <button onClick={closeModal} className="close-modal" />

        <SettingsPopupBase>
          <div className="title">Change RPC Node</div>

          <ChangeNodeNodesList>
            {RPC_NODES.map(({ title, url, nodeLogoUrl, isUser }) => (
              <ChangeNodeNodesListItem
                key={url}
                onClick={() => nodeClickHandler(url)}
                isSelected={selectedNode === url}
              >
                {nodeLogoUrl ? (
                  <ImageWithPlug imageLink={`/images/${nodeLogoUrl}`} alt={`${title ?? url} node logo`} />
                ) : null}
                <span className={isUser ? 'user-node' : ''}>{isUser ? url : title}</span>
                {isUser ? (
                  <div className="remove-node">
                    <Button kind={BUTTON_SIMPLE} isThin onClick={removeUserNode}>
                      <Icon id="delete" />
                    </Button>
                  </div>
                ) : null}
              </ChangeNodeNodesListItem>
            ))}

            {RPC_NODES.length < MAX_NODES_AMOUNT ? (
              <ChangeNodeNodesListItem
                className={`add_node ${expandedInput ? 'expanded' : ''}`}
                onClick={() => inputRef.current?.focus()}
                ref={inputWrapperRef}
              >
                <div className="add-new-node-title">Add New Node</div>
                <Input
                  settings={{ inputStatus: inputData.nodeValidation, showErrorMessage: false }}
                  inputProps={{
                    onFocus: () => setExpandedInput(true),
                    onChange: handleChange,
                    placeholder: 'https://...',
                    type: 'text',
                    value: inputData.node,
                  }}
                  ref={inputRef}
                />
              </ChangeNodeNodesListItem>
            ) : null}
          </ChangeNodeNodesList>

          {rpcNodeError ? <div className="error-msg">Error: {rpcNodeError}</div> : null}

          <div className="change-node-descr">
            Changing node can improve stability and speed when the network is saturated.
          </div>

          <Button onClick={confirmHandler} kind={BUTTON_PRIMARY} form={BUTTON_WIDE} disabled={confirmDisabled}>
            <Icon id="okIcon" /> Confirm
          </Button>

          <Themes />
        </SettingsPopupBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

const Themes = () => {
  const dispatch = useDispatch()
  const { themeSelected } = useSelector((state: State) => state.preferences)
  const setNewThemeHandler = useCallback((newTheme: ThemeType) => dispatch(themeSetterAction(newTheme)), [])

  return (
    <div className="theme-switcher-block">
      <div className="title">Choose the theme</div>
      <div className="buttons-wrapper">
        <Button
          kind={themeSelected === SPACE_THEME ? BUTTON_SECONDARY : BUTTON_SECONDARY_PURPLE}
          form={BUTTON_WIDE}
          isThin
          isSquare
          onClick={() => setNewThemeHandler(SPACE_THEME)}
        >
          Space
        </Button>
        <Button
          kind={themeSelected === DARK_THEME ? BUTTON_SECONDARY : BUTTON_SECONDARY_PURPLE}
          form={BUTTON_WIDE}
          isThin
          isSquare
          onClick={() => setNewThemeHandler(DARK_THEME)}
        >
          Dark
        </Button>
        <Button
          kind={themeSelected === LIGHT_THEME ? BUTTON_SECONDARY : BUTTON_SECONDARY_PURPLE}
          form={BUTTON_WIDE}
          isThin
          isSquare
          onClick={() => setNewThemeHandler(LIGHT_THEME)}
        >
          Light
        </Button>
      </div>
    </div>
  )
}
