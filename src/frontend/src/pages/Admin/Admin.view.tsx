import * as React from 'react'
import { AdminStyled } from './Admin.style'
import { Button } from '../../app/App.components/Button/Button.controller'

type AdminViewProps = {
  handleChangeGovernancePeriod: (period: string) => void
  handleCreateFarm: () => void
  handleChangeAllAdminsFromGov: () => void
  handleAddAllLoanTokensToLendBorrow: () => void
  handleAddAllCollateralTokensToLendBorrow: () => void
  handleCreateAllTreasuries: () => void
  handleErrorCodesTest: () => void
}

export const AdminView = ({
  handleChangeGovernancePeriod,
  handleCreateFarm,
  handleChangeAllAdminsFromGov,
  handleAddAllLoanTokensToLendBorrow,
  handleAddAllCollateralTokensToLendBorrow,
  handleCreateAllTreasuries,
  handleErrorCodesTest,
}: AdminViewProps) => {
  return (
    <AdminStyled>
      <Button
        text={'Change to Proposal Period'}
        kind="actionPrimary"
        onClick={() => handleChangeGovernancePeriod('PROPOSAL')}
      />
      <Button
        text={'Change to Voting Period'}
        kind="actionPrimary"
        onClick={() => handleChangeGovernancePeriod('VOTING')}
      />
      <Button
        text={'Change to Time-lock Period'}
        kind="actionPrimary"
        onClick={() => handleChangeGovernancePeriod('TIME_LOCK')}
      />
      <Button text={'Create Farm'} kind="actionPrimary" onClick={handleCreateFarm} />
      <Button text={'Add All Loan tokens'} kind="actionPrimary" onClick={handleAddAllLoanTokensToLendBorrow} />
      <Button
        text={'Add All Collateral tokens'}
        kind="actionPrimary"
        onClick={handleAddAllCollateralTokensToLendBorrow}
      />
      <Button text={'ChangeAdminsFromGov'} kind="actionPrimary" onClick={handleChangeAllAdminsFromGov} />
      <Button text={'Create All Treasuries'} kind="actionPrimary" onClick={handleCreateAllTreasuries} />
      <Button text={'Error Codes Test'} kind="actionPrimary" onClick={handleErrorCodesTest} />
    </AdminStyled>
  )
}
