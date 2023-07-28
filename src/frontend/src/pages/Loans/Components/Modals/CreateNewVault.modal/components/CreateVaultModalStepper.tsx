import React from 'react'
import { VaultModalStepper } from '../createNewVault.style'
import classNames from 'classnames'

type CreateVaultModalStepperProps = {
  items: string[]
  activeIndex: number
}

export const CreateVaultModalStepper = ({ items, activeIndex }: CreateVaultModalStepperProps) => {
  const renderItems = () => {
    return items.map((item, idx) => (
      <div key={item}>
        <span
          className={classNames({
            active: idx === activeIndex,
          })}
        >
          {item}
        </span>
        {idx !== items.length - 1 ? <>&nbsp;{`>`}&nbsp;</> : ''}
      </div>
    ))
  }

  return <VaultModalStepper>{renderItems()}</VaultModalStepper>
}
