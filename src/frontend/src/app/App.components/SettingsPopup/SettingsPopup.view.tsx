import { Input } from 'app/App.components/Input/Input.controller'
import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { RPCNodeType } from 'reducers/preferences'

// helpers
import { ACTION_PRIMARY, TRANSPARENT } from '../Button/Button.constants'
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
  Button,
  ChangeNodeNodesList,
  ChangeNodeNodesListItem,
  DescrText,
  PopupContainerWrapper,
  PopupTitle,
} from './SettingsPopup.style'

// types
import { InputStatusType } from 'app/App.components/Input/Input.constants'

export const PopupChangeNodeView = ({ closeModal }: { closeModal: () => void }) => {
  const dispatch = useDispatch()
  const { RPC_NODES, REACT_APP_RPC_PROVIDER, themeSelected } = useSelector((state: State) => state.preferences)

  const [inputData, setInputData] = useState('')
  const [expandedInput, setExpandedInput] = useState(false)
  const [selectedNodeByClick, setSelectedNodeByClick] = useState(REACT_APP_RPC_PROVIDER)
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    add_new_node_input: '',
  })

  const handleBlur = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpandedInput(false)
    const isValidRPC = await isValidRPCNode(e.target.value)
    setFormInputStatus((prev) => {
      return { ...prev, [e.target.name]: isValidRPC ? 'success' : 'error' }
    })
  }

  const confirmHandler = useCallback(() => {
    //TODO: @maksym, we need to handle when the RPC node isn't valid, currently it doesn't. It still adds invalid nodes
    // to the list of valid nodes. It should not. It needs to show the error in the input, and not add it to the list.
    if (inputData) {
      const newRPCNodes: Array<RPCNodeType> = [...RPC_NODES, { title: inputData, url: inputData, isUser: true }]
      dispatch(setNewRPCNodes(newRPCNodes))
      dispatch(selectNewRPCNode(inputData))
      setSelectedNodeByClick(inputData)
      setInputData('')
    } else {
      dispatch(selectNewRPCNode(selectedNodeByClick))
    }
  }, [inputData, RPC_NODES, selectedNodeByClick])

  const setNewThemeHandler = useCallback((newTheme: ThemeType) => dispatch(themeSetterAction(newTheme)), [])

  return (
    <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="settings">
      <div className="change-node-block">
        <button onClick={closeModal} className="close-modal" />
        <PopupTitle className="change_node">Change RPC Node</PopupTitle>

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
            placeholder="https://..."
            name="add_new_node_input"
            value={inputData}
            type="text"
            onFocus={() => setExpandedInput(true)}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputData(e.target.value)}
            inputStatus={formInputStatus.add_new_node_input}
          />
        </ChangeNodeNodesListItem>

        <DescrText className="change_node" style={{ marginBottom: '10px' }}>
          Changing node can improve stability and speed when the network is saturated.
        </DescrText>

        <Button
          onClick={confirmHandler}
          className="popup_btn default_svg"
          text="Confirm"
          icon="okIcon"
          strokeWidth={0.3}
          kind={ACTION_PRIMARY}
        />
      </div>

      <div className="theme-switcher-block">
        <PopupTitle className="change_node">Choose the theme</PopupTitle>

        <div className="buttons-wrapper">
          <Button
            text={'Space'}
            kind={TRANSPARENT}
            onClick={() => setNewThemeHandler(SPACE_THEME)}
            className={`theme-btn ${themeSelected === SPACE_THEME ? 'selected' : ''}`}
          />
          <Button
            text={'Dark'}
            kind={TRANSPARENT}
            onClick={() => setNewThemeHandler(DARK_THEME)}
            className={`theme-btn ${themeSelected === DARK_THEME ? 'selected' : ''}`}
            disabled
          />
          <Button
            text={'Light'}
            kind={TRANSPARENT}
            onClick={() => setNewThemeHandler(LIGHT_THEME)}
            className={`theme-btn ${themeSelected === LIGHT_THEME ? 'selected' : ''}`}
            disabled
          />
        </div>
      </div>
    </PopupContainerWrapper>
  )
}
