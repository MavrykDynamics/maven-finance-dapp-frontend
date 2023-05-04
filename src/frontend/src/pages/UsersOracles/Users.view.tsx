import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { Link } from 'react-router-dom'
import { Page } from 'styles'
import { UserCardWrapper, UsersListWrapper, UsersStyled } from './Users.styles'
import { UserType } from '../../utils/TypesAndInterfaces/User'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

const UsersView = ({ users }: { users: UserType[] }) => {
  return (
    <Page>
      <PageHeader page={'oracles-users'} />

      <UsersStyled>
        <H2Title>Users</H2Title>

        <UsersListWrapper>
          {users.map((user) => (
            <Link to={`/satellites/user-details/${user.id}`}>
              <UserCardWrapper key={user.id}>
                <div className="top-wrapper">
                  <div className="img-wrapper">logo</div>
                  <h3>{user.name}</h3>
                </div>
                <h4 className="descr">{user.descr}</h4>
                <Link to={`/satellites/user-details/${user.id}`}>
                  <h3 className="link">View {user.name} feeds</h3>
                </Link>
              </UserCardWrapper>
            </Link>
          ))}
        </UsersListWrapper>
      </UsersStyled>
    </Page>
  )
}

export default UsersView
