import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'
import { Input } from 'app/App.components/Input/NewInput'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { useState } from 'react'
import { LoansModalBase, VaultModalOverview } from './Modals.style'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17804%3A239633&t=Sx2aEpp3ifrGxBtQ-0
export const AddNewCollateral = ({ closePopup }: { closePopup: () => void }) => {
  const [inputAmount, setInputAmount] = useState('0')
  return (
    <LoansModalBase>
      <button onClick={closePopup} className="close-modal" />

      <GovRightContainerTitleArea>
        <h2>Add More Assets As Collateral</h2>
      </GovRightContainerTitleArea>
      <div className="modalDescr">Select an assets to add as collateral to an existing vault.</div>

      <Input
        className="withdrawCollateralInput"
        inputProps={{
          value: inputAmount,
          type: 'number',
          onChange: (e) => setInputAmount(e.target.value),
        }}
        settings={{
          inputStatus: '',
        }}
      />

      <VaultModalOverview>
        <ThreeLevelListItem className="collateral-diagram">
          <TzAddress tzAddress="tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD" type={BLUE} />
          <GradientDiagram
            className="loansModals"
            colorBreakpoints={[
              {
                persentage: 0,
                color: {
                  r: 255,
                  g: 67,
                  b: 67,
                },
              },
              {
                persentage: 33,
                color: {
                  r: 255,
                  g: 129,
                  b: 67,
                },
              },
              {
                persentage: 66,
                color: {
                  r: 251,
                  g: 255,
                  b: 67,
                },
              },
              {
                persentage: 100,
                color: {
                  r: 52,
                  g: 246,
                  b: 106,
                },
              },
            ]}
            currentPersentage={Math.max(Math.min(Number(inputAmount), 100), 1)}
          />
          <div className="info-tip">
            Collateral Utilization:
            <span>
              <CommaNumber value={0} endingText="%" />
            </span>
          </div>
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">Collateral Value</div>
          <CommaNumber value={0} className="value" />
          {false ? <CommaNumber value={0} beginningText="$" className="rate" /> : null}
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">Available To Withdraw</div>
          <CommaNumber value={0} className="value" />
        </ThreeLevelListItem>
      </VaultModalOverview>
    </LoansModalBase>
  )
}
