import React, { useEffect, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { useImmerReducer } from "use-immer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Axios from "axios";
import { CSSTransition } from "react-transition-group";
Axios.defaults.baseURL = process.env.BACKENDURL || "https://backendppfapp.herokuapp.com";

// Components
import Header from "./components/Header";
import HomeGuest from "./components/HomeGuest";
import Home from "./components/Home";
import Footer from "./components/Footer";
import About from "./components/About";
import Terms from "./components/Terms";

const CreatePost = React.lazy(() => import("./components/CreatePost"));
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"));
const Search = React.lazy(() => import("./components/Search"));
const Chat = React.lazy(() => import("./components/Chat"));

import FlashMessages from "./components/FlashMessages";
import Profile from "./components/Profile";
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";

import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";
import LoadingDotsIcon from "./components/LoadingDotsIcon";

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("ppfappToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("ppfappToken"),
      username: localStorage.getItem("ppfappUsername"),
      avator: localStorage.getItem("ppfappAvatar"),
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0,
  };

  function addFlashMessages(msg) {
    setFlashMessages((prev) => prev.concat(msg));
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true;
        draft.user = action.data;
        return;
      case "logout":
        draft.loggedIn = false;
        return;
      case "flashMessage":
        draft.flashMessages.push(action.value);
        return;
      case "openSearch":
        draft.isSearchOpen = true;
        return;
      case "closeSearch":
        draft.isSearchOpen = false;
        return;
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen;
        return;
      case "closeChat":
        draft.isChatOpen = false;
        return;
      case "incrementUnreadChatCount":
        draft.unreadChatCount++;
        return;
      case "clearUnreadChatCount":
        draft.unreadChatCount = 0;
        return;
    }
  }

  // const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("ppfappToken")));
  // const [flashMessages, setFlashMessages] = useState([]);
  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("ppfappToken", state.user.token);
      localStorage.setItem("ppfappUsername", state.user.username);
      localStorage.setItem("ppfappAvatar", state.user.avatar);
    } else {
      localStorage.removeItem("ppfappToken");
      localStorage.removeItem("ppfappUsername");
      localStorage.removeItem("ppfappAvatar");
    }
  }, [state.loggedIn]);

  // check if token expired or not.
  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source();

      async function fetchResults() {
        try {
          const response = await Axios.post(`/checkToken`, { token: state.user.token }, { cancelToken: ourRequest.token });
          if (!response.data) {
            dispatch({ type: "logout" });
            dispatch({ type: "flashMessage", value: "Your session is expired, please logged in again." });
          }
        } catch (e) {
          console.log("There was a problem or the request was cancelled.");
        }
      }

      fetchResults();

      return () => ourRequest.cancel;
    }
  }, [state.loggedIn]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Routes>
              <Route path="/profile/:username/*" element={<Profile />}></Route>
              <Route path="/" element={state.loggedIn ? <Home /> : <HomeGuest />}></Route>
              <Route path="/post/:id" element={<ViewSinglePost />}></Route>
              <Route path="/post/:id/edit" element={<EditPost />}></Route>
              <Route path="/create-post" element={<CreatePost />}></Route>
              <Route path="/about-us" element={<About />}></Route>
              <Route path="/terms" element={<Terms />}></Route>
              <Route path="*" element={<NotFound />}></Route>
            </Routes>
          </Suspense>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.querySelector("#app"));
root.render(<Main />);

if (module.hot) {
  module.hot.accept();
}
