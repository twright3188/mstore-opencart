/**
 * Created by InspireUI on 19/02/2017.
 *
 * @format
 */

import React from "react";
import PropTypes from "prop-types";
import { View, StatusBar, NetInfo, I18nManager } from "react-native";
import { WooWorker } from "api-ecommerce";
import { ThemeProvider } from "@callstack/react-theme-provider";

import { log } from "@app/Omni";
import { Config, AppConfig, Device, Styles, Theme } from "@common";
import { MyToast, MyNetInfo } from "@containers";
import { AppIntro, ModalReview } from "@components";
import Navigation from "@navigation";
import { connect } from "react-redux";

import MenuSide from "@components/LeftMenu/MenuOverlay";
// import MenuSide from "@components/LeftMenu/MenuScale";
// import MenuSide from '@components/LeftMenu/MenuSmall';
// import MenuSide from '@components/LeftMenu/MenuWide';

import { toast, closeDrawer } from "./Omni";

class Router extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
    };
  }


  static propTypes = {
    introStatus: PropTypes.bool,
  };

  componentWillMount() {
    // init wooworker
    // WooWorker.init({
    //   url: AppConfig.Opencart.url,
    //   consumerKey: AppConfig.Opencart.consumerKey,
    //   consumerSecret: AppConfig.Opencart.consumerSecret,
    //   wp_api: true,
    //   version: "wc/v2",
    //   queryStringAuth: true,
    //   language: this.props.language.lang,
    // });

    NetInfo.getConnectionInfo().then((connectionInfo) => {
      this.props.updateConnectionStatus(connectionInfo.type != "none");
      this.setState({ loading: false });
    });
  }

  goToScreen = (routeName, params) => {
    if (!this.navigator) {
      return toast("Cannot navigate");
    }
    this.navigator.dispatch({ type: "Navigation/NAVIGATE", routeName, params });
    closeDrawer();
  };

  render() {
    const { isDarkTheme } = this.props;

    if (!this.props.introStatus) {
      return <AppIntro />;
    }

    if (this.state.loading) {
      return <View />;
    }

    // get theme based on dark or light mode
    const theme = isDarkTheme ? Theme.dark : Theme.light;
    log(theme);

    return (
      <ThemeProvider theme={theme}>
        <MenuSide
          goToScreen={this.goToScreen}
          routes={
            <View
              style={[
                Styles.app,
                { backgroundColor: theme.colors.background },
              ]}>
              <StatusBar
                barStyle={isDarkTheme ? "light-content" : "dark-content"}
                animated
                hidden={Device.isIphoneX ? false : !Config.showStatusBar}
              />
              <MyToast />
              <Navigation ref={(comp) => (this.navigator = comp)} />
              <ModalReview />
              <MyNetInfo />
            </View>
          }
        />
      </ThemeProvider>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  const { actions } = require("@redux/NetInfoRedux");

  return {
    updateConnectionStatus: (isConnected) =>
      dispatch(actions.updateConnectionStatus(isConnected)),
  };
};

const mapStateToProps = (state) => ({
  introStatus: state.user.finishIntro,
  userInfo: state.user.user,
  language: state.language,
  netInfo: state.netInfo,
  isDarkTheme: state.app.isDarkTheme,
  rtl: state.language.rtl
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Router);
