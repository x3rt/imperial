import { addNotification, setLanguage } from "@/state/actions";
import { styled } from "@/stitches.config";
import { Document } from "@/types";
import { supportedLanguages } from "@/utils/Constants";
import { makeRequest } from "@/utils/Rest";
import { useState } from "react";
import { Check, X } from "react-feather";
import Button from "@/components/Button";
import Setting from "@/components/Setting";
import Header from "./base/Header";
import { ModalProps } from "./base/modals";
import { Content, Paragraph, Wrapper } from "./base/Styles";
import { useRouter } from "next/router";

const StyledWrapper = styled(Wrapper, {
  maxWidth: "80%",
  maxHeight: "70%",
});

const DangerArea = styled("h1", {
  marginTop: 30,
  color: "$error",
  fontSize: "1.3em",
  fontWeight: 500,
  marginBottom: 0,
});

interface IDocumentSettings extends ModalProps {
  data: { document: Document };
}

export const DocumentSettings = ({
  data: { document },
  dispatch,
  closeModal,
}: IDocumentSettings): JSX.Element => {
  const router = useRouter();

  const patchDocument = async <T extends keyof Document["settings"]>(
    setting: T,
    value: Document["settings"][T]
  ) => {
    const { success, error, data } = await makeRequest<{ document: Document }>(
      "PATCH",
      "/document",
      {
        id: document.id,
        settings: {
          [setting]: value,
        },
      }
    );

    if (!success || !data)
      return dispatch(
        addNotification({
          icon: <X />,
          message: error?.message ?? "An unknown error occurred",
          type: "error",
        })
      );

    dispatch(
      addNotification({
        icon: <Check />,
        message: "Successfully updated user settings",
        type: "success",
      })
    );

    document = data.document;
  };

  return (
    <StyledWrapper>
      <Header>Document Settings</Header>
      <Paragraph>
        Change document settings for document <b>{document.id}</b>
      </Paragraph>
      <Content>
        <Setting
          title="Language"
          description="Change the language of the document."
          type="dropdown"
          items={supportedLanguages.map((language) => ({
            value: language.id,
            title: language.name,
            icon: language.icon ? <language.icon /> : undefined,
            selected: document.settings.language === language.id,
          }))}
          onSelect={async (item) => {
            await patchDocument("language", item.value);

            dispatch(setLanguage(item.value));
          }}
        />
        {/*         <Setting
          title="Expiration"
          description="Change the date when the document expires."
          type="dropdown"
          mode="expiration"
          initialValue={
            new Date(document.timestamps.expiration * 1000).getDate() -
            new Date().getDate()
          }
          items={[
            {
              title: "Never",
              value: null,
              selected: user.settings.expiration === null,
            },
            {
              title: "1 day",
              value: 1,
              selected: user.settings.expiration === 1,
            },
            {
              title: "7 days",
              value: 2,
              selected: user.settings.expiration === 7,
            },
            {
              title: "1 month",
              value: 30,
              selected: user.settings.expiration === 30,
            },
            {
              title: "2 months",
              value: 60,
              selected: user.settings.expiration === 60,
            },
            {
              title: "3 months",
              value: 90,
              selected: user.settings.expiration === 90,
            },
            {
              title: "6 months",
              value: 180,
              selected: user.settings.expiration === 180,
            },
            {
              title: "1 year",
              value: 365,
              selected: user.settings.expiration === 365,
            },
          ]}
          onToggle={async (e) => {
            await patchDocument("expiration", Number(e?.target.value));
          }}
        /> */}
        <Setting
          title="Encrypted"
          description="You can not edit the encryption after the document has been made."
          toggled={document.settings.encrypted}
          onToggle={() => null}
          type="switch"
          disabled
        />
        <Setting
          title="Image embed"
          description="Toggle image embed on the document. This will generate an image of the document and will support rich embeds."
          toggled={document.settings.image_embed}
          type="switch"
          onToggle={async () => {
            await patchDocument("image_embed", !document.settings.image_embed);
          }}
        />
        <Setting
          title="Instant delete"
          description="Toggle instant delete on the document. After someone viewing the document, it will instantly delete."
          toggled={document.settings.instant_delete}
          type="switch"
          onToggle={async () => {
            await patchDocument(
              "instant_delete",
              !document.settings.instant_delete
            );
          }}
        />
        <Setting
          title="Toggle public"
          type="switch"
          description="Toggle public status on the document. After enabled, the document will be public on our discovery page."
          toggled={document.settings.public}
          onToggle={async () => {
            await patchDocument("public", !document.settings.public);
          }}
        />

        <DangerArea>Danger Zone</DangerArea>
        <Paragraph>
          Initiating any &quot;Danger Zone&quot; action will be permanent!
        </Paragraph>
        <Button
          style={{ marginTop: 10, alignSelf: "flex-start" }}
          disabled={document.settings.instant_delete}
          onClick={async () => {
            const { success, error } = await makeRequest(
              "DELETE",
              `/document/${document.id}`
            );

            if (!success) {
              return dispatch(
                addNotification({
                  icon: <X />,
                  message:
                    error?.message ??
                    "An error occurred whilst deleting document",
                  type: "error",
                })
              );
            }

            closeModal();
            router.push("/");
          }}
        >
          Delete document
        </Button>
      </Content>
    </StyledWrapper>
  );
};
