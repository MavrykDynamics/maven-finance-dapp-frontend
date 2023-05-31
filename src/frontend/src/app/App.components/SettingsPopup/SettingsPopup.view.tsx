import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// helpers
import {
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  BUTTON_SECONDARY_PURPLE,
  BUTTON_SIMPLE,
  BUTTON_WIDE,
} from '../Button/Button.constants'
import { INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { INPUT_STATUS_ERROR } from 'app/App.components/Input/Input.constants'
import { isValidRPCNode } from 'utils/validatorFunctions'

// actions
import { selectNewRPCNode, setNewRPCNodes } from './SettingsPopup.actions'
import {
  DARK_THEME,
  LIGHT_THEME,
  SPACE_THEME,
  themeSetterAction,
  ThemeType,
} from '../DarkThemeProvider/DarkThemeProvider.actions'

// styles
import Button from '../Button/NewButton'
import Icon from '../Icon/Icon.view'
import { Input } from '../Input/NewInput'

// types
import { RPCNodeType } from 'reducers/preferences'
import { InputStatusType } from 'app/App.components/Input/Input.constants'
import { ImageWithPlug } from '../Icon/ImageWithPlug'
import { PopupContainerWrapper } from '../popup/PopupMain.style'
import { ChangeNodeNodesList, ChangeNodeNodesListItem, SettingsPopupBase } from '../popup/bases/SettingsPopup.style'

export const PopupChangeNodeView = ({ closeModal }: { closeModal: () => void }) => {
  const dispatch = useDispatch()
  const { RPC_NODES, REACT_APP_RPC_PROVIDER } = useSelector((state: State) => state.preferences)

  const [inputData, setInputData] = useState<{ node: string; nodeValidation: InputStatusType }>({
    node: '',
    nodeValidation: '',
  })
  const [expandedInput, setExpandedInput] = useState(false)
  const [selectedNodeByClick, setSelectedNodeByClick] = useState(REACT_APP_RPC_PROVIDER)
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
      nodeValidation: isValidRPC.status ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
    }))
  }

  const confirmHandler = () => {
    if (inputData) {
      const newRPCNodes: Array<RPCNodeType> = [
        ...RPC_NODES,
        { title: inputData.node, url: inputData.node, isUser: true },
      ]
      dispatch(setNewRPCNodes(newRPCNodes))
      dispatch(selectNewRPCNode(inputData.node))
      setSelectedNodeByClick(inputData.node)
      setInputData({
        node: '',
        nodeValidation: '',
      })
    } else {
      dispatch(selectNewRPCNode(selectedNodeByClick))
    }
  }

  const removeUserNode = (nodeUrl: string) => dispatch(setNewRPCNodes(RPC_NODES.filter(({ url }) => url !== nodeUrl)))

  return (
    <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="settings">
      <button onClick={closeModal} className="close-modal" />

      <SettingsPopupBase>
        <div className="title">Change RPC Node</div>

        <ChangeNodeNodesList>
          {RPC_NODES.map(({ title, url, nodeLogoUrl, isUser }, idx) => (
            <ChangeNodeNodesListItem
              key={title + idx}
              onClick={() => setSelectedNodeByClick(url)}
              isSelected={selectedNodeByClick === url}
            >
              {nodeLogoUrl ? <ImageWithPlug imageLink={`/images/${nodeLogoUrl}`} alt="node logo" /> : null}
              <span className={isUser ? 'user-node' : ''}>{isUser ? `Link: ${url}` : title}</span>
              {isUser ? (
                <div className="remove-node">
                  <Button kind={BUTTON_SIMPLE} isThin onClick={() => removeUserNode(url)}>
                    <Icon id="delete" />
                  </Button>
                </div>
              ) : null}
            </ChangeNodeNodesListItem>
          ))}

          {RPC_NODES.length < 3 ? (
            <ChangeNodeNodesListItem className={`add_node ${expandedInput ? 'expanded' : ''}`}>
              <div className="add-new-node-title">Add New Node</div>
              <Input
                settings={{ inputStatus: inputData.nodeValidation }}
                inputProps={{
                  onFocus: () => setExpandedInput(true),
                  onBlur: () => setExpandedInput(false),
                  onChange: handleChange,
                  placeholder: 'https://...',
                  type: 'text',
                  value: inputData.node,
                }}
              />
            </ChangeNodeNodesListItem>
          ) : null}
        </ChangeNodeNodesList>

        {rpcNodeError ? <div className="error-msg">Error: {rpcNodeError}</div> : null}

        <div className="change-node-descr">
          Changing node can improve stability and speed when the network is saturated.
        </div>

        <Button
          onClick={confirmHandler}
          kind={BUTTON_PRIMARY}
          form={BUTTON_WIDE}
          disabled={inputData.nodeValidation !== INPUT_STATUS_SUCCESS}
        >
          <Icon id="okIcon" /> Confirm
        </Button>

        <Themes />
      </SettingsPopupBase>
    </PopupContainerWrapper>
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
          disabled
        >
          Dark
        </Button>
        <Button
          kind={themeSelected === LIGHT_THEME ? BUTTON_SECONDARY : BUTTON_SECONDARY_PURPLE}
          form={BUTTON_WIDE}
          isThin
          isSquare
          onClick={() => setNewThemeHandler(LIGHT_THEME)}
          disabled
        >
          Light
        </Button>
      </div>
    </div>
  )
}
