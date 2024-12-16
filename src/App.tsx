import { SignedIn } from "@clerk/clerk-react";
import { Redirect, Route, Switch, useRoute } from "wouter";
import Cart from "./components/Cart";
import MyWorksheets from "./components/MyWorksheets";
import Navbar from "./components/Navbar";
import Options from "./components/Options";
import { useUser } from "@clerk/clerk-react";
import posthog from "posthog-js";
import Writing from "./components/writing/Writing";
import Feedback from "./components/writing/Feedback";

function App() {
  const { isSignedIn, user, isLoaded } = useUser();

  // We do this so that we can temporarily host marked pages on this domain
  const [isMarkedRoute] = useRoute("/marked/*");

  if (isLoaded && isSignedIn) {
    posthog.identify(user.id, {
      email: user.emailAddresses[0].emailAddress,
      name: user.fullName,
    });
  }

  return (
    <div>
      {!isMarkedRoute && <Navbar />}
      <Switch>
        <Route path="/">
          <Redirect to="/practice" />
        </Route>

        <Route path="/marked/:id">
          {(params) => <Feedback id={params.id} />}
        </Route>

        <SignedIn>
          <Route path="/practice" nest>
            <Route path="/">
              <Options />
            </Route>
            <Route path="/worksheets">
              <MyWorksheets />
            </Route>
            <Route path="/cart">
              <Cart />
            </Route>
          </Route>
          <Route path="/writing" nest>
            <Route path="/">
              <Writing />
            </Route>
          </Route>
        </SignedIn>
        <Route>404, Not Found!</Route>
      </Switch>
    </div>
  );
}

export default App;
