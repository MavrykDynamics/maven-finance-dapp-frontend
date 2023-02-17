import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

// types
import { State } from 'reducers'
import { UserType } from '../../../utils/TypesAndInterfaces/User'

// view
import UserDetailsView from './UsersDetails.view'

// helpers
import { sortByCategory } from 'utils/sortByCategory'
import { usersData } from '../users.const'
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'

const UserDetails = () => {
  const dispatch = useDispatch()
  const { feedCategories, feedsLedger } = useSelector((state: State) => state.dataFeeds)
  let { userId } = useParams<{ userId: string }>()

  let [selectedUser, setSelectedUser] = useState<null | UserType>(null)
  const feedsForUser = useCallback(
    //@ts-ignore
    () => feedsLedger.filter(({ address }) => !selectedUser?.feedsLedger.contains(address)),
    [selectedUser, feedsLedger],
  )
  const [sortedFeeds, setSortedFeeds] = useState<Feed[]>(feedsForUser)

  const handleSelect = (selectedOption: string) => {
    if (selectedOption !== '') {
      setSortedFeeds((data: Feed[]) => {
        return sortByCategory(data, selectedOption)
      })
    }
  }

  useEffect(() => {
    if (userId) setSelectedUser(usersData.find((user) => user.id === userId) || null)
  }, [dispatch, userId])

  return (
    <UserDetailsView user={selectedUser} feeds={sortedFeeds} handleSelect={handleSelect} categories={feedCategories} />
  )
}

export default UserDetails
