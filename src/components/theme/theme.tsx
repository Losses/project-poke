import * as React from 'react';

//TODO: CHANGE HERE!
export interface Theme {
  [key: string]: any
}

const GlobalTheme = React.createContext<Theme>([{}, null]);
const CustomTheme = React.createContext<Theme>([{}, null]);
const ComponentTheme = React.createContext<Theme>([{}, null]);


export interface ThemeProvider {
  theme: Theme
}

const GlobalThemeProvider: React.SFC<ThemeProvider> = (props) => {
  const [globalTheme, setGlobalTheme] = React.useState<Theme>(props.theme);

  return (
    <GlobalTheme.Provider value={[globalTheme, setGlobalTheme]}>
      {props.children}
    </GlobalTheme.Provider>
  );
}

const CustomThemeProvider: React.FC<ThemeProvider> = (props) => {
  const [customTheme, setCustomTheme] = React.useState<Theme>(props.theme);
  return (
    <CustomTheme.Provider value={[customTheme, setCustomTheme]}>
      {props.children}
    </CustomTheme.Provider>
  );
}

const ComponentThemeProvider: React.FC<ThemeProvider> = (props) => {
  const [componentTheme, setComponentTheme] = React.useState<Theme>(props.theme);
  return (
    <ComponentTheme.Provider value={[componentTheme, setComponentTheme]}>
      {props.children}
    </ComponentTheme.Provider>
  );
}


const useTheme = (defaultTheme: Theme) => {
  const themeKeys = Object.keys(defaultTheme);

  if (!themeKeys) return;

  const pickTheme = (x: Theme) => (({ ...themeKeys }) => ({ ...themeKeys }))(x);
  const globalTheme = React.useContext(GlobalTheme)[0];
  const customTheme = React.useContext(CustomTheme)[0];
  const componentTheme = React.useContext(ComponentTheme)[0];

  let answer;

  answer = Object.assign(defaultTheme, pickTheme(globalTheme));
  answer = Object.assign(answer, pickTheme(componentTheme));
  answer = Object.assign(answer, pickTheme(customTheme));

  return answer;
}

export {GlobalTheme, CustomTheme, ComponentTheme, GlobalThemeProvider, CustomThemeProvider, ComponentThemeProvider, useTheme}
