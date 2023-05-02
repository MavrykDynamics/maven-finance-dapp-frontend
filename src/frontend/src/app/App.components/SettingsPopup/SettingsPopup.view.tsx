import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { RPCNodeType } from 'reducers/preferences'

// helpers
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_SECONDARY_PURPLE, BUTTON_WIDE } from '../Button/Button.constants'
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
import {
  ChangeNodeNodesList,
  ChangeNodeNodesListItem,
  DescrText,
  PopupContainerWrapper,
  SettingsPopupWrapper,
} from './SettingsPopup.style'

// types
import { InputStatusType } from 'app/App.components/Input/Input.constants'
import Button from '../Button/NewButton'
import Icon from '../Icon/Icon.view'
import { INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { INPUT_STATUS_ERROR } from 'app/App.components/Input/Input.constants'
import { Input } from '../Input/NewInput'

export const PopupChangeNodeView = ({ closeModal }: { closeModal: () => void }) => {
  const dispatch = useDispatch()
  const { RPC_NODES, REACT_APP_RPC_PROVIDER, themeSelected } = useSelector((state: State) => state.preferences)

  const [inputData, setInputData] = useState<{ node: string; nodeValidation: InputStatusType }>({
    node: '',
    nodeValidation: '',
  })
  const [expandedInput, setExpandedInput] = useState(false)
  const [selectedNodeByClick, setSelectedNodeByClick] = useState(REACT_APP_RPC_PROVIDER)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const enteredNode = e.target.value.trim()
    const isValidRPC = await isValidRPCNode(enteredNode, RPC_NODES)

    setInputData({
      node: enteredNode,
      nodeValidation: isValidRPC ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
    })
  }

  const confirmHandler = useCallback(() => {
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
  }, [inputData, RPC_NODES, selectedNodeByClick])

  const setNewThemeHandler = useCallback((newTheme: ThemeType) => dispatch(themeSetterAction(newTheme)), [])

  return (
    <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="settings">
      <button onClick={closeModal} className="close-modal" />

      <SettingsPopupWrapper>
        <div className="title">Change RPC Node</div>

        <ChangeNodeNodesList className="scroll-block">
          {RPC_NODES.map(({ title, url, nodeLogoUrl, isUser }, idx) => (
            <ChangeNodeNodesListItem
              key={title + idx}
              onClick={() => setSelectedNodeByClick(url)}
              isSelected={selectedNodeByClick === url}
            >
              {nodeLogoUrl && (
                <div className="img_wrapper">
                  <img src={`/images/${nodeLogoUrl}`} alt={'node logo'} />
                </div>
              )}{' '}
              <span className={isUser ? 'user-url' : ''}>{isUser ? `Link: ${url}` : title}</span>
            </ChangeNodeNodesListItem>
          ))}
        </ChangeNodeNodesList>

        <ChangeNodeNodesListItem className={`add_node ${expandedInput ? 'expanded' : ''}`}>
          <div className="add-new-node-handler">Add New Node</div>
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

        <DescrText className="change_node" style={{ marginBottom: '10px' }}>
          Changing node can improve stability and speed when the network is saturated.
        </DescrText>

        <Button
          onClick={confirmHandler}
          kind={BUTTON_PRIMARY}
          form={BUTTON_WIDE}
          disabled={inputData.nodeValidation !== INPUT_STATUS_SUCCESS}
        >
          <Icon id="okIcon" /> Confirm
        </Button>

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
      </SettingsPopupWrapper>
    </PopupContainerWrapper>
  )
}
