import { ContractCardTopSection, ContractCardWrapper } from './ContractCard.style'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { BGAccordion } from '../Accordeon/Accordeon.view'
import { parseDate } from 'utils/time'
import { BreakGlassStatusStorage } from 'utils/TypesAndInterfaces/BreakGlass'
import { STATUS_FLAG_DOWN, STATUS_FLAG_UP } from 'app/App.components/StatusFlag/StatusFlag.constants'

type ContractCardProps = {
  contract: BreakGlassStatusStorage[number]
  isActive?: boolean
  isExpanded: boolean
  onClick?: () => void
  handleExpandAccordeon: (id: string | null) => void
}
export const ContractCard = ({
  contract: { lastUpdated, admin, address, methods, title },
  isActive,
  onClick,
  isExpanded,
  handleExpandAccordeon,
}: ContractCardProps) => {
  const parsedTitle = title.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  const isStatusPaused = Object.keys(methods).some((method) => methods[method])

  return (
    <ContractCardWrapper className={isActive ? 'active' : ''} onClick={onClick}>
      <ContractCardTopSection>
        <div className="top-row">
          <div className="card-title">{parsedTitle}</div>

          <StatusFlag
            text={isStatusPaused ? 'PAUSED' : 'LIVE'}
            status={isStatusPaused ? STATUS_FLAG_DOWN : STATUS_FLAG_UP}
          />
        </div>

        <div className={`card-info-item ${lastUpdated ? '' : 'hidden'}`}>
          Last Update
          <div>{parseDate({ time: lastUpdated, timeFormat: 'MMM DD, YYYY' })}</div>
        </div>

        <div className="card-info-item">
          Contract Address
          <TzAddress tzAddress={address} hasIcon />
        </div>

        <div className="card-info-item">
          Contract Admin
          <TzAddress tzAddress={admin} hasIcon />
        </div>
      </ContractCardTopSection>
      <BGAccordion
        accordionId={parsedTitle}
        isExpanded={isExpanded}
        methods={methods}
        accordionClickHandler={() => handleExpandAccordeon(isExpanded ? null : address)}
      />
    </ContractCardWrapper>
  )
}
