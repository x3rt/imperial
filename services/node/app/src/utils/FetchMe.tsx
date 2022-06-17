import { X } from "react-feather";
import { store } from "../../state";
import { addNotification, setUser } from "../../state/actions";
import { request } from "./Request";

export const fetchMe = async () => {
  const { success, data } = await request("/users/@me");
  if (!success) {
    // remove their cookie
    return store.dispatch(
      addNotification({
        icon: <X />,
        message: "There was an error retrieving your user",
        type: "error",
      }),
    );
  }

  store.dispatch(setUser(data));
};
