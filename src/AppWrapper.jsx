import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { MemoryRouter, useInRouterContext } from "react-router-dom";
import { store } from "./store/store.js";
import App from "./App.jsx";

const MaybeRouter = ({ children }) =>
  useInRouterContext() ? children : <MemoryRouter>{children}</MemoryRouter>;

MaybeRouter.propTypes = {
  children: PropTypes.node,
};

const AppWrapper = (props) => (
  <Provider store={store}>
    <MaybeRouter>
      <App {...props} />
    </MaybeRouter>
  </Provider>
);

export default AppWrapper;
