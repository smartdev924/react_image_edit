import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";
import EditorPage from "./Editor";
import Home from "./Home";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <EditorPage />
                <Outlet />
              </div>
            }
          >
            <Route index element={<Home />} />
            <Route path=":id" element={<div />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </>
  );
};

export default App;
