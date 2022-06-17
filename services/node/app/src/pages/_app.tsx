import "react-tippy/dist/tippy.css";
import type { AppProps } from "next/app";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { DarkTheme } from "../utils/Theme";
import { Provider } from "react-redux";
import { store } from "../../state";
import { SkeletonTheme } from "react-loading-skeleton";
import ModalManager from "../components/ModalManager";
import { useEffect } from "react";
import { fetchMe } from "../utils/FetchMe";
import { SWRConfig } from "swr";
import Notifications from "../components/Notifications";

const GlobalStyle = createGlobalStyle`
 *, *:before, *:after {
  font-family: 'Manrope', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
 }
 
  html {
    max-height: 100vh;
  }

 body {
  max-width: 100vw;
  margin: 0;
  padding: 0;
  background: ${({ theme }) => theme.background.dark};
  color: ${({ theme }) => theme.text.light};
  font-weight: 500;
 }

 ::-webkit-scrollbar {
   width: 5px;
   height: 0;
 }
 ::-webkit-scrollbar-thumb {
   background: #888;
   border-radius: 5px;
 }
 ::-webkit-scrollbar-thumb:hover {
   background: #666;
 }
 ::-webkit-scrollbar-thumb:active {
   background: #555;
 }
 ::-webkit-scrollbar-corner {
   background: transparent;
 }
`;

function Imperial({ Component, pageProps }: AppProps) {
  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <ThemeProvider theme={DarkTheme}>
      <SWRConfig
        value={{
          refreshInterval: 120000,
          revalidateOnFocus: false,
        }}
      >
        <Provider store={store}>
          <Notifications />
          <ModalManager />
          <GlobalStyle />
          <SkeletonTheme
            baseColor={DarkTheme.background.lightestOfTheBunch}
            highlightColor={DarkTheme.background.dark}
          >
            <Component {...pageProps} />
          </SkeletonTheme>
        </Provider>
      </SWRConfig>
    </ThemeProvider>
  );
}

export default Imperial;
