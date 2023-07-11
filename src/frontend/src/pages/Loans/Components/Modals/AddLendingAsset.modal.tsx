import {useDispatch, useSelector} from 'react-redux'
import {useLockBodyScroll} from 'react-use'
import {useEffect, useMemo, useState} from 'react'

import NewButton from 'app/App.components/Button/NewButton'
import {CommaNumber} from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import {Input} from 'app/App.components/Input/NewInput'
import {CustomTooltip} from 'app/App.components/Tooltip/Tooltip.view'

import {INPUT_LARGE, INPUT_STATUS_SUCCESS} from 'app/App.components/Input/Input.constants'
import {State} from 'reducers'
import {AddLendingAssetDataType, DEFAULT_LOANS_INPUT_VALUE, getOnBlurValue, getOnFocusValue} from './Modals.helpers'
import {BUTTON_PRIMARY, BUTTON_WIDE} from 'app/App.components/Button/Button.constants'
import {getLoansInputMaxAmount, isTezosAsset, loansInputValidation} from 'pages/Loans/Loans.helpers'

import {GovRightContainerTitleArea} from 'pages/Governance/Governance.style'
import {InputPinnedTokenInfo} from 'app/App.components/Input/Input.style'
import {ThreeLevelListItem} from 'pages/Loans/Loans.style'
import {silverColor} from 'styles'
import {LoansModalBase} from './Modals.style'
import {PopupContainer, PopupContainerWrapper} from 'app/App.components/popup/PopupMain.style'
import {depositLendingAssetAction} from 'pages/Loans/Actions/lendingAsset.actions'
import {ImageWithPlug} from 'app/App.components/Icon/ImageWithPlug'
import {assetDecimalsToShow} from 'pages/Loans/Loans.const'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A239981&t=Sx2aEpp3ifrGxBtQ-0
export const AddLendingAsset = ({
                                    closePopup,
                                    show,
                                    data,
                                }: {
    closePopup: () => void
    show: boolean
    data: AddLendingAssetDataType
}) => {
    const {
        mBalance = 0,
        rate = 0,
        decimals = 0,
        symbol = '',
        address = '',
        lendingAPY = 0,
        icon = '',
        gqlName = '',
        tokenType = '',
        id = 0,
    } = data ?? {}
    useLockBodyScroll(show)

    const {userTokens} = useSelector((state: State) => state.wallet.user)

    const balanceSymbol = isTezosAsset(symbol.toLowerCase() ?? '') ? 'tezos' : symbol.toLowerCase().toLowerCase() ?? ''
    const tokenBalance = userTokens[balanceSymbol]?.balance ?? 0

    const dispatch = useDispatch()
    const [inputData, setInputData] = useState(DEFAULT_LOANS_INPUT_VALUE)

    const onChangeHandler = (inputAmount: string, userBalance: number) => {
        const validationStatus = loansInputValidation({
            inputAmount,
            maxAmount: userBalance,
            options: {
                byDecimalPlaces: decimals || assetDecimalsToShow,
            },
        })

        setInputData({
            ...inputData,
            amount: inputAmount,
            validationStatus: validationStatus,
        })
    }

    const inputOnBlurHandle = () => {
        setInputData({
            ...inputData,
            amount: getOnBlurValue(inputData.amount),
        })
    }

    const onFocusHandler = () => {
        setInputData({
            ...inputData,
            amount: getOnFocusValue(inputData.amount),
        })
    }

    useEffect(() => {
        if (!show) {
            setInputData(DEFAULT_LOANS_INPUT_VALUE)
        }
    }, [show])
    const isDepositDisabled = useMemo(() => {
        return inputData.validationStatus !== INPUT_STATUS_SUCCESS
    }, [inputData.validationStatus])

    const depositHandler = () => {
        if (tokenType && address) {
            dispatch(
                depositLendingAssetAction(gqlName, Number(inputData.amount), address, id, tokenType, decimals, closePopup),
            )
        }
    }

    return (
        <PopupContainer onClick={closePopup} show={show}>
            <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
                <LoansModalBase>
                    <button onClick={closePopup} className="close-modal"/>

                    <GovRightContainerTitleArea>
                        <h2>Supply Assets to Earn</h2>
                    </GovRightContainerTitleArea>
                    <div className="modalDescr">
                        Earn yield by depositing assets to Mavryk’s lending pools. Loans are secured by 200% collateral.
                        Supplied
                        XTZ is automatically delegated to the Mavryk Finance DAO Bakery.
                    </div>

                    <Input
                        className={`${rate ? 'input-with-rate' : ''} pinned-dropdown`}
                        inputProps={{
                            value: inputData.amount,
                            type: 'number',
                            onChange: (e) => onChangeHandler(e.target.value, tokenBalance),
                            onBlur: inputOnBlurHandle,
                            onFocus: onFocusHandler,
                        }}
                        settings={{
                            balance: tokenBalance,
                            balanceAsset: symbol,
                            useMaxHandler: () => onChangeHandler(getLoansInputMaxAmount(tokenBalance, decimals), tokenBalance),
                            inputStatus: inputData.validationStatus,
                            inputSize: INPUT_LARGE,
                            ...(rate ? {convertedValue: rate * Number(inputData.amount)} : {}),
                        }}
                    >
                        <InputPinnedTokenInfo>
                            <ImageWithPlug imageLink={icon} alt={`${symbol} icon`}/>
                            {symbol}
                        </InputPinnedTokenInfo>
                    </Input>

                    <div className="lending-stats" style={{marginTop: '45px'}}>
                        <ThreeLevelListItem>
                            <div className="name">
                                Earn APY{' '}
                                <CustomTooltip
                                    iconId="info"
                                    defaultStrokeColor={silverColor}
                                    text={`You will receive m${symbol} instead of your ${symbol}`}
                                    className="tooltip"
                                />
                            </div>
                            <CommaNumber value={lendingAPY} className="value" endingText="%"/>
                        </ThreeLevelListItem>
                        <ThreeLevelListItem>
                            <div className="name">m{symbol} Received</div>
                            <CommaNumber value={Number(inputData.amount)} className="value"/>
                        </ThreeLevelListItem>
                        <ThreeLevelListItem>
                            <div className="name">New m{symbol} Balance</div>
                            <CommaNumber value={mBalance + Number(inputData.amount)} className="value"/>
                        </ThreeLevelListItem>
                    </div>

                    <div className="manage-btn">
                        <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={depositHandler}
                                   disabled={isDepositDisabled}>
                            <Icon id="plus"/>
                            Deposit
                        </NewButton>
                    </div>
                </LoansModalBase>
            </PopupContainerWrapper>
        </PopupContainer>
    )
}
