import { connect, ConnectedProps } from "react-redux";
import styled from "styled-components";
import { addNotification, openModal } from "../../../state/actions";
import { ImperialState } from "../../../state/reducers";
import { ROLES, TestPermission } from "../../utils/Permissions";
import { C } from "../Icons";
import { PopoverBase } from "./popovers";

const Wrapper = styled.div`
  background: ${({ theme }) => theme.background.lightestOfTheBunch};
  padding: 15px 25px;
  border-radius: 10px;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
`;

const Item = styled.li<{ danger?: boolean }>`
  text-align: center;
  margin: 2.5px 10px;
  color: ${({ theme }) => theme.text.dark}5d;
  cursor: pointer;

  transition: color 0.15s ease-in-out;

  &:hover {
    color: ${({ theme, danger }) =>
      danger ? theme.system.error : theme.text.light};
  }
`;

const Separator = styled.span`
  display: block;
  margin: 8px auto;
  width: 80%;
  height: 1.5px;
  background: ${({ theme }) => theme.text.darkest};
`;

const UserPopover = ({ close, user, dispatch }: PopoverBase & ReduxProps) => {
  return (
    <Wrapper>
      <List>
        {user ? (
          <>
            <Item
              onClick={() => {
                dispatch(openModal("user_settings"));
                close();
              }}
            >
              User profile
            </Item>
            <Item>Discord</Item>
            <Item>GitHub</Item>
            <Separator />
            {TestPermission(user.flags, ROLES.ADMIN) ? (
              <Item>Admin</Item>
            ) : null}
            <Item>Terms</Item>
            <Item danger>Logout</Item>
          </>
        ) : (
          <>
            <Item
              onClick={() => {
                dispatch(openModal("login"));
                close();
              }}
            >
              Login
            </Item>
            <Item
              onClick={() => {
                dispatch(
                  addNotification({
                    icon: <C />,
                    message: "Fuck",
                    type: "error",
                  }),
                );
              }}
            >
              Signup
            </Item>
            <Separator />
            <Item>Discord</Item>
            <Item>GitHub</Item>
          </>
        )}
      </List>
    </Wrapper>
  );
};

const mapStateToProps = ({ user }: ImperialState) => {
  return { user };
};

const connector = connect(mapStateToProps);
type ReduxProps = ConnectedProps<typeof connector>;

export default connector(UserPopover);
