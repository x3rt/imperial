import { NavProps } from "../types";
import Link from "next/link";
import styled from "styled-components";
import { UserIcon, Tooltip } from "../components";
import { request } from "../utils/requestWrapper";
import Router from "next/router";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { editingState, languageState } from "../state/editor";

const Container = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 0;
  right: 0;
  z-index: 9999;
  background: tomato;
  border-bottom-left-radius: 15px;
`;

const Brand = styled.h1`
  text-align: center;
  margin-top: 15px;
  font-size: 1em;
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  margin: 5px 20px 10px;
`;

const Btn = styled.button`
  margin: 0 10px;
  padding: 6px 10px;
  border-radius: 5px;
  border: none;
`;

export const Nav = ({
  user,
  creatingDocument = false,
  editor = false,
}: NavProps): JSX.Element => {
  const [language, setLanguage] = useAtom(languageState);
  const [editing, setEditing] = useAtom(editingState);

  const createDocument = async () => {
    if (typeof window === "undefined") return;
    if (!window.monaco) return;

    const content = window.monaco.editor.getModels()[0].getValue();
    const language =
      window.monaco.editor.getModels()[0]._languageIdentifier.language;

    if (content < 1) return;

    const { data, error } = await request("/document", "POST", {
      content,
      settings: {
        language,
      },
    });

    if (error) console.log(error);

    Router.push(`/${data.data.id}`);
    creatingDocument = false;
  };
  const newDocument = () => Router.push("/");
  const changeLanguage = (language: string) => setLanguage(language);
  const allowEdit = () => setEditing(!editing);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setEditing(creatingDocument ? true : false);
    window.addEventListener("keydown", (e) => {
      if (
        (e.key === "s" && e.metaKey && creatingDocument) ||
        (e.key === "s" && e.ctrlKey && creatingDocument)
      ) {
        e.preventDefault();
        createDocument();
      }

      if (e.key === "n" && e.altKey) {
        e.preventDefault();
        newDocument();
      }
    });
  }, []);

  return (
    <Container>
      <Link href="/">
        <Brand>IMPERIAL</Brand>
      </Link>
      <Buttons>
        {editor && (
          <Tooltip title="Edit Document">
            <Btn onClick={allowEdit}>e</Btn>
          </Tooltip>
        )}
        {creatingDocument ? (
          <>
            <Tooltip title="Change language">
              <Btn onClick={() => changeLanguage("javascript")}>l</Btn>
            </Tooltip>
            <Tooltip title="Change editors">
              <Btn>e</Btn>
            </Tooltip>
            <Tooltip title="Save document">
              <Btn onClick={createDocument}>s</Btn>
            </Tooltip>
          </>
        ) : (
          <>
            <Tooltip title="View Raw">
              <Btn onClick={createDocument}>r</Btn>
            </Tooltip>
            <Tooltip title="Duplicate document">
              <Btn onClick={createDocument}>d</Btn>
            </Tooltip>
          </>
        )}
        <Tooltip title="New document">
          <Btn onClick={newDocument}>n</Btn>
        </Tooltip>
        <Tooltip arrow={true} position="bottom-start" title="test">
          <UserIcon
            width={45}
            height={45}
            style={{ marginLeft: 10 }}
            URL={user ? user.icon : "/img/pfp.png"}
          />
        </Tooltip>
      </Buttons>
    </Container>
  );
};
