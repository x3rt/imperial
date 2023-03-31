import { useIsSmallDevice } from "@web/hooks/useIsMobile";
import {
  addNotification,
  openModal,
  setForkedContent,
  setLanguage,
  setReadOnly,
} from "@web/state/actions";
import { ImperialState } from "@web/state/reducers";
import { styled } from "@web/stitches.config";
import { Document } from "@web/types";
import { supportedLanguages } from "@web/utils/Constants";
import { encrypt, generateSecureString } from "@web/utils/Crypto";
import { makeRequest } from "@web/utils/Rest";
import { useMonaco } from "@monaco-editor/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import Copy from "react-copy-to-clipboard";
import {
  AlignLeft,
  ArrowRight,
  Check,
  Copy as CopyIcon,
  Edit2,
  FileText,
  Globe,
  Save,
  Settings,
  Users,
  X,
} from "react-feather";
import { connect, ConnectedProps } from "react-redux";
import Button from "./Button";
import Popover from "./popover/Popover";
import UserPopover from "./popover/UserPopover";
import Tooltip from "./Tooltip";
import { UserIcon } from "./UserIcon";

const Wrapper = styled(motion.div, {
  position: "fixed",
  display: "flex",
  top: 0,
  right: 0,
  zIndex: 100,
  background: "$primary",
  color: "$text-primary",
  borderBottomLeftRadius: "$large",
  padding: "0 15px",
  boxShadow: "$nav",
});

const Container = styled("div", {
  display: "flex",
  flexDirection: "column",
});

const HideNavContainer = styled(motion.div, {
  position: "absolute",
  display: "flex",
  alignItems: "center",
  left: 0,
  padding: "0 5px",
  width: 25,
  height: "100%",
  overflow: "hidden",
  borderBottomLeftRadius: "$large",
  opacity: 0,
  cursor: "pointer",
  transition: "all 0.15s ease-in-out",

  "&:hover": {
    background: "$tertiary",
    opacity: 1,
  },
});

const BrandContainer = styled(motion.div, {
  display: "inline-flex",
  justifyContent: "center",
});

const Brand = styled(Link, {
  textAlign: "center",
  marginTop: 20,
  fontSize: "1.1em",
  textDecoration: "unset",
  color: "$text-primary",
  fontWeight: 700,
});

const DocumentID = styled(motion.h1, {
  textAlign: "center",
  marginTop: 20,
  fontSize: "1.1em",
  whiteSpace: "nowrap",
  overflow: "hidden",
  cursor: "pointer",
  color: "$text-muted",
});

const Buttons = styled("div", {
  display: "flex",
  alignItems: "center",
  margin: "0 20px 10px",
  gap: "$medium",
});

const StyledTooltip = styled(Tooltip, {
  margin: "0 10px",
});

const StyledUserIcon = styled(UserIcon, {
  marginLeft: "20px",
});

const NAV_ANIMATION = {
  initial: {
    x: 0,
  },
  collapsed: {
    x: "90%",
  },
};

const BRAND_ANIMATION = {
  initial: {
    opacity: 0,
    width: 0,
    marginLeft: 0,
  },
  hover: {
    opacity: 1,
    width: "unset",
    marginLeft: 10,
  },
};

interface INavProps extends ReduxProps {
  document?: Document;
}
function Nav({ user, document, language, dispatch, editors }: INavProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [userPopover, setUserPopover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const monaco = useMonaco();
  const isSmallDevice = useIsSmallDevice();

  if (router.query.noNav === "true") return null;

  const saveDocument = useCallback(async () => {
    if (!monaco) return;
    if (saving) return;

    const content = monaco.editor.getModels()[0].getValue();
    if (content.length <= 0) return;

    setSaving(true);
    dispatch(setReadOnly(true));

    const password = user?.settings.encrypted ? generateSecureString(12) : undefined;
    const { success, error, data } = await makeRequest<Document & { password?: string }>(
      "POST",
      "/document",
      {
        content: user?.settings.encrypted
          ? encrypt(password as string, content).toString()
          : content,
        settings: {
          long_urls: user ? user.settings.long_urls : false,
          short_urls: user ? user.settings.short_urls : false,
          instant_delete: user ? user.settings.instant_delete : false,
          encrypted: user ? user.settings.encrypted : false,
          image_embed: user ? user.settings.image_embed : false,
          expiration: user ? user.settings.expiration : 14,
          public: false,
          password,
          editors: editors.map((user) => user.username),
          language,
        },
      },
    );
    setSaving(false);

    if (!success || !data) {
      dispatch(setReadOnly(false));

      return dispatch(
        addNotification({
          icon: <X />,
          message: error?.message ?? "An error occurred whilst creating document",
          type: "error",
        }),
      );
    }

    dispatch(
      addNotification({
        icon: <Check />,
        message: "Successfully created document",
        type: "success",
        async onClick() {
          await navigator.clipboard.writeText(`${window.location}/${data.id}`);
        },
      }),
    );

    dispatch(setLanguage(data.settings.language));

    router.push(`/${data.id}${data.settings.encrypted ? `#${password}` : ""}`);
  }, [monaco, language, document, user, saving, editors]);

  const newDocument = () => {
    router.push("/");
  };

  const forkDocument = useCallback(() => {
    if (!document) return;

    const { content } = document;
    dispatch(setForkedContent(content));
    router.push("/");
  }, [document]);

  const prepareEdit = useCallback(() => {
    if (!user) return;
    if (!document) return;
    if (
      !(
        document?.creator?.username === user.username ||
        document.settings.editors.find((editor) => editor.username === user.username)
      )
    )
      return;

    if (editing) {
      editDocument();
      setEditing(false);
    } else {
      setEditing(true);
      dispatch(setReadOnly(false));
    }
  }, [document, user, editing]);

  const editDocument = useCallback(async () => {
    if (!user || !document || !monaco) return;

    const editor = monaco.editor.getModels()[0];
    const content = editor.getValue();

    if (content === document.content) return;

    const { success, error } = await makeRequest("PATCH", "/document", {
      id: document.id,
      content,
    });

    if (!success)
      return dispatch(
        addNotification({
          icon: <X />,
          message: error?.message ?? "There was an error updating this document",
          type: "error",
        }),
      );

    setEditing(false);
    dispatch(setReadOnly(true));
    dispatch(
      addNotification({
        icon: <Check />,
        message: "Successfully edited document.",
        type: "success",
      }),
    );
  }, [monaco, document, user]);

  /* Keybinds */
  useEffect(() => {
    const keypress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();

        if (!document) {
          saveDocument();
        } else {
          prepareEdit();
        }
      }
    };

    window.addEventListener("keydown", keypress);
    return () => {
      window.removeEventListener("keydown", keypress);
    };
  }, [document, saveDocument, prepareEdit]);

  /* Collapse navbar when its mobile */
  useEffect(() => {
    setCollapsed(isSmallDevice);
  }, [isSmallDevice]);

  const SelectedLanguageIcon = useMemo(() => {
    const findLanguage = supportedLanguages.find((l) => l.id === language);

    return findLanguage?.icon ?? Globe;
  }, [language]);

  return (
    <Wrapper
      initial="initial"
      transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
      animate={collapsed ? "collapsed" : "initial"}
      variants={NAV_ANIMATION}
    >
      <HideNavContainer onClick={() => setCollapsed(!collapsed)}>
        <motion.div
          transition={{ duration: 0.3 }}
          animate={collapsed ? { rotate: 180 } : { rotate: 0 }}
        >
          <ArrowRight size={20} />
        </motion.div>
      </HideNavContainer>
      <Container>
        <BrandContainer initial="initial" whileHover="hover">
          <Brand href="/">IMPERIAL</Brand>
          {document ? (
            <Tooltip title="Click to copy URL">
              <Copy
                text={
                  process.env.NODE_ENV === "development"
                    ? `localhost:3000/${document.id}`
                    : `https://imperialb.in/${document.id}`
                }
              >
                <DocumentID transition={{ duration: 0.3 }} variants={BRAND_ANIMATION}>
                  {document.id}
                </DocumentID>
              </Copy>
            </Tooltip>
          ) : null}
        </BrandContainer>
        <Buttons>
          {!document ? (
            <>
              <StyledTooltip title="Change language">
                <Button onClick={() => dispatch(openModal("language_selector"))}>
                  <SelectedLanguageIcon width={20} height={20} />
                </Button>
              </StyledTooltip>

              {user ? (
                <StyledTooltip title="Add editors">
                  <Button onClick={() => dispatch(openModal("editors"))}>
                    <Users size={20} />
                  </Button>
                </StyledTooltip>
              ) : null}

              <StyledTooltip title="Save document">
                <Button onClick={saveDocument}>
                  <Save size={20} />
                </Button>
              </StyledTooltip>
            </>
          ) : (
            <>
              {user &&
              (document?.creator?.id === user.id ||
                document.settings.editors.find((editor) => editor.id === user.id)) ? (
                <StyledTooltip title="Edit document">
                  <Button onClick={prepareEdit}>
                    {editing ? <Check size={20} /> : <Edit2 size={20} />}
                  </Button>
                </StyledTooltip>
              ) : null}

              {user && document?.creator?.id === user.id ? (
                <StyledTooltip title="Edit document settings">
                  <Button
                    onClick={() => dispatch(openModal("document_settings", { document }))}
                  >
                    <Settings size={20} />
                  </Button>
                </StyledTooltip>
              ) : null}
              <StyledTooltip title="View raw">
                <Button onClick={() => router.push(`/r/${document.id}`)}>
                  <AlignLeft size={20} />
                </Button>
              </StyledTooltip>
              <StyledTooltip title="Duplicate document">
                <Button onClick={forkDocument}>
                  <CopyIcon size={20} />
                </Button>
              </StyledTooltip>
            </>
          )}
          <StyledTooltip title="New document">
            <Button onClick={newDocument}>
              <FileText size={20} />
            </Button>
          </StyledTooltip>
          <Popover
            active={userPopover}
            render={(defaults) => <UserPopover {...defaults} />}
            placement="bottom-end"
            setPopover={setUserPopover}
          >
            <StyledUserIcon pointer URL={user?.icon ?? "/img/pfp.png"} />
          </Popover>
        </Buttons>
      </Container>
    </Wrapper>
  );
}

const mapStateToProps = ({
  user,
  editor: { language },
  ui_state: { editors },
}: ImperialState) => ({ user, language, editors });

const connector = connect(mapStateToProps);
type ReduxProps = ConnectedProps<typeof connector>;

export default connector(Nav);
